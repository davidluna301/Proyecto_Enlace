import type { NextFunction, Request, Response } from "express";
import type { AuthService } from "./auth.service";

export class AuthController {
  constructor(private readonly authService: AuthService) {}

  showLogin = (req: Request, res: Response): void => {
    if (res.locals.currentUser) {
      res.redirect("/home");
      return;
    }
    res.render("auth/login", { title: "Ingresar", error: null });
  };

  login = async (
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> => {
    const email = typeof req.body.email === "string" ? req.body.email : "";
    const password =
      typeof req.body.password === "string" ? req.body.password : "";

    try {
      const user = await this.authService.authenticate(email, password);
      if (!user) {
        res.status(401).render("auth/login", {
          title: "Ingresar",
          error:
            "No pudimos validar tus datos. Revisa el correo y la contraseña.",
        });
        return;
      }

      req.session.regenerate((error) => {
        if (error) {
          next(error);
          return;
        }
        req.session.userId = user.id;
        req.session.save((saveError) => {
          if (saveError) {
            next(saveError);
            return;
          }
          res.redirect("/home");
        });
      });
    } catch (error) {
      next(error);
    }
  };

  logout = (req: Request, res: Response, next: NextFunction): void => {
    req.session.destroy((error) => {
      if (error) {
        next(error);
        return;
      }
      res.clearCookie("enlace.sid", { path: "/" });
      res.redirect("/login");
    });
  };
}
