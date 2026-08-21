# all bridge airlock.cos - Bridge Airlock System

**Source**: `Assets/Bootstrap/001 World/all bridge airlock.cos`

## Overview

This script implements the full Bridge Airlock system in the Bridge area of the Creatures 3 spaceship. It is the mirror counterpart of the [Engineering Airlock](all%20Engineering%20airlock.md), creating a multi-stage airlock consisting of two doors (an outer right door and an inner/center left door), a warning alarm/light indicator, a light visual effect, a light control button, and a main airlock control panel with a countdown display.

The Bridge airlock is positioned on the right side of the Bridge area, with the outer door at the rightmost position and the ship interior to the left. This is the reverse layout of the Engineering airlock: decompression ejects agents to the **right** (toward space), and the center door pushes agents to the **left** (back into the ship).

The system operates through an interconnected network of agents communicating via CAOS messages and output ports:

1. The player presses the **Airlock Control Panel** (2 12 4) to initiate the airlock cycle.
2. A **10-step countdown** begins, displayed on the control panel's digit display (part 1).
3. During countdown: the **alarm** (1 1 44) sounds, lighting changes via the **light effect** (1 1 45), and the **center door** (2 2 12) opens.
4. When the countdown reaches zero, the **outer door** (2 2 11) opens. Agents near the alarm are ejected with velocity simulating decompression.
5. The player can press the control panel again to close. A **3-step countdown** runs, after which the outer door closes (destroying anything caught in it), then the center door closes, and the alarm silences.

This script also references agents from [airlock agent.cos](airlock%20agent.md) -- specifically the airlock hazard agents (1 1 39) whose timer scan rate is adjusted when the outer door opens or closes, and dust cloud/bone particle effects (1 1 46) spawned when agents are destroyed during door closure.

## Created Agents

| Classifier | Name | Sprite | Description | Detail |
|---|---|---|---|---|
| 2 2 11 | Outer/Right Airlock Door | `bridge airlock` (10 frames) | Outer door that opens to space; toggles room permeability and link | [Detail](#outerright-airlock-door-2-2-11) |
| 1 1 44 | Alarm/Light Indicator | `bridge airlock` (2 frames, offset 10) | Warning light that loops alarm sound; handles agent ejection and destruction | [Detail](#alarmlight-indicator-1-1-44) |
| 1 1 45 | Light Visual Effect | `bridge airlock` (11 frames, offset 12) | Visual lighting effect for the airlock area | [Detail](#light-visual-effect-1-1-45) |
| 2 2 12 | Center/Inner Airlock Door | `bridge airlock` (7 frames, offset 23) | Inner door separating airlock chamber from ship interior; links rooms on both sides | [Detail](#centerinner-airlock-door-2-2-12) |
| 2 12 3 | Light Button | `airlock buttons` (4 frames) | Simple button controlling airlock lighting and center door activation | [Detail](#light-button-2-12-3) |
| 2 12 4 | Airlock Control Panel | `airlock buttons` (compound, 18 frames) | Main control panel with countdown display and activation button for the full airlock cycle | [Detail](#airlock-control-panel-2-12-4) |

---

## Spatial Layout

The agents are arranged from left to right as follows (by X position):

```
Ship Interior                                          Space (vacuum)
    |                                                       |
    |  Button   Center Door   Alarm   Light   Panel   Outer Door
    |  (2634)    (2662)      (2689)  (2778)  (3096)   (3155)
    |                                                       |
    <--- safe                                     dangerous --->
```

This is the reverse of the [Engineering Airlock](all%20Engineering%20airlock.md), where the outer door is to the left.

---

## Outer/Right Airlock Door (2 2 11)

The outer airlock door positioned at the right side of the airlock chamber. When activated, it opens to expose the airlock to space. It manages room door permeability and creature pathfinding links to control passage. On opening, it activates the airlock hazard agents (1 1 39) for frequent scanning; on closing, it slows them back down.

### Bootstrap Configuration

| Property | Value | Notes |
|---|---|---|
| Sprite | `bridge airlock` | 10 images, first image 0, 6 planes |
| Position | (3155, 3834) | Right side of the Bridge airlock |
| `attr` | 4 | Mouseclickable |
| `perm` | 60 | Moderate physical permeability |
| `clac` | 0 | Default click action |
| `elas` | 10 | Low elasticity |
| `aero` | 5 | Air resistance |
| `accg` | 4 | Gravitational acceleration |
| `ov70` | 255 | Light level (fully lit) |
| Room Link | Left side linked at permeability 100 | Creatures can initially pathfind through |

### Key Variables

| Variable | Purpose |
|---|---|
| `ov00` | Door state: 0 = closed, 1 = open |
| `ov70` | Light level (255 = lit, 0 = dark) |

### Events

| Event | Number | Description |
|---|---|---|
| Custom (Toggle) | 1000 | Opens or closes the outer door; manages room links and airlock agent scanning |
| Custom (Hold Open) | 1001 | Waits for animation to complete, then displays the open frame |
| Timer | 9 | Periodically sends ov70 light level to the Airlock Control Panel (2 12 4) |

---

## Alarm/Light Indicator (1 1 44)

A warning indicator positioned inside the airlock chamber. It toggles an alarm sound and visual state, and is also responsible for ejecting or destroying agents when the airlock doors operate. It uses the same `bridge airlock` sprite sheet (frames 10-11).

### Bootstrap Configuration

| Property | Value | Notes |
|---|---|---|
| Sprite | `bridge airlock` | 2 images, first image 10, 2 planes |
| Position | (2689, 3837) | Inside the airlock chamber |
| `attr` | 4 | Mouseclickable |
| `perm` | 60 | Moderate physical permeability |
| `ov70` | 255 | Light level |
| Animation | [1] | Initial frame (inactive) |

### Key Variables

| Variable | Purpose |
|---|---|
| `ov00` | Alarm state: 0 = off, 1 = on |
| `ov01` | Counter incremented each time event 1002 fires |

### Events

| Event | Number | Description |
|---|---|---|
| Custom (Toggle Alarm) | 1000 | Toggles alarm sound and visual indicator on/off |
| Custom (Eject Agents) | 1001 | Ejects overlapping agents with velocity when outer door opens |
| Custom (Destroy Agents) | 1002 | Destroys agents caught in the airlock when outer door closes |

---

## Light Visual Effect (1 1 45)

A visual lighting effect positioned inside the airlock chamber. It toggles between lit and dark animation states when toggled by the control panel. This agent has no physics and is not clickable -- it is purely a visual indicator.

This agent is unique to the Bridge airlock and has no counterpart in the [Engineering Airlock](all%20Engineering%20airlock.md).

### Bootstrap Configuration

| Property | Value | Notes |
|---|---|---|
| Sprite | `bridge airlock` | 11 images, first image 12, 4 planes |
| Position | (2778, 3852) | Inside the airlock chamber |
| `attr` | 0 | Not interactive, no physics |
| `perm` | 60 | Moderate physical permeability |
| `clac` | -1 | Not clickable |
| Animation | [5] | Initial frame |

### Key Variables

| Variable | Purpose |
|---|---|
| `ov00` | Light state: 0 = dark, 1 = lit |

### Events

| Event | Number | Description |
|---|---|---|
| Custom (Toggle) | 1000 | Toggles light animation between lit and dark states |

---

## Center/Inner Airlock Door (2 2 12)

The inner door of the airlock chamber, separating it from the ship interior. It manages room door permeability on both its left and right sides. When closing, it pushes overlapping agents to the left (back into the ship).

### Bootstrap Configuration

| Property | Value | Notes |
|---|---|---|
| Sprite | `bridge airlock` | 7 images, first image 23, 6 planes |
| Position | (2662, 3838) | Left/inner side of the airlock chamber |
| `attr` | 4 | Mouseclickable |
| `perm` | 60 | Moderate physical permeability |
| `ov70` | 255 | Light level |
| Animation | [0] | Initial closed frame |
| Room Links | Both left and right linked at permeability 100 | Creatures can initially pathfind through |

### Key Variables

| Variable | Purpose |
|---|---|
| `ov00` | Door state: 0 = closed, 1 = open |

### Events

| Event | Number | Description |
|---|---|---|
| Custom (Toggle) | 1000 | Opens or closes the center door; manages both-side room links |
| Custom (Reset Closed) | 1002 | Resets door to closed animation frame |

---

## Light Button (2 12 3)

A simple button that controls the airlock area lighting and the center door. It has an input/output port system for integration with the wiring/CA network. When toggled, it activates or deactivates the center door (2 2 12).

### Bootstrap Configuration

| Property | Value | Notes |
|---|---|---|
| Sprite | `airlock buttons` | 4 images, first image 3, 4 planes |
| Position | (2634, 3946) | Near the airlock controls, ship interior side |
| `attr` | 4 | Mouseclickable |
| `ov70` | 255 | Light level (fully lit initially) |
| Animation | [0] | Initial state (lights on) |
| Input Port 0 | "door activation" / "activation" | Receives activation signals (at pixel 12,37, range 1000) |
| Output Port 0 | "door throughput" / "throughput" | Sends throughput signals (at pixel 12,26) |

### Key Variables

| Variable | Purpose |
|---|---|
| `ov00` | Button state: 0 = lights on, 1 = lights off |
| `ov70` | Light level: 255 = on, 0 = off |

### Events

| Event | Number | Description |
|---|---|---|
| Activate 1 | 1 | Player clicks -- plays "map1" sound and sends self message 1000 |
| Custom (Toggle) | 1000 | Toggles light state; sends port signal and activates/deactivates center door |

---

## Airlock Control Panel (2 12 4)

The main compound agent controlling the full airlock cycle. It features a multi-part display with a countdown digit, an activation button, and status indicators. The control panel orchestrates the entire airlock sequence by messaging the other agents in the correct order with timed delays.

### Bootstrap Configuration

| Property | Value | Notes |
|---|---|---|
| Sprite | `airlock buttons` | 18 images, first image 7, 4 planes |
| Position | (3096, 3912) | Near the outer door |
| `attr` | 4 | Mouseclickable |
| `ov70` | 255 | Light level |
| `ov01` | -1 | Countdown value (negative = idle/ready) |
| Input Port 0 | "door activation" | Receives door activation signals (at pixel 17,68, range 1000) |
| Output Port 0 | "throughput" | Sends throughput signals (at pixel 34,67) |

### Parts

| Part | Type | Sprite | Description |
|---|---|---|---|
| 0 | Main body | `airlock buttons` (frame 7) | Panel background |
| 1 | Dull display | `airlock buttons` (9 frames, offset 0) | Countdown digit display (poses 0-9) |
| 2 | Button | `airlock buttons` (frame 21, 4 frames for animation) | Clickable activation button |
| 3 | Dull indicator | `airlock buttons` (frame 29, at 12,62) | Status indicator |
| 4 | Dull indicator | `airlock buttons` (frame 30, at 28,62) | Status indicator |

### Key Variables

| Variable | Purpose |
|---|---|
| `ov00` | Panel state: 0 = inactive, 1 = active (airlock cycling) |
| `ov01` | Countdown value: 10 for activation, 3 for deactivation; negative = ready |
| `ov70` | Light level: 255 = lit, 0 = dark |

### Events

| Event | Number | Description |
|---|---|---|
| Activate 1 | 1 | Player clicks -- plays "map1" sound and sends self message 1000 |
| Custom (Toggle) | 1000 | Initiates activation or deactivation cycle with countdown |
| Timer | 9 | Countdown timer -- decrements display and triggers end-of-countdown actions |
| Custom (Placeholder) | 2000 | Empty handler (reserved) |

---

## Full Script with Inline Comments

### Installation Script (iscr)

```caos
iscr

* ============================================================
* AGENT 1: Outer/Right Airlock Door (2 2 11)
* ============================================================
new: simp 2 2 11 "bridge airlock" 10 0 6
                                    * Create simple agent: family 2, genus 2, species 11
                                    * Sprite "bridge airlock", 10 images, first image 0, 6 planes
attr 4                              * Mouseclickable
perm 60                             * Moderate physical permeability
clac 0                              * Default click action (sends activate 1)
elas 10                             * Low elasticity (10%)
tick 0                              * No timer initially
aero 5                              * Air resistance factor
accg 4                              * Gravitational acceleration
setv ov70 255                       * Light level = 255 (fully lit)
mvto 3155 3834                      * Position at right side of Bridge airlock

link grap posx posy grid targ left 100
                                    * Link the room containing this agent to the room
                                    * on its left at permeability 100 (full creature pathfinding)


* ============================================================
* AGENT 2: Alarm/Light Indicator (1 1 44)
* ============================================================
new: simp 1 1 44 "bridge airlock" 2 10 2
                                    * Create simple agent: family 1, genus 1, species 44
                                    * Sprite "bridge airlock", 2 images, first image 10, 2 planes
attr 4                              * Mouseclickable
perm 60                             * Moderate physical permeability
clac 0                              * Default click action
elas 10                             * Low elasticity
tick 0                              * No timer initially
aero 5                              * Air resistance
accg 4                              * Gravity
setv ov70 255                       * Light level = 255 (fully lit)
mvto 2689 3837                      * Position inside the airlock chamber
anim [1]                            * Set to frame 1 (inactive indicator)


* ============================================================
* AGENT 3: Light Visual Effect (1 1 45)
* ============================================================
new: simp 1 1 45 "bridge airlock" 11 12 4
                                    * Create simple agent: family 1, genus 1, species 45
                                    * Sprite "bridge airlock", 11 images, first image 12, 4 planes
attr 0                              * No attributes (not interactive, no physics)
perm 60                             * Moderate physical permeability
clac -1                             * Not clickable
elas 10                             * Low elasticity
tick 0                              * No timer
aero 5                              * Air resistance (won't apply as attr=0)
accg 4                              * Gravity (won't apply as attr=0)
mvto 2778 3852                      * Position inside the airlock chamber
anim [5]                            * Initial frame 5


* ============================================================
* AGENT 4: Center/Inner Airlock Door (2 2 12)
* ============================================================
new: simp 2 2 12 "bridge airlock" 7 23 6
                                    * Create simple agent: family 2, genus 2, species 12
                                    * Sprite "bridge airlock", 7 images, first image 23, 6 planes
attr 4                              * Mouseclickable
perm 60                             * Moderate physical permeability
clac 0                              * Default click action
elas 10                             * Low elasticity
tick 0                              * No timer
aero 5                              * Air resistance
accg 4                              * Gravity
setv ov70 255                       * Light level = 255 (fully lit)
mvto 2662 3838                      * Position at inner/left side of the airlock
anim [0]                            * Initial closed frame

link grap posx posy grid targ rght 100
                                    * Link room to the right at full permeability
link grap posx posy grid targ left 100
                                    * Link room to the left at full permeability


* ============================================================
* AGENT 5: Light Button (2 12 3)
* ============================================================
new: simp 2 12 3 "airlock buttons" 4 3 4
                                    * Create simple agent: family 2, genus 12, species 3
                                    * Sprite "airlock buttons", 4 images, first image 3, 4 planes
attr 4                              * Mouseclickable
perm 60                             * Moderate physical permeability
clac 0                              * Default click action
elas 10                             * Low elasticity
tick 0                              * No timer
aero 5                              * Air resistance
accg 4                              * Gravity
setv ov70 255                       * Light level = 255 (fully lit)
mvto 2634 3946                      * Position near controls, ship interior side
anim [0]                            * Initial frame (lights on)
prt: inew 0 "door activation" "activation" 12 37 1000
                                    * Create input port 0: "door activation", at pixel (12,37), range 1000
prt: onew 0 "door throughput" "throughput" 12 26
                                    * Create output port 0: "door throughput", at pixel (12,26)


* ============================================================
* AGENT 6: Airlock Control Panel (2 12 4) - Compound Agent
* ============================================================
new: comp 2 12 4 "airlock buttons" 18 7 4
                                    * Create compound agent: family 2, genus 12, species 4
                                    * Sprite "airlock buttons", 18 images, first image 7, 4 planes
attr 4                              * Mouseclickable
perm 60                             * Moderate physical permeability
clac 0                              * Default click action
elas 10                             * Low elasticity
tick 0                              * No timer
aero 5                              * Air resistance
accg 4                              * Gravity
setv ov70 255                       * Light level = 255 (fully lit)
setv ov01 -1                        * Countdown idle (negative = ready for activation)
mvto 3096 3912                      * Position near the outer door
part 0                              * Select part 0 (main body)
anim [0]                            * Initial frame
pat: dull 1 "airlock buttons" 9 0 0 0
                                    * Part 1: dull display, "airlock buttons" sprite,
                                    * 9 frames for digits 0-9, at offset (0,0) from part 0
part 1                              * Select part 1 (digit display)
anim [10]                           * Initial pose (blank/off - frame 10 is beyond digit range)
pat: butt 2 "airlock buttons" 21 4 9 30 0 [] 1000 0
                                    * Part 2: button, sprite at frame 21, 4 frames,
                                    * at offset (9,30), sends message 1000 when clicked
part 2                              * Select part 2 (button)
anim [1]                            * Initial button frame
pat: dull 3 "airlock buttons" 29 12 62 0
                                    * Part 3: dull indicator at offset (12,62)
pat: dull 4 "airlock buttons" 30 28 62 0
                                    * Part 4: dull indicator at offset (28,62)
prt: inew 0 "door activation" "door activation" 17 68 1000
                                    * Create input port 0: at pixel (17,68), range 1000
prt: onew 0 "throughput" "throughput" 34 67
                                    * Create output port 0: at pixel (34,67)

endm
```

### Event Script: Outer Door Toggle (2 2 11, Event 1000)

Toggles the outer/right airlock door open or closed. Manages room door permeability, creature pathfinding links, airlock hazard agent scan rates, and communicates with the alarm.

```caos
scrp 2 2 11 1000
    inst                            * Execute without interruption
    tick 0                          * Stop any running timer

    doif ov00 = 0                   * If door is currently closed...
        setv ov00 1                 * Set door state to open

        snde "dor1"                 * Play door opening sound effect
        anim [1 2 3 4 5 6 7 8]     * Animate door opening sequence (8 frames)
        setv va50 posx              * Save current X position
        setv va51 posy              * Save current Y position
        setv va90 grap posx posy    * Get the room ID at the door's position (using GRAP)

        setv va92 grid ownr left    * Get room ID to the LEFT of this door

        door va90 va92 100          * Set physical door permeability to 100 (passable)
                                    * between current room and left room
        link va90 va92 0            * Block creature pathfinding (0 = impassable)
                                    * to prevent creatures from walking into space
        rtar 1 1 44                 * Target the alarm agent
        mesg writ targ 1001         * Send message 1001 to alarm (trigger agent ejection)
        targ ownr                   * Reset target back to self
        enum 1 1 39                 * Enumerate all airlock hazard agents (from airlock agent.cos)
            tick 1                  * Set them to rapid scanning (every 1 tick)
        next
        targ ownr                   * Reset target back to self
        over                        * Wait for door opening animation to complete
        tick 60                     * Start timer for periodic light level updates

    else                            * Door is currently open, close it...
        rtar 1 1 44                 * Target the alarm agent
        mesg writ targ 1002         * Send message 1002 to alarm (trigger agent destruction)
        targ ownr                   * Reset target back to self
        setv ov00 0                 * Set door state to closed
        snde "dor1"                 * Play door closing sound effect
        anim [8 7 6 5 4 3 2 1 0]   * Animate door closing sequence (reverse)
        setv va50 posx              * Save current X position
        setv va51 posy              * Save current Y position
        setv va90 grap posx posy    * Get the room ID at the door's position

        setv va92 grid ownr left    * Get room ID to the LEFT

        door va90 va92 0            * Block physical door (0 = impassable)
        link va90 va92 100          * Restore creature pathfinding (100 = fully passable)
        over                        * Wait for door closing animation to complete
        enum 1 1 39                 * Enumerate all airlock hazard agents
            tick 250                * Slow them down to normal scan rate (every 250 ticks)
        next
        targ ownr                   * Reset target back to self

    endi

endm
```

### Event Script: Outer Door Timer (2 2 11, Event 9)

Periodically sends the current light level (ov70) to the Airlock Control Panel so it stays synchronized.

```caos
scrp 2 2 11 9
    rtar 2 12 4                     * Target the Airlock Control Panel
    mesg wrt+ targ 1000 ov70 0 0    * Send message 1000 with ov70 (light level) as _p1_
endm
```

### Event Script: Outer Door Hold Open (2 2 11, Event 1001)

Waits for any pending animation to finish, then sets the open frame.

```caos
scrp 2 2 11 1001
    over                            * Wait for current animation to complete
    anim [1]                        * Show frame 1 (open state)
endm
```

### Event Script: Alarm Toggle (1 1 44, Event 1000)

Toggles the alarm indicator and looping alarm sound on or off.

```caos
scrp 1 1 44 1000
    doif ov00 = 0                   * If alarm is currently off...
        sndl "alrm"                 * Start looping alarm sound
        anim [0]                    * Show active indicator frame (frame 0)
        setv ov00 1                 * Set alarm state to on
    else                            * Alarm is currently on...
        fade                        * Fade out the alarm sound
        anim [1]                    * Show inactive indicator frame (frame 1)
        setv ov00 0                 * Set alarm state to off
    endi
endm
```

### Event Script: Alarm Eject Agents (1 1 44, Event 1001)

Triggered when the outer door opens. Simulates decompression by ejecting overlapping agents to the right (toward space). Creatures are killed immediately; other physics-enabled agents are launched with velocity.

```caos
scrp 1 1 44 1001

    inst                            * Execute without interruption
    snde "poyy"                     * Play decompression/whoosh sound
    etch 0 0 0                      * Enumerate all agents touching this agent
        doif targ <> null and carr <> game "c3_inventory"
                                    * Skip null targets and agents held by inventory

            doif fmly = 4           * If target is a creature (family 4)...
                dead                * Trigger creature death state
            endi

            setv va00 attr          * Read target's attribute flags
            andv va00 32            * Check bit 5 (suffers physics / invulnerable flag)
            doif va00 = 0           * If NOT invulnerable (bit 5 clear)...
                setv va01 attr      * Read target's attribute flags again
                andv va01 3         * Check bits 0+1 (carryable + pushable = physics enabled)
                doif va01 <> 0      * If agent has physics enabled...
                    aero 0          * Remove air resistance (float freely in vacuum)
                    fric 0          * Remove friction
                    elas 100        * Full elasticity (bounce off walls)
                    velo 50 -20     * Eject rightward and upward (toward space)
                                    * Note: positive X = rightward, matching Bridge layout
                                    * (Engineering airlock uses -50 for leftward ejection)
                endi
            endi

        endi
    next
endm
```

### Event Script: Alarm Destroy Agents (1 1 44, Event 1002)

Triggered when the outer door closes. Crushes/destroys anything caught in the airlock, spawning dust cloud and bone particle effects. Identical in logic to the [Engineering Airlock](all%20Engineering%20airlock.md) alarm's event 1002 and the [Airlock Agent](airlock%20agent.md) timer script.

```caos
scrp 1 1 44 1002
    inst                            * Execute without interruption
    lock                            * Prevent script interruption by other messages
    addv ov01 1                     * Increment destruction counter
    etch 0 0 0                      * Enumerate all agents touching this agent
        doif targ <> null and carr <> game "c3_inventory"
                                    * Skip null targets and agents held by inventory
            setv va55 attr          * Read target's attribute flags
            andv va55 3             * Check bits 0+1 (physics enabled)
            doif targ <> ownr and va55 <> 0 and carr = null
                                    * Skip self, non-physics agents, and carried agents
                doif fmly <> 1      * Skip family 1 (scenery, tools, GUI elements)

                    doif fmly = 2 and gnus = 1
                                    * Skip family 2, genus 1 (simple critter/food objects)
                    else
                        doif fmly = 4
                                    * If target is a creature (family 4)...
                            velo 0 -10
                                    * Give slight upward velocity
                            setv va00 posx
                                    * Save creature's X position
                            setv va01 post
                                    * Save creature's top Y position
                            dead    * Trigger creature death state
                            kill targ
                                    * Remove the creature agent
                            setv va66 1
                                    * Flag: spawn bone particles
                        else        * Other destroyable agent (not creature, not family 1, not 2/1)
                            setv va00 posx
                                    * Save agent's X position
                            setv va01 post
                                    * Save agent's top Y position
                            kill targ
                                    * Remove the agent
                            setv va66 0
                                    * Flag: no bone particles
                        endi

                        * --- Spawn 10 dust cloud particles ---
                        reps 10
                            setv va02 rand 0 0
                                    * Random value (always 0, possibly placeholder)
                            mulv va02 0
                                    * Multiply by 0 (result always 0)
                            new: simp 1 1 46 "dust cloud" 4 8 1000
                                    * Create dust cloud particle:
                                    * family 1, genus 1, species 46
                                    * 4 frames, first image 8, plane 1000
                            doif tmvt va00 va01 <> 1
                                    * Test if the particle can be placed at saved position
                                kill targ
                                    * If position is invalid, destroy the particle
                                stop
                                    * Stop this iteration
                            endi
                            mvto va00 va01
                                    * Move particle to the destroyed agent's position
                            setv vely rand -5 5
                                    * Random vertical velocity
                            setv velx rand -5 5
                                    * Random horizontal velocity
                            attr 192
                                    * Suffers physics + suffers collisions (bits 6+7)
                            accg 0.1
                                    * Very light gravity (particles drift downward slowly)
                            elas 100
                                    * Full elasticity (particles bounce)
                            anim [0 1 2 3]
                                    * 4-frame puff animation
                            tick rand 30 40
                                    * Self-destruct timer (30-40 ticks)
                        repe

                        * --- Spawn 8 bone particles if creature was destroyed ---
                        doif va66 = 1
                            reps 8
                                setv va02 rand 0 0
                                    * Random value (always 0, placeholder)
                                mulv va02 0
                                    * Result always 0
                                new: simp 1 1 46 "bone" 12 0 1000
                                    * Create bone particle:
                                    * family 1, genus 1, species 46
                                    * 12 frames, first image 0, plane 1000
                                doif tmvt va00 va01 <> 1
                                    * Test if particle can be placed at saved position
                                    kill targ
                                    * If invalid, destroy
                                    stop
                                endi
                                mvto va00 va01
                                    * Move to destroyed creature's position
                                setv vely rand -5 5
                                    * Random vertical velocity
                                setv velx rand -5 5
                                    * Random horizontal velocity
                                attr 192
                                    * Suffers physics + suffers collisions
                                accg 0
                                    * No gravity (bones float in zero-G vacuum)
                                elas 100
                                    * Full elasticity
                                anim [0 1 2 3 4 5 6 7 8 9 10 11 255]
                                    * 12-frame tumbling animation (255 = stop)
                                tick rand 50 60
                                    * Self-destruct timer (50-60 ticks)
                            repe
                        endi
                    endi
                endi
            endi
        endi
    next
    unlk                            * Release script lock
endm
```

### Event Script: Light Effect Toggle (1 1 45, Event 1000)

Toggles the light visual effect between lit and dark animation states.

```caos
scrp 1 1 45 1000
    doif ov00 = 0                   * If currently dark...
        anim [6 7 8 9 10 255]       * Play light-on animation sequence (255 = stop at last frame)
        setv ov00 1                 * Set state to lit
    else                            * Currently lit...
        anim [5]                    * Set to dark frame (frame 5)
        setv ov00 0                 * Set state to dark
    endi
endm
```

### Event Script: Center Door Toggle (2 2 12, Event 1000)

Toggles the center/inner door open or closed. When closing, pushes overlapping agents to the left (back into the ship interior). Manages room door permeability and pathfinding links on both sides.

```caos
scrp 2 2 12 1000
    doif ov00 = 0                   * If door is currently closed...
        snde "stm1"                 * Play steam/hydraulic sound
        anim [0 2 3 4 5]            * Animate door opening (skips frame 1)
        setv va50 posx              * Save X position
        setv va51 posy              * Save Y position
        setv va90 grap posx posy    * Get room ID at door's position
        setv va91 grid ownr rght    * Get room ID to the RIGHT
        setv va92 grid ownr left    * Get room ID to the LEFT
        inst                        * Execute following instantly
        door va90 va91 100          * Open physical passage to the right
        door va90 va92 100          * Open physical passage to the left
        link va90 va91 0            * Block creature pathfinding right (into airlock)
        link va90 va92 0            * Block creature pathfinding left (into ship)
        slow                        * Resume normal execution speed
        setv ov00 1                 * Set door state to open

    elif ov00 <> 0                  * Door is currently open, close it...
        snde "stm1"                 * Play steam/hydraulic sound
        inst                        * Execute following instantly
        etch 0 0 0                  * Enumerate all touching agents
            doif targ <> null       * Skip null targets
                setv va55 attr      * Read target's attribute flags
                andv va55 3         * Check bits 0+1 (physics enabled)
                doif va55 <> 0      * If agent has physics...
                    velo -30 -10    * Push agent LEFT and upward (back into ship interior)
                                    * Note: negative X = leftward, matching Bridge layout
                                    * (Engineering airlock uses +30 for rightward push)
                endi
            endi
        next
        slow                        * Resume normal execution
        anim [5 4 3 2 0]            * Animate door closing (reverse, skips frame 1)
        setv va50 posx              * Save X position
        setv va51 posy              * Save Y position
        setv va90 grap posx posy    * Get room ID at door's position
        setv va91 grid ownr rght    * Get room ID to the RIGHT
        setv va92 grid ownr left    * Get room ID to the LEFT
        inst                        * Execute following instantly
        door va90 va91 0            * Block physical passage to the right
        door va90 va92 0            * Block physical passage to the left
        link va90 va91 100          * Restore creature pathfinding right
        link va90 va92 100          * Restore creature pathfinding left
        slow                        * Resume normal execution
        setv ov00 0                 * Set door state to closed

        rtar 2 12 4                 * Target the Airlock Control Panel
        setv va00 ov00              * Read control panel's ov00 (panel state: 0=inactive, 1=active)
        targ ownr                   * Reset target back to self (center door)
        doif va00 = 1               * If control panel is still in active state...
            over                    * Wait for closing animation to complete
            anim [1]                * Show partially open/ready frame
                                    * (indicates the airlock cycle is still in progress)
        endi
    endi
    over                            * Wait for any remaining animation

endm
```

### Event Script: Center Door Reset (2 2 12, Event 1002)

Resets the center door to the fully closed animation frame.

```caos
scrp 2 2 12 1002
    over                            * Wait for any current animation to finish
    anim [0]                        * Show fully closed frame
endm
```

### Event Script: Light Button Activate (2 12 3, Event 1)

Player clicks the light button. Plays a sound and sends a toggle message to itself.

```caos
scrp 2 12 3 1
    snde "map1"                     * Play button click sound
    mesg wrt+ ownr 1000 ov70 0 0   * Send message 1000 to self with ov70 (light level) as _p1_
endm
```

### Event Script: Light Button Toggle (2 12 3, Event 1000)

Toggles the light button state, sends a port signal, and activates or deactivates the center door (2 2 12).

```caos
scrp 2 12 3 1000

    doif ov00 = 0 and ov70 <> 0    * If lights are currently ON (ov00=0, ov70=255)...
        setv ov00 1                 * Set button state to "off"
        setv ov70 0                 * Set light level to 0 (dark)
        anim [1]                    * Show "lights off" frame

        prt: send 0 255            * Send value 255 on output port 0
        rtar 2 2 12                * Target the center door
        seta va88 targ             * Save reference to center door

        targ ownr                  * Reset target to self
        mesg writ va88 1000        * Send toggle message 1000 to center door (opens it)

    elif ov00 <> 0 and ov70 = 0    * If lights are currently OFF (ov00=1, ov70=0)...
        setv ov00 0                 * Set button state to "on"
        setv ov70 255               * Set light level to 255 (lit)
        anim [0]                    * Show "lights on" frame

        prt: send 0 0              * Send value 0 on output port 0
        rtar 2 2 12                * Target the center door
        seta va88 targ             * Save reference to center door

        targ ownr                  * Reset target to self
        mesg writ va88 1000        * Send toggle message 1000 to center door (closes it)
    endi
endm
```

### Event Script: Control Panel Activate (2 12 4, Event 1)

Player clicks the control panel. Plays a sound and sends a toggle message to itself.

```caos
scrp 2 12 4 1
    snde "map1"                     * Play button click sound
    mesg wrt+ ownr 1000 ov70 0 0   * Send message 1000 to self with ov70 (light level) as _p1_
endm
```

### Event Script: Control Panel Toggle (2 12 4, Event 1000)

Initiates the activation or deactivation cycle of the full airlock system. On activation, starts a 10-step countdown and messages all airlock components. On deactivation, starts a 3-step countdown and closes the outer door.

```caos
scrp 2 12 4 1000
    inst                            * Execute without interruption
    part 2                          * Select part 2 (button)
    anim [3]                        * Show button pressed animation

    doif ov00 = 0 and _p1_ <> 0 and ov01 < 0
                                    * ACTIVATION condition:
                                    * Panel is inactive (ov00=0),
                                    * lights are on (_p1_ = ov70 != 0),
                                    * countdown is idle (ov01 < 0)
        clac -1                     * Disable clicking on this panel
        setv ov00 1                 * Set panel state to active
        setv ov70 0                 * Set light level to dark

        setv ov01 10                * Initialize 10-step countdown

        doif ov00 = 1               * Safety check (always true at this point)

            prt: send 0 255         * Send 255 on output port 0

            * --- Toggle light button if needed ---
            rtar 2 12 3             * Target the light button
            seta va88 targ          * Save reference
            setv va00 ov00          * Read light button's ov00 (state)
            clac -1                 * Disable clicking on light button
            targ ownr               * Reset target to self
            doif va00 <> 0          * If light button's ov00 is nonzero (lights already off)
                mesg writ va88 1000 * Send toggle to light button
                                    * Note: this condition appears inverted compared to the
                                    * expected behavior of "toggle lights off if currently on"
                                    * It may be intentional to handle an edge case or may be
                                    * a quirk of the original script
            endi

            * --- Toggle light visual effect ---
            rtar 1 1 45             * Target the light visual effect
            seta va88 targ          * Save reference

            targ ownr               * Reset target to self
            mesg writ va88 1000     * Send toggle to light effect (turns lighting off)

            * --- Activate alarm ---
            rtar 1 1 44             * Target the alarm
            seta va88 targ          * Save reference

            targ ownr               * Reset target to self
            mesg writ va88 1000     * Send toggle to alarm (activates it)

            * --- Send hold-open to outer door ---
            rtar 2 2 11             * Target the outer door
            seta va88 targ          * Save reference

            targ ownr               * Reset target to self
            mesg writ va88 1001     * Send message 1001 to outer door (hold open animation)

            * --- Send hold-open to center door ---
            rtar 2 2 12             * Target the center door
            seta va88 targ          * Save reference

            targ ownr               * Reset target to self
            mesg writ va88 1001     * Send message 1001 to center door
                                    * Note: there is no event 1001 handler defined for the
                                    * center door (2 2 12) in this script, so this message
                                    * has no effect. Possibly vestigial from development.

            tick 1                  * Start countdown timer (fires event 9 every tick)
        else
            targ ownr               * Reset target (fallback)
        endi

    elif ov00 <> 0 and _p1_ = 0 and ov01 < 0
                                    * DEACTIVATION condition:
                                    * Panel is active (ov00!=0),
                                    * lights are off (_p1_ = ov70 = 0),
                                    * countdown is idle (ov01 < 0)
        lock                        * Prevent script interruption
        clac -1                     * Disable clicking on panel
        setv ov00 0                 * Set panel state to inactive
        setv ov70 255               * Set light level to lit

        setv ov01 3                 * Initialize 3-step countdown
        prt: send 0 0              * Send 0 on output port 0
        wait 5                      * Wait 5 ticks before proceeding

        * --- Close the outer door ---
        rtar 2 2 11                 * Target the outer door
        seta va88 targ              * Save reference

        targ ownr                   * Reset target to self
        mesg writ va88 1000         * Send toggle message to outer door (closes it)

        unlk                        * Release script lock
        tick 1                      * Start countdown timer
    endi

endm
```

### Event Script: Control Panel Countdown Timer (2 12 4, Event 9)

Runs the countdown sequence. Each tick decrements the digit display. When the countdown reaches zero, triggers the final actions (opening outer door for activation, or restoring all components for deactivation).

```caos
scrp 2 12 4 9
    inst                            * Execute without interruption
    lock                            * Prevent script interruption
    tick 10                         * Set next timer tick to 10 game ticks
    part 1                          * Select part 1 (digit display)
    pose ov01                       * Show current countdown digit
    subv ov01 1                     * Decrement countdown

    doif ov01 < 0                   * Countdown has reached zero...

        doif ov00 = 1               * ACTIVATION complete (panel is active)
            tick 0                  * Stop the timer
            unlk                    * Release script lock

            * --- Open the outer door ---
            rtar 2 2 11             * Target the outer door
            seta va88 targ          * Save reference

            targ ownr               * Reset target to self
            mesg writ va88 1000     * Send toggle message (opens outer door)

            part 2                  * Select part 2 (button)
            anim [0]                * Reset button to idle appearance


        else                        * DEACTIVATION complete (panel is inactive, ov00=0)
            lock                    * Ensure script lock is held
            tick 0                  * Stop the timer

            * --- Toggle alarm off ---
            rtar 1 1 44             * Target the alarm
            seta va88 targ          * Save reference

            targ ownr               * Reset target to self
            mesg writ va88 1000     * Toggle alarm off

            * --- Toggle light effect back on ---
            rtar 1 1 45             * Target the light visual effect
            seta va88 targ          * Save reference

            targ ownr               * Reset target to self
            mesg writ va88 1000     * Toggle light effect back to lit

            * --- Reset center door to closed ---
            rtar 2 2 12             * Target the center door
            seta va88 targ          * Save reference

            targ ownr               * Reset target to self
            mesg writ va88 1002     * Send reset message to center door

            * --- Reset light button ---
            rtar 2 12 3             * Target the light button
            seta va88 targ          * Save reference
            clac 0                  * Re-enable clicking on light button
            targ ownr               * Reset target to self

            mesg wrt+ va88 1000 0 0 0
                                    * Send toggle message to light button with _p1_=0
                                    * This causes the light button to turn lights back on

            part 2                  * Select part 2 (button)
            anim [1]                * Show deactivated button appearance
            slow                    * Resume normal execution speed
            wait 20                 * Wait 20 ticks before re-enabling
            clac 0                  * Re-enable clicking on this panel
            unlk                    * Release script lock
        endi
    endi
endm
```

### Event Script: Control Panel Placeholder (2 12 4, Event 2000)

Empty handler, reserved for future use or external messaging.

```caos
scrp 2 12 4 2000
endm
```

### Removal Script (rscr)

Cleans up all Bridge airlock agents and removes their event scripts when the COS file is unloaded.

```caos
rscr

* --- Remove Light Buttons (2 12 3) ---
enum 2 12 3
    kill targ                       * Destroy each light button
next

* --- Remove Center Doors (2 2 12) ---
enum 2 2 12
    kill targ                       * Destroy each center door
next

* --- Remove Light Button scripts ---
scrx 2 12 3 1                      * Remove activate event
scrx 2 12 3 2                      * Remove push event
scrx 2 12 3 4                      * Remove pickup event
scrx 2 12 3 5                      * Remove drop event
scrx 2 12 3 9                      * Remove timer event
scrx 2 12 3 1000                   * Remove custom toggle event
scrx 2 12 3 2000                   * Remove placeholder event

* --- Remove Control Panel agents (2 12 4) ---
enum 2 12 4
    kill targ                       * Destroy each control panel
next

* --- Remove Control Panel scripts ---
scrx 2 12 4 1                      * Remove activate event
scrx 2 12 4 2                      * Remove push event
scrx 2 12 4 4                      * Remove pickup event
scrx 2 12 4 5                      * Remove drop event
scrx 2 12 4 9                      * Remove timer event
scrx 2 12 4 1000                   * Remove custom toggle event
scrx 2 12 4 2000                   * Remove placeholder event

* --- Remove Alarm agents (1 1 44) ---
enum 1 1 44
    kill targ                       * Destroy each alarm
next

* --- Remove Light Effect agents (1 1 45) ---
enum 1 1 45
    kill targ                       * Destroy each light effect
next
scrx 1 1 45 1000                   * Remove light effect toggle event

* --- Remove Outer Door agents (2 2 11) ---
enum 2 2 11
    kill targ                       * Destroy each outer door
next
scrx 2 2 11 1000                   * Remove outer door toggle event
```

---

## Agent Interaction Map

The following diagram shows how the agents communicate during the airlock cycle:

```
Airlock Control Panel (2 12 4)
    |-- msg 1000 --> Light Button (2 12 3) --> msg 1000 --> Center Door (2 2 12)
    |-- msg 1000 --> Light Effect (1 1 45)
    |-- msg 1000 --> Alarm (1 1 44)
    |-- msg 1001 --> Outer Door (2 2 11) [hold open animation]
    '-- msg 1000 --> Outer Door (2 2 11) [toggle open/close]
                        |-- msg 1001 --> Alarm (1 1 44) [eject agents on open]
                        |-- msg 1002 --> Alarm (1 1 44) [destroy agents on close]
                        '-- tick --> Airlock Agents (1 1 39) [adjust scan rate]
```

## Comparison with Engineering Airlock

| Aspect | Bridge Airlock | Engineering Airlock |
|---|---|---|
| Script file | `all bridge airlock.cos` | `all Engineering airlock.cos` |
| Location on ship | Bridge area (left side of ship) | Engineering area (right side of ship) |
| Outer door position | Right side (x=3155) | Left side (x=5464) |
| Interior direction | Left | Right |
| Eject velocity | `velo 50 -20` (rightward) | `velo -50 -20` (leftward) |
| Center door push | `velo -30 -10` (leftward) | `velo 30 -10` (rightward) |
| Light visual effect | Yes (1 1 45) | No |
| Outer door classifier | 2 2 11 | 2 2 14 |
| Alarm classifier | 1 1 44 | 1 1 50 |
| Center door classifier | 2 2 12 | 2 2 15 |
| Light button classifier | 2 12 3 | 2 12 10 |
| Control panel classifier | 2 12 4 | 2 12 11 |
| Sprite | `bridge airlock` | `engineering airlock` |

## Variables Summary

### Per-Agent OV Variables

| Variable | Used By | Purpose |
|---|---|---|
| `ov00` | All agents | State toggle (0 = off/closed/inactive, 1 = on/open/active) |
| `ov01` | Alarm (1 1 44) | Destruction event counter |
| `ov01` | Control Panel (2 12 4) | Countdown value (10 activation, 3 deactivation, negative = idle) |
| `ov70` | Outer Door, Alarm, Center Door, Light Button, Control Panel | Light level (255 = lit, 0 = dark) |

### Local Variables (VA) Used in Event Scripts

| Variable | Purpose |
|---|---|
| `va00`, `va01` | Position storage, attribute checks |
| `va50`, `va51` | Position backup (X, Y) |
| `va55` | Attribute flag temp for physics check |
| `va66` | Flag: 1 = spawn bone particles (creature destroyed), 0 = dust only |
| `va88` | Saved agent reference (used with `seta`/`mesg writ`) |
| `va90` | Room ID at agent's position |
| `va91` | Room ID to the right |
| `va92` | Room ID to the left |
