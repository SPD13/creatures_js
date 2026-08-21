/**
 * Agent Parser Library
 * 
 * A shared library for parsing PRAY files and extracting agent data,
 * used by both the agent-viewer tool and the main game engine.
 * 
 * @version 1.0.0
 * @license MIT
 */

/**
 * Agent Parser - Unified parsing logic for PRAY files and agent data extraction
 */
class AgentParser {
    /**
     * Parse agent file and extract all relevant data
     * @param {ArrayBuffer} arrayBuffer - The PRAY file data
     * @param {string} fileName - Name of the agent file (optional)
     * @returns {Object} Parsed agent data
     */
    static async parseAgentFile(arrayBuffer, fileName = '') {
        // Use the PRAY parser from the creatures-file-formats library
        if (!window.CreaturesFileFormats || !window.CreaturesFileFormats.PRAYFormats) {
            throw new Error('PRAY parser not loaded. Please ensure creatures-file-formats.js is included.');
        }

        const parser = window.CreaturesFileFormats.PRAYFormats.createParser(arrayBuffer);
        const result = parser.parse();

        // Check if parsing was successful
        if (!result || !result.blocks || result.blocks.length === 0) {
            throw new Error('No blocks found in agent file - file may be corrupted or not a valid agent file');
        }

        // Extract and normalize agent data
        const agentData = {
            fileName,
            fileSize: result.fileInfo.fileSize,
            blocks: result.blocks,
            metadata: this.extractAgentMetadata(result),
            embeddedFiles: this.extractEmbeddedFiles(result.blocks),
            scripts: this.extractAllScripts(result.blocks),
            dependencies: this.extractAllDependencies(result.blocks),
            agentType: this.determineAgentType(result),
            stats: this.calculateStats(result.blocks)
        };

        // Validate the agent data structure
        this.validateAgentData(agentData);

        return agentData;
    }

    /**
     * Extract agent metadata from AGNT/DSAG blocks
     * @param {Object} parsedPRAY - Parsed PRAY file result
     * @returns {Object|null} Agent metadata
     */
    static extractAgentMetadata(parsedPRAY) {
        let metadata = null;
        let agentBlock = null;
        
        for (const block of parsedPRAY.blocks) {
            if (block.type === 'AGNT' || block.type === 'DSAG') {
                agentBlock = block;
                if (block.parsedData) {
                    metadata = block.parsedData;
                }
                break;
            }
        }

        if (!agentBlock) {
            return null;
        }

        const result = {
            blockType: agentBlock.type,
            blockName: agentBlock.name || 'Unnamed',
            rawMetadata: metadata
        };

        if (metadata) {
            // Extract commonly used fields
            const { integers, strings } = metadata;
            
            result.agentType = integers?.['Agent Type'] || 0;
            result.description = strings?.['Agent Description'] || '';
            result.animationFile = strings?.['Agent Animation File'] || '';
            result.animationGallery = strings?.['Agent Animation Gallery'] || '';
            result.animationString = strings?.['Agent Animation String'] || '';
            result.scriptCount = integers?.['Script Count'] || 0;
            result.dependencyCount = integers?.['Dependency Count'] || 0;
            result.bioenergy = integers?.['Agent Bioenergy Value'] || 0;
            result.removeScript = strings?.['Remove script'] || '';

            // Extract classification information
            result.family = integers?.['Agent Family'] || 0;
            result.genus = integers?.['Agent Genus'] || 0;
            result.species = integers?.['Agent Species'] || 0;

            // Extract sprite information
            result.spriteFile = strings?.['Agent Sprite File'] || '';
            result.firstImage = integers?.['Agent First Image'] || 0;
            result.imageCount = integers?.['Agent Image Count'] || 0;

            // Store all metadata for advanced usage
            result.allIntegers = integers || {};
            result.allStrings = strings || {};
        }

        return result;
    }

