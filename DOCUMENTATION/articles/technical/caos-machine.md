# CAOS Machine

The CAOSMachine is the virtual machine that executes CAOS scripts. This article explains its architecture and execution model.

## Architecture Overview

```
┌─────────────────────────────────────────────────────────────┐
│                     CAOSMachine                              │
│                                                             │
│   ┌─────────────────┐    ┌─────────────────┐               │
│   │  Instruction    │    │    Data Stack   │               │
│   │    Pointer      │    │    (myStack)    │               │
│   └────────┬────────┘    └────────┬────────┘               │
│            │                      │                         │
│   ┌────────▼────────┐    ┌────────▼────────┐               │
│   │  Executable     │    │   Agent Stack   │               │
│   │  Lines Index    │    │ (myAgentStack)  │               │
│   └────────┬────────┘    └────────┬────────┘               │
│            │                      │                         │
│   ┌────────▼────────────────────────────────┐              │
│   │           Context Variables              │              │
│   │  OWNR  TARG  FROM  _P1_  _P2_  _IT_     │              │
│   └────────┬────────────────────────────────┘              │
│            │                                                │
│   ┌────────▼────────┐    ┌─────────────────┐               │
│   │   Jump Stack    │    │  Return Stack   │               │
│   │ (flow control)  │    │  (subroutines)  │               │
│   └─────────────────┘    └─────────────────┘               │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

---

## Core Components

### Instruction Pointer

The `instructionPointer` tracks the current position in the script:

```javascript
// Points to index in executableLinesIndex array
instructionPointer: number

// Pre-built array of executable lines for O(1) access
executableLinesIndex: [
    { line: {...}, number: 1, content: "setv va00 10" },
    { line: {...}, number: 2, content: "outv va00" },
    // ...
]
```

### Data Stack

The `myStack` holds intermediate values during computation:

```
Stack Operations:
┌─────────────────────────────────────────────────────────────┐
│                                                             │
│   SETV VA00 10         Stack: []                           │
│   ↓ Push 10            Stack: [10]                         │
│   ↓ Push "va00"        Stack: [10, "va00"]                 │
│   ↓ Execute SETV       Stack: [] → VA00 = 10               │
│                                                             │
│   ADDV VA00 5          Stack: []                           │
│   ↓ Push 5             Stack: [5]                          │
│   ↓ Push "va00"        Stack: [5, "va00"]                  │
│   ↓ Execute ADDV       Stack: [] → VA00 = 15               │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

### Agent Stack

The `myAgentStack` holds agent references:

```javascript
// Used for operations that need multiple agent references
myAgentStack: AgentHandle[]

// Push/pop operations
pushAgentStack(agent)
popAgentStack() → AgentHandle
```

---

## Context Variables

Context variables are **AgentHandles** with reference counting for safe access.

### Handle Properties

```javascript
_ownrHandle: AgentHandle   // Script owner
_targHandle: AgentHandle   // Current target
_fromHandle: AgentHandle   // Message sender
_itHandle: AgentHandle     // Enumeration iterator
_p1Handle: AgentHandle     // Parameter 1 (if agent)
_p2Handle: AgentHandle     // Parameter 2 (if agent)
```

### Safe Access Pattern

```javascript
// Setting context (with reference counting)
setOwnr(agent) {
    this._ownrHandle.acquire(agent);
}

// Getting context (returns agent or null)
getOwnr() {
    return this._ownrHandle.get();
}

// Checking validity
isContextAgentValid('ownr') → boolean
```

### Reference Counting

```
┌─────────────────────────────────────────────────────────────┐
│              REFERENCE COUNTING FLOW                         │
│                                                             │
│   1. Script starts                                          │
│      ├── setOwnr(agentA) → agentA.refCount++               │
│      └── setTarg(agentA) → agentA.refCount++               │
│                                                             │
│   2. During execution                                       │
│      ├── setTarg(agentB) → agentA.refCount--               │
│      │                   → agentB.refCount++               │
│                                                             │
│   3. Script ends                                            │
│      └── cleanup() → all handles release                    │
│          → remaining agents get refCount--                  │
│                                                             │
│   If refCount reaches 0 and agent is garbage → deleted      │
└─────────────────────────────────────────────────────────────┘
```

---

## Execution Modes

### Quantized Mode (Default)

Limits instructions per game tick to prevent freezing:

