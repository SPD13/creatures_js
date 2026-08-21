/**
 * Script Event Constants
 * 
 * Auto-generated from Legacy_Code/engine/Agents/AgentConstants.h
 * DO NOT EDIT MANUALLY - Run 'node Rebuild/scripts/extract-script-events.js' to regenerate
 * 
 * Generated: 2025-10-05T05:29:10.537Z
 */

// ============================================================================
// Script Event Constants (Number → Name)
// ============================================================================

/**
 * Script event constants for use in CAOS script execution.
 * Use these instead of magic numbers for type safety and readability.
 * 
 * @example
 * agent.executeScriptForEvent(ScriptEvents.TIMER, from, p1, p2);
 */
export const ScriptEvents = Object.freeze({
    DEACTIVATE: 0,
    ACTIVATE1: 1,
    ACTIVATE2: 2,
    HIT: 3,
    PICKUP: 4,
    DROP: 5,
    COLLISION: 6,
    BUMP: 7,
    TIMER: 9,
    EAT: 12,
    STARTHOLDHANDS: 13,
    STOPHOLDHANDS: 14,
    EXTRAQUIESCENT: 16, // stand and watch it
    EXTRAACT1: 17, // activate1 it
    EXTRAACT2: 18, // activate2 it
    EXTRADEAC: 19, // deactivate it
    EXTRASEEK: 20, // go up and look at it
    EXTRAAVOID: 21, // walk/run away from it
    EXTRAPICKUP: 22, // pick it up
    EXTRADROP: 23, // drop anything you're carrying
    EXTRANEED: 24, // say what's bothering you
    EXTRAREST: 25, // -- no such action needed; do not script ---
    EXTRAWEST: 26, // walk idly to west
    EXTRAEAST: 27, // walk idly to east
    EXTRAEAT: 28, // eat it
    EXTRAHIT: 29, // hit it
    EXTRAUNDEFINED3: 30,
    EXTRAUNDEFINED4: 31,
    INTROQUIESCENT: 32, // stand and twiddle your thumbs
    INTROACT1: 33, // -- no such action needed; do not script ---
    INTROACT2: 34, // -- no such action needed; do not script ---
    INTRODEAC: 35, // -- no such action needed; do not script ---
    INTROSEEK: 36, // -- no such action needed; do not script ---
    INTROAVOID: 37, // -- no such action needed; do not script ---
    INTROPICKUP: 38, // -- no such action needed; do not script ---
    INTRODROP: 39, // drop anything you're carrying
    INTRONEED: 40, // say what's bothering you
    INTROREST: 41, // rest or sleep
    INTROWEST: 42, // walk idly to west
    INTROEAST: 43, // walk idly to east
    INTROEAT: 44, // -- no such action needed; do not script ---
    INTROHIT: 45, // -- no such action needed; do not script ---
    INTROUNDEFINED3: 46,
    INTROUNDEFINED4: 47,
    INVOLUNTARY0: 64,
    INVOLUNTARY1: 65,
    INVOLUNTARY2: 66,
    INVOLUNTARY3: 67,
    INVOLUNTARY4: 68,
    INVOLUNTARY5: 69,
    INVOLUNTARY6: 70,
    INVOLUNTARY7: 71,
    DIE: 72,
    RAWKEYDOWN: 73,
    RAWKEYUP: 74,
    RAWMOUSEMOVE: 75,
    RAWMOUSEDOWN: 76,
    RAWMOUSEUP: 77,
    RAWMOUSEWHEEL: 78,
    RAWTRANSLATEDCHAR: 79,
    UIMIN: 90, // Range of UI nums (min)
    UIMOUSEDOWN: 92,
    UIMAX: 100, // Range of UI nums (max)
    POINTERACT1: 101, // left button click, causing activation1
    POINTERACT2: 102, // left button click, causing activation2
    POINTERDEAC: 103, // left button click, causing deactivation
    POINTERPICKUP: 104,
    POINTERDROP: 105,
    POINTERPORTSELECT: 110,
    POINTERPORTCONNECT: 111,
    POINTERPORTDISCONNECT: 112,
    POINTERPORTCANCEL: 113,
    POINTERPORTERROR: 114,
    POINTERHOLDHANDS: 115,
    POINTERCLICKEDBACKGROUND: 116,
    POINTERACTIONDISPATCH: 117,
    CONNECTIONBREAK: 118,
    SELECTEDCREATURECHANGED: 120,
    PICKUPBYVEHICLE: 121,
    DROPBYVEHICLE: 122,
    WINDOWRESIZED: 123,
    GOTCARRIEDAGENT: 124,
    LOSTCARRIEDAGENT: 125,
    _MAKE_SPEECH_BUBBLE: 126,
    _LIFE_EVENT: 127,
    _WORLD_LOADED: 128,
    DONATESPERM: 200,
    AGENTEXCEPTION: 255,
});

