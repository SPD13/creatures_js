# bacteria.cos - Bacterium Disease Simulation

**Source**: `Assets/Bootstrap/001 World/bacteria.cos`

## Overview

This script implements a full bacterium disease simulation for the Creatures 3 world. It creates 50 individual bacteria agents that roam the ship, attach to creatures, infect them by injecting antigens and toxins into their bloodstream, and reproduce by splitting. Each bacterium is born with randomized "genetic" parameters controlling its lifespan, virulence, chemical payload, dormancy thresholds, and reproduction rates, creating a diverse population of pathogens with emergent evolutionary behavior.

Bacteria interact with the creature immune system: each bacterium injects a specific antigen (chemicals 82-89: Antigen 0-7) into its host, triggering antibody production (chemicals 102-109: Antibody 0-7). When antibody levels rise above the bacterium's dormancy threshold, the bacterium goes dormant and stops injecting toxins. When antibody levels fall below its wake threshold, it resumes. This creates a tug-of-war between infection and immune response. Bacteria also inject a toxin (chemicals 70-81, e.g. Glycotoxin, Sleep Toxin, Fever Toxin, Histamine, etc.) while actively infecting.

Bacteria reproduce by splitting (message 100), passing their genetic parameters to offspring with occasional mutations. They can also be transmitted between creatures by proximity contact. A population cap system (max 60, min threshold 40) regulates total bacteria count. Bacteria that exhaust their lifespan die and are removed.

At bootstrap, the 50 bacteria are distributed across the ship with weighted placement: 65% in the Grendel Jungle, 10% in the Norn Terrarium, 5% in the Ettin Desert, 10% in the Aquatic section, and 10% in the Lower Engineering Decks (excluding narrow access corridors).

## Created Agents

| Classifier | Name | Sprite | Description | Detail |
|---|---|---|---|---|
| 2 32 23 | Bacterium | `bacteria` (2 frames) | Microscopic pathogen that infects creatures, injects antigens/toxins, and reproduces by splitting | [Detail](#bacterium-2-32-23) |

---

## Bacterium (2 32 23)

A microscopic pathogen agent that drifts through the ship, attaches to creatures, infects them with chemical payloads, and reproduces by splitting. Each bacterium has randomized genetic parameters that control its behavior, creating a diverse population with emergent evolutionary dynamics through mutation during reproduction.

### Bootstrap Configuration

50 bacteria are created at startup with randomized parameters and distributed across the ship:

| Zone | Coordinate Range | Probability | Location |
|---|---|---|---|
| 1 | x:140-2940, y:1380-2610 | 65% | Grendel Jungle |
| 2 | x:4400-7100, y:50-790 | 5% | Ettin Desert |
| 3 | x:760-4070, y:20-1070 | 10% | Norn Terrarium |
| 4 | x:420-6560, y:3200-4010 | 10% | Lower Engineering Decks (excludes corridor rooms 362-367, 374, 377-380) |
| 5 | x:3380-6150, y:1650-2420 | 10% | Aquatic Section |

### Properties

| Property | Value | Notes |
|---|---|---|
| `attr` | 144 | Suffers physics + Carryable (initially non-colliding, floating) |
| `attr` | 208 | Suffers physics + Collisions + Carryable (after landing on a surface) |
| `accg` | 0 | No gravity (floats freely) |
| `tick` | 13-17 (random) | Timer interval at creation |
| Sprite | `bacteria` | 2 frames: frame 0 = normal, frame 1 = actively infecting visual |
| Plane | 6999 | Drawn behind most other agents |

### Genetic Parameters (Randomized Per Bacterium)

Each bacterium is born with randomized "genetics" that govern its behavior:

| Variable | Purpose | Range | Notes |
|---|---|---|---|
| `ov10` | Maximum lifespan | 6000-18000 ticks | Total potential life |
| `ov11` | Remaining lifespan | Random fraction of ov10 | Decrements each tick; death at 0 |
| `ov12` | Reproduction life threshold | 0.05-1.00 | Minimum life fraction needed to split |
| `ov13` | Antibody wake threshold | 0.70-1.00 | Antibody level above which bacterium goes dormant |
| `ov14` | Antibody sleep threshold | 0.05-0.25 | Antibody level below which bacterium reactivates |
| `ov15` | Antigen chemical ID | 82-89 | Antigen 0 through Antigen 7 |
| `ov16` | Toxin chemical ID | 70-81 | e.g. Glycotoxin, Sleep Toxin, Fever Toxin, Histamines, etc. |
| `ov17` | Toxin injection rate | 0.005-0.050 | Amount of toxin injected per tick |
| `ov18` | Secondary chemical ID | 69 (Geddonase, default) | Rarely mutated (1/20 chance during reproduction to 70-81) |
| `ov19` | Secondary chemical rate | 0.005-0.050 | Amount of secondary chemical per tick |

### Behavior Parameters

| Variable | Purpose | Value | Notes |
|---|---|---|---|
| `ov30` | Max population cap | 60 | No new bacteria created above this |
| `ov31` | Min population threshold | 40 | Enhanced reproduction when below this |
| `ov32` | Visual infection indicator | 0 or countdown | Shows frame 1 (active infection) when > 0 |
| `ov33` | Random range | 100 | Upper bound for behavior probability rolls |
| `ov34` | Host-switching threshold | 80 | Probability of switching to a new host |
| `ov35` | Reproduction threshold | 30 | Probability of reproducing on contact |
| `ov36` | Host-attachment threshold | 35 | Probability of attaching to a contacted agent |
| `ov37` | Min ticks before detach | 2000 | Must be attached this long before voluntarily leaving |
| `ov38` | Sneeze reproduction prob. | 80 | Probability of reproducing when sneezed |

### State Variables

| Variable | Purpose | Notes |
|---|---|---|
| `ov00` | Current host (agent ref) | The creature this bacterium is attached to |
| `ov01` | Previous host (agent ref) | Used to avoid immediately re-infecting the same host |
| `ov02` | Collision state | 0 = floating/non-colliding, 1 = landed on surface/colliding |
| `ov03` | Dormancy flag | 0 = actively infecting, 1 = dormant (antibodies too high) |
| `ov04` | Ticks since attachment | Counts up while attached to a host |
| `ov40` | Generation counter | Increments each reproduction |
| `ov97` | Sneeze flag | Set to 1 when reproduction triggered by sneeze |
| `ov98` | Stored target for reproduction | Agent reference passed to reproduction subroutine |

### Events

| Event # | Event Name | Description |
|---|---|---|
| 9 | Timer | Main behavior loop: lifespan, infection, movement, reproduction |
| 100 | User-defined (Reproduce) | Creates a clone offspring with inherited/mutated genetics |
| 101 | User-defined (Sneeze/Transmit) | Handles transmission via creature sneeze or cough |
| 255 | Die | Empty (no special death behavior) |

### Timer Event (9) - Main Behavior Loop

The timer event is the core behavior loop, executing every 13-17 ticks. It performs these steps in order:

**1. Lifespan Check**: If remaining lifespan (`ov11`) reaches 0, the bacterium dies (`kill ownr`).

**2. Visual State**: Shows frame 1 (active infection visual) when `ov32 > 0`, otherwise frame 0. The infection indicator decrements each tick.

**3. Host Infection Logic** (when attached to a host creature, `ov00 != null`):
- Increments attachment timer (`ov04`)
- Checks the host's antibody level (chemical `ov15 + 20`, i.e. Antibody 0-7)
- Antibody cost: subtracts `antibody_level * 10` from remaining lifespan (higher antibodies drain the bacterium faster)
- **Dormancy system**:
  - If actively infecting (`ov03 = 0`) and antibody level drops below `ov14` (sleep threshold): go dormant
  - If dormant (`ov03 = 1`) and antibody level rises above `ov13` (wake threshold): resume active state
  - While actively infecting: injects antigen (`chem ov15 0.02`), toxin (`chem ov16 ov17`), and optionally secondary chemical (`chem ov18 ov19` if `ov18 != 69`)

**4. Host Tracking**: If attached, follows the host creature by moving toward it. If the host moves to a different room, the bacterium teleports to follow. Velocity is capped at +/-3 pixels per axis.

**5. Collision Detection** (`subr coll`): When not yet colliding (`ov02 = 0`), checks if there's enough space around the bacterium (obstacle distance > 3 in all 4 directions). If so, enables collision attribute (`attr 208`) and sets `ov02 = 1`.

**6. Agent Scanning & Interaction**: If landed on a surface (`ov02 = 1`), scans nearby agents using `etch 0 0 0`. For each found agent that isn't the pointer, isn't already the current or previous host, and doesn't have pickup/carry attributes:
- If no current host: attempts attachment (`subr atch`)
- Performs transmission check (`subr tran`)

**7. Population Control & Reproduction**: If total bacteria count is below `ov31` (40) and bacterium is on a surface, attempts to reproduce (`subr copy`).

**8. Voluntary Detachment**: If attached for longer than `ov37` (2000) ticks, the behavior probability favors detachment, and the bacterium isn't dormant: detaches from host, stores it as previous host, and stops.

### Reproduction Event (100) - Clone/Split

When a bacterium reproduces, it creates a new bacterium agent with:
- All genetic parameters inherited from the parent (`ov10`-`ov19`, `ov30`-`ov38`)
- Full lifespan reset (`ov11 = ov10`)
- If population is below minimum threshold, lifespan is re-randomized
- **Mutation**: 1/3 chance that one random genetic parameter is re-randomized:
  - Lifespan, reproduction threshold, antibody thresholds, antigen ID, toxin ID, toxin rates
  - Secondary chemical ID has only 1/20 mutation chance (very rare)
- The offspring is placed at the parent's position
- If triggered by a sneeze (`ov97 = 1`), the offspring gets directional velocity (simulating being sneezed out)
- Generation counter (`ov40`) increments

### Sneeze/Transmit Event (101) - Airborne Transmission

Handles bacteria being transmitted when a creature sneezes or coughs:
- If population is at or below the max cap (`ov30 = 60`) and probability check passes (`ov38 = 80`): triggers reproduction at the sneeze location with the sneeze flag set
- Otherwise, if not dormant and probability check passes: detaches from current host and moves to the sneeze location with directional velocity, simulating airborne travel

### Creature Affinity Modifiers

The transmission subroutine (`subr tran`) modifies infection probability based on creature genus:
- **Genus 2 (Ettin)**: Probability multiplied by 0.8 (Ettins are 20% more resistant)
- **Genus 3 (Grendel)**: Probability multiplied by 1.1 (Grendels are 10% more susceptible)
- This applies to both the new potential host and the current host

### Impact on Creature Chemistry

While actively infecting a host creature (not dormant), each timer tick the bacterium injects:

| Chemical | ID | Amount | Effect |
|---|---|---|---|
| Antigen (0-7) | 82-89 (ov15) | 0.02 per tick | Triggers antibody production by immune system |
| Toxin (varies) | 70-81 (ov16) | 0.005-0.050 per tick (ov17) | Various harmful effects depending on toxin type |
| Secondary (rare) | Usually 69/skipped | 0.005-0.050 (ov19) | Only active if ov18 mutates away from 69 |

**Possible Toxins (chemicals 70-81)**:

| Chemical ID | Name | Effect |
|---|---|---|
| 70 | Glycotoxin | Disrupts energy metabolism |
| 71 | Sleep Toxin | Causes drowsiness |
| 72 | Fever Toxin | Raises body temperature |
| 73 | Histamine A | Immune/allergic response |
| 74 | Histamine B | Immune/allergic response |
| 75 | Alcohol | Intoxication effects |
| 78 | ATP Decoupler | Disrupts cellular energy |
| 79 | Carbon Monoxide | Oxygen transport disruption |
| 80 | Fear Toxin | Causes fear response |
| 81 | Muscle Toxin | Impairs movement |

### Subroutines

| Subroutine | Purpose |
|---|---|
| `subr tran` | Transmission check: evaluates whether to reproduce, attach to new host, or switch hosts based on probability rolls and creature genus modifiers |
| `subr copy` | Reproduction: checks population cap and life fraction threshold, then sends message 100 to self to create offspring. Reproduction is more likely in the Grendel Jungle zone and when the bacterium is dormant |
| `subr atch` | Attachment: if target is a creature (family 4), resets lifespan to full. Stores current host as previous host and sets new host reference. Resets attachment timer |
| `subr coll` | Collision check: tests obstacle distances in all 4 directions; if clear space exists and in a valid room, enables collision physics (attr 208) |

### Remove Script (rscr)

Enumerates and kills all bacteria agents (2 32 23), providing a clean removal when the script is uninstalled.
