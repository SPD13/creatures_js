/**
 * CAOS Preview Library - Shared CAOS syntax highlighting and parsing functionality
 * Enhanced with advanced parsing logic from caos-catalog tool for reuse across multiple tools
 */

class CAOSParser {
    constructor(commandCatalog = null) {
        this.commandCatalog = commandCatalog;
        this._compoundCache = null; // lazily-built compound-command map (see _compoundMap)
    }

    /**
     * Set the command catalog for enhanced command recognition
     * @param {Array} catalog - Array of CAOS commands with name, type, etc.
     */
    setCommandCatalog(catalog) {
        this.commandCatalog = catalog;
        this._compoundCache = null; // invalidate the derived compound map
    }

    /**
     * Compound-command structure, derived dynamically from the catalogue (NO hard-coded
     * lists). A catalogue entry that is a compound parent is marked `compound: true` and
     * carries `subCommands: [...]` (see data/caos-commands.json, generated from the engine's
     * caos.syntax). The map is keyed by the parent name WITHOUT any trailing colon so both
     * spellings match — the catalogue may name a parent "NEW:" (colon) or "MESG"/"FILE" (no
     * colon), while a written token may be "NEW:" or "MESG:".
     * @returns {Map<string, Set<string>>} PARENT (upper, no trailing ':') -> sub-command set
     */
    _compoundMap() {
        if (this._compoundCache) return this._compoundCache;
        const map = new Map();
        for (const c of (this.commandCatalog || [])) {
            if (!c || c.compound !== true || !Array.isArray(c.subCommands)) continue;
            const key = String(c.name || '').replace(/:$/, '').toUpperCase();
            if (!key) continue;
            const set = map.get(key) || new Set();
            for (const s of c.subCommands) set.add(String(s).toUpperCase());
            map.set(key, set);
        }
        this._compoundCache = map;
        return map;
    }

