# Zombie State

The **zombie state** is one of the six life states a Creatures 3 norn or grendel can be in. A zombie is **alive and aware — eyes open, can hear speech — but completely brain-disconnected**: no decisions are processed, no voluntary actions are taken, the motor faculty is frozen. It's the engine's "puppet" mode, used by gameplay code to take temporary control of a creature for scripted sequences (lift rides, gene splicing, teleport effects, hand-holding).

This article documents the engine semantics of the state, the rules that govern entering and leaving it, and the four bootstrap CAOS scripts that drive a creature into it during normal gameplay.

## The Life State Machine

All six life states are stored in a single `myState` enum on the `LifeFaculty`:

| Value | State | Description |
|-------|-------|-------------|
| 0 | `zombieState` | **Alive, no brain control** (eyes open) |
| 1 | `alertState` | Normal conscious state |
| 2 | `asleepState` | Sleeping (NREM — no instinct processing) |
| 3 | `dreamingState` | Dreaming (REM — instinct processing active) |
| 4 | `unconsciousState` | Knocked out |
| 5 | `deadState` | Dead |

The boolean queries (`GetWhetherZombie()`, `GetWhetherAlert()`, etc.) are derived from this single value — there are no separate flags. A creature is in **exactly one** of these six states at any time. (See [Creature Sleep](creature-sleep.md) and [Age and Lifecycle](age-and-lifecycle.md) for the other transitions.)

`zombieState` slots between "alive" (alert/asleep/dreaming) and "non-functional" (unconscious/dead). It's special because, unlike sleep or unconsciousness, **the creature still appears awake** — the eyes stay open and the linguistic faculty still parses incoming speech.

## What the Zombie State Does

### Faculty effects

When a creature transitions into `zombieState`, several faculty `Update()` loops short-circuit:

- **`MotorFaculty.Update()`** — early-returns. No attention switching, no voluntary action selection, no involuntary action selection. The creature does **nothing** on its own.
- **SensoryFaculty** — gates an audible-event hook off (only alert creatures fire it).
- **ExpressiveFaculty** — only zombie- or alert-state creatures animate facial expressions; the eye-blink logic treats zombies like alert creatures, so **the eyes stay open**.
- **LinguisticFaculty** — zombie + alert are the two "awake" states for hearing, so a zombie **still parses speech** even though it can't act on it.

So a zombie is awake-looking, audibly attentive, but motorically paralysed.

### State-transition side effects

The `LifeFaculty.SetState()` function runs side effects on every transition. The ones that fire when entering the zombie state are:

```text
// if norn is going not alert:
if myState == alertState:
    Motor.StopCurrentAction()      // reset action so it gets restarted later
    SetIntrospective(true)
    ResetAnimationString()

// if norn is going unconscious give it a suitable pose:
if s == unconsciousState or s == zombieState:
    VirtualMachine.StopScriptExecuting()
    ShowPose(58, 0)
```

Two consequences worth highlighting:

1. **Any running creature script is killed** by `StopScriptExecuting()`. If a zombie was in the middle of an `appr`/`wait`/`anim` chain when it got zombified, that work is lost.
2. **Pose `58, 0` is forced** — the same limp/blank pose used for unconsciousness. CAOS scripts that zombify a creature typically immediately set a different pose (see the gene-pod example below) to avoid the creature looking knocked out during their custom animation.

## Entering and Leaving the Zombie State

The only API for changing the zombie flag is `LifeFaculty.SetWhetherZombie(u)`:

```text
function SetWhetherZombie(u):
    if myState == deadState: return
    // not allowed unzombie if we're not in a zombie state:
    if not u and myState != zombieState: return
    SetState(u ? zombieState : alertState)
```

The rules encoded here:

- **Dead creatures cannot be zombified** (or un-zombified). Death is final.
- **Un-zombifying always returns the creature to `alertState`**, never to whatever state it was in before. A creature that was asleep when it got zombified will be wide awake when un-zombified.
- **You can only un-zombify a creature that is currently a zombie** — calling `SetWhetherZombie(false)` on an alert/asleep/unconscious creature is a no-op. This is the "safety net" that makes `creatureDoneTo.cos`'s blanket `zomb 0` harmless when the creature was never zombied in the first place.

