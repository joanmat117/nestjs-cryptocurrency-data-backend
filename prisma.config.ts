import path from "node:path";
import { defineConfig, env } from "prisma/config";
import "dotenv/config"; 
export default defineConfig({
  engine: "classic",
  schema: path.join("prisma", "schema.prisma"),
  datasource: {
    url: env("DATABASE_URL"),
    // Si usas algo como Supabase que necesita directUrl:
    // directUrl: env("DIRECT_URL"),
    // Si usas shadow database para migraciones:
    // shadowDatabaseUrl: env("SHADOW_DATABASE_URL"),
  },
});
