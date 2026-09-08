import { describe, expect, it } from "vitest";

import type { Message } from "@/state/store";
import {
  formatExportDate,
  formatMessageTime,
  formatTranscriptMarkdown,
  slugifyTranscriptFilename,
} from "./export-transcript";

describe("export-transcript", () => {
  const fixedDate = new Date("2026-09-08T12:00:00Z");

  it("formats an empty conversation cleanly", () => {
    const markdown = formatTranscriptMarkdown({
      title: "Coder",
      messages: [],
      exportedAt: fixedDate,
    });

    expect(markdown).toContain("# Conversation with Coder");
    expect(markdown).toContain("No messages in this conversation yet.");
  });

  it("formats 1:1 conversation with user and bot turns", () => {
    const messages: Message[] = [
      {
        id: "m1",
        role: "user",
        kind: "text",
        text: "Hello, can you help me refactor this code?",
        at: new Date("2026-09-08T12:01:00Z").getTime(),
      },
      {
        id: "m2",
        role: "bot",
        kind: "text",
        text: "Of course! Here is the refactored version:\n\n```ts\nconst x = 1;\n```",
        at: new Date("2026-09-08T12:02:00Z").getTime(),
      },
    ];

    const markdown = formatTranscriptMarkdown({
      title: "Coder",
      messages,
      botName: "Coder",
      exportedAt: fixedDate,
    });

    expect(markdown).toContain("# Conversation with Coder");
    expect(markdown).toContain("### **User**");
    expect(markdown).toContain("Hello, can you help me refactor this code?");
    expect(markdown).toContain("### **Coder**");
    expect(markdown).toContain("Of course! Here is the refactored version:");
    expect(markdown).toContain("const x = 1;");
  });

  it("formats group channel conversation with multiple distinct bot senders", () => {
    const messages: Message[] = [
      {
        id: "m1",
        role: "user",
        kind: "text",
        text: "Team, what is the status?",
        at: new Date("2026-09-08T12:01:00Z").getTime(),
      },
      {
        id: "m2",
        role: "bot",
        kind: "text",
        text: "Research is complete.",
        from: { botId: "b1", name: "Researcher", color: "blue" },
        at: new Date("2026-09-08T12:02:00Z").getTime(),
      },
      {
        id: "m3",
        role: "bot",
        kind: "text",
        text: "Implementation is in progress.",
        from: { botId: "b2", name: "Builder", color: "orange" },
        at: new Date("2026-09-08T12:03:00Z").getTime(),
      },
    ];

    const markdown = formatTranscriptMarkdown({
      title: "Project Alpha",
      messages,
      isGroup: true,
      exportedAt: fixedDate,
    });

    expect(markdown).toContain("# Channel: Project Alpha");
    expect(markdown).toContain("### **User**");
    expect(markdown).toContain("### **Researcher**");
    expect(markdown).toContain("Research is complete.");
    expect(markdown).toContain("### **Builder**");
    expect(markdown).toContain("Implementation is in progress.");
  });

  it("formats option cards and tool activities cleanly", () => {
    const messages: Message[] = [
      {
        id: "m1",
        role: "bot",
        kind: "activity",
        tool: { name: "readFile", spoken: "reading package.json", ok: true },
        at: new Date("2026-09-08T12:01:00Z").getTime(),
      },
      {
        id: "m2",
        role: "bot",
        kind: "options",
        card: {
          title: "Select framework",
          subtitle: "Which framework do you prefer?",
          options: ["React", "Vue", "Svelte"],
          answered: "React",
        },
        at: new Date("2026-09-08T12:02:00Z").getTime(),
      },
      {
        id: "m3",
        role: "user",
        kind: "text",
        text: "I selected React.",
        attachments: [{ kind: "image", path: "/tmp/screenshot.png", mime: "image/png" }],
        at: new Date("2026-09-08T12:03:00Z").getTime(),
      },
    ];

    const markdown = formatTranscriptMarkdown({
      title: "Assistant",
      messages,
      botName: "Assistant",
      exportedAt: fixedDate,
    });

    expect(markdown).toContain("🔧 _Used tool:_ `reading package.json`");
    expect(markdown).toContain("📋 **Select framework**");
    expect(markdown).toContain("Options: `React`, `Vue`, `Svelte`");
    expect(markdown).toContain("Selected: **React**");
    expect(markdown).toContain("📎 _Attachment:_ `/tmp/screenshot.png`");
  });

  it("slugifies filenames accurately", () => {
    const date = new Date(2026, 8, 8); // Sep 8, 2026
    expect(slugifyTranscriptFilename("Coder Bot", date)).toBe(
      "coder-bot-transcript-2026-09-08.md",
    );
    expect(slugifyTranscriptFilename("  Project #1 (Alpha)!  ", date)).toBe(
      "project-1-alpha-transcript-2026-09-08.md",
    );
    expect(slugifyTranscriptFilename("   ", date)).toBe(
      "conversation-transcript-2026-09-08.md",
    );
  });

  it("formats dates and times consistently", () => {
    const formattedDate = formatExportDate(fixedDate);
    expect(typeof formattedDate).toBe("string");
    expect(formattedDate.length).toBeGreaterThan(0);

    const formattedTime = formatMessageTime(fixedDate.getTime());
    expect(typeof formattedTime).toBe("string");
    expect(formattedTime.length).toBeGreaterThan(0);
  });
});
