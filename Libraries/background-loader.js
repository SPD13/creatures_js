/**
 * Creatures 3 Background (BLK) File Loader
 * Shared utility for loading and rendering background tiles
 */

/**
 * Cache performance monitoring for hit rate warnings
 */
class CachePerformanceMonitor {
    constructor(options = {}) {
        this.hitRateHistory = []; // Array of {timestamp, hitRate}
        this.warningThreshold = options.warningThreshold || 50; // Warn if hit rate < 50%
        this.criticalThreshold = options.criticalThreshold || 25; // Critical if < 25%
        this.historyDuration = options.historyDuration || 5000; // Track last 5 seconds
        this.hasWarned = false;
        this.lastWarningTime = 0;
        this.warningCooldown = 5000; // Wait 5 seconds between warnings
        this.consoleWarnings = options.consoleWarnings !== false; // Default true
        this.overlayWarnings = options.overlayWarnings || false; // Default false
        this.overlayElement = null;
        
        // Grace period settings
        this.startTime = Date.now();
        this.startupGracePeriod = options.startupGracePeriod || 5000; // 5 seconds startup grace
        this.zoomChangeGracePeriod = options.zoomChangeGracePeriod || 3000; // 3 seconds after zoom change
        this.lastZoomChangeTime = 0;
        this.minimumSamples = options.minimumSamples || 10; // Minimum samples before warning
    }

    /**
     * Record a new hit rate measurement
     * @param {number} hits - Cache hits this frame
     * @param {number} total - Total tiles this frame
     */
    recordHitRate(hits, total) {
        const hitRate = total > 0 ? (hits / total) * 100 : 100;
        const now = Date.now();
        
        // Add to history
        this.hitRateHistory.push({ timestamp: now, hitRate, hits, total });
        
        // Clean old entries
        this.hitRateHistory = this.hitRateHistory.filter(
            entry => now - entry.timestamp < this.historyDuration
        );
        
        // Calculate average hit rate over the tracking period
        const avgHitRate = this.getAverageHitRate();
        
        // Check warning thresholds
        this.checkWarnings(avgHitRate, hitRate);
    }

    /**
     * Calculate average hit rate over the tracking period
     * @returns {number} Average hit rate percentage
     */
    getAverageHitRate() {
        if (this.hitRateHistory.length === 0) return 100;
        
        let totalHits = 0;
        let totalTiles = 0;
        
        this.hitRateHistory.forEach(entry => {
            totalHits += entry.hits;
            totalTiles += entry.total;
        });
        
        return totalTiles > 0 ? (totalHits / totalTiles) * 100 : 100;
    }

    /**
     * Notify the monitor that zoom has changed (triggers grace period)
     */
    notifyZoomChange() {
        this.lastZoomChangeTime = Date.now();
    }

    /**
     * Check if we're in startup grace period
     * @returns {boolean} True if in startup grace period
     */
    isInStartupGracePeriod() {
        return (Date.now() - this.startTime) < this.startupGracePeriod;
    }

    /**
     * Check if we're in zoom change grace period
     * @returns {boolean} True if in zoom change grace period
     */
    isInZoomChangeGracePeriod() {
        return (Date.now() - this.lastZoomChangeTime) < this.zoomChangeGracePeriod;
    }

    /**
     * Check if we have enough samples for reliable warnings
     * @returns {boolean} True if we have enough samples
     */
    hasMinimumSamples() {
        return this.hitRateHistory.length >= this.minimumSamples;
    }

    /**
     * Check if warnings should be emitted based on hit rate
     * @param {number} avgHitRate - Average hit rate over time period
     * @param {number} currentHitRate - Current frame hit rate
     */
    checkWarnings(avgHitRate, currentHitRate) {
        const now = Date.now();
        
        // Skip warnings during startup grace period
        if (this.isInStartupGracePeriod()) {
            return;
        }
        
        // Skip warnings during zoom change grace period
        if (this.isInZoomChangeGracePeriod()) {
            return;
        }
        
        // Skip warnings if we don't have enough samples
        if (!this.hasMinimumSamples()) {
            return;
        }
        
        // Don't spam warnings - wait for cooldown
        if (now - this.lastWarningTime < this.warningCooldown) return;
        
        if (avgHitRate < this.criticalThreshold) {
            this.emitWarning('critical', avgHitRate, currentHitRate);
            this.lastWarningTime = now;
            this.hasWarned = true;
        } else if (avgHitRate < this.warningThreshold) {
            this.emitWarning('warning', avgHitRate, currentHitRate);
            this.lastWarningTime = now;
            this.hasWarned = true;
        } else if (this.hasWarned && avgHitRate > this.warningThreshold + 10) {
            // Clear warning when performance improves significantly
            this.emitWarning('clear', avgHitRate, currentHitRate);
            this.lastWarningTime = now;
            this.hasWarned = false;
        }
    }

