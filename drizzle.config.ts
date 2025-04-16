import { defineConfig } from 'drizzle-kit';

export default defineConfig({
    dialect: "postgresql",
    schema: "./core/data/schema/schema.ts",
    out: "./core/data/migrations",
    dbCredentials: {
        url: process.env.DATABASE_URL!,
    },
});