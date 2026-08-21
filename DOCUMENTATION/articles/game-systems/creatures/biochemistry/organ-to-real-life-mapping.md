# Organ to Real-Life Mapping

## Overview

A Norn's genome declares **21 organs**. Each organ is a logical cluster of biochemistry genes (reactions, receptors, emitters) that share the same clock rate, life force and damage parameters. Organs have no names in the genome — only an ordered position — but by looking at **what reactions run inside each organ**, **which loci its receptors read from**, and **which chemicals its emitters produce**, each one can be mapped to a recognisable real-life biological equivalent.

This article is the result of that analysis, performed on `Starter Parent 1.family` (see `Rebuild/DOCUMENTATION/CreaturesData/biochemistry.json`). Biochemistry genes were grouped to their owning organ by genome position: every reaction / receptor / emitter gene belongs to the most recent preceding organ gene (`type=3, subtype=0`).

---

## Summary Table

| # | Real-life equivalent | Key biochemistry evidence |
|---|---|---|
| **1** | **Hypothalamus / Limbic system** | Receives all drive chemicals (pain, hunger, fear, anger, loneliness, sex drive…); converts fear↔anger via adrenalin; emits stress signals and pheromones. Pure emotional/drive processing. |
| **2** | **Liver** (with immune + kidney functions) | Metabolic powerhouse — 63 reactions: protein/amino-acid handling, cholesterol, muscle-tissue synthesis, urea cycle (ammonia → urea), detox (alcohol, cyanide, heavy metals, carbon monoxide), complete antigen → antibody immune cascade, prostaglandin regulation. |
| **3** | **Pancreas (β-cells / insulin)** | Glucose → Glycogen (glycogenesis — the insulin-driven storage reaction). |
| **4** | **Pancreas (α-cells / glucagon)** | Glycogen → Glucose (glycogenolysis); emits Sleepase; heat regulates its clock rate. |
| **5** | **Pineal gland** | Emits Sleepase from LOC_ASLEEP; handles loneliness-backup. Sleep / circadian regulator. |
| **6** | **Small intestine — lipase** | Fat → Triglycerides + Cholesterol (dietary fat digestion). |
| **7** | **Salivary glands / Pancreatic amylase** | Starch → Glucose (carbohydrate digestion). |
| **8** | **Adipose tissue — lipogenesis** | Triglycerides → Adipose Tissue (fat storage). |
| **9** | **Adipose tissue — lipolysis** | Adipose Tissue → Triglycerides (mobilising stored fat). |
| **10** | **Jejunum / Fat appetite sensor** | Triglyceride → Fatty Acid; emits *Hunger for fat*. |
| **11** | **Skeletal muscle — fatigue sensor** | Tiredness → Tiredness-backup buffering; energy-sensitive. |
| **12** | **Skeletal muscle — glycolysis** | Glucose + ADP → Pyruvate + ATP; emits anabolic steroid toward LOC_MUSCLES. Classic aerobic / anaerobic muscle metabolism. |
| **13** | **Liver — gluconeogenesis** | Pyruvate + ATP → Glucose + ADP (reverse glycolysis); signals *Hunger for protein*. |
| **14** | **Stomach (pepsin)** | Protein → Amino Acids (proteolysis). |
| **15** | **Gonads (testes / ovaries)** | Emits Testosterone, Oestrogen and Arousal Potential from LOC_FERTILE; handles sex-drive, crowded and boredom backups. |
| **16** | **Adipocytes — de novo lipogenesis** | Pyruvate + ATP → Fatty Acid. |
| **17** | **Mitochondria — β-oxidation** | Fatty Acid + ADP → Pyruvate + ATP, plus FA ↔ Triglyceride interchange (fatty-acid oxidation pathway). |
| **18** | **Uterus / Womb** | Emits *Comfort* from LOC_PREGNANT. Pregnancy-related organ. |
| **19** | **Adrenal gland** | Glycogen + Adrenalin → 8× Glucose (fight-or-flight sugar release); emits Upatrophin during upward motion (exertion). |
| **20** | **Lungs** | Pyruvate + Oxygen → Energy + CO₂; oxygen regulates its clock rate; emits Sleepiness. Site of O₂/CO₂ exchange feeding respiration. |
| **21** | **Heart / Muscle mitochondria (ATP synthase)** | Energy + ADP → ATP (final ATP production); emits Downatrophin for downward motion. Cardiac / muscular energy delivery. |

