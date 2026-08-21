# Nature Patches

**Source file:** `Assets/Bootstrap/001 World Patches/nature_patches.cos`

## Overview

This is a **patch** bootstrap from the `001 World Patches` directory. It does not create any agents, does not modify the map, and does not change any global game variables. It performs two tightly scoped fixes called out by the header comment:

> Recategorizes the Volcanic Rocks as Weather (or makes them invisible if CATO doesn't work).
> Gives grazer waste a set lifespan even if collision script doesn't fire.

The patch combines two install-time fix-ups (an `enum`/loop over already-spawned agents) with two scriptorium replacements (constructor scripts, event 10) so that both **existing** instances and **future** instances pick up the fix:

1. **Volcanic Rocks (`2 21 4`)**
   - Each existing rock is run through a sandboxed `caos` execution that asks the engine to set the rock's stimulation category to `19` (Weather). If the call returns the engine error sentinel `"***"`, the rock is given `attr 211` instead — a value that keeps physics and collision but raises the *invisible* bit so the rock is hidden from the player. This is the "or makes them invisible if CATO doesn't work" branch.
   - The same logic is registered as the constructor event (10) so any new rock created later receives the same treatment.
2. **Grazer waste (`2 10 6`)**
   - Each existing piece of waste is given `tick rand 20 400` so it inherits a randomised lifespan (the actual lifetime decay is handled by the original waste scripts driven by the timer event).
   - The constructor event for new waste is replaced with a fixed `tick 400`, guaranteeing every newly-spawned waste agent has a finite countdown — fixing the case where the waste's collision script (which normally arms the timer) never fires.

There is no `rscr` removal block — patches are sticky for the lifetime of the world. The `enum` blocks at the top of the file run only once during patch installation; the `scrp` blocks live in the scriptorium and apply to all future instances.

## Modified Agents

| Classifier | Name | Description | Details |
|---|---|---|---|
| 2 21 4 | Volcanic Rock (Constructor event 10 + retroactive sweep) | Re-tags rocks as the Weather stimulation category, or hides them if recategorisation isn't supported. | [Details](#agent-2-21-4-volcanic-rock-patch) |
| 2 10 6 | Grazer waste (Constructor event 10 + retroactive sweep) | Guarantees waste despawns within 400 ticks even if its collision-driven cleanup never fires. | [Details](#agent-2-10-6-grazer-waste-patch) |

---

## Agent 2 21 4: Volcanic Rock (patch)

The Volcanic Rocks (`2 21 4`) are stationary world objects spawned by the `volcano` script. By default they expose themselves to creatures with their natural stimulation category (something like "danger" / "rock"), causing creatures to behave as though they were threatening hazards. This patch rewrites the per-rock category so creatures perceive them as harmless weather phenomena instead, and falls back to invisibility on engines/worlds where the override fails.

### Local Variables

| Variable | Purpose |
|---|---|
| `va05` | Captures the result of the sandboxed `caos` call. The engine returns `"***"` when the body of the run encountered an error. |
| `va99` | Output report variable supplied to the `caos` command (the eighth positional argument). It is unused by the patch but required by the command signature. |

### Install-time `enum 2 21 4` block

For every existing rock in the world the patch runs, atomically:

```
sets va05 caos 0 0 targ 0 "inst targ _p1_ cato 19" 0 1 va99
doif va05 = "***" and targ ne null
    attr 211
endi
```

- `caos 0 0 targ 0 "inst targ _p1_ cato 19" 0 1 va99` runs the inner CAOS code in a sandbox, with `targ` (the current rock) passed as the implicit subject and `_p1_` set so that the inner `targ _p1_` resolves back to the rock. The body asks the engine to atomically (`inst`) set the rock's category to `cato 19` (Weather).
- If the call fails (`"***"` sentinel) **and** the rock is still alive (`targ ne null`), the patch falls back to `attr 211` — the bit pattern `Carryable | Mouseable | Invisible | Suffer collisions | Suffer physics`. The rock keeps interacting physically but is hidden visually.

### Events

| Event | Number | Description |
|---|---|---|
| Constructor | 10 | Apply the same `cato 19` fix to newly-created rocks |

### Event 10 - Constructor (the patched script)

When a new volcanic rock is created — for example, when the volcano spawns one — this script fires automatically:

```
lock
wait 1
inst
sets va05 caos 0 0 targ 0 "inst targ _p1_ cato 19" 0 1 va99
doif va05 = "***"
    attr 211
endi
```

`lock` plus `wait 1` defer the work by one tick so the engine has finished placing the new agent before the categorisation runs (avoiding races with the rock's own constructor). After that, the same sandboxed `cato 19` attempt is made; on failure, `attr 211` is set so the rock is invisible from that point on. There is no explicit `targ ne null` check here because the constructor only fires when the rock exists.

### Removal Script

None. The script ships no `rscr` block.

### Impact on Stimulus / Room CA

Indirect, but significant. Setting the rock's category to `19` (Weather) changes how creatures perceive and react to the rock — it now slots into the "weather phenomenon" bucket of their classification networks rather than the rock/danger bucket, dampening avoid-style responses. Room CA is not modified.

---

## Agent 2 10 6: Grazer waste (patch)

The grazer waste (`2 10 6`) is the dropping created by the grazer creature. In the original scripts the waste lives until its collision event removes it; if the collision never fires (e.g. it lands somewhere it cannot collide further), the waste accumulates forever. This patch guarantees a finite lifetime in both directions.

### Install-time `enum 2 10 6` block

For every existing piece of waste:

```
tick rand 20 400
```

This sets a one-shot tick rate to a random value between 20 and 400 ticks. The original timer event will then fire roughly that many ticks later and drive the waste's normal cleanup pathway. Spreading the timer across a wide random range avoids a synchronised "all old waste dies on the same frame" wave.

### Events

| Event | Number | Description |
|---|---|---|
| Constructor | 10 | Arm the waste with a fixed 400-tick timer immediately on creation |

### Event 10 - Constructor (the patched script)

```
tick 400
```

Every newly-spawned waste agent now gets a 400-tick cleanup countdown the moment it is created, before its (potentially never-firing) collision event has had a chance to run. After 400 ticks the waste's existing timer-event behaviour will run and tidy it up.

### Removal Script

None. The script ships no `rscr` block.

### Impact on Stimulus / Room CA

Indirect. Waste agents emit smell stimuli and contribute to room CA via the original `grazer2` (and related) scripts. By guaranteeing each waste agent eventually decays, this patch prevents the long-term accumulation of those CA contributions in worlds where collision-driven cleanup misfires. The patch itself does not write any stimuli or alter Room CA directly.
