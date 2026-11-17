import type { Request, Response, NextFunction } from "express";
import { UserService } from "../services/UserService";
import { CreateUserInput } from "../../backend/domain/users"; // careful import path

export class UserController {
  constructor(private readonly userService = new UserService()) {}

  async create(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const input: CreateUserInput = req.body;
      const user = await this.userService.createUser(input);
      res.status(201).json({ user });
    } catch (err) {
      next(err);
    }
  }

  async changePassword(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id, newPassword } = req.body;
      await this.userService.updatePassword(id, newPassword);
      res.status(204).send();
    } catch (err) {
      next(err);
    }
  }

  async list(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const users = await this.userService.list();
      res.json({ users });
    } catch (err) {
      next(err);
    }
  }
}
