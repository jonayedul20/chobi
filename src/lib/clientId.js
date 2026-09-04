// Anonymous per-browser id for guests. Not authentication — just enough
// identity for a favorite to toggle instead of stacking duplicates.
const KEY = "chobi_client_id";

export function getClientId() {
  try {
    let id = localStorage.getItem(KEY);
    if (!id) {
      id = crypto.randomUUID
        ? crypto.randomUUID()
        : `${Date.now()}-${Math.random().toString(36).slice(2)}`;
      localStorage.setItem(KEY, id);
    }
    return id;
  } catch {
    // Storage can be blocked (private mode); hearts then last one page view.
    return "anon";
  }
}
