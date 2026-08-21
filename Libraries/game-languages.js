/**
 * game-languages.js
 *
 * The languages the game can be played in, and how to work out which of them a
 * given installation actually has. Shared by the launchers' language pickers
 * and anything else that needs to name a language rather than just resolve one.
 *
 * Selection itself lives in file-localiser.js; this module is only about
 * presenting the choice. The set offered is computed from the catalogue files
 * actually present, never hard-coded, so a pack that ships extra (or fewer)
 * translations is reflected without a code change.
 *
 * IMPORTANT — coverage is partial by design. The shipped packs translate a
 * minority of catalogue files (Creatures 3: 13 of 57 base names per language;
 * Docking Station: 22 of 69 for de/fr, 4 for es/it/nl). Everything untranslated
 * falls back to the English master, so picking German gives a *partly* German
 * game. Callers showing a picker should say so rather than promise more.
 *
 * The Electron launcher keeps its own copy of DISPLAY (it is CommonJS + a
 * classic-script renderer and cannot import this ESM module); the smoke test
 * Main_Game/Test/SmokeTests/file-localisation.mjs asserts the two agree.
 */

import { parseLocalisedBasename } from './file-localiser.js';

/**
 * Display metadata per primary language code, in the order a picker should show
 * them. `flag` is the country whose flag reads as "this language" to a player —
 * a presentation choice, not a claim about locale.
 */
export const GAME_LANGUAGES = [
    { code: 'en', flag: '🇬🇧', name: 'English',    endonym: 'English' },
    { code: 'fr', flag: '🇫🇷', name: 'French',     endonym: 'Français' },
    { code: 'de', flag: '🇩🇪', name: 'German',     endonym: 'Deutsch' },
    { code: 'es', flag: '🇪🇸', name: 'Spanish',    endonym: 'Español' },
    { code: 'it', flag: '🇮🇹', name: 'Italian',    endonym: 'Italiano' },
    { code: 'nl', flag: '🇳🇱', name: 'Dutch',      endonym: 'Nederlands' },
    { code: 'ru', flag: '🇷🇺', name: 'Russian',    endonym: 'Русский' }
];

/**
 * Text encoding the shipped catalogue files of each language are stored in.
 *
 * The files carry no encoding declaration and no BOM: the original engine read
 * raw bytes and let Windows' ANSI codepage — the one matching the user's system
 * locale — interpret them, so the SAME bytes rendered as Cyrillic on a Russian
 * install and as Latin-1 on a German one. Deriving the codepage from the file's
 * own language tag reproduces that. Sniffing cannot: "Пауза" in CP1251 is
 * valid CP1252 too, just meaningless ("Ïàóçà").
 *
 * Covers more languages than GAME_LANGUAGES offers, so a third-party pack
 * shipping e.g. Polish is decoded correctly even though no picker lists it.
 */
const CODEPAGE_BY_LANGUAGE = {
    ru: 'windows-1251',   // Cyrillic
    bg: 'windows-1251',
    uk: 'windows-1251',
    pl: 'windows-1250',   // Central European
    cs: 'windows-1250',
    sk: 'windows-1250',
    hu: 'windows-1250',
    hr: 'windows-1250',
    ro: 'windows-1250',
    el: 'windows-1253',   // Greek
    tr: 'windows-1254',   // Turkish
    he: 'windows-1255',
    ar: 'windows-1256'
};

/** Western European (en/fr/de/es/it/nl and anything unlisted). */
const DEFAULT_CODEPAGE = 'windows-1252';

/**
 * The encoding a catalogue file of the given language should be decoded with.
 * Pass the language of THE FILE, not the language the player asked for — an
 * English master file mixed in among Russian ones is still Latin-1.
 *
 * @param {string} langId - the file's language tag, or '' / 'neutral' for the
 *                          untagged master (English)
 * @returns {string} a TextDecoder label
 */
export function catalogueEncoding(langId) {
    const primary = String(langId || '').trim().toLowerCase().split('-')[0];
    if (!primary || primary === 'neutral') return DEFAULT_CODEPAGE;
    return CODEPAGE_BY_LANGUAGE[primary] || DEFAULT_CODEPAGE;
}

/** Look up display metadata for a language code (primary subtag only). */
export function languageInfo(code) {
    const primary = String(code || '').trim().toLowerCase().split('-')[0];
    return GAME_LANGUAGES.find(l => l.code === primary) || null;
}

/**
 * Work out which languages an installation can actually be played in, from the
 * catalogue filenames it ships.
 *
 * English is always offered: the untagged master files ARE English, so it is
 * available by definition and is what every other language falls back to.
 * Dialects (e.g. a lone "AgentHelp-en-GB.catalogue") are folded into their
 * primary language rather than offered separately — one file's worth of
 * British spelling is not a language choice. `?lang=en-GB` still reaches it.
 *
 * @param {string[]} catalogueFilenames - e.g. ['System.catalogue', 'Norn-de.catalogue']
 * @returns {Array<{code, flag, name, endonym, fileCount, baseCount, coverage}>}
 *          coverage is the fraction (0..1) of base names translated; 1 for English.
 */
export function availableLanguages(catalogueFilenames) {
    const baseNames = new Set();
    const fileCounts = new Map();

    for (const filename of catalogueFilenames || []) {
        if (!/\.catalogue$/i.test(filename)) continue;
        const { name, priLang } = parseLocalisedBasename(filename.replace(/\.catalogue$/i, ''));
        baseNames.add(name);
        const code = priLang || 'en';   // untagged master counts as English
        fileCounts.set(code, (fileCounts.get(code) || 0) + 1);
    }

    const baseCount = baseNames.size;

    return GAME_LANGUAGES
        .filter(lang => lang.code === 'en' || fileCounts.has(lang.code))
        .map(lang => {
            const fileCount = fileCounts.get(lang.code) || 0;
            return {
                ...lang,
                fileCount,
                baseCount,
                // English reads every base name (translated or master), so it is
                // always fully covered; others only cover what they translate.
                coverage: lang.code === 'en' ? 1 : (baseCount ? fileCount / baseCount : 0)
            };
        });
}

/**
 * Merge several installations' catalogue listings into one offer list, for a
 * launcher that shows one picker across every installed pack. A language counts
 * as available when any pack ships it; coverage is the best any pack offers.
 *
 * @param {string[][]} catalogueFileLists - one filename array per pack
 */
export function availableLanguagesAcrossPacks(catalogueFileLists) {
    const best = new Map();

    for (const files of catalogueFileLists || []) {
        for (const lang of availableLanguages(files)) {
            const existing = best.get(lang.code);
            if (!existing || lang.coverage > existing.coverage) best.set(lang.code, lang);
        }
    }

    // Keep GAME_LANGUAGES order rather than pack-scan order.
    return GAME_LANGUAGES.filter(l => best.has(l.code)).map(l => best.get(l.code));
}
