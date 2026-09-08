import { Code, Eye } from "lucide-react";
import { cn } from "@/lib/cn";

/** Props for the {@link RawToggleAction} component. */
export interface RawToggleActionProps {
  /** Whether raw markdown mode is currently active. */
  active: boolean;
  /** Callback fired when the toggle button is clicked. */
  onToggle: () => void;
  /** Optional custom CSS class name. */
  className?: string;
}

/**
 * Action button that toggles between rich rendered markdown and raw source view.
 *
 * @param props - Component props containing active state and onToggle handler.
 * @returns Rendered toggle button element.
 */
export function RawToggleAction({ active, onToggle, className }: RawToggleActionProps) {
  return (
    <button
      type="button"
      onClick={onToggle}
      aria-label={active ? "Show rendered markdown" : "Show raw markdown"}
      title={active ? "Show rendered markdown" : "Show raw markdown"}
      className={cn(
        "rounded-md p-1.5 transition-opacity focus-visible:opacity-100 group-hover:opacity-100 group-focus-within:opacity-100",
        active
          ? "bg-raised text-accent opacity-100"
          : "text-ink-secondary opacity-0 hover:bg-raised hover:text-ink",
        className,
      )}
    >
      {active ? <Eye size={14} aria-hidden="true" /> : <Code size={14} aria-hidden="true" />}
    </button>
  );
}

/** Props for the {@link RawMarkdownView} component. */
export interface RawMarkdownViewProps {
  /** The raw markdown or plain text content. */
  text: string;
  /** Optional custom CSS class name. */
  className?: string;
}

/**
 * Displays raw unrendered markdown in a formatted monospace container
 * with vertical and horizontal scrolling, word wrapping, and copyable text.
 *
 * @param props - Component props containing raw text.
 * @returns Rendered preformatted text element.
 */
export function RawMarkdownView({ text, className }: RawMarkdownViewProps) {
  return (
    <pre
      data-testid="raw-markdown-view"
      className={cn(
        "max-h-[36rem] overflow-auto whitespace-pre-wrap break-words rounded-lg border border-hairline/30 bg-inset/50 p-3 font-mono text-[12.5px] leading-relaxed text-ink select-text",
        className,
      )}
    >
      {text}
    </pre>
  );
}
