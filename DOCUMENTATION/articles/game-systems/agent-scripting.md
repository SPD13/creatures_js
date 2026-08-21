# Agent Scripting & Behavior

This article covers how agents execute scripts, respond to events, and interact with each other through messaging, timers, and the CAOS scripting system.

## CAOS Scripts Overview

CAOS (Creatures Agent Object Script) is the scripting language that controls agent behavior. Scripts are triggered by events and executed by a virtual machine.

### Script Structure

```caos
* Define a script for classifier (2,1,1) on event 9 (timer)
scrp 2 1 1 9
    * Script code here
    outv ov00
endm
```

### Script Storage: The Scriptorium

All scripts are stored in the **Scriptorium**, a central registry indexed by classifier and event number:

```
Script Key: family:genus:species:event
Example: "2:1:1:9" → Timer script for classifier 2,1,1
```

### Script Lookup

When an event occurs, the engine looks up scripts:

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
│   3. Query Scriptorium                                      │
│      key = "2:1:1:9" (timer event)                         │
│                        │                                    │
│                        ▼                                    │
│   4. If script found → Execute                              │
│      If not found → No action                               │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

---

## Script Events

Events are numbered triggers that cause scripts to run.

### Standard Agent Events (0-15)

| Event | Name | Trigger |
|-------|------|---------|
| 0 | DEACTIVATE | Agent deactivated |
| 1 | ACTIVATE1 | Primary activation (click) |
| 2 | ACTIVATE2 | Secondary activation |
| 3 | HIT | Creature hit this agent |
| 4 | PICKUP | Agent picked up |
| 5 | DROP | Agent dropped |
| 6 | COLLISION | Wall collision |
| 7 | BUMP | Creature bumped agent |
| 9 | TIMER | Timer tick |
| 12 | EAT | Agent eaten |
| 13 | STARTHOLDHANDS | Creature starts holding hands |
| 14 | STOPHOLDHANDS | Creature stops holding hands |

### Creature Behavior Events (16-72)

| Range | Category | Examples |
|-------|----------|----------|
| 16-31 | Extrovert | EXTRAACT1, EXTRAPICKUP, EXTRAHIT |
| 32-47 | Introvert | INTROQUIESCENT, INTROREST |
| 64-71 | Involuntary | INVOLUNTARY0-7 (reflex actions) |
| 72 | Death | DIE script |

### Input Events (73-79)

Raw input events (require IMSK mask):

| Event | Name |
|-------|------|
| 73 | RAWKEYDOWN |
| 74 | RAWKEYUP |
| 75 | RAWMOUSEMOVE |
| 76 | RAWMOUSEDOWN |
| 77 | RAWMOUSEUP |
| 78 | RAWMOUSEWHEEL |
| 79 | RAWTRANSLATEDCHAR |

### Message Events (100+)

Custom message events use numbers 100 and above:

```caos
* Script 100 - custom message handler
scrp 2 1 1 100
    * _P1_ and _P2_ contain message parameters
    * FROM contains sending agent
endm
```

### System Events

| Event | Name | Description |
|-------|------|-------------|
| 120 | SELECTEDCREATURECHANGED | Active creature changed |
| 121 | PICKUPBYVEHICLE | Entered a vehicle |
| 122 | DROPBYVEHICLE | Exited a vehicle |
| 123 | WINDOWRESIZED | Game window resized |
| 128 | WORLD_LOADED | World finished loading |
| 255 | AGENTEXCEPTION | Error during script |

---

## Timer System

Timers allow agents to execute scripts at regular intervals.

### Timer Properties

```javascript
myTimer: number         // Current tick count
myTimerRate: number     // Ticks between fires (0=disabled)
myTimerTick: number     // Total times fired
```

### Setting a Timer (CAOS)

```caos
* Set timer to fire every 10 ticks
tick 10

* Disable timer
tick 0

* Get current timer rate
setv va00 tick
```

### Timer Processing

```
┌─────────────────────────────────────────────────────────────┐
│                   TIMER FLOW                                 │
│                                                             │
│   Each game tick:                                           │
│   ├── myTimer++                                             │
│   │                                                         │
│   └── if myTimer >= myTimerRate:                            │
│       ├── myTimer = 0                                       │
│       ├── myTimerTick++                                     │
│       └── Execute Timer script (event 9)                    │
│           ├── OWNR = this agent                             │
│           ├── FROM = this agent                             │
│           └── _P1_, _P2_ = 0                                │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

### Timer Example

```caos
* Create an agent that blinks every 20 ticks
new: simp 2 1 1 "lamp" 4 0 5000
tick 20

