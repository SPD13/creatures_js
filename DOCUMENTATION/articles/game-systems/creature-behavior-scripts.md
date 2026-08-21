# Creature Behavior Scripts

Every meaningful creature action in Creatures 3 — approaching food, picking up a toy, hitting a Grendel, falling asleep, or laying an egg — is ultimately executed by a **CAOS script**. The creature's brain selects *what* to do; the CAOS scripts define *how* to do it. This article documents the complete set of creature behavior scripts, their triggering conditions, and their effects on the creature.

## How Scripts Are Triggered

Creature behavior scripts are divided into three categories based on **who initiates** the action:

| Category | Source | Event Range | COS File |
|----------|--------|-------------|----------|
| **Voluntary decisions** | Brain decision lobe via MotorFaculty | 16-29 | `creatureDecisions.cos` |
| **Creature-to-creature** | Brain decision lobe (IT is a creature) | 32-47 | `creatureToCreature.cos` |
| **Involuntary reflexes** | Biochemistry via MotorFaculty loci | 64-72 | `creatureInvoluntary.cos` |
| **Done-to reactions** | External agents (pointer, other creatures) | 0-7 | `creatureDoneTo.cos` |
| **Breeding** | Mating decision / pregnancy | 33-34, 65, 200 | `creatureBreeding.cos` |

All scripts are registered against classifier `4 0 0` (family 4 = creature, genus 0 = any, species 0 = any), which means they apply to Norns, Grendels, and Ettins alike. Some involuntary scripts have genus-specific variants (e.g., `4 2 0 64` for Grendels).

### The Motor Faculty Pipeline

For voluntary and creature-to-creature actions, the path from brain to script is:

```
Brain decision lobe → winning neuron ID
    → getScriptOffsetFromNeuronId() → action offset (0-13)
        → MotorFaculty.processBrainDecision()
            → scriptEvent = offset + 16 (objects) or offset + 32 (creatures)
                → creature.executeScriptForEvent(scriptEvent)
```

The Motor Faculty re-triggers the same script each time it completes, keeping the creature in the action as long as the brain sustains the decision. The `wait` commands inside each script control how long one cycle lasts before the Motor Faculty gets a chance to decide again.

## Voluntary Decision Scripts (Events 16-29)

These scripts fire when the brain's decision lobe selects an action and the IT object is a regular agent (not another creature).

### Event 16 — Quiescent / Rest (No IT Object)

**Action offset**: 0 | **Introspective**: Yes (no IT required)

The default idle behavior when the creature has nothing particular to do.

```caos
scrp 4 0 0 16
    setv va00 rand 0 1
    doif va00 eq 0
        pose 57                     * lying down
        setv va00 rand 20 40
        wait va00                   * idle for 1-2 seconds
    else
        pose 59                     * sitting/fidgeting
        setv va00 rand 1 10
        wait va00
        pose 60
        setv va00 rand 1 10
        wait va00
    endi
    stim writ targ 12 1             * self-stimulus: "quiescent"
endm
```

**Effect on creature**: Randomly alternates between lying down (20-40 ticks) and a fidgeting animation (shorter bursts). Applies stimulus 12 ("quiescent") to provide biochemical feedback — this slightly reduces boredom. The `wait` commands block the VM for 20-40 ticks (1-2 seconds), preventing the Motor Faculty from restarting the action too frequently.

### Event 17 — Activate 1 (Push)

**Action offset**: 1 | **Requires IT**: Yes

The creature approaches and interacts with an object's primary action.

```caos
scrp 4 0 0 17
    appr                            * walk towards IT
    inst
    doif _it_ eq null               * IT vanished during approach?
        wait 10
        stop
    endi
    touc                            * confirm physical contact
    ...
    doif va00 eq 1 and byit ne 0    * object supports activate1 AND near it
        mesg writ _it_ 0            * send Deactivate message to object
        stim writ targ 13 va99      * stimulus: "I activated something"
        pose 12
        wait 20
    else
        stim writ targ 0 1          * stimulus: "disappointed" (can't use)
        wait 20
    endi
endm
```

**Effect on creature**: The creature walks to the IT object, touches it, checks whether the object supports `Activate1` (via `bhvr` flags), then sends a message to the object. If successful, a positive stimulus is applied. If the object doesn't support the action or the creature can't reach it, a "disappointed" stimulus (0) is applied — causing mild frustration.

