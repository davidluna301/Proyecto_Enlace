import { env } from "./config/env";
import { createApp } from "./app";

createApp().listen(env.port, () => {
  console.log(`ENLACE MVP disponible en http://localhost:${env.port}`);
});
