import { createActor } from "./actor";
import type { Actor, MachineConfig } from "./types";

export function createMachine<State, Event>(
  config: MachineConfig<State, Event>
): Actor<State, Event> {
  return createActor(config)
}