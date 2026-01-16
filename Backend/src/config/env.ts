import "dotenv/config";

function requireEnv(name: string): string {
  const value = process.env[name];
  if (!value) throw new Error(`Missing required env var: ${name}`);
  return value;
}

export const env = {
  NODE_ENV: process.env.NODE_ENV ?? "development",
  PORT: Number(process.env.PORT ?? "4000"),
  CORS_ORIGIN: process.env.CORS_ORIGIN ?? "http://localhost:5174",

  JWT_ACCESS_SECRET: requireEnv("JWT_ACCESS_SECRET"),
  JWT_REFRESH_SECRET: requireEnv("JWT_REFRESH_SECRET"),

  DATABASE_URL: requireEnv("DATABASE_URL"),
  OPENAI_API_KEY: process.env.OPENAI_API_KEY ?? ""
};
