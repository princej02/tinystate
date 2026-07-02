export type GameState =
  | { phase: 'playing'; score: number; level: number }
  | { phase: 'gameOver'; finalScore: number }
  | { phase: 'mainMenu' }
  | { phase: 'paused'; score: number; level: number }


export type Event = 'start' | 'pause' | 'resume' | 'die' | 'restart'


export function gameTransition(state: GameState, action: Event): GameState {
  switch (state.phase) {
    case 'mainMenu': {
      if (action === 'start') {
        return { phase: 'playing', level: 1, score: 0 }
      }
      return state
    }
    case 'playing': {
      if (action === 'pause') {
        return { phase: 'paused', score: state.score, level: state.level }
      } else if (action === 'die') {
        return { phase: 'gameOver', finalScore: state.score }
      }
      return state
    }
    case 'paused': {
      if (action === 'resume') {
        return { phase: 'playing', score: state.score, level: state.level }
      }
      return state
    }
    case 'gameOver': {
      if (action === 'restart') {
        return { phase: 'mainMenu' }
      }
      return state
    }
    default:
      const _exhaustive: never = state
      return _exhaustive
  }
}