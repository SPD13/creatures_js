/**
 * Asset packs the tool can browse. The pack code (C3/DS) is the documentation
 * subdirectory under DOCUMENTATION/caos_scripts/ as well as the value used in
 * the `?pack=` URL parameter; `assetDir` is the matching pack folder under
 * Assets/ where the .cos bootstrap scripts live.
 */
const ASSET_PACKS = {
    C3: { label: 'Creatures 3', assetDir: 'Creatures 3' },
    DS: { label: 'Docking Station', assetDir: 'Docking Station' }
};
const DEFAULT_PACK = 'C3';
const PACK_STORAGE_KEY = 'scriptDocs.assetPack';

/**
 * Script Documentation Viewer
 * Browse CAOS script documentation alongside source code.
 */
class ScriptDocsViewer {
    constructor() {
        this.scripts = [];
        this.classifiers = {};
        this.currentScript = null;
        this.currentTab = 'docs';
        this.currentSidebarTab = 'scripts';
        this.cachedDocs = {};
        this.cachedScripts = {};
        this.pack = this.resolveInitialPack();
        this.init();
    }

    /**
     * Decide which asset pack to load on startup. Priority:
     *   1. ?pack= URL parameter (used by in-game outbound links)
     *   2. Last pack chosen in this browser (localStorage)
     *   3. Default pack (Creatures 3)
     * @returns {string} a valid pack code (key of ASSET_PACKS)
     */
    resolveInitialPack() {
        const params = new URLSearchParams(window.location.search);
        const fromUrl = (params.get('pack') || '').trim().toUpperCase();
        if (ASSET_PACKS[fromUrl]) return fromUrl;

        try {
            const stored = (localStorage.getItem(PACK_STORAGE_KEY) || '').trim().toUpperCase();
            if (ASSET_PACKS[stored]) return stored;
        } catch (e) {
            // localStorage may be unavailable (private mode) — fall through.
        }
        return DEFAULT_PACK;
    }

    /** Base path to the current pack's documentation directory. */
    docsBasePath() {
        return `../../DOCUMENTATION/caos_scripts/${this.pack}`;
    }

    async init() {
        await this.waitForCAOSCommands();
        this.configureMarked();
        this.setupPackSelector();
        await Promise.all([this.loadIndex(), this.loadClassifiers()]);
        this.renderSidebar();
        this.renderClassifierList();
        this.setupEventListeners();
        this.handleURLParams();
        this.handleHashNavigation();
    }

    /** Wire up the Asset Pack dropdown in the tool header. */
    setupPackSelector() {
        const select = document.getElementById('assetPackSelect');
        if (!select) return;
        select.value = this.pack;
        select.addEventListener('change', (e) => {
            this.switchPack(e.target.value);
        });
    }

    /**
     * Switch the active asset pack: persist the choice, sync the URL, clear
     * per-pack caches and reload the script/classifier lists.
     * @param {string} pack - target pack code (key of ASSET_PACKS)
     */
    async switchPack(pack) {
        if (!ASSET_PACKS[pack] || pack === this.pack) return;
        this.pack = pack;

        const select = document.getElementById('assetPackSelect');
        if (select && select.value !== pack) select.value = pack;

        try {
            localStorage.setItem(PACK_STORAGE_KEY, pack);
        } catch (e) {
            // Ignore storage failures (private mode, quota, etc.).
        }

        // Reflect the pack in the URL (so refresh/bookmark keeps it) and drop
        // the now-stale script hash, which belongs to the previous pack.
        const url = new URL(window.location.href);
        url.searchParams.set('pack', pack);
        url.hash = '';
        history.replaceState(null, '', url.toString());

        // Docs and scripts differ per pack — invalidate caches and selection.
        this.currentScript = null;
        this.cachedDocs = {};
        this.cachedScripts = {};

        // Return the main panel to its empty state.
        document.getElementById('contentArea').classList.add('hidden');
        document.getElementById('emptyState').classList.remove('hidden');

        // Reset search boxes so the new pack is shown unfiltered.
        const searchInput = document.getElementById('searchInput');
        if (searchInput) searchInput.value = '';
        document.getElementById('searchClear')?.classList.add('hidden');
        const classifierInput = document.getElementById('classifierSearchInput');
        if (classifierInput) classifierInput.value = '';
        document.getElementById('classifierSearchClear')?.classList.add('hidden');

        await Promise.all([this.loadIndex(), this.loadClassifiers()]);
        this.renderSidebar();
        this.renderClassifierList();
    }

