/**
 * StaticConfigStore.js
 *
 * Configuration persistence for the static (no-backend) build, replacing
 * the gitignored Main_Game/config.dev.js. Settings live as one JSON blob
 * in localStorage; the static index.html loads this file as a CLASSIC
 * script BEFORE GlobalConfig.js so the stored settings seed
 * window.devConfig exactly where config.dev.js would (GlobalConfig
 * consumes window.devConfig at load time).
 *
 * The web Launcher's configuration form writes through set()/save() and
 * also applies values to the live GlobalConfig so a reload isn't needed
 * for runtime-checked settings.
 *
 * Not an ES module by design (mirrors config.dev.js loading).
 */

(function () {
    const KEY = 'c3.static.devConfig';       // Launcher form settings
    // JSON cache of the evaluated OPFS /config.dev.js. OPFS cannot be read
    // synchronously at page load, so the static backend evaluates the file
    // whenever it changes (first-run template copy, upload) and mirrors the
    // result here; this script then seeds devConfig synchronously exactly
    // where config.dev.js would in dev mode. Merge order at boot:
    // config file first, Launcher form settings on top.
    const FILE_KEY = 'c3.static.devConfigFile';

    function deepMerge(target, source) {
        for (const [k, v] of Object.entries(source || {})) {
            if (v && typeof v === 'object' && !Array.isArray(v) &&
                target[k] && typeof target[k] === 'object' && !Array.isArray(target[k])) {
                deepMerge(target[k], v);
            } else {
                target[k] = v;
            }
        }
        return target;
    }

    const store = {
        KEY,

        /** The stored config object ({} when unset/corrupt). */
        load() {
            try {
                return JSON.parse(localStorage.getItem(KEY)) || {};
            } catch (_) {
                return {};
            }
        },

        /** Replace the stored config wholesale. */
        save(config) {
            localStorage.setItem(KEY, JSON.stringify(config || {}));
        },

        /** Set one dotted path (e.g. 'nornai.remoteEndpoint') and persist. */
        set(path, value) {
            const config = store.load();
            const parts = path.split('.');
            let node = config;
            for (let i = 0; i < parts.length - 1; i++) {
                if (!node[parts[i]] || typeof node[parts[i]] !== 'object') node[parts[i]] = {};
                node = node[parts[i]];
            }
            node[parts[parts.length - 1]] = value;
            store.save(config);
        },

        get(path, fallback) {
            let node = store.load();
            for (const part of path.split('.')) {
                if (node == null || typeof node !== 'object') return fallback;
                node = node[part];
            }
            return node === undefined ? fallback : node;
        },

        /** The cached (evaluated) config-file object ({} when unset/corrupt). */
        loadFileConfig() {
            try {
                return JSON.parse(localStorage.getItem(FILE_KEY)) || {};
            } catch (_) {
                return {};
            }
        },

        /** Replace the config-file cache (called after the OPFS file changes). */
        saveFileConfig(configObject) {
            localStorage.setItem(FILE_KEY, JSON.stringify(configObject || {}));
        },

        /** Merge stored settings into window.devConfig (pre-GlobalConfig seed). */
        applyToDevConfig() {
            window.devConfig = deepMerge(
                deepMerge(window.devConfig || {}, store.loadFileConfig()),
                store.load());
        },

        /** Push one settings object into the live GlobalConfig (post-load). */
        applyObjectToGlobalConfig(obj) {
            if (!window.GlobalConfig || typeof window.GlobalConfig.set !== 'function') return;
            const walk = (node, prefix) => {
                for (const [k, v] of Object.entries(node || {})) {
                    const path = prefix ? `${prefix}.${k}` : k;
                    if (v && typeof v === 'object' && !Array.isArray(v)) walk(v, path);
                    else window.GlobalConfig.set(path, v);
                }
            };
            walk(obj, '');
        },

        /** Push stored settings into the live GlobalConfig: file, then form. */
        applyToGlobalConfig() {
            store.applyObjectToGlobalConfig(store.loadFileConfig());
            store.applyObjectToGlobalConfig(store.load());
        }
    };

    window.StaticConfigStore = store;

    // In the static build this script runs before GlobalConfig.js — seed
    // devConfig now so GlobalConfig picks the settings up on construction.
    store.applyToDevConfig();
})();
