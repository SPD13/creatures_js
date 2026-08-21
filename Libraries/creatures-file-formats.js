/**
 * Creatures File Formats Library
 * 
 * A comprehensive JavaScript library for parsing Creatures game file formats
 * including sprite files (S16, C16, BLK) and genome files (GEN).
 * 
 * @version 1.0.0
 * @license MIT
 */

// ============================================================================
// CONSTANTS AND DEFINITIONS
// ============================================================================

// DNA3 and gene tokens from Genome.h
const DNA3TOKEN = 0x33616e64; // 'dna3' as 32-bit integer
const GENETOKEN = 0x656e6567; // 'gene' as 32-bit integer
const ENDGENOMETOKEN = 0x646e6567; // 'gend' as 32-bit integer

// Gene header offsets
const GH_TYPE = 4;
const GH_SUB = 5;
const GH_ID = 6;
const GH_GEN = 7;
const GH_SWITCHON = 8;
const GH_FLAGS = 9;
const GH_MUTABILITY = 10;
const GH_VARIANT = 11;
const GH_LENGTH = 12;

// Header gene offsets
const GO_GENUS = GH_LENGTH;
const GO_MUM = GO_GENUS + 1;
const GO_DAD = GO_MUM + 32;

// Mutability flags
const MUT = 1;
const DUP = 2;
const CUT = 4;
const LINKMALE = 8;
const LINKFEMALE = 16;
const MIGNORE = 32;

// Gene type definitions
const GENE_TYPES = {
    0: 'Brain Gene',
    1: 'Biochemistry Gene',
    2: 'Creature Gene',
    3: 'Organ Gene'
};

const BRAIN_SUBTYPES = {
    0: 'Lobe',
    1: 'Brain Organ',
    2: 'Tract'
};

const BIOCHEM_SUBTYPES = {
    0: 'Receptor',
    1: 'Emitter',
    2: 'Reaction',
    3: 'Half Life',
    4: 'Inject',
    5: 'Neuro Emitter'
};

const ORGAN_SUBTYPES = {
    0: 'Organ'
};

const CREATURE_SUBTYPES = {
    0: 'Stimulus',
    1: 'Genus',
    2: 'Appearance',
    3: 'Pose',
    4: 'Gait',
    5: 'Instinct',
    6: 'Pigment',
    7: 'Pigment Bleed',
    8: 'Expression'
};

// ============================================================================
// CORE BINARY READER CLASS
// ============================================================================

/**
 * Unified binary data reader with endianness support
 */
class CreaturesBinaryReader {
    /**
     * @param {ArrayBuffer} arrayBuffer - The binary data to read
     * @param {boolean} littleEndian - Whether to use little-endian byte order (default: true)
     */
    constructor(arrayBuffer, littleEndian = true) {
        this.dataView = new DataView(arrayBuffer);
        this.data = new Uint8Array(arrayBuffer);
        this.position = 0;
        this.littleEndian = littleEndian;
    }

    /**
     * Read a 32-bit unsigned integer
     * @returns {number}
     */
    readUint32() {
        if (this.position + 4 > this.dataView.byteLength) {
            throw new Error("Unexpected end of file while reading Uint32");
        }
        const value = this.dataView.getUint32(this.position, this.littleEndian);
        this.position += 4;
        return value;
    }

    /**
     * Read a 16-bit unsigned integer
     * @returns {number}
     */
    readUint16() {
        if (this.position + 2 > this.dataView.byteLength) {
            throw new Error("Unexpected end of file while reading Uint16");
        }
        const value = this.dataView.getUint16(this.position, this.littleEndian);
        this.position += 2;
        return value;
    }

    /**
     * Read a single byte
     * @returns {number|null}
     */
    readByte() {
        if (this.position >= this.data.length) {
            return null;
        }
        return this.data[this.position++];
    }

    /**
     * Read an integer (2 bytes, high byte first for genome format)
     * @returns {number|null}
     */
    readInt() {
        const highByte = this.readByte();
        const lowByte = this.readByte();
        if (highByte === null || lowByte === null) return null;
        return highByte * 256 + lowByte;
    }

    /**
     * Read a float value (byte / 255)
     * @returns {number|null}
     */
    readFloat() {
        const byte = this.readByte();
        if (byte === null) return null;
        return byte / 255;
    }

    /**
     * Read a signed float value ((byte / 124.0) - 1.0)
     * @returns {number|null}
     */
    readSignedFloat() {
        const byte = this.readByte();
        if (byte === null) return null;
        return (byte / 124.0) - 1.0;
    }

    /**
     * Read a 32-bit token
     * @returns {number|null}
     */
    readToken() {
        if (this.position + 4 > this.data.length) return null;
        const token = (this.data[this.position]) |
                     (this.data[this.position + 1] << 8) |
                     (this.data[this.position + 2] << 16) |
                     (this.data[this.position + 3] << 24);
        this.position += 4;
        return token;
    }

    /**
     * Peek at a token without advancing position
     * @returns {number}
     */
    peekToken() {
        if (this.position + 4 > this.data.length) {
            return 0;
        }
        return (this.data[this.position]) |
               (this.data[this.position + 1] << 8) |
               (this.data[this.position + 2] << 16) |
               (this.data[this.position + 3] << 24);
    }

    /**
     * Convert token to string representation
     * @param {number} token 
     * @returns {string}
     */
    tokenToString(token) {
        if (token === null) return '';
        return String.fromCharCode(
            token & 0xFF,
            (token >> 8) & 0xFF,
            (token >> 16) & 0xFF,
            (token >> 24) & 0xFF
        );
    }

    /**
     * Read a string of specified length
     * @param {number} length 
     * @returns {string}
     */
    readString(length) {
        let str = '';
        for (let i = 0; i < length; i++) {
            const charCode = this.readByte();
            if (charCode === null || charCode === 0) break;
            str += String.fromCharCode(charCode);
        }
        return str;
    }

    /**
     * Seek to a specific position in the buffer
     * @param {number} position 
     */
    seek(position) {
        if (position > this.dataView.byteLength) {
            throw new Error(`Seek position ${position} is out of bounds`);
        }
        this.position = position;
    }

    /**
     * Get current position
     * @returns {number}
     */
    getPosition() {
        return this.position;
    }

    /**
     * Get total buffer size
     * @returns {number}
     */
    getSize() {
        return this.data.length;
    }
}

// ============================================================================
// SPRITE FORMATS MODULE
// ============================================================================

/**
 * Sprite Formats module containing parsers for S16, C16, and BLK files
 */
const SpriteFormats = {
    
    /**
     * Factory method to create appropriate parser based on file extension
     * @param {ArrayBuffer} arrayBuffer 
     * @param {string} fileName 
     * @returns {S16Parser|C16Parser|BLKParser}
     */
    createParser(arrayBuffer, fileName) {
        const extension = fileName.toLowerCase().split('.').pop();
        switch (extension) {
            case 's16':
                return new S16Parser(arrayBuffer, fileName);
            case 'c16':
                return new C16Parser(arrayBuffer, fileName);
            case 'blk':
                return new BLKParser(arrayBuffer, fileName);
            default:
                throw new Error(`Unsupported sprite format: ${extension}`);
        }
    },

    /**
     * Convert 16-bit pixel data to RGBA format
     * @param {Uint16Array} pixelData 
     * @param {number} width 
     * @param {number} height 
     * @param {number} pixelFormat 
     * @param {boolean} isMacOSVariant 
     * @returns {Uint8ClampedArray}
     */
    convertToRgba(pixelData, width, height, pixelFormat, isMacOSVariant = false, opaque = false) {
        if (width * height === 0) return new Uint8ClampedArray(0);
        const rgbaData = new Uint8ClampedArray(width * height * 4);

        // Determine pixel format: 565 vs 555
        const is565 = (pixelFormat === 1 || pixelFormat === 3) && !isMacOSVariant;

        for (let i = 0; i < pixelData.length; i++) {
            const pixel = pixelData[i];
            let r, g, b;

            if (is565) {
                r = (pixel >> 11) & 0x1F;
                g = (pixel >> 5) & 0x3F;
                b = pixel & 0x1F;
                r = (r * 255) / 31;
                g = (g * 255) / 63;
                b = (b * 255) / 31;
            } else { // 555
                r = (pixel >> 10) & 0x1F;
                g = (pixel >> 5) & 0x1F;
                b = pixel & 0x1F;
                r = (r * 255) / 31;
                g = (g * 255) / 31;
                b = (b * 255) / 31;
            }

            const index = i * 4;
            rgbaData[index] = r;
            rgbaData[index + 1] = g;
            rgbaData[index + 2] = b;
            // Alpha: sprites (S16/C16) use RGB565 black (0x0000) as color-key
            // transparency (matches C++ DirectDraw SetColorKey / transparencyAware=true).
            // BLK backgrounds are blitted with transparencyAware=false in C++, so black
            // stays opaque. Callers pass `opaque=true` for BLK.
            rgbaData[index + 3] = opaque ? 255 : (pixel === 0 ? 0 : 255);
        }
        return rgbaData;
    }
};

/**
 * S16 (uncompressed sprite) parser
 */
class S16Parser {
    constructor(arrayBuffer, fileName) {
        this.reader = new CreaturesBinaryReader(arrayBuffer);
        this.fileName = fileName;
        this.gallery = {
            pixelFormat: 0,
            imageCount: 0,
            bitmaps: []
        };
    }

    parse() {
        this.gallery.pixelFormat = this.reader.readUint32();
        this.gallery.imageCount = this.reader.readUint16();

        // Read image headers
        const bitmapHeaders = [];
        for (let i = 0; i < this.gallery.imageCount; i++) {
            bitmapHeaders.push({
                offset: this.reader.readUint32(),
                width: this.reader.readUint16(),
                height: this.reader.readUint16()
            });
        }

        // Read sprite data
        for (let i = 0; i < this.gallery.imageCount; i++) {
            const header = bitmapHeaders[i];
            this.reader.seek(header.offset);
            
            const pixelCount = header.width * header.height;
            const pixelData = new Uint16Array(pixelCount);
            for (let j = 0; j < pixelCount; j++) {
                pixelData[j] = this.reader.readUint16();
            }
            
            this.gallery.bitmaps.push({
                width: header.width,
                height: header.height,
                // Keep the per-frame file data offset. The DS engine preserves these
                // in a cloned gallery (e.g. the hand cursor's frames serialise 214,
                // 3958, … = 6 + count*8 then += w*h*2) and its rendering of source
                // clones (cursor/tints) depends on them — a clone written with
                // offset 0 loads a few pixels off in C++. createFromSource copies
                // this; previously the parser dropped it after seeking pixels.
                offset: header.offset,
                pixelData: SpriteFormats.convertToRgba(pixelData, header.width, header.height, this.gallery.pixelFormat)
            });
        }

        return this.gallery;
    }
}

/**
 * C16 (compressed sprite) parser
 */
class C16Parser {
    constructor(arrayBuffer, fileName) {
        this.reader = new CreaturesBinaryReader(arrayBuffer);
        this.fileName = fileName;
        this.gallery = {
            pixelFormat: 0,
            imageCount: 0,
            bitmaps: []
        };
    }

