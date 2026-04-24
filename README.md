# JS-Game

[Live Demo](https://github.com/francescoGemolo/JS-Game)

A simple browser-based jumping game built with vanilla JavaScript, HTML, and CSS. Inspired by the Chrome T-Rex game, the player must jump over randomly generated obstacles to survive as long as possible.

## Project Structure

The project is split into three files following a clean separation of concerns:

- `index.html` — game structure and layout
- `style.css` — visual styling of all elements
- `script.js` — all game logic

## JavaScript Logic

The game is controlled by a central state machine tracking `isStarted`, `isGameOver`, `isPaused`, `isJumping`, and `isInvulnerable`. The main loop drives background parallax through `requestAnimationFrame`, while discrete intervals handle scoring, obstacle spawning, and character animations.

**Player states** are managed via CSS classes (`state-idle`, `state-walk-a`, `state-walk-b`, `state-jump`, `state-hit`). A walk cycle alternates between two frames at 150ms intervals when grounded. On jump, a velocity-based physics system (initial velocity 15, gravity 1) updates the `bottom` position every 20ms until landing.

**Parallax background** consists of three layers moving at 0.1×, 0.4×, and 0.6× speeds relative to a shared `posX` counter, creating depth as the game progresses.

**Obstacles** are dynamically generated `div` elements with random heights (20–60px) and widths (15–40px). They spawn at `left: 600px` and move left by `gameSpeed` pixels every 20ms. Upon leaving the viewport, they're removed from the DOM.

**Collision detection** runs inside each obstacle's movement loop, checking horizontal overlap (obstacle between 50 and 100px from the left edge) and whether the player's current `bottom` is below the obstacle's height. Collisions trigger `takeDamage()` only if the player is not invulnerable.

**Lives and invulnerability** — three hearts are hidden sequentially on damage. After a hit, `isInvulnerable` locks further damage for 1.5 seconds, during which the player receives a visual "invulnerable" class.

**Scoring and difficulty** — every second, `timeElapsed` and `score` increase by 10. For every 100 points, `gameSpeed` increases by 1.5 and `obstacleInterval` decreases by 200ms (capped at 700ms minimum), making the game progressively faster.

**Pause/Resume** stops all intervals and timers, storing the remaining time until the next obstacle. On resume, it recalculates and restores the exact timeout, resumes animations, and restarts background music if unmuted.

**Audio** uses three `Audio` objects: jump, damage, and looping background music. A volume toggle mutes all sounds and updates the button icon accordingly.

## Team
- [Daniele](https://github.com/DanieleLG90)
- [Francesco](https://github.com/francescoGemolo)
- [Paula](https://github.com/PaulaBCdev)