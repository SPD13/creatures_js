# DS pointer activate stimming norns.cos — Click-to-Attract Attention

**Source file:** `Assets/Docking Station/Bootstrap/010 Docking Station/DS pointer activate stimming norns.cos`

## Overview

This script creates an invisible **pointer stimmer** agent (`1 1 123`) that makes whatever the player clicks on broadcast a "look at me" attention urge to nearby creatures — a way for the player to direct creatures' attention by clicking objects. It is the Docking Station counterpart of the Creatures 3 [pointer activate stimming norns](../C3/pointer%20activate%20stimming%20norns.md).

At install it creates `1 1 123` (`blnk` sprite, `imsk 8` = raw mouse down, `attr 16` invisible).

## Created Agents

| Classifier | Name | Sprite | Description |
|---|---|---|---|
| 1 1 123 | Pointer Stimmer | `blnk` | Invisible listener that urges nearby creatures to attend to a clicked agent |

## Agent 1 1 123: Pointer Stimmer

### Events

| Event | Number | Description |
|---|---|---|
| Raw Mouse Down | 76 | Make the clicked agent attract nearby creatures' attention |

#### Event 76 — Raw Mouse Down

Reads the agent under the pointer (`hots`); if non-null, it applies `urge shou 0.5 -1 -1.0` to that agent, raising the urge for nearby creatures to pay attention to it (a "look at me" broadcast). The negative verb values mean no specific action is urged — only attention.

### Removal Script

```
rscr
scrx 1 1 123 76
rtar 1 1 123
kill targ
```

Removes the mouse-down script and kills the pointer stimmer.

## Impact on Stimulus / Room CA

It influences **creature attention** (via `urge`) on the clicked agent — drawing nearby creatures to look at it — but emits no room stimuli and does not affect Room CA.
