// lib/boardAttachments.ts
//
// One committed folder of art (public/board/) + one manifest saying which board
// each piece hangs on and where. Nothing is auto-discovered: a file appears on a
// board only once it is in ATTACHMENTS and referenced from BOARD_PINS.
//
//   public/board/posters/…   poster / flyer art
//   public/board/sheets/…    page-1 render of a committed PDF
//   public/board/photos/…    snapshots
//   public/files/…           the PDFs themselves (already exists)

export type AttachmentKind = "poster" | "sheet" | "photo";

export type Attachment = {
  kind: AttachmentKind;
  /** image shown on the board, relative to /public */
  src: string;
  alt: string;
  /** rendered width on the board, in board px */
  width: number;
  /** src width ÷ src height */
  aspect: number;
  /** sheet: filename in the footer. poster/photo: handwritten caption. */
  label?: string;
  /** sheet only */
  pages?: number;
  /** what a click opens; omit for decoration */
  file?: string;
};

export const ATTACHMENTS = {
  "aotw-architecture": {
    kind: "sheet",
    src: "/board/sheets/aotw-architecture-p1.png",
    alt: "First page of the AOTW architecture write-up",
    width: 292,
    aspect: 268 / 347,
    label: "AOTW-ARCHITECTURE.PDF",
    pages: 1,
    file: "/files/aotw-architecture.pdf",
  },
  resume: {
    kind: "sheet",
    src: "/board/sheets/resume-p1.png",
    alt: "First page of my résumé",
    width: 268,
    aspect: 268 / 347,
    label: "RESUME.PDF",
    pages: 1,
    file: "/files/Aayush-Kumar-Sharma_Resume.pdf",
  },
  "studio-wall": {
    kind: "photo",
    src: "/board/photos/studio-wall.jpg",
    alt: "The wall above my desk",
    width: 300,
    aspect: 4 / 3,
    label: "the wall above my desk",
  },
} satisfies Record<string, Attachment>;

export type AttachmentId = keyof typeof ATTACHMENTS;

export type Pin = {
  id: AttachmentId;
  /** board-space coords, measured from the cork panel's top-left */
  x: number;
  y: number;
  /** keep under ±2.5° */
  rotate?: number;
  pinStyle?: "pushpin" | "staple" | "tape";
  curl?: boolean;
};

/** Board keys: projects | blog | about | project:<slug> | blog:<slug> */
export const BOARD_PINS: Record<string, Pin[]> = {
  projects: [
    { id: "aotw-architecture", x: 772, y: 138, rotate: -1.4, pinStyle: "pushpin", curl: true },
  ],
  blog: [],
  about: [
    { id: "resume", x: 808, y: 300, rotate: -2, pinStyle: "staple" },
  ],
  "project:aotw": [
    { id: "aotw-architecture", x: 60, y: 470, rotate: 0.8, pinStyle: "pushpin", curl: true },
  ],
};

export function pinsFor(board: string): (Pin & { attachment: Attachment })[] {
  return (BOARD_PINS[board] ?? []).map((p) => ({ ...p, attachment: ATTACHMENTS[p.id] }));
}

/** Height a pin occupies, so boards can grow to contain hand-placed art. */
export function pinHeight(p: Pin & { attachment: Attachment }): number {
  const a = p.attachment;
  const artW = a.kind === "sheet" ? a.width - 24 : a.width;
  return Math.round(artW / a.aspect) + (a.label ? 46 : 20);
}
