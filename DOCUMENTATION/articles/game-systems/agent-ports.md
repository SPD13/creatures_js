# Input & Output Ports

The port system enables agents to communicate through signal-based connections, allowing creation of complex machine networks and interactive gadgets.

## Overview

Ports are connection points on agents that can send and receive signals:

| Port Type | Direction | Purpose |
|-----------|-----------|---------|
| **InputPort** | Receiving | Listens for signals, triggers scripts |
| **OutputPort** | Sending | Broadcasts signals to connected inputs |

### Connection Pattern

```
┌─────────────────────────────────────────────────────────────┐
│                  ONE-TO-MANY PATTERN                         │
│                                                             │
│                                    ┌──────────────────┐     │
│                               ┌───►│ Agent B (Input 0)│     │
│   ┌──────────────────┐       │    └──────────────────┘     │
│   │ Agent A          │       │                              │
│   │                  │       │    ┌──────────────────┐     │
│   │  [Output 0]──────┼───────┼───►│ Agent C (Input 1)│     │
│   │                  │       │    └──────────────────┘     │
│   └──────────────────┘       │                              │
│                              │    ┌──────────────────┐     │
│                              └───►│ Agent D (Input 0)│     │
│                                   └──────────────────┘     │
│                                                             │
│   One OutputPort can feed multiple InputPorts               │
│   Each InputPort connects to at most one OutputPort        │
└─────────────────────────────────────────────────────────────┘
```

---

## InputPort

Input ports receive signals and trigger script execution on their owning agent.

### Properties

```javascript
class InputPort extends Port {
    messageNumber: number       // Script event ID to trigger
    excitementLevel: number     // Visual feedback (0-200+)
    connectedPort: OutputPort   // Connected output (or null)
}
```

### Key Features

| Property | Description |
|----------|-------------|
| **messageNumber** | CAOS script number triggered on signal |
| **excitementLevel** | Animated glow when receiving signals |
| **connectedPort** | Reference to connected OutputPort |

### Connection Ownership

**InputPort controls the connection** - this is a critical design decision:

```javascript
// InputPort initiates connection
inputPort.connectToOutputPort(outputPort);

// Internally:
//   1. Disconnect from any existing output
//   2. Set this.connectedPort = outputPort
//   3. Call outputPort.addListener(this)

// InputPort terminates connection
inputPort.disconnectFromOutputPort();

// Internally:
//   1. Call connectedPort.removeListener(this)
//   2. Set this.connectedPort = null
```

### Script Triggering

When a signal is received:

```
Signal arrives at InputPort
        │
        ▼
Set excitementLevel = 200 (visual feedback)
        │
        ▼
Send message to owning agent:
  - messageType = inputPort.messageNumber
  - _P1_ = signal data
  - _FROM_ = sending agent
        │
        ▼
Agent's SCRP handler executes
```

---

## OutputPort

Output ports send signals to all connected input ports.

### Properties

```javascript
class OutputPort extends Port {
    listeners: InputPort[]   // Connected input ports
}
```

### Signal Method

```javascript
outputPort.signal(data);

// Implementation:
for (const inputPort of this.listeners) {
    // Visual feedback
    inputPort.excite(200);

    // Send message to input port's owner
    world.sendMessage({
        from: this.owner,
        to: inputPort.owner,
        type: inputPort.messageNumber,
        p1: data,
        p2: 0,
        delay: 0
    });
}
```

### Listener Management

```javascript
// Called by InputPort.connectToOutputPort()
outputPort.addListener(inputPort);

// Called by InputPort.disconnectFromOutputPort()
outputPort.removeListener(inputPort);

// Disconnect all listeners
outputPort.killAllConnections();
```

---

## Port Base Class

Both InputPort and OutputPort inherit from Port:

```javascript
class Port {
    owner: Agent              // Owning agent
    name: string              // Port identifier
    description: string       // Human-readable description
    relativePosition: {x, y}  // Position relative to agent center

    getWorldPosition() {
        return {
            x: this.owner.x + this.relativePosition.x,
            y: this.owner.y + this.relativePosition.y
        };
    }
}
```

---

## PortBundle

Each agent has a PortBundle that manages its ports.

### Structure

```javascript
class PortBundle {
    owner: Agent                      // Owning agent
    inputPorts: Map<id, InputPort>    // Input ports by ID
    outputPorts: Map<id, OutputPort>  // Output ports by ID
}
```

### Creating Ports

```javascript
// Create input port
portBundle.createInputPort(
    id,           // Port index (0-255)
    name,         // e.g., "Signal In"
    description,  // e.g., "Receives activation signal"
    position,     // { x, y } relative to agent
    messageNumber // Script event to trigger
);

// Create output port
portBundle.createOutputPort(
    id,           // Port index (0-255)
    name,         // e.g., "Signal Out"
    description,  // e.g., "Sends activation signal"
    position      // { x, y } relative to agent
);
```

### Accessing Ports

```javascript
// Get port by index
const inputPort = portBundle.getInputPort(0);
const outputPort = portBundle.getOutputPort(0);

// Get counts
const inputCount = portBundle.getInputPortCount();
const outputCount = portBundle.getOutputPortCount();
```

### Cleanup

```javascript
// Delete specific port
portBundle.zapInputPort(id);
portBundle.zapOutputPort(id);

// Disconnect all connections
portBundle.killAllConnections();

// Full cleanup
portBundle.trash();
```

---

## Connection Flow

### Establishing Connection