    parse() {
        this.gallery.pixelFormat = this.reader.readUint32();
        this.gallery.imageCount = this.reader.readUint16();

        // Read image headers with line offsets
        const bitmapHeaders = [];
        for (let i = 0; i < this.gallery.imageCount; i++) {
            const header = {
                offset: this.reader.readUint32(),
                width: this.reader.readUint16(),
                height: this.reader.readUint16(),
                lineOffsets: []
            };

            // Read line offsets for decompression
            if (header.height > 1) {
                for (let j = 0; j < header.height - 1; j++) {
                    header.lineOffsets.push(this.reader.readUint32());
                }
            }
            bitmapHeaders.push(header);
        }

        // Decompress sprite data
        for (let i = 0; i < this.gallery.imageCount; i++) {
            const header = bitmapHeaders[i];
            const pixelData = this.decompressC16(header);
            
            this.gallery.bitmaps.push({
                width: header.width,
                height: header.height,
                // Keep the per-frame file data offset (see S16Parser note) so a
                // cloned gallery preserves it the way the DS engine does.
                offset: header.offset,
                pixelData: SpriteFormats.convertToRgba(pixelData, header.width, header.height, this.gallery.pixelFormat)
            });
        }

        return this.gallery;
    }

    decompressC16(header) {
        const { width, height, offset, lineOffsets } = header;
        const pixelCount = width * height;
        if (pixelCount === 0) return new Uint16Array(0);
        
        const pixelData = new Uint16Array(pixelCount);
        let pixelIndex = 0;

        for (let y = 0; y < height; y++) {
            // Seek to the start of the current scanline
            const lineOffset = (y === 0) ? offset : lineOffsets[y - 1];
            this.reader.seek(lineOffset);

            let currentWidth = 0;
            while (currentWidth < width) {
                const tag = this.reader.readUint16();
                const count = tag >> 1;
                const isLiteral = tag & 1;

                if (isLiteral) {
                    // Literal pixels
                    for (let i = 0; i < count; i++) {
                        if (pixelIndex < pixelCount) {
                            pixelData[pixelIndex++] = this.reader.readUint16();
                        }
                    }
                } else {
                    // Transparent pixels
                    for (let i = 0; i < count; i++) {
                        if (pixelIndex < pixelCount) {
                            pixelData[pixelIndex++] = 0; // Transparent
                        }
                    }
                }
                currentWidth += count;
            }
        }
        return pixelData;
    }
}

/**
 * BLK (background block) parser
 */
class BLKParser {
    constructor(arrayBuffer, fileName) {
        this.fileName = fileName;
        this.gallery = {
            pixelFormat: 0,
            imageCount: 0,
            bitmaps: [],
            blockWidth: 0,
            blockHeight: 0
        };
        
        // Check for macOS big-endian variant
        const testReader = new CreaturesBinaryReader(arrayBuffer, true);
        const pixelFormat = testReader.readUint32();
        const isMacOSVariant = pixelFormat === 0x1000000;
        
        this.reader = new CreaturesBinaryReader(arrayBuffer, !isMacOSVariant);
        this.isMacOSVariant = isMacOSVariant;
    }

    parse() {
        // Read BLK header
        this.gallery.pixelFormat = this.reader.readUint32();
        
        // Handle macOS variant detection
        if (this.isMacOSVariant) {
            // For macOS variant, pixel format is always RGB555
            this.gallery.pixelFormat = 0;
        }
        
        this.gallery.blockWidth = this.reader.readUint16();
        this.gallery.blockHeight = this.reader.readUint16();
        this.gallery.imageCount = this.reader.readUint16();
        
        // Validate that imageCount equals blockWidth * blockHeight
        const expectedCount = this.gallery.blockWidth * this.gallery.blockHeight;
        if (this.gallery.imageCount !== expectedCount) {
            throw new Error(`Invalid BLK file: image count (${this.gallery.imageCount}) does not match block dimensions (${this.gallery.blockWidth} × ${this.gallery.blockHeight} = ${expectedCount})`);
        }

        // Read image headers
        const bitmapHeaders = [];
        for (let i = 0; i < this.gallery.imageCount; i++) {
            const header = {
                offset: this.reader.readUint32() + 4, // BLK offsets are "minus 4"
                width: this.reader.readUint16(),
                height: this.reader.readUint16()
            };
            
            // Validate that all sprites are 128x128
            if (header.width !== 128 || header.height !== 128) {
                console.warn(`BLK sprite ${i + 1} has unexpected dimensions: ${header.width}x${header.height} (expected 128x128)`);
            }
            
            bitmapHeaders.push(header);
        }

        // Read sprite data
        for (let i = 0; i < this.gallery.imageCount; i++) {
            const header = bitmapHeaders[i];
            
            this.reader.seek(header.offset);
            const pixelCount = header.width * header.height;
            const pixelData = new Uint16Array(pixelCount);
            for (let j = 0; j < pixelCount; j++) {
                pixelData[j] = this.reader.readUint16();
            }
            
            this.gallery.bitmaps.push({
                width: header.width,
                height: header.height,
                // BLK backgrounds are opaque in C++ (blitted with transparencyAware=false),
                // so RGB565 black should stay opaque black — not be color-keyed to alpha 0
                // like sprite pixels. Pass opaque=true to force alpha 255 everywhere.
                pixelData: SpriteFormats.convertToRgba(pixelData, header.width, header.height, this.gallery.pixelFormat, this.isMacOSVariant, true)
            });
        }

        return this.gallery;
    }
}

// ============================================================================
// SVRULES PARSER
// ============================================================================

/**
 * SVRules parser for Creatures 3/DS neuronal processing rules
 */
class SVRulesParser {
    // C3/DS Opcodes (0-68) - Based on C++ SVRule.h enum OpCodes
    static OPCODES = {
        0: 'stop immediately', 1: 'blank operand', 2: 'store accumulator into', 3: 'load accumulator from',
        4: 'if equal to', 5: 'if not equal to', 6: 'if greater than', 7: 'if less than',
        8: 'if greater than or equal to', 9: 'if less than or equal to', 10: 'if zero', 11: 'if non zero',
        12: 'if positive', 13: 'if negative', 14: 'if non negative', 15: 'if non positive',
        16: 'add', 17: 'subtract', 18: 'subtract from', 19: 'multiply by', 20: 'divide by', 21: 'divide into',
        22: 'min into accumulator', 23: 'max into accumulator', 24: 'set tend rate', 25: 'tend accumulator to operand at tend rate',
        26: 'negate operand into accumulator', 27: 'load absolute value of operand into accumulator', 28: 'get distance to', 29: 'flip accumulator around',
        30: 'no operation', 31: 'set to spare neuron', 32: 'bound in zero one', 33: 'bound in minus one plus one',
        34: 'add and store in', 35: 'tend to and store in', 36: 'do nominal threshold', 37: 'do leakage rate',
        38: 'do rest state', 39: 'do input gain lo hi', 40: 'do persistence', 41: 'do signal noise',
        42: 'do winner takes all', 43: 'do set ST to LT rate', 44: 'do set LT to ST rate and do weight ST LT weight convergence',
        45: 'store abs into', 46: 'if zero stop', 47: 'if n zero stop', 48: 'if zero goto', 49: 'if n zero goto',
        50: 'divide and add to neuron input', 51: 'multiply and add to neuron input', 52: 'goto line',
        53: 'if less than stop', 54: 'if greater than stop', 55: 'if less than or equal stop', 56: 'if greater than or equal stop',
        57: 'set reward threshold', 58: 'set reward rate', 59: 'set reward chemical index', 60: 'set punishment threshold',
        61: 'set punishment rate', 62: 'set punishment chemical index', 63: 'preserve variable', 64: 'restore variable',
        65: 'preserve spare variable', 66: 'restore spare variable', 67: 'if negative goto', 68: 'if positive goto'
    };

    // Operand types (0-15) - Based on C++ SVRule.h enum OperandCodes  
    static OPERAND_TYPES = {
        0: 'accumulator', 1: 'input neuron', 2: 'dendrite', 3: 'neuron', 4: 'spare neuron',
        5: 'random', 6: 'chemical indexed by source neuron id', 7: 'chemical', 8: 'chemical indexed by destination neuron id',
        9: 'zero', 10: 'one', 11: 'value', 12: 'negative value', 13: 'value ten',
        14: 'value tenth', 15: 'value int'
    };

    // Opcodes that require operands
    static OPCODES_WITH_OPERANDS = new Set([
        2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23,
        24, 25, 26, 27, 28, 29, 34, 35, 36, 37, 38, 39, 40, 41, 42, 43, 44, 45, 48, 49,
        50, 51, 52, 53, 54, 55, 56, 57, 58, 59, 60, 61, 62, 63, 64, 65, 66, 67, 68
    ]);

    static parseRule(ruleBytes) {
        if (!ruleBytes || ruleBytes.length === 0) {
            return { instructions: [], error: 'Empty rule' };
        }

        const instructions = [];
        const genomeEmulator = new SVRuleGenomeEmulator(ruleBytes);

        try {
            // Parse 16 SVRule entries (based on C++ enum {length=16})
            for (let i = 0; i < 16; i++) {
                // Each entry uses 3 genome codons as per C++ InitFromGenome()
                const opCode = genomeEmulator.getCodonLessThan(69); // 0-68 opcodes
                const operandVariable = genomeEmulator.getCodonLessThan(16); // 0-15 operand types
                
                // Determine array index bound based on operand type
                const operandType = this.getOperandType(operandVariable);
                let arrayIndexBound = 256; // default
                if (operandType === 'operandTakesAVariableArrayIndex') {
                    arrayIndexBound = 8; // NUM_SVRULE_VARIABLES from C++
                }
                
                const arrayIndex = genomeEmulator.getCodonLessThan(arrayIndexBound);
                
                // Calculate float value using FloatDivisor=248 from C++
                let floatValue = arrayIndex / 248.0;
                if (floatValue > 1.0) floatValue = 1.0;

                const instruction = {
                    position: i,
                    opcode: opCode,
                    opcodeName: this.OPCODES[opCode] || `unknown(${opCode})`,
                    operandVariable,
                    arrayIndex,
                    floatValue
                };

                // Add operand details if operation reads/writes from operand
                const operationTakesNoOperand = this.operationTakesNoOperand(opCode);
                if (!operationTakesNoOperand) {
                    instruction.operand = {
                        type: operandVariable,
                        typeName: this.OPERAND_TYPES[operandVariable] || `unknown_type(${operandVariable})`,
                        arrayIndex,
                        floatValue
                    };
                }

                instruction.description = this.formatInstructionDescription(instruction);
                
                // Stop immediately opcode terminates the rule
                if (opCode === 0) {
                    instructions.push(instruction);
                    break;
                }
                
                instructions.push(instruction);
            }
        } catch (error) {
            return { instructions, error: `Parse error: ${error.message}` };
        }

        return { instructions, isEmpty: instructions.length === 0 };
    }

