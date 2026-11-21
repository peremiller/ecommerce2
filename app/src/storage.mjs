const ARRAY_KEYS = new Set(["b20shop.cart", "b20shop.saved", "b20shop.orders"]);

export function readStoredValue(key, fallback, storage) {
  try {
    const store = storage ?? globalThis.localStorage;
    const raw = store.getItem(key);
    if (raw === null) return { value: fallback, blocked: false };
    const value = JSON.parse(raw);
    if (ARRAY_KEYS.has(key) && !Array.isArray(value)) throw new TypeError("Invalid saved collection");
    if (key === "b20shop.cart" && !value.every((item) =>
      item && Number.isInteger(item.id) && Number.isInteger(item.quantity) && item.quantity > 0)) {
      throw new TypeError("Invalid saved cart");
    }
    if (key === "b20shop.saved" && !value.every(Number.isInteger)) throw new TypeError("Invalid saved items");
    if (key === "b20shop.orders" && !value.every((item) => item && typeof item === "object" && !Array.isArray(item))) {
      throw new TypeError("Invalid saved order list");
    }
    if (key === "b20shop.account" && value !== null && (typeof value !== "object" || Array.isArray(value))) {
      throw new TypeError("Invalid saved demo account");
    }
    return { value, blocked: false };
  } catch {
    // Never overwrite unreadable data merely because a fallback is rendered.
    return { value: fallback, blocked: true };
  }
}

export function writeStoredValue(key, value, storage) {
  try {
    const store = storage ?? globalThis.localStorage;
    const serialized = JSON.stringify(value);
    if (typeof serialized !== "string") return false;
    store.setItem(key, serialized);
    // A storage shim may silently discard writes without throwing. Verify persistence.
    return store.getItem(key) === serialized;
  } catch {
    return false;
  }
}
