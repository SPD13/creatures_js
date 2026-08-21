# zz mesa light and heat.cos — Switch On Mesa Light & Heat

**Source file:** `Assets/Docking Station/Bootstrap/010 Docking Station/zz mesa light and heat.cos`

## Overview

This script **creates no agents** — it is a one-shot bootstrap activation that **turns on the Mesa's lights and heaters** once they exist. It enumerates the light agents (`1 1 150`) and tells each to light up at full brightness, and the heater agents (`1 1 151`) and tells each to warm up to ~0.95. The lights and heaters themselves are created by [!meso environment](!meso%20environment.md); this script (named with a `zz` prefix so it runs late in the bootstrap order) simply switches them on so the Mesa starts out lit and warm.

## Actions

| Target | Classifier | Message | Effect |
|---|---|---|---|
| Mesa Lights | 1 1 150 | 1000 (level 1) | Light up to full brightness |
| Mesa Heaters | 1 1 151 | 1000 (level 0.95) | Heat up to ~0.95 |

## Impact on Stimulus / Room CA

No stimuli are emitted and this script writes no Room CA directly. Its effect is **indirect**: by activating the Mesa light (`1 1 150`) and heater (`1 1 151`) agents, it causes them to emit their **light (CA 1)** and **heat (CA 2)** into the Mesa rooms — so the environment starts out illuminated and warm. The actual CA emission is performed by those environment agents (see [!meso environment](!meso%20environment.md)).
