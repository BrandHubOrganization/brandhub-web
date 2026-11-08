export interface Province {
  code: number;
  name: string;
}

export interface District {
  code: number;
  name: string;
  province_code: number;
}

export interface Ward {
  code: number;
  name: string;
  district_code: number;
}

const API_BASE_URL = "https://provinces.open-api.vn/api";

// In-memory caches to avoid redundant network calls
let provincesCache: Province[] | null = null;
let provincesPromise: Promise<Province[]> | null = null;

const districtsCache = new Map<number, District[]>();
const districtsPromises = new Map<number, Promise<District[]>>();

const wardsCache = new Map<number, Ward[]>();
const wardsPromises = new Map<number, Promise<Ward[]>>();

/**
 * Lấy danh sách 63 Tỉnh/Thành phố Việt Nam.
 * Tự động cache in-memory sau lần gọi đầu tiên.
 */
export async function getProvinces(): Promise<Province[]> {
  if (provincesCache) return provincesCache;

  if (!provincesPromise) {
    provincesPromise = fetch(`${API_BASE_URL}/p/`)
      .then((res) => {
        if (!res.ok) throw new Error(`HTTP error ${res.status}`);
        return res.json();
      })
      .then((data: Province[]) => {
        const result = Array.isArray(data)
          ? data.map((item) => ({
              code: item.code,
              name: item.name,
            }))
          : [];
        provincesCache = result;
        return result;
      })
      .catch((err) => {
        console.error("Failed to fetch provinces:", err);
        return [] as Province[];
      });
  }

  return provincesPromise;
}

/**
 * Lấy danh sách Quận/Huyện theo mã Tỉnh/Thành phố.
 * Cache in-memory theo provinceCode.
 */
export async function getDistricts(provinceCode: number): Promise<District[]> {
  if (!provinceCode) return [];
  if (districtsCache.has(provinceCode)) {
    return districtsCache.get(provinceCode)!;
  }

  if (districtsPromises.has(provinceCode)) {
    return districtsPromises.get(provinceCode)!;
  }

  const promise = fetch(`${API_BASE_URL}/p/${provinceCode}?depth=2`)
    .then((res) => {
      if (!res.ok) throw new Error(`HTTP error ${res.status}`);
      return res.json();
    })
    .then((data) => {
      const rawDistricts = Array.isArray(data?.districts) ? data.districts : [];
      const result: District[] = rawDistricts.map((d: District) => ({
        code: d.code,
        name: d.name,
        province_code: d.province_code ?? provinceCode,
      }));
      districtsCache.set(provinceCode, result);
      return result;
    })
    .catch((err) => {
      console.error(
        `Failed to fetch districts for province ${provinceCode}:`,
        err,
      );
      return [] as District[];
    });

  districtsPromises.set(provinceCode, promise);
  return promise;
}

/**
 * Lấy danh sách Phường/Xã theo mã Quận/Huyện.
 * Cache in-memory theo districtCode.
 */
export async function getWards(districtCode: number): Promise<Ward[]> {
  if (!districtCode) return [];
  if (wardsCache.has(districtCode)) {
    return wardsCache.get(districtCode)!;
  }

  if (wardsPromises.has(districtCode)) {
    return wardsPromises.get(districtCode)!;
  }

  const promise = fetch(`${API_BASE_URL}/d/${districtCode}?depth=2`)
    .then((res) => {
      if (!res.ok) throw new Error(`HTTP error ${res.status}`);
      return res.json();
    })
    .then((data) => {
      const rawWards = Array.isArray(data?.wards) ? data.wards : [];
      const result: Ward[] = rawWards.map((w: Ward) => ({
        code: w.code,
        name: w.name,
        district_code: w.district_code ?? districtCode,
      }));
      wardsCache.set(districtCode, result);
      return result;
    })
    .catch((err) => {
      console.error(`Failed to fetch wards for district ${districtCode}:`, err);
      return [] as Ward[];
    });

  wardsPromises.set(districtCode, promise);
  return promise;
}

/**
 * Chuẩn hóa tên đơn vị hành chính để so khớp linh hoạt:
 * Bỏ tiền tố như "Thành phố", "Tỉnh", "TP.", "TP " và khoảng trắng thừa.
 */
function normalizeName(name: string): string {
  return name
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "") // Remove accents for fallback comparison
    .replace(
      /^(thanh pho|tinh|tp\.|tp|quan|huyen|thi xa|phuong|xa|thi tran)\s+/gi,
      "",
    )
    .trim();
}

/**
 * Tìm kiếm Province từ chuỗi text tên tỉnh (VD: "Hà Nội", "TP. Hồ Chí Minh", "Thành phố Hồ Chí Minh").
 */
