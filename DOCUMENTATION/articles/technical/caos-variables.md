# Stack & Variables

CAOS uses a stack-based execution model with multiple variable scopes. This article explains how the stack works and how variables are managed.

## Stack-Based Execution

### LIFO Stack Model

CAOS uses a **Last In, First Out** (LIFO) stack for parameter passing and intermediate values:

```
┌─────────────────────────────────────────────────────────────┐
│                    STACK MODEL                               │
│                                                             │
│   Command: SETV VA00 100                                    │
│                                                             │
│   Step 1: Process tokens right-to-left                      │
│   ┌───────────────────────────────────┐                    │
│   │                                   │                    │
│   │   Stack: [] (empty)               │                    │
│   │                                   │                    │
│   │   Push 100 → Stack: [100]         │                    │
│   │   Push "VA00" → Stack: [100, "VA00"]│                    │
│   │                                   │                    │
│   │   Execute SETV:                   │                    │
│   │     Pop "VA00" (variable name)    │                    │
│   │     Pop 100 (value)               │                    │
│   │     Set VA00 = 100                │                    │
│   │                                   │                    │
│   │   Stack: [] (empty)               │                    │
│   │                                   │                    │
│   └───────────────────────────────────┘                    │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

### Nested Commands

Stack enables nested command evaluation:

```caos
* Nested example: SETV VA00 RAND 1 10
```

```
┌─────────────────────────────────────────────────────────────┐
│   Tokens: [SETV] [VA00] [RAND] [1] [10]                    │
│                                                             │
│   Process right-to-left:                                    │
│                                                             │
│   Push 10     → Stack: [10]                                │
│   Push 1      → Stack: [10, 1]                             │
│   Exec RAND   → Pop 1, pop 10, result=7                    │
│                 Stack: [7]                                  │
│   Push "VA00" → Stack: [7, "VA00"]                         │
│   Exec SETV   → Pop "VA00", pop 7                          │
│                 VA00 = 7                                    │
│                 Stack: []                                   │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

---

## Stack Operations

### CAOSStackOperations Class

The `CAOSStackOperations` class provides centralized stack operations.

### Arithmetic Operations

| Operation | Description | Example |
|-----------|-------------|---------|
| `ADD` | Addition | `a + b` |
| `SUB` | Subtraction | `a - b` |
| `MUL` | Multiplication | `a * b` |
| `DIV` | Division | `a / b` |
| `MOD` | Modulo | `a % b` |

```
Stack: [10, 3]
Operation: ADD
Result: Stack: [13]
```

### Comparison Operations

| Operation | Description | Returns |
|-----------|-------------|---------|
| `EQ` | Equal | 1 or 0 |
| `NE` | Not equal | 1 or 0 |
| `LT` | Less than | 1 or 0 |
| `GT` | Greater than | 1 or 0 |
| `LE` | Less or equal | 1 or 0 |
| `GE` | Greater or equal | 1 or 0 |

```
Stack: [10, 5]
Operation: GT (is 10 > 5?)
Result: Stack: [1] (true)
```

### Logical Operations

| Operation | Description |
|-----------|-------------|
| `AND` | Logical AND |
| `OR` | Logical OR |
| `NOT` | Logical NOT |

### Mathematical Functions

| Function | Description |
|----------|-------------|
| `ABS` | Absolute value |
| `SQRT` | Square root |
| `SIN` | Sine |
| `COS` | Cosine |
| `TAN` | Tangent |
| `ASIN` | Arc sine |
| `ACOS` | Arc cosine |
| `ATAN` | Arc tangent |

---

## Variable Types

CAOS has several variable scopes, each with different lifetimes and visibility.

### Variable Scope Diagram

```
┌─────────────────────────────────────────────────────────────┐
│                   VARIABLE SCOPES                            │
│                                                             │
│   ┌─────────────────────────────────────────────────────┐  │
│   │  SCRIPT SCOPE (VA00-VA99)                           │  │
│   │  • Local to current script execution                │  │
│   │  • Reset when script completes                      │  │
│   │  • 100 integer variables                            │  │
│   └─────────────────────────────────────────────────────┘  │
│                                                             │
│   ┌─────────────────────────────────────────────────────┐  │
│   │  AGENT SCOPE (OV00-OV99)                            │  │
│   │  • Stored on agent object                           │  │
│   │  • Persist for agent's lifetime                     │  │
│   │  • Saved/loaded with world                          │  │
│   │  • 100 variables (any type)                         │  │
│   └─────────────────────────────────────────────────────┘  │
│                                                             │
│   ┌─────────────────────────────────────────────────────┐  │
│   │  OWNER SCOPE (MV00-MV99)                            │  │
│   │  • Maps to OWNR's OV variables                      │  │
│   │  • Shorthand for accessing caller's data            │  │
│   │  • MV05 = OWNR's OV05                               │  │
│   └─────────────────────────────────────────────────────┘  │
│                                                             │
│   ┌─────────────────────────────────────────────────────┐  │
│   │  GAME SCOPE (GAME variables)                        │  │
│   │  • World-level persistent variables                 │  │
│   │  • Accessed by string name                          │  │
│   │  • Saved with world state                           │  │
│   └─────────────────────────────────────────────────────┘  │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

---

## Script Variables (VA00-VA99)

### Properties

- **Scope:** Local to current script execution
- **Lifetime:** Reset when script completes
- **Count:** 100 variables (VA00 through VA99)
- **Type:** Integer only

### Usage

```caos
* Set script variable
setv va00 100

