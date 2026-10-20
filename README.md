# Neon Collector

A beginner-friendly neon arcade game prototype built with HTML, CSS, JavaScript, and Canvas.

## Play the game

After publishing with GitHub Pages, add the live URL here:

https://github.com/vigneshmadasamy45/neon-collector-state-progression

## Game objective

Collect 10 energy orbs in 30 seconds. Move around the arena, avoid the red hazards, and try to win before time expires.

## Features

- Keyboard movement with WASD or arrow keys
- Touch-and-drag movement on supported mobile browsers
- Score, progress indicator, and countdown timer
- Randomly positioned energy orbs
- Moving hazards and collision penalties
- Particle bursts and floating feedback text
- Start, pause, victory, game-over, and restart states
- Responsive layout and canvas-based placeholder art
- No backend, API key, or external game asset required

## Controls

| Action | Control |
|---|---|
| Move | WASD / Arrow keys |
| Pause or resume | Space / P |
| Start or retry | Enter or the on-screen button |
| Mobile movement | Touch and drag inside the arena |

## Run locally

1. Download or clone this repository.
2. Open `index.html` in a modern browser.
3. Click **Start mission**.

For a local server, you can also run `python -m http.server 8000` in this folder and open `http://localhost:8000`.

## Project files

- `index.html` — page structure and game UI
- `style.css` — visual design and responsive styles
- `game.js` — game loop, movement, collisions, timer, and feedback
- `DESIGN_DOCUMENT.md` — one-page game design document
- `SCREEN_DESIGN.md` — screen sketches and feedback states

## Publish with GitHub Pages

1. Sign in to GitHub and create a **public** repository named `neon-collector`.
2. Upload all files from this folder to the repository root.
3. Open the repository's **Settings → Pages**.
4. Under the build/deployment source, choose **Deploy from a branch**.
5. Select the `main` branch and `/ (root)` folder, then save.
6. Wait for GitHub Pages to finish deployment.
7. Open the URL shown in the Pages settings and test the game.
8. Submit the repository URL as the single proof link. The repository includes the design documents and source code, and its README points to the playable demo.

Do not submit the example URL above as a real live demo. Replace it with the URL GitHub Pages actually provides.

## Testing checklist

- [ ] Start button begins a new round
- [ ] WASD and arrow keys move the player
- [ ] Player remains inside the arena
- [ ] Collecting an orb increases the score
- [ ] New orbs appear after collection
- [ ] Hazards move and collisions apply the time penalty
- [ ] Timer counts down and ends the round
- [ ] Collecting 10 orbs triggers victory
- [ ] Space/P pauses and resumes
- [ ] Play Again starts a fresh round
- [ ] Mobile layout and touch controls are usable
- [ ] GitHub Pages link opens without requesting access

## Known prototype limitations

- Audio is not included in this version.
- High scores are not saved between sessions.
- Touch controls use drag direction rather than a virtual joystick.
- Browser and device behavior should be tested after deployment.

## Credits

Original concept and placeholder visuals created for a beginner-friendly game development assignment. No external game art assets are required.
