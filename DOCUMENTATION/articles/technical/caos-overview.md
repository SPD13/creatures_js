# CAOS Scripting Overview

CAOS (Creatures Agent Object Script) is the scripting language that controls all agent behavior in Creatures 3. This article introduces the fundamentals of CAOS scripting.

## What is CAOS?

CAOS is an event-driven scripting language where:
- Every object in the game is an **agent**
- Agents respond to **events** by running **scripts**
- Scripts are stored in the **Scriptorium** and looked up by classifier + event number
- A virtual machine (**CAOSMachine**) executes the scripts

### Key Concepts

| Concept | Description |
|---------|-------------|
| **Agent** | Any interactive object (food, toys, machines, creatures) |
| **Classifier** | Identity triplet: family, genus, species |
| **Script** | CAOS code that runs in response to an event |
| **Event** | A trigger (timer tick, click, message, collision) |
| **Scriptorium** | Central registry storing all scripts |

---

## Script Structure

### Basic Script Definition

```caos
scrp 2 1 1 9
    * This script runs for agents with classifier 2,1,1
    * when event 9 (timer) fires

    setv va00 100
    outs "Timer fired!"
endm
```

### Script Components

```
scrp [family] [genus] [species] [event]
    [script body]
endm
```

| Part | Description |
|------|-------------|
| `scrp` | Script start marker |
| `family` | Broad category (1-65535) |
| `genus` | Sub-category (1-65535) |
| `species` | Specific type (1-65535) |
| `event` | Event number that triggers this script |
| `endm` | End of macro/script |

---

## Event Numbers

Events are numbered triggers that cause scripts to run.

### Standard Agent Events

| Event | Name | Description |
|-------|------|-------------|
| 0 | Deactivate | Agent deactivated |
| 1 | Activate1 | Primary activation (click) |
| 2 | Activate2 | Secondary activation |
| 3 | Hit | Creature hit this agent |
| 4 | Pickup | Agent picked up |
| 5 | Drop | Agent dropped |
| 6 | Collision | Wall/boundary collision |
| 7 | Bump | Creature bumped agent |
| 9 | Timer | Timer tick (TICK command) |
| 12 | Eat | Agent eaten |

### Creature Events

| Event | Name | Description |
|-------|------|-------------|
| 16-31 | Extrovert | Behaviors toward other agents |
| 32-47 | Introvert | Self-directed behaviors |
| 64-71 | Involuntary | Reflex actions (0-7) |
| 72 | Die | Death script |

### Message Events

| Event | Name | Description |
|-------|------|-------------|
| 100+ | Custom | User-defined message handlers |

### System Events

| Event | Name | Description |
|-------|------|-------------|
| 120 | SelectedCreatureChanged | Active creature changed |
| 128 | WorldLoaded | World finished loading |
| 255 | AgentException | Error handler |

---

## Context Variables

When a script runs, special variables provide context about who triggered the script and who is being acted upon.

### Core Context

| Variable | Description |
|----------|-------------|
| `OWNR` | The agent that owns/runs this script |
| `TARG` | The current target agent |
| `FROM` | The agent that sent the message/stimulus |
| `_P1_` | First message parameter |
| `_P2_` | Second message parameter |
| `_IT_` | Iterator in ENUM loops |

### Context Flow

```
┌─────────────────────────────────────────────────────────────┐
│                   SCRIPT CONTEXT                             │
│                                                             │
│   Agent A sends message to Agent B:                         │
│   mesg wrt+ agentB 100 42 0 0                               │
│                        │                                    │
│                        ▼                                    │
│   Agent B's script 100 runs with:                           │
│   ├── OWNR = Agent B (script owner)                         │
│   ├── TARG = Agent B (default target)                       │
│   ├── FROM = Agent A (message sender)                       │
│   ├── _P1_ = 42 (first parameter)                           │
│   └── _P2_ = 0 (second parameter)                           │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

### Example Usage

```caos
scrp 2 1 1 100
    * Message handler script

    * Check who sent the message
    doif from eq pntr
        outs "Message from pointer!"
    endi

    * Use the parameters
    setv va00 _p1_
    addv va00 _p2_
    outv va00
endm
```

---

## The Scriptorium

The **Scriptorium** is the central registry that stores all scripts, indexed by classifier and event number.

### Script Storage

```
Script Key: "family:genus:species:event"
Example: "2:1:1:9" → Timer script for classifier 2,1,1
```

### Script Lookup Flow

```
┌─────────────────────────────────────────────────────────────┐
│                   SCRIPT LOOKUP                              │
│                                                             │
│   1. Event occurs (timer, click, message)                   │
│                        │                                    │
│                        ▼                                    │
│   2. Get agent's classifier                                 │
│      family=2, genus=1, species=1                           │
│                        │                                    │
│                        ▼                                    │
│   3. Query Scriptorium with key                             │
│      key = "2:1:1:9"                                        │
│                        │                                    │
│                        ▼                                    │
│   4. Script found? Execute it                               │
│      Script not found? No action                            │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

