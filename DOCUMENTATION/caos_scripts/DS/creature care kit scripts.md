# creature care kit scripts.cos — The Creature Care Kit (HoverDoc Modules)

**Source file:** `Assets/Docking Station/Bootstrap/010 Docking Station/creature care kit scripts.cos`

## Overview

This script installs the behaviour of the **Creature Care Kit (CCK)** (`1 1 170`), the diagnostic panel that attaches to the **HoverDoc** and lets the player examine and treat the currently-targeted creature ("the patient"). It is a script-only file — the kit object itself is created elsewhere (as a HoverDoc module); this file defines all of its event scripts — plus it spawns a short-lived **bacteria-spray particle** (`1 1 220`).

The kit holds a reference to its HoverDoc in `ov33`; the patient is read from the HoverDoc's `ov16`. A menu bar opens five modules, only one of which is "currently opened" at a time (stored in `name "currently opened module"`: `main` / `drives` / `bacteria` / `toxins` / `fertility`). A timer (event 9) refreshes whichever module is open.

| Module | Parts | What it shows / does |
|---|---|---|
| Main | 1–19 | Patient name, gender, genus/lifestage "identify" sentence, highest drive + intensity, and an assessment line (from the `HoverDoc Identify` / `HoverDoc Assessment` catalogues) |
| Drives | 20–49 | All 14 drives as intensity icons |
| Bacteria | 50–59 | Counts bacteria (`2 32 23`) on the patient; spray to **reveal** or **kill** them |
| Toxins & Cures | 60–79 | Lists active toxins / required cures (chems 66–89), paged; emergency cure injection |
| Fertility | 80–99 | Reproductive hormones graph, pregnancy status, and increase/decrease-fertility buttons |

## Created Agents

| Classifier | Name | Sprite | Description |
|---|---|---|---|
| 1 1 170 | Creature Care Kit | `hoverdoc` / `creature kit module icons` | The HoverDoc diagnostic/treatment panel — see [detail](#agent-1-1-170-creature-care-kit). *Created elsewhere; this file installs its scripts (Modification).* |
| 1 1 220 | Bacteria Spray Particle | `smoke` | A transient smoke puff that reveals or kills bacteria — see [detail](#agent-1-1-220-bacteria-spray-particle) |

## Agent 1 1 170: Creature Care Kit

### Events

| Event | Number | Description |
|---|---|---|
| Timer | 9 | Refresh the currently-open module from the patient's live state; fade & kill if the HoverDoc is gone |
| Custom — open menu | 1000 | Open the menu bar, create the four module buttons, set module to `main` |
| Custom — close menu | 1001 | Kill the module buttons, tear down the open module, reset to `main` |
| Custom — open Drives | 1002 | Switch to the Drives module |
| Custom — open Bacteria | 1003 | Switch to the Bacteria module |
| Custom — open Toxins | 1004 | Switch to the Toxins & Cures module |
| Custom — open Fertility | 1005 | Switch to the Fertility module |
| Custom — module create/kill | 1006 | Kill the old module's parts (`_p1_`) and build the new module's parts (`_p2_`) |
| Custom — bacteria show | 1007 | Spray particles that **reveal** bacteria on the patient |
| Custom — bacteria kill | 1008 | Spray particles that **kill** bacteria on the patient |
| Custom — toxin page down | 1009 | Previous page of the toxin/cure list |
| Custom — toxin page up | 1010 | Next page of the toxin/cure list |
| Custom — toxin page analyser | 1011 | Enable/disable the page arrows based on page count |
| Custom — toxin/cure switch | 1012 | Toggle the display between toxins and cures (`name "toxmod"`) |
| Custom — emergency check | 1013 | Flash the inject button + alarm if a dangerous toxin (chem 67/70 ≥ 0.5) is present |
| Custom — emergency inject | 1014 | Inject the appropriate cure chemicals into the patient |
| Custom — increase fertility | 1015 | Nudge the patient's fertility up |
| Custom — decrease fertility | 1016 | Nudge the patient's fertility down |

### Event 9 — Timer (module refresh)

Runs every 5 ticks. Keeps the kit's plane just under the HoverDoc's, fades-and-kills the kit if `ov33` (HoverDoc) is null, then updates the open module:

- **main** — reads the patient's name/`hist`, species (`spcs`), genus (`gnus`), lifestage (`cage`), and scans all 14 drives for the highest; builds the "identify" + "assessment" text from the catalogue, and updates the drive/intensity icons (with special handling when the patient is dead).
- **drives** — converts each of the 14 `driv` values into a 10-step intensity pose per icon.
- **bacteria** — enumerates `2 32 23` bacteria whose `ov00` equals the patient and reports the count, animating the microscope view.
- **toxins** — copies the patient's chems 66–89 into name-vars, then lists either active toxins (>0.2, with %), or the matching cures, paginated.
- **fertility** — reads sex-specific hormones (testosterone/oestrogen, arousal potential, libido lowerer, opposite-sex pheromone, sex drive, progesterone), pregnancy via `loci 1 1 2 1`, and drives the graph and pregnancy/gender displays.

### Event 1014 — Emergency cure injection

If a dangerous toxin is flagged, marks the corresponding cure name-vars (96/97) and, on the **patient**, injects those cures (`chem`), zeroing the marker afterwards — directly editing creature biochemistry.

### Events 1015 / 1016 — Fertility adjust

Only on an **adult** patient (`cage = 4`): increase adds to Arousal Potential (chem 39) and Sex Drive (driv 13); decrease adds to Libido Lowerer (chem 40) and lowers Sex Drive — again directly modifying the creature's chemistry.

## Agent 1 1 220: Bacteria Spray Particle

A `new: simp` smoke puff (16 spawned per spray) created by events 1007/1008 at the HoverDoc's location. `ov02` selects mode: 1 = reveal, 2 = kill.

| Event | Number | Description |
|---|---|---|
| Collision | 6 | Play the dissipate animation and die |
| Timer | 9 | Animate, age, drift (`velo`), die when old; while alive, **reveal** (`etch` bacteria → set their visibility `ov32`) or **kill** (`ov02 = 2`) nearby bacteria (`2 32 23`) |

## Removal Script

```
rscr
enum 1 1 170
    kill targ
next
enum 1 1 220
    kill targ
next
```

Kills the kit and any spray particles.

## Impact on Stimulus / Room CA

No creature stimuli are emitted and no Room CA is written. However, the kit **directly edits the patient's biochemistry**: the emergency button injects cure chemicals (`chem 96/97`) and the fertility buttons adjust reproductive chems (39/40) and the sex drive (`driv 13`). It also **reveals or kills bacteria agents** (`2 32 23`) on the patient via the spray particles. These are deliberate medical interventions on the targeted creature rather than ambient ecology effects.
