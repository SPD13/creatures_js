# DS world switcher

**Source file:** `Assets/Docking Station/Bootstrap/000 Switcher/DS world switcher.cos`

## Overview

The DS World Switcher is the startup user-interface agent of Docking Station. It is created by the `000 Switcher` bootstrap directory — the only directory loaded for the splash/switcher world — and presents the world-selection screen on launch. It is the Docking Station evolution of the Creatures 3 [World Switcher](../C3/world%20switcher.md), written by Daniel Silverstone (1999) and enhanced for Docking Station by Ashley Harman and Francis Irving (2000).

It keeps the same compound-UI state machine as the C3 switcher (one agent that rebuilds itself into several screens via message 2000), but adds Docking Station's **docking model**:

- **World types** — each world is tagged `docked`, `undocked`, or `c3` (a world made in Creatures 3). The tag is written to a `wtype` file in the world's journal directory and toggled at creation time by a new *World Type* button (message 800).
- **C3-installed detection** — `reaq "patch_level"` checks whether a correctly-patched Creatures 3 is present. Loadability depends on the combination of world type and C3 presence: undocked DS worlds always load; undocked C3 worlds and docked worlds need C3 installed; etc. When a world cannot load, an **info agent** (classifier `1 2 1001`) is shown explaining why.
- **Build-number compatibility** — the world's `build` file is compared against the running engine's `build_number`; pre-144 / unknown builds raise a warning dialog before loading.
- **Auxiliary bootstrap control** — before loading, the EAME variable `engine_no_auxiliary_bootstrap_1` is set to choose whether the Creatures 3 bootstrap directory is also run (0 = also load C3 bootstrap for a docked world, 1 = DS-only for an undocked world).
- **Forced creature cloning on import** — the install script sets the EAME variable `engine_clone_upon_import` to 1 so imported creatures are always cloned (preventing mix-and-match tracking/history corruption). This is an EAME (engine application) variable and is not serialised, so it is asserted here on every launch.

When the player commits to a world the agent writes the selection to a `World Switcher Persistent State Entries` file, sets the auxiliary-bootstrap EAME, calls `load wrld ov04`, and kills itself.

> **Reinjection note (from the source):** under some circumstances the switcher is reinjected, so any change to this install script must also be mirrored in the reinject routine inside the info agent, script `1 2 1001 1000`.

## Created Agents

| Classifier | Name | Description | Details |
|---|---|---|---|
| 1 2 1000 | DS World Switcher | Startup UI agent for selecting, creating, deleting, password-protecting and docking/undocking worlds | [Details](#agent-1-2-1000-ds-world-switcher) |
| 1 2 1001 | World Switcher Info / Reinject agent | Pops up explanatory dialogs (C3-not-installed, dock-required, old-build warning) and handles reinjection / docking of the switcher | [Details](#agent-1-2-1001-info--reinject-agent) |

---

## Agent 1 2 1000: DS World Switcher

A compound agent built from the `ds world switcher` sprite (30 images), placed near (115, 92). It enables raw key events (`imsk 64`), fades itself in, and uses a single state machine — driven by its `ov00`/`ov01` variables and message 2000 — to redraw itself whenever the screen needs to change.

On installation it:

1. Sets `ov00 = 0` (no screen defined yet) and reads the persistent state file `World Switcher Persistent State Entries`. If present, it resolves the saved world name to a world index (`wnti`), stores it in `ov04`, and computes a page offset (`ov03`) so the saved world is visible.
2. Sends itself message **300** (initial dispatcher) and starts a 40-tick polling timer that watches the world count.

### Agent Variables

| Variable | Purpose |
|---|---|
| `ov00` | Currently displayed screen state. 0 = none, 1 = new-world form, 2 = first-world form, 3 = switcher list, 4 = password entry, 5 = delete confirmation, 6 = loading, 7 = password set/change. |
| `ov01` | Pending screen state. Set by event handlers, applied during message 2000. |
| `ov02` | Cached `nwld` (world count) used by the timer to detect added/removed worlds. |
| `ov03` | Page offset into the world list (0, 6, 12, …) for pagination. |
| `ov04` | Index of the currently selected world (`-1` if none). Persisted to `World Switcher Persistent State Entries`. |
| `ov05` | Deferred target state when a password challenge is required: the screen to switch to once the password is verified. |
| `ov74` | "Already faded in" flag, so the fade-in animation only plays once. |
| `ov99` | Reinjection marker (set by the reinject routine). |

### Events

All non-zero event numbers below are user-defined message numbers (dispatched through compound-part button activations `pat: butt … <message> 0` and `mesg writ`/`mesg wrt+`), except the timer (9) and the raw-key handler (79).

| Event | Number | Description |
|---|---|---|
| Timer | 9 | World-count change watchdog |
| RawTranslatedChar | 79 | Escape-key handler |
| User message | 300 | Initial / refresh dispatcher (first-world vs switcher) |
| User message | 400 | Page-navigation button (`_p1_ = 25` → previous page, else next page) |
| User message | 450 | World-row selection button |
| User message | 500 | "Quit Docking Station" button (fades out, then `quit`) |
| User message | 501 | "Create world" button on the switcher screen |
| User message | 502 | "Cancel" / back button |
| User message | 503 | World-name text-field commit (creates the world) |
| User message | 600 | "Load this world" button |
| User message | 608 | "Lock world" (password-protect) button |
| User message | 700 | Password text-field commit |
| User message | 701 | Focus shift to the confirm-password field |
| User message | 800 | **World Type toggle** (docked ↔ undocked) — Docking Station addition |
| User message | 1100 | "Delete this world" button |
| User message | 2000 | State-machine entry point — rebuilds the entire UI for `ov01` |
| User message | 3000 | Delete-confirmation accept |

### Event 9 — Timer (world-count watchdog)

Fires every 40 ticks. If the live `nwld` differs from cached `ov02`, refreshes the cache, sets `ov01 = 3` (switcher list) and sends message 2000 to redraw — so the list reacts when worlds are created/deleted elsewhere.

### Event 79 — RawTranslatedChar (Escape)

When `_p1_ = 27` (Escape): if on the switcher list / refresh state (`ov00 = 3 or ov00 = 2`) → `quit`; otherwise request a return to the switcher list (`ov01 = 3`, `mesg writ ownr 2000`).

### Event 300 — Initial dispatcher

Reads the live world count: 0 → first-world creation screen (`ov01 = 2`); otherwise switcher list (`ov01 = 3`). Performed by re-dispatching to message 2000.

### Event 400 — Page navigation

Adjusts `ov03` by ±6 (`_p1_ = 25` is "up/previous", else "down/next"), then redraws (`mesg writ ownr 2000`).

### Event 450 — Select a world row

Computes the absolute world index from the button part (`_p1_ - 7 + ov03`), stores it in `ov04`, persists it, animates the selected row, and re-creates the per-world action buttons: part 95 → 600 (Load), part 96 → 1100 (Delete), part 97 → 608 (Lock).

### Event 500 — Quit Docking Station

Fades the whole agent out over a short loop (`alph` ramps to 256), waits, then `quit` and `kill ownr`.

### Event 501 / 502 — New world / Cancel

501 jumps from the switcher list to the *new-world* form (`ov01 = 1`); 502 returns to the switcher list (`ov01 = 3`).

### Event 503 — World-name commit (create world)

Validates the entered name (rejects empty, rejects an existing name via `wnti`, sanitises with `fvwm` and requires re-entry if the sanitised form differs). On acceptance it:

1. Creates the world (`wrld va00`).
2. **Writes the world type** to the new world's journal directory — `engine_other_world` is set to the world name, then a `wtype` file is written from the `name "wtype"` value chosen on the create screen, and a `build` file is written from the engine `build_number`.
3. Persists the chosen world to `World Switcher Persistent State Entries`.
4. Transitions to the loading screen (`ov01 = 6`) if this was the first world (`ov00 = 2`), else back to the switcher list with a recomputed page offset.

### Event 600 / 608 / 1100 — Load / Lock / Delete

Each animates its button and then routes through the password gate: if the world has a password (`pswd ov04 <> ""`) it first shows password verification (`ov01 = 4`) and stores the post-success target in `ov05` (6 = load, 7 = lock); otherwise it goes straight to load (`ov01 = 6`), lock/change-password (`ov01 = 7`), or delete confirmation (`ov01 = 5`).

### Event 700 / 701 — Password commit / focus confirm

700 has two paths: **verification** (`ov00 = 4`) compares input to the stored password and, on match, jumps to the deferred target `ov05` (buzz on mismatch); **set/change** (`ov00 = 7`) caches the first entry, compares it to the confirmation, stores it with `pswd va00` and proceeds to loading (`ov01 = 6`) on match (buzz + retry on mismatch). 701 moves keyboard focus to the confirm field.

### Event 800 — World Type toggle (Docking Station)

Plays a "2bep" sound and flips the `name "wtype"` between `docked` and `undocked`, updating the toggle button pose (part 7) and the world-type description text (part 9). This is only meaningful on the create screen and only when Creatures 3 is installed.

### Event 2000 — State-machine dispatcher

Locks input, stops the timer (`tick 0`), calls `kill_parts` (wipes the UI), copies `ov01` into `ov00`, and dispatches to a `make_*` subroutine:

| `ov00` | Subroutine | Resulting screen |
|---|---|---|
| 1 | `make_new_world` | New-world creation form (cancel back to switcher) |
| 2 | `make_first_world` | First-world creation form (cancel = quit) |
| 3 | `make_switcher` | Main world-list screen, re-arms `tick 20` |
| 4 / 7 | `make_password` | Password verification (4) or set/change (7) |
| 5 | `make_delete_screen` | Delete confirmation |
| 6 | `make_loading_screen` | Performs the docking/compatibility checks and loads, or shows the info agent |

It then shows pose 0 on the body part and, on first display only (`ov74 = 0`), plays the fade-in.

### Event 3000 — Confirm delete

Records refresh hints (`post-deletion_refresh`, `first_world`, `deleted_world` name variables) so the list can return to a sensible page, deletes the world (`delw wrld ov04`), clamps `ov04`, and re-runs the initial dispatcher (`mesg writ ownr 300`).

### Key subroutine: `make_loading_screen` (docking & compatibility gate)

This is the heart of Docking Station's added logic. It reads the selected world's `wtype` (defaulting to `c3` when absent, and writing a `build` file in that case), checks whether C3 is installed (`reaq "patch_level" = 1` → `va33`), and validates the world's build number against the engine (`build_number`), warning via the info agent for unknown/pre-144 builds. It then branches on `(wtype, C3-installed)`:

| World type | C3 installed | Behaviour |
|---|---|---|
| `docked` | yes | OK — set `engine_no_auxiliary_bootstrap_1 = 0` and `load wrld ov04` (also runs C3 bootstrap) |
| `undocked` | (either) | OK — set `engine_no_auxiliary_bootstrap_1 = 1` and `load wrld ov04` (DS-only bootstrap) |
| `docked` | no | Refuse — info agent: C3 must be reinstalled |
| `c3` | no | Refuse — info agent: install C3, then dock the world |
| `c3` | yes | Refuse for now — info agent: world must be docked before it can load |

### Other subroutines

- **`kill_parts`** — iterates parts 100→1 calling `pat: kill`, wiping the UI at every transition.
- **`make_first_world`** — title/background, name text-input (part 3 → 503), and the Docking-Station **World Type** button (part 7 → 800, shown as a live toggle when C3 is installed, or a static "undocked" dull part when it is not), world-type label, *Create* (part 5 → 503) and *Quit/Cancel* (part 6 → 500) buttons. Sets the default `name "wtype"` to `undocked`.
- **`make_new_world`** — calls `make_first_world` then swaps the *Quit* button for a *Cancel* button (part 6 → 502).
- **`make_password`** — verification layout (`ov00 = 4`, single field → 700) or set/change layout (`ov00 = 7`, two fields → 700/701), with accept (→700) and cancel (→502) buttons.
- **`make_delete_screen`** — "are you sure?" prompt with the world name, confirm (→3000) and back (→502) buttons.
- **`make_switcher`** — builds the main list: title, clamps visible rows to 6, recomputes the page offset (including special handling after a deletion via the refresh hints), loops `make_one_switcher_entry`, adds page up/down buttons (parts 25/26 → 400) when more than 6 worlds exist, plus *Create world* (part 28 → 501), *Quit* (part 33 → 500) and label parts.
- **`make_one_switcher_entry`** — builds one world row: a name label and a selection button (→450) whose sprite pose depends on the row's `wtype` and password state (docked / undocked / c3, locked or not). For the selected row it also installs the Load (part 95 → 600), Delete (part 96 → 1100) and Lock (part 97 → 608) buttons.

---

## Agent 1 2 1001: Info / Reinject agent

A lightweight helper created on demand (`new: comp 1 2 1001 "useful_screen" …`) by `make_loading_screen` and the build-warning path. It shows an explanatory dialog (with one or two buttons) when a world cannot be loaded, and also carries the switcher's **reinjection** logic. Its `ov00` selects what it is being used for.

### Events

| Event | Number | Description |
|---|---|---|
| User message | 1000 | Main entry: reinject the switcher, dock a world, or kill-and-reinject depending on `ov00` |
| User message | 1001 | Clears the `name "waiting"` flag and kills the (build-warning) info agent |

### Event 1000 — Info action dispatcher

Branches on `ov00`: `1` → `gsub reinject`; `2` → `gsub dock_this`; `3` → retarget the existing switcher (`rtar 1 2 1000`), kill it, then `gsub reinject`.

- **`reinject`** — enumerates and kills any existing `1 2 1000` switcher, then recreates it from scratch (mirroring the install script: fade-in setup, persistent-state read, `imsk 64`, message 300, `tick 40`), sets `ov99 = 1`, and finally kills the info agent. This is the routine the source warns must be kept in sync with the install script.
- **`dock_this`** — hides the dialog and pointer, writes `"docked"` into the target world's `wtype` journal file, sets `engine_no_auxiliary_bootstrap_1 = 0`, and `load wrld ov04` (then kills itself). This is how a C3/undocked world is converted to docked and loaded.

### Event 1001

Asserts `ov00 = 3`, retargets the switcher, clears the `name "waiting"` flag (releasing the build-warning wait loop), and kills the info agent.

---

## Removal Script

```
rscr
enum 1 2 1000
    kill targ
next
enum 1 2 1001
    kill targ
next

scrx 1 2 1000 1100
scrx 1 2 1000 608
scrx 1 2 1000 300
scrx 1 2 1000 700
scrx 1 2 1000 701
scrx 1 2 1000 500
scrx 1 2 1000 501
scrx 1 2 1000 502
scrx 1 2 1000 503
scrx 1 2 1000 450
scrx 1 2 1000 600
scrx 1 2 1000 400
scrx 1 2 1000 3000
scrx 1 2 1000 800
scrx 1 2 1001 1000
```

Kills every switcher and info-agent instance and unregisters their custom event handlers (including the Docking-Station-specific message 800 and the info agent's message 1000). As in C3, the timer (9), Escape handler (79) and message 2000 are tied to the agent's own lifetime and cleaned up by `kill targ`.

## Impact on Stimulus / Room CA

None. The switcher is a pre-game UI agent living only in the splash/switcher world; it never coexists with creatures and has no effect on stimuli or Room CA. Its side effects are all file-system / engine state:

- Writing the selected world to `World Switcher Persistent State Entries`.
- Setting the EAME variables `engine_clone_upon_import` and `engine_no_auxiliary_bootstrap_1`, and the GAME variable `engine_other_world`.
- Writing each world's `wtype` and `build` files in its journal directory.
- Creating (`wrld`), deleting (`delw`), password-setting (`pswd`) and loading (`load wrld`) worlds.
