/**
 * Shared MNG Audio Parser Library
 * Used by both mng-player tool and main game
 * 
 * This library provides MNG file parsing capabilities specifically focused on
 * audio data extraction and music script interpretation.
 */

/**
 * MNG Audio Parser - Handles MNG file parsing and audio extraction
 */
export class MNGAudioParser {
    constructor() {
        this.logger = window.logManager ? window.logManager.createLogger('MNGAudioParser') : null;
        this.fileCache = new Map();
    }

    /**
     * Parse MNG file and extract audio data
     * @param {ArrayBuffer} buffer - Raw MNG file data
     * @returns {Object} Parsed MNG structure with audio tracks
     */
    parseMNG(buffer) {
        try {
            this.log('info', `Parsing MNG file (${buffer.byteLength} bytes)`);

            // Use existing CreaturesFileFormats library for core parsing
            const parser = window.CreaturesFileFormats.MNGFormats.createParser(buffer);
            const mngData = parser.parse();

            this.log('info', `MNG parsed: ${mngData.samples.length} samples, script length: ${mngData.script.length}`);

            // Enhance with audio-specific processing
            const enhancedData = {
                ...mngData,
                audioSamples: this.processSamples(mngData.samples),
                musicScript: this.processScript(mngData.script),
                soundMap: this.createSoundMap(mngData.samples)
            };

            return enhancedData;

        } catch (error) {
            this.error(`Failed to parse MNG file: ${error.message}`);
            throw error;
        }
    }

    /**
     * Process audio samples and add metadata
     * @param {Array} samples - Raw samples from MNG
     * @returns {Array} Enhanced sample data
     */
    processSamples(samples) {
        return samples.map((sample, index) => ({
            ...sample,
            id: this.generateSoundId(sample.name, index),
            duration: null, // Will be filled after audio decoding
            channels: null,
            sampleRate: null,
            decoded: false
        }));
    }

    /**
     * Process music script for better parsing
     * @param {string} script - Raw script text
     * @returns {Object} Processed script data
     */
    processScript(script) {
        return {
            raw: script,
            length: script.length,
            tracks: [], // Will be populated by MNGScriptInterpreter
            effects: [],
            variables: new Map()
        };
    }

    /**
     * Create sound ID mapping for samples
     * @param {Array} samples - Sample data
     * @returns {Map} Sound ID to sample mapping
     */
    createSoundMap(samples) {
        const soundMap = new Map();
        
        samples.forEach((sample, index) => {
            // Create multiple mapping strategies
            const soundId = this.generateSoundId(sample.name, index);
            const nameId = this.nameToId(sample.name);
            
            soundMap.set(soundId, sample);
            soundMap.set(nameId, sample);
            soundMap.set(sample.name, sample);
            soundMap.set(index, sample);
        });

        return soundMap;
    }

    /**
     * Generate unique sound ID for sample
     * @param {string} name - Sample name
     * @param {number} index - Sample index
     * @returns {number} Unique sound ID
     */
    generateSoundId(name, index) {
        // Use MNG-specific ID range (0xff000000 + index)
        return 0xff000000 + index;
    }

    /**
     * Convert 4-character string to sound ID (matching C++ Tok() macro)
     * @param {string} soundName - 4-character sound name
     * @returns {number} Numeric sound ID
     */
    nameToId(soundName) {
        if (typeof soundName !== 'string') {
            return soundName; // Already an ID
        }
        
        // Pad to 4 characters if needed
        const padded = soundName.padEnd(4, '\0');
        const bytes = [];
        
        for (let i = 0; i < 4; i++) {
            bytes.push(padded.charCodeAt(i) || 0);
        }
        
        // Little-endian conversion (matching C++ implementation)
        return (bytes[3] << 24) | (bytes[2] << 16) | (bytes[1] << 8) | bytes[0];
    }

    /**
     * Convert sound ID back to 4-character string
     * @param {number} soundId - Numeric sound ID
     * @returns {string} 4-character string
     */
    idToName(soundId) {
        const bytes = [
            soundId & 0xff,
            (soundId >> 8) & 0xff,
            (soundId >> 16) & 0xff,
            (soundId >> 24) & 0xff
        ];
        
        return String.fromCharCode(...bytes).replace(/\0/g, '');
    }

