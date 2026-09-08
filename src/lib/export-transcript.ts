import type { Message } from "@/state/store";

export interface ExportTranscriptOptions {
  /** The conversation or room name. */
  title: string;
  /** Messages to export (typically visibleMessages for a bot or group.messages for a room). */
  messages: readonly Message[];
  /** Optional fallback bot name for 1:1 chats when message.from is not set. */
  botName?: string;
  /** Whether this is a multi-member group or channel. */
  isGroup?: boolean;
  /** Optional explicit export timestamp for deterministic testing. */
  exportedAt?: Date;
  /** Whether to format tool calls and activity messages. Defaults to true. */
  includeTools?: boolean;
}

/** Format a Date object into a readable export date string. */
export function formatExportDate(date: Date): string {
  try {
    return date.toLocaleString("en-US", {
      dateStyle: "long",
      timeStyle: "short",
    });
  } catch {
    return date.toISOString();
  }
}

/** Format message timestamp into a readable time string (e.g. "3:45 PM"). */
export function formatMessageTime(timestamp: number): string {
  try {
    return new Date(timestamp).toLocaleTimeString("en-US", {
      hour: "numeric",
      minute: "2-digit",
    });
  } catch {
    return new Date(timestamp).toISOString();
  }
}

/**
 * Cleanly format a conversation into a structured, readable Markdown document.
 */
export function formatTranscriptMarkdown(options: ExportTranscriptOptions): string {
  const {
    title,
    messages,
    botName,
    isGroup = false,
    exportedAt = new Date(),
    includeTools = true,
  } = options;

  const headerTitle = isGroup ? `# Channel: ${title}` : `# Conversation with ${title}`;
  const lines: string[] = [
    headerTitle,
    `_Exported on ${formatExportDate(exportedAt)}_`,
    "",
    "---",
  ];

  if (!messages || messages.length === 0) {
    lines.push("", "_No messages in this conversation yet._");
    return lines.join("\n");
  }

  for (const message of messages) {
    const isUser = message.role === "user";
    const author = isUser ? "User" : message.from?.name || botName || "Assistant";
    const time = formatMessageTime(message.at);

    const messageLines: string[] = [];

    // Main text content
    if (message.text && message.text.trim()) {
      messageLines.push(message.text.trim());
    }

    // Attachments
    if (message.attachments && message.attachments.length > 0) {
      for (const att of message.attachments) {
        messageLines.push(`📎 _Attachment:_ \`${att.path}\``);
      }
    }

    // Option cards
    if (message.card) {
      const cardLines = [`> 📋 **${message.card.title}**`];
      if (message.card.subtitle) {
        cardLines.push(`> ${message.card.subtitle}`);
      }
      if (message.card.options && message.card.options.length > 0) {
        cardLines.push(
          `> Options: ${message.card.options.map((opt) => `\`${opt}\``).join(", ")}`,
        );
      }
      if (message.card.answered) {
        cardLines.push(`> Selected: **${message.card.answered}**`);
      }
      messageLines.push(cardLines.join("\n"));
    }

    // Tool activity
    if (includeTools && message.kind === "activity" && message.tool) {
      const toolLabel = message.tool.spoken || message.tool.name;
      const statusIcon = message.tool.ok === false ? "❌" : "🔧";
      messageLines.push(`> ${statusIcon} _Used tool:_ \`${toolLabel}\``);
    }

    // Only output if the message has something to display
    if (messageLines.length > 0) {
      lines.push("");
      lines.push(`### **${author}** _(${time})_`);
      lines.push("");
      lines.push(messageLines.join("\n\n"));
      lines.push("");
      lines.push("---");
    }
  }

  return lines.join("\n");
}

/**
 * Generate a clean, URL-safe and filesystem-safe filename for the export.
 * e.g. "coder-transcript-2026-09-08.md"
 */
export function slugifyTranscriptFilename(title: string, date = new Date()): string {
  const base =
    title
      .trim()
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-|-$/g, "") || "conversation";

  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");

  return `${base}-transcript-${year}-${month}-${day}.md`;
}

/**
 * Trigger a browser file download of the Markdown transcript.
 */
export function downloadMarkdownTranscript(filename: string, content: string): void {
  const blob = new Blob([content], { type: "text/markdown;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  link.remove();
  window.setTimeout(() => URL.revokeObjectURL(url), 60_000);
}

/**
 * Copy the Markdown transcript to the system clipboard.
 */
export async function copyTranscriptToClipboard(content: string): Promise<boolean> {
  try {
    if (navigator?.clipboard?.writeText) {
      await navigator.clipboard.writeText(content);
      return true;
    }
    return false;
  } catch {
    return false;
  }
}
