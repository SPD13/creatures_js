/**
 * Shared Sound File Loader Library
 * Used by both mng-player tool and main game
 * 
 * This library provides unified sound file loading capabilities for both
 * individual WAV files and MNG music files with efficient caching.
 */

import { MNGAudioParser, MNGScriptInterpreter } from './mng-audio-parser.js';

/**
 * Sound File Loader - Unified sound loading with caching
 */
export class SoundFileLoader {
    constructor() {
        this.logger = window.logManager ? window.logManager.createLogger('SoundFileLoader') : null;
        this.mngParser = new MNGAudioParser();
        this.soundCache = new Map(); // soundId -> AudioBuffer
        this.mngCache = new Map(); // filename -> parsed MNG data
        this.loadingPromises = new Map(); // Prevent duplicate loading
        this.cacheSize = 0;
        // Sized so a docked C3+DS world's full sound set fits DECODED:
        // C3 ships 64MB of 16-bit WAVs ≈ 128MB as float32 AudioBuffers (2x),
        // plus DS (~24MB decoded) and MNG music samples. At the old 50MB the
        // LRU churned constantly in C3-content areas — every eviction costs a
        // re-fetch + decodeAudioData, and knocks the sound off the SoundManager
        // sync fast path (cache miss → async start).
        this.maxCacheSize = 192 * 1024 * 1024; // 192MB decoded-audio cache
        this.lastUsed = 0; // LRU counter
        this.stats = {
            cacheHits: 0,
            cacheMisses: 0,
            totalLoaded: 0,
            mngFilesLoaded: 0,
            wavFilesLoaded: 0
        };
    }

    /**
     * Convert 4-character string to sound ID (matching C++ Tok() macro)
     * @param {string} soundName - 4-character name (e.g., "bang")
     * @param {boolean} forceCAOS - Force CAOS 4-character limitation (default: false)
     * @returns {number} Numeric sound ID
     */
    static nameToId(soundName, forceCAOS = false) {
        if (typeof soundName !== 'string') {
            return soundName; // Already an ID
        }
        
        // Only truncate for CAOS sound commands, not MNG wave names
        if (forceCAOS && soundName.length > 4) {
            console.warn(`CAOS sound name "${soundName}" is longer than 4 characters, truncating for CAOS compatibility`);
            soundName = soundName.substring(0, 4);
        }
        
        // For MNG wave names longer than 4 characters, use a hash-based approach
        if (!forceCAOS && soundName.length > 4) {
            return this.generateMNGWaveId(soundName);
        }
        
        // Match C++ Tok() macro behavior for 4-character names
        const padded = soundName.padEnd(4, '\0');
        const bytes = padded.split('').map(c => c.charCodeAt(0));
        
        // Little-endian conversion (matching C++ implementation)
        return (bytes[3] << 24) | (bytes[2] << 16) | (bytes[1] << 8) | bytes[0];
    }

    /**
     * Generate unique ID for MNG wave names (can be longer than 4 characters)
     * @param {string} waveName - Full wave name
     * @returns {number} Unique wave ID
     */
    static generateMNGWaveId(waveName) {
        // Use a simple hash for MNG wave names, starting from 0x10000000 to avoid conflicts
        let hash = 0x10000000;
        for (let i = 0; i < waveName.length; i++) {
            hash = ((hash << 5) - hash + waveName.charCodeAt(i)) & 0xffffffff;
        }
        return hash;
    }

    /**
     * Convert sound ID back to 4-character string
     * @param {number} soundId - Numeric sound ID
     * @returns {string} 4-character string
     */
    static idToName(soundId) {
        const bytes = [
            soundId & 0xff,
            (soundId >> 8) & 0xff,
            (soundId >> 16) & 0xff,
            (soundId >> 24) & 0xff
        ];
        
        return String.fromCharCode(...bytes).replace(/\0/g, '');
    }

