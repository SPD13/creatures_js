# workshop screen.cos — The Workshop Screen

**Source file:** `Assets/Docking Station/Bootstrap/010 Docking Station/workshop screen.cos`

## Overview

This script builds the **Workshop Screen** (`1 2 208`), the large multi-mode control panel in the Workshop that manages the **containment chamber** and everything to do with the creatures inside it. It is the hub the [containment chamber](containment%20chamber.md), [immigrant checker](immigrant%20checker.md) and [warning controller](warning%20icons.md) all talk to. Its modes (tracked in `ov01`) are:

- **Containment** — open/close the chamber and **configure** which contacts you'll send creatures to / receive from (via portals and the containment chamber).
- **Health** — monitor a creature's biochemistry on a live graph: **metabolism** (glucose, glycogen, starch, …), **toxins** (heavy metals, cyanide, …) or **fertility** (oestrogen, testosterone, sex drive, …), plus **feed**, **fumigate** (kill bacteria) and **find bugs** (reveal bacteria) buttons.
- **Immigration** — review **incoming warped creatures**, accepting or rejecting each (or all), surfacing reject/foe/quarantine reasons.

A row of up to six creature faces shows who's in the chamber; selecting one makes it the "warp-selected" subject for the current mode.

> **Dependencies:** needs `portal dispensor.cos`, `portals.cos` and `containment chamber.cos`.

## Created Agents

| Classifier | Name | Sprite | Description |
|---|---|---|---|
| 1 2 208 | Workshop Screen | `blnk` / `workshop` | The containment/health/immigration control panel — see [detail](#agent-1-2-208-workshop-screen) |
| 1 2 209 | Warp-Selected Indicator | `workshop` | The highlight marker over the currently-selected creature face |
| 1 1 180 | Health Kit Graphics | `workshop` | The graph backdrop/decoration shown in Health mode |
| 1 1 155 | Fumigate Smoke | `smoke` | Spray that **kills** bacteria on a contained creature |
| 1 1 156 | Find-Bugs Smoke | `smoke` | Spray that **reveals** bacteria on a contained creature |

The food button also spawns the empathic-vendor foods — Star Seed (`2 3 15`), Yarn Fruit (`2 8 6`), Peaking Pie (`2 11 7`) — to feed the contained creatures.

State variables: `ov00` (chamber lock: 0 open / 1 closed), `ov01` (mode: 0 idle, 1 health, 2 containment, 3 portal, 4 immigrant, 5 immigrant warning), `ov02` (health sub-mode: 1 metabolism / 2 toxin / 3 fertility), `ov10`–`ov15` (the six face creature handles), `ov16` (selected creature), `ov20` (portal being programmed).

## Agent 1 2 208: Workshop Screen

### Events (selected)

| Event | Number | Description |
|---|---|---|
| Timer | 9 | In Health mode, sample the subject's chemicals and update the graph |
| Custom — life event | 127 | Refresh faces/info when a contained creature is born/dies/exported |
| Custom — refresh faces | 1000 | Rebuild the six face slots from the creatures in the chamber |
| Custom — containment icon | 1001 | Enter containment-configuration mode (program send/receive contacts) |
| Custom — immigrant icon | 1002 | Enter immigration mode (review incoming creatures) |
| Custom — health icon | 1003 | Enter health-monitoring mode |
| Custom — lock icon | 1004 | Open/close the chamber (blocked while immigrants are waiting) |
| Custom — select face 1–6 | 1005–1010 | Select that creature as the subject |
| Custom — closedown | 1011 | Clear the screen and reset to idle |
| Custom — lock appearance | 1012 | Sync the lock/icon poses with the chamber state |
| Custom — warp indicator | 1013 | Place the selection marker (`1 2 209`) over the chosen face |
| Custom — display info | 1014 | Show the selected creature's name/genus/stage/breeder (and immigrant origin) |
| Custom — accept / reject immigrant | 1015 / 1016 | Admit or send back the highlighted incoming creature |
| Custom — more immigrants? | 1017 | Stay in / leave immigrant mode based on what's left |
| Custom — accept all | 1018 | Admit every waiting immigrant and open the chamber |
| Custom — build health buttons | 1020 | Create the health/toxin/fertility/food/fumigate/find-bugs buttons + graph |
| Custom — metabolism / toxin / fertility | 1021 / 1022 / 1023 | Switch the live graph to that chemical group |
| Custom — food | 1025 | Spawn food (Star Seed/Yarn Fruit/Peaking Pie) into the chamber, capped by world food count |
| Custom — fumigate | 1026 | Spray smoke (`1 1 155`) that kills bacteria on the subject |
| Custom — find bugs | 1027 | Spray smoke (`1 1 156`) that reveals bacteria on the subject |
| Custom — help / main help | 1028 / 1029 | Show contextual help text |
| Custom — containment programmer | 1040–1042 | The send/receive contact-selection UI |
| Custom — cleanup | 1050–1057 | Tear down each mode's parts |
| Custom — portal programming | 1060–1069, 1073, 1075 | Program which portal sends/receives to which contact |
| Custom — immigrant arrived | 1070 | A creature warped into the chamber → switch to immigrant warning |
| Custom — page heads | 1071 / 1072 | Scroll the face row left/right |

### Health monitoring (events 9, 1020–1023)

In health mode the screen reads the subject creature's chemicals (by number, from the `chemical numbers` catalogue) every 10 ticks and plots six lines on a graph — switchable between **metabolism**, **toxin** and **fertility** chemical groups. The fumigate/find-bugs buttons spray smoke onto the subject to remove or expose bacteria (`2 32 23`).

### Immigration (events 1002, 1014–1018)

Lists creatures whose `<moniker>_immigrant` game variable marks them as incoming. **Accept** clears the immigrant/quarantine flags (admitting the creature) and dismisses its warning icon; **Reject** sends it back to the sender (`net: expo "warp"`, setting the reject flag) and triggers the chamber's warp animation. It surfaces reject/foe/quarantine-timeout reasons from PRAY `Pray Extra …` tags.

### Containment / portal programming (events 1001, 1040–1042, 1060–1069)

Lets the player pick contacts (from the contact book) into "send to" / "receive from" columns and writes the corresponding `<UserID>_portalNsend/receive` and `<UserID>_containmentsend/receive` game variables, wiring up who can warp creatures in and out.

## Agents 1 1 155 / 1 1 156: Fumigate / Find-Bugs Smoke

| Agent | Event | Number | Description |
|---|---|---|---|
| 1 1 155 (fumigate) | Timer / Collision | 9 / 6 | Drift, and **kill** bacteria (`2 32 23`) it reaches |
| 1 1 156 (find bugs) | Timer / Collision | 9 / 6 | Drift, and **reveal** bacteria it reaches |

## Removal Script

```
rscr
enum 1 2 208 / 1 2 209 / 1 1 155 / 1 1 180 / 1 1 181
    kill targ
next
```

Kills the screen, indicators, smoke and health graphics.

## Impact on Stimulus / Room CA

No creature stimuli are emitted and no Room CA is written by the screen itself. Its effects are on the contained creatures and game state:

- **Food** spawned by the food button emits smell CAs (6/7/8) for the creatures to eat.
- **Fumigate / find-bugs** smoke kills or reveals bacteria agents (`2 32 23`) on the subject.
- It reads creature **chemistry** (health/toxin/fertility graphs) and manages **immigration** (`net: expo` rejects, clearing immigrant/quarantine variables) and **portal/containment wiring** (contact send/receive game variables).