* Timer script
scrp 2 1 1 9
    * Toggle between frame 0 and 1
    doif pose = 0
        pose 1
    else
        pose 0
    endi
endm
```

---

## Messaging System

Agents communicate through messages, which trigger scripts on target agents.

### Message Structure

```javascript
{
    type: number,       // Message type (event number)
    from: Agent,        // Sending agent
    to: Agent,          // Receiving agent
    p1: any,            // Parameter 1
    p2: any,            // Parameter 2
    delay: number       // Ticks before delivery
}
```

### Sending Messages

```caos
* Send message to target agent
mesg wrt+ targ 100 50 25 0
*          ^    ^   ^  ^  ^
*          to  msg p1 p2 delay

* Message triggers script 100 on TARG
* With _P1_=50, _P2_=25
```

### Message Flow

```
┌─────────────────────────────────────────────────────────────┐
│                   MESSAGE DELIVERY                           │
│                                                             │
│   Agent A sends message:                                    │
│   mesg wrt+ agentB 100 42 0 5                               │
│                        │                                    │
│                        ▼                                    │
│   Message queued with 5 tick delay                          │
│                        │                                    │
│   ... 5 ticks pass ...                                      │
│                        │                                    │
│                        ▼                                    │
│   Agent B processes message:                                │
│   ├── FROM = Agent A                                        │
│   ├── _P1_ = 42                                             │
│   ├── _P2_ = 0                                              │
│   └── Execute script 100                                    │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

### Input Mask

Agents can filter which messages they respond to:

```caos
* Set input mask (bitmask of accepted message types)
imsk 255    * Accept all standard messages

* Input mask bits:
* Bit 0 (1):  Deactivate
* Bit 1 (2):  Activate1
* Bit 2 (4):  Activate2
* Bit 3 (8):  Hit
* Bit 4 (16): Pickup
* Bit 5 (32): Drop
* etc.
```

### Context Variables in Scripts

When a script runs from a message:

| Variable | Contains |
|----------|----------|
| `OWNR` | The agent running the script |
| `FROM` | The agent that sent the message |
| `TARG` | Current target (often same as OWNR) |
| `_P1_` | First message parameter |
| `_P2_` | Second message parameter |

---

## Click Actions

Click actions define how agents respond to pointer interaction.

### CLAC Mode (Single Action)

```caos
* Set click action to activate (message 1)
clac 1

* Set to custom message 100
clac 100

* Disable clicking
clac -1

* Get current action
setv va00 clac
```

### CLIK Mode (Cycle)

Cycles through three actions on successive clicks:

```caos
* Cycle through three states
clik 1 2 0
* Click 1: Activate (1)
* Click 2: Activate2 (2)
* Click 3: Deactivate (0)
* Click 4: Activate (1) - cycles back
```

### Click Processing

```
┌─────────────────────────────────────────────────────────────┐
│                   CLICK HANDLING                             │
│                                                             │
│   User clicks on agent                                      │
│                        │                                    │
│                        ▼                                    │
│   Check ACTIVATEABLE attribute (0x04)                       │
│                        │                                    │
│        ┌───────────────┴───────────────┐                   │
│        │                               │                    │
│        ▼ Not set                       ▼ Set                │
│   Ignore click                    Get click mode            │
│                                        │                    │
│                        ┌───────────────┴───────────────┐   │
│                        │                               │    │
│                        ▼ CLAC                          ▼ CLIK│
│                   Return myClickAction          Get cycle   │
│                                                action[index]│
│                                                Increment idx│
│                        │                               │    │
│                        └───────────────┬───────────────┘   │
│                                        ▼                    │
│                               Execute script                │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

### Click Attributes

| Attribute | Hex | Description |
|-----------|-----|-------------|
| ACTIVATEABLE | 0x04 | Can be clicked to activate |
| MOUSEABLE | 0x10 | Can be picked up by pointer |

```caos
* Make agent clickable
attr orwv attr 4

* Check if clickable
doif attr band 4
    * Is clickable
