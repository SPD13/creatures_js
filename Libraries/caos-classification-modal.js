/**
 * CAOS Classification Modal - Shared classification details popup system
 * Provides detailed classification information for class numbers (family genus species)
 * Shared between Tools/caos-catalog and Main Game debug console
 */

class CAOSClassificationModal {
    constructor() {
        this.modal = null;
        this.modalBody = null;
        this.isInitialized = false;
        
        this.setupModal();
    }

    /**
     * Set up the modal HTML structure
     */
    setupModal() {
        // Check if modal already exists
        let modal = document.getElementById('classificationModal');
        if (!modal) {
            // Create modal if it doesn't exist
            modal = document.createElement('div');
            modal.id = 'classificationModal';
            modal.className = 'caos-command-modal';
            modal.innerHTML = `
                <div class="caos-modal-content">
                    <div class="caos-modal-header">
                        <h2>Classification Details</h2>
                        <span class="caos-modal-close" onclick="window.caosClassificationModal.hideModal()">&times;</span>
                    </div>
                    <div class="caos-modal-body" id="classificationModalBody">
                        <!-- Content will be populated dynamically -->
                    </div>
                </div>
            `;
            document.body.appendChild(modal);
        }

        this.modal = modal;
        this.modalBody = document.getElementById('classificationModalBody');
        
        // Setup event listeners
        this.setupEventListeners();
        this.isInitialized = true;
    }

