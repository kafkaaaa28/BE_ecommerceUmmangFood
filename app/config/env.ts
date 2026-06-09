import "dotenv/config";
import { z } from "zod";

const EnvSchema = z.object({
  NODE_ENV: z
    .enum(["development", "test", "production"])
    .default("development"),
  PORT: z.coerce.number().default(4000),
  APP_ORIGIN: z.string().url(),
  AUTH_INTERNAL_TOKEN: z.string().min(1),

  JWT_ACCESS_SECRET: z.string().min(32),
  JWT_REFRESH_SECRET: z.string().min(32),
  JWT_ACCESS_EXPIRES_IN: z.string().default("15m"),
  JWT_REFRESH_EXPIRES_IN: z.string().default("7d"),

  REDIS_URL: z.string().url(),
  REDIS_KEY_PREFIX: z.string().default("app:dev"),

  FRONTEND_URL: z.string().url(),
  DATABASE_URL: z.string().min(1),
});

export const env = EnvSchema.parse(process.env);
export type Env = z.infer<typeof EnvSchema>;
