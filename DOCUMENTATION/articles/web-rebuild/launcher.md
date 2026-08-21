# Launcher

The **Creatures 3 Launcher** is a small cross-platform desktop app (Electron) that replaces the manual terminal workflow for running the Web Rebuild. One window takes care of: checking Node.js, installing npm dependencies, picking an assets folder, generating the asset indexes the game needs to boot, starting and stopping the backend server, and opening the game in the system browser. It lives at `Rebuild/Launcher/` and reads/writes a local JSON config so every settings survives between sessions.

This article covers what the Launcher does, how to install and run it on Windows and macOS, what each configuration option means, and why the two `asset-index*.json` files it can regenerate are essential for the game to start.

## Role and function

Without the Launcher, a contributor has to do all of the following by hand, in the right order, from a terminal:

1. Install Node.js.
2. `cd Rebuild && npm install` to get the backend's runtime dependencies (`express`, `cors`, `pako`).
3. `npm run generate-assets` to produce `asset-index.json` and `asset-index-detailed.json` in `Rebuild/Assets/`.
4. `npm start` (or `node backend/server.js`) to boot the backend.
5. Open `http://localhost:8000/Main_Game/Test/test-map-background-bootstrap.html` in a browser.

The Launcher wraps each of those steps behind a status dot and a button, streams their output to a log panel, and persists the user's choices (port, assets directory, detected Node path) so the next launch is one click away. It's explicitly meant for developers and testers who want a friendly on-ramp without giving up the underlying scripts — every action the Launcher triggers is a process it spawns on top of the same `package.json` scripts the terminal workflow uses.

## File layout

```
Rebuild/Launcher/
├── package.json                     # Electron app manifest + npm scripts
├── main.js                          # Main process: IPC handlers, child processes
├── preload.js                       # contextBridge exposing window.launcherAPI to the renderer
├── renderer/
│   ├── index.html                   # UI markup (Setup tab + Logs tab)
│   ├── renderer.js                  # UI controller
│   └── styles.css                   # Styling
├── creatures3-launcher-config.json  # Persisted user settings (gitignored)
├── node_modules/                    # Created by npm install (gitignored)
├── Doc.md                           # In-repo technical notes
└── Doc/                             # Supporting images / notes
```

The Launcher is completely independent of the game's `Rebuild/node_modules/` tree — it has its own `package.json` and its own dependencies.

## Prerequisites

### Node.js (required)

Node.js is the only external dependency. It provides both the JavaScript runtime Electron needs and the `npm` CLI that installs the Launcher itself and the game's backend packages.

- **Minimum version:** Node.js `14.0.0` or newer. LTS is recommended.
- The Launcher detects the **system** Node.js (not the one bundled inside Electron) by running `which node` on macOS or `where node` on Windows and then `node --version` to confirm it works. The resolved path is cached in the config as `nodePath` and reused to spawn the backend server and the asset generator.

#### macOS install options

- **Installer (.pkg)** — download the LTS build from <https://nodejs.org> and run it.
- **Homebrew** — `brew install node`.
- **nvm** — `curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.7/install.sh | bash`, then `nvm install --lts && nvm use --lts`. If you use nvm, make sure a version is active in the shell you launch from.

#### Windows install options

- **Installer (.msi)** — download the LTS build from <https://nodejs.org>. When asked, accept the "Tools for Native Modules" option.
- **winget** — `winget install OpenJS.NodeJS.LTS`.
- **Chocolatey** — `choco install nodejs-lts`.

Verify either platform with:

```bash
node --version
npm --version
```

### Game assets (required at runtime)

The Launcher itself does not ship game assets. The actual Creatures 3 data files — sprites, sounds, backgrounds, genetics, bootstrap CAOS, etc. — must already be present under `Rebuild/Assets/`. The Launcher's **Assets** section lets you point at that directory and regenerate the index files the browser needs to find those assets (see [Why asset index files are necessary](#why-asset-index-files-are-necessary)).

## Installation

Open a terminal (Terminal on macOS, Command Prompt or PowerShell on Windows), then install the Launcher's npm dependencies from inside its folder:

**macOS**
```bash
cd /path/to/Rebuild/Launcher
npm install
```

**Windows**
```cmd
cd C:\path\to\Rebuild\Launcher
npm install
```

This pulls two packages declared in `package.json`:

- **`electron`** (dev dependency) — the desktop framework. It bundles its own Chromium renderer and Node.js runtime and is roughly a 200 MB download the first time.
- **`electron-store`** — a tiny library that persists the Launcher's settings to a JSON file with atomic writes, so a crash mid-save can't corrupt the config.