// ============================================================================
// Script Event Names (Name → Number - Reverse Lookup)
// ============================================================================

/**
 * Reverse mapping from event numbers to names.
 * Useful for debugging and displaying human-readable event names.
 * 
 * @example
 * console.log(`Executing: ${ScriptEventNames[eventNumber]}`);
 */
export const ScriptEventNames = Object.freeze({
    0: "DEACTIVATE",
    1: "ACTIVATE1",
    2: "ACTIVATE2",
    3: "HIT",
    4: "PICKUP",
    5: "DROP",
    6: "COLLISION",
    7: "BUMP",
    9: "TIMER",
    12: "EAT",
    13: "STARTHOLDHANDS",
    14: "STOPHOLDHANDS",
    16: "EXTRAQUIESCENT", // stand and watch it
    17: "EXTRAACT1", // activate1 it
    18: "EXTRAACT2", // activate2 it
    19: "EXTRADEAC", // deactivate it
    20: "EXTRASEEK", // go up and look at it
    21: "EXTRAAVOID", // walk/run away from it
    22: "EXTRAPICKUP", // pick it up
    23: "EXTRADROP", // drop anything you're carrying
    24: "EXTRANEED", // say what's bothering you
    25: "EXTRAREST", // -- no such action needed; do not script ---
    26: "EXTRAWEST", // walk idly to west
    27: "EXTRAEAST", // walk idly to east
    28: "EXTRAEAT", // eat it
    29: "EXTRAHIT", // hit it
    30: "EXTRAUNDEFINED3",
    31: "EXTRAUNDEFINED4",
    32: "INTROQUIESCENT", // stand and twiddle your thumbs
    33: "INTROACT1", // -- no such action needed; do not script ---
    34: "INTROACT2", // -- no such action needed; do not script ---
    35: "INTRODEAC", // -- no such action needed; do not script ---
    36: "INTROSEEK", // -- no such action needed; do not script ---
    37: "INTROAVOID", // -- no such action needed; do not script ---
    38: "INTROPICKUP", // -- no such action needed; do not script ---
    39: "INTRODROP", // drop anything you're carrying
    40: "INTRONEED", // say what's bothering you
    41: "INTROREST", // rest or sleep
    42: "INTROWEST", // walk idly to west
    43: "INTROEAST", // walk idly to east
    44: "INTROEAT", // -- no such action needed; do not script ---
    45: "INTROHIT", // -- no such action needed; do not script ---
    46: "INTROUNDEFINED3",
    47: "INTROUNDEFINED4",
    64: "INVOLUNTARY0",
    65: "INVOLUNTARY1",
    66: "INVOLUNTARY2",
    67: "INVOLUNTARY3",
    68: "INVOLUNTARY4",
    69: "INVOLUNTARY5",
    70: "INVOLUNTARY6",
    71: "INVOLUNTARY7",
    72: "DIE",
    73: "RAWKEYDOWN",
    74: "RAWKEYUP",
    75: "RAWMOUSEMOVE",
    76: "RAWMOUSEDOWN",
    77: "RAWMOUSEUP",
    78: "RAWMOUSEWHEEL",
    79: "RAWTRANSLATEDCHAR",
    90: "UIMIN", // Range of UI nums (min)
    92: "UIMOUSEDOWN",
    100: "UIMAX", // Range of UI nums (max)
    101: "POINTERACT1", // left button click, causing activation1
    102: "POINTERACT2", // left button click, causing activation2
    103: "POINTERDEAC", // left button click, causing deactivation
    104: "POINTERPICKUP",
    105: "POINTERDROP",
    110: "POINTERPORTSELECT",
    111: "POINTERPORTCONNECT",
    112: "POINTERPORTDISCONNECT",
    113: "POINTERPORTCANCEL",
    114: "POINTERPORTERROR",
    115: "POINTERHOLDHANDS",
    116: "POINTERCLICKEDBACKGROUND",
    117: "POINTERACTIONDISPATCH",
    118: "CONNECTIONBREAK",
    120: "SELECTEDCREATURECHANGED",
    121: "PICKUPBYVEHICLE",
    122: "DROPBYVEHICLE",
    123: "WINDOWRESIZED",
    124: "GOTCARRIEDAGENT",
    125: "LOSTCARRIEDAGENT",
    126: "_MAKE_SPEECH_BUBBLE",
    127: "_LIFE_EVENT",
    128: "_WORLD_LOADED",
    200: "DONATESPERM",
    255: "AGENTEXCEPTION",
});