    /**
     * Extract audio data for a specific sound ID
     * @param {Object} mngData - Parsed MNG data
     * @param {number} soundId - Sound identifier
     * @returns {ArrayBuffer|null} Raw audio data
     */
    extractSoundData(mngData, soundId) {
        const sample = mngData.soundMap.get(soundId);
        if (!sample || !sample.data) {
            this.warn(`Sound ID ${soundId} not found in MNG data`);
            return null;
        }
        
        return sample.data.slice(); // Return a copy
    }

    /**
     * Logging methods with LogManager integration
     */
    log(level, message, ...args) {
        if (this.logger) {
            this.logger(level, message, 'MNGParser', 'Core', ...args);
        } else {
            const logMethod = level === 'error' ? console.error : 
                             level === 'warn' ? console.warn : console.log;
            logMethod(`[MNGAudioParser] ${message}`, ...args);
        }
    }

    warn(message, ...args) {
        this.log('warn', message, ...args);
    }

    error(message, ...args) {
        this.log('error', message, ...args);
    }
}

/**
 * MNG Script Interpreter - Parses music scripts and extracts track information
 */
export class MNGScriptInterpreter {
    constructor(script, audioSamples = []) {
        this.logger = window.logManager ? window.logManager.createLogger('MNGScriptInterpreter') : null;
        this.script = script;
        this.audioSamples = audioSamples;
        this.tracks = [];
        this.effects = [];
        this.variables = new Map();
        
        this.parseScript();
    }

    /**
     * Parse the complete script
     */
    parseScript() {
        try {
            this.log('info', `Parsing MNG script (${this.script.length} characters)`);
            
            // Parse tracks using regex
            this.parseTracks();
            
            // Parse effects
            this.parseEffects();
            
            // Parse global variables
            this.parseGlobalVariables();

            // Parse manager-level Update/UpdateRate/Initialise scripts
            // C++ MusicManager inherits MusicUpdatable — top-level scripts
            this.parseManagerScripts();

            this.log('info', `Script parsed: ${this.tracks.length} tracks, ${this.effects.length} effects`);
            
        } catch (error) {
            this.error(`Script parse error: ${error.message}`);
        }
    }

