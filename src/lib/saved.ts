export type SavedItem = {
  id: string;
  tool: string;
  title: string;
  content: string;
  createdAt: number;
};

const SAVED_KEY = "bizpilot.saved";
const HANDOFF_KEY = "bizpilot.handoff";

function isBrowser() {
  return typeof window !== "undefined";
}

export function getSavedItems(): SavedItem[] {
  if (!isBrowser()) return [];
  try {
    return JSON.parse(window.localStorage.getItem(SAVED_KEY) ?? "[]") as SavedItem[];
  } catch {
    return [];
  }
}

export function saveItem(item: Omit<SavedItem, "id" | "createdAt">): SavedItem {
  const full: SavedItem = {
    ...item,
    id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    createdAt: Date.now(),
  };
  if (!isBrowser()) return full;
  const items = [full, ...getSavedItems()].slice(0, 50);
  window.localStorage.setItem(SAVED_KEY, JSON.stringify(items));
  return full;
}

export function removeItem(id: string) {
  if (!isBrowser()) return;
  window.localStorage.setItem(
    SAVED_KEY,
    JSON.stringify(getSavedItems().filter((i) => i.id !== id)),
  );
}

/** Cross-tool handoff: one tool's output prefills another tool's input. */
export function setHandoff(tool: string, text: string) {
  if (!isBrowser()) return;
  window.localStorage.setItem(`${HANDOFF_KEY}.${tool}`, text);
}

export function takeHandoff(tool: string): string | null {
  if (!isBrowser()) return null;
  const key = `${HANDOFF_KEY}.${tool}`;
  const value = window.localStorage.getItem(key);
  if (value) window.localStorage.removeItem(key);
  return value;
}
