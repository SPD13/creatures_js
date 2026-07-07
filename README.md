# Creatures Web Rebuild

A modern, browser-based rebuild of the classic artificial-life game **Creatures 3** (1999)
and its companion **Docking Station**, originally by Cyberlife / Creature Labs.

Creatures is a "digital biology" simulation: you hatch, raise, teach, and breed **Norns** —
little creatures with real simulated biochemistry, neural-network brains, and digital
genetics (DNA) that mutates and is passed on to their offspring. Care for them, teach them
language, keep them healthy, and grow a living, evolving world that runs entirely in your
browser.

This project faithfully recreates the original engine using modern web technologies. It runs
locally: a small launcher serves the game to your browser — there's no account, no telemetry,
and nothing is uploaded.

> ⚠️ **You must own the original game assets.** This download contains only the rebuilt engine
> — no copyrighted art, sounds, or creature data. See **Asset Packs** below.

---

## New Features

The rebuild stays faithful to the original game, but running in a modern browser makes room
for a few things the 1999 engine never had:

- **Zoom** — zoom in and out of the world freely, from close-up detail to a wide view of the
  surroundings.
- **Speed management** — control the game's execution speed: slow things down to watch a
  moment unfold, or speed the simulation up to fast-forward through the quiet stretches.
- **Mini-map** — an overview of the current metaroom that shows where you are and lets you
  jump anywhere with a click.
- **Touch-screen support** — full touch controls for tablets and phones, including gesture
  mapping for mouse actions and a virtual keyboard (see **Note on Tablets** below).
- **Full debugger** — deep-dive into the game's mechanics as they run: inspect the world, the
  ecosystem, and every creature's biochemistry, brain, and genetics in real time (see
  **The Debugger** below).
- **Wiki** — built-in documentation covering all the mechanics of the game.
- **Script documentation** — a browsable reference documenting all the COS scripts of
  Creatures 3 and Docking Station.

---

## The Debugger

The built-in debugger opens right on top of the running game and gives you a live view into
every layer of the simulation:

- **CAOS debugger** — visualize and debug all the CAOS scripts as they execute: step through
  them line by line, set breakpoints, and inspect the virtual machine's state.
- **Agent debugger** — browse every agent in the world and inspect its properties, scripts,
  and sprites.
- **Creatures debugger** — open up a creature and watch its biochemistry, organs, and brain
  in detail — lobes, neurons, chemical reactions, all live.
- **Map debugger** — visualize the metarooms, rooms, CA (cellular automata) levels, and all
  their characteristics.
- **Performance profiler** — see where the engine spends its time and track the simulation's
  performance.
- **Graphing tool** — trace values over time: chemical concentrations inside creatures,
  ecosystem variables, and game-mechanics variables, all plotted live.

---

## How to Install

### Requirements

