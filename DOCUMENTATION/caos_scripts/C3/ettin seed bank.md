# ettin seed bank.cos - Ettin Desert Seed Bank

**Source**: `Assets/Bootstrap/001 World/ettin seed bank.cos`

## Overview

This script implements the Ettin Seed Bank, a compound agent located in the Ettin desert area that acts as a biological dispensary. It allows the player (or connected engineering gadgets) to dispense four types of desert-dwelling organisms: desert grass, cacbana fruit, balloon bugs, and meerkats. Each dispensing action consumes 50 Bioenergy from the global reserve, enforces population caps to prevent overpopulation, and reports energy levels to the ship's efficiency indicator system.

The seed bank also includes an automatic population maintenance system that periodically checks whether balloon bug and meerkat populations have fallen below minimum thresholds, and if so, triggers dispensing to replenish them.

A companion wire connector agent (1 1 122) is created alongside the seed bank to integrate it into the ship's engineering wiring system, allowing other gadgets to trigger dispensing remotely via signal ports.

## Created Agents

| Classifier | Name | Sprite | Description | Detail |
|---|---|---|---|---|
| 3 3 69 | Ettin Seed Bank | `ettinseedbank` | Compound agent with 4 dispensing buttons and 4 selection toggles for desert organisms | [Detail](#ettin-seed-bank-3-3-69) |
| 1 1 122 | Wire Connector | `targ` (invisible) | Signal relay agent with input/output ports that connects the seed bank to the engineering wiring system | [Detail](#wire-connector-1-1-122) |

---

## Ettin Seed Bank (3 3 69)

The Ettin Seed Bank is a compound agent with 11 parts: a base with 3 decorative dull parts, 4 dispensing buttons (top row), and 4 selection toggle buttons (bottom row). It is placed in the Ettin desert area at position (5607, 716). The top buttons trigger dispensing of organisms, while the bottom buttons toggle visual selection states.

### Bootstrap Configuration

| Property | Value | Notes |
|---|---|---|
| Sprite | `ettinseedbank` | Compound agent with multiple parts |
| Position | (5607, 716) | Ettin desert area |
| `tick` | 3600 | Automatic population check every 3600 ticks |

### Parts Layout

| Part | Type | Sprite Frame | Purpose |
|---|---|---|---|
| 1 | Dull | frame 4, offset (46, 0) | Decorative panel section |
| 2 | Dull | frame 8, offset (93, 0) | Decorative panel section |
| 3 | Dull | frame 12, offset (138, -1) | Decorative panel section |
| 4 | Button | frame 18, offset (35, -17) | Dispense desert grass (sends message 1000) |
| 5 | Button | frame 18, offset (82, -17) | Dispense cacbana fruit (sends message 1000) |
| 6 | Button | frame 18, offset (129, -17) | Dispense balloon bugs (sends message 1000) |
| 7 | Button | frame 18, offset (174, -17) | Dispense meerkats (sends message 1000) |
| 8 | Button | frame 16, offset (35, -25) | Toggle selection for desert grass (sends message 1001) |
| 9 | Button | frame 16, offset (82, -25) | Toggle selection for cacbana (sends message 1001) |
| 10 | Button | frame 16, offset (129, -25) | Toggle selection for balloon bugs (sends message 1001) |
| 11 | Button | frame 16, offset (174, -25) | Toggle selection for meerkats (sends message 1001) |

### Events

| Event | Script | Description |
|---|---|---|
| Timer (9) | `scrp 3 3 69 9` | Automatic population maintenance — checks balloon bug and meerkat populations |
| Message 1000 | `scrp 3 3 69 1000` | Dispense organisms — triggered by top row buttons or wire input |
| Message 1001 | `scrp 3 3 69 1001` | Toggle selection — toggles visual pose on bottom row buttons |

### Event: Timer (Script 9) — Automatic Population Maintenance

Fires every 3600 ticks. Checks if critical desert populations have dropped to zero and auto-triggers dispensing:

1. If no balloon bugs exist (`totl 2 13 9 < 1`), sends message 1000 with `_p1_ = 6` to itself (dispense balloon bugs)
2. If no meerkats exist (`totl 2 15 23 < 1`), sends message 1000 with `_p1_ = 7` to itself (dispense meerkats)

This ensures that the desert ecosystem always has a minimum viable population of these species.

### Event: Message 1000 (Dispensing)

This is the main dispensing handler. The `_p1_` parameter identifies which button (4-7) was pressed, determining which organism to dispense. All four paths share a common pattern:

1. **Signal the wire connector**: Sends a signal value (64, 128, 192, or 255 depending on button) to the connected wire connector (1 1 122) via message 1001
2. **Population cap check**: Verifies the total count of the target species hasn't exceeded 100
3. **Bioenergy check**: Requires at least 50 Bioenergy in the global `game "Bioenergy"` reserve
4. **Energy reporting**: Reports current energy level to efficiency indicators (1 1 91) with `ov00 == 6`
5. **Bioenergy deduction**: Subtracts 50 from the global Bioenergy reserve
6. **Organism spawning**: Creates the organisms at the seed bank's location

If Bioenergy is insufficient (< 50), plays a "buzz" sound and reports zero energy to the efficiency system without dispensing.

#### Button 4 — Desert Grass (2 3 13)

Spawns 5 desert grass plants. Also checks `totl 2 6 4 >= 100` (desert grass seeds) as an additional population cap.

| Property | Value |
|---|---|
| Sprite | `desertgrass`, 4 frames, random start frame (0/4/8/12 in groups of 4) |
| Position | (5617, 746) |
| `attr` | 195 (Physics + Collisions + Mouseclickable) |
| `bhvr` | 48 (Push + Pull) |
| `elas` | 0, `fric` 50 |
| `tick` | ov70 = 100 |
| `emit` | CA 7 (Nutrients) at 0.3 |
| Random velocity | X: -5 to 5, Y: -2 to 0 |

Key variables set: `ov00`=1, `ov02`=100, `ov70`=100, `ov71`=600, `ov72`=50, `ov80`=1, `ov81`=0.01, `ov82`=1, `ov83`=0.01, `ov84`=0.001, `ov85`=1, `ov86`=0.01.

**Room CA Impact**: Each grass emits CA 7 (Nutrients) at intensity 0.3.

#### Button 5 — Cacbana Fruit (2 3 9)

Spawns 5 cacbana fruits. Also checks `totl 2 5 2 >= 100` (cacbana plants) as an additional population cap.

| Property | Value |
|---|---|
| Sprite | `cacbana`, 12 frames, start frame 0 |
| Position | (5655, 735) |
| `attr` | 195 (Physics + Collisions + Mouseclickable) |
| `bhvr` | 16 (Push) |
| `elas` 40, `fric` 50, `aero` 5, `accg` 1, `rnge` 500 |
| `tick` | 15 |
| Random velocity | X: -10 to 10, Y: -5 to 0 |
| `ov81` | rand 8-15 |

#### Button 6 — Balloon Bugs (2 13 9)

Spawns 2 balloon bugs. Checks `totl 2 13 9 >= 100` as population cap.

| Property | Value |
|---|---|
| Sprite | `balloonbug`, 42 frames, start frame 0, plane 3000 |
| Position | (5709, 735) |
| `attr` | 198 (Physics + Collisions + Mouseclickable + Carryable) |
| `clac` | 0 |
| `elas` | 0 |
| `ov61` | 40 |
| `tick` | 5 |
| Random direction | `ov10`, `ov11`: -1 or 1 |

#### Button 7 — Meerkat (2 15 23)

Spawns 1 meerkat. Checks `totl 2 15 23 >= 100` as population cap.

| Property | Value |
|---|---|
| Sprite | `meerk`, 145 frames, start frame 0, plane 2500 |
| Position | (5730, 730) |
| `attr` | 194 (Physics + Collisions + Mouseclickable) |
| `elas` | 0, `fric` 10, `accg` 2 |
| `tick` | 8 |
| `ov02` | rand 10-50 |
| Animation | frames 47-51 |
| Random direction | `ov10`: -1 or 1 |
| Uses `over` | Waits for animation to finish |

### Event: Message 1001 (Toggle Selection)

Toggles the pose of the bottom-row selection button identified by `_p1_` (parts 8-11) between pose 0 and pose 1. This provides visual feedback showing which organism type is currently "selected" on the panel.

---

## Wire Connector (1 1 122)

The wire connector is an invisible simple agent that bridges the seed bank to the ship's engineering wiring system. It has one input port and one output port, allowing other gadgets to send signals that trigger dispensing, and forwarding confirmation signals outward.

### Bootstrap Configuration

| Property | Value | Notes |
|---|---|---|
| Sprite | `targ` | 1 frame, invisible |
| Position | (5790, 760) | Near the seed bank |
| `tran` | 0, 0 | Fully transparent |
| Port 0 (Input) | "input", type 4, relay ID 8 | Receives signals (message 1000) |
| Port 0 (Output) | "output", type 4, relay ID 25 | Sends confirmation signals |

### Events

| Event | Script | Description |
|---|---|---|
| Message 1000 | `scrp 1 1 122 1000` | Receives input signal — routes to appropriate seed bank button |
| Message 1001 | `scrp 1 1 122 1001` | Receives confirmation signal — forwards to output port |

### Event: Message 1000 (Input Signal Routing)

When a signal arrives on the input port (`_p1_ != 0`), the connector determines which seed bank button to activate:

1. **Priority check — bottom toggle buttons**: Checks parts 8-11 of the seed bank. If any bottom button has pose 1 (selected), sends message 1000 to the seed bank with the corresponding top button number (4-7) and stops.

2. **Signal value mapping** (if no toggle is selected): Maps the absolute value of `_p1_` to a button:
   - 1–64 → Button 4 (desert grass)
   - 65–128 → Button 5 (cacbana)
   - 129–192 → Button 6 (balloon bugs)
   - 193–255 → Button 7 (meerkats)

3. **Forward signal**: Also forwards `_p1_` to the output port via `prt: send`.

### Event: Message 1001 (Signal Forward)

Simply forwards the received signal (`_p1_`) to the output port. This is used by the seed bank's dispensing handler to send confirmation values (64, 128, 192, 255) back through the wiring system.

---

## Remove Script

The remove script (`rscr`) cleans up both agents:
- Enumerates and kills all Ettin Seed Banks (3 3 69)
- Enumerates and kills all Wire Connectors (1 1 122)