    static formatInstructionDescription(instruction) {
        const { opcode, opcodeName, operand } = instruction;
        if (!operand) return opcodeName;

        const operandDesc = this.formatOperandDescription(operand);
        
        switch (opcode) {
            case 2: return `store accumulator in ${operandDesc}`;
            case 3: return `load ${operandDesc} into accumulator`;
            case 16: return `add ${operandDesc} to accumulator`;
            case 17: return `subtract ${operandDesc} from accumulator`;
            default: return `${opcodeName} ${operandDesc}`;
        }
    }

    static formatOperandDescription(operand) {
        const { type, typeName, arrayIndex, floatValue } = operand;
        switch (type) {
            case 1: // input neuron variable
                return `<span class="variable-reference" data-variable-id="${arrayIndex}">input neuron[${arrayIndex}]</span>`;
            case 2: // dendrite variable
                return `<span class="variable-reference" data-variable-id="${arrayIndex + 8}">dendrite[${arrayIndex}]</span>`;
            case 3: // neuron variable
                return `<span class="variable-reference" data-variable-id="${arrayIndex}">neuron[${arrayIndex}]</span>`;
            case 4: // spare neuron variable
                return `<span class="variable-reference" data-variable-id="${arrayIndex}">spare neuron[${arrayIndex}]</span>`;
            case 6: // chemical indexed by source neuron id
                return `<span class="chemical-reference" data-chemical-id="${arrayIndex}">chemical[${arrayIndex}] (indexed by source)</span>`;
            case 7: // direct chemical reference
                return `<span class="chemical-reference" data-chemical-id="${arrayIndex}">chemical[${arrayIndex}]</span>`;
            case 8: // chemical indexed by destination neuron id
                return `<span class="chemical-reference" data-chemical-id="${arrayIndex}">chemical[${arrayIndex}] (indexed by dest)</span>`;
            case 11: return `${floatValue.toFixed(3)}`;
            case 12: return `${(-floatValue).toFixed(3)}`;
            case 13: return `${(floatValue * 10).toFixed(3)}`;
            case 14: return `${(floatValue / 10).toFixed(3)}`;
            case 15: return `${Math.round(floatValue * 248)}`;
            default: return arrayIndex > 0 ? `${typeName}[${arrayIndex}]` : typeName;
        }
    }

    static formatRuleAsHTML(parsedRule, title = 'SVRule') {
        if (!parsedRule || parsedRule.error) {
            return `<div class="svrule-section">
                <h5>${title}</h5>
                <div class="svrule-error">${parsedRule?.error || 'Unknown error'}</div>
            </div>`;
        }

        if (parsedRule.isEmpty) {
            return `<div class="svrule-section">
                <h5>${title}</h5>
                <div class="svrule-empty">No instructions found</div>
            </div>`;
        }

        let html = `<div class="svrule-section">
            <h5>${title}</h5>
            <div class="svrule-instructions">`;

        parsedRule.instructions.forEach((instruction, index) => {
            html += `<div class="svrule-instruction">
                <span class="svrule-line-number">${index + 1}:</span>
                <span class="svrule-opcode">${instruction.opcodeName}</span>`;
            
            if (instruction.operand) {
                html += ` <span class="svrule-operand">${this.formatOperandDescription(instruction.operand)}</span>`;
            }
            
            html += `</div>`;
        });

        html += `</div></div>`;
        return html;
    }

    // Helper methods for the new parsing logic
    static getOperandType(operandVariable) {
        // Based on C++ SVRule::OperandCodeType operandTypes[noOfOperands]
        const operandTypeMap = {
            0: 'operandTakesNoIndex', // accumulatorCode
            1: 'operandTakesAVariableArrayIndex', // inputNeuronCode
            2: 'operandTakesAVariableArrayIndex', // dendriteCode  
            3: 'operandTakesAVariableArrayIndex', // neuronCode
            4: 'operandTakesAVariableArrayIndex', // spareNeuronCode
            5: 'operandTakesNoIndex', // randomCode
            6: 'operandTakesAChemicalIndex', // chemicalIndexedBySourceNeuronIdCode
            7: 'operandTakesAChemicalIndex', // chemicalCode
            8: 'operandTakesAChemicalIndex', // chemicalIndexedByDestinationNeuronIdCode
            9: 'operandTakesNoIndex', // zeroCode
            10: 'operandTakesNoIndex', // oneCode
            11: 'operandIsAFloatValue', // valueCode
            12: 'operandIsAFloatValue', // negativeValueCode
            13: 'operandIsAFloatValue', // valueTenCode
            14: 'operandIsAFloatValue', // valueTenthCode
            15: 'operandIsAFloatValue'  // valueIntCode
        };
        return operandTypeMap[operandVariable] || 'operandTakesNoIndex';
    }

    static operationTakesNoOperand(opCode) {
        // Based on C++ SVRule::OpCodeType operationTypes[noOfOpCodes]
        // operationTakesNoOperand opcodes: 0, 30, 31, 42
        return opCode === 0 || opCode === 30 || opCode === 31 || opCode === 42;
    }
}

/**
 * Genome emulator for SVRule parsing - simulates C++ Genome::GetCodonLessThan()
 */
class SVRuleGenomeEmulator {
    constructor(ruleBytes) {
        this.data = ruleBytes;
        this.position = 0;
    }

    getCodonLessThan(max) {
        if (this.position >= this.data.length) {
            return 0; // Default when out of data
        }
        
        // Simple modulo implementation matching C++ behavior
        const codon = this.data[this.position++];
        return codon % max;
    }
}

// ============================================================================
// GENE DATA INTERPRETERS
// ============================================================================

/**
 * Gene data interpreters for converting raw bytes to human-readable information
 */