// ============================================================================
// Helper Functions
// ============================================================================

/**
 * Get human-readable name from event number.
 * Returns 'UNKNOWN_EVENT_N' if event number is not recognized.
 * 
 * @param {number} eventNumber - The script event number
 * @returns {string} The event name
 * 
 * @example
 * getEventName(9); // Returns "TIMER"
 */
export function getEventName(eventNumber) {
    return ScriptEventNames[eventNumber] || `UNKNOWN_EVENT_${eventNumber}`;
}

/**
 * Get event description from metadata.
 * Returns empty string if no description is available.
 *
 * @param {number} eventNumber - The script event number
 * @returns {string} The event description
 */
export function getEventDescription(eventNumber) {
    return ScriptEventMetadata[eventNumber]?.description || '';
}

/**
 * Get event number from name.
 * Returns undefined if event name is not recognized.
 * 
 * @param {string} eventName - The script event name (without SCRIPT prefix)
 * @returns {number|undefined} The event number
 * 
 * @example
 * getEventNumber('TIMER'); // Returns 9
 */
export function getEventNumber(eventName) {
    return ScriptEvents[eventName];
}

/**
 * Check if an event number is valid.
 * 
 * @param {number} eventNumber - The event number to check
 * @returns {boolean} True if the event exists
 * 
 * @example
 * isValidEvent(9); // Returns true
 * isValidEvent(999); // Returns false
 */
export function isValidEvent(eventNumber) {
    return ScriptEventNames.hasOwnProperty(eventNumber);
}

// ============================================================================
// Event Metadata with Descriptions
// ============================================================================

/**
 * Complete metadata for all script events including descriptions.
 * Useful for documentation, tooltips, and debugging interfaces.
 */
