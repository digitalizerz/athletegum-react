const fs = require("node:fs");

if (!fs.existsSync(".env")) {
  fs.writeFileSync(".env", 'DATABASE_URL="file:./dev.db"\n');
}
