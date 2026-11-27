import { PrismaClient } from "@prisma/client";

const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient };

function runtimeUrl() {
  const pooled = process.env.DATABASE_URL_POOLED;
  const direct = process.env.DATABASE_URL ?? "";
  const base = pooled?.startsWith("postgres") ? pooled : direct;
  if (!base.startsWith("postgres")) return null;
  const limits = ["connection_limit=1", "pool_timeout=10", "connect_timeout=10"];
  if (base.includes("pooler")) limits.push("pgbouncer=true");
  const missing = limits.filter((part) => !base.includes(`${part.split("=")[0]}=`));
  if (!missing.length) return base;
  return `${base}${base.includes("?") ? "&" : "?"}${missing.join("&")}`;
}

function createClient() {
  const url = runtimeUrl();
  if (url) return new PrismaClient({ datasources: { db: { url } } });
  return new PrismaClient();
}

export const prisma = globalForPrisma.prisma ?? createClient();

globalForPrisma.prisma = prisma;
