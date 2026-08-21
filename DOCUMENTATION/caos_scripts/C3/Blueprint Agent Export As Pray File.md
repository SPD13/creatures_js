# Blueprint Agent Export As Pray File.cos - Blueprint Export Utility

**Source**: `Assets/Bootstrap/001 World/Blueprint Agent Export As Pray File.cos`

## Overview

This script defines the export event handler (event 809) for the Blueprint agent (classifier 1 1 100). It does **not** create any agents itself. Instead, it serializes the current state of a Blueprint agent into a distributable PRAY agent file (`.blueprint`). This is a developer/user-facing utility that allows capturing a snapshot of a Blueprint agent — including all 100 of its object variables — and packaging it into a standard PRAY file that can be shared, imported, or reinstalled.

The Blueprint agent is created elsewhere (in `agent help.cos`) as a simple agent using the `pick-ups` sprite gallery. It acts as a generic container that records information about other agents in its object variables. Event 809 is triggered by the Blueprint UI (compound agent 1 2 33, event 808) after the user enters a filename for the export.

The export process works in three stages:
1. **COS Script Generation** — Writes a `.cos` installation script that recreates the agent with all its current properties and variable values.
2. **PRAY Source Generation** — Writes a `.pray_source` definition file describing the agent package metadata.
3. **PRAY Compilation** — Invokes `pray make` to compile both files into a single `.blueprint` PRAY agent file, then cleans up the temporary source files.

This script does not create agents. It is a serialization/export utility.

---

## Event Script: 1 1 100 Event 809 — Export Blueprint as PRAY File

This is the sole script in the file. It is triggered when the Blueprint UI (1 2 33) validates the user-entered filename and sends message 809 to the Blueprint agent (1 1 100). At that point, `ov98` contains the chosen export name.

### Execution Flow

#### Stage 1: Generate COS Installation Script

1. Reads the export name from `ov98` and appends `.cos` to form the COS filename (`va00`).
2. Opens a new file for writing using `file oope`.
3. Writes out a complete COS installation script that would recreate the agent:
   - Header comment: `* Automatically generated COS for blueprint`
   - Agent creation: `new: simp 1 1 100 "pick-ups" 0 0 5000`
   - Physical properties: `attr 199`, `perm 60`, `elas 10`, `fric 90`, `accg 2`
4. **Serializes all 100 object variables** (`ov00` through `ov99`) by looping through indices 0-99 and calling the `write_var` subroutine for each.
5. Writes a default position (`mvto 5440 3580`) and initial velocity (`velo 30 -10`).
6. Closes the COS file.

#### Stage 2: Generate PRAY Source Definition

1. Constructs the PRAY source filename by appending `.pray_source` to the export name (`va01`).
2. Opens the file and writes a PRAY source definition:
   - Language tag: `en-gb`
   - Group block: `group AGNT <export_name>`
   - Agent metadata:
     - `Agent Type`: 0
     - `Dependency Count`: 0
     - `Script Count`: 1
     - `Script 1`: references the COS file generated in Stage 1
     - `Agent Animation File`: `pick-ups.c16`
     - `Agent Animation Gallery`: `pick-ups`
     - `Agent Animation String`: `0`
     - `Agent Bioenergy Value`: 1
     - `Agent Description`: `It's a blueprint dafty!`
3. Closes the PRAY source file.

#### Stage 3: Compile and Clean Up

1. Constructs the output filename by appending `.blueprint` to the export name (`va02`).
2. Invokes `pray make` to compile the PRAY source file into the final `.blueprint` agent file.
3. Uses `dbg: asrt` to assert that the compilation succeeded (return value = 0). Outputs any error message via `outs va03`.
4. Deletes the temporary `.cos` and `.pray_source` files using `file jdel`.
5. Calls `pray refr` to refresh the PRAY resource cache so the new blueprint appears in agent lists.

### Subroutine: `write_var`

This subroutine serializes a single object variable (`ov[va10]`) to the COS output file, handling the three possible CAOS variable types:

| Variable Type (`type`) | CAOS Type | Output Format |
|---|---|---|
| < 0 or > 2 | Null/Invalid | `seta avar targ N null` |
| 0 or 1 | Integer or Float | `setv avar targ N <value>` |
| 2 | String | `sets avar targ N <quoted_value>` |

The subroutine uses `type avar targ va10` to detect the variable's type and writes the appropriate CAOS setter command. String values are written using `outx` (which quotes and escapes the string). Null/invalid variables are written as agent references set to null.

---

## Key CAOS Commands Used

| Command | Purpose |
|---|---|
| `file oope` | Open a file for writing in the journal directory |
| `file oclo` | Close the currently open output file |
| `file jdel` | Delete a file from the journal directory |
| `outs` | Write a literal string to the open file |
| `outv` | Write a numeric value to the open file |
| `outx` | Write a quoted/escaped string to the open file |
| `pray make` | Compile a PRAY source file into a PRAY agent file |
| `pray refr` | Refresh the PRAY resource cache |
| `type` | Return the type of a variable (0=integer, 1=float, 2=string) |
| `avar` | Access an agent's object variable by index |
| `dbg: asrt` | Debug assertion — verify a condition is true |

## Context: Related Scripts

| File | Relationship |
|---|---|
| `agent help.cos` | Creates the Blueprint agent (1 1 100) during the Agent Help UI flow |
| `blueprint agent scripts.cos` | Defines the Blueprint agent's other event scripts (1, 1000, 2000) and its UI companion (1 2 33) |
