# Asset Packs

The Web Rebuild loads everything it needs to run — sprites, music, sounds, genomes, bootstrap CAOS scripts, and save files — from the `Rebuild/Assets/` directory. Rather than mixing one fixed set of files in that directory, the engine organizes them into **asset packs**: each pack is a self-contained subdirectory of `Assets/` holding a complete, independent version of the game's data. At startup the engine decides which pack to load, either automatically, from configuration, or by asking the user.

This lets a single installation hold several game versions side by side — for example a clean **Creatures 3** pack, a modded variant, or an experimental data set — and switch between them without copying files around. Because each pack also owns its own worlds and journals, switching packs gives you a fully isolated game state.

This article explains the directory layout, how a pack becomes "valid", how the active pack is chosen at boot, how that choice flows through the frontend and backend so every path resolves inside the chosen pack, and how to add a new pack of your own.

## Directory layout

The `Assets/` directory contains one subdirectory per pack. The pack name *is* the directory name (spaces allowed):

```
Rebuild/Assets/
└── Creatures 3/                 # one asset pack
    ├── Bootstrap/               # bootstrap CAOS (.cos) scripts — REQUIRED to be a pack
    ├── Images/                  # C16 / S16 sprite galleries
    ├── Backgrounds/             # BLK background tile sets
    ├── Body Data/               # creature body-part sprites + ATT files
    ├── Genetics/                # GEN / GNO genomes
    ├── Sounds/                  # WAV / MNG audio
    ├── Catalogue/               # .catalogue localisation files
    ├── Overlay Data/            # UI overlays
    ├── My Worlds/               # saved worlds (per-pack)
    ├── Journal/                 # journal text files (per-pack)
    ├── My Agents/               # imported .agent / .agents files (per-pack)
    ├── My Creatures/            # exported creatures (per-pack)
    ├── Rebuild/                 # UI / console / graph-layout settings sidecars (per-pack)
    ├── Creatures 3.ico          # the pack thumbnail shown in the chooser
    ├── asset-index.json         # generated file index — REQUIRED for validity
    └── asset-index-detailed.json# generated file index — REQUIRED for validity
```

A few directories deserve emphasis because they make a pack genuinely standalone:

- **`Bootstrap/`** holds the `.cos` scripts that build a fresh world. Its presence is what marks a subdirectory as a *candidate* pack.
- **`My Worlds/`, `Journal/`, `My Agents/`, `My Creatures/`** are user data. They live inside the pack, so saves created while one pack is active never collide with another pack's saves.
- **`Rebuild/`** is a small sidecar directory the backend uses for per-pack UI settings (`ui-settings.json`), console settings, and graph layouts.
- **The `.ico`** is rendered as the pack's thumbnail on the chooser screen. The engine prefers `<pack>/<pack>.ico` and otherwise uses the first `*.ico` it finds in the pack.

## What makes a pack "valid"

Two levels of recognition matter:

| Term | Condition | Consequence |
| --- | --- | --- |
| **Candidate** | The subdirectory contains a `Bootstrap/` folder | The Launcher lists it; the engine knows it *could* be a pack |
| **Valid** | The candidate also contains **both** `asset-index.json` **and** `asset-index-detailed.json` | The engine will offer it in the chooser and can boot it |

