export const ATHLETE_LEVELS = [
  { id: "pro", label: "Professional" },
  { id: "college", label: "College" },
  { id: "highschool", label: "High School" },
] as const;

export function levelLabel(level: string | null | undefined) {
  return ATHLETE_LEVELS.find((item) => item.id === level)?.label ?? "Athlete";
}

export function handle(value: string | null | undefined) {
  const cleaned = value?.trim().replace(/^@/, "") ?? "";
  return cleaned || null;
}

export function profileSlug(user: { username: string | null; profileToken: string | null }) {
  return user.username || user.profileToken;
}

export function socialUrl(network: "instagram" | "tiktok" | "x" | "youtube", value: string) {
  const name = value.replace(/^@/, "");
  if (network === "instagram") return `https://instagram.com/${name}`;
  if (network === "tiktok") return `https://www.tiktok.com/@${name}`;
  if (network === "x") return `https://x.com/${name}`;
  return `https://youtube.com/@${name}`;
}
