# Ocean Pod

This bootstrap script installs a single static scenery SIMP agent representing an "ocean pod" object placed in the ocean/marine area of the world. The agent has no event scripts and acts purely as a visual/decorative element in the environment. It is created once at a fixed world location with a high plane value, placing it in front of most background scenery.

The removal script (`rscr`) enumerates all instances of the classifier and kills them.

## Created Agents

| Classifier | Script / Agent | Description | Details |
|------------|----------------|-------------|---------|
| 1 1 97 | ocean_pod | Static decorative ocean pod scenery agent | [Ocean Pod](#ocean-pod-1-1-97) |

## Ocean Pod (1 1 97)

A single SIMP agent created from the `ocean_pod` sprite gallery (1 image, first image 0) on plane `8100`. The agent is positioned at world coordinates `(4140, 1635)` via `mvto` and has no event scripts attached — it behaves as pure static scenery with no interactive or timed behaviour.

### Events

This agent defines no event scripts. No stimulus or Room CA impact.