export async function findProvinceByName(
  name: string,
): Promise<Province | undefined> {
  if (!name || !name.trim()) return undefined;

  const provinces = await getProvinces();
  const trimmed = name.trim().toLowerCase();

  // 1. So khớp chính xác theo tên nguyên bản
  const exact = provinces.find((p) => p.name.toLowerCase() === trimmed);
  if (exact) return exact;

  // 2. So khớp sau khi bỏ tiền tố chuẩn (có dấu)
  const stripPrefix = (str: string) =>
    str
      .toLowerCase()
      .replace(/^(thành phố|tỉnh|tp\.|tp)\s+/i, "")
      .trim();

  const targetStripped = stripPrefix(trimmed);
  const strippedMatch = provinces.find(
    (p) => stripPrefix(p.name) === targetStripped,
  );
  if (strippedMatch) return strippedMatch;

  // 3. So khớp không dấu
  const targetNorm = normalizeName(trimmed);
  const normalizedMatch = provinces.find(
    (p) => normalizeName(p.name) === targetNorm,
  );
  if (normalizedMatch) return normalizedMatch;

  // 4. So khớp chuỗi con (substring)
  return provinces.find((p) => {
    const pNorm = normalizeName(p.name);
    return pNorm.includes(targetNorm) || targetNorm.includes(pNorm);
  });
}

/**
 * Tìm District trong mảng quận/huyện theo tên (linh hoạt prefix: Quận/Huyện/Thị xã).
 */
export function findDistrictByName(
  districts: District[],
  name: string,
): District | undefined {
  if (!name || !districts.length) return undefined;
  const trimmed = name.trim().toLowerCase();

  const exact = districts.find((d) => d.name.toLowerCase() === trimmed);
  if (exact) return exact;

  const stripPrefix = (str: string) =>
    str
      .toLowerCase()
      .replace(/^(quận|huyện|thị xã|thành phố|tp\.|tp)\s+/i, "")
      .trim();

  const targetStripped = stripPrefix(trimmed);
  const strippedMatch = districts.find(
    (d) => stripPrefix(d.name) === targetStripped,
  );
  if (strippedMatch) return strippedMatch;

  const targetNorm = normalizeName(trimmed);
  return districts.find((d) => {
    const dNorm = normalizeName(d.name);
    return (
      dNorm === targetNorm ||
      dNorm.includes(targetNorm) ||
      targetNorm.includes(dNorm)
    );
  });
}

/**
 * Tìm Ward trong mảng phường/xã theo tên (linh hoạt prefix: Phường/Xã/Thị trấn).
 */
export function findWardByName(wards: Ward[], name: string): Ward | undefined {
  if (!name || !wards.length) return undefined;
  const trimmed = name.trim().toLowerCase();

  const exact = wards.find((w) => w.name.toLowerCase() === trimmed);
  if (exact) return exact;

  const stripPrefix = (str: string) =>
    str
      .toLowerCase()
      .replace(/^(phường|xã|thị trấn)\s+/i, "")
      .trim();

  const targetStripped = stripPrefix(trimmed);
  const strippedMatch = wards.find(
    (w) => stripPrefix(w.name) === targetStripped,
  );
  if (strippedMatch) return strippedMatch;

  const targetNorm = normalizeName(trimmed);
  return wards.find((w) => {
    const wNorm = normalizeName(w.name);
    return (
      wNorm === targetNorm ||
      wNorm.includes(targetNorm) ||
      targetNorm.includes(wNorm)
    );
  });
}

/**
 * Thành phần của một địa chỉ Việt Nam tiêu chuẩn.
 */
export interface AddressComponents {
  street?: string;
  ward?: string;
  district?: string;
  province?: string;
}

/**
 * Format chuỗi địa chỉ theo định dạng chuẩn:
 * [Số nhà/đường], [Phường/Xã], [Quận/Huyện], [Tỉnh/Thành]
 */
export function formatAddress(components: AddressComponents): string {
  const parts = [
    components.street?.trim(),
    components.ward?.trim(),
    components.district?.trim(),
    components.province?.trim(),
  ].filter(Boolean);
  return parts.join(", ");
}

/**
 * Phân tích (parse) chuỗi địa chỉ có định dạng:
 * [Số nhà/đường], [Phường/Xã], [Quận/Huyện], [Tỉnh/Thành]
 */
export function parseAddress(addressString: string): AddressComponents {
  if (!addressString || !addressString.trim()) {
    return { street: "", ward: "", district: "", province: "" };
  }
  const parts = addressString
    .split(",")
    .map((p) => p.trim())
    .filter(Boolean);

  if (parts.length === 0) {
    return { street: "", ward: "", district: "", province: "" };
  }
  if (parts.length === 1) {
    return { street: parts[0], ward: "", district: "", province: "" };
  }
  if (parts.length === 2) {
    return { street: parts[0], ward: "", district: "", province: parts[1] };
  }
  if (parts.length === 3) {
    return {
      street: parts[0],
      ward: "",
      district: parts[1],
      province: parts[2],
    };
  }
  // Từ 4 phần trở lên: [Số nhà/đường], [Phường/Xã], [Quận/Huyện], [Tỉnh/Thành]
  const province = parts[parts.length - 1];
  const district = parts[parts.length - 2];
  const ward = parts[parts.length - 3];
  const street = parts.slice(0, parts.length - 3).join(", ");
  return { street, ward, district, province };
}
