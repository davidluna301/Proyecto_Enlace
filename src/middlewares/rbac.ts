import type { NextFunction, Request, Response } from "express";
import type { UserRole } from "../data/users.mock";

export function requireRole(role: UserRole) {
  return (req: Request, res: Response, next: NextFunction): void => {
    if (!res.locals.currentUser) {
      res.redirect("/login");
      return;
    }
    if (res.locals.currentUser.role !== role) {
      res.status(403).render("errors/forbidden", {
        title: "Acceso restringido",
      });
      return;
    }
    next();
  };
}
