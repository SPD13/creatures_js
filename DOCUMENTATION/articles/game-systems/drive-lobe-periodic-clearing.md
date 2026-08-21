# Drive Lobe Periodic Clearing: Instinct Processing & Knowledge Building

If you watch the Drive lobe (`driv`) in the creature debugger long enough, you will eventually see the same puzzling event repeat: every few seconds all 20 drive neurons drop to **zero**, often with a single neuron (typically index 19 — "Wait") briefly isolated at a high value, and then the entire lane **gradually rebuilds** over several ticks until it resumes its normal steady state.

This is not a bug. It is the engine's **instinct-processing / knowledge-building** cycle, and it happens while the creature is **awake**. This article traces the exact trigger, the code path, the role of the CAOS bootstrap, and why the original Creatures 3 engine does the same thing.

## What you see in the debugger

1. All 20 `driv` neurons visibly drop to 0 at the same instant.
2. A single drive neuron is momentarily at a high value (most commonly neuron 19 — *Wait*).
3. Over the next several brain ticks, the drive signals climb back toward their chemical-driven steady-state levels — this is the "gradual rebuild."
4. The pattern repeats at a regular interval while certain drives remain high (most commonly when *Sleepiness* or *Tiredness* is elevated).
5. The creature is not visibly asleep, no sleep state-change is recorded in `LifeFaculty.stateHistory`, and the user never issued a manual `DREA` command.

## The actual mechanism

### 1. `Brain.ClearActivity()` is the only thing that can zero the lobe

Nothing in the normal awake update path clears drive neuron state. The only call sites for `Brain::ClearActivity()` in the original engine (and the JS rebuild) are:

| Call site | File (JS) |
|---|---|
| `Instinct::Process` | `Rebuild/Main_Game/src/engine/creature/brain/Instinct.js:85` |
| Brain knowledge-building (pre) | `Rebuild/Main_Game/src/engine/creature/brain/Brain.js:359` |
| Brain knowledge-building (post) | `Rebuild/Main_Game/src/engine/creature/brain/Brain.js:407` |

All three are inside the branch guarded by `myInstinctsAreBeingProcessed == true` (`Brain.js:315-319`). When the flag is false, `Brain::Update` simply calls `UpdateComponents()` and returns — no clearing happens.

### 2. The flag is only flipped through the `dreamingState` transition

`myInstinctsAreBeingProcessed` is toggled by exactly one function: `Brain::SetWhetherToProcessInstincts()`. That function has only **two** call sites in the engine:

| Caller | Location |
|---|---|
| `LifeFaculty::SetState` — on entering `dreamingState` | the life faculty state transition |
| `LifeFaculty::SetState` — on leaving `dreamingState` | the life faculty state transition |

The JS rebuild mirrors this exactly at `Rebuild/Main_Game/src/engine/creature/faculties/LifeFaculty.js:257-266`.

So every time you observe a drive-lobe clear, the creature **must have transitioned through `dreamingState`**, even if the transition was so brief that the debugger's sleep-history view did not visibly register it.

### 3. The trigger is CAOS, not the engine

The `LifeFaculty` itself never auto-transitions into `dreamingState`. The only ways the state can be entered are:

- The CAOS `DREA 1` command, which calls `Life().SetWhetherDreaming(true)`.
- Pre-written bootstrap scripts that issue `DREA 1` at specific moments in the creature's life.

Searching the bootstrap CAOS for `drea 1` yields a very small set of call sites:

| Script | File:line | When it fires |
|---|---|---|
| Birth / hatching | `Rebuild/Assets/Bootstrap/001 World/creatureBreeding.cos:29,144,258` | Once per newborn — trains instincts from the genome |
| **"I feel sleepy" decision** | `Rebuild/Assets/Bootstrap/001 World/creatureDecisions.cos:485` | **Triggered when `driv 7 (Sleepiness) > 0.6`** — loops until `driv 7 < 0.10` and `driv 6 (Tiredness) < 0.10` |
| Involuntary tired action | `Rebuild/Assets/Bootstrap/001 World/creatureInvoluntary.cos:228` | Same pattern — pulses `DREA 1` in a `wait 20` loop |
| Grendel upgrade patch | `Assets/Bootstrap/001 World Patches/zzz_grendel_upgrade_c3.cos:39,353` | One-shot patch code |

