import { Semester, SemesterStats } from "../domain/semesters";
import { randomBytes } from "node:crypto";

export class SemesterService {
  private semesters: Semester[] = [];

  /** Create a new semester (open) */
  async openSemester(name: string, startDate: string, endDate: string): Promise<Semester> {
    const id = `${new Date(startDate).getFullYear()}-${new Date(startDate).getMonth() + 1}`;
    const token = randomBytes(8).toString("hex");
    const newSemester: Semester = {
      id,
      name,
      startDate,
      endDate,
      isActive: true,
      qrToken: token,
      qrUrlPath: `/qr/${token}`,
    };
    this.semesters.push(newSemester);
    return newSemester;
  }

  async closeSemester(id: string): Promise<Semester> {
    const semester = this.semesters.find((s) => s.id === id);
    if (!semester) throw new Error("Semester not found");
    semester.isActive = false;
    semester.closedAt = new Date().toISOString();
    return semester;
  }

  async getActiveSemester(): Promise<Semester | undefined> {
    return this.semesters.find((s) => s.isActive);
  }

  async findByToken(token: string): Promise<Semester | undefined> {
    return this.semesters.find((s) => s.qrToken === token);
  }
}

export const semesterService = new SemesterService();

export async function startSemester(input: { semesterId: string; startDate: string; endDate: string }): Promise<Semester> {
  return semesterService.openSemester(input.semesterId, input.startDate, input.endDate);
}

export async function endSemester(semesterId: string): Promise<Semester> {
  return semesterService.closeSemester(semesterId);
}

