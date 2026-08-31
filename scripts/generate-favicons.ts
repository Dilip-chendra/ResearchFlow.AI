import fs from 'fs';
import path from 'path';
import zlib from 'zlib';

// Function to generate a simple uncompressed/deflated raw RGBA PNG buffer
function createPng(width: number, height: number, getPixel: (x: number, y: number) => [number, number, number, number]): Buffer {
  const rowSize = width * 4 + 1;
  const rawData = Buffer.alloc(height * rowSize);

  for (let y = 0; y < height; y++) {
    const rowOffset = y * rowSize;
    rawData[rowOffset] = 0; // Filter type 0 (None)
    for (let x = 0; x < width; x++) {
      const [r, g, b, a] = getPixel(x, y);
      const pixelOffset = rowOffset + 1 + x * 4;
      rawData[pixelOffset] = r;
      rawData[pixelOffset + 1] = g;
      rawData[pixelOffset + 2] = b;
      rawData[pixelOffset + 3] = a;
    }
  }

  const compressedData = zlib.deflateSync(rawData);

  // PNG Signature
  const signature = Buffer.from([0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A]);

  // IHDR Chunk
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(width, 0);
  ihdr.writeUInt32BE(height, 4);
  ihdr[8] = 8; // 8 bits per channel
  ihdr[9] = 6; // RGBA
  ihdr[10] = 0; // Compression
  ihdr[11] = 0; // Filter
  ihdr[12] = 0; // Interlace

  const ihdrChunk = createChunk('IHDR', ihdr);
  const idatChunk = createChunk('IDAT', compressedData);
  const iendChunk = createChunk('IEND', Buffer.alloc(0));

  return Buffer.concat([signature, ihdrChunk, idatChunk, iendChunk]);
}

function createChunk(type: string, data: Buffer): Buffer {
  const length = Buffer.alloc(4);
  length.writeUInt32BE(data.length, 0);

  const typeBuffer = Buffer.from(type, 'ascii');
  const crcData = Buffer.concat([typeBuffer, data]);
  const crc = crc32(crcData);

  const crcBuffer = Buffer.alloc(4);
  crcBuffer.writeUInt32BE(crc >>> 0, 0);

  return Buffer.concat([length, typeBuffer, data, crcBuffer]);
}

// CRC32 implementation
function crc32(buf: Buffer): number {
  let crc = 0xFFFFFFFF;
  for (let i = 0; i < buf.length; i++) {
    const byte = buf[i];
    crc = crc ^ byte;
    for (let j = 0; j < 8; j++) {
      crc = (crc >>> 1) ^ ((crc & 1) ? 0xEDB88320 : 0);
    }
  }
  return (crc ^ 0xFFFFFFFF) >>> 0;
}

// Rasterize the ResearchFlow Convergence Logo into 32x32 pixel grid
function renderResearchFlowPixel(x: number, y: number, size: number = 32): [number, number, number, number] {
  // Normalize to 64x64 design space
  const nx = (x / size) * 64;
  const ny = (y / size) * 64;

  // Signal 1: Upper Flow Ribbon (Crown of R / Top bar of F)
  // Loop from (8, 9) to (36, 9) curving to (52, 25) down to (36, 41) back to (28, 41)
  const inSignal1Outer = (nx >= 8 && nx <= 36 && ny >= 9 && ny <= 41) ||
                         (Math.hypot(nx - 36, ny - 25) <= 16 && nx >= 36);
  const inSignal1Hole = (nx >= 13.5 && nx <= 36 && ny >= 17 && ny <= 33) ||
                        (Math.hypot(nx - 36, ny - 25) <= 8 && nx >= 36);
  const inSignal1Stem = (nx >= 8 && nx <= 28 && ny >= 33 && ny <= 41);

  const inSignal1 = (inSignal1Outer && !inSignal1Hole && !inSignal1Stem) || 
                    (nx >= 8 && nx <= 36 && ny >= 9 && ny <= 17 && Math.hypot(nx - 13.5, ny - 13) <= 4.5);

  // Signal 2: Middle Stream Ribbon (8 to 24, y=22 to 29)
  const inSignal2 = (nx >= 8 && nx <= 24 && ny >= 22 && ny <= 29);

  // Signal 3: Lower Inflow Ribbon (8 to 22, y=35 to 42)
  const inSignal3 = (nx >= 8 && nx <= 22 && ny >= 35 && ny <= 42);

  // Convergence Vector: 45 degree diagonal from (26, 31.5) to (52, 52)
  // Line center from (30, 30) to (50, 50), thickness ~10
  const proj = (nx + ny - 60) / 2; // Distance along diagonal
  const dist = Math.abs(nx - ny + 0); // Distance perpendicular
  const inThrust = (proj >= 0 && proj <= 22 && dist <= 7.5);

  // Colors:
  // Sky Azure: #38BDF8 = (56, 189, 248)
  // Electric Blue: #3B82F6 = (59, 130, 246)
  // Indigo: #6366F1 = (99, 102, 241)
  // Cyan: #06B6D4 = (6, 182, 212)
  // Emerald: #10B981 = (16, 185, 129)

  if (inSignal1) {
    // Gradient from Sky Azure (56, 189, 248) to Indigo (99, 102, 241)
    const t = Math.min(1, Math.max(0, nx / 50));
    const r = Math.round(56 + (99 - 56) * t);
    const g = Math.round(189 + (102 - 189) * t);
    const b = Math.round(248 + (241 - 248) * t);
    return [r, g, b, 255];
  }

  if (inSignal2) {
    // Sky Azure #38BDF8
    return [56, 189, 248, 255];
  }

  if (inSignal3) {
    // Electric Blue #60A5FA
    return [96, 165, 250, 255];
  }

  if (inThrust) {
    // Indigo to Cyan/Emerald Gradient #6366F1 -> #06B6D4
    const t = Math.min(1, Math.max(0, proj / 22));
    const r = Math.round(99 + (6 - 99) * t);
    const g = Math.round(102 + (182 - 102) * t);
    const b = Math.round(241 + (212 - 241) * t);
    return [r, g, b, 255];
  }

  return [0, 0, 0, 0]; // Transparent
}

async function main() {
  const publicDir = path.join(process.cwd(), 'public');
  const brandDir = path.join(publicDir, 'brand');

  if (!fs.existsSync(brandDir)) {
    fs.mkdirSync(brandDir, { recursive: true });
  }

  // 1. Generate 32x32 PNG Favicon
  const png32 = createPng(32, 32, (x, y) => renderResearchFlowPixel(x, y, 32));
  fs.writeFileSync(path.join(publicDir, 'favicon.png'), png32);
  fs.writeFileSync(path.join(brandDir, 'researchflow-favicon.png'), png32);
  fs.writeFileSync(path.join(publicDir, 'favicon.ico'), png32); // Modern browsers accept PNG bytes inside .ico

  // 2. Generate 64x64 PNG App Icon
  const png64 = createPng(64, 64, (x, y) => renderResearchFlowPixel(x, y, 64));
  fs.writeFileSync(path.join(brandDir, 'researchflow-app-icon.png'), png64);

  console.log('Successfully generated pixel-perfect PNG & ICO brand favicons!');
}

main().catch(console.error);
