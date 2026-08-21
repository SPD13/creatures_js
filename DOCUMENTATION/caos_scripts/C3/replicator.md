---
title: replicator
type: CAOS Script Documentation
---

# replicator.cos

**Source**: `Assets/Bootstrap/001 World/replicator.cos`

## Overview

This bootstrap script installs the **Replicator** machine in the world. The Replicator is a Bioenergy-powered device that duplicates ("twins") an item or creature placed in its cabin. It accepts agents inside its cabin (compound vehicle, classifier `3 3 25`), and on the press of its primary button:

- For **creatures** (family `1 1 100` — Norn) it scans the creature's `avar` slots for **carryable** items (`attr & 2`) and twins each at a configurable Bioenergy cost (100 per item).
- For any **other agent** (a generic item) it twins the agent once and consumes that agent's `ov61` (its declared bioenergy cost) from the global `"Bioenergy"` pool.

Two extra `simp` agents (`3 3 28` and `3 3 29`) are placed next to the machine as **indicator sliders** — one shows the current Bioenergy reserve, the other shows the cost of the last replication. The replicator is wired into the world economy through the global `game "Bioenergy"` variable and broadcasts status messages to any connected `1 1 91` stats / display agents (composing an "Agent Help" string for an external help readout).

The replicator's "energy slider" (`ov02`, range 0–19) charges up over a series of `tick` cycles via event 9; when fully charged the player can press the replicate button (event 2001) to perform the duplication. Event 2000 is the on/off button that arms or disarms the machine.

## Created Agents

