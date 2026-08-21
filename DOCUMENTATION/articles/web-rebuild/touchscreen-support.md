# Touchscreen Support

The Web Rebuild plays on tablets and touch-capable laptops. When the engine detects a touch device it auto-enables touchscreen mode: gestures are translated to the engine's existing mouse and keyboard events so no game logic needs special-casing.

This article documents how the detection works, the gesture mapping, and the on-screen options available in touchscreen mode.

## Activation: Auto-Detection

Touchscreen mode is activated automatically by `InputManager.detectInputMethod()`. A device is considered a touch device when **both** of these are true:

1. The device exposes touch hardware — `navigator.maxTouchPoints > 0` or `'ontouchstart' in window`.
2. The primary pointer is coarse — `window.matchMedia('(pointer: coarse)').matches`.

Requiring both conditions catches iPads, Android tablets, and Windows tablets while ignoring desktops or hybrid laptops with a precise mouse attached. The detected method is exposed via:

- `inputManager.getInputMethod()` → `"Touch"` or `"Mouse + Keyboard"`
- `inputManager.isTouchMode()` → `boolean`

The current value is shown live in the **Input** tab of the debug console (right-hand "Current Input State" panel, top section labelled **Input Method**).

## Gesture Mapping

All gestures are recognised on the game canvas and translated into the same `mousedown` / `mouseup` / `mousemove` / camera-pan events the engine already responds to. The recognizer lives in `InputManager.handleTouchStart/Move/End`.

| Gesture | Effect | Engine event(s) |
|---|---|---|
| One-finger drag | Move the cursor | `mousemove` at finger position (no buttons held) |
| One-finger tap | Left click | `mousedown` then `mouseup`, button = 0 |
| Two-finger tap | Right click | `mousedown` then `mouseup`, button = 2 |
| Two-finger swipe (any direction) | Pan the camera | Direct `Camera.moveBy(-Δx / zoom, -Δy / zoom)` |

### Tap thresholds

A touch counts as a tap (rather than a drag) only when **both** apply:

- Total duration ≤ **250 ms** (`TOUCH_TAP_DURATION_MS`)
- No finger has drifted more than **12 px** from its start position (`TOUCH_TAP_MAX_DRIFT_PX`)

If either threshold is exceeded the gesture is treated as a drag and no synthetic click is emitted at release.

### Two-finger pan details

The world follows your fingers — i.e. swiping two fingers right pans the camera left, revealing more of the world to the right. The pan delta is computed from the centroid of the two touches between successive `touchmove` events and divided by the camera zoom so the perceived speed is consistent at any zoom level.

Three or more simultaneous fingers cancel any pending tap. Adding a second finger during a one-finger drag promotes the gesture to a two-finger pan.

### Page scroll / pinch

The canvas touch listeners are registered with `{ passive: false }` and call `preventDefault()` on every touch event. This prevents the browser from scrolling the page or triggering pinch-to-zoom while you interact with the game.

## On-Screen Keyboard Button

A keyboard glyph button (`⌨`) appears just below the floating menu burger button **only on touch devices**. Tapping it summons the OS soft keyboard:

- Tap once to open the keyboard.
- Tap again to dismiss it.
- A green outline indicates the keyboard capture is currently focused.

Internally this focuses a hidden 1×1 transparent `<input class="fm-keyboard-capture">` element. The OS keyboard then dispatches normal `keydown` / `keyup` events to the document, where `InputManager`'s standard listeners pick them up. `InputManager.isInputFieldFocused()` explicitly exempts the `fm-keyboard-capture` class so its focus does not suppress key delivery to the game.

The button is created in `FloatingMenu._buildKeyboardButton()` and is hidden on desktops where a physical keyboard is always available.

## Floating Windows on Touch

The minimap and the popout floating menu windows (Zoom, Speed, World) are draggable and resizable by **touch as well as mouse**. The titlebar and resize handle use Pointer Events (`pointerdown` / `pointermove` / `pointerup`) with `setPointerCapture`, so the same code path drives mouse, touch, and pen input.

CSS `touch-action: none` on the titlebar and resize handle prevents the browser from hijacking the gesture for scrolling or pinch-zoom while you drag.

## What Is Not Yet Supported

- Pinch-to-zoom (use the +/− buttons in the floating menu).
- Long-press → right-click (use a two-finger tap).
- Edge scrolling (designed for a hovering mouse cursor, not touch).

## Implementation Files

| File | Role |
|---|---|
| `Main_Game/src/engine/input/InputManager.js` | Detection, gesture recognizer, synthetic mouse events, camera pan call, keyboard-capture focus exemption |
| `Main_Game/src/game/ui/InputDebugModule.js` | "Input Method" row in the Input debugger right panel |
| `Main_Game/src/game/ui/FloatingMenu.js` | Keyboard button creation, hidden capture input, conditional rendering |
| `Main_Game/src/game/ui/FloatingWindow.js` | Pointer-event drag and resize for all popout windows |

## Verification

1. **Desktop (Chrome DevTools device emulation)** — open the device toolbar, switch to iPad, reload the game. The Input debugger should show **Input Method: Touch**. Single-tap on the canvas to log a left-click; Alt-drag (DevTools two-finger simulation) to test the right-click; drag with two simulated fingers to pan the camera.
2. **Real touch device** — confirm the keyboard `⌨` button appears below the burger menu, opens the OS keyboard when tapped, and that typing produces `keydown` events visible in the Input debugger.
3. **Desktop with a mouse** — Input Method must read **Mouse + Keyboard** and the keyboard button must be absent. Existing arrow-key pan, middle-mouse drag, and wheel scroll behave exactly as before.
