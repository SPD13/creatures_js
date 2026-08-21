# Chemicals

## Overview

Chemicals are the substances that flow through a creature's bloodstream and drive every biochemical process in its body. A Norn's biochemistry operates on **256 chemical slots**, each identified by a number from 0 to 255. Some slots are used for metabolites such as Glucose or Protein, others for hormones such as Testosterone or Oestrogen, others for drive signals such as Pain or Hunger, and many are reserved for breed-specific or world-specific purposes (drugs, toxins, pheromones, antigens, custom signals).

Every chemical in the creature — whether it is food being digested, adrenalin surging during a fight, or Life slowly ticking down with age — is just a number in one of these slots, rising and falling as the body's organs produce, transform and consume it.

## What defines a chemical

From the game's point of view, a chemical is an astonishingly simple thing. A creature's bloodstream keeps, for each chemical, only two numbers:

1. **Concentration** — how much of the chemical is currently present in the bloodstream, on a scale from 0 to 255. This is the value that the rest of the biochemistry reads and writes. A creature is "hungry" when its Hunger chemical is high; "injured" when Lactate or a dedicated injury chemical has built up; "tired" when Tiredness has accumulated. Concentration is what the creature *feels* of a chemical at any given moment.

2. **Decay rate (half-life)** — how fast the chemical thins out on its own when nothing is producing or consuming it. Each chemical has a genome-defined half-life ranging from almost instantaneous to practically eternal. A short half-life means the chemical is a brief signal that fades away on its own (for example, a transient pain spike); a long half-life means the chemical lingers and accumulates over time (for example, ageing signals or permanent injury markers); the very longest half-lives mean the chemical effectively never decays and has to be actively cleared by something else.

In addition, each chemical has:

- **An ID** (0–255) that identifies it in every reaction, emitter and receptor that uses it.
- **A human-readable name** — Glucose, Adrenalin, Sleepase, Pain, Hunger for carbohydrate, and so on — provided by the game's chemical names catalogue. Names exist purely so that players, breeders and the debug UI can tell the slots apart; the biochemistry itself refers to chemicals only by their ID.
- **A starting concentration** set when the creature is born, specified per chemical in the genome. Most chemicals start at 0, but a few (such as the "Life" ageing clock) are born at full strength so they can count down over the creature's lifetime.

Everything else that we think of as "belonging" to a chemical — what produces it, what it turns into, what it does to the creature — is not stored on the chemical itself. It lives in separate biochemistry genes (emitters, reactions and receptors) that refer to the chemical by its ID. This separation is what makes Norn biochemistry so configurable: a breed can change what Glucose *does* without changing what Glucose *is*.

## Where chemicals come from

A chemical's concentration only changes in a handful of well-defined ways:

- **Emitters** — organ genes that watch some property of the creature or its environment and continuously release a chemical in response. The lungs emit Sleepiness, the gonads emit Testosterone and Oestrogen from their fertile locus, the hypothalamus emits pheromones and stress hormones, and so on. Emitters are how the body's state is translated into chemical signals.
- **Reactions** — genes that consume some chemicals and produce others at a given rate. Reactions implement digestion (Starch → Glucose), energy metabolism (Glucose + ADP → Pyruvate + ATP), fat storage and release, the urea cycle, detox pathways, immune response, and many smaller conversions. Reactions are how one chemical turns into another.
- **Natural decay** — every tick, each chemical decays according to its half-life regardless of anything else. This is the background drain that keeps transient signals from persisting forever.
- **External injection** — food, drugs, smells, sprayed agents and script-driven effects can push chemicals straight into the bloodstream. Eating a carrot injects its nutrient chemicals; a medicine injects a drug; an environmental smell can deliver a chemical hit through the nose.

Together these mechanisms form the "plumbing" of the creature: a network of sources, converters and sinks that shape how each chemical rises and falls throughout the creature's life.

## What chemicals do

A chemical by itself does nothing — it is only a number in a slot. The effect of a chemical comes from **receptors**: genes that read a chemical's concentration and write a corresponding signal into a body "locus" (a specific, named input on a faculty such as motor, sensory, reproductive, life or the brain).

