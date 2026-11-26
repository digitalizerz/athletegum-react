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

  const desired = "business@athletegum.com";
  const password = process.env.ADMIN_PASSWORD ?? "";
  const taken = await prisma.user.findUnique({ where: { email: desired } });
  if (taken && taken.role !== "admin") {
    throw new Error(`${desired} already belongs to a non-admin account.`);
  }

  const legacy = await prisma.user.findUnique({ where: { email: "admin@athletegum.example" } });
  if (legacy?.role === "admin" && !taken) {
    await prisma.user.update({ where: { id: legacy.id }, data: { email: desired } });
    console.log("Updated the admin sign-in email.");
    return;
  }
  if (taken || (await prisma.user.findFirst({ where: { role: "admin" } }))) {
    console.log("Admin account already exists.");
    return;
  }
  if (password.length < 8) return;

  await prisma.user.create({
    data: {
      email: desired,
      name: "AthleteGum Admin",
      passwordHash: await hashPassword(password),
      role: "admin",
    },
  });
  console.log("Created the admin account.");
}

main()
  .catch((error) => {
    console.error(error instanceof Error ? error.message : error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