The script most commonly responsible for the "awake" observation is **`scrp 4 0 0 25`** (*creatureDecisions.cos* — the "feel tired" decision). It looks like this:

```caos
scrp 4 0 0 25
    doif driv 7 gt 0.6
        lock
        ltcy 5 90 190
        pose 57
        wait 25
        stim writ targ 21 1
        aslp 1                        ; put creature to sleep
        new: simp 1 2 28 "zzzz" 17 0 6000  ; Z's above head
        ...
        setv va00 0
        loop
            drea 1                    ; <-- pulses dreaming state
            ...
            pose 58
            wait 20                   ; 20 ticks of normal update
            stim writ targ 22 1
            addv va00 1
            ...
        untl driv 7 lt 0.10 and driv 6 lt 0.10
        aslp 0
        pose 58
        wait 25
        unlk
    ...
```

Every 20 ticks this loop issues a fresh `drea 1`. Even though `aslp 1` was called, the creature may appear awake to an observer (depending on the pose and what the debugger is showing), and the state history may not be configured to surface the pulse. The important point is that this loop alternates the creature in and out of `dreamingState` on a fast duty cycle — **every pulse runs exactly one instinct or one knowledge-building step, then clears the lobe**, and the drive lobe has to rebuild during the next 20 ticks before the next pulse.

## What `Brain::Update` actually does during the pulse

When `myInstinctsAreBeingProcessed` is true, `Brain::Update` does one of two things per tick:

1. **If the instinct queue is non-empty**, pop the newest instinct and run `Instinct::Process()`:
   - `ClearActivity()` zeros `states[0]` (`STATE_VAR`) on every neuron in every lobe (`Instinct.js:85`)
   - The instinct sets specific inputs on `noun` / `visn` / `smel` / `verb` as declared in the genome
   - `SetInput("verb", decisionId, 1.0)` forces a candidate decision
   - `UpdateComponents()` runs one full brain pass with that contrived state
   - If the decision lobe accepts the forced verb, reinforcement is pushed into the `resp` lobe for the drive tied to this instinct
2. **Otherwise** (queue empty), run one step of the **knowledge-building loop** (`Brain.js:337-408`):
   - `ClearActivity()` zeros the whole brain again
   - All `noun` neurons are stimulated to 0.5, all `visn` neurons to 0.1
   - **One** drive neuron — the one at index `myLastKnowledgeUpdated` — is stimulated to 1.0
   - `UpdateComponents()` runs one brain pass
   - The resulting winning `attn` and `decn` neurons are recorded into `myAssistanceKnowledge[driveIndex]`
   - `myLastKnowledgeUpdated` is incremented; once it reaches 20 the flag is cleared
   - `ClearActivity()` is called again at the end of the iteration

### Why neuron 19 is the one you most often see in isolation

The knowledge-building loop walks drive indices `0 → 19` across consecutive brain ticks. On each tick it clears the whole lobe, then fires exactly one drive neuron at 1.0, runs components, records, and clears again. The debugger polls at a lower frame rate than the brain ticks, so the intermediate iterations (drives 0–18) are usually missed — you catch only the *last* iteration (index 19, "Wait") in the short window before `myInstinctsAreBeingProcessed` flips back to `false` at `Brain.js:402`. Once it does, the next `Brain::Update` takes the normal `UpdateComponents()` path again and the drive lobe's leaky SVRule starts climbing back up.

## Why the signal "gradually rebuilds"

The drive lobe neuron state is **not** a pass-through of the current chemical level. `Lobe::DoUpdate` feeds `neuronInput[i]` into `invalidVariables[0]` and runs the lobe's update SVRule to produce the new `states[0]` (`Rebuild/Main_Game/src/engine/creature/brain/Lobe.js:169-225`). For the default C3 drive lobe, that SVRule behaves as a leaky integrator — `states[0]` tends toward the current steady-state value but does not snap there. So after `ClearActivity()` sets `states[0] = 0`, the next several brain ticks of constant chemical input pull `states[0]` upward until it re-reaches equilibrium. That is the "gradual rebuild" you observe.

