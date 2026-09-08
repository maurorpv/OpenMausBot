import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";

import { ComposerTokenBadge } from "./ComposerTokenBadge";

describe("ComposerTokenBadge", () => {
  it("renders nothing when token estimate is 0", () => {
    const markup = renderToStaticMarkup(
      createElement(ComposerTokenBadge, {
        metrics: { words: 0, characters: 0, estimatedTokens: 0 },
      }),
    );
    expect(markup).toBe("");
  });

  it("renders formatted token count and accessible attributes quietly for draft content", () => {
    const markup = renderToStaticMarkup(
      createElement(ComposerTokenBadge, {
        metrics: { words: 12, characters: 64, estimatedTokens: 16 },
      }),
    );

    expect(markup).toContain("~16 tok");
    expect(markup).not.toContain('role="status"');
    expect(markup).not.toContain("aria-live");
    expect(markup).toContain('aria-label="Draft estimate: 12 words, approximately 16 tokens"');
    expect(markup).toContain('title="Draft estimate: 12 words, ~16 tokens (64 characters)"');
    expect(markup).toContain("text-ink-secondary/70");
  });

  it("maintains neutral styling for large draft prompts", () => {
    const markup = renderToStaticMarkup(
      createElement(ComposerTokenBadge, {
        metrics: { words: 25000, characters: 140000, estimatedTokens: 35000 },
      }),
    );

    expect(markup).toContain("~35k tok");
    expect(markup).not.toContain("text-warning");
    expect(markup).not.toContain("text-danger");
    expect(markup).toContain("text-ink-secondary/70");
  });

  it("formats very large drafts cleanly with compact notation", () => {
    const markup = renderToStaticMarkup(
      createElement(ComposerTokenBadge, {
        metrics: { words: 80000, characters: 500000, estimatedTokens: 120000 },
      }),
    );

    expect(markup).toContain("~120k tok");
    expect(markup).not.toContain("text-danger");
    expect(markup).toContain("text-ink-secondary/70");
  });
});
