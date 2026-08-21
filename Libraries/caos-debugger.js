/**
 * CAOS Debugger Library - Enhanced CAOS debugging and monitoring functionality
 * Extends the existing CAOS preview library with debugging features
 */

class CAOSDebugger {
    constructor() {
        // Check if CAOSParser is available from caos-preview.js
        if (typeof window.CAOSParser === 'undefined') {
            console.error('CAOS Debugger: CAOSParser not found. Make sure caos-preview.js is loaded first.');
            this.parser = null;
        } else {
            this.parser = new window.CAOSParser();
        }
        this.executionHistory = [];
        this.currentExecution = null;
        this.debugMode = false;
        this.breakpoints = new Set();
        this.executionState = {
            paused: false,
            currentLine: -1,
            currentScript: null,
            error: null,
            variables: new Map(),
            callStack: []
        };
        
        // Event listeners for debug events
        this.listeners = {
            scriptStarted: [],
            scriptCompleted: [],
            scriptError: [],
            executionPaused: [],
            executionResumed: [],
            lineExecuted: []
        };
    }

    /**
     * Set debug mode on/off
     * @param {boolean} enabled - Enable debug mode
     */
    setDebugMode(enabled) {
        this.debugMode = enabled;
        if (!enabled) {
            this.clearExecutionState();
        }
    }

    /**
     * Add event listener for debug events
     * @param {string} event - Event type
     * @param {Function} callback - Callback function
     */
    on(event, callback) {
        if (this.listeners[event]) {
            this.listeners[event].push(callback);
        }
    }

    /**
     * Emit debug event
     * @param {string} event - Event type
     * @param {*} data - Event data
     */
    emit(event, data) {
        if (this.listeners[event]) {
            this.listeners[event].forEach(callback => callback(data));
        }
    }

    /**
     * Start monitoring script execution
     * @param {Object} scriptData - Script data with filename, content, etc.
     */
    startScriptExecution(scriptData) {
        const executionId = Date.now() + '_' + Math.random().toString(36).substr(2, 9);
        
        const execution = {
            id: executionId,
            script: {
                filename: scriptData.filename,
                scriptKey: scriptData.scriptKey || null,
                content: scriptData.content,
                // Store source file references for reliable content retrieval
                sourceFilePath: scriptData.sourceFilePath,
                sourceFileContent: scriptData.sourceFileContent,
                sourceFile: scriptData.sourceFile || scriptData.sourceFilePath,
                allLines: scriptData.allLines,
                sections: scriptData.sections,
                scriptName: scriptData.scriptName || null
            },
            startTime: new Date(),
            endTime: null,
            status: 'running',
            error: null,
            currentLine: 0,
            totalLines: scriptData.sourceFileContent ? scriptData.sourceFileContent.split('\n').length : 
                        (scriptData.content ? scriptData.content.split('\n').length : 0),
            executedLines: []
        };

        this.executionHistory.unshift(execution);
        this.currentExecution = execution;

        // Keep only last 50 executions
        if (this.executionHistory.length > 50) {
            this.executionHistory = this.executionHistory.slice(0, 50);
        }

        this.emit('scriptStarted', execution);
        return executionId;
    }

    /**
     * Update execution progress
     * @param {string} executionId - Execution ID
     * @param {number} lineNumber - Current line number
     * @param {string} lineContent - Content of current line
     */
    updateExecution(executionId, lineNumber, lineContent) {
        const execution = this.getExecution(executionId);
        if (!execution) return;

        execution.currentLine = lineNumber;
        execution.executedLines.push({
            number: lineNumber,
            content: lineContent,
            timestamp: new Date()
        });

        this.executionState.currentLine = lineNumber;
        this.executionState.currentScript = execution;

        // Check for breakpoints
        if (this.debugMode && this.breakpoints.has(lineNumber)) {
            this.pauseExecution(executionId);
        }

        this.emit('lineExecuted', { execution, lineNumber, lineContent });
    }

    /**
     * Complete script execution
     * @param {string} executionId - Execution ID
     * @param {boolean} success - Whether execution was successful
     * @param {Object} error - Error object if failed
     */
    completeScriptExecution(executionId, success, error = null) {
        const execution = this.getExecution(executionId);
        if (!execution) return;

        execution.endTime = new Date();
        execution.status = success ? 'completed' : 'failed';
        execution.error = error;

        if (this.currentExecution && this.currentExecution.id === executionId) {
            this.currentExecution = null;
            this.clearExecutionState();
        }

        this.emit(success ? 'scriptCompleted' : 'scriptError', execution);
    }