    async waitForCAOSCommands() {
        if (window.caosCommandsLoader) {
            try {
                await window.caosCommandsLoader.loadCommands();
                if (window.caosCommandModal) {
                    window.caosCommandModal.updateCommandIndex();
                }
                // Set command catalog on COSRenderer for enhanced highlighting
                if (window.cosRenderer && window.CAOS_COMMANDS) {
                    const allCommands = [
                        ...(window.CAOS_COMMANDS.commands || []),
                        ...(window.CAOS_COMMANDS.integerRValues || []),
                        ...(window.CAOS_COMMANDS.floatRValues || []),
                        ...(window.CAOS_COMMANDS.stringRValues || []),
                        ...(window.CAOS_COMMANDS.agentRValues || []),
                        ...(window.CAOS_COMMANDS.variables || [])
                    ];
                    window.cosRenderer.setCommandCatalog(allCommands);
                }
            } catch (e) {
                console.warn('Failed to load CAOS commands:', e);
            }
        }
    }

    configureMarked() {
        if (typeof marked === 'undefined') {
            console.warn('marked.js not loaded, markdown rendering will be unavailable');
            return;
        }
        // Use default marked settings - they work well for our dark-themed CSS
        marked.setOptions({
            gfm: true,
            breaks: false
        });
    }

    async loadIndex() {
        try {
            const response = await fetch(`${this.docsBasePath()}/index.json`);
            if (!response.ok) throw new Error(`HTTP ${response.status}`);
            this.scripts = await response.json();
        } catch (error) {
            console.error('Failed to load script index:', error);
            this.scripts = [];
            this.showError('Failed to load script index. Run: node scripts/generate-script-docs-index.js');
        }
    }

    async loadClassifiers() {
        try {
            const response = await fetch(`${this.docsBasePath()}/classifiers.json`);
            if (!response.ok) throw new Error(`HTTP ${response.status}`);
            const data = await response.json();
            this.classifiers = data.classifiers || {};
        } catch (error) {
            console.warn('Failed to load classifiers index:', error);
            this.classifiers = {};
        }
    }

    renderSidebar() {
        const listEl = document.getElementById('scriptList');
        const countEl = document.getElementById('searchCount');

        listEl.innerHTML = '';

        if (this.scripts.length === 0) {
            const note = document.createElement('div');
            note.className = 'sidebar-empty-note';
            note.textContent = `No script documentation yet for ${ASSET_PACKS[this.pack]?.label || this.pack}.`;
            listEl.appendChild(note);
            countEl.textContent = '0 scripts';
            return;
        }

        this.scripts.forEach(script => {
            const item = document.createElement('div');
            item.className = 'script-list-item';
            item.dataset.name = script.name;

            item.textContent = script.title;
            item.addEventListener('click', () => this.selectScript(script));
            listEl.appendChild(item);
        });

        countEl.textContent = `${this.scripts.length} scripts`;
    }

