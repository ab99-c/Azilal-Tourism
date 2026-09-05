import { defineConfig } from "drizzle-kit";

const rawConnectionString = process.env.DATABASE_URL;
if (!rawConnectionString) {
  throw new Error("DATABASE_URL is required to run drizzle commands");
}

// TiDB Cloud requires TLS. `sslaccept` is not a mysql2/Drizzle Kit option,
// so normalize provider URLs before Drizzle Kit opens its migration connection.
const connectionUrl = new URL(rawConnectionString);
const isTiDBCloud = connectionUrl.hostname.endsWith("tidbcloud.com");
if (isTiDBCloud) {
  connectionUrl.searchParams.delete("sslaccept");
  connectionUrl.searchParams.set("ssl", "{'rejectUnauthorized':true}");
}

export default defineConfig({
  schema: "./drizzle/schema.ts",
  out: "./drizzle",
  dialect: "mysql",
  dbCredentials: {
    url: connectionUrl.toString(),
  },
});