export const ScriptEventMetadata = Object.freeze({
    0: { name: "DEACTIVATE", value: 0, description: "" },
    1: { name: "ACTIVATE1", value: 1, description: "" },
    2: { name: "ACTIVATE2", value: 2, description: "" },
    3: { name: "HIT", value: 3, description: "" },
    4: { name: "PICKUP", value: 4, description: "" },
    5: { name: "DROP", value: 5, description: "" },
    6: { name: "COLLISION", value: 6, description: "" },
    7: { name: "BUMP", value: 7, description: "" },
    9: { name: "TIMER", value: 9, description: "" },
    12: { name: "EAT", value: 12, description: "" },
    13: { name: "STARTHOLDHANDS", value: 13, description: "" },
    14: { name: "STOPHOLDHANDS", value: 14, description: "" },
    16: { name: "EXTRAQUIESCENT", value: 16, description: "stand and watch it" },
    17: { name: "EXTRAACT1", value: 17, description: "activate1 it" },
    18: { name: "EXTRAACT2", value: 18, description: "activate2 it" },
    19: { name: "EXTRADEAC", value: 19, description: "deactivate it" },
    20: { name: "EXTRASEEK", value: 20, description: "go up and look at it" },
    21: { name: "EXTRAAVOID", value: 21, description: "walk/run away from it" },
    22: { name: "EXTRAPICKUP", value: 22, description: "pick it up" },
    23: { name: "EXTRADROP", value: 23, description: "drop anything you're carrying" },
    24: { name: "EXTRANEED", value: 24, description: "say what's bothering you" },
    25: { name: "EXTRAREST", value: 25, description: "-- no such action needed; do not script ---" },
    26: { name: "EXTRAWEST", value: 26, description: "walk idly to west" },
    27: { name: "EXTRAEAST", value: 27, description: "walk idly to east" },
    28: { name: "EXTRAEAT", value: 28, description: "eat it" },
    29: { name: "EXTRAHIT", value: 29, description: "hit it" },
    30: { name: "EXTRAUNDEFINED3", value: 30, description: "" },
    31: { name: "EXTRAUNDEFINED4", value: 31, description: "" },
    32: { name: "INTROQUIESCENT", value: 32, description: "stand and twiddle your thumbs" },
    33: { name: "INTROACT1", value: 33, description: "-- no such action needed; do not script ---" },
    34: { name: "INTROACT2", value: 34, description: "-- no such action needed; do not script ---" },
    35: { name: "INTRODEAC", value: 35, description: "-- no such action needed; do not script ---" },
    36: { name: "INTROSEEK", value: 36, description: "-- no such action needed; do not script ---" },
    37: { name: "INTROAVOID", value: 37, description: "-- no such action needed; do not script ---" },
    38: { name: "INTROPICKUP", value: 38, description: "-- no such action needed; do not script ---" },
    39: { name: "INTRODROP", value: 39, description: "drop anything you're carrying" },
    40: { name: "INTRONEED", value: 40, description: "say what's bothering you" },
    41: { name: "INTROREST", value: 41, description: "rest or sleep" },
    42: { name: "INTROWEST", value: 42, description: "walk idly to west" },
    43: { name: "INTROEAST", value: 43, description: "walk idly to east" },
    44: { name: "INTROEAT", value: 44, description: "-- no such action needed; do not script ---" },
    45: { name: "INTROHIT", value: 45, description: "-- no such action needed; do not script ---" },
    46: { name: "INTROUNDEFINED3", value: 46, description: "" },
    47: { name: "INTROUNDEFINED4", value: 47, description: "" },
    64: { name: "INVOLUNTARY0", value: 64, description: "flinch" },
    65: { name: "INVOLUNTARY1", value: 65, description: "lay egg" },
    66: { name: "INVOLUNTARY2", value: 66, description: "sneeze" },
    67: { name: "INVOLUNTARY3", value: 67, description: "cough" },
    68: { name: "INVOLUNTARY4", value: 68, description: "shiver" },
    69: { name: "INVOLUNTARY5", value: 69, description: "sleep" },
    70: { name: "INVOLUNTARY6", value: 70, description: "fainting" },
    71: { name: "INVOLUNTARY7", value: 71, description: "" },
    72: { name: "DIE", value: 72, description: "" },
    73: { name: "RAWKEYDOWN", value: 73, description: "Raw keyboard key down event - _P1_ = VK code" },
    74: { name: "RAWKEYUP", value: 74, description: "Raw keyboard key up event - _P1_ = VK code" },
    75: { name: "RAWMOUSEMOVE", value: 75, description: "Raw mouse move event - _P1_ = X, _P2_ = Y" },
    76: { name: "RAWMOUSEDOWN", value: 76, description: "Raw mouse button down event - _P1_ = button, _P2_ = X" },
    77: { name: "RAWMOUSEUP", value: 77, description: "Raw mouse button up event - _P1_ = button, _P2_ = X" },
    78: { name: "RAWMOUSEWHEEL", value: 78, description: "Raw mouse wheel event - _P1_ = delta, _P2_ = X" },
    79: { name: "RAWTRANSLATEDCHAR", value: 79, description: "Translated character event - _P1_ = char code" },
    90: { name: "UIMIN", value: 90, description: "Range of UI nums (min)" },
    92: { name: "UIMOUSEDOWN", value: 92, description: "" },
    100: { name: "UIMAX", value: 100, description: "Range of UI nums (max)" },
    101: { name: "POINTERACT1", value: 101, description: "left button click, causing activation1" },
    102: { name: "POINTERACT2", value: 102, description: "left button click, causing activation2" },
    103: { name: "POINTERDEAC", value: 103, description: "left button click, causing deactivation" },
    104: { name: "POINTERPICKUP", value: 104, description: "" },
    105: { name: "POINTERDROP", value: 105, description: "" },
    110: { name: "POINTERPORTSELECT", value: 110, description: "" },
    111: { name: "POINTERPORTCONNECT", value: 111, description: "" },
    112: { name: "POINTERPORTDISCONNECT", value: 112, description: "" },
    113: { name: "POINTERPORTCANCEL", value: 113, description: "" },
    114: { name: "POINTERPORTERROR", value: 114, description: "" },
    115: { name: "POINTERHOLDHANDS", value: 115, description: "" },
    116: { name: "POINTERCLICKEDBACKGROUND", value: 116, description: "" },
    117: { name: "POINTERACTIONDISPATCH", value: 117, description: "" },
    118: { name: "CONNECTIONBREAK", value: 118, description: "" },
    120: { name: "SELECTEDCREATURECHANGED", value: 120, description: "" },
    121: { name: "PICKUPBYVEHICLE", value: 121, description: "" },
    122: { name: "DROPBYVEHICLE", value: 122, description: "" },
    123: { name: "WINDOWRESIZED", value: 123, description: "" },
    124: { name: "GOTCARRIEDAGENT", value: 124, description: "" },
    125: { name: "LOSTCARRIEDAGENT", value: 125, description: "" },
    126: { name: "_MAKE_SPEECH_BUBBLE", value: 126, description: "" },
    127: { name: "_LIFE_EVENT", value: 127, description: "" },
    128: { name: "_WORLD_LOADED", value: 128, description: "" },
    200: { name: "DONATESPERM", value: 200, description: "" },
    255: { name: "AGENTEXCEPTION", value: 255, description: "" },
});

