/**
 * C16 (compressed sprite) encoder
 *
 * Produces a C16 binary file from an array of RGBA bitmaps. Mirrors the
 * format consumed by `C16Parser` in creatures-file-formats.js so the round
 * trip parser → encoder → parser yields identical pixel data.
 *
 * Binary layout (all little-endian):
 *
 *   [uint32] pixelFormat              — 3 = RGB565 (newer C16 variant used
 *                                       by the C3 engine; the parser also
 *                                       accepts 1 = RGB565 legacy)
 *   [uint16] imageCount
 *   For each image:
 *       [uint32] offset to first scanline's encoded pixel data
 *       [uint16] width
 *       [uint16] height
 *       For each scanline AFTER the first (height-1 entries):
 *           [uint32] offset to that scanline's encoded pixel data
 *
 *   Scanline encoding (RLE):
 *       Repeat until `count`s sum to `width`:
 *           [uint16] tag, where:
 *               isLiteral = tag & 1
 *               count     = tag >> 1
 *           If isLiteral: [uint16 × count] RGB565 pixels follow
 *           Else:         no pixel bytes — `count` transparent pixels are
 *                         implied
 *
 *   The runs in a scanline must alternate between transparent and literal
 *   (otherwise the decoder loses sync). A pixel is considered transparent
 *   when its RGBA alpha === 0; everything else is literal. A scanline
 *   starting with opaque pixels begins with a literal-tag run; one
 *   starting with transparent pixels begins with a transparent-tag run.
 *
 *   Per-run count is encoded in 15 bits (`tag >> 1`), so the maximum
 *   contiguous run is 32767 pixels. Longer runs are split across multiple
 *   tags of the same kind — those still decode correctly because adjacent
 *   tags of the same kind just append to one another in the output.
 *
 * No DOM dependencies — safe to call from any context (browser, Node,
 * worker, backend roundtrip test).
 */

const MAX_RUN = 0x7FFF;            // 15-bit count, tag layout = (count << 1) | isLiteral
const C16_PIXEL_FORMAT = 3;        // RGB565 — what the C3 engine writes natively

/**
 * Convert one RGBA pixel (4 bytes) to a 16-bit RGB565 word.
 * Alpha === 0 always maps to 0x0000 (color-key transparency).
 */
function rgbaToRgb565(r, g, b, a) {
    if (a === 0) return 0;
    const r5 = (r >> 3) & 0x1F;
    const g6 = (g >> 2) & 0x3F;
    const b5 = (b >> 3) & 0x1F;
    return (r5 << 11) | (g6 << 5) | b5;
}

/**
 * Encode a single scanline into a `Uint16Array` of words.
 *
 * @param {Uint8Array|Uint8ClampedArray} rgba  Full bitmap's RGBA bytes
 * @param {number} y                            Row index
 * @param {number} width                        Row width in pixels
 * @returns {Uint16Array} Encoded scanline (tag + literal-pixel words mixed)
 */
function encodeScanline(rgba, y, width) {
    const out = [];
    let x = 0;
    while (x < width) {
        const rowOffset = (y * width + x) * 4;
        const isTransparent = rgba[rowOffset + 3] === 0;

        // Measure the contiguous run of same-kind pixels at the cursor.
        let runEnd = x;
        while (runEnd < width) {
            const off = (y * width + runEnd) * 4;
            const aZero = rgba[off + 3] === 0;
            if (aZero !== isTransparent) break;
            runEnd++;
        }

        // Split the run into MAX_RUN chunks. Each chunk emits its own tag;
        // consecutive same-kind tags decode to one contiguous output run.
        let remaining = runEnd - x;
        while (remaining > 0) {
            const chunk = Math.min(remaining, MAX_RUN);
            const tag = (chunk << 1) | (isTransparent ? 0 : 1);
            out.push(tag);
            if (!isTransparent) {
                for (let i = 0; i < chunk; i++) {
                    const off = (y * width + x + i) * 4;
                    out.push(rgbaToRgb565(
                        rgba[off], rgba[off + 1], rgba[off + 2], rgba[off + 3]
                    ));
                }
            }
            x += chunk;
            remaining -= chunk;
        }
    }
    return Uint16Array.from(out);
}

