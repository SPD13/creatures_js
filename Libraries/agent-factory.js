/**
 * Agent Factory Library
 * 
 * Factory pattern for creating different agent types from parsed agent data.
 * Handles agent instantiation, sprite loading, and script compilation.
 * 
 * @version 1.0.0
 * @license MIT
 */

/**
 * Agent Factory - Factory pattern for creating different agent types
 */
class AgentFactory {
    /**
     * Create agent instance from parsed agent data
     * @param {Object} agentData - Parsed agent data from AgentParser
     * @param {Object} world - World instance for agent registration
     * @param {Object} options - Creation options
     * @returns {Object} Created agent instance
     */
    static async createAgent(agentData, world, options = {}) {
        // Validate input parameters
        if (!agentData) {
            throw new Error('Agent data is required');
        }
        if (!world) {
            throw new Error('World instance is required');
        }

        // Determine agent type and create appropriate instance
        const agentType = this.determineAgentType(agentData.metadata);
        console.log(`Creating agent of type: ${agentType}`);

        // Extract essential information
        const classifier = this.extractClassifier(agentData.metadata);
        const uniqueID = this.generateUniqueID(world);

        // Create agent based on type
        let agent;
        switch (agentType) {
            case 'SimpleAgent':
                agent = await this.createSimpleAgent(agentData, classifier, uniqueID, world, options);
                break;
            case 'CompoundAgent':
                agent = await this.createCompoundAgent(agentData, classifier, uniqueID, world, options);
                break;
            case 'Vehicle':
                agent = await this.createVehicleAgent(agentData, classifier, uniqueID, world, options);
                break;
            case 'Creature':
                agent = await this.createCreatureAgent(agentData, classifier, uniqueID, world, options);
                break;
            default:
                agent = await this.createSimpleAgent(agentData, classifier, uniqueID, world, options);
                console.warn(`Unknown agent type ${agentType}, defaulting to SimpleAgent`);
        }

        // Load sprite galleries
        await this.loadSpriteGalleries(agent, agentData);

        // Compile and bind CAOS scripts
        await this.compileScripts(agent, agentData);

        // Apply additional configuration
        this.applyAgentConfiguration(agent, agentData, options);

        return agent;
    }

