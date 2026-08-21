# Creatures 3 Genome Loading System

## Overview

This document explains how genome files (`.gen`) are handled during world loading and creature operation. The key insight is that **genome files are NOT embedded in the world save file** - they are loaded on-demand from the `Genetics/` folder.

---

## Key Principle: On-Demand Loading

When a world is loaded from the binary file (e.g., `TheWorldAndEverythingInIt`), the `.gen` files in the `Genetics/` folder are **NOT loaded**. Instead:

1. The world file stores only **moniker strings** (e.g., `"cegpq-fqn7v-x6z62-es8hx"`)
2. The actual `.gen` files are read **on-demand** when creature code needs genetic data
3. This keeps world files smaller and allows genome sharing across worlds

---

## Data Flow Diagram

```
┌─────────────────────────────────────────────────────────────────────┐
│                    GENOME DATA FLOW                                  │
├─────────────────────────────────────────────────────────────────────┤
│                                                                      │
│  WORLD BINARY FILE (TheWorldAndEverythingInIt):                      │
│  ┌─────────────────────────────────────────────────────────────┐    │
│  │ GenomeStore:                                                 │    │
│  │   myMonikers = ["cegpq-fqn7v-x6z62-es8hx",                  │    │
│  │                 "xf23b-v2eq3-dnk7a-h45h8", ...]             │    │
│  │   (ONLY STRINGS - no genome data!)                          │    │
│  └─────────────────────────────────────────────────────────────┘    │
│                              │                                       │
│                              │ World Load                            │
│                              ▼                                       │
│  ┌─────────────────────────────────────────────────────────────┐    │
│  │ Creature in Memory:                                          │    │
│  │   GenomeStore.myMonikers = ["cegpq-fqn7v-x6z62-es8hx"]      │    │
│  │   (genome data NOT loaded yet)                               │    │
│  └─────────────────────────────────────────────────────────────┘    │
│                              │                                       │
│                              │ When genome data needed               │
│                              │ (e.g., ExpressGenes, FormBodyParts)   │
│                              ▼                                       │
│  ┌─────────────────────────────────────────────────────────────┐    │
│  │ Genome g(GetGenomeStore(), 0, sex, age, variant);           │    │
│  │                              │                               │    │
│  │                              ▼                               │    │
│  │ ReadFromFile("Genetics/cegpq-fqn7v-x6z62-es8hx.gen")        │    │
│  │ (ON-DEMAND file read!)                                       │    │
│  └─────────────────────────────────────────────────────────────┘    │
│                                                                      │
└─────────────────────────────────────────────────────────────────────┘
```

---

## Implementation Details

### GenomeStore Class

The `GenomeStore` class maintains a list of moniker strings, not actual genome data:

```text
class GenomeStore:
    myMonikers   // a list of strings, not Genome objects!
```

### GenomeStore Serialization

Only the moniker strings are saved to and loaded from the world file:

```text
// Writing to archive - only saves moniker strings
write(archive, genomeStore):
    archive << genomeStore.myMonikers   // Writes the list of strings

// Reading from archive - only loads moniker strings
read(archive, genomeStore):
    archive >> genomeStore.myMonikers   // Reads the list of strings
```

### Agent Serialization

The GenomeStore is serialized as part of each Agent:

```text
// Agent.Write()
ar << myGenomeStore   // Writes the GenomeStore (just monikers)

// Agent.Read()
ar >> myGenomeStore   // Reads the GenomeStore (just monikers)
```

### On-Demand Genome Loading

When creature code needs actual genome data, a temporary `Genome` object is created that reads from the file:

```text
// Constructor that loads genome from file
Genome(store, storeIndex, sex, age, variant):
    moniker = store.MonikerAsString(storeIndex)

    // If moniker is non-empty, read data file...
    if moniker is not empty:
        filename = GenomeStore.Filename(moniker)
        ReadFromFile(filename, sex, age, variant, moniker)   // <-- Actual file read
```

### File Path Construction

The genome file path is constructed from the moniker:

```text
GenomeStore.Filename(moniker):
    assert moniker is not empty
    if moniker is empty:
        return ""

    filepath = GetFilePath(moniker)
    filename = filepath.GetWorldDirectoryVersionOfTheFile(true)
    return filename

GenomeStore.GetFilePath(moniker):
    assert moniker is not empty
    filepath = FilePath(moniker + ".gen", GENETICS_DIR)   // e.g., "xxxx.gen" in Genetics/
    return filepath
```

