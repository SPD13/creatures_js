# [driv→driv] Drive Inhibition Tracts

The standard norn brain has a curious self-loop: two tracts whose *source* lobe is the drive lobe and whose *destination* lobe is also the drive lobe. They run every brain tick, immediately after the drive lobe itself updates. They have hundreds of dendrites between them. And they don't carry any signal at all — every dendrite weight is zero.

What they actually do is **suppress**. When any of the five "navigation" drives (Up, Down, Exit, Enter, Wait) is firing above a tiny threshold, these two tracts wipe the state of every biological drive — Pain, Hunger, Loneliness, Fear, all of them — back to zero. The creature still has the underlying chemical signals in its bloodstream and the receptors still write to the drive loci, but the brain stops seeing those signals. For as long as a navigation drive is active, the decision lobe sees a creature with no biological motivation and falls back on the default `Look` action.

The clearest place to watch this happen is when a creature uses a lift. This article explains the mechanism, walks through the lift example end-to-end, and shows how to observe the suppression in the debugger.

## The Two Tracts

Both tracts have the source lobe `driv` and the destination lobe `driv`. They differ in which source neurons they listen to and which destination neurons they write to.

| Tract idx | Name      | Dendrites | Source neurons               | Destination neurons | Update at time |
|-----------|-----------|-----------|------------------------------|---------------------|----------------|
| 25        | driv→driv | 195 (15 × 13) | drives 15–19 (all five navigation drives) | drives 0–14 (biological + comfort) | 7 |
| 27        | driv→driv | 19         | drive 19 only (Wait)         | drives 0–18         | 8 |

The drive lobe itself has `updateAtTime: 4`, so both tracts run *after* the lobe finishes writing each neuron's `state[0]` from the per-tick external input.

The dendrite layout reveals the design intent.

**Tract 25** is the cross-suppression bus: each of its 15 destinations (drives 0–14, the biological drives) is fed by 13 dendrites, sourced from the navigation drives. Sample dendrites show src ids in the 15–19 range with consecutive dst ids 0..14, repeating. So *any* navigation drive can suppress *any* biological drive through this tract.

**Tract 27** is a Wait-specific narrowing: 19 dendrites, all with `srcNeuronId = 19`, distributed one per dst across 0..18. That last range — 0..18 — is one wider than tract 25's 0..14, picking up Sex Drive (13), Comfort (14), Up (15), Down (16), Exit (17), and Enter (18) on top of the biological drives. Wait suppresses *every* other drive, biological *and* the other four navigation drives.

Notice what neither tract touches: **drive 19 itself**. Wait is the only drive that can never be suppressed by this mechanism. When Wait fires, every other drive drops to zero in the brain layer; Wait alone survives.

## The Shared SVRule

Both tracts use the same four-instruction update rule (lines 4 onward are all `STOP_IMMEDIATELY` and never execute):

```
0  LOAD_ACC_FROM        INPUT[0]                  ; acc = source neuron's state[0]
1  IF_GREATER_THAN      VAL  (25/248 ≈ 0.1008)    ; if acc > 0.1008, do not skip the next line
2  BLANK_OPERAND        NEURON[0]                 ; dst neuron state[0] = 0
3  STOP_IMMEDIATELY
```

In plain English: *if the source neuron is firing above ~0.1, zero the destination neuron's STATE_VAR*.

A few things about this rule are worth dwelling on.