```javascript
quantized: true
executionQuanta: 5  // Max 5 instructions per tick

// Each tick:
for (let i = 0; i < executionQuanta; i++) {
    executeNextInstruction();
    if (scriptComplete) break;
}
```

### INST Mode (Instant)

Runs entire block without time limit:

```caos
inst
    * All commands here run atomically
    setv ov00 100
    setv ov01 200
    setv ov02 300
slow    * Return to quantized mode
```

```javascript
myInstFlag: boolean  // true = instant mode

// In instant mode, ignores quanta limit
while (!scriptComplete && myInstFlag) {
    executeNextInstruction();
}
```

### LOCK Mode

Prevents script interruption:

```caos
lock
    * Cannot be interrupted by messages
    * Critical section
unlk
```

```javascript
myLockedFlag: boolean

// Locked scripts cannot be interrupted by:
// - Other scripts on same agent
// - Incoming messages
// - Timer events
```

---

## Token Processing

CAOS uses **right-to-left** token processing for proper nested command evaluation.

### Processing Order

```
Line: SETV VA00 RAND 1 10

Right-to-left processing:
┌─────────────────────────────────────────────────────────────┐
│                                                             │
│   Tokens: [SETV] [VA00] [RAND] [1] [10]                    │
│                                    ↑                        │
│   Step 1: Push 10                  Process                  │
│   Stack: [10]                                               │
│                              ↑                              │
│   Step 2: Push 1             Process                        │
│   Stack: [10, 1]                                            │
│                        ↑                                    │
│   Step 3: Execute RAND Process                              │
│   Stack: [10, 1] → pop 2 values → RAND(1,10) = 7           │
│   Stack: [7]                                                │
│                  ↑                                          │
│   Step 4: Push "va00"                                       │
│   Stack: [7, "va00"]                                        │
│            ↑                                                │
│   Step 5: Execute SETV                                      │
│   Stack: [] → VA00 = 7                                      │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

### Nested Commands

```caos
* Nested command example
setv va00 addv mulv 2 3 10

* Evaluation order:
* 1. MULV 2 3 → 6 (push result)
* 2. ADDV 6 10 → 16 (push result)
* 3. SETV VA00 16 → VA00 = 16
```

---

## Jump Stack

The `jumpStack` manages flow control state for loops and enumerations.

### Jump State Types

```javascript
// Loop state
{
    type: 'LOOP',
    loopStartLine: number,    // IP to jump back to
    iteration: number         // Current iteration count
}

// Repeat state
{
    type: 'REPS',
    loopStartLine: number,
    totalIterations: number,
    currentIteration: number
}

// Enumeration state
{
    type: 'ENUM',
    agents: Agent[],          // Matching agents
    currentIndex: number,     // Current position
    savedTarg: Agent,         // Original TARG to restore
    loopStartLine: number
}

// Conditional state
{
    type: 'DOIF',
    conditionMet: boolean,
    depth: number,
    lineNumber: number
}
```

### Flow Control Example

```
┌─────────────────────────────────────────────────────────────┐
│   LOOP/UNTL Flow                                            │
│                                                             │
│   IP=0: setv va00 3                                         │
│   IP=1: loop          ← Push {type:'LOOP', startLine:2}    │
│   IP=2:   outv va00                                         │
│   IP=3:   subv va00 1                                       │
│   IP=4: untl va00 = 0                                       │
│         │                                                   │
│         ├── va00 ≠ 0? Jump to IP=2                         │
│         └── va00 = 0? Pop state, continue to IP=5          │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

---

## Return Address Stack

The `returnAddressStack` manages subroutine calls (GSUB/RETN).

### Subroutine Flow

```
┌─────────────────────────────────────────────────────────────┐
│   GSUB/RETN Flow                                            │
│                                                             │
│   IP=0: setv va00 10                                        │
│   IP=1: gsub MyFunc    ← Push IP=2 onto return stack       │
│         ↓ Jump to label "MyFunc"                            │
│   IP=5: subr MyFunc    ← (Label, no execution)              │
│   IP=6:   mulv va00 2                                       │
│   IP=7: retn           ← Pop return stack, jump to IP=2    │
│   IP=2: outv va00      ← Continue here after return         │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

### Label Map

Labels are pre-compiled at script start:

```javascript
// Built by buildLabelMap() before execution
labels: Map<string, number>

