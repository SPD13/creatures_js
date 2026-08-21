/**
 * CAOS Command Catalog - Shared Library
 * Contains modal functionality for CAOS command details
 * Shared between Tools/caos-catalog and Main Game debug console
 * 
 * Note: CAOS_COMMANDS data is loaded from external commands.js file
 */

/**
 * CAOS Command Modal Manager
 * Handles modal creation, display, and interaction for CAOS command details
 */
class CAOSCommandModal {
    constructor() {
        this.modalElement = null;
        this.isOpen = false;
        this.commandIndex = {}; // Initialize empty, will be built when CAOS_COMMANDS is available
    }
    
    /**
     * Build a lookup index for fast command searches
     */
    buildCommandIndex() {
        const index = {};
        
        // Check if CAOS_COMMANDS is loaded (should be available from commands.js)
        if (!window.CAOS_COMMANDS) {
            // Don't warn on initial load, only when explicitly requested
            return index;
        }
        
        // Index all command types
        const commandTypes = ['commands', 'integerRValues', 'floatRValues', 'stringRValues', 'agentRValues', 'variables'];
        
        commandTypes.forEach(type => {
            if (window.CAOS_COMMANDS[type]) {
                window.CAOS_COMMANDS[type].forEach(cmd => {
                    index[cmd.name.toLowerCase()] = cmd;
                });
            }
        });
        
        return index;
    }
    
    /**
     * Update command index after CAOS_COMMANDS is loaded
     */
    updateCommandIndex() {
        this.commandIndex = this.buildCommandIndex();
    }
    
    /**
     * Find a command by name (case-insensitive).
     *
     * Accepts both top-level command names ("SETV", "TARG") and compound
     * subcommand forms ("NEW: SIMP", "BRN: DMPB"). The catalog keys
     * subcommands by their unqualified suffix only, so for compound input we
     * fall back to the trailing whitespace-delimited token. All catalog names
     * are unique, so the suffix lookup is unambiguous.
     */
    findCommand(commandName) {
        if (Object.keys(this.commandIndex).length === 0) {
            this.updateCommandIndex();
        }

        const lower = String(commandName ?? '').toLowerCase().trim();
        if (!lower) return null;

        if (this.commandIndex[lower]) {
            return this.commandIndex[lower];
        }

        const tokens = lower.split(/\s+/);
        if (tokens.length > 1) {
            const suffix = tokens[tokens.length - 1];
            if (this.commandIndex[suffix]) {
                return this.commandIndex[suffix];
            }
        }

        return null;
    }
    
