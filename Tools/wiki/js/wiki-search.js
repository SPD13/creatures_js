/**
 * Creatures 3 Documentation Wiki - Search Module
 * Full-text search using MiniSearch with fuzzy matching and context snippets
 */

(function() {
    'use strict';

    /**
     * WikiSearch class
     * Provides full-text search using MiniSearch
     */
    class WikiSearch {
        /**
         * @param {Object} searchIndex - The pre-built search index with documents and excerpts
         */
        constructor(searchIndex) {
            this.excerpts = searchIndex.excerpts || {};
            this.config = searchIndex.config || {};

            // Initialize MiniSearch with documents
            this.miniSearch = new MiniSearch({
                fields: ['title', 'description', 'tags', 'content'],
                storeFields: ['title', 'description', 'file', 'categoryPath']
            });

            // Add all documents to the index
            if (searchIndex.documents && searchIndex.documents.length > 0) {
                this.miniSearch.addAll(searchIndex.documents);
            }
        }

        /**
         * Search for articles matching the query
         * @param {string} query - The search query
         * @returns {Array} Array of search results with scores and snippets
         */
        search(query) {
            if (!query || typeof query !== 'string') {
                return [];
            }

            const normalizedQuery = query.trim();
            if (normalizedQuery.length < 2) {
                return [];
            }

            // Use MiniSearch with fuzzy matching and prefix search
            const results = this.miniSearch.search(normalizedQuery, {
                boost: { title: 3, tags: 2, description: 1.5, content: 1 },
                fuzzy: 0.2,
                prefix: true,
                combineWith: 'AND'
            });

            // Enrich results with snippets
            return results.map(result => ({
                article: {
                    id: result.id,
                    title: result.title,
                    description: result.description,
                    file: result.file,
                    categoryPath: result.categoryPath ? result.categoryPath.split(' > ') : []
                },
                score: result.score,
                snippet: this._generateSnippet(result.id, normalizedQuery),
                matchType: this._getMatchType(result)
            }));
        }

        /**
         * Highlight matches in text
         * @param {string} text - The text to highlight
         * @param {string} query - The search query
         * @returns {string} HTML with highlighted matches
         */
        highlightMatches(text, query) {
            if (!text || !query) return this._escapeHtml(text || '');

            // Extract terms from query (handle phrase search)
            const terms = this._extractTerms(query);
            if (terms.length === 0) return this._escapeHtml(text);

            let result = this._escapeHtml(text);

            for (const term of terms) {
                // Use word boundary-aware matching for better highlighting
                const regex = new RegExp(`(${this._escapeRegex(term)})`, 'gi');
                result = result.replace(regex, '<mark>$1</mark>');
            }

            return result;
        }

        /**
         * Get search suggestions based on partial input
         * @param {string} partial - Partial search input
         * @param {number} limit - Maximum number of suggestions
         * @returns {Array} Array of suggestion objects
         */
        getSuggestions(partial, limit = 5) {
            if (!partial || partial.length < 2) return [];

            const results = this.miniSearch.search(partial, {
                prefix: true,
                fuzzy: 0.1,
                boost: { title: 5, tags: 3 }
            });

            return results.slice(0, limit).map(r => ({
                text: r.title,
                type: 'article'
            }));
        }

        // Private methods

        /**
         * Generate a context snippet around the first match
         * @private
         */
        _generateSnippet(articleId, query) {
            const excerpt = this.excerpts[articleId];
            if (!excerpt) return null;

            const terms = this._extractTerms(query);
            if (terms.length === 0) return excerpt.slice(0, 150) + '...';

            const lowerExcerpt = excerpt.toLowerCase();
            let bestPosition = -1;
            let bestTerm = null;

            // Find the first occurrence of any search term
            for (const term of terms) {
                const lowerTerm = term.toLowerCase();
                const pos = lowerExcerpt.indexOf(lowerTerm);
                if (pos !== -1 && (bestPosition === -1 || pos < bestPosition)) {
                    bestPosition = pos;
                    bestTerm = term;
                }
            }

            if (bestPosition === -1) {
                // No match in excerpt, return beginning
                return excerpt.slice(0, 150) + '...';
            }

            // Extract context around the match
            const contextRadius = 60;
            const start = Math.max(0, bestPosition - contextRadius);
            const end = Math.min(excerpt.length, bestPosition + bestTerm.length + contextRadius);

            let snippet = excerpt.slice(start, end);

            // Add ellipsis if needed
            if (start > 0) snippet = '...' + snippet;
            if (end < excerpt.length) snippet = snippet + '...';

            return snippet;
        }

        /**
         * Determine the primary match type for display
         * @private
         */
        _getMatchType(result) {
            // MiniSearch provides match info in result.match
            // We can infer from the score boost which field matched best
            if (result.match && result.match.title) {
                return 'title';
            }
            if (result.match && result.match.tags) {
                return 'tag';
            }
            if (result.match && result.match.content) {
                return 'content';
            }
            return 'content';
        }

        /**
         * Extract search terms from query, handling phrases
         * @private
         */
        _extractTerms(query) {
            const terms = [];
            const normalized = query.toLowerCase().trim();

            // Extract quoted phrases first
            const phraseRegex = /"([^"]+)"/g;
            let match;
            let remaining = normalized;

            while ((match = phraseRegex.exec(normalized)) !== null) {
                if (match[1].length >= 2) {
                    terms.push(match[1]);
                }
                remaining = remaining.replace(match[0], ' ');
            }

            // Add remaining individual terms
            const words = remaining.split(/\s+/).filter(t => t.length >= 2);
            terms.push(...words);

            return terms;
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

        /**
         * Escape special regex characters
         * @private
         */
        _escapeRegex(string) {
            return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
        }
    }

    /**
     * WikiSearchUI class
     * Handles the search UI interactions with snippet display
     */
    class WikiSearchUI {
        /**
         * @param {WikiSearch} search - The WikiSearch instance
         * @param {Object} elements - DOM element references
         * @param {Function} onSelect - Callback when a result is selected
         */
        constructor(search, elements, onSelect) {
            this.search = search;
            this.elements = elements;
            this.onSelect = onSelect;
            this.isOpen = false;
            this.selectedIndex = -1;
            this.results = [];
            this.debounceTimer = null;

            this._bindEvents();
        }

        /**
         * Open the search results panel
         */
        open() {
            this.isOpen = true;
            this.elements.results.classList.add('visible');
        }

        /**
         * Close the search results panel
         */
        close() {
            this.isOpen = false;
            this.elements.results.classList.remove('visible');
            this.selectedIndex = -1;
            this._updateSelection();
        }

        /**
         * Clear the search
         */
        clear() {
            this.elements.input.value = '';
            this.results = [];
            this._renderResults([]);
            this.close();
        }

        /**
         * Perform a search
         * @param {string} query - The search query
         */
        performSearch(query) {
            this.results = this.search.search(query);
            this._renderResults(this.results, query);

            if (this.results.length > 0 || query.length >= 2) {
                this.open();
            } else {
                this.close();
            }
        }

        // Private methods

        /**
         * Bind event listeners
         * @private
         */
        _bindEvents() {
            // Input typing with debounce
            this.elements.input.addEventListener('input', (e) => {
                clearTimeout(this.debounceTimer);
                this.debounceTimer = setTimeout(() => {
                    this.performSearch(e.target.value);
                }, 150);
            });

            // Focus shows results if we have any
            this.elements.input.addEventListener('focus', () => {
                if (this.results.length > 0) {
                    this.open();
                }
            });

            // Keyboard navigation
            this.elements.input.addEventListener('keydown', (e) => {
                if (!this.isOpen) return;

                switch (e.key) {
                    case 'ArrowDown':
                        e.preventDefault();
                        this._selectNext();
                        break;
                    case 'ArrowUp':
                        e.preventDefault();
                        this._selectPrevious();
                        break;
                    case 'Enter':
                        e.preventDefault();
                        this._selectCurrent();
                        break;
                    case 'Escape':
                        e.preventDefault();
                        this.close();
                        this.elements.input.blur();
                        break;
                }
            });

            // Clear button
            if (this.elements.clear) {
                this.elements.clear.addEventListener('click', () => {
                    this.clear();
                    this.elements.input.focus();
                });
            }

            // Close button
            if (this.elements.close) {
                this.elements.close.addEventListener('click', () => {
                    this.close();
                });
            }

            // Click outside closes results
            document.addEventListener('click', (e) => {
                if (this.isOpen &&
                    !this.elements.results.contains(e.target) &&
                    !this.elements.input.contains(e.target)) {
                    this.close();
                }
            });
        }

        /**
         * Render search results with snippets
         * @private
         */
        _renderResults(results, query = '') {
            const countEl = this.elements.count;
            const listEl = this.elements.list;

            countEl.textContent = `${results.length} result${results.length !== 1 ? 's' : ''}`;

            if (results.length === 0) {
                if (query.length >= 2) {
                    listEl.innerHTML = `
                        <div class="wiki-search-no-results">
                            No results found for "${this._escapeHtml(query)}"
                        </div>
                    `;
                } else {
                    listEl.innerHTML = '';
                }
                return;
            }

            listEl.innerHTML = results.map((result, index) => `
                <a href="#/article/${encodeURIComponent(result.article.id)}"
                   class="wiki-search-result${index === this.selectedIndex ? ' selected' : ''}"
                   data-index="${index}">
                    <div class="wiki-search-result-header">
                        <span class="wiki-search-result-title">
                            ${this.search.highlightMatches(result.article.title, query)}
                        </span>
                        ${result.matchType === 'content' ? '<span class="wiki-search-match-badge">Content</span>' : ''}
                    </div>
                    <div class="wiki-search-result-path">
                        ${result.article.categoryPath.join(' > ')}
                    </div>
                    ${result.snippet ? `
                        <div class="wiki-search-result-snippet">
                            ${this.search.highlightMatches(result.snippet, query)}
                        </div>
                    ` : (result.article.description ? `
                        <div class="wiki-search-result-description">
                            ${this.search.highlightMatches(
                                this._truncate(result.article.description, 120),
                                query
                            )}
                        </div>
                    ` : '')}
                </a>
            `).join('');

            // Attach click handlers
            listEl.querySelectorAll('.wiki-search-result').forEach(el => {
                el.addEventListener('click', (e) => {
                    e.preventDefault();
                    const index = parseInt(el.dataset.index, 10);
                    if (this.results[index]) {
                        this._handleSelect(this.results[index].article);
                    }
                });
            });
        }

        /**
         * Select next result
         * @private
         */
        _selectNext() {
            if (this.results.length === 0) return;
            this.selectedIndex = Math.min(
                this.selectedIndex + 1,
                this.results.length - 1
            );
            this._updateSelection();
        }

        /**
         * Select previous result
         * @private
         */
        _selectPrevious() {
            if (this.results.length === 0) return;
            this.selectedIndex = Math.max(this.selectedIndex - 1, 0);
            this._updateSelection();
        }

        /**
         * Select current result
         * @private
         */
        _selectCurrent() {
            if (this.selectedIndex >= 0 && this.results[this.selectedIndex]) {
                this._handleSelect(this.results[this.selectedIndex].article);
            }
        }

        /**
         * Update selection UI
         * @private
         */
        _updateSelection() {
            const items = this.elements.list.querySelectorAll('.wiki-search-result');
            items.forEach((item, index) => {
                item.classList.toggle('selected', index === this.selectedIndex);
                if (index === this.selectedIndex) {
                    item.scrollIntoView({ block: 'nearest' });
                }
            });
        }

        /**
         * Handle result selection
         * @private
         */
        _handleSelect(article) {
            this.close();
            this.elements.input.value = '';
            if (this.onSelect) {
                this.onSelect(article.id);
            }
        }

        /**
         * Truncate text
         * @private
         */
        _truncate(text, maxLength) {
            if (!text || text.length <= maxLength) return text;
            return text.slice(0, maxLength).trim() + '...';
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

    // Export to global scope
    window.WikiSearch = WikiSearch;
    window.WikiSearchUI = WikiSearchUI;
})();