A creature stays zombied indefinitely. There is no timeout, no chemical, no instinct, no environmental trigger that releases zombie state automatically. **Something must explicitly call `SetWhetherZombie(false)`** — either from the engine (the hand-holding flow) or from a CAOS script (`zomb 0`).

### Locked transitions

While `myState == zombieState`, the engine refuses to change to most other states. The following all early-return when called on a zombie:

| Setter | Behaviour while zombied |
|--------|-------------------------|
| `SetWhetherUnconscious(true/false)` | No-op |
| `SetWhetherAlert(true/false)` | No-op |
| `SetWhetherAsleep(true/false)` | No-op |
| `SetWhetherDreaming(true/false)` | No-op |
| `SetWhetherDead(true)` | **Allowed** — death overrides zombie |

So a zombie cannot be put to sleep, knocked unconscious, or returned to alert except via `SetWhetherZombie(false)`. The only state change a zombie can undergo besides un-zombifying is dying.

## Triggers in the Engine

Only one path in the engine itself zombifies a creature:

### Hand-holding with the pointer

```text
function StartHoldingHandsWithThePointer(...):
    if myIsHoldingHandsWithThePointer: return
    if not Life.GetWhetherAlert() or Life.GetWhetherZombie()
        or myMovementStatus == INVEHICLE: return

    myDoubleSpeedFlag = true
    myIsHoldingHandsWithThePointer = true
    SetWhetherZombie(true)    // ← zombify
    ...
```

When the player drags a creature with the mouse, the engine zombifies it so its own brain doesn't fight against the drag — without this, the creature's voluntary action system would constantly try to walk somewhere else. The matching release in `StopHoldingHandsWithThePointer` calls `SetWhetherZombie(false)` to restore alert state when the player drops the creature.

This is the **most common** way a creature gets zombified during normal gameplay, and it's the reason the un-zombify rule exists — a player release must safely un-zombify regardless of what happened in between.

## Triggers in Bootstrap CAOS Scripts

A `grep -i zomb "Bootstrap/001 World"` finds five files with eleven `zomb` calls. Four of them call `zomb 1` to drive a creature into zombie state; the fifth is a safety-net `zomb 0`. Each is documented below.

### 1. `Lifts.cos` — Lift platform rides

