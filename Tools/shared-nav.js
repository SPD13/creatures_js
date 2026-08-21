/**
 * Creatures Tools Shared Navigation Component
 * Provides a unified navigation system across all Creatures tools
 */

(function() {
    'use strict';
    
    // Tool definitions with their metadata
    const TOOLS = [
        {
                "id": "script-docs",
                "name": "Script Docs",
                "description": "Browse CAOS script documentation and source code",
                "path": "script-docs/index.html",
                "formats": ".cos, .md"
        },
        {
                "id": "chemical-doc",
                "name": "Chemical Docs",
                "description": "Browse documentation for Creatures 3 chemicals",
                "path": "chemical-doc/index.html",
                "formats": ".md docs"
        },
        {
                "id": "wiki",
                "name": "Documentation Wiki",
                "description": "Browse Creatures 3 Web Rebuild documentation",
                "path": "wiki/index.html",
                "formats": ".md articles"
        }
];
    
    // Navigation state
    let isMenuOpen = false;
    let currentTool = null;
    
    /**
     * Detect current tool based on URL path
     */
    function detectCurrentTool() {
        const path = window.location.pathname;
        const filename = path.split('/').pop();
        
        // Check if we're on the main index page
        if (filename === 'index.html' && path.includes('Tools/index.html')) {
            return 'home';
        }
        
        // Check each tool directory
        for (const tool of TOOLS) {
            if (tool.id !== 'home' && path.includes(`/${tool.id}/`)) {
                return tool.id;
            }
        }
        
        return null;
    }
    
    /**
     * Generate the navigation HTML structure
     */
    function generateNavHTML() {
        const currentToolId = detectCurrentTool();
        const isInSubdirectory = window.location.pathname.includes('/Tools/') && !window.location.pathname.endsWith('/Tools/index.html');
        const pathPrefix = isInSubdirectory ? '../' : '';
        
        const toolItems = TOOLS.map(tool => {
            const isActive = tool.id === currentToolId;
            const activeClass = isActive ? ' active' : '';
            const toolPath = pathPrefix + tool.path;
            
            return `
                <a href="${toolPath}" class="creatures-nav-item${activeClass}" data-tool="${tool.id}">
                    <span class="creatures-nav-item-title">${tool.name}</span>
                    <span class="creatures-nav-item-desc">${tool.description}</span>
                    ${tool.formats ? `<span class="creatures-nav-item-desc">${tool.formats}</span>` : ''}
                </a>
            `;
        }).join('');
        
        const homePath = pathPrefix + 'wiki/index.html';
        const currentTool = TOOLS.find(t => t.id === currentToolId);
        const toolSuffix = (currentTool && currentTool.id !== 'home') ? ` <span class="creatures-nav-title-tool">— ${currentTool.name}</span>` : '';

        return `
            <!-- Creatures Tools Navigation -->
            <div class="creatures-nav-bar">
                <a href="${homePath}" class="creatures-nav-title">Creatures Tools${toolSuffix}</a>
                <button class="creatures-nav-hamburger" id="creatures-nav-toggle">
                    ☰
                </button>
            </div>
            
            <div class="creatures-nav-overlay" id="creatures-nav-overlay"></div>
            
            <div class="creatures-nav-menu" id="creatures-nav-menu">
                <div class="creatures-nav-menu-header">
                    <h2>Creatures Tools</h2>
                    <p>File format viewers and utilities</p>
                    <button class="creatures-nav-close" id="creatures-nav-close">×</button>
                </div>
                <div class="creatures-nav-menu-items">
                    ${toolItems}
                </div>
            </div>
        `;
    }
    
    /**
     * Initialize navigation functionality
     */
    function initNavigation() {
        const hamburger = document.getElementById('creatures-nav-toggle');
        const closeBtn = document.getElementById('creatures-nav-close');
        const overlay = document.getElementById('creatures-nav-overlay');
        const menu = document.getElementById('creatures-nav-menu');
        
        // Toggle menu function
        function toggleMenu() {
            isMenuOpen = !isMenuOpen;
            menu.classList.toggle('open', isMenuOpen);
            overlay.classList.toggle('visible', isMenuOpen);
            document.body.style.overflow = isMenuOpen ? 'hidden' : '';
        }
        
        // Close menu function
        function closeMenu() {
            isMenuOpen = false;
            menu.classList.remove('open');
            overlay.classList.remove('visible');
            document.body.style.overflow = '';
        }
        
        // Event listeners
        if (hamburger) {
            hamburger.addEventListener('click', toggleMenu);
        }
        
        if (closeBtn) {
            closeBtn.addEventListener('click', closeMenu);
        }
        
        if (overlay) {
            overlay.addEventListener('click', closeMenu);
        }
        
        // Close menu on escape key
        document.addEventListener('keydown', function(e) {
            if (e.key === 'Escape' && isMenuOpen) {
                closeMenu();
            }
        });
        
        // Close menu when navigating to a new tool
        const navItems = document.querySelectorAll('.creatures-nav-item');
        navItems.forEach(item => {
            item.addEventListener('click', function(e) {
                // Allow navigation but close menu
                closeMenu();
            });
        });
        
        // Handle window resize
        window.addEventListener('resize', function() {
            if (window.innerWidth > 768 && isMenuOpen) {
                closeMenu();
            }
        });
    }
    
    /**
     * Inject navigation into the page
     */
    function injectNavigation() {
        // Check if navigation already exists
        if (document.querySelector('.creatures-nav-bar')) {
            return;
        }
        
        // Create navigation container
        const navContainer = document.createElement('div');
        navContainer.innerHTML = generateNavHTML();
        
        // Insert navigation at the beginning of body
        document.body.insertBefore(navContainer.firstElementChild, document.body.firstChild);
        document.body.insertBefore(navContainer.children[0], document.body.children[1]); // overlay
        document.body.insertBefore(navContainer.children[0], document.body.children[2]); // menu
        
        // Add body class for styling
        document.body.classList.add('creatures-nav-enabled');
        
        // Initialize navigation functionality
        initNavigation();
    }
    
    /**
     * Initialize the navigation system
     */
    function init() {
        // Wait for DOM to be ready
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', function() {
                injectNavigation();
            });
        } else {
            injectNavigation();
        }
    }
    
    /**
     * Public API
     */
    window.CreaturesNav = {
        init: init,
        tools: TOOLS,
        getCurrentTool: detectCurrentTool,
        isMenuOpen: function() { return isMenuOpen; }
    };
    
    // Auto-initialize
    init();
})();
