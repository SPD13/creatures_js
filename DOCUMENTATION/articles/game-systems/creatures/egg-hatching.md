# Egg Hatching

Eggs in Creatures 3 are **ordinary game agents**, not creatures. They have no faculties, no brain, and no biochemistry. The entire egg lifecycle — from being laid, through embryonic "ripening", to the actual cracking and birth of a creature — is driven by bootstrap **CAOS scripts** attached to two classifiers in the scriptorium. The engine itself contains no `Egg` class and no hatching code: the engine only provides the generic per-tick **timer** mechanism that the script uses to drive its state machine.

This article documents the full pipeline: the agents and scripts involved, the engine-level timer that ticks them, the hatching state machine, and how time-acceleration affects it.

## The Two Egg Classifiers

Eggs come in two flavours, distinguished by the classifier (family, genus, species) on the agent:

| Classifier | Description | Hatches into |
|---|---|---|
| `3 4 1` | Norn / Geat / Ettin\* egg | A norn (or geat) creature (`crea 4`) |
| `3 4 0` | Grendel/Ettin egg | A grendel or ettin creature (`crea 4`) |
| `3 4 2` | Grendel egg sprite | Mid-hatching grendel egg variant |
| `3 4 3` | Ettin egg sprite | Mid-hatching ettin egg variant |

\* The norn egg classifier (`3 4 1`) is the most general — the actual species of the hatched creature is determined by the moniker stored in the egg's slot 0 (set by `GENE MOVE` when the egg is laid), not by the egg sprite.

The hatching scripts are:

- `scrp 3 4 1 9` — **norn egg timer** (event 9 = `SCRIPTTIMER`)
- `scrp 3 4 0 9` — **grendel/ettin egg timer**
- `scrp 3 4 0 1000`, `scrp 3 4 1 1000` — "incubator hatch" path (when an egg is in a Hatchery)

All of these live in `Rebuild/Assets/C3_Bootstrap_V2/creatureBreeding.cos` (and a copy in `Rebuild/Assets/Bootstrap/001 World/creatureBreeding.cos`).

## The Engine-Side Mechanism: Per-Tick Timer

Every agent in the engine — egg or otherwise — has a generic timer with two integer fields and a single CAOS command to set it:

```
myTimerRate    integer    interval in ticks (0 = timer off)
myTimer        integer    accumulator, incremented by 1 each tick
```

The CAOS command:

```caos
TICK rate
```

calls `Agent::SetTimerRate(rate)` on the current `TARG`, which stores `rate` into `myTimerRate` and resets `myTimer` to 0. As `rate` is `0`, the timer is disabled.

The original engine's timer logic:

```text
if myTimerRate > 0:
    increment myTimer
    if myTimer >= myTimerRate:
        ExecuteScriptForEvent(SCRIPTTIMER, mySelf, 0, 0)
        myTimer = 0
```

The JS rebuild matches this byte-for-byte in `Rebuild/Main_Game/src/engine/agents/Agent.js:752–760`:

```javascript
if (this.myTimerRate > 0) {
    this.myTimer++;  // increment by 1 tick, NOT deltaTime
    if (this.myTimer >= this.myTimerRate) {
        this.myTimer = 0;
        this.myTimerTick++;
        this.handleTimerEvent();
    }
}
```

`handleTimerEvent()` (`Agent.js:1735`) then fires script **event 9** (`SCRIPTTIMER`) on the agent. For an egg, that runs `scrp 3 4 1 9` (or `3 4 0 9`).

### Why the Timer is Tick-Counted, Not Real-Time-Counted

`myTimer` increments by exactly **1 per simulation tick**, regardless of real-time `deltaTime`. This is by design and matches the original engine. Real-time-counting would couple game progression to frame rate and would break the deterministic save/load contract.

