# bramboo_patch.cos — Bramboo Ecology Patch

**Source file:** `Assets/Docking Station/Bootstrap/010 Docking Station Patches/bramboo_patch.cos`

## Overview

This is a **patch** (from the Docking Station Patches bootstrap folder) that updates the **Bramboo** plant ecology created by [bramboo](bramboo.md). It **creates no new agent classes** — instead it modifies two existing ones:

1. It attaches an **anti-extinction re-inject timer** to the Norn Meso **archway** (`1 1 165`): every ~2400 ticks, if no Bramboo canes (`2 4 13`) or berries (`2 8 8`) exist anywhere, it re-injects `bramboo.cos` to repopulate them.
2. It **replaces the Bramboo berry timer** (`2 8 8`, event 9) with an improved version that grows the berry's petals (`2 7 6`), ages a plucked berry, and — when it rots in a suitable spot — **grows a brand-new Bramboo cane with mutated genetics**.

## Patched Agents

| Classifier | Name | Change | Description |
|---|---|---|---|
| 1 1 165 | Arch | Modification | Gains a timer that re-injects `bramboo.cos` if the Bramboo dies out |
| 2 8 8 | Bramboo Berry | Modification | Its timer (event 9) is replaced with the new petal/regrow/mutation logic |

(Growing a berry recreates the Bramboo's own components — petals `2 7 6` and a cane `2 4 13` — which are the classes defined by [bramboo](bramboo.md).)

## Behaviour

### Arch (1 1 165) — event 9

A long-tick watchdog: counts all Bramboo canes (`2 4 13`) and berries (`2 8 8`); if none remain, `ject "bramboo.cos" 4` re-injects the whole Bramboo agent to restart the population.

### Bramboo Berry (2 8 8) — event 9

- **Failsafe:** a berry that has lost its cane kills its petals and itself.
- **Petals:** an unsprouted berry spawns its petal parts (`2 7 6`), tinted from the berry's genetic colour variables.
- **Ageing:** a plucked/dropped berry gains gravity and ages.
- **Regrow with mutation:** once old enough and rotted, if the local environment is suitable (and not overcrowded — `call 1001`), it **mutates** its genetic height and its petal/fruit RGB-rotation-swap pigment genes (small random drift), then `new: comp`s a **new Bramboo cane** (`2 4 13`) carrying the mutated genetics, before dying.

The genetic mutation gives each new generation of Bramboo slightly different height and flower/fruit colours, so the patch makes the plant **evolve** over time.

## Removal Script

```
rscr
scrx 1 1 165 9
```

Removes the arch's re-inject timer script.

## Impact on Stimulus / Room CA

No creature stimuli are emitted. The patch reads the **local environment** before letting a berry regrow (the Bramboo's standard suitability check), so it interacts with Room CA in the same way the plant already does. Its notable effect is **evolutionary**: each regrowth mutates the Bramboo's genetic height and petal/fruit colours, and the arch keeps the species from going extinct.
