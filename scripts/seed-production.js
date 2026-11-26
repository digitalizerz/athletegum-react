const { randomBytes, scrypt } = require("node:crypto");
const { promisify } = require("node:util");
const { PrismaClient } = require("@prisma/client");

const scryptAsync = promisify(scrypt);
const prisma = new PrismaClient();

async function hashPassword(password) {
  const salt = randomBytes(16).toString("hex");
  const derived = await scryptAsync(password, salt, 64);
  return `${salt}:${derived.toString("hex")}`;
}

async function main() {
  const fees = await prisma.feeSchedule.findUnique({ where: { id: "default" } });
  if (!fees) {
    await prisma.feeSchedule.create({
      data: { id: "default", freePercent: 10, proPercent: 8, growthPercent: 6 },
    });
    console.log("Created the default fee schedule.");
  }

  const email = process.env.ADMIN_EMAIL?.trim().toLowerCase();
  const password = process.env.ADMIN_PASSWORD ?? "";
  if (!email || password.length < 8) return;

  const existing = await prisma.user.findUnique({ where: { email } });
  if (!existing) {
    await prisma.user.create({
      data: {
        email,
        name: "AthleteGum Admin",
        passwordHash: await hashPassword(password),
        role: "admin",
      },
    });
    console.log("Created the admin account.");
    return;
  }
  if (existing.role !== "admin") {
    throw new Error("ADMIN_EMAIL already belongs to a non-admin account.");
  }
  console.log("Admin account already exists.");
}

main()
  .catch((error) => {
    console.error(error instanceof Error ? error.message : error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
