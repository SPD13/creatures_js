# 072 - Fever toxin

Fever toxin is chemical slot 72 in the Creatures 3 chemistry and the third entry in the canonical **bacterial-toxin block** (chemicals 70-81), the range of chemicals that infectious bacteria can be rolled to inject into their host while actively infecting it. Its in-game role is to be the block's **pyrogenic** toxin: a single reaction in the standard genome consumes Fever toxin together with the creature's bodily [Water (033)](033%20-%20Water.md) to manufacture [Hotness (153)](../CreaturesData/biochemistry.json), the thermoregulation chemical that raises the creature's internal temperature, while a second pathway — a direct somatic-organ **RLOCUS_CLOCKRATE** receptor — simultaneously hijacks the affected organ's metabolic tick rate. A heavily-dosed creature visibly overheats, its somatic organ starts firing its reactions faster than normal, and it displays the classical fever signature documented in the [Ammonia (026)](026%20-%20Ammonia.md) doc as a "wired", fast-forward biochemistry: accelerated Glucose burn, elevated Hotness drive, and an overall organism running hotter and faster than homeostasis wants.

Unlike [Glycotoxin (070)](070%20-%20Glycotoxin.md), Fever toxin has **no dedicated Arnica-style antidote reaction** in the stock genome. Its effect is mediated through two mechanisms — the Hotness output of reaction 80 and the clockrate-distortion receptor 96 — both of which are passive in the sense that they simply respond to whatever Fever toxin concentration is in the bloodstream. Clearance is left to the toxin's own **Long** passive half-life of 3,024 ticks (decay rate 0.99977, ~100 seconds of real play per halving at 30 tps) and to the self-depleting stoichiometry of reaction 80, which consumes 1 unit of Fever toxin per activation and returns no toxin to the bloodstream. Fever toxin is therefore *not* named in the General Cure potion's documented toxin list — a Fever-toxin-poisoned creature has to sweat it out, either by letting the toxin decay naturally and the Hotness-dissipation pathway (reaction 81, `4× Hotness + 1× Water → 1× Air`) radiate the accumulated heat back out, or by the player pulling the creature out of the bacterium's range so that the incoming dose stops.

The primary stock-game delivery vector is the **bacterium agent family** (family/genus/species `2 32 23` in `bacteria.cos`), which rolls a random toxin from the 70-81 range into OV16 for each bacterium and then injects `ov17` (0.005-0.050) units of OV16 per tick into its host while actively infecting. When OV16 = 72 the bacterium becomes a Fever-toxin carrier, and the bacterium documentation (`DOCUMENTATION/caos_scripts/bacteria.md`) lists Fever toxin's canonical effect as **"Raises body temperature"**. A chronic Fever-toxin infection therefore presents as the classic feverish creature: high Hotness readings, a somatic organ ticking faster than it should, accelerated Glucose and Oxygen consumption, and the creature trying to shed heat by seeking cold environments or staying near water. Left untreated the accelerated metabolism eats through the creature's energy reserves far quicker than normal — so Fever toxin's long-term danger is **metabolic exhaustion** rather than direct organ injury.

## Sources

| # | Mechanism | Gene / Origin | Trigger / Formula | Notes |
|---|-----------|---------------|-------------------|-------|
| 1 | **No endogenous production** — no emitter and no synthesising reaction in the standard genome | — | — | A healthy creature is born with Fever toxin = 0. There is no metabolic pathway that generates chemical 72 from anything the body already makes. All Fever toxin in a bloodstream must come from an external source. In particular the creature's own Hotness (153) is produced by direct emitters responding to environmental CA temperature and by the Coldness↔Hotness cycle, *not* by any endogenous Fever toxin |
| 2 | **Bacterial infection** (primary stock-game source) | `bacteria.cos` (family/genus/species `2 32 23`), OV16 | Every timer tick while the bacterium is active (not dormant), inject `ov17` (0.005-0.050) units of `ov16` into the host | OV16 is rolled per-bacterium and may take any value in 70-81; when OV16 = 72 the bacterium is a Fever-toxin carrier. The bacterium's entry in `DOCUMENTATION/caos_scripts/bacteria.md` lists Fever toxin under its canonical effect "Raises body temperature". A single chronic infection will dose the host with 0.005-0.050 Fever toxin every tick until antibodies 102-109 suppress it or the host is removed from the bacterium's range |
| 3 | **Bacterial-toxin themed agents** (hostile foods, contaminated drinks, community disease packs) | User-made `.agents` / `.cob` files | `CHEM TARG 72 <amount>` on bite, touch or spore-emission events | Fever toxin is a natural choice for community authors who want to ship a "feverish meal" or a pyrogen-loaded trap without spawning a full bacterium agent. Because the stock genome has no specific antidote reaction, a one-shot dose reliably feverish-es any Norn / Grendel / Ettin regardless of species-specific genome variation |
| 4 | **CAOS injection** | — | `CHEM TARG 72 <amount>` from scripts or the debug console | The route used for testing reaction 80 and the clockrate receptor. Because the half-life is Long (3,024 ticks) a small injected dose remains visible in the chemistry panel for roughly 100 seconds of real play before passive decay alone clears it, and reaction 80 continues to convert the toxin into Hotness the entire time |

