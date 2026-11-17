// src/modules/admin/admin.routes.ts – Rutas de Administración y Semestres ENLACE UCC
import { Router, type Request, type Response } from "express";
import { requireAuth } from "../../middlewares/auth";
import { mockUsers, type User } from "../../data/users.mock";
import { mockCases } from "../../data/cases.mock";

export function createAdminRouter(): Router {
  const router = Router();

  // Rutas administrativas y de semestre requieren autenticación
  router.use(["/admin", "/semestre"], requireAuth);

  // ── GET /admin – Panel de administración general ─────────────────────────
  router.get("/admin", (_req: Request, res: Response) => {
    // Filtrar asesores y calcular métricas en tiempo real
    const asesores = mockUsers
      .filter((user) => user.role === "ASESOR")
      .map((asesor) => {
        const casosAsesor = mockCases.filter((c) => c.advisorId === asesor.id);
        const casosActivos = casosAsesor.filter((c) => c.status !== "CERRADO").length;
        const casosCriticos = casosAsesor.filter(
          (c) => c.riskLevel === "CRITICO" || c.urgency === "ALTA",
        ).length;

        return {
          id: asesor.id,
          name: asesor.name,
          email: asesor.email,
          role: asesor.role,
          activeCases: casosActivos,
          totalCases: casosAsesor.length,
          criticalCases: casosCriticos,
          status: "Activo",
        };
      });

    // Estadísticas globales del sistema
    const totalAsesores = asesores.length;
    const totalCasosActivos = mockCases.filter((c) => c.status !== "CERRADO").length;
    const totalEstudiantes = 248;
    const totalCitasSemestre = 87;
    const casosCriticosGlobales = mockCases.filter(
      (c) => c.riskLevel === "CRITICO",
    ).length;

    res.render("admin/index", {
      title: "Panel de Administración",
      asesores,
      stats: {
        totalAsesores,
        totalCasosActivos,
        totalEstudiantes,
        totalCitasSemestre,
        casosCriticosGlobales,
        semestreActivo: "2026-1",
      },
    });
  });

  // ── GET /semestre – Panel de ciclo de vida del semestre ──────────────────
  router.get("/semestre", (_req: Request, res: Response) => {
    const semestreActual = {
      nombre: "2026-1",
      estado: "Activo",
      fechaInicio: "2026-02-02",
      fechaInicioFormato: "02 de febrero de 2026",
      fechaFinEstimada: "2026-06-12",
      fechaFinFormato: "12 de junio de 2026",
      diasTranscurridos: 98,
      diasTotales: 130,
      porcentajeAvance: 75,
      totalEstudiantes: 248,
      totalCitas: 87,
      casosCriticos: 5,
      falsosPositivosIA: 3,
      alertasPendientes: 4,
    };

    const historialSemestres = [
      {
        nombre: "2025-2",
        fechaInicio: "28 de julio de 2025",
        fechaFin: "28 de noviembre de 2025",
        totalEstudiantes: 312,
        totalCitas: 124,
        casosCriticos: 8,
        falsosPositivosIA: 2,
        estado: "Finalizado",
        tasaEfectividad: "94.2%",
      },
      {
        nombre: "2025-1",
        fechaInicio: "03 de febrero de 2025",
        fechaFin: "13 de junio de 2025",
        totalEstudiantes: 290,
        totalCitas: 98,
        casosCriticos: 4,
        falsosPositivosIA: 5,
        estado: "Finalizado",
        tasaEfectividad: "96.1%",
      },
      {
        nombre: "2024-2",
        fechaInicio: "29 de julio de 2024",
        fechaFin: "29 de noviembre de 2024",
        totalEstudiantes: 275,
        totalCitas: 105,
        casosCriticos: 6,
        falsosPositivosIA: 3,
        estado: "Finalizado",
        tasaEfectividad: "92.8%",
      },
      {
        nombre: "2024-1",
        fechaInicio: "05 de febrero de 2024",
        fechaFin: "14 de junio de 2024",
        totalEstudiantes: 260,
        totalCitas: 89,
        casosCriticos: 7,
        falsosPositivosIA: 4,
        estado: "Finalizado",
        tasaEfectividad: "91.5%",
      },
    ];

    res.render("semestre/index", {
      title: "Gestión del Semestre Académico",
      semestreActual,
      historialSemestres,
    });
  });

  // ── POST /admin/asesores – Agregar nuevo asesor al sistema ───────────────
  router.post("/admin/asesores", (req: Request, res: Response) => {
    const { name, email, password, role } = req.body;

    if (!name || !email) {
      res.status(400).json({ ok: false, error: "Nombre y correo son requeridos" });
      return;
    }

    const nuevoAsesor: User = {
      id: `usr-asesor-${Date.now().toString().slice(-4)}`,
      name: String(name).trim(),
      email: String(email).trim().toLowerCase(),
      role: role === "ADMIN" ? "ADMIN" : "ASESOR",
      passwordHash: "$2b$12$gfwzr0WOtqk/UWFbG/cZC.IpKI1Yg7kx3ZkVv2yEEexB1Tl5xNfwq",
    };

    mockUsers.push(nuevoAsesor);

    if (req.xhr || req.headers.accept?.includes("application/json")) {
      res.json({ ok: true, message: "Asesor creado con éxito", asesor: nuevoAsesor });
      return;
    }

    res.redirect("/admin");
  });

  // ── POST /admin/asesores/:id/password – Cambiar contraseña de asesor ──────
  router.post("/admin/asesores/:id/password", (req: Request, res: Response) => {
    const { id } = req.params;
    const { newPassword } = req.body;

    const user = mockUsers.find((u) => u.id === id);
    if (!user) {
      res.status(404).json({ ok: false, error: "Asesor no encontrado" });
      return;
    }

    if (!newPassword || newPassword.length < 8) {
      res.status(400).json({ ok: false, error: "La contraseña debe tener al menos 8 caracteres" });
      return;
    }

    res.json({ ok: true, message: `Contraseña actualizada para ${user.name}` });
  });

  // ── POST /semestre/iniciar – Apertura de nuevo período ───────────────────
  router.post("/semestre/iniciar", (req: Request, res: Response) => {
    const { nombre, fechaInicio, fechaFin } = req.body;
    res.json({
      ok: true,
      message: `Semestre ${nombre || "nuevo"} iniciado correctamente`,
      data: { nombre, fechaInicio, fechaFin },
    });
  });

  // ── POST /semestre/finalizar – Cierre de período actual ──────────────────
  router.post("/semestre/finalizar", (req: Request, res: Response) => {
    const { archivarFalsosPositivos } = req.body;
    res.json({
      ok: true,
      message: "Semestre 2026-1 finalizado exitosamente y consolidado en el historial.",
      archivarFalsosPositivos: Boolean(archivarFalsosPositivos),
    });
  });

  return router;
}
