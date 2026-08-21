# single chemical graphing gadget.cos - Single Chemical Graph Gadget

**Source**: `Assets/Bootstrap/001 World/single chemical graphing gadget.cos`

## Overview

This script installs the **Single Chemical Graphing Gadget**, a compound diagnostic tool that lets the player monitor a single chemical concentration in a creature's bloodstream over time. When switched on, the gadget activates a graph part (`pat: grph`) that continuously plots the chemical level (0–1 → 0–255) of the first creature in range. The gadget reports the chemical's short name (read from the `short_chemical_names` catalogue, falling back to the `Unknown Chemical` catalogue) as a text caption, and spawns a small floating sprite anchored to the monitored creature to mark it visually.

The chemical being tracked is selectable externally through the gadget's input port — other gadgets (such as chemical selectors) send the chemical index as a port signal, and the gadget re-labels itself and re-binds the indicator accordingly. An output port broadcasts the current chemical value (scaled to 0–255) so downstream gadgets (graphs, switches, etc.) can react. The gadget is part of the Ark's scientific equipment in the lower laboratory area.

## Created Agents

| Classifier | Name | Sprite | Description | Detail |
|---|---|---|---|---|
| 3 3 50 | Single Chemical Graphing Gadget | `euro scgg` | Port-wired compound gadget that graphs a chosen chemical over time for the nearest creature | [Detail](#single-chemical-graphing-gadget-3-3-50) |
| 1 1 118 | Chemical Monitor Indicator | `euro scgg` | Small floating sprite attached to the creature being monitored | [Detail](#chemical-monitor-indicator-1-1-118) |

---

## Single Chemical Graphing Gadget (3 3 50)

A compound agent made of several parts: a body, a toggle button, a text caption, a graph, an input port, and an output port. The gadget starts in the off state. Pressing the button toggles it on: it selects the first creature found within range via `etch`, binds an indicator sprite to that creature, and begins plotting the chemical concentration. Pressing the button again turns the gadget off, killing the indicator and stopping the graph.

### Properties

| Property | Value | Notes |
|---|---|---|
| `attr` | 199 | Carryable (1) + Mouseclickable (2) + Activatable 1 (4) + Activatable 2 (128) + Greedy Cabin (64) combined bitfield |
| `bhvr` | 8 | Creatures can Hit |
| `elas` | 20 | Slight bounce |
| `perm` | 64 | Permeability |
| `accg` | 20 | Gravity |
| `aero` | 20 | Aerodynamic factor |
| `puhl` | -1, 60, 80 | Pickup hold offset for all poses: (60, 80) |
| `emit` | CA 10 at 0.35 | Emits CA 10 (Machinery / science-marker) into the room |
| `ov61` | 120 | CA smell emission intensity |

### Initial Placement

| Instance | Position | Notes |
|---|---|---|
| 1 | (1915, 3624) | Lower Ark laboratory |

### Compound Parts

| Part | Type | Sprite | First Image | Relative Position | Purpose |
|---|---|---|---|---|---|
| 0 | Body | `euro scgg` | 0 | (0, 0) | Main gadget body; plays on/off animation `[0..6]` / `[6..0]` |
| 1 | `pat: butt` | `euro scgg` | 14 | (71, 109) | On/off toggle button; triggers message 1000 when pressed |
| 2 | `pat: fixd` | `euro scgg` | 12 | (101, 0) | Caption text (`WhiteOnTransparentChars`) showing `"<chem short name> (<index>)"` |
| 4 | `pat: grph` (created when switched on) | `euro scgg` | 11 | (18, 19) | Graph panel (31 samples); created on-demand |

### Ports

| Direction | Index | Name | Description | Position | Script |
|---|---|---|---|---|---|
| Input | 0 | `single chemical graphing gadget input` | Receives the chemical index to monitor | (106, 142) | Triggers script 1001 |
| Output | 0 | `single chemical graphing gadget output` | Emits the current chemical value scaled to 0–255 | (51, 142) | — |

### Agent Variables

| Variable | Initial | Purpose |
|---|---|---|
| `ov00` | 0 | On/off state (0 = off, 1 = on) |
| `ov16` | null | Reference to the attached [Chemical Monitor Indicator](#chemical-monitor-indicator-1-1-118) |
| `ov17` | null | Temporary reference to previous indicator (used to destroy it during toggle/reset) |
| `ov61` | 120 | CA smell emission intensity |
| `ov70` | — | Cached formatted chemical label string (`"name (index)"`) |
| `ov71` | 34 (default when toggled on without port signal) | Currently monitored chemical index |
| `ov72` | 1 | Flag (likely marks the gadget as port-aware / initialized) |
| `ov73` | — | Transient flag set when the port script forces the gadget on |

### Events

| Event # | Event Name | Description |
|---|---|---|
| 1 | Activate 1 (button pressed) | Button press handler; forwards to message 1000 |
| 1000 | Message 1000 | Toggles the gadget on/off |
| 1001 | Port Input (input port 0) | Sets the chemical to be monitored; turns the gadget on if off |
| 9 | Timer | Periodic update (every tick while on); refreshes graph and label |
| 3 | Collision / Hit | Reacts when hit by something (including creatures) |
| 4 | Pickup | Stimulus feedback to a creature that picks it up |

---

#### Event 1 — Activate 1 (Button Pressed)

Simple dispatcher: sends message **1000** to self (`mesg writ ownr 1000`). This is triggered from the `pat: butt` button part's own range-1000 activation. Keeps the toggle logic in a single place.

#### Event 1000 — Toggle On/Off

Locked script. Branches on `ov00`:

- **If `ov00 = 0` (currently off → turn on):**
  1. Plays sound `"bep2"`.
  2. Restores pickup handle to default (`puhl -1 69 75`).
  3. Selects part 0 and plays startup animation `[0 1 2 3 4 5 6]`, then `over` waits for it to finish.
  4. Plays sound `"pi_1"`.
  5. Creates the graph part (part 4, `pat: grph`) at (18, 19), size 31, sprite base 11.
  6. Calls `grpl` on the graph with a random RGB color (each channel 70–255) to assign a distinct trace color for this session, range 0–1.
  7. Sets `ov00 = 1` (on), clears `ov16`/`ov17`, sets `ov71 = 34` (default chemical index), and switches tick rate to 1 (periodic timer firing).

- **If `ov00 = 1` (currently on → turn off):**
  1. Plays sound `"bep2"`.
  2. Destroys the graph part (`pat: kill 4`).
  3. Clears the caption text on part 2 (`ptxt ""`).
  4. Plays startup animation in reverse `[6 5 4 3 2 1 0]`, waits with `over`.
  5. Enters `inst` block: if `ov17` exists, kills that indicator agent; if `ov16` exists, kills it too.
  6. Releases `inst` via `slow`.
  7. Sets `ov00 = 0` and disables the tick (`tick 0`).

#### Event 1001 — Port Input (chemical selector)

Locked script. Receives the desired chemical index on the input port as `_p1_`:

1. Stores `_p1_` into `va00` and checks `0 < va00 < 256` (valid chemical index range).
2. Sets `ov71 = ftoi va00` (chemical index).
3. If the gadget is **off** (`ov00 = 0`), performs the same on-sequence as message 1000 (sound, animation, creates graph part with random color, sets `ov00 = 1`, clears `ov16`/`ov17`, sets `ov73 = 1`, enables tick).
4. Reads the chemical short name: `read "short_chemical_names" ov71`. If the returned string parses back to the same integer (indicating the catalogue entry was missing), falls back to `read "Unknown Chemical" 0`.
5. Formats the caption as `"<name> (<index>)"` and writes it to part 2 using `frmt 3 3 3 0 0 0 10` and `ptxt`.
6. Scans nearby agents with `etch 4 0 0` (family 4 = creatures) to find the first creature in range, storing a reference in `va16`. Only the first match is used.
7. Branches on how many creatures were found (`va00`) and whether an indicator (`ov16`) already exists:
   - **First creature found and no indicator yet (`va00 = 1 and ov16 = null`)**: reads `chem va71` from that creature (chemical concentration 0–1), then creates a new `simp 1 1 118` (the Chemical Monitor Indicator) bonded to the creature via `frel va16`. The indicator animates `[0..9] 255` and uses `flto -5 -5` to float slightly above-left of the creature. Saves the reference in `ov16`. Scales the chemical value `va50 * 255` and sends it via output port 0. Updates the graph via `grpv 0 va50`.
   - **Creature still present and indicator already exists (`va00 = 1 and ov16 <> null`)**: reads the chemical value from the tracked creature, sends the scaled value on port 0, updates the graph.
   - **No creature found (`va00 = 0`)**: copies `ov16` to `ov17` and kills the indicator agent, clears `ov16`.

#### Event 9 — Timer

Runs periodically while the gadget is on (triggered by `tick 1` set during toggle). Effectively performs the same sampling as event 1001 but without setting a new chemical index — it reads the chemical name/index from `ov71`, refreshes the caption, enumerates creatures via `etch 4 0 0`, and updates/attaches/removes the indicator exactly as above. This keeps the graph and indicator tracking the nearest creature as the population moves.

Unlike event 1001, the `etch` enumeration loop here tolerates null targets (`doif targ <> null`) — a defensive check against creatures dying mid-enumeration.

#### Event 3 — Collision / Hit

When something collides with or hits the gadget:
1. Targets `from` (the hitter).
2. If the hitter is a creature (family 4 genus 2), calls `prt: bang rand 60 100` — sends a random signal burst through all connected ports (same trick as NOT gate hits).
3. Sends **stimulus 92** (`HIT_MACHINE`) with intensity 1 to the hitter.
4. Targets self again, plays `"hit_"` sound effect, and applies a random upward velocity (`velo 0 rand -5 -10`).

#### Event 4 — Pickup

When a creature picks up the gadget:
1. Targets `from` (the picker).
2. If `fmly = 4` (creature), sends **stimulus 91** (`GOT_MACHINE`) with intensity 1 to it.

---

## Chemical Monitor Indicator (1 1 118)

A lightweight simple agent used purely as a visual marker. The graphing gadget spawns one of these and binds it to the creature it is currently monitoring, so the player can see at a glance which creature is being sampled.

### Properties

| Property | Value | Notes |
|---|---|---|
| `attr` | 48 | Suffer Physics (16) + Suffer Collisions (32) — but attached via `frel` so it follows the creature |
| Sprite | `euro scgg` | Shares sprite file with the gadget |
| First image | 15 | Small bubble/marker sprite |
| Plane | 1000 | Mid-foreground |
| `frel` | — | Relative-to anchor attached to the monitored creature |
| `flto` | -5, -5 | Position offset (up and left) from the anchor |
| Animation | `[0 1 2 3 4 5 6 7 8 9 255]` | Loops through 10 frames then repeats (255 = loop-to-start) |

### Events

The indicator defines no scripts of its own. Its entire lifecycle is driven externally by the graphing gadget:

| Event # | Event Name | Description |
|---|---|---|
| — | (created by gadget) | Spawned by the graphing gadget's events 1001 / 9 when a creature enters range |
| — | (killed by gadget) | Destroyed when the graphing gadget is toggled off, the monitored creature leaves range, or the chemical selection changes |

---

## Removal Script (rscr)

Cleanly uninstalls the gadget and any orphaned indicators:

1. `enum 3 3 50 → kill targ` — destroys all graphing gadgets.
2. `enum 1 1 118 → kill targ` — destroys all chemical monitor indicators.
3. Removes scripts 1, 1000, 3, 4, 1001 for classifier 3 3 50.

Note: event 9 (timer) is not explicitly removed with `scrx`. Since all agents are killed first, dangling timer scripts will have no instances to run against.

---

## Stimulus Summary

| Stimulus # | Name | Context | Effect on Creature |
|---|---|---|---|
| 91 | `GOT_MACHINE` | Creature picks up the gadget (event 4) | Biochemical feedback for obtaining machinery |
| 92 | `HIT_MACHINE` | Creature hits the gadget (event 3) | Biochemical feedback for hitting machinery |

## Room CA Effects

| CA Index | Name | Source | Amount | Ecological Role |
|---|---|---|---|---|
| 10 | Machinery / science marker | `emit` (constant while gadget exists) | 0.35 | Marks the lab area as containing diagnostic equipment |

## Port Signal Behavior

| Direction | Port | Behavior |
|---|---|---|
| Input 0 | Chemical selector | Value `_p1_` in range `(0, 256)` selects a chemical index; turns the gadget on if off |
| Output 0 | Chemical value | Scaled chemical concentration of the monitored creature: `chem × 255` |

## Catalogue Dependencies

| Catalogue | Usage |
|---|---|
| `short_chemical_names` | Looked up by chemical index `ov71` to produce the caption label |
| `Unknown Chemical` | Fallback label (entry 0) when the short name is missing or numeric-only |
