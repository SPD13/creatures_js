# Grendel Seed Bank

## Overview

This script creates the Grendel Seed Bank, a biological dispensary located in the Grendel area of the Ark. The seed bank is a compound agent (3 3 70) with four interactive buttons that allow players to spawn different organisms into the ecosystem: tendrils, fungi, piranhas (jaws), and wasps. Each dispensing action costs 50 Bioenergy from the global `game "Bioenergy"` reserve, and population caps prevent overspawning. An accompanying suckerplant agent (2 5 1) monitors world populations and automatically triggers replenishment when species fall below minimum thresholds. Four dummy image placeholders (1 1 108) are placed near the seed bank to visually represent the available species.

## Created Agents

| Classifier | Agent | Description |
|---|---|---|
| 3 3 70 | [Grendel Egg Bank](#grendel-egg-bank-3-3-70) | Compound agent with 4 dispenser buttons for spawning organisms |
| 2 5 1 | [Suckerplant](#suckerplant-2-5-1) | Automated population monitor that triggers replenishment when species are depleted |
| 1 1 108 | [Dummy Image Placeholders](#dummy-image-placeholders-1-1-108) | Static sprite displays showing the four available species near the seed bank |

## Agents Spawned by Seed Bank

The seed bank does not create these agents at initialization, but spawns them on demand when buttons are pressed:

| Classifier | Agent | Spawned By | Quantity | Description |
|---|---|---|---|---|
| 2 3 11 | Tendril Seeds | Button 1 | 5 | Airborne plant seeds dispersed with random velocity |
| 2 3 10 | Fungi Spores | Button 2 | 5 | Fungal spores dispersed with random velocity |
| 2 16 3 | Piranha (Jaws) | Button 3 | 1 | Aquatic predator with directional movement |
| 2 14 6 | Wasp | Button 4 | 1 | Flying insect with complex behavioral AI |

---

## Grendel Egg Bank (3 3 70)

The main seed bank interface. A compound agent positioned at (1764, 2167) using the "grendeleggbank" sprite. It features four button parts, each corresponding to a different organism that can be dispensed.

### Parts

| Part | Sprite | First Image | Position (x, y) | Species |
|---|---|---|---|---|
| 1 | grendeleggbank | 1 | (52, 84) | Tendril |
| 2 | grendeleggbank | 3 | (132, 83) | Fungi |
| 3 | grendeleggbank | 5 | (201, 83) | Piranha |
| 4 | grendeleggbank | 7 | (281, 83) | Wasp |

Each button has a frame rate of 6 and an idle animation cycling through its sprite frames.

### Events

| Event | Number | Description |
|---|---|---|
| Message 1000 | 1000 | Dispense request — receives button ID in `_p1_` and spawns the corresponding organism |

### Message 1000 — Dispense Request

This is the core dispensing logic, triggered by the Grendel Egg Bank controller (3 3 70) forwarding a button press. The `_p1_` parameter identifies which button was pressed (1–4). For all organism types, the dispensing follows a common pattern:

**Population Cap Check**: Before spawning, the script checks whether the target species population has reached its world cap. If the cap is reached, a "buzz" sound plays and execution stops. Additionally, for tendrils and fungi, a secondary check prevents spawning if a related species is already at 100.

| Button | Target Species | Population Cap | Secondary Cap |
|---|---|---|---|
| 1 (Tendril) | 2 5 4 (Tendril Plant) < 1 | 2 3 11 (Tendril Seed) < 100 | — |
| 2 (Fungi) | 2 8 5 (Fungi Body) < 1 | 2 3 10 (Fungi Spore) < 100 | — |
| 3 (Piranha) | 2 16 3 (Jaws) < 100 | — | — |
| 4 (Wasp) | 2 14 6 (Wasp) < 100 | — | — |

**Bioenergy Cost**: Each spawn costs 50 Bioenergy from `game "Bioenergy"`. If Bioenergy is below 50, a "buzz" sound plays, an "Insufficient Energy for task." message (`read "Energy" 0`) is sent to the Bioenergy display agent (1 1 91, `ov00 == 5`), and execution stops. On successful deduction, a "Bioenergy reduced to: " message (`read "Energy" 4`) with the remaining value is sent to the display.

**Spawned Agent Details by Button**:

#### Button 1 — Tendril Seeds (2 3 11)

Creates 5 tendril seeds at position (1870, 2010) using "tendril" sprite (frame 10, 32 images, plane 500):
- Attributes: 195 (carryable, physics-enabled), behavior: 16 (activatable)
- Elasticity: 30, friction: 100, permeability: random 30–70
- Animation: frames 0–5
- Velocity: random horizontal (-15 to 15), random vertical (-10 to 0)
- Timer: random 300–600 ticks
- Variables: `ov72` = random 10–40 (lifespan), `ov80` = 1, `ov82` = 1, `ov87` = 0

#### Button 2 — Fungi Spores (2 3 10)

Creates 5 fungi spores at position (1870, 2010) using "fungi" sprite (frame 7, 110 images, plane 600):
- Attributes: 195, behavior: 16
- Elasticity: 0, friction: 100, permeability: random 30–70
- Animation: frames 0–3
- Velocity: random horizontal (-20 to 5), random vertical (-10 to 0)
- Timer: random 300–600 ticks
- Variables: `ov72` = random 10–40 (lifespan), `ov80` = 1, `ov82` = 1, `ov87` = 0

#### Button 3 — Piranha / Jaws (2 16 3)

Creates 1 piranha at position (1860, 2005) using "jaws" sprite (frame 53, plane 1000):
- Attributes: 195, elasticity: 50, gravity: 5
- Permeability: 60, timer: random 8–15 ticks
- Direction: `ov10` = random -1 or 1 (left or right)
- Variables: `ov02` = 100 (health/energy), `ov61` = 50
- Velocity: random horizontal (-10 to 0), random vertical (-5 to 0)

#### Button 4 — Wasp (2 14 6)

Creates 1 wasp at position (1855, 2005) using "wasp" sprite (frame 221, plane 300):
- Attributes: 199 (carryable, physics-enabled, camera-shy), behavior: 17
- Permeability: 100, timer: 6 ticks, aerodynamics: 5, gravity: 0
- Elasticity: 10, clickable: disabled (`clac 0`)
- Animation: frames 5, 7
- Variables: `ov00` = 0 (state), `ov01` = 2000, `ov02` = 800, `ov05` = 2, `ov06` = random 0–1
- `ov10` = 1, `ov11` = -1, `ov16` = null (agent ref), `ov17` = null (agent ref)
- `ov20` = 0, `ov61` = 45, `ov72` = 400, `ov73` = 400, `ov74` = 800, `ov75` = 1
- Velocity: random horizontal (-10 to 0), random vertical (-10 to 0)

After dispensing, the seed bank plays its reload animation (frames 6, 7, 8, 0) on the main body.

### Activate 1 (Event 1)

Plays a visual feedback animation on the seed bank body (frames 0–8), providing visual acknowledgment when clicked.

---

## Suckerplant (2 5 1)

A simple agent positioned at (1676, 1940) using the "suckerplant" sprite (frame 9). It has attributes 196 (non-carryable, physics-enabled), no click action (`clac 0`), no elasticity, and a timer interval of 3600 ticks. The suckerplant acts as an automated population regulator for the Grendel ecosystem.

### Events

| Event | Number | Description |
|---|---|---|
| Timer | 9 | Monitors organism populations and triggers automatic replenishment |

### Timer (Event 9) — Population Monitor

The timer fires every 3600 ticks and checks world populations of key species in priority order:

1. **Tendril Plants (2 5 4)**: If total count is less than 1, sends message 1000 with `_p1_` = 1 to itself, triggering tendril seed dispensing. Stops after this check.
2. **Fungi Fruiting Bodies (2 8 5)**: If total count is less than 1, sends message 1000 with `_p1_` = 2 to itself, triggering fungi spore dispensing. Stops after this check.
3. **Wasps (2 14 6)**: If total count is less than 1, sends message 1000 with `_p1_` = 4 to itself, triggering wasp dispensing.

Only one species is replenished per timer cycle, prioritizing tendrils over fungi over wasps. Note that piranhas (button 3) are not automatically replenished.

---

## Dummy Image Placeholders (1 1 108)

Four static simple agents placed near the seed bank at the bottom of the Grendel area to visually represent the species available for dispensing. They use their respective species sprites at a single frame and serve as visual labels only — they have no scripts or interactivity.

| Position | Sprite | First Image | Total Images | Represents |
|---|---|---|---|---|
| (1792, 2200) | tendril | 1 | 23 | Tendril |
| (1875, 2210) | fungi | 1 | 25 | Fungi |
| (1948, 2210) | jaws | 1 | 13 | Piranha |
| (2035, 2210) | wasp | 1 | 10 | Wasp |

---

## Grendel Egg Bank Controller (3 3 70) — Button Press Handler

### Events

| Event | Number | Description |
|---|---|---|
| Message 1000 | 1000 | Forwards button press to suckerplant for dispensing |

### Message 1000 — Button Press Forward

When a button part is pressed on the Grendel Egg Bank, this script plays a button activation sound ("gsb1"), animates the pressed button part with a flashing sequence, then finds a random suckerplant (2 5 1) and forwards the button ID via message 1000. After the forwarding animation completes, the button returns to its idle animation.

---

## Removal Script

The removal script (`rscr`) cleans up all agents associated with this script:
- All Grendel Egg Bank agents (3 3 70)
- All Suckerplant agents (2 5 1)
- All Dummy Image Placeholders (1 1 108)
- Removes the script for message 1000 on suckerplant (`scrx 2 5 1 1000`)