## Why the engine does this — utility

The clearing is intentional:

- **Instinct reinforcement.** Each instinct represents a genome-encoded "drive X should be satisfied by action Y given noun Z." The engine teaches this association by zeroing all residual neural activity, injecting *only* the relevant inputs at 1.0, and pushing reinforcement into the `resp` lobe. Residual activity from the previous tick would contaminate the association — hence the clear before every trial.
- **Knowledge building for the Linguistic faculty.** The `myAssistanceKnowledge[]` array is consumed by the linguistic faculty when a creature tries to **teach** another creature which action relieves which drive. To keep that table current, the brain repeats the "stimulate drive N at 1.0 in isolation and see which decision wins" test for every drive slot. Cross-talk between trials would return meaningless associations, so each trial runs from a cleared state.
- **Continuous refresh.** Because the sleepy/tired CAOS loop fires on a 20-tick cadence while `Sleepiness > 0.1`, drive-to-action associations are quietly re-tested over and over during drowsy periods. The creature is effectively doing light "sleep learning" every few seconds while dozing.

## Confirmation checklist

If you suspect the clear you're seeing is *not* instinct processing, verify in the creature debugger:

1. **`LifeFaculty` state transitions** — open the sleep/life-state history. Even if the body pose looks awake, a `DREAMING` pulse should appear on every clear.
2. **`Brain.myInstinctsAreBeingProcessed`** — sample its value at the instant of the clear; it must be `true` during the pulse.
3. **Active CAOS scripts** — check whether script `4 0 0 25` (creatureDecisions) or `creatureInvoluntary.cos:228` is executing on the creature.
4. **Drive 7 (Sleepiness) level** — if above 0.6, the tired-decision loop is almost certainly firing; if above 0.1, a pre-existing loop is still running.
5. **CAOS trace** — search for `DREA 1` invocations in the debugger's CAOS command stream.

If all five checks come back negative and you still observe the clear, that *would* be a rebuild-side bug — a stuck `myInstinctsAreBeingProcessed` flag or an unauthorized call into `Brain.clearActivity()`. Neither is known to exist in the current code.

## File map

| Concern | JS rebuild |
|---|---|
| `Brain::Update` branch selection | `Rebuild/Main_Game/src/engine/creature/brain/Brain.js:314-409` |
| `Brain::ClearActivity` | `Rebuild/Main_Game/src/engine/creature/brain/Brain.js:463-467` |
| `Lobe::ClearActivity` | `Rebuild/Main_Game/src/engine/creature/brain/Lobe.js:341-345` |
| `Instinct::Process` | `Rebuild/Main_Game/src/engine/creature/brain/Instinct.js:84-127` |
| `LifeFaculty::SetState` / flag toggle | `Rebuild/Main_Game/src/engine/creature/faculties/LifeFaculty.js:215-266` |
| `DREA` CAOS command | (implementation under `src/engine/caos/commands/`) |
| `SensoryFaculty::UpdateDriveLobe` | `Rebuild/Main_Game/src/engine/creature/faculties/SensoryFaculty.js:350-356` |
| Sleep/tired loop with `DREA` | `Rebuild/Assets/Bootstrap/001 World/creatureDecisions.cos:460-520` |
| Involuntary tired loop with `DREA` | `Rebuild/Assets/Bootstrap/001 World/creatureInvoluntary.cos:215-253` |

## Related articles

- [Drive System: From Chemical to Decision](./creatures/drive-system.md) — the chemical → locus → drive-lobe pipeline
- [[driv] Drive Lobe Architecture](./drive-lobe-architecture.md) — lobe internals and SVRule
- [Creature Decisions Script](./creatures/creature-decisions-script.md) — structure of `creatureDecisions.cos`
- [Instinct System](./instinct-system.md) — the genome instinct queue processed during dreaming
- [Creature Sleep](./creature-sleep.md) — full sleep/dream state machine
