/**
 * Creatures 3 Documentation Wiki - Renderer Module
 * Handles markdown rendering and TOC generation
 */

(function() {
    'use strict';

    /**
     * WikiRenderer class
     * Renders markdown content and generates table of contents
     */
    class WikiRenderer {
        /**
         * @param {HTMLElement} contentContainer - The content area element
         * @param {HTMLElement} tocContainer - The table of contents element
         * @param {string} basePath - Base path for loading articles
         * @param {Object} index - The documentation index, used to turn the
         *        `[label](some-article.md)` cross-references that articles are
         *        written with into real wiki routes. Optional: without it those
         *        references degrade to plain text rather than breaking.
         */
        constructor(contentContainer, tocContainer, basePath, index) {
            this.contentContainer = contentContainer;
            this.tocContainer = tocContainer;
            this.basePath = basePath || '../../DOCUMENTATION/articles/';
            this.currentHeadings = [];

            // Path of the article being rendered, so relative cross-references
            // ("../biochemistry/foo.md") can be resolved against it.
            this.currentArticleFile = null;
            this._buildArticleLookups(index);

            this._configureMarked();
            this._configureSyntaxHighlighting();
        }

        /**
         * Index the article catalogue two ways for cross-reference resolution.
         *
         * Articles link to each other with ordinary relative markdown paths.
         * Most resolve exactly against the linking article's directory, but a
         * good number are written sibling-style ("motor-faculty.md") for an
         * article that actually lives a directory up — so an exact-path-only
         * lookup leaves roughly one in six references dead. Basenames happen to
         * be unique across the whole catalogue, which makes a basename fallback
         * unambiguous; collisions are reported and the first entry wins.
         *
         * @private
         */
        _buildArticleLookups(index) {
            this.articlesByFile = new Map();
            this.articlesByBasename = new Map();
            if (!index || !Array.isArray(index.categories)) return;

            const walk = (nodes) => {
                for (const node of nodes || []) {
                    if (node && node.type === 'article' && node.file && node.id) {
                        const file = this._normalizePath(node.file);
                        this.articlesByFile.set(file, node);

                        const base = file.split('/').pop();
                        if (this.articlesByBasename.has(base)) {
                            console.warn(
                                `WikiRenderer: duplicate article filename "${base}" ` +
                                `(${this.articlesByBasename.get(base).file} vs ${node.file}); ` +
                                `sibling-style cross-references to it will resolve to the first.`
                            );
                        } else {
                            this.articlesByBasename.set(base, node);
                        }
                    }
                    if (node && node.children) walk(node.children);
                }
            };
            walk(index.categories);
        }

        /**
         * Collapse "." and ".." segments and strip any leading "./".
         * @private
         */
        _normalizePath(p) {
            const out = [];
            for (const seg of String(p).replace(/\\/g, '/').split('/')) {
                if (!seg || seg === '.') continue;
                if (seg === '..') out.pop();
                else out.push(seg);
            }
            return out.join('/');
        }

        /**
         * Resolve a relative markdown href written inside an article to its
         * catalogue entry.
         *
         * @param {string} href - e.g. "motor-faculty.md" or "../organs/x.md"
         * @returns {Object|null} the index entry, or null when unknown
         * @private
         */
        _resolveArticleHref(href) {
            const clean = String(href).split('#')[0].split('?')[0];
            if (!clean) return null;

            const dir = (this.currentArticleFile || '').split('/').slice(0, -1).join('/');
            const exact = this._normalizePath(dir ? `${dir}/${clean}` : clean);
            if (this.articlesByFile.has(exact)) return this.articlesByFile.get(exact);

            return this.articlesByBasename.get(clean.split('/').pop()) || null;
        }

        /**
         * Render an article
         * @param {Object} article - The article object from the index
         * @param {Array} categoryPath - The category path for breadcrumbs
         * @returns {Promise<boolean>} Success status
         */
        async renderArticle(article, categoryPath = []) {
            if (!article || !article.file) {
                this._renderError('Article not found', 'The requested article does not exist.');
                return false;
            }

            this._showLoading();

            try {
                const markdown = await this._fetchArticle(article.file);
                // Relative cross-references in the body resolve against this
                // article's own directory, so record it before parsing.
                this.currentArticleFile = this._normalizePath(article.file);
                const html = this._parseMarkdown(markdown);

                this._renderContent(article, html, categoryPath);
                this._generateTOC();
                this._scrollToTop();

                return true;
            } catch (error) {
                console.error('WikiRenderer: Error rendering article:', error);
                this._renderError(
                    'Failed to load article',
                    `Could not load "${article.title}". The file may not exist or there was a network error.`
                );
                return false;
            }
        }

        /**
         * Scroll to a heading by ID
         * @param {string} headingId - The heading ID to scroll to
         */
        scrollToHeading(headingId) {
            const heading = document.getElementById(headingId);
            if (heading) {
                heading.scrollIntoView({ behavior: 'smooth', block: 'start' });
                this._highlightTOCItem(headingId);
            }
        }

        /**
         * Get the current headings
         * @returns {Array} Array of heading objects
         */
        getHeadings() {
            return this.currentHeadings;
        }

        // Private methods

        /**
         * Configure marked.js options
         * @private
         */
        _configureMarked() {
            const self = this;

            // Custom renderer for marked.js v14+
            const renderer = {
                // Custom heading renderer to add IDs and anchors
                heading({ tokens, depth, raw }) {
                    const text = this.parser.parseInline(tokens);
                    const id = self._generateHeadingId(raw);
                    return `<h${depth} id="${id}">${text}<a href="#${id}" class="heading-anchor">#</a></h${depth}>\n`;
                },

                // Custom link renderer to handle internal links
                link({ href, title, tokens }) {
                    const text = this.parser.parseInline(tokens);
                    const titleAttr = title ? ` title="${self._escapeHtml(title)}"` : '';

                    // Check if it's an internal article link
                    if (href && href.startsWith('#/article/')) {
                        return `<a href="${href}"${titleAttr}>${text}</a>`;
                    }

                    // Cross-reference to another article. Articles are written
                    // with plain relative markdown paths ("motor-faculty.md"),
                    // which resolve against Tools/wiki/ and 404 if emitted as-is,
                    // so map them onto the router's article route instead. These
                    // open in a new tab: a cross-reference is something you follow
                    // alongside what you are reading, not instead of it.
                    if (href && /\.md(#|\?|$)/i.test(href) && !/^([a-z][a-z0-9+.-]*:)?\/\//i.test(href)) {
                        const target = self._resolveArticleHref(href);
                        if (target) {
                            const url = `#/article/${encodeURIComponent(target.id)}`;
                            const hint = self._escapeHtml(
                                title || `${target.title} — opens in a new tab`
                            );
                            return `<a href="${url}" class="wiki-article-link" ` +
                                   `target="_blank" rel="noopener" title="${hint}">${text}</a>`;
                        }
                        // Unknown target: the article was never written, or was
                        // renamed without updating the reference. Show the label
                        // as plain text rather than a link that lands on
                        // "Article not found", and flag it for whoever maintains
                        // the docs.
                        console.warn(
                            `WikiRenderer: unresolved article reference "${href}"` +
                            (self.currentArticleFile ? ` in ${self.currentArticleFile}` : '')
                        );
                        return `<span class="wiki-article-link-broken" ` +
                               `title="No article matches &quot;${self._escapeHtml(href)}&quot;">${text}</span>`;
                    }

                    // External links open in new tab
                    const isExternal = href && (href.startsWith('http://') || href.startsWith('https://'));
                    const attrs = isExternal ? ' target="_blank" rel="noopener noreferrer"' : '';
                    return `<a href="${href}"${titleAttr}${attrs}>${text}</a>`;
                },

                // Custom code renderer for syntax highlighting
                code({ text, lang }) {
                    const code = text;
                    const language = lang;
                    if (language && window.hljs) {
                        try {
                            // Check if the language is supported
                            if (window.hljs.getLanguage(language)) {
                                const highlighted = window.hljs.highlight(code, {
                                    language: language,
                                    ignoreIllegals: true
                                }).value;
                                return `<pre><code class="hljs language-${language}">${highlighted}</code></pre>\n`;
                            }
                        } catch (e) {
                            console.warn('WikiRenderer: Syntax highlighting failed:', e);
                        }
                    }

                    // Fallback: try auto-detection or no highlighting
                    if (window.hljs) {
                        try {
                            const highlighted = window.hljs.highlightAuto(code).value;
                            return `<pre><code class="hljs">${highlighted}</code></pre>\n`;
                        } catch (e) {
                            // Fall through to plain code
                        }
                    }

                    return `<pre><code>${self._escapeHtml(code)}</code></pre>\n`;
                },

                // Custom table renderer to wrap tables for mobile scrolling
                table({ header, rows }) {
                    const headerHtml = header.map(cell => {
                        const cellText = this.parser.parseInline(cell.tokens);
                        const align = cell.align ? ` style="text-align:${cell.align}"` : '';
                        return `<th${align}>${cellText}</th>`;
                    }).join('');

                    const bodyHtml = rows.map(row => {
                        const rowHtml = row.map(cell => {
                            const cellText = this.parser.parseInline(cell.tokens);
                            const align = cell.align ? ` style="text-align:${cell.align}"` : '';
                            return `<td${align}>${cellText}</td>`;
                        }).join('');
                        return `<tr>${rowHtml}</tr>`;
                    }).join('');

                    return `<div class="table-wrapper"><table><thead><tr>${headerHtml}</tr></thead><tbody>${bodyHtml}</tbody></table></div>\n`;
                }
            };

            marked.use({ renderer });
        }

        /**
         * Configure syntax highlighting
         * @private
         */
        _configureSyntaxHighlighting() {
            if (window.hljs) {
                // Register any additional languages if needed
                // Language files are loaded in index.html
            }
        }

        /**
         * Fetch article content
         * @private
         */
        async _fetchArticle(file) {
            const url = this.basePath + file;
            const response = await fetch(url);

            if (!response.ok) {
                throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }

            return await response.text();
        }

        /**
         * Parse markdown to HTML
         * @private
         */
        _parseMarkdown(markdown) {
            return marked.parse(markdown);
        }

        /**
         * Render the article content
         * @private
         */
        _renderContent(article, contentHtml, categoryPath) {
            // Build breadcrumb
            const breadcrumbHtml = categoryPath.length > 0
                ? `<nav class="wiki-article-breadcrumb">
                       ${categoryPath.map(cat => `<span>${this._escapeHtml(cat)}</span>`).join('<span>&rsaquo;</span>')}
                   </nav>`
                : '';

            // Build tags
            const tagsHtml = article.tags && article.tags.length > 0
                ? `<div class="wiki-article-tags">
                       ${article.tags.map(tag => `<span class="wiki-article-tag">${this._escapeHtml(tag)}</span>`).join('')}
                   </div>`
                : '';

            // Build meta info
            const metaItems = [];
            if (article.lastModified) {
                const date = new Date(article.lastModified);
                metaItems.push(`Last updated: ${date.toLocaleDateString()}`);
            }
            const metaHtml = metaItems.length > 0
                ? `<div class="wiki-article-meta">${metaItems.join(' &bull; ')}${tagsHtml ? ' ' + tagsHtml : ''}</div>`
                : (tagsHtml ? `<div class="wiki-article-meta">${tagsHtml}</div>` : '');

            this.contentContainer.innerHTML = `
                <article class="wiki-article">
                    <header class="wiki-article-header">
                        ${breadcrumbHtml}
                        <h1 class="wiki-article-title">${this._escapeHtml(article.title)}</h1>
                        ${metaHtml}
                    </header>
                    <div class="wiki-article-content">
                        ${contentHtml}
                    </div>
                </article>
            `;
        }

        /**
         * Generate table of contents from headings
         * @private
         */
        _generateTOC() {
            const contentEl = this.contentContainer.querySelector('.wiki-article-content');
            if (!contentEl || !this.tocContainer) return;

            const headings = contentEl.querySelectorAll('h2, h3, h4');
            this.currentHeadings = [];

            if (headings.length === 0) {
                this.tocContainer.innerHTML = '<p class="wiki-toc-empty">No sections</p>';
                return;
            }

            headings.forEach(heading => {
                const level = parseInt(heading.tagName.charAt(1), 10);
                const id = heading.id;
                const text = heading.textContent.replace(/#$/, '').trim();

                this.currentHeadings.push({ id, text, level });
            });

            this.tocContainer.innerHTML = this.currentHeadings
                .map(h => `
                    <a href="#${h.id}"
                       class="wiki-toc-link"
                       data-level="${h.level}"
                       data-id="${h.id}">
                        ${this._escapeHtml(h.text)}
                    </a>
                `)
                .join('');

            // Attach click handlers for smooth scrolling
            this.tocContainer.querySelectorAll('.wiki-toc-link').forEach(link => {
                link.addEventListener('click', (e) => {
                    e.preventDefault();
                    const id = link.dataset.id;
                    this.scrollToHeading(id);
                });
            });

            // Set up scroll spy
            this._setupScrollSpy();
        }

        /**
         * Set up scroll spy for TOC highlighting
         * @private
         */
        _setupScrollSpy() {
            if (!this.currentHeadings.length) return;

            const observer = new IntersectionObserver(
                (entries) => {
                    entries.forEach(entry => {
                        if (entry.isIntersecting) {
                            this._highlightTOCItem(entry.target.id);
                        }
                    });
                },
                {
                    rootMargin: '-80px 0px -80% 0px',
                    threshold: 0
                }
            );

            // Observe all headings
            this.currentHeadings.forEach(h => {
                const el = document.getElementById(h.id);
                if (el) observer.observe(el);
            });

            // Store observer for cleanup
            this._scrollSpyObserver = observer;
        }

        /**
         * Highlight a TOC item
         * @private
         */
        _highlightTOCItem(headingId) {
            if (!this.tocContainer) return;

            this.tocContainer.querySelectorAll('.wiki-toc-link').forEach(link => {
                link.classList.toggle('active', link.dataset.id === headingId);
            });
        }

        /**
         * Show loading state
         * @private
         */
        _showLoading() {
            this.contentContainer.innerHTML = `
                <div class="wiki-content-loading">
                    <div class="wiki-loading-spinner"></div>
                    <p>Loading article...</p>
                </div>
            `;

            if (this.tocContainer) {
                this.tocContainer.innerHTML = '';
            }
        }

        /**
         * Render an error state
         * @private
         */
        _renderError(title, message) {
            this.contentContainer.innerHTML = `
                <div class="wiki-error">
                    <div class="wiki-error-icon">:(</div>
                    <h2 class="wiki-error-title">${this._escapeHtml(title)}</h2>
                    <p class="wiki-error-message">${this._escapeHtml(message)}</p>
                </div>
            `;

            if (this.tocContainer) {
                this.tocContainer.innerHTML = '';
            }
        }

        /**
         * Scroll to top of content
         * @private
         */
        _scrollToTop() {
            this.contentContainer.scrollTop = 0;
            window.scrollTo({ top: 0, behavior: 'smooth' });
        }

        /**
         * Generate a URL-safe heading ID
         * @private
         */
        _generateHeadingId(text) {
            return text
                .toLowerCase()
                .replace(/<[^>]*>/g, '') // Remove HTML tags
                .replace(/[^\w\s-]/g, '') // Remove special chars
                .replace(/\s+/g, '-') // Replace spaces with hyphens
                .replace(/-+/g, '-') // Remove duplicate hyphens
                .trim();
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
    window.WikiRenderer = WikiRenderer;
})();