// ============================================================================
// Event Categories (for organization in UI/debugging)
// ============================================================================

export const EventCategories = Object.freeze({
    STANDARD: { range: [0, 15], name: "Standard Events", events: [0, 1, 2, 3, 4, 5, 6, 7, 9, 12, 13, 14] },
    CREATURE_EXTROVERT: { range: [16, 31], name: "Creature Extrovert", events: [16, 17, 18, 19, 20, 21, 22, 23, 24, 25, 26, 27, 28, 29, 30, 31] },
    CREATURE_INTROVERT: { range: [32, 47], name: "Creature Introvert", events: [32, 33, 34, 35, 36, 37, 38, 39, 40, 41, 42, 43, 44, 45, 46, 47] },
    INVOLUNTARY: { range: [64, 72], name: "Involuntary Actions", events: [64, 65, 66, 67, 68, 69, 70, 71, 72] },
    INPUT: { range: [73, 79], name: "Raw Input Events", events: [73, 74, 75, 76, 77, 78, 79] },
    UI: { range: [90, 100], name: "UI Events", events: [90, 92, 100] },
    POINTER: { range: [101, 118], name: "Pointer Events", events: [101, 102, 103, 104, 105, 110, 111, 112, 113, 114, 115, 116, 117, 118] },
    SYSTEM: { range: [120, 128], name: "System Events", events: [120, 121, 122, 123, 124, 125, 126, 127, 128] },
    SPECIAL: { range: [200, 255], name: "Special Events", events: [200, 255] },
});

/**
 * Get the category for a given event number.
 * 
 * @param {number} eventNumber - The event number
 * @returns {object|null} Category object or null if not found
 */
export function getEventCategory(eventNumber) {
    for (const [key, category] of Object.entries(EventCategories)) {
        const [min, max] = category.range;
        if (eventNumber >= min && eventNumber <= max) {
            return { key, ...category };
        }
    }
    return null;
}

// ============================================================================
// Export Summary
// ============================================================================

/**
 * Total number of defined script events.
 */
export const TOTAL_EVENTS = 87;

