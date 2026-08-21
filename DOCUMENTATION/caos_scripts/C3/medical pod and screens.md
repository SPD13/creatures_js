# medical pod and screens.cos - Medipod & Diagnostic Screens

**Source**: `Assets/Bootstrap/001 World/medical pod and screens.cos`

## Overview

This script installs the Shee Medical Pod station in the Norn Terrarium. The installation consists of an interactive medipod (a vehicle that accepts a creature for examination) plus two stand-alone wall panels:

- A "mediscreen" + medical_main background that opens a full diagnostic console (disease & injury screen, chemical graphing screen and an injection syringe).
- A "disease and injury screen" panel that reports the subject creature's concussion count, worst chemical concentration, heart condition and physical-condition level.

When the medipod is activated it opens its bay (`dpas 4 0 0`) and accepts a dropped creature; once a creature is inside and the pod closes, the disease/injury screen retargets that creature and begins periodic polling of its chemical state. A medical control panel below the mediscreen offers three buttons: open the disease/injury screen (2334), open the chemical injection screen (5557), and open the chemical graphing group selector (2358). The graphing selector lets the user pick one of six catalogue-defined chemical groups; submitting the selection builds the graph panel which plots up to six chemical concentrations on the captured creature in real time. The injection screen lets the user dial a chemical index (0–255) and a dose (0–1.0) and inject it into the captured creature.

The script is a pure bootstrap: it creates the agents, wires all their event scripts, and tears them down cleanly in the `rscr` section.

## Created Agents

