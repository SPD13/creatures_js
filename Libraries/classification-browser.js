/**
 * Creatures 3/DS Classification System Utilities - Browser Version
 * 
 * This is a browser-compatible version of classification.js that doesn't use ES6 modules
 * and can be loaded directly in HTML script tags.
 */

// Load classification data first
(function() {
    'use strict';
    
    // This will be populated by classification-data.js when it loads
    window.Classification = {
        // Data will be populated from classification-data.js
        FAMILIES: null,
        GENUS: null,
        KNOWN_CLASSIFIERS: null,
        GENERATION_INFO: null,
        STATISTICS: null,
        
        /**
         * Initialize the classification system with data
         * This should be called after classification-data.js loads
         */
        init: function(data) {
            this.FAMILIES = data.FAMILIES || {};
            this.GENUS = data.GENUS || {};
            this.KNOWN_CLASSIFIERS = data.KNOWN_CLASSIFIERS || [];
            this.GENERATION_INFO = data.GENERATION_INFO || {};
            this.STATISTICS = data.STATISTICS || {};
        },
        
        /**
         * Get human readable name for a complete classifier
         * @param {number} family - Family number (1-255)
         * @param {number} genus - Genus number (1-255) 
         * @param {number} species - Species number (1-65535)
         * @returns {string|null} Human readable name or null if not found
         */
        getClassifierName: function(family, genus, species) {
            if (!this.KNOWN_CLASSIFIERS) return null;
            const found = this.KNOWN_CLASSIFIERS.find(c => 
                c.family === family && c.genus === genus && c.species === species
            );
            return found ? found.name : null;
        },

        /**
         * Get complete classifier information
         * @param {number} family - Family number
         * @param {number} genus - Genus number
         * @param {number} species - Species number
         * @returns {object|null} Complete classifier object or null if not found
         */
        getClassifierInfo: function(family, genus, species) {
            if (!this.KNOWN_CLASSIFIERS) return null;
            return this.KNOWN_CLASSIFIERS.find(c => 
                c.family === family && c.genus === genus && c.species === species
            ) || null;
        },

        /**
         * Get family information
         * @param {number} family - Family number
         * @returns {object|null} Family info with name and description, or null
         */
        getFamilyInfo: function(family) {
            if (!this.FAMILIES) return null;
            return this.FAMILIES[family] || null;
        },

        /**
         * Get genus information  
         * @param {number} family - Family number
         * @param {number} genus - Genus number
         * @returns {object|null} Genus info with name and description, or null
         */
        getGenusInfo: function(family, genus) {
            if (!this.GENUS) return null;
            return this.GENUS[family] && this.GENUS[family][genus] || null;
        },

        /**
         * Get a formatted string representation of a classifier
         * @param {number} family - Family number
         * @param {number} genus - Genus number
         * @param {number} species - Species number
         * @param {boolean} includeNames - Whether to include human-readable names
         * @returns {string} Formatted classifier string
         */
        formatClassifier: function(family, genus, species, includeNames = true) {
            const classNumber = `${family} ${genus} ${species}`;
            
            if (!includeNames) {
                return classNumber;
            }
            
            const parts = [];
            
            // Add family info
            const familyInfo = this.getFamilyInfo(family);
            if (familyInfo) {
                parts.push(`Family ${family} (${familyInfo.name})`);
            } else {
                parts.push(`Family ${family}`);
            }
            
            // Add genus info
            const genusInfo = this.getGenusInfo(family, genus);
            if (genusInfo) {
                parts.push(`Genus ${genus} (${genusInfo.name})`);
            } else {
                parts.push(`Genus ${genus}`);
            }
            
            // Add species info
            const classifierName = this.getClassifierName(family, genus, species);
            if (classifierName) {
                parts.push(`Species ${species} (${classifierName})`);
            } else {
                parts.push(`Species ${species}`);
            }
            
            return `${classNumber}: ${parts.join(' → ')}`;
        },

        /**
         * Validate classifier numbers against game limits
         * @param {number} family - Family (1-255)
         * @param {number} genus - Genus (1-255)
         * @param {number} species - Species (1-65535 for C3/DS)
         * @returns {object} Validation result with isValid boolean and errors array
         */
        validateClassifier: function(family, genus, species) {
            const errors = [];
            
            if (!Number.isInteger(family) || family < 1 || family > 255) {
                errors.push('Family must be an integer between 1 and 255');
            }
            
            if (!Number.isInteger(genus) || genus < 1 || genus > 255) {
                errors.push('Genus must be an integer between 1 and 255');
            }
            
            if (!Number.isInteger(species) || species < 1 || species > 65535) {
                errors.push('Species must be an integer between 1 and 65535');
            }
            
            return {
                isValid: errors.length === 0,
                errors
            };
        },

        /**
         * Check if a classifier is valid (simple boolean version)
         * @param {number} family - Family (1-255)
         * @param {number} genus - Genus (1-255)
         * @param {number} species - Species (1-65535)
         * @returns {boolean} True if all numbers are within valid ranges
         */
        isValidClassifier: function(family, genus, species) {
            return this.validateClassifier(family, genus, species).isValid;
        },

        /**
         * Search classifiers by name (case-insensitive)
         * @param {string} searchTerm - Search term to match against names
         * @returns {array} Array of matching classifier objects
         */
        searchClassifiers: function(searchTerm) {
            if (!this.KNOWN_CLASSIFIERS) return [];
            const term = searchTerm.toLowerCase();
            return this.KNOWN_CLASSIFIERS.filter(c => 
                c.name.toLowerCase().includes(term)
            );
        },

        /**
         * Find all known classifiers for a specific family
         * @param {number} family - Family number
         * @returns {array} Array of matching classifier objects
         */
        findClassifiersByFamily: function(family) {
            if (!this.KNOWN_CLASSIFIERS) return [];
            return this.KNOWN_CLASSIFIERS.filter(c => c.family === family);
        },

        /**
         * Find all known classifiers for a specific genus within a family
         * @param {number} family - Family number
         * @param {number} genus - Genus number
         * @returns {array} Array of matching classifier objects
         */
        findClassifiersByGenus: function(family, genus) {
            if (!this.KNOWN_CLASSIFIERS) return [];
            return this.KNOWN_CLASSIFIERS.filter(c => c.family === family && c.genus === genus);
        },

        /**
         * Check if a classifier is documented (has a known name)
         * @param {number} family - Family number
         * @param {number} genus - Genus number
         * @param {number} species - Species number
         * @returns {boolean} True if the classifier has a documented name
         */
        isDocumented: function(family, genus, species) {
            return this.getClassifierName(family, genus, species) !== null;
        }
    };
    
})();