* Arithmetic
addv va00 50      * VA00 = 150
subv va00 25      * VA00 = 125

* Use in conditions
doif va00 > 100
    outs "High value"
endi

* Loop counter
setv va99 10
loop
    subv va99 1
untl va99 = 0
```

### Internal Storage

```javascript
// In CAOSMachine
getScriptVariable(varName) {
    return this.scriptVariables.get(varName) || 0;
}

setScriptVariable(varName, value) {
    this.scriptVariables.set(varName, value);
}

clearScriptVariables() {
    this.scriptVariables.clear();
}
```

---

## Object Variables (OV00-OV99)

### Properties

- **Scope:** Bound to specific agent
- **Lifetime:** Agent's entire lifetime
- **Count:** 100 variables per agent
- **Type:** Any (number, string, agent reference)
- **Persistence:** Saved/loaded with world

### Usage

```caos
* Set object variable on current agent
setv ov00 42

* Set string
sets ov01 "my state"

* Store agent reference
seta ov02 from

* Access on different agent
targ agentB
setv ov00 100    * Sets agentB's OV00
```

### Agent-Specific Data

```
┌─────────────────────────────────────────────────────────────┐
│   Agent A                    Agent B                        │
│   ┌─────────────────┐       ┌─────────────────┐            │
│   │ OV00 = 42       │       │ OV00 = 100      │            │
│   │ OV01 = "active" │       │ OV01 = "idle"   │            │
│   │ OV02 = AgentB   │       │ OV02 = null     │            │
│   └─────────────────┘       └─────────────────┘            │
│                                                             │
│   Each agent has its own independent OV variables           │
└─────────────────────────────────────────────────────────────┘
```

---

## Owner Variables (MV00-MV99)

### Properties

- **Scope:** Maps to OWNR's OV variables
- **Purpose:** Convenient access to caller's data
- **Mapping:** MV05 → OWNR.OV05

### Usage

```caos
* In script running on Agent A:
* OWNR = Agent B (who triggered this script)

* These are equivalent:
setv mv00 100       * Sets OWNR's OV00
targ ownr
setv ov00 100       * Also sets OWNR's OV00

* Useful for callbacks
* Agent B triggers script on Agent A
* Agent A can update Agent B's variables via MV
```

### Internal Mapping

```javascript
getOwnerVariable(mvName) {
    const ownr = this.getOwnr();
    const varNum = mvName.slice(2);  // "mv05" → "05"
    return ownr.getVariable(`OV${varNum}`);
}
```

---

## Game Variables

### Properties

- **Scope:** World-level (global)
- **Lifetime:** Persistent with world save
- **Type:** Any
- **Access:** By string name

### Usage

```caos
* Set game variable
setv game "score" 1000
setv game "level" 5

* Get game variable
setv va00 game "score"

* String game variable
sets game "player_name" "Bob"
```

### Use Cases

- Game score
- Level progression
- Global flags
- Shared state between agents

---

## Special Variables

### Velocity Variables

| Variable | Description |
|----------|-------------|
| `VELX` | X velocity component |
| `VELY` | Y velocity component |

```caos
* Set velocity directly
setv velx 5.0
setv vely -2.0

* Or use VELO command
velo 5.0 -2.0
```

### Position Variables

| Variable | Description | Read-Only |
|----------|-------------|-----------|
| `POSX` | X position | Yes |
| `POSY` | Y position | Yes |
| `POSL` | Left edge | Yes |
| `POSR` | Right edge | Yes |
| `POST` | Top edge | Yes |
| `POSB` | Bottom edge | Yes |

```caos
* Read position
setv va00 posx
setv va01 posy

* Use in conditions
doif posx > 500
    velo -5 0    * Move left