    /**
     * Emit warnings to console and/or overlay
     * @param {string} level - Warning level: 'warning', 'critical', 'clear'
     * @param {number} avgHitRate - Average hit rate
     * @param {number} currentHitRate - Current hit rate
     */
    emitWarning(level, avgHitRate, currentHitRate) {
        const avgFormatted = avgHitRate.toFixed(1);
        const currentFormatted = currentHitRate.toFixed(1);
        
        // Console warnings
        if (this.consoleWarnings) {
            const message = `Background cache hit rate: ${avgFormatted}% avg, ${currentFormatted}% current`;
            
            switch(level) {
                case 'critical':
                    console.error(`🚨 CRITICAL: ${message} - Severe performance impact! Consider increasing cache size.`);
                    break;
                case 'warning':
                    console.warn(`⚠️ WARNING: ${message} - Performance may be degraded. Consider increasing cache size.`);
                    break;
                case 'clear':
                    console.info(`✅ Cache performance recovered: ${message}`);
                    break;
            }
        }
        
        // Visual overlay warnings
        if (this.overlayWarnings) {
            this.showPerformanceOverlay(level, avgHitRate, currentHitRate);
        }
    }

    /**
     * Show or update performance overlay
     * @param {string} level - Warning level
     * @param {number} avgHitRate - Average hit rate
     * @param {number} currentHitRate - Current hit rate
     */
    showPerformanceOverlay(level, avgHitRate, currentHitRate) {
        if (!this.overlayElement) {
            this.createOverlay();
        }
        
        const overlay = this.overlayElement;
        
        // Update content
        overlay.textContent = `Cache: ${avgHitRate.toFixed(0)}%`;
        overlay.className = `cache-performance-overlay ${level}`;
        overlay.style.display = 'block';
        
        // Auto-hide after recovery
        if (level === 'clear') {
            setTimeout(() => {
                if (overlay) {
                    overlay.style.display = 'none';
                }
            }, 3000);
        }
    }

    /**
     * Create the performance overlay element
     */
    createOverlay() {
        this.overlayElement = document.createElement('div');
        this.overlayElement.id = 'cache-performance-overlay';
        
        // Base styles
        const overlay = this.overlayElement;
        overlay.style.position = 'fixed';
        overlay.style.top = '10px';
        overlay.style.right = '10px';
        overlay.style.padding = '8px 12px';
        overlay.style.borderRadius = '4px';
        overlay.style.fontFamily = 'monospace';
        overlay.style.fontSize = '12px';
        overlay.style.fontWeight = 'bold';
        overlay.style.zIndex = '9999';
        overlay.style.pointerEvents = 'none';
        overlay.style.transition = 'all 0.3s ease';
        overlay.style.display = 'none';
        
        // Add CSS for different warning levels
        const style = document.createElement('style');
        style.textContent = `
            .cache-performance-overlay.warning {
                background: rgba(255, 193, 7, 0.9);
                color: #333;
                border: 2px solid #ff9800;
            }
            .cache-performance-overlay.critical {
                background: rgba(244, 67, 54, 0.9);
                color: white;
                border: 2px solid #d32f2f;
                animation: pulse 1s infinite;
            }
            .cache-performance-overlay.clear {
                background: rgba(76, 175, 80, 0.9);
                color: white;
                border: 2px solid #4caf50;
            }
            @keyframes pulse {
                0% { opacity: 1; }
                50% { opacity: 0.7; }
                100% { opacity: 1; }
            }
        `;
        
        // Add to document
        document.head.appendChild(style);
        document.body.appendChild(overlay);
    }