    /**
     * Parse Track(...) blocks from script
     */
    parseTracks() {
        const trackRegex = /Track\s*\(\s*([^)]+)\s*\)\s*\{/gi;
        const script = this.script;
        let match;
        
        while ((match = trackRegex.exec(script)) !== null) {
            const trackName = match[1].trim().replace(/[''"]/g, '');
            const startPos = match.index + match[0].length;
            
            // Find the matching closing brace
            const trackBody = this.extractBlockContent(script, startPos);
            if (trackBody) {
                const track = this.parseTrack(trackName, trackBody);
                this.tracks.push(track);
                this.log('debug', `Parsed track: ${trackName} (${track.layers.length} layers)`);
            }
        }
    }

    /**
     * Parse Effect(...) blocks from script
     */
    parseEffects() {
        const effectRegex = /Effect\s*\(\s*([^)]+)\s*\)\s*\{/gi;
        const script = this.script;
        let match;
        
        while ((match = effectRegex.exec(script)) !== null) {
            const effectName = match[1].trim().replace(/[''"]/g, '');
            const startPos = match.index + match[0].length;
            
            const effectBody = this.extractBlockContent(script, startPos);
            if (effectBody) {
                const effect = this.parseEffect(effectName, effectBody);
                this.effects.push(effect);
                this.log('debug', `Parsed effect: ${effectName}`);
            }
        }
    }

    /**
     * Parse global variables from script
     */
    parseGlobalVariables() {
        const variableRegex = /Variable\s*\(\s*([^,]+)\s*,\s*([^)]+)\s*\)/gi;
        let match;
        
        while ((match = variableRegex.exec(this.script)) !== null) {
            const varName = match[1].trim().replace(/[''"]/g, '');
            const varValue = this.parseValue(match[2].trim());
            this.variables.set(varName, varValue);
        }
    }

    /**
     * Parse manager-level Update/UpdateRate/Initialise scripts.
     * C++ MusicManager inherits from MusicUpdatable, so the top level of the
     * MNG script can contain Update{}, UpdateRate(), and Initialise{} blocks
     * that are not inside any Track or Effect block.
     */
    parseManagerScripts() {
        // Find ranges of all Track and Effect blocks to exclude
        const excludeRanges = [];
        const blockRegex = /(?:Track|Effect)\s*\([^)]*\)\s*\{/gi;
        let match;
        while ((match = blockRegex.exec(this.script)) !== null) {
            const blockStart = match.index;
            const contentStart = match.index + match[0].length;
            const content = this.extractBlockContent(this.script, contentStart);
            if (content !== null) {
                const blockEnd = contentStart + content.length + 1;
                excludeRanges.push([blockStart, blockEnd]);
            }
        }

        // Parse Update{} blocks at manager level
        const allAssignments = [];
        const updateRegex = /Update\s*\{/gi;
        let updateMatch;
        while ((updateMatch = updateRegex.exec(this.script)) !== null) {
            const pos = updateMatch.index;
            const inside = excludeRanges.some(([s, e]) => pos >= s && pos < e);
            if (!inside) {
                const contentStart = updateMatch.index + updateMatch[0].length;
                const updateBody = this.extractBlockContent(this.script, contentStart);
                if (updateBody) {
                    const assignments = this.parseAssignments(updateBody);
                    if (assignments) allAssignments.push(...assignments);
                }
            }
        }
        this.managerUpdate = allAssignments.length > 0 ? allAssignments : null;

        // Parse UpdateRate at manager level
        // Look for UpdateRate(...) that is NOT inside any Track/Effect block
        const rateRegex = /UpdateRate\s*\(\s*([^)]+)\s*\)/gi;
        this.managerUpdateRate = 0;
        let rateMatch;
        while ((rateMatch = rateRegex.exec(this.script)) !== null) {
            const pos = rateMatch.index;
            const inside = excludeRanges.some(([s, e]) => pos >= s && pos < e);
            if (!inside) {
                this.managerUpdateRate = parseFloat(rateMatch[1].trim()) || 0;
                break; // Only one manager-level UpdateRate
            }
        }

        // Parse Initialise{} block at manager level
        this.managerInitialise = this.parseInitialiseBlock(this.script, excludeRanges);
    }

    /**
     * Extract content between matching braces
     * @param {string} text - Text to search
     * @param {number} startPos - Starting position after opening brace
     * @returns {string|null} Extracted content
     */
    extractBlockContent(text, startPos) {
        let braceCount = 1;
        let pos = startPos;
        
        while (pos < text.length && braceCount > 0) {
            if (text[pos] === '{') {
                braceCount++;
            } else if (text[pos] === '}') {
                braceCount--;
            }
            pos++;
        }
        
        if (braceCount === 0) {
            return text.substring(startPos, pos - 1);
        }
        return null;
    }

    /**
     * Parse individual track
     * @param {string} name - Track name
     * @param {string} body - Track body content
     * @returns {Object} Parsed track data
     */
    parseTrack(name, body) {
        const track = {
            name: name,
            fadeIn: this.extractValue(body, 'FadeIn'),
            fadeOut: this.extractValue(body, 'FadeOut'),
            beatLength: this.extractValue(body, 'BeatLength'),
            barLength: this.extractValue(body, 'BarLength'),
            tempo: this.extractValue(body, 'Tempo'),
            mood: this.extractValue(body, 'Mood'),
            threat: this.extractValue(body, 'Threat'),
            layers: [],
            variables: new Map()
        };
        
        // Parse layers
        const layerRegex = /(LoopLayer|AleotoricLayer|OneShotLayer)\s*\(\s*([^)]+)\s*\)\s*\{/gi;
        let match;
        
        while ((match = layerRegex.exec(body)) !== null) {
            const layerType = match[1];
            const layerName = match[2].trim().replace(/[''"]/g, '');
            const startPos = match.index + match[0].length;
            
            const layerBody = this.extractBlockContent(body, startPos);
            if (layerBody) {
                const layer = this.parseLayer(layerType, layerName, layerBody);
                track.layers.push(layer);
            }
        }
        
        // Parse track-level variables
        track.variables = this.parseVariablesInBlock(body);

        // Parse track-level Update/UpdateRate/Initialise scripts
        // C++ MusicTrack inherits from MusicUpdatable, giving it Update scripts,
        // an UpdateRate, and an Initialise script at the track scope.
        // These must exclude content inside Layer blocks.
        const layerRanges = this._findLayerBlockRanges(body);
        track.update = this.parseTrackUpdateBlocks(body);
        track.initialise = this.parseInitialiseBlock(body, layerRanges);

        // Extract UpdateRate at track level, excluding layer blocks
        track.updateRate = null;
        const rateRegex = /UpdateRate\s*\(\s*([^)]+)\s*\)/gi;
        let rateMatch;
        while ((rateMatch = rateRegex.exec(body)) !== null) {
            const pos = rateMatch.index;
            const insideLayer = layerRanges.some(([s, e]) => pos >= s && pos < e);
            if (!insideLayer) {
                track.updateRate = parseFloat(rateMatch[1].trim()) || null;
                break;
            }
        }

        return track;
    }

    /**
     * Parse individual layer
     * @param {string} type - Layer type
     * @param {string} name - Layer name
     * @param {string} body - Layer body content
     * @returns {Object} Parsed layer data
     */
    parseLayer(type, name, body) {
        const layer = {
            type: type,
            name: name,
            volume: this.extractValue(body, 'Volume') || 1.0,
            interval: this.extractValue(body, 'Interval'),
            updateRate: this.extractValue(body, 'UpdateRate'),
            beatSynch: this.extractValue(body, 'BeatSynch'),
            effect: this.extractStringValue(body, 'Effect'),
            pan: this.extractValue(body, 'Pan'),
            waves: this.parseWaves(body),
            variables: this.parseVariablesInBlock(body)
        };

        // For AleotoricLayer, also parse Voice blocks and layer-level Update blocks
        if (type === 'AleotoricLayer') {
            layer.voices = this.parseVoices(body);
            layer.update = this.parseLayerUpdateBlocks(body);
        }

        // For LoopLayer, extract Rate() keyword (C++ MusicLoopLayer::loopRate, default 0.2f)
        // This is distinct from UpdateRate — Rate controls how often the loop volume/pan is updated.
        if (type === 'LoopLayer') {
            layer.loopRate = this.extractValue(body, 'Rate');
            layer.update = this.parseLayerUpdateBlocks(body);
        }

        return layer;
    }

    /**
     * Parse individual effect
     * @param {string} name - Effect name
     * @param {string} body - Effect body content
     * @returns {Object} Parsed effect data
     */
    parseEffect(name, body) {
        const effect = {
            name: name,
            stages: [],
            variables: this.parseVariablesInBlock(body)
        };
        
        // Parse effect stages
        const stageRegex = /Stage\s*\{([^}]*)\}/gi;
        let match;
        
        while ((match = stageRegex.exec(body)) !== null) {
            const stageBody = match[1];
            // Use extractExpressionProperty for Pan/Volume/Delay/TempoDelay
            // because they can contain Random() expressions (e.g. Pan(Random(-1.0, 1.0)))
            const stage = {
                volume: this.extractExpressionProperty(stageBody, 'Volume'),
                pan: this.extractExpressionProperty(stageBody, 'Pan'),
                delay: this.extractExpressionProperty(stageBody, 'Delay'),
                tempoDelay: this.extractExpressionProperty(stageBody, 'TempoDelay'),
                variables: this.parseVariablesInBlock(stageBody)
            };
            effect.stages.push(stage);
        }
        
        return effect;
    }

    /**
     * Parse Wave(...) references in layer
     * @param {string} body - Layer body content
     * @returns {Array} Array of wave references
     */
    parseWaves(body) {
        const waves = [];
        const waveRegex = /Wave\s*\(\s*([^)]+)\s*\)/gi;
        let match;
        
        while ((match = waveRegex.exec(body)) !== null) {
            const waveName = match[1].trim().replace(/[''"]/g, '');
            waves.push({ 
                name: waveName,
                available: this.isWaveAvailable(waveName)
            });
        }
        
        return waves;
    }

    /**
     * Parse Voice { ... } blocks within an AleotoricLayer body
     * @param {string} body - Layer body content
     * @returns {Array} Array of voice objects
     */
    parseVoices(body) {
        const voices = [];
        const voiceRegex = /Voice\s*\{/gi;
        let match;

        while ((match = voiceRegex.exec(body)) !== null) {
            const startPos = match.index + match[0].length;
            const voiceBody = this.extractBlockContent(body, startPos);
            if (voiceBody) {
                voices.push(this.parseVoice(voiceBody));
            }
        }
        return voices;
    }

    /**
     * Parse a single Voice block body
     * @param {string} body - Voice body content
     * @returns {Object} Parsed voice with wave, conditions, interval, volume, update
     */
    parseVoice(body) {
        const voice = {
            wave: null,
            conditions: [],
            interval: null,   // expression string (e.g. "Random(1.7,2.2)" or "4.0")
            volume: null,     // expression string
            effect: null,     // effect name string (overrides layer default)
            update: null      // array of {variable, expression}
        };

        // Extract Wave(name)
        const waveMatch = /Wave\s*\(\s*([^)]+)\s*\)/i.exec(body);
        if (waveMatch) {
            voice.wave = waveMatch[1].trim().replace(/[''"]/g, '');
        }

        // Extract Condition(variable, min, max) - zero or more
        const condRegex = /Condition\s*\(\s*([^,]+)\s*,\s*([^,]+)\s*,\s*([^)]+)\s*\)/gi;
        let condMatch;
        while ((condMatch = condRegex.exec(body)) !== null) {
            voice.conditions.push({
                variable: condMatch[1].trim(),
                min: parseFloat(condMatch[2].trim()),
                max: parseFloat(condMatch[3].trim())
            });
        }

        // Extract Interval with balanced parentheses (handles Random(1.7,2.2))
        voice.interval = this.extractExpressionProperty(body, 'Interval');

        // Extract Volume expression (voice-level override)
        voice.volume = this.extractExpressionProperty(body, 'Volume');

        // Extract Effect name (voice-level override, e.g. Effect(Dulcimer))
        voice.effect = this.extractStringValue(body, 'Effect');

        // Extract Update block
        const updateMatch = /Update\s*\{/i.exec(body);
        if (updateMatch) {
            const updateStart = updateMatch.index + updateMatch[0].length;
            const updateBody = this.extractBlockContent(body, updateStart);
            if (updateBody) {
                voice.update = this.parseAssignments(updateBody);
            }
        }

        return voice;
    }

    /**
     * Extract a property value with balanced parentheses (handles nested expressions)
     * e.g. Interval(Random(1.7,2.2)) returns "Random(1.7,2.2)"
     * @param {string} text - Text to search
     * @param {string} property - Property name
     * @returns {string|null} Expression string or null
     */
    extractExpressionProperty(text, property) {
        const regex = new RegExp(`${property}\\s*\\(`, 'i');
        const match = regex.exec(text);
        if (!match) return null;

        const startPos = match.index + match[0].length;
        let depth = 1;
        let pos = startPos;
        while (pos < text.length && depth > 0) {
            if (text[pos] === '(') depth++;
            if (text[pos] === ')') depth--;
            pos++;
        }
        if (depth === 0) {
            return text.substring(startPos, pos - 1).trim();
        }
        return null;
    }

    /**
     * Parse assignment statements from an Update block body
     * Format: variable = expression (one per line)
     * @param {string} body - Update block body content
     * @returns {Array|null} Array of {variable, expression} or null
     */
    parseAssignments(body) {
        const assignments = [];
        const lines = body.split('\n');
        for (const line of lines) {
            const trimmed = line.trim();
            if (!trimmed || trimmed.startsWith('//')) continue;

            const eqPos = trimmed.indexOf('=');
            if (eqPos > 0) {
                const varName = trimmed.substring(0, eqPos).trim();
                const exprStr = trimmed.substring(eqPos + 1).trim();
                if (varName && exprStr) {
                    assignments.push({ variable: varName, expression: exprStr });
                }
            }
        }
        return assignments.length > 0 ? assignments : null;
    }

    /**
     * Parse layer-level Update blocks (excludes Update blocks inside Voice blocks)
     * Multiple Update blocks are concatenated (matching C++ behavior)
     * @param {string} body - Layer body content
     * @returns {Array|null} Array of {variable, expression} or null
     */
    parseLayerUpdateBlocks(body) {
        // Find ranges of all Voice{} blocks to exclude their Update blocks
        const voiceRanges = [];
        const voiceRegex = /Voice\s*\{/gi;
        let match;
        while ((match = voiceRegex.exec(body)) !== null) {
            const blockStart = match.index;
            const contentStart = match.index + match[0].length;
            const content = this.extractBlockContent(body, contentStart);
            if (content !== null) {
                const blockEnd = contentStart + content.length + 1;
                voiceRanges.push([blockStart, blockEnd]);
            }
        }

        // Find Update{} blocks that are NOT inside any Voice block
        const allAssignments = [];
        const updateRegex = /Update\s*\{/gi;
        let updateMatch;
        while ((updateMatch = updateRegex.exec(body)) !== null) {
            const updatePos = updateMatch.index;
            const insideVoice = voiceRanges.some(([start, end]) =>
                updatePos >= start && updatePos < end
            );

            if (!insideVoice) {
                const contentStart = updateMatch.index + updateMatch[0].length;
                const updateBody = this.extractBlockContent(body, contentStart);
                if (updateBody) {
                    const assignments = this.parseAssignments(updateBody);
                    if (assignments) {
                        allAssignments.push(...assignments);
                    }
                }
            }
        }

        return allAssignments.length > 0 ? allAssignments : null;
    }

    /**
     * Parse track-level Update blocks (excludes Update blocks inside Layer blocks).
     * C++ MusicTrack inherits from MusicUpdatable and can have Update scripts
     * that modify track variables (Volume, BeatLength, etc.) periodically.
     * @param {string} body - Track body content
     * @returns {Array|null} Array of {variable, expression} or null
     */
    parseTrackUpdateBlocks(body) {
        // Find ranges of all Layer blocks to exclude
        const layerRanges = this._findLayerBlockRanges(body);

        // Find Update{} blocks that are NOT inside any Layer block
        const allAssignments = [];
        const updateRegex = /Update\s*\{/gi;
        let updateMatch;
        while ((updateMatch = updateRegex.exec(body)) !== null) {
            const updatePos = updateMatch.index;
            const insideLayer = layerRanges.some(([start, end]) =>
                updatePos >= start && updatePos < end
            );

            if (!insideLayer) {
                const contentStart = updateMatch.index + updateMatch[0].length;
                const updateBody = this.extractBlockContent(body, contentStart);
                if (updateBody) {
                    const assignments = this.parseAssignments(updateBody);
                    if (assignments) {
                        allAssignments.push(...assignments);
                    }
                }
            }
        }

        return allAssignments.length > 0 ? allAssignments : null;
    }

    /**
     * Parse an Initialise block at a given scope (excludes nested blocks).
     * C++ MusicUpdatable::ParseInitialise — one-time initialization script.
     * @param {string} body - Body content (track or layer scope)
     * @param {Array} excludeRanges - Ranges to exclude (e.g. layer or voice blocks)
     * @returns {Array|null} Array of {variable, expression} or null
     */
    parseInitialiseBlock(body, excludeRanges = []) {
        const initRegex = /Initialise\s*\{/gi;
        let match;
        while ((match = initRegex.exec(body)) !== null) {
            const initPos = match.index;
            const insideExcluded = excludeRanges.some(([start, end]) =>
                initPos >= start && initPos < end
            );

            if (!insideExcluded) {
                const contentStart = match.index + match[0].length;
                const initBody = this.extractBlockContent(body, contentStart);
                if (initBody) {
                    return this.parseAssignments(initBody);
                }
            }
        }
        return null;
    }

    /**
     * Find character ranges of all Layer blocks (AleotoricLayer, LoopLayer, OneShotLayer)
     * in a track body. Used to exclude nested content when parsing track-level keywords.
     * @param {string} body - Track body content
     * @returns {Array<[number, number]>} Array of [startIndex, endIndex] ranges
     */
    _findLayerBlockRanges(body) {
        const ranges = [];
        const layerRegex = /(AleotoricLayer|LoopLayer|OneShotLayer)\s*\([^)]*\)\s*\{/gi;
        let match;
        while ((match = layerRegex.exec(body)) !== null) {
            const blockStart = match.index;
            const contentStart = match.index + match[0].length;
            const content = this.extractBlockContent(body, contentStart);
            if (content !== null) {
                const blockEnd = contentStart + content.length + 1;
                ranges.push([blockStart, blockEnd]);
            }
        }
        return ranges;
    }

    /**
     * Parse variables within a block
     * @param {string} body - Block content
     * @returns {Map} Variables map
     */
    parseVariablesInBlock(body) {
        const variables = new Map();
        const variableRegex = /Variable\s*\(\s*([^,]+)\s*,\s*([^)]+)\s*\)/gi;
        let match;
        
        while ((match = variableRegex.exec(body)) !== null) {
            const varName = match[1].trim().replace(/[''"]/g, '');
            const varValue = this.parseValue(match[2].trim());
            variables.set(varName, varValue);
        }
        
        return variables;
    }

    /**
     * Extract numeric value from property
     * @param {string} text - Text to search
     * @param {string} property - Property name
     * @returns {number|null} Extracted value
     */
    extractValue(text, property) {
        const regex = new RegExp(`${property}\\s*\\(\\s*([^)]+)\\s*\\)`, 'i');
        const match = regex.exec(text);
        return match ? this.parseValue(match[1].trim()) : null;
    }

    /**
     * Extract string value from property
     * @param {string} text - Text to search
     * @param {string} property - Property name
     * @returns {string|null} Extracted value
     */
    extractStringValue(text, property) {
        const regex = new RegExp(`${property}\\s*\\(\\s*([^)]+)\\s*\\)`, 'i');
        const match = regex.exec(text);
        return match ? match[1].trim().replace(/[''"]/g, '') : null;
    }

    /**
     * Parse value (number, boolean, or string)
     * @param {string} valueString - Value to parse
     * @returns {*} Parsed value
     */
    parseValue(valueString) {
        const cleaned = valueString.trim();
        
        // Try number first
        const num = parseFloat(cleaned);
        if (!isNaN(num)) {
            return num;
        }
        
        // Try boolean
        if (cleaned.toLowerCase() === 'true') return true;
        if (cleaned.toLowerCase() === 'false') return false;
        
        // Return as string, removing quotes
        return cleaned.replace(/[''"]/g, '');
    }

    /**
     * Check if wave sample is available
     * @param {string} waveName - Wave name to check
     * @returns {boolean} True if wave is available
     */
    isWaveAvailable(waveName) {
        return Array.isArray(this.audioSamples) && 
               this.audioSamples.some(sample => sample.name === waveName);
    }

    /**
     * Get tracks matching criteria
     * @param {Object} criteria - Search criteria
     * @returns {Array} Matching tracks
     */
    findTracks(criteria = {}) {
        return this.tracks.filter(track => {
            if (criteria.mood !== undefined && track.mood !== criteria.mood) return false;
            if (criteria.threat !== undefined && track.threat !== criteria.threat) return false;
            if (criteria.name && !track.name.includes(criteria.name)) return false;
            return true;
        });
    }

    /**
     * Logging methods with LogManager integration
     */
    log(level, message, ...args) {
        if (this.logger) {
            this.logger(level, message, 'MNGScript', 'Parser', ...args);
        } else {
            const logMethod = level === 'error' ? console.error : 
                             level === 'warn' ? console.warn : console.log;
            logMethod(`[MNGScriptInterpreter] ${message}`, ...args);
        }
    }

    warn(message, ...args) {
        this.log('warn', message, ...args);
    }

    error(message, ...args) {
        this.log('error', message, ...args);
    }
}

/**
 * MNGExpressionEvaluator - evaluates MNG script expressions at runtime.
 * Supports: Random(min,max), Add(a,b), Subtract(a,b), Multiply(a,b),
 * Divide(a,b), CosineWave(counter,period), SineWave(counter,period),
 * numeric constants, and variable references.
 */
export class MNGExpressionEvaluator {
    evaluate(exprStr, variables) {
        const trimmed = exprStr.trim();
        if (!trimmed) return 0;

        // C++ MusicValue is float (32-bit), so all constants and variables are float.
        const num = parseFloat(trimmed);
        if (!isNaN(num) && /^-?\d*\.?\d+$/.test(trimmed)) return Math.fround(num);

        if (/^\w+$/.test(trimmed)) {
            if (variables.has(trimmed)) return Math.fround(variables.get(trimmed));
            return 0;
        }

        const funcMatch = trimmed.match(/^(\w+)\s*\(/);
        if (funcMatch) {
            const funcName = funcMatch[1];
            const argsStart = funcMatch[0].length;
            const argsStr = this.extractBalancedArgs(trimmed, argsStart);
            const args = this.splitArgs(argsStr);
            const vals = args.map(a => this.evaluate(a, variables));

            // C++ MusicValue is float (32-bit). All expression results are
            // float-precision. Math.fround() truncates to 32-bit float to match.
            switch (funcName) {
                case 'Random': {
                    // Match C++ MusicExpression.cpp:301:
                    //   min + ((MusicValue)rand() * (max-min)) / ((MusicValue)RAND_MAX)
                    // C++ casts rand() to float, then float arithmetic throughout.
                    const randInt = Math.floor(Math.random() * 0x7FFFFFFF);
                    const fRand = Math.fround(randInt);
                    const fRange = Math.fround(vals[1] - vals[0]);
                    const fMax = Math.fround(0x7FFFFFFF);
                    return Math.fround(vals[0] + Math.fround(Math.fround(fRand * fRange) / fMax));
                }
                case 'Add':
                    return Math.fround(vals[0] + vals[1]);
                case 'Subtract':
                    return Math.fround(vals[0] - vals[1]);
                case 'Multiply':
                    return Math.fround(vals[0] * vals[1]);
                case 'Divide':
                    return vals[1] !== 0 ? Math.fround(vals[0] / vals[1]) : 0;
                case 'CosineWave':
                    return Math.fround(Math.cos(Math.fround(vals[0] * 2 * Math.PI / (vals[1] || 1))));
                case 'SineWave':
                    return Math.fround(Math.sin(Math.fround(vals[0] * 2 * Math.PI / (vals[1] || 1))));
                default:
                    return 0;
            }
        }

        return parseFloat(trimmed) || 0;
    }

    extractBalancedArgs(text, startPos) {
        let depth = 1;
        let pos = startPos;
        while (pos < text.length && depth > 0) {
            if (text[pos] === '(') depth++;
            if (text[pos] === ')') depth--;
            pos++;
        }
        return text.substring(startPos, pos - 1);
    }

    splitArgs(argsStr) {
        const args = [];
        let depth = 0;
        let start = 0;
        for (let i = 0; i < argsStr.length; i++) {
            if (argsStr[i] === '(') depth++;
            if (argsStr[i] === ')') depth--;
            if (argsStr[i] === ',' && depth === 0) {
                args.push(argsStr.substring(start, i).trim());
                start = i + 1;
            }
        }
        args.push(argsStr.substring(start).trim());
        return args.filter(a => a.length > 0);
    }
}

/**
 * Check if a voice is applicable based on its Condition() gates.
 */
export function isVoiceApplicable(voice, variables) {
    if (!voice.conditions || voice.conditions.length === 0) return true;
    for (const cond of voice.conditions) {
        const value = variables ? (variables.get(cond.variable) ?? 0) : 0;
        if (value < cond.min || value > cond.max) return false;
    }
    return true;
}

/**
 * Execute an Update block's assignment statements.
 */
export function executeUpdateBlock(assignments, variables, evaluator) {
    if (!assignments || !variables) return;
    for (const { variable: varName, expression: exprStr } of assignments) {
        const value = evaluator.evaluate(exprStr, variables);
        variables.set(varName, value);
    }
}

// Make classes and functions available globally for backward compatibility
if (typeof window !== 'undefined') {
    window.MNGAudioParser = MNGAudioParser;
    window.MNGScriptInterpreter = MNGScriptInterpreter;
    window.MNGExpressionEvaluator = MNGExpressionEvaluator;
    window.isVoiceApplicable = isVoiceApplicable;
    window.executeUpdateBlock = executeUpdateBlock;
}
