/** Visual emphasis for an element during an operation. */
export type Mark = "active" | "new" | "removed" | "found" | "path";

/** One animation frame produced by a data-structure operation. */
export type DSFrame<S> = {
  state: S;
  /** Element key → emphasis. Keys are indices, node ids or labels, per structure. */
  marks: Record<string, Mark>;
  message: string;
};

/** Result of an operation: frames to animate, ending in the new state. */
export type OpResult<S> = {
  frames: DSFrame<S>[];
  /** True when the operation was rejected (e.g. overflow, missing value). */
  error?: boolean;
};

export const frame = <S,>(state: S, message: string, marks: Record<string, Mark> = {}): DSFrame<S> => ({
  state,
  marks,
  message,
});

export const fail = <S,>(state: S, message: string): OpResult<S> => ({ frames: [frame(state, message)], error: true });