    /**
     * Parse COS file content into structured sections
     * @param {string} content - COS file content
     * @param {string} filename - Optional filename for context
     * @returns {Object} Parsed content with sections
     */
    parseContent(content, filename = 'unknown') {
        const lines = content.split(/\r?\n/);
        const parsed = {
            filename: filename,
            sections: [],
            allLines: lines
        };
        
        let currentSection = null;
        let currentSectionLines = [];
        let rawCommandsSection = null;
        let rawCommandsLines = [];
        
        lines.forEach((line, index) => {
            // IMPORTANT: Keep original line for content, only trim for logic checks
            const originalLine = line;  // Preserve original whitespace
            const trimmedLine = line.trim();
            const lineNumber = index + 1;
            
            // Detect section headers
            if (trimmedLine.match(/^(iscr|rscr)$/i)) {
                // Save any raw commands section before starting formal section
                if (rawCommandsSection && rawCommandsLines.length > 0) {
                    rawCommandsSection.lines = rawCommandsLines;
                    parsed.sections.push(rawCommandsSection);
                    rawCommandsSection = null;
                    rawCommandsLines = [];
                }
                
                // Save previous section
                if (currentSection) {
                    currentSection.lines = currentSectionLines;
                    parsed.sections.push(currentSection);
                }
                
                // Start new section
                currentSection = {
                    type: trimmedLine.toLowerCase(),
                    title: this.getSectionTitle(trimmedLine.toLowerCase()),
                    startLine: lineNumber,
                    lines: []
                };
                currentSectionLines = [];
            } else if (trimmedLine.match(/^scrp\s+/i)) {
                // Save any raw commands section before starting event script
                if (rawCommandsSection && rawCommandsLines.length > 0) {
                    rawCommandsSection.lines = rawCommandsLines;
                    parsed.sections.push(rawCommandsSection);
                    rawCommandsSection = null;
                    rawCommandsLines = [];
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
                }
            }
            
            // Add line to current formal section
            if (currentSection) {
                currentSectionLines.push({
                    number: lineNumber,
                    content: originalLine,  // Use original line with whitespace preserved
                    parsed: this.parseLine(originalLine)
                });
            } else {
                // Handle lines outside formal sections
                // Create raw commands section if it doesn't exist and we have any line (including empty ones)
                if (!rawCommandsSection) {
                    rawCommandsSection = {
                        type: 'raw',
                        title: 'Raw CAOS Commands',
                        startLine: lineNumber,
                        lines: []
                    };
                    rawCommandsLines = [];
                }
                
                // Add ALL lines (including empty ones) to preserve line numbering
                rawCommandsLines.push({
                    number: lineNumber,
                    content: originalLine,  // Use original line with whitespace preserved
                    parsed: this.parseLine(originalLine)
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
        
        // Handle any remaining raw commands
        if (rawCommandsSection && rawCommandsLines.length > 0) {
            rawCommandsSection.lines = rawCommandsLines;
            parsed.sections.push(rawCommandsSection);
        }
        
        return parsed;
    }

    /**
     * Get human-readable section title
     * @param {string} type - Section type
     * @returns {string} Section title
     */
    getSectionTitle(type) {
        const titles = {
            'inst': 'Installation Script',
            'iscr': 'Installation Script',
            'rscr': 'Removal Script'
        };
        return titles[type] || 'Script Section';
    }

    /**
     * Parse and render CAOS content with syntax highlighting
     * @param {string} content - CAOS script content
     * @param {Object} options - Rendering options
     * @returns {string} HTML with syntax highlighting
     */
    renderContent(content, options = {}) {
        // First, parse the content to get sections with preserved whitespace
        const parsed = this.parseContent(content, options.filename || 'unknown');
        let html = '';
        
        // If we have sections with preserved lines, use those
        if (parsed.sections && parsed.sections.length > 0) {
            // Flatten all lines from all sections while preserving order
            const allLines = [];
            for (const section of parsed.sections) {
                if (section.lines && Array.isArray(section.lines)) {
                    allLines.push(...section.lines);
                }
            }
            
            // Sort lines by line number to maintain proper order
            allLines.sort((a, b) => a.number - b.number);
            
            // Render each line with preserved whitespace
            allLines.forEach(line => {
                const renderedLine = this.renderLine(line, options);
                html += renderedLine;
            });
        } else {
            // Fallback: if no sections, use direct split (shouldn't happen normally)
            const lines = content.split(/\r?\n/);
            lines.forEach((line, index) => {
                const lineNumber = index + 1;
                const renderedLine = this.renderLine({
                    number: lineNumber,
                    content: line,
                    parsed: this.parseLine(line)
                }, options);
                html += renderedLine;
            });
        }
        
        return html;
    }


    /**
     * Check if a token is a compound command (ends with colon)
     * @param {string} token - Token to check
     * @returns {boolean} True if it's a compound command
     */
    isCompoundCommand(token) {
        // Dynamic: a token is a compound parent if the catalogue has a `compound: true`
        // entry for it. Trailing colon is normalised away so "MESG"/"MESG:" both match.
        return this._compoundMap().has(String(token).replace(/:$/, '').toUpperCase());
    }

    /**
     * Get valid sub-commands for a compound command
     * @param {string} command - The compound command (with colon)
     * @returns {Array} Array of valid sub-commands
     */
    getValidSubCommands(command) {
        // Dynamic: read the compound parent's `subCommands` list from the catalogue.
        return [...(this._compoundMap().get(String(command).replace(/:$/, '').toUpperCase()) || [])];
    }

    /**
     * Render a single line with syntax highlighting
     * @param {Object} line - Line object with number, content, and parsed data
     * @param {Object} options - Rendering options
     * @returns {string} HTML for the rendered line
     */
    renderLine(line, options = {}) {
        const showLineNumbers = options.showLineNumbers !== false;
        const enableClickableCommands = options.enableClickableCommands !== false;
        const lineNumberClass = options.lineNumberClass || 'caos-line-number';
        const lineClass = options.lineClass || 'caos-line';
        
        let html = `<div class="${lineClass}">`;
        
        if (showLineNumbers) {
            html += `<span class="${lineNumberClass}">${line.number}</span>`;
        }
        
        html += this.renderLineContent(line, { enableClickableCommands });
        html += '</div>';
        
        return html;
    }

    /**
     * Render the content portion of a line with syntax highlighting
     * @param {Object} line - Line object with parsed data
     * @param {Object} options - Rendering options
     * @returns {string} HTML content for the line
     */
    renderLineContent(line, options = {}) {
        const trimmed = line.content.trim();
        const enableClickableCommands = options.enableClickableCommands !== false;
        const enableClickableClassifications = options.enableClickableClassifications !== false;
        
        // Handle comments - preserve full line content including whitespace
        if (trimmed.startsWith('*')) {
            return `<span class="caos-comment">${this.escapeHtml(line.content)}</span>`;
        }
        
        // Handle keywords - preserve full line content including whitespace
        if (line.parsed.type === 'keyword') {
            return `<span class="caos-keyword">${this.escapeHtml(line.content)}</span>`;
        }
        
        // Render with enhanced syntax highlighting that preserves whitespace
        if (line.parsed.tokens && line.parsed.tokens.length > 0) {
            // Preserve the entire original line and apply highlighting in-place
            return this.renderTokensWithWhitespacePreservation(
                line.content,
                line.parsed.tokens, 
                line.parsed.classifications || [], 
                { 
                    enableClickableCommands, 
                    enableClickableClassifications,
                    command: line.parsed.command // Pass command definition for smart detection
                }
            );
        }
        
        return this.escapeHtml(line.content);
    }

    /**
     * Detect classification patterns in a line
     * @param {Array} words - Array of words from the line
     * @param {Object} result - Result object to populate with classifications
     */
    detectClassifications(words, result) {
        // Ensure classifications array exists
        if (!result.classifications) {
            result.classifications = [];
        }
        
        // Look for classification patterns throughout the line
        for (let i = 0; i <= words.length - 3; i++) {
            const potentialClassifier = words.slice(i, i + 3);
            
            // Check if all three are numbers (including 0 for wildcard)
            if (potentialClassifier.every(w => /^\\d+$/.test(w))) {
                const family = parseInt(potentialClassifier[0]);
                const genus = parseInt(potentialClassifier[1]);
                const species = parseInt(potentialClassifier[2]);
                
                // Validate ranges (0 is wildcard, 1-255 are valid)
                const isValidFamily = family === 0 || (family >= 1 && family <= 255);
                const isValidGenus = genus === 0 || (genus >= 1 && genus <= 255);
                const isValidSpecies = species === 0 || (species >= 1 && species <= 65535);
                
                if (isValidFamily && isValidGenus && isValidSpecies) {
                    result.classifications.push({
                        family: family,
                        genus: genus,
                        species: species,
                        startIndex: i,
                        endIndex: i + 2,
                        text: potentialClassifier.join(' ')
                    });
                }
            }
        }
        
        // Store the first classifier for backward compatibility
        if (result.classifications.length > 0) {
            result.classifier = result.classifications[0].text;
        }
    }

    /**
     * Render tokens with smart classification highlighting based on command parameter definitions
     * @param {Array} tokens - Array of tokens
     * @param {Array} classifications - Array of classification objects
     * @param {Object} options - Rendering options
     * @returns {string} HTML string with highlighted tokens
     */
    renderTokensWithClassifications(tokens, classifications, options = {}) {
        const { enableClickableCommands = true, enableClickableClassifications = true, command = null } = options;
        let html = '';
        
        // Smart classification detection: Only highlight when parameters are actually family/genus/species
        const smartClassifications = this.detectSmartClassifications(tokens, command);
        
        let tokenIndex = 0;
        while (tokenIndex < tokens.length) {
            const token = tokens[tokenIndex];
            
            // Check if this token starts a smart classification
            const classification = smartClassifications.find(c => c.tokenIndex === tokenIndex);
            
            if (classification && enableClickableClassifications) {
                // Render the classification triplet as a clickable unit
                const classificationText = `${classification.family} ${classification.genus} ${classification.species}`;
                html += `<span class="caos-number caos-clickable-classification" 
                              data-family="${classification.family}" 
                              data-genus="${classification.genus}" 
                              data-species="${classification.species}"
                              title="Click to see classification details: ${classificationText}">${classificationText}</span>`;
                
                // Skip the next 2 tokens (genus and species) since we rendered them together
                tokenIndex += 3;
                
                // Add spacing if there are more tokens
                if (tokenIndex < tokens.length) {
                    html += ' ';
                }
                continue;
            }
            
            // Regular token rendering
            const className = `caos-${token.type}`;
            if (token.type === 'command' && enableClickableCommands) {
                // For compound commands, store the sub-command part for catalog lookup
                const commandForLookup = token.text.includes(':') ? 
                    token.text.split(':')[1] : token.text;
                html += `<span class="${className} caos-clickable-command" data-command-name="${this.escapeHtml(commandForLookup)}" data-display-name="${this.escapeHtml(token.text)}">${this.escapeHtml(token.text)}</span>`;
            } else if (token.type === 'string') {
                // Special handling for string tokens - ensure quotes are displayed
                let displayText = token.text;
                if (!displayText.startsWith('"') && !displayText.startsWith("'")) {
                    displayText = `"${displayText}"`;
                }
                html += `<span class="${className}">${this.escapeHtml(displayText)}</span>`;
            } else {
                html += `<span class="${className}">${this.escapeHtml(token.text)}</span>`;
            }
            
            tokenIndex++;
            
            // Add spacing between tokens (except for the last token)
            if (tokenIndex < tokens.length) {
                const currentToken = token.text;
                const nextToken = tokens[tokenIndex];
                
                if (nextToken && !currentToken.match(/^[^\w\s\"]+$/) && !nextToken.text.match(/^[^\w\s\"]+$/)) {
                    html += ' ';
                }
            }
        }
        
        return html;
    }

    /**
     * Render tokens while preserving the original whitespace from the line
     * @param {string} originalLine - Original line content with whitespace
     * @param {Array} tokens - Array of tokens
     * @param {Array} classifications - Array of classification objects
     * @param {Object} options - Rendering options
     * @returns {string} HTML string with highlighted tokens and preserved whitespace
     */
    renderTokensWithWhitespacePreservation(originalLine, tokens, classifications, options = {}) {
        const { enableClickableCommands = true, enableClickableClassifications = true, command = null } = options;
        
        // If no tokens, return the escaped original line
        if (!tokens || tokens.length === 0) {
            const escaped = this.escapeHtml(originalLine);
            return escaped;
        }
        
        // Build a map of token positions in the original line
        let html = '';
        let lastPos = 0;
        
        // IMPORTANT: Preserve ALL leading whitespace before the first token, including tabs
        // Find the position of the first token to capture any leading whitespace
        if (tokens.length > 0) {
            const firstToken = tokens[0];
            let firstTokenPos = -1;
            
            // Try to find the first token in the original line
            // Skip over any leading whitespace (tabs/spaces) to find where the actual token starts
            const trimmedLine = originalLine.trimStart();
            const leadingWhitespaceLength = originalLine.length - trimmedLine.length;
            
            // Special handling for compound commands with possible spaces
            // Check both type and content since type might be changed to 'command' by enhanceParsedLine
            if (firstToken.type === 'compound_command' || 
                (firstToken.type === 'command' && firstToken.text.includes(':'))) {
                const parts = firstToken.text.split(':');
                if (parts.length === 2) {
                    // Create flexible regex that allows optional spaces: new:\s*simp
                    const flexiblePattern = new RegExp(`${parts[0]}:\\s*${parts[1]}`, 'i');
                    const match = trimmedLine.match(flexiblePattern);
                    if (match) {
                        firstTokenPos = leadingWhitespaceLength + match.index;
                    }
                }
            } else if (firstToken.type === 'command' || firstToken.type === 'keyword') {
                // Case-insensitive search for commands
                const lineLower = trimmedLine.toLowerCase();
                const tokenLower = firstToken.text.toLowerCase();
                const posInTrimmed = lineLower.indexOf(tokenLower);
                if (posInTrimmed !== -1) {
                    firstTokenPos = leadingWhitespaceLength + posInTrimmed;
                }
            } else {
                // Exact search for other tokens
                const posInTrimmed = trimmedLine.indexOf(firstToken.text);
                if (posInTrimmed !== -1) {
                    firstTokenPos = leadingWhitespaceLength + posInTrimmed;
                }
            }
            
            // If not found, try case-insensitive as fallback
            if (firstTokenPos === -1) {
                const lineLower = trimmedLine.toLowerCase();
                const tokenLower = firstToken.text.toLowerCase();
                const posInTrimmed = lineLower.indexOf(tokenLower);
                if (posInTrimmed !== -1) {
                    firstTokenPos = leadingWhitespaceLength + posInTrimmed;
                }
            }
            
            // Add any leading whitespace before the first token (including tabs!)
            if (firstTokenPos > 0) {
                const leadingWhitespace = originalLine.substring(0, firstTokenPos);
                const escapedWhitespace = this.escapeHtml(leadingWhitespace);
                html += escapedWhitespace;
                lastPos = firstTokenPos;
            }
        }
        
        // Smart classification detection
        const smartClassifications = this.detectSmartClassifications(tokens, command);
        
        for (let tokenIndex = 0; tokenIndex < tokens.length; tokenIndex++) {
            const token = tokens[tokenIndex];
            
            // Find the token in the original line (case-insensitive for commands)
            let tokenPos = -1;
            let actualTokenLength = token.text.length;
            
            // Check both type and content since type might be changed to 'command' by enhanceParsedLine
            if (token.type === 'compound_command' || 
                (token.type === 'command' && token.text.includes(':'))) {
                // Special handling for compound commands that may have spaces
                // Token is normalized like "new:simp" or "mesg:writ", but original might be "new: simp" or "mesg writ"
                const parts = token.text.split(':');
                if (parts.length === 2) {
                    // Create flexible regex that allows colon OR space: new[:\s]+simp
                    // This matches: "new:simp", "new: simp", "new simp", "mesg writ", etc.
                    const flexiblePattern = new RegExp(`${parts[0]}[:\\s]+${parts[1]}`, 'i');
                    const searchFrom = lastPos;
                    const remainingLine = originalLine.substring(searchFrom);
                    const match = remainingLine.match(flexiblePattern);
                    
                    if (match) {
                        tokenPos = searchFrom + match.index;
                        actualTokenLength = match[0].length; // Use actual length with spaces
                    }
                }
            } else if (token.type === 'command' || token.type === 'keyword') {
                // Case-insensitive search for commands
                const searchFrom = lastPos;
                const remainingLine = originalLine.substring(searchFrom).toLowerCase();
                const tokenLower = token.text.toLowerCase();
                const relativePos = remainingLine.indexOf(tokenLower);
                if (relativePos !== -1) {
                    tokenPos = searchFrom + relativePos;
                }
            } else {
                // Exact search for other tokens
                tokenPos = originalLine.indexOf(token.text, lastPos);
            }
            
            // If token not found, try without case sensitivity as fallback
            if (tokenPos === -1) {
                const searchFrom = lastPos;
                const remainingLine = originalLine.substring(searchFrom).toLowerCase();
                const tokenLower = token.text.toLowerCase();
                const relativePos = remainingLine.indexOf(tokenLower);
                if (relativePos !== -1) {
                    tokenPos = searchFrom + relativePos;
                }
            }
            
            // If still not found, append with a space (shouldn't happen with correct tokenization)
            if (tokenPos === -1) {
                if (html.length > 0 && !html.endsWith(' ')) {
                    html += ' ';
                }
                tokenPos = lastPos; // Use last position as fallback
            } else {
                // Add any whitespace or other characters before this token
                if (tokenPos > lastPos) {
                    html += this.escapeHtml(originalLine.substring(lastPos, tokenPos));
                }
            }
            
            // Check if this token starts a smart classification
            const classification = smartClassifications.find(c => c.tokenIndex === tokenIndex);
            
            if (classification && enableClickableClassifications && tokenIndex + 2 < tokens.length) {
                // Handle classification triplet
                const familyToken = tokens[tokenIndex];
                const genusToken = tokens[tokenIndex + 1];
                const speciesToken = tokens[tokenIndex + 2];
                
                // Find the end position of the species token
                let speciesEnd = tokenPos + familyToken.text.length;
                
                // Find genus position
                const genusPos = originalLine.indexOf(genusToken.text, speciesEnd);
                if (genusPos !== -1) {
                    speciesEnd = genusPos + genusToken.text.length;
                    // Find species position
                    const speciesPos = originalLine.indexOf(speciesToken.text, speciesEnd);
                    if (speciesPos !== -1) {
                        speciesEnd = speciesPos + speciesToken.text.length;
                    }
                }
                
                // Render the entire classification with original spacing preserved
                const classificationText = originalLine.substring(tokenPos, speciesEnd);
                html += `<span class="caos-number caos-clickable-classification" 
                              data-family="${classification.family}" 
                              data-genus="${classification.genus}" 
                              data-species="${classification.species}"
                              title="Click to see classification details: ${classification.family} ${classification.genus} ${classification.species}">${this.escapeHtml(classificationText)}</span>`;
                
                lastPos = speciesEnd;
                tokenIndex += 2; // Skip genus and species tokens
            } else {
                // Regular token rendering with bitmask tooltip support
                const className = `caos-${token.type}`;
                // Use the actual token length we calculated (important for compound commands with spaces)
                const actualTokenText = originalLine.substring(tokenPos, tokenPos + actualTokenLength);
                
                if (token.type === 'command' && enableClickableCommands) {
                    const commandForLookup = token.text.includes(':') ? 
                        token.text.split(':')[1] : token.text;
                    html += `<span class="${className} caos-clickable-command" data-command-name="${this.escapeHtml(commandForLookup)}" data-display-name="${this.escapeHtml(token.text)}">${this.escapeHtml(actualTokenText)}</span>`;
                } else if (token.type === 'string') {
                    // For strings, use the actual text from the line to preserve quotes
                    html += `<span class="${className}">${this.escapeHtml(actualTokenText)}</span>`;
                } else if (token.type === 'number' && command) {
                    // Check if this number is a bitmask parameter for the current command
                    // Calculate which parameter index this is (skip command token at index 0)
                    let paramIndex = 0;
                    for (let i = 1; i < tokenIndex; i++) {
                        if (tokens[i].type !== 'command') {
                            paramIndex++;
                        }
                    }
                    
                    // Get command name from tokens[0]
                    const commandName = tokens[0] ? tokens[0].text : null;
                    const numericValue = parseInt(token.text);
                    
                    // Try to get bitmask description
                    const bitmaskDesc = commandName ? this.getBitmaskDescription(commandName, paramIndex, numericValue) : null;
                    
                    if (bitmaskDesc) {
                        // Add tooltip for bitmask parameters
                        html += `<span class="${className}" title="${this.escapeHtml(bitmaskDesc)}">${this.escapeHtml(actualTokenText)}</span>`;
                    } else {
                        html += `<span class="${className}">${this.escapeHtml(actualTokenText)}</span>`;
                    }
                } else {
                    html += `<span class="${className}">${this.escapeHtml(actualTokenText)}</span>`;
                }
                
                lastPos = tokenPos + actualTokenLength;
            }
        }
        
        // Add any remaining content after the last token
        if (lastPos < originalLine.length) {
            html += this.escapeHtml(originalLine.substring(lastPos));
        }
        
        return html;
    }

    /**
     * Detect smart classifications based on command parameter definitions
     * @param {Array} tokens - Array of tokens
     * @param {Object} command - Command definition with parameterTypes
     * @returns {Array} Array of classification objects with token positions
     */
    detectSmartClassifications(tokens, command) {
        const classifications = [];
        
        if (!command || !command.parameters || tokens.length < 4) {
            return classifications; // Need at least command + 3 parameters
        }
        
        // Skip the first token (command) and look at parameters
        let paramIndex = 0;
        let tokenIndex = 1; // Start after command token
        
        while (tokenIndex <= tokens.length - 3) {
            // Check if the next 3 parameters are family, genus, species
            const param1 = command.parameters[paramIndex];
            const param2 = command.parameters[paramIndex + 1];
            const param3 = command.parameters[paramIndex + 2];
            
            if (param1 && param2 && param3 &&
                param1.name === 'family' && param1.type === 'family' &&
                param2.name === 'genus' && param2.type === 'genus' &&
                param3.name === 'species' && param3.type === 'species') {
                
                // Verify the tokens are actually numbers
                const familyToken = tokens[tokenIndex];
                const genusToken = tokens[tokenIndex + 1];
                const speciesToken = tokens[tokenIndex + 2];
                
                if (familyToken && genusToken && speciesToken &&
                    familyToken.type === 'number' && 
                    genusToken.type === 'number' && 
                    speciesToken.type === 'number') {
                    
                    const family = parseInt(familyToken.text);
                    const genus = parseInt(genusToken.text);
                    const species = parseInt(speciesToken.text);
                    
                    // Validate classifier ranges
                    if ((family === 0 || (family >= 1 && family <= 255)) &&
                        (genus === 0 || (genus >= 1 && genus <= 255)) &&
                        (species === 0 || (species >= 1 && species <= 65535))) {
                        
                        classifications.push({
                            family: family,
                            genus: genus,
                            species: species,
                            tokenIndex: tokenIndex, // Position where this classification starts
                            paramIndex: paramIndex
                        });
                    }
                }
            }
            
            // Move to next parameter
            paramIndex++;
            tokenIndex++;
        }
        
        return classifications;
    }

    /**
     * Parse a single line for syntax analysis
     * @param {string} line - Line to parse
     * @returns {Object} Parsed line information
     */
    parseLine(line) {
        // Create an instance of COSFileParser if it doesn't exist
        if (!this.cosFileParser) {
            if (typeof window.COSFileParser === 'undefined') {
                throw new Error('COSFileParser is required but not available. Please ensure cos-parser.js is loaded first.');
            }
            this.cosFileParser = new window.COSFileParser();
        }
        
        // Get basic parsing from cos-parser.js
        const basicParsed = this.cosFileParser.parseLine(line);
        
        // Enhance the parsed result with command catalog and classification detection
        return this.enhanceParsedLine(basicParsed, line);
    }

    /**
     * Enhance the basic parsed line with command catalog detection and classification highlighting
     * @param {Object} basicParsed - Basic parsed result from cos-parser.js
     * @param {string} line - Original line text
     * @returns {Object} Enhanced parsed result
     */
    enhanceParsedLine(basicParsed, line) {
        // Start with the basic parsed result
        const enhanced = { ...basicParsed };
        let foundCommand = null;
        
        // Enhance tokens with command catalog detection if available
        if (this.commandCatalog && basicParsed.tokens && Array.isArray(basicParsed.tokens)) {
            enhanced.tokens = basicParsed.tokens.map(token => {
                // Handle regular commands
                if (token.type === 'normal') {
                    const command = this.commandCatalog.find(cmd => 
                        cmd.name && cmd.name.toLowerCase() === token.text.toLowerCase()
                    );
                    if (command) {
                        foundCommand = command; // Store the command definition
                        return { ...token, type: 'command' };
                    }
                }
                // Handle compound commands (new:simp, mesg:writ, etc.)
                else if (token.type === 'compound_command') {
                    // Extract the sub-command part for catalog lookup
                    const commandName = token.text.includes(':') ? 
                        token.text.split(':')[1] : token.text;
                    
                    // Try to find command by sub-command name first (e.g., "wrt+")
                    let command = this.commandCatalog.find(cmd => 
                        cmd.name && cmd.name.toLowerCase() === commandName.toLowerCase()
                    );
                    
                    // If not found, try matching the full compound command with space (e.g., "mesg wrt+")
                    if (!command && token.text.includes(':')) {
                        const parts = token.text.split(':');
                        const fullCommandWithSpace = `${parts[0]} ${parts[1]}`;
                        command = this.commandCatalog.find(cmd => 
                            cmd.name && cmd.name.toLowerCase() === fullCommandWithSpace.toLowerCase()
                        );
                    }
                    
                    if (command) {
                        foundCommand = command; // Store the command definition
                        return { ...token, type: 'command' };
                    }
                }
                
                return token;
            });
            
            // Store the command definition for smart classification detection
            if (foundCommand) {
                enhanced.command = foundCommand;
            }
        }
        
        // Add classification detection (keep the fallback for backwards compatibility)
        enhanced.classifications = [];
        this.detectClassifications(line.trim().split(/\s+/), enhanced);
        
        return enhanced;
    }

    /**
     * Detect classification patterns in a line
     * @param {Array} words - Array of words from the line
     * @param {Object} result - Result object to populate with classifications
     */
    detectClassifications(words, result) {
        // Look for classification patterns throughout the line
        for (let i = 0; i <= words.length - 3; i++) {
            const potentialClassifier = words.slice(i, i + 3);
            
            // Check if all three are numbers (including 0 for wildcard)
            if (potentialClassifier.every(w => /^\d+$/.test(w))) {
                const family = parseInt(potentialClassifier[0]);
                const genus = parseInt(potentialClassifier[1]);
                const species = parseInt(potentialClassifier[2]);
                
                // Validate ranges (0 is wildcard, 1-255 are valid)
                const isValidFamily = family === 0 || (family >= 1 && family <= 255);
                const isValidGenus = genus === 0 || (genus >= 1 && genus <= 255);
                const isValidSpecies = species === 0 || (species >= 1 && species <= 65535);
                
                if (isValidFamily && isValidGenus && isValidSpecies) {
                    result.classifications.push({
                        family: family,
                        genus: genus,
                        species: species,
                        startIndex: i,
                        endIndex: i + 2,
                        text: potentialClassifier.join(' ')
                    });
                }
            }
        }
        
        // Store the first classifier for backward compatibility
        if (result.classifications.length > 0) {
            result.classifier = result.classifications[0].text;
        }
    }

    /**
     * Tokenize a line into syntax-highlighted tokens using shared logic
     * @param {string} line - Line of CAOS code
     * @returns {Array} Array of tokens with text and type
     */
    tokenizeLine(line) {
        // Require the shared tokenization logic from COSFileParser
        if (typeof window.COSFileParser === 'undefined' || !window.COSFileParser.tokenizeCAOSLine) {
            throw new Error('COSFileParser.tokenizeCAOSLine() is required but not available. Please ensure cos-parser.js is loaded first.');
        }
        
        const sharedTokens = window.COSFileParser.tokenizeCAOSLine(line);
        
        // Post-process to add command detection from catalog
        return sharedTokens.map(token => {
            if (this.commandCatalog) {
                // Handle regular commands
                if (token.type === 'normal') {
                    const command = this.commandCatalog.find(cmd => 
                        cmd.name.toLowerCase() === token.text.toLowerCase()
                    );
                    if (command) {
                        return { ...token, type: 'command' };
                    }
                }
                // Handle compound commands (new:simp, mesg:writ, etc.)
                else if (token.type === 'compound_command') {
                    // Extract the sub-command part for catalog lookup
                    const commandName = token.text.includes(':') ? 
                        token.text.split(':')[1] : token.text;
                    
                    const command = this.commandCatalog.find(cmd => 
                        cmd.name.toLowerCase() === commandName.toLowerCase()
                    );
                    if (command) {
                        return { ...token, type: 'command' };
                    }
                }
            }
            return token;
        });
    }

    /**
     * Get human-readable input mask description from bitmask
     * @param {number} maskValue - Input mask bitmask value
     * @returns {string} Human-readable description
     */
    getInputMaskDescription(maskValue) {
        if (maskValue === undefined || maskValue === null) {
            return 'N/A';
        }
        
        const mask = typeof maskValue === 'number' ? maskValue : parseInt(maskValue);
        
        if (mask === 0) return 'No Events';
        if (mask === 0xFF || mask === 255) return 'All Events [Scripts 79-85]';
        
        const eventNames = [];
        if (mask & 0x01) eventNames.push('Key Down [Script 79]');
        if (mask & 0x02) eventNames.push('Key Up [Script 80]');
        if (mask & 0x04) eventNames.push('Mouse Move [Script 81]');
        if (mask & 0x08) eventNames.push('Mouse Down [Script 82]');
        if (mask & 0x10) eventNames.push('Mouse Up [Script 83]');
        if (mask & 0x20) eventNames.push('Mouse Wheel [Script 84]');
        if (mask & 0x40) eventNames.push('Translated Char [Script 85]');
        
        return eventNames.length > 0 ? eventNames.join(', ') : 'Unknown Events';
    }

    /**
     * Get human-readable attribute flags description from bitmask
     * @param {number} attrValue - Attribute bitmask value
     * @returns {string} Human-readable description
     */
    getAttributeDescription(attrValue) {
        if (attrValue === undefined || attrValue === null) {
            return 'N/A';
        }
        
        const attr = typeof attrValue === 'number' ? attrValue : parseInt(attrValue);
        
        if (attr === 0) return 'No Attributes';
        
        const attributes = [];
        if (attr & 0x01) attributes.push('Carryable');
        if (attr & 0x02) attributes.push('Mouseable');
        if (attr & 0x04) attributes.push('Activatable (1)');
        if (attr & 0x08) attributes.push('Activatable (2)');
        if (attr & 0x10) attributes.push('Greedycabin');
        if (attr & 0x20) attributes.push('Invisible');
        if (attr & 0x40) attributes.push('Floatable');
        if (attr & 0x80) attributes.push('Suffer Collisions');
        if (attr & 0x100) attributes.push('Suffer Physics');
        if (attr & 0x200) attributes.push('Camera Shy');
        if (attr & 0x400) attributes.push('Open Air Cabin');
        if (attr & 0x800) attributes.push('Rotatable');
        if (attr & 0x1000) attributes.push('Presence');
        
        return attributes.length > 0 ? attributes.join(', ') : 'Unknown Attributes';
    }

    /**
     * Get human-readable creature permissions description from bitmask
     * @param {number} permValue - Permissions bitmask value
     * @returns {string} Human-readable description
     */
    getPermissionsDescription(permValue) {
        if (permValue === undefined || permValue === null) {
            return 'N/A';
        }
        
        const perm = typeof permValue === 'number' ? permValue : parseInt(permValue);
        
        if (perm === 0) return 'No Permissions';
        
        const permissions = [];
        if (perm & 0x01) permissions.push('Activate 1');
        if (perm & 0x02) permissions.push('Activate 2');
        if (perm & 0x04) permissions.push('Deactivate');
        if (perm & 0x08) permissions.push('Hit');
        if (perm & 0x10) permissions.push('Eat');
        if (perm & 0x20) permissions.push('Pick Up');
        
        return permissions.length > 0 ? permissions.join(', ') : 'Unknown Permissions';
    }

    /**
     * Get bitmask description based on command and parameter context
     * @param {string} commandName - Name of the CAOS command
     * @param {number} paramIndex - Parameter index (0-based)
     * @param {number} value - Bitmask value
     * @returns {string|null} Human-readable description or null if not a bitmask parameter
     */
    getBitmaskDescription(commandName, paramIndex, value) {
        if (!commandName || value === undefined || value === null) {
            return null;
        }
        
        const cmd = commandName.toUpperCase();
        
        // IMSK - Input Mask (first parameter)
        if (cmd === 'IMSK' && paramIndex === 0) {
            return this.getInputMaskDescription(value);
        }
        
        // ATTR - Attributes (first parameter)
        if (cmd === 'ATTR' && paramIndex === 0) {
            return this.getAttributeDescription(value);
        }
        
        // PERM - Creature Permissions (first parameter)
        if (cmd === 'PERM' && paramIndex === 0) {
            return this.getPermissionsDescription(value);
        }
        
        return null;
    }

    /**
     * Escape HTML characters to prevent XSS while preserving tabs and spaces
     * @param {string} text - Text to escape
     * @returns {string} HTML-escaped text with preserved whitespace
     */
    escapeHtml(text) {
        // Manual escape to ensure tabs are preserved
        const escaped = text
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&#039;');
        
        return escaped;
    }

    /**
     * Setup event handlers for clickable commands and classifications
     * @param {HTMLElement} container - Container element with rendered CAOS content
     * @param {Function} commandClickHandler - Function to handle command clicks
     * @param {Function} classificationClickHandler - Function to handle classification clicks
     */
    setupCommandClickHandlers(container, commandClickHandler, classificationClickHandler = null) {
        if (!container || typeof commandClickHandler !== 'function') {
            return;
        }

        // Remove any existing event listeners to prevent duplicates
        if (container._caosCommandClickHandler) {
            container.removeEventListener('click', container._caosCommandClickHandler);
        }

        // Create bound handler function
        const handler = (event) => {
            const target = event.target;
            if (target.classList.contains('caos-clickable-command')) {
                const commandName = target.dataset.commandName;
                if (commandName) {
                    commandClickHandler(commandName, target);
                }
            } else if (target.classList.contains('caos-clickable-classification')) {
                const family = parseInt(target.dataset.family);
                const genus = parseInt(target.dataset.genus);
                const species = parseInt(target.dataset.species);
                if (!isNaN(family) && !isNaN(genus) && !isNaN(species) && classificationClickHandler) {
                    classificationClickHandler(family, genus, species, target);
                }
            }
        };

        // Store reference for cleanup
        container._caosCommandClickHandler = handler;
        
        // Add event delegation
        container.addEventListener('click', handler);
    }

    /**
     * Remove command click handlers from a container
     * @param {HTMLElement} container - Container element
     */
    removeCommandClickHandlers(container) {
        if (container && container._caosCommandClickHandler) {
            container.removeEventListener('click', container._caosCommandClickHandler);
            delete container._caosCommandClickHandler;
        }
    }

    /**
     * Detect if content appears to be CAOS script
     * @param {string} content - Script content to analyze
     * @returns {boolean} True if content appears to be CAOS
     */
    isCAOSContent(content) {
        if (!content || typeof content !== 'string') {
            return false;
        }

        // Don't filter out empty lines - only filter for analysis
        const allLines = content.split(/\r?\n/);
        const nonEmptyLines = allLines.map(line => line.trim()).filter(line => line.length > 0);
        if (nonEmptyLines.length === 0) {
            return false;
        }

        let caosIndicators = 0;
        const totalLines = Math.min(nonEmptyLines.length, 20); // Check first 20 lines

        for (let i = 0; i < totalLines; i++) {
            const line = nonEmptyLines[i].toLowerCase();
            
            // Check for CAOS keywords
            if (/^(inst|iscr|rscr|scrp|endm|reps|repe|doif|endi|else|slow|lock|wait|next|enum)\s*$/i.test(line)) {
                caosIndicators += 2;
            }
            
            // Check for common CAOS commands (if catalog is available)
            if (this.commandCatalog) {
                const words = line.split(/\s+/);
                if (words.length > 0) {
                    const firstWord = words[0];
                    if (this.commandCatalog.find(cmd => cmd.name.toLowerCase() === firstWord)) {
                        caosIndicators += 1;
                    }
                }
            }
            
            // Check for CAOS-style comments
            if (line.startsWith('*')) {
                caosIndicators += 0.5;
            }
            
            // Check for classifier patterns (three numbers in a row)
            if (/^\d+\s+\d+\s+\d+/.test(line)) {
                caosIndicators += 0.5;
            }
        }

        // Consider it CAOS if we found enough indicators
        const threshold = Math.max(1, totalLines * 0.1); // At least 10% of lines should have CAOS indicators
        return caosIndicators >= threshold;
    }
}

/**
 * COS Content Renderer - Unified renderer for COS files with sections and syntax highlighting
 * Combines parsing and rendering functionality from caos-catalog for shared use
 */
class COSRenderer {
    constructor(commandCatalog = null) {
        this.parser = new CAOSParser(commandCatalog);
        this.searchTerm = '';
        this.collapsedSections = new Set();
    }

    /**
     * Set command catalog for enhanced rendering
     * @param {Array} catalog - CAOS command catalog
     */
    setCommandCatalog(catalog) {
        this.parser.setCommandCatalog(catalog);
    }

    /**
     * Render COS content with sections and syntax highlighting
     * @param {string} content - COS file content
     * @param {Object} options - Rendering options
     * @returns {string} HTML with sections and syntax highlighting
     */
    renderContent(content, options = {}) {
        const enableClickableCommands = options.enableClickableCommands !== false;
        const enableCollapsibleSections = options.enableCollapsibleSections !== false;
        const showSectionHeaders = options.showSectionHeaders !== false;
        const debugMode = options.debugMode || false;

        // Parse the content into sections (this preserves whitespace in line content)
        const parsed = this.parser.parseContent(content, options.filename);
        
        if (!parsed.sections || parsed.sections.length === 0) {
            // No sections found, render as plain content using the parser's new whitespace-preserving method
            return this.parser.renderContent(content, options);
        }

        let html = '';

        // Render each section with preserved whitespace
        parsed.sections.forEach((section, index) => {
            const sectionId = `section-${index}`;
            const isCollapsed = this.collapsedSections.has(sectionId);

            if (showSectionHeaders) {
                html += this.renderSectionHeader(section, sectionId, isCollapsed, enableCollapsibleSections);
            }

            html += `<div class="cos-section-content ${isCollapsed ? 'collapsed' : ''}" id="${sectionId}">`;

            // Render section lines with preserved whitespace from parseContent
            section.lines.forEach(line => {
                html += this.renderLine(line, { 
                    enableClickableCommands,
                    enableClickableClassifications: options.enableClickableClassifications,
                    debugMode,
                    showLineNumbers: options.showLineNumbers 
                });
            });

            html += '</div>';
        });

        return html;
    }

    /**
     * Render a section header
     * @param {Object} section - Section object
     * @param {string} sectionId - Section ID for toggling
     * @param {boolean} isCollapsed - Whether section is collapsed
     * @param {boolean} enableCollapsibleSections - Whether sections can be collapsed
     * @returns {string} HTML for section header
     */
    renderSectionHeader(section, sectionId, isCollapsed, enableCollapsibleSections) {
        const toggleClass = isCollapsed ? 'collapsed' : '';
        const toggleIcon = isCollapsed ? '▶' : '▼';
        
        let html = `<div class="cos-section-header ${toggleClass}"`;
        
        if (enableCollapsibleSections) {
            html += ` onclick="cosRenderer.toggleSection('${sectionId}')" style="cursor: pointer;"`;
        }
        
        html += `>`;
        
        if (enableCollapsibleSections) {
            html += `<span class="toggle-icon">${toggleIcon}</span>`;
        }
        
        html += `<span class="section-title">${section.title}</span>`;
        
        if (section.classifier) {
            html += `<span class="cos-classifier">[${section.classifier}]</span>`;
            
            // Add event name if this is a script section (scrp) with a script number
            if (section.type === 'scrp' && section.script_number) {
                const eventNumber = parseInt(section.script_number);
                if (!isNaN(eventNumber) && typeof window.getEventName === 'function') {
                    const eventName = window.getEventName(eventNumber);
                    html += `<span class="cos-event-name" title="Event ${eventNumber}: ${eventName}">${eventName}</span>`;
                }
            }
        }
        
        html += '</div>';
        
        return html;
    }

    /**
     * Render a single line with syntax highlighting and debug features
     * @param {Object} line - Line object with number, content, and parsed data
     * @param {Object} options - Rendering options
     * @returns {string} HTML for the rendered line
     */
    renderLine(line, options = {}) {
        const enableClickableCommands = options.enableClickableCommands !== false;
        const enableClickableClassifications = options.enableClickableClassifications !== false;
        const debugMode = options.debugMode || false;
        const showLineNumbers = options.showLineNumbers !== false;

        let lineClass = 'cos-line';
        if (debugMode) {
            lineClass += ' cos-debug-line';
        }

        let html = `<div class="${lineClass}" data-line="${line.number}">`;

        // Line number
        if (showLineNumbers) {
            let lineNumberClass = 'cos-line-number';
            if (debugMode) {
                lineNumberClass += ' cos-debug-line-number';
                html += `<span class="${lineNumberClass}" onclick="cosRenderer.toggleBreakpoint(${line.number})">`;
            } else {
                html += `<span class="${lineNumberClass}">`;
            }
            html += `${line.number}</span>`;
        }

        // Line content with syntax highlighting
        html += `<span class="line-content">`;
        html += this.parser.renderLineContent(line, { 
            enableClickableCommands,
            enableClickableClassifications
        });
        html += '</span>';

        html += '</div>';

        return html;
    }

    /**
     * Toggle section collapse state
     * @param {string} sectionId - Section ID to toggle
     */
    toggleSection(sectionId) {
        const content = document.getElementById(sectionId);
        const header = content?.previousElementSibling;
        
        if (!content || !header) return;

        if (this.collapsedSections.has(sectionId)) {
            this.collapsedSections.delete(sectionId);
            content.classList.remove('collapsed');
            header.classList.remove('collapsed');
            const icon = header.querySelector('.toggle-icon');
            if (icon) icon.textContent = '▼';
        } else {
            this.collapsedSections.add(sectionId);
            content.classList.add('collapsed');
            header.classList.add('collapsed');
            const icon = header.querySelector('.toggle-icon');
            if (icon) icon.textContent = '▶';
        }
    }

    /**
     * Toggle all sections collapsed/expanded
     * @param {boolean} collapse - Whether to collapse (true) or expand (false)
     */
    toggleAllSections(collapse) {
        const headers = document.querySelectorAll('.cos-section-header');
        const contents = document.querySelectorAll('.cos-section-content');
        
        headers.forEach((header, index) => {
            const content = contents[index];
            const sectionId = content?.id;
            
            if (!sectionId) return;

            if (collapse) {
                this.collapsedSections.add(sectionId);
                header.classList.add('collapsed');
                content.classList.add('collapsed');
                const icon = header.querySelector('.toggle-icon');
                if (icon) icon.textContent = '▶';
            } else {
                this.collapsedSections.delete(sectionId);
                header.classList.remove('collapsed');
                content.classList.remove('collapsed');
                const icon = header.querySelector('.toggle-icon');
                if (icon) icon.textContent = '▼';
            }
        });
    }

    /**
     * Set search term for highlighting
     * @param {string} term - Search term
     */
    setSearchTerm(term) {
        this.searchTerm = term.toLowerCase();
    }

    /**
     * Setup event handlers for the rendered content
     * @param {HTMLElement} container - Container element
     * @param {Object} handlers - Event handler functions
     */
    setupEventHandlers(container, handlers = {}) {
        if (!container) return;

        // Setup command and classification click handlers if provided
        if (handlers.onCommandClick) {
            this.parser.setupCommandClickHandlers(
                container, 
                handlers.onCommandClick,
                handlers.onClassificationClick
            );
        }

        // Setup breakpoint toggle handler if provided
        if (handlers.onBreakpointToggle) {
            container.addEventListener('click', (event) => {
                if (event.target.classList.contains('cos-debug-line-number')) {
                    const lineElement = event.target.closest('[data-line]');
                    if (lineElement) {
                        const lineNumber = parseInt(lineElement.dataset.line);
                        handlers.onBreakpointToggle(lineNumber);
                    }
                }
            });
        }
    }

    /**
     * Toggle breakpoint (for debug mode)
     * @param {number} lineNumber - Line number to toggle breakpoint
     */
    toggleBreakpoint(lineNumber) {
        // This method can be overridden by debug implementations
        console.log(`Toggle breakpoint at line ${lineNumber}`);
    }

    /**
     * Clean up event handlers
     * @param {HTMLElement} container - Container element
     */
    cleanup(container) {
        if (container) {
            this.parser.removeCommandClickHandlers(container);
        }
    }
}

// Export for module systems
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { CAOSParser, COSRenderer };
}

// Global export for browser usage
if (typeof window !== 'undefined') {
    window.CAOSParser = CAOSParser;
    window.COSRenderer = COSRenderer;
    // Create a global instance for easy access
    window.cosRenderer = new COSRenderer();
}
