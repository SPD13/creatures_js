# Ocean Surface

This bootstrap script installs a pair of simple animated "surface" agents that represent the visible ocean surface (wave ripples) within the ocean/marine area of the world. Each surface agent runs a continuous ripple animation and periodically plays one of three wave/splash sound effects, providing ambient audiovisual atmosphere for the sea environment. The animation frame rate is adapted to the current machine pace (`pace`) so slower systems run the effect less frequently.

The removal script (`rscr`) enumerates all instances of the classifier and kills them, then removes the timer script from the script repository.

## Created Agents

| Classifier | Script / Agent | Description | Details |
|------------|----------------|-------------|---------|
| 1 1 25 | surface | Animated ocean-surface ripple agent with ambient wave sounds | [Surface](#surface-1-1-25) |

## Surface (1 1 25)

Two instances of this SIMP agent are created, both using the `surface` sprite gallery with 25 images on plane 25. The first instance is placed at `(5160, 2171)` and the second at `(5100, 2180)` (offset by base image 25 so the second uses the second half of the gallery — plane `8100`). Both loop through frames 0-24 continuously (`[0..24 255]`).

The frame rate is pace-adaptive:
- If `pace < 1` (faster machines), the first uses a random rate 3-4; the second uses a fixed rate of 4.
- Otherwise (slower machines), both use a random rate of 2-3.

Both instances also start a 300-tick timer which triggers the Timer event to play ambient sea sounds.

### Events

| Event | Number | Description |
|-------|--------|-------------|
| Timer | 9 | Plays a random wave sound and reschedules itself |

**Timer (9)** — Randomly selects one of three wave sound effects (`wav1`, `wav2`, or `wav3`) with equal probability and plays it on the agent via `snde`. The timer then reschedules itself for a random interval between 100 and 700 ticks, producing irregular ambient sea-wash sounds. No stimulus or Room CA impact.