const GeneInterpreters = {

    /**
     * Interpret brain lobe gene data (type 0, subtype 0) - Version 3 format
     */
    interpretBrainLobe(data) {
        if (data.length < 112) return { error: "Insufficient data for version 3 brain lobe (expected 112 bytes)" };

        // Parse version 3 brain lobe format
        const lobeId = String.fromCharCode(data[0], data[1], data[2], data[3]).replace(/\0/g, '');
        const updateTime = (data[4] << 8) | data[5]; // uint16be
        const x = (data[6] << 8) | data[7]; // uint16be  
        const y = (data[8] << 8) | data[9]; // uint16be
        const width = data[10];
        const height = data[11];
        const red = data[12];
        const green = data[13];
        const blue = data[14];
        const wta = data[15];
        const tissue = data[16];
        const initRuleAlways = data[17];
        // Skip 7 bytes of padding (data[18-24])
        const initRule = Array.from(data.slice(25, 73)); // 48 bytes
        const updateRule = Array.from(data.slice(73, 121)); // 48 bytes

        // Parse SVRules
        const parsedInitRule = SVRulesParser.parseRule(initRule);
        const parsedUpdateRule = SVRulesParser.parseRule(updateRule);

        return {
            lobeId,
            updateTime,
            position: { x, y },
            dimensions: { width, height },
            color: { red, green, blue },
            properties: {
                wta: wta ? 'Winner Takes All' : 'Normal',
                tissue,
                initRuleAlways
            },
            rules: {
                initRule: initRule.map(b => `0x${b.toString(16).padStart(2, '0')}`).join(' '),
                updateRule: updateRule.map(b => `0x${b.toString(16).padStart(2, '0')}`).join(' ')
            },
            svRules: {
                initRule: parsedInitRule,
                updateRule: parsedUpdateRule
            }
        };
    },

    /**
     * Interpret brain organ gene data (type 0, subtype 1)
     */
    interpretBrainOrgan(data) {
        if (data.length < 5) return { error: "Insufficient data for brain organ" };

        return {
            clockRate: data[0],
            damageRate: data[1],
            lifeForce: data[2],
            biotickStart: data[3],
            atpDamageCoefficient: data[4]
        };
    },

    /**
     * Interpret brain tract gene data (type 0, subtype 2) - Version 3 format
     */
    interpretBrainTract(data) {
        if (data.length < 118) return { error: "Insufficient data for version 3 brain tract (expected 118 bytes)" };

        // Parse version 3 brain tract format according to GEN documentation
        const updateTime = (data[0] << 8) | data[1]; // uint16be
        const srcLobe = String.fromCharCode(data[2], data[3], data[4], data[5]).replace(/\0/g, '');
        const srcLowerBound = (data[6] << 8) | data[7]; // uint16be
        const srcUpperBound = (data[8] << 8) | data[9]; // uint16be
        const srcNumConnections = (data[10] << 8) | data[11]; // uint16be
        const destLobe = String.fromCharCode(data[12], data[13], data[14], data[15]).replace(/\0/g, '');
        const destLowerBound = (data[16] << 8) | data[17]; // uint16be
        const destUpperBound = (data[18] << 8) | data[19]; // uint16be
        const destNumConnections = (data[20] << 8) | data[21]; // uint16be
        
        // Connection properties
        const migrates = data[22];
        const numRandomConnections = data[23];
        const srcVar = data[24];
        const destVar = data[25];
        const initRuleAlways = data[26];
        
        // Skip 5 bytes of padding (data[27-31])
        const initRule = Array.from(data.slice(32, 80)); // 48 bytes
        const updateRule = Array.from(data.slice(80, 128)); // 48 bytes

        // Parse SVRules
        const parsedInitRule = SVRulesParser.parseRule(initRule);
        const parsedUpdateRule = SVRulesParser.parseRule(updateRule);

        return {
            updateTime,
            sourceConfig: {
                lobe: srcLobe,
                lowerBound: srcLowerBound,
                upperBound: srcUpperBound,
                numConnections: srcNumConnections,
                variable: srcVar
            },
            destinationConfig: {
                lobe: destLobe,
                lowerBound: destLowerBound,
                upperBound: destUpperBound,
                numConnections: destNumConnections,
                variable: destVar
            },
            connectionProperties: {
                migrates: migrates ? 'Yes' : 'No',
                numRandomConnections,
                initRuleAlways
            },
            rules: {
                initRule: initRule.map(b => `0x${b.toString(16).padStart(2, '0')}`).join(' '),
                updateRule: updateRule.map(b => `0x${b.toString(16).padStart(2, '0')}`).join(' ')
            },
            svRules: {
                initRule: parsedInitRule,
                updateRule: parsedUpdateRule
            }
        };
    },

    /**
     * Interpret biochemistry receptor gene data (type 1, subtype 0)
     */
    interpretBiochemReceptor(data) {
        if (data.length < 8) return { error: "Insufficient data for biochemistry receptor" };

        return {
            location: {
                organ: data[0],
                tissue: data[1],
                locus: data[2]
            },
            chemical: data[3],
            properties: {
                threshold: data[4],
                nominal: data[5],
                gain: data[6],
                flags: data[7]
            }
        };
    },

    /**
     * Interpret biochemistry emitter gene data (type 1, subtype 1)
     */
    interpretBiochemEmitter(data) {
        if (data.length < 8) return { error: "Insufficient data for biochemistry emitter" };

        return {
            location: {
                organ: data[0],
                tissue: data[1],
                locus: data[2]
            },
            chemical: data[3],
            properties: {
                threshold: data[4],
                rate: data[5],
                gain: data[6],
                flags: data[7]
            }
        };
    },

    /**
     * Interpret biochemistry reaction gene data (type 1, subtype 2)
     */
    interpretBiochemReaction(data) {
        if (data.length < 9) return { error: "Insufficient data for biochemistry reaction" };

        return {
            reactants: {
                r1: { amount: data[0], chemical: data[1] },
                r2: { amount: data[2], chemical: data[3] }
            },
            products: {
                p1: { amount: data[4], chemical: data[5] },
                p2: { amount: data[6], chemical: data[7] }
            },
            rate: data[8]
        };
    },

    /**
     * Interpret biochemistry initial concentration gene data (type 1, subtype 4)
     */
    interpretBiochemInitialConcentration(data) {
        if (data.length < 2) return { error: "Insufficient data for initial concentration" };

        return {
            chemical: data[0],
            amount: data[1]
        };
    },

    /**
     * Interpret biochemistry neuroemitter gene data (type 1, subtype 5) - Version 3 format
     */
    interpretBiochemNeuroemitter(data) {
        if (data.length < 15) return { error: "Insufficient data for neuroemitter (expected 15 bytes)" };

        return {
            neurons: [
                { lobe: data[0], neuron: data[1] },
                { lobe: data[2], neuron: data[3] },
                { lobe: data[4], neuron: data[5] }
            ],
            rate: data[6],
            chemicals: [
                { chemical: data[7], amount: data[8] },
                { chemical: data[9], amount: data[10] },
                { chemical: data[11], amount: data[12] },
                { chemical: data[13], amount: data[14] }
            ]
        };
    },

    /**
     * Interpret creature stimulus gene data (type 2, subtype 0)
     */
    interpretCreatureStimulus(data) {
        if (data.length < 12) return { error: "Insufficient data for creature stimulus" };

        return {
            stimulus: data[0],
            significance: data[1],
            input: data[2],
            intensity: data[3],
            features: data[4],
            chemicals: [
                { chemical: data[5], amount: data[6] },
                { chemical: data[7], amount: data[8] },
                { chemical: data[9], amount: data[10] },
                { chemical: data[11], amount: data[12] }
            ]
        };
    },

    /**
     * Interpret creature genus gene data (type 2, subtype 1)
     */
    interpretCreatureGenus(data) {
        if (data.length < 1) return { error: "Insufficient data for creature genus" };

        return {
            genus: data[0],
            parentInfo: data.length > 1 ? "Parent moniker data present" : "No parent data"
        };
    },

    /**
     * Interpret creature appearance gene data (type 2, subtype 2)
     */
    interpretCreatureAppearance(data) {
        if (data.length < 2) return { error: "Insufficient data for creature appearance" };

        return {
            bodyPart: data[0],
            variant: data[1],
            species: data.length > 2 ? data[2] : null
        };
    },

    /**
     * Interpret creature pose gene data (type 2, subtype 3)
     */
    interpretCreaturePose(data) {
        if (data.length < 1) return { error: "Insufficient data for creature pose" };

        const poseNumber = data[0];
        const poseString = data.slice(1).map(b => 
            String.fromCharCode(Math.max(0x20, Math.min(0x5A, b)))
        ).join('').replace(/[^A-Z?!]/g, 'X');

        return {
            poseNumber,
            poseString
        };
    },

    /**
     * Interpret creature gait gene data (type 2, subtype 4)
     */
    interpretCreatureGait(data) {
        if (data.length < 9) return { error: "Insufficient data for creature gait" };

        return {
            gaitNumber: data[0],
            poseSequence: data.slice(1, 9).map(pose => pose % 100)
        };
    },

    /**
     * Interpret creature instinct gene data (type 2, subtype 5)
     */
    interpretCreatureInstinct(data) {
        if (data.length < 9) return { error: "Insufficient data for creature instinct" };

        return {
            connections: [
                { lobe: data[0], cell: data[1] },
                { lobe: data[2], cell: data[3] },
                { lobe: data[4], cell: data[5] }
            ],
            action: data[6],
            reinforcement: {
                chemical: data[7],
                amount: data[8]
            }
        };
    },

    /**
     * Interpret creature pigment gene data (type 2, subtype 6)
     */
    interpretCreaturePigment(data) {
        if (data.length < 2) return { error: "Insufficient data for creature pigment" };

        return {
            pigment: data[0],
            amount: data[1]
        };
    },

    /**
     * Interpret creature pigment bleed gene data (type 2, subtype 7) - Version 3 format
     */
    interpretCreaturePigmentBleed(data) {
        if (data.length < 2) return { error: "Insufficient data for pigment bleed (expected 2 bytes)" };

        return {
            rotation: data[0],
            swap: data[1]
        };
    },

    /**
     * Interpret creature facial expression gene data (type 2, subtype 8) - Version 3 format
     */
    interpretCreatureFacialExpression(data) {
        if (data.length < 10) return { error: "Insufficient data for facial expression (expected 10 bytes)" };

        return {
            expression: data[0],
            padding: data[1], // Always zero according to documentation
            weight: data[2],
            drives: [
                { drive: data[3], amount: data[4] },
                { drive: data[5], amount: data[6] },
                { drive: data[7], amount: data[8] },
                { drive: data[9], amount: data.length > 9 ? data[10] : 0 }
            ]
        };
    },

    /**
     * Interpret organ gene data (type 3, subtype 0)
     */
    interpretOrgan(data) {
        if (data.length < 5) return { error: "Insufficient data for organ" };

        return {
            clockRate: data[0],
            damageRate: data[1],
            lifeForce: data[2],
            biotickStart: data[3],
            atpDamageCoefficient: data[4]
        };
    },

    /**
     * Main interpreter function that routes to appropriate sub-interpreter
     */
    interpretGeneData(type, subtype, data) {
        if (!data || data.length === 0) return null;

        try {
            switch (type) {
                case 0: // Brain genes
                    switch (subtype) {
                        case 0: return this.interpretBrainLobe(data);
                        case 1: return this.interpretBrainOrgan(data);
                        case 2: return this.interpretBrainTract(data);
                        default: return { type: "Brain", subtype, note: "Detailed interpretation not available" };
                    }
                case 1: // Biochemistry genes
                    switch (subtype) {
                        case 0: return this.interpretBiochemReceptor(data);
                        case 1: return this.interpretBiochemEmitter(data);
                        case 2: return this.interpretBiochemReaction(data);
                        case 4: return this.interpretBiochemInitialConcentration(data);
                        case 5: return this.interpretBiochemNeuroemitter(data);
                        default: return { type: "Biochemistry", subtype, note: "Detailed interpretation not available" };
                    }
                case 2: // Creature genes
                    switch (subtype) {
                        case 0: return this.interpretCreatureStimulus(data);
                        case 1: return this.interpretCreatureGenus(data);
                        case 2: return this.interpretCreatureAppearance(data);
                        case 3: return this.interpretCreaturePose(data);
                        case 4: return this.interpretCreatureGait(data);
                        case 5: return this.interpretCreatureInstinct(data);
                        case 6: return this.interpretCreaturePigment(data);
                        case 7: return this.interpretCreaturePigmentBleed(data);
                        case 8: return this.interpretCreatureFacialExpression(data);
                        default: return { type: "Creature", subtype, note: "Detailed interpretation not available" };
                    }
                case 3: // Organ genes
                    switch (subtype) {
                        case 0: return this.interpretOrgan(data);
                        default: return { type: "Organ", subtype, note: "Detailed interpretation not available" };
                    }
                default:
                    return { type: "Unknown", typeValue: type, subtype, note: "Unknown gene type" };
            }
        } catch (error) {
            return { error: `Failed to interpret gene data: ${error.message}` };
        }
    },

    /**
     * Format interpreted data as HTML for display
     */
    formatInterpretation(interpretation) {
        if (!interpretation) return "";
        if (interpretation.error) return `<span class="error">Error: ${interpretation.error}</span>`;

        let html = '<div class="gene-interpretation">';
        
        // Store reference to this context for use in nested function
        const self = this;
        
        function addField(label, value, indent = 0) {
            const indentClass = indent > 0 ? ` indent-${indent}` : '';
            if (typeof value === 'object' && value !== null) {
                html += `<div class="info-item${indentClass}"><span class="info-label">${label}:</span></div>`;
                Object.entries(value).forEach(([key, val]) => {
                    addField(key.charAt(0).toUpperCase() + key.slice(1), val, indent + 1);
                });
            } else if (Array.isArray(value)) {
                html += `<div class="info-item${indentClass}"><span class="info-label">${label}:</span></div>`;
                value.forEach((item, index) => {
                    if (typeof item === 'object') {
                        Object.entries(item).forEach(([key, val]) => {
                            addField(`${key.charAt(0).toUpperCase() + key.slice(1)} ${index + 1}`, val, indent + 1);
                        });
                    } else {
                        addField(`Item ${index + 1}`, item, indent + 1);
                    }
                });
            } else {
                // Format chemical IDs with tooltips
                const formattedValue = self.formatChemicalReferences(label, value);
                html += `<div class="info-item${indentClass}">
                    <span class="info-label">${label}:</span>
                    <span class="info-value">${formattedValue}</span>
                </div>`;
            }
        }

        Object.entries(interpretation).forEach(([key, value]) => {
            const label = key.charAt(0).toUpperCase() + key.slice(1).replace(/([A-Z])/g, ' $1');
            addField(label, value);
        });

        html += '</div>';
        return html;
    },

    /**
     * Format chemical and pose references with tooltip markup
     */
    formatChemicalReferences(label, value) {
        // Check if this field contains a chemical ID
        const labelLower = label.toLowerCase();
        const isChemicalField = labelLower.includes('chemical');
        const isPoseField = labelLower.includes('pose');
        
        const numValue = parseInt(value);
        
        // Check if value is a valid chemical ID (0-255)
        const isValidChemicalId = !isNaN(numValue) && numValue >= 0 && numValue <= 255;
        
        // Check if value is a valid pose ID (0-255, same range as chemicals)
        const isValidPoseId = !isNaN(numValue) && numValue >= 0 && numValue <= 255;
        
        if (isChemicalField && isValidChemicalId) {
            return `<span class="chemical-reference" data-chemical-id="${numValue}">chemical ${numValue}</span>`;
        }
        
        if (isPoseField && isValidPoseId) {
            return `<span class="pose-reference" data-pose-id="${numValue}">pose ${numValue}</span>`;
        }
        
        return value;
    }
};

// ============================================================================
// GENOME FORMATS MODULE
// ============================================================================

/**
 * Genome Formats module containing parsers for GEN files
 */
