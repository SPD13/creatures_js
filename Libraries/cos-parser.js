/**
 * Creatures 3 - COS File Parser Library
 * 
 * Shared library for parsing Creatures Object Script (.cos) files.
 * Extracted from caos-catalog and adapted for use in both tools and main game.
 * 
 * Universal compatibility - works as ES6 module, CommonJS, AMD, and browser script
 */

class COSFileParser {
    constructor() {
        this.supportedExtensions = ['.cos'];
        this.maxFileSize = 5 * 1024 * 1024; // 5MB limit
    }

    /**
     * Parse a COS file content string
     * @param {string} content - The COS file content
     * @param {string} filename - Optional filename for error reporting
     * @returns {Object} Parsed content structure
     */
    parseFile(content, filename = 'unknown') {
        if (!content || typeof content !== 'string') {
            throw new Error('Invalid content provided to COS parser');
        }

        // DEBUG: Log file parsing start
        console.log(`[COS-Parser] DEBUG: Starting to parse file "${filename}" with ${content.length} characters`);
        console.log(`[COS-Parser] DEBUG: Content preview: "${content.substring(0, 100).replace(/\r?\n/g, '\\n')}${content.length > 100 ? '...' : ''}"`);

        const lines = content.split(/\r?\n/);
        const parsed = {
            filename: filename,
            sections: [],
            allLines: lines,
            hasRawCommands: false,
            rawCommandsExecuted: false,
            stats: {
                totalLines: lines.length,
                sections: {
                    inst: 0,
                    iscr: 0,
                    rscr: 0,
                    scrp: 0
                },
                comments: 0,
                emptyLines: 0
            }
        };

        let currentSection = null;
        let currentSectionLines = [];
        let implicitInstSection = null;

        lines.forEach((line, index) => {
            const trimmedLine = line.trim();
            const lineNumber = index + 1;

            // Count empty lines and comments for stats
            if (trimmedLine === '') {
                parsed.stats.emptyLines++;
            } else if (trimmedLine.startsWith('*')) {
                parsed.stats.comments++;
            }

            // Detect section headers
            if (trimmedLine.match(/^(iscr|rscr)$/i)) {
                // Finalize any implicit inst section
                if (implicitInstSection) {
                    parsed.sections.push(implicitInstSection);
                    implicitInstSection = null;
                }

                // Save previous section
                if (currentSection) {
                    currentSection.lines = currentSectionLines;
                    parsed.sections.push(currentSection);
                }

                // Start new section
                const sectionType = trimmedLine.toLowerCase();
                currentSection = {
                    type: sectionType,
                    title: this.getSectionTitle(sectionType),
                    startLine: lineNumber,
                    lines: []
                };
                currentSectionLines = [];
                parsed.stats.sections[sectionType]++;

            } else if (trimmedLine.match(/^scrp\s+/i)) {
                // Finalize any implicit inst section
                if (implicitInstSection) {
                    parsed.sections.push(implicitInstSection);
                    implicitInstSection = null;
                }

                // Save previous section
                if (currentSection) {
                    currentSection.lines = currentSectionLines;
                    parsed.sections.push(currentSection);
                }

                // Start event script section
                const match = trimmedLine.match(/^scrp\s+(\d+)\s+(\d+)\s+(\d+)\s+(\d+)/i);
                if (match) {
                    currentSection = {
                        type: 'scrp',
                        title: `Script ${match[1]} ${match[2]} ${match[3]} ${match[4]}`,
                        classifier: `${match[1]} ${match[2]} ${match[3]}`,
                        script_number: match[4],
                        startLine: lineNumber,
                        lines: []
                    };
                    currentSectionLines = [];
                    parsed.stats.sections.scrp++;
                } else {
                    throw new Error(`Invalid scrp format at line ${lineNumber}: ${line}`);
                }
            } else if (trimmedLine && !trimmedLine.startsWith('*')) {
                // This is a raw command outside of any section
                if (!currentSection && !implicitInstSection) {
                    // Create implicit installation section for raw commands
                    implicitInstSection = {
                        type: 'inst',
                        title: 'Raw Commands (Auto-wrapped)',
                        startLine: lineNumber,
                        isImplicit: true,
                        lines: []
                    };
                    parsed.hasRawCommands = true;
                    parsed.stats.sections.inst++;
                    
                    // DEBUG: Log when creating implicit section
                    console.log(`[COS-Parser] DEBUG: Creating implicit section for raw command at line ${lineNumber}: "${trimmedLine}"`);
                }
            }

            // Add line to current section or implicit section
            if (currentSection) {
                currentSectionLines.push({
                    number: lineNumber,
                    content: line,
                    parsed: this.parseLine(line)
                });
            } else if (implicitInstSection && trimmedLine && !trimmedLine.startsWith('*')) {
                // Add raw command to implicit inst section
                implicitInstSection.lines.push({
                    number: lineNumber,
                    content: line,
                    parsed: this.parseLine(line)
                });
            }

            // Check for section end
            if (trimmedLine.toLowerCase() === 'endm' && currentSection) {
                currentSection.lines = currentSectionLines;
                parsed.sections.push(currentSection);
                currentSection = null;
                currentSectionLines = [];
            }
        });

        // Handle any remaining sections
        if (currentSection) {
            currentSection.lines = currentSectionLines;
            parsed.sections.push(currentSection);
        }
        
        // PRESERVE SOURCE FILE ORDER: Insert implicit section at the BEGINNING of sections array
        // This ensures raw commands at the start of the file execute before SCRP/RSCR sections
        if (implicitInstSection) {
            parsed.sections.unshift(implicitInstSection); // Insert at beginning to preserve source order
            
            // DEBUG: Log section placement for debugging
            console.log(`[COS-Parser] DEBUG: File ${filename} - implicit section inserted at position 0 with ${implicitInstSection.lines.length} raw commands`);
            console.log(`[COS-Parser] DEBUG: Total sections after insertion: ${parsed.sections.length}`);
            console.log(`[COS-Parser] DEBUG: Section order: ${parsed.sections.map((s, i) => `${i}: ${s.type} (${s.isImplicit ? 'implicit' : 'explicit'})`).join(', ')}`);
        }

        return parsed;
    }