---

## When Are Genome Files Read?

The `.gen` files are read on-demand in various creature operations:

### 1. After World Load - Remaking Skeleton

```text
// Creature.RemakeSkeletonAfterSerialisation()
g = Genome(GetGenomeStore(), 0, Life.GetSex(), Life.GetAge(), Life.GetVariant())
Skeleton.CreateSkeleton(g, Life.GetAge())
```

### 2. Expressing Genes / Forming Body Parts

```text
// Creature.FormBodyParts()
if not Skeleton.ExpressGenes(
        Genome(GetGenomeStore(), 0, Life.GetSex(), Life.GetAge(), Life.GetVariant()),
        Life.GetAge()):
    return false
return true
```

### 3. Reading From Genome During Initialization

```text
// In Creature.Init()
try:
    // Temporary genome object read from file:
    g = Genome(GetGenomeStore(), 0, Life.GetSex(), Life.GetAge(), Life.GetVariant())

    for i in 0 .. noOfFaculties:
        myFaculties[i].ReadFromGenome(g)

    if not Skeleton.ExpressGenes(g, Life.GetAge()):
        return false
catch GenomeException:
    // Handle genome loading errors
```

### 4. Preloading Body Parts for Age Transition

```text
// In Creature.Update()
if Life.GetAge() <= NUMAGES:
    g = Genome(GetGenomeStore(), 0, Life.GetSex(), myAgeAlreadyLoaded, Life.GetVariant())
    PreloadBodyPartsForNextAgeStage(g, Life.GetSex())
```

---

## Design Benefits

This on-demand loading design provides several advantages:

### 1. Smaller World Files
- World saves only store moniker strings (~30 bytes each)
- Genome files can be 30-40 KB each
- A world with 10 creatures saves ~300 bytes instead of ~400 KB

### 2. Genome Sharing
- Multiple creatures can reference the same genome file
- Cloned creatures share the parent's genome
- No data duplication in the world file

### 3. Export/Import Compatibility
- Creature export includes genome in the `.creature` file
- Import extracts genome to `Genetics/` folder
- World file just needs to reference the moniker

### 4. Crash Recovery
- Genome files are tracked via `MarkFileCreated()`
- Orphaned genomes moved to `Basement/` on crash recovery
- See: World-Subfolder-System.md

---

## File Structure

```
My Worlds/{world_name}/
├── TheWorldAndEverythingInIt     # World binary - contains moniker strings only
├── Genetics/
│   ├── {moniker1}.gen            # Actual genome data (loaded on-demand)
│   ├── {moniker2}.gen
│   └── ...
└── ...
```

### Moniker Format

Monikers follow the format: `{name}-{hash}` where:
- First segment is typically the creature's name or "life"/"rain"/etc.
- Remaining segments are a unique hash

Example: `001-life-cegpq-fqn7v-x6z62-es8hx`

---

## Genome File Contents

The `.gen` file contains the complete genetic data including:

- **Header**: Version, moniker, parent monikers
- **Genes**: All genetic instructions organized by type
  - Brain genes (lobe definitions, tract connections)
  - Biochemistry genes (reactions, receptors, emitters)
  - Appearance genes (species, pigments, body parts)
  - Organ genes
  - Stimulus genes
  - Instinct genes
  - And many more...

The genome is read and interpreted based on the creature's current:
- **Sex**: Determines which sex-linked genes are expressed
- **Age**: Determines which age-specific genes are active
- **Variant**: Selects between variant-specific gene alternatives

---

## Error Handling

If a genome file is missing or corrupted:

```text
// In creature initialization
catch GenomeException:
    // Genome loading failed
    // Creature cannot function properly without genome
```

This is why the `Genetics/` folder is critical - if the `.gen` files are deleted but the world file references them, creatures will fail to load properly.

---

## Related Documentation

- `Binary-World-Format.md` - World file structure including GenomeStore serialization
- `World-Subfolder-System.md` - How genome files are managed (creation, deletion, recovery)

---

## Key Components

| Component | Purpose |
|------|---------|
| `GenomeStore` | Moniker management, file path construction, serialization |
| `Genome` | Genome loading from file, gene interpretation |
| `Agent` | GenomeStore serialization as part of each agent |
| `Creature` | On-demand genome loading for creature operations |
| `Skeleton` | Gene expression for body parts |

---

*Document Version: 1.0*
*Last Updated: December 2024*
*Based on: analysis of the original Creatures 3 engine*
