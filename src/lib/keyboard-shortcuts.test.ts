import { describe, expect, it } from "vitest";

import {
  filterShortcutGroups,
  SHORTCUT_GROUPS,
  shortcutKeysForPlatform,
} from "./keyboard-shortcuts";

describe("keyboard-shortcuts", () => {
  it("defines unique IDs and non-empty key lists for all shortcuts", () => {
    const ids = new Set<string>();

    for (const group of SHORTCUT_GROUPS) {
      expect(group.category.length).toBeGreaterThan(0);
      expect(group.items.length).toBeGreaterThan(0);

      for (const item of group.items) {
        expect(ids.has(item.id)).toBe(false);
        ids.add(item.id);

        expect(item.description.length).toBeGreaterThan(0);
        expect(item.macKeys.length).toBeGreaterThan(0);
        expect(item.winKeys.length).toBeGreaterThan(0);
      }
    }
  });

  it("resolves correct keys for Mac and Windows", () => {
    const sampleItem = {
      id: "test",
      description: "Test shortcut",
      macKeys: ["⌘", "K"],
      winKeys: ["Ctrl", "K"],
    };

    expect(shortcutKeysForPlatform(sampleItem, true)).toEqual(["⌘", "K"]);
    expect(shortcutKeysForPlatform(sampleItem, false)).toEqual(["Ctrl", "K"]);
  });

  it("filters shortcut groups by search query", () => {
    const all = filterShortcutGroups(SHORTCUT_GROUPS, "");
    expect(all.length).toBe(SHORTCUT_GROUPS.length);

    const nav = filterShortcutGroups(SHORTCUT_GROUPS, "palette");
    expect(nav.length).toBe(1);
    expect(nav[0]?.items[0]?.id).toBe("command-palette");

    const byKey = filterShortcutGroups(SHORTCUT_GROUPS, "Esc", true);
    expect(byKey.some((g) => g.items.some((i) => i.id === "close-panel"))).toBe(true);

    const empty = filterShortcutGroups(SHORTCUT_GROUPS, "nonexistent-query-12345");
    expect(empty.length).toBe(0);
  });
});
