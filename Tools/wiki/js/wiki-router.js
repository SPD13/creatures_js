/**
 * Creatures 3 Documentation Wiki - Router Module
 * Handles hash-based URL routing for article navigation
 */

(function() {
    'use strict';

    /**
     * WikiRouter class
     * Manages URL hash-based navigation
     */
    class WikiRouter {
        constructor() {
            this.listeners = [];
            this.currentRoute = null;
            this._boundHashChange = this._onHashChange.bind(this);
        }

        /**
         * Initialize the router
         */
        init() {
            window.addEventListener('hashchange', this._boundHashChange);
            // Process initial hash
            this._onHashChange();
        }

        /**
         * Destroy the router and remove event listeners
         */
        destroy() {
            window.removeEventListener('hashchange', this._boundHashChange);
            this.listeners = [];
        }

        /**
         * Add a listener for route changes
         * @param {Function} callback - Function to call on route change
         * @returns {Function} Unsubscribe function
         */
        onNavigate(callback) {
            this.listeners.push(callback);
            return () => {
                this.listeners = this.listeners.filter(l => l !== callback);
            };
        }

        /**
         * Navigate to an article
         * @param {string} articleId - The article ID to navigate to
         */
        navigateTo(articleId) {
            if (articleId) {
                window.location.hash = `/article/${articleId}`;
            } else {
                window.location.hash = '/';
            }
        }

        /**
         * Navigate to a heading within the current article
         * @param {string} headingId - The heading ID to scroll to
         */
        scrollToHeading(headingId) {
            const element = document.getElementById(headingId);
            if (element) {
                element.scrollIntoView({ behavior: 'smooth', block: 'start' });
            }
        }

        /**
         * Get the current article ID from the URL
         * @returns {string|null} The current article ID or null
         */
        getCurrentArticle() {
            return this.currentRoute ? this.currentRoute.articleId : null;
        }

        /**
         * Get the current route object
         * @returns {Object} The current route
         */
        getCurrentRoute() {
            return this.currentRoute;
        }

        /**
         * Parse the current hash and extract route information
         * @returns {Object} Parsed route object
         */
        _parseHash() {
            const hash = window.location.hash.slice(1) || '/';

            // Match article routes: #/article/article-id
            const articleMatch = hash.match(/^\/article\/(.+)$/);
            if (articleMatch) {
                return {
                    type: 'article',
                    articleId: decodeURIComponent(articleMatch[1])
                };
            }

            // Match heading routes: #heading-id (within current article)
            if (hash.startsWith('#')) {
                return {
                    type: 'heading',
                    headingId: hash.slice(1)
                };
            }

            // Default home route
            return {
                type: 'home',
                articleId: null
            };
        }

        /**
         * Handle hash change events
         * @private
         */
        _onHashChange() {
            const newRoute = this._parseHash();
            const oldRoute = this.currentRoute;

            // Check if route actually changed
            if (oldRoute &&
                oldRoute.type === newRoute.type &&
                oldRoute.articleId === newRoute.articleId) {
                // Same article, might be heading navigation
                if (newRoute.type === 'heading') {
                    this.scrollToHeading(newRoute.headingId);
                }
                return;
            }

            this.currentRoute = newRoute;

            // Notify all listeners
            this.listeners.forEach(callback => {
                try {
                    callback(newRoute, oldRoute);
                } catch (error) {
                    console.error('WikiRouter: Error in navigation listener:', error);
                }
            });
        }

        /**
         * Build a URL for an article
         * @param {string} articleId - The article ID
         * @returns {string} The full hash URL
         */
        buildArticleUrl(articleId) {
            return `#/article/${encodeURIComponent(articleId)}`;
        }

        /**
         * Check if a URL points to a specific article
         * @param {string} articleId - The article ID to check
         * @returns {boolean} True if URL matches the article
         */
        isCurrentArticle(articleId) {
            return this.currentRoute &&
                   this.currentRoute.type === 'article' &&
                   this.currentRoute.articleId === articleId;
        }

        /**
         * Go back in history
         */
        goBack() {
            window.history.back();
        }

        /**
         * Go forward in history
         */
        goForward() {
            window.history.forward();
        }
    }

    // Export to global scope
    window.WikiRouter = WikiRouter;
})();