---

## Functional Clusters

Grouping organs by the pathway they participate in shows how faithfully the Norn biology models a simplified mammalian system:

### Digestive tract
- **14 Stomach** — breaks proteins down to amino acids
- **7 Amylase** — breaks starch down to glucose
- **6 Lipase** — breaks fat down to triglycerides and cholesterol
- **10 Jejunum** — finishes fat digestion and signals fat appetite

### Energy metabolism
- **12 Skeletal muscle** — glycolysis (Glucose → Pyruvate, ATP production)
- **20 Lungs** — oxidative phase (Pyruvate + O₂ → Energy + CO₂)
- **21 Heart / ATP synthase** — Energy → ATP
- **17 Mitochondria (β-oxidation)** — Fatty acids → Pyruvate
- **16 Adipocytes (de novo lipogenesis)** — Pyruvate → Fatty acids

### Fuel storage and release
- **3 Pancreas (β)** — insulin analogue, stores glucose as glycogen
- **4 Pancreas (α)** — glucagon analogue, releases glucose from glycogen
- **8 Adipose (storage)** / **9 Adipose (release)**
- **19 Adrenal gland** — adrenalin-driven emergency glucose release

### Endocrine and emotional regulation
- **1 Hypothalamus / Limbic** — drives, fear↔anger conversion, stress
- **5 Pineal gland** — sleep / sleepase
- **15 Gonads** — testosterone, oestrogen, arousal
- **18 Uterus** — pregnancy comfort
- **19 Adrenal gland** — stress and exertion coupling

### Liver super-organ
- **2 Liver** — the largest organ by far: synthesis, detox, immunity, urea cycle
- **13 Liver — gluconeogenesis** — sits structurally separate from organ 2 and specialises in reversing glycolysis

---

## Methodology

The 21 organs are stored in the genome as organ genes. Biochemistry genes (receptors, emitters, reactions, half-lives, initial concentrations, neuroemitters) appear between organ genes and belong to the most recent preceding organ. The extract script `Rebuild/DOCUMENTATION/CreaturesData/extract-biochemistry.js` already produces `biochemistry.json` with each gene's genome ID — grouping by genome ID against the sorted list of organ gene IDs produces a clean per-organ inventory:

```text
Organ #N (geneId = X → Y-1):
  Reactions:  [list of reactant → product formulas in this organ]
  Receptors:  [chemical → organ/tissue/locus targets]
  Emitters:   [organ/tissue/locus source → chemical produced]
```

The real-life label for each organ is then chosen by matching the aggregate behaviour to a well-known physiological role (glycolysis → muscle, glycogenesis → pancreatic β-cells, Protein → Amino Acid → stomach, and so on).

---

## Notes and Caveats

- **Organ 2 is dramatically larger** than every other organ (63 reactions vs 1–12) and combines functions that real mammals split across liver, kidney and immune system. Treating it as a hybrid "Liver + immune" organ is pragmatic.
- **Organs 20 and 21** are two halves of the same real-world process (oxidative phosphorylation). Labelling 20 as *Lungs* reflects its oxygen dependency (O₂ drives its clock rate), while 21 specialises in the final ATP conversion step.
- **Organs 3 and 4** are symmetric (Glucose ↔ Glycogen), so splitting them across insulin-like and glucagon-like cells of the pancreas is a close biological analogue.
- **Organs 11 and 13** both produce hunger-for-protein signals but through different biochemical pathways — 11 measures fatigue, 13 performs gluconeogenesis.
- The mapping is based on a single starter genome. Custom breeds may shift the biochemistry assigned to each organ, but the organ count (21) and the organ-gene ordering are fixed by the species norm.

---

## References

- Source data: `Rebuild/DOCUMENTATION/CreaturesData/biochemistry.json`
- Extract script: `Rebuild/DOCUMENTATION/CreaturesData/extract-biochemistry.js`
- Related: [Biochemistry System](../biochemistry-system.md), [Energy and Metabolism](../energy-and-metabolism.md)
