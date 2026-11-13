import React, {
  useEffect,
  useMemo,
  useState,
  useRef,
  useCallback,
} from "react";
import {
  Check,
  ChevronDown,
  Search,
  MapPin,
  Building2,
  Sparkles,
  RotateCcw,
  Loader2,
  X,
  Pencil,
} from "lucide-react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";
import {
  getProvinces,
  getDistricts,
  getWards,
  findProvinceByName,
  findDistrictByName,
  findWardByName,
  type Province,
  type District,
  type Ward,
} from "@/services/vietnamAddressService";

export interface VietnamAddressPickerProps {
  locationValue: string;
  addressValue: string;
  onLocationChange: (location: string) => void;
  onAddressChange: (address: string) => void;
  disabled?: boolean;
  className?: string;
  labels?: {
    province?: string;
    district?: string;
    ward?: string;
    street?: string;
    fullAddress?: string;
  };
  errors?: {
    location?: string;
    address?: string;
  };
  required?: boolean;
}

interface SearchableSelectProps {
  label?: string;
  placeholder: string;
  searchPlaceholder?: string;
  value?: string;
  options: { code: number; name: string }[];
  onSelect: (item: { code: number; name: string } | null) => void;
  disabled?: boolean;
  loading?: boolean;
  error?: string;
  required?: boolean;
  icon?: React.ReactNode;
}

function SearchableSelect({
  label,
  placeholder,
  searchPlaceholder = "Tìm kiếm...",
  value,
  options,
  onSelect,
  disabled = false,
  loading = false,
  error,
  required,
  icon,
}: SearchableSelectProps) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const searchInputRef = useRef<HTMLInputElement>(null);

  const filteredOptions = useMemo(() => {
    if (!search.trim()) return options;
    const query = search.trim().toLowerCase();
    return options.filter((item) => item.name.toLowerCase().includes(query));
  }, [options, search]);

  const handleOpenChange = (nextOpen: boolean) => {
    if (disabled) return;
    setOpen(nextOpen);
    if (!nextOpen) {
      setSearch("");
    } else {
      setTimeout(() => {
        searchInputRef.current?.focus();
      }, 50);
    }
  };

  return (
    <div className="flex w-full flex-col gap-1.5">
      {label && (
        <Label
          className={cn(
            "flex items-center gap-0.5 text-xs font-semibold tracking-wide",
            error && "text-destructive",
          )}
        >
          <span>{label}</span>
          {required && (
            <span
              className="text-destructive ml-0.5 font-bold"
              aria-hidden="true"
            >
              *
            </span>
          )}
        </Label>
      )}

      <DropdownMenu open={open} onOpenChange={handleOpenChange}>
        <DropdownMenuTrigger asChild>
          <button
            type="button"
            disabled={disabled}
            className={cn(
              "border-input bg-input-background dark:bg-input/30 text-foreground focus-visible:border-ring focus-visible:ring-ring/50",
              "flex h-9 w-full items-center justify-between rounded-md border px-3 py-1 text-sm outline-none",
              "transition-colors focus-visible:ring-[3px]",
              disabled && "bg-muted/40 cursor-not-allowed opacity-50",
              error &&
                "border-destructive text-destructive focus-visible:ring-destructive/20",
            )}
          >
            <span className="flex items-center gap-2 truncate">
              {icon && (
                <span className="text-muted-foreground shrink-0">{icon}</span>
              )}
              <span
                className={cn("truncate", !value && "text-muted-foreground")}
              >
                {value || placeholder}
              </span>
            </span>

            {loading ? (
              <Loader2 className="text-muted-foreground size-3.5 shrink-0 animate-spin" />
            ) : (
              <ChevronDown className="text-muted-foreground size-3.5 shrink-0" />
            )}
          </button>
        </DropdownMenuTrigger>

        <DropdownMenuContent
          align="start"
          className="border-border bg-popover z-50 w-[var(--radix-dropdown-menu-trigger-width)] max-w-[360px] min-w-[220px] border p-0 shadow-lg"
        >
          <div className="border-border relative border-b p-1.5">
            <Search className="text-muted-foreground pointer-events-none absolute top-1/2 left-3 size-3.5 -translate-y-1/2" />
            <input
              ref={searchInputRef}
              type="text"
              placeholder={searchPlaceholder}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="bg-muted/50 text-foreground placeholder:text-muted-foreground focus:border-ring focus:bg-background h-8 w-full rounded-sm border border-transparent pr-7 pl-8 text-xs transition-colors outline-none"
            />
            {search && (
              <button
                type="button"
                onClick={() => setSearch("")}
                className="text-muted-foreground hover:text-foreground absolute top-1/2 right-2.5 -translate-y-1/2"
              >
                <X className="size-3" />
              </button>
            )}
          </div>

          <div className="max-h-60 overflow-y-auto p-1 text-xs">
            {/* Option bỏ chọn */}
            <button
              type="button"
              onClick={() => {
                onSelect(null);
                setOpen(false);
              }}
              className="hover:bg-accent hover:text-accent-foreground text-muted-foreground flex w-full items-center gap-2 rounded-sm px-2 py-1.5 text-left transition-colors"
            >
              <Check
                className={cn("size-3.5", value ? "invisible" : "text-primary")}
              />
              <span>— Để trống / Bỏ chọn —</span>
            </button>

            {filteredOptions.map((opt) => {
              const isSelected = value === opt.name;
              return (
                <button
                  key={opt.code}
                  type="button"
                  onClick={() => {
                    onSelect(opt);
                    setOpen(false);
                  }}
                  className={cn(
                    "hover:bg-accent hover:text-accent-foreground flex w-full items-center gap-2 rounded-sm px-2 py-1.5 text-left transition-colors",
                    isSelected && "bg-accent/60 text-foreground font-medium",
                  )}
                >
                  <Check
                    className={cn(
                      "size-3.5 shrink-0",
                      isSelected ? "text-primary" : "invisible",
                    )}
                  />
                  <span className="truncate">{opt.name}</span>
                </button>
              );
            })}

            {filteredOptions.length === 0 && (
              <p className="text-muted-foreground px-2 py-2 text-center text-xs">
                Không tìm thấy kết quả
              </p>
            )}
          </div>
        </DropdownMenuContent>
      </DropdownMenu>

      {error && <span className="text-destructive text-[11px]">{error}</span>}
    </div>
  );
}