**Script `3 1 1 9`** (the lift's "summon" handler):

```caos
scrp 3 1 1 9
    lock
    setv va17 ov70
    inst
    doif ov80 = 0
        etch 4 2 0                    * for each creature on the platform
            inst
            doif targ <> null
                nohh                  * break any hand-holding first
                zomb 1                * ← zombify
                pose 80               * lift-riding pose
                dirn 1
                wait 4
                inst
                doif targ <> null
                    spas ownr targ    * snap creature onto the platform
                endi
                wait 2
                inst
                doif targ <> null
                    doif carr = null
                        zomb 0        * ← release if they're on the platform
                    endi
                endi
            endi
        next
        ...
    endi
```

**What it does:** When a player presses the call button, the lift iterates over every creature standing on its platform (`etch 4 2 0` — every agent of family 4 = creatures), calls `nohh` to break any pointer-hand-holding, then `zomb 1` to freeze them. After a brief `wait 4` for the snap-to-platform animation, it un-zombifies them with `zomb 0` (guarded by `carr = null` to avoid releasing a creature that's currently being held by something).

**Why:** The lift needs the creature to ride it — without zombifying, the creature's brain would happily decide to walk off the platform mid-ride. The `zomb 0` releases control once the creature is locked onto the moving platform.

A second `zomb 0` appears later in the same script at line 1048 inside the lift-arrived branch, walking `epas 4 0 0` (every creature in the lift's enum-pas list) and releasing them all once the platform comes to rest.

### 2. `gene pod.cos` — Gene splicer / cloning machine

The gene pod uses zombie state in two distinct flows.

**Script `3 3 32 2000`** (the splicing operation):

```caos
scrp 3 3 32 2000
    inst
    lock
    ...
    etch 4 2 0
        inst
        doif targ <> null
            zomb 1                    * ← zombify parent for splicing
            pose 80
            dirn 1
        endi
        wait 2
        ...
    next

    gpas 4 0 0 1                      * grab parents into the pod
    wait 2
    seta va99 null
    inst
    epas 4 0 0
        addv va77 1
        doif va77 = 1
            ...
            zomb 1                    * ← second parent stays zombied
            pose 0
            dirn 1
        endi
        doif va77 > 1
            ...
            zomb 0                    * ← extra parents released
            rpas ownr targ
        endi
    next
    seta ov99 va99
    etch 4 0 0
        doif carr = null
            ...
            zomb 0                    * ← cleanup: release any not carried
        endi
    next
```

**What it does:** Zombifies the parent creatures it's about to splice so they hold still through the long animation sequence (`anim [0 1 2 ... 19 0]` over four parts, then a `slow` and `over`). The first parent is kept zombied until the `mesg wrt+ va55 1010 ...` post-splicing message is sent; the rest are released as they're handed off.

**Script `3 3 32 1001`** (the reset / cancel handler):

```caos
scrp 3 3 32 1001
    rtar 3 3 18
    seta ov88 null
    seta ov89 null
    setv ov80 0
    ...
    epas 4 0 0
        setv va16 attr
        orrv va16 %000000011
        attr va16
        zomb 0                        * ← force-release every creature
    next
    dpas 0 0 0
endm
```

**Why:** This is the cleanup/abort path. If the splicing operation is cancelled, this walks every creature that was on the pod's enum-pas list and force-`zomb 0`s them to recover any leftover zombies. Because `SetWhetherZombie(false)` is a no-op on a non-zombie creature, this can safely fire on creatures that were never zombified.

### 3. `GUI 1.cos` — Creature import / teleport effect

**Script `1 2 13 1003`** (the per-norn import handler):

```caos
scrp 1 2 13 1003
    inst
    doif norn = null
        stop
    endi

    targ norn
    seta va87 targ
    zomb 1                            * ← zombify imported creature
    pray refr

    rtar 1 2 23
    doif targ <> null
        doif ov00 = va87 and ov02 = 1003
            setv ov12 1001
            mesg writ targ 256
        endi
    endi
    targ va87
    ...
    new: simp 1 1 43 "teleport" 9 11 5001
    ...
    snde "tele"
    anim [0 0 1 1 2 2 2 3 3 3 4 4 4 5 5 5 6 6 6]
    over
    anim [6 6 6 5 5 5 4 4 4 3 3 3 2 2 2 1 1 0 0]
    over
    inst
    seta va12 targ
    targ va87
    doif targ = null
        kill va12
        stop
    endi
    zomb 0                            * ← release after teleport effect
    ...
endm
```

**What it does:** When a creature is being imported into the world (PRAY / "teleport in" flow), this script zombifies the freshly-spawned norn, plays the two-phase teleport animation, then un-zombifies once the visual effect completes.

**Why:** The imported creature's brain comes online immediately, but the visual spawn-in effect needs the creature to remain still in its target pose. Zombifying ensures no decision-driven movement happens during the seven-frame teleport animation. The post-animation `targ = null` guard handles the case where the creature was destroyed mid-effect — important, because un-zombifying a `null` target would crash.

### 4. `creatureDoneTo.cos` — Pointer-release safety net

**Script `4 0 0 4`** (creature event 4, family-4 wildcard = applies to all creatures):

```caos
scrp 4 0 0 4
    doif from eq pntr
        zomb 0
    endi
endm
```

**What it does:** This is the only zombie-related script that **never calls `zomb 1`**. It only ever un-zombifies, and only when the message originator is the pointer.

**Why:** This is the script-side counterpart to the engine's `Creature.StopHoldingHandsWithThePointer` flow. When the player drops a creature, the engine fires script event 4 with `from = pntr`, and this handler ensures the zombie flag is cleared. It's a defence-in-depth measure — the engine release path also calls `SetWhetherZombie(false)`, so this script is essentially redundant unless a mod or alternate release path skipped the engine side. Because un-zombify is a no-op on non-zombied creatures, the unconditional `zomb 0` is safe.

### Summary table

| Script | Classifier | `zomb 1`? | `zomb 0`? | Trigger |
|--------|------------|-----------|-----------|---------|
| Lifts.cos | `3 1 1 9` | ✓ | ✓ | Riding a lift platform |
| gene pod.cos | `3 3 32 2000` | ✓ | ✓ | Gene splicing operation |
| gene pod.cos | `3 3 32 1001` | — | ✓ | Splicer cancel / cleanup |
| GUI 1.cos | `1 2 13 1003` | ✓ | ✓ | PRAY-import teleport effect |
| creatureDoneTo.cos | `4 0 0 4` | — | ✓ | Pointer release (safety net) |

In addition, the engine zombifies creatures during pointer hand-holding (`StartHoldingHandsWithThePointer`) and the CAOS `ZOMB` command can be fired from any user script.

## Common Failure Modes

A creature stuck permanently in zombie state is almost always caused by one of the four script flows above completing the `zomb 1` half but not reaching the matching `zomb 0`. Typical causes:

1. **Mid-script destruction:** the creature is `kill`-ed (or otherwise removed) between `zomb 1` and `zomb 0`. The `targ = null` guards in `GUI 1.cos` and the gene-pod scripts handle this case explicitly; older or modded scripts may not.
2. **`carr <> null` skip in Lifts.cos:** the inline `doif carr = null` guard at line 945 means a creature carried by another agent at the un-zombify check will *not* be released. If the creature later stops being carried while still zombied, only the second `epas 4 0 0` cleanup at line 1046 (which fires on lift arrival) will recover them. If the lift never finishes its journey, the zombie state persists.
3. **`etch`/`epas` enumerating different sets:** the lift and gene-pod scripts enumerate creatures twice — once to zombify, once to release. If a creature enters the platform after the zombify pass but before the release pass, it won't be released. Conversely, if a creature leaves between passes, it'll be zombified but never released by *this* script (the `creatureDoneTo.cos` safety net only catches pointer-release, not lift-departure).
4. **Engine `StopScriptExecuting()` killing the script before `zomb 0`:** because `SetState()` calls `StopScriptExecuting()` on the way *into* zombie, a `zomb 1` immediately followed by another state-change attempt could interrupt the calling script. The bootstrap scripts use `inst`/`lock` to prevent this, but custom scripts that omit `lock` are vulnerable.

The `Creature_Stuck_On_Lift_Wait_Inhibition.md` investigation note in the project root is tracking exactly this class of bug for the lift flow.

## Implementation References

### Web rebuild (JavaScript)

- **State enum:** `Rebuild/Main_Game/src/engine/creature/faculties/LifeFaculty.js:33-40` (`LifeState_Enum.ZOMBIE = 0`)
- **Zombie setter:** `Rebuild/Main_Game/src/engine/creature/faculties/LifeFaculty.js:621-627`
- **Zombie getter:** `Rebuild/Main_Game/src/engine/creature/faculties/LifeFaculty.js:595`
- **CAOS command:** `Rebuild/Main_Game/src/engine/caos/commands/creatures/ZOMB.js`

### Bootstrap CAOS scripts

- `Rebuild/Assets/Bootstrap/001 World/Lifts.cos` (lines 925-1052, script `3 1 1 9`)
- `Rebuild/Assets/Bootstrap/001 World/gene pod.cos` (script `3 3 32 2000`, lines 80-193; script `3 3 32 1001`, lines 214-234)
- `Rebuild/Assets/Bootstrap/001 World/GUI 1.cos` (script `1 2 13 1003`, lines 1838-1934)
- `Rebuild/Assets/Bootstrap/001 World/creatureDoneTo.cos` (script `4 0 0 4`, lines 7-11)

## See Also

- [Creature Sleep](creature-sleep.md) — the `asleepState` / `dreamingState` flow
- [Age and Lifecycle](age-and-lifecycle.md) — the full life-state machine including death
- [Creature Faculties](creature-faculties.md) — overview of LifeFaculty and the other faculty subsystems
- [Motor Faculty](motor-faculty.md) — what zombie state disables in the motor pipeline