**It does not touch dendrite weights.** The accumulator is loaded from `INPUT_NEURON_CODE` (the source neuron, not a weighted dendrite), the comparison is against a hardcoded constant, and the only write goes to `NEURON_CODE` (the destination neuron's state). Nothing reads or writes `DENDRITE_CODE`. The 195 + 19 dendrite slots have eight numeric weight fields each, and all 1712 of those weights stay at zero for the creature's entire life. This makes both tracts non-plastic by the standard definition (see [Non-Plastic Dendrites](non-plastic-dendrites.md)). The dendrites exist as a routing table — "src neuron X feeds suppression into dst neuron Y" — and that's all.

**The threshold is genome-encoded as the codon byte 25.** The float value is computed by `Genome.getCodonLessThan(248)` divided by 248: `25 / 248 ≈ 0.1008`. At any point above that very low threshold, the rule fires `BLANK`. There is no smooth "partial inhibition" — it's binary. Either the navigation drive is below 0.1008 and biological drives pass through untouched, or it's above 0.1008 and biological drives are zeroed.

**`BLANK NEURON[0]` writes 0 directly, not via a multiplier.** It's the SVRule opcode that unconditionally clears its operand to zero (see `SVRule.js`). So the suppression is a hard wipe, not a gradual fade — even if the source neuron is at the marginal value 0.11, the destination still goes all the way to 0.

## How the Suppression Plays Out Within a Single Brain Tick

To understand the timing, follow what happens inside one call to `Brain.updateComponents()`. Components are sorted by `updateAtTime` and processed in order. The relevant subset, for the standard genome:

```
updateAtTime  Component                  Action
------------  -------------------------  --------------------------------------------
4             driv (lobe)                state[0][i] = drive level i (for all i = 0..19)
5             driv→forf, driv→mood       fan-out tracts to other lobes
7             driv→driv (tract 25)       if drive 15..19 > 0.1, blank state[0][0..14]
8             driv→driv (tract 27)       if drive 19 > 0.1,    blank state[0][0..18]
17            driv→comb (plastic)        feed drive signals into combination matrix
23            decn (lobe)                winner-takes-all → action
```

So within a single tick:

1. The drive lobe's update SVRule (`STORE_ACCUMULATOR_INTO NEURON[0]; STOP`) writes the correct drive level into each neuron's `state[0]`. For roughly a quantum of synchronous execution, every drive is properly populated.
2. Tract 25 runs and, if any navigation drive is above 0.1008, blanks state[0] on biological drives 0–14.
3. Tract 27 runs and, if Wait is above 0.1008, blanks state[0] on drives 0–18.
4. By the time the *next* lobe (`driv→comb` at updateAtTime 17) reads the drive lobe to populate the combination matrix, only Wait's value is non-zero.
5. The decision lobe at updateAtTime 23 sees a creature with no biological drive contribution; the Wait drive's tract weights into `comb→decn` and `verb→decn` push the result toward action 0 (`Look` / Quiescent).

The "right value for one quantum, then zeroed" behaviour is observable. If you instrument the drive lobe's `doUpdate` to log `state[0]` before and after each call, you will see the lobe correctly write `state[0][2] = 1.0` on a hungry creature — and a high-frequency poll of the same field a few microseconds later will read `state[0][2] = 0`. The lobe writes the right value, then a downstream tract clobbers it inside the same synchronous tick. To external observers (the debug UI, the decision lobe, anything that reads neuron states between brain ticks), drives 0–18 just look dead.

## The Lift Example

Lifts are the most common in-game trigger of this mechanism. Here is the chain end-to-end.

### Step 1 — The creature decides to use a lift

A creature whose brain selects `ACTIVATE1` (Push) or `ACTIVATE2` (Pull) with the lift button as IT will, on the next motor tick, run the corresponding action script targeting the lift. This is how creatures normally board lifts to travel between rooms — `Activate1` and `Activate2` correspond to "press up" and "press down" on the lift's call button.

### Step 2 — The lift's CAOS script fires the Wait stimulus

The lift button has classifier `3 1 1`. In `Rebuild/Assets/Bootstrap/001 World/Lifts.cos`, the scripts handling the creature-initiated activation events are:

```caos
scrp 3 1 1 1
    inst
    seta va99 null
    targ from              ; FROM = the agent that activated the button
    doif fmly eq 4         ; family 4 = creatures
        stim writ targ 75 0    ; ← fires stim 75 (Wait) on the creature
        seta va99 targ
    endi
    targ ownr
    seta ov99 va99
    mesg writ ownr 2000    ; tell the lift itself to start moving
endm
```

The `scrp 3 1 1 2` script is structurally identical, just with `mesg writ ownr 2001` at the end.

The line that matters here is `stim writ targ 75 0`. Stim number 75 is the predefined "Wait" stim from the genome's stimulus library. The third argument, `0`, is the strength.

### Step 3 — strength=0 is a sentinel for "full magnitude, no learning"

`STIM WRIT` does *not* interpret strength `0` as "no effect". From the JS implementation in `Rebuild/Main_Game/src/engine/caos/commands/creatures/STIM_WRIT.js:117-119`, mirroring the original engine:

```js
const strengthMultiplier = (strength === 0.0) ? 1.0 : strength;
const forceNoLearning = (strength === 0.0);
```

So `0` is a sentinel meaning *"apply at multiplier 1.0 but skip the reinforcement learning step"*. The lift wants to bump Wait at full magnitude without teaching the creature anything about the lift, so it uses 0.

### Step 4 — The genome's stim 75 entry adjusts chem 203 by +1.0

Stim 75's payload, decoded from the genome's `G_STIMULUS` gene by `Stimulus.initFromGenome` (`Stimulus.js:45-67`), is:

```
chemicalsToAdjust: [203, 0, 0, 0]   ; chem 203 (Wait) is the only chem this stim touches
adjustments:       [1.0, 0, 0, 0]   ; magnitude is exactly +1.0 at multiplier 1.0
```

The `+1.0` is the maximum signed-float encoding the genome supports. `Genome.getSignedFloat()` returns `(byte / 124.0) - 1.0`, so the encoded byte must be exactly `248` to produce `+1.0`. That magnitude is intentional, not a bug.

Combined with the strength-0 sentinel becoming multiplier 1.0, the net effect of one lift activation is `chem 203 += 1.0`, clamped to 1.0.

### Step 5 — Receptor and drive locus

The biochemistry receptor for chem 203 (geneId 157) is wired to write to `myDriveLoci[19]` (Wait drive locus) at gain 1.0. Once chem 203 is at 1.0, the next biochemistry tick writes 1.0 to `myDriveLoci[19]`. The next sensory faculty tick reads `getDriveLevel(19)` and pumps it into the drive lobe via `brain.setInput('driv', 19, 1.0)`.

### Step 6 — Drive lobe and inhibition tracts run

On the next brain tick, the drive lobe's `doUpdate` writes `state[0][19] = 1.0`. Then tract 27 fires: source neuron 19 is at 1.0, which is greater than 0.1008, so the rule fires `BLANK NEURON[0]` for every dendrite — clearing `state[0]` on drive neurons 0–18. Tract 25 does the same for drives 0–14 since drive 19 is in its source range too.

After this tick, the drive lobe state, as visible in the debugger, looks like:

```
neuron  drive name              myDriveLoci  state[0]
------  ----------------------  -----------  --------
0       Pain                    0.000        0.000
1       Hunger for Protein      0.387        0.000  ← suppressed
2       Hunger for Carbohydrate 1.000        0.000  ← suppressed (creature is starving)
3       Hunger for Fat          0.051        0.000  ← suppressed
...
6       Tiredness               0.875        0.000  ← suppressed
...
11      Boredom                 0.827        0.000  ← suppressed
...
19      Wait                    1.000        1.000  ← only survivor
```

The biochemistry layer correctly knows the creature is starving — `myDriveLoci[2]` shows the Hunger for Carbohydrate drive at full saturation. The brain layer cannot see it.

### Step 7 — The decision lobe defaults to Look

With every biological drive zeroed at the brain layer, `driv→comb` (the plastic tract feeding biological motivation into the combination matrix) carries near-zero values into the `comb` lobe. The `comb→decn` projection then has very little signal pushing any specific action neuron. The decision lobe's winner-takes-all collapses to neuron 0 — `Look` (Quiescent / "stand and watch IT"). Since the lift is still in vision range and probably still IT, the creature stands silently and stares at the lift it just pressed.

### Step 8 — The Wait drive decays and the inhibition lifts

Chem 203 has half-life 43 ticks (`halfLifeInTicks: 43` in the genome's chemicals table). With biochemistry running once every 4 game ticks at the engine's 20 tps target, decay applies at 5 Hz. That gives a real-world half-life of `43 / 5 = 8.6` seconds. To drop from 1.0 below the inhibition threshold of 0.1 takes about 3.32 half-lives, so **the creature is locked in `Look` for roughly 26 seconds per lift activation**. After that, drive 19 decays past the threshold, the tracts stop firing `BLANK`, the biological drives reach the brain again, and the creature resumes acting on hunger / boredom / loneliness as normal.

If the creature accidentally re-presses the lift mid-window — for example, because some residual signal in the noun or stimulus lobe still nominates the lift as IT and the brain's decision falls on `Activate1` — the timer resets. A creature in a bad attention loop near a lift can therefore appear stuck indefinitely.

## Why It Is Designed This Way

The Wait drive is a deliberate "global stand-still gate" baked into the genome. C3's transit infrastructure (lifts, doors, transit pads) needs the creature to **stop deciding things** while in transit, otherwise a creature might step off the lift platform mid-ride to chase food, or trigger a different door before the current one finishes its animation. The traditional way to do this in a game engine would be a hardcoded "in transit" flag that disables AI. C3 instead uses biochemistry: bump Wait chemical to 1.0, let it suppress everything via the brain's own inhibitory tracts, and let it decay naturally over several seconds. The creature looks calm — it's not frozen, it's just not motivated to do anything because, as far as its brain knows, no biological drive is firing.

This decoupling has elegant consequences:

- **The same mechanism handles every transit interaction.** Lifts, doors, vendors, transit pads — anything with `stim writ targ 75 N` automatically gets a creature-pause.
- **Suppression strength is configurable per stim.** The lift uses strength 0 (full magnitude, no learning). A weaker fixture could use a smaller strength and only partially raise chem 203, letting biological drives leak through.
- **The creature's biochemistry is unaffected.** Hunger keeps going up while the creature is on the lift; the brain just doesn't act on it. Once the inhibition lifts, the creature is correctly motivated to resolve whatever has been accumulating.
- **Modders can disable transit-pause for specific creatures** by editing the genome's stim 75 entry to bump a different chem (or none at all) without changing any engine code.

The same mechanism is also why a creature riding a lift cannot decide to climb down mid-shaft: the Wait drive has been pumped, biological drives are all zero in the brain, and any decision other than `Look` would require some biological drive to be non-trivially weighted into `comb`. Wait *itself* projects into `comb` via `driv→comb`, but the dendrites from drive 19 to most action columns are weak in the trained brain — so `comb` doesn't strongly favour any action, and the default winner is whatever wins ties, which (for a fresh creature) is action 0.

## Observing the Suppression in the Debugger

Open the **Brain → Sensory** tab, sub-tab **Drive**. You will see a list of 20 neurons with their state[0] values. For a creature actively riding a lift (or one that has touched a lift in the last ~20–25 seconds), you should see:

- `Wait` (neuron 19) at a value between 0.1 and 1.0, decaying over time
- All other 19 neurons at 0.000

To compare with the underlying drive locus (which is *not* affected by the inhibition):

```js
const c = window.gameEngine.world.agentManager.getAllAgents()
    .find(a => a.isCreature && a.isCreature());
console.warn('locus', Array.from(c.myDriveLoci));
console.warn('brain', c.myBrain.getLobeFromTokenString('driv').neurons.map(n => n.states[0]));
```

The two arrays should diverge dramatically: `myDriveLoci` will show a healthy mix of biological drive levels reflecting the creature's current biochemistry; `state[0]` will show only Wait.

To watch the inhibition take effect in real time, prime chem 203:

```js
const bio = window.gameEngine.world.agentManager.getAllAgents()
    .find(a => a.isCreature && a.isCreature()).myBiochemistry;
bio.getChemicalConcs()[203] = 1.0;
```

Within a few hundred milliseconds (the time for one biochemistry → sensory → brain round-trip), every biological drive `state[0]` will collapse to zero in the debugger. You can then watch the creature stop whatever it was doing and stand still for ~26 seconds until the chemical decays out.

## Modding Considerations

If you are designing a new transit fixture that should *not* freeze the creature, do not call `STIM WRIT TARG 75 …`. Use a different stim or just send messages. Stim 75's interaction with the inhibition tracts is the entire reason the creature stops.

If you want a *partial* freeze — say, the creature should be only mildly distracted while on a slow conveyor — the cleanest approach is to define a new stimulus gene that bumps a different chemical with similar half-life characteristics but no receptor → drive 19 wiring. The inhibition tracts only blank when drive 19 (or any of 15–18) is above 0.1008; if your stim doesn't raise any of those drives, no suppression occurs.

If you are editing the genome's stim 75 entry directly (don't, but if you must): the `adjustments[0]` field is what controls the magnitude. Reducing it from `+1.0` to e.g. `+0.3` would make a single lift activation only push chem 203 to 0.3 — barely above the inhibition threshold, with a much shorter decay window (one half-life of ~8 seconds drops it to 0.15, two half-lives to 0.075 = below threshold). This deviates from the standard genome and will affect breeding, but as a research / modding tweak it is a single byte change.

The 0.1008 threshold itself lives inside the inhibition tracts' SVRule and is encoded as the codon byte 25 in lines 1 of tracts 25 and 27. Raising that threshold (say, to 0.5) would mean only a strongly fired Wait drive triggers inhibition, and minor residual decay levels would let biological drives leak through. Again, a deviation from canonical C3.

## Related Articles

- [Drive Lobe Architecture](drive-lobe-architecture.md) — the input side of the drive lobe and how chemicals reach the 20 neurons
- [Brain Chemicals (1-9)](brain-chemicals.md) — chemicals 198–206 including the Wait chemical (203)
- [Non-Plastic Dendrites](non-plastic-dendrites.md) — why the inhibition tracts have all-zero weights and what "non-plastic" means in general
- [Drive Lobe Periodic Clearing](drive-lobe-periodic-clearing.md) — a different mechanism that also zeros the drive lobe (during dreaming/instinct processing) — distinct from the inhibition described here
- [Decision Lobe Architecture](decision-lobe-architecture.md) — how `comb→decn` and `verb→decn` produce the action winner once drives are suppressed
- [Combination Lobe Architecture](combination-lobe-architecture.md) — the central matrix where drive signals land before reaching the decision lobe
- [Reinforcement Learning Pipeline](reinforcement-learning-pipeline.md) — what `forceNoLearning` skips when the lift fires `STIM WRIT TARG 75 0`