    /**
     * Load sound by ID or name with automatic format detection
     * @param {number|string} soundIdentifier - Sound ID or name
     * @param {AudioContext} audioContext - Web Audio context
     * @param {Object} options - Loading options
     * @returns {Promise<AudioBuffer>} Decoded audio data
     */
    async loadSound(soundIdentifier, audioContext, options = {}) {
        let soundId;
        let isCAOSSound = options.isCAOS || false;
        
        if (typeof soundIdentifier === 'string') {
            soundId = SoundFileLoader.nameToId(soundIdentifier, isCAOSSound);
            // Also store the original name for MNG wave lookups
            if (!isCAOSSound) {
                this._originalWaveName = soundIdentifier;
            }
        } else {
            soundId = soundIdentifier;
        }

        this.log('debug', `Loading sound: ${soundIdentifier} -> ID: ${soundId} (CAOS: ${isCAOSSound})`);

        // Check MNG name cache first for direct lookups
        if (typeof soundIdentifier === 'string' && !isCAOSSound && this._mngNameCache) {
            if (this._mngNameCache.has(soundIdentifier)) {
                const entry = this._mngNameCache.get(soundIdentifier);
                this.stats.cacheHits++;
                this.log('debug', `MNG name cache hit: ${soundIdentifier}`);
                return entry.audioBuffer;
            }
        }

        // Check cache first
        if (this.soundCache.has(soundId)) {
            const cacheEntry = this.soundCache.get(soundId);
            cacheEntry.lastUsed = ++this.lastUsed;
            this.stats.cacheHits++;
            this.log('debug', `Cache hit for sound ID: ${soundId}`);
            return cacheEntry.audioBuffer;
        }

        // Check if already loading
        if (this.loadingPromises.has(soundId)) {
            this.log('debug', `Sound ${soundId} already loading, waiting...`);
            return await this.loadingPromises.get(soundId);
        }

        // Start loading
        const loadPromise = this._loadSoundInternal(soundId, audioContext, options);
        this.loadingPromises.set(soundId, loadPromise);

        try {
            const audioBuffer = await loadPromise;
            this.loadingPromises.delete(soundId);
            return audioBuffer;
        } catch (error) {
            this.loadingPromises.delete(soundId);
            throw error;
        }
    }

    /**
     * Internal sound loading method
     * @param {number} soundId - Sound ID
     * @param {AudioContext} audioContext - Web Audio context
     * @param {Object} options - Loading options
     * @returns {Promise<AudioBuffer>} Decoded audio data
     */
    async _loadSoundInternal(soundId, audioContext, options = {}) {
        this.stats.cacheMisses++;
        
        let audioData = null;
        let source = null;

        try {
            // Try MNG files first if soundId is in MNG range
            if (soundId >= 0xff000000) {
                audioData = await this.loadFromMNG(soundId, options.mngFile);
                source = 'MNG';
            } else {
                // Try individual WAV file
                audioData = await this.loadWAVFile(soundId, options.basePath);
                source = 'WAV';
            }

            if (!audioData) {
                // Name the sound, not just its packed id — the id is the four
                // characters of the name as a little-endian dword, which reads as
                // a nonsense number in a log line.
                const name = SoundFileLoader.idToName(soundId);
                const where = (soundId >= 0xff000000)
                    ? `MNG ${options.mngFile || '(default)'}`
                    : this.buildSoundPath(name, options.basePath);
                throw new Error(`Sound ${soundId} ('${name}') not found in any source (tried ${where})`);
            }

            // Decode audio data
            const audioBuffer = await audioContext.decodeAudioData(audioData);
            
            // Add to cache
            this.addToCache(soundId, audioBuffer, source);
            
            this.stats.totalLoaded++;
            if (source === 'MNG') {
                this.stats.mngFilesLoaded++;
            } else {
                this.stats.wavFilesLoaded++;
            }

            this.log('info', `Loaded sound ${soundId} from ${source} (${audioBuffer.duration.toFixed(2)}s)`);
            return audioBuffer;

        } catch (error) {
            this.error(`Failed to load sound ${soundId}: ${error.message}`);
            throw error;
        }
    }

    /**
     * Load sound from MNG file
     * @param {number} soundId - Sound ID
     * @param {string} mngFile - MNG file path (optional)
     * @returns {Promise<ArrayBuffer|null>} Raw audio data
     */
    async loadFromMNG(soundId, mngFile = null) {
        // If specific MNG file provided, load it
        if (mngFile) {
            const mngData = await this.loadMNGFile(mngFile);
            return this.mngParser.extractSoundData(mngData, soundId);
        }

        // Try all cached MNG files
        for (const [filename, mngData] of this.mngCache.entries()) {
            const audioData = this.mngParser.extractSoundData(mngData, soundId);
            if (audioData) {
                this.log('debug', `Found sound ${soundId} in cached MNG: ${filename}`);
                return audioData;
            }
        }

        return null;
    }