    /**
     * Parse dependency information from metadata
     * @param {Array} blocks - PRAY file blocks
     * @returns {Array} Parsed dependencies
     */
    static extractAllDependencies(blocks) {
        const dependencies = [];
        
        for (const block of blocks) {
            if ((block.type === 'AGNT' || block.type === 'DSAG') && block.parsedData) {
                const { integers, strings } = block.parsedData;
                
                // Extract numbered dependencies
                const count = integers?.['Dependency Count'] || 0;
                for (let i = 1; i <= count; i++) {
                    const dep = strings?.[`Dependency ${i}`];
                    const category = integers?.[`Dependency Category ${i}`];
                    
                    if (dep) {
                        dependencies.push({
                            name: dep,
                            value: dep,
                            source: `Agent Metadata (${block.type})`,
                            type: this.classifyDependencyType(`Dependency ${i}`, dep),
                            critical: this.isDependencyCritical(`Dependency ${i}`, dep),
                            description: this.getDependencyDescription(`Dependency ${i}`, dep),
                            category: category || 0,
                            categoryName: this.getDependencyCategoryName(category || 0)
                        });
                    }
                }

                // Extract other dependency-related metadata
                if (integers) {
                    Object.entries(integers).forEach(([key, value]) => {
                        if (key.toLowerCase().includes('dependency') && !key.startsWith('Dependency ')) {
                            dependencies.push({
                                name: key,
                                value: value.toString(),
                                source: `Agent Metadata (${block.type})`,
                                type: this.classifyDependencyType(key, value),
                                critical: this.isDependencyCritical(key, value),
                                description: this.getDependencyDescription(key, value)
                            });
                        }
                    });
                }
                
                if (strings) {
                    Object.entries(strings).forEach(([key, value]) => {
                        if (key.toLowerCase().includes('dependency') && !key.startsWith('Dependency ')) {
                            dependencies.push({
                                name: key,
                                value: value,
                                source: `Agent Metadata (${block.type})`,
                                type: this.classifyDependencyType(key, value),
                                critical: this.isDependencyCritical(key, value),
                                description: this.getDependencyDescription(key, value)
                            });
                        }
                    });
                }
            }
        }
        
        return dependencies;
    }

    /**
     * Extract and categorize all scripts from various sources
     * @param {Array} blocks - PRAY file blocks
     * @returns {Array} Extracted scripts
     */
    static extractAllScripts(blocks) {
        const scripts = [];
        
        // Extract scripts from agent metadata
        const agentMetadataScripts = this.extractAgentMetadataScripts(blocks);
        scripts.push(...agentMetadataScripts);
        
        // Extract scripts from embedded files
        const embeddedScripts = this.extractEmbeddedScripts(blocks);
        scripts.push(...embeddedScripts);
        
        // Extract scripts from raw blocks
        const blockScripts = this.extractBlockScripts(blocks);
        scripts.push(...blockScripts);
        
        return scripts;
    }

    /**
     * Extract embedded files from FILE blocks
     * @param {Array} blocks - PRAY file blocks
     * @returns {Array} Embedded files with metadata
     */
    static extractEmbeddedFiles(blocks) {
        const embeddedFiles = [];
        
        const fileBlocks = blocks.filter(block => 
            block.type === 'FILE' || (block.name && block.name.includes('.') && block.data)
        );

        fileBlocks.forEach((block, index) => {
            const fileName = block.name ? block.name.replace(/\0+$/, '') : `Block_${index}_${block.type}`;
            const fileSize = block.size || (block.data ? block.data.length : 0);
            
            embeddedFiles.push({
                name: fileName,
                size: fileSize,
                data: block.data,
                type: this.getFileType(fileName),
                extension: this.getFileExtension(fileName),
                blockIndex: index,
                originalBlock: block
            });
        });

        return embeddedFiles;
    }