    /**
     * Get performance statistics
     * @returns {Object} Performance stats
     */
    getStats() {
        return {
            averageHitRate: this.getAverageHitRate(),
            historyLength: this.hitRateHistory.length,
            warningThreshold: this.warningThreshold,
            criticalThreshold: this.criticalThreshold,
            hasActiveWarning: this.hasWarned,
            trackingDuration: this.historyDuration
        };
    }

    /**
     * Update configuration
     * @param {Object} options - New configuration options
     */
    updateConfig(options) {
        if (options.warningThreshold !== undefined) this.warningThreshold = options.warningThreshold;
        if (options.criticalThreshold !== undefined) this.criticalThreshold = options.criticalThreshold;
        if (options.historyDuration !== undefined) this.historyDuration = options.historyDuration;
        if (options.consoleWarnings !== undefined) this.consoleWarnings = options.consoleWarnings;
        if (options.overlayWarnings !== undefined) this.overlayWarnings = options.overlayWarnings;
    }
}

/**
 * Cache for scaled versions of tiles to improve zoom performance
 */
class ScaledTileCache {
    constructor(maxMemoryMB = 100) {
        this.cache = new Map(); // key: "tileIndex_zoomLevel", value: {canvas, lastAccess, memorySize}
        this.maxMemory = maxMemoryMB * 1024 * 1024; // Convert to bytes
        this.currentMemory = 0;
        this.lastZoom = 1.0;
        this.zoomLevels = [0.1, 0.25, 0.5, 0.75, 1.0, 1.25, 1.5, 2.0, 3.0, 4.0]; // Predefined zoom levels
        this.accessOrder = []; // For LRU eviction
    }

    /**
     * Get a cached scaled tile
     * @param {Object} tile - Original tile data
     * @param {number} zoom - Current zoom level
     * @returns {HTMLCanvasElement|null} Cached scaled canvas or null
     */
    getCachedTile(tile, zoom) {
        const zoomKey = this.getZoomKey(zoom);
        const key = `${tile.backgroundName || ''}_${tile.index}_${zoomKey}`;
        const cached = this.cache.get(key);
        
        if (cached) {
            cached.lastAccess = Date.now();
            // Move to end of access order (most recent)
            const index = this.accessOrder.indexOf(key);
            if (index > -1) {
                this.accessOrder.splice(index, 1);
            }
            this.accessOrder.push(key);
            return cached.canvas;
        }
        
        return null;
    }

    /**
     * Cache a scaled tile
     * @param {Object} tile - Original tile data
     * @param {number} zoom - Zoom level
     * @param {HTMLCanvasElement} scaledCanvas - Pre-scaled canvas
     */
    cacheTile(tile, zoom, scaledCanvas) {
        const zoomKey = this.getZoomKey(zoom);
        const key = `${tile.backgroundName || ''}_${tile.index}_${zoomKey}`;
        const memorySize = scaledCanvas.width * scaledCanvas.height * 4; // RGBA bytes
        
        // Check if we need to evict items to make room
        while (this.currentMemory + memorySize > this.maxMemory && this.accessOrder.length > 0) {
            this.evictOldest();
        }
        
        // Don't cache if single tile would exceed memory limit
        if (memorySize > this.maxMemory) {
            return;
        }
        
        // Remove existing entry if it exists
        if (this.cache.has(key)) {
            const existing = this.cache.get(key);
            this.currentMemory -= existing.memorySize;
            const index = this.accessOrder.indexOf(key);
            if (index > -1) {
                this.accessOrder.splice(index, 1);
            }
        }
        
        // Add new entry
        this.cache.set(key, {
            canvas: scaledCanvas,
            lastAccess: Date.now(),
            memorySize: memorySize
        });
        
        this.currentMemory += memorySize;
        this.accessOrder.push(key);
    }

    /**
     * Get the quantized zoom level for caching
     * @param {number} zoom - Current zoom level
     * @returns {number} Nearest cached zoom level
     */
    getZoomKey(zoom) {
        return this.zoomLevels.reduce((prev, curr) => 
            Math.abs(curr - zoom) < Math.abs(prev - zoom) ? curr : prev
        );
    }

    /**
     * Evict the least recently used cache entry
     */
    evictOldest() {
        if (this.accessOrder.length === 0) return;
        
        const oldestKey = this.accessOrder.shift();
        const cached = this.cache.get(oldestKey);
        
        if (cached) {
            this.currentMemory -= cached.memorySize;
            this.cache.delete(oldestKey);
        }
    }