    /**
     * Scan a directory for Bootstrap folders and COS files
     * @param {string} basePath - Base path to scan
     * @returns {Promise<Object>} Bootstrap directory structure
     */
    async scanBootstrapDirectories(basePath) {
        const result = {
            basePath: basePath,
            switcherFound: false,
            switcherPath: null,
            otherDirectories: [],
            totalCosFiles: 0,
            loadingOrder: []
        };

        try {
            // Check for 000 Switcher directory first (priority)
            const switcherPath = `${basePath}/000 Switcher`;
            const switcherExists = await this.directoryExists(switcherPath);
            
            if (switcherExists) {
                result.switcherFound = true;
                result.switcherPath = switcherPath;
                result.loadingOrder.push({
                    path: switcherPath,
                    name: '000 Switcher',
                    priority: true
                });
            }

            // Scan for other bootstrap directories
            const directories = await this.getDirectories(basePath);
            const otherDirs = directories
                .filter(dir => dir !== '000 Switcher')
                .sort(); // Alphabetical order

            for (const dir of otherDirs) {
                const dirPath = `${basePath}/${dir}`;
                result.otherDirectories.push({
                    path: dirPath,
                    name: dir
                });
                
                result.loadingOrder.push({
                    path: dirPath,
                    name: dir,
                    priority: false
                });
            }

            // Count COS files in all directories
            for (const entry of result.loadingOrder) {
                const cosFiles = await this.getCosFiles(entry.path);
                entry.cosFiles = cosFiles;
                result.totalCosFiles += cosFiles.length;
            }

        } catch (error) {
            console.warn(`Bootstrap directory scan failed: ${error.message}`);
        }

        return result;
    }

