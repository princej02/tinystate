import { describe, expect, test, mock } from 'bun:test'
import { createMachine } from '../../src'

describe('integration: examples', () => {
  test('counter example works end-to-end', () => {
    const counter = createMachine({
      initial: { count: 0 },
      transition: (state, event: 'increment' | 'decrement') => {
        switch (event) {
          case 'increment':
            return { count: state.count + 1 }
          case 'decrement':
            return { count: state.count - 1 }
          default: {
            const _exhaustive: never = event
            return _exhaustive
          }
        }
      }
    })

    const listener = mock(() => {})
    counter.subscribe(listener)

    expect(counter.getState()).toEqual({ count: 0 })
    expect(listener).toHaveBeenCalledWith({ count: 0 })

    counter.send('increment')
    expect(counter.getState()).toEqual({ count: 1 })
    expect(listener).toHaveBeenCalledWith({ count: 1 })

    counter.send('increment')
    expect(counter.getState()).toEqual({ count: 2 })
    expect(listener).toHaveBeenCalledWith({ count: 2 })

    counter.send('decrement')
    expect(counter.getState()).toEqual({ count: 1 })
    expect(listener).toHaveBeenCalledWith({ count: 1 })
  })

  test('toggle example works end-to-end', () => {
    const toggle = createMachine({
      initial: { on: false },
      transition: (state, event: 'toggle' ) => {
        switch (event) {
          case 'toggle':
            return { on: !state.on }
          default: {
            const _exhaustive: never = event
            return _exhaustive
          }
        }
      }
    })

    const listener = mock(() => {})
    toggle.subscribe(listener)

    expect(toggle.getState()).toEqual({ on: false })
    expect(listener).toHaveBeenCalledWith({ on: false })

    toggle.send('toggle')
    expect(toggle.getState()).toEqual({ on: true })
    expect(listener).toHaveBeenCalledWith({ on: true })

    toggle.send('toggle')
    expect(toggle.getState()).toEqual({ on: false })
    expect(listener).toHaveBeenCalledWith({ on: false })
  })

  test('traffic light example works end-to-end', () => {
    type TrafficState = { color: 'red' | 'green' | 'amber' }

    const trafficLight = createMachine<TrafficState, 'next'>({
      initial: { color: 'red' },
      transition: (state, event) => {
        switch (event) {
          case 'next': {
            const next = {
              red: 'green',
              green: 'amber',
              amber: 'red'
            } as const
            return { color: next[state.color] }
          }
          default: {
            const _exhaustive: never = event
            return state
          }
        }
      }
    })

    const listener = mock(() => {})
    trafficLight.subscribe(listener)

    expect(trafficLight.getState()).toEqual({ color: 'red' })
    expect(listener).toHaveBeenCalledWith({ color: 'red' })

    trafficLight.send('next')
    expect(trafficLight.getState()).toEqual({ color: 'green' })
    expect(listener).toHaveBeenCalledWith({ color: 'green' })

    trafficLight.send('next')
    expect(trafficLight.getState()).toEqual({ color: 'amber' })
    expect(listener).toHaveBeenCalledWith({ color: 'amber' })

    trafficLight.send('next')
    expect(trafficLight.getState()).toEqual({ color: 'red' })
    expect(listener).toHaveBeenCalledWith({ color: 'red' })
  })

  test('game example with state shape changes', () => {
    type GameState =
      | { phase: 'menu' }
      | { phase: 'playing'; score: number; lives: number }
      | { phase: 'gameOver'; finalScore: number }

    const game = createMachine<GameState, 'start' | 'die' | 'restart'>({
      initial: { phase: 'menu' },
      transition: (state, event) => {
        switch (state.phase) {
          case 'menu': {
            if (event === 'start') {
              return { phase: 'playing', score: 0, lives: 3 }
            }
            return state
          }
          case 'playing': {
            if (event === 'die') {
              return { phase: 'gameOver', finalScore: state.score }
            }
            return state
          }
          case 'gameOver': {
            if (event === 'restart') {
              return { phase: 'menu' }
            }
            return state
          }
          default: {
            const _exhaustive: never = state
            return state
          }
        }
      }
    })

    const listener = mock(() => {})
    game.subscribe(listener)

    // Menu → Playing
    game.send('start')
    expect(game.getState()).toEqual({ phase: 'playing', score: 0, lives: 3 })
    expect(listener).toHaveBeenCalledWith({ phase: 'playing', score: 0, lives: 3 })

    // Playing → Game Over
    game.send('die')
    expect(game.getState()).toEqual({ phase: 'gameOver', finalScore: 0 })
    expect(listener).toHaveBeenCalledWith({ phase: 'gameOver', finalScore: 0 })

    // Game Over → Menu
    game.send('restart')
    expect(game.getState()).toEqual({ phase: 'menu' })
    expect(listener).toHaveBeenCalledWith({ phase: 'menu' })
  })

  test('multiple actors from same config work independently', () => {
    const config = {
      initial: { count: 0 },
      transition: (state: { count: number }, event: 'increment') => {
        switch (event) {
          case 'increment':
            return { count: state.count + 1 }
          default: {
            const _exhaustive: never = event
            return state
          }
        }
      }
    }

    const actor1 = createMachine(config)
    const actor2 = createMachine(config)

    const listener1 = mock(() => {})
    const listener2 = mock(() => {})

    actor1.subscribe(listener1)
    actor2.subscribe(listener2)

    actor1.send('increment')
    actor1.send('increment')

    expect(actor1.getState()).toEqual({ count: 2 })
    expect(actor2.getState()).toEqual({ count: 0 })

    expect(listener1).toHaveBeenCalledWith({ count: 2 })
    expect(listener2).not.toHaveBeenCalledWith({ count: 2 })
  })
})