Receptors are how the bloodstream talks to the rest of the creature. A receptor on the hunger locus turns the Hunger chemical into the drive the creature actually feels. A receptor on the injury locus turns Lactate or a dedicated injury chemical into tissue damage. A receptor on the death locus can kill the creature outright when a poison or illness chemical rises high enough. Receptors on the ageing loci read the slowly decaying Life chemical and advance the creature through the seven life stages. Receptors even feed directly into brain neurons, letting biochemistry influence neural decisions — a tired creature *wants* to sleep because Sleepiness is driving the sleep neuron.

A single chemical can be read by several receptors at once, feeding several different loci at different strengths. This is why chemicals can have layered roles: Adrenalin, for instance, both fuels a fight-or-flight sugar release in the adrenal gland *and* boosts the conversion between Fear and Anger in the hypothalamus.

## Categories of chemical

The 256 slots are not formally categorised by the engine — every chemical is treated identically — but the standard Norn genome uses them for recognisable families of purpose:

- **Metabolites** — the substances of digestion and energy: Starch, Glucose, Glycogen, Fat, Triglyceride, Fatty Acid, Adipose Tissue, Protein, Amino Acid, Pyruvate, ATP, ADP, Oxygen, Water, Urea, Ammonia.
- **Drives** — the motivational signals that the brain and body *feel*: Pain, Hunger, Hunger for protein, Hunger for fat, Hunger for carbohydrate, Coldness, Hotness, Tiredness, Sleepiness, Loneliness, Crowdedness, Boredom, Fear, Anger, Sex drive, and their longer-lived "backup" reservoirs.
- **Hormones** — slower signals shaping reproduction, growth and mood: Testosterone, Oestrogen, Progesterone, Arousal Potential, Libido suppressant, Adrenalin, anabolic steroid, up- and down-atrophin.
- **Pheromones** — short-range chemical messages between creatures: opposite-sex pheromone, various signalling chemicals used for mating and social behaviour.
- **Neurotransmitters and brain-linked signals** — chemicals emitted from or written into specific brain neurons, including Sleepase (which controls sleep onset) and various learning-linked signals used during dreaming.
- **Injury, illness and toxin signals** — Lactate, Muscle toxin, Glycotoxin, and breed-specific poisons that route into the creature's injury or death loci to cause damage, illness or death.
- **Immune chemicals** — antigens representing infections and their paired antibodies; the liver contains a full cascade that recognises each antigen and raises the matching antibody over time.
- **Pharmaceuticals and detoxifiers** — alcohol, cyanide, heavy metals, carbon monoxide, anti-oxidants, EDTA, and other substances that feed dedicated detox reactions.
- **Ageing and life-cycle chemicals** — most famously **Life** (Chemical 125), a master clock whose slow decay drives the seven life stages from Baby to Senile.
- **Free slots** — many chemical IDs are left unused by the stock genome so breeders, modders and world scripts can add new signals of their own.

These categories are conventions, not hard boundaries. A breed can redefine any slot, and world-specific content (agents, drugs, foods) can invent entirely new chemicals simply by using an unused ID and giving it a name.

## Role in gameplay

Chemicals are the hidden language of the whole creature system. Almost every observable behaviour of a Norn traces back to the rise and fall of one or more chemicals:

- **Health and illness** — glycogen reserves, injury markers, toxins and the master death locus are all chemical concentrations. Healing a creature, feeding it, or poisoning it all come down to nudging chemicals.
- **Emotion and motivation** — what a creature "feels" at any moment (hungry, scared, lonely, aroused, tired) is the current reading of its drive chemicals. Changing those chemicals changes behaviour.
- **Learning and decision-making** — drive chemicals feed directly into the brain's drive lobe, where they compete with perception and memory to choose what the creature should do next. Reinforcement during pat/slap teaching also leaves chemical traces.
- **Reproduction** — fertility, ovulation, pregnancy and arousal all run on carefully timed hormone chemicals; a creature cannot breed without the right biochemistry state.
- **Ageing and death** — life stages are crossed when the Life chemical decays past each receptor's threshold; old age, illness and starvation all kill through chemical routes.
- **World interaction** — food, medicines, smells, weather and agent scripts act on the creature by injecting chemicals into its bloodstream. From the creature's point of view, the outside world is felt as chemical change.

Because chemicals are simple numbers with explicit names and decay rates, they are also the primary surface that designers, breeders and modders interact with: new foods, drugs, toxins, moods and breeds can all be introduced by choosing an ID, giving it a name, a half-life and a starting level, and wiring a few emitters, reactions and receptors around it. The flexibility of Norn biology comes directly from the small, clean definition of what a chemical is.