All transitive dependencies end up under `Rebuild/Launcher/node_modules/`, which is gitignored.

## Running the Launcher

From the same `Rebuild/Launcher` directory:

```bash
npm start
```

`npm start` runs `electron .` under the hood — the dot tells Electron to load the app from the current working directory using `main.js` as the entry point. An equivalent but longer form is `npx electron .`. Do **not** run `npx electron` without the trailing dot; Electron then has no app to load and opens an empty default window.

On the very first launch the Launcher will:

1. Create `creatures3-launcher-config.json` in the Launcher directory with defaults.
2. Detect the system Node.js and display its version.
3. Check whether `Rebuild/node_modules/` contains `express`, `cors`, and `pako`, and expose an `npm install` button if any are missing.
4. Default the assets directory to `Rebuild/Assets/` and show whether `asset-index.json` / `asset-index-detailed.json` exist inside it.

Every check and every spawned command logs into the **Logs** tab.

## The UI

The main window has two tabs: **Setup** (where you configure and act) and **Logs** (where all child-process output is streamed).

### Setup — Prerequisites

- **Node.js** — green dot + version if found, red dot + "Download Node.js" link if not. The resolved binary is cached as `nodePath` and is what gets used to spawn the backend and the asset generator.
- **Dependencies** — green dot when all three backend packages (`express`, `cors`, `pako`) are installed under `Rebuild/node_modules/`. Red dot otherwise, with a list of the missing packages. The **npm install** button runs `npm install` inside `Rebuild/` and streams its output to the log.

### Setup — Assets

- **Directory** — the assets folder. Defaults to `Rebuild/Assets/`. The **Browse…** button opens the native OS directory picker. The selected path is persisted as `assetsDirectory`.
- **Index status** — two dots, one for each index file. Green if the file exists in the selected directory, red otherwise. They refresh after you change the directory or regenerate the index.
- **Refresh Asset Index** — runs `npm run generate-assets` from `Rebuild/`, which executes `node scripts/generate-asset-index.js` and produces the two JSON files. Note: the generator always writes to `Rebuild/Assets/` regardless of which directory is selected in the Launcher — the selection controls where the Launcher *checks* for the index files.

### Setup — Server

- **Port** — number input, default `8000`, range `1`–`65535`. Auto-saved (debounced ~500 ms) as `port`. If the server is already running when you change the port, a "Restart server to apply" note appears.
- **Status** — red (stopped), yellow (starting/stopping), green (running). Green is set only after the Launcher polls `GET http://localhost:{port}/api/health` successfully (polls every second, 30 s timeout).
- **Local URL / External URL** — clickable `http://localhost:{port}` and LAN-address equivalents, populated once the server is up.
- **Start Server** — spawns `node backend/server.js` in `Rebuild/` with the configured `PORT` environment variable. Output (including the health-check polling result) is streamed to the log.
- **Stop Server** — graceful kill first (`SIGTERM` on macOS, `taskkill /PID /T` on Windows). If the process hasn't exited after 5 seconds, it's force-killed (`SIGKILL` / `taskkill /PID /T /F`). The `/T` flag ensures child processes are terminated too on Windows.
- **Crash detection** — if the server process exits while the Launcher believes it's running, the dot flips back to red with a "Crashed" status and the exit code is logged.
- **Cleanup** — closing the Launcher window always kills the server process if one is running.

### Setup — Game Launch

- **Open Creatures 3 in Browser** — opens `http://localhost:{port}/Main_Game/Test/test-map-background-bootstrap.html` in the system default browser via `shell.openExternal`. Only enabled while the server status is green.

### Logs tab

Scrollable dark-themed log with four filter tabs: **All**, **Server**, **Commands**, **Launcher**. Receives streamed output from:

- `npm install` (channel `npm-output`)
- the backend server process (channel `server-log`)
- the asset index generator (channel `asset-gen-output`)
- server lifecycle events (channel `server-state-changed`)

A **Clear** button empties the log.

## Configuration options

User settings live in `Rebuild/Launcher/creatures3-launcher-config.json`, created automatically on first run and managed by `electron-store` with atomic writes. The file is gitignored. Every change made through the UI is saved immediately; the Launcher rehydrates from it on the next start.