**Key pattern**: `appr` → `touc` → check `bhvr` → `mesg writ _it_` → `stim writ`. This approach-touch-interact-feedback pattern is shared by Events 17, 18, 19, 22, 28, and 29.

### Event 18 — Activate 2 (Pull)

**Action offset**: 2 | **Requires IT**: Yes

Identical pattern to Event 17, but checks bit 2 of `bhvr` and sends message 1 to the IT object. Applies stimulus 14 on success.

### Event 19 — Deactivate (Hit)

**Action offset**: 3 | **Requires IT**: Yes

Same approach-touch-interact pattern. Checks bit 4 of `bhvr`, sends message 2 to IT. Applies stimulus 15 on success. This is the "hit" or "deactivate" action.

### Event 20 — Approach

**Action offset**: 4 | **Requires IT**: Yes

```caos
scrp 4 0 0 20
    appr                            * walk towards IT
    doif byit eq 0                  * didn't reach IT?
        stim writ targ 0 1          * disappointed
    endi
    wait 10
endm
```

**Effect on creature**: Simply walks toward the IT object. A short script — the creature approaches and waits 10 ticks. If `byit` (near IT) is 0, meaning the creature couldn't reach the target, a disappointment stimulus fires.

### Event 21 — Retreat / Express Self

**Action offset**: 5 | **Introspective**: Yes

A complex multi-branch script where the creature expresses its strongest need:

```caos
scrp 4 0 0 21
    * Check what the creature needs most:
    doif driv 10 gt 0.25            * lonely?
        * Branch 1: Express loneliness animation
        anim [053 054 055 056 255]
        wait 80
    elif driv 0 gt 0.5              * hungry?
        * Branch 2: Express hunger animation
        anim [052 051 050 049 255]
        wait 40
    elif driv 9 gt 0.25             * bored?
        * Branch 3: Express boredom animation
        anim [049 050 051 052 255]
        wait 40
    endi
    stim writ targ 17 1             * stimulus: "expressed need"
    done
    stop
endm
```

**Effect on creature**: Checks drives in priority order (loneliness > hunger > boredom) and plays a corresponding animation. The `wait` duration varies by emotion — loneliness gets the longest display (80 ticks = 4 seconds). Applies stimulus 17 to provide feedback. Uses `done` to signal involuntary action completion.

### Event 22 — Get / Pick Up

**Action offset**: 6 | **Requires IT**: Yes

```caos
scrp 4 0 0 22
    appr
    * Drop currently held object first
    doif held ne null
        doif held eq _it_           * already holding IT?
            stim writ targ 0 1      * disappointed
            wait 10
            stop
        endi
        mesg writ held 5            * drop current object
    endi
    * Check object is pickupable (bhvr bit 32)
    touc
    doif byit ne 0
        mesg writ _it_ 4            * send Pickup message
        wait 4
        pose 73                      * reaching down pose
        loop
            wait 20                  * hold indefinitely
        ever
    else
        stim writ targ 0 1
        wait 20
    endi
endm
```

**Effect on creature**: Drops any currently held object, approaches the IT, touches it, and sends a Pickup message. Then enters an **infinite `loop/ever`** — the creature keeps holding the object until the Motor Faculty interrupts with a new action. This is intentional: "holding" is a sustained state, not a momentary action.

### Event 23 — Drop

**Action offset**: 7 | **Introspective**: Yes

```caos
scrp 4 0 0 23
    pose 0
    inst
    doif held eq null               * nothing to drop?
        stim writ targ 0 1
        wait 10
        stop
    endi
    mesg writ held 5                * send Drop message
    stim writ targ 19 va99          * stimulus: "dropped object"
    wait 20
    pose 12
    wait 20
endm
```

**Effect on creature**: Drops whatever the creature is holding by sending message 5 (Drop) to the held agent. If not holding anything, applies a disappointment stimulus. The `wait 20` blocks provide natural pacing — the drop action takes about 2 seconds total.

### Event 24 — Express Need / Say

**Action offset**: 8 | **Introspective**: Yes

A long expressive script where the creature vocalises its strongest need:

```caos
scrp 4 0 0 24
    * Find strongest drive
    setv va01 0
    setv va02 -100
    loop
        doif driv va01 gt va02
            setv va00 va01          * va00 = strongest drive index
            setv va02 driv va00
        endi
        addv va01 1
    untl va01 gt 12

    * Set pose based on which drive is strongest
    doif va00 eq 0      pose 35     * hunger → reach for food
    doif va00 eq 1      pose 89     * fear → scared pose
    doif va00 eq 2      pose 47     * pain → hurt pose
    ...
    sayn                             * speak the need aloud
    stim writ targ 20 1             * stimulus: "expressed myself"
    wait 50                          * 2.5 second display
endm
```

**Effect on creature**: Surveys all 13 drives, finds the strongest, sets a corresponding pose, and calls `sayn` to vocalise the need through the Linguistic Faculty. The 50-tick wait gives time for the speech bubble to display. Before checking drives, the script also examines smell chemicals (82-89) — if a strong smell is present, it may override the drive expression.

### Event 25 — Rest / Sleep

**Action offset**: 9 | **Introspective**: Yes

This is the **voluntary** sleep action (as opposed to involuntary sleep at Event 69). See the [Creature Sleep](creature-sleep.md) article for full details.

```caos
scrp 4 0 0 25
    doif driv 7 gt 0.6              * very sleepy?
        lock                         * full sleep sequence
        aslp 1                       * enter asleep state
        * ... dream loop with DREA 1 ...
        untl driv 7 lt 0.10 and driv 6 lt 0.10
        aslp 0                       * wake up
        unlk
    else
        * Light rest — just lie down briefly
        loop
            pose 58
            wait 20
            stim writ targ 21 1      * stimulus: "resting"
            wait 20
        untl driv 6 lt 0.10          * until tiredness drops
    endi
endm
```

**Effect on creature**: If sleepiness (drive 7) exceeds 0.6, triggers a full sleep cycle with instinct processing. Otherwise, performs light resting that reduces tiredness. The `lock` command prevents other scripts from interrupting the sleep cycle.

### Events 26-27 — Travel West / Travel East

**Action offset**: 10 (west), 11 (east) | **Introspective**: Yes

```caos
scrp 4 0 0 26
    pose 59
    dirn 3                          * face west
    walk                            * start walking
    wait 30
    loop
        wait 20
        stim writ targ 23 1         * stimulus: "travelling"
    ever                            * walk forever until interrupted
endm
```

**Effect on creature**: Sets direction and starts walking in an **infinite loop**. The creature keeps walking until the Motor Faculty interrupts with a different decision. Every 20 ticks, a "travelling" stimulus provides biochemical feedback that can reduce boredom or navigation drives. This script is inherently long-running — it relies on external interruption to stop.

### Event 28 — Eat

**Action offset**: 12 | **Requires IT**: Yes

```caos
scrp 4 0 0 28
    appr
    touc
    * Check object is edible (bhvr bit 16)
    doif byit ne 0
        * Drop held object, pick up food, send eat message
        mesg writ _it_ 4            * pick up
        wait 1
        pose 73                      * reaching down
        mesg writ _it_ 12           * send Eat message
        stim writ targ 26 va99      * stimulus: "I ate something"
        wait 30
        pose 74                      * chewing pose
        wait 10
        pose 12                      * return to normal
        wait 20
    else
        stim writ targ 0 1          * disappointed — can't eat it
        wait 30
    endi
endm
```

**Effect on creature**: The most complex interaction script. The creature approaches food, picks it up, eats it (sending message 12 to the object, which typically triggers the object's self-destruct and nutrient delivery), then plays a chewing animation. The eating takes ~60 ticks (3 seconds) total between pickup, chew, and swallow phases. The food object's own script handles the actual biochemical effects (injecting starch, fat, protein chemicals).

### Event 29 — Hit

**Action offset**: 13 | **Requires IT**: Yes

```caos
scrp 4 0 0 29
    appr
    touc
    doif bhvr-bit-8 and byit ne 0   * object is hittable?
        anim [111 112 113 114 111]   * slapping animation
        mesg writ _it_ 3            * send Hit message
        stim writ targ 44 va99      * stimulus: "I hit something"
        wait 4
        pose 12
        wait 20
    else
        stim writ targ 0 1          * disappointed
        wait 20
    endi
endm
```

**Effect on creature**: Approaches the target and plays a slapping animation. The Hit message (3) is sent to the object, which may trigger the object's hit response script.

## Creature-to-Creature Scripts (Events 32-47)

When the brain's IT object is another creature, the Motor Faculty adds 32 instead of 16 to the action offset, producing events in the 32-47 range. Only two creature-to-creature scripts exist.

### Event 32 — Idle Near Creature

**Action offset**: 0 (quiescent, but IT is a creature)

```caos
scrp 4 0 0 32
    loop
        doif rand 0 1 eq 0
            pose 57
            wait rand 20 40
        else
            pose 59
            wait rand 1 10
            pose 60
            wait rand 1 10
        endi
        stim writ targ 12 1         * stimulus: "quiescent"
    ever                            * infinite loop
endm
```

**Effect on creature**: Like Event 16 but in an **infinite loop** — the creature idles near the other creature indefinitely, alternating between resting poses. The loop only ends when the Motor Faculty interrupts with a new brain decision.

### Event 45 — Hit Creature (Slap)

**Action offset**: 13 (hit, but IT is a creature)

A complex script that approaches the target creature, wakes it if sleeping, plays a slapping animation, and calculates damage based on the attacker's age:

```caos
scrp 4 0 0 45
    appr
    touc
    * Wake target if sleeping
    targ _it_
    doif drea eq 1
        drea 0
    else
        aslp 0
    endi
    nohh                            * release hand-holding
    targ ownr
    anim [111 112 113 114 111]      * slapping animation
    stim writ ownr 44 1             * stimulus: "I hit a creature"
    mesg writ _it_ 3               * send Hit to target

    * Age-based damage scaling
    doif cage eq 0      setv va00 0         * baby — no damage
    elif cage eq 1      setv va00 0.25      * child
    elif cage eq 2      setv va00 0.5       * adolescent
    elif cage eq 3      setv va00 0.75      * youth
    elif cage eq 4      setv va00 1.0       * adult — full damage
    elif cage eq 5      setv va00 0.5       * old
    elif cage eq 6      setv va00 0.0       * senile — no damage
    endi

    * Same-genus penalty (hitting own kind hurts more)
    doif attacker-genus eq target-genus
        mulv va00 0.25              * reduced to 25%
    endi

    doif va00 ne 0.0
        stim writ _it_ 4 va00      * pain stimulus scaled by damage
    endi
endm
```

**Effect on creatures**: The attacker slaps the target, waking it if necessary. Damage is scaled by the attacker's age — babies and senile creatures do no damage, adults deal full pain. Hitting a creature of the same genus (Norn-on-Norn violence) is penalised to 25% damage. Both attacker and target receive appropriate stimuli for reinforcement learning.

## Involuntary Action Scripts (Events 64-72)

Involuntary actions are triggered by the Motor Faculty's reflex system. Each involuntary locus (0-7) is bound to a biochemistry receptor. When the chemical signal exceeds a random threshold, the corresponding script fires. All involuntary scripts set a **latency** via `ltcy` to prevent immediate re-triggering.

### Event 64 — Flinch (Locus 0)

```caos
scrp 4 0 0 64
    ltcy 0 25 50                    * cooldown: 25-50 ticks
    pose 75                         * flinch pose
    snde "ow!1"                     * pain sound
    wait 10
    stim writ ownr 28 1             * stimulus: "I flinched"
endm
```

**Effect**: Brief pain reaction. The `ltcy` command sets the involuntary action latency for locus 0 to a random value between 25-50 ticks, preventing the creature from flinching again immediately. Grendels play `"gslp"` instead of `"ow!1"`.

### Event 66 — Sneeze (Locus 2)

```caos
scrp 4 0 0 66
    ltcy 2 25 35
    anim [071 071 072 072 072]      * build-up animation
    over                            * WAIT for animation to complete
    snde "snee"                     * sneeze sound
    anim [106]                      * sneeze pose
    stim writ ownr 30 1
    over
    mesg wrt+ ownr 300 0 0 0        * broadcast sneeze particles
endm
```

**Effect**: A two-phase sneeze animation with sound effect. Uses `over` to block until each animation completes, ensuring proper visual timing. The `mesg wrt+ 300` triggers a particle effect script. Grendels shiver (`"gshv"`) instead of sneezing.

### Event 67 — Cough (Locus 3)

Similar to sneeze but with coughing animation and sound. Ettins have a unique cough sound (`"ecof"`).

### Event 68 — Shiver (Locus 4)

```caos
scrp 4 0 0 68
    ltcy 4 30 90
    anim [046 047 046 047 046 047 047 046 255]
    snde "shiv"
    stim writ ownr 32 1
    wait rand 50 150                * shiver for 2.5-7.5 seconds
    pose 46
endm
```

**Effect**: The creature shivers for a variable duration (50-150 ticks). The long `wait` keeps the creature in the shivering state, providing repeated visual feedback that the creature is cold.

### Event 69 — Sleep (Involuntary, Locus 5)

The involuntary sleep script — identical in structure to the voluntary rest (Event 25) when sleepiness is high. See [Creature Sleep](creature-sleep.md) for the complete multi-phase analysis.

```caos
scrp 4 0 0 69
    lock
    ltcy 5 90 190                   * long cooldown after waking
    aslp 1
    * ... full dream loop ...
    untl driv 7 lt 0.10 and driv 6 lt 0.10
    aslp 0
    unlk
endm
```

**Effect**: Full sleep cycle with dreaming and instinct processing. Uses `lock` to prevent interruption and a long latency (90-190 ticks) to avoid immediately falling back asleep.

### Event 70 — Fainting (Locus 6)

```caos
scrp 4 0 0 70
    ltcy 6 70 210
    pose 58                         * collapsed pose
    setv va00 rand 1 3
    reps va00                       * faint 1-3 times
        wait rand 40 140
        stim writ targ 22 1         * resting stimulus
        snde "dead"
    repe
endm
```

**Effect**: The creature collapses for a random duration (1-3 fainting episodes of 40-140 ticks each). The distress sound `"dead"` plays during each episode. The random repeat count and duration means fainting is unpredictable — sometimes brief, sometimes extended.

### Event 71 — Hiccup / Express Discomfort (Locus 7)

```caos
scrp 4 0 0 71
    inst
    ltcy 7 10 20
    pose rand 0 99                  * random pose (startled look)
    stim writ targ 35 1
    wait 4
    * If no underwater bubble agent exists, create one
    doif loci 1 1 4 9 eq 0.0       * check breathing locus
        snde "bubf"                 * bubble sound
        new: simp 1 2 41 "bubs" ... * create bubble sprite
    endi
endm
```

**Effect**: A brief discomfort reaction with a random startled pose. If the creature is underwater (breathing locus at 0), creates visible air bubbles as a visual cue.

### Event 72 — Death

```caos
scrp 4 0 0 72
    lock
    nohh                            * release hand-holding
    attr 192                        * make unclickable
    pose 77                         * death pose
    * Alter room atmosphere
    altr room targ 3 0.5            * release nutrients
    altr room targ 4 0.5            * release pheromones
    * Play death sound (genus-specific)
    doif gnus eq 1  snde "dead"     * Norn
    elif gnus eq 2  snde "gdie"     * Grendel
    elif gnus eq 3  snde "edie"     * Ettin
    endi
    wait 400                        * 20-second pause (mourning)
    * Create death cloud/sludge effect
    new: simp 1 1 56 "death_cloud" ...
endm
```

**Effect**: The terminal script. The creature's body is locked from interaction, a death pose is set, and genus-specific death sounds play. Room atmosphere is modified (nutrients and pheromones released). After a 20-second mourning period, a death cloud or sludge particle effect spawns. This script uses `lock` and never unlocks — the creature remains in this state permanently.

### Event 300 — Sneeze Particle Effect

A supplementary script triggered by `mesg wrt+ ownr 300` from the sneeze script. Finds an existing sneeze particle agent owned by this creature and repositions it, providing a visual spray effect.

## Done-to Reaction Scripts (Events 0-7)

These scripts fire when something is **done to** the creature by an external agent.

### Event 0 — Deactivated (Slapped)

```caos
scrp 4 0 0 0
    forf from                       * update friend/foe opinion of attacker
    doif from eq pntr
        stim writ targ 3 1          * "slapped by player" stimulus
    else
        stim writ targ 4 1          * "slapped by creature" stimulus
    endi
    * Play pain sounds (genus-specific)
    * 20% chance to update opinion of attacker
    doif rand 1 5 eq 5
        like from
    endi
endm
```

**Effect**: When slapped, the creature updates its friend/foe relationship with the attacker via `forf from`, applies an appropriate stimulus (different for player vs creature), plays a pain sound, and has a 20% chance to adjust its opinion via `like from`. Wakes the creature if asleep.

### Event 1 — Activate 1 (Tickled/Patted)

```caos
scrp 4 0 0 1
    forf from
    doif from eq pntr
        stim writ targ 1 1          * "patted by player"
    else
        stim writ targ 2 1          * "patted by creature"
    endi
    * If not in pain and not bored:
    doif driv 0 lt 0.1 and driv 12 lt 0.1
        face 4                       * happy expression
        * Play giggling sounds
    endi
    doif rand 1 5 eq 5
        like from
    endi
endm
```

**Effect**: When tickled/patted, the creature receives a positive stimulus. If the creature isn't in pain or bored, it shows happiness (expression 4) and plays giggling sounds. The 20% `like from` chance means repeated positive interaction gradually builds the creature's affection for the interacting agent.

### Event 3 — Hit (Received)

The creature's reaction to being hit. Same structure as Event 0 (slapped), with pain sounds and friend/foe updates.

### Event 4 — Picked Up

```caos
scrp 4 0 0 4
    doif from eq pntr
        zomb 0                      * clear zombie state when picked up by player
    endi
endm
```

**Effect**: A minimal script — when picked up, if the picker is the pointer (player), the creature's zombie state is cleared. This is a safety mechanism to rescue stuck creatures.

### Event 6 — Collision (Impact)

```caos
scrp 4 0 0 6
    inst
    * Calculate impact force from collision parameters
    setv va00 max(_p1_, _p2_)
    divv va00 50
    clamp va00 to max 10
    * Apply pain stimulus proportional to impact
    doif va00 >= 1
        doif aslp eq 1
            aslp 0                  * wake up from impact
        endi
        reps va00
            stim writ ownr 39 1     * repeated pain stimulus
        repe
    endi
    * Strong vertical impacts bounce the creature
    doif _p2_ > 10
        setv vely (-_p2_ / 5)       * upward velocity
    endi
endm
```

**Effect**: Converts collision force into a proportional number of pain stimuli (1-10 hits). Wakes the creature if asleep. Strong vertical impacts cause a physical bounce by setting upward velocity. The `inst` flag ensures the impact is processed atomically.

### Event 7 — Bump (Walking into Wall)

```caos
scrp 4 0 0 7
    doif movs = 0                   * only when stationary (hit a wall)
        stim writ targ 0 1          * disappointment stimulus
    endi
endm
```

**Effect**: When the creature walks into a wall and stops, it receives a disappointment stimulus. This teaches the creature (via reinforcement learning) that walking in that direction was unrewarding.

## Breeding Scripts (Events 33-34, 65, 200)

### Event 34 — Mate (Approach for Mating)

The mating script involves complex checks: same genus but different species, both old enough (age >= 2), sufficient sex drive (drive 13 > 0.15), target is alive and awake, near enough (`byit`), and population limits not exceeded. If all conditions pass:

```caos
    doif va00 eq 1                  * male
        mate                        * engine handles sperm donation
    else
        anim [036 037 036 037]      * kiss animation
        mesg wrt+ _it_ 200 0 0 0   * trigger mate response in partner
    endi
    stim writ ownr 45 1             * "I mated" stimulus
    stim writ _it_ 45 1            * partner gets same stimulus
```

**Effect**: If the creature is male, calls the engine's `mate` command (sperm donation). If female, plays a kissing animation and messages the partner. Both creatures receive mating stimuli that reduce sex drive.

### Event 65 — Lay Egg (Involuntary)

Triggered when the ReproductiveFaculty's pregnancy reaches term. The creature plays an egg-laying animation, creates an egg agent with the offspring's genome, and sets a long cooldown.

### Event 200 — Mate Response

A simple relay script: `mate` — called when a partner initiates mating via `mesg wrt+ _it_ 200`.

## Common Patterns Across Scripts

### The Approach-Touch-Interact Pattern

Most extraspective actions (those requiring an IT object) follow:

```caos
appr                    * 1. Walk to target
inst
doif _it_ eq null       * 2. Safety: target vanished?
    wait 10
    stop
endi
touc                    * 3. Confirm physical contact
inst
doif _it_ eq null       * 4. Safety: vanished during touch?
    wait 10
    stop
endi
```

The repeated null checks after `appr` and `touc` handle the case where the IT object is destroyed or moves out of reach during the approach — a common scenario in a dynamic world.

### Stimulus Feedback Loop

Every action applies a stimulus via `stim writ`:
- **Success**: A specific positive stimulus (13, 14, 15, etc.) adjusts drive chemicals and triggers reinforcement learning, teaching the brain that this action was rewarding
- **Failure**: Stimulus 0 ("disappointment") mildly penalises the brain's decision, making the creature less likely to repeat the action in similar circumstances

This is how creatures **learn**: the stimulus system closes the loop between brain decisions and biochemical consequences.

### Blocking via WAIT

Every script contains at least one `wait` command, which blocks the CAOS VM for the specified number of ticks. This is critical for:
- **Visual timing**: Animations need time to play
- **Motor Faculty pacing**: Without blocking, the Motor Faculty would restart actions every 200ms (every 4 ticks), causing rapid action cycling
- **Biochemical processing**: Chemicals need time to propagate through the biochemistry system before the next action

### The LOCK/UNLK Guard

Critical sequences like sleep and death use `lock` to prevent the Motor Faculty from interrupting the script mid-execution. Without `lock`, a brain decision change could abort a sleep cycle halfway through, leaving the creature in an inconsistent state.

## Script Event Number Reference

| Event | Action | Offset | Category |
|-------|--------|--------|----------|
| 0 | Deactivated (slapped) | — | Done-to |
| 1 | Activate 1 (patted) | — | Done-to |
| 3 | Hit (received) | — | Done-to |
| 4 | Picked up | — | Done-to |
| 6 | Collision | — | Done-to |
| 7 | Bump (wall) | — | Done-to |
| 16 | Quiescent / idle | 0 | Voluntary |
| 17 | Activate 1 (push) | 1 | Voluntary |
| 18 | Activate 2 (pull) | 2 | Voluntary |
| 19 | Deactivate (hit object) | 3 | Voluntary |
| 20 | Approach | 4 | Voluntary |
| 21 | Retreat / express | 5 | Voluntary |
| 22 | Get / pick up | 6 | Voluntary |
| 23 | Drop | 7 | Voluntary |
| 24 | Express need / say | 8 | Voluntary |
| 25 | Rest / sleep | 9 | Voluntary |
| 26 | Travel west | 10 | Voluntary |
| 27 | Travel east | 11 | Voluntary |
| 28 | Eat | 12 | Voluntary |
| 29 | Hit (attack object) | 13 | Voluntary |
| 32 | Idle near creature | 0 | Creature-to-creature |
| 33 | Mating signal | — | Breeding |
| 34 | Mate (approach) | — | Breeding |
| 45 | Hit creature (slap) | 13 | Creature-to-creature |
| 64 | Flinch | Locus 0 | Involuntary |
| 65 | Lay egg | Locus 1 | Involuntary |
| 66 | Sneeze | Locus 2 | Involuntary |
| 67 | Cough | Locus 3 | Involuntary |
| 68 | Shiver | Locus 4 | Involuntary |
| 69 | Sleep (involuntary) | Locus 5 | Involuntary |
| 70 | Faint | Locus 6 | Involuntary |
| 71 | Hiccup / discomfort | Locus 7 | Involuntary |
| 72 | Death | — | Involuntary |
| 200 | Mate response | — | Breeding |
| 300 | Sneeze particles | — | Effect |

## See Also

- [Motor Faculty](motor-faculty.md) — How the brain decision pipeline triggers these scripts
- [Creature Sleep](creature-sleep.md) — Full analysis of the sleep cycle (Events 25, 69)
- [Stimulus System](stimulus-system.md) — How `stim writ` provides biochemical feedback
- [Decision Lobe Architecture](decision-lobe-architecture.md) — The neural competition that selects actions
- [Instinct System](instinct-system.md) — How instincts wire initial brain responses to actions
