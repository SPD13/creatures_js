# !DS_game variables.cos - Global Game Configuration

**Source file:** `Assets/Docking Station/Bootstrap/010 Docking Station/!DS_game variables.cos`

## Overview

This bootstrap script initialises the core game variables that configure the Docking Station engine at startup. It does not create any agents; it sets global `game` (and a couple of `eame`) variables that control engine behaviour, time progression, creature defaults, audio, rendering planes, population limits, and breeding/twinning rules. These variables are read by various engine subsystems and by other CAOS scripts throughout the game.

The `!` prefix forces alphabetical priority within the `010 Docking Station` folder, so this runs very early in the Docking Station bootstrap sequence. After setting all variables it calls `rgam` to make the engine immediately refresh its internal state from the new values before any later bootstrap script executes.

It is the Docking Station counterpart of the Creatures 3 [!C3_game variables](../C3/!C3_game%20variables.md). The skeleton is the same, but Docking Station adds several systems and changes a number of values (highlighted below).

## No Created Agents

This script does not create any agents. It exclusively sets global variables using `setv game` / `sets game` (and `setv eame`).

---

## Game Variables Reference

### Audio Settings

| Variable | Type | Value | Description |
|---|---|---|---|
| `engine_usemidimusicsystem` | Integer | `0` | Use the default MNG music system (non-zero would switch to MIDI). |
| `engine_near_death_track_name` | String | `"ds_music.mng\\MetallicChords"` | Music track played when a creature is near death. Docking Station uses the `MetallicChords` track in `ds_music.mng` (C3 uses `events.mng\NearDeath`). |

### Time System

| Variable | Type | Value | Description |
|---|---|---|---|
| `engine_LengthOfDayInMinutes` | Integer | `20` | Length of a game day in real-time minutes. |
| `engine_LengthOfSeasonInDays` | Integer | `4` | Game days per season. |
| `engine_NumberOfSeasons` | Integer | `4` | Seasons per year. |

A full year is 4 × 4 = 16 game days × 20 minutes = **~5.3 real-time hours** (same as C3).

### Creature Gallery Cache

| Variable | Type | Value | Description |
|---|---|---|---|
| `engine_creature_template_size_in_mb` | Integer | `2` | Memory budget (MB) for each creature gallery template cache. |

### Population System (Docking Station — replaces the C3 population check)

Docking Station drops C3's `c3_max_norns` / `c3_max_creatures` pair in favour of an engine-side population system:

| Variable | Type | Value | Description |
|---|---|---|---|
| `breeding_limit` | Integer | `36` | Population at/above which natural breeding is suppressed. |
| `total_population` | Integer | `46` | Hard ceiling on the total creature population. |
| `extra_eggs_allowed` | Integer | `34` | Number of eggs permitted beyond the live population before egg-laying is throttled. |

### Twinning / Multiple Birth (moved here from the breeding scripts)

In Docking Station the multiple-birth probabilities are centralised as game variables rather than living inside the creature-breeding scripts:

| Variable | Type | Value | Description |
|---|---|---|---|
| `engine_multiple_birth_first_chance` | Float | `0.04` | Chance the first extra (twin) birth occurs. |
| `engine_multiple_birth_subsequent_chance` | Float | `0.01` | Chance each further extra birth occurs after the first. |
| `engine_multiple_birth_maximum` | Integer | `6` | Maximum number of offspring from a single birth. |
| `engine_multiple_birth_identical_chance` | Float | `0.5` | Chance that twins are identical (clones) rather than separately bred. |

### Creature Selectability

| Variable | Type | Value | Description |
|---|---|---|---|
| `Grettin` | Integer | `1` | When `1`, Ettins and Grendels are selectable (not just Norns). Docking Station enables this by default (C3 ships it as `0`). |

### Creature Pickup

| Variable | Type | Value | Description |
|---|---|---|---|
| `engine_creature_pickup_status` | Integer | `3` | Controls whether/how creatures may be picked up by the hand. |

### Default Creature Properties

Defaults applied to newly hatched or imported creatures (read by the breeding/hatching scripts). Identical to C3.

| Variable | Type | Value | Decoded | Description |
|---|---|---|---|---|
| `c3_creature_accg` | Integer | `5` | — | Default gravitational acceleration (`ACCG`) at birth. |
| `c3_creature_bhvr` | Integer | `15` | Activate1 (1) + Activate2 (2) + Deactivate (4) + Hit (8) | Default creature permissions: may activate/deactivate/hit agents, but not eat (16) or pick up (32). |
| `c3_creature_attr` | Integer | `198` | Mouseable (2) + Activateable (4) + SufferCollisions (64) + SufferPhysics (128) | Default attributes: mouse-pickable, clickable, collides with room boundaries, subject to physics. |
| `c3_creature_perm` | Integer | `100` | — | Default permeability (0–100); 100 = passes through all room boundaries. |

### Metaroom Transition

| Variable | Type | Value | Description |
|---|---|---|---|
| `c3_meta_transition` | Integer | `0` | Metaroom camera transition style used by `META`; `0` = no special effect. |

### Engine Behaviour

| Variable | Type | Value | Description |
|---|---|---|---|
| `engine_synchronous_learning` | Integer | `0` | Asynchronous learning (creatures learn from all stimuli, not only the attended action). |
| `engine_zlib_compression` | Integer | `5` | Zlib level (0–9) for saved worlds/archives; profiled best balance. |

### Rendering Planes

| Variable | Type | Value | Description |
|---|---|---|---|
| `engine_plane_for_lines` | Integer | `8500` | Z-plane at which debug/connector lines are drawn. |
| `chat_plane` | Integer | `8500` | Base z-plane for the Docking Station chat/speech UI. |
| `chat_plane_max` | Integer | `8800` | Upper z-plane bound for chat elements. |
| `chat_plane_highest` | Integer | `8810` | Highest z-plane reserved for chat (topmost chat element). |

The chat-plane variables are new in Docking Station and reserve a band of high render planes for its online chat interface.

### Game Type (docked vs undocked)

The script derives a human-readable game-type tag from the auxiliary-bootstrap EAME variable set by the [DS world switcher](DS%20world%20switcher.md):

```caos
doif eame "engine_no_auxiliary_bootstrap_1" = 1
    sets game "ds_game_type" "undocked"
elif eame "engine_no_auxiliary_bootstrap_1" = 0
    sets game "ds_game_type" "docked"
endi
```

| Variable | Type | Value | Description |
|---|---|---|---|
| `ds_game_type` | String | `"undocked"` / `"docked"` | Whether the current world is running as a standalone Docking Station world or docked with Creatures 3. |

### Import / Welcome

| Variable | Type | Value | Description |
|---|---|---|---|
| `engine_clone_upon_import` (EAME) | Integer | `1` | Re-asserts forced cloning of creatures on import (also set by the switcher; reasserted here because EAME variables are not serialised). |
| `user_has_been_welcomed` | Integer | `0` | Cleared so the "Click when ready to connect" welcome agent is shown this session. |

---

## Script Termination

The script ends with `rgam` (**R**efresh **GAM**e variables), forcing the engine to immediately re-read every game variable and apply it to the running App- and World-level subsystems (audio, template size, time/season lengths, learning mode, compression, render planes, etc.). Without `rgam`, the new values would not take effect until the next full initialisation cycle.

## Impact on Stimulus / Room CA

None directly. The script only writes global configuration variables; it creates no rooms or CA and emits no stimuli. (It does configure systems — population limits, twinning chances, learning mode — that later affect creature/ecosystem behaviour.)
