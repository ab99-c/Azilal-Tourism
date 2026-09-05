import { defineConfig } from "drizzle-kit";

const rawConnectionString = process.env.DATABASE_URL;
if (!rawConnectionString) {
  throw new Error("DATABASE_URL is required to run drizzle commands");
}

const connectionUrl = new URL(rawConnectionString);
connectionUrl.searchParams.delete("sslaccept");

export default defineConfig({
  schema: "./drizzle/schema.ts",
  out: "./drizzle",
  dialect: "mysql",
  dbCredentials: {
    url: connectionUrl.toString(),
    // TiDB Serverless requires TLS for migration connections.
    ssl: { rejectUnauthorized: true },
  },
});
