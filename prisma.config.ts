import { defineConfig } from "prisma/config";

// Prisma 7 ya no carga .env implícitamente y el CLI corre fuera de Next,
// así que lo cargamos a mano. loadEnvFile tira si el archivo no existe
// (caso normal en CI, donde DATABASE_URL viene del entorno).
try {
  process.loadEnvFile(".env");
} catch {
  // sin .env: se usan las variables que ya estén en el entorno
}

export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
    seed: "tsx prisma/seed.ts",
  },
  datasource: {
    url: process.env.DATABASE_URL ?? "",
  },
});