- **[Node.js](https://nodejs.org/) 18 or newer** — the only thing you need to install.
  (The launcher is built on Electron, which is downloaded automatically on first run.)
- ~300 MB of free disk space (most of it the Electron runtime fetched on first install).
- An internet connection for the **first** install only — it runs offline afterwards.

### Steps

1. **Download** the latest `creatures-js-v<version>.zip` from the
   [**Releases**](../../releases) page.
2. **Unzip** it to a folder you can write to (e.g. your Documents or Desktop).
3. Open a terminal in that folder and run:

   ```bash
   npm install     # first run downloads the Electron runtime for your OS (~100–200 MB)
   npm start       # opens the Launcher
   ```

4. In the **Launcher**:
   - **Setup tab** — confirm Node.js is detected, point it at your **assets directory** (or
     use **Import…** to copy a game installation in), and click **Generate Index** for each
     asset pack.
   - **Run tab** — click **Start Server**, then **Open in Browser**.

Works on **Windows, macOS, and Linux** from the same download.

### Updating

The Launcher checks for new releases automatically and shows an **Update available** notice on
the Run tab. Click **Update now** and it downloads and installs the new version in place,
**keeping your assets, settings, and configuration**.

---

## Asset Packs

The game needs the original **copyrighted** assets (sprites, sounds, genetics), which are
**not** included here — you must own them. Two asset packs are supported:

| Asset Pack | Get it on Steam |
| --- | --- |
| **Creatures 3** | https://store.steampowered.com/app/1797350/Creatures_Docking_Station__Creatures_3/ |
| **Docking Station** | https://store.steampowered.com/app/1659050/Creatures_Docking_Station/ |

> Buy Creatures 3 to support the game, it's worth it — come on, it's less than a fancy coffee! ☕

### Adding your assets

- Put your purchased game folder(s) — named exactly **`Creatures 3`** and/or
  **`Docking Station`** — inside the `Assets/` directory of the unzipped package, **or** point
  the Launcher at another location via **Setup → Assets → Browse…**.
- The Launcher can also **Import…** a game installation for you, then **Generate Index** to
  make each pack playable.

You can install one or both packs; Docking Station builds on Creatures 3, so installing both
gives the fullest experience.

#### Where Steam installs the game

The Steam edition installs **both games into a single folder named `Creatures Docking Station`**
inside your Steam library's `steamapps/common`. The default locations are:

| OS | Typical default path |
| --- | --- |
| **Windows** | `C:\Program Files (x86)\Steam\steamapps\common\Creatures Docking Station\` |
| **macOS** | `~/Library/Application Support/Steam/steamapps/common/Creatures Docking Station/` |
| **Linux** | `~/.steam/steam/steamapps/common/Creatures Docking Station/` (or `~/.local/share/Steam/steamapps/common/…`) |

If you installed Steam (or this game) on another drive/library, the path differs. The reliable
way to find it: in Steam, **right-click the game → Manage → Browse local files** — that opens the
exact folder.

> The game is a native **Windows** title. On **Linux** it runs through Proton, but the asset
> files still live at the `steamapps/common/Creatures Docking Station/` path above. There is no
> native **macOS** build, so Mac users typically copy the assets from a Windows/Linux install
> (the assets themselves are platform-independent data).

---

## Note on Tablets (iOS, Android)

Touch devices have no mouse, so the game maps finger gestures to mouse actions. Open the game
in your tablet's browser (via the Launcher's **External URL**) and use:

| Gesture | Action |
| --- | --- |
| Swipe with **one finger** | Move the mouse cursor |
| Tap with **one finger** | Left click |
| Swipe with **two fingers** | Scroll the view (move the camera) |
| Tap with **two fingers** | Right click |

---

## FAQ

**Does the game work on Windows, Mac, Linux, iPad, and Android?**

Yes — the game is full JavaScript, meaning it is compatible with any device that can run a
modern browser like Chrome, Firefox, or Safari. (The Launcher that serves the game runs on a
Windows/macOS/Linux computer; tablets and phones such as iPad and Android then connect to it
over your local network using the **External URL** the Launcher shows.)

**Does the game work on touchscreens?**

Yes! The engine automatically detects that your device supports touch inputs. You can use a
one-finger tap to left click, a two-finger tap to right click, a one-finger swipe to move the
cursor, and a two-finger swipe to move the camera. A new button will show next to the burger
menu to open the virtual keyboard for text input.

**I found a zip online with the assets — can I use it?**

Please, **no**. The game assets are copyrighted material — buy the game on Steam.

**How can I report a bug?**

Open an issue on [GitHub](../../issues). Include a detailed description of the problem and the
context (what you were doing, which asset pack, your browser/OS), and — ideally — share a save
file so we can reproduce it. The version string shown in the in-game floating menu and the
asset-pack picker is helpful to include too.

---

## Notes

- This is a **run-only** build: the game engine ships as a bundled, minified package — there is
  no source code or developer tooling in this download.
- Not affiliated with or endorsed by Cyberlife, Creature Labs, Gameware, or the current
  rights holders. "Creatures", "Docking Station", and related names are trademarks of their
  respective owners. Game assets remain the property of their owners and are not distributed
  with this project.