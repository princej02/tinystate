import { describe, expect, test } from 'bun:test'
import { createMachine } from '../../src'
import { counterTransition } from './counter'
import { gameTransition } from './game'

describe('createMachine', () => {
  test('returns actor with three methods', () => {
    const counter = createMachine({
      initial: { count: 0 },
      transition: counterTransition
    })

    expect(counter.getState).toBeTypeOf('function')
    expect(counter.send).toBeTypeOf('function')
    expect(counter.subscribe).toBeTypeOf('function')
  })

  test('getState returns initial state', () => {
    const counter = createMachine({
      initial: { count: 42 },
      transition: () => ({ count: 0 })
    })

    expect(counter.getState()).toEqual({ count: 42 })
  })

  test('send transitions state', () => {
    const counter = createMachine({
      initial: { count: 0 },
      transition: counterTransition
    })

    counter.send({ type: 'increment' })
    expect(counter.getState()).toEqual({ count: 1 })
  })

  test('send handles multiple transitions in sequence', () => {
    const counter = createMachine({
      initial: { count: 0 },
      transition: counterTransition
    })

    counter.send({ type: 'increment' })
    counter.send({ type: 'increment' })
    counter.send({ type: 'decrement' })
    expect(counter.getState()).toEqual({ count: 1 })
  })

  test('send returns void (not state)', () => {
    const counter = createMachine({
      initial: { count: 0 },
      transition: counterTransition
    })

    const result = counter.send({ type: 'increment' })
    expect(result).toBeUndefined()
  })

  test('multiple actors from same config are isolated', () => {
    const config = {
      initial: { count: 0 },
      transition: counterTransition
    }

    const actor1 = createMachine(config)
    const actor2 = createMachine(config)

    actor1.send({ type: 'increment' })
    actor1.send({ type: 'increment' })

    expect(actor1.getState()).toEqual({ count: 2 })
    expect(actor2.getState()).toEqual({ count: 0 })
  })

  test('state is immutable after transitions', () => {
    const counter = createMachine({
      initial: { count: 0},
      transition: counterTransition
    })

    counter.send({ type: 'increment' })
    const state = counter.getState()

    expect(() => {
      state.count = 999
    }).toThrow()

    expect(counter.getState()).toEqual({ count: 1 })
  })

  test('works with complex state shapes', () => {
    const game = createMachine({
      initial: { phase: 'mainMenu' },
      transition: gameTransition
    })

    expect(game.getState()).toEqual({ phase: 'mainMenu' })

    game.send('start')
    expect(game.getState()).toEqual({ phase: 'playing', score: 0, level: 1 })

    game.send('die')
    expect(game.getState()).toEqual({ phase: 'gameOver', finalScore: 0 })

    game.send('restart')
    expect(game.getState()).toEqual({ phase: 'mainMenu' })
  })
})