    /**
     * Clear cache entries for a specific zoom level
     * @param {number} zoom - Zoom level to clear
     */
    clearZoomLevel(zoom) {
        const zoomKey = this.getZoomKey(zoom);
        const keysToDelete = [];
        
        for (const key of this.cache.keys()) {
            if (key.endsWith(`_${zoomKey}`)) {
                keysToDelete.push(key);
            }
        }
        
        keysToDelete.forEach(key => {
            const cached = this.cache.get(key);
            if (cached) {
                this.currentMemory -= cached.memorySize;
                this.cache.delete(key);
                const index = this.accessOrder.indexOf(key);
                if (index > -1) {
                    this.accessOrder.splice(index, 1);
                }
            }
        });
    }

    /**
     * Clear all cache entries
     */
    clearAll() {
        this.cache.clear();
        this.accessOrder = [];
        this.currentMemory = 0;
    }

    /**
     * Get cache statistics
     * @returns {Object} Cache statistics
     */
    getStats() {
        return {
            totalEntries: this.cache.size,
            memoryUsageMB: Math.round(this.currentMemory / (1024 * 1024) * 100) / 100,
            maxMemoryMB: Math.round(this.maxMemory / (1024 * 1024) * 100) / 100,
            memoryUtilization: Math.round((this.currentMemory / this.maxMemory) * 100),
            zoomLevelsActive: this.getActiveZoomLevels()
        };
    }

    /**
     * Get currently active zoom levels in cache
     */
    getActiveZoomLevels() {
        const zoomLevels = new Set();
        for (const key of this.cache.keys()) {
            const zoomLevel = parseFloat(key.split('_')[1]);
            zoomLevels.add(zoomLevel);
        }
        return Array.from(zoomLevels).sort((a, b) => a - b);
    }
}

export class BackgroundLoader {
    constructor(options = {}) {
        this.cache = new Map();
        this.tileSize = 128; // Standard Creatures 3 tile size
        
        // Configure cache size
        const cacheSizeMB = options.cacheSizeMB || 100;
        this.scaledTileCache = new ScaledTileCache(cacheSizeMB);
        
        // Configure performance monitoring
        const cacheWarnings = options.cacheWarnings || {};
        this.performanceMonitor = new CachePerformanceMonitor({
            warningThreshold: cacheWarnings.warningThreshold || 50,
            criticalThreshold: cacheWarnings.criticalThreshold || 25,
            historyDuration: cacheWarnings.historyDuration || 5000,
            consoleWarnings: cacheWarnings.consoleWarnings !== false,
            overlayWarnings: cacheWarnings.overlayWarnings || false
        });
        
        this.lastZoom = 1.0;
        this.zoomChangeThreshold = 0.05; // Trigger cache updates when zoom changes by more than 5%
    }

    /**
     * Load a background from BLK file
     * @param {string|ArrayBuffer} source - File path or array buffer
     * @param {string} fileName - Original file name for cache key
     * @returns {Promise<BackgroundData>} Parsed background data
     */
    async loadBackground(source, fileName = null) {
        let cacheKey = fileName || source;
        
        // Check cache first
        if (this.cache.has(cacheKey)) {
            return this.cache.get(cacheKey);
        }

        try {
            let arrayBuffer;
            
            if (source instanceof ArrayBuffer) {
                arrayBuffer = source;
            } else {
                // Load from file path
                const response = await fetch(source);
                if (!response.ok) {
                    throw new Error(`Failed to load background: ${response.status}`);
                }
                arrayBuffer = await response.arrayBuffer();
            }

            // Parse using the existing creatures-file-formats library
            const parser = window.CreaturesFileFormats.SpriteFormats.createParser(arrayBuffer, cacheKey);
            const gallery = parser.parse();

            // Create background data structure
            const backgroundData = this.createBackgroundData(gallery, cacheKey);
            
            // Cache the result
            this.cache.set(cacheKey, backgroundData);
            
            return backgroundData;

        } catch (error) {
            console.error(`Error loading background ${cacheKey}:`, error);
            throw error;
        }
    }

