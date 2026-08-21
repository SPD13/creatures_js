# Disable Debug Keys

## Overview

This bootstrap script disables the engine's built-in debug keyboard shortcuts by setting the game variable `engine_debug_keys` to `0`. It is part of the world initialization sequence (`001 World`) and ensures that debug functionality is not accessible during normal gameplay.

When `engine_debug_keys` is set to `0`, the engine suppresses any special key combinations that would otherwise trigger debug overlays, diagnostic tools, or developer-only features. This is a standard safety measure for production/release builds of the game.

## Script Details

- **File**: `Bootstrap/001 World/disable debug keys.cos`
- **Bootstrap Folder**: `001 World` (early world initialization)
- **Type**: Game configuration (no agents created)

## Mechanism

The script consists of a single CAOS instruction:

```
setv game "engine_debug_keys" 0
```

- **`game "engine_debug_keys"`**: A named game engine variable that controls whether debug key bindings are active.
- **Value `0`**: Disables debug keys. Setting this to `1` would re-enable them.

## Impact

- **No agents are created or modified** by this script.
- **No Room CA or stimulus effects.**
- The game variable is checked by the engine's input handling system to determine whether debug key events should be processed.
