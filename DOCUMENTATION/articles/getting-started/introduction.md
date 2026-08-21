# Introduction to Creatures 3 Web Rebuild

Welcome to the documentation for the **Creatures 3 Web Rebuild** project - a faithful recreation of the classic 1999 life simulation game in modern JavaScript.

## About Creatures 3

Creatures 3 was developed by Creature Labs (formerly Cyberlife Technology) and released in 1999. It features sophisticated artificial life simulation with:

- **Digital Creatures** - AI-controlled beings (Norns, Grendels, Ettins, Geats) with complex neural networks, genetics, and biochemistry
- **Living World** - An interactive environment with physics, day/night cycles, and ecosystems
- **CAOS Scripting** - A powerful scripting language for creating game content
- **Genetic System** - Full genome representation allowing creature breeding and evolution

## Project Goals

This web rebuild aims to:

1. **Preserve** the original game experience in a modern, accessible format
2. **Document** the sophisticated AI and game systems for educational purposes
3. **Enable** the community to play, modify, and extend the game
4. **Provide** a platform for understanding artificial life concepts

## Architecture Overview

The rebuild consists of several major systems:

```
┌─────────────────────────────────────────────────────────┐
│                    GAME ENGINE                          │
├─────────────────────────────────────────────────────────┤
│  ┌─────────┐  ┌─────────┐  ┌─────────┐  ┌─────────┐    │
│  │ Agents  │  │Creatures│  │  World  │  │  CAOS   │    │
│  │ System  │  │ System  │  │ System  │  │   VM    │    │
│  └────┬────┘  └────┬────┘  └────┬────┘  └────┬────┘    │
│       │            │            │            │          │
│       └────────────┴────────────┴────────────┘          │
│                         │                               │
│                 ┌───────┴───────┐                       │
│                 │   Game Loop   │                       │
│                 └───────────────┘                       │
└─────────────────────────────────────────────────────────┘
```

### Key Components

| Component | Description |
|-----------|-------------|
| **Agents System** | Manages all interactive objects in the game world |
| **Creatures System** | Handles creature AI, brains, biochemistry, and genetics |
| **World System** | Manages the game map, rooms, and environment |
| **CAOS VM** | Executes CAOS scripts for game behavior |
| **Rendering** | Displays sprites, backgrounds, and UI |
| **Serialization** | Saves and loads game worlds |

## Getting Started

### Running the Game

1. Start the backend server:
   ```bash
   cd Rebuild
   npm install
   npm start
   ```

2. Open your browser to `http://localhost:8000/Main_Game/`

### Exploring the Tools

The project includes several development tools at `http://localhost:8000/Tools/`:

- **Sprite Viewer** - View C16/S16 sprite files
- **Genome Viewer** - Analyze creature genetics
- **CAOS Catalog** - Browse the scripting language reference
- **Agent Viewer** - Inspect game agents

## Documentation Structure

This wiki is organized into several sections:

- **Getting Started** - Introduction and setup guides
- **Game Systems** - Detailed documentation of game mechanics
- **Technical Reference** - File formats and implementation details

## Next Steps

Explore these articles to learn more:

- [Biochemistry System](#/article/biochemistry-system) - How creatures metabolize chemicals
- [Brain & Neural Networks](#/article/brain-system) - How creatures make decisions
- [Binary World Format](#/article/binary-world-format) - How game saves work

## Contributing

To add new documentation:

1. Create a markdown file in the appropriate `articles/` subfolder
2. Add an entry to `articles/index.json`
3. Refresh the wiki to see your changes

For detailed instructions, see the [Articles README](../README.md).
