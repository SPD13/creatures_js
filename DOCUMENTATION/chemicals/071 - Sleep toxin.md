# 071 - Sleep toxin

Sleep toxin is chemical slot 71 in the Creatures 3 chemistry and is the second entry in the canonical **bacterial-toxin block** (chemicals 70-81), the range of chemicals that infectious bacteria can be rolled to inject into their host while actively infecting it. Its in-game role is the "sleeper agent" of the toxin block: rather than directly poisoning an organ or draining a metabolic reserve, Sleep toxin acts as a self-consuming **Sleepiness generator** — a single reaction in the standard genome steadily burns Sleep toxin down and emits the Sleepiness drive chemical (155) as a by-product, forcing the creature to feel the overwhelming urge to fall asleep whether it wants to or not. A heavily-dosed creature visibly slows, stops interacting, lies down and drops into the `asleepState` as soon as its Sleepiness drive saturates, and stays there for as long as the toxin keeps pumping Sleepiness faster than the creature's Sleepase / sleep-recovery pathway can clear it.

Unlike Glycotoxin (70), Sleep toxin has **no dedicated receptor and no dedicated antidote reaction** in the stock genome. Its effect is entirely mediated through the Sleepiness drive it produces: there is no `RLOCUS_INJURY` wire, no organ damage path, and no Arnica-style clearance reaction. Clearance is left to the toxin's own **Long** passive half-life of 1,513 ticks (decay rate 0.99954, ~50 seconds of real play per halving at 30 tps) and to the self-depleting stoichiometry of its one reaction, which consumes 1 net unit of Sleep toxin per activation. Sleep toxin is therefore *not* named in the General Cure potion's documented toxin list — a Sleep-toxin-poisoned creature has to sleep it off, either by waking naturally once the Sleepiness drive falls below its reduction threshold or by the player pulling the creature out of the bacterium's range so the incoming dose stops.

The primary stock-game delivery vector is the **bacterium agent family** (family/genus/species 2 32 23 in `bacteria.cos`), which rolls a random toxin from the 70-81 range into OV16 for each bacterium and then injects `ov17` (0.005-0.050) units of OV16 per tick into its host while actively infecting. When OV16 = 71 the bacterium becomes a Sleep-toxin carrier, and a chronic infection will therefore *sedate* the host — keeping the creature asleep or nearly-asleep for long stretches, which in turn blocks most other behaviour (eating, drinking, socialising, learning) because the creature is physically unconscious. A persistent Sleep-toxin infection is therefore as much a *behavioural* attack as a chemical one: the creature becomes useless to the player and to the ecosystem until the immune system (antibodies 102-109 against the matching antigen 82-89) finally suppresses the bacterium.

## Sources

| # | Mechanism | Gene / Origin | Trigger / Formula | Notes |
|---|-----------|---------------|-------------------|-------|
| 1 | **No endogenous production** — no emitter and no synthesising reaction in the standard genome | — | — | A healthy creature is born with Sleep toxin = 0. There is no metabolic pathway that generates chemical 71 from anything the body already makes. All Sleep toxin in a bloodstream must come from an external source. Note in particular that the creature's own Sleepiness drive (155) is produced by the Sleepiness-backup system (reactions 20 and 22 from chemicals 137/138), not by any endogenous Sleep toxin |
| 2 | **Bacterial infection** (primary stock-game source) | `bacteria.cos` (family/genus/species `2 32 23`), OV16 | Every timer tick while the bacterium is active (not dormant), inject `ov17` (0.005-0.050) units of `ov16` into the host | OV16 is rolled per-bacterium and may take any value in 70-81; when OV16 = 71 the bacterium is a Sleep-toxin carrier. The bacterium's entry in `DOCUMENTATION/caos_scripts/bacteria.md` lists Sleep toxin under its canonical effect "Causes drowsiness". A single chronic infection will dose the host with 0.005-0.050 Sleep toxin every tick until antibodies 102-109 suppress it or the host is removed from the bacterium's range |
| 3 | **Bacterial-toxin themed agents** (hostile foods, poisoned spores, community disease packs) | User-made `.agents` / `.cob` files | `CHEM TARG 71 <amount>` on bite, touch or spore-emission events | Sleep toxin is a natural choice for community authors who want to ship a "sleeping-draught" food or a sedative-loaded trap without spawning a full bacterium agent. Because the stock genome has no specific antidote reaction, a one-shot dose reliably sedates any Norn / Grendel / Ettin regardless of species-specific genome variation |
| 4 | **CAOS injection** | — | `CHEM TARG 71 <amount>` from scripts or the debug console | The route used for testing the Sleepiness conversion reaction and for quickly driving a test creature into the `asleepState`. Because the half-life is Long (1,513 ticks) a small injected dose remains visible in the chemistry panel for roughly a minute of real play before passive decay alone clears it, and the reaction continues to pump Sleepiness the whole time |