| Classifier | Name | Role | Detail |
|---|---|---|---|
| 3 3 25 | Replicator (vehicle) | Main Replicator machine — cabin, buttons, animations and the duplication logic | [Detail](#replicator-3-3-25) |
| 3 3 28 | Bioenergy reserve indicator (simp) | Slider showing current Bioenergy reserve, positioned by the Bioenergy game variable | [Detail](#bioenergy-reserve-indicator-3-3-28) |
| 3 3 29 | Replication cost indicator (simp) | Slider showing the cost of the last replication, positioned by an incoming `_p1_` value | [Detail](#replication-cost-indicator-3-3-29) |

---

## Replicator (3 3 25)

A vehicle agent (`vhcl`, image base 25, plane 10) at world position `(6112, 3505)` using sprite file `replicator`. Its cabin (`cabn 75 0 180 110`, `cabp 50`) holds the agent or creature to be duplicated. `attr 8` gives it physics collision; `perm 60` makes it solid; `bhvr 0` blocks creature interaction with the body itself (interaction is via the buttons). It has `ov02` initialised to `19` (energy bar starts full) and `ov90 = 0` (idle multiplier).

The vehicle is built up from several parts:

| Part | Kind | Description |
|---|---|---|
| 0 | input port `inew` ("detect in" / "activation value") | Slot 5/32, message `1000` — wire-in trigger |
| 0 | output port `onew` ("detect out" / "creature (type or range?)") | Slot 4/48 — wire-out for an external creature signal |
| 1 | `butt` (msg 2000) | The on/off / arm button — animates 12 frames then loops |
| 2 | `butt` (msg 2001) | The replicate (commit) button |
| 3 | `dull` | Energy bar visual — `pose ov02` driven by event 9 |
| 4 | `dull` | Cabin / chamber visual |
| 5–8 | `dull` | Decorative / state-flash overlays (parts 7 and 8 use base offset 7990 — high plane decorations) |

After both companion `simp` agents are created, the script does `rtar 3 3 25` and writes their `targ` references into the replicator: `ov18 = va01` (the reserve indicator) and `ov19 = va02` (the cost indicator).

### Events

| Event | # | Purpose |
|---|---|---|
| Message | 9 | Tick — charge the energy slider one frame at a time |
| Message | 124 | Status broadcast — push current cost / "Agent Help" to indicators and stats agents |
| Message | 2000 | Arm / disarm button — toggles the machine on, plays sounds and intro animation |
| Message | 2001 | Replicate button — performs the actual duplication |

#### Message 9 — Tick (charge energy bar)

Increments `ov02` by 1 each tick. While `0 ≤ ov02 ≤ 19`, sets part 3's pose to `ov02` (visually filling the energy bar). When `ov02` reaches 20 it clamps back to 19, calls `tick 0` to stop the timer and clears `ov01` (re-enabling button input). This is how the machine "rearms" itself between cycles.

#### Message 2000 — Arm / disarm (on-off button)

Branches on `ov00` (armed flag):

- **If `ov00 = 0` (currently off)**: plays `"bp_1"` and starts looping `"cyc2"` sound. Animates part 1 to `[1]` (button pressed), parts 6 and 7 through their full active animation `[1..16 255]` (looping). Sends `mesg wrt+ ov18 500 150 1 0` — tells the reserve indicator to position itself for "150 / 1 / 0". Sets `ov00 = 1`. If `ov02 < 19` it ticks every 10 frames so the energy bar continues charging.
  Then enumerates the cabin (`epas 0 0 0`) counting contents into `va88`. If `ov01 = 0`, `ov02 = 19`, `ov00 = 1` and `va88 > 0` (i.e. machine fully armed and a target is present), it grabs the cabin's content into `va16`, reads its `wild fmly gnus spcs "Agent Help" 0` catalogue string into `va69`, then enumerates all `1 1 91` controllers with `ov00 = 2` and broadcasts message `1001` carrying that help string — feeds an external help-text display.
  Finally `mesg writ ownr 124` triggers the status broadcast (cost) on this same agent.
- **If `ov00 = 1` (currently on)**: plays `"bp_1"`, sends `mesg wrt+ ov18 500 0 0 0` and `mesg wrt+ ov19 500 0 0 0` to zero both indicators. Animates parts 6, 7, 1 back to idle (`fade` on part 1 to fade it out). Resets `ov00 = 0`, `ov01 = 0`. Continues ticking if energy bar is still under 19.

#### Message 2001 — Replicate (commit)

Plays sound `"sc_2"`. Counts cabin contents into `va88`. Reads the X positions of both indicator agents (`ov18` and `ov19`) into `va52` and `va53`.

If the machine is armed (`ov00 = 1`), the script first looks for any creature inside the cabin with `fmly = 4` (special-case hand / pointer guard) and if found bumps it out via `rpas` then aborts (so the cycle doesn't trigger from a hand left in the cabin).

The main duplication only fires if **all** of: `ov01 = 0`, `ov02 = 19`, `ov00 = 1`, `va88 > 0`, and `va52 ≥ va53` (the reserve indicator's X position is at or past the cost indicator — i.e. you have at least as much Bioenergy as required). When the gate passes:

1. Plays the "firing" animation: part 2 flashes `[1 2 1 2 1 2]`, part 3 unwinds the energy bar `[19..0]` with `"stm1"` sound, part 8 flashes, part 4 plays `[0..5]`. The script `over`s to wait for the sequence.
2. Re-grabs the cabin contents into `va16` (now `va18` after `seta va18 targ`).
3. **Branch A — creature (`fmly = 1`, `gnus = 1`, `spcs = 100` — Norn)**:
   - Iterates `avar` slots in groups of three (`va50, va51, va52` starting at 0, 1, 2 then +3 each loop) reading them as agent references via `avar va18 vaXX`. Each triple is fed into `rtar` which retargets to one of those carried agents.
   - For every targeted carried item: if `targ <> null` and `game "Bioenergy" >= 100`, checks `attr & 2` (carryable / pickable). If yes:
     - Subtracts 100 from `"Bioenergy"`.
     - `stpt`s on the item, sends `mesg writ ov18 500` (zero out reserve indicator), `mesg wrt+ ov19 500 100 0 0` (set cost indicator to 100).
     - Calls `seta va17 twin va16 1` — **clones the carried item** (the `twin` command duplicates the agent, the `1` flag preserves its state).
     - Targets the new twin, sets its `ov60 = 0`, then `mvto`s it into either the entry chute `(6443, 3596)` or fallback `(6116, 3520)` and gives it a launch velocity `velo -20 -15` (bounce out of the chute).
     - Special: if the cloned item is `fmly 3 gnus 3 spcs 16` it `tick 1`s itself (kickstart its own update loop).
   - If energy is too low (`< 100`) it broadcasts the `"Energy"` catalogue string with sub-index 2 ("not enough") to all `1 1 91` controllers with `ov00 = 2`.
   - If the item is *not* carryable (`attr & 2 = 0`), broadcasts `"Energy"` with sub-index 0 (idle/normal) to controllers, plays the part-2 release animation `[2 1 2 1 0 1 0]`, and ticks every 10 frames.
4. **Branch B — generic agent (anything other than the Norn)**: reads `ov61` (the agent's own declared cost) into `va89`, subtracts that from `"Bioenergy"`, twins the agent, and launches the twin from `(6443, 3596)` with `velo -20 -15`. No per-slot iteration — the whole agent is copied once.
5. After either branch: `targ ownr`, sets `ov01 = 1` (re-armed lockout), resets `ov02 = 0` (energy bar empty, will re-charge via event 9), `tick 10`, `over`, `wait 10`, then animates part 8 back `[1]` and part 4 reverse `[5..0]` for the closing flourish.

If the gate fails (insufficient energy, no contents, etc.) and the machine is on, broadcasts `"Energy"` index 0 to controllers and plays the failed-press animation on part 2 with `tick 10`.

> Stimulus / CA impact: subtracts from the world `game "Bioenergy"` pool. New twin agents are spawned and ejected at `(6443, 3596)` (or `(6116, 3520)` if that target is blocked). When duplicating a Norn's carried items, each carried item costs 100 Bioenergy regardless of its `ov61`.

#### Message 124 — Status broadcast

Recomputes `va88` (cabin contents count) and gates on `ov01 = 0`, `ov00 = 1`, `va88 > 0`. If satisfied, fetches the cabin content into `va16`, reads its `"Agent Help"` catalogue string into `va69`, then computes the cost: for a Norn (`fmly 1 gnus 1 spcs 100`) the cost comes from `ov97`, otherwise from `ov61`. Stores in `va89`.

Broadcasts the help string to every `1 1 91` controller with `ov00 = 2` (the help-text receivers). Then sends `mesg writ ov18 500` (zero the reserve indicator) and `mesg wrt+ ov19 500 va89 0 0` (move the cost indicator to the cost value), so the player sees the price of the pending operation on the second slider.

---

## Bioenergy reserve indicator (3 3 28)

A `simp` agent (image base 28, plane 11) at `(6400, 3670)`, `attr 0` (no physics, no clicks). Stored as `va01` at install and back-linked into the replicator's `ov18`.

### Events

| Event | # | Purpose |
|---|---|---|
| Message | 500 | Reposition the slider based on Bioenergy and an external multiplier |

#### Message 500 — Reposition

`rtar 3 3 25` to fetch the replicator (`va16 = targ`), then re-targets self. Reads `avar va16 0` (the replicator's `ov00` armed flag) — if armed:

- Enumerates `1 1 91` controllers with `ov00 = 2` and copies that controller's `ov02` into `va77` (the user's "scale" setting from the controller dial).
- Computes `va00 = 150.0 / 1000 * game "Bioenergy" * (va77 / 100)` — i.e. position offset proportional to current Bioenergy (clamped at 1000) scaled by the dial.
- `mvto` to `(6400 + va00, 3670)` — slides the indicator right as Bioenergy and dial value increase.

If the replicator is **not armed**, snaps the indicator back to its rest position `(6400, 3670)`.

> Note: `game "Bioenergy"` is clamped to **1000** here as a side effect — if it exceeds 1000 the script writes 1000 back into the global, capping the displayable / usable Bioenergy reserve.

---

## Replication cost indicator (3 3 29)

A `simp` agent (image base 29, plane 11) at `(6400, 3690)`, `attr 0`. Stored as `va02` at install and back-linked into the replicator's `ov19`.

### Events

| Event | # | Purpose |
|---|---|---|
| Message | 500 | Reposition the slider based on the cost passed as `_p1_` |

#### Message 500 — Reposition

Reads `_p1_` into `va00` (the cost value sent by the replicator's event 124 or 2001), computes `va01 = 150.0 / 1000 * va00`, then `mvto` to `(6400 + va01, 3690)`. Clamped between X = 6400 and X = 6555 — the cost slider visually mirrors the reserve slider but on the row below, letting the player compare "cost vs. available" at a glance (the replicator's own gate uses `va52 >= va53` against these two indicators' X positions).

---

## Global game variables

- `game "Bioenergy"` — read and decremented by event 2001 (`-100` per carried item duplicated, or `-ov61` per generic agent). Clamped to a maximum of `1000` by the reserve indicator's event 500.

## Catalogue tags

- `wild fmly gnus spcs "Agent Help" 0` — fetched per-content for the help text broadcast.
- `read "Energy" 0` / `read "Energy" 2` — broadcast to `1 1 91` controllers as status feedback (idle vs. "not enough energy").

## Remove Script (rscr)

Enumerates and kills all `3 3 25` agents (and `scrx` removes scripts 1, 2, 9, 1000, 2000, 2001, 2002, 2003 for that classifier) plus all `3 3 28` and `3 3 29` agents, so re-running the installer cleanly reinstantiates the replicator and both indicators.
