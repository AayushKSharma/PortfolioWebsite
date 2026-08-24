// lib/sheets.ts — cut an MDX body into stapled pages.

export type Sheet = {
  /** the section heading, uppercased for the eyebrow; "" for the lead sheet */
  eyebrow: string;
  /** heading text as written */
  heading: string;
  /** markdown body for this sheet, heading line removed */
  body: string;
};

/**
 * Splits on top-level "# " and "## " headings. Content before the first
 * heading becomes a lead sheet with no eyebrow. Fenced code blocks are
 * respected, so a "#" comment inside a fence never starts a new page.
 */
export function splitSheets(md: string): Sheet[] {
  const lines = md.split("\n");
  const sheets: Sheet[] = [];
  let cur: Sheet = { eyebrow: "", heading: "", body: "" };
  let fenced = false;

  const push = () => {
    if (cur.body.trim() || cur.heading) sheets.push({ ...cur, body: cur.body.trim() });
  };

  for (const line of lines) {
    if (/^\s*(```|~~~)/.test(line)) fenced = !fenced;

    const m = !fenced && /^(#{1,2})\s+(.*)$/.exec(line);
    if (m) {
      push();
      const heading = m[2].trim();
      cur = { eyebrow: heading.toUpperCase(), heading, body: "" };
    } else if (!/^\s*---\s*$/.test(line) || fenced) {
      cur.body += line + "\n";
    }
  }
  push();

  return sheets;
}

/** Rough sheet height in board px, for the board's min-height. */
export function estimateSheetHeight(s: Sheet, width = 864, extra = 0): number {
  const chars = s.body.replace(/\s+/g, " ").length;
  const lines = Math.ceil((chars * 7.6) / (width - 104));
  const headings = (s.body.match(/^#{1,3}\s/gm) || []).length;
  const items = (s.body.match(/^\s*[-*]\s/gm) || []).length;
  return Math.round(
    120 + extra + (s.heading ? 54 : 0) + headings * 32 + items * 10 + lines * 26.3,
  );
}
