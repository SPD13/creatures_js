# Chemical roles — one-line summary of every documented chemical

One row per chemical article in this folder, distilled to the shortest statement of what the
chemical actually *does* in the stock Creatures 3 / Docking Station genome. Read the matching
`NNN - Name.md` for the sources, the reactions, the receptors and the game-mechanics detail.

**This table is the source of truth for the `role` field in `index.json`.**
`scripts/generate-chemical-docs-index.js` parses the table below and copies each role into the
index, which is what the Chemical Docs viewer and the in-game Help Chat read — the Help Chat
sends the whole list with every question, so a creature's bloodstream read-out is explained
without the assistant having to open a file. Edit the role here, then run:

```bash
node scripts/generate-chemical-docs-index.js
```

Rows must stay in `| id | name | role |` form with a numeric id; the generator matches rows to
articles by id and warns about either side going missing. Keep roles to one line and prefer the
mechanism ("catalytically destroys Energy") over the flavour ("a nasty poison").

Where a slot exists in the chemical table but the stock genome never wires it, the role says so —
"unwired" and "vestigial" are load-bearing words here, not omissions.

| ID | Name | Role |
|---|---|---|
| 1 | Lactate | Long-lived damage marker; feeds the organ injury locus, produced from Muscle toxin |
| 2 | Pyruvate | Central metabolic hub where the carb, fat and protein branches meet |
| 3 | Glucose | Blood sugar; burned by glycolysis, stored as Glycogen |
| 4 | Glycogen | Dense short-term sugar store; its level is what the engine reports as "health" |
| 5 | Starch | Dietary carbohydrate from food; digested into Glucose |
| 6 | Fatty Acid | Burnable free fat between the fat stores and Pyruvate/ATP |
| 7 | Cholesterol | Non-fuel carbon reservoir built from surplus Pyruvate and dietary fat |
| 8 | Triglyceride | Mid-density fat in transit between Fatty Acid and Adipose Tissue |
| 9 | Adipose Tissue | Long-term body-fat vault; the deepest energy reserve |
| 10 | Fat | Dietary fat from food; the only lipid input to the body |
| 11 | Muscle Tissue | Protein store grown by exercise, broken back down when protein is needed |
| 12 | Protein | Dietary protein from food; digested into Amino Acid |
| 13 | Amino Acid | Circulating protein currency; builds muscle or burns for Glucose |
| 17 | Downatrophin | Downhill gait signal; switches the walk animation while descending |
| 18 | Upatrophin | Uphill gait signal; switches the walk animation while climbing |
| 24 | Dissolved carbon dioxide | Respiration waste; no receptors read it, reactions clear it |
| 25 | Urea | Nitrogen waste endpoint of protein burning; high levels trigger Pistle |
| 26 | Ammonia | Toxic nitrogen intermediate from burning protein; converted onward to Urea |
| 29 | Air | Inhaled-gas reserve; combined with Water to manufacture Oxygen |
| 30 | Oxygen | Blood oxidant that makes aerobic respiration possible |
| 33 | Water | Body-water pool used by respiration, nitrogen disposal, cooling and illness |
| 34 | Energy | Short-lived respiration output, immediately cashed into ATP |
| 35 | ATP | Universal energy currency; every organ tick spends it or takes damage |
| 36 | ADP | Discharged ATP, recharged by metabolism |
| 39 | Arousal Potential | Internal "I am fertile" signal; with the mate pheromone it becomes Sex drive |
| 40 | Libido lowerer | Emitted while infertile; destroys Sex drive and Arousal Potential |
| 41 | Opposite Sex Pheromone | Smelled from a nearby mate; gates Arousal Potential into Sex drive |
| 46 | Oestrogen | Female cycle hormone; drives ovulation through a hysteresis loop |
| 48 | Progesterone | Pregnancy hormone; blocks ovulation, swells the body, triggers egg laying |
| 53 | Testosterone | Male cycle hormone; drives sperm production on the same wiring as Oestrogen |
| 54 | Inhibin | Reserved fertility-brake slot; unwired in the stock genome |
| 66 | Heavy Metals | Environmental poison that never decays; only EDTA clears it |
| 67 | Cyanide | Catalytically destroys Energy without being consumed itself |
| 68 | Belladonna | Slows organ clock rates — a paralysing rather than damaging toxin |
| 69 | Geddonase | Fat-destroying toxin; liquefies Adipose Tissue into a lossy Glucose burst |
| 70 | Glycotoxin | Bacterial toxin; raids the Glycogen store and injures an organ (antidote: Arnica) |
| 71 | Sleep toxin | Bacterial toxin that burns down into the Sleepiness drive |
| 72 | Fever toxin | Bacterial toxin; burns Water into Hotness and hijacks an organ's clock rate |
| 73 | Histamine A | Inflammation signal: a bacterial toxin and the by-product of the Antigen 1 response |
| 74 | Histamine B | Inflammation signal: a bacterial toxin and the by-product of the Antigen 0 response |
| 75 | Alcohol | Intoxicant; forces a drunken gait, detoxified by Dehydrogenase into Glucose and Pain |
| 78 | ATP Decoupler | Catalytically turns ATP into ADP, starving every organ (antidote: Medicine one) |
| 79 | Carbon monoxide | Annihilates Oxygen 1:1 and suffocates (antidote: Anti-oxidant) |
| 80 | Fear toxin | Bacterial toxin that converts entirely into the Fear drive |
| 81 | Muscle toxin | Damage toxin; injures organs directly and becomes Lactate |
| 82 | Antigen 0 | Infection marker for bacterium strain 0; the liver answers it with Antibody 0 |
| 83 | Antigen 1 | Infection marker for bacterium strain 1; the liver answers it with Antibody 1 |
| 84 | Antigen 2 | Infection marker for bacterium strain 2; the liver answers it with Antibody 2 |
| 85 | Antigen 3 | Infection marker for bacterium strain 3; the liver answers it with Antibody 3 |
| 86 | Antigen 4 | Infection marker for bacterium strain 4; the liver answers it with Antibody 4 |
| 87 | Antigen 5 | Infection marker for bacterium strain 5; the liver answers it with Antibody 5 |
| 88 | Antigen 6 | Infection marker for bacterium strain 6; the liver answers it with Antibody 6 |
| 89 | Antigen 7 | Infection marker for bacterium strain 7; the liver answers it with Antibody 7 |
| 92 | Medicine one | Antidote to ATP Decoupler (the "cures cyanide" label on it is wrong) |
| 93 | Anti-oxidant | Sacrificial 1:1 neutraliser of Carbon monoxide |
| 94 | Prostaglandin | Sets how fast every organ repairs its short-term life force |
| 95 | EDTA | Chelator; the only pathway that clears Heavy Metals |
| 96 | Sodium thiosulphite | Specific antidote to Cyanide, and nothing else |
| 97 | Arnica | Specific antidote to Glycotoxin, and nothing else |
| 98 | Vitamin E | Inert placeholder; no reaction, receptor or emitter touches it |
| 99 | Vitamin C | Externally supplied catalyst; modulates eight reaction rates and an organ clock |
| 100 | Antihistamine | Externally supplied antidote to both histamines |
| 102 | Antibody 0 | Immune response that clears Antigen 0 |
| 103 | Antibody 1 | Immune response that clears Antigen 1 |
| 104 | Antibody 2 | Immune response that clears Antigen 2 |
| 105 | Antibody 3 | Immune response that clears Antigen 3 |
| 106 | Antibody 4 | Immune response that clears Antigen 4 |
| 107 | Antibody 5 | Immune response that clears Antigen 5 |
| 108 | Antibody 6 | Immune response that clears Antigen 6 |
| 109 | Antibody 7 | Immune response that clears Antigen 7 |
| 112 | Anabolic steroid | Exercise hormone; converts Amino Acid into Muscle Tissue |
| 113 | Pistle | High-Urea alarm; purges Urea, speeds the reaction organ and sheds heat |
| 114 | Insulin | Vestigial; glucose storage is wired directly, without the hormone |
| 115 | Glycolase | Vestigial; glycolysis runs as one reaction, without the enzyme |
| 116 | Dehydrogenase | Detoxifies Alcohol into Glucose plus Pain — the hangover |
| 117 | Adrenalin | Fight-or-flight amplifier; grows Fear/Anger and dumps Glycogen as Glucose |
| 118 | Grendel nitrate | Reserved Grendel-waste slot; unwired in the stock genome |
| 119 | Ettin nitrate | Reserved Ettin-waste slot; unwired in the stock genome |
| 124 | Activase | Reserved enzyme slot; unwired in the stock genome |
| 125 | Life | The lifespan clock; its slow decay advances the seven life stages |
| 127 | Injury | Whole-body damage total; rises as organs are hurt, falls as they repair |
| 128 | Stress | Aggregate distress hormone; rises while any drive stays high |
| 129 | Sleepase | Enzyme converting the Sleepiness reservoir into the Sleepiness drive |
| 131 | Pain backup | Chronic reservoir that drips into the Pain drive |
| 132 | Hunger for protein backup | Chronic reservoir that drips into the Hunger for protein drive |
| 133 | Hunger for carb backup | Chronic reservoir that drips into the Hunger for carbohydrate drive |
| 134 | Hunger for fat backup | Chronic reservoir that drips into the Hunger for fat drive |
| 135 | Coldness backup | Chronic reservoir that drips into the Coldness drive |
| 136 | Hotness backup | Chronic reservoir that drips into the Hotness drive |
| 137 | Tiredness backup | Chronic reservoir that drips into the Tiredness drive |
| 138 | Sleepiness backup | Chronic reservoir converted into the Sleepiness drive by Sleepase |
| 139 | Loneliness backup | Chronic reservoir that drips into the Loneliness drive |
| 140 | Crowded backup | Chronic reservoir that drips into the Crowded drive |
| 141 | Fear backup | Unwired reservoir slot; no path to the Fear drive |
| 142 | Boredom backup | Chronic reservoir that drips into the Boredom drive |
| 143 | Anger backup | Unwired reservoir slot; no path to the Anger drive |
| 144 | Sex drive backup | Chronic reservoir that drips into the Sex drive |
| 145 | Comfort backup | Unwired reservoir slot; no path to the Comfort drive |
| 148 | Pain | Drive: physical hurt; the brain reacts to it directly |
| 149 | Hunger for protein | Drive: needs protein-rich food |
| 150 | Hunger for carbohydrate | Drive: needs sugary food |
| 151 | Hunger for fat | Drive: needs fatty food |
| 152 | Coldness | Drive: too cold, seeks warmth |
| 153 | Hotness | Drive: too hot, seeks cool |
| 154 | Tiredness | Drive: physical exhaustion; wants to rest |
| 155 | Sleepiness | Drive: needs to sleep |
| 156 | Loneliness | Drive: wants company of its own kind |
| 157 | Crowded | Drive: too many creatures nearby |
| 158 | Fear | Drive: threat and alarm |
| 159 | Boredom | Drive: needs novelty and stimulation |
| 160 | Anger | Drive: aggression and frustration |
| 161 | Sex drive | Drive: urge to court and mate |
| 162 | Comfort | Drive: contentment, emitted from the womb while pregnant |
| 165 | CA smell 0 (sound) | Bloodstream copy of map CA channel 0 (sound) for smell navigation |
| 166 | CA smell 1 (light) | Bloodstream copy of map CA channel 1 (light) for smell navigation |
| 167 | CA smell 2 (heat) | Bloodstream copy of map CA channel 2 (heat) for smell navigation |
| 168 | CA smell 3 (water) | Bloodstream copy of map CA channel 3 (water) for smell navigation |
| 169 | CA smell 4 (nutrient) | Bloodstream copy of map CA channel 4 (nutrient) for smell navigation |
| 170 | CA smell 5 (water) | Bloodstream copy of map CA channel 5 (water) for smell navigation |
| 171 | CA smell 6 (protein) | Bloodstream copy of map CA channel 6 (protein food) for smell navigation |
| 172 | CA smell 7 (carbohydrate) | Bloodstream copy of map CA channel 7 (carbohydrate food) for smell navigation |
| 173 | CA smell 8 (fat) | Bloodstream copy of map CA channel 8 (fatty food) for smell navigation |
| 174 | CA smell 9 (flowers) | Bloodstream copy of map CA channel 9 (flowers) for smell navigation |
| 175 | CA smell 10 (machinery) | Bloodstream copy of map CA channel 10 (machinery) for smell navigation |
| 176 | CA smell 11 | Bloodstream copy of map CA channel 11 (eggs) for smell navigation |
| 177 | CA smell 12 (Norn) | Bloodstream copy of map CA channel 12 (norn scent) for smell navigation |
| 178 | CA smell 13 (Grendel) | Bloodstream copy of map CA channel 13 (grendel scent) for smell navigation |
| 179 | CA smell 14 (Ettin) | Bloodstream copy of map CA channel 14 (ettin scent) for smell navigation |
| 180 | CA smell 15 (Norn home) | Bloodstream copy of map CA channel 15 (norn home territory) |
| 181 | CA smell 16 (Grendel home) | Bloodstream copy of map CA channel 16 (grendel home territory) |
| 182 | CA smell 17 (Ettin home) | Bloodstream copy of map CA channel 17 (ettin home territory) |
| 183 | CA smell 18 | Bloodstream copy of map CA channel 18 (detectors and gadgets) |
| 184 | CA smell 19 | Bloodstream copy of map CA channel 19; no meaning assigned in vanilla C3 |
| 187 | Stress (H4C) | Per-cause stress marker: chronic hunger for carbohydrate, feeding total Stress |
| 188 | Stress (H4P) | Per-cause stress marker: chronic hunger for protein, feeding total Stress |
| 189 | Stress (H4F) | Per-cause stress marker: chronic hunger for fat, feeding total Stress |
| 190 | Stress (Anger) | Per-cause stress marker: chronic anger, feeding total Stress |
| 191 | Stress (Fear) | Per-cause stress marker: chronic fear, feeding total Stress |
| 192 | Stress (Pain) | Per-cause stress marker: chronic pain, feeding total Stress |
| 193 | Stress (Sleep) | Per-cause stress marker: chronic unmet sleep, feeding total Stress |
| 194 | Stress (Tired) | Per-cause stress marker: chronic tiredness, feeding total Stress |
| 195 | Stress (Crowded) | Per-cause stress marker: chronic crowding, feeding total Stress |
| 198 | Brain chemical 1 | Blame gate for the drive→concept tract, pulsed when an action fails |
| 199 | Up | Navigation drive: urge to go up |
| 200 | Down | Navigation drive: urge to go down |
| 201 | Exit | Navigation drive: urge to leave the current room |
| 202 | Enter | Navigation drive: urge to go inside |
| 203 | Wait | Navigation drive: urge to stay put |
| 204 | Reward | Positive reinforcement; strengthens what the creature just did |
| 205 | Punishment | Negative reinforcement; weakens what the creature just did |
| 206 | Brain chemical 9 | Reserved brain-bus slot; never written or read in the stock genome |
| 207 | Brain chemical 10 | Reserved brain-bus slot for custom genomes |
| 208 | Brain chemical 11 | Reserved brain-bus slot for custom genomes |
| 209 | Brain chemical 12 | Reserved brain-bus slot for custom genomes |
| 210 | Brain chemical 13 | Reserved brain-bus slot for custom genomes |
| 211 | Brain chemical 14 | Reserved brain-bus slot for custom genomes |
| 212 | Pre-REM sleep | Engine flag raised for one tick before dreaming starts |
| 213 | REM sleep | Engine flag raised for the whole dreaming / instinct-processing phase |
