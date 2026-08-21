/**
 * Creatures 3 Documentation Wiki - Navigation Module
 * Handles the left sidebar navigation tree
 */

(function() {
    'use strict';

    const STORAGE_KEY = 'wiki-nav-expanded';

    /**
     * WikiNavigation class
     * Renders and manages the navigation tree
     */
    class WikiNavigation {
        /**
         * @param {HTMLElement} container - The navigation container element
         * @param {Object} index - The documentation index
         * @param {Function} onSelect - Callback when an article is selected
         */
        constructor(container, index, onSelect) {
            this.container = container;
            this.index = index;
            this.onSelect = onSelect;
            this.expandedCategories = this._loadExpandedState();
            this.activeArticleId = null;
            this.filterTerm = '';
        }

        /**
         * Render the navigation tree
         */
        render() {
            if (!this.index || !this.index.categories) {
                this.container.innerHTML = '<div class="wiki-nav-loading">No navigation data</div>';
                this._renderArticleCount(0);
                return;
            }

            const html = this.index.categories
                .map(category => this._renderCategory(category, 0))
                .join('');

            this.container.innerHTML = html;
            this._attachEventListeners();
            this._renderArticleCount(this._countArticles(this.index.categories));
        }

        /**
         * Count every article node in the navigation tree
         * @private
         * @param {Array} nodes - Categories/articles to walk
         * @returns {number}
         */
        _countArticles(nodes) {
            if (!Array.isArray(nodes)) return 0;
            let count = 0;
            for (const node of nodes) {
                if (node.type === 'article') {
                    count++;
                } else if (node.children) {
                    count += this._countArticles(node.children);
                }
            }
            return count;
        }

        /**
         * Write the article count strip below the search box
         * @private
         */
        _renderArticleCount(count) {
            const el = document.getElementById('articleCount');
            if (!el) return;
            el.textContent = `${count} article${count === 1 ? '' : 's'}`;
        }

        /**
         * Set the active article
         * @param {string} articleId - The article ID to highlight
         */
        setActive(articleId) {
            this.activeArticleId = articleId;

            // Remove active class from all articles
            this.container.querySelectorAll('.wiki-nav-article.active')
                .forEach(el => el.classList.remove('active'));

            // Add active class to current article
            if (articleId) {
                const activeLink = this.container.querySelector(
                    `.wiki-nav-article[data-id="${articleId}"]`
                );
                if (activeLink) {
                    activeLink.classList.add('active');
                    // Ensure parent categories are expanded
                    this._expandParents(activeLink);
                }
            }
        }

        /**
         * Filter navigation items by search term
         * @param {string} term - The search term
         */
        filter(term) {
            this.filterTerm = term.toLowerCase().trim();

            if (!this.filterTerm) {
                // Show all items
                this.container.querySelectorAll('.wiki-nav-category, .wiki-nav-article')
                    .forEach(el => {
                        el.style.display = '';
                    });
                return;
            }

            // Hide/show based on filter
            this._filterCategories(this.index.categories);
        }

        /**
         * Expand all categories
         */
        expandAll() {
            this.container.querySelectorAll('.wiki-nav-category')
                .forEach(el => {
                    el.classList.add('expanded');
                    const id = el.dataset.id;
                    if (id) this.expandedCategories.add(id);
                });
            this._saveExpandedState();
        }

        /**
         * Collapse all categories
         */
        collapseAll() {
            this.container.querySelectorAll('.wiki-nav-category')
                .forEach(el => {
                    el.classList.remove('expanded');
                });
            this.expandedCategories.clear();
            this._saveExpandedState();
        }

        /**
         * Toggle a category's expanded state
         * @param {string} categoryId - The category ID
         */
        toggleCategory(categoryId) {
            const category = this.container.querySelector(
                `.wiki-nav-category[data-id="${categoryId}"]`
            );
            if (!category) return;

            const isExpanded = category.classList.toggle('expanded');
            if (isExpanded) {
                this.expandedCategories.add(categoryId);
            } else {
                this.expandedCategories.delete(categoryId);
            }
            this._saveExpandedState();
        }

        /**
         * Find the first article in the navigation
         * @returns {Object|null} The first article object or null
         */
        getFirstArticle() {
            return this._findFirstArticle(this.index.categories);
        }

        /**
         * Find an article by ID
         * @param {string} articleId - The article ID
         * @returns {Object|null} The article object or null
         */
        findArticle(articleId) {
            return this._findArticleInCategories(articleId, this.index.categories);
        }

        /**
         * Get the category path for an article
         * @param {string} articleId - The article ID
         * @returns {Array} Array of category names
         */
        getCategoryPath(articleId) {
            const path = [];
            this._findCategoryPath(articleId, this.index.categories, path);
            return path;
        }

        // Private methods

        /**
         * Render a category and its children
         * @private
         */
        _renderCategory(category, level) {
            const hasChildren = category.children && category.children.length > 0;
            const isExpanded = this.expandedCategories.has(category.id) ||
                               (category.expanded === true);

            if (isExpanded && category.id) {
                this.expandedCategories.add(category.id);
            }

            const expandedClass = isExpanded ? ' expanded' : '';
            const toggleIcon = hasChildren ? '&#9658;' : '';

            let childrenHtml = '';
            if (hasChildren) {
                childrenHtml = category.children
                    .map(child => {
                        if (child.type === 'article') {
                            return this._renderArticle(child);
                        }
                        return this._renderCategory(child, level + 1);
                    })
                    .join('');
            }

            return `
                <div class="wiki-nav-category${expandedClass}"
                     data-id="${category.id}"
                     data-level="${level}">
                    <div class="wiki-nav-category-header">
                        <span class="wiki-nav-toggle">${toggleIcon}</span>
                        <span class="wiki-nav-category-name">${this._escapeHtml(category.name)}</span>
                    </div>
                    <div class="wiki-nav-children">
                        ${childrenHtml}
                    </div>
                </div>
            `;
        }

        /**
         * Render an article link
         * @private
         */
        _renderArticle(article) {
            const activeClass = article.id === this.activeArticleId ? ' active' : '';
            return `
                <a href="#/article/${encodeURIComponent(article.id)}"
                   class="wiki-nav-article${activeClass}"
                   data-id="${article.id}"
                   title="${this._escapeHtml(article.description || article.title)}">
                    ${this._escapeHtml(article.title)}
                </a>
            `;
        }

        /**
         * Attach event listeners to navigation elements
         * @private
         */
        _attachEventListeners() {
            // Category toggle clicks
            this.container.querySelectorAll('.wiki-nav-category-header')
                .forEach(header => {
                    header.addEventListener('click', (e) => {
                        const category = header.closest('.wiki-nav-category');
                        if (category && category.dataset.id) {
                            this.toggleCategory(category.dataset.id);
                        }
                    });
                });

            // Article clicks
            this.container.querySelectorAll('.wiki-nav-article')
                .forEach(link => {
                    link.addEventListener('click', (e) => {
                        const articleId = link.dataset.id;
                        if (articleId && this.onSelect) {
                            this.onSelect(articleId);
                        }
                    });
                });
        }

        /**
         * Expand parent categories of an element
         * @private
         */
        _expandParents(element) {
            let parent = element.parentElement;
            while (parent) {
                if (parent.classList.contains('wiki-nav-category')) {
                    parent.classList.add('expanded');
                    if (parent.dataset.id) {
                        this.expandedCategories.add(parent.dataset.id);
                    }
                }
                parent = parent.parentElement;
            }
            this._saveExpandedState();
        }

        /**
         * Filter categories recursively
         * @private
         */
        _filterCategories(categories) {
            categories.forEach(category => {
                const categoryEl = this.container.querySelector(
                    `.wiki-nav-category[data-id="${category.id}"]`
                );
                if (!categoryEl) return;

                let hasVisibleChild = false;

                if (category.children) {
                    category.children.forEach(child => {
                        if (child.type === 'article') {
                            const articleEl = this.container.querySelector(
                                `.wiki-nav-article[data-id="${child.id}"]`
                            );
                            if (articleEl) {
                                const matches = this._matchesFilter(child);
                                articleEl.style.display = matches ? '' : 'none';
                                if (matches) hasVisibleChild = true;
                            }
                        } else {
                            // Recursively filter subcategory
                            const subHasVisible = this._filterCategories([child]);
                            if (subHasVisible) hasVisibleChild = true;
                        }
                    });
                }

                // Check if category name matches
                const categoryMatches = category.name.toLowerCase().includes(this.filterTerm);
                if (categoryMatches) hasVisibleChild = true;

                categoryEl.style.display = hasVisibleChild ? '' : 'none';
                if (hasVisibleChild) {
                    categoryEl.classList.add('expanded');
                }

                return hasVisibleChild;
            });
        }

        /**
         * Check if an article matches the filter
         * @private
         */
        _matchesFilter(article) {
            if (!this.filterTerm) return true;

            const searchFields = [
                article.title,
                article.description || '',
                ...(article.tags || [])
            ].join(' ').toLowerCase();

            return searchFields.includes(this.filterTerm);
        }

        /**
         * Find the first article in the tree
         * @private
         */
        _findFirstArticle(categories) {
            if (!categories) return null;

            for (const category of categories) {
                if (category.children) {
                    for (const child of category.children) {
                        if (child.type === 'article') {
                            return child;
                        }
                        // Check subcategory
                        const found = this._findFirstArticle([child]);
                        if (found) return found;
                    }
                }
            }
            return null;
        }

        /**
         * Find an article by ID in categories
         * @private
         */
        _findArticleInCategories(articleId, categories) {
            if (!categories) return null;

            for (const category of categories) {
                if (category.children) {
                    for (const child of category.children) {
                        if (child.type === 'article' && child.id === articleId) {
                            return child;
                        }
                        if (child.children) {
                            const found = this._findArticleInCategories(articleId, [child]);
                            if (found) return found;
                        }
                    }
                }
            }
            return null;
        }

        /**
         * Find the category path to an article
         * @private
         */
        _findCategoryPath(articleId, categories, path) {
            if (!categories) return false;

            for (const category of categories) {
                if (category.children) {
                    for (const child of category.children) {
                        if (child.type === 'article' && child.id === articleId) {
                            path.push(category.name);
                            return true;
                        }
                        if (child.children) {
                            path.push(category.name);
                            if (this._findCategoryPath(articleId, [child], path)) {
                                return true;
                            }
                            path.pop();
                        }
                    }
                }
            }
            return false;
        }

        /**
         * Load expanded state from localStorage
         * @private
         */
        _loadExpandedState() {
            try {
                const stored = localStorage.getItem(STORAGE_KEY);
                if (stored) {
                    return new Set(JSON.parse(stored));
                }
            } catch (e) {
                console.warn('WikiNavigation: Could not load expanded state:', e);
            }
            return new Set();
        }

        /**
         * Save expanded state to localStorage
         * @private
         */
        _saveExpandedState() {
            try {
                localStorage.setItem(
                    STORAGE_KEY,
                    JSON.stringify([...this.expandedCategories])
                );
            } catch (e) {
                console.warn('WikiNavigation: Could not save expanded state:', e);
            }
        }

        /**
         * Escape HTML special characters
         * @private
         */
        _escapeHtml(text) {
            const div = document.createElement('div');
            div.textContent = text;
            return div.innerHTML;
        }
    }

    // Export to global scope
    window.WikiNavigation = WikiNavigation;
})();