    /**
     * Load and parse all COS files from a Bootstrap directory scan
     * @param {Object} directoryStructure - Result from scanBootstrapDirectories
     * @returns {Promise<Object>} Loaded and parsed COS files
     */
    async loadBootstrapFiles(directoryStructure) {
        const result = {
            loadedFiles: [],
            totalFiles: 0,
            totalSections: 0,
            errors: [],
            stats: {
                inst: 0,
                iscr: 0,
                rscr: 0,
                scrp: 0
            }
        };

        for (const directory of directoryStructure.loadingOrder) {
            try {
                const cosFiles = directory.cosFiles || [];
                
                for (const filename of cosFiles) {
                    try {
                        const filePath = `${directory.path}/${filename}`;
                        const content = await this.readFile(filePath);
                        const parsed = this.parseFile(content, filename);
                        
                        result.loadedFiles.push({
                            path: filePath,
                            filename: filename,
                            directory: directory.name,
                            priority: directory.priority,
                            parsed: parsed
                        });
                        
                        result.totalFiles++;
                        result.totalSections += parsed.sections.length;
                        
                        // Update stats
                        Object.keys(parsed.stats.sections).forEach(type => {
                            result.stats[type] += parsed.stats.sections[type];
                        });
                        
                    } catch (error) {
                        result.errors.push({
                            file: filename,
                            directory: directory.name,
                            error: error.message
                        });
                    }
                }
            } catch (error) {
                result.errors.push({
                    directory: directory.name,
                    error: `Failed to process directory: ${error.message}`
                });
            }
        }

        return result;
    }

    /**
     * Validate a COS file content
     * @param {string} content - File content to validate
     * @returns {Object} Validation result
     */
    validateCOSFile(content) {
        const validation = {
            valid: true,
            errors: [],
            warnings: []
        };

        if (!content || content.trim() === '') {
            validation.valid = false;
            validation.errors.push('File is empty');
            return validation;
        }

        const lines = content.split(/\r?\n/);
        let inSection = false;
        let sectionStack = [];

        lines.forEach((line, index) => {
            const trimmed = line.trim();
            const lineNumber = index + 1;

            // Check for section starts
            if (trimmed.match(/^(iscr|rscr|scrp\s+)/i)) {
                if (inSection) {
                    validation.warnings.push(`Section started without closing previous section at line ${lineNumber}`);
                }
                inSection = true;
                sectionStack.push(lineNumber);
            }

            // Check for section ends
            if (trimmed.toLowerCase() === 'endm') {
                if (!inSection) {
                    validation.warnings.push(`ENDM without matching section start at line ${lineNumber}`);
                } else {
                    inSection = false;
                    sectionStack.pop();
                }
            }

            // Validate scrp format
            if (trimmed.match(/^scrp\s+/i)) {
                const match = trimmed.match(/^scrp\s+(\d+)\s+(\d+)\s+(\d+)\s+(\d+)/i);
                if (!match) {
                    validation.errors.push(`Invalid scrp format at line ${lineNumber}: expected "scrp family genus species script_number"`);
                    validation.valid = false;
                }
            }
        });

        // Check for unclosed sections
        if (sectionStack.length > 0) {
            validation.warnings.push(`${sectionStack.length} unclosed section(s)`);
        }

        return validation;
    }

