# Numeric Output Tool

**Source file:** `Assets/Bootstrap/001 World/numeric output tool.cos`

## Overview

The Numeric Output Tool is a CAOS Tool Kit component that lets the player build a numeric value (0–255) via three digit buttons and "send" that value out on an output port, where it can be wired into any other tool that accepts a numeric input. It is the counterpart of the Numeric Input Tool and a core building block of the tool kit used by script authors and advanced players to wire together in-world contraptions.

The tool is an activator-style compound agent with three on-screen text digits and three increment buttons (one per digit). Pressing a digit button wraps its value (with constraints so the total stays within 0–255). When the user activates the tool itself (Activate 1) — or when something on its input port triggers it — it plays a beep animation and sends the composed integer value to whatever is connected to its output port.

## Created Agents

| Classifier | Name | Description | Details |
|---|---|---|---|
| 3 8 18 | Numeric Output Tool | Tool-kit component that outputs a user-composed 0–255 integer on its output port | [Details](#agent-3-8-18-numeric-output-tool) |

---

## Agent 3 8 18: Numeric Output Tool

A compound agent built from the `numeric output tool` sprite. It has three fixed text parts showing each digit of the current value, three clickable button parts that increment each digit, one input port ("input") and one output port ("output"). It is placed at (1795, 3884) and emits 0.35 of CA 18 into the room.

**Attributes:** 199 (carryable, mouseable, activateable, etc.)
**Behaviour clicks:** 41 (Activate 1 + Activate 2 + Deactivate mask)
**Physics:** elas 20, accg 20, aero 20, perm 64
**Ports:**
- Input port id 0 ("input") — caption `numeric output tool input`, message 2005
- Output port id 0 ("output") — caption `numeric output tool output`

### Agent Variables

| Variable | Purpose |
|---|---|
| `ov61` | Unused numeric slot, initialised to 100 |
| `ov71` | Hundreds digit (0–2) |
| `ov72` | Tens digit (0–9, or 0–5 when `ov71 = 2`) |
| `ov73` | Units digit (0–9, or 0–5 when `ov71 = 2 and ov72 = 5`) |

### Parts

| Part | Type | Purpose |
|---|---|---|
| 1 | Fixed text (WhiteOnTransparentChars) | Displays `ov71` (hundreds) |
| 2 | Fixed text (WhiteOnTransparentChars) | Displays `ov72` (tens) |
| 3 | Fixed text (WhiteOnTransparentChars) | Displays `ov73` (units) |
| 4 | Button | Increments `ov71` — sends message 2001 |
| 5 | Button | Increments `ov72` — sends message 2002 |
| 6 | Button | Increments `ov73` — sends message 2003 |

Parts 4–6 use `tran 0` to make the transparent sprite pixels non-clickable.

### Events

| Event | Number | Description |
|---|---|---|
| Activate 1 | 1 | Manually send the composed value |
| Hit | 3 | Struck (by creature, item, or tool) |
| Pickup | 4 | Picked up (only reacts if picker is a creature) |
| User message | 2001 | Increment hundreds digit |
| User message | 2002 | Increment tens digit |
| User message | 2003 | Increment units digit |
| User message | 2004 | Refresh the three text parts |
| User message | 2005 | Input port received a value |

### Event 1 — Activate 1

Locks the agent, plays the `bep2` sound, then plays animation `[0 1 255]` on part 0 (body). It concatenates `ov71`, `ov72`, `ov73` (as strings) into `va01`, converts it to an integer in `va02`, and sends `va02` out of output port 0 via `prt: send 0 va02`. Three more `bep2` beeps are played at wait intervals, the body animation is reset to pose 0, and the script ends.

### Event 3 — Hit

Plays the `hit_` collision sound, launches the agent upward with a random vertical velocity (`velo 0 rand -5 -10`), triggers a random particle bang (`prt: bang rand 60 100`), and writes stimulus **92** with intensity 1 to the hitter (`stim writ from 92 1`). Stimulus 92 is the standard "was hit by" feedback used in C3.

### Event 4 — Pickup

Targets the picker (`targ from`) and, if it is a creature (`fmly = 4`), writes stimulus **91** with intensity 1 to that creature (`stim writ targ 91 1`). Stimulus 91 is the standard "pickup" feedback used in C3, giving the creature mild reinforcement for interacting with the tool.

### Event 2001 — Increment Hundreds

Plays `bep2`, locks the agent, increments `ov71`. When `ov71` reaches 3 it wraps back to 0 (so the hundreds digit cycles 0 → 1 → 2 → 0, clamping the overall value to < 300). Unlocks and sends message 2004 to itself via `mesg writ ownr 2004` to refresh the display.

### Event 2002 — Increment Tens

Plays `bep2`, locks, increments `ov72`. Wrap rules:
- If `ov71 < 2` and `ov72` reaches 10 → reset to 0 (standard decimal wrap).
- If `ov71 = 2` and `ov72` reaches 6 → reset to 0 (so the value cannot exceed 255).

Unlocks and triggers message 2004 to refresh the display.

### Event 2003 — Increment Units

Plays `bep2`, locks, increments `ov73`. Wrap rules:
- If `ov71 < 2` and `ov73` reaches 10 → reset to 0.
- If `ov71 = 2` and `ov72 <> 5` and `ov73` reaches 10 → reset to 0.
- If `ov71 = 2` and `ov72 = 5` and `ov73` reaches 6 → reset to 0 (so the value cannot exceed 255).

Unlocks and triggers message 2004 to refresh the display.

### Event 2004 — Refresh Text

Rewrites the three digit parts from `ov71`, `ov72`, `ov73` using `frmt` (centred, 4-pixel margins) and `ptxt`. Part 3 uses `frmt 1` (left-aligned) while parts 1 and 2 use `frmt 4` (right-aligned). This script is invoked internally whenever a digit changes, so the on-screen digits stay in sync with the stored values.

### Event 2005 — Input Port Received

Invoked when another tool wires a value into the input port. Reads the input value from `_p1_` into `va00`. If the input value is greater than 0 it performs the same beep/animation sequence as Event 1 and sends the currently-composed value (not the incoming value) out of the output port. A zero or negative input is silently ignored, making this a "trigger on positive pulse" behaviour.

### Removal Script (`rscr`)

Enumerates all agents of classifier 3 8 18 and removes them (`kill targ`), then `scrx` removes the per-event scripts 1, 2001, 2002, 2003, 2004, and 2005.

### Impact on Stimulus / Room CA

- Emits **CA 18** at rate 0.35 into the room where the agent rests (`emit 18 .35`).
- Writes stimulus **92** (hit feedback) to any creature that hits it.
- Writes stimulus **91** (pickup feedback) to any creature that picks it up.
- No long-term ecosystem or room CA changes beyond the constant CA 18 emission.
