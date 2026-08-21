# Web Rebuild Configuration Files

Beyond the game data it shares with the original engine (worlds, creatures, journals), the Web Rebuild persists a small set of **JS-only configuration files**. These files store *your* preferences — window positions, volume, graph layouts, debug-console filters — rather than game state. They are written in plain JSON, are never read or written by the original engine, and are safe to inspect, copy, or delete (deleting one simply resets the corresponding settings to defaults).

This article catalogues each file: where it lives, what it contains, which part of the engine reads and writes it, and how to back it up.

## The per-pack `Rebuild/` sidecar directory

The main home for these files is a directory named **`Rebuild/`** created automatically inside the **active asset pack**:

```
Rebuild/Assets/
└── <Pack Name>/                  # e.g. "Creatures 3" or "Docking Station"
    └── Rebuild/                  # created on demand — settings sidecars
        ├── ui-settings.json      # floating windows, volume, minimap, spacers
        ├── graph-layout.json     # Graph tab layout (metrics, creatures, windows)
        └── console-settings.json # debug console log levels & group state
```

Key properties:

- **Per-pack.** The backend re-points these files whenever the active asset pack changes, so your Creatures 3 and Docking Station settings are fully independent (see [Asset Packs](#/article/asset-packs) for how the active pack is resolved).
- **Created on demand.** The `Rebuild/` subdirectory is created on every read or write if missing — you never need to create it yourself.
- **Deliberately segregated.** The directory keeps JS-only data out of the engine-shared world directories, so a pack's game data stays byte-compatible with the original engine.

> 💾 **Back up this directory.** If you reinstall, move, or re-import your assets, copy each pack's `Rebuild/` folder somewhere safe and restore it afterwards — it is the only durable copy of your UI, graph, and console preferences.

## How persistence works (localStorage + server sync)

Each file is the server-side half of a **two-way sync with the browser's `localStorage`**:

1. **At startup**, the frontend fetches the server snapshot and applies it to `localStorage` *before* any UI module reads its persisted state. The server copy is authoritative at startup — settings survive a browser-storage reset. If the server has no copy yet, the current `localStorage` values are uploaded to bootstrap it.
2. **During play**, `localStorage` remains the primary store. Writes to tracked keys are pushed back to the server (debounced for UI settings, on explicit save for the graph layout).
3. **Degrades gracefully.** If the backend is unreachable, `localStorage` keeps working standalone and the sync silently retries on the next session.

The whole mechanism is gated by one GlobalConfig flag, **`ui.persistSettingsToServer`** (default `true`; see [Configuration Options](#/article/configuration-options)). Setting it to `false` disables all server sync and leaves settings purely in the browser.

`graph-layout.json` and `console-settings.json` follow this envelope shape:

```json
{
  "version": 1,
  "updatedAt": "2026-07-07T14:59:01.923Z",
  "settings": { ... }        // or "layout" for graph-layout.json
}
```

`ui-settings.json` uses a **per-device** envelope instead — see the next section.

## The three settings files

### `ui-settings.json` — general UI preferences

| | |
| --- | --- |
| **Written by** | `backend/services/UISettingsService.js` via `PUT /api/ui-settings` |
| **Frontend sync** | `Main_Game/src/game/ui/UISettingsSync.js` (debounced `localStorage` interceptor) |

Stores pure user-preference UI state, **partitioned per device**. Window positions are absolute pixels, so a layout saved on a desktop must not be applied to a tablet — each browser profile mints a stable random id (localStorage key `c3_device_id`, never synced) and reads/writes only its own bucket (format v2):

```json
{
  "version": 2,
  "updatedAt": "2026-08-11T09:12:53.112Z",
  "devices": {
    "<device-uuid>": {
      "updatedAt": "2026-08-11T09:12:53.112Z",
      "meta": { "label": "<user agent>", "viewport": "1728x1049" },
      "settings": { "<tracked key>": "<value>" }
    }
  }
}
```

A device the server has never seen starts from defaults (always in-viewport) and gets its own bucket on first save. Clearing browser storage mints a new device id; orphaned buckets are pruned (the newest 10 are kept). Legacy single-bucket v1 files are superseded on the first save after updating — every device starts fresh once.

One entry per tracked `localStorage` key inside each device bucket:

| Key | Contents |
| --- | --- |
| `c3_popout_zoom`, `c3_popout_speed`, `c3_popout_world`, `c3_popout_performance` | Floating-menu popout windows — `{ open, left, top }` |
| `c3_popout_nornai_actions` | NornAI debugger Actions popout — `{ open, left, top, width, height }` |
| `c3_volume_settings` | `{ master, music, sfx, muteMaster, muteMusic, muteSfx }` |
| `c3_minimap_visible`, `c3_minimap_position` | Minimap visibility and position |
| `c3_ui_space_left`, `c3_ui_space_right`, `c3_ui_space_top`, `c3_ui_space_bottom` | UI spacer sizes in pixels (blank margin reserved on each side of the game canvas, set from the floating menu's **Config** action) |
| `c3_graph_popouts` | Graph tab popout windows — `{ [tabName]: { open, left, top, width, height } }` |
| `c3_debug_float` | Floating debug console — `{ floating, left, top, width, height }` |

Unlike the other two files, this one syncs **automatically**: `UISettingsSync` patches `localStorage.setItem` so any write to a tracked key schedules a debounced (300 ms) upload — no explicit save action needed.

### `graph-layout.json` — Graph tab layout

| | |
| --- | --- |
| **Written by** | `backend/services/GraphLayoutService.js` via `PUT /api/graph-layout` |
| **Frontend sync** | `Main_Game/src/game/ui/GraphLayoutSync.js`, mirroring the `creatures3_graph_layout` localStorage key |

Stores the Home Module's Graph tab configuration under a single `layout` object:

```json
{
  "layout": {
    "timeWindow": 60000,          // visible plot window (ms)
    "averageWindowMs": 2000,      // averaging/smoothing window (ms)
    "activeTabIndex": 0,
    "tabs": [
      {
        "name": "Graph 1",
        "creatureId": null,       // bound creature (null = first creature)
        "metrics": [
          { "key": "map.3.2", "displayName": "Room 3: Heat" }
        ]
      }
    ]
  }
}
```

This file is only written when you click the **Save** button (💾) in the Graph tab — `GraphModule.saveLayout()` writes `localStorage` first, then pushes the same snapshot to the server. On startup the server copy is pulled into `localStorage` before the layout is restored, so the saved graphs reappear exactly as configured, with creature bindings re-resolved by ID (falling back to the first creature if the saved one no longer exists).

Note this file stays **device-independent** (shared by all devices): it describes graph *content* — which tabs, metrics, and creatures — not window geometry. The popped-out graph windows' positions/sizes are geometry and live in `ui-settings.json` under the per-device `c3_graph_popouts` key.

### `console-settings.json` — Debug Console preferences

| | |
| --- | --- |
| **Written by** | `backend/services/ConsoleSettingsService.js` via `PUT /api/console-settings` |
| **Frontend sync** | `Main_Game/src/game/ui/ConsoleSettingsSync.js` |

Stores the Debug Console / LogManager state, mirroring two `localStorage` keys:

| Key | Contents |
| --- | --- |
| `creatures3-log-preferences` | LogManager configuration — global log level, default category level, and a per-module map of `{ level, enabled, categoryLevels }` for every registered module (CAOSMachine, DisplayManager, HomeModule, …) |
| `creatures3-debug-collapsed-groups` | Which console groups/subgroups you have collapsed or expanded |

The sync is triggered whenever you change log settings through the console UI (`LogManager.savePreferences()`) or collapse/expand groups (`ConsoleModule.saveCollapsedState()`).

## Related configuration files elsewhere

These files are also Web-Rebuild-specific but live outside the per-pack `Rebuild/` directory and follow different lifecycles:

| File | Location | Role |
| --- | --- | --- |
| `config.dev.js` | `Rebuild/Main_Game/` | Developer's persistent GlobalConfig overrides (gitignored, hand-written). Full reference: [Configuration Options](#/article/configuration-options) |
| `creatures3-launcher-config.json` | Electron user-data directory | The desktop Launcher's own settings — assets directory, port, Node path. See [Launcher](#/article/launcher) |
| `asset-index.json`, `asset-index-detailed.json` | `Assets/<pack>/` | Generated file indexes that make a pack bootable — build artifacts, not user settings; regenerate rather than back up. See [Asset Packs](#/article/asset-packs) |

World-specific sidecars (`*.companion.json`, `world-metadata.json`, `*.nornai.json` under `My Worlds/`) are **save data**, not configuration — they are part of a world and travel with it.

## Quick reference

| File | Saved when | Backup priority |
| --- | --- | --- |
| `Assets/<pack>/Rebuild/ui-settings.json` | Automatically, ~300 ms after any UI change | High — window layout, volume |
| `Assets/<pack>/Rebuild/graph-layout.json` | On Graph tab **Save** click | High — hand-built graph setups |
| `Assets/<pack>/Rebuild/console-settings.json` | On any console settings change | Medium — log filters |
| `Main_Game/config.dev.js` | Hand-edited | High for developers |