const GenomeFormats = {
    
    /**
     * Gene type definitions
     */
    GENE_TYPES,
    BRAIN_SUBTYPES,
    BIOCHEM_SUBTYPES,
    ORGAN_SUBTYPES,
    CREATURE_SUBTYPES,
    
    /**
     * Gene interpreters
     */
    GeneInterpreters,

    /**
     * Create a new genome parser
     * @param {ArrayBuffer} arrayBuffer 
     * @returns {GenomeParser}
     */
    createParser(arrayBuffer) {
        return new GenomeParser(arrayBuffer);
    }
};

/**
 * Genome (.gen) file parser
 */
class GenomeParser {
    constructor(arrayBuffer) {
        this.reader = new CreaturesBinaryReader(arrayBuffer);
        this.genes = [];
        this.genomeInfo = {};
    }

    parse() {
        try {
            // Check file header
            const header = this.reader.readToken();
            if (header !== DNA3TOKEN) {
                throw new Error(`Invalid GEN file header. Expected 'dna3', got '${this.reader.tokenToString(header)}'`);
            }

            this.genomeInfo.fileSize = this.reader.getSize();
            this.genomeInfo.dataSize = this.reader.getSize() - 4; // Excluding header

            // Parse genes
            while (this.reader.getPosition() < this.reader.getSize()) {
                const token = this.reader.peekToken();
                
                if (token === ENDGENOMETOKEN) {
                    this.reader.readToken(); // consume token
                    break;
                } else if (token === GENETOKEN) {
                    const gene = this.parseGene();
                    if (gene) {
                        this.genes.push(gene);
                    }
                } else {
                    // Skip unknown data
                    this.reader.readByte();
                }
            }

            this.genomeInfo.geneCount = this.genes.length;
            this.calculateStats();

            return {
                genomeInfo: this.genomeInfo,
                genes: this.genes
            };

        } catch (error) {
            throw new Error(`Failed to parse genome: ${error.message}`);
        }
    }

    parseGene() {
        const geneStart = this.reader.getPosition();
        
        // Read gene marker
        const marker = this.reader.readToken();
        if (marker !== GENETOKEN) {
            throw new Error(`Expected gene marker, got ${this.reader.tokenToString(marker)}`);
        }

        const gene = {
            position: geneStart,
            type: this.reader.readByte(),
            subtype: this.reader.readByte(),
            id: this.reader.readByte(),
            generation: this.reader.readByte(),
            switchOnTime: this.reader.readByte(),
            flags: this.reader.readByte(),
            mutability: this.reader.readByte(),
            variant: this.reader.readByte(),
            data: []
        };

        // Read gene data until next gene or end
        while (this.reader.getPosition() < this.reader.getSize()) {
            const nextToken = this.reader.peekToken();
            if (nextToken === GENETOKEN || nextToken === ENDGENOMETOKEN) {
                break;
            }
            const byte = this.reader.readByte();
            if (byte !== null) {
                gene.data.push(byte);
            }
        }

        // Add derived information
        gene.typeName = GENE_TYPES[gene.type] || `Unknown Type (${gene.type})`;
        gene.subtypeName = this.getSubtypeName(gene.type, gene.subtype);
        gene.dataLength = gene.data.length;
        gene.totalLength = this.reader.getPosition() - geneStart;
        gene.flagsDescription = this.describeMutabilityFlags(gene.flags);

        return gene;
    }

    getSubtypeName(type, subtype) {
        switch (type) {
            case 0: return BRAIN_SUBTYPES[subtype] || `Unknown Brain Subtype (${subtype})`;
            case 1: return BIOCHEM_SUBTYPES[subtype] || `Unknown Biochem Subtype (${subtype})`;
            case 2: return CREATURE_SUBTYPES[subtype] || `Unknown Creature Subtype (${subtype})`;
            case 3: return ORGAN_SUBTYPES[subtype] || `Unknown Organ Subtype (${subtype})`;
            default: return `Unknown Subtype (${subtype})`;
        }
    }

    describeMutabilityFlags(flags) {
        const descriptions = [];
        if (flags & MUT) descriptions.push('Mutable');
        if (flags & DUP) descriptions.push('Can Duplicate');
        if (flags & CUT) descriptions.push('Can be Cut');
        if (flags & LINKMALE) descriptions.push('Male Only');
        if (flags & LINKFEMALE) descriptions.push('Female Only');
        if (flags & MIGNORE) descriptions.push('Carried but not Expressed');
        
        return descriptions.length > 0 ? descriptions.join(', ') : 'None';
    }

    calculateStats() {
        const typeStats = {};
        let totalDataBytes = 0;

        this.genes.forEach(gene => {
            const typeName = gene.typeName;
            if (!typeStats[typeName]) {
                typeStats[typeName] = 0;
            }
            typeStats[typeName]++;
            totalDataBytes += gene.dataLength;
        });

        this.genomeInfo.typeStats = typeStats;
        this.genomeInfo.totalDataBytes = totalDataBytes;
        this.genomeInfo.averageGeneSize = this.genes.length > 0 ? 
            Math.round(totalDataBytes / this.genes.length) : 0;
    }
}

// ============================================================================
// GNO FORMATS MODULE
// ============================================================================

/**
 * GNO Formats module containing parsers for GNO files
 */
const GNOFormats = {
    
    /**
     * Create a new GNO parser
     * @param {ArrayBuffer} arrayBuffer 
     * @returns {GNOParser}
     */
    createParser(arrayBuffer) {
        return new GNOParser(arrayBuffer);
    }
};

/**
 * GNO (.gno) file parser for C3/DS format
 */
class GNOParser {
    constructor(arrayBuffer) {
        this.reader = new CreaturesBinaryReader(arrayBuffer, true); // GNO files use little-endian
        this.geneNotes = [];
        this.svNotes = [];
        this.fileInfo = {};
    }

    parse() {
        try {
            console.log(`[GNO Parser] Starting parse of ${this.reader.getSize()} byte file`);
            
            // Read file header for SV notes
            // This field indicates how many bytes to read for the count (usually 2)
            let bytesToRead1 = this.reader.readUint16();
            console.log(`[GNO Parser] SV notes section: bytes to read = ${bytesToRead1}`);
            
            const numSVNotes = this.reader.readUint16();
            this.fileInfo.numSVNotes = numSVNotes;
            console.log(`[GNO Parser] Number of SV notes declared: ${numSVNotes}`);
            
            let hasHint = this.checkForEncodingHint();
            
            // Parse SV notes
            for (let i = 0; i < numSVNotes; i++) {
                const notelPosition = this.reader.getPosition();
                const svNote = this.parseSVNote();
                //if (hasHint)
                 //   this.reader.seek(notelPosition+3001);
                //else
                 //   this.reader.seek(notelPosition+1801);
            }
            let svNotesWithData = this.svNotes.length;

            console.log(`[GNO Parser] SV notes with data found: ${svNotesWithData} out of ${numSVNotes} parsed`);
            
            // Read header for gene notes section
            // This field indicates how many bytes to read for the count (usually 2)
            let bytesToRead2 = this.reader.readUint16();
            while (bytesToRead2 == 0)
                bytesToRead2 = this.reader.readUint16();
            console.log(`[GNO Parser] Gene notes section: bytes to read = ${bytesToRead2}`);
            
            const numGeneNotes = this.reader.readUint16();
            this.fileInfo.numGeneNotes = numGeneNotes;
            console.log(`[GNO Parser] Number of gene notes declared: ${numGeneNotes}`);
            
            // Parse gene notes
            for (let i = 0; i < numGeneNotes; i++) {
                const geneNote = this.parseGeneNote();
                if (geneNote && geneNote.hasData) {
                    this.geneNotes.push(geneNote);
                }
            }
            
            console.log(`[GNO Parser] Gene notes with data found: ${this.geneNotes.length} out of ${numGeneNotes} parsed`);
            console.log(`[GNO Parser] Final counts: ${this.geneNotes.length} gene notes, ${this.svNotes.length} SV notes`);
            
            return {
                fileInfo: this.fileInfo,
                geneNotes: this.geneNotes,
                svNotes: this.svNotes
            };
            
        } catch (error) {
            console.error(`[GNO Parser] Parse error at position ${this.reader.getPosition()}:`, error);
            throw new Error(`Failed to parse GNO file: ${error.message}`);
        }
    }
    
    checkForEncodingHint() {
        // Save current position
        const originalPosition = this.reader.getPosition();
        
        try {
            // Check last 10 bytes for encoding hint
            if (this.reader.getSize() < 10) return false;
            
            this.reader.seek(this.reader.getSize() - 10);
            const hint1 = this.reader.readUint32();
            const hint2 = this.reader.readUint16();
            const hint3 = this.reader.readUint16();
            const hint4 = this.reader.readUint16();
            
            // Check for magic number sequence
            const hasHint = (hint1 === 999999) && (Math.abs(hint3 - hint2) === 1) && (hint4 === 2);
            
            // Restore position
            this.reader.seek(originalPosition);
            
            return hasHint;
        } catch (error) {
            // Restore position on error
            this.reader.seek(originalPosition);
            return false;
        }
    }
    
    parseSVNote() {
        // Read SV note structure
        const geneType = this.reader.readUint16();
        const geneSubType = this.reader.readUint16();
        const uniqueID = this.reader.readUint16();
        const ruleNumber = this.reader.readUint16();
        const padding = this.reader.readUint16(); // Always 0
        
        // Read 16 annotation strings into an array
        const annotations = [];
        let stringData = false;
        let annotationsData = ""
        for (let i = 0; i < 16; i++) {
            annotations.push(this.readString());
            if (annotations[i].length > 0) {
                stringData = true;
                annotationsData += annotations[i]+"; "
            }
        }
        
        const padding2 = this.reader.readUint16(); // Always 0
        const generalNotes = this.readString();
        
        // Only store if it has actual data
        if (uniqueID!=0 || generalNotes.length > 0 || stringData) {
            this.svNotes.push({
                geneType,
                geneSubType,
                uniqueID,
                ruleNumber,
                annotations,
                generalNotes
            });
        }
    }
    
    parseGeneNote() {
        const geneType = this.reader.readUint16();
        const geneSubType = this.reader.readUint16();
        const uniqueID = this.reader.readUint16();
        const padding = this.reader.readUint16(); // Always 0
        
        const caption = this.readString();
        const richTextAnnotation = this.readString();
        
        // Only return note if it has actual data
        const hasData = (geneType !== 0 || geneSubType !== 0 || uniqueID !== 0) && 
                       (caption.length > 0 || richTextAnnotation.length > 0);
        
        return {
            geneType,
            geneSubType,
            uniqueID,
            caption,
            richTextAnnotation,
            hasData
        };
    }
    
    readString() {
        const length = this.reader.readUint16();
        if (length === 0) return '';
        
        let str = '';
        for (let i = 0; i < length; i++) {
            const byte = this.reader.readByte();
            if (byte === null) break;
            str += String.fromCharCode(byte);
        }
        return str;
    }
    
