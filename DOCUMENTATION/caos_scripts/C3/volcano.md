# volcano.cos - Ship Volcano Eruption System

**Source**: `Assets/Bootstrap/001 World/volcano.cos`

## Overview

This script implements the decorative volcano in the Creatures 3 Shee ship and its full eruption system. A single volcano is installed on the wall of the ship at position (4681, 214) with two invisible blank emitters co-located near (4924, 400) that broadcast heat/lava CAs into the map. Alongside the volcano itself, a compound **volcano control panel** (with an input and output CA port, plus a clickable red button) is installed at (4857, 638) — giving the player the ability to trigger eruptions manually or via the wiring system, and allowing the volcano to signal other devices when it erupts.

Once installed, the volcano erupts either:
- **Manually**: when the player clicks the control-panel button.
- **Remotely**: when a high-enough signal arrives at the panel's CA input port.
- **Randomly**: the panel's timer ticks every 20 seconds to 100 seconds and rolls a chance gated by the presence of active lava rocks (classifier 2 20 1) and cooled rocks (classifier 2 21 4) in the world. If very few rocks are around, an eruption is allowed.

During an eruption, the volcano plays a warning light/siren sequence, fades the control-panel siren overlay out, and then tells the volcano to erupt (message 1000). The erupting volcano plays a multi-stage animation, wakes up any sleeping lava rocks in the world, and spawns **lava rocks** (2 20 1) which fly out in parabolic arcs. While airborne they emit fire CA (CA 2). When a lava rock hits a water room (salt or fresh) it is quenched with a steam cloud, a splash sprite, and a cooled rock is deposited; otherwise it falls, solidifies through seven cooling poses, and freezes into a cooled rock (2 21 4) on the terrain. Rocks (both hot and cooled) that are struck again fragment through three progressively smaller sprite stages before crumbling into dust. Creatures that touch lava rocks take a blast of chemical 148 (pain), and the panel, when hit, injects stimulus 92 into the striker.

## Created Agents