/**
 * Encode an array of RGBA bitmaps into a C16 ArrayBuffer.
 *
 * @param {Array<{width:number, height:number, pixelData:Uint8Array|Uint8ClampedArray}>} bitmaps
 * @returns {ArrayBuffer}
 */
export function encodeC16(bitmaps) {
    if (!Array.isArray(bitmaps)) {
        throw new TypeError('encodeC16: bitmaps must be an array');
    }
    const imageCount = bitmaps.length;

    // Compute header size up front (depends on per-image height).
    let headerSize = 4 /* pixelFormat */ + 2 /* imageCount */;
    for (const bmp of bitmaps) {
        const h = bmp.height | 0;
        headerSize += 4 /* offset */ + 2 /* width */ + 2 /* height */;
        // Each scanline after the first carries an additional uint32 offset.
        if (h > 1) headerSize += 4 * (h - 1);
    }

    // Encode each scanline of each bitmap. Track the cumulative byte offset
    // from the start of the file so the header can later record absolute
    // positions for every scanline.
    const encodedScanlines = [];                  // [imageIdx][scanlineIdx] -> Uint16Array
    const lineByteOffsets = [];                   // [imageIdx][scanlineIdx] -> absolute byte offset

    let cursor = headerSize;
    for (let i = 0; i < imageCount; i++) {
        const bmp = bitmaps[i];
        const width = bmp.width | 0;
        const height = bmp.height | 0;
        const pixelData = bmp.pixelData;
        if (!pixelData) {
            throw new Error(`encodeC16: bitmap ${i} missing pixelData`);
        }
        const expectedBytes = width * height * 4;
        if (pixelData.length !== expectedBytes) {
            throw new Error(
                `encodeC16: bitmap ${i} pixelData length ${pixelData.length} ` +
                `does not match width*height*4 = ${expectedBytes}`
            );
        }

        const lines = [];
        const offsets = [];
        for (let y = 0; y < height; y++) {
            const line = encodeScanline(pixelData, y, width);
            offsets.push(cursor);
            cursor += line.length * 2;   // each uint16 word = 2 bytes
            lines.push(line);
        }
        encodedScanlines.push(lines);
        lineByteOffsets.push(offsets);
    }

    const totalSize = cursor;
    const buffer = new ArrayBuffer(totalSize);
    const view = new DataView(buffer);
    const bytes = new Uint8Array(buffer);
    let pos = 0;

    // Header
    view.setUint32(pos, C16_PIXEL_FORMAT, true); pos += 4;
    view.setUint16(pos, imageCount, true);       pos += 2;

    for (let i = 0; i < imageCount; i++) {
        const bmp = bitmaps[i];
        const width = bmp.width | 0;
        const height = bmp.height | 0;
        const offsets = lineByteOffsets[i];
        // First-line offset, width, height
        view.setUint32(pos, offsets[0], true); pos += 4;
        view.setUint16(pos, width, true);      pos += 2;
        view.setUint16(pos, height, true);     pos += 2;
        // Additional scanline offsets
        for (let y = 1; y < height; y++) {
            view.setUint32(pos, offsets[y], true);
            pos += 4;
        }
    }

    // Body — append the encoded scanlines in order
    for (let i = 0; i < imageCount; i++) {
        const lines = encodedScanlines[i];
        for (const line of lines) {
            for (let k = 0; k < line.length; k++) {
                view.setUint16(pos, line[k], true);
                pos += 2;
            }
        }
    }

    if (pos !== totalSize) {
        throw new Error(`encodeC16: cursor mismatch ${pos} vs ${totalSize}`);
    }

    return buffer;
}

/**
 * Build a single 1×1 fully-transparent RGBA bitmap. Used by the composite
 * gallery assembly when a body-part slot is missing — the C++ engine still
 * needs that slot to occupy its 16 sprite indices so downstream parts land
 * at the right absolute offset.
 *
 * @returns {{width:number, height:number, pixelData:Uint8Array}}
 */
export function makeTransparentBitmap() {
    return { width: 1, height: 1, pixelData: new Uint8Array([0, 0, 0, 0]) };
}
