/**
 * CAOS Preview Library - Shared CAOS syntax highlighting and parsing functionality
 * Enhanced with advanced parsing logic from caos-catalog tool for reuse across multiple tools
 */

class CAOSParser {
    constructor(commandCatalog = null) {
        this.commandCatalog = commandCatalog;
    }

    /**
     * Set the command catalog for enhanced command recognition
     * @param {Array} catalog - Array of CAOS commands with name, type, etc.
     */
    setCommandCatalog(catalog) {
        this.commandCatalog = catalog;
    }

    /**
     * Tokenize a line into syntax-highlighted tokens
     * @param {string} line - Line of CAOS code
     * @returns {Array} Array of tokens with text and type
     */
    tokenizeLine(line) {
        const tokens = [];
        
        // Pre-process line to normalize compound commands (remove spaces between command and subcommand)
        const normalizedLine = line.replace(/(\w+):\s+(\w+)/gi, '$1:$2');
        
        // Enhanced regex to capture bracket parameters as single tokens
        const regex = /(\".*?\"|\[.*?\]|\w+:\w+|\w+:|\d+(?:\.\d+)?|\w+|[^\w\s\"\[\]]|\s+)/g;

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
            } else if (/^\w+:\w+$/i.test(token)) {
                // This is a compound command, convert to lowercase
                finalToken = token.toLowerCase();
                type = 'compound_command';
            } else if (token.startsWith('"') && token.endsWith('"')) {
                type = 'string';
            } else if (/^\d+(?:\.\d+)?$/.test(token)) {
                type = 'number';
            } else if (/^(inst|iscr|rscr|scrp|endm|reps|repe|doif|endi|else|slow|lock|wait|next|enum)$/i.test(token)) {
                type = 'keyword';
            } else if (token.endsWith(':')) {
                type = 'command';
            } else if (this.commandCatalog && this.commandCatalog.find(cmd => cmd.name.toLowerCase() === token.toLowerCase())) {
                type = 'command';
            }
            
            tokens.push({ text: finalToken, type });
        }
        
        return tokens;
    }

    // ... rest of the class methods remain the same
}

// Copy the tokenizeLine function to clipboard or file for replacement
console.log('Fixed tokenizeLine function ready for replacement');