Fever toxin thus follows the toxin-block pattern of **"no endogenous source, external delivery only"**. Unlike Glycotoxin it is *not* listed in the General Cure potion's toxin coverage, so there is no specific pharmacological clearance path — recovery depends on passive decay, the Hotness-dissipation pathway, and, for a chronic infection, on the immune system shutting the bacterium down.

## Usage

| # | Mechanism | Gene | Organ / Tissue | Locus / Reaction | Threshold | Nominal | Gain | Flags | Effect |
|---|-----------|------|----------------|-------------------|-----------|---------|------|-------|--------|
| 1 | **Hotness-generator reaction** (primary effect pathway) | 80 (reaction 80, Baby onwards) | Reaction / Somatic | `1× Fever toxin [72] + 1× Water [33] → 8× Hotness [153]`, half-life 24 ticks ("Short", decay rate 0.971) | — | — | — | — | The main hostile reaction wired to Fever toxin in the standard genome. Net stoichiometry per activation is **−1 Fever toxin, −1 Water, +8 Hotness**. The 1:8 amplification means each unit of Fever toxin consumed pumps eight units of Hotness into the bloodstream — a very strong pyrogenic multiplier. The fast half-life (24 ticks, Short) means a moderate Fever-toxin dose begins generating Hotness within a second of appearing in the bloodstream, and a heavy dose will saturate the Hotness drive and its downstream clockrate receptor within seconds. Note the reaction also *consumes bodily Water*, so prolonged infection dehydrates the creature on top of overheating it |
| 2 | **Clockrate receptor** (direct secondary effect) | 145 (receptor 96, Baby onwards) | Organ / Somatic | `RLOCUS_CLOCKRATE` | 0 | 128 | 255 | REDUCE (invert) | The second and more subtle effect pathway. Each somatic organ has a clockrate locus that controls how many engine ticks elapse between its reactions firing; a REDUCE receptor with nominal 128 and gain 255 against Fever toxin means that as Fever toxin rises, the organ's clockrate period is driven downward — i.e. the organ fires its reactions **faster**. This is exactly the signature of fever as documented in the [Ammonia (026)](026%20-%20Ammonia.md) doc ("high Ammonia makes all the creature's organs tick faster… The organism is essentially pushed into a fever state"): Fever toxin reproduces that mechanism directly, one somatic organ at a time. The accelerated organ burns Glucose and Oxygen faster and emits its products at a higher rate, so the creature's whole biochemistry runs in fast-forward |
| 3 | **No dedicated antidote reaction** | — | — | — | — | — | — | — | In contrast to Glycotoxin's Arnica reaction (89) or Cyanide's Sodium-thiosulphite reaction, Fever toxin has **no Arnica-consuming, no herbal, no pharmaceutical clearance reaction** in the stock genome. The only way chemical 72 leaves the bloodstream is (a) the self-depleting stoichiometry of reaction 80 and (b) passive decay |
| 4 | **Passive decay** | — | — | Half-life **3,024 ticks** ("Long", decay rate 0.99977) | — | — | — | — | The primary fallback clearance pathway. ~100 seconds of real play time per halving at 30 tps. Slower than Sleep toxin's 1,513-tick half-life and slightly faster than Glycotoxin's 3,686-tick half-life, so Fever toxin sits in the middle of the block's passive-clearance spectrum. Untreated exposures take several minutes to fully clear once the source is removed |
| 5 | **Not listed in General Cure** | Materia Medica / community pharma | — | — | — | — | — | — | Fever toxin is absent from the General Cure potion's documented toxin list (*"Histamine A & B, cyanide, carbon monoxide, ATP decoupler, heavy metals and glycotoxin"*) and from the stock antidote reactions. Players have no pharmaceutical lever on Fever toxin — the cure is to remove the source (bacterium) and wait, ideally keeping the creature cool and hydrated while its biochemistry burns through the toxin |

