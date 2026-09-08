import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";

import { RawMarkdownView, RawToggleAction } from "./RawMarkdownToggle";

describe("RawToggleAction", () => {
  it("renders with inactive label and styling when raw mode is off", () => {
    const markup = renderToStaticMarkup(
      createElement(RawToggleAction, {
        active: false,
        onToggle: () => undefined,
      }),
    );

    expect(markup).toContain('aria-label="Show raw markdown"');
    expect(markup).toContain('title="Show raw markdown"');
    expect(markup).not.toContain("text-accent");
    expect(markup).toContain('type="button"');
  });

  it("renders with active label, highlight styling, and Eye icon when raw mode is on", () => {
    const markup = renderToStaticMarkup(
      createElement(RawToggleAction, {
        active: true,
        onToggle: () => undefined,
      }),
    );

    expect(markup).toContain('aria-label="Show rendered markdown"');
    expect(markup).toContain('title="Show rendered markdown"');
    expect(markup).toContain("text-accent");
    expect(markup).toContain("bg-raised");
    expect(markup).toContain("opacity-100");
  });
});

describe("RawMarkdownView", () => {
  it("renders raw markdown text in preformatted container without executing or dropping tags", () => {
    const sampleMarkdown = "# Title\n\n```ts\nconst x = 42;\n```\n\n* bullet point";
    const markup = renderToStaticMarkup(
      createElement(RawMarkdownView, {
        text: sampleMarkdown,
      }),
    );

    expect(markup).toContain("<pre");
    expect(markup).toContain("font-mono");
    expect(markup).toContain("whitespace-pre-wrap");
    expect(markup).toContain(sampleMarkdown);
  });
});
