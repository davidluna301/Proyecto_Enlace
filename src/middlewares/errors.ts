import type { ErrorRequestHandler, RequestHandler } from "express";

export const notFoundHandler: RequestHandler = (_req, res) => {
  res.status(404).render("errors/not-found", { title: "Página no encontrada" });
};

export const errorHandler: ErrorRequestHandler = (error, _req, res, next) => {
  console.error("Error inesperado al procesar la solicitud:", error);
  if (res.headersSent) {
    next(error);
    return;
  }
  res.status(500).render("errors/server-error", {
    title: "Ocurrió un inconveniente",
  });
};
