import { z } from "zod";

const EnvSchema = z.object({
  NODE_ENV: z
    .enum(["development", "test", "production"])
    .default("development"),

  DATABASE_URL: z.string().min(1, "DATABASE_URL is required"),

  FRONTEND_URL: z.url("FRONTEND_URL must be a valid URL"),
});

const result = EnvSchema.safeParse(process.env);

if (!result.success) {
  console.error("Invalid environment configuration:");

  for (const issue of result.error.issues) {
    const variable = issue.path.join(".") || "unknown";
    console.error(`- ${variable}: ${issue.message}`);
  }

  process.exit(1);
}

export const env = result.data;
