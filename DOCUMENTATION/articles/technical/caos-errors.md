# Error Handling & Debugging

CAOS includes comprehensive error handling and debugging support. This article explains how errors are triggered, captured, and debugged.

## Error Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                   ERROR ARCHITECTURE                         │
│                                                             │
│   ┌─────────────────────────────────────────────────────┐  │
│   │  CAOSStackError                                     │  │
│   │  ├── message: Error description                     │  │
│   │  ├── stackTrace: ExecutionContext[]                 │  │
│   │  └── currentContext: ExecutionContext               │  │
│   └─────────────────────────────────────────────────────┘  │
│                         │                                   │
│                         ▼                                   │
│   ┌─────────────────────────────────────────────────────┐  │
│   │  StackOverflowError extends CAOSStackError          │  │
│   │  └── maxDepth: Maximum stack depth exceeded         │  │
│   └─────────────────────────────────────────────────────┘  │
│                                                             │
│   ┌─────────────────────────────────────────────────────┐  │
│   │  ExecutionContext (Stack Frame)                     │  │
│   │  ├── commandName: "SETV"                            │  │
│   │  ├── params: ["va00", 100]                          │  │
│   │  ├── lineNumber: 5                                  │  │
│   │  ├── scriptFile: "bootstrap.cos"                    │  │
│   │  ├── parentContext: ExecutionContext                │  │
│   │  └── depth: 0                                       │  │
│   └─────────────────────────────────────────────────────┘  │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

---

## Error Classes

### CAOSStackError

The base error class for CAOS execution errors:

```javascript
class CAOSStackError extends Error {
    constructor(message, stackTrace, currentContext) {
        super(message);
        this.name = 'CAOSStackError';
        this.stackTrace = stackTrace;       // Array of ExecutionContext
        this.currentContext = currentContext; // Where error occurred
    }

    toString() {
        return this.formatStackTrace();
    }

    formatStackTrace() {
        // Returns formatted CAOS stack trace
        // showing execution path to error
    }

    getDeepestContext() {
        // Returns the innermost execution context
    }
}
```

### StackOverflowError

Thrown when call stack exceeds maximum depth:

```javascript
class StackOverflowError extends CAOSStackError {
    constructor(stackTrace, maxDepth) {
        super(
            `Stack overflow: exceeded maximum depth of ${maxDepth}`,
            stackTrace,
            stackTrace[stackTrace.length - 1]
        );
        this.maxDepth = maxDepth;
    }
}
```

**Typical causes:**
- Infinite recursion in GSUB calls
- Deeply nested ENUM loops
- Unbounded LOOP without exit condition

---

## ExecutionContext

Each instruction creates an ExecutionContext for debugging:

### Properties

| Property | Type | Description |
|----------|------|-------------|
| `commandName` | string | Command being executed |
| `params` | array | Command parameters |
| `lineNumber` | number | Source line number |
| `scriptFile` | string | Source file path |
| `parentContext` | ExecutionContext | Parent frame |
| `depth` | number | Call depth |
| `startTime` | number | Execution start |
| `endTime` | number | Execution end |
| `success` | boolean | Completed successfully |
| `error` | Error | Error if failed |
| `stackSnapshot` | object | Variable state |

### Methods

```javascript
getDuration() {
    // Returns execution time in milliseconds
    return this.endTime - this.startTime;
}

getFormattedParams() {
    // Returns human-readable parameter string
    return this.params.map(p => String(p)).join(', ');
}
```

---

## Error Propagation

### Flow Diagram

