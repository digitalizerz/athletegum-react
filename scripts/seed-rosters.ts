import { readFileSync } from "fs";
import { PrismaClient } from "@prisma/client";

type RosterAthlete = {
  name: string;
  position: string;
  sport: string;
  squad: string;
  teamOrSchool: string;
  level: string;
  city: string;
  state: string;
};

async function main() {
  const prisma = new PrismaClient();
  const athletes = JSON.parse(readFileSync(new URL("./houston-rosters.json", import.meta.url), "utf8")) as RosterAthlete[];
  let created = 0;
  for (const athlete of athletes) {
    const existing = await prisma.directoryListing.findFirst({
      where: {
        name: athlete.name,
        teamOrSchool: athlete.teamOrSchool,
        sport: athlete.sport,
        squad: athlete.squad,
      },
    });
    if (existing) continue;
    await prisma.directoryListing.create({
      data: {
        name: athlete.name,
        level: athlete.level,
        sport: athlete.sport,
        squad: athlete.squad,
        position: athlete.position,
        teamOrSchool: athlete.teamOrSchool,
        city: athlete.city,
        state: athlete.state,
        status: "listed",
      },
    });
    created += 1;
  }
  console.log(`added ${created} of ${athletes.length}`);
  await prisma.$disconnect();
}

main();
