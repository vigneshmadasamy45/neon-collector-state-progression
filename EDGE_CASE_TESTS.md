# Edge-Case Test Checklist

Use this checklist after replacing the project files and opening the updated game. Mark each test only after performing it in a browser.

| # | Test | Expected result | Result |
|---:|---|---|---|
| 1 | Load the page for the first time | Ready overlay appears; score is 00; timer is 30.0s | [ ] |
| 2 | Click Start Mission once | One new round starts | [ ] |
| 3 | Click repeatedly while playing | No duplicate round or state corruption | [ ] |
| 4 | Press Space while playing | Game pauses and timer stops | [ ] |
| 5 | Press Space while paused | Game resumes and timer continues | [ ] |
| 6 | Click Resume while paused | Overlay closes and game resumes | [ ] |
| 7 | Press pause repeatedly after pausing | State remains paused; no invalid transition | [ ] |
| 8 | Collect one orb | Score increases by exactly one | [ ] |
| 9 | Reach five collected orbs | Difficulty label becomes INTENSE; hazards move faster | [ ] |
| 10 | Reach ten collected orbs | Win overlay appears exactly once | [ ] |
| 11 | Allow timer to reach zero before target | Lose overlay appears; timer does not become negative | [ ] |
| 12 | Hit a hazard | Two seconds are deducted and player returns to start area | [ ] |
| 13 | Restart after winning | Score and timer reset; saved best score remains | [ ] |
| 14 | Restart after losing | Fresh round starts without stale particles or old score | [ ] |
| 15 | Beat the previous best score | Best score updates | [ ] |
| 16 | Refresh the page | Best score is restored from local storage | [ ] |
| 17 | Clear/disable local storage and reload | Game remains playable even if saving is unavailable | [ ] |
| 18 | Move against each arena edge | Player stays inside the arena | [ ] |
| 19 | Switch tabs while playing | Game pauses on window blur | [ ] |
| 20 | Test a narrow/mobile viewport | Layout remains readable; touch drag movement works | [ ] |

## Test report

Do not mark a test as passed until it has been manually checked in a browser. Record any unexpected behavior and browser/device details here.