```
┌─────────────────────────────────────────────────────────────┐
│                 ERROR PROPAGATION FLOW                       │
│                                                             │
│   1. Command execution throws Error                         │
│      │                                                      │
│      ▼                                                      │
│   2. Caught in executeLine() or processToken()              │
│      │                                                      │
│      ▼                                                      │
│   3. Create ExecutionContext with:                          │
│      ├── Line number                                        │
│      ├── Script file                                        │
│      ├── Command name                                       │
│      └── Parameters                                         │
│      │                                                      │
│      ▼                                                      │
│   4. Wrap in CAOSStackError                                 │
│      │                                                      │
│      ▼                                                      │
│   5. Check debug mode                                       │
│      │                                                      │
│      ├── Debug ON → pauseOnError()                         │
│      │              ├── Set debugState = PAUSED_ON_ERROR   │
│      │              ├── Emit 'execution-paused' event      │
│      │              └── Wait for user action               │
│      │                                                      │
│      └── Debug OFF → Throw error to caller                 │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

### Error Handling Code

```javascript
try {
    await this.executeCommand(command, params, context);
} catch (error) {
    // Create execution context
    const errorContext = new ExecutionContext(
        command.name,
        params,
        currentLine,
        this.currentScriptFile,
        this.executionStack[this.executionStack.length - 1],
        this.executionStack.length
    );

    // Create CAOS-specific error
    const caosError = new CAOSStackError(
        error.message,
        [...this.executionStack, errorContext],
        errorContext
    );

    // Handle based on debug mode
    if (this.debugger && this.debugger.enabled) {
        await this.pauseOnError(caosError);
    } else {
        throw caosError;
    }
}
```

---

## Debug States

The CAOSMachine tracks execution state for debugging:

### States

| State | Description |
|-------|-------------|
| `RUNNING` | Normal execution |
| `PAUSED_ON_ERROR` | Stopped due to error |
| `PAUSED_ON_BREAKPOINT` | Hit a breakpoint |
| `PAUSED_BY_USER` | User requested pause |
| `STEP_MODE` | Single-stepping |
| `STOPPED` | Execution halted |

### State Transitions

```
┌─────────────────────────────────────────────────────────────┐
│                   DEBUG STATE MACHINE                        │
│                                                             │
│   ┌──────────┐                                              │
│   │ RUNNING  │◄─────────────────────────────────┐          │
│   └────┬─────┘                                  │          │
│        │                                        │          │
│        ├── Error ──────────► PAUSED_ON_ERROR    │          │
│        │                            │           │          │
│        │                            ├── Resume ─┘          │
│        │                            └── Stop ──► STOPPED   │
│        │                                                    │
│        ├── Breakpoint ──────► PAUSED_ON_BREAKPOINT         │
│        │                            │                       │
│        │                            ├── Resume ─► RUNNING  │
│        │                            ├── Step ───► STEP_MODE│
│        │                            └── Stop ──► STOPPED   │
│        │                                                    │
│        ├── User Pause ──────► PAUSED_BY_USER               │
│        │                            │                       │
│        │                            └── Resume ─► RUNNING  │
│        │                                                    │
│        └── Step Request ────► STEP_MODE                    │
│                                    │                        │
│                                    └── After 1 instruction │
│                                         ► PAUSED_BY_USER   │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

---

## Error Recovery

### Continue After Error

In debug mode, users can choose to continue execution:

```javascript
async pauseOnError(error) {
    this.debugState = 'PAUSED_ON_ERROR';

    // Emit event for UI
    this.emit('execution-paused', {
        reason: 'error',
        error: error,
        context: error.currentContext
    });

    // Wait for user action
    const action = await this.waitForUserAction();

    switch (action) {
        case 'resume':
            // Skip the error line and continue
            this.instructionPointer++;
            this.debugState = 'RUNNING';
            break;

        case 'step':
            // Execute next line only
            this.instructionPointer++;
            this.debugState = 'STEP_MODE';
            break;

        case 'stop':
            // Halt execution
            this.debugState = 'STOPPED';
            throw error;
    }
}
```

### Skip Failed Line

```
┌─────────────────────────────────────────────────────────────┐
│                 ERROR RECOVERY                               │
│                                                             │
│   Script:                                                   │
│   IP=3:  setv va00 100                                      │
│   IP=4:  divv va00 0    ← Division by zero error           │
│   IP=5:  outv va00                                          │
│                                                             │
│   On Resume:                                                │
│   ├── instructionPointer++ (4 → 5)                         │
│   └── Continue from IP=5                                    │
│                                                             │
│   Result: Line 4 skipped, execution continues               │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

---

## CAOSDebugger

The `CAOSDebugger` class provides comprehensive debugging features.

### Features

| Feature | Description |
|---------|-------------|
| **Breakpoints** | Pause at specific lines |
| **Step Execution** | One instruction at a time |
| **Variable Watch** | Monitor variable changes |
| **Stack Trace** | View call hierarchy |
| **Execution History** | Track past executions |

### Breakpoint System

```javascript
class CAOSDebugger extends EventEmitter {
    breakpoints: Map<scriptKey, Set<lineNumber>>

    setBreakpoint(scriptKey, lineNumber) {
        if (!this.breakpoints.has(scriptKey)) {
            this.breakpoints.set(scriptKey, new Set());
        }
        this.breakpoints.get(scriptKey).add(lineNumber);
    }

    removeBreakpoint(scriptKey, lineNumber) {
        const lines = this.breakpoints.get(scriptKey);
        if (lines) {
            lines.delete(lineNumber);
        }
    }

    isBreakpoint(scriptKey, lineNumber) {
        const lines = this.breakpoints.get(scriptKey);
        return lines && lines.has(lineNumber);
    }
}
```

### Execution Tracking

```javascript
{
    executions: Map<id, ExecutionInfo>,
    executionHistory: ExecutionInfo[],
    executionState: {
        paused: boolean,
        currentLine: number,
        currentScript: object,
        currentExecutionId: string
    }
}
```

### Debug Events

| Event | Data |
|-------|------|
| `execution-started` | executionId, scriptData |
| `execution-paused` | executionId, reason |
| `execution-resumed` | executionId |
| `execution-completed` | executionId, status |
| `variable-changed` | varName, oldValue, newValue |
| `breakpoint-hit` | scriptKey, lineNumber |

---

## Common Errors

### Division by Zero

```caos
setv va00 10
divv va00 0    * Error: Division by zero
```

**Error message:** `Division by zero in DIVV`

### Invalid Agent

```caos
targ null
setv ov00 100   * Error: No target agent
```

**Error message:** `Cannot access OV00: TARG is null`

### Stack Overflow

```caos
subr InfiniteLoop
    gsub InfiniteLoop
retn
```

**Error message:** `Stack overflow: exceeded maximum depth of 100`

### Type Mismatch

```caos
setv va00 "hello"
addv va00 10    * Error: Cannot add to string
```

**Error message:** `Type mismatch: expected number, got string`

### Invalid Position

```caos
mvto -1000 -1000   * Error: Position out of bounds
```

**Error message:** `MVTO: Invalid position (-1000, -1000)`

---

## Error Messages Format

### Standard Format

```
[ERROR] CommandName at line N in script.cos:
    Message: <error description>
    Parameters: [param1, param2, ...]

Stack trace:
    at CommandName (line N)
    at ParentCommand (line M)
    at SCRP 2 1 1 9 (line 1)
```

### Example Output

```
[ERROR] DIVV at line 5 in bootstrap.cos:
    Message: Division by zero
    Parameters: [va00, 0]

Stack trace:
    at DIVV (line 5)
    at SETV (line 4)
    at SCRP 2 1 1 9 (line 1)
```

---

## Debug UI Integration

### Pause on Error UI Flow

```
┌─────────────────────────────────────────────────────────────┐
│                 DEBUG UI FLOW                                │
│                                                             │
│   1. Error occurs                                           │
│      └── CAOSMachine emits 'execution-paused'              │
│                                                             │
│   2. UI receives event                                      │
│      ├── Display error message                              │
│      ├── Show stack trace                                   │
│      ├── Highlight error line in editor                     │
│      └── Show variable values                               │
│                                                             │
│   3. User chooses action                                    │
│      ├── [Resume] → Skip line, continue                    │
│      ├── [Step] → Execute next line only                   │
│      └── [Stop] → Halt execution                           │
│                                                             │
│   4. Action sent to CAOSMachine                            │
│      └── Machine responds accordingly                       │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

### Variable Inspection

```javascript
// Get all current variables
getVariableSnapshot() {
    return {
        scriptVariables: Object.fromEntries(this.scriptVariables),
        targVariables: this.getTarg()?.getVariables(),
        ownrVariables: this.getOwnr()?.getVariables(),
        context: {
            ownr: this.getOwnr()?.myID,
            targ: this.getTarg()?.myID,
            from: this.getFrom()?.myID
        }
    };
}
```

---

## Best Practices

### Defensive Coding

```caos
* Check before division
doif va01 <> 0
    divv va00 va01
else
    setv va00 0    * Default value
endi

* Validate agent before access
doif targ <> null
    setv ov00 100
endi

* Check position before move
setv va00 rtyp 100 200
doif va00 <> -1
    mvto 100 200
endi
```

### Error Handling Pattern

```caos
* Use OV99 as error flag
setv ov99 0

inst
    * Critical operation
    doif some_condition
        setv ov99 1    * Mark error
    endi
slow

doif ov99 = 1
    * Handle error
    outs "Error occurred!"
endi
```

---

## Key Files

| File | Purpose |
|------|---------|
| `CAOSStackError.js` | Error classes |
| `CAOSDebugger.js` | Debug system |
| `CAOSMachine.js` | Error handling logic |

---

## Related Articles

- [CAOS Overview](#/article/caos-overview) - Introduction to CAOS
- [CAOS Machine](#/article/caos-machine) - Virtual machine
- [Command Categories](#/article/caos-commands) - All commands
- [Stack & Variables](#/article/caos-variables) - Variable system
