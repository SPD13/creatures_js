# Death Animation

This script defines the **death visual effect behavior** for the death animation agent (classifier `1 1 56`). It does not create any new agents; instead, it provides the event handler that plays the death animation sequence when a creature dies. The agent itself is created in the `creatureInvoluntary.cos` script (as either a "death_cloud" or "death_sludge" sprite depending on species), and the death sequence sends **message 100** to trigger this script.

The script handles two distinct animation paths based on creature genus: one for **Norns and Ettins** (non-Grendel) with a cloud effect, and one for **Grendels** with a sludge effect. In both cases, the animation agent moves to the dead creature's location, plays a two-phase animation (approach/envelop, then dissipation), removes the dead creature's body, and finally destroys itself.

This script does not create agents. It adds behavior to the existing death visual effect agent `1 1 56`.

---

## Agent Behavior

### Death Visual Effect Agent — `1 1 56`

This agent is a simple sprite agent created by the creature death handler (event 72 in `creatureInvoluntary.cos`). Depending on the dying creature's genus, it uses either the `death_cloud` sprite (25 frames) or the `death_sludge` sprite (24 frames).

#### Events

| Event | Script | Description |
|---|---|---|
| 100 | `scrp 1 1 56 100` | Custom message — play death animation and clean up the dead creature |

---

### Event 100 — Death Animation Sequence

**Trigger**: Sent via `mesg wrt+ targ 100 ownr 0 0` from the creature's death involuntary script (event 72 for creature `4 0 0`). The dying creature is passed as `_p1_`.

**Behavior**: The script locks execution to prevent interruption, then branches based on the dead creature's genus.

#### Non-Grendel Path (Norns and Ettins — `gnus ne 2`)

1. **Positioning**: The death cloud agent moves to a position 100 pixels left of and slightly above the dead creature's feet (`posx - 100`, `posb - hght + 25`).
2. **Phase 1 — Enveloping**: Plays sound `"dcld"` (death cloud) and runs a slow animation through frames 0–8 (each frame repeated 3 times for a deliberate pace). Waits for the animation to complete (`over`).
3. **Creature removal**: Instantly (`inst`) checks that the dead creature reference (`_p1_`) is still valid, then destroys it with `kill _p1_`.
4. **Phase 2 — Dissipation**: Plays frames 9–24 (each frame repeated twice) showing the cloud fading away. Waits for completion.
5. **Self-destruction**: The death cloud agent destroys itself with `kill ownr`.

#### Grendel Path (`gnus eq 2`)

1. **Positioning**: Same positioning logic as the non-Grendel path (100 pixels left, near feet).
2. **Phase 1 — Enveloping**: Plays sound `"dslg"` (death sludge) and runs a different animation through frames 0–16 (each frame repeated twice). Waits for completion.
3. **Creature removal**: Same instant check and `kill _p1_` as the non-Grendel path.
4. **Phase 2 — Dissipation**: Plays frames 17–23 (each frame repeated 2–3 times). Waits for completion.
5. **Self-destruction**: The sludge agent destroys itself with `kill ownr`.

#### Summary

| Property | Non-Grendel (Cloud) | Grendel (Sludge) |
|---|---|---|
| Sprite | `death_cloud` (25 frames) | `death_sludge` (24 frames) |
| Sound | `"dcld"` | `"dslg"` |
| Phase 1 frames | 0–8 (3× each) | 0–16 (2× each) |
| Phase 2 frames | 9–24 (2× each) | 17–23 (2–3× each) |
| Effect | Cloud envelops then fades | Sludge pool forms then dissolves |

#### Impact

- **Creature removal**: The dead creature agent is destroyed (`kill _p1_`) between the two animation phases, giving the visual impression that the death effect consumes the body.
- **Self-cleanup**: The death effect agent removes itself after the animation completes, leaving no residual agents in the world.
- **No stimulus or CA impact**: This script purely handles the visual effect and cleanup; all biochemical death processing occurs in the creature's own death involuntary script (event 72).