    /**
     * Set up modal event listeners
     */
    setupEventListeners() {
        // Close modal when clicking outside
        this.modal.addEventListener('click', (e) => {
            if (e.target === this.modal) {
                this.hideModal();
            }
        });

        // Close modal with Escape key
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && this.modal.style.display === 'block') {
                this.hideModal();
            }
        });
    }

    /**
     * Show classification details modal
     * @param {number} family - Family number
     * @param {number} genus - Genus number  
     * @param {number} species - Species number
     */
    showClassificationDetails(family, genus, species) {
        if (!this.isInitialized) {
            console.error('Classification modal not initialized');
            return;
        }

        if (!window.Classification) {
            console.error('Classification system not available');
            this.showError('Classification system not loaded');
            return;
        }

        // Handle wildcards by finding all matching classifiers
        const matchingClassifiers = this.findMatchingClassifiers(family, genus, species);
        
        // Get classification info for display
        const familyInfo = family === 0 ? null : window.Classification.getFamilyInfo(family);
        const genusInfo = (family === 0 || genus === 0) ? null : window.Classification.getGenusInfo(family, genus);
        const specificClassifier = (family === 0 || genus === 0 || species === 0) ? null : 
            window.Classification.getClassifierInfo(family, genus, species);
        
        // Build the modal content
        let classificationTitle;
        if (family === 0 && genus === 0 && species === 0) {
            classificationTitle = 'Universal Wildcard (0 0 0)';
        } else if (family === 0) {
            classificationTitle = `Wildcard Family (0 ${genus} ${species})`;
        } else if (genus === 0) {
            classificationTitle = `Wildcard Genus (${family} 0 ${species})`;
        } else if (species === 0) {
            classificationTitle = `Wildcard Species (${family} ${genus} 0)`;
        } else {
            classificationTitle = `Classifier ${family} ${genus} ${species}`;
        }
        
        let hierarchyHtml = '';
        if (family === 0) {
            hierarchyHtml = '<div class="wildcard-info">🃏 <strong>Wildcard Family</strong> - Matches any family</div>';
        } else {
            hierarchyHtml = `<div class="family-info">👥 <strong>Family ${family}</strong>${familyInfo ? `: ${familyInfo.name}` : ''}</div>`;
            
            if (genus === 0) {
                hierarchyHtml += '<div class="wildcard-info">🃏 <strong>Wildcard Genus</strong> - Matches any genus in this family</div>';
            } else {
                hierarchyHtml += `<div class="genus-info">📁 <strong>Genus ${genus}</strong>${genusInfo ? `: ${genusInfo.name}` : ''}</div>`;
                
                if (species === 0) {
                    hierarchyHtml += '<div class="wildcard-info">🃏 <strong>Wildcard Species</strong> - Matches any species in this genus</div>';
                } else {
                    hierarchyHtml += `<div class="species-info">🏷️ <strong>Species ${species}</strong></div>`;
                }
            }
        }
        
        this.modalBody.innerHTML = `
            <div class="caos-command-details">
                <div class="caos-command-header">
                    <h3 class="caos-command-name">${classificationTitle}</h3>
                </div>
                
                <div class="caos-command-description">
                    <h4>Classification Hierarchy</h4>
                    <div class="classification-hierarchy">
                        ${hierarchyHtml}
                    </div>
                </div>

                ${specificClassifier ? `
                <div class="caos-command-description">
                    <h4>Documented Entry</h4>
                    <p><strong>${specificClassifier.name}</strong></p>
                    <p><em>Contributed by: ${specificClassifier.contributor}</em></p>
                </div>
                ` : ''}

                ${matchingClassifiers.length > 0 ? `
                <div class="caos-command-description">
                    <h4>Matching Classifiers (${matchingClassifiers.length} found)</h4>
                    <div class="classifier-search-container">
                        <div class="classifier-search-controls">
                            <input type="text" 
                                   class="classifier-search-input" 
                                   placeholder="🔍 Search classifiers by name, family, genus, or contributor..." 
                                   id="classifierSearchInput">
                            <div class="classifier-search-stats" id="classifierSearchStats">
                                Showing ${matchingClassifiers.length} of ${matchingClassifiers.length} results
                            </div>
                        </div>
                        <div class="classifier-results-container">
                            <div class="matching-classifiers" id="matchingClassifiersContainer">
                                ${this.renderClassifierMatches(matchingClassifiers)}
                            </div>
                        </div>
                    </div>
                </div>
                ` : family !== 0 && genus !== 0 && species !== 0 ? `
                <div class="caos-command-description">
                    <h4>Status</h4>
                    <p class="warning">⚠️ This specific classifier is not documented in the current database.</p>
                    <p>However, it uses valid family and genus ranges.</p>
                </div>
                ` : ''}

                <div class="caos-command-example">
                    <h4>Usage in CAOS</h4>
                    <div class="caos-example-code">NEW: SIMP ${family} ${genus} ${species}
ENUM ${family} ${genus} ${species}
CLAS ${family} ${genus} ${species}
${family === 0 || genus === 0 || species === 0 ? 'Note: Wildcards (0) will match any value in their position' : ''}</div>
                </div>

                ${!specificClassifier && familyInfo ? `
                <div class="caos-command-description">
                    <h4>Family Information</h4>
                    <p><strong>${familyInfo.name}</strong></p>
                    <p>${familyInfo.description || 'No description available.'}</p>
                </div>
                ` : ''}

                ${!specificClassifier && genusInfo ? `
                <div class="caos-command-description">
                    <h4>Genus Information</h4>
                    <p><strong>${genusInfo.name}</strong></p>
                    <p>${genusInfo.description || 'No description available.'}</p>
                </div>
                ` : ''}

                <div class="caos-command-implementation">
                    <h4>Validation</h4>
                    <div class="caos-handler-code">
                        ${this.validateClassificationRanges(family, genus, species) ? 
                            '✅ Valid classifier ranges' : 
                            '❌ Invalid classifier ranges'
                        }
                    </div>
                </div>
            </div>
        `;
        
        // Setup search functionality if there are matching classifiers
        if (matchingClassifiers.length > 0) {
            this.setupClassifierSearch(matchingClassifiers);
        }
        
        this.showModal();
    }

    /**
     * Show the modal
     */
    showModal() {
        if (this.modal) {
            this.modal.style.display = 'block';
        }
    }

    /**
     * Hide the modal
     */
    hideModal() {
        if (this.modal) {
            this.modal.style.display = 'none';
        }
    }

    /**
     * Show error message in modal
     */
    showError(message) {
        if (this.modalBody) {
            this.modalBody.innerHTML = `
                <div class="caos-command-error">
                    <p>Error: ${message}</p>
                </div>
            `;
            this.showModal();
        }
    }

    /**
     * Find matching classifiers for wildcards
     */
    findMatchingClassifiers(family, genus, species) {
        if (!window.Classification || !window.Classification.KNOWN_CLASSIFIERS) {
            return [];
        }
        
        return window.Classification.KNOWN_CLASSIFIERS.filter(classifier => {
            const familyMatch = family === 0 || classifier.family === family;
            const genusMatch = genus === 0 || classifier.genus === genus;
            const speciesMatch = species === 0 || classifier.species === species;
            
            return familyMatch && genusMatch && speciesMatch;
        });
    }

    /**
     * Validate classification ranges
     */
    validateClassificationRanges(family, genus, species) {
        // Validate ranges (0 is wildcard, 1-255 for family/genus, 1-65535 for species)
        const isValidFamily = family === 0 || (family >= 1 && family <= 255);
        const isValidGenus = genus === 0 || (genus >= 1 && genus <= 255);
        const isValidSpecies = species === 0 || (species >= 1 && species <= 65535);
        
        return isValidFamily && isValidGenus && isValidSpecies;
    }

    /**
     * Render classifier matches HTML
     */
    renderClassifierMatches(classifiers) {
        if (!classifiers || classifiers.length === 0) {
            return '<div class="no-classifiers">No matching classifiers found.</div>';
        }
        
        return classifiers.map(classifier => {
            const familyInfo = window.Classification?.getFamilyInfo(classifier.family);
            const genusInfo = window.Classification?.getGenusInfo(classifier.family, classifier.genus);
            
            return `
                <div class="classifier-match" data-family="${classifier.family}" data-genus="${classifier.genus}" data-species="${classifier.species}">
                    <div class="classifier-header">
                        <span class="classifier-class-number">${classifier.classNumber}</span>
                        <span class="classifier-name">${classifier.name}</span>
                    </div>
                    <div class="classifier-details">
                        <div class="classifier-hierarchy">
                            <span class="family-info">👥 Family ${classifier.family}${familyInfo ? `: ${familyInfo.name}` : ''}</span>
                            <span class="genus-info">📁 Genus ${classifier.genus}${genusInfo ? `: ${genusInfo.name}` : ''}</span>
                            <span class="species-info">🏷️ Species ${classifier.species}</span>
                        </div>
                        <div class="classifier-contributor">
                            <span class="contributor-label">Contributed by:</span>
                            <span class="contributor-name">${classifier.contributor}</span>
                        </div>
                    </div>
                </div>
            `;
        }).join('');
    }

    /**
     * Setup classifier search functionality
     */
    setupClassifierSearch(classifiers) {
        const searchInput = document.getElementById('classifierSearchInput');
        const searchStats = document.getElementById('classifierSearchStats');
        const resultsContainer = document.getElementById('matchingClassifiersContainer');
        
        if (!searchInput || !searchStats || !resultsContainer) {
            console.warn('Classification search elements not found');
            return;
        }
        
        let filteredClassifiers = [...classifiers];
        let searchTimeout;
        
        // Function to update display
        const updateResults = () => {
            const html = this.renderClassifierMatches(filteredClassifiers);
            resultsContainer.innerHTML = html;
            searchStats.textContent = `Showing ${filteredClassifiers.length} of ${classifiers.length} results`;
        };
        
        // Function to filter classifiers
        const filterClassifiers = (searchTerm) => {
            if (!searchTerm.trim()) {
                filteredClassifiers = [...classifiers];
            } else {
                const term = searchTerm.toLowerCase();
                filteredClassifiers = classifiers.filter(classifier => {
                    return (
                        classifier.name.toLowerCase().includes(term) ||
                        classifier.contributor.toLowerCase().includes(term) ||
                        classifier.classNumber.includes(term) ||
                        classifier.family.toString().includes(term) ||
                        classifier.genus.toString().includes(term) ||
                        classifier.species.toString().includes(term)
                    );
                });
            }
            updateResults();
        };
        
        // Add search input handler with debouncing
        searchInput.addEventListener('input', (e) => {
            const searchTerm = e.target.value;
            
            // Clear existing timeout
            if (searchTimeout) {
                clearTimeout(searchTimeout);
            }
            
            // Debounce search to improve performance
            searchTimeout = setTimeout(() => {
                filterClassifiers(searchTerm);
            }, 300);
        });
        
        // Add click handlers for classifier matches
        resultsContainer.addEventListener('click', (e) => {
            const classifierMatch = e.target.closest('.classifier-match');
            if (classifierMatch) {
                const family = parseInt(classifierMatch.dataset.family);
                const genus = parseInt(classifierMatch.dataset.genus);
                const species = parseInt(classifierMatch.dataset.species);
                
                if (!isNaN(family) && !isNaN(genus) && !isNaN(species)) {
                    // Show detailed view for this specific classifier
                    this.showClassificationDetails(family, genus, species);
                }
            }
        });
        
        // Add keyboard shortcuts for search
        searchInput.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                searchInput.value = '';
                filterClassifiers('');
            }
        });
        
        // Initial display
        updateResults();
        
        // Focus the search input for better UX
        setTimeout(() => {
            searchInput.focus();
        }, 100);
    }
}

// Initialize global instance
if (typeof window !== 'undefined') {
    window.CAOSClassificationModal = CAOSClassificationModal;
    window.caosClassificationModal = new CAOSClassificationModal();
}

// Export for module systems
if (typeof module !== 'undefined' && module.exports) {
    module.exports = CAOSClassificationModal;
}