    /**
     * Load individual WAV file
     * @param {number} soundId - Sound ID
     * @param {string} basePath - Base path for assets
     * @returns {Promise<ArrayBuffer|null>} Raw audio data
     */
    async loadWAVFile(soundId, basePath = null) {
        const soundName = SoundFileLoader.idToName(soundId);
        const soundPath = this.buildSoundPath(soundName, basePath);

        try {
            this.log('debug', `Attempting to load WAV file: ${soundPath}`);
            
            const response = await fetch(soundPath);
            if (!response.ok) {
                if (response.status === 404) {
                    this.log('debug', `WAV file not found: ${soundPath}`);
                    return null;
                }
                throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }

            return await response.arrayBuffer();

        } catch (error) {
            this.log('debug', `Failed to load WAV file ${soundPath}: ${error.message}`);
            return null;
        }
    }

    /**
     * Load and parse MNG file
     * @param {string} mngPath - Path to MNG file
     * @returns {Promise<Object>} Parsed MNG data
     */
    async loadMNGFile(mngPath) {
        // Check cache first
        if (this.mngCache.has(mngPath)) {
            this.log('debug', `MNG cache hit: ${mngPath}`);
            return this.mngCache.get(mngPath);
        }

        try {
            this.log('info', `Loading MNG file: ${mngPath}`);

            const response = await fetch(mngPath);
            if (!response.ok) {
                throw new Error(`Failed to load MNG file: ${response.status} ${response.statusText}`);
            }

            const arrayBuffer = await response.arrayBuffer();
            const mngData = this.mngParser.parseMNG(arrayBuffer);

            // Create script interpreter
            const scriptInterpreter = new MNGScriptInterpreter(mngData.script, mngData.samples);
            mngData.tracks = scriptInterpreter.tracks;
            mngData.effects = scriptInterpreter.effects;
            mngData.scriptInterpreter = scriptInterpreter;

            // Cache the parsed data
            this.mngCache.set(mngPath, mngData);

            this.log('info', `MNG file loaded: ${mngPath} (${mngData.samples.length} samples, ${mngData.tracks.length} tracks)`);
            return mngData;

        } catch (error) {
            this.error(`Failed to load MNG file ${mngPath}: ${error.message}`);
            throw error;
        }
    }

    /**
     * Load all audio samples from MNG into cache
     * @param {string} mngPath - Path to MNG file
     * @param {AudioContext} audioContext - Web Audio context
     * @returns {Promise<number>} Number of samples loaded
     */
    async loadMNGSamples(mngPath, audioContext) {
        const mngData = await this.loadMNGFile(mngPath);
        let loadedCount = 0;

        // Initialize MNG name cache if not exists
        if (!this._mngNameCache) {
            this._mngNameCache = new Map();
        }

        for (const sample of mngData.samples) {
            try {
                const audioBuffer = await audioContext.decodeAudioData(sample.data.slice());
                const soundId = this.mngParser.generateSoundId(sample.name, mngData.samples.indexOf(sample));
                
                // Store with MNG ID and proper name mapping
                this.addToCache(soundId, audioBuffer, 'MNG-Batch', sample.name);
                
                // Also cache by wave name for direct lookup
                const waveId = SoundFileLoader.generateMNGWaveId(sample.name);
                this.addToCache(waveId, audioBuffer, 'MNG-Wave', sample.name);
                
                // Store name mapping for quick lookup
                this._mngNameCache.set(sample.name, {
                    mngId: soundId,
                    waveId: waveId,
                    audioBuffer: audioBuffer
                });
                
                loadedCount++;

            } catch (error) {
                this.warn(`Failed to decode sample ${sample.name}: ${error.message}`);
            }
        }

        this.log('info', `Loaded ${loadedCount}/${mngData.samples.length} samples from ${mngPath}`);
        return loadedCount;
    }

