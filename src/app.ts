import express from "express";
import session from "express-session";
import expressLayouts from "express-ejs-layouts";
import path from "node:path";
import { env } from "./config/env";
import { attachCurrentUser, requireAuth } from "./middlewares/auth";
import { errorHandler, notFoundHandler } from "./middlewares/errors";
import { AuthController } from "./modules/auth/auth.controller";
import { AuthService } from "./modules/auth/auth.service";
import { createAuthRouter } from "./modules/auth/auth.routes";
import { CasesController } from "./modules/cases/cases.controller";
import { MockCasesRepository } from "./modules/cases/mock-cases.repository";
import { CasesService } from "./modules/cases/cases.service";
import { createCasesRouter } from "./modules/cases/cases.routes";

export function createApp() {
  const app = express();
  const authService = new AuthService();
  const casesService = new CasesService(new MockCasesRepository());
  const authController = new AuthController(authService);
  const casesController = new CasesController(casesService);
  const cookieName = "enlace.sid";

  app.set("view engine", "ejs");
  app.set("views", path.join(__dirname, "views"));
  app.set("layout", "layouts/main");
  app.use(expressLayouts);
  app.use(express.urlencoded({ extended: false, limit: "10kb" }));
  app.use(
    session({
      name: cookieName,
      secret: env.sessionSecret,
      resave: false,
      saveUninitialized: false,
      rolling: true,
      cookie: {
        httpOnly: true,
        sameSite: "lax",
        secure: env.isProduction,
        maxAge: env.sessionMaxAgeMs,
      },
    }),
  );
  app.use(attachCurrentUser(authService));
  app.use(
    express.static(path.join(__dirname, "public"), {
      maxAge: env.isProduction ? "1d" : 0,
    }),
  );
  app.use((_req, res, next) => {
    res.locals.formatDate = (date: string): string =>
      new Intl.DateTimeFormat("es-CO", {
        dateStyle: "long",
        timeStyle: "short",
        timeZone: "America/Bogota",
      }).format(new Date(date));
    next();
  });

  app.use(createAuthRouter(authController));
  app.get("/", (req, res) => {
    res.redirect(req.session.userId ? "/home" : "/login");
  });
  app.get("/home", requireAuth, (_req, res) => {
    const currentUser = res.locals.currentUser;
    if (currentUser.role === "ASESOR") {
      res.render("home/asesor", { title: "Inicio" });
      return;
    }
    res.render("home/admin", {
      title: "Inicio",
      users: authService.listPublicUsers(),
    });
  });
  app.use("/cases", createCasesRouter(casesController));
  app.use(notFoundHandler);
  app.use(errorHandler);

  return app;
}
