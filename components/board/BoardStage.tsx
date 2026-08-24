"use client";

import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import ThemeToggle from "@/components/ui/ThemeToggle";

/**
 * Chrome around a cork board: vertical wall switch on the right.
 * Left slot stays empty so the board stays centered with the switch.
 */
export default function BoardStage({
  children,
  backHref,
  backLabel = "Back",
}: {
  children: React.ReactNode;
  backHref?: string;
  backLabel?: string;
}) {
  return (
    <div className="flex items-start justify-center gap-2 sm:gap-3 overflow-visible">
      <div className="sticky top-8 z-10 flex w-12 shrink-0 justify-center pt-2">
        {backHref ? (
          <Link href={backHref} aria-label={backLabel} className="cork-stage-back">
            ←
          </Link>
        ) : null}
      </div>
      {/* Above the side columns so hanging flyers paint over the wall, not under it. */}
      <div className="relative z-20 min-w-0 flex-1 overflow-visible">{children}</div>
      <div className="sticky top-8 z-10 flex w-12 shrink-0 justify-center pt-2">
        <ThemeToggle size="lg" />
      </div>
    </div>
  );
}

/** Compact back + lights row for the phone fallbacks. */
export function MobileChrome({
  backHref,
  backLabel,
}: {
  backHref: string;
  backLabel: string;
}) {
  return (
    <div className="mb-8 flex items-center justify-between">
      <Link
        href={backHref}
        className="inline-flex items-center gap-1.5 text-sm text-neutral-800 transition-colors hover:text-neutral-950 dark:hover:text-neutral-100"
      >
        <ArrowLeft size={14} />
        {backLabel}
      </Link>
      <ThemeToggle />
    </div>
  );
}