    /**
     * Build file path for individual sound files
     * @param {string} soundName - Sound name
     * @param {string} basePath - Base path override
     * @returns {string} Complete file path
     */
    buildSoundPath(soundName, basePath = null) {
        const effectiveBasePath = basePath || 
            (window.PathResolver ? window.PathResolver.getAssetPath() : '../../Assets');
        const url = `${effectiveBasePath}/Sounds/${soundName}.wav`;

        // Re-point through the asset index, which fixes BOTH problems this raw
        // URL has:
        //
        //  - CASE. Sound tokens are stored in saves as lowercase 4-char words
        //    ("ha_E", "bee0"), while the shipped files are capitalised
        //    ("Ha_E.wav", "Bee0.wav"). The original engine ran on a
        //    case-insensitive Windows filesystem and never noticed; a web server
        //    serving these paths does.
        //  - PACK. A docked (DS + C3) world's creatures reference C3 voice
        //    samples that the Docking Station pack does not ship at all
        //    (BeeE/Behm/Ha_E/...), so the active-pack URL 404s.
        //
        // repointUrl() resolves the real on-disk casing and the owning pack in
        // one index lookup, and returns the URL unchanged when the sub-path is in
        // no index (so a genuine miss still 404s rather than being masked).
        // Measured on ds_full: of the 131 distinct voice sounds its creatures
        // reference, only 23 resolve as-written — 52 need the case fix and 56 are
        // C3-pack-only.
        const apr = (typeof window !== 'undefined') ? window.assetPathResolver : null;
        return (apr && apr.initialized && typeof apr.repointUrl === 'function')
            ? apr.repointUrl(url)
            : url;
    }

    /**
     * Add audio buffer to cache with LRU management
     * @param {number} soundId - Sound ID
     * @param {AudioBuffer} audioBuffer - Decoded audio
     * @param {string} source - Source type (WAV, MNG, etc.)
     */
    addToCache(soundId, audioBuffer, source = 'Unknown', originalName = null) {
        // Calculate buffer size estimate
        const bufferSize = audioBuffer.length * audioBuffer.numberOfChannels * 4; // 4 bytes per float32
        
        // Make room in cache if needed
        this.makeRoomInCache(bufferSize);
        
        // Use original name for MNG samples, otherwise convert from ID
        const soundName = originalName || SoundFileLoader.idToName(soundId);
        
        // Create cache entry
        const cacheEntry = {
            audioBuffer: audioBuffer,
            lastUsed: ++this.lastUsed,
            size: bufferSize,
            source: source,
            soundName: soundName,
            originalName: originalName,
            duration: audioBuffer.duration,
            sampleRate: audioBuffer.sampleRate,
            channels: audioBuffer.numberOfChannels
        };
        
        this.soundCache.set(soundId, cacheEntry);
        this.cacheSize += bufferSize;
        
        this.log('debug', `Cached sound ${soundId} (${soundName}) from ${source} - ${(bufferSize / 1024).toFixed(1)}KB`);
    }

    /**
     * Make room in cache by evicting least recently used entries
     * @param {number} neededSize - Size needed for new entry
     */
    makeRoomInCache(neededSize) {
        while (this.cacheSize + neededSize > this.maxCacheSize && this.soundCache.size > 0) {
            // Find least recently used entry
            let oldestId = null;
            let oldestTime = Infinity;
            
            for (const [soundId, entry] of this.soundCache.entries()) {
                if (entry.lastUsed < oldestTime) {
                    oldestTime = entry.lastUsed;
                    oldestId = soundId;
                }
            }
            
            if (oldestId !== null) {
                const evicted = this.soundCache.get(oldestId);
                this.soundCache.delete(oldestId);
                this.cacheSize -= evicted.size;
                
                this.log('debug', `Evicted sound ${oldestId} (${evicted.soundName}) - ${(evicted.size / 1024).toFixed(1)}KB`);
            } else {
                break; // No more entries to evict
            }
        }
    }

    /**
     * Preload sounds from a list
     * @param {Array} soundList - Array of sound identifiers
     * @param {AudioContext} audioContext - Web Audio context
     * @param {Object} options - Loading options
     * @returns {Promise<Object>} Loading results
     */
    async preloadSounds(soundList, audioContext, options = {}) {
        this.log('info', `Preloading ${soundList.length} sounds...`);
        
        const results = {
            loaded: 0,
            failed: 0,
            errors: []
        };

        const loadPromises = soundList.map(async (soundId) => {
            try {
                await this.loadSound(soundId, audioContext, options);
                results.loaded++;
            } catch (error) {
                results.failed++;
                results.errors.push({ soundId, error: error.message });
                this.warn(`Failed to preload sound ${soundId}: ${error.message}`);
            }
        });

        await Promise.all(loadPromises);
        
        this.log('info', `Preloading complete: ${results.loaded} loaded, ${results.failed} failed`);
        return results;
    }

    /**
     * Get cache statistics
     * @returns {Object} Cache statistics
     */
    getStats() {
        return {
            ...this.stats,
            soundsCached: this.soundCache.size,
            mngFilesCached: this.mngCache.size,
            totalCacheSize: this.cacheSize,
            maxCacheSize: this.maxCacheSize,
            cacheUtilization: (this.cacheSize / this.maxCacheSize * 100).toFixed(1) + '%'
        };
    }

    /**
     * Get list of cached sounds
     * @returns {Array} Array of cached sound info
     */
    getCachedSounds() {
        return Array.from(this.soundCache.entries()).map(([soundId, entry]) => ({
            id: soundId,
            name: entry.originalName || entry.soundName,
            source: entry.source,
            duration: entry.duration,
            size: entry.size,
            lastUsed: entry.lastUsed,
            sampleRate: entry.sampleRate,
            channels: entry.channels
        }));
    }

    /**
     * Get list of loaded MNG files
     * @returns {Array} Array of MNG file info
     */
    getLoadedMNGFiles() {
        return Array.from(this.mngCache.entries()).map(([filename, mngData]) => ({
            filename: filename,
            samples: mngData.samples.length,
            tracks: mngData.tracks ? mngData.tracks.length : 0,
            effects: mngData.effects ? mngData.effects.length : 0,
            scriptLength: mngData.script.length
        }));
    }

    /**
     * Clear all cached data
     */
    clearCache() {
        this.soundCache.clear();
        this.mngCache.clear();
        this._mngNameCache = new Map();
        this.cacheSize = 0;
        this.lastUsed = 0;
        this.loadingPromises.clear();
        
        // Reset stats
        this.stats.cacheHits = 0;
        this.stats.cacheMisses = 0;
        
        this.log('info', 'Sound cache cleared');
    }

    /**
     * Set cache size limit
     * @param {number} maxSize - Maximum cache size in bytes
     */
    setCacheLimit(maxSize) {
        this.maxCacheSize = maxSize;
        this.makeRoomInCache(0); // Trigger cleanup if over new limit
        this.log('info', `Cache limit set to ${(maxSize / 1024 / 1024).toFixed(1)}MB`);
    }

    /**
     * Check if sound is available in cache
     * @param {number|string} soundIdentifier - Sound ID or name
     * @returns {boolean} True if sound is cached
     */
    isCached(soundIdentifier) {
        if (typeof soundIdentifier === 'string') {
            // Check MNG name cache first
            if (this._mngNameCache && this._mngNameCache.has(soundIdentifier)) {
                return true;
            }
            
            // Check hash-based ID for MNG wave names
            const waveId = SoundFileLoader.generateMNGWaveId(soundIdentifier);
            if (this.soundCache.has(waveId)) {
                return true;
            }
            
            // Check traditional 4-character sound ID
            const soundId = SoundFileLoader.nameToId(soundIdentifier, false);
            if (this.soundCache.has(soundId)) {
                return true;
            }
            
            return false;
        } else {
            return this.soundCache.has(soundIdentifier);
        }
    }

    /**
     * Logging methods with LogManager integration
     */
    log(level, message, ...args) {
        if (this.logger) {
            this.logger(level, message, 'SoundLoader', 'Core', ...args);
        } else {
            const logMethod = level === 'error' ? console.error : 
                             level === 'warn' ? console.warn : console.log;
            logMethod(`[SoundFileLoader] ${message}`, ...args);
        }
    }

    warn(message, ...args) {
        this.log('warn', message, ...args);
    }

    error(message, ...args) {
        this.log('error', message, ...args);
    }
}

// Make class available globally for backward compatibility
if (typeof window !== 'undefined') {
    window.SoundFileLoader = SoundFileLoader;
}