    /**
     * Determine agent type from parsed data
     * @param {Object} parsedPRAY - Parsed PRAY file result
     * @returns {string} Agent type classification
     */
    static determineAgentType(parsedPRAY) {
        const metadata = this.extractAgentMetadata(parsedPRAY);
        
        if (!metadata) {
            return 'Unknown';
        }

        // Check for creature data
        if (parsedPRAY.blocks.some(block => block.type === 'EGGS' || block.type === 'EXPC' || 
                                              block.name?.toLowerCase().includes('creature') ||
                                              block.name?.toLowerCase().includes('breed'))) {
            return 'Creature';
        }

        // Check agent type from metadata
        if (metadata.agentType !== undefined) {
            switch (metadata.agentType) {
                case 0: return 'SimpleAgent';
                case 1: return 'CompoundAgent';  
                case 2: return 'Vehicle';
                case 3: return 'Creature';
                default: return 'Agent';
            }
        }

        // Check for multi-part indicators
        if (metadata.allStrings && Object.keys(metadata.allStrings).some(key => 
            key.toLowerCase().includes('part') || key.toLowerCase().includes('limb'))) {
            return 'CompoundAgent';
        }

        // Default to SimpleAgent
        return 'SimpleAgent';
    }

    /**
     * Validate agent data structure
     * @param {Object} agentData - Parsed agent data
     * @throws {Error} If validation fails
     */
    static validateAgentData(agentData) {
        if (!agentData) {
            throw new Error('Agent data is null or undefined');
        }

        if (!agentData.blocks || !Array.isArray(agentData.blocks)) {
            throw new Error('Agent data must contain a blocks array');
        }

        if (agentData.blocks.length === 0) {
            throw new Error('Agent data must contain at least one block');
        }

        // Check for required agent block
        const hasAgentBlock = agentData.blocks.some(block => 
            block.type === 'AGNT' || block.type === 'DSAG'
        );

        if (!hasAgentBlock) {
            console.warn('Agent file does not contain AGNT or DSAG block - may not be a standard agent');
        }

        // Validate agent type
        const validAgentTypes = ['SimpleAgent', 'CompoundAgent', 'Vehicle', 'Creature', 'Agent', 'Unknown'];
        if (!validAgentTypes.includes(agentData.agentType)) {
            console.warn(`Unknown agent type: ${agentData.agentType}`);
        }
    }

    // Helper methods for dependency classification
    static classifyDependencyType(key, value) {
        const keyLower = key.toLowerCase();
        const valueLower = typeof value === 'string' ? value.toLowerCase() : value.toString().toLowerCase();
        
        // Engine and version dependencies
        if (keyLower.includes('engine') || keyLower.includes('version') || keyLower.includes('game')) {
            return 'Engine Dependency';
        }
        
        // Object and COB dependencies  
        if (keyLower.includes('object') || keyLower.includes('cob') || valueLower.includes('.cob')) {
            return 'Object Dependency';
        }
        
        // Sprite file dependencies
        if (keyLower.includes('sprite') || valueLower.includes('.c16') || valueLower.includes('.s16')) {
            return 'Sprite Dependency';
        }
        
        // Sound file dependencies
        if (keyLower.includes('sound') || keyLower.includes('audio') || valueLower.includes('.wav') || valueLower.includes('.mng')) {
            return 'Sound Dependency';
        }
        
        // Breed dependencies
        if (keyLower.includes('breed') || keyLower.includes('genetics') || valueLower.includes('.gen')) {
            return 'Breed Dependency';
        }
        
        // World and room dependencies
        if (keyLower.includes('world') || keyLower.includes('room') || keyLower.includes('background')) {
            return 'World Dependency';
        }
        
        // Catalog dependencies
        if (keyLower.includes('catalog') || keyLower.includes('catalogue') || valueLower.includes('.catalogue')) {
            return 'Catalog Dependency';
        }
        
        return 'Other Dependency';
    }

