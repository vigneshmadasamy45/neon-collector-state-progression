# Neon Collector — Screen Design

## Visual direction

- Background: dark navy with a subtle grid and small stars.
- Primary accent: cyan for collectibles and progress.
- Secondary accent: purple for the player and headings.
- Danger accent: red for hazards and time penalties.
- Typography: bold display headings paired with compact monospace HUD labels.

## Main gameplay wireframe

```text
┌──────────────────────────────────────────────────────────────────┐
│ ENERGY  03/10       [██████░░░░░░░░] 30% CHARGED      TIME 21.4s │
├──────────────────────────────────────────────────────────────────┤
│                                                                  │
│     ✦                         ◇                                 │
│                    ◆                                             │
│                                             ✦                    │
│             ◇                            ◆                       │
│                                                                  │
├──────────────────────────────────────────────────────────────────┤
│  ● ENERGY ORB / ● HAZARD                        MISSION ACTIVE   │
└──────────────────────────────────────────────────────────────────┘
```

Legend: `✦` player, `◇` energy orb, `◆` hazard. Actual game objects are drawn on the canvas.

## Start state

```text
             ✦
       READY PLAYER ONE
         Enter the arena
 Collect 10 energy orbs before time runs out.
       [ START MISSION ↗ ]
 WASD / ARROWS TO MOVE · SPACE TO PAUSE
```

Purpose: communicates the objective and controls before play begins.

## Pause state

```text
               Ⅱ
              Paused
 The arena is on hold. Resume when ready.
          [ RESUME MISSION ↗ ]
```

Purpose: freezes the round and clearly indicates how to continue.

## Victory state

```text
               ✦
         ENERGY RESTORED
       You lit up the dark.
  All 10 energy orbs collected successfully.
             [ PLAY AGAIN ↗ ]
```

Purpose: celebrates success and provides a clear replay action.

## Game-over state

```text
               ↻
            TIME EXPIRED
             Run ended.
       Your score: X / 10 orbs.
             [ PLAY AGAIN ↗ ]
```

Purpose: communicates the outcome without ambiguity and allows immediate retry.

## Feedback checklist

- Score and progress update after every collection.
- Collection produces a cyan burst and `+1 ENERGY` text.
- Hazard collision produces red particles and `−2 SEC` text.
- Timer turns red near the end of the round.
- Pause, victory, and game-over states each use a distinct overlay.
- Buttons remain visible and usable at narrow screen widths.