| Key | Type | Default | Role |
|---|---|---|---|
| `assetsDirectory` | string (absolute path) | `Rebuild/Assets/` resolved to an absolute path | Directory the Launcher checks for `asset-index.json` / `asset-index-detailed.json`. Only used for the Assets section's status dots; the index generator itself still writes into `Rebuild/Assets/`. |
| `port` | number (1–65535) | `8000` | TCP port passed as `PORT` env var to `node backend/server.js` when the server is started, and used to build the Local/External URLs and the game-launch URL. |
| `nodePath` | string (absolute path) or `null` | `null` until detection succeeds | Cached path to the system Node.js binary. Used to spawn `node backend/server.js` and the asset index generator so the Launcher doesn't have to re-resolve it every time. |

A minimal generated file looks like:

```json
{
    "assetsDirectory": "/Users/alice/c3/Rebuild/Assets",
    "port": 8000,
    "nodePath": "/usr/local/bin/node"
}
```

You can edit the JSON by hand while the Launcher is closed, but the UI is the intended way — it keeps the file in sync with the running state (disabled buttons, dot colours, etc.).

## Why asset index files are necessary

The browser cannot list the contents of a directory. When the game starts in the browser, it has no way to ask "give me every file under `Assets/Backgrounds/`". It can only fetch a specific URL. This is a fundamental limitation of the web platform: `fetch()` retrieves a known resource; there is no filesystem API that enumerates a folder served over HTTP.

The rebuild solves this by pre-scanning `Rebuild/Assets/` at build/setup time and writing the result to two JSON files the browser can fetch like any other resource:

- **`Rebuild/Assets/asset-index.json`** — the compact index. Contains a directory tree with filenames, sizes, and the explicit Bootstrap loading order (the ordered list of `.cos` directories the engine replays on startup). This is what most runtime systems read.
- **`Rebuild/Assets/asset-index-detailed.json`** — the same data plus a `fileDetails` map with per-file metadata (absolute and relative paths, extension, modification time, etc.). Used by tools that need to inspect or enumerate specific files.

Multiple engine modules rely on these files — notably `BootstrapManager.js`, `CatalogueManager.js`, and the shared `AssetPathResolver` helper. Without them, the engine simply cannot discover the bootstrap CAOS scripts, the catalogue files, or anything else shipped under `Assets/`, and the game will fail to boot.

### How to generate them

Two equivalent paths:

**Through the Launcher (recommended).** In the Setup tab's **Assets** section, click **Refresh Asset Index**. The Launcher spawns `npm run generate-assets` in `Rebuild/`, streams its output to the log, and refreshes the two status dots when the script exits. Use this whenever you add, remove, or rename files inside `Rebuild/Assets/`.

**From a terminal.** Equivalent to the button above:

```bash
cd /path/to/Rebuild
npm run generate-assets
```

This runs `node scripts/generate-asset-index.js`, which walks `Rebuild/Assets/`, builds the bootstrap loading order, and writes both `asset-index.json` and `asset-index-detailed.json` next to the assets they describe. A summary of directories scanned, files found, and total bytes is printed at the end.

You must regenerate these files any time the contents of `Rebuild/Assets/` change. Stale index files mean the browser still requests paths that no longer exist, or — worse — misses new files entirely.

## Troubleshooting

**Launcher won't start.** Ensure you ran `npm install` in `Rebuild/Launcher/` first. Use `npm start` or `npx electron .` (note the trailing dot) — without the dot, Electron opens an empty default window.

**Node.js shows as "Not found".** The Launcher probes the system Node, not Electron's internal one. Run `node --version` in a terminal to confirm the binary is on your PATH. For nvm users, make sure a version is active in the shell you launch from.

**npm install fails.** Read the log tab — the real error is in the streamed output. On macOS a common fix is `sudo chown -R $(id -u):$(id -g) ~/.npm` for permission issues. Network access is required for the initial install.

**Asset index generation fails.** Verify `Rebuild/Assets/` exists and contains the game assets. The error will appear in the log; note that `scripts/generate-asset-index.js` uses CommonJS `require`, which interacts with the project's `"type": "module"` setting — the script is invoked through `npm run generate-assets` which sets up the correct context.

**Server won't start (port in use).** Either change the port in the UI or free the port:
- macOS: `lsof -i :8000` then `kill <PID>`
- Windows: `netstat -ano | findstr :8000` then `taskkill /PID <PID> /F`

**Server dot stuck on yellow.** The Launcher polls `GET /api/health`. If it never turns green, the server is failing to finish startup — check the log for the actual error. A firewall blocking localhost connections on Windows is a common cause.

**Crashed status appears unexpectedly.** The backend exited without the Launcher asking it to. The exit code is in the log; re-run and read the streamed server output for the underlying cause.