The usage table describes a **"pyrogen with direct clockrate hijack"** toxin: one fast reaction that turns the toxin and bodily water into an 8× Hotness burst, one receptor that independently accelerates a somatic organ's metabolic tick rate, no antidote, and a Long passive half-life that gives untreated exposures a few minutes to clear on their own once the source is removed.

## Role in Game Mechanics

### The Hotness-generator reaction: 1:8 amplification into the thermoregulation system

Reaction 80 (gene 80) is the primary effect pathway and the one that gives Fever toxin its canonical "raises body temperature" signature:

```
1× Fever toxin + 1× Water → 8× Hotness
```

The 1:8 amplification factor is the largest product-ratio in any toxin reaction in the 70-81 block — a single unit of Fever toxin produces eight units of Hotness before it is consumed. Hotness (chemical 153) is the creature's **temperature drive** and feeds into the whole thermoregulation stack:

- Hotness drives the creature's "feel too hot" behavioural impulse, pushing it to seek cold rooms, splash water, shed heat.
- Hotness has a direct emitter into the LOC_INVOLUNTARY / SensoriMotor layer that produces sweating and other cooling reflexes.
- Hotness has its own RLOCUS_CLOCKRATE receptor (receptor 97, gain 192) that *additionally* accelerates organ metabolism when the creature overheats — compounding Fever toxin's direct clockrate effect.
- Hotness is cleared by reaction 81 (`4× Hotness + 1× Water → 1× Air`, half-life 24 ticks), the standard Hotness-dissipation pathway, so as long as the creature has Water to spare it can shed heat at a steady rate.

The Short half-life (24 ticks, decay rate 0.971) of reaction 80 is the same speed used by most of the genome's offensive toxin pathways. This makes the Hotness output *responsive*: the player (or the bacterium) cannot dose a creature with Fever toxin and see it take minutes to activate — the Hotness spike is within seconds, matching the gameplay expectation that a "fever toxin" should produce visible overheating quickly.

The critical mechanical subtlety is that reaction 80 **consumes the creature's bodily Water** (chemical 33). Water is a cross-cutting substrate used by respiration, urea synthesis, and Hotness dissipation itself (see [033 - Water.md](033%20-%20Water.md)). A chronic Fever-toxin infection therefore creates a **dehydration feedback loop**:

1. Fever toxin consumes Water to produce Hotness.
2. Hotness tries to clear itself via reaction 81, which *also* consumes Water.
3. The creature's Water pool falls, slowing both Hotness clearance and several other water-dependent pathways.
4. With Hotness clearance throttled, the creature gets hotter for longer per unit of Fever toxin injected.

The net effect is that the severity of a Fever-toxin infection scales with how well-hydrated the creature is: a Norn who has been drinking regularly rides out the fever comfortably, while a dehydrated creature compounds its problems with every dose.

### The clockrate receptor: direct metabolic acceleration, independent of Hotness

Receptor 96 (gene 145) is Fever toxin's second, more insidious effect. It wires Fever toxin directly into the somatic organ's **RLOCUS_CLOCKRATE** locus — the locus that controls how fast the organ ticks its reactions and emitters.

| Parameter | Value | Interpretation |
|-----------|-------|----------------|
| Organ | 2 (Organ) | Somatic organ of the creature |
| Tissue | 0 (Somatic) | Body-wide somatic tissue |
| Locus | 0 (RLOCUS_CLOCKRATE) | Organ metabolic tick rate |
| Threshold | 0 | Any Fever toxin concentration triggers |
| Nominal | 128 | Baseline clockrate value |
| Gain | 255 | Very strong — the largest possible gain |
| Flags | 1 (REDUCE / invert) | Signal is subtracted from the locus, i.e. Fever toxin drives clockrate *down* (faster organ) |

