import type { NextFunction, Request, Response } from "express";
import type { AuthService } from "../modules/auth/auth.service";

export function attachCurrentUser(authService: AuthService) {
  return (req: Request, res: Response, next: NextFunction): void => {
    const user = req.session.userId
      ? authService.getUserById(req.session.userId)
      : null;
    res.locals.currentUser = user;
    if (req.session.userId && !user) {
      req.session.destroy((error) => {
        if (error) {
          next(error);
          return;
        }
        next();
      });
      return;
    }
    next();
  };
}

export function requireAuth(
  req: Request,
  res: Response,
  next: NextFunction,
): void {
  if (!res.locals.currentUser) {
    res.redirect("/login");
    return;
  }
  next();
}
