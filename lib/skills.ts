export type SkillGroup = {
  id: "languages" | "frontend" | "backend" | "infrastructure";
  label: string;
  skills: string[];
};

export const SKILL_GROUPS: SkillGroup[] = [
  {
    id: "languages",
    label: "Languages",
    skills: ["TypeScript", "JavaScript", "PostgreSQL", "Python"],
  },
  {
    id: "frontend",
    label: "Frontend",
    skills: ["React", "Next.js", "Tailwind CSS", "Material UI"],
  },
  {
    id: "backend",
    label: "Backend",
    skills: ["Node.js", "Express", "PostgreSQL", "REST"],
  },
  {
    id: "infrastructure",
    label: "Infrastructure",
    skills: ["Docker", "Vercel", "GitHub Actions"],
  },
];
