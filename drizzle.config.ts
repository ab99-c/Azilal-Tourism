import { defineConfig } from "drizzle-kit";

const rawConnectionString = process.env.DATABASE_URL;
if (!rawConnectionString) {
  throw new Error("DATABASE_URL is required to run drizzle commands");
}

const connectionUrl = new URL(rawConnectionString);

export default defineConfig({
  schema: "./drizzle/schema.ts",
  out: "./drizzle",
  dialect: "mysql",
  dbCredentials: {
    host: connectionUrl.hostname,
    port: Number(connectionUrl.port || 4000),
    user: decodeURIComponent(connectionUrl.username),
    password: decodeURIComponent(connectionUrl.password),
    database: decodeURIComponent(connectionUrl.pathname.replace(/^\//, "")),
    // TiDB Cloud Serverless requires an encrypted migration connection.
    ssl: { rejectUnauthorized: true },
  },
});
