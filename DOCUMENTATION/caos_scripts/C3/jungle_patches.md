# Jungle Patches

**Source file:** `Assets/Bootstrap/001 World Patches/jungle_patches.cos`

## Overview

This patch bootstrap from the `001 World Patches` directory does two distinct things, both rooted in fixing the Norn Jungle terrarium:

1. **One-shot scenery creation.** At install time it spawns three `2 4 2` waterplants in the piranha pond (X ranges 2500–2575, 2585–2625, 2645–2700, all at Y = 2150) so dragonfly nymphs have vegetation to climb. These are real agent instances created at bootstrap-execution time, not a script template.
2. **Scriptorium patch.** It replaces the Timer event (script `9`) of the Mossie-Fly egg agent (classifier `2 18 20`) to fix two bugs in the original hatching logic, called out by the header comments:

   > Fixes a bug where the Mossie Fly egg population checked for gnats instead of other mossie flies before hatching.
   > Lowers the local Mossie Fly population limit as a whole by about 25%.
   > Adds waterplants to the piranha pond so the dragonfly nymphs have something to climb.

The original timer counted the wrong species when deciding whether to hatch — it surveyed gnats (`2 14 ?`) instead of adult Mossie Flies (`2 14 4`), so the population cap never engaged correctly. The new script searches `2 14 4` and uses `15` as the cap (a 25 % reduction from the previous limit). It also validates the chosen position with `tmvt` before placing the freshly hatched adult.

There is no `rscr` removal block — patches are sticky for the lifetime of the world. The waterplant creation runs only once (during bootstrap of this directory); the timer replacement is permanent.

## Created Agents

| Classifier | Name | Description | Details |
|---|---|---|---|
| 2 4 2 | Waterplant (piranha-pond cluster) | Three decorative waterplants spawned in the piranha pond as climbable vegetation for dragonfly nymphs | [Details](#agent-2-4-2-waterplant-piranha-pond-cluster) |

## Modified Agents

| Classifier | Name | Description | Details |
|---|---|---|---|
| 2 18 20 | Mossie-Fly egg (Timer event 9 only) | Hatches into an adult Mossie Fly. Patch fixes a population-gate bug and lowers the cap by 25 %. | [Details](#agent-2-18-20-mossie-fly-egg-timer-patch) |

---

## Agent 2 4 2: Waterplant (piranha-pond cluster)

Three `simp` waterplants are placed at install time using `mvsf` (move-safely) at Y = 2150 with X randomised in three adjacent bands. The script alternates the sprite base (`va99` toggles between `0` and `8`) so consecutive plants use different art frames, giving visual variety.

The waterplants here are configured the same way as those produced by the original `waterplant.cos` script. The relevant install commands per plant are:

```
new: simp 2 4 2 "waterplant" 8 va99 500
attr 192          ; mouseable + carryable defaults
elas 0            ; no bounce
anim [0 1 2 3 4 5 6 7 255]   ; sway loop, holds on the last frame
mvsf va98 2150    ; place safely at randomised X, Y = 2150
tick 600          ; slow growth/idle pulse
setv ov61 10      ; sound channel
seta ov17 null    ; clear cached neighbour reference
```

The actual event scripts (collision, eat, etc.) for `2 4 2` are owned by the original `waterplant.cos` install script — this bootstrap only adds three live instances and configures their initial state. They participate in the rest of the waterplant lifecycle through those scripts.

### Events

This bootstrap does not register any event handlers for `2 4 2`. All scripts are inherited from the existing `waterplant` install. See the `waterplant` documentation for per-event details.

### Impact on Stimulus / Room CA

None directly from this script. The new waterplants will stimulate creatures via the standard waterplant scripts (already registered) — typically generating `eat` and `seek` opportunities for nearby agents — and may emit smells through their original install. This patch's only contribution is the spatial placement of three additional plants in the piranha-pond region.

---

## Agent 2 18 20: Mossie-Fly egg (Timer patch)

The Mossie-Fly egg (`2 18 20`) is the larval/egg form of the adult Mossie Fly (`2 14 4`). When its tick fires, it surveys the local population of adult Mossie Flies and, if their count is below the cap, hatches into a new adult at its own location. The classifier `2 18 20` is shared with the gnat egg in the original scriptorium — this patch overrides only its tick behaviour.

### Agent Variables Referenced by the Patch

| Variable | Purpose |
|---|---|
| `va00` / `va01` | Snapshot of the egg's anchor position (`posl` / `post`), used as the candidate hatch coordinate. |
| `va66` | Counter of nearby adult Mossie Flies seen via `esee 2 14 4`. The hatch-gate threshold. |
| `ov10` / `ov11` | Direction signs assigned to the new adult after hatching (random ±1). |
| `ov61` | Sound channel set on the new adult (`= 40`). |

### Events

| Event | Number | Description |
|---|---|---|
| Timer | 9 | Population-gated hatch attempt |

### Event 9 - Timer (the patched script)

The body runs as an atomic block (`inst`):

1. **Snapshot position** — `va00 = posl`, `va01 = post`.
2. **Set search radius** — `rnge 700` so `esee` will only match agents within 700 pixels.
3. **Count adult Mossie Flies** — `esee 2 14 4 … addv va66 1 … next`. **This is the bug fix**: the original walked a different classifier (gnats), which is why the cap never bound.
4. **Population gate** — if `va66 < 15` (the lowered cap), proceed to hatch; otherwise fall through and stop without spawning anything.
5. **Hatch** — `new: simp 2 14 4 "mossie" 24 0 300` (sprite "mossie", 24 frames, image base 0, plane 300). The newly created agent becomes the current `targ`.
6. **Configure the adult**:
   - `attr 66` — visible + mouseable defaults.
   - `bhvr 49` — interaction mask for creature behaviours.
   - `tick 5` — fast tick rate so the adult animates briskly.
   - `ov61 = 40` — sound channel.
7. **Position validation** — `tmvt va00 va01 ≠ 1` means the chosen point is not traversable; in that case `kill targ` and `stop`. Otherwise:
   - `mvto va00 va01` to place the adult.
   - Randomise `ov10` and `ov11` to `-1` or `+1` (avoiding 0) so the new adult starts moving in a random direction.

The egg itself is not killed by the timer — it remains in place and can hatch additional adults the next time the cap allows. (In the original world the egg's lifecycle and removal are handled by other scripts in `mosquito.cos`.)

### Removal Script

This script intentionally has no `rscr` block. Patches are sticky — once injected they remain in the scriptorium for the lifetime of the world.

### Impact on Stimulus / Room CA

None directly. The patch only changes the survey classifier and the population threshold; it does not write stimuli or modify Room CA. The indirect ecological effect is significant: with the population gate now actually working, adult Mossie Flies will stabilise around the new lower cap rather than over-running the world, restoring intended jungle balance.
