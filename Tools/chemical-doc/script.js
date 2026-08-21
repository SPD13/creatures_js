/**
 * Chemical Documentation Viewer
 * Browse documentation describing the role of each chemical in the game.
 */
class ChemicalDocsViewer {
    constructor() {
        this.chemicals = [];
        this.currentChemical = null;
        this.cachedDocs = {};
        this.init();
    }

    async init() {
        this.configureMarked();
        await this.loadIndex();
        this.renderSidebar();
        this.setupEventListeners();
        this.handleHashNavigation();
    }

    configureMarked() {
        if (typeof marked === 'undefined') {
            console.warn('marked.js not loaded, markdown rendering will be unavailable');
            return;
        }
        marked.setOptions({ gfm: true, breaks: false });
    }

    async loadIndex() {
        try {
            const response = await fetch('../../DOCUMENTATION/chemicals/index.json');
            if (!response.ok) throw new Error(`HTTP ${response.status}`);
            this.chemicals = await response.json();
        } catch (error) {
            console.error('Failed to load chemical index:', error);
            this.chemicals = [];
            this.showError('Failed to load chemical index. Run: node scripts/generate-chemical-docs-index.js');
        }
    }

    renderSidebar() {
        const listEl = document.getElementById('chemicalList');
        const countEl = document.getElementById('searchCount');

        listEl.innerHTML = '';
        this.chemicals.forEach(chem => {
            const item = document.createElement('div');
            item.className = 'chemical-list-item';
            item.dataset.name = chem.name;

            if (chem.id !== undefined && chem.id !== null) {
                const idEl = document.createElement('span');
                idEl.className = 'chemical-id';
                idEl.textContent = chem.id;
                item.appendChild(idEl);
            }

            const nameEl = document.createElement('span');
            nameEl.className = 'chemical-name';
            nameEl.textContent = chem.title;
            item.appendChild(nameEl);

            // The one-line role from chemical-roles.md: on hover here, and
            // searchable below, so "antidote" or "unwired" finds the slots.
            if (chem.role) item.title = chem.role;
            item.dataset.role = chem.role || '';

            item.addEventListener('click', () => this.selectChemical(chem));
            listEl.appendChild(item);
        });

        countEl.textContent = `${this.chemicals.length} chemicals`;
    }

    setupEventListeners() {
        const searchInput = document.getElementById('searchInput');
        const searchClear = document.getElementById('searchClear');
        searchInput.addEventListener('input', (e) => {
            this.filterChemicals(e.target.value);
            searchClear.classList.toggle('hidden', !e.target.value);
        });
        searchClear.addEventListener('click', () => {
            searchInput.value = '';
            searchClear.classList.add('hidden');
            this.filterChemicals('');
            searchInput.focus();
        });

        window.addEventListener('hashchange', () => this.handleHashNavigation());
    }

    filterChemicals(query) {
        const items = document.querySelectorAll('.chemical-list-item');
        const q = query.toLowerCase().trim();
        let visible = 0;

        items.forEach(item => {
            if (!q) {
                item.classList.remove('hidden');
                visible++;
                return;
            }
            const name = item.dataset.name.toLowerCase();
            const role = (item.dataset.role || '').toLowerCase();
            const match = name.includes(q) || role.includes(q) || this.fuzzyMatch(q, name);
            item.classList.toggle('hidden', !match);
            if (match) visible++;
        });

        document.getElementById('searchCount').textContent =
            q ? `${visible}/${this.chemicals.length}` : `${this.chemicals.length} chemicals`;
    }

    fuzzyMatch(query, text) {
        let qi = 0;
        for (let ti = 0; ti < text.length && qi < query.length; ti++) {
            if (text[ti] === query[qi]) qi++;
        }
        return qi === query.length;
    }

    async selectChemical(chem) {
        this.currentChemical = chem;

        document.querySelectorAll('.chemical-list-item').forEach(item => {
            item.classList.toggle('active', item.dataset.name === chem.name);
        });

        history.replaceState(null, '', '#' + encodeURIComponent(chem.name));

        document.getElementById('emptyState').classList.add('hidden');
        document.getElementById('contentArea').classList.remove('hidden');

        const idLabel = (chem.id !== undefined && chem.id !== null) ? `Chemical #${chem.id}` : '';
        document.getElementById('chemicalTitle').textContent = chem.title;
        document.getElementById('chemicalMeta').textContent =
            [idLabel, chem.docFile].filter(Boolean).join(' \u2022 ');

        await this.loadDocumentation();
    }

    async loadDocumentation() {
        const chem = this.currentChemical;
        const container = document.getElementById('docsContent');

        if (this.cachedDocs[chem.name]) {
            container.innerHTML = this.cachedDocs[chem.name];
            this.setupDocLinks(container);
            return;
        }

        container.innerHTML = '<p class="loading-message">Loading documentation...</p>';

        try {
            const response = await fetch(`../../DOCUMENTATION/chemicals/${encodeURIComponent(chem.docFile)}`);
            if (!response.ok) throw new Error(`HTTP ${response.status}`);
            const markdown = await response.text();

            if (typeof marked !== 'undefined') {
                const html = marked.parse(markdown);
                this.cachedDocs[chem.name] = html;
                container.innerHTML = html;
                this.setupDocLinks(container);
            } else {
                container.innerHTML = `<pre>${this.escapeHtml(markdown)}</pre>`;
            }
        } catch (error) {
            container.innerHTML = `<div class="error-message">Failed to load documentation: ${error.message}</div>`;
        }
    }

    setupDocLinks(container) {
        container.querySelectorAll('a[href^="#"]').forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                const targetId = decodeURIComponent(link.getAttribute('href').slice(1));
                let targetEl = container.querySelector(`[id="${CSS.escape(targetId)}"]`);
                if (!targetEl) {
                    const headings = container.querySelectorAll('h1, h2, h3, h4, h5, h6');
                    for (const h of headings) {
                        const slug = h.textContent.trim().toLowerCase()
                            .replace(/[^\w\s-]/g, '')
                            .replace(/\s+/g, '-');
                        if (slug === targetId) {
                            targetEl = h;
                            break;
                        }
                    }
                }
                if (targetEl) {
                    targetEl.scrollIntoView({ behavior: 'smooth', block: 'start' });
                }
            });
        });
    }

    handleHashNavigation() {
        // Support ?id=N query parameter (used by the creature debugger's "?" button).
        // Takes precedence over the hash so deep-links from the debugger work even
        // if the name format of the index changes.
        const params = new URLSearchParams(window.location.search);
        const idParam = params.get('id');
        if (idParam !== null && this.chemicals.length > 0) {
            const id = parseInt(idParam, 10);
            if (!isNaN(id)) {
                const chem = this.chemicals.find(c => c.id === id);
                if (chem && chem !== this.currentChemical) {
                    this.selectChemical(chem);
                    return;
                }
            }
        }

        const hash = decodeURIComponent(window.location.hash.slice(1));
        if (hash && this.chemicals.length > 0) {
            const chem = this.chemicals.find(c => c.name === hash);
            if (chem && chem !== this.currentChemical) {
                this.selectChemical(chem);
            }
        }
    }

    showError(message) {
        const listEl = document.getElementById('chemicalList');
        listEl.innerHTML = `<div class="error-message" style="margin:15px">${message}</div>`;
    }

    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }
}

document.addEventListener('DOMContentLoaded', () => {
    window.chemicalDocsViewer = new ChemicalDocsViewer();
});
