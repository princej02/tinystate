export interface Actor<State, Event> {
  getState: () => State
  send: (event: Event) => void
  subscribe: (listener: (state: State) => void) => () => void
}

export type Listener<State> = (state: State) => void
export type Subscribers<State> = Set<Listener<State>>

export type MachineConfig<State, Event> = {
  initial: State
  transition: (state: State, event: Event) => State
}