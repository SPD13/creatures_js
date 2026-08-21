// CAOS Commands JSON Loader
// Loads the JSON data and provides compatibility with existing CAOS_COMMANDS usage
// Used by both Main_Game and Tools

class CAOSCommandsLoader {
    constructor() {
        this.cachedData = null;
        this.loadPromise = null;
    }

    async loadCommands() {
        if (this.cachedData) {
            return this.cachedData;
        }

        if (this.loadPromise) {
            return this.loadPromise;
        }

        this.loadPromise = this._fetchCommands();
        const data = await this.loadPromise;
        this.cachedData = data;
        return data;
    }

    async _fetchCommands() {
        try {
            // Use PathResolver to get the correct path to data directory
            let jsonPath;
            
            if (window.PathResolver && typeof window.PathResolver.getDataPath === 'function') {
                // Use PathResolver for accurate path resolution
                const dataPath = window.PathResolver.getDataPath();
                jsonPath = `${dataPath}/caos-commands.json`;
            } else {
                // Fallback to manual path detection if PathResolver not available
                const currentPath = window.location.pathname;
                
                if (currentPath.includes('/Main_Game/Test/')) {
                    jsonPath = '../../data/caos-commands.json';
                } else if (currentPath.includes('/Main_Game/')) {
                    jsonPath = '../data/caos-commands.json';
                } else if (currentPath.includes('/Tools/')) {
                    // Check if we're in a subdirectory of Tools
                    const pathParts = currentPath.split('/');
                    const toolsIndex = pathParts.indexOf('Tools');
                    if (toolsIndex !== -1 && pathParts.length > toolsIndex + 2) {
                        // We're in a Tools subdirectory (e.g., /Tools/caos-catalog/)
                        jsonPath = '../../data/caos-commands.json';
                    } else {
                        // We're directly in Tools
                        jsonPath = '../data/caos-commands.json';
                    }
                } else {
                    jsonPath = 'data/caos-commands.json';
                }
            }

            console.log(`🔍 Loading CAOS commands from: ${jsonPath}`);
            const response = await fetch(jsonPath);
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const data = await response.json();
            
            // Make it available globally for compatibility
            window.CAOS_COMMANDS = data;
            
            // Initialize the shared command catalog if available
            if (typeof window.initCAOSCommandCatalog === 'function') {
                window.initCAOSCommandCatalog(data);
            }

            console.log(`✅ CAOS Commands loaded from JSON (${Object.keys(data.commands || []).length} commands)`);
            return data;

        } catch (error) {
            console.error('❌ Failed to load CAOS commands:', error);
            
            // Fallback: try to use existing global data if available
            if (window.CAOS_COMMANDS) {
                console.warn('⚠️ Using existing CAOS_COMMANDS data as fallback');
                return window.CAOS_COMMANDS;
            }
            
            // Return minimal structure to prevent errors
            return {
                commands: [],
                integerRValues: [],
                floatRValues: [],
                stringRValues: [],
                agentRValues: [],
                variables: [],
                metadata: {
                    extractionDate: new Date().toISOString(),
                    version: 'fallback',
                    features: [],
                    error: error.message
                }
            };
        }
    }

    // Helper method to get all commands in a flat array
    getAllCommands() {
        if (!this.cachedData) {
            return [];
        }

        return [
            ...(this.cachedData.commands || []),
            ...(this.cachedData.integerRValues || []),
            ...(this.cachedData.floatRValues || []),
            ...(this.cachedData.stringRValues || []),
            ...(this.cachedData.agentRValues || []),
            ...(this.cachedData.variables || [])
        ];
    }

    // Search for a specific command
    findCommand(name) {
        const allCommands = this.getAllCommands();
        return allCommands.find(cmd => 
            cmd.name && cmd.name.toLowerCase() === name.toLowerCase()
        );
    }
}

// Create global instance
window.caosCommandsLoader = new CAOSCommandsLoader();

// Automatically load commands when script loads
window.caosCommandsLoader.loadCommands().then(data => {
    console.log('🚀 CAOS Commands automatically loaded on page load');
}).catch(error => {
    console.error('❌ Failed to automatically load CAOS commands:', error);
});

// Export for module environments
if (typeof module !== 'undefined' && module.exports) {
    module.exports = CAOSCommandsLoader;
}