    /**
     * Determine agent type from metadata
     * @param {Object} metadata - Agent metadata
     * @returns {string} Agent type
     */
    static determineAgentType(metadata) {
        if (!metadata) {
            return 'SimpleAgent';
        }

        // Check explicit agent type from metadata
        if (metadata.agentType !== undefined) {
            switch (metadata.agentType) {
                case 0: return 'SimpleAgent';
                case 1: return 'CompoundAgent';  
                case 2: return 'Vehicle';
                case 3: return 'Creature';
                default: return 'SimpleAgent';
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
     * Extract classifier (Family/Genus/Species) from metadata
     * @param {Object} metadata - Agent metadata
     * @returns {Object} Classifier object
     */
    static extractClassifier(metadata) {
        const classifier = {
            family: 0,
            genus: 0,
            species: 0
        };

        if (metadata) {
            classifier.family = metadata.family || 0;
            classifier.genus = metadata.genus || 0;
            classifier.species = metadata.species || 0;
        }

        return classifier;
    }

    /**
     * Generate unique ID for agent
     * @param {Object} world - World instance
     * @returns {number} Unique agent ID
     */
    static generateUniqueID(world) {
        // Use world's agent manager to get next available ID
        if (world.agentManager && world.agentManager.getNextAgentID) {
            return world.agentManager.getNextAgentID();
        }
        
        // Fallback: generate timestamp-based ID
        return Date.now() + Math.floor(Math.random() * 1000);
    }

    /**
     * Create SimpleAgent instance
     * @param {Object} agentData - Parsed agent data
     * @param {Object} classifier - Agent classifier
     * @param {number} uniqueID - Unique agent ID
     * @param {Object} world - World instance
     * @param {Object} options - Creation options
     * @returns {Object} SimpleAgent instance
     */
    static async createSimpleAgent(agentData, classifier, uniqueID, world, options) {
        // Extract sprite information
        const spriteInfo = this.extractSpriteInfo(agentData);
        
        // Create agent data structure matching the expected format
        const agentConfig = {
            classifier,
            uniqueID,
            gallery: spriteInfo.gallery,
            baseImage: spriteInfo.baseImage,
            plane: options.plane || 0,
            position: options.position || { x: 0, y: 0 },
            attributes: this.extractAttributes(agentData.metadata),
            creaturePermissions: this.extractCreaturePermissions(agentData.metadata),
            metadata: agentData.metadata,
            originalData: agentData
        };

        return {
            type: 'SimpleAgent',
            config: agentConfig,
            // Placeholder methods that will be implemented by the actual agent classes
            initialize: function() {
                console.log(`Initializing SimpleAgent ${uniqueID}`);
            },
            update: function() {
                // Agent update logic will be implemented in actual agent classes
            }
        };
    }

    /**
     * Create CompoundAgent instance
     * @param {Object} agentData - Parsed agent data
     * @param {Object} classifier - Agent classifier
     * @param {number} uniqueID - Unique agent ID
     * @param {Object} world - World instance
     * @param {Object} options - Creation options
     * @returns {Object} CompoundAgent instance
     */
    static async createCompoundAgent(agentData, classifier, uniqueID, world, options) {
        // Extract part information from metadata
        const partsInfo = this.extractPartsInfo(agentData);
        
        const agentConfig = {
            classifier,
            uniqueID,
            parts: partsInfo,
            plane: options.plane || 0,
            position: options.position || { x: 0, y: 0 },
            attributes: this.extractAttributes(agentData.metadata),
            creaturePermissions: this.extractCreaturePermissions(agentData.metadata),
            metadata: agentData.metadata,
            originalData: agentData
        };

        return {
            type: 'CompoundAgent',
            config: agentConfig,
            initialize: function() {
                console.log(`Initializing CompoundAgent ${uniqueID} with ${partsInfo.length} parts`);
            },
            update: function() {
                // Agent update logic will be implemented in actual agent classes
            }
        };
    }

    /**
     * Create Vehicle agent instance
     * @param {Object} agentData - Parsed agent data
     * @param {Object} classifier - Agent classifier
     * @param {number} uniqueID - Unique agent ID
     * @param {Object} world - World instance
     * @param {Object} options - Creation options
     * @returns {Object} Vehicle instance
     */
    static async createVehicleAgent(agentData, classifier, uniqueID, world, options) {
        // Extract vehicle-specific information
        const cabinInfo = this.extractCabinInfo(agentData);
        
        const agentConfig = {
            classifier,
            uniqueID,
            cabin: cabinInfo,
            plane: options.plane || 0,
            position: options.position || { x: 0, y: 0 },
            attributes: this.extractAttributes(agentData.metadata),
            creaturePermissions: this.extractCreaturePermissions(agentData.metadata),
            metadata: agentData.metadata,
            originalData: agentData
        };

        return {
            type: 'Vehicle',
            config: agentConfig,
            initialize: function() {
                console.log(`Initializing Vehicle ${uniqueID}`);
            },
            update: function() {
                // Vehicle update logic will be implemented in actual agent classes
            }
        };
    }

    /**
     * Create Creature agent instance
     * @param {Object} agentData - Parsed agent data
     * @param {Object} classifier - Agent classifier
     * @param {number} uniqueID - Unique agent ID
     * @param {Object} world - World instance
     * @param {Object} options - Creation options
     * @returns {Object} Creature instance
     */
    static async createCreatureAgent(agentData, classifier, uniqueID, world, options) {
        // Extract creature-specific information
        const genomeInfo = this.extractGenomeInfo(agentData);
        
        const agentConfig = {
            classifier,
            uniqueID,
            genome: genomeInfo,
            plane: options.plane || 0,
            position: options.position || { x: 0, y: 0 },
            attributes: this.extractAttributes(agentData.metadata),
            creaturePermissions: this.extractCreaturePermissions(agentData.metadata),
            metadata: agentData.metadata,
            originalData: agentData
        };

        return {
            type: 'Creature',
            config: agentConfig,
            initialize: function() {
                console.log(`Initializing Creature ${uniqueID}`);
            },
            update: function() {
                // Creature update logic will be implemented in actual agent classes
            }
        };
    }

    /**
     * Load and cache sprite galleries for the agent
     * @param {Object} agent - Agent instance
     * @param {Object} agentData - Parsed agent data
     */
    static async loadSpriteGalleries(agent, agentData) {
        console.log('Loading sprite galleries for agent...');

        // Extract sprite files from embedded files
        const spriteFiles = agentData.embeddedFiles.filter(file => 
            file.type === 'Sprite' && (file.extension === 'c16' || file.extension === 's16')
        );

        console.log(`Found ${spriteFiles.length} sprite files`);

        const loadedGalleries = {};
        
        for (const spriteFile of spriteFiles) {
            try {
                // Use the existing sprite parser from creatures-file-formats
                if (window.CreaturesFileFormats && window.CreaturesFileFormats.SpriteFormats) {
                    const parser = window.CreaturesFileFormats.SpriteFormats.createParser(
                        spriteFile.data.buffer, 
                        spriteFile.name
                    );
                    const gallery = parser.parse();
                    
                    loadedGalleries[spriteFile.name] = gallery;
                    console.log(`Loaded sprite gallery: ${spriteFile.name} (${gallery.imageCount} images)`);
                } else {
                    console.warn('Sprite parser not available, skipping gallery loading');
                }
            } catch (error) {
                console.error(`Failed to load sprite gallery ${spriteFile.name}:`, error);
            }
        }

        // Store galleries in agent configuration
        agent.config.loadedGalleries = loadedGalleries;
        agent.config.spriteFiles = spriteFiles;
    }

    /**
     * Compile and bind CAOS scripts to the agent
     * @param {Object} agent - Agent instance
     * @param {Object} agentData - Parsed agent data
     */
    static async compileScripts(agent, agentData) {
        console.log('Compiling CAOS scripts for agent...');

        const compiledScripts = {};
        
        // Process each script
        for (const script of agentData.scripts) {
            try {
                // For now, store scripts as-is
                // In the future, this would integrate with the CAOS compiler
                compiledScripts[script.name] = {
                    source: script.content,
                    type: script.type,
                    compiled: false, // Will be true when CAOS compiler is integrated
                    path: script.path
                };
                
                console.log(`Stored script: ${script.name} (${script.type})`);
            } catch (error) {
                console.error(`Failed to compile script ${script.name}:`, error);
            }
        }

        // Store compiled scripts in agent configuration
        agent.config.compiledScripts = compiledScripts;
        
        console.log(`Processed ${Object.keys(compiledScripts).length} scripts`);
    }

    /**
     * Apply additional configuration to the agent
     * @param {Object} agent - Agent instance
     * @param {Object} agentData - Parsed agent data
     * @param {Object} options - Creation options
     */
    static applyAgentConfiguration(agent, agentData, options) {
        // Apply position if specified
        if (options.position) {
            agent.config.position = { ...options.position };
        }

        // Apply plane if specified
        if (options.plane !== undefined) {
            agent.config.plane = options.plane;
        }

        // Apply custom attributes if specified
        if (options.attributes) {
            agent.config.attributes = { ...agent.config.attributes, ...options.attributes };
        }

        // Store creation timestamp
        agent.config.createdAt = Date.now();
        
        // Store source information
        agent.config.sourceFile = agentData.fileName;
        agent.config.fileSize = agentData.fileSize;

        console.log(`Applied configuration to agent ${agent.config.uniqueID}`);
    }

    // Helper methods for extracting specific information from agent data

    /**
     * Extract sprite information from agent data
     * @param {Object} agentData - Parsed agent data
     * @returns {Object} Sprite information
     */
    static extractSpriteInfo(agentData) {
        const metadata = agentData.metadata;
        return {
            gallery: metadata?.animationGallery || metadata?.spriteFile || '',
            baseImage: metadata?.firstImage || 0,
            imageCount: metadata?.imageCount || 1
        };
    }

    /**
     * Extract parts information for compound agents
     * @param {Object} agentData - Parsed agent data
     * @returns {Array} Parts information
     */
    static extractPartsInfo(agentData) {
        const parts = [];
        const metadata = agentData.metadata;
        
        if (metadata && metadata.allStrings) {
            // Look for part-related metadata
            Object.keys(metadata.allStrings).forEach(key => {
                if (key.toLowerCase().includes('part')) {
                    parts.push({
                        name: key,
                        value: metadata.allStrings[key]
                    });
                }
            });
        }
        
        return parts;
    }

    /**
     * Extract cabin information for vehicles
     * @param {Object} agentData - Parsed agent data
     * @returns {Object} Cabin information
     */
    static extractCabinInfo(agentData) {
        const metadata = agentData.metadata;
        return {
            capacity: metadata?.allIntegers?.['Cabin Capacity'] || 1,
            type: metadata?.allStrings?.['Cabin Type'] || 'standard'
        };
    }

    /**
     * Extract genome information for creatures
     * @param {Object} agentData - Parsed agent data
     * @returns {Object} Genome information
     */
    static extractGenomeInfo(agentData) {
        // Look for genome files in embedded files
        const genomeFile = agentData.embeddedFiles.find(file => 
            file.extension === 'gen' || file.type === 'Genetics'
        );
        
        return {
            hasGenome: !!genomeFile,
            genomeFile: genomeFile?.name || null,
            genomeData: genomeFile?.data || null
        };
    }

    /**
     * Extract agent attributes from metadata
     * @param {Object} metadata - Agent metadata
     * @returns {number} Attributes flags
     */
    static extractAttributes(metadata) {
        if (!metadata || !metadata.allIntegers) {
            return 0; // Default attributes
        }

        // Look for attribute-related fields in metadata
        let attributes = 0;
        
        // Check for specific attribute flags
        if (metadata.allIntegers['Carryable']) attributes |= 0x00000001;
        if (metadata.allIntegers['Mouseable']) attributes |= 0x00000002;
        if (metadata.allIntegers['Activateable']) attributes |= 0x00000004;
        
        // Check for direct attributes field
        if (metadata.allIntegers['Attributes']) {
            attributes = metadata.allIntegers['Attributes'];
        }

        return attributes;
    }

    /**
     * Extract creature permissions from metadata
     * @param {Object} metadata - Agent metadata
     * @returns {number} Creature permissions flags
     */
    static extractCreaturePermissions(metadata) {
        if (!metadata || !metadata.allIntegers) {
            return 0x3F; // Default: all permissions enabled
        }

        // Look for creature permission fields
        if (metadata.allIntegers['Creature Permissions']) {
            return metadata.allIntegers['Creature Permissions'];
        }

        return 0x3F; // Default: all permissions enabled
    }

    /**
     * Validate agent creation parameters
     * @param {Object} agentData - Parsed agent data
     * @param {Object} world - World instance
     * @throws {Error} If validation fails
     */
    static validateCreationParameters(agentData, world) {
        if (!agentData) {
            throw new Error('Agent data is required');
        }

        if (!world) {
            throw new Error('World instance is required');
        }

        if (!agentData.blocks || agentData.blocks.length === 0) {
            throw new Error('Agent data must contain blocks');
        }

        if (!agentData.metadata) {
            console.warn('Agent data does not contain metadata - may not function properly');
        }
    }
}

// Export for browser environment
if (typeof window !== 'undefined') {
    window.AgentFactory = AgentFactory;
}

// Export for Node.js environment
if (typeof module !== 'undefined' && module.exports) {
    module.exports = AgentFactory;
}