A candidate without its two index files is shown in the Launcher with a "No index" badge but is **not** selectable in the in-game chooser — generate its index first (see [Adding a new pack](#adding-a-new-pack)). The index files are required because the browser cannot list a directory; the game reads `asset-index.json` to discover the files inside the pack.

## Choosing the active pack at startup

When the game boots (`Rebuild/index.html`), the very first step — before any asset-consuming system is constructed — resolves which pack to use. The logic lives in `Main_Game/src/engine/core/AssetPackChooser.js` (`resolveAssetPack()`), and applies these rules in order:

1. **Configured pack.** If the GlobalConfig string `assets.pack` (or the URL parameter `?asset_dir=`) names a *valid* pack, use it and skip the chooser.
2. **Single pack.** Otherwise, if exactly one valid pack exists, use it automatically (no chooser).
3. **Multiple packs.** Otherwise, show a tile chooser overlaid on the loading screen — one tile per valid pack, with its `.ico` thumbnail and name. The boot sequence resumes when the user clicks a tile.
4. **No packs.** If no valid pack exists, the loading screen shows an error (and, if candidates exist without indexes, hints to generate them).

### Configuration

The active pack is controlled by a single GlobalConfig string:

| Mechanism | Example | Effect |
| --- | --- | --- |
| Config default | `assets.pack: ''` | Empty → run the rules above (chooser when multiple, auto when one) |
| Config file | `window.devConfig = { assets: { pack: 'Creatures 3' } }` | Pin a pack in `Main_Game/config.dev.js` |
| URL parameter | `?asset_dir=Creatures%203` | Pin a pack per-load; overrides the config file |
| Runtime | `GlobalConfig.set('assets.pack', 'Creatures 3')` | Programmatic |

An empty string is the default and means "ask" (subject to the single-pack auto-select). A non-empty value that matches a valid pack skips the chooser; a value that doesn't match falls back to the chooser/auto rules with a console warning.

## How the choice propagates

A chosen pack has to affect *two* layers: the browser (sprites, sounds, bootstrap, genomes — served as static files) and the backend (worlds, journals, PRAY resources, settings — read and written through Node). Both layers funnel through a single source of truth, so the pack is applied in exactly one place on each side.

### Frontend — PathResolver

Almost every asset path in the browser is derived from `window.PathResolver.getAssetPath()` (`Main_Game/src/utils/PathResolver.js`). Once a pack is chosen, `AssetPackChooser` calls `PathResolver.setAssetPack(name)`, after which `getAssetPath()` returns a pack-qualified path:

```
getAssetPath()  →  "Assets/Creatures 3"        (from the served root page)
                →  "../Assets/Creatures 3"      (from a /Main_Game/ page)
                →  "../../Assets/Creatures 3"   (from a /Main_Game/Test/ or /Tools/ page)
```

`AssetManager`, `BootstrapManager`, `CatalogueManager`, `AssetPathResolver`/`SpriteLoader`, the body-part and gallery loaders, and the sound manager all build their paths off `getAssetPath()`, so making PathResolver pack-aware steers every static fetch into the chosen pack with no per-consumer change. The pack **must** be set before `GameEngine` is constructed — which is exactly why `resolveAssetPack()` runs as the first boot step.

### Backend — ASSETS_ROOT and the active pack

`backend/server.js` treats `Assets/` as the **root** (`ASSETS_ROOT`, overridable via the `ASSETS_ROOT` environment variable) and tracks a single mutable `activePack`. A single valid pack auto-activates at startup; otherwise the backend waits for the client to choose. When the frontend resolves a pack it calls `POST /api/assets/select-pack`, which re-points every per-pack service at `Assets/<pack>/`:

- `DirectoryService.setBaseAssetsPath()` — worlds/saves (`WorldRegistry`, `WorldMetadata`, `WorldInit`, `WorldSave` all follow it)
- `UISettingsService` / `GraphLayoutService` / `ConsoleSettingsService` `.setBaseAssetsPath()` — the per-pack `Rebuild/` settings sidecars
- `FileService.setAssetsBasePath()` — CAOS `FILE` / journal I/O (a static class, so it uses a static settable base)
- `PrayManagerService.rescanFolders()` — re-indexes the new pack's `My Agents` / `My Creatures` / `Catalogue`

The net effect: after selection, saving a world writes to `Assets/<pack>/My Worlds/`, journal writes land in `Assets/<pack>/Journal/`, and PRAY resolves resources from the active pack.

> **Single-pack-per-process.** The backend holds one active pack at a time, which suits the single-user local model. If two browser tabs selected different packs, the last selection wins.

### REST API

The pack endpoints are mounted at `/api/assets` (`backend/routes/assets-api.js`, backed by `backend/services/AssetPackService.js`):

| Endpoint | Purpose |
| --- | --- |
| `GET /api/assets/packs` | List candidate packs as `{ name, valid, hasIcon, icon }`, plus the current `active` pack |
| `GET /api/assets/active` | Return the current active pack name |
| `GET /api/assets/icon/:pack` | Serve a pack's `.ico` (used as the chooser thumbnail) |
| `POST /api/assets/select-pack` | `{ pack }` → validate and re-point all per-pack services |

## The asset index generator

The two `asset-index*.json` files are produced by `scripts/generate-asset-index.cjs` (a CommonJS `.cjs` because the repo's root `package.json` is `type: module`). It is pack-aware:

```bash
# Index one pack (writes into Assets/<pack>/)
node scripts/generate-asset-index.cjs "Creatures 3"

# Index every candidate pack under Assets/
node scripts/generate-asset-index.cjs
npm run generate-assets        # same thing

# Point at a non-default assets root
ASSETS_ROOT=/path/to/Assets node scripts/generate-asset-index.cjs "Creatures 3"
```

The generator scans the pack, writes a file/directory listing plus a bootstrap loading order, and stamps the internal `basePath` field as `/Assets/<pack>`. Regenerate a pack's index after adding, renaming, or removing files inside it.

## The Launcher

The Electron [Launcher](launcher.md) is pack-aware and is the easiest way to manage packs:

- The **Assets** section lists every candidate pack found in the configured assets directory, each with its icon and a **valid / "No index"** badge.
- Each pack has a **Generate Index** (or **Regenerate Index**) button that runs the generator for just that pack and flips it to valid on success.
- A **Refresh** button rescans the directory so a newly added pack folder appears without restarting the Launcher.
- The Launcher passes its configured assets directory to the backend as `ASSETS_ROOT` when it starts the server, keeping the two in sync.

The Launcher only **lists and generates** — it does not pick a pack. Selection always happens in-game via the chooser (or the `assets.pack` config / `?asset_dir=` parameter).

## Adding a new pack

1. Create a new subdirectory under `Assets/`, e.g. `Assets/My Mod/`, and populate it with the game data (`Bootstrap/`, `Images/`, `Sounds/`, `Genetics/`, `Backgrounds/`, `Catalogue/`, `Overlay Data/`, `Body Data/`, …). At minimum it needs a `Bootstrap/` folder to be recognized as a candidate.
2. Add an icon, ideally `Assets/My Mod/My Mod.ico`, so it shows a thumbnail in the chooser.
3. Generate its index — either click **Generate Index** in the Launcher, or run `node scripts/generate-asset-index.cjs "My Mod"`. This produces the two required index files and makes the pack **valid**.
4. Boot the game. With more than one valid pack the chooser appears; pick **My Mod**, or pin it with `?asset_dir=My Mod` or `assets.pack: 'My Mod'`.

Saves, journals, and imported agents you create while the pack is active stay inside `Assets/My Mod/`, fully isolated from other packs.

## Key files

| File | Role |
| --- | --- |
| `Main_Game/src/engine/core/AssetPackChooser.js` | Resolves the pack at boot; renders the chooser; applies the choice |
| `Main_Game/src/utils/PathResolver.js` | `setAssetPack()` / pack-qualified `getAssetPath()` — frontend source of truth |
| `Main_Game/src/engine/core/GlobalConfig.js` | The `assets.pack` string and `?asset_dir=` parameter |
| `backend/server.js` | `ASSETS_ROOT`, the active pack, and `applyActivePack()` re-pointing |
| `backend/routes/assets-api.js` + `backend/services/AssetPackService.js` | The `/api/assets` endpoints and pack discovery |
| `scripts/generate-asset-index.cjs` | Pack-targetable asset-index generator |
| `Rebuild/Launcher/` | Lists packs, generates per-pack indexes, Refresh button |

## See also

- [Launcher](launcher.md) — the desktop app that lists packs and generates their indexes