    /**
     * Pause script execution
     * @param {string} executionId - Execution ID
     * @param {Object} error - Optional error object that caused the pause
     */
    pauseExecution(executionId, error = null) {
        if (!this.debugMode) return;

        const execution = this.getExecution(executionId);
        if (!execution) return;

        execution.status = 'paused';
        this.executionState.paused = true;
        
        // Attach error information if provided
        if (error) {
            execution.error = error;
            this.executionState.error = error;
        }

        this.emit('executionPaused', execution);
    }

    /**
     * Resume script execution
     * @param {string} executionId - Execution ID
     */
    resumeExecution(executionId) {
        const execution = this.getExecution(executionId);
        if (!execution) return;

        execution.status = 'running';
        this.executionState.paused = false;

        this.emit('executionResumed', execution);
    }

    /**
     * Get execution by ID
     * @param {string} executionId - Execution ID
     * @returns {Object} Execution object
     */
    getExecution(executionId) {
        return this.executionHistory.find(exec => exec.id === executionId);
    }

    /**
     * Get execution history
     * @returns {Array} Array of execution objects
     */
    getExecutionHistory() {
        return this.executionHistory;
    }

    /**
     * Clear execution state
     */
    clearExecutionState() {
        this.executionState = {
            paused: false,
            currentLine: -1,
            currentScript: null,
            error: null,
            variables: new Map(),
            callStack: []
        };
    }

    /**
     * Add breakpoint
     * @param {number} lineNumber - Line number to break on
     */
    addBreakpoint(lineNumber) {
        this.breakpoints.add(lineNumber);
    }

    /**
     * Remove breakpoint
     * @param {number} lineNumber - Line number to remove breakpoint from
     */
    removeBreakpoint(lineNumber) {
        this.breakpoints.delete(lineNumber);
    }

    /**
     * Toggle breakpoint
     * @param {number} lineNumber - Line number to toggle breakpoint
     */
    toggleBreakpoint(lineNumber) {
        if (this.breakpoints.has(lineNumber)) {
            this.removeBreakpoint(lineNumber);
        } else {
            this.addBreakpoint(lineNumber);
        }
    }

    /**
     * Get all breakpoints
     * @returns {Set} Set of line numbers with breakpoints
     */
    getBreakpoints() {
        return new Set(this.breakpoints);
    }

    /**
     * Render script with debug information
     * @param {Object} script - Script object
     * @param {Object} options - Rendering options
     * @returns {string} HTML with debug information
     */
    renderScriptWithDebug(script, options = {}) {
        if (!script || !script.content) {
            return '<div class="caos-error">No script content available</div>';
        }

        if (!this.parser) {
            return '<div class="caos-error">CAOS parser not available. Make sure caos-preview.js is loaded.</div>';
        }

        const lines = script.content.split('\n');
        let html = '';

        lines.forEach((line, index) => {
            const lineNumber = index + 1;
            const isCurrentLine = this.executionState.currentLine === lineNumber;
            const hasBreakpoint = this.breakpoints.has(lineNumber);
            const hasError = script.error && script.error.line === lineNumber;

            let lineClass = 'caos-debug-line';
            if (isCurrentLine) lineClass += ' caos-current-line';
            if (hasBreakpoint) lineClass += ' caos-breakpoint-line';
            if (hasError) lineClass += ' caos-error-line';

            html += `<div class="${lineClass}" data-line="${lineNumber}">`;
            
            // Line number with breakpoint indicator
            html += `<span class="caos-debug-line-number" onclick="caosDebugger.toggleBreakpoint(${lineNumber})">`;
            if (hasBreakpoint) html += '<span class="caos-breakpoint-indicator">●</span>';
            html += `${lineNumber}</span>`;
            
            try {
                // Line content with syntax highlighting
                const parsedLine = this.parser.parseLine(line);
                const lineObj = {
                    number: lineNumber,
                    content: line,
                    parsed: parsedLine
                };
                
                html += this.parser.renderLineContent(lineObj, options);
            } catch (error) {
                console.warn('Error rendering line content:', error);
                html += `<span class="caos-normal">${this.escapeHtml(line)}</span>`;
            }
            html += '</div>';
        });

        return html;
    }

