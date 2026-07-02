type CounterState = { count: number }
type CounterEvent = { type: 'increment' } | { type: 'decrement' }

export const counterTransition = (state: CounterState, event: CounterEvent): CounterState => {
  switch (event.type) {
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