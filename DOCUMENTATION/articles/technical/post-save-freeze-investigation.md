# Save-then-Quit Freeze Investigation (original engine hangs during shutdown teardown of a JS-authored world)

**Status: FIXED & VERIFIED (2026-05-18).** Root cause was a JS
`AgentHandle`-vs-raw-agent identity mismatch in `Agent.detachFloatingWith()` /
`Agent.breakLinksToOtherAgents()` that left stale handles in partners'
`myFloatees`. Fixed in `Main_Game/src/engine/agents/Agent.js` (resolver +
both teardown paths + a write-side backstop). Verified: re-saving the buggy
`jssave` through the fixed engine drops the broken floatee — creature #1236
`myFloatees` goes `[BROKEN,#980] → [#980]`, `FATAL=0 DANGLE=0`, matching the
clean `cppworld` control (`diag-floatees-fix-verify.js`). Regenerate `jssave`
from the running JS engine to confirm the original-engine save-then-quit no
longer hangs.

**Trigger:** **save-then-quit** (user-confirmed).
The save completes fully (valid file); the freeze is in the original engine's
quit teardown: the application shutdown deletes the world, the world destructor
kills all agents, each agent is trashed, and that trashing breaks links to
other agents. There, the floatee-draining loop (`while(!myFloatees.empty())`)
spins forever because JS-authored `jssave` contains a creature (`#1236`,
*hope*) whose `myFloatees` holds a **stale/broken `AgentHandle`** that is not
back-linked. Root cause: **JS does not maintain the
`myFloatees`/`myFloatingWith` bidirectional invariant on agent teardown/detach
the way the original engine does**, so dead floatee handles accumulate and get
serialized. The clean `cppworld` control, produced by the original engine, has
zero such entries.
**Date:** 2026-05-18
**Related:** `MotorFaculty_NUMINVOL_mismatch.md`, the `NUMINVOL` section of the
engine-deviations document (`DOCUMENTATION/Tech/differences-from-original.md`).

> **Revision note.** Draft 1 hypothesized a *post-save* loop in normal
> simulation (`TaskSwitcher`), save coincidental — disproved (the world runs
> indefinitely without saving). Draft 2 localized it to the save serialization
> traversal — disproved (the original-engine save file is provably complete &
> finalized). Current: user confirmed the trigger is **save-then-quit**, and the
> freeze is in the **original engine's quit shutdown teardown** of the
> JS-authored agent graph.

## Symptom

After the MotorFaculty `latency` byte-serialization fix, the original
instant-death / involuntary-flinch bug is resolved: the JS-authored world
`Assets/My Worlds/jssave/TheWorldAndEverythingInIt` loads in the original
Creatures 3 / Docking Station engine and the creatures live correctly.

A **new** problem then appears: when the user **saves and then quits** the
original engine, it writes the save file and then hangs (stops responding)
during quit. The save output produced by the original engine is captured at
`Assets/My Worlds/jssave_cpp/TheWorldAndEverythingInIt`.

## Decisive experiments

Two experiments pin the cause to the **save operation itself**:

1. **Run-without-save in the original engine (user).** Loading `jssave` in the
   original engine and letting it run for any duration — 30 seconds or 10
   minutes — **never freezes**. The world simulates indefinitely. The freeze
   appears **only** on **save-then-quit** (user-confirmed trigger), and
   **every** save-then-quit triggers it, regardless of how long the world ran
   first. ⇒ deterministic, not time/tick dependent, and tied to the *quit
   teardown* that only a save-then-quit reaches (see "Confirmed: … shutdown
   teardown").

2. **JS re-serialization (harness `diag-jssave-resave.js`).** The JS engine
   loads the *identical* `jssave` and re-serializes it via `World.save()` in
   **~1.0 s with no hang**, producing a valid ~1.04 MB archive. ⇒ the
   object/FloatRef graph in `jssave` is *not* a universal serialization cycle
   (a generic serializer walks it fine). The loop is **specific to the original
   engine's serialization traversal**.

## The original-engine save file is complete — the loop is NOT in serialization

A natural hypothesis: if the loop were inside the world write routine, the
archive would be truncated. This was tested rigorously and **disproved — the
file is complete and fully finalized**, by three independent proofs:

1. **Valid `CreaturesArchive` EOF markers.** The original engine writes the EOF
   markers (`0x1A 0x04`) only in the archive *finalization* (compress + flush)
   that runs **after the world write routine returns**. The JS loader verifies
   them and throws if absent. It does not throw for `jssave_cpp` ⇒ the world
   write completed and the archive was finalized.
2. **Directory proves the world save finished entirely.** The world save
   routine does: backup `real → .bak`, write `.tmp`, delete the real file,
   move `.tmp → real`. In `Assets/My Worlds/jssave_cpp/`:
   `TheWorldAndEverythingInIt` (1,099,872 B, renamed from `.tmp` — **no
   leftover `.tmp`**), `TheWorldAndEverythingInIt.bak` (1,062,189 B = the
   input size — the pre-write backup), and `Basement/ClimbingOutOfTheBasement`
   were all produced. A serialization freeze would stop before the rename,
   leaving a `.tmp` and no `.bak`.
3. **JS consumes the whole stream.** `World.read` reaches the decompressed
   end (final position == decompressed length, 16 trailing zero-pad bytes —
   comparable to the known-complete `cppworld` control's 6), no early stop,
   no error. Frame-balanced (8053/8053 OBST/OBEN). (Harness:
   `diag-archive-end.js`.)

The differing end *content* (`jssave_cpp` ends near `c3_splash.blk`,
`cppworld` near `norn3.0.blk`+camera data) is just different ecosystem /
background content after runtime evolution — all fully consumed and
EOF-terminated, not truncation.

Combined with: the world write routine takes the archive by reference and
performs no agent/world-state mutation (storing the length of play only
touches the `myLastPlayLength` time field), and JS re-serializes the same data
in ~1 s without hanging (experiment 2):

**The infinite loop is NOT in the serialization.** The world write ran to
completion and produced a valid, finalized, renamed file. The freeze occurs
**strictly after the world save fully succeeds.** It is also not sim-state
corruption by the save (the save mutates no sim state and the simulation
never loops on its own — experiment 1), and not a JS-reproducible loop.

## The original-engine save path (what actually runs)

The world save routine is invoked from the per-tick main loop. On a tick where
a save is pending, the main loop calls the world save and clears the pending
flag:

```text
if (saveNextTick) { world.Save(); saveNextTick = false }
```

The world save routine:

```text
GetLocalTime(gameEndTime)
StoreLengthOfPlay()                  // only touches myLastPlayLength
// backup juggling: delete .bak; move real -> .bak
open temp file (out, binary)
archive = CreaturesArchive(file, Save)
Write(archive)                       // <<< the whole-world serialization traversal
// archive + file destructors finalize/flush at end of scope
delete real; move temp -> real
return true
```

The world write routine serializes, in order: password, music event,
`Scriptorium`, `Map`, season/time fields,
`mySelectedCreature`, `myBirthdayAgent`, `myCountDownClock`, `myGameVars`,
`myLoadedBootstrapFolders`, `myGameEndTime`, `myLastPlayLength`,
`myMessageQueue`, `myLastPixelFormat`, `myFilesForAtticDelayed`,
`myFilesForAtticNextTime`, `myFilesJustCreated`, `myFilesInThePorch`,
`myUniqueIdentifier`, `myHistoryStore`, the agent manager, the main view, and
`myTints` — all through `CreaturesArchive`, whose
**positional FloatRef registry** (`WriteFloatRefTarget` assigns sequential
ids in `myFloatMap`; `WriteFloatRef` looks them up) is the same machinery
implicated in the prior `latency` byte bug.

The loop is somewhere in this traversal (or in the archive/file
finalization at end of scope). It is exercised only on **Write**; the
in-memory pointers the same structures expose work fine every tick during
normal simulation (experiment 1), which is why only saving triggers it.

## Confirmed: the freeze is in the original engine's quit shutdown teardown

The user confirmed the trigger is **save-then-quit**. The matching flow in the
per-tick main loop: on the saving tick the world save completes and writes a
valid file, and on the quitting tick the application begins terminating into
shutdown:

```text
if (saveNextTick) { world.Save(); saveNextTick = false }   // completes; writes valid file
if (quitNextTick) { SignalTerminateApplication(); ... }    // quit path → shutdown
```

The terminate signal leads to the application shutdown routine:

```text
mainView.ShutDown()
delete prayManager / musicManager / musicSoundManager / soundManager / progressBar
delete world                          // → world destructor
SharedGallery.DestroyGalleries()
```

The world destructor calls **kill-all-agents** on the agent manager. That
routine iterates the agent list (a bounded `for`), calling kill-agent →
`agent.Trash()` on every one of the ~929 JS-authored agents, then the per-agent
destructors run (agent, creature, compound-agent, …).

This whole teardown runs **only on quit**. It never runs during normal play
(why a 10-minute no-save run is fine) and is entirely separate from the save
(why the save file is complete). The kill-all-agents / kill-agent routines
themselves are bounded loops, so the non-terminating loop is inside an agent
**`Trash()` or destructor** walking a per-agent structure of a JS-authored
agent — a graph a world produced by the original engine never creates.

This explains every observation: deterministic, save-then-quit only, after a
provably-complete save, not reproducible by JS (JS never runs the
original-engine destructor graph), and not visible in static payload checks
that passed (history/brain/biochem/frames were all healthy — the defect is in a
teardown-walked *relationship*).

## Confirmed root cause: stale `myFloatees` entry (the floating-with invariant)

`Agent.Trash()` calls the break-links-to-other-agents routine, which does:

```text
ports.KillAllConnections()                    // ruled out: jssave & cppworld both 0 connections
... drop carrier / carried ...
DetachFloatingWith()
while (not myFloatees.empty()) {
    if (myFloatees[0].IsValid())
        myFloatees[0].GetAgentReference().DetachFloatingWith()
    else
        myFloatees.erase(begin)
}
// DetachFloatingWith: if (myFloatingWith.IsValid()) {
//   myFloatingWith.myFloatees.erase(remove(... == self)); myFloatingWith = NULL }
```

`myFloatees[0].DetachFloatingWith()` only removes `[0]` from *this* agent's
`myFloatees` when `myFloatees[0].myFloatingWith == this`. If a floatee is
`IsValid()` but its `myFloatingWith` is not this agent (NULL / other), `[0]`
is never removed and the `while` spins forever.

**Harness evidence** (`diag-floatees-symmetry.js`, `diag-floatees-dump.js`):

| | jssave (freezes) | cppworld (clean control) |
|---|---|---|
| floatee-bearing agents | 3 | 3 |
| total floatees | **4** | 3 |
| broken/asymmetric | **1** (agent `#1236`) | 0 |

Every floatee-bearing agent in the healthy `cppworld` has exactly **one**
perfectly back-linked floatee. In `jssave`, **creature `#1236` (hope)** has
`myFloatees = [ AgentHandle(_agent=null/broken), AgentHandle(#980) ]` — a
**stale, non-back-linked handle in slot 0**. (`#980` itself is fine:
`#980.myFloatingWith == #1236`.) The original engine's teardown loop hits the
broken slot-0 handle first and cannot drain it ⇒ infinite loop at quit.

**JS root cause.** The original engine keeps the bidirectional `myFloatees` ↔
`myFloatingWith` invariant continuously: whenever an agent detaches or is
torn down, `DetachFloatingWith()` erases it from its partner's `myFloatees`.
**JS has no equivalent runtime maintenance** — when an agent that was
floating-with another is removed/garbaged, JS leaves a dead `AgentHandle` in
the partner's `myFloatees`. JS's only pruning is the load-time filter in
`Agent.resolveAgentReferences` (`!floatee.myGarbaged`), which does not run at
write time, so the stale handle is serialized: `Agent.write` emits
`writeUint32(myFloatees.length)` (count includes the dead entry) and
`writeAgentHandle(null)` for it. Same recurring project pattern: a JS
bidirectional-relationship maintenance gap, invisible at JS runtime, fatal in
one specific traversal in the original engine.

## Recommended fix (align JS with the original engine)

Maintain the floating-with invariant in JS the way the original engine does,
rather than patching the serializer:

1. **Primary (original-engine-aligned):** when an agent is removed/garbaged/
   detached, remove it from its partner's `myFloatees` (mirror the original
   engine's `DetachFloatingWith` / break-links-to-other-agents behaviour). This
   keeps `myFloatees` clean at runtime so nothing stale is ever serialized.
2. **Defensive backstop at the serialization boundary:** in `Agent.write`,
   write only floatees that resolve to a live agent whose `myFloatingWith`
   resolves back to this agent, and write the filtered count — guaranteeing
   the original engine never receives an asymmetric `myFloatees` even if (1)
   misses an edge case. (Matches the invariant the original engine's teardown
   assumes.)

Then regenerate `jssave` and confirm save-then-quit in the original engine no
longer hangs (`diag-floatees-symmetry.js` should report `FATAL=0 DANGLE=0` like
`cppworld`).

## Harnesses

`Main_Game/Test/MapBootstrapAlignment/`:

| Harness | Purpose |
|---|---|
| `diag-jssave-resave.js` | Forks a worker that loads `jssave` and calls `World.save()`; parent watchdog kills it after 90 s. Result: JS completes in ~1 s — the freeze does **not** reproduce in JS. |
| `diag-archive-frame.js` | OBST/OBEN frame balance + truncation check (jssave / jssave_cpp / cppworld all balanced). |
| `diag-archive-end.js` | End-of-archive completeness: EOF markers accepted, logical end vs final read position, full-consume — proves `jssave_cpp` is complete & finalized (the world write ran to completion). |
| `diag-resave-freeze3.js` | History / Scriptorium / map / brain / biochem tail-subsystem dump (all healthy). |
| `diag-resave-runtime.js` | Pathological-numeric, timer, creature VM/instinct/motor scan (all normal vs control). |
| `diag-resave-freeze.js`, `diag-resave-freeze2.js` | Agent inventory, carry-cycle / dangling-ref / moniker-dup checks (clean). |
| `diag-port-symmetry.js` | OutputPort↔InputPort symmetry vs the original engine's `KillAllConnections` loop. Result: 0 connections in both — ports **ruled out**. |
| `diag-floatees-symmetry.js` | `myFloatees`↔`myFloatingWith` symmetry vs the original engine's break-links-to-other-agents loop. Result: jssave has 1 broken floatee (agent #1236), cppworld 0 — **the root cause**. |
| `diag-floatees-dump.js` | Raw dump of every floatee/floatingWith ref: shows `#1236` (hope) has `myFloatees=[broken, #980]` vs cppworld's clean single back-linked floatees. |

```bash
cd Rebuild
node Main_Game/Test/MapBootstrapAlignment/diag-jssave-resave.js          # ~1.5s, exits 0
node Main_Game/Test/MapBootstrapAlignment/diag-archive-frame.js 2>/tmp/af.txt 1>/dev/null
grep -nE "====|<<<|BALANCE|OBST=" /tmp/af.txt
```
