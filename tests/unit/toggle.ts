type ToggleState = { on: boolean }
type ToggleE = 'toggle'

export const toggleTransition = (state: ToggleState, event: ToggleE): ToggleState => {
  switch (event) {
    case 'toggle':
      return { on: !state.on }
    default: {
      const _exhaustive: never = event
      return _exhaustive
    }
  }
}