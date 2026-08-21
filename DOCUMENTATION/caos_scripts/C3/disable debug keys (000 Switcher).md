# Disable Debug Keys (000 Switcher)

**Source file:** `Assets/Bootstrap/000 Switcher/disable debug keys.cos`

## Overview

This bootstrap script disables the engine's built-in debug keyboard shortcuts for the special **Startup** world (the one that hosts the [World Switcher](world%20switcher.md) UI on launch). It does so by setting the GAME variable `engine_debug_keys` to `0`.

The full body of the script is a single line:

```
setv game "engine_debug_keys" 0
```

When `engine_debug_keys` is `0`, the engine suppresses every key combination that would otherwise trigger debug overlays, diagnostic tools, or developer-only features. This is a release-build safety measure: even though the player is technically just on the launcher screen, the engine is fully running and any debug shortcut would still fire without this guard.

This file is byte-identical to `Assets/Bootstrap/001 World/disable debug keys.cos`. Both Startup and gameplay worlds receive the same protection — the duplicate exists because GAME variables are scoped to a world, so each new world (including the Startup world) has to reassert the value during its own bootstrap.

The script does not create or modify any agents, does not touch the map, and has no effect on stimuli or Room CA. There is no `Created Agents` section because no agents are created.

## Impact on Stimulus / Room CA

None. The script only writes to a single GAME variable.