// Example:
labels = {
    "MyFunc": 5,      // IP where subr MyFunc is
    "Helper": 12      // IP where subr Helper is
}
```

---

## Debug Integration

The CAOSMachine supports comprehensive debugging.

### Debug States

```javascript
debugState: 'RUNNING' | 'PAUSED_ON_ERROR' |
            'PAUSED_ON_BREAKPOINT' | 'PAUSED_BY_USER' |
            'STEP_MODE' | 'STOPPED'
```

### Debug Features

| Feature | Description |
|---------|-------------|
| **Breakpoints** | Pause at specific lines |
| **Step Mode** | Execute one instruction at a time |
| **Pause on Error** | Stop when exception occurs |
| **Variable Watch** | Inspect VA/OV/MV values |
| **Stack Trace** | View execution context chain |

### Execution Context

Each instruction creates an ExecutionContext:

```javascript
{
    commandName: 'SETV',
    params: ['va00', 100],
    lineNumber: 5,
    scriptFile: 'bootstrap.cos',
    parentContext: ExecutionContext,
    depth: 0,
    startTime: timestamp,
    endTime: timestamp,
    success: true,
    stackSnapshot: {...}
}
```

---

## MacroScript

Compiled scripts are stored as MacroScript objects.

### Structure

```javascript
class MacroScript {
    code: Uint8Array       // Compiled bytecode
    size: number           // Bytecode size
    referenceCount: number // For garbage collection
    debugInfo: DebugInfo   // Source mapping
    classifier: {
        family: number,
        genus: number,
        species: number,
        event: number
    }
}
```

### DebugInfo

Maps bytecode addresses to source positions:

```javascript
class DebugInfo {
    sourceText: string              // Original source
    addressMap: Map<address, pos>   // Address → source position

    mapAddressToSource(address) → { line, column }
}
```

---

## Execution Pipeline

### Complete Flow

```
┌─────────────────────────────────────────────────────────────┐
│                  EXECUTION PIPELINE                          │
│                                                             │
│   1. SCRIPT LOADING                                         │
│      ├── Parse COS file into sections                       │
│      └── Store SCRP sections in Scriptorium                 │
│                                                             │
│   2. SCRIPT REQUEST                                         │
│      ├── Event triggers (timer, click, message)             │
│      └── Query Scriptorium for matching script              │
│                                                             │
│   3. INITIALIZATION                                         │
│      ├── buildExecutableLinesIndex() - O(1) access array   │
│      ├── buildLabelMap() - SUBR label locations             │
│      ├── clearScriptVariables() - Reset VA00-VA99           │
│      └── Set context (OWNR, TARG, FROM, _P1_, _P2_)         │
│                                                             │
│   4. EXECUTION LOOP                                         │
│      ├── Get line at instructionPointer                     │
│      ├── Process tokens right-to-left                       │
│      ├── Execute command                                    │
│      ├── Increment instructionPointer (unless jump)         │
│      └── Repeat until end or quanta exhausted               │
│                                                             │
│   5. CLEANUP                                                │
│      ├── Release agent handles                              │
│      └── Clear temporary state                              │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

---

## Performance Optimizations

### Executable Lines Index

Pre-built sorted array for O(1) line access:

```javascript
// Instead of searching for line N each time:
// O(n) search replaced with O(1) index lookup

this.executableLinesIndex = [
    { line: {...}, number: 1 },
    { line: {...}, number: 2 },
    // Sorted by line number
]

// Access:
const currentLine = executableLinesIndex[instructionPointer];
```

### Label Pre-compilation

Subroutine labels compiled at script start:

```javascript
// Before execution, scan for SUBR labels
buildLabelMap() {
    for (let ip = 0; ip < lines.length; ip++) {
        if (isSubrLabel(lines[ip])) {
            labels.set(labelName, ip);
        }
    }
}

// GSUB lookup is O(1) via Map
```

---

## Key Files

| File | Lines | Purpose |
|------|-------|---------|
| `CAOSMachine.js` | ~4,500 | Main virtual machine |
| `CAOSStackOperations.js` | ~500 | Stack arithmetic |
| `CommandLoader.js` | ~300 | Dynamic command loading |
| `MacroScript.js` | ~100 | Bytecode container |

---

## Related Articles

- [CAOS Overview](#/article/caos-overview) - Introduction to CAOS
- [Command Categories](#/article/caos-commands) - All command types
- [Stack & Variables](#/article/caos-variables) - Variable system
- [Error Handling](#/article/caos-errors) - Debugging and errors