    /**
     * Create structured background data from parsed gallery
     * @private
     */
    createBackgroundData(gallery, fileName) {
        const data = {
            name: fileName,
            blockWidth: gallery.blockWidth || 1,
            blockHeight: gallery.blockHeight || 1,
            totalWidth: (gallery.blockWidth || 1) * this.tileSize,
            totalHeight: (gallery.blockHeight || 1) * this.tileSize,
            tileSize: this.tileSize,
            tiles: [],
            metadata: {
                pixelFormat: gallery.pixelFormat,
                imageCount: gallery.imageCount,
                is565: (gallery.pixelFormat === 1 || gallery.pixelFormat === 3)
            }
        };

        // Process each bitmap as a tile using column-major ordering (matches C++ implementation)
        gallery.bitmaps.forEach((bitmap, index) => {
            if (bitmap.width > 0 && bitmap.height > 0) {
                // Column-major positioning: tiles are arranged by columns first, then rows
                // This matches the C++ formula: ((x % myWidth) * myHeight) + y
                const tileX = Math.floor(index / data.blockHeight);
                const tileY = index % data.blockHeight;
                
                const tile = {
                    index: index,
                    backgroundName: fileName, // Unique background identifier for cache keying
                    x: tileX * this.tileSize,
                    y: tileY * this.tileSize,
                    width: bitmap.width,
                    height: bitmap.height,
                    imageData: new ImageData(bitmap.pixelData, bitmap.width, bitmap.height),
                    canvas: null // Will be created on-demand
                };
                
                data.tiles.push(tile);
            }
        });

        return data;
    }

    /**
     * Get a tile's canvas, creating it if necessary
     * @param {BackgroundTile} tile - Tile data
     * @returns {HTMLCanvasElement} Canvas with tile rendered
     */
    getTileCanvas(tile) {
        if (!tile.canvas) {
            tile.canvas = document.createElement('canvas');
            tile.canvas.width = tile.width;
            tile.canvas.height = tile.height;
            
            const ctx = tile.canvas.getContext('2d');
            ctx.putImageData(tile.imageData, 0, 0);
        }
        
        return tile.canvas;
    }

    /**
     * Calculate which tiles are visible in a given viewport with zoom support
     * @param {BackgroundData} background - Background data
     * @param {number} cameraX - Camera X position
     * @param {number} cameraY - Camera Y position
     * @param {number} viewWidth - Viewport width
     * @param {number} viewHeight - Viewport height
     * @param {number} zoom - Zoom factor (defaults to 1.0 for backward compatibility)
     * @returns {Array<BackgroundTile>} Visible tiles
     */
    getVisibleTiles(background, cameraX, cameraY, viewWidth, viewHeight, zoom = 1.0) {
        const visibleTiles = [];
        
        // Calculate effective viewport size in world coordinates (accounting for zoom)
        const effectiveViewWidth = viewWidth / zoom;
        const effectiveViewHeight = viewHeight / zoom;
        
        // Calculate tile range that intersects with viewport (zoom-adjusted)
        const startTileX = Math.max(0, Math.floor(cameraX / this.tileSize));
        const endTileX = Math.min(background.blockWidth - 1, Math.ceil((cameraX + effectiveViewWidth) / this.tileSize));
        const startTileY = Math.max(0, Math.floor(cameraY / this.tileSize));
        const endTileY = Math.min(background.blockHeight - 1, Math.ceil((cameraY + effectiveViewHeight) / this.tileSize));

        // Collect visible tiles using column-major indexing (matches C++ implementation)
        for (let tileY = startTileY; tileY <= endTileY; tileY++) {
            for (let tileX = startTileX; tileX <= endTileX; tileX++) {
                // Column-major indexing: tileIndex = (column * height) + row
                // This matches the C++ formula: ((x % myWidth) * myHeight) + y
                const tileIndex = tileX * background.blockHeight + tileY;
                if (tileIndex < background.tiles.length) {
                    const tile = background.tiles[tileIndex];
                    if (tile) {
                        // Push the original tile ref — tile.x/tile.y already hold
                        // the world position, and copying would strand the lazily
                        // created tile.canvas on a throwaway object.
                        visibleTiles.push(tile);
                    }
                }
            }
        }

        return visibleTiles;
    }