| Classifier | Name | Sprite | Description | Detail |
|---|---|---|---|---|
| 1 1 60 | mediscreen | `mediscreen` | Wall panel that opens the medical main console | [Detail](#mediscreen-1-1-60) |
| 1 1 61 | medipod | `medipod` | Vehicle medipod that accepts and examines a creature | [Detail](#medipod-1-1-61) |
| 1 1 62 | medical_main (left) | `medical_main` | Left half of the medical main background when opened | [Detail](#medical_main-left-1-1-62) |
| 1 1 63 | medical_main (right) | `medical_main` | Right half of the medical main background when opened | [Detail](#medical_main-right-1-1-63) |
| 1 1 64 | medical_control_panel_buttons | `medical_control_panel_buttons` | Button bar under mediscreen (injection / graphing / disease buttons) | [Detail](#medical_control_panel_buttons-1-1-64) |
| 1 1 65 | syringe (injection panel) | `syringe` / `injection` | Chemical injection UI (chem index, dose, inject) | [Detail](#syringe--injection-panel-1-1-65) |
| 1 1 66 | graphing (decor) | `graphing` | Decorative animated frame of the graphing panel | [Detail](#graphing-decor-1-1-66) |
| 1 1 67 | graphing group selector | `graphing` | Selects one of six catalogue-defined chemical groups | [Detail](#graphing-group-selector-1-1-67) |
| 1 1 68 | graphing labels | `graphing` | Text labels for the graph lines + close button | [Detail](#graphing-labels-1-1-68) |
| 1 1 69 | graph | `graph` / `graphing` | Live chemical graph with speed controls | [Detail](#graph-1-1-69) |
| 1 1 70 | medipod (decorative seal) | `medipod` pose 41 | Decorative "slow" overlay on the medipod when idle; killed when pod opens | [Detail](#medipod-decorative-seal-1-1-70) |
| 1 1 71 | disease and injury screen | `disease and injury screen` | Wall panel reporting concussions, worst chemical, heart, physical condition | [Detail](#disease-and-injury-screen-1-1-71) |

---

## mediscreen (1 1 60)

Small wall panel at `(1170, 3565)`, attr 16 (invisible to creatures), created on the left of the medipod wall. Its single button part (classifier 6538) opens the medical main console by spawning agents `1 1 62`, `1 1 63` and `1 1 64`. `ov80` is used as a latch for the open/close state.

### Events

| Event # | Event Name | Description |
|---|---|---|
| 1 | Activate 1 | Plays the open animation and re-arms `clac` |
| 2 | Activate 2 | Plays the close animation and re-arms `clac` |
| 6538 | Custom — Open/Close Medical Main | Toggles the medical main console (creates or kills the child panels) |
| 6897 | Custom — Stub | Empty stub (both branches of `doif ov01` are no-ops) |

#### Event 6538 — Open/Close Medical Main
When `ov00 = 0`: plays `"bep2"`, animates the screen open, plays `"mopn"`, and creates three child agents anchored around the mediscreen: `1 1 62` (medical_main left half) at `(1403, 3592)`, `1 1 63` (right half) at `(1177, 3597)` and `1 1 64` (the control-button bar) at `(1179, 3750)`. The button bar is populated with five parts: the injection button (5557), the graphing button (2358), the disease-screen button (2334), two inert buttons (3824/4358 → just play "excl") and a fixed text label that reads catalogue `"chemical graphing and chemical injection screen"` line 2. Sets `ov01 = 1` (console open).

When `ov00 = 1`: kills every child panel via `etch 1 1 62`, `etch 1 1 63`, `etch 1 1 64`, and `enum`-killing any stray `1 1 65`/`66`/`67`/`68`/`69` panels so no orphaned UI remains. Plays `"mcls"`, reverse-animates, clears `ov01`, `ov00`, `ov98`.

---

## medipod (1 1 61)

The main medipod at `(1760, 3577)`, a vhcl family-1 genus-1 species-61. It is physical (`attr 4`), behaves as a vehicle/container (`bhvr 8`), and defines a cabin rectangle via `cabn 30 25 145 175` (cabin plane `cabp 0`). Five decorative dull parts render the pod body. An input port `inew 0 "input"` accepts external 5656 signals and an output port `onew 0 "output"` relays signals to listeners. `ov00` tracks whether the pod is open (0 = closed, 1 = open). `ov16` holds a pointer to the currently-held creature; this OV is what every screen reads to determine their subject.

### Events

| Event # | Event Name | Description |
|---|---|---|
| 1 | Activate 1 | Open or close the pod; on close, captures the first passenger as `ov16` and triggers the disease screen |
| 3 | Deactivate (Collision with item) | Stimulates the colliding agent (stim 92) and bangs a grendel `fmly=4 gnus=2` collider |
| 125 | Eat | Same open sequence as Activate 1, stage 1 only (one-shot open) |
| 5656 | Custom — Input port signal | Routed from input port: negative → relay to output, positive → same behaviour as Activate 1 |

#### Event 1 — Open/Close
When `ov00 = 0` (closed → open): plays the open animation on parts 3/1/0, plays "pod1" + "stm1" sounds, opens the cabin via `dpas 4 0 0`, kills any `1 1 70` decorative seal, sets `attr 12` (no longer collectable), flips `ov00 = 1`, and relays `prt: send 0 255` on the output port.

When `ov00 = 1` (open → close): plays the close animation and "stm1" sound, `gpas 4 0 0 0` (gets passengers). Then enumerates cabin passengers with `epas 4 0 0`:
- The first passenger is captured as `ov16` (subject creature). Any object the passenger is holding receives `mesg writ targ 5` (dropped → deactivate).
- Any additional passengers beyond the first are ejected via `rpas ownr targ`.

A second pass via `epas 0 0 0` ejects any non-creature (`fmly <> 4`) left in the cabin. If a subject was captured, retargets `1 1 71` (disease screen) and calls `tick 2` to start polling. Closes the cabin, reverts `attr 4`, relays `prt: send 0 255`, and spawns a decorative `1 1 70` seal overlay. `ov00 = 0`.

#### Event 3 — Collision
Stimulates the collider with `stim writ targ 92 1`. If the collider is a grendel (`fmly = 4 and gnus = 2`) fires `prt: bang rand 60 100` (a physical impact burst).

#### Event 5656 — Input Port
Reads `_p1_`; if `<= 0` forwards it on the output port, otherwise executes the same body as event 1 (remote open/close).

#### Event 125 — Eat
Duplicates the "closed → open" branch of event 1 (open the bay, accept the subject, retarget the disease screen). Used when the pod is `eat`-activated by a creature.

---

## medical_main (left) (1 1 62)

A decorative simp at `(1403, 3592)`, sprite `"medical_main"` pose 0, plane 11. Purely visual background for the left half of the opened medical main console. No event scripts; killed by `etch 1 1 62` when the console closes.

---

## medical_main (right) (1 1 63)

A decorative simp at `(1177, 3597)`, sprite `"medical_main"` pose 1, plane 11. Mirror-image visual background for the right half. No event scripts; killed by `etch 1 1 63` when the console closes.

---

## medical_control_panel_buttons (1 1 64)

Compound button bar at `(1179, 3750)`, attr 16. Owns six button/label parts plus a fixed text header. Its scripts launch the three sub-panels and clean up previous panels.

### Events

| Event # | Event Name | Description |
|---|---|---|
| 2334 | Button — Open Disease/Injury Screen | Not used directly (the disease screen `1 1 71` already exists); kills any open graphing or injection panels and re-plots the disease screen text |
| 2358 | Button — Open Graphing Group Selector | Kills stale panels and spawns `1 1 66` + `1 1 67` |
| 3824 | Button — Inert | Plays `"excl"` (disabled) |
| 4358 | Button — Inert | Plays `"excl"` (disabled) |
| 5557 | Button — Open Injection Screen | Kills stale panels, animates the syringe label, spawns `1 1 65` |

#### Event 5557 — Open Injection Screen
Plays `"bep2"`, clears the header text, animates part 6 (syringe icon) to pose 1. Spawns the syringe panel `1 1 65` at `(1178, 3595)` with its seven button parts (inject 6589, chem-down 2353, chem-up 7863, dose-dial 2597, chem-down-10 2354, chem-up-10 7864) and a text label. Initializes the panel's OVs: `ov50 = 1` (chem index), `ov18 = ownr` (pointer back to the button bar). Finds the current medipod subject (`ov16`) via `rtar 1 1 61` and propagates it to the new syringe's `ov16`. Calls `tick 1` on the syringe (so its `9` timer script starts refreshing the chem name).

#### Event 2358 — Open Graphing Group Selector
Plays `"bep2"`, kills any existing `1 1 66..69`, then creates:
- `1 1 66` — decorative "graphing" simp at `(1182, 3599)` running a 14-frame animation.
- `1 1 67` — compound at `(1410, 3595)` with six selector buttons (9864, 7586, 6421, 8759, 2105, 6007) and six text labels populated from catalogue `"chemical graphing groups"` lines 0–5.

#### Event 2334 — Disease Screen Button
Intended as a button to force-refresh the disease screen — it kills any `1 1 65..69` panels, retargets `1 1 62` and sets `plne 11`, then replots the header text. (The disease screen `1 1 71` is independent and continues to run on its own tick.)

#### Events 3824 / 4358 — Inert
Simply play `"excl"` (disabled beep). No further effect.

---

## syringe / injection panel (1 1 65)

Compound at `(1178, 3595)`, attr 16, plane 13. Provides the chemical injection UI. OVs:

| OV | Meaning |
|---|---|
| `ov16` | Subject creature (mirrors the medipod's `ov16`) |
| `ov18` | Pointer back to the parent control panel |
| `ov50` | Selected chemical index (1–255) |
| `ov90` | Dose (0–10, in 0.1 increments) |
| `ov91` | `ov90 / 10.0` — actual dose passed to `chem` |

### Events

| Event # | Event Name | Description |
|---|---|---|
| 9 | Timer | Refreshes the chemical-name label each tick |
| 6589 | Button — Inject | Injects `ov91` of chemical `ov50` into the subject |
| 2353 | Button — Chem Index −1 | Decrements `ov50` (wraps 1→255) |
| 7863 | Button — Chem Index +1 | Increments `ov50` (wraps 255→1) |
| 2354 | Button — Chem Index −10 | Decrements `ov50` by 10 (wraps through 246..255) |
| 7864 | Button — Chem Index +10 | Increments `ov50` by 10 (wraps 246..255→1..10) |
| 2597 | Button — Dose Dial | Cycles dose 0→10 then wraps to 0; `ov91 = ov90 / 10` |

#### Event 9 — Timer
Looks up `ov50` in catalogue `"short_chemical_names"`. If the lookup returns a non-numeric name, formats the label as `"NAME (index)"`. If the catalogue entry is just the index (unknown chemical), falls back to `read "Unknown Chemical" 0` and appends `" (index)"`.

#### Event 6589 — Inject
Plays `"inje"`, animates part 4 (plunger) from `ov90` down to 0. Finds the subject via `rtar 1 1 61` → `ov16`, then `targ ov16` and calls `chem ov50 ov91` to apply the dose. Plays `"ow!1"` on the creature. Resets `ov91 = 0`.

#### Chem Index Buttons (2353, 7863, 2354, 7864)
Increment or decrement `ov50` with wrap-around at 255 ↔ 1. All play a short click sound and briefly pose the corresponding part to "pressed" then back to "idle" after a 6-tick wait.

#### Dose Dial (2597)
Each press adds 1 to `ov90`, cycling back to 0 at 11. `ov91 = ov90 / 10.0`.

**Stimulus / CA impact**: injecting through this panel directly sets the creature's chemical `ov50` level via `chem` — full C3 biochemistry impact (potentially any of the 256 chemicals, including drives, receptors, hormones or toxins). Plays the creature's pain sound `"ow!1"` but does not issue a `stim writ`.

---

## graphing (decor) (1 1 66)

Purely decorative simp at `(1182, 3599)`, sprite `"graphing"` pose 35, plane 13. Runs a one-shot 14-frame animation on creation then holds. No event scripts. Killed when the graphing group selector is dismissed or when the main console closes.

---

## graphing group selector (1 1 67)

Compound at `(1410, 3595)`, attr 16, plane 16. Six buttons select which of the six catalogue-defined chemical groups to graph. OVs `ov81..ov86` are per-button latches; `ov80` is a global "one of them is set" latch. Text labels (parts 7..12) display the six group names from catalogue `"chemical graphing groups"`.

### Events

| Event # | Event Name | Description |
|---|---|---|
| 9864 | Button — Group 1 | Sets `ov81 = 1`, sends mesg 6483 to self |
| 7586 | Button — Group 2 | Sets `ov82 = 1`, sends mesg 6483 to self |
| 6421 | Button — Group 3 | Sets `ov83 = 1`, sends mesg 6483 to self |
| 8759 | Button — Group 4 | Sets `ov84 = 1`, sends mesg 6483 to self |
| 2105 | Button — Group 5 | Sets `ov85 = 1`, sends mesg 6483 to self |
| 6007 | Button — Group 6 | Sets `ov86 = 1`, sends mesg 6483 to self |
| 6483 | Custom — Group Confirmed | Tears down the selector and spawns the graph + labels panels |

#### Event 6483 — Group Confirmed
Plays `"bep2"`, snapshots which `ov8X` flag is set into `va81..va86`, sets the medical_main (left) to plane 14 (behind the graph), kills any stray `1 1 67`, wipes its own parts, then creates:

- `1 1 69` — the live graph compound at `(1178, 3595)`. Part 1 is a `pat: grph 1 "graphing" 7 270 22 2 32` (32 samples wide, 2 values tall) with six plot lines via `grpl`:
  - line 0: orange `255 128 0`
  - line 1: green `255 0 198` (magenta-ish actually)
  - line 2: purple `121 0 255`
  - line 3: cyan `0 192 255`
  - line 4: mint `0 255 130`
  - line 5: yellow `255 240 0`
  Plus three control buttons (3497 speed up, 7659 slow down, 3594 pause toggle) and a background. `ov98 = 15` (initial tick period), `tick ov98`.
- `1 1 68` — text labels + close button `(1177, 3593)`: seven fixed-text parts plus a close button (3829). The selected `ov81..ov86` flags are copied from the local snapshot so both panels know which group is active.

Finally `kill ownr` — the selector destroys itself once the graph is spawned.

---

## graphing labels (1 1 68)

Compound at `(1177, 3593)`, attr 16, plane 17. Displays the selected group's name and the six short chemical names alongside the graph. The close button (part 8) tears down the graph panels.

### Events

| Event # | Event Name | Description |
|---|---|---|
| 9 | Timer | Reads the active graph group from catalogue and repaints all seven text parts |
| 3829 | Button — Close Graph | Kills `1 1 62` (medical_main left) and `1 1 64` — dismisses the whole medical console |

#### Event 9 — Timer
Based on which `ov8X` flag is set, reads six chemical indices from catalogue `"chemical graphing group N"` (N=1..6) into `ov71..ov76` and the group header from `"chemical graphing groups" N-1` into `ov70`. For each non-zero index, looks up the short name via `"short_chemical_names"`. Repaints parts 1..7.

#### Event 3829 — Close Graph
Kills the entire medical_main left panel (`etch 1 1 62`) and relays mesg 2358 to the control button bar `1 1 64` — which closes the graph cleanly and returns the mediscreen to graph-group-selector mode.

---

## graph (1 1 69)

Compound at `(1178, 3595)`, attr 16, plane 16 — the live chemical graph itself. OVs:

| OV | Meaning |
|---|---|
| `ov77` | Paused flag (0 = running, 1 = paused) |
| `ov97` | Saved tick rate when paused |
| `ov98` | Current tick rate (lower = faster) |
| `ov81..ov86` | Group selection flags (copied from selector) |

### Events

| Event # | Event Name | Description |
|---|---|---|
| 9 | Timer | Samples the six chemicals on the subject and pushes values to the graph |
| 3497 | Button — Speed Up | Decreases `ov98` (faster graph); "spup" sound; clamps to 1 |
| 7659 | Button — Slow Down | Increases `ov98` (slower graph); "spdn" sound; clamps to 50 |
| 3594 | Button — Pause Toggle | Toggles `ov77`; saves/restores `ov98` to/from `ov97` |

#### Event 9 — Timer
Re-arms `tick ov98`. Retargets the medipod to fetch the current subject. Retargets the labels `1 1 68` to read which group is active, then reads the six chemical indices for that group from catalogue into `va71..va76`. `targ ov16` (subject) and sample `chem vaN` for each; `grpv` pushes each sample into its plot line (0..5).

#### Speed / Pause Buttons
- **3497 Speed Up**: `ov98 -= 5` down to 1. Below 5 snaps to 1. At 1 plays `"excl"` (can't go faster).
- **7659 Slow Down**: `ov98 += 5` up to 50. Above 46 snaps to 50. At 50 plays `"excl"` (can't go slower).
- **3594 Pause Toggle**: Saves `ov98` to `ov97` and sets `ov98 = 0` (stops the tick) or restores `ov97 → ov98`.

**Stimulus / CA impact**: Read-only. Samples the subject creature's chemistry via `chem` but writes nothing.

---

## medipod (decorative seal) (1 1 70)

Decorative simp at `(1763, 3560)`, sprite `"medipod"` pose 41, plane 1, attr 0. Purely visual — represents a placeholder/seal on top of the closed pod. It is `slow`-registered at creation and killed by `enum 1 1 70 / kill targ` inside event 1 of the medipod every time the pod opens, then recreated when the pod closes. No event scripts of its own.

A second copy (`attr 0`, not `attr 16` — note the difference) is created during the cold-start sequence directly after the main medipod creation. The bootstrap creates one pose-41 decorative simp at the same location at `(1763, 3577)` with attr 0 (species 70).

---

## disease and injury screen (1 1 71)

Wall panel at `(1430, 3815)`, attr 1 (visible, mouseclickable), compound with a main button (2000) that toggles the panel open/closed. When open (`ov00 = 1`) it re-samples the medipod's captured creature every 2 ticks (via its timer script) and refreshes its text/graphic parts. `ov16` is the subject pointer (synchronized with the medipod's own `ov16`).

### Events

| Event # | Event Name | Description |
|---|---|---|
| 9 | Timer | Re-samples the subject and repaints all text/graphic parts (runs only while `ov00 = 1`) |
| 2000 | Button — Toggle Screen | Opens the panel (spawns parts 2–9) or closes it (kills those parts) |

#### Event 2000 — Toggle Screen
When `ov00 = 0` (closed → open): plays `"bep2"` + `"mopn"`, animates the frame. Retargets the medipod and imports its `ov16` as the subject. If a subject is present:
- Animates the open-hatch.
- `enum 2 32 23` — iterates all `fmly=2 gnus=32 spcs=23` agents (concussion/injury tokens) and counts how many reference the subject via `ov00`. Result → `va00` (total concussions).
- Loops chemicals 66..89 and finds the highest-value chemical → `va51 = value`, `va52 = index`. If all zero and max was at 66 (Glucose) → label becomes `"90"`.
- Samples `chem 127` (heart rate / physical) → `va02`, `chem 34` (heart condition / life) → `va03`.
- If `dead = 1`, sets `va66 = 666` (dead-creature flag).
- Populates `ov70..ov74` and `ov66` from the above.
- Creates six display parts: dull 2 (concussion icon), dull 3 (heart), dull 4 (physical bar), dull 5 (chem bar), fixd 6–9 (text labels).
- Maps the continuous values to 10-pose bars:
  - `ov73` (physical) → part 2 pose 0..9
  - `ov74` (heart) → part 3 pose 0/1–4/5–8 with `"noht"`/`"weak"`/`"hart"` sound effects. Dead creature forces pose 0 + "noht".
  - `ov70` (concussions) → part 4 pose 0..9
  - `ov72` (worst chemical) → part 5 pose 0..9
- Looks up the chemical name in catalogue `"disease and injury screen"` line 6 when the max chemical was Glucose (label `"90"`).
- Formats the four text fields using `frmt 0 0 0 0 0 0 0` + `ptxt` with strings from catalogue `"disease and injury screen"` lines 0–5.
- `tick 2` to begin periodic refresh.

If no subject is captured (`ov16 = null`): only the open animation plays and part 6 displays catalogue line 7 (e.g. "No creature detected").

When `ov00 = 1` (open → close): plays `"mcls"`, reverse-animates, kills parts 2..9.

#### Event 9 — Timer
While open, every 2 ticks: re-runs the concussion `enum`, chemical max scan and chem 127/34 samples, then updates all display parts. If the subject has become `null` (e.g. pod opened and released creature) it resets parts to pose 0, clears text, and `tick 0` to stop itself.

#### Event 125 — Override
The `scrp 1 1 61 125` script at the end of the file is actually attached to the medipod (1 1 61), not the disease screen — see the medipod section.

**Stimulus / CA impact**: Read-only. Uses `chem` and `dead` queries on the subject. No `stim writ` is issued. The concussion count is obtained by enumerating `2 32 23` tokens (the concussion-event tracker family).

---

## Removal Script (`rscr`)

Cleanly tears down every agent and event this script registered, in dependency order:

1. `enum`+`kill` all 1 1 60 (mediscreen) and detach scripts 1, 2, 6538, 6897.
2. `enum`+`kill` all 1 1 61 (medipod) and detach script 1.
3. `enum`+`kill` all 1 1 62, 1 1 63 (medical_main halves).
4. `enum`+`kill` all 1 1 64 and detach scripts 5557, 2358, 3824, 4358, 2334.
5. `enum`+`kill` all 1 1 65 and detach scripts 2597, 7863, 2353, 6589, 9.
6. `enum`+`kill` all 1 1 66, 1 1 67 and detach 67's scripts 9864, 6483, 7586, 6421, 8759, 2105, 6007.
7. Detach 1 1 61 script 3 (collision).
8. `enum`+`kill` all 1 1 68, 1 1 69, 1 1 70, 1 1 71 and detach 71's scripts 9, 2000.
9. Detach 1 1 61 script 125 (eat).

## Catalogue Files Referenced

- `short_chemical_names` — short names for all 256 chemicals; used by disease screen, injection panel and graph labels.
- `Unknown Chemical` — fallback label (line 0) for chemicals missing from `short_chemical_names`.
- `chemical graphing groups` — six group names (lines 0–5) displayed on the graph group selector and graph header.
- `chemical graphing group 1`..`chemical graphing group 6` — six chemical indices per group (lines 0–5).
- `chemical graphing and chemical injection screen` — header text (line 2) for the control button bar.
- `disease and injury screen` — labels for the disease panel:
  - 0/1/2 → heart states ("normal heartbeat" / "weak heartbeat" / "strong heartbeat" or similar)
  - 3 → physical-condition suffix
  - 4 → concussion suffix
  - 5 → chemical-reading suffix
  - 6 → "none" chemical (when max was Glucose with zero level)
  - 7 → "No creature detected" / empty-pod message