endi
```

### Context Variables

| Variable | Description |
|----------|-------------|
| `OWNR` | Script owner agent |
| `TARG` | Target agent |
| `FROM` | Message sender |
| `_P1_` | Message parameter 1 |
| `_P2_` | Message parameter 2 |
| `_IT_` | Enumeration iterator |

---

## Variable Resolution

### Resolution Order

When a variable name is encountered, it's resolved in this order:

```
┌─────────────────────────────────────────────────────────────┐
│              VARIABLE RESOLUTION                             │
│                                                             │
│   Variable name: "va00"                                     │
│                                                             │
│   1. Check if VA pattern (va\d{2})                         │
│      → Return script variable                               │
│                                                             │
│   Variable name: "ov00"                                     │
│                                                             │
│   2. Check if OV pattern (ov\d{2})                         │
│      → Return TARG's object variable                        │
│                                                             │
│   Variable name: "mv00"                                     │
│                                                             │
│   3. Check if MV pattern (mv\d{2})                         │
│      → Return OWNR's object variable                        │
│                                                             │
│   Variable name: "velx"                                     │
│                                                             │
│   4. Check special variables                                │
│      → Return special value (velocity, position, etc.)      │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

### Implementation

```javascript
resolveVariable(varName) {
    const lower = varName.toLowerCase();

    // Script variables (VA00-VA99)
    if (/^va\d{2}$/.test(lower)) {
        return this.getScriptVariable(varName);
    }

    // Object variables (OV00-OV99)
    if (/^ov\d{2}$/.test(lower)) {
        const agent = this.getTarg();
        return agent.getVariable(varName);
    }

    // Owner variables (MV00-MV99)
    if (/^mv\d{2}$/.test(lower)) {
        const ownr = this.getOwnr();
        const ovName = `OV${lower.slice(2)}`;
        return ownr.getVariable(ovName);
    }

    // Special variables
    switch (lower) {
        case 'velx': return this.getTarg().myVelocityVector.x;
        case 'vely': return this.getTarg().myVelocityVector.y;
        case 'posx': return this.getTarg().myPositionVector.x;
        case 'posy': return this.getTarg().myPositionVector.y;
        // ... more cases
    }
}
```

---

## Variable Commands Reference

### Setting Variables

| Command | Purpose | Example |
|---------|---------|---------|
| `SETV` | Set numeric | `setv va00 100` |
| `SETS` | Set string | `sets va00 "hi"` |
| `SETA` | Set agent | `seta ov00 from` |
| `NEGV` | Negate | `negv va00` |

### Arithmetic

| Command | Purpose | Example |
|---------|---------|---------|
| `ADDV` | Add | `addv va00 10` |
| `SUBV` | Subtract | `subv va00 5` |
| `MULV` | Multiply | `mulv va00 2` |
| `DIVV` | Divide | `divv va00 3` |
| `MODV` | Modulo | `modv va00 7` |

### Functions

| Command | Purpose | Example |
|---------|---------|---------|
| `RAND` | Random | `setv va00 rand 1 100` |
| `ABS` | Absolute | `setv va00 abs va01` |
| `SQRT` | Square root | `setv va00 sqrt 16` |
| `SIN` | Sine | `setv va00 sin va01` |
| `COS` | Cosine | `setv va00 cos va01` |

---

## Examples

### Counter Pattern

```caos
* Initialize counter
setv ov00 0

* Timer script increments
scrp 2 1 1 9
    addv ov00 1
    doif ov00 >= 100
        setv ov00 0    * Reset
    endi
endm
```

### State Machine

```caos
* OV00 = state (0=idle, 1=active, 2=cooldown)
* OV01 = cooldown timer

scrp 2 1 1 9
    doif ov00 = 0
        * Idle state
    elif ov00 = 1
        * Active state
        subv ov01 1
        doif ov01 <= 0
            setv ov00 2     * To cooldown
            setv ov01 50    * Cooldown time
        endi
    elif ov00 = 2
        * Cooldown state
        subv ov01 1
        doif ov01 <= 0
            setv ov00 0     * Back to idle
        endi
    endi
endm
```

### Shared Data via GAME

```caos
* Agent A updates score
setv va00 game "score"
addv va00 10
setv game "score" va00

* Agent B reads score
setv va00 game "score"
doif va00 >= 100
    outs "High score!"
endi
```

---

## Key Files

| File | Purpose |
|------|---------|
| `CAOSStackOperations.js` | Stack arithmetic |
| `commands/variables/*.js` | Variable commands |
| `CAOSMachine.js` | Variable storage |

---

## Related Articles

- [CAOS Overview](#/article/caos-overview) - Introduction to CAOS
- [CAOS Machine](#/article/caos-machine) - Virtual machine
- [Command Categories](#/article/caos-commands) - All commands
- [Error Handling](#/article/caos-errors) - Debugging