    /**
     * Render background tiles to a canvas context with zoom support and caching
     * @param {CanvasRenderingContext2D} ctx - Canvas context
     * @param {BackgroundData} background - Background data
     * @param {number} cameraX - Camera X position
     * @param {number} cameraY - Camera Y position
     * @param {number} viewWidth - Viewport width
     * @param {number} viewHeight - Viewport height
     * @param {number} zoom - Zoom factor (defaults to 1.0 for backward compatibility)
     * @returns {number} Number of tiles drawn
     */
    renderBackground(ctx, background, cameraX, cameraY, viewWidth, viewHeight, zoom = 1.0) {
        const visibleTiles = this.getVisibleTiles(background, cameraX, cameraY, viewWidth, viewHeight, zoom);
        
        // Check if zoom has changed significantly to trigger cache updates
        const zoomChanged = Math.abs(zoom - this.lastZoom) > this.zoomChangeThreshold;
        if (zoomChanged) {
            this.lastZoom = zoom;
            // Notify performance monitor about zoom change (triggers grace period)
            this.performanceMonitor.notifyZoomChange();
        }
        
        // Configure image smoothing based on zoom level
        const originalSmoothing = ctx.imageSmoothingEnabled;
        if (zoom > 1.0) {
            // Disable smoothing when zooming in to maintain pixel art look
            ctx.imageSmoothingEnabled = false;
        } else {
            // Enable smoothing when zooming out for better quality
            ctx.imageSmoothingEnabled = true;
        }
        
        let cacheHits = 0;
        let cacheMisses = 0;
        
        visibleTiles.forEach(tile => {
            // Calculate tile position and size in world-snapped screen space.
            // Snap left/top with floor and derive width/height from the snapped
            // right/bottom so adjacent tiles share an exact integer edge — this
            // prevents 1px seams at fractional zoom levels (e.g. 0.75).
            const fLeft = (tile.x - cameraX) * zoom;
            const fTop = (tile.y - cameraY) * zoom;
            const fRight = (tile.x + tile.width - cameraX) * zoom;
            const fBottom = (tile.y + tile.height - cameraY) * zoom;
            const drawX = Math.floor(fLeft);
            const drawY = Math.floor(fTop);
            const drawWidth = Math.floor(fRight) - drawX;
            const drawHeight = Math.floor(fBottom) - drawY;

            // Store computed draw coordinates for debugging
            tile.drawX = drawX;
            tile.drawY = drawY;

            // Try to get cached scaled tile first
            let renderCanvas = this.scaledTileCache.getCachedTile(tile, zoom);

            if (renderCanvas) {
                // Cache hit - use pre-scaled tile, stretched to the snapped size
                // so its edges align with neighbours regardless of cached pixel size.
                cacheHits++;
                ctx.drawImage(renderCanvas, 0, 0, renderCanvas.width, renderCanvas.height,
                              drawX, drawY, drawWidth, drawHeight);
            } else {
                // Cache miss - render with scaling and potentially cache result
                cacheMisses++;
                const originalCanvas = this.getTileCanvas(tile);

                // Check if this zoom level is worth caching
                if (this.shouldCacheTile(tile, zoom, drawWidth, drawHeight)) {
                    // Create scaled version for caching
                    const scaledCanvas = this.createScaledTile(originalCanvas, zoom);
                    if (scaledCanvas) {
                        this.scaledTileCache.cacheTile(tile, zoom, scaledCanvas);
                        ctx.drawImage(scaledCanvas, 0, 0, scaledCanvas.width, scaledCanvas.height,
                                      drawX, drawY, drawWidth, drawHeight);
                    } else {
                        // Fallback to normal scaling
                        ctx.drawImage(originalCanvas, drawX, drawY, drawWidth, drawHeight);
                    }
                } else {
                    // Don't cache this tile, just render with scaling
                    ctx.drawImage(originalCanvas, drawX, drawY, drawWidth, drawHeight);
                }
            }
        });
        
        // Record performance for monitoring
        const totalTiles = cacheHits + cacheMisses;
        if (totalTiles > 0) {
            this.performanceMonitor.recordHitRate(cacheHits, totalTiles);
        }
        
        // Restore original smoothing setting
        ctx.imageSmoothingEnabled = originalSmoothing;

        return visibleTiles.length;
    }