```
┌─────────────────────────────────────────────────────────────┐
│                  CONNECTION FLOW                             │
│                                                             │
│   1. User initiates connection (e.g., pointer connects)     │
│                        │                                    │
│                        ▼                                    │
│   2. inputPort.connectToOutputPort(outputPort)              │
│                        │                                    │
│                        ├── Disconnect from previous output  │
│                        │   (if any)                         │
│                        │                                    │
│                        ├── Store reference:                 │
│                        │   this.connectedPort = outputPort  │
│                        │                                    │
│                        └── Register as listener:            │
│                            outputPort.addListener(this)     │
│                        │                                    │
│                        ▼                                    │
│   3. Connection established                                 │
│      Input port now receives signals from output            │
└─────────────────────────────────────────────────────────────┘
```

### Signal Propagation

```
┌─────────────────────────────────────────────────────────────┐
│                  SIGNAL PROPAGATION                          │
│                                                             │
│   1. Agent A triggers output:                               │
│      outputPort.signal(100)                                 │
│                        │                                    │
│                        ▼                                    │
│   2. For each listener (InputPort):                         │
│                        │                                    │
│                        ├── Set excitement level (visual)    │
│                        │   inputPort.excite(200)            │
│                        │                                    │
│                        └── Queue message:                   │
│                            to: inputPort.owner              │
│                            type: inputPort.messageNumber    │
│                            p1: 100 (signal data)            │
│                        │                                    │
│                        ▼                                    │
│   3. Target agent processes message:                        │
│      SCRP [family] [genus] [species] [messageNumber]       │
│        * _P1_ contains signal data (100)                   │
│        * _FROM_ contains sending agent                     │
│      ENDM                                                   │
└─────────────────────────────────────────────────────────────┘
```

---

## CAOS Commands

### Creating Ports

```caos
* Create input port on target agent
pntr: inpt 0 "Power In" "Receives power signal" 10 20 100
* index=0, name, description
* relX=10, relY=20
* messageNumber=100 (triggers SCRP with this event)

* Create output port
pntr: outp 0 "Power Out" "Sends power signal" 50 20
* index=0, name, description
* relX=50, relY=20
```

### Connecting Ports

```caos
* Connect input port to output port
pntr: conn inputAgent 0 outputAgent 0
* Connect inputAgent's port 0 to outputAgent's port 0
```

### Sending Signals

```caos
* Send signal from output port
pntr: sign targ 0 100
* Signal from TARG's output port 0 with data 100
```

### Querying Ports

```caos
* Get input port count
setv va00 pntn targ 0
* 0 = input ports

* Get output port count
setv va01 pntn targ 1
* 1 = output ports
```

---

## Visual Feedback

Ports have visual feedback for debugging and UI purposes.

### Excitement Levels

```javascript
// When signal received
inputPort.excite(200);  // Set to max

// Each update tick
inputPort.relax(5);     // Decrease by decay rate

// Excitement affects rendering
const glowIntensity = port.excitementLevel / 200;
```

### Port Rendering

```
┌─────────────────────────────────────────────────────────────┐
│                   PORT VISUAL STATES                         │
│                                                             │
│   INPUT PORTS:                                              │
│   ● Disconnected: Dark blue circle                          │
│   ● Connected: Light blue circle                            │
│   ● Receiving signal: Pulsing blue glow                    │
│                                                             │
│   OUTPUT PORTS:                                             │
│   ● No listeners: Dark red circle                           │
│   ● Has listeners: Light red circle                         │
│   ● Sending signal: Pulsing red glow                       │
│                                                             │
│   Connection Lines:                                         │
│   ─── Dotted line from output to each connected input       │
└─────────────────────────────────────────────────────────────┘
```

---

## Use Cases

### Machine Networks

Connect multiple machines to create automated systems:

```
┌───────────┐    ┌───────────┐    ┌───────────┐
│  Button   │    │   Timer   │    │  Door     │
│           │    │           │    │           │
│ [Output]──┼───►│[Input]    │    │           │
│           │    │    [Output]┼───►│[Input]   │
└───────────┘    └───────────┘    └───────────┘

Button press → Timer starts → Timer fires → Door opens
```

### Creature Interactors

Objects that respond to creature actions:

```
┌───────────┐    ┌───────────┐
│  Sensor   │    │  Feeder   │
│           │    │           │
│ [Output]──┼───►│[Input]    │
│           │    │           │
└───────────┘    └───────────┘

Creature steps on sensor → Feeder dispenses food
```

### Daisy-Chaining

One signal triggers multiple responses:

```
                 ┌───────────┐
            ┌───►│  Light 1  │
            │    └───────────┘
┌───────────┤
│ Generator │    ┌───────────┐
│ [Output]──┼───►│  Light 2  │
│           │    └───────────┘
└───────────┤
            │    ┌───────────┐
            └───►│  Sound    │
                 └───────────┘

One generator powers multiple devices
```

---

## Serialization

Ports are saved and restored with world state.

### Binary Format

```
Port Base:
├── name (string)
├── description (string)
├── owner (AgentHandle)
└── relativePosition (x, y)

InputPort adds:
├── messageNumber (int32)
├── connectedPort (OutputPort reference)
└── excitementLevel (float32)

OutputPort adds:
├── listenerCount (int32)
└── listeners[] (InputPort references)
```

### Two-Phase Loading

1. **Phase 1**: Create all ports (without connections)
2. **Phase 2**: Restore connections after all agents loaded

This ensures referenced agents exist before connecting.

---

## Key Files

| File | Purpose |
|------|---------|
| `Port.js` | Base port class |
| `InputPort.js` | Input port implementation |
| `OutputPort.js` | Output port implementation |
| `PortBundle.js` | Port manager per agent |
| `Agent.js` | Agent integration (`myPorts`) |

---

## Related Articles

- [Agent System Overview](#/article/agents-overview) - Agent basics
- [Agent Types](#/article/agent-types) - Different agent types
- [Sprites & Display System](#/article/agent-sprites) - Rendering
