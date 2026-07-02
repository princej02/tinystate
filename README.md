# tinystate - v1.0.0

A tiny, type-safe state machine with exhaustive event handling.

## Features

- 🎯 **Type-safe** — Invalid events are caught at compile time
- 🔒 **Immutable** — State is frozen in development to prevent mutations
- 📦 **Tiny** — Zero dependencies, ~1KB minified
- 🧩 **Exhaustive switches** — TypeScript ensures all events are handled
- 🎭 **Flexible** — States can have different shapes

## Installation

```bash
npm install tinystate
# or
bun add tinystate
# or
yarn add tinystate
```

## Getting started

```ts
import { createMachine } from 'tinystate'

const counter = createMachine({
  initial: { count: 0 },
  transition: (state, event) => {
    switch (event.type) {
      case 'INCREMENT': return { count: state.count + 1 }
      case 'DECREMENT': return { count: state.count - 1 }
      default: { const _exhaustive: never = event; return state }
    }
  }
})

counter.subscribe(state => console.log(state.count))
counter.send({ type: 'INCREMENT' }) // logs 1
```

### Advanced example

```ts
import { createMachine } from 'tinystate'
// A game state machine with different phase shapes
type GameState = 
  | { phase: 'menu' }
  | { phase: 'playing'; score: number; lives: number; position: { x: number; y: number } }
  | { phase: 'gameOver'; finalScore: number }
type GameEvent = 
  | { type: 'START' }
  | { type: 'MOVE'; x: number; y: number }
  | { type: 'SCORE'; points: number }
  | { type: 'LOSE_LIFE' }
  | { type: 'GAME_OVER' }

const game = createMachine<GameState, GameEvent>({
  initial: { phase: 'menu' },
  transition: (state, event) => {
    switch (event.type) {
      case 'START':
        if (state.phase === 'menu' || state.phase === 'gameOver') {
          return { phase: 'playing', score: 0, lives: 3, position: { x: 0, y: 0 } }
        }
        return state
      
      case 'MOVE':
        if (state.phase === 'playing') {
          return { ...state, position: { x: event.x, y: event.y } }
        }
        return state
      
      case 'SCORE':
        if (state.phase === 'playing') {
          return { ...state, score: state.score + event.points }
        }
        return state
      
      case 'LOSE_LIFE':
        if (state.phase === 'playing') {
          const lives = state.lives - 1
          if (lives === 0) {
            return { phase: 'gameOver', finalScore: state.score }
          }
          return { ...state, lives }
        }
        return state
      
      case 'GAME_OVER':
        if (state.phase === 'playing') {
          return { phase: 'gameOver', finalScore: state.score }
        }
        return state
      
      default:
        const _exhaustive: never = event
        return state
    }
  }
})
// Use it
game.subscribe(state => {
  if (state.phase === 'playing') {
    console.log(`Score: ${state.score}, Lives: ${state.lives}`)
  }
})
game.send({ type: 'START' })
game.send({ type: 'SCORE', points: 100 })
```

## Stability

tinystate v1.0.0 follows semantic versioning:

- PATCH: Internal optimizations, better error messages, documentation fixes, and bug fixes that don't change behavior.

- MINOR: New optional methods on the actor (e.g. onTransition, reset), new config options (e.g. context, middleware), or additional helper exports. Existing code continues to work unchanged.

- MAJOR: Changing createMachine signature, removing or renaming getState/send/subscribe, changing send to return a value, breaking the default: never exhaustiveness check, or dropping Node.js 18 support.

The promise: Any code written for v1.0.0 works in all v1.x.x releases.
