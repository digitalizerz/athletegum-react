import { PrismaClient } from "@prisma/client";

const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient };

function createClient() {
  const pooled = process.env.DATABASE_URL_POOLED;
  if (pooled?.startsWith("postgres")) {
    return new PrismaClient({ datasources: { db: { url: pooled } } });
  }
  return new PrismaClient();
}

export const prisma = globalForPrisma.prisma ?? createClient();

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}