    /**
     * Escape HTML characters to prevent XSS
     * @param {string} text - Text to escape
     * @returns {string} HTML-escaped text
     */
    escapeHtml(text) {
        if (typeof text !== 'string') return '';
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    /**
     * Format execution time
     * @param {Date} startTime - Start time
     * @param {Date} endTime - End time (optional)
     * @returns {string} Formatted execution time
     */
    formatExecutionTime(startTime, endTime = null) {
        const end = endTime || new Date();
        const duration = end - startTime;
        
        if (duration < 1000) {
            return `${duration}ms`;
        } else {
            return `${(duration / 1000).toFixed(2)}s`;
        }
    }

    /**
     * Format a script filename as a two-line HTML block: a small gray
     * directory line (without the leading "Assets/" segment) above the
     * bare COS filename. Falls back to a single line when there is no
     * directory component.
     * @param {string} filename - Full script path (e.g. "Assets/Docking Station/Bootstrap/000 Switcher/foo.cos")
     * @returns {string} HTML for the stacked path + filename
     */
    formatScriptDisplayName(filename) {
        const segments = (filename || 'Unknown Script').split('/');
        const basename = segments.pop();
        if (segments[0] === 'Assets') segments.shift();
        const path = segments.join('/');
        const pathHtml = path ? `<span class="caos-script-path">${path}</span>` : '';
        return `${pathHtml}<span class="caos-script-file">${basename}</span>`;
    }

    /**
     * Generate execution summary
     * @param {Object} execution - Execution object
     * @returns {string} HTML summary
     */
    generateExecutionSummary(execution) {
        const duration = execution.endTime ? 
            this.formatExecutionTime(execution.startTime, execution.endTime) : 
            this.formatExecutionTime(execution.startTime);

        let statusClass = 'caos-status-' + execution.status;
        let statusIcon = '⧖';
        
        switch (execution.status) {
            case 'completed': statusIcon = '✓'; break;
            case 'failed': statusIcon = '✗'; break;
            case 'paused': statusIcon = '⏸'; break;
            case 'running': statusIcon = '▶'; break;
        }

        return `
            <div class="caos-execution-summary ${statusClass}">
                <span class="caos-status-icon">${statusIcon}</span>
                <span class="caos-script-name" title="${execution.script.filename || ''}">${this.formatScriptDisplayName(execution.script.filename)}</span>
                <span class="caos-execution-time">${duration}</span>
                <span class="caos-line-progress">${execution.currentLine}/${execution.totalLines}</span>
            </div>
        `;
    }

    /**
     * Generate error details HTML
     * @param {Object} error - Error object
     * @returns {string} HTML error details
     */
    generateErrorDetails(error) {
        if (!error) return '';

        return `
            <div class="caos-error-details">
                <h4>Error Details</h4>
                <div class="caos-error-message">${error.message}</div>
                ${error.line ? `<div class="caos-error-line">Line ${error.line}</div>` : ''}
                ${error.context ? `<div class="caos-error-context">${error.context}</div>` : ''}
                ${error.stack ? `<details class="caos-error-stack">
                    <summary>Stack Trace</summary>
                    <pre>${error.stack}</pre>
                </details>` : ''}
            </div>
        `;
    }

    /**
     * Export execution history as JSON
     * @returns {string} JSON string of execution history
     */
    exportExecutionHistory() {
        return JSON.stringify(this.executionHistory, null, 2);
    }

    /**
     * Clear execution history
     */
    clearExecutionHistory() {
        this.executionHistory = [];
        this.currentExecution = null;
        this.clearExecutionState();
    }

    /**
     * Get debug statistics
     * @returns {Object} Debug statistics
     */
    getDebugStats() {
        const stats = {
            totalExecutions: this.executionHistory.length,
            successfulExecutions: this.executionHistory.filter(e => e.status === 'completed').length,
            failedExecutions: this.executionHistory.filter(e => e.status === 'failed').length,
            activeBreakpoints: this.breakpoints.size,
            debugModeEnabled: this.debugMode,
            currentlyRunning: this.currentExecution !== null
        };

        stats.successRate = stats.totalExecutions > 0 ? 
            ((stats.successfulExecutions / stats.totalExecutions) * 100).toFixed(1) + '%' : 
            'N/A';

        return stats;
    }
}

// Create global debugger instance
const caosDebugger = new CAOSDebugger();

// Export for module systems
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { CAOSDebugger, caosDebugger };
}

// Global export for browser usage
if (typeof window !== 'undefined') {
    window.CAOSDebugger = CAOSDebugger;
    window.caosDebugger = caosDebugger;
}