    /**
     * Create modal HTML structure
     */
    createModal() {
        if (this.modalElement) {
            return this.modalElement;
        }
        
        const modal = document.createElement('div');
        modal.id = 'caosCommandModal';
        modal.className = 'caos-command-modal';
        modal.innerHTML = `
            <div class="caos-modal-content">
                <div class="caos-modal-header">
                    <h2 id="caosModalTitle">Command Details</h2>
                    <span class="caos-modal-close" onclick="window.caosCommandModal?.hideModal()">&times;</span>
                </div>
                <div class="caos-modal-body" id="caosModalBody">
                    <!-- Command details will be inserted here -->
                </div>
            </div>
        `;
        
        // Add click handler to close modal when clicking backdrop
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                this.hideModal();
            }
        });
        
        // Add escape key handler
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && this.isOpen) {
                this.hideModal();
            }
        });
        
        document.body.appendChild(modal);
        this.modalElement = modal;
        
        return modal;
    }
    
    /**
     * Generate HTML for command details
     */
    generateCommandHTML(command) {
        if (!command) {
            return '<div class="caos-command-error">Command not found in catalog.</div>';
        }
        
        let html = `
            <div class="caos-command-details">
                <div class="caos-command-header">
                    <h3 class="caos-command-name">${this.escapeHtml(command.name)}</h3>
                    <span class="caos-command-type">${this.escapeHtml(command.type || 'command')}</span>
                    <span class="caos-command-category">${this.escapeHtml(command.category || 'general')}</span>
                </div>
        `;

        if (command.description) {
            html += `
                <div class="caos-command-description">
                    <h4>Description:</h4>
                    <div class="caos-description-text">${command.description}</div>
                </div>
            `;
        }

        html += `
                <div class="caos-command-syntax">
                    <h4>Syntax:</h4>
                    <code class="caos-syntax-code">${this.escapeHtml(command.syntax || command.name)}</code>
                </div>
        `;

        if (command.parameters && command.parameters.length > 0) {
            html += `
                <div class="caos-command-parameters">
                    <h4>Parameters:</h4>
                    <ul class="caos-parameter-list">
            `;
            command.parameters.forEach(param => {
                html += `
                    <li class="caos-parameter-item">
                        <span class="caos-param-name">${this.escapeHtml(param.name)}</span>
                        <span class="caos-param-type">(${this.escapeHtml(param.type)})</span>
                        <span class="caos-param-description">${this.escapeHtml(param.description)}</span>
                    </li>
                `;
            });
            html += `
                    </ul>
                </div>
            `;
        }

        if (command.example) {
            html += `
                <div class="caos-command-example">
                    <h4>Example:</h4>
                    <code class="caos-example-code">${this.escapeHtml(command.example)}</code>
                </div>
            `;
        }
        
        if (command.handler) {
            html += `
                <div class="caos-command-implementation">
                    <h4>Implementation:</h4>
                    <code class="caos-handler-code">${this.escapeHtml(command.handler)}</code>
                </div>
            `;
        }
        
        html += '</div>';
        return html;
    }
    
    /**
     * Show modal with command details
     */
    showCommandDetails(commandName) {
        const command = this.findCommand(commandName);
        const modal = this.createModal();

        const titleElement = modal.querySelector('#caosModalTitle');
        const bodyElement = modal.querySelector('#caosModalBody');

        if (titleElement && bodyElement) {
            // Preserve the caller-supplied name in the title so compound forms
            // like "NEW: SIMP" read as such, even though the catalog body is
            // keyed by the suffix entry ("SIMP"). Falls back to the catalog
            // entry's own name if no input was provided.
            const displayName = (commandName != null && String(commandName).trim() !== '')
                ? String(commandName).trim()
                : (command ? command.name : '');
            titleElement.textContent = command
                ? `CAOS Command: ${displayName}`
                : 'Command Not Found';
            bodyElement.innerHTML = this.generateCommandHTML(command);
        }

        modal.style.display = 'block';
        this.isOpen = true;

        // Focus the modal for accessibility
        modal.focus();
    }
    
    /**
     * Hide the modal
     */
    hideModal() {
        if (this.modalElement) {
            this.modalElement.style.display = 'none';
            this.isOpen = false;
        }
    }
    
    /**
     * Clean up modal resources
     */
    destroy() {
        if (this.modalElement) {
            this.modalElement.remove();
            this.modalElement = null;
            this.isOpen = false;
        }
    }
    
    /**
     * Escape HTML characters for safe display
     */
    escapeHtml(text) {
        if (typeof text !== 'string') return '';
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }
}

// Export for use in both environments
if (typeof module !== 'undefined' && module.exports) {
    // Node.js environment
    module.exports = { CAOSCommandModal };
} else {
    // Browser environment - make available globally
    window.CAOSCommandModal = CAOSCommandModal;
    
    // Create global instance
    window.caosCommandModal = new CAOSCommandModal();
    
    // Function to initialize with CAOS_COMMANDS data
    window.initCAOSCommandCatalog = function(commandsData) {
        // CAOS_COMMANDS should already be available globally from commands.js
        // This function just triggers a reindex in case it wasn't available during initial construction
        if (window.caosCommandModal) {
            window.caosCommandModal.updateCommandIndex();
        }
    };
}
