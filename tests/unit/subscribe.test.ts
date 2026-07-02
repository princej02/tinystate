import { describe, expect, test, mock } from 'bun:test'
import { createMachine } from '../../src'
import { counterTransition } from './counter'

describe('subscribe', () => {
  test('calls listener immediately with current state', () => {
    const actor = createMachine({
      initial: { count: 42 },
      transition: counterTransition
    })

    const listener = mock(() => {})
    
    actor.subscribe(listener)
    
    expect(listener).toHaveBeenCalledTimes(1)
    expect(listener).toHaveBeenCalledWith({ count: 42 })
  })

  test('calls listener on every state change', () => {
    const actor = createMachine({
      initial: { count: 0 },
      transition: counterTransition
    })

    const listener = mock(() => {})
    
    actor.subscribe(listener)
    expect(listener).toHaveBeenCalledTimes(1)
    expect(listener).toHaveBeenCalledWith({ count: 0 })
    
    actor.send({ type: 'increment' })
    expect(listener).toHaveBeenCalledTimes(2)
    expect(listener).toHaveBeenCalledWith({ count: 1 })
    
    actor.send({ type: 'increment' })
    expect(listener).toHaveBeenCalledTimes(3)
    expect(listener).toHaveBeenCalledWith({ count: 2 })
  })

  test('returns unsubscribe function that stops future notifications', () => {
    const actor = createMachine({
      initial: { count: 0 },
      transition: counterTransition
    })

    const listener = mock(() => {})
    
    const unsubscribe = actor.subscribe(listener)
    expect(listener).toHaveBeenCalledTimes(1) // Immediate call
    
    actor.send({ type: 'increment' })
    expect(listener).toHaveBeenCalledTimes(2)
    
    unsubscribe()
    
    actor.send({ type: 'increment' })
    expect(listener).toHaveBeenCalledTimes(2) // No more calls
  })

  test('multiple subscribers all receive updates', () => {
    const actor = createMachine({
      initial: { count: 0 },
      transition: counterTransition
    })

    const listener1 = mock(() => {})
    const listener2 = mock(() => {})
    
    actor.subscribe(listener1)
    actor.subscribe(listener2)
    
    expect(listener1).toHaveBeenCalledTimes(1)
    expect(listener2).toHaveBeenCalledTimes(1)
    
    actor.send({ type: 'increment' })
    
    expect(listener1).toHaveBeenCalledTimes(2)
    expect(listener2).toHaveBeenCalledTimes(2)
  })

  test('subscribers are independent - unsubscribing one does not affect others', () => {
    const actor = createMachine({
      initial: { count: 0 },
      transition: counterTransition
    })

    const listener1 = mock(() => {})
    const listener2 = mock(() => {})
    
    const unsubscribe1 = actor.subscribe(listener1)
    actor.subscribe(listener2)
    
    expect(listener1).toHaveBeenCalledTimes(1)
    expect(listener2).toHaveBeenCalledTimes(1)
    
    unsubscribe1()
    
    actor.send({ type: 'increment' })
    
    expect(listener1).toHaveBeenCalledTimes(1) // No more calls
    expect(listener2).toHaveBeenCalledTimes(2) // Still receiving
  })
})