    /**
     * Build the space-form compound normalizers from the CAOS catalogue (window.CAOS_COMMANDS).
     *
     * Compound parents are described IN the catalogue (entry `compound: true` + `subCommands`),
     * generated from the engine's own caos.syntax — so there are no hard-coded parent/subcommand
     * lists here. Colon-form parents (NEW:, PRT:, NET:, …) are handled by the generic
     * `(\w+):\s+(\w+)` pass below; this only needs the space-form parents (FILE, MESG, PRAY, …),
     * for which we precompile one regex per parent (cached, keyed by the catalogue object so a
     * hot-reloaded catalogue rebuilds it).
     *
     * @returns {Array<{name:string, re:RegExp}>} space-form parents, or [] if no catalogue loaded
     */
    static _compoundNormalizers() {
        const cat = (typeof window !== 'undefined' && window.CAOS_COMMANDS) ? window.CAOS_COMMANDS : null;
        if (!cat) return [];
        if (COSFileParser._compoundSrc === cat && COSFileParser._compoundCache) return COSFileParser._compoundCache;
        const esc = s => String(s).replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
        const list = [];
        for (const arr of Object.values(cat)) {
            if (!Array.isArray(arr)) continue;
            for (const c of arr) {
                if (!c || c.compound !== true || !Array.isArray(c.subCommands) || !c.subCommands.length) continue;
                if (/:$/.test(c.name)) continue;  // colon-form parents handled by the generic pass
                // Longest sub first (so WRT+ wins over WRIT); trailing (?![\w+]) instead of \b so
                // a '+' suffix (WRT+) and longer real words (WRITTEN) are matched/rejected correctly.
                const subs = [...c.subCommands].sort((a, b) => b.length - a.length).map(esc).join('|');
                list.push({ name: c.name, re: new RegExp(`\\b${esc(c.name)}\\s+(${subs})(?![\\w+])`, 'gi') });
            }
        }
        COSFileParser._compoundSrc = cat;
        COSFileParser._compoundCache = list;
        return list;
    }

    /**
     * Shared CAOS tokenization logic for consistent parsing across all components
     * @param {string} line - Line to tokenize
     * @returns {Array} Array of tokens with text and type
     */
    static tokenizeCAOSLine(line) {
        const tokens = [];

        // Pre-process line to normalize compound commands (remove spaces between command and subcommand).
        // Colon-form parents (NEW: SIMP, NET: LINE) collapse via the generic pass; space-form parents
        // (FILE IOPE, MESG WRIT, PRAY BACK, …) are normalized from the catalogue-derived list above.
        // String literals must be left verbatim: normalizing inside them rewrites user text
        // (e.g. `"!net: ruso"` → `"!net:ruso"`, `"Time: 12"` → `"Time:12"`), which corrupts
        // scripts that are reconstructed from these tokens (binary-save script splitting).
        // Split on string literals and only normalize the non-string segments.
        const segments = line.split(/("(?:[^"\\]|\\.)*"|'(?:[^'\\]|\\.)*')/);
        for (let s = 0; s < segments.length; s += 2) {  // even indices = outside strings
            let seg = segments[s].replace(/(\w+):\s+(\w+)/gi, '$1:$2');  // NEW: SIMP -> new:simp
            for (const { name, re } of COSFileParser._compoundNormalizers()) {
                seg = seg.replace(re, (m, sub) => `${name.toLowerCase()}:${sub.toLowerCase()}`);
            }
            segments[s] = seg;
        }
        const normalizedLine = segments.join('');

        // Enhanced regex that includes bracket parameter support
        // Pattern \w+:[\w+]+ allows + symbol in compound commands (e.g., mesg:wrt+)
        // Number pattern: -?(?:\d+(?:\.\d+)?|\.\d+) handles both "1.5" and ".025" (floats without leading digit)
        const regex = /(\"(?:[^\"\\]|\\.)*\"|'(?:[^'\\]|\\.)*'|\[.*?\]|\w+:[\w+]+|\w+:|<=|>=|<>|-?(?:\d+(?:\.\d+)?|\.\d+)|\w+|[^\w\s\"'\[\]]|\s+)/g;
        let match;
        const rawTokens = [];

        // First pass: collect all raw tokens including whitespace
        while ((match = regex.exec(normalizedLine)) !== null) {
            rawTokens.push(match[0]);
        }

        // Filter out whitespace tokens for processing
        const nonWhitespaceTokens = rawTokens.filter(token => !/^\s+$/.test(token));

        // Second pass: process tokens and assign types
        for (let i = 0; i < nonWhitespaceTokens.length; i++) {
            const token = nonWhitespaceTokens[i];
            let type = 'normal';
            let finalToken = token;

            // Check for bracket parameters (byte strings)
            if (token.startsWith('[') && token.endsWith(']')) {
                type = 'byte_string';
            } else if (/^\w+:[\w+]+$/i.test(token)) {
                // This is a compound command, convert to lowercase
                // Pattern allows + symbol in sub-command part (e.g., mesg:wrt+)
                finalToken = token.toLowerCase();
                type = 'compound_command';
            } else if ((token.startsWith('"') && token.endsWith('"')) || 
                       (token.startsWith("'") && token.endsWith("'"))) {
                type = 'string';
            } else if (/^-?(?:\d+(?:\.\d+)?|\.\d+)$/.test(token)) {
                // Matches: 123, -123, 1.5, -1.5, .025, -.025 (floats without leading digit)
                type = 'number';
            } else if (/^(iscr|rscr|scrp|endm|reps|repe|doif|elif|endi|else|loop|untl|ever|slow|wait|next|enum|esee|etch|epas|subr|gsub|retn|or|and)$/i.test(token)) {
                type = 'keyword';
            } else if (/^(eq|ne|gt|lt|ge|le|=|<>|>|<|>=|<=)$/i.test(token)) {
                type = 'operator';
            } else if (token.endsWith(':')) {
                type = 'command';
            }

            tokens.push({ text: finalToken, type });
        }

        // Post-process: Detect labels after GSUB/SUBR keywords
        for (let i = 0; i < tokens.length; i++) {
            const token = tokens[i];
            // Check if this token is GSUB or SUBR
            if (token.type === 'keyword' && /^(gsub|subr)$/i.test(token.text)) {
                // Mark the next token as a label (if it exists and isn't already special)
                if (i + 1 < tokens.length) {
                    const nextToken = tokens[i + 1];
                    // Only mark as label if it's currently 'normal' type
                    if (nextToken.type === 'normal') {
                        nextToken.type = 'label';
                    }
                }
            }
        }

        return tokens;
    }

    /**
     * Parse a single line for syntax analysis
     * @param {string} line - Line to parse
     * @returns {Object} Parsed line information
     */
    parseLine(line) {
        const trimmed = line.trim();
        const result = {
            type: 'normal',
            tokens: [],
            classifier: null
        };

        // Comments
        if (trimmed.startsWith('*')) {
            result.type = 'comment';
            return result;
        }

        // Keywords (structural markers only - not executable commands)
        // CRITICAL FIX: Removed flow control commands from this early return
        // Flow control commands (doif, elif, else, endi) need to be tokenized to be executable
        // NOTE: SUBR, GSUB, RETN are NOT in this list - they need to be tokenized for execution
        // NOTE: LOCK removed - it's an executable command, not a structural keyword
        // NOTE: SLOW and WAIT removed - they are executable commands that modify CAOSMachine state
        // NOTE: REPS and REPE removed - they are executable flow control commands that need tokenization
        if (trimmed.match(/^(iscr|rscr|scrp|endm)$/i)) {
            result.type = 'keyword';
            return result;
        }

        // Tokenize line for detailed analysis using shared function
        // This ensures flow control commands get tokens and are included in executable lines
        result.tokens = COSFileParser.tokenizeCAOSLine(line);

        // Mark flow control keywords with special type (but they still have tokens)
        if (trimmed.match(/^(doif|elif|else|endi)$/i)) {
            result.type = 'flow_control';
        }

        // Check for classifiers (pattern: number number number)
        const words = trimmed.split(/\s+/);
        if (words.length >= 3) {
            const potentialClassifier = words.slice(0, 3);
            if (potentialClassifier.every(w => /^\d+$/.test(w))) {
                result.classifier = potentialClassifier.join(' ');
            }
        }

        return result;
    }

    /**
     * Get human-readable section title
     * @param {string} type - Section type
     * @returns {string} Human-readable title
     */
    getSectionTitle(type) {
        const titles = {
            'inst': 'Installation Script',
            'iscr': 'Installation Script',
            'rscr': 'Removal Script',
            'scrp': 'Event Script'
        };
        return titles[type] || 'Script Section';
    }

    // File system abstraction methods (to be implemented per environment)
    
    /**
     * Check if directory exists
     * @param {string} path - Directory path
     * @returns {Promise<boolean>} True if directory exists
     */
    async directoryExists(path) {
        // Browser implementation - check if we can fetch directory
        try {
            const response = await fetch(path);
            return response.ok;
        } catch {
            return false;
        }
    }

    /**
     * Get list of directories in a path
     * @param {string} path - Path to scan
     * @returns {Promise<Array>} Array of directory names
     */
    async getDirectories(path) {
        // Return the known directories in the proper order (already sorted by BootstrapManager)
        return [...this.knownDirectories];
    }

    /**
     * Get list of COS files in a directory
     * @param {string} path - Directory path
     * @returns {Promise<Array>} Array of COS filenames
     */
    async getCosFiles(path) {
        const dirName = path.split('/').pop();
        const files = this.knownFiles[dirName] || [];
        return [...files]; // Return a copy to prevent mutations
    }

    /**
     * Read file content
     * @param {string} path - File path
     * @returns {Promise<string>} File content
     */
    async readFile(path) {
        try {
            const response = await fetch(path);
            if (!response.ok) {
                throw new Error(`Failed to fetch file: ${response.status} ${response.statusText}`);
            }
            return await response.text();
        } catch (error) {
            throw new Error(`Failed to read file ${path}: ${error.message}`);
        }
    }
}

/**
 * Browser-specific implementation of COSFileParser with enhanced file system support
 */
class BrowserCOSFileParser extends COSFileParser {
    constructor(knownDirectories = [], knownFiles = {}) {
        super();
        // Pre-defined directory and file structure for browser environment
        this.knownDirectories = knownDirectories;
        this.knownFiles = knownFiles; // { directoryName: [filenames] }
    }