    /**
     * Create a complete background image (for tools/testing)
     * @param {BackgroundData} background - Background data
     * @returns {HTMLCanvasElement} Complete background as canvas
     */
    createCompleteBackground(background) {
        const canvas = document.createElement('canvas');
        canvas.width = background.totalWidth;
        canvas.height = background.totalHeight;
        
        const ctx = canvas.getContext('2d');
        
        background.tiles.forEach(tile => {
            const tileCanvas = this.getTileCanvas(tile);
            ctx.drawImage(tileCanvas, tile.x, tile.y);
        });
        
        return canvas;
    }

    /**
     * Clear cache for a specific background
     * @param {string} fileName - Background file name to remove from cache
     */
    clearCache(fileName = null) {
        if (fileName) {
            this.cache.delete(fileName);
        } else {
            this.cache.clear();
        }
    }

    /**
     * Get cache statistics
     * @returns {Object} Cache stats
     */
    getCacheStats() {
        let totalMemory = 0;
        
        this.cache.forEach(background => {
            background.tiles.forEach(tile => {
                if (tile.canvas) {
                    totalMemory += tile.width * tile.height * 4; // RGBA
                }
            });
        });
        
        return {
            cacheSize: this.cache.size,
            estimatedMemoryMB: Math.round(totalMemory / (1024 * 1024) * 100) / 100
        };
    }

    /**
     * Get memory statistics (DisplayManager compatibility)
     * @returns {Object} Memory stats compatible with DisplayManager
     */
    getMemoryStats() {
        const cacheStats = this.getCacheStats();
        
        return {
            cacheSize: cacheStats.cacheSize,
            memoryUsageMB: cacheStats.estimatedMemoryMB,
            totalBackgrounds: cacheStats.cacheSize,
            // Add more detailed stats for DisplayManager
            tilesCached: this._getTotalCachedTiles(),
            averageMemoryPerBackground: cacheStats.cacheSize > 0 ? 
                (cacheStats.estimatedMemoryMB / cacheStats.cacheSize).toFixed(2) : 0
        };
    }

    /**
     * Get total number of cached tiles across all backgrounds
     * @private
     * @returns {number} Total cached tiles
     */
    _getTotalCachedTiles() {
        let totalTiles = 0;
        
        this.cache.forEach(background => {
            background.tiles.forEach(tile => {
                if (tile.canvas) {
                    totalTiles++;
                }
            });
        });
        
        return totalTiles;
    }

    /**
     * Determine if a tile should be cached at a given zoom level
     * @param {Object} tile - Tile data
     * @param {number} zoom - Zoom level
     * @param {number} drawWidth - Rendered width
     * @param {number} drawHeight - Rendered height
     * @returns {boolean} True if tile should be cached
     */
    shouldCacheTile(tile, zoom, drawWidth, drawHeight) {
        // Don't cache tiles that are too small on screen (not worth the memory)
        if (drawWidth < 8 || drawHeight < 8) {
            return false;
        }
        
        // Don't cache tiles that are too large (would use too much memory)
        if (drawWidth > 1024 || drawHeight > 1024) {
            return false;
        }
        
        // Cache tiles at standard zoom levels or when zoom is stable
        const zoomKey = this.scaledTileCache.getZoomKey(zoom);
        const zoomDiff = Math.abs(zoom - zoomKey);
        
        // Cache if zoom is close to a standard level (within 2%)
        return zoomDiff < 0.02;
    }

    /**
     * Create a scaled version of a tile canvas
     * @param {HTMLCanvasElement} originalCanvas - Original tile canvas
     * @param {number} zoom - Zoom factor
     * @returns {HTMLCanvasElement|null} Scaled canvas or null if failed
     */
    createScaledTile(originalCanvas, zoom) {
        try {
            const scaledWidth = Math.round(originalCanvas.width * zoom);
            const scaledHeight = Math.round(originalCanvas.height * zoom);
            
            // Don't create scaled tiles that are too small or too large
            if (scaledWidth < 1 || scaledHeight < 1 || scaledWidth > 2048 || scaledHeight > 2048) {
                return null;
            }
            
            const scaledCanvas = document.createElement('canvas');
            scaledCanvas.width = scaledWidth;
            scaledCanvas.height = scaledHeight;
            
            const ctx = scaledCanvas.getContext('2d');
            
            // Configure scaling based on zoom level
            if (zoom > 1.0) {
                // Pixelated scaling for zoom in
                ctx.imageSmoothingEnabled = false;
            } else {
                // Smooth scaling for zoom out
                ctx.imageSmoothingEnabled = true;
                ctx.imageSmoothingQuality = 'high';
            }
            
            ctx.drawImage(originalCanvas, 0, 0, scaledWidth, scaledHeight);
            
            return scaledCanvas;
        } catch (error) {
            console.warn('Failed to create scaled tile:', error);
            return null;
        }
    }

