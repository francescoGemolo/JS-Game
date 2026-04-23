# JS-Game

[Live Demo](https://francescogemolo.github.io/JS-Calculator/)

A simple browser-based jumping game built with vanilla JavaScript, HTML, and CSS. Inspired by the Chrome T-Rex game, the player must jump over randomly generated obstacles to survive as long as possible.

## Project Structure

The project is split into three files following a clean separation of concerns:

- `index.html` — game structure and layout
- `style.css` — visual styling of all elements
- `script.js` — all game logic

## JavaScript Logic

The game runs entirely through a set of functions and intervals, with no external libraries.

**Game state** is tracked through a handful of variables like `isStarted`, `isGameOver`, `isPaused`, `isJumping`, and `lives`. Every function checks these before doing anything.

**Jumping** works by running a `setInterval` loop that updates the player's `bottom` CSS property each frame. A `velocity` variable starts positive (moving up) and gets reduced by a `gravity` value every tick until the player lands back at the ground.

**Obstacles** are plain `div` elements created dynamically and appended to the game container. Each one has a random height and width, and moves left every 20ms by updating its `left` CSS property. Once off screen, the element is removed from the DOM.

**Collision detection** runs inside the obstacle movement loop. On every frame it checks whether the obstacle's horizontal position overlaps with the player and whether the player's current `bottom` is lower than the obstacle's height — if both are true, the player takes damage.

**Lives and invulnerability** — the player has 3 lives shown as hearts. After taking damage, an `isInvulnerable` flag is set to `true` for 1.5 seconds so the player can't immediately take damage again.

**Scoring** uses a `setInterval` that fires every second, incrementing both the time and the score by 10 points.

**Pause** stops both intervals (`gameInterval` and the obstacle spawn `setTimeout`) and records the exact timestamp. On resume, it calculates how much time was remaining before the next obstacle was due and restores it precisely.

## Team

## Team
- [Francesco](https://github.com/francescoGemolo)
- [Daniele](https://github.com/DanieleLG90)
- [Paula](https://github.com/PaulaBCdev)