# wolf_patch.cos — Wolf Control Fix

**Source file:** `Assets/Docking Station/Bootstrap/010 Docking Station Patches/wolf_patch.cos`

## Overview

This is a **patch** for the **Wolf Control** (`1 2 202`, created by [DS wolf control](DS%20wolf%20control.md)) — the developer panel that drives **wolfling-run** mode (running the simulation faster than real time for breeding/ageing experiments) and shows world timing stats. It **creates no new agents**; it makes two fixes:

1. Makes the panel **camera-shy** (`attr 304`) so it doesn't appear in creature photographs.
2. Replaces the **timer/display script** (`1 2 202`, event 1000) with a version that no longer **divides by zero** when computing the frame rate (the old code could divide by a zero `race` value).

## Patched Agents

| Classifier | Name | Change | Description |
|---|---|---|---|
| 1 2 202 | Wolf Control | Modification | Camera-shy; timer/display script (event 1000) replaced to avoid divide-by-zero |

## Behaviour

### Event 1000 — Display update (patched)

While the panel is open (`ov00`), it rebuilds the status text: **world ticks**, **equivalent time** (h/m/s from `wtik`), **frame rate** (guarding against a zero `race`), and the current wolfling-run flags read from `wolf` — whether the display is rendering or updating every N seconds, whether **fast ticks** are on, and whether **autokill** is enabled — plus the hotkey help (Shift+Ctrl+W toggle window, +F fast speed, +A autokill). It then refreshes via `wolf 11 4`.

## Removal Script

This patch only re-installs the panel's display script; it has no agents of its own to remove.

## Impact on Stimulus / Room CA

None. The Wolf Control is a developer/debug panel governing simulation speed (wolfling run). It emits no creature stimuli and writes no Room CA. This patch's effects are a divide-by-zero fix and hiding the panel from creature photos.