    /**
     * Progressive cache warming for smooth zoom performance
     * @param {BackgroundData} background - Background data
     * @param {number} cameraX - Camera X position
     * @param {number} cameraY - Camera Y position
     * @param {number} viewWidth - Viewport width
     * @param {number} viewHeight - Viewport height
     * @param {number} zoom - Target zoom level
     * @param {number} maxTilesPerFrame - Maximum tiles to cache per frame
     */
    warmCache(background, cameraX, cameraY, viewWidth, viewHeight, zoom, maxTilesPerFrame = 5) {
        const visibleTiles = this.getVisibleTiles(background, cameraX, cameraY, viewWidth, viewHeight, zoom);
        let tilesProcessed = 0;
        
        for (const tile of visibleTiles) {
            if (tilesProcessed >= maxTilesPerFrame) break;
            
            // Check if tile is not already cached
            if (!this.scaledTileCache.getCachedTile(tile, zoom)) {
                const drawWidth = tile.width * zoom;
                const drawHeight = tile.height * zoom;
                
                if (this.shouldCacheTile(tile, zoom, drawWidth, drawHeight)) {
                    const originalCanvas = this.getTileCanvas(tile);
                    const scaledCanvas = this.createScaledTile(originalCanvas, zoom);
                    
                    if (scaledCanvas) {
                        this.scaledTileCache.cacheTile(tile, zoom, scaledCanvas);
                        tilesProcessed++;
                    }
                }
            }
        }
        
        return tilesProcessed;
    }

    /**
     * Get enhanced memory statistics including scaled tile cache and performance monitoring
     * @returns {Object} Enhanced memory stats
     */
    getEnhancedMemoryStats() {
        const baseStats = this.getMemoryStats();
        const scaledCacheStats = this.scaledTileCache.getStats();
        const performanceStats = this.performanceMonitor.getStats();
        
        return {
            ...baseStats,
            scaledTileCache: scaledCacheStats,
            performanceMonitoring: performanceStats,
            totalMemoryMB: baseStats.memoryUsageMB + scaledCacheStats.memoryUsageMB,
            cacheEfficiency: {
                backgroundCacheMB: baseStats.memoryUsageMB,
                scaledCacheMB: scaledCacheStats.memoryUsageMB,
                memoryDistribution: {
                    backgrounds: Math.round((baseStats.memoryUsageMB / (baseStats.memoryUsageMB + scaledCacheStats.memoryUsageMB)) * 100),
                    scaledTiles: Math.round((scaledCacheStats.memoryUsageMB / (baseStats.memoryUsageMB + scaledCacheStats.memoryUsageMB)) * 100)
                }
            }
        };
    }

    /**
     * Update cache warning configuration
     * @param {Object} options - Configuration options
     */
    updateCacheWarningConfig(options) {
        this.performanceMonitor.updateConfig(options);
    }

    /**
     * Get current cache performance statistics
     * @returns {Object} Performance statistics
     */
    getCachePerformanceStats() {
        return this.performanceMonitor.getStats();
    }

    /**
     * Clear scaled tile cache (useful for memory management)
     */
    clearScaledCache() {
        this.scaledTileCache.clearAll();
    }

    /**
     * Optimize cache for current zoom level (remove unused zoom levels)
     * @param {number} currentZoom - Current zoom level
     * @param {number} tolerance - Keep zoom levels within this range
     */
    optimizeCacheForZoom(currentZoom, tolerance = 0.5) {
        const activeZoomLevels = this.scaledTileCache.getActiveZoomLevels();
        
        activeZoomLevels.forEach(zoomLevel => {
            if (Math.abs(zoomLevel - currentZoom) > tolerance) {
                this.scaledTileCache.clearZoomLevel(zoomLevel);
            }
        });
    }
}

// Create global instance
window.BackgroundLoader = BackgroundLoader;

export default BackgroundLoader;