    static isDependencyCritical(key, value) {
        const keyLower = key.toLowerCase();
        
        // Engine dependencies are typically critical
        if (keyLower.includes('engine') || keyLower.includes('version')) {
            return true;
        }
        
        // Required objects are usually critical
        if (keyLower.includes('required') || keyLower.includes('critical')) {
            return true;
        }
        
        // Default to non-critical
        return false;
    }

    static getDependencyDescription(key, value) {
        const keyLower = key.toLowerCase();
        
        if (keyLower.includes('engine')) {
            return 'Specifies the game engine version required to run this agent';
        }
        
        if (keyLower.includes('object')) {
            return 'References external objects that must be present in the game';
        }
        
        if (keyLower.includes('sprite')) {
            return 'Requires specific sprite files for visual appearance';
        }
        
        if (keyLower.includes('sound')) {
            return 'Depends on audio files for sound effects or music';
        }
        
        if (keyLower.includes('breed')) {
            return 'Requires specific creature breeds to be available';
        }
        
        if (keyLower.includes('world')) {
            return 'Needs particular world features or room types';
        }
        
        return null; // No description available
    }

    static getDependencyCategoryName(category) {
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

    // Helper methods for script extraction
    static extractAgentMetadataScripts(blocks) {
        const scripts = [];
        
        for (const block of blocks) {
            if ((block.type === 'AGNT' || block.type === 'DSAG') && block.parsedData) {
                const { integers, strings } = block.parsedData;
                
                if (strings) {
                    Object.entries(strings).forEach(([key, value]) => {
                        // Only include fields that are actually scripts
                        const keyLower = key.toLowerCase();
                        if (keyLower.includes('script') && 
                            !keyLower.includes('description') && 
                            !keyLower.includes('author') &&
                            !keyLower.includes('web') &&
                            !keyLower.includes('url') &&
                            value && value.trim()) {
                            scripts.push({
                                name: key,
                                path: `Agent Metadata/${key}`,
                                type: this.classifyScriptType(key, 'metadata'),
                                source: 'metadata',
                                content: value,
                                size: new Blob([value]).size,
                                lineCount: value.split('\n').length
                            });
                        }
                    });
                }

                // Extract numbered scripts
                if (integers && integers['Script Count']) {
                    const count = integers['Script Count'];
                    for (let i = 1; i <= count; i++) {
                        const script = strings?.[`Script ${i}`];
                        if (script && script.trim()) {
                            scripts.push({
                                name: `Script ${i}`,
                                path: `Agent Metadata/Script ${i}`,
                                type: this.classifyScriptType(`Script ${i}`, 'metadata'),
                                source: 'metadata',
                                content: script,
                                size: new Blob([script]).size,
                                lineCount: script.split('\n').length
                            });
                        }
                    }
                }
            }
        }
        
        return scripts;
    }

    static extractEmbeddedScripts(blocks) {
        const scripts = [];
        
        const scriptFiles = blocks.filter(block => 
            block.type === 'FILE' && block.name && 
            (block.name.endsWith('.cos') || block.name.endsWith('.caos'))
        );
        
        scriptFiles.forEach(block => {
            let scriptContent = 'No script content available';
            
            if (block.data) {
                try {
                    const decoder = new TextDecoder('utf-8');
                    scriptContent = decoder.decode(block.data);
                } catch (e) {
                    scriptContent = 'Could not decode script content';
                }
            }
            
            const fileName = block.name.replace(/\0+$/, '');
            scripts.push({
                name: fileName,
                path: `Embedded Files/${fileName}`,
                type: this.classifyScriptType(fileName, 'file'),
                source: 'embedded_file',
                content: scriptContent,
                size: block.data ? block.data.length : 0,
                lineCount: scriptContent.split('\n').length
            });
        });
        
        return scripts;
    }

    static extractBlockScripts(blocks) {
        const scripts = [];
        
        const scriptBlocks = blocks.filter(block => 
            block.type === 'SCRP' || block.type === 'RSCR'
        );
        
        scriptBlocks.forEach((block, index) => {
            let scriptContent = 'No script content available';
            
            if (block.data) {
                try {
                    const decoder = new TextDecoder('utf-8');
                    scriptContent = decoder.decode(block.data);
                } catch (e) {
                    scriptContent = 'Could not decode script content';
                }
            }
            
            const blockName = block.name || `Script Block ${index + 1}`;
            scripts.push({
                name: blockName,
                path: `Raw Blocks/${block.type}/${blockName}`,
                type: this.classifyScriptType(blockName, 'block'),
                source: 'raw_block',
                content: scriptContent,
                size: block.data ? block.data.length : (block.size || 0),
                lineCount: scriptContent.split('\n').length
            });
        });
        
        return scripts;
    }

    static classifyScriptType(name, source) {
        const nameLower = name.toLowerCase();
        
        if (nameLower.includes('install')) return 'Install Script';
        if (nameLower.includes('remove')) return 'Remove Script';
        if (nameLower.includes('timer')) return 'Timer Script';
        if (nameLower.includes('event')) return 'Event Script';
        if (nameLower.includes('init')) return 'Initialization Script';
        if (nameLower.includes('behavior')) return 'Behavior Script';
        if (source === 'metadata') return 'Agent Metadata Script';
        if (source === 'embedded_file') return 'Embedded Script File';
        if (source === 'raw_block') return 'Raw Script Block';
        
        return 'General Script';
    }

    // Helper methods for file type detection
    static getFileType(fileName) {
        const extension = fileName.split('.').pop().toLowerCase();
        const typeMap = {
            'txt': 'Text', 'cos': 'CAOS Script', 'caos': 'CAOS Script',
            'wav': 'Audio', 'c16': 'Sprite', 's16': 'Sprite', 'blk': 'Background',
            'jpg': 'Image', 'jpeg': 'Image', 'png': 'Image',
            'gif': 'Image', 'bmp': 'Image', 'catalogue': 'Catalogue',
            'gen': 'Genetics', 'gno': 'Gene Notes', 'mng': 'Music'
        };
        return typeMap[extension] || 'Binary';
    }

    static getFileExtension(fileName) {
        const lastDot = fileName.lastIndexOf('.');
        return lastDot >= 0 ? fileName.substring(lastDot + 1).toLowerCase() : '';
    }

    // Helper method for calculating stats
    static calculateStats(blocks) {
        const stats = {
            'Total Blocks': blocks.length,
            'File Blocks': 0,
            'Agent Blocks': 0,
            'Script Blocks': 0,
            'Total Size': 0
        };

        blocks.forEach(block => {
            if (block.data && block.data.length) {
                stats['Total Size'] += block.data.length;
            } else if (block.size) {
                stats['Total Size'] += block.size;
            }
            
            if (block.type === 'FILE') {
                stats['File Blocks']++;
            } else if (block.type === 'AGNT' || block.type === 'DSAG') {
                stats['Agent Blocks']++;
            } else if (block.type === 'SCRP' || block.type === 'RSCR') {
                stats['Script Blocks']++;
            }
        });

        // Format file size
        if (stats['Total Size'] > 1024 * 1024) {
            stats['Total Size'] = `${(stats['Total Size'] / (1024 * 1024)).toFixed(2)} MB`;
        } else if (stats['Total Size'] > 1024) {
            stats['Total Size'] = `${(stats['Total Size'] / 1024).toFixed(2)} KB`;
        } else {
            stats['Total Size'] = `${stats['Total Size']} bytes`;
        }

        return stats;
    }
}

// Export for browser environment
if (typeof window !== 'undefined') {
    window.AgentParser = AgentParser;
}

// Export for Node.js environment
if (typeof module !== 'undefined' && module.exports) {
    module.exports = AgentParser;
}
