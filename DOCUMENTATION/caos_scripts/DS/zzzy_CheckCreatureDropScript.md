# zzzy_CheckCreatureDropScript.cos — Creature Drop-Script Guard

**Source file:** `Assets/Docking Station/Bootstrap/010 Docking Station/zzzy_CheckCreatureDropScript.cos`

## Overview

This script **creates no agents** and changes no state — it is a tiny bootstrap-ordering **guard**. Named with a `zzzy` prefix so it runs near the very end of the bootstrap, it enumerates all creatures (`4 0 0`) and **stops early if any creature is currently running its drop script** (`code eq 5`). Its purpose is to make sure the bootstrap doesn't proceed while a creature is mid-drop, avoiding a race during world start-up.

## Behaviour

```
enum 4 0 0
    doif code eq 5
        stop
    endi
next
```

For each creature, if it is executing event 5 (the Drop script), the bootstrap script halts; otherwise the loop completes harmlessly. It neither creates, modifies, nor moves anything.

## Impact on Stimulus / Room CA

None. This is a bootstrap-timing check over the creature population. It emits no creature stimuli, writes no Room CA, and creates no agents.
