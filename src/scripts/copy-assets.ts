import { cpSync } from "node:fs";
import path from "node:path";

const projectRoot = path.resolve(__dirname, "..", "..");

for (const directory of ["views", "public"]) {
  cpSync(
    path.join(projectRoot, "src", directory),
    path.join(projectRoot, "dist", directory),
    { recursive: true },
  );
}
