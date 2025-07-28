// dbConfig.ts
import { SQLDatabase } from "encore.dev/storage/sqldb";

export const DB = new SQLDatabase("encore", {
  migrations: {
    path: "./prisma/migrations",
    source: "prisma",
  },
});