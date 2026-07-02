type TrafficState = { color: 'red' | 'green' | 'amber' }
type TrafficEvent = 'next'

export const trafficTransition = (state: TrafficState, event: TrafficEvent): TrafficState => {
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
      return _exhaustive
    }
  }
}