| Classifier | Name | Sprite | Description | Detail |
|---|---|---|---|---|
| 1 1 28 | Volcano | `volcano` frame 22 | Main wall-mounted volcano that plays the eruption animation and spawns lava | [Detail](#volcano-1-1-28) |
| 1 1 28 | Blank CA Emitter (×2) | `blnk` frame 0 | Invisible emitters sharing the volcano classifier; broadcast CA 1 and CA 2 near the volcano mouth | [Detail](#blank-ca-emitter-1-1-28) |
| 3 3 41 | Volcano Control Panel | `volcano` frame 41 (compound) | Wired control device with button, siren overlay, and input/output ports | [Detail](#volcano-control-panel-3-3-41) |
| 2 20 1 | Lava Rock (airborne) | `volcano` frame 54 | Hot lava projectile ejected by the eruption; cools in flight and on landing | [Detail](#lava-rock-airborne-2-20-1) |
| 1 1 29 | Splash / Trail Puff | `volcano` frame 73 | Short-lived sprite puff used as a flight trail and as the water-quench splash | [Detail](#splash--trail-puff-1-1-29) |
| 2 21 4 | Cooled Rock | `volcano` frame 54/62/63 | Solid rock deposited on terrain after a lava rock cools; fragments when hit | [Detail](#cooled-rock-2-21-4) |

---

## Volcano (1 1 28)

The main wall-mounted volcano agent. Displayed on the ship wall at (4681, 214) with 32 animation frames starting at image 22. Attr 16 (invisible in gallery preview — suffers physics off, collision off — purely decorative static).

### Properties

| Property | Value | Notes |
|---|---|---|
| Sprite | `volcano` | 32 images, first image 22 |
| `attr` | 16 | Non-physical decorative agent |
| Position | (4681, 214) | High on the ship wall |
| `va99` (global) | `targ` | Stored during bootstrap as a reference to this volcano; used by the control panel as `ov16` |

### Events

| Event # | Event Name | Description |
|---|---|---|
| 1000 | Message — Erupt | Full eruption sequence: sound, shake, spawn lava rocks, play fade animation |
| 1001 | Message — Wake lava | Instructs every existing cooled rock (2 21 4) to bounce upward |

#### Event 1000 — Erupt (Main Eruption Sequence)

1. Plays explosion sound "exp1".
2. Calls `sway shou 10 0.6 5 0.3 -1 0.0 -1 0.0` — camera shake at the shouter.
3. For every sleeping creature within sight (`esee 4 0 0`), wakes it up (`aslp 0`).
4. Plays opening animation [0 1 2 3], records the emission point as (`posl + 228`, `post + 138`) into `va00`/`va01` (top-of-crater spawn position).
5. Waits for animation (`over`).
6. Rolls a probability (`va99 = totl 2 21 4` — number of cooled rocks in world). If `va99 ≥ 100` too many rocks already — set `va99 = 0` (suppress). Otherwise set `va99 = 1` (allow new rocks).
7. If `va99 = 1`: calls `rock` subroutine (spawn one lava rock).
8. Runs `esee 2 21 4` on all cooled rocks within sight: `velo 0 rand -30 -10` (bounces them upward — this is the "earth shake" displacing old rocks).
9. Plays animation [4], then randomly decides whether to spawn another rock (1-in-2 chance twice), then animation [5] and another chance, then another bounce pass on cooled rocks, animation [6], another chance, animation [7], and finally the eruption closing animation [8 9 10 11 … 21 0] (return to resting pose).

#### Subroutine `rock` — Spawn Lava Rock

Creates one new **Lava Rock (2 20 1)** at (`va00`, `va01`) with:
- Sprite `volcano`, 10 images starting at image 54, plane 2000.
- `attr 195` (carryable + mouseclickable + activatable 1 + suffers physics), `bhvr 43` (creature-interactive touch flags), `perm 99` (solid permeability), `accg 3`, `fric 60`, `elas 20`.
- `pose 0`, `aero 0`, `ov00 = 0` (cooling counter/stage), `ov99 = 1` (airborne flag).
- Horizontal velocity `va99 = rand 2..7` × (1 or −1) × 5 — randomly 10–35 units left/right.
- Vertical velocity `rand -35..-25` (strong upward launch).
- Plays "exp2" explosion sound. Timer `tick 2`.

#### Event 1001 — Wake Lava (aftershock)

Runs `esee 2 21 4 → velo 0 rand -30 -10` — jolts every cooled rock within sight upward. Called by external scripts (or by players writing message 1001 to the volcano) to make rocks bounce.

---

## Blank CA Emitter (1 1 28)

Two invisible helper agents created during bootstrap at position (4924, 400). They share the volcano classifier (1 1 28) — so the volcano enumeration in the removal script (`enum 1 1 28 → kill targ`) cleans them up automatically.

| Agent | Emits CA | Notes |
|---|---|---|
| Emitter 1 | CA 1, amount 1 | Broadcasts CA 1 (heat/smell) at the volcano mouth |
| Emitter 2 | CA 2, amount 1 | Broadcasts CA 2 (fire) at the volcano mouth |

### Properties

| Property | Value |
|---|---|
| Sprite | `blnk` (blank 1-image sprite) |
| `attr` | 16 |
| Position | (4924, 400) |

### Events

No event scripts are defined. The emitters are entirely passive — each frame, the engine uses their `emit` setting to inject the CA into the room they reside in.

### Room CA Impact

These emitters continuously raise CA 1 and CA 2 in the volcano room, so creatures and agents with sensitivity to these CAs perceive a hot/dangerous area near the volcano even when it is not actively erupting.

---

## Volcano Control Panel (3 3 41)

A compound agent with 3 parts acting as the wired-up control surface for the volcano. It carries input/output CA ports and a clickable button part that acts as the manual eruption trigger.

### Properties

| Property | Value | Notes |
|---|---|---|
| Sprite | `volcano` | Compound first image 41 |
| Position | (4857, 638) | Lower ship wall |
| `ov16` | = `va99` (volcano ref) | Used by the panel to send messages to the volcano |

### Parts

| Part | Type | Description |
|---|---|---|
| 1 | Button (`pat: butt`) | Clickable red button sprite (first image 12, 2 frames) at offset (223, 117). On click it toggles state, runs its own timer animation every 1200-12000 ticks, and carries `bhvr 9` (activatable). |
| 2 | Dull (`pat: dull`) | Warning siren overlay (first image 17, 65 frames) at offset (−5, 0). Animated on the eruption path (the red spinning siren). |
| 3 | Dull (`pat: dull`) | Decorative overlay (first image 14, 226 frames) at offset (139, 0), moved to absolute (4857, 638). |

### CA Ports

| Port | Name | Direction | Description |
|---|---|---|---|
| 0 | Volcano Input | Input | "High enough signal will make the volcano erupt" — when a signal with `_p1_ > 200` arrives, fires the button (sends message 0). |
| 0 | Volcano Output | Output | "Will send high signal when volcano erupts" — during eruption the panel sends signal 255 on output 0. |

### Events

| Event # | Event Name | Description |
|---|---|---|
| 1 | Activate 1 | Eruption sequence: siren, warning, fires volcano message 1000, sends output signal 255 |
| 9 | Timer | Periodic random chance to auto-trigger an eruption based on rock counts |
| 1000 | Signal In | Input port handler: if signal `_p1_ > 200`, writes message 0 to self to trigger button press |
| 3 | Collision / Hit | Panel plays a bang (random 60–100 intensity) and writes stimulus 92 to the hitter |

#### Event 1 — Activate (Eruption Trigger)

1. `lock` — lock script to prevent interruption.
2. Plays "alar" alarm sound.
3. `wait 10`.
4. Part 1 (button): animates [0 1 255] (push down and hold).
5. Part 0 (main body): `frat 3`, animation [0 1 2 3 4 5 6] — warning buildup.
6. Part 2 (siren): `frat 6`, animation [0 1 … 14], plays "warn" warning sound.
7. Waits for animations (`over`).
8. Part 0: `frat 6`, animation [7 8 9 10 11] — further buildup.
9. Waits (`over`).
10. **Triggers the volcano** — `mesg writ ov16 1000` (fires the main eruption on the referenced volcano).
11. **Broadcasts output signal** — `prt: send 0 255` (signal 255 to wired listeners on output port 0).
12. Plays "alar" alarm again.
13. Part 2 (siren): animation [14 13 12 … 0] — siren spins down.
14. Waits (`over`).
15. Part 0: animation [6 5 4 3 2 1 0] — returns to resting.
16. Waits (`over`).
17. `fade` — fades out any playing sound.
18. Part 1 (button): plays long idle blink animation [0 × 11, 1 × 10, 255] (animation terminator).

#### Event 9 — Timer (Random Ambient Eruption)

Each tick (interval random 1200–6000):
1. Computes `va00 = totl 2 20 1` (airborne lava rocks) `+ totl 2 21 4 × 4` (cooled rocks weighted heavily).
2. If `va00 < 10` — world has few rocks, so trigger eruption by writing message 0 to self (activates the button).

#### Event 1000 — Signal In

If incoming signal parameter 1 is > 200, writes message 0 to self (same trigger path as a button press / timer).

#### Event 3 — Hit / Collision

When the panel is struck:
1. Calls `prt: bang rand 60 100` — creates a bang overlay at random intensity.
2. Calls `stim writ from 92 1` — injects stimulus 92 (with amount 1) into the striker (`from`).

---

## Lava Rock (airborne) (2 20 1)

A hot rock ejected from the volcano. Airborne rocks tick every 2 frames; they emit CA 2 (fire) while `ov99 = 1` (alive/hot). They cool in-flight through 7 poses, then solidify into **Cooled Rock (2 21 4)**. On entering a water room they emit a steam puff, a splash sprite, and spawn a cooled rock at the surface.

### Properties

| Property | Value | Notes |
|---|---|---|
| Sprite | `volcano` | 10 images, first image 54 |
| Plane | 2000 | Foreground |
| `attr` | 195 | Carryable + Mouseclickable + Activatable 1 + Suffers Physics |
| `bhvr` | 43 | Creature-interactive |
| `perm` | 99 | Blocks room transitions |
| `accg` | 3 | Moderate gravity |
| `aero` | 0 | No air drag |
| `fric` | 60 | High friction |
| `elas` | 20 | Low bounce |
| `tick` | 2 | Cools every 2 ticks |

### Key Variables

| Variable | Purpose |
|---|---|
| `ov00` | Solidified flag (0 = hot, 1 = cooled/quenched) |
| `ov90` | Cooling counter; every 20 ticks advances cooling pose |
| `ov99` | Active/hot flag — controls whether CA 2 is emitted |

### Events

| Event # | Event Name | Description |
|---|---|---|
| 9 | Timer | Emit fire CA, cool while falling, detect water rooms, morph to cooled rock |
| 1 / 2 / 3 / 4 | Activate1 / Activate2 / Hit / Pickup | Injects chemical 148 (pain) into the interacting creature |
| 6 | Collision | Fragments into smaller rocks or crumbles when hit |

#### Event 9 — Timer (Cooling / Flight)

1. `emit 2 ov99` — emits CA 2 (fire) at amount `ov99` (1 while hot, 0 once cooled/quenched).
2. **Water check** — if the current room type is 8 (fresh water) or 9 (salt water):
   - Plays "quen" quench sound.
   - Sets `ov00 = 1`, forces `pose 7` (fully solid), `tick 0` (stops timer), `emit 2 0` (stops emitting fire).
   - `altr room targ 2 1` — increments CA 2 of the current room by 1 (steam signature).
   - Saves current position; offsets X by −20.
   - Spawns a **Splash (1 1 29)** at the offset position (steam puff effect), `tick 2`.
   - Spawns a **Cooled Rock (2 21 4)** at the rock's position with `attr 195`, `perm 99`, `accg 5`, `pose 7`, `aero 0`, `fric 60`, `elas 50`, `ov00 = 1`, `tick 0`, `ov99 = 0`, `emit 2 0`. Uses `tmvt` / `mvsf` to place it in a safe floor position.
   - `kill ownr` — destroys the airborne lava rock.
3. **Free-fall trail** — if `fall = 1` (currently falling):
   - Saves current position; offsets X by −20.
   - Spawns a **Splash (1 1 29)** at the offset position as a trail puff, `tick 3`.
4. **Cooling when on ground** — otherwise (landed):
   - `tick 3`; increments `ov90`.
   - When `ov90 ≥ 20`:
     - Resets `ov90 = 0`.
     - If pose < 7: advances pose (visual darkening), and `ov99 -= 0.1` (reduces fire emission amount).
     - If pose = 7: spawns a **Cooled Rock (2 21 4)** at current position with solid physics (same properties as the water-quench variant) and kills self.

### Creature Impact (events 1 / 2 / 3 / 4)

If a creature activates, activates-twice, hits, or picks up the lava rock, it runs `chem 148 0.3` — injecting chemical 148 (pain) at amount 0.3 into itself. (The event fires on the creature, so `targ` is the creature when the script runs.)

### Event 6 — Collision (Fragmenting)

When the rock collides with floor or wall:
1. `inst` — instantaneous block.
2. If `ov00 = 0`, returns immediately (airborne rocks don't fragment here — they cool first).
3. Reads impact position and impact velocity `_p1_`/`_p2_`; takes absolute values.
4. If impact magnitude is over 30 on either axis (hard enough hit):
   - **If `ov00 = 1`** (first-stage cooled rock): plays "rok2" sound; spawns 3 smaller rocks (`2 21 4`, first image 62, `elas 50`, `ov00 = 2`) scattering with random velocity; kills self.
   - **If `ov00 = 2`** (second-stage): plays "rok2"; spawns 3 even smaller rocks (`2 21 4`, first image 63, `elas 10`, `ov00 = 3`) scattering; kills self.
   - **If `ov00 = 3`** (smallest): plays "rok2"; plays crumble animation [0..9] (`over`); kills self.
5. Otherwise (light impact): plays "rok1" sound and continues.

---

## Splash / Trail Puff (1 1 29)

A short-lived sprite created (1) as a falling-trail puff behind airborne lava rocks, and (2) as a steam/water-splash puff when a lava rock lands in water. One image sequence of 4 frames starting at image 73.

### Properties

| Property | Value |
|---|---|
| Sprite | `volcano` |
| First image | 73 |
| Image count | 4 |
| Plane | 1 |
| `tick` | 2 or 3 (set by creator) |

### Events

| Event # | Event Name | Description |
|---|---|---|
| 9 | Timer | Advances pose each tick; destroys self at final pose |

#### Event 9 — Timer

1. If pose < 3: advances pose by 1.
2. Else: `kill ownr` (destroys self at final frame).

---

## Cooled Rock (2 21 4)

A solid rock deposited on terrain after a lava rock cools. Three fragmentation stages (large / medium / small) represented by different sprite offsets. Cooled rocks are carryable by creatures — touching still injects pain (chemical 148) because the script fires for events 1–4. When struck hard they fragment through smaller rocks and finally crumble to dust.

### Properties

| Property | Value | Notes |
|---|---|---|
| Sprite | `volcano` | First image 54 (large), 62 (medium), or 63 (small) |
| Plane | 2000 | Foreground |
| `attr` | 195 | Carryable + Mouseclickable + Activatable 1 + Suffers Physics |
| `perm` | 99 | Solid |
| `accg` | 5 | Strong gravity |
| `aero` | 0 | No air drag |
| `fric` | 60 | High friction |
| `elas` | 20 / 50 / 10 | Bounce varies by stage |
| `ov00` | 1 / 2 / 3 | Current fragmentation stage |

### Events

| Event # | Event Name | Description |
|---|---|---|
| 1 / 2 / 3 / 4 | Activate1 / Activate2 / Hit / Pickup | Injects chemical 148 (pain) into the interacting creature (inherited from 2 20 1 behavior) |
| 6 | Collision | Fragments into smaller rocks or crumbles when hit hard |

#### Events 1 / 2 / 3 / 4 — Creature Interaction

Runs `chem 148 0.3` — injects chemical 148 (pain) at amount 0.3 into the creature that activated/hit/picked up the rock.

#### Event 6 — Collision (Fragmenting)

Mirrors the 2 20 1 fragmentation logic:
1. `inst`.
2. If the rock is currently being carried (`carr ne null`) — stops immediately (carried rocks do not fragment).
3. `lock` — prevent reentry.
4. If `ov00 = 0`, returns immediately.
5. Reads impact position and parameters `_p1_`/`_p2_`; takes absolute values.
6. If impact magnitude exceeds 30 on either axis:
   - **`ov00 = 1`** (large): plays "rok2"; spawns 3 medium rocks (2 21 4, first image 62, `elas 50`, `ov00 = 2`) at random scatter velocity; kills self.
   - **`ov00 = 2`** (medium): plays "rok2"; spawns 3 small rocks (2 21 4, first image 63, `elas 10`, `ov00 = 3`) at random scatter velocity; kills self.
   - **`ov00 = 3`** (small): plays "rok2"; plays crumble animation [0..9] (`over`); kills self.
7. Otherwise (light impact): plays "rok1".

The spawned scatter velocity for fragmentation is `velo rand -10..10, rand -20..-10` — upward and outward scatter. Compared to the airborne-rock version, the cooled-rock fragmentation uses steeper upward velocities (−20 to −10 vs. −10 to −5).

---

## Creature & Ecosystem Impact

| Mechanism | Effect |
|---|---|
| CA 1 emission (from blank emitter 1 near volcano mouth) | Broadcasts CA 1 into the volcano area — used by creatures sensitive to that CA to avoid or seek the area |
| CA 2 emission (from blank emitter 2, and from hot lava rocks in-flight) | Broadcasts CA 2 (fire) — creatures likely avoid high CA 2 rooms |
| Room CA 2 alter on quench | `altr room targ 2 1` raises CA 2 in a water room by 1 when lava lands — residual steam signature |
| Chemical 148 on creature contact | Injecting chem 148 at 0.3 into a creature hitting / carrying / activating lava or cooled rock — chemical 148 is pain |
| Stimulus 92 on panel hit | Panel collision injects stimulus 92 into the hitter via `stim writ from 92 1` |
| Waking sleeping creatures at eruption | Sleeping creatures within sight lose sleep (`aslp 0`) when the volcano erupts |

---

## Removal Script (rscr)

The removal script cleanly uninstalls the volcano ecosystem:

1. Kills all volcanoes and the two blank CA emitters sharing the classifier: `enum 1 1 28 → kill targ`.
2. Kills all volcano control panels: `enum 3 3 41 → kill targ`.
3. Kills any remaining airborne lava rocks: `enum 2 23 10 → kill targ` (legacy classifier — no agent created under this classifier in the current script, retained for backwards compatibility).
4. Kills all splash/trail puffs: `enum 1 1 29 → kill targ`.
5. Kills all cooled rocks: `enum 2 21 4 → kill targ`.
6. Removes scripts: `scrx 3 3 41 1`, `scrx 1 1 28 1000`, `scrx 2 20 1 9`, `scrx 1 1 29 9`.

---

## Eruption Flow

```
Trigger source
  ├─ Player clicks panel button ─────────┐
  ├─ CA input signal > 200 ──────────────┤  (all of these write message 0
  └─ Timer (20-100s) if few rocks exist ─┘   to the panel, which activates
                                              event 1 — Activate)
                                  │
                                  ▼
               ┌──────────────────────────────────┐
               │ Panel event 1 — Eruption Lead-in │
               │ "alar" sound                     │
               │ button push animation            │
               │ siren spinning animation         │
               └──────────────┬───────────────────┘
                              │
                              ▼
               ┌──────────────────────────────────┐
               │ mesg writ ov16 1000              │
               │ prt: send 0 255 (output signal)  │
               └──────────────┬───────────────────┘
                              │
                              ▼
               ┌──────────────────────────────────┐
               │ Volcano event 1000 — Erupt       │
               │ "exp1" sound, camera shake       │
               │ wake creatures esee 4 0 0        │
               │ opening / shake / close anims    │
               │ spawn 0..4 lava rocks (2 20 1)   │
               │ bounce existing cooled rocks     │
               └──────────────┬───────────────────┘
                              │
                              ▼
           ┌──────────────────────────────────────┐
           │ Lava rocks airborne                  │
           │   emit CA 2 (fire)                   │
           │   cool in flight / on ground         │
           │                                      │
           │  ┌─ Lands on terrain ───┐            │
           │  │ advances poses 0..7  │            │
           │  │ spawns Cooled Rock   │            │
           │  └──────────────────────┘            │
           │                                      │
           │  ┌─ Enters water room ──┐            │
           │  │ "quen" sound         │            │
           │  │ altr room CA 2 +1    │            │
           │  │ spawn splash puff    │            │
           │  │ spawn Cooled Rock    │            │
           │  └──────────────────────┘            │
           └──────────────────────────────────────┘
                              │
                              ▼
           ┌──────────────────────────────────────┐
           │ Cooled Rock on terrain               │
           │  creature contact → chem 148 (pain)  │
           │  hit hard → fragment into 3 smaller  │
           │  rocks (large → medium → small → dust│
           └──────────────────────────────────────┘
```