endi
```

---

## Collision System

Collisions occur when agents hit walls or other boundaries.

### Collision Event

When a collision occurs, script 6 runs:

```caos
* Collision script
scrp 2 1 1 6
    * _P1_ = X velocity at collision
    * _P2_ = Y velocity at collision

    * Bounce sound based on impact
    doif _p1_ abs gt 5 or _p2_ abs gt 5
        sndc "bounce"
    endi
endm
```

### Collision Properties

```javascript
myLastWallHit: number    // Direction of last wall hit
// 0 = none, 1 = left, 2 = right, 3 = top, 4 = bottom
```

### Physics Properties

These affect collision behavior:

```caos
* Elasticity (bounce factor 0-100)
elas 80    * 80% bounce

* Friction (ground friction 0-100)
fric 50    * 50% friction

* Aerodynamics (air resistance)
aero 10

* Gravity
accg 0.3   * Default gravity
```

### BHVR (Creature Permissions)

Controls what creatures can do to an agent:

```caos
* Set behavior permissions (bitmask)
bhvr 63    * All actions allowed

* Permission bits:
* Bit 0 (1):  Activate1
* Bit 1 (2):  Activate2
* Bit 2 (4):  Deactivate
* Bit 3 (8):  Hit
* Bit 4 (16): Eat
* Bit 5 (32): Pickup
```

---

## Carrying System

Agents can pick up and carry other agents.

### Carrying Properties

```javascript
_myCarrierHandle: AgentHandle    // Who is carrying me
_myCarriedHandle: AgentHandle    // What am I carrying
myMovementStatus: MovementStatus // AUTONOMOUS, CARRIED, etc.
myPickupPoints: Array            // Where to be held
myCarryPoints: Array             // Where to hold others
```

### Pickup Flow

```
┌─────────────────────────────────────────────────────────────┐
│                   PICKUP FLOW                                │
│                                                             │
│   1. Carrier initiates pickup                               │
│                        │                                    │
│                        ▼                                    │
│   2. Check target attributes                                │
│      ├── Pointer: needs MOUSEABLE (0x10)                   │
│      └── Agent: needs CARRYABLE (0x08)                     │
│                        │                                    │
│                        ▼                                    │
│   3. Execute Pickup script (event 4) on target              │
│      ├── FROM = carrier                                     │
│      └── Script can reject pickup                           │
│                        │                                    │
│                        ▼                                    │
│   4. Establish carrying relationship                        │
│      ├── target.carrier = carrier                           │
│      ├── carrier.carried = target                           │
│      └── target.movementStatus = CARRIED                    │
│                        │                                    │
│                        ▼                                    │
│   5. Target follows carrier movement                        │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

### Drop Flow

```
┌─────────────────────────────────────────────────────────────┐
│                   DROP FLOW                                  │
│                                                             │
│   1. Carrier initiates drop                                 │
│                        │                                    │
│                        ▼                                    │
│   2. Execute Drop script (event 5) on carried               │
│      └── FROM = carrier                                     │
│                        │                                    │
│                        ▼                                    │
│   3. Clear carrying relationship                            │
│      ├── target.carrier = null                              │
│      ├── carrier.carried = null                             │
│      └── target.movementStatus = FLOATING                   │
│                        │                                    │
│                        ▼                                    │
│   4. Target subject to physics again                        │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

### Carrying CAOS Commands

```caos
* Get carrier (who is holding TARG)
setv va00 carr

* Get carried agent (what TARG is holding)
setv va01 held

* Pickup points (where I want to be held)
pupt index x y
pupt 0 10 5    * Point 0 at offset (10, 5)

* Carry point
capt index x y
capt 0 20 0    * Carry at offset (20, 0)
```

### Pickup Scripts

```caos
* Pickup script - allow/reject pickup
scrp 2 1 1 4
    * Check if carrier is the pointer
    doif from eq pntr
        * Allow pickup by pointer
    else
        * Reject pickup by other agents
        stim from 5 1.0    * Punish carrier
    endi
endm

* Drop script
scrp 2 1 1 5
    * Play drop sound
    sndc "drop"

    * Apply slight bounce
    velo 0 -2
endm
```

---

## CAOS Variables

### Object Variables (OV00-OV99)

Agent-specific persistent variables:

```caos
* Set object variable
setv ov00 100
sets ov01 "hello"
seta ov02 targ    * Store agent reference

* Get object variable
outv ov00         * Output: 100
outs ov01         * Output: "hello"

* Use in conditions
doif ov00 > 50
    * Do something