    /**
     * Convert RTF text to basic HTML
     * This is a simple converter that handles basic RTF formatting
     */
    static convertRTFToHTML(rtfText) {
        if (!rtfText || rtfText.length === 0) return '';
        
        // Simple RTF to HTML conversion
        let html = rtfText;
        
        // Remove RTF header information
        html = html.replace(/\\rtf\d+\\ansi\\deff\d+/g, '');
        html = html.replace(/\\fonttbl[^}]*}/g, '');
        html = html.replace(/\\colortbl[^}]*}/g, '');
        
        // Convert basic formatting
        html = html.replace(/\\b\s/g, '<strong>');
        html = html.replace(/\\b0\s/g, '</strong>');
        html = html.replace(/\\i\s/g, '<em>');
        html = html.replace(/\\i0\s/g, '</em>');
        html = html.replace(/\\ul\s/g, '<u>');
        html = html.replace(/\\ul0\s/g, '</u>');
        
        // Convert paragraphs
        html = html.replace(/\\par\s*/g, '<br>');
        html = html.replace(/\\pard\s*/g, '');
        
        // Remove remaining RTF control words
        html = html.replace(/\\[a-z]+\d*\s?/g, '');
        html = html.replace(/[{}]/g, '');
        
        // Clean up extra whitespace
        html = html.replace(/\s+/g, ' ').trim();
        
        return html;
    }
}

// ============================================================================
// MNG FORMATS MODULE
// ============================================================================

/**
 * MNG Formats module containing parsers for MNG (Munge) music files
 */
const MNGFormats = {
    
    /**
     * Create a new MNG parser
     * @param {ArrayBuffer} arrayBuffer 
     * @returns {MNGParser}
     */
    createParser(arrayBuffer) {
        return new MNGParser(arrayBuffer);
    },

    /**
     * XOR descramble MNG script data
     * @param {Uint8Array} data - Encrypted script data
     * @returns {string} Decrypted script text
     */
    descrambleScript(data) {
        let key = 0x5; // Starting operand value
        const decrypted = new Uint8Array(data.length);
        
        for (let i = 0; i < data.length; i++) {
            decrypted[i] = data[i] ^ key;
            key = (key + 0xC1) & 0xFF; // Increment and wrap to byte
        }
        
        // Convert to string, filtering out null characters
        return String.fromCharCode(...decrypted).replace(/\0/g, '');
    },

    /**
     * Convert an MNG sample's stored data into a complete WAV ArrayBuffer.
     *
     * MNG sample layout (per Soundlib.cpp:OpenSound, "munged" branch): the
     * RIFF/WAVE/'fmt ' 16-byte file marker is stripped, but everything that
     * follows is preserved verbatim — fmt chunk size, PCMWAVEFORMAT fields,
     * the 'data' marker, the data size, then PCM samples. The C++ engine
     * reads the format dynamically from those bytes (it doesn't assume a
     * fixed sample rate or channel count), so we must do the same here.
     *
     * Previous versions of this method discarded the embedded format and
     * hard-coded mono/22050/16-bit, then prepended a fake 44-byte header in
     * front of the entire payload. That left ~28 bytes of header garbage at
     * the start of the "PCM data" section, producing a faint click at the
     * start of every sample, and would silently mis-render any MNG sample
     * that wasn't the assumed format.
     *
     * @param {Uint8Array} partialWav - MNG sample bytes (post-strip)
     * @returns {ArrayBuffer} Complete RIFF/WAVE file
     */
    createWavFromPartial(partialWav) {
        const src = new DataView(partialWav.buffer, partialWav.byteOffset, partialWav.byteLength);

        // Parse the embedded fmt chunk.
        const fmtSize = src.getUint32(0, true);
        if (fmtSize < 16 || fmtSize + 4 > partialWav.length) {
            throw new Error(`MNG sample: invalid fmt chunk size ${fmtSize}`);
        }
        const wFormatTag      = src.getUint16(4,  true);
        const nChannels       = src.getUint16(6,  true);
        const nSamplesPerSec  = src.getUint32(8,  true);
        const nAvgBytesPerSec = src.getUint32(12, true);
        const nBlockAlign     = src.getUint16(16, true);
        const wBitsPerSample  = src.getUint16(18, true);

        // Locate the 'data' chunk. Most samples have it immediately after the
        // 16-byte fmt body, but tolerate an extended fmt header by scanning.
        let dataOffset = 4 + fmtSize;
        const DATA_TAG = 0x61746164; // 'data' little-endian
        while (dataOffset + 8 <= partialWav.length) {
            const tag = src.getUint32(dataOffset, true);
            const sz  = src.getUint32(dataOffset + 4, true);
            if (tag === DATA_TAG) {
                dataOffset += 8;
                const pcmEnd = Math.min(dataOffset + sz, partialWav.length);
                const pcmLen = pcmEnd - dataOffset;
                return this._buildWav(
                    wFormatTag, nChannels, nSamplesPerSec,
                    nAvgBytesPerSec, nBlockAlign, wBitsPerSample,
                    partialWav.subarray(dataOffset, dataOffset + pcmLen)
                );
            }
            // Not a data chunk — skip it (chunks are 8-byte header + sz bytes,
            // padded to even length per RIFF spec).
            dataOffset += 8 + sz + (sz & 1);
        }
        throw new Error('MNG sample: no data chunk found');
    },

    /**
     * Build a minimal RIFF/WAVE file from raw PCM bytes and format fields.
     */
    _buildWav(wFormatTag, nChannels, nSamplesPerSec, nAvgBytesPerSec,
              nBlockAlign, wBitsPerSample, pcm) {
        const FMT_SIZE = 16;
        const HEADER_SIZE = 12 /* RIFF */ + 8 + FMT_SIZE /* fmt */ + 8 /* data */;
        const wav = new ArrayBuffer(HEADER_SIZE + pcm.length);
        const view = new DataView(wav);
        const u8 = new Uint8Array(wav);

        let p = 0;
        view.setUint32(p, 0x46464952, true); p += 4;            // 'RIFF'
        view.setUint32(p, HEADER_SIZE + pcm.length - 8, true); p += 4;
        view.setUint32(p, 0x45564157, true); p += 4;            // 'WAVE'
        view.setUint32(p, 0x20746D66, true); p += 4;            // 'fmt '
        view.setUint32(p, FMT_SIZE,          true); p += 4;
        view.setUint16(p, wFormatTag,        true); p += 2;
        view.setUint16(p, nChannels,         true); p += 2;
        view.setUint32(p, nSamplesPerSec,    true); p += 4;
        view.setUint32(p, nAvgBytesPerSec,   true); p += 4;
        view.setUint16(p, nBlockAlign,       true); p += 2;
        view.setUint16(p, wBitsPerSample,    true); p += 2;
        view.setUint32(p, 0x61746164, true); p += 4;            // 'data'
        view.setUint32(p, pcm.length,        true); p += 4;
        u8.set(pcm, p);

        return wav;
    }
};

/**
 * MNG (.mng) file parser for Creatures music files
 */
class MNGParser {
    constructor(arrayBuffer) {
        this.reader = new CreaturesBinaryReader(arrayBuffer, true); // MNG files use little-endian
        this.samples = [];
        this.script = '';
        this.sampleNames = [];
        this.fileInfo = {};
    }

    parse() {
        try {
            console.log(`[MNG Parser] Starting parse of ${this.reader.getSize()} byte file`);
            
            // Read file header
            const numSamples = this.reader.readUint32();
            this.fileInfo.numSamples = numSamples;
            console.log(`[MNG Parser] Number of samples: ${numSamples}`);
            
            const scriptPosition = this.reader.readUint32();
            const scriptLength = this.reader.readUint32();
            this.fileInfo.scriptPosition = scriptPosition;
            this.fileInfo.scriptLength = scriptLength;
            console.log(`[MNG Parser] Script: position=${scriptPosition}, length=${scriptLength}`);
            
            // Read sample headers
            const sampleHeaders = [];
            for (let i = 0; i < numSamples; i++) {
                const position = this.reader.readUint32();
                const length = this.reader.readUint32();
                sampleHeaders.push({ position, length, index: i });
                console.log(`[MNG Parser] Sample ${i}: position=${position}, length=${length}`);
            }
            
            // Read and decrypt script
            this.reader.seek(scriptPosition);
            const scriptData = new Uint8Array(scriptLength);
            for (let i = 0; i < scriptLength; i++) {
                scriptData[i] = this.reader.readByte();
            }
            
            this.script = MNGFormats.descrambleScript(scriptData);
            console.log(`[MNG Parser] Script decrypted, length: ${this.script.length} characters`);
            
            // Extract sample names from script
            this.extractSampleNames();
            
            // Read sample data
            for (let i = 0; i < numSamples; i++) {
                const header = sampleHeaders[i];
                this.reader.seek(header.position);
                
                // Read the partial WAV data
                const partialWavData = new Uint8Array(header.length);
                for (let j = 0; j < header.length; j++) {
                    partialWavData[j] = this.reader.readByte();
                }
                
                // Convert to complete WAV
                const fullWav = MNGFormats.createWavFromPartial(partialWavData);
                
                this.samples.push({
                    index: i,
                    name: this.sampleNames[i] || `Sample_${i}`,
                    data: fullWav,
                    originalLength: header.length
                });
            }
            
            console.log(`[MNG Parser] Successfully parsed ${this.samples.length} samples`);
            
            return {
                fileInfo: this.fileInfo,
                script: this.script,
                samples: this.samples,
                sampleNames: this.sampleNames
            };
            
        } catch (error) {
            console.error(`[MNG Parser] Parse error at position ${this.reader.getPosition()}:`, error);
            throw new Error(`Failed to parse MNG file: ${error.message}`);
        }
    }

    /**
     * Extract sample names from the script by finding Wave() declarations
     */
    extractSampleNames() {
        // \b word boundary prevents matching compound names like CosineWave(), SineWave()
        const waveRegex = /\bWave\s*\(\s*([^)]+)\s*\)/gi;
        const matches = [];
        let match;
        
        while ((match = waveRegex.exec(this.script)) !== null) {
            const sampleName = match[1].trim();
            if (!matches.includes(sampleName)) {
                matches.push(sampleName);
            }
        }
        
        this.sampleNames = matches;
        console.log(`[MNG Parser] Extracted sample names:`, this.sampleNames);
    }
}

// ============================================================================
// ATT FORMATS MODULE
// ============================================================================

/**
 * ATT (Attachment Table) file format constants
 * ATT files are ASCII text files containing attachment point coordinates
 * for creature body parts across all 16 views.
 */
const ATT_MAXVIEWS = 16;        // 4 directions × 4 angles
const ATT_MAX_BODY_LIMBS = 6;   // head, left leg, right leg, left arm, right arm, tail

/**
 * LimbData - Attachment point data structure for limbs
 * Matches C++ struct LimbData from Entity.h
 */
class LimbData {
    constructor(copyFrom = null) {
        this.startX = new Array(ATT_MAXVIEWS).fill(0);
        this.startY = new Array(ATT_MAXVIEWS).fill(0);
        this.endX = new Array(ATT_MAXVIEWS).fill(0);
        this.endY = new Array(ATT_MAXVIEWS).fill(0);
        
        if (copyFrom instanceof LimbData) {
            for (let i = 0; i < ATT_MAXVIEWS; i++) {
                this.startX[i] = copyFrom.startX[i];
                this.startY[i] = copyFrom.startY[i];
                this.endX[i] = copyFrom.endX[i];
                this.endY[i] = copyFrom.endY[i];
            }
        }
    }
    
