import { appendFile, mkdir } from "node:fs/promises";
import path from "node:path";
import type { NextFunction, Request, Response } from "express";

export async function auditCaseCreation(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const directory = path.resolve(process.cwd(), "logs");
    await mkdir(directory, { recursive: true });
    await appendFile(
      path.join(directory, "auditoria.jsonl"),
      JSON.stringify({
        action: "CASO_CREADO",
        actorId: req.session.userId,
        caseId: res.locals.createdCaseId,
        timestamp: new Date().toISOString(),
      }) + "\n",
      { encoding: "utf8", mode: 0o600 },
    );
    req.session.caseCreated = true;
    req.session.save((error) => {
      if (error) return next(error);
      res.redirect("/casos");
    });
  } catch (error) {
    next(error);
  }
}
