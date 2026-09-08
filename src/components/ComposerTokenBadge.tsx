import { cn } from "@/lib/cn";
import { t } from "@/lib/i18n";
import { formatTokens } from "@/lib/usage";
import type { TextMetrics } from "@/lib/token-estimator";

/** Props for the {@link ComposerTokenBadge} component. */
export interface ComposerTokenBadgeProps {
  /** Text metrics for the current composed draft. */
  metrics: TextMetrics;
}

/**
 * Token and word count indicator for the chat composer.
 * Displays approximate draft token metrics with accessible labels and tooltips.
 *
 * @param props - Component props containing text metrics.
 * @returns Rendered token badge element or null if token count is 0.
 */
export function ComposerTokenBadge({ metrics }: ComposerTokenBadgeProps) {
  if (metrics.estimatedTokens <= 0) {
    return null;
  }

  const formattedTokens = formatTokens(metrics.estimatedTokens);

  return (
    <span
      tabIndex={0}
      aria-label={t("composer.badge.aria", {
        words: metrics.words,
        tokens: formattedTokens,
      })}
      title={t("composer.badge.title", {
        words: metrics.words,
        tokens: formattedTokens,
        characters: metrics.characters,
      })}
      className={cn(
        "hidden sm:inline-flex select-none items-center px-1 text-[11px] font-medium tabular-nums text-ink-secondary/70 hover:text-ink transition-colors focus:outline-none focus-visible:ring-1 focus-visible:ring-accent",
      )}
    >
      {t("composer.badge.tokens", { tokens: formattedTokens })}
    </span>
  );
}

