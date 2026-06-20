import "dotenv/config";
import { defineConfig } from "prisma/config";

// Use DIRECT_URL for migrations; fall back to DATABASE_URL for generate/CI.
const databaseUrl =
  process.env.DIRECT_URL ??
  process.env.DATABASE_URL ??
  "postgresql://postgres:password@localhost:5432/postgres";

export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
  },
  datasource: {
    url: databaseUrl,
  },
});
