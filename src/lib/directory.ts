export const DIRECTORY_LEVELS = [
  { id: "high_school", label: "High school" },
  { id: "college", label: "College" },
  { id: "pro", label: "Pro" },
  { id: "retired", label: "Retired" },
] as const;

export type DirectoryLevel = (typeof DIRECTORY_LEVELS)[number]["id"];

export const DIRECTORY_SPORTS = ["Football", "Basketball", "Baseball", "Softball", "Soccer", "Volleyball", "Track and field"] as const;

export const DIRECTORY_SQUADS = [
  { id: "men", label: "Men" },
  { id: "women", label: "Women" },
] as const;

export type DirectorySquad = (typeof DIRECTORY_SQUADS)[number]["id"];

export function isDirectorySquad(value: string): value is DirectorySquad {
  return DIRECTORY_SQUADS.some((squad) => squad.id === value);
}

export function squadLabel(squad: string | null | undefined) {
  return DIRECTORY_SQUADS.find((item) => item.id === squad)?.label ?? null;
}

export function isDirectoryLevel(value: string): value is DirectoryLevel {
  return DIRECTORY_LEVELS.some((level) => level.id === value);
}

export function directoryLevelLabel(level: string | null | undefined) {
  return DIRECTORY_LEVELS.find((item) => item.id === level)?.label ?? "Athlete";
}

export function levelFromAccount(athleteLevel: string | null | undefined): DirectoryLevel | null {
  if (athleteLevel === "highschool") return "high_school";
  if (athleteLevel === "college") return "college";
  if (athleteLevel === "pro") return "pro";
  return null;
}

export function accountLevelFromListing(level: string | null | undefined) {
  if (level === "high_school") return "highschool";
  if (level === "college") return "college";
  if (level === "pro") return "pro";
  return null;
}

export function canInviteToDeal(level: DirectoryLevel) {
  return level !== "high_school";
}

export function placeLabel(city: string | null, state: string | null) {
  return [city, state].filter(Boolean).join(", ");
}