The combination of a REDUCE flag and a gain of 255 is the same signature the [Ammonia receptor (91)](026%20-%20Ammonia.md) uses to implement its own fever response. Both chemicals independently drive the clockrate period downward, making the somatic organ fire its reactions faster. When a creature is Fever-toxin-infected, its somatic organ's reactions — every reaction wired to Organ 2, which includes the bulk of its routine metabolism — run in fast-forward:

- Glucose is consumed faster (for ATP synthesis and respiration).
- Oxygen is consumed faster.
- CO₂, Urea, Lactate and other waste products accumulate faster.
- Emitters (including emitters producing drive chemicals) fire more often.

This is independent of the Hotness produced by reaction 80 — even if the creature's Hotness-dissipation pathway were running perfectly, the clockrate receptor would still be accelerating its metabolism directly. In practice the two mechanisms compound: Fever toxin directly accelerates the organ (receptor 96), and the Hotness that reaction 80 generates *also* accelerates the organ (receptor 97). A heavily-dosed creature therefore sees its biochemistry run at roughly double speed, burning through energy reserves in a fraction of the usual time.

### Why there is no antidote: the Hotness-dissipation pathway IS the partial cure

The stock genome does not provide a dedicated Fever-toxin antidote reaction, but the thermoregulation system partially cleans up after the toxin's downstream damage:

- **Reaction 81** (`4× Hotness + 1× Water → 1× Air`, Short half-life 24 ticks) consumes the Hotness produced by reaction 80, venting heat as Air. As long as the creature has Water this pathway clears Hotness at a steady rate, preventing the thermoregulation drive from saturating permanently.
- **Passive Fever-toxin decay** (Long half-life 3,024 ticks) runs in the background regardless.
- **Reaction 80's own self-depleting stoichiometry** removes 1 unit of Fever toxin per activation — the toxin eats itself as it produces Hotness.

What the stock genome does *not* provide is a way to clear the clockrate-receptor effect pharmacologically. As long as any Fever toxin remains in the bloodstream, receptor 96 keeps driving the somatic organ's clockrate down, regardless of how much Hotness the player manages to dissipate. This is why Fever toxin is absent from the General Cure's toxin list: the direct-acting receptor is not an organ-injury wire (so it does not accumulate lasting damage) but it is also not clearable by any antidote reactant — the only thing that removes it is the toxin's own passive decay.

### Interaction with the bacterial infection system

Fever toxin's primary stock-game vector is the bacterium agent (`bacteria.cos`), documented in detail at `DOCUMENTATION/caos_scripts/bacteria.md`. Each bacterium, when spawned, rolls a random toxin ID into OV16 from the range 70-81. When a bacterium lands on OV16 = 72 it becomes a Fever-toxin carrier and, while actively infecting a host, injects 0.005-0.050 units of Fever toxin into the host's bloodstream every tick.

Because reaction 80's Short half-life (24 ticks) is *much* faster than Fever toxin's own decay (3,024 ticks), a chronic infection reaches a quasi-steady-state where:

1. Bacterium injects `ov17` Fever toxin per tick.
2. Reaction 80 consumes 1 Fever toxin and 1 Water per activation at decay rate 0.971, producing 8 Hotness.
3. Reaction 81 consumes Hotness back out at a matching rate (provided Water is available), venting Air.
4. Receptor 96 continuously drives the somatic organ's clockrate down as long as Fever toxin > 0.
5. Receptor 97 (Hotness → clockrate) compounds the effect whenever Hotness is elevated.

The clinical profile of a Fever-toxin infection is therefore **chronic overheating with accelerated metabolism**: the creature runs hot, burns through Glucose faster than normal, looks for cold or water, and may drink compulsively. Unlike a Sleep-toxin infection (which stops the creature functioning) a Fever-toxin-infected creature stays *active* — but it burns energy at an elevated rate and can collapse from starvation or Glucose depletion if the infection lasts long enough.

The immune system response runs in parallel: each bacterium injects a matching antigen (chemicals 82-89) which triggers antibody production (chemicals 102-109). Once antibody concentration exceeds the bacterium's dormancy threshold, the bacterium goes dormant and stops injecting Fever toxin. The creature then cools as the Hotness-dissipation pathway catches up, and any remaining Fever toxin in the bloodstream decays passively over the next several minutes.

