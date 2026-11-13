import fs from "node:fs";
import path from "node:path";
import sharp from "sharp";

const rootDir = path.resolve(".");
const sourceImgPath = path.resolve("../brandhub-mobile-app/assets/app-logo.png");
const publicDir = path.resolve("public");

async function run() {
  console.log("Loading source image:", sourceImgPath);
  if (!fs.existsSync(sourceImgPath)) {
    throw new Error(`Source image not found: ${sourceImgPath}`);
  }

  // 1. Crop 170x170 centered around (105, 97)
  const masterBase = await sharp(sourceImgPath)
    .extract({ left: 20, top: 12, width: 170, height: 170 })
    .png()
    .toBuffer();

  // 2. Resize to 512x512 with Lanczos3 resampling for crisp clarity
  const master512 = await sharp(masterBase)
    .resize(512, 512, { kernel: sharp.kernel.lanczos3 })
    .png()
    .toBuffer();

  const base64Png512 = master512.toString("base64");

  // 3. Generate vector SVG with embedded crisp image & vector fallback
  // The squircle has rx=110 out of 512 (approx 21.5% radius)
  const svgContent = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" width="100%" height="100%">
  <defs>
    <clipPath id="squircle">
      <rect width="512" height="512" rx="112" />
    </clipPath>
  </defs>
  <rect width="512" height="512" rx="112" fill="#F05A28" />
  <image href="data:image/png;base64,${base64Png512}" width="512" height="512" clip-path="url(#squircle)" />
</svg>
`;

  fs.writeFileSync(path.join(publicDir, "favicon.svg"), svgContent, "utf-8");
  console.log("Written public/favicon.svg");

  // 4. Generate all PNG resolutions
  const sizes = [
    { name: "icon.png", size: 512 },
    { name: "favicon-512x512.png", size: 512 },
    { name: "favicon-192x192.png", size: 192 },
    { name: "favicon.png", size: 192 },
    { name: "apple-touch-icon.png", size: 180 },
    { name: "favicon-144x144.png", size: 144 },
    { name: "favicon-96x96.png", size: 96 },
    { name: "favicon-48x48.png", size: 48 },
    { name: "favicon-32x32.png", size: 32 },
    { name: "favicon-16x16.png", size: 16 },
  ];

  const pngBuffers = {};
  for (const { name, size } of sizes) {
    const buf = await sharp(master512)
      .resize(size, size, { kernel: sharp.kernel.lanczos3 })
      .png()
      .toBuffer();
    fs.writeFileSync(path.join(publicDir, name), buf);
    pngBuffers[size] = buf;
    console.log(`Generated public/${name} (${size}x${size})`);
  }

  // 5. Generate multi-resolution ICO file (16, 32, 48)
  const icoSizes = [16, 32, 48];
  const icoHeader = Buffer.alloc(6);
  icoHeader.writeUInt16LE(0, 0); // reserved
  icoHeader.writeUInt16LE(1, 2); // 1 = ICO
  icoHeader.writeUInt16LE(icoSizes.length, 4); // number of images

  let offset = 6 + icoSizes.length * 16;
  const dirEntries = [];
  const imageBuffers = [];

  for (const sz of icoSizes) {
    const imgBuf = pngBuffers[sz];
    const entry = Buffer.alloc(16);
    entry.writeUInt8(sz >= 256 ? 0 : sz, 0); // width
    entry.writeUInt8(sz >= 256 ? 0 : sz, 1); // height
    entry.writeUInt8(0, 2); // color palette (0 = no palette)
    entry.writeUInt8(0, 3); // reserved
    entry.writeUInt16LE(1, 4); // color planes
    entry.writeUInt16LE(32, 6); // bits per pixel
    entry.writeUInt32LE(imgBuf.length, 8); // image size in bytes
    entry.writeUInt32LE(offset, 12); // image offset
    dirEntries.push(entry);
    imageBuffers.push(imgBuf);
    offset += imgBuf.length;
  }

  const fullIco = Buffer.concat([icoHeader, ...dirEntries, ...imageBuffers]);
  fs.writeFileSync(path.join(publicDir, "favicon.ico"), fullIco);
  console.log("Generated public/favicon.ico with sizes [16, 32, 48]");

  console.log("All favicons generated successfully!");
}

run().catch((err) => {
  console.error(err);
  process.exit(1);
});
