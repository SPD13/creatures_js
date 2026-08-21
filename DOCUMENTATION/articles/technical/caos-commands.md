# CAOS Command Categories

CAOS has over 156 commands organized into 12 categories. This article provides a comprehensive reference of all command types.

## Command Structure

All commands follow a consistent pattern:

```javascript
{
    name: 'COMMAND',           // 4-letter mnemonic
    type: 'command',           // Command type
    category: 'category_name', // Category folder
    description: 'What it does',
    returnType: 'string|number|agent', // Optional return
    parameterTypes: [...],     // Parameter definitions

    execute(caosMachine, params, executionContext) {
        // Implementation
        return result;
    }
}
```

---

## Categories Overview

| Category | Commands | Purpose |
|----------|----------|---------|
| **agents** | 50+ | Agent manipulation |
| **creatures** | 28+ | Creature behaviors |
| **variables** | 15 | Variable operations |
| **flow** | 16 | Control flow |
| **map** | 12 | World/room system |
| **ports** | 14 | Port communication |
| **files** | 9 | File I/O |
| **world** | 6 | World management |
| **scripts** | 4 | Script control |
| **sounds** | 3 | Audio |
| **stream** | 2 | Debug output |
| **input** | 1 | Input handling |

---

## Agents Category (50+ commands)

Commands for creating, manipulating, and querying agents.

### Context Commands

| Command | Description |
|---------|-------------|
| `OWNR` | Get/set script owner |
| `TARG` | Get/set target agent |
| `FROM` | Get message sender |
| `PNTR` | Get pointer agent |
| `NULL` | Get null agent |
| `CARR` | Get carrier (who is holding TARG) |
| `HELD` | Get held agent (what TARG is holding) |

### Agent Creation

| Command | Description |
|---------|-------------|
| `NEW: SIMP` | Create simple agent |
| `NEW: COMP` | Create compound agent |
| `NEW: VHCL` | Create vehicle |
| `NEW: CREA` | Create creature |
| `KILL` | Delete target agent |

```caos
* Create a simple agent
new: simp 2 1 1 "sprite" 4 0 5000
*          ^family ^genus ^species
*                         ^gallery ^count ^base ^plane
```

### Compound Parts

| Command | Description |
|---------|-------------|
| `PAT: DULL` | Add plain part |
| `PAT: BUTT` | Add button part |
| `PAT: TEXT` | Add text part |
| `PAT: FIXD` | Add fixed text part |
| `PAT: GRPH` | Add graph part |
| `PAT: KILL` | Remove part |
| `PART` | Set active part |
| `PAT#` | Get part count |

### Position & Movement

| Command | Description |
|---------|-------------|
| `MVTO` | Move to position |
| `MVSF` | Move safely |
| `VELO` | Set velocity |
| `VELX` | Get/set X velocity |
| `VELY` | Get/set Y velocity |
| `POSX` | Get X position |
| `POSY` | Get Y position |
| `POSL` | Get left edge |
| `POSR` | Get right edge |
| `POST` | Get top edge |
| `POSB` | Get bottom edge |
| `ACCG` | Set gravity acceleration |

### Physics Properties

| Command | Description |
|---------|-------------|
| `AERO` | Aerodynamic drag |
| `ELAS` | Elasticity (bounce) |
| `FRIC` | Surface friction |
| `PERM` | Permeability |
| `FALL` | Falling state |
| `FLTO` | Float to position |

### Attributes & Properties

| Command | Description |
|---------|-------------|
| `ATTR` | Agent attributes |
| `BHVR` | Creature permissions |
| `PLNE` | Rendering plane |
| `TICK` | Timer rate |
| `CLAC` | Click action |
| `CLIK` | Click cycle |
| `IMSK` | Input mask |

### Animation

| Command | Description |
|---------|-------------|
| `ANIM` | Play animation |
| `POSE` | Set/get pose |
| `BASE` | Set base frame |
| `GALL` | Set gallery |
| `FRAT` | Frame rate |
| `OVER` | Overlay sprite |

### Messaging

| Command | Description |
|---------|-------------|
| `MESG WRIT` | Send message |
| `MESG WRT+` | Send message with delay |

```caos
* Send message 100 to TARG with params
mesg wrt+ targ 100 42 0 0
*              ^msg ^p1 ^p2 ^delay
```

---

## Creatures Category (28+ commands)

Commands for creature-specific behaviors and interactions.

### Movement

| Command | Description |
|---------|-------------|
| `WALK` | Walk/stop walking |
| `GAIT` | Set gait style |
| `APPR` | Approach target |
| `FLEE` | Flee from target |
| `TOUC` | Touch agent |

### Stimuli (4 variants each)

**STIM** - Send stimulus:
| Variant | Range |
|---------|-------|
| `STIM WRIT` | Direct to creature |
| `STIM SHOU` | Shout (hearing range) |
| `STIM SIGN` | Visual (line of sight) |
| `STIM TACT` | Touch (contact) |

