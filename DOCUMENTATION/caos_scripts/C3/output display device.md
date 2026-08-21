# Output Display Device

**Source file:** `Assets/Bootstrap/001 World/output display device.cos`

## Overview

The Output Display Device is a CAOS Tool Kit component that acts as a simple numeric display and pass-through. When wired into a contraption, any numeric value pulsed into its input port is briefly rendered as on-screen text on the device, and the same value is immediately forwarded out of its output port. This lets script authors and advanced players inspect values travelling between tools without breaking the signal chain.

It is a single-part compound agent with one fixed text part, one input port, and one output port. It is placed at (5200, 380) during bootstrap.

## Created Agents

| Classifier | Name | Description | Details |
|---|---|---|---|
| 3 8 26 | Output Display Device | Tool-kit component that displays and forwards a numeric input value | [Details](#agent-3-8-26-output-display-device) |

---

## Agent 3 8 26: Output Display Device

A compound agent built from the `outputdisplay` sprite, with a single fixed text part (part 1) rendered with the `whiteontransparentchars` character set. It has one input port ("input") and one output port ("output"). It is placed at (5200, 380) and emits CA 18 at rate 0.2 into the room where it rests. The camera is moved to the agent on creation via `cmrt 0`.

**Attributes:** 195
**Behaviour clicks:** 40
**Physics:** elas 0, fric 100, accg 8, perm 60
**Ports:**
- Input port id 0 ("input") — message 1000
- Output port id 0 ("output")

### Agent Variables

| Variable | Purpose |
|---|---|
| `ov61` | Unused numeric slot, initialised to 100 |

### Parts

| Part | Type | Purpose |
|---|---|---|
| 1 | Fixed text (WhiteOnTransparentChars) | Displays the value most recently received on the input port |

Text format: `frmt 8 8 8 8 0 0 2` (8-pixel margins on all sides, centred).

### Events

| Event | Number | Description |
|---|---|---|
| Hit | 3 | Struck by a creature, item, or tool |
| User message | 1000 | Input port received a value |

### Event 3 — Hit

Plays the `hit_` collision sound, launches the agent upward with a random vertical velocity (`velo 0 rand -5 -10`), triggers a random particle bang (`prt: bang rand 60 100`), and writes stimulus **92** with intensity 1 to the hitter (`stim writ from 92 1`). Stimulus 92 is the standard "was hit by" feedback used in C3, giving the creature mild reinforcement for physically interacting with the tool.

### Event 1000 — Input Port Received

Invoked when another tool wires a value into the input port. Selects part 1, sets its text to the string representation of the incoming value (`ptxt vtos _p1_`), and immediately forwards that same value out of output port 0 (`prt: send 0 _p1_`). After a 10-tick wait the text is cleared (`ptxt ""`), so the device shows each value only as a brief flash.

### Removal Script (`rscr`)

Enumerates all agents of classifier 3 8 26 and removes them (`kill targ`).

### Impact on Stimulus / Room CA

- Emits **CA 18** at rate 0.2 into the room where the agent rests (`emit 18 0.2`).
- Writes stimulus **92** (hit feedback) to any creature that hits it.
- No long-term ecosystem or room CA changes beyond the constant CA 18 emission.
