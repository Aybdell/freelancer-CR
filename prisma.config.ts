import "dotenv/config";
import { defineConfig } from "prisma/config";

// Placeholder URL is only used for `prisma generate` when DATABASE_URL is not set (e.g. CI install).
const databaseUrl =
  process.env.DATABASE_URL ??
  "mysql://user:password@localhost:3306/freelancer_crm";

export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
  },
  datasource: {
    url: databaseUrl,
  },
});