    getStartPoint(view) {
        if (view < 0 || view >= ATT_MAXVIEWS) return { x: 0, y: 0 };
        return { x: this.startX[view], y: this.startY[view] };
    }
    
    getEndPoint(view) {
        if (view < 0 || view >= ATT_MAXVIEWS) return { x: 0, y: 0 };
        return { x: this.endX[view], y: this.endY[view] };
    }
    
    setStartPoint(view, x, y) {
        if (view < 0 || view >= ATT_MAXVIEWS) return;
        this.startX[view] = x;
        this.startY[view] = y;
    }
    
    setEndPoint(view, x, y) {
        if (view < 0 || view >= ATT_MAXVIEWS) return;
        this.endX[view] = x;
        this.endY[view] = y;
    }
    
    getOffset(view) {
        if (view < 0 || view >= ATT_MAXVIEWS) return { x: 0, y: 0 };
        return {
            x: this.endX[view] - this.startX[view],
            y: this.endY[view] - this.startY[view]
        };
    }
    
    clone() {
        return new LimbData(this);
    }
    
    hasData() {
        for (let i = 0; i < ATT_MAXVIEWS; i++) {
            if (this.startX[i] !== 0 || this.startY[i] !== 0 ||
                this.endX[i] !== 0 || this.endY[i] !== 0) {
                return true;
            }
        }
        return false;
    }
}

/**
 * BodyData - Attachment point data structure for body
 * Matches C++ struct BodyData from Entity.h
 */
class BodyData {
    constructor(copyFrom = null) {
        this.joinX = Array.from({ length: ATT_MAX_BODY_LIMBS }, () => 
            new Array(ATT_MAXVIEWS).fill(0)
        );
        this.joinY = Array.from({ length: ATT_MAX_BODY_LIMBS }, () => 
            new Array(ATT_MAXVIEWS).fill(0)
        );
        
        if (copyFrom instanceof BodyData) {
            for (let limb = 0; limb < ATT_MAX_BODY_LIMBS; limb++) {
                for (let view = 0; view < ATT_MAXVIEWS; view++) {
                    this.joinX[limb][view] = copyFrom.joinX[limb][view];
                    this.joinY[limb][view] = copyFrom.joinY[limb][view];
                }
            }
        }
    }
    
    getAttachmentPoint(limbIndex, view) {
        if (limbIndex < 0 || limbIndex >= ATT_MAX_BODY_LIMBS) return { x: 0, y: 0 };
        if (view < 0 || view >= ATT_MAXVIEWS) return { x: 0, y: 0 };
        return { 
            x: this.joinX[limbIndex][view], 
            y: this.joinY[limbIndex][view] 
        };
    }
    
    setAttachmentPoint(limbIndex, view, x, y) {
        if (limbIndex < 0 || limbIndex >= ATT_MAX_BODY_LIMBS) return;
        if (view < 0 || view >= ATT_MAXVIEWS) return;
        this.joinX[limbIndex][view] = x;
        this.joinY[limbIndex][view] = y;
    }
    
    clone() {
        return new BodyData(this);
    }
    
    hasData() {
        for (let limb = 0; limb < ATT_MAX_BODY_LIMBS; limb++) {
            for (let view = 0; view < ATT_MAXVIEWS; view++) {
                if (this.joinX[limb][view] !== 0 || this.joinY[limb][view] !== 0) {
                    return true;
                }
            }
        }
        return false;
    }
}

/**
 * ATT Formats module containing parsers for ATT (attachment table) files
 */
const ATTFormats = {
    
    MAXVIEWS: ATT_MAXVIEWS,
    MAX_BODY_LIMBS: ATT_MAX_BODY_LIMBS,
    
    /**
     * Create a new LimbData instance
     * @returns {LimbData}
     */
    createLimbData() {
        return new LimbData();
    },
    
    /**
     * Create a new BodyData instance
     * @returns {BodyData}
     */
    createBodyData() {
        return new BodyData();
    },
    
    /**
     * Parse whitespace-separated integers from text
     * @param {string} text - Text containing integers
     * @param {string} filename - Filename for error messages
     * @returns {number[]} Array of parsed integers
     */
    parseIntegers(text, filename = 'unknown') {
        if (!text || typeof text !== 'string') {
            throw new Error(`ATTFormats: Invalid input for file '${filename}'`);
        }
        
        const tokens = text.trim().split(/\s+/).filter(token => token.length > 0);
        const values = [];
        
        for (let i = 0; i < tokens.length; i++) {
            const value = parseInt(tokens[i], 10);
            if (isNaN(value)) {
                throw new Error(
                    `ATTFormats: Invalid integer '${tokens[i]}' at position ${i} in file '${filename}'`
                );
            }
            values.push(value);
        }
        
        return values;
    },
    
    /**
     * Parse LimbData from ATT file text (64 values: 16 views × 4 coordinates)
     * @param {string} text - ATT file content
     * @param {string} filename - Filename for error messages
     * @returns {LimbData} Parsed limb data
     */
    parseLimbData(text, filename = 'unknown') {
        const data = new LimbData();
        const values = this.parseIntegers(text, filename);
        
        const expectedCount = ATT_MAXVIEWS * 4;
        if (values.length < expectedCount) {
            throw new Error(
                `ATTFormats: LimbData file '${filename}' has insufficient data. ` +
                `Expected ${expectedCount} values, got ${values.length}`
            );
        }
        
        let index = 0;
        for (let view = 0; view < ATT_MAXVIEWS; view++) {
            const startX = values[index++];
            const startY = values[index++];
            const endX = values[index++];
            const endY = values[index++];
            
            data.setStartPoint(view, startX, startY);
            data.setEndPoint(view, endX, endY);
        }
        
        return data;
    },
    
    /**
     * Parse BodyData from ATT file text (192 values: 16 views × 6 limbs × 2 coordinates)
     * @param {string} text - ATT file content
     * @param {string} filename - Filename for error messages
     * @returns {BodyData} Parsed body data
     */
    parseBodyData(text, filename = 'unknown') {
        const data = new BodyData();
        const values = this.parseIntegers(text, filename);
        
        const expectedCount = ATT_MAXVIEWS * ATT_MAX_BODY_LIMBS * 2;
        if (values.length < expectedCount) {
            throw new Error(
                `ATTFormats: BodyData file '${filename}' has insufficient data. ` +
                `Expected ${expectedCount} values, got ${values.length}`
            );
        }
        
        let index = 0;
        for (let view = 0; view < ATT_MAXVIEWS; view++) {
            for (let limb = 0; limb < ATT_MAX_BODY_LIMBS; limb++) {
                const x = values[index++];
                const y = values[index++];
                data.setAttachmentPoint(limb, view, x, y);
            }
        }
        
        return data;
    },
    
    /**
     * Determine if a part number uses BodyData (part 1 = body)
     * @param {number} partNumber - Part number (0-16)
     * @returns {boolean} True if BodyData, false if LimbData
     */
    isBodyDataPart(partNumber) {
        return partNumber === 1;
    },
    
    /**
     * Parse ATT file based on part number (auto-detect format)
     * @param {string} text - ATT file content
     * @param {number} partNumber - Part number (0-16)
     * @param {string} filename - Filename for error messages
     * @returns {BodyData|LimbData} Parsed data
     */
    parseATT(text, partNumber, filename = 'unknown') {
        if (this.isBodyDataPart(partNumber)) {
            return this.parseBodyData(text, filename);
        } else {
            return this.parseLimbData(text, filename);
        }
    },
    
    /**
     * Validate ATT file content
     * @param {string} text - ATT file content
     * @param {number} partNumber - Part number (0-16)
     * @returns {{valid: boolean, error: string|null}} Validation result
     */
    validate(text, partNumber) {
        try {
            this.parseATT(text, partNumber, 'validation');
            return { valid: true, error: null };
        } catch (e) {
            return { valid: false, error: e.message };
        }
    }
};

// ============================================================================
// PRAY FORMATS MODULE
// ============================================================================

/**
 * PRAY Formats module containing parsers for PRAY files (agents, creatures, etc.)
 */
const PRAYFormats = {
    
    /**
     * Create a new PRAY parser
     * @param {ArrayBuffer} arrayBuffer 
     * @returns {PRAYParser}
     */
    createParser(arrayBuffer) {
        return new PRAYParser(arrayBuffer);
    }
};

/**
 * PRAY (.agent, .agents, .creature, etc.) file parser
 */
class PRAYParser {
    constructor(arrayBuffer) {
        this.reader = new CreaturesBinaryReader(arrayBuffer, true); // PRAY files use little-endian
        this.blocks = [];
        this.fileInfo = {};
    }

    parse() {
        try {
            console.log(`[PRAY Parser] Starting parse of ${this.reader.getSize()} byte file`);
            
            // Check file header - should be "PRAY"
            const header = this.reader.readString(4);
            if (header !== 'PRAY') {
                throw new Error(`Invalid PRAY file header. Expected 'PRAY', got '${header}'`);
            }
            
            this.fileInfo.fileSize = this.reader.getSize();
            this.fileInfo.headerSize = 4;
            
            // Parse blocks until end of file
            while (this.reader.getPosition() < this.reader.getSize()) {
                try {
                    const block = this.parseBlock();
                    if (block) {
                        this.blocks.push(block);
                    }
                } catch (blockError) {
                    console.warn(`[PRAY Parser] Error parsing block at position ${this.reader.getPosition()}:`, blockError);
                    break;
                }
            }
            
            console.log(`[PRAY Parser] Successfully parsed ${this.blocks.length} blocks`);
            
            return {
                fileInfo: this.fileInfo,
                blocks: this.blocks
            };
            
        } catch (error) {
            console.error(`[PRAY Parser] Parse error at position ${this.reader.getPosition()}:`, error);
            throw new Error(`Failed to parse PRAY file: ${error.message}`);
        }
    }

