import type { Actor, Listener, MachineConfig, Subscribers } from "./types";
import { freeze, warn } from "../internal";

export function createActor<State, Event>(
  config: MachineConfig<State, Event>
): Actor<State, Event> {
  let current = config.initial
  
  const listeners: Subscribers<State> = new Set()
  
  return {
    getState: () => current,
    
    send: (event: Event) => {
      const next = config.transition(current, event)
      
      // Reference equality check catches mutation bugs.
      // Note: won't catch new objects with identical values - fine for v1.
      if (next === current) {
        warn(`Event didn't change state`)
      }
      // 6. Freeze and update state (handles dev/prod internally)
      current = freeze(next)
      // 7. Notify all subscribers
      listeners.forEach(listener => listener(current))
    },
    
    subscribe: (listener: Listener<State>) => {
      listeners.add(listener)
      listener(current)
      return () => listeners.delete(listener)
    }
  }
}