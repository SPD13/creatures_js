# login_disabler.cos — Disable Online Play

**Source file:** `Assets/Docking Station/Bootstrap/010 Docking Station Patches/login_disabler.cos`

## Overview

This is a **patch** that **disables the online (Babel) functionality** — the Creature Labs servers no longer exist — while still showing the welcome screen so single-player setup works normally. It **creates no new agent classes**; it removes the login flow and re-points the online UI to a "disabled" message.

On install it:

1. Kills the login GUI (`1 2 206`) and any existing welcome screen (`1 2 26`) and **unpauses the world** (which the login sequence had paused).
2. Builds the **Welcome Screen** (`1 2 26`) directly — bypassing the login — and moves the camera to the Meso.
3. Creates a stub `1 2 206` agent that, instead of logging in, makes the Comms Screen open straight to the **agent injector** (since the online modes are gone).
4. Replaces the "go online" hint (`1 1 224`) and the top-left HUD connect button (`1 2 14`) so that pressing them shows a **"Sorry, online play is disabled."** speech bubble instead of trying to connect.

## Patched / Created Agents

| Classifier | Name | Change | Description |
|---|---|---|---|
| 1 2 206 | Connect GUI | Modification + Creation | The login GUI is removed; a stub `1 2 206` redirects the Comms Screen to the agent injector |
| 1 1 224 | Go-Online Hint | Modification | Its click now shows the "online play disabled" bubble |
| 1 2 14 | Top-Left HUD | Modification | The connect button now shows the "online play disabled" bubble |
| 1 2 26 | Welcome Screen | Creation | Created directly (bypassing login) |
| 1 2 9 | Speech Bubble | Creation | The "online play disabled" message bubble |

## Behaviour

- **`1 2 206` event 10:** waits for the Comms Screen (`1 2 210`) to exist, then messages it to open and switch to the **agent injector** mode (online tabs being defunct).
- **`1 1 224` event 1000 / `1 2 14` event 1003:** spawn a `1 2 9` speech bubble reading "Sorry, online play is disabled." with a buzz, in place of starting a connection.

## Removal Script

This patch re-installs scripts and creates UI agents at install; it has no dedicated removal block.

## Impact on Stimulus / Room CA

None. This is a UI/networking patch. It emits no creature stimuli and writes no Room CA. Its effects are: skipping the (defunct) online login, **unpausing the world**, showing the welcome screen, and replacing all "go online" actions with a disabled-notice bubble.
