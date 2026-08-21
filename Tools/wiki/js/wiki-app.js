/**
 * Creatures 3 Documentation Wiki - Main Application
 * Main controller that initializes and coordinates all wiki components
 */

(function() {
    'use strict';

    const INDEX_PATH = '../../DOCUMENTATION/articles/index.json';
    const ARTICLES_PATH = '../../DOCUMENTATION/articles/';
    const SEARCH_INDEX_PATH = 'search-index.json';

    /**
     * WikiApp class
     * Main application controller
     */
    class WikiApp {
        constructor() {
            this.index = null;
            this.router = null;
            this.navigation = null;
            this.renderer = null;
            this.search = null;
            this.searchUI = null;

            // DOM elements
            this.elements = {
                sidebar: document.getElementById('sidebar'),
                navigation: document.getElementById('navigation'),
                content: document.getElementById('content'),
                toc: document.getElementById('tocNav'),
                overlay: document.getElementById('overlay'),
                menuToggle: document.getElementById('menuToggle'),
                collapseAll: document.getElementById('collapseAll'),
                searchInput: document.getElementById('searchInput'),
                searchClear: document.getElementById('searchClear'),
                searchResults: document.getElementById('searchResults'),
                searchCount: document.getElementById('searchCount'),
                searchList: document.getElementById('searchList'),
                searchClose: document.getElementById('searchClose')
            };
        }

        /**
         * Initialize the wiki application
         */
        async init() {
            try {
                // Load the documentation index
                await this._loadIndex();

                // Initialize components. Navigation and renderer must exist
                // BEFORE the router, because router.init() fires the initial
                // hash-change listener synchronously and _handleNavigation
                // dereferences this.navigation / this.renderer.
                this._initNavigation();
                this._initRenderer();
                this._initRouter();
                await this._initSearch();
                this._initMobileMenu();

                // Handle initial route
                const route = this.router.getCurrentRoute();
                if (route && route.type === 'article' && route.articleId) {
                    this._handleNavigation(route);
                } else {
                    // Navigate to first article if no specific article requested
                    const firstArticle = this.navigation.getFirstArticle();
                    if (firstArticle) {
                        this.router.navigateTo(firstArticle.id);
                    }
                }

                console.log('WikiApp: Initialized successfully');
            } catch (error) {
                console.error('WikiApp: Initialization failed:', error);
                this._showError('Failed to initialize wiki', error.message);
            }
        }

        /**
         * Navigate to an article
         * @param {string} articleId - The article ID to navigate to
         */
        navigateTo(articleId) {
            this.router.navigateTo(articleId);
        }

        // Private methods

        /**
         * Load the documentation index
         * @private
         */
        async _loadIndex() {
            try {
                const response = await fetch(INDEX_PATH);
                if (!response.ok) {
                    throw new Error(`Failed to load index: ${response.status}`);
                }
                this.index = await response.json();
            } catch (error) {
                console.error('WikiApp: Failed to load index:', error);
                throw error;
            }
        }

        /**
         * Initialize the router
         * @private
         */
        _initRouter() {
            this.router = new WikiRouter();

            this.router.onNavigate((route, oldRoute) => {
                this._handleNavigation(route);
            });

            this.router.init();
        }

        /**
         * Initialize the navigation
         * @private
         */
        _initNavigation() {
            this.navigation = new WikiNavigation(
                this.elements.navigation,
                this.index,
                (articleId) => {
                    this.router.navigateTo(articleId);
                    this._closeMobileMenu();
                }
            );

            this.navigation.render();

            // Collapse all button
            if (this.elements.collapseAll) {
                this.elements.collapseAll.addEventListener('click', () => {
                    this.navigation.collapseAll();
                });
            }
        }

        /**
         * Initialize the renderer
         * @private
         */
        _initRenderer() {
            // The index is passed in so the renderer can turn article-to-article
            // markdown references into wiki routes. _loadIndex() has already run.
            this.renderer = new WikiRenderer(
                this.elements.content,
                this.elements.toc,
                ARTICLES_PATH,
                this.index
            );
        }

        /**
         * Initialize search with full-text index
         * @private
         */
        async _initSearch() {
            try {
                // Load the pre-built search index
                const response = await fetch(SEARCH_INDEX_PATH);
                if (!response.ok) {
                    throw new Error(`Failed to load search index: ${response.status}`);
                }
                const searchIndex = await response.json();

                this.search = new WikiSearch(searchIndex);

                this.searchUI = new WikiSearchUI(
                    this.search,
                    {
                        input: this.elements.searchInput,
                        clear: this.elements.searchClear,
                        results: this.elements.searchResults,
                        count: this.elements.searchCount,
                        list: this.elements.searchList,
                        close: this.elements.searchClose
                    },
                    (articleId) => {
                        this.router.navigateTo(articleId);
                    }
                );

                console.log('WikiApp: Search initialized with full-text index');
            } catch (error) {
                console.warn('WikiApp: Failed to load search index, search disabled:', error);
            }
        }

        /**
         * Initialize mobile menu
         * @private
         */
        _initMobileMenu() {
            // Menu toggle
            if (this.elements.menuToggle) {
                this.elements.menuToggle.addEventListener('click', () => {
                    this._toggleMobileMenu();
                });
            }

            // Overlay click closes menu
            if (this.elements.overlay) {
                this.elements.overlay.addEventListener('click', () => {
                    this._closeMobileMenu();
                });
            }

            // Close menu on escape
            document.addEventListener('keydown', (e) => {
                if (e.key === 'Escape') {
                    this._closeMobileMenu();
                }
            });

            // Close menu on window resize to desktop
            window.addEventListener('resize', () => {
                if (window.innerWidth > 900) {
                    this._closeMobileMenu();
                }
            });
        }

        /**
         * Handle navigation route change
         * @private
         */
        async _handleNavigation(route) {
            if (!route || route.type !== 'article' || !route.articleId) {
                return;
            }

            const article = this.navigation.findArticle(route.articleId);
            if (!article) {
                this._showError('Article not found', `No article with ID "${route.articleId}" exists.`);
                return;
            }

            // Update navigation highlight
            this.navigation.setActive(route.articleId);

            // Get category path for breadcrumbs
            const categoryPath = this.navigation.getCategoryPath(route.articleId);

            // Render the article
            await this.renderer.renderArticle(article, categoryPath);

            // Update page title
            document.title = `${article.title} - Creatures 3 Documentation`;
        }

        /**
         * Toggle mobile menu
         * @private
         */
        _toggleMobileMenu() {
            const isOpen = this.elements.sidebar.classList.toggle('open');
            this.elements.overlay.classList.toggle('visible', isOpen);
            document.body.style.overflow = isOpen ? 'hidden' : '';
        }

        /**
         * Close mobile menu
         * @private
         */
        _closeMobileMenu() {
            this.elements.sidebar.classList.remove('open');
            this.elements.overlay.classList.remove('visible');
            document.body.style.overflow = '';
        }

        /**
         * Show an error in the content area
         * @private
         */
        _showError(title, message) {
            this.elements.content.innerHTML = `
                <div class="wiki-error">
                    <div class="wiki-error-icon">:(</div>
                    <h2 class="wiki-error-title">${this._escapeHtml(title)}</h2>
                    <p class="wiki-error-message">${this._escapeHtml(message)}</p>
                </div>
            `;
        }

        /**
         * Escape HTML
         * @private
         */
        _escapeHtml(text) {
            const div = document.createElement('div');
            div.textContent = text;
            return div.innerHTML;
        }
    }

    // Initialize the app when DOM is ready
    function initApp() {
        const app = new WikiApp();
        app.init();

        // Expose app globally for debugging
        window.wikiApp = app;
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initApp);
    } else {
        initApp();
    }
})();
