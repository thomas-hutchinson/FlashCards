/**
 * Creates simple PNG icons for the PWA
 * These are basic colored squares - replace with proper icons for production
 */

const fs = require('fs');
const path = require('path');

// Simple PNG creation using raw bytes
function createPNG(size) {
    // We'll create a simple solid color PNG
    // PNG structure: signature + IHDR + IDAT + IEND
    
    const width = size;
    const height = size;
    
    // PNG signature
    const signature = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]);
    
    // IHDR chunk
    const ihdrData = Buffer.alloc(13);
    ihdrData.writeUInt32BE(width, 0);
    ihdrData.writeUInt32BE(height, 4);
    ihdrData.writeUInt8(8, 8);   // bit depth
    ihdrData.writeUInt8(2, 9);   // color type (RGB)
    ihdrData.writeUInt8(0, 10);  // compression
    ihdrData.writeUInt8(0, 11);  // filter
    ihdrData.writeUInt8(0, 12);  // interlace
    
    const ihdrChunk = createChunk('IHDR', ihdrData);
    
    // Create image data (simple gradient)
    const rawData = [];
    for (let y = 0; y < height; y++) {
        rawData.push(0); // filter byte
        for (let x = 0; x < width; x++) {
            // Purple gradient color (#6366f1)
            const r = 99;
            const g = 102;
            const b = 241;
            rawData.push(r, g, b);
        }
    }
    
    // Compress with zlib
    const zlib = require('zlib');
    const compressed = zlib.deflateSync(Buffer.from(rawData));
    
    const idatChunk = createChunk('IDAT', compressed);
    
    // IEND chunk
    const iendChunk = createChunk('IEND', Buffer.alloc(0));
    
    return Buffer.concat([signature, ihdrChunk, idatChunk, iendChunk]);
}

function createChunk(type, data) {
    const length = Buffer.alloc(4);
    length.writeUInt32BE(data.length, 0);
    
    const typeBuffer = Buffer.from(type);
    const crc = crc32(Buffer.concat([typeBuffer, data]));
    
    const crcBuffer = Buffer.alloc(4);
    crcBuffer.writeUInt32BE(crc >>> 0, 0);
    
    return Buffer.concat([length, typeBuffer, data, crcBuffer]);
}

// CRC32 implementation
function crc32(buffer) {
    let crc = 0xffffffff;
    const table = makeCRCTable();
    
    for (let i = 0; i < buffer.length; i++) {
        crc = (crc >>> 8) ^ table[(crc ^ buffer[i]) & 0xff];
    }
    
    return crc ^ 0xffffffff;
}

function makeCRCTable() {
    const table = new Array(256);
    for (let i = 0; i < 256; i++) {
        let c = i;
        for (let j = 0; j < 8; j++) {
            c = (c & 1) ? (0xedb88320 ^ (c >>> 1)) : (c >>> 1);
        }
        table[i] = c;
    }
    return table;
}

// Generate icons
const sizes = [72, 96, 128, 144, 152, 192, 384, 512];
const iconDir = path.join(__dirname, 'icons');

if (!fs.existsSync(iconDir)) {
    fs.mkdirSync(iconDir, { recursive: true });
}

console.log('Generating PWA icons...');

sizes.forEach(size => {
    const png = createPNG(size);
    const filename = path.join(iconDir, `icon-${size}x${size}.png`);
    fs.writeFileSync(filename, png);
    console.log(`Created: icon-${size}x${size}.png`);
});

console.log('\nDone! Icons created in the icons/ folder.');
console.log('Note: These are simple placeholder icons. For a polished app,');
console.log('open generate-icons.html in a browser to create proper icons with the logo.');