endi
```

**Properties:**
- Persist with agent (saved/loaded)
- Can store numbers, strings, or agent references
- 100 variables per agent (OV00-OV99)

### Script Variables (VA00-VA99)

Local variables for current script:

```caos
* Set script variable
setv va00 50
addv va00 10
subv va00 5

* Use in loops
setv va99 10
loop
    outv va99
    subv va99 1
untl va99 = 0
```

**Properties:**
- Local to current script execution
- Reset between script runs
- Integer values only
- 100 variables (VA00-VA99)

### NAME Variables

Named variables stored on agents:

```caos
* Set named variable
name "counter" 0

* Get named variable
setv va00 name "counter"

* Store string
name "label" "My Agent"
```

---

## Control Flow

### Conditionals (DOIF/ELIF/ELSE/ENDI)

```caos
doif va00 = 100
    * Exact match
elif va00 > 50
    * Greater than 50
elif va00 <> 0
    * Not equal to 0
else
    * Default case
endi
```

### Comparison Operators

| Operator | Meaning |
|----------|---------|
| `=` | Equal |
| `<>` | Not equal |
| `<` | Less than |
| `>` | Greater than |
| `<=` | Less or equal |
| `>=` | Greater or equal |
| `bt` | Bitwise test |
| `bf` | Bitwise false |

### Logical Operators

```caos
* AND - both must be true
doif va00 > 0 and va01 > 0
    * Both positive
endi

* OR - either can be true
doif va00 = 1 or va01 = 1
    * At least one is 1
endi
```

### Loops

**LOOP/UNTL (Condition Loop):**
```caos
setv va00 5
loop
    outv va00
    subv va00 1
untl va00 = 0
* Outputs: 5 4 3 2 1
```

**REPS/REPE (Counted Loop):**
```caos
reps 3
    outs "Hello"
repe
* Outputs: Hello Hello Hello
```

**ENUM/NEXT (Agent Enumeration):**
```caos
* Loop through all agents of type 2,1,*
enum 2 1 0
    * TARG is set to each matching agent
    kill targ
next
```

### Subroutines

```caos
* Main code
setv va00 10
gsub Double
outv va00    * Outputs: 20
stop

* Subroutine definition
subr Double
    mulv va00 2
retn
```

---

## Stimulus System

Agents can send stimuli to creatures to affect their behavior.

### STIM WRIT (Direct Stimulus)

```caos
* Send stimulus directly to creature
stim writ creature 0 1.0
*         ^        ^ ^
*      target   stim strength
```

### Broadcast Stimuli

```caos
* SHOU - Shout (same metaroom, hearing range)
stim shou 0 1.0

* SIGN - Visual (line of sight)
stim sign 0 1.0

* TACT - Touch (physical contact)
stim tact 0 1.0
```

### Perception Ranges

| Type | Range | Requirement |
|------|-------|-------------|
| SHOU | ~800 pixels | Same metaroom |
| SIGN | ~512 pixels | Line of sight |
| TACT | Contact | AABB overlap |

---

## Execution Context

### Key Variables

| Variable | Description |
|----------|-------------|
| `OWNR` | Agent executing the script |
| `TARG` | Current target agent |
| `FROM` | Agent that sent message/stimulus |
| `_IT_` | Creature's attention object |
| `_P1_` | Message parameter 1 |
| `_P2_` | Message parameter 2 |

### Setting Target

```caos
* Set target to specific agent
targ agentVariable

* Set to pointer
targ pntr

* Set to owner
targ ownr

* Enumerate and target
enum 2 1 0
    * TARG now each matching agent
next
```

---

## Key Files

| File | Purpose |
|------|---------|
| `Agent.js` | Core agent with timer, messages, carrying |
| `CAOSMachine.js` | Script execution engine |
| `Scriptorium.js` | Script storage and lookup |
| `TICK.js` | Timer command |
| `MESG_WRT.js` | Message sending |
| `CLAC.js`, `CLIK.js` | Click actions |
| `BHVR.js` | Behavior permissions |
| `OVnn.js`, `VAxx.js` | Variable commands |
| `DOIF.js`, `LOOP.js` | Control flow |

---

## Related Articles

- [Agent System Overview](#/article/agents-overview) - Agent basics
- [Agent Types](#/article/agent-types) - Different agent types
- [Input & Output Ports](#/article/agent-ports) - Port communication
- [Sprites & Display System](#/article/agent-sprites) - Rendering
