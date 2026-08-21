/**
 * Creatures Catalogue Parser Library
 * Extracted from catalogue-viewer tool for shared use between tools and main game
 * 
 * Parses and processes Creatures 3/DS catalogue files following the exact logic
 * from the original engine implementation.
 */

/**
 * Catalogue Parser Class
 * Replicates the original engine's catalogue parsing logic
 */
export class CatalogueParser {
    constructor() {
        this.nextFreeId = 0;
        this.tags = {};
        this.strings = {};
        this.errors = [];
        this.warnings = [];
    }

    /**
     * Parse a catalogue file
     * @param {string} text - File content
     * @param {string} filename - Filename for error reporting
     * @returns {Object} Parse results with tags, strings, errors, warnings
     */
    parseFile(text, filename) {
        const lines = text.split(/\r?\n/);
        let lineNumber = 0;
        let currentTag = null;
        let expectedStrings = -1;
        let stringCount = 0;

        try {
            for (let i = 0; i < lines.length; i++) {
                lineNumber = i + 1;
                let line = lines[i].trim();

                // Skip empty lines
                if (!line) continue;

                // Skip full-line comments
                if (line.startsWith('#') || line.startsWith('*')) continue;

                // Strip inline comments (comments after content on the same line)
                // We need to be careful not to strip comments inside quoted strings
                line = this.stripInlineComments(line);

                // Skip if line became empty after stripping comments
                if (!line.trim()) continue;

                // Check for TAG or ARRAY commands
                if (line.startsWith('TAG ') || line.startsWith('ARRAY ')) {
                    // Finalize previous tag if exists
                    if (currentTag) {
                        this.finalizeTag(currentTag, stringCount, filename, lineNumber);
                    }

                    const result = this.parseTagLine(line, filename, lineNumber);
                    if (result) {
                        currentTag = result.tagName;
                        expectedStrings = result.expectedStrings;
                        stringCount = 0;
                    }
                } else if (line.startsWith('"') && line.endsWith('"')) {
                    // String value
                    if (!currentTag) {
                        this.addError(`Unexpected string without tag at line ${lineNumber}`, filename, lineNumber);
                        continue;
                    }

                    const stringValue = this.parseString(line);
                    if (!this.tags[currentTag]) {
                        this.tags[currentTag] = {
                            id: this.nextFreeId,
                            strings: [],
                            arrayCount: expectedStrings,
                            sourceFile: filename,
                            lineNumber: lineNumber - stringCount - 1,
                            isOverride: false
                        };
                    }

                    this.tags[currentTag].strings.push(stringValue);
                    this.strings[this.nextFreeId] = stringValue;
                    this.nextFreeId++;
                    stringCount++;
                } else if (line) {
                    this.addError(`Syntax error: unexpected content "${line}"`, filename, lineNumber);
                }
            }

            // Finalize last tag
            if (currentTag) {
                this.finalizeTag(currentTag, stringCount, filename, lineNumber);
            }

        } catch (error) {
            this.addError(`Parse error: ${error.message}`, filename, lineNumber);
        }

        return {
            tags: this.tags,
            strings: this.strings,
            errors: this.errors,
            warnings: this.warnings
        };
    }

    /**
     * Parse a TAG or ARRAY line
     * @param {string} line - The line to parse
     * @param {string} filename - Filename for error reporting
     * @param {number} lineNumber - Line number for error reporting
     * @returns {Object|null} Parse result or null if error
     */
    parseTagLine(line, filename, lineNumber) {
        const isArray = line.startsWith('ARRAY ');
        const isOverride = line.includes('OVERRIDE');
        
        // Remove ARRAY/TAG and OVERRIDE keywords
        let remaining = line.replace(/^(ARRAY|TAG)\s+/, '').replace(/OVERRIDE\s+/, '');
        
        // Extract tag name (should be in quotes)
        const tagMatch = remaining.match(/^"([^"]+)"/);
        if (!tagMatch) {
            this.addError(`Invalid tag format: expected quoted tag name at line ${lineNumber}`, filename, lineNumber);
            return null;
        }

        const tagName = tagMatch[1];
        let expectedStrings = -1;