### Installing Scripts

Scripts are installed when `.cos` files are loaded:

```caos
* Install script for family 2, genus 1, species 1, event 9
scrp 2 1 1 9
    tick 20
    outs "Tick!"
endm
```

---

## Basic Syntax

### Comments

```caos
* This is a comment (asterisk at line start)
```

### Commands

CAOS commands are 4-letter mnemonics:

```caos
setv va00 100        * Set variable
outs "Hello"         * Output string
outv va00            * Output value
tick 20              * Set timer rate
mvto 100 200         * Move to position
```

### Variables

```caos
* Script variables (VA00-VA99) - local to script
setv va00 42

* Object variables (OV00-OV99) - stored on agent
setv ov00 100

* Owner variables (MV00-MV99) - maps to OWNR's OV
setv mv00 50
```

### Conditionals

```caos
doif va00 > 50
    outs "Greater than 50"
elif va00 = 50
    outs "Equal to 50"
else
    outs "Less than 50"
endi
```

### Loops

```caos
* Count-based loop
reps 5
    outs "Hello"
repe

* Condition loop
setv va00 10
loop
    outv va00
    subv va00 1
untl va00 = 0

* Agent enumeration
enum 2 0 0    * All family 2 agents
    kill targ
next
```

### Subroutines

```caos
* Main code
setv va00 10
gsub Double
outv va00    * Outputs 20
stop

* Subroutine definition
subr Double
    mulv va00 2
retn
```

---

## Script Execution Lifecycle

### Phases

```
┌─────────────────────────────────────────────────────────────┐
│                 EXECUTION LIFECYCLE                          │
│                                                             │
│   1. COS FILE LOADING                                       │
│      ├── Parse file into sections                           │
│      ├── Execute inst/iscr sections immediately             │
│      └── Store SCRP sections in Scriptorium                 │
│                                                             │
│   2. EVENT TRIGGER                                          │
│      ├── Timer tick, click, message, etc.                   │
│      └── Agent requests script execution                    │
│                                                             │
│   3. SCRIPT LOOKUP                                          │
│      └── Query Scriptorium by classifier + event            │
│                                                             │
│   4. SCRIPT EXECUTION                                       │
│      ├── Create CAOSMachine instance                        │
│      ├── Set context (OWNR, TARG, FROM, _P1_, _P2_)         │
│      ├── Execute instructions                               │
│      └── Clean up on completion                             │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

### Execution Modes

| Mode | Description |
|------|-------------|
| **Quantized** | Limited instructions per tick (default: 5) |
| **INST** | Instant mode - no time limit |
| **LOCK** | Prevent script interruption |
| **SLOW** | Resume quantized execution |

```caos
* Run critical section atomically
inst
    * This code runs without interruption
    setv ov00 100
    setv ov01 200
slow
```

---

## COS File Structure

COS files contain initialization code and script definitions.

### Sections

| Section | Description |
|---------|-------------|
| `inst` | Immediate execution block |
| `scrp` | Script definition |
| `rscr` | Remove script block |
| `iscr` | Install script block |

### Example COS File

```caos
* My Agent Bootstrap File

* Immediate initialization
inst
    * Create the agent
    new: simp 2 1 1 "mysprite" 4 0 5000
    attr 195
    tick 20
    mvto 500 300
endm

* Timer script
scrp 2 1 1 9
    * Toggle animation frame
    doif pose = 0
        pose 1
    else
        pose 0
    endi
endm

* Activation script
scrp 2 1 1 1
    outs "I was clicked!"
endm

* Drop script
scrp 2 1 1 5
    velo 0 5
endm
```

---

## Key Files

| File | Purpose |
|------|---------|
| `CAOSMachine.js` | Virtual machine (~4,500 lines) |
| `Scriptorium.js` | Script storage and lookup |
| `CommandLoader.js` | Loads 156+ commands |
| `MacroScript.js` | Compiled bytecode container |

---

## Related Articles

- [CAOS Machine](#/article/caos-machine) - Virtual machine architecture
- [Command Categories](#/article/caos-commands) - All command types
- [Stack & Variables](#/article/caos-variables) - Variable system
- [Error Handling](#/article/caos-errors) - Debugging and errors