This also means **time acceleration speeds up egg hatching proportionally** — see [Time Acceleration](#time-acceleration) below.

## How an Egg Comes Into Existence: The Lay-Egg Script

Eggs are created by the **mother creature**, not the engine. When a pregnant creature performs the involuntary action *Lay Egg* (involuntary 1, script event 65), the script `scrp 4 0 0 65` runs on her. The relevant portion (`creatureBreeding.cos:532–623`):

```caos
*Creature - Lay egg - involuntary[1]
scrp 4 0 0 65
    ltcy 1 8 64                        * 8-64 tick latency before next involuntary
    doif movs ne 0 stop endi           * not while carried/in a vehicle
    doif gtos 1 ne ""                  * only if pregnant (slot 1 non-empty)
        pose 108
        wait 40
        pose 109
        inst
        seta va00 targ
        sets va04 gtos 0               * mother's moniker

        * find last egg slot, then back off by 1
        setv va50 1
        loop
            addv va50 1
        untl gtos va50 = ""
        subv va50 1

        targ ownr
        setv va01 posl
        addv va01 rand 14 18           * random horizontal offset

        setv va02 dfty
        setv va03 rand 0 10
        mulv va03 8

        setv va99 gnus
        doif va99 = 2
            new: simp 3 4 2 "greneggmask" 7 1 10        * grendel egg
        elif va99 = 3
            new: simp 3 4 3 "greneggmask" 7 8 10        * ettin egg
        else
            new: simp 3 4 1 "eggs" 8 va03 2000          * norn/geat egg
        endi

        pose 0                          * pose 0 = freshly laid
        elas 10
        fric 100
        attr 195                        * mouseable + carriable + suffer physics
        bhvr 32
        aero 10
        accg 4
        perm 60
        subv va02 hght
        mvsf va01 va02                  * drop near mother

        doif va99 eq 1
            emit 11 0.65                * norn egg smell
        endi

        * Move the genome from mother slot va50 to egg slot 1
        gene move targ 1 va00 va50

        * Temperature-dependent gender
        setv ov01 0
        doif sean = 0 or sean = 2       * spring or autumn
            setv ov01 rand 0 1
        endi
        doif sean = 0                   * spring
            mulv ov01 2
        endi

        * History events
        hist evnt gtos 1 11 va04 ""     * embryo: HIST_LAID
        hist evnt va04 12 gtos 1 ""     * mother: HIST_LAID_EGG

        tick 900                        * 900 ticks (45 s base) until first ripening
        slow
        ...
    endi
endm
```

### What the Lay-Egg Script Does

1. Picks the matching egg sprite (`3 4 1` / `3 4 2` / `3 4 3`) based on the mother's genus.
2. Creates the egg with `NEW: SIMP` and gives it physics/permissions/attributes.
3. Transfers the offspring genome out of the mother's GenomeStore slot and into the egg's slot 1 via `GENE MOVE`. **The mother becomes no longer pregnant at this exact instruction** (slot 1 is now empty).
4. Sets `ov01` (the future creature's sex) based on incubation season — a Creatures 3 nod to reptilian temperature-dependent sex determination.
5. Writes history events for both the embryo and mother.
6. Sets `tick 900` — the egg will get its first `SCRIPTTIMER` callback **900 ticks (~45 s) later**.

After step 6 the script ends and the egg sits idle, with `myTimerRate=900` ticking inexorably toward its first ripening event.

## The Hatching State Machine (Norn Egg)

The full norn egg timer is `scrp 3 4 1 9` in `creatureBreeding.cos:51–192`. It is the heart of the hatching pipeline. Conceptually it is a **state machine driven by the egg's pose** (sprite frame):

| Pose | Meaning |
|---|---|
| 0 | Freshly laid |
| 1 | Ripening (early) |
| 2 | Ripening (mid) |
| 3 | Ripening (late, "almost ready" wiggle animation) |
| 4–6 | Cracking sequence frames |
| 7 | Hatched (egg consumed, broken shell remains briefly) |

Every time the timer fires, the script:

1. **Disables its own timer** (`tick 0`) so it doesn't reentrantly fire.
2. **Branches on state and environment**.
3. **Re-arms the timer** (`tick 100` / `tick 600` / `tick 1200`) and `stop`s.

### Branch 1 — Already Hatched

```caos
doif pose eq 7
    kill targ                          * remove the empty shell
    stop
endi
```

### Branch 2 — Adverse Environment (try again later)

```caos
* In water (room type 8 or 9)
doif rtyp room ownr = 8 or rtyp room ownr = 9
    tick 600                           * retry in 30 s
    stop
endi

* Being carried
doif carr ne null
    tick 600
    stop
endi

* In free-fall
doif fall eq 1
    tick 600
    stop
endi
```

The egg refuses to ripen if it is underwater, being held by the player or a creature, or mid-fall. Each adverse condition adds a 600-tick (30 s) delay.

### Branch 3 — Still Ripening (pose < 3)

```caos
doif pose lt 3
    setv va00 pose
    addv va00 1
    pose va00                          * advance pose 0→1→2→3
    doif pose eq 3
        anim [4 5 6 5 4 5 6 6 5 4 4 5 3 3 3 3 3 4 5 6 4 5 6 5 6 5 6 6 5 4 3]
    endi
    tick 600                           * next ripening in 30 s
    stop
endi
```

This advances the pose by one each timer fire. Three ripening fires (pose 0→1, 1→2, 2→3) at 600 ticks each = **1800 ticks ≈ 90 seconds** of ripening, on top of the initial 900-tick wait. When the egg reaches pose 3 it plays a "wiggle" animation to telegraph imminent hatching.

### Branch 4 — Ready to Hatch (pose = 3)

The ready branch runs only if there is room in the world for a new creature:

```caos
* Norn population check (genus 1)
setv va98 0
enum 4 1 0
    doif dead = 0
        addv va98 1
    endi
next
setv va99 game "c3_max_norns"
doif va98 ge va99
    tick 1200                          * too many norns — wait 60 s
    stop
endi

* Total creature population check
setv va98 0
enum 4 0 0
    doif dead = 0
        addv va98 1
    endi
next
setv va99 game "c3_max_creatures"
doif va98 ge va99
    tick 1200
    stop
endi
```

`c3_max_norns` and `c3_max_creatures` are GAME variables set by the bootstrap that cap how many alive creatures the world can host. If either cap is hit, the egg waits 1200 ticks (60 s) and re-checks.

### Branch 5 — The Crack

When all preconditions are satisfied, the actual hatching sequence runs in a single timer event using `INST`-mode and `WAIT` boundaries:

```caos
* Stop being carryable/mousable so we can't be put in a hatchery mid-hatch
targ ownr
setv va03 attr
andv va03 1020
attr va03

* Create the creature off-screen and let it start processing instincts
new: crea 4 targ 1 ov01 0              * crea uses slot 1 (the embryo genome)
accg game "c3_creature_accg"
bhvr game "c3_creature_bhvr"
attr game "c3_creature_attr"
perm game "c3_creature_perm"
setv va91 11
addv va91 gnus
emit va91 0.5                          * release pheromone (smell ID 11+genus)

drea 1                                 * start the newborn dreaming
seta va05 targ                         * remember new creature in va05

** Process instincts while the egg cracks
targ ownr
anim [4 5 6 4 5 6 4 5 6 3 3 6 4 5 6 4 4 5 6 3]
snde "crak"
over
stpc
wait 30                                * each WAIT pauses the VM for N ticks
anim [4 5 6 4 5 6 4 5 6 3 3 6 4 5 6 4 4 5 6 3]
snde "crak"
over
stpc
wait 40
anim [4 5 4 5 4 5 6 5 3 3 4 5 6 6 5 6 5 6 5 6 5 3]
snde "crak"
over
stpc
wait 40
anim [4 5 4 5 4 5 6 5 3 3 4 5 6 6 5 6 5 6 5 6 5 3]
snde "crak"
over
stpc
wait 20
anim [4 5 6 4 5 6 4 5 6 5 6 5 6 4 5 6 4 5 6 6 6 5 6 5 6 5 6 5 4 5 6]
snde "crak"

setv va00 posl
setv va01 posb
over
pose 7                                 * empty shell sprite
fade                                   * fade the egg out
inst

* Move the newborn into position
targ va05                              * the new creature
pose 75                                * feet level
subv va01 10                           * adjust for attachment-point offset
mvsf va00 va01

aslp 0                                 * wake up
born                                   * fires the BORN event chain

targ ownr
tick 200                               * give the empty shell 10 s to fade then re-fire (which kills it via Branch 1)
```

### Hatching Timeline Summary

Assuming default 20 tps and no adverse conditions or population caps:

| Phase | TICK value | Duration (base) | Cumulative |
|---|---|---|---|
| Initial wait after laying | 900 | 45 s | 45 s |
| Ripen pose 0 → 1 | 600 | 30 s | 75 s |
| Ripen pose 1 → 2 | 600 | 30 s | 105 s |
| Ripen pose 2 → 3 (+ wiggle) | 600 | 30 s | 135 s |
| Final wait before crack | 600 | 30 s | 165 s |
| Crack sequence (WAITs: 30+40+40+20) | — | 6.5 s | ~171.5 s |
| Shell fade-out before `KILL` | 200 | 10 s | ~181.5 s |

So **a norn egg takes roughly 2 minutes 50 seconds of real time to hatch at default speed**, plus the crack sequence.

## The Grendel/Ettin Egg Timer

`scrp 3 4 0 9` (`creatureBreeding.cos:196–290`) is similar but simpler:

- Pose 6 = hatched (analogue of pose 7 for norn eggs).
- Ripening uses `tick 100` per pose instead of 600, so it ripens *much faster* than norn eggs.
- Two-step crack: `addv ov99 1` until `ov99 ge 2`, then hatch.
- Only one population check — total creatures (`c3_max_creatures`); no separate grendel cap.

The faster pose progression is intentional design — grendel eggs are typically used by the bootstrap (Grendel Egg Maker) to maintain a steady grendel population in the wild.

## The Hatchery Path (Incubator)

A norn egg can also be brought into the **Hatchery** (an in-world machine, classifier `2 22 1`) by picking it up with the hand. The Hatchery exposes script 3000 (lift egg in), 3001 (lift egg out), 3002 (close), 3003 (open), and timer event 9 of its own (open/close based on population). The relevant interaction script for the egg side is:

- `scrp 3 4 0 1000` — *Egg being hatched by incubator* (`creatureBreeding.cos:16–47`)

This is fired by the hatchery when it has lifted an egg to the laying table. It does an **immediate** `NEWC` (new creature) without going through the normal pose-driven ripening:

```caos
scrp 3 4 0 1000
    lock
    seta va99 carr
    newc 4 targ 1 ov01 0               * NEWC (continue) — start expressing the genome
    accg game "c3_creature_accg"
    bhvr game "c3_creature_bhvr"
    attr 0                             * intangible while hatching
    perm game "c3_creature_perm"
    setv va91 11
    addv va91 gnus
    emit va91 0.5
    drea 1
    ...
    wait 160                           * give brain instincts time to wire up
    seta ov53 null
    targ va99
    loop wait 1 inst untl code = -1    * wait for hatchery to be idle
    mesg writ targ 3001                * tell hatchery to bring egg back down
    wait 1
    kill ownr
endm
```

The hatchery path **skips the normal ripening pose progression** and hatches the egg as soon as the hatchery machine cycles. This is the canonical "player-driven" way to speed up hatching in vanilla C3 — it bypasses 165 s of ripening for 160 ticks (~8 s) of instinct-wiring time.

## Population Caps — `c3_max_norns` and `c3_max_creatures`

These two GAME variables are read every time an egg tries to hatch. They are **not** catalogue values — they are plain `setv game` assignments in the C3 bootstrap script `Assets/Creatures 3/Bootstrap/001 World/!C3_game variables.cos:15-16`:

| Variable | Bootstrap default | Behaviour if exceeded |
|---|---|---|
| `c3_max_norns` | 10 | Norn eggs wait 1200 ticks and re-check |
| `c3_max_creatures` | 14 | All eggs wait 1200 ticks and re-check |

`c3_max_norns` is raised to 14 at runtime when the player collects star pick-up 7 — the same branch that unlocks Grendels/Ettins by setting `Grettin` to 1 (`stars and pickup panel.cos:73`). `creatureBreeding.cos:56-58` asserts both are `> 0` and that `c3_max_norns <= c3_max_creatures`.

The check counts only **alive** creatures (`dead = 0`), so dead corpses do not block new births.

If both caps are hit, hatching is indefinitely deferred — the eggs remain at pose 3, wiggling and re-firing their timer every minute, waiting for a slot to open up.

### The same caps elsewhere in C3

The identical `enum` + `doif dead = 0` count is re-implemented at every other point a creature can enter the world:

| Site | Gate |
|---|---|
| `creatureBreeding.cos:95-121` | Egg hatch — both caps at full value |
| `creatureBreeding.cos:455-480` | Kiss-pop breeding — both caps at full value (Norn cap only when `gnus = 1`) |
| `Hatchery2.cos:261-284` | Heatpan Incubator — **two-thirds** of each cap (`mulv 2` / `divv 3`), so with the defaults it shuts at 6 live Norns or 9 live creatures, well before eggs stop hatching |
| `GUI 1.cos:1655-1680` | Creature-import UI — both caps at full value, refuses with the "Import Text" dialog |

The incubator closing early is deliberate: it stops the player manufacturing creatures right up to the ceiling, leaving headroom for eggs already in the world to hatch.

### Docking Station replaces this system

DS drops the C3 variables entirely (`c3_incubator_recreator.cos:1-5` documents the switch) and sets its own in `Assets/Docking Station/Bootstrap/010 Docking Station/!DS_game variables.cos:15-17`:

| Variable | Bootstrap default | Meaning |
|---|---|---|
| `breeding_limit` | 36 | Live creatures above which eggs stop hatching and the incubator halts |
| `total_population` | 46 | Live creatures above which warp import (`immigrant checker.cos:146`) and the creature-menu import (`ds gui - creaturemenu.cos:1062-1071`) are refused |
| `extra_eggs_allowed` | 34 | Added to `breeding_limit` to give the **egg** cap for kiss-pop breeding, i.e. 70 eggs |

Two DS-specific behaviours are worth knowing:

- **Kiss-pop breeding has no creature cap in DS at all.** The population check is commented out in `DS creatureBreeding.cos:512-540` with the author's note that it was removed "to increase the chance of successful Wolfling Runs". What remains is a cap on the number of eggs (`enum 3 4 0`) in the world.
- Both DS numbers are player-adjustable at runtime from the Options panel (`ds gui - options.cos:974-1058`), with a floor of 2.

### Neither engine has a hard limit

There is no population cap anywhere in the engine, C++ or JS. `ourCreatureCollection` is a plain `std::vector<AgentHandle>` (`AgentManager.h:66,471`), and neither `AgentManager::CreateCreature` (`AgentManager.cpp:102-146`) nor `SubCommand_NEW_CREA` (`AgentHandlers.cpp:151-187`) counts anything before constructing a creature. Every limit above is game data, so `NEW: CREA` from a script or the debug console bypasses all of them.

The one implicit ceiling is `AgentManager::UniqueCreaturePlane` (`AgentManager.cpp:505-527`): creature planes are drawn at random from 1000-3000 and each live creature blocks a 9-plane band, so the retry loop — which has no attempt cap in C++ — saturates somewhere north of 200 creatures and hangs. The JS port matches the C++ clash test and adds a 10,000-draw bail-out rather than freezing the tab (`AgentManager.js` `uniqueCreaturePlane`). At the real caps of 14 (C3) and 46 (DS) this is unreachable.

## CAOS Event Wiring

The two relevant agent-event hooks that frame the egg lifecycle:

| Script | Triggered by | Purpose |
|---|---|---|
| `scrp 3 4 1 4` / `scrp 3 4 0 4` | `PICK` / `DROP` (event 4 = picked up) | Sets the pickup hotspot via `PUHL`, fires `STIM WRIT` "Got Creature Egg" (#93) on the carrying creature |
| `scrp 3 4 1 9` / `scrp 3 4 0 9` | `SCRIPTTIMER` (every `myTimerRate` ticks) | Drives the hatching state machine |
| `scrp 3 4 2 6` / `scrp 3 4 3 6` | `SCRIPTCOLLISION` (event 6 = collision) | Keeps the grendel/ettin egg sprite at `PLNE 1000` so it draws above inventory |
| `scrp 3 4 1 255` / `scrp 3 4 0 255` | `SCRIPTAGENTEXCEPTION` (event 255) | Recovery: a creature may die mid-hatch — set the egg back to a safe pose and re-tick |
| `scrp 3 4 0 1000` | `MESG WRIT … 1000` from the Hatchery | Skip ripening and hatch immediately |

## Why Eggs Are Just Simple Agents

There is no `Egg` class in the engine — neither in the original game nor in the JS rebuild (`Rebuild/Main_Game/src/engine/agents/`). The egg is a **`SimpleAgent`** with:

- A classifier that hooks scripts in the scriptorium.
- One genome stored in slot 1 (placed there by `GENE MOVE` during egg-laying).
- Two `OV` (object variable) slots used by the scripts: `ov01` for sex, `ov99` for the grendel/ettin hatch counter, `ov53` for hatchery hand-off signalling.
- The generic per-agent timer described above.

This is a deliberate design choice from the original Cyberlife engine: **all interesting in-world behaviour lives in CAOS bootstrap scripts**, not in engine code. To change how eggs hatch, you change `creatureBreeding.cos`, not the engine.

## Time Acceleration

Time acceleration in the JS rebuild is controlled by `engine.timeScale` in GlobalConfig (the Home module slider exposes it as 0.1×–5.0×). Internally:

```javascript
// World.js:712 — World.scheduleTick(deltaTime)
const scaledDeltaTime = deltaTime * this.timeScale;
this.tickAccumulator += scaledDeltaTime;
```

A higher `timeScale` causes more **ticks per real second**. Because both `TICK` (the timer) and `WAIT` (script suspension) are tick-counted — not real-time-counted — **every part of the egg hatching pipeline accelerates proportionally**:

| What scales with `timeScale` | What does **not** scale |
|---|---|
| The `myTimer++` accumulator advancing toward `myTimerRate` | The integer values `tick 900` / `tick 600` themselves — they are absolute tick counts |
| `WAIT 30` / `WAIT 40` in the crack sequence | The animation frames inside `ANIM […]` (those are tied to the agent's `EntityImage` per-tick update) |
| The 1800-tick ripening total | None |

### Practical Numbers

| `timeScale` | Effective tps | Full hatch time (norn egg) |
|---|---|---|
| 1.0× | 20 | ~170 s |
| 2.0× | 40 | ~85 s |
| 5.0× | ~90 (capped) | ~35–40 s |

The reason the 5× column is capped at ~90 tps rather than 100 tps is the `tickAccumulator` cap in `World.scheduleTick()`:

```javascript
const maxAccumulator = this.tickInterval * 2;    // 100 ms
if (this.tickAccumulator > maxAccumulator) {
    this.tickAccumulator = maxAccumulator;
}
```

This anti-spiral-of-death guard discards any virtual time beyond two ticks' worth per frame, so the maximum sustainable tps at 60 fps is **~2 ticks/frame × 60 fps = 120 tps** — but in practice it oscillates between 1 and 2 ticks per frame, averaging ~90 tps. So 5× time-scale yields an effective ~4.5× egg-hatching speed-up.

### Why Eggs Feel Slow Even When Accelerated

Players sometimes report that creatures "obviously" speed up but eggs "don't seem to hatch faster". Two effects combine to create this perception:

1. **Visible vs. hidden motion**. Creatures are constantly walking, gesturing, and changing pose, so any speed-up is immediately visible. An egg sits **completely still** at the same pose for 30 s at a time, then briefly advances one frame, then sits still again. The fast-forwarded version of "wait 30 s, blink, wait 30 s" is still mostly "wait, blink, wait".
2. **Base time is genuinely long**. ~170 s of base hatching is already long enough that even a 5× speed-up leaves ~35 s before a creature appears. Compare that with a creature walking visibly across the screen in seconds, and the brain registers the creature's motion as fast and the egg as "not really doing anything".

### Verifying Programmatically

To check egg acceleration empirically, open the browser console with at least one egg in the world and run:

```javascript
const egg = [...gameEngine.world.agentManager.agents.values()]
    .find(a => a.myClassifier?.family === 3 && a.myClassifier?.genus === 4);
console.log({
    timerRate: egg.myTimerRate,
    timer:     egg.myTimer,
    pose:      egg.myEntityImage?.currentPose,
    currentTick: gameEngine.world.currentTick,
});
```

Sample at `timeScale = 1.0` and again at `timeScale = 5.0` over a known wall-clock interval. The ratio `(timer + currentTick) / wall-clock seconds` should scale with `timeScale`, confirming the acceleration is reaching the egg.

## File Reference

### Bootstrap Scripts

- `Rebuild/Assets/C3_Bootstrap_V2/creatureBreeding.cos`
  - `scrp 3 4 0 1000` — incubator-driven hatch (line 16)
  - `scrp 3 4 1 9` — norn egg timer (line 52)
  - `scrp 3 4 0 9` — grendel/ettin egg timer (line 196)
  - `scrp 3 4 1 255` / `scrp 3 4 0 255` — exception handlers (line 293, 298)
  - `scrp 3 4 2 6` / `scrp 3 4 3 6` — collision plane fixers (line 306, 315)
  - `scrp 3 4 0 4` — egg picked-up handler (line 329)
  - `scrp 4 0 0 65` — mother's lay-egg involuntary action (line 532)
- `Rebuild/Assets/C3_Bootstrap_V2/Hatchery2.cos`
  - Hatchery cabinet agent (`2 22 1/2/3`) and its full open/lift/close cycle
- `Rebuild/Assets/Bootstrap/001 World/creatureBreeding.cos` — older copy of the same scripts (slightly less commented; logic identical)

### Engine

- `Rebuild/Main_Game/src/engine/agents/Agent.js`
  - Constructor — `myTimerRate = 0`, `myTimer = 0` (line 142)
  - `update()` — increments `myTimer`, fires `handleTimerEvent` (line 722, timer block at 752–760)
  - `handleTimerEvent()` — dispatches to script event 9 via the persistent VM fast path (line 1735)
  - `setTimerRate(rate)` — backs the `TICK` CAOS command (line 4930)
- `Rebuild/Main_Game/src/engine/agents/AgentManager.js`
  - `timerAgents` — performance Set tracking agents with `myTimerRate > 0` (line 52)
- `Rebuild/Main_Game/src/engine/caos/commands/agents/TICK.js` — the CAOS `TICK` command implementation
- `Rebuild/Main_Game/src/engine/caos/commands/scripts/WAIT.js` — the `WAIT` command (tick-counted)
- `Rebuild/Main_Game/src/engine/world/World.js`
  - `scheduleTick()` — applies `timeScale` to delta (line 708)
  - `_processTickBatch()` — runs up to `maxTicksPerFrame` per RAF frame (line 759)
  - `performTick()` — single simulation tick; calls `agentManager.update()` and `executeAllAgentQuanta()` (line 970)
- `Rebuild/Main_Game/src/engine/core/GlobalConfig.js` — defines `engine.tickRate`, `engine.timeScale`, `engine.maxTicksPerFrame` (line 82–84)

## Related Articles

- [Reproductive Faculty](reproductive-faculty.md) — how the offspring genome arrives in the mother's GenomeStore, the biochemistry-driven pregnancy cycle, and the involuntary action that calls `scrp 4 0 0 65`.
- [Motor Faculty](motor-faculty.md) — the involuntary action machinery (`LTCY`, involuntary index 1 = "Lay Egg") that fires script event 65.
- [Creature Behavior Scripts](creature-behavior-scripts.md) — overview of all creature CAOS event scripts, including the breeding scripts.
- [Age and Lifecycle](age-and-lifecycle.md) — what happens to a creature after `BORN` fires at the end of the hatch sequence.