/**
 * List of all event numbers.
 */
export const ALL_EVENT_NUMBERS = Object.freeze([0, 1, 2, 3, 4, 5, 6, 7, 9, 12, 13, 14, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25, 26, 27, 28, 29, 30, 31, 32, 33, 34, 35, 36, 37, 38, 39, 40, 41, 42, 43, 44, 45, 46, 47, 64, 65, 66, 67, 68, 69, 70, 71, 72, 73, 74, 75, 76, 77, 78, 79, 90, 92, 100, 101, 102, 103, 104, 105, 110, 111, 112, 113, 114, 115, 116, 117, 118, 120, 121, 122, 123, 125, 126, 127, 128, 200, 255]);

/**
 * List of all event names.
 */
export const ALL_EVENT_NAMES = Object.freeze(["DEACTIVATE", "ACTIVATE1", "ACTIVATE2", "HIT", "PICKUP", "DROP", "COLLISION", "BUMP", "TIMER", "EAT", "STARTHOLDHANDS", "STOPHOLDHANDS", "EXTRAQUIESCENT", "EXTRAACT1", "EXTRAACT2", "EXTRADEAC", "EXTRASEEK", "EXTRAAVOID", "EXTRAPICKUP", "EXTRADROP", "EXTRANEED", "EXTRAREST", "EXTRAWEST", "EXTRAEAST", "EXTRAEAT", "EXTRAHIT", "EXTRAUNDEFINED3", "EXTRAUNDEFINED4", "INTROQUIESCENT", "INTROACT1", "INTROACT2", "INTRODEAC", "INTROSEEK", "INTROAVOID", "INTROPICKUP", "INTRODROP", "INTRONEED", "INTROREST", "INTROWEST", "INTROEAST", "INTROEAT", "INTROHIT", "INTROUNDEFINED3", "INTROUNDEFINED4", "INVOLUNTARY0", "INVOLUNTARY1", "INVOLUNTARY2", "INVOLUNTARY3", "INVOLUNTARY4", "INVOLUNTARY5", "INVOLUNTARY6", "INVOLUNTARY7", "DIE", "RAWKEYDOWN", "RAWKEYUP", "RAWMOUSEMOVE", "RAWMOUSEDOWN", "RAWMOUSEUP", "RAWMOUSEWHEEL", "RAWTRANSLATEDCHAR", "UIMIN", "UIMOUSEDOWN", "UIMAX", "POINTERACT1", "POINTERACT2", "POINTERDEAC", "POINTERPICKUP", "POINTERDROP", "POINTERPORTSELECT", "POINTERPORTCONNECT", "POINTERPORTDISCONNECT", "POINTERPORTCANCEL", "POINTERPORTERROR", "POINTERHOLDHANDS", "POINTERCLICKEDBACKGROUND", "POINTERACTIONDISPATCH", "CONNECTIONBREAK", "SELECTEDCREATURECHANGED", "PICKUPBYVEHICLE", "DROPBYVEHICLE", "WINDOWRESIZED", "LOSTCARRIEDAGENT", "_MAKE_SPEECH_BUBBLE", "_LIFE_EVENT", "_WORLD_LOADED", "DONATESPERM", "AGENTEXCEPTION"]);

// ============================================================================
// Global Exports for Non-Module Scripts (e.g., caos-preview.js)
// ============================================================================

/**
 * Export all functionality to global window object for non-module scripts.
 * This allows scripts loaded via <script> tags (not ES6 modules) to access
 * the event system functions and constants.
 */
if (typeof window !== 'undefined') {
    window.ScriptEvents = ScriptEvents;
    window.ScriptEventNames = ScriptEventNames;
    window.getEventName = getEventName;
    window.getEventDescription = getEventDescription;
    window.getEventNumber = getEventNumber;
    window.isValidEvent = isValidEvent;
    window.ScriptEventMetadata = ScriptEventMetadata;
    window.EventCategories = EventCategories;
    window.getEventCategory = getEventCategory;
    window.ALL_EVENT_NUMBERS = ALL_EVENT_NUMBERS;
    window.ALL_EVENT_NAMES = ALL_EVENT_NAMES;
}