### Diagnostic visibility

The Medical Scanner and Medical Pod agents surface all of the bacterial toxin block (70-81) in their chemistry panels, so Fever toxin is a *named, detectable* chemical in the stock diagnostics. The visible clinical signs are distinctive enough that an attentive player can often diagnose Fever toxin before docking the creature:

- The creature's Hotness drive reads persistently high even in a cool room.
- The creature seeks water or cold environments and reacts poorly to warm rooms.
- The creature consumes Glucose and Oxygen faster than expected, depleting energy reserves unusually quickly.
- The chemistry panel shows Fever toxin > 0 alongside elevated Hotness and, indirectly, reduced Water.
- A bacterium sprite is often nearby or attached (the infection source).

Unlike Sleep toxin there is a *secondary* thermoregulation signal — Hotness — that the player can triangulate against. A combined "high Hotness + high Fever toxin + low Water" reading is the characteristic Fever-toxin signature in the diagnostics panel.

### Strategic / gameplay implications

- **Metabolic burn, not organ damage**: Fever toxin does not cause direct organ injury (no `RLOCUS_INJURY` receptor). The lasting damage is **indirect** — the creature burns through its energy reserves at roughly double the normal rate and can die of Glucose depletion, Starvation (chemical 197), or Need-for-Sleep collapse if the infection runs long enough without the player intervening.
- **No pharmacological cure, but water helps**: unlike Glycotoxin or Cyanide there is nothing the player can feed or inject to clear Fever toxin faster. However, keeping the creature *hydrated* makes the Hotness-dissipation pathway (reaction 81) work at full efficiency, which minimises the downstream clockrate acceleration from receptor 97 and reduces the net metabolic burn. A player observing Fever-toxin symptoms should keep their creature near a water source and encourage frequent drinking.
- **Environmental cooling matters**: because Hotness is a thermoregulation chemical that also responds to environmental CA temperature, placing the creature in a cold room accelerates Hotness clearance and reduces the downstream clockrate effect. Fever toxin is one of the toxins for which *environmental* intervention (cold room, ice agents) is as valuable as medical intervention.
- **Feeding through the fever**: because the accelerated metabolism burns Glucose much faster, a Fever-toxin-infected creature needs frequent high-energy meals. Leaving a feverish creature without food is a common cause of indirect Fever-toxin fatalities — the toxin itself is survivable, but the energy debt it creates is not.
- **Community modders' "heatstroke ingredient"**: Because Fever toxin has a clean 1:8 Hotness amplification and a clockrate receptor with no organ-injury path, it is a natural community choice for a non-lethal *"overheating"* ingredient — e.g. a spicy food, a cursed fire-themed object, a tropical-fever flavour agent. A creature can be dosed with a moderate amount of Fever toxin to produce visible fever symptoms without permanent injury.

## Summary

Fever toxin is the third entry in the bacterial-toxin block (70-81) and the block's distinctive **pyrogenic** toxin. It is defined by two standard-genome wires: reaction 80 (`1× Fever toxin + 1× Water → 8× Hotness`, gene 80), which converts the toxin and bodily water into an 8× burst of the Hotness thermoregulation chemical, and receptor 96 (gene 145), a direct RLOCUS_CLOCKRATE receptor with REDUCE flag and gain 255 that independently accelerates the creature's somatic organ metabolism — exactly reproducing the "organs tick faster" fever signature that Ammonia uses for its own fever response. Unlike Glycotoxin it has no dedicated antidote reaction: clearance is the sum of the Hotness-dissipation pathway (reaction 81) clearing the downstream heat, the self-depleting stoichiometry of reaction 80 eating one unit of toxin per activation, and passive decay (Long, 3,024 ticks, ~100 seconds per halving) chewing through whatever remains. Its stock-game delivery vector is the bacterium agent family in `bacteria.cos`, which rolls it as one of twelve possible infection toxins; a Fever-toxin infection presents as chronic overheating with accelerated metabolism, and its long-term danger is not direct organ damage but the metabolic exhaustion and dehydration that follow from running the creature's biochemistry in fast-forward while the body tries to vent heat through Water-consuming reactions. Recovery depends on removing the source, keeping the creature hydrated and cool, and feeding it through the accelerated burn until passive decay and the Hotness-dissipation pathway have cleared the toxin.