export function VietnamAddressPicker({
  locationValue = "",
  addressValue = "",
  onLocationChange,
  onAddressChange,
  disabled = false,
  className,
  labels,
  errors,
  required,
}: VietnamAddressPickerProps) {
  const [provinces, setProvinces] = useState<Province[]>([]);
  const [districts, setDistricts] = useState<District[]>([]);
  const [wards, setWards] = useState<Ward[]>([]);

  const [selectedProvince, setSelectedProvince] = useState<Province | null>(
    null,
  );
  const [selectedDistrict, setSelectedDistrict] = useState<District | null>(
    null,
  );
  const [selectedWard, setSelectedWard] = useState<Ward | null>(null);

  const [street, setStreet] = useState("");
  const [isAutoSync, setIsAutoSync] = useState(true);

  const [loadingProvinces, setLoadingProvinces] = useState(false);
  const [loadingDistricts, setLoadingDistricts] = useState(false);
  const [loadingWards, setLoadingWards] = useState(false);

  const initializedRef = useRef(false);

  // 1. Tải danh sách tỉnh/thành khi mount
  useEffect(() => {
    let isMounted = true;
    setLoadingProvinces(true);

    getProvinces()
      .then((data) => {
        if (!isMounted) return;
        setProvinces(data);
      })
      .finally(() => {
        if (isMounted) setLoadingProvinces(false);
      });

    return () => {
      isMounted = false;
    };
  }, []);

  // 2. Khởi tạo & phân giải dữ liệu ban đầu từ locationValue và addressValue
  useEffect(() => {
    if (!provinces.length || initializedRef.current) return;
    initializedRef.current = true;

    const initData = async () => {
      let matchedProvince: Province | undefined;

      if (locationValue) {
        matchedProvince = await findProvinceByName(locationValue);
      } else if (addressValue) {
        // Cố gắng tìm tỉnh từ chuỗi addressValue nếu locationValue chưa có
        for (const p of provinces) {
          if (addressValue.toLowerCase().includes(p.name.toLowerCase())) {
            matchedProvince = p;
            break;
          }
        }
      }

      if (matchedProvince) {
        setSelectedProvince(matchedProvince);
        setLoadingDistricts(true);
        const districtList = await getDistricts(matchedProvince.code);
        setDistricts(districtList);
        setLoadingDistricts(false);

        // Nếu có addressValue, cố gắng bóc tách district và ward
        if (addressValue && districtList.length) {
          const parts = addressValue.split(",").map((s) => s.trim());
          let matchedDistrict: District | undefined;

          for (const part of parts) {
            matchedDistrict = findDistrictByName(districtList, part);
            if (matchedDistrict) break;
          }

          if (!matchedDistrict) {
            matchedDistrict = districtList.find((d) =>
              addressValue.toLowerCase().includes(d.name.toLowerCase()),
            );
          }

          if (matchedDistrict) {
            setSelectedDistrict(matchedDistrict);
            setLoadingWards(true);
            const wardList = await getWards(matchedDistrict.code);
            setWards(wardList);
            setLoadingWards(false);

            if (wardList.length) {
              let matchedWard: Ward | undefined;
              for (const part of parts) {
                matchedWard = findWardByName(wardList, part);
                if (matchedWard) break;
              }
              if (!matchedWard) {
                matchedWard = wardList.find((w) =>
                  addressValue.toLowerCase().includes(w.name.toLowerCase()),
                );
              }
              if (matchedWard) {
                setSelectedWard(matchedWard);
              }
            }
          }
        }
      }

      // Tách phần số nhà/tên đường từ addressValue nếu có cấu trúc dấu phẩy
      if (addressValue) {
        const parts = addressValue.split(",").map((s) => s.trim());
        // Nếu địa chỉ có nhiều phần, lấy phần đầu làm tên đường/số nhà
        if (parts.length > 1) {
          setStreet(parts[0]);
        } else {
          setStreet(addressValue);
        }
      }
    };

    initData();
  }, [provinces, locationValue, addressValue]);

  // Đồng bộ khi locationValue bên ngoài thay đổi mà khác với selectedProvince
  useEffect(() => {
    if (!initializedRef.current || !provinces.length) return;
    if (selectedProvince && selectedProvince.name === locationValue) return;

    if (!locationValue) {
      setSelectedProvince(null);
      setDistricts([]);
      setSelectedDistrict(null);
      setWards([]);
      setSelectedWard(null);
      return;
    }

    findProvinceByName(locationValue).then((prov) => {
      if (prov && prov.code !== selectedProvince?.code) {
        setSelectedProvince(prov);
        setSelectedDistrict(null);
        setSelectedWard(null);
        setLoadingDistricts(true);
        getDistricts(prov.code)
          .then(setDistricts)
          .finally(() => setLoadingDistricts(false));
      }
    });
  }, [locationValue, provinces, selectedProvince]);

  // Hàm tổng hợp chuỗi địa chỉ đầy đủ
  const composeFullAddress = useCallback(
    (
      streetVal: string,
      wardObj: Ward | null,
      districtObj: District | null,
      provinceObj: Province | null,
    ) => {
      const parts = [
        streetVal.trim(),
        wardObj?.name,
        districtObj?.name,
        provinceObj?.name,
      ].filter(Boolean);
      return parts.join(", ");
    },
    [],
  );

  // 3. Xử lý khi chọn Tỉnh/Thành
  const handleSelectProvince = async (
    item: { code: number; name: string } | null,
  ) => {
    if (!item) {
      setSelectedProvince(null);
      setDistricts([]);
      setSelectedDistrict(null);
      setWards([]);
      setSelectedWard(null);
      onLocationChange("");

      if (isAutoSync) {
        const composed = composeFullAddress(street, null, null, null);
        onAddressChange(composed);
      }
      return;
    }

    const prov: Province = { code: item.code, name: item.name };
    setSelectedProvince(prov);
    setSelectedDistrict(null);
    setSelectedWard(null);
    setWards([]);
    onLocationChange(prov.name);

    setLoadingDistricts(true);
    try {
      const distList = await getDistricts(prov.code);
      setDistricts(distList);
    } finally {
      setLoadingDistricts(false);
    }

    if (isAutoSync) {
      const composed = composeFullAddress(street, null, null, prov);
      onAddressChange(composed);
    }
  };

  // 4. Xử lý khi chọn Quận/Huyện
  const handleSelectDistrict = async (
    item: { code: number; name: string } | null,
  ) => {
    if (!item) {
      setSelectedDistrict(null);
      setWards([]);
      setSelectedWard(null);

      if (isAutoSync) {
        const composed = composeFullAddress(
          street,
          null,
          null,
          selectedProvince,
        );
        onAddressChange(composed);
      }
      return;
    }

    const dist: District = {
      code: item.code,
      name: item.name,
      province_code: selectedProvince?.code ?? 0,
    };
    setSelectedDistrict(dist);
    setSelectedWard(null);

    setLoadingWards(true);
    try {
      const wardList = await getWards(dist.code);
      setWards(wardList);
    } finally {
      setLoadingWards(false);
    }

    if (isAutoSync) {
      const composed = composeFullAddress(street, null, dist, selectedProvince);
      onAddressChange(composed);
    }
  };

  // 5. Xử lý khi chọn Phường/Xã
  const handleSelectWard = (item: { code: number; name: string } | null) => {
    const wardObj: Ward | null = item
      ? {
          code: item.code,
          name: item.name,
          district_code: selectedDistrict?.code ?? 0,
        }
      : null;

    setSelectedWard(wardObj);

    if (isAutoSync) {
      const composed = composeFullAddress(
        street,
        wardObj,
        selectedDistrict,
        selectedProvince,
      );
      onAddressChange(composed);
    }
  };

  // 6. Xử lý khi nhập số nhà / tên đường
  const handleStreetChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setStreet(val);

    if (isAutoSync) {
      const composed = composeFullAddress(
        val,
        selectedWard,
        selectedDistrict,
        selectedProvince,
      );
      onAddressChange(composed);
    }
  };

  // 7. Chỉnh sửa thủ công ô Địa chỉ đầy đủ
  const handleManualFullAddressChange = (
    e: React.ChangeEvent<HTMLInputElement>,
  ) => {
    setIsAutoSync(false);
    onAddressChange(e.target.value);
  };

  // Đặt lại tự động tổng hợp từ các mục đã chọn
  const handleResetToAutoSync = () => {
    setIsAutoSync(true);
    const composed = composeFullAddress(
      street,
      selectedWard,
      selectedDistrict,
      selectedProvince,
    );
    onAddressChange(composed);
  };

  return (
    <div className={cn("flex w-full flex-col gap-3.5", className)}>
      {/* Hàng 1: Tỉnh / Thành phố */}
      <div className="w-full">
        <SearchableSelect
          label={labels?.province || "Tỉnh / Thành phố"}
          placeholder="Chọn Tỉnh / Thành phố"
          searchPlaceholder="Tìm kiếm Tỉnh / Thành phố..."
          value={selectedProvince?.name || locationValue}
          options={provinces}
          onSelect={handleSelectProvince}
          disabled={disabled}
          loading={loadingProvinces}
          error={errors?.location}
          required={required}
          icon={<MapPin className="text-primary size-3.5" />}
        />
      </div>

      {/* Hàng 2: Quận / Huyện & Phường / Xã */}
      <div className="grid w-full grid-cols-1 gap-3 sm:grid-cols-2">
        <SearchableSelect
          label={labels?.district || "Quận / Huyện"}
          placeholder={
            !selectedProvince
              ? "Vui lòng chọn Tỉnh/Thành trước"
              : "Chọn Quận / Huyện"
          }
          searchPlaceholder="Tìm kiếm Quận / Huyện..."
          value={selectedDistrict?.name || ""}
          options={districts}
          onSelect={handleSelectDistrict}
          disabled={disabled || !selectedProvince || districts.length === 0}
          loading={loadingDistricts}
          icon={<Building2 className="text-muted-foreground size-3.5" />}
        />

        <SearchableSelect
          label={labels?.ward || "Phường / Xã"}
          placeholder={
            !selectedDistrict
              ? "Vui lòng chọn Quận/Huyện trước"
              : "Chọn Phường / Xã"
          }
          searchPlaceholder="Tìm kiếm Phường / Xã..."
          value={selectedWard?.name || ""}
          options={wards}
          onSelect={handleSelectWard}
          disabled={disabled || !selectedDistrict || wards.length === 0}
          loading={loadingWards}
          icon={<Building2 className="text-muted-foreground size-3.5" />}
        />
      </div>

      {/* Hàng 3: Số nhà, tên đường & Địa chỉ hoàn chỉnh */}
      <div className="flex w-full flex-col gap-3">
        {/* Input Số nhà / Tên đường */}
        <Input
          label={labels?.street || "Số nhà, tên đường / Tòa nhà"}
          placeholder="VD: Số 123 đường Lê Lợi, Tòa nhà ABC..."
          value={street}
          onChange={handleStreetChange}
          disabled={disabled}
        />

        {/* Ô Địa chỉ chi tiết đầy đủ (Hiển thị kết quả & cho phép chuyển đổi linh hoạt) */}
        <div className="flex w-full flex-col gap-1.5">
          <div className="flex items-center justify-between">
            <Label
              className={cn(
                "flex items-center gap-1 text-xs font-semibold tracking-wide",
                errors?.address && "text-destructive",
              )}
            >
              <span>
                {labels?.fullAddress || "Địa chỉ chi tiết hoàn chỉnh"}
              </span>
              {required && (
                <span className="text-destructive font-bold" aria-hidden="true">
                  *
                </span>
              )}
            </Label>

            {/* Badge & Nút chuyển đổi Auto/Manual */}
            <div className="flex items-center gap-1.5 text-[11px]">
              {isAutoSync ? (
                <span className="text-primary bg-primary/10 inline-flex items-center gap-1 rounded-full px-2 py-0.5 font-medium">
                  <Sparkles className="size-3 animate-pulse" />
                  Tự động ghép
                </span>
              ) : (
                <button
                  type="button"
                  onClick={handleResetToAutoSync}
                  disabled={disabled}
                  className="text-muted-foreground hover:text-primary bg-muted/60 hover:bg-muted inline-flex cursor-pointer items-center gap-1 rounded-full px-2 py-0.5 transition-colors"
                  title="Nhấn để tự động tạo lại địa chỉ từ Tỉnh, Quận, Phường và Số nhà"
                >
                  <RotateCcw className="size-3" />
                  Đồng bộ lại tự động
                </button>
              )}
            </div>
          </div>

          <div className="relative flex w-full items-center">
            <Input
              value={addressValue}
              onChange={handleManualFullAddressChange}
              placeholder="VD: 123 Lê Lợi, Phường Bến Thành, Quận 1, Thành phố Hồ Chí Minh"
              disabled={disabled}
              error={errors?.address}
              className={cn("pr-8", isAutoSync && "bg-muted/20")}
            />
            <div className="text-muted-foreground pointer-events-none absolute right-2.5">
              {isAutoSync ? (
                <Sparkles className="text-primary/70 size-3.5" />
              ) : (
                <Pencil className="text-muted-foreground size-3.5" />
              )}
            </div>
          </div>

          <p className="text-muted-foreground text-[11px]">
            {isAutoSync
              ? "Địa chỉ được tự động tổng hợp từ các mục bên trên. Bạn có thể gõ trực tiếp vào ô này nếu muốn tùy chỉnh."
              : "Đang ở chế độ chỉnh sửa thủ công. Nhấn 'Đồng bộ lại tự động' nếu muốn tái tạo theo danh mục đã chọn."}
          </p>
        </div>
      </div>
    </div>
  );
}
export default VietnamAddressPicker;

export {
  formatAddress,
  parseAddress,
  type AddressComponents,
} from "@/services/vietnamAddressService";
