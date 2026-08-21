# immigrant checker.cos — The Immigrant Checker

**Source file:** `Assets/Docking Station/Bootstrap/010 Docking Station/immigrant checker.cos`

## Overview

This script creates the **Immigrant Checker** (`1 1 184`), the invisible background agent that is the receiving end of Docking Station's online creature-**warping** system. Every ~20 seconds it polls the network for incoming **"warp"** PRAY chunks (creatures another player has sent) and decides what to do with each one: route it to a matching **receive portal** (`3 9 1`), drop it into the **containment chamber** (`1 1 154`), or — if there's no valid destination, the sender is a **foe**, or the world is full — **reject it back to sender**. It also performs housekeeping on the per-creature travel/quarantine timers.

> **Dependency:** needs `portals.cos` — warped creatures arrive through portals.

State variables: `ov00` (current warp chunk), `ov01` (sender UserID), `ov02` (your UserID), `ov03` (creature moniker), `ov99` (a "stuck on my own creature" marker so it doesn't loop forever returning a creature to a world it's already heading to).

## Created Agents

| Classifier | Name | Sprite | Description |
|---|---|---|---|
| 1 1 184 | Immigrant Checker | `blnk` | Invisible online-immigration router — see [detail](#agent-1-1-184-immigrant-checker) |

## Agent 1 1 184: Immigrant Checker

A single invisible `new: simp` agent ticking every 400 ticks.

### Events

| Event | Number | Description |
|---|---|---|
| Timer | 9 | Run housekeeping, then process the next waiting warped creature |

### Event 9 — The immigration cycle

**Housekeeping first:**
- **Travel sickness:** deletes expired `<moniker>_travel` game variables (a 400-tick cooldown that stops a creature warping straight back out again).
- **Quarantine timeout:** any creature whose `<moniker>_quarantine` stamp is older than 72000 ticks is **returned to sender** (`toolong` subroutine).

**Then, if online (`net: line`):** turns on the "arrival" GUI indicator (top-left HUD `1 2 14`) and, if there's a waiting `warp` chunk and the world isn't at `total_population`, processes one creature through this decision chain:

1. Resolve the sender (`net: from`) and add them to the contact book (`1 1 157`) if new.
2. **Reject flag** set → import into the containment chamber.
3. **Sender is a foe** (`_group = 3`) → reject back with the foe flag.
4. **Genus gate** (unpatched worlds only) → reject non-norns.
5. **Portal routing** — look for a `receive` portal set for random-users, then for friends, then for this specific sender; the first match imports the creature **at that portal**.
6. **Containment routing** — likewise check the containment chamber's random/friend/specific receive settings; a match imports the creature **into the chamber**.
7. No destination → if it's **your own** creature, mark it sticky (`ov99`) and leave it; otherwise **reject back to sender** (`pray impo` + `net: expo "warp"`).

### Key subroutines

- **`portalimport`** — `pray impo`s the creature, moves it to the portal (`3 9 1`), wakes it, stamps the `_travel` cooldown, stims it **95 (travelled through portal)**, and sends the portal an "immigrant ahoy" message (1004).
- **`chamberimport`** — waits for the containment chamber (`1 1 154`) to be free, sends it "immigrant ahoy" (1001), `pray impo`s the creature into it (`spas`), stamps the `_quarantine` timer, and refreshes the Workshop Screen (`1 2 208`).
- **`chambercheck` / `chamberinactive`** — ensure the chamber has room (< 6 creatures) and isn't busy.
- **`toolong`** — return-to-sender for quarantine-expired creatures, triggering the chamber's warp animation.
- **`contactadd` / `guion` / `guioff`** — add the sender to the contact book and flash/clear the arrival indicator.

## Removal Script

```
rscr
enum 1 1 184
    kill targ
next
```

Kills the immigrant checker.

## Impact on Stimulus / Room CA

No Room CA is written. Its world effect is **importing and rejecting creatures**: it `pray impo`s warped creatures into the world (capped by `total_population`) at a portal or in the containment chamber, and `net: expo`s rejects back out. Creatures imported **through a portal are stimmed with 95 (travelled through portal)**. It also manages the network contact book and per-creature travel/quarantine timers.