    /**
     * Set known directory and file structure
     * @param {Array} directories - Array of known directory names
     * @param {Object} files - Object mapping directory names to file arrays
     */
    setKnownStructure(directories, files) {
        this.knownDirectories = directories;
        this.knownFiles = files;
    }

    async directoryExists(path) {
        const dirName = path.split('/').pop();
        return this.knownDirectories.includes(dirName);
    }

    async getDirectories(path) {
        return [...this.knownDirectories];
    }

    async getCosFiles(path) {
        const dirName = path.split('/').pop();
        return this.knownFiles[dirName] || [];
    }
}

// Universal export handling for all module systems
(function() {
    // For browser globals (script tag usage)
    if (typeof window !== 'undefined') {
        window.COSFileParser = COSFileParser;
        window.BrowserCOSFileParser = BrowserCOSFileParser;
    }
    
    // For CommonJS
    if (typeof module !== 'undefined' && module.exports) {
        module.exports = {
            COSFileParser: COSFileParser,
            BrowserCOSFileParser: BrowserCOSFileParser
        };
        // Also support named exports for CommonJS
        module.exports.COSFileParser = COSFileParser;
        module.exports.BrowserCOSFileParser = BrowserCOSFileParser;
    }
    
    // For AMD
    if (typeof define === 'function' && define.amd) {
        define([], function() {
            return {
                COSFileParser: COSFileParser,
                BrowserCOSFileParser: BrowserCOSFileParser
            };
        });
    }
})();