    parseBlock() {
        const blockStart = this.reader.getPosition();
        
        // Check if we have enough bytes for a block header (144 bytes total)
        if (this.reader.getPosition() + 144 > this.reader.getSize()) {
            return null; // End of file
        }
        
        // Read block header according to C++ PrayChunkHeader structure:
        // struct PrayChunkHeader {
        //     char type[4];      // 4 bytes
        //     char name[128];    // 128 bytes 
        //     int  size;         // 4 bytes
        //     int  usize;        // 4 bytes
        //     int  flags;        // 4 bytes
        // };
        
        // Read type (4 bytes)
        const type = this.reader.readString(4);
        if (type.length === 0 || type === '\0\0\0\0') {
            return null; // End of file
        }
        
        // Read name (128 bytes) - null terminated, null padded
        let name = '';
        for (let i = 0; i < 128; i++) {
            const byte = this.reader.readByte();
            if (byte === 0) {
                // Found null terminator, skip remaining padding
                for (let j = i + 1; j < 128; j++) {
                    this.reader.readByte(); // Skip padding bytes
                }
                break;
            }
            name += String.fromCharCode(byte);
        }
        
        // Read integers (little-endian)
        const size = this.reader.readUint32();
        const uncompressedSize = this.reader.readUint32();  
        const flags = this.reader.readUint32();
        
        const isCompressed = (flags & 1) !== 0;
        
        // Validate block header values
        if (size < 0 || size > this.reader.getSize() || 
            uncompressedSize < 0 || 
            (this.reader.getPosition() + size > this.reader.getSize())) {
            console.warn(`[PRAY Parser] Invalid block header detected: type='${type}', name='${name}', size=${size}, usize=${uncompressedSize}, flags=${flags}`);
            return null; // Skip this malformed block
        }
        
        console.log(`[PRAY Parser] Block: type='${type}', name='${name}', size=${size}, usize=${uncompressedSize}, flags=${flags}, compressed=${isCompressed}`);
        
        // Read block data
        const blockData = new Uint8Array(size);
        for (let i = 0; i < size; i++) {
            const byte = this.reader.readByte();
            if (byte === null) {
                throw new Error(`Unexpected end of file while reading block data`);
            }
            blockData[i] = byte;
        }
        
        // Handle decompression if needed
        let data = blockData;
        const finalSize = isCompressed ? uncompressedSize : size;
        
        if (isCompressed && size > 0) {
            try {
                // Decompress using pako (zlib implementation) 
                if (typeof pako !== 'undefined') {
                    data = pako.inflate(blockData);
                    console.log(`[PRAY Parser] Successfully decompressed block '${name}' from ${blockData.length} to ${data.length} bytes`);
                    
                    // Verify decompressed size matches expected
                    if (data.length !== uncompressedSize) {
                        console.warn(`[PRAY Parser] Decompressed size mismatch for '${name}': expected ${uncompressedSize}, got ${data.length}`);
                    }
                } else {
                    console.warn(`[PRAY Parser] Block '${name}' is compressed but pako not available - storing compressed data`);
                    data = blockData;
                }
            } catch (decompError) {
                console.error(`[PRAY Parser] Failed to decompress block '${name}':`, decompError);
                data = blockData; // Keep original data on decompression failure
            }
        }
        
        // Parse tag data for certain block types
        let parsedData = null;
        const tagBlockTypes = ['AGNT', 'DSAG', 'EGGS', 'EXPC', 'DSEX', 'SFAM', 'DFAM'];
        if (tagBlockTypes.includes(type)) {
            parsedData = this.parseTagData(data);
        }
        
        const block = {
            position: blockStart,
            type,
            name,
            size: finalSize, // Use final size (decompressed or original)
            uncompressedSize,
            flags,
            isCompressed,
            data,
            parsedData,
            totalSize: 144 + size // Header + original compressed size
        };
        
        return block;
    }

    parseTagData(data) {
        if (data.length === 0) return null;
        
        try {
            const reader = new CreaturesBinaryReader(data.buffer.slice(data.byteOffset, data.byteOffset + data.byteLength), true);
            
            // Read integer values
            const numIntegers = reader.readUint32();
            const integerValues = {};
            
            for (let i = 0; i < numIntegers; i++) {
                const nameLength = reader.readUint32();
                const name = reader.readString(nameLength);
                const value = reader.readUint32();
                integerValues[name] = value;
            }
            
            // Read string values
            const numStrings = reader.readUint32();
            const stringValues = {};
            
            for (let i = 0; i < numStrings; i++) {
                const nameLength = reader.readUint32();
                const name = reader.readString(nameLength);
                const valueLength = reader.readUint32();
                const value = reader.readString(valueLength);
                stringValues[name] = value;
            }
            
            return {
                integers: integerValues,
                strings: stringValues
            };
            
        } catch (error) {
            console.warn(`[PRAY Parser] Error parsing tag data:`, error);
            return null;
        }
    }

    /**
     * Get all blocks of a specific type
     * @param {string} type - Block type (e.g., 'AGNT', 'FILE')
     * @returns {Array} Array of blocks matching the type
     */
    getBlocksByType(type) {
        return this.blocks.filter(block => block.type === type);
    }

    /**
     * Get a specific block by name
     * @param {string} name - Block name
     * @returns {Object|null} Block with matching name or null
     */
    getBlockByName(name) {
        return this.blocks.find(block => block.name === name) || null;
    }

    /**
     * Get family/creature list metadata from GLST blocks (.family files)
     * @returns {Object|null} Parsed family metadata
     */
    getFamilyMetadata() {
        const glstBlock = this.blocks.find(block => block.type === 'GLST');
        if (!glstBlock) {
            return null;
        }
        
        // GLST blocks contain serialized creature archive data
        // Extract basic information from the block
        const familyName = glstBlock.name.replace('.glist.creature', '');
        
        // Parse GLST data to extract creature monikers
        const creatureMonikers = this.parseGLSTData(glstBlock.data);
        
        // Find associated CREA blocks (creature data)
        const creatureBlocks = this.blocks.filter(block => block.type === 'CREA');
        
        return {
            blockType: 'GLST',
            familyName,
            blockName: glstBlock.name,
            creatureCount: creatureMonikers.length,
            creatureMonikers,
            creatureBlocks: creatureBlocks.map(block => ({
                name: block.name,
                size: block.size,
                isCompressed: block.isCompressed
            })),
            hasEmbeddedCreatures: creatureBlocks.length > 0
        };
    }

    /**
     * Parse GLST block data to extract creature monikers
     * @param {Uint8Array} data - GLST block data
     * @returns {Array<string>} List of creature monikers
     */
    parseGLSTData(data) {
        if (!data || data.length === 0) return [];
        
        try {
            const reader = new CreaturesBinaryReader(data.buffer.slice(data.byteOffset, data.byteOffset + data.byteLength), true);
            const monikers = [];
            
            // The GLST format is a serialized C++ archive containing a vector of strings
            // We'll parse the basic structure to extract moniker strings
            
            // Read count of creatures (first 4 bytes is typically the vector size)
            const count = reader.readUint32();
            
            if (count > 0 && count < 100) { // Sanity check - families rarely have more than 100 creatures
                for (let i = 0; i < count; i++) {
                    try {
                        // Each string is prefixed with its length
                        const length = reader.readUint32();
                        if (length > 0 && length < 1024) { // Reasonable moniker length
                            const moniker = reader.readString(length);
                            if (moniker) {
                                monikers.push(moniker);
                            }
                        }
                    } catch (error) {
                        // If we can't parse a moniker, skip it
                        console.warn('[PRAY Parser] Error parsing GLST moniker:', error);
                        break;
                    }
                }
            }
            
            return monikers;
        } catch (error) {
            console.warn('[PRAY Parser] Error parsing GLST data:', error);
            return [];
        }
    }

    /**
     * Get agent metadata from AGNT or DSAG blocks
     * @returns {Object|null} Parsed agent metadata
     */
    getAgentMetadata() {
        const agentBlock = this.blocks.find(block => block.type === 'AGNT' || block.type === 'DSAG');
        if (!agentBlock || !agentBlock.parsedData) {
            return null;
        }
        
        const { integers, strings } = agentBlock.parsedData;
        
        return {
            blockType: agentBlock.type,
            name: agentBlock.name,
            agentType: integers['Agent Type'] || 0,
            description: strings['Agent Description'] || '',
            animationFile: strings['Agent Animation File'] || '',
            animationGallery: strings['Agent Animation Gallery'] || '',
            animationString: strings['Agent Animation String'] || '',
            scriptCount: integers['Script Count'] || 0,
            dependencyCount: integers['Dependency Count'] || 0,
            bioenergy: integers['Agent Bioenergy Value'] || 0,
            removeScript: strings['Remove script'] || '',
            dependencies: this.extractDependencies(integers, strings),
            scripts: this.extractScripts(integers, strings),
            allIntegers: integers,
            allStrings: strings
        };
    }

    extractDependencies(integers, strings) {
        const dependencies = [];
        const count = integers['Dependency Count'] || 0;
        
        for (let i = 1; i <= count; i++) {
            const dep = strings[`Dependency ${i}`];
            const category = integers[`Dependency Category ${i}`];
            
            if (dep) {
                dependencies.push({
                    name: dep,
                    category: category || 0,
                    categoryName: this.getDependencyCategoryName(category || 0)
                });
            }
        }
        
        return dependencies;
    }

    extractScripts(integers, strings) {
        const scripts = [];
        const count = integers['Script Count'] || 0;
        
        for (let i = 1; i <= count; i++) {
            const script = strings[`Script ${i}`];
            if (script) {
                scripts.push({
                    index: i,
                    content: script
                });
            }
        }
        
        return scripts;
    }

    getDependencyCategoryName(category) {
        const categories = {
            0: 'Sprite File',
            1: 'Sound File', 
            2: 'Sprite File',
            3: 'Genetics File',
            4: 'Body Data File',
            5: 'Overlay Data File',
            6: 'Background File',
            7: 'Catalogue File',
            8: 'Other File'
        };
        return categories[category] || `Category ${category}`;
    }

    /**
     * Get all embedded files
     * @returns {Array} Array of FILE blocks with file information
     */
    getEmbeddedFiles() {
        return this.blocks
            .filter(block => block.type === 'FILE')
            .map(block => ({
                name: block.name,
                size: block.size,
                data: block.data,
                extension: this.getFileExtension(block.name),
                type: this.getFileType(block.name)
            }));
    }

    getFileExtension(filename) {
        const lastDot = filename.lastIndexOf('.');
        return lastDot >= 0 ? filename.substring(lastDot + 1).toLowerCase() : '';
    }

    getFileType(filename) {
        const ext = this.getFileExtension(filename);
        const typeMap = {
            'c16': 'Compressed Sprite',
            's16': 'Sprite',
            'blk': 'Background Block',
            'wav': 'Sound',
            'mng': 'Music',
            'cos': 'CAOS Script',
            'catalogue': 'Catalogue',
            'gen': 'Genetics',
            'gno': 'Gene Notes'
        };
        return typeMap[ext] || 'Unknown';
    }
}

// ============================================================================
// EXPORTS
// ============================================================================

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    // Node.js environment
    module.exports = {
        CreaturesBinaryReader,
        SpriteFormats,
        GenomeFormats,
        GNOFormats,
        MNGFormats,
        ATTFormats,
        SVRulesParser,
        S16Parser,
        C16Parser,
        BLKParser,
        GenomeParser,
        GNOParser,
        MNGParser,
        LimbData,
        BodyData
    };
} else if (typeof window !== 'undefined') {
    // Browser environment
    window.CreaturesFileFormats = {
        CreaturesBinaryReader,
        SpriteFormats,
        GenomeFormats,
        GNOFormats,
        MNGFormats,
        PRAYFormats,
        ATTFormats,
        SVRulesParser,
        S16Parser,
        C16Parser,
        BLKParser,
        GenomeParser,
        GNOParser,
        MNGParser,
        PRAYParser,
        LimbData,
        BodyData
    };
}