Sleep toxin thus follows the toxin-block pattern of **"no endogenous source, external delivery only"**. Unlike Glycotoxin it is *not* listed in the General Cure potion's toxin coverage, so there is no specific pharmacological clearance path — recovery depends on passive decay plus the reaction's own self-consumption and, for a chronic infection, on the immune system shutting the bacterium down.

## Usage

| # | Mechanism | Gene | Organ / Tissue | Locus / Reaction | Threshold | Nominal | Gain | Flags | Effect |
|---|-----------|------|----------------|-------------------|-----------|---------|------|-------|--------|
| 1 | **Sleepiness-generator reaction** (the sole effect pathway) | 83 (reaction 82, Baby onwards) | Reaction / Somatic | `4× Sleep toxin [71] → 3× Sleep toxin [71] + 2× Sleepiness [155]`, half-life 24 ticks ("Short", decay rate 0.971) | — | — | — | — | The only hostile reaction wired to Sleep toxin in the standard genome. Net stoichiometry per activation is **−1 Sleep toxin, +2 Sleepiness**. Sleep toxin slowly consumes itself while driving the Sleepiness drive (chemical 155, locus 7 via emitter 8, gain 211) toward saturation. The fast half-life (24 ticks, Short) means the reaction fires rapidly — a moderate Sleep-toxin dose begins producing Sleepiness within a second of appearing in the bloodstream, and a heavy dose will saturate the Sleepiness drive in seconds |
| 2 | **No receptor** | — | — | — | — | — | — | — | Sleep toxin has **no direct receptor** in the standard genome. It cannot injure an organ, suppress a drive, trigger a behavioural impulse, or modulate brain chemistry directly. Its entire influence on the creature is funnelled through the Sleepiness drive produced by reaction 82 |
| 3 | **No dedicated antidote reaction** | — | — | — | — | — | — | — | In contrast to Glycotoxin's Arnica reaction (89) or Cyanide's Sodium-thiosulphite reaction, Sleep toxin has **no Arnica-consuming, no herbal, no pharmaceutical clearance reaction** in the stock genome. The only way chemical 71 leaves the bloodstream is (a) the self-depleting stoichiometry of reaction 82 and (b) passive decay |
| 4 | **Passive decay** | — | — | Half-life **1,513 ticks** ("Long", decay rate 0.99954) | — | — | — | — | The primary fallback clearance pathway. ~50 seconds of real play time per halving at 30 tps. Noticeably faster than Glycotoxin's 3,686-tick half-life, reflecting the design intent that Sleep toxin should be a *temporary* sedative rather than a permanent debuff: once the incoming dose stops (the bacterium goes dormant or the creature is moved away) the creature will naturally wake within a minute or two even without any specific antidote |
| 5 | **Not listed in General Cure** | Materia Medica / community pharma | — | — | — | — | — | — | Sleep toxin is absent from the General Cure potion's documented toxin list (*"Histamine A & B, cyanide, carbon monoxide, ATP decoupler, heavy metals and glycotoxin"*) and from the stock antidote reactions. Players have no pharmaceutical lever on Sleep toxin — the cure is to remove the source (bacterium) and wait |

The usage table describes a **"self-consuming sedative"** toxin: one fast reaction that converts the toxin one-to-one into the Sleepiness drive, no organ damage, no receptor wire, no antidote, and a moderate passive half-life that gives untreated exposures time to clear on their own once the source is removed.

## Role in Game Mechanics

### The Sleepiness-generator reaction: slow self-consumption, fast drive output

Reaction 82 is the **only** standard-genome reaction that touches Sleep toxin. Its formula is deliberately constructed as a *catalytic-looking* self-consumption:

```
4× Sleep toxin → 3× Sleep toxin + 2× Sleepiness
```

The net per-activation change is **−1 Sleep toxin, +2 Sleepiness**. Viewed as a rate law the reaction behaves like a 4th-order self-consumption in Sleep toxin — it only fires significantly when Sleep toxin concentration is high, which gives the chemical a *thresholded* feel: small trace doses fizzle out without producing much Sleepiness, but a moderate or heavy dose rips itself apart in seconds while pumping the Sleepiness drive hard.