    setupEventListeners() {
        // Script search
        const searchInput = document.getElementById('searchInput');
        const searchClear = document.getElementById('searchClear');
        searchInput.addEventListener('input', (e) => {
            this.filterScripts(e.target.value);
            searchClear.classList.toggle('hidden', !e.target.value);
        });
        searchClear.addEventListener('click', () => {
            searchInput.value = '';
            searchClear.classList.add('hidden');
            this.filterScripts('');
            searchInput.focus();
        });

        // Classifier search
        const classifierInput = document.getElementById('classifierSearchInput');
        const classifierClear = document.getElementById('classifierSearchClear');
        classifierInput.addEventListener('input', (e) => {
            this.filterClassifiers(e.target.value);
            classifierClear.classList.toggle('hidden', !e.target.value);
        });
        classifierClear.addEventListener('click', () => {
            classifierInput.value = '';
            classifierClear.classList.add('hidden');
            this.filterClassifiers('');
            classifierInput.focus();
        });

        // Sidebar tab switching
        document.querySelectorAll('.sidebar-tab').forEach(btn => {
            btn.addEventListener('click', (e) => {
                this.switchSidebarTab(e.target.dataset.sidebar);
            });
        });

        // Main content tab switching
        document.querySelectorAll('.tab-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                this.switchTab(e.target.dataset.tab);
            });
        });

        document.getElementById('collapseAllBtn').addEventListener('click', () => {
            if (window.cosRenderer) window.cosRenderer.toggleAllSections(true);
        });
        document.getElementById('expandAllBtn').addEventListener('click', () => {
            if (window.cosRenderer) window.cosRenderer.toggleAllSections(false);
        });

        window.addEventListener('hashchange', () => this.handleHashNavigation());
    }

    switchSidebarTab(tabName) {
        this.currentSidebarTab = tabName;

        document.querySelectorAll('.sidebar-tab').forEach(btn => {
            btn.classList.toggle('active', btn.dataset.sidebar === tabName);
        });

        document.querySelectorAll('.sidebar-panel').forEach(panel => {
            panel.classList.toggle('active', panel.id === `${tabName}Panel`);
        });
    }

    filterScripts(query) {
        const items = document.querySelectorAll('.script-list-item');
        const q = query.toLowerCase().trim();
        let visible = 0;

        items.forEach(item => {
            if (!q) {
                item.classList.remove('hidden');
                visible++;
                return;
            }

            const name = item.dataset.name.toLowerCase();
            const match = this.fuzzyMatch(q, name);
            item.classList.toggle('hidden', !match);
            if (match) visible++;
        });

        document.getElementById('searchCount').textContent =
            q ? `${visible}/${this.scripts.length}` : `${this.scripts.length} scripts`;
    }

    /** Classifier keys in display order (family, then genus, then species numerically). */
    sortedClassifierKeys() {
        return Object.keys(this.classifiers).sort((a, b) => {
            const pa = a.split(' ').map(Number);
            const pb = b.split(' ').map(Number);
            return (pa[0] - pb[0]) || (pa[1] - pb[1]) || (pa[2] - pb[2]);
        });
    }

    renderClassifierList() {
        const listEl = document.getElementById('classifierList');
        const countEl = document.getElementById('classifierSearchCount');
        const keys = this.sortedClassifierKeys();

        listEl.innerHTML = '';

        if (keys.length === 0) {
            const note = document.createElement('div');
            note.className = 'sidebar-empty-note';
            note.textContent = `No classifiers yet for ${ASSET_PACKS[this.pack]?.label || this.pack}.`;
            listEl.appendChild(note);
            countEl.textContent = '0 classifiers';
            return;
        }

        keys.forEach(key => {
            const refs = this.classifiers[key];
            const node = document.createElement('div');
            node.className = 'classifier-node';
            node.dataset.classifier = key;

            // Header (collapsible)
            const header = document.createElement('div');
            header.className = 'classifier-header';

            const arrow = document.createElement('span');
            arrow.className = 'toggle-arrow';
            arrow.textContent = '\u25B6';

            const label = document.createElement('span');
            label.className = 'classifier-key';
            label.textContent = key;

            header.appendChild(arrow);
            header.appendChild(label);

            header.addEventListener('click', () => {
                node.classList.toggle('expanded');
            });

            // Children
            const children = document.createElement('div');
            children.className = 'classifier-children';

            refs.forEach(ref => {
                const child = document.createElement('div');
                child.className = 'classifier-child';
                child.dataset.script = ref.script;

                const typeBadge = document.createElement('span');
                typeBadge.className = `ref-type ${ref.type.toLowerCase()}`;
                typeBadge.textContent = ref.type;

                const name = document.createElement('span');
                name.textContent = ref.script;

                child.appendChild(typeBadge);
                child.appendChild(name);

                child.addEventListener('click', (e) => {
                    e.stopPropagation();
                    this.selectScriptByName(ref.script);
                });

                children.appendChild(child);
            });

            node.appendChild(header);
            node.appendChild(children);
            listEl.appendChild(node);
        });

        countEl.textContent = `${keys.length} classifiers`;
    }

    filterClassifiers(query) {
        const nodes = document.querySelectorAll('.classifier-node');
        const q = query.trim().toLowerCase();
        let visible = 0;
        const total = nodes.length;

        nodes.forEach(node => {
            if (!q) {
                node.classList.remove('hidden');
                node.classList.remove('expanded');
                visible++;
                return;
            }

            const key = node.dataset.classifier;
            const match = this.classifierMatch(q, key);
            node.classList.toggle('hidden', !match);
            if (match) {
                visible++;
                node.classList.add('expanded');
            }
        });

        document.getElementById('classifierSearchCount').textContent =
            q ? `${visible}/${total}` : `${total} classifiers`;
    }

    classifierMatch(query, classifier) {
        // Parse query parts — each part matches the corresponding classifier component
        // A '0' in the classifier is a wildcard that matches any query value for that position
        // A '0' in the query is also a wildcard (match any classifier value at that position)
        // Partial input matches: "2" matches any classifier starting with family 2
        const qParts = query.split(/\s+/).filter(Boolean);
        const cParts = classifier.split(' ');

        for (let i = 0; i < qParts.length; i++) {
            if (i >= cParts.length) return false;
            // Wildcard 0 in either query or classifier matches anything
            if (qParts[i] === '0' || cParts[i] === '0') continue;
            // Check if the classifier part starts with the query part (prefix match)
            if (!cParts[i].startsWith(qParts[i])) return false;
        }
        return true;
    }

    selectScriptByName(name) {
        const script = this.scripts.find(s => s.name === name);
        if (script) {
            this.selectScript(script);
        }
    }

    fuzzyMatch(query, text) {
        let qi = 0;
        for (let ti = 0; ti < text.length && qi < query.length; ti++) {
            if (text[ti] === query[qi]) qi++;
        }
        return qi === query.length;
    }

    async selectScript(script) {
        this.currentScript = script;

        // Update sidebar selection (both panels)
        document.querySelectorAll('.script-list-item').forEach(item => {
            item.classList.toggle('active', item.dataset.name === script.name);
        });
        document.querySelectorAll('.classifier-child').forEach(item => {
            item.classList.toggle('active', item.dataset.script === script.name);
        });

        // Update URL hash
        history.replaceState(null, '', '#' + encodeURIComponent(script.name));

        // Show content area
        document.getElementById('emptyState').classList.add('hidden');
        document.getElementById('contentArea').classList.remove('hidden');

        // Update header
        document.getElementById('scriptTitle').textContent = script.title;
        const meta = script.hasScript
            ? `${script.docFile} \u2022 ${script.scriptFile}`
            : script.docFile;
        document.getElementById('scriptMeta').textContent = meta;

        // Enable/disable script tab based on availability
        const scriptTabBtn = document.querySelector('.tab-btn[data-tab="script"]');
        if (scriptTabBtn) {
            scriptTabBtn.disabled = !script.hasScript;
            scriptTabBtn.style.opacity = script.hasScript ? '1' : '0.4';
            scriptTabBtn.title = script.hasScript ? '' : 'No .cos file available';
        }

        await this.loadTabContent(this.currentTab);
    }

    switchTab(tabName) {
        // Don't switch to script tab if no script available
        if (tabName === 'script' && this.currentScript && !this.currentScript.hasScript) {
            return;
        }

        this.currentTab = tabName;

        document.querySelectorAll('.tab-btn').forEach(btn => {
            btn.classList.toggle('active', btn.dataset.tab === tabName);
        });

        document.querySelectorAll('.tab-panel').forEach(panel => {
            panel.classList.toggle('active', panel.id === `${tabName}Panel`);
        });

        if (this.currentScript) {
            this.loadTabContent(tabName);
        }
    }

    async loadTabContent(tabName) {
        if (tabName === 'docs') {
            await this.loadDocumentation();
        } else if (tabName === 'script') {
            await this.loadScript();
        }
    }

    async loadDocumentation() {
        const script = this.currentScript;
        const container = document.getElementById('docsContent');

        if (this.cachedDocs[script.name]) {
            container.innerHTML = this.cachedDocs[script.name];
            this.setupDocLinks(container);
            return;
        }

        container.innerHTML = '<p class="loading-message">Loading documentation...</p>';

        try {
            const response = await fetch(`${this.docsBasePath()}/${encodeURIComponent(script.docFile)}`);
            if (!response.ok) throw new Error(`HTTP ${response.status}`);
            const markdown = await response.text();

            if (typeof marked !== 'undefined') {
                const html = marked.parse(markdown);
                this.cachedDocs[script.name] = html;
                container.innerHTML = html;
                this.setupDocLinks(container);
            } else {
                // Fallback: show raw markdown in a pre block
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

                // Try direct ID match first
                let targetEl = container.querySelector(`[id="${CSS.escape(targetId)}"]`);

                // Fallback: match heading text slugified the same way as the link
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

    async loadScript() {
        const script = this.currentScript;
        const container = document.getElementById('scriptContent');

        if (!script.hasScript) {
            container.innerHTML = '<p class="loading-message">No .cos file available for this script.</p>';
            return;
        }

        if (this.cachedScripts[script.name]) {
            this.renderCAOSContent(this.cachedScripts[script.name]);
            return;
        }

        container.innerHTML = '<p class="loading-message">Loading script...</p>';

        try {
            const assetDir = ASSET_PACKS[this.pack].assetDir;
            const scriptDir = script.scriptDir || '001 World';
            const cosPath = `../../Assets/${encodeURIComponent(assetDir)}/Bootstrap/${encodeURIComponent(scriptDir)}/${encodeURIComponent(script.scriptFile)}`;
            const response = await fetch(cosPath);
            if (!response.ok) throw new Error(`HTTP ${response.status}`);
            const content = await response.text();

            this.cachedScripts[script.name] = content;
            this.renderCAOSContent(content);
        } catch (error) {
            container.innerHTML = `<div class="error-message">Failed to load script: ${error.message}</div>`;
        }
    }

    renderCAOSContent(content) {
        const container = document.getElementById('scriptContent');

        if (!window.cosRenderer) {
            container.innerHTML = `<pre style="padding:20px;color:#e2e8f0;font-size:13px">${this.escapeHtml(content)}</pre>`;
            this.buildSectionNav();
            return;
        }

        const html = window.cosRenderer.renderContent(content, {
            filename: this.currentScript.scriptFile,
            enableClickableCommands: true,
            enableCollapsibleSections: true,
            showLineNumbers: true,
            showSectionHeaders: true,
            preserveEmptyLines: true
        });

        container.innerHTML = html;

        // Setup command click handlers
        window.cosRenderer.setupEventHandlers(container, {
            onCommandClick: (commandName) => {
                if (window.caosCommandModal) {
                    window.caosCommandModal.showCommandDetails(commandName);
                }
            }
        });

        this.buildSectionNav();
    }

    buildSectionNav() {
        const navList = document.getElementById('sectionNavList');
        const container = document.getElementById('scriptContent');
        const headers = container.querySelectorAll('.cos-section-header');

        navList.innerHTML = '';

        if (headers.length === 0) {
            navList.innerHTML = '<div class="section-nav-item" style="color:#718096;cursor:default">No sections</div>';
            return;
        }

        headers.forEach((header) => {
            const titleEl = header.querySelector('.section-title');
            const classifierEl = header.querySelector('.cos-classifier');
            const eventNameEl = header.querySelector('.cos-event-name');

            const title = titleEl ? titleEl.textContent : 'Unknown';
            const classifier = classifierEl ? classifierEl.textContent : '';
            const eventName = eventNameEl ? eventNameEl.textContent : '';

            const item = document.createElement('div');
            item.className = 'section-nav-item';
            item.title = [title, classifier, eventName].filter(Boolean).join(' ');

            const label = document.createElement('span');
            label.textContent = title;
            item.appendChild(label);

            if (classifier || eventName) {
                const detail = document.createElement('span');
                detail.className = 'nav-type';
                detail.textContent = eventName || classifier;
                item.appendChild(detail);
            }

            item.addEventListener('click', () => {
                // Expand the section if collapsed
                const contentDiv = header.nextElementSibling;
                if (contentDiv && contentDiv.classList.contains('collapsed')) {
                    const sectionId = contentDiv.id;
                    if (sectionId && window.cosRenderer) {
                        window.cosRenderer.toggleSection(sectionId);
                    }
                }

                header.scrollIntoView({ behavior: 'smooth', block: 'start' });

                // Highlight active nav item
                navList.querySelectorAll('.section-nav-item').forEach(i => i.classList.remove('active'));
                item.classList.add('active');
            });

            navList.appendChild(item);
        });

        // Track scroll position to highlight current section
        this.setupScrollTracking(container, headers, navList);
    }

    setupScrollTracking(container, headers, navList) {
        if (this._scrollHandler) {
            container.removeEventListener('scroll', this._scrollHandler);
        }

        const navItems = navList.querySelectorAll('.section-nav-item');

        this._scrollHandler = () => {
            const scrollTop = container.scrollTop;
            let activeIndex = 0;

            headers.forEach((header, i) => {
                if (header.offsetTop <= scrollTop + 10) {
                    activeIndex = i;
                }
            });

            navItems.forEach((item, i) => {
                item.classList.toggle('active', i === activeIndex);
            });
        };

        container.addEventListener('scroll', this._scrollHandler, { passive: true });
    }

    handleURLParams() {
        const params = new URLSearchParams(window.location.search);
        const tab = params.get('tab');
        const search = params.get('search');

        if (tab === 'classifiers') {
            this.switchSidebarTab('classifiers');
            if (search) {
                const input = document.getElementById('classifierSearchInput');
                const clearBtn = document.getElementById('classifierSearchClear');
                input.value = search;
                clearBtn.classList.remove('hidden');
                this.filterClassifiers(search);
                // Deep links land on an article directly: open the first match
                // (in display order). A #hash in the URL pins a specific script
                // and wins over the auto-selection (handleHashNavigation).
                if (!window.location.hash) {
                    this.selectFirstClassifierMatch(search);
                }
            }
        } else if (tab === 'scripts' && search) {
            const input = document.getElementById('searchInput');
            const clearBtn = document.getElementById('searchClear');
            input.value = search;
            clearBtn.classList.remove('hidden');
            this.filterScripts(search);
        }
    }

    /**
     * Select and load the first script referenced by the first classifier
     * matching the query, using the same match rules and display order as the
     * sidebar list. Skips refs whose script is missing from the index.
     * @param {string} query - classifier search query (e.g. "3 8 50")
     */
    selectFirstClassifierMatch(query) {
        const q = query.trim().toLowerCase();
        if (!q) return;

        for (const key of this.sortedClassifierKeys()) {
            if (!this.classifierMatch(q, key)) continue;
            for (const ref of this.classifiers[key]) {
                const script = this.scripts.find(s => s.name === ref.script);
                if (script) {
                    this.selectScript(script);
                    return;
                }
            }
        }
    }

    handleHashNavigation() {
        const hash = decodeURIComponent(window.location.hash.slice(1));
        if (hash && this.scripts.length > 0) {
            const script = this.scripts.find(s => s.name === hash);
            if (script && script !== this.currentScript) {
                this.selectScript(script);
            }
        }
    }

    showError(message) {
        const listEl = document.getElementById('scriptList');
        listEl.innerHTML = `<div class="error-message" style="margin:15px">${message}</div>`;
    }

    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }
}

document.addEventListener('DOMContentLoaded', () => {
    window.scriptDocsViewer = new ScriptDocsViewer();
});
