import { randomBytes } from "node:crypto";
import dotenv from "dotenv";

dotenv.config();

function readPort(value: string | undefined): number {
  const port = Number(value ?? 3000);
  if (!Number.isInteger(port) || port < 1 || port > 65535) {
    throw new Error("PORT debe ser un número entero entre 1 y 65535.");
  }
  return port;
}

const isProduction = process.env.NODE_ENV === "production";
const sessionSecret =
  process.env.SESSION_SECRET ||
  (isProduction ? "" : randomBytes(32).toString("hex"));

if (sessionSecret.length < 32) {
  throw new Error(
    "SESSION_SECRET debe tener al menos 32 caracteres en producción.",
  );
}

export const env = {
  nodeEnv: isProduction ? "production" : "development",
  port: readPort(process.env.PORT),
  sessionSecret,
  isProduction,
  sessionMaxAgeMs: 30 * 60 * 1000,
};
