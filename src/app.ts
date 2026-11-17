// src/app.ts – Plataforma ENLACE UCC – Punto de entrada principal
import express from "express";
import session from "express-session";
import expressLayouts from "express-ejs-layouts";
import path from "node:path";
import { env } from "./config/env";
import { attachCurrentUser, requireAuth } from "./middlewares/auth";
import { notFoundHandler, errorHandler } from "./middlewares/errors";
import { AuthService } from "./modules/auth/auth.service";
import { AuthController } from "./modules/auth/auth.controller";
import { createAuthRouter } from "./modules/auth/auth.routes";
import { CasesController } from "./modules/cases/cases.controller";
import { MockCasesRepository } from "./modules/cases/mock-cases.repository";
import { CasesService } from "./modules/cases/cases.service";
import { createCasesRouter } from "./modules/cases/cases.routes";
import { ReportSelectionController } from "./modules/reports/report-selection.controller";
import { createReportSelectionRouter } from "./modules/reports/report-selection.routes";
import { ReportPdfController } from "./modules/reports/report-pdf.controller";
import { ReportPdfService } from "./modules/reports/report-pdf.service";
import { createReportPdfRouter } from "./modules/reports/report-pdf.routes";
import { createAdminRouter } from "./modules/admin/admin.routes";
import { createCasosMarcadoresRouter } from "./modules/casos/casos.routes";
import { createCalendarioRouter } from "./modules/calendario/calendario.routes";
import { createQrRouter } from "./modules/qr/qr.routes";
import { createIaRouter } from "./modules/ia/ia.routes";
import { createReportesRouter } from "./modules/reportes/reportes.routes";

export function createApp(options: { auditDirectory?: string } = {}) {
  const app = express();
  app.set("trust proxy", 1);
  const authService = new AuthService();
  const authController = new AuthController(authService);
  const casesService = new CasesService(new MockCasesRepository());
  const casesController = new CasesController(casesService);
  const reportSelectionController = new ReportSelectionController(casesService);
  const reportPdfController = new ReportPdfController(
    new ReportPdfService(casesService, options.auditDirectory),
  );

  // ── View engine ─────────────────────────────────────────────────────────
  app.set("view engine", "ejs");
  app.set("views", path.join(__dirname, "views"));
  app.set("layout", "layouts/main");
  app.use(expressLayouts);

  // ── Body parsing ─────────────────────────────────────────────────────────
  app.use(express.urlencoded({ extended: false, limit: "10kb" }));
  app.use(express.json({ limit: "10kb" }));

  // ── Session ───────────────────────────────────────────────────────────────
  app.use(
    session({
      name: "enlace.sid",
      secret: env.sessionSecret,
      resave: false,
      saveUninitialized: false,
      rolling: true,
      cookie: {
        httpOnly: true,
        sameSite: env.isProduction ? "none" : "lax",
        secure: env.isProduction,
        maxAge: env.sessionMaxAgeMs,
      },
    }),
  );

  // ── Middlewares globales ──────────────────────────────────────────────────
  app.use(attachCurrentUser(authService));

  // ── Archivos estáticos ───────────────────────────────────────────────────
  app.use(
    express.static(path.join(__dirname, "public"), {
      maxAge: env.isProduction ? "1d" : 0,
    }),
  );

  // ── Helpers de plantillas ─────────────────────────────────────────────────
  app.use((_req, res, next) => {
    res.locals.formatDate = (date: string): string =>
      new Intl.DateTimeFormat("es-CO", {
        dateStyle: "long",
        timeStyle: "short",
        timeZone: "America/Bogota",
      }).format(new Date(date));
    next();
  });
  app.use((req, res, next) => {
    res.locals.currentPath = req.path;
    next();
  });

  // ── Rutas de autenticación ─────────────────────────────────────────────
  app.use(createAuthRouter(authController));

  // ── Módulo de Administración y Semestres ───────────────────────────────
  app.use(createAdminRouter());

  // ── Módulo de Marcadores Críticos (Tablero institucional) ──────────────
  app.use(createCasosMarcadoresRouter());

  // ── Casos y seguimiento (Asesores) ────────────────────────────────────
  app.use("/cases", createCasesRouter(casesController, options.auditDirectory));
  app.use("/casos", createCasesRouter(casesController, options.auditDirectory));

  // ── Reportes ──────────────────────────────────────────────────────────
  app.use("/reportes", createReportSelectionRouter(reportSelectionController));
  app.use("/reportes", createReportPdfRouter(reportPdfController));
  app.use("/reportes", createReportesRouter());

  // ── Raíz ──────────────────────────────────────────────────────────────
  app.get("/", (req, res) => {
    res.redirect(req.session.userId ? "/home" : "/login");
  });

  // ── Home (dashboard principal) ────────────────────────────────────────
  app.get("/home", requireAuth, (_req, res) => {
    const currentUser = res.locals.currentUser;
    if (currentUser?.role === "ASESOR") {
      res.render("home/asesor", { title: "Inicio" });
    } else {
      res.render("home/admin", {
        title: "Inicio",
        users: authService.listPublicUsers(),
      });
    }
  });

  // ── Calendario ────────────────────────────────────────────────────────
  app.use("/calendario", createCalendarioRouter());

  // ── QR del semestre ───────────────────────────────────────────────────
  app.use("/qr", createQrRouter());

  // ── Portal del estudiante (público, accedido por QR) ─────────────────
  app.get("/portal-estudiante", (_req, res) => {
    res.render("estudiante/portal", { title: "Portal del Estudiante – ENLACE UCC", layout: false });
  });
  app.post("/portal-estudiante/agendar", (req, res) => {
    const { idUniversitario, nombres, apellidos, correo, carrera, semestre, fecha, hora, modalidad, motivo, psicologo } = req.body;
    res.json({
      ok: true,
      message: "Cita solicitada exitosamente. Recibirás confirmación en tu correo institucional.",
      cita: {
        id: `CITA-${Date.now()}`,
        idUniversitario,
        estudiante: `${nombres || ''} ${apellidos || ''}`.trim(),
        correo,
        carrera,
        semestre,
        fecha,
        hora,
        modalidad,
        psicologo: psicologo || "Asignación automática",
        motivo,
        estado: "confirmada",
      },
    });
  });
  app.post("/portal-estudiante/reagendar", (req, res) => {
    const { idUniversitario, nuevaFecha, nuevaHora, motivo } = req.body;
    res.json({
      ok: true,
      message: "Solicitud de reagendamiento enviada correctamente. El asesor se comunicará contigo.",
      recordatorio: "Recuerde comunicarse con el estudiante por teléfono, correo u otro medio",
      idUniversitario,
      nuevaFecha,
      nuevaHora,
      motivo,
    });
  });

  // ── Predicción IA ─────────────────────────────────────────────────────
  app.use("/ia", createIaRouter());

  // ── Fallbacks ─────────────────────────────────────────────────────────
  app.use(notFoundHandler);
  app.use(errorHandler);

  return app;
}