        if (isArray) {
            // Extract array count
            const countMatch = remaining.match(/"[^"]+"\s+(\d+)/);
            if (!countMatch) {
                this.addError(`ARRAY command requires count at line ${lineNumber}`, filename, lineNumber);
                return null;
            }
            expectedStrings = parseInt(countMatch[1]);
        }

        // Check for existing tag
        if (this.tags[tagName] && !isOverride) {
            this.addError(`Duplicate tag "${tagName}" at line ${lineNumber}`, filename, lineNumber);
            return null;
        }

        return {
            tagName,
            expectedStrings,
            isOverride
        };
    }

    /**
     * Strip inline comments from a line while preserving comments inside quoted strings
     * @param {string} line - The line to process
     * @returns {string} Line with inline comments removed
     */
    stripInlineComments(line) {
        let result = '';
        let insideQuotes = false;
        let escapeNext = false;
        
        for (let i = 0; i < line.length; i++) {
            const char = line[i];
            
            if (escapeNext) {
                result += char;
                escapeNext = false;
                continue;
            }
            
            if (char === '\\' && insideQuotes) {
                result += char;
                escapeNext = true;
                continue;
            }
            
            if (char === '"') {
                insideQuotes = !insideQuotes;
                result += char;
                continue;
            }
            
            // If we encounter a comment marker outside of quotes, stop processing
            if (!insideQuotes && (char === '#' || char === '*')) {
                // Check if this is at the start of a comment (preceded by whitespace or start of line)
                if (i === 0 || /\s/.test(line[i - 1])) {
                    break; // Stop processing the line here
                }
            }
            
            result += char;
        }
        
        return result.trim();
    }

    /**
     * Parse a quoted string, handling escape sequences
     * @param {string} line - The quoted string line
     * @returns {string} Parsed string content
     */
    parseString(line) {
        // Remove surrounding quotes and handle escape sequences
        let content = line.slice(1, -1);
        
        // Handle common escape sequences
        content = content.replace(/\\n/g, '\n');
        content = content.replace(/\\r/g, '\r');
        content = content.replace(/\\t/g, '\t');
        content = content.replace(/\\"/g, '"');
        content = content.replace(/\\\\/g, '\\');

        return content;
    }

    /**
     * Finalize a tag by validating array count
     * @param {string} tagName - Tag name
     * @param {number} actualCount - Actual string count
     * @param {string} filename - Filename for error reporting
     * @param {number} lineNumber - Line number for error reporting
     */
    finalizeTag(tagName, actualCount, filename, lineNumber) {
        const tag = this.tags[tagName];
        if (!tag) return;

        if (tag.arrayCount !== -1 && tag.arrayCount !== actualCount) {
            this.addError(
                `Array count mismatch for tag "${tagName}": expected ${tag.arrayCount}, got ${actualCount}`, 
                filename, 
                lineNumber
            );
        }

        // Set actual count if not specified
        if (tag.arrayCount === -1) {
            tag.arrayCount = actualCount;
        }
    }

    /**
     * Add an error to the error list
     * @param {string} message - Error message
     * @param {string} filename - Source filename
     * @param {number} lineNumber - Line number
     */
    addError(message, filename, lineNumber) {
        this.errors.push({
            message,
            filename,
            lineNumber,
            type: 'error'
        });
    }

    /**
     * Add a warning to the warning list
     * @param {string} message - Warning message
     * @param {string} filename - Source filename
     * @param {number} lineNumber - Line number
     */
    addWarning(message, filename, lineNumber) {
        this.warnings.push({
            message,
            filename,
            lineNumber,
            type: 'warning'
        });
    }

    /**
     * Reset parser state for reuse
     */
    reset() {
        this.nextFreeId = 0;
        this.tags = {};
        this.strings = {};
        this.errors = [];
        this.warnings = [];
    }
}

/**
 * Catalogue File Loader
 * Handles file loading and encoding detection for catalogue files
 */
export class CatalogueFileLoader {
    constructor() {
        this.parser = new CatalogueParser();
    }

    /**
     * Load and parse a catalogue file with proper encoding detection
     * @param {File} file - File object to load
     * @returns {Promise<Object>} Parse results
     */
    async loadFile(file) {
        return new Promise((resolve, reject) => {
            // Read file as binary first to analyze the encoding
            const binaryReader = new FileReader();
            
            binaryReader.onload = (e) => {
                try {
                    const bytes = new Uint8Array(e.target.result);
                    let text = '';
                    
                    // Detect encoding by analyzing byte patterns
                    const encoding = this.detectEncoding(bytes);
                    
                    // Convert bytes to text based on detected encoding
                    if (encoding === 'UTF-8') {
                        // Use TextDecoder for proper UTF-8 handling
                        const decoder = new TextDecoder('utf-8');
                        text = decoder.decode(bytes);
                    } else if (encoding === 'Windows-1252') {
                        // Windows-1252 character mapping for bytes 0x80-0x9F
                        const cp1252 = [
                            0x20AC, 0x0081, 0x201A, 0x0192, 0x201E, 0x2026, 0x2020, 0x2021,
                            0x02C6, 0x2030, 0x0160, 0x2039, 0x0152, 0x008D, 0x017D, 0x008F,
                            0x0090, 0x2018, 0x2019, 0x201C, 0x201D, 0x2022, 0x2013, 0x2014,
                            0x02DC, 0x2122, 0x0161, 0x203A, 0x0153, 0x009D, 0x017E, 0x0178
                        ];
                        
                        for (let i = 0; i < bytes.length; i++) {
                            const byte = bytes[i];
                            if (byte >= 0x80 && byte <= 0x9F) {
                                text += String.fromCharCode(cp1252[byte - 0x80]);
                            } else if (byte >= 0xA0) {
                                // Direct mapping for ISO-8859-1 extended characters
                                text += String.fromCharCode(byte);
                            } else {
                                text += String.fromCharCode(byte);
                            }
                        }
                    } else {
                        // ISO-8859-1 (Latin-1) - direct byte mapping
                        for (let i = 0; i < bytes.length; i++) {
                            text += String.fromCharCode(bytes[i]);
                        }
                    }

                    const result = this.parser.parseFile(text, file.name);
                    resolve(result);
                } catch (error) {
                    reject(error);
                }
            };

            binaryReader.onerror = () => reject(new Error(`Failed to read file: ${file.name}`));
            binaryReader.readAsArrayBuffer(file);
        });
    }

    /**
     * Detect character encoding based on byte patterns
     * @param {Uint8Array} bytes - File bytes
     * @returns {string} Detected encoding
     */
    detectEncoding(bytes) {
        // Check for UTF-8 BOM
        if (bytes.length >= 3 && bytes[0] === 0xEF && bytes[1] === 0xBB && bytes[2] === 0xBF) {
            return 'UTF-8';
        }

        // Count suspicious byte patterns
        let highByteCount = 0;
        let suspiciousPatterns = 0;
        
        for (let i = 0; i < Math.min(bytes.length, 1000); i++) { // Sample first 1000 bytes
            const byte = bytes[i];
            
            // Count high bytes (> 127)
            if (byte > 127) {
                highByteCount++;
                
                // Common garbled patterns in Windows-1252 interpreted as UTF-8
                // Look for sequences like 0xC3 followed by specific bytes
                if (byte === 0xC3 && i + 1 < bytes.length) {
                    const nextByte = bytes[i + 1];
                    if (nextByte >= 0x81 && nextByte <= 0xBF) {
                        suspiciousPatterns++;
                    }
                }
                
                // Common Windows-1252 characters that cause issues
                if (byte >= 0x80 && byte <= 0x9F) {
                    suspiciousPatterns++;
                }
            }
        }
        
        // If we have suspicious UTF-8-like patterns but they don't form valid UTF-8,
        // it's likely Windows-1252
        if (suspiciousPatterns > 0) {
            return 'Windows-1252';
        }
        
        // If we have high bytes but no suspicious patterns, try UTF-8
        if (highByteCount > 0) {
            // Test if it's valid UTF-8
            try {
                const decoder = new TextDecoder('utf-8', { fatal: true });
                decoder.decode(bytes);
                return 'UTF-8';
            } catch (e) {
                return 'Windows-1252';
            }
        }
        
        // Default to UTF-8 for ASCII-only content
        return 'UTF-8';
    }
}

// Make classes available for module import and global access
if (typeof window !== 'undefined') {
    window.CatalogueParser = CatalogueParser;
    window.CatalogueFileLoader = CatalogueFileLoader;
}