The Short half-life (24 ticks, decay rate 0.971) is the same speed used by the Glycotoxin raid reaction and by most of the genome's offensive toxin pathways. This makes the Sleepiness output *responsive*: the player (or the bacterium) cannot dose a creature with Sleep toxin and see it take minutes to activate — the effect is within seconds, matching the gameplay expectation that a "sleep toxin" should produce visible drowsiness quickly.

The critical mechanical subtlety is that the reaction produces Sleepiness at a **2:1 ratio against the Sleep toxin consumed**. This amplification means even a modest dose (say, 0.5 units of Sleep toxin) can eventually produce up to ~1.0 unit of Sleepiness before the toxin decays — more than enough to drive the Sleepiness drive over its activation threshold and push the creature into sleep. A chronic infection that keeps injecting 0.005-0.050 Sleep toxin per tick will therefore keep the Sleepiness drive pegged near saturation for as long as the infection lasts.

### How Sleepiness actually puts the creature to sleep

Sleepiness (chemical 155) is not a passive sensation — it is a **drive chemical** with a dedicated emitter (gene 8, emitter id 8, gain 211 into the Drives tissue, locus 7). When Sleepiness exceeds the drive's reduction threshold, the creature's decision-making system (IT/DecisionLayer, not covered here) treats "fall asleep" as a high-priority action, and the creature's Life faculty transitions its `myState` to `asleepState`. While in `asleepState`:

- The creature's pose is a sleeping pose (eyes closed, body laid down).
- Voluntary behaviour is suppressed — the creature will not walk, eat, drink, or socialise.
- The `GetWhetherAsleep()` predicate returns true (driven by the LifeFaculty's life-state), which other game systems use to gate interactions.
- The creature's metabolic chemistry still runs (reactions continue, toxins continue to decay) but its behavioural output is effectively paused until the Sleepiness drive falls below threshold or an external wake event is received.

Reaction 82 is therefore not *directly* a sedative — it is a **Sleepiness-driver**, and the Sleepiness drive is what actually changes `myState` to `asleepState` through the ordinary drive-resolution pathway. The upshot is the same: a creature with high Sleep toxin is a creature with high Sleepiness, and a creature with saturated Sleepiness lies down and sleeps.

### Why there is no antidote: the drive-system IS the cure

The stock genome does not need an antidote reaction for Sleep toxin because the **Sleepiness drive clears itself**. Specifically:

- Reaction 24 (`1× Sleepiness [155] → 1× Sleepiness backup [138]`, half-life 30 ticks "Short") takes circulating Sleepiness out of the drive and parks it in the Sleepiness-backup reservoir whenever the drive is not being driven harder than this clearance reaction.
- Sleepase (chemical 129) and the Sleepiness-backup → Sleepiness conversion (reactions 21-22) form a separate sleep/wake cycle that is independent of Sleep toxin.

As long as Sleep toxin is not actively pumping new Sleepiness into the blood faster than reaction 24 can pull it back out, the Sleepiness drive will fall below its activation threshold within a few seconds and the creature will wake naturally. Once the Sleep toxin itself has decayed (Long half-life, 1,513 ticks) or been consumed by reaction 82, the creature is fully recovered without any pharmacological intervention.

This also explains why Sleep toxin is absent from the General Cure potion's toxin list: the toxin doesn't damage organs and doesn't lock up any irreversible locus — it just nudges an already-cyclical drive system until the input stops, then the drive system self-resets.

### Interaction with the bacterial infection system

Sleep toxin's primary stock-game vector is the bacterium agent (`bacteria.cos`), documented in detail at `DOCUMENTATION/caos_scripts/bacteria.md`. Each bacterium, when spawned, rolls a random toxin ID into OV16 from the range 70-81. When a bacterium lands on OV16 = 71 it becomes a Sleep-toxin carrier and, while actively infecting a host, injects 0.005-0.050 units of Sleep toxin into the host's bloodstream every tick.

Because reaction 82's Short half-life (24 ticks) is *much* faster than Sleep toxin's own decay (1,513 ticks), a chronic infection reaches a quasi-steady-state where:

1. Bacterium injects `ov17` Sleep toxin per tick.
2. Reaction 82 consumes 1 Sleep toxin per activation at decay rate 0.971, producing 2 Sleepiness.
3. Sleepiness drive clearance (reaction 24) removes Sleepiness at decay rate 0.977.
4. The creature's Sleepiness drive sits high enough to keep `myState = asleepState` for most of the infection.

The clinical profile of a Sleep-toxin infection is therefore **chronic somnolence**: the creature sleeps, wakes briefly when the bacterium goes dormant against an antibody surge, then goes back to sleep when the bacterium resumes. Because asleep creatures don't eat or drink, a prolonged infection can indirectly cause starvation or dehydration — the behavioural side-effects, not the toxin itself, are the lasting danger.

The immune system response runs in parallel: each bacterium injects a matching antigen (chemicals 82-89) which triggers antibody production (chemicals 102-109). Once antibody concentration exceeds the bacterium's dormancy threshold, the bacterium goes dormant and stops injecting Sleep toxin. The creature then wakes as the Sleepiness drive falls, and any remaining Sleep toxin in the bloodstream decays passively over the next ~50 seconds per halving.

### Diagnostic visibility

The Medical Scanner and Medical Pod agents surface all of the bacterial toxin block (70-81) in their chemistry panels, so Sleep toxin is a *named, detectable* chemical in the stock diagnostics. The visible clinical signs are distinctive enough that an attentive player can often diagnose Sleep toxin before docking the creature:

- The creature falls asleep repeatedly for no clear environmental reason (not dark, not explicitly prompted).
- The creature's Sleepiness drive reads high even when it has recently woken.
- The chemistry panel shows Sleep toxin > 0 alongside elevated Sleepiness.
- A bacterium sprite is often nearby or attached (the infection source).

Unlike Glycotoxin there is no secondary chill / Coldness signal to triangulate against — Sleep toxin's signature is purely "creature won't stay awake".

### Strategic / gameplay implications

- **Behavioural denial, not organ damage**: Sleep toxin is distinctive in the 70-81 block for causing **no organ injury at all**. A creature can survive a long Sleep toxin infection with its somatic organs intact; the cost is the opportunity cost of a creature that sleeps through the day rather than learning, eating and breeding.
- **No pharmacological cure required**: unlike Glycotoxin or Cyanide, there is nothing the player can feed or inject to clear Sleep toxin faster. The correct intervention is to **remove the source** — either physically relocate the creature away from the bacterium or destroy the bacterium agent — and then let passive decay plus reaction 82 self-consumption clear the toxin.
- **Starvation risk in chronic infections**: because sleeping creatures don't eat or drink, a Sleep-toxin infection lasting many in-game minutes can cause the creature to die of Starvation (chemical 197) or Need for Pleasure collapse indirectly, long after the toxin itself has stopped being the acute problem. The player should monitor Hunger and hand-feed an affected creature between its waking windows.
- **The Sleepiness drive is the real effector**: understanding Sleep toxin requires understanding the Sleepiness drive. A genome that re-tunes emitter 8's gain, or the Sleepiness → Sleepiness-backup clearance reaction, would change Sleep toxin's severity without touching chemical 71 at all.
- **Community modders' "mercy sedative"**: Because Sleep toxin has no receptor and no organ-injury path, it is the safest chemical in the 70-81 block for community authors to use as a *non-lethal* sedative ingredient — e.g. a sleeping-berry food, a calming spray, a vet-pod restraint. A creature can be dosed with a large amount of Sleep toxin to get it to sit still for manipulation without permanent harm.

## Summary

Sleep toxin is the second entry in the bacterial-toxin block (70-81) and the block's distinctive "behavioural-denial" toxin. It is defined by a single reaction in the standard genome — `4× Sleep toxin → 3× Sleep toxin + 2× Sleepiness` (gene 83) — that self-consumes one unit of toxin per activation while producing two units of the Sleepiness drive (chemical 155), which in turn drives the creature's Life faculty into `asleepState` through the ordinary drive-resolution pathway. Unlike Glycotoxin it has no receptor, no organ-injury wire, and no dedicated antidote: the cure is to stop the incoming dose and let passive decay (Long, 1,513 ticks) plus the drive system's own clearance reactions restore the creature's wakefulness. Its stock-game delivery vector is the bacterium agent family in `bacteria.cos`, which rolls it as one of twelve possible infection toxins; a Sleep-toxin infection keeps the creature asleep for long stretches, which is more a *behavioural* attack than a chemical one — the creature doesn't die of Sleep toxin, but it may die of neglected Hunger or Thirst while it cannot stay awake long enough to tend to its own needs.
