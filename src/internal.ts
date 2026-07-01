const IS_DEV = process.env.NODE_ENV !== "production"

export function warn(message: string): void {
  if (!IS_DEV) return
  console.warn(message)
}

export function freeze<T>(obj: T): T {
  if (!IS_DEV) return obj;
  return deepFreeze(obj)
}

export const noop = () => {};

export function isPlainObject(value: unknown): value is Record<string, unknown> {
  if (typeof value !== "object" || value === null) return false;
  if (Array.isArray(value)) return false;

  return Object.getPrototypeOf(value) === Object.prototype;
}

function deepFreeze<T>(obj: T): T {
  if (obj === null || typeof obj !== "object") {
    return obj;
  }

  Object.freeze(obj);

  for (const key of Object.keys(obj as object)) {
    const value = (obj as any)[key];
    deepFreeze(value);
  }

  return obj;
}