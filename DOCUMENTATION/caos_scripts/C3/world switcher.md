# World Switcher

**Source file:** `Assets/Bootstrap/000 Switcher/world switcher.cos`

## Overview

The World Switcher is the startup user-interface agent of Creatures 3. It is created by the `000 Switcher` bootstrap directory — the only directory loaded for the special `Startup` world — and is responsible for presenting the player with the world selection screen on launch.

The agent drives a single compound UI that switches between several screens via an internal state machine:

- **First world creation** screen (shown when no worlds exist yet).
- **World list / switcher** screen (with pagination when more than 6 worlds exist, plus per-world *Load*, *Delete* and *Change password* actions).
- **New world creation** screen (entering a name for an additional world).
- **Password entry** screen (verifying the password of a protected world).
- **Password set/change** screen (entering and confirming a new password).
- **Delete confirmation** screen.
- **Loading** screen (calls `load wrld` and quits the switcher).

When the player commits to a world, the agent calls `load wrld ov04` and kills itself, handing control over to the chosen world (which then runs the remaining bootstrap directories — `001 World`, `001 World Patches`, etc. — through `World::CheckForNewNewlyInstalledProductsOrAddOns`).

The agent persists the last-selected world name in a small file called `World Switcher Persistent State Entries` so that the previously used world is remembered across sessions.

## Created Agents

| Classifier | Name | Description | Details |
|---|---|---|---|
| 1 2 1000 | World Switcher | Startup UI agent for selecting, creating, deleting and password-protecting worlds | [Details](#agent-1-2-1000-world-switcher) |

---

## Agent 1 2 1000: World Switcher

A compound agent built from the `world switcher` sprite (30 images), placed at world coordinates (111, 99). It listens for keyboard input (`imsk 64` enables raw key events) and uses a single state machine — driven by its `ov01`/`ov00` variables and message 2000 — to redraw itself when the screen needs to change.

On installation it:

1. Reads the persistent state file `World Switcher Persistent State Entries`. If present, it resolves the saved world name to a world index via `wnti`, stores it in `ov04`, and computes a page offset (`ov03`) so that the saved world will be visible in the switcher list.
2. Sends itself message **300** (with a 2-tick delay), which sets the appropriate initial screen depending on whether any worlds exist.
3. Starts a 40-tick polling timer that watches for changes to the world count.

### Agent Variables

| Variable | Purpose |
|---|---|
| `ov00` | Currently displayed screen state (mirrors `ov01` after a 2000 transition). Values: 1 = new-world form, 2 = first-world form, 3 = switcher list, 4 = password entry, 5 = delete confirmation, 6 = loading, 7 = password set/change. |
| `ov01` | Pending screen state. Set by event handlers, applied during message 2000. |
| `ov02` | Cached `nwld` (world count) used by the timer to detect newly-added or removed worlds. |
| `ov03` | Page offset into the world list (0, 6, 12, …) for pagination. |
| `ov04` | Index of the currently selected world (`-1` if none). Persisted to `World Switcher Persistent State Entries`. |
| `ov05` | Deferred target state used when a password challenge is required: holds the screen to switch to once the password is verified. |

### Events

All non-zero event numbers below 79 in this script are user-defined message numbers, not engine script-event slots. They are dispatched through compound-part button activations (`pat: butt … <message> 0`) and `mesg writ`/`mesg wrt+` calls.

| Event | Number | Description |
|---|---|---|
| Timer | 9 | World-count change watchdog |
| RawTranslatedChar | 79 | Escape-key handler |
| User message | 300 | Initial / refresh dispatcher (chooses first-world vs switcher) |
| User message | 400 | Page-navigation button (`_p1_ = 25` → previous page, otherwise next page) |
| User message | 450 | World-row selection button |
| User message | 500 | "Quit" button |
| User message | 501 | "New world" button on the switcher screen |
| User message | 502 | "Cancel" / back button |
| User message | 503 | World-name text-field commit (creates the world) |
| User message | 600 | "Load this world" button |
| User message | 608 | "Change password" button |
| User message | 700 | Password text-field commit |
| User message | 701 | Focus shift to the second password field (confirm) |
| User message | 1100 | "Delete this world" button |
| User message | 2000 | State-machine entry point — rebuilds the entire UI for `ov01` |
| User message | 3000 | Delete-confirmation accept |

### Event 9 - Timer (world-count watchdog)

Fires every 40 ticks (`tick 40` in the install script). If the live world count `nwld` differs from the cached `ov02`, the agent refreshes its cache, sets `ov01 = 3` (switcher list) and sends itself message 2000 to redraw — this is what makes the list react when worlds are created or deleted by other code paths.

### Event 79 - RawTranslatedChar (Escape)

When `_p1_ = 27` (Escape):

- If currently on the switcher list or refresh state (`ov00 = 2 or ov00 = 3`) → `quit` the engine.
- Otherwise → request a return to the switcher list (`ov01 = 3`, then `mesg writ ownr 2000`).

### Event 300 - Initial dispatcher

Reads the live world count. If it is 0 the agent shows the *first-world* creation screen (`ov01 = 2`); otherwise it shows the switcher list (`ov01 = 3`). The transition is performed by re-dispatching to message 2000.

### Event 400 - Page navigation

Adjusts `ov03` by 6 in the appropriate direction (`_p1_ = 25` is the "previous" button, anything else is "next"), then redraws the switcher (`mesg writ ownr 2000`).

### Event 450 - Select a world row

Computes the absolute world index from the button's part number (`_p1_ - 7 + ov03`), stores it in `ov04`, persists it to `World Switcher Persistent State Entries`, and animates the row (lock icon if password-protected, plain selection otherwise). It then re-creates the per-world action buttons:

- Part 95 → message 600 (Load)
- Part 96 → message 1100 (Delete)
- Part 97 → message 608 (Change password)

If the row that previously held the focus indicator is on a different page row, message 600 is triggered on it as a clean-up so its highlight gets dismissed.

### Event 500 - Quit

Animates the button, runs `quit` to shut the engine down and `kill ownr` for safety.

### Event 501 - "New world" button

From the switcher list, jumps to the *new-world* form (`ov01 = 1`).

### Event 502 - Cancel

Returns to the switcher list (`ov01 = 3`).

### Event 503 - World-name commit

Triggered when the player presses Enter in the new-world name field. Validates the entered text:

- Empty name → buzz sound and clear the field.
- A world with that name already exists (`wnti ptxt <> -1`) → buzz sound.
- The name passes through `fvwm` (filename-validate world maker) which sanitises it. If the sanitised version differs from what the player typed, the field is updated in place and the player must press Enter again. If the sanitised name is empty it is rejected.

When the name is accepted the script:

1. Creates the world via `wrld va00`.
2. Looks the new world up with `wnti` and stores its index in `ov04`.
3. Persists the chosen world name to `World Switcher Persistent State Entries`.
4. Transitions to either the loading screen (`ov01 = 6`) when this is the very first world (`ov00 = 2`), or back to the switcher list (`ov01 = 3`), recomputing the page offset so the new entry will be visible.

### Event 600 - Load this world

If the world has no password (`pswd ov04 = ""`) → request the loading screen (`ov01 = 6`).
If it does have a password → request the password-entry screen (`ov01 = 4`) and remember `ov05 = 6` so message 700 knows where to go after a successful unlock.

### Event 608 - Change password

Same pattern as event 600 but the post-success target is the password set/change screen (`ov01 = 7`).

### Event 700 - Password-field Enter

Two paths depending on `ov00`:

- **Password verification** (`ov00 = 4`, came from event 600/608/1100): compares the entered text against the stored password (`pswd ov04 = ptxt`). On match → `ov01 = ov05` (the deferred target). On mismatch → buzz, stay on the password screen (`ov01 = 3` for cancellation flow).
- **Password set/change** (`ov00 = 7`): part 5 holds the first entry (cached into `va00` on the first commit), part 7 holds the confirmation. If the two entries match, the new password is stored with `pswd va00` and the script transitions to the loading screen (`ov01 = 6`). On mismatch → buzz and reset to the verification screen (`ov01 = 7`).

### Event 701 - Focus the confirm field

Moves keyboard focus to part 7 (the password-confirmation text field) on the password set/change screen.

### Event 1100 - Delete this world

If the world has no password → request the delete-confirmation screen (`ov01 = 5`).
If it does have a password → request password verification first (`ov01 = 4`, `ov05 = 5`).

### Event 2000 - State-machine dispatcher

Heart of the agent. Locks input, stops the timer (`tick 0`) and:

1. Calls subroutine `kill_parts`, which iterates 100→1 and runs `pat: kill` on every part — wiping the entire UI.
2. Copies `ov01` into `ov00` (the new "current" state).
3. Dispatches based on `ov00`:

| `ov00` | Subroutine | Resulting screen |
|---|---|---|
| 1 | `make_new_world` | New-world creation form (with cancel back to switcher) |
| 2 | `make_first_world` | First-world creation form (no existing worlds yet, cancel = quit) |
| 3 | `make_switcher` | The main world-list screen, also re-arms `tick 20` |
| 4 / 7 | `make_password` | Password verification (4) or set/change (7) |
| 5 | `make_delete_screen` | Delete confirmation |
| 6 | `make_loading_screen` | Loads the selected world and kills self |

Finally it shows pose 0 on the body part. The dispatcher uses `inst` so the redraw is atomic.

### Event 3000 - Confirm delete

Deletes the selected world from disk (`delw wrld ov04`), clamps `ov04` to `-1` if it now points past the end of the world list, and re-runs the initial dispatcher (`mesg writ ownr 300`) so the screen returns to either the first-world form (if all worlds were deleted) or the switcher list.

### Subroutines

- **`kill_parts`** — iterates parts 100 down to 1, calling `pat: kill` on each. Used at every state transition in event 2000.
- **`make_first_world`** — title image, name text-input (part 3) bound to message 503, name-prompt label (part 4), *Create* button (part 5 → message 503), *Quit* button (part 6 → message 500). Used as the bottom of the screen on first launch.
- **`make_new_world`** — calls `make_first_world` then replaces the *Quit* button with a *Cancel* button (part 6 → message 502).
- **`make_loading_screen`** — moves the agent off-screen, switches the pointer agent to pose 19 (the hourglass), runs `load wrld ov04`, then `kill ownr`. The actual world load happens here.
- **`make_password`** — two layouts. For verification (`ov00 = 4`) it places a single password text-input bound to message 700 plus accept/cancel buttons. For set/change (`ov00 = 7`) it places two password fields (first → message 700, second → message 701/700) and the matching prompt labels.
- **`make_delete_screen`** — shows a "are you sure?" prompt incorporating the selected world's name (`wrld ov04`), confirm button → message 3000, cancel → message 502.
- **`make_switcher`** — the main list screen. Sets up the title, queries `nwld`, clamps the visible row count to 6, recomputes the page offset (`ov03`) so the list still fits when worlds are removed, then loops calling `make_one_switcher_entry` to build up to 6 rows. If the world count exceeds 6 it adds the previous-page (part 25 → message 400) and/or next-page (part 26 → message 400) navigation buttons. It also adds a *New world* button (part 28 → message 501), a *Quit* button (part 33 → message 500) and several decorative labels.
- **`make_one_switcher_entry`** — builds one world row: a text label (part `va01`) showing the world name (`wrld va53`) and a selection button (part `va01 + 6`) bound to message 450. The animation pose differs depending on whether the world is password-protected (`pswd va53`). For the currently-selected row, it also installs the per-world *Load* (part 95), *Delete* (part 96) and *Change password* (part 97) buttons targeting messages 600 / 1100 / 608.

### Removal Script

```
rscr
enum 1 2 1000
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
```

Removes every World Switcher instance and unregisters all of its custom event handlers. Note that the timer (9), Escape handler (79) and message 2000 are not unregistered here — their lifetime is tied to the agent itself and is cleaned up by `kill targ`.

### Impact on Stimulus / Room CA

None. The World Switcher is a pre-game UI agent. It exists only in the special `Startup` world, never coexists with creatures, and has no effect on stimuli or Room CA. Its only side effects on the file system are:

- Writing the selected world's name to `World Switcher Persistent State Entries`.
- Creating a new world via `wrld <name>` (event 503).
- Setting / clearing a world's password via `pswd <name>` (event 700).
- Deleting a world via `delw wrld ov04` (event 3000).
- Loading a world via `load wrld ov04` (in `make_loading_screen`).
