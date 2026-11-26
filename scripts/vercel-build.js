const { execFileSync } = require("node:child_process");
const fs = require("node:fs");

const schemaPath = "prisma/schema.prisma";
const databaseUrl = process.env.DATABASE_URL ?? "";
const onVercel = process.env.VERCEL === "1";
const postgres = databaseUrl.startsWith("postgres://") || databaseUrl.startsWith("postgresql://");

if (onVercel && !postgres) {
  console.error("DATABASE_URL must be a Postgres connection string before this app can run on Vercel.");
  process.exit(1);
}
if (onVercel && !process.env.AUTH_SECRET) {
  console.error("AUTH_SECRET must be set before this app can run on Vercel.");
  process.exit(1);
}
if (onVercel && (!process.env.ADMIN_EMAIL || !process.env.ADMIN_PASSWORD)) {
  console.error("ADMIN_EMAIL and ADMIN_PASSWORD must be set so the production admin account can be created.");
  process.exit(1);
}

function run(command, args) {
  execFileSync(command, args, { stdio: "inherit" });
}

const original = fs.readFileSync(schemaPath, "utf8");
let patched = false;

try {
  if (postgres) {
    let next = original.replace(/provider\s*=\s*"sqlite"/, 'provider = "postgresql"');
    if (process.env.DIRECT_URL) {
      next = next.replace(
        /url\s*=\s*env\("DATABASE_URL"\)/,
        'url       = env("DATABASE_URL")\n  directUrl = env("DIRECT_URL")',
      );
    }
    fs.writeFileSync(schemaPath, next);
    patched = true;
    run("./node_modules/.bin/prisma", ["generate"]);
    run("./node_modules/.bin/prisma", ["db", "push", "--skip-generate"]);
    run("node", ["scripts/seed-production.js"]);
  } else {
    run("./node_modules/.bin/prisma", ["generate"]);
  }
  run("./node_modules/.bin/next", ["build"]);
} finally {
  if (patched) fs.writeFileSync(schemaPath, original);
}
