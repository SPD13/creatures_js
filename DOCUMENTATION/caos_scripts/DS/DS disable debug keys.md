# DS disable debug keys

**Source file:** `Assets/Docking Station/Bootstrap/000 Switcher/DS disable debug keys.cos`

## Overview

This bootstrap script disables the engine's built-in debug keyboard shortcuts for Docking Station's **splash / switcher** world (the one shown on launch). It does so by setting the GAME variable `engine_debug_keys` to `0`.

The full body of the script is a single line:

```
setv game "engine_debug_keys" 0
```

When `engine_debug_keys` is `0`, the engine suppresses every key combination that would otherwise trigger debug overlays, diagnostic tools, or developer-only features. This is a release-build safety measure: even though the player is only on the launcher/splash screen, the engine is fully running and any debug shortcut would still fire without this guard.

Because GAME variables are scoped per world, each new world has to reassert this value during its own bootstrap — so the same guard is repeated in the gameplay-world bootstrap as well.

The script does not create or modify any agents, does not touch the map, and has no effect on stimuli or Room CA. There is no `Created Agents` section because no agents are created.

## Impact on Stimulus / Room CA

None. The script only writes to a single GAME variable.
