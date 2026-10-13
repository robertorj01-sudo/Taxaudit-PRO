const zlib = require('zlib');
const fs = require('fs');
const path = require('path');

function generateInbIconPng(size, isMaskable = false) {
  const rowLength = size * 4 + 1;
  const rawData = Buffer.alloc(rowLength * size);
  
  const cx = size / 2;
  const cy = size / 2;
  const outerRadius = size * 0.45;
  const innerRadius = size * 0.15;
  const orbitA = size * 0.35;
  const orbitB = size * 0.13;

  for (let y = 0; y < size; y++) {
    const rowOffset = y * rowLength;
    rawData[rowOffset] = 0; // Filter: None

    for (let x = 0; x < size; x++) {
      const pxOffset = rowOffset + 1 + x * 4;
      const dx = x - cx;
      const dy = y - cy;
      const dist = Math.sqrt(dx * dx + dy * dy);

      // Default Deep Navy Blue Background (#002B49)
      let r = 0;
      let g = 43;
      let b = 73;
      let a = 255;

      // Subtle radial gradient to darker navy #07131D towards edges
      const gradFactor = Math.min(dist / (size * 0.6), 1);
      r = Math.round(r * (1 - gradFactor * 0.5));
      g = Math.round(g * (1 - gradFactor * 0.5));
      b = Math.round(b * (1 - gradFactor * 0.5));

      // Golden Ring / Nucleus
      if (dist <= innerRadius) {
        // Gold gradient #FFD15C to #E59800
        const nFactor = dist / innerRadius;
        r = Math.round(255 * (1 - nFactor * 0.1));
        g = Math.round(209 * (1 - nFactor * 0.25));
        b = Math.round(92 * (1 - nFactor * 0.8));

        // Center dot
        if (dist <= innerRadius * 0.5) {
          r = 0;
          g = 43;
          b = 73;
        }
      }

      // Orbit 1: Ellipse rotated 30 deg (Gold)
      const cos30 = 0.866;
      const sin30 = 0.5;
      const xRot1 = dx * cos30 + dy * sin30;
      const yRot1 = -dx * sin30 + dy * cos30;
      const eq1 = Math.abs((xRot1 * xRot1) / (orbitA * orbitA) + (yRot1 * yRot1) / (orbitB * orbitB) - 1);
      if (eq1 < 0.08) {
        r = 255;
        g = 209;
        b = 92;
      }

      // Orbit 2: Ellipse rotated -30 deg (Emerald #10B981)
      const xRot2 = dx * cos30 - dy * sin30;
      const yRot2 = dx * sin30 + dy * cos30;
      const eq2 = Math.abs((xRot2 * xRot2) / (orbitA * orbitA) + (yRot2 * yRot2) / (orbitB * orbitB) - 1);
      if (eq2 < 0.08) {
        r = 52;
        g = 211;
        b = 153;
      }

      // Outer Rounded Border for non-maskable
      if (!isMaskable) {
        const cornerDist = Math.max(Math.abs(dx), Math.abs(dy));
        if (cornerDist > size * 0.46) {
          // rounded outer border
          r = 16;
          g = 185;
          b = 129;
        }
      }

      rawData[pxOffset] = r;
      rawData[pxOffset + 1] = g;
      rawData[pxOffset + 2] = b;
      rawData[pxOffset + 3] = a;
    }
  }

  const idatData = zlib.deflateSync(rawData);

  // CRC32 table
  const table = new Uint32Array(256);
  for (let i = 0; i < 256; i++) {
    let c = i;
    for (let k = 0; k < 8; k++) {
      c = ((c & 1) ? (0xEDB88320 ^ (c >>> 1)) : (c >>> 1));
    }
    table[i] = c >>> 0;
  }
  function crc32(buf) {
    let crc = 0 ^ (-1);
    for (let i = 0; i < buf.length; i++) {
      crc = (crc >>> 8) ^ table[(crc ^ buf[i]) & 0xFF];
    }
    return (crc ^ (-1)) >>> 0;
  }

  function makeChunk(type, data) {
    const typeBuf = Buffer.from(type, 'ascii');
    const lenBuf = Buffer.alloc(4);
    lenBuf.writeUInt32BE(data.length, 0);
    const toCrc = Buffer.concat([typeBuf, data]);
    const crcVal = crc32(toCrc);
    const crcBuf = Buffer.alloc(4);
    crcBuf.writeUInt32BE(crcVal, 0);
    return Buffer.concat([lenBuf, toCrc, crcBuf]);
  }

  const sig = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]);
  const ihdrData = Buffer.alloc(13);
  ihdrData.writeUInt32BE(size, 0);
  ihdrData.writeUInt32BE(size, 4);
  ihdrData[8] = 8;
  ihdrData[9] = 6;
  ihdrData[10] = 0;
  ihdrData[11] = 0;
  ihdrData[12] = 0;

  const ihdr = makeChunk('IHDR', ihdrData);
  const idat = makeChunk('IDAT', idatData);
  const iend = makeChunk('IEND', Buffer.alloc(0));

  return Buffer.concat([sig, ihdr, idat, iend]);
}

const publicDir = path.resolve(__dirname, '..', 'public');
if (!fs.existsSync(publicDir)) {
  fs.mkdirSync(publicDir, { recursive: true });
}

// Generate PWA icons
fs.writeFileSync(path.join(publicDir, 'pwa-192x192.png'), generateInbIconPng(192));
fs.writeFileSync(path.join(publicDir, 'pwa-512x512.png'), generateInbIconPng(512));
fs.writeFileSync(path.join(publicDir, 'pwa-maskable-512x512.png'), generateInbIconPng(512, true));
fs.writeFileSync(path.join(publicDir, 'apple-touch-icon.png'), generateInbIconPng(180));
fs.writeFileSync(path.join(publicDir, 'favicon.png'), generateInbIconPng(64));

console.log('Successfully generated all PWA icons in /public:');
console.log(' - pwa-192x192.png');
console.log(' - pwa-512x512.png');
console.log(' - pwa-maskable-512x512.png');
console.log(' - apple-touch-icon.png');
console.log(' - favicon.png');