**URGE** - Push toward behavior:
| Variant | Range |
|---------|-------|
| `URGE WRIT` | Direct |
| `URGE SHOU` | Shout |
| `URGE SIGN` | Visual |
| `URGE TACT` | Touch |

**SWAY** - Adjust chemicals:
| Variant | Range |
|---------|-------|
| `SWAY WRIT` | Direct |
| `SWAY SHOU` | Shout |
| `SWAY SIGN` | Visual |
| `SWAY TACT` | Touch |

```caos
* Send stimulus 5 to creature in range
stim shou 5 1.0
*         ^stim ^strength
```

### Creature Properties

| Command | Description |
|---------|-------------|
| `HAND` | Hold hands |
| `NOHH` | Stop holding hands |
| `BODY` | Body part access |
| `NUDE` | Remove costume |
| `ORDR` | Send language command |

---

## Variables Category (15 commands)

Commands for variable manipulation.

### Assignment

| Command | Description |
|---------|-------------|
| `SETV` | Set numeric variable |
| `SETS` | Set string variable |
| `SETA` | Set agent variable |
| `NEGV` | Negate variable |

```caos
setv va00 100    * Set VA00 to 100
sets va01 "hi"   * Set VA01 to "hi"
negv va00        * VA00 = -VA00
```

### Arithmetic

| Command | Description |
|---------|-------------|
| `ADDV` | Add to variable |
| `SUBV` | Subtract from variable |
| `MULV` | Multiply variable |
| `DIVV` | Divide variable |
| `MODV` | Modulo (remainder) |

```caos
setv va00 10
addv va00 5      * VA00 = 15
mulv va00 2      * VA00 = 30
divv va00 3      * VA00 = 10
modv va00 3      * VA00 = 1
```

### Functions

| Command | Description |
|---------|-------------|
| `RAND` | Random number |
| `ABS` | Absolute value |
| `SQRT` | Square root |
| `SIN` | Sine |
| `COS` | Cosine |

```caos
setv va00 rand 1 100   * Random 1-100
setv va01 abs va00     * Absolute value
```

### Special

| Command | Description |
|---------|-------------|
| `GAME` | Game variable access |
| `NAME` | Named variable access |
| `READ` | Read from catalogue |
| `REAF` | Read float from catalogue |

```caos
* Access game-wide variable
setv game "score" 1000

* Read localized string
sets va00 read "creature_names" 5
```

---

## Flow Category (16 commands)

Commands for control flow and program structure.

### Conditionals

| Command | Description |
|---------|-------------|
| `DOIF` | If condition |
| `ELIF` | Else if |
| `ELSE` | Else block |
| `ENDI` | End if |

```caos
doif va00 > 50
    outs "Greater"
elif va00 = 50
    outs "Equal"
else
    outs "Less"
endi
```

### Comparison Operators

| Operator | Meaning |
|----------|---------|
| `=` or `eq` | Equal |
| `<>` or `ne` | Not equal |
| `<` or `lt` | Less than |
| `>` or `gt` | Greater than |
| `<=` or `le` | Less or equal |
| `>=` or `ge` | Greater or equal |

### Loops

| Command | Description |
|---------|-------------|
| `LOOP` | Start loop |
| `UNTL` | Until condition (exit) |
| `REPS` | Repeat N times |
| `REPE` | Repeat end |

```caos
* Condition loop
setv va00 5
loop
    outv va00
    subv va00 1
untl va00 = 0

* Counted loop
reps 3
    outs "Hello"
repe
```

### Enumeration

| Command | Description |
|---------|-------------|
| `ENUM` | Enumerate by classifier |
| `ETCH` | Enumerate creatures |
| `NEXT` | Next in enumeration |

```caos
* Enumerate all family 2 agents
enum 2 0 0    * 0 = wildcard
    outv targ
next

* Enumerate creatures
etch
    * TARG = each creature
next
```

### Subroutines

| Command | Description |
|---------|-------------|
| `GSUB` | Call subroutine |
| `SUBR` | Define subroutine label |
| `RETN` | Return from subroutine |
| `STOP` | Stop script execution |

```caos
gsub MyFunc
stop

subr MyFunc
    outs "In subroutine"
retn
```

### Execution Control

| Command | Description |
|---------|-------------|
| `INST` | Enter instant mode |
| `SLOW` | Return to quantized mode |
| `LOCK` | Lock script |
| `UNLK` | Unlock script |

---

## Map Category (12 commands)

Commands for the world map and room system.

### Room Queries

| Command | Description |
|---------|-------------|
| `RTYP` | Get room type at position |
| `ROOM` | Get room ID at position |
| `META` | Get metaroom at position |
| `GMAP` | Get map info |
| `GRID` | Grid coordinates |

```caos
* Get room type at position
setv va00 rtyp posx posy
```

### Room Properties

| Command | Description |
|---------|-------------|
| `DOOR` | Door/connection info |
| `PERM` | Permeability between rooms |
| `RATE` | Traversal rate |
| `EMIT` | CA emission |
| `ALTR` | Alter room |

### Room Creation

| Command | Description |
|---------|-------------|
| `ADDM` | Add metaroom |
| `ADDR` | Add room |
| `DELM` | Delete metaroom |
| `DELR` | Delete room |

---

## Ports Category (14 commands)

Commands for the port-based communication system.

### Port Creation

| Command | Description |
|---------|-------------|
| `PRT: INEW` | Create input port |
| `PRT: ONEW` | Create output port |
| `PRT: IZAP` | Delete input port |
| `PRT: OZAP` | Delete output port |

### Port Communication

| Command | Description |
|---------|-------------|
| `PRT: SEND` | Send through port |
| `PRT: BANG` | Signal through port |
| `PRT: JOIN` | Connect ports |
| `PRT: KRAK` | Disconnect ports |

### Port Queries

| Command | Description |
|---------|-------------|
| `PRT: ITOT` | Input port total |
| `PRT: OTOT` | Output port total |
| `PRT: NAME` | Port name |
| `PRT: FROM` | Port source |
| `PRT: FRMA` | Port frame agent |

```caos
* Create an input port
prt: inew 0 "power" "Receives power" 10 20 100
*         ^id ^name ^desc ^x ^y ^msg

* Create an output port
prt: onew 0 "signal" "Sends signal" 50 20

* Send signal through output port
prt: send targ 0 100
*              ^port ^data
```

---

## Files Category (9 commands)

Commands for file I/O operations.

| Command | Description |
|---------|-------------|
| `FILE IOPE` | Open input file |
| `FILE OOPE` | Open output file |
| `FILE ICLO` | Close input file |
| `FILE OCLO` | Close output file |
| `FILE OFLU` | Flush output |
| `FILE JDEL` | Delete journal entry |
| `INOK` | Input OK check |
| `INNL` | Read line |
| `FVWM` | File version/mode |

---

## World Category (6 commands)

Commands for world management.

| Command | Description |
|---------|-------------|
| `NWLD` | Create new world |
| `WRLD` | World reference |
| `WNAM` | World name |
| `WNTI` | World unique ID |
| `WRMS` | World reset |
| `PSWD` | Password |

---

## Scripts Category (4 commands)

Commands for script management.

| Command | Description |
|---------|-------------|
| `SCRX` | Execute external script |
| `LOCK` | Lock script execution |
| `UNLK` | Unlock script |
| `STOP` | Stop script |

---

## Sounds Category (3 commands)

Commands for audio.

| Command | Description |
|---------|-------------|
| `SNDE` | Play sound effect |
| `SNDL` | Loop sound |
| `MMSC` | Music control |
| `RMSC` | Remove sound |

```caos
* Play sound effect
snde "click"

* Play looping sound
sndl "engine"
```

---

## Stream Category (2 commands)

Debug output commands.

| Command | Description |
|---------|-------------|
| `OUTS` | Output string |
| `OUTV` | Output value |

```caos
outs "Value is: "
outv va00
```

---

## Input Category (1 command)

| Command | Description |
|---------|-------------|
| `IMSK` | Set input mask |

---

## Command Examples

### Creating an Agent

```caos
* Create a simple agent
new: simp 2 1 1 "ball" 4 0 5000
attr 199          * Attributes
bhvr 63           * Creature permissions
tick 20           * Timer rate
mvto 500 300      * Initial position
```

### Timer Script

```caos
scrp 2 1 1 9
    * Toggle animation
    doif pose = 0
        pose 1
    else
        pose 0
    endi
endm
```

### Message Handler

```caos
scrp 2 1 1 100
    * Handle custom message
    doif _p1_ > 0
        addv ov00 _p1_
    endi

    * Reply to sender
    mesg wrt+ from 101 ov00 0 0
endm
```

### Enumeration

```caos
* Kill all agents of type 2,5,*
enum 2 5 0
    kill targ
next
```

---

## Key Files

| File | Purpose |
|------|---------|
| `commands/agents/*.js` | Agent commands |
| `commands/creatures/*.js` | Creature commands |
| `commands/variables/*.js` | Variable commands |
| `commands/flow/*.js` | Flow control |
| `CommandLoader.js` | Loads all commands |

---

## Related Articles

- [CAOS Overview](#/article/caos-overview) - Introduction to CAOS
- [CAOS Machine](#/article/caos-machine) - Virtual machine
- [Stack & Variables](#/article/caos-variables) - Variable system
- [Error Handling](#/article/caos-errors) - Debugging and errors
