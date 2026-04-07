import { Injectable, inject } from "@angular/core";
import { firstValueFrom } from "rxjs";
import { ApiService } from "./api.service";
import { Statement } from "../models/statement.model";

@Injectable({
  providedIn: "root"
})
export class StatementService {
  private api = inject(ApiService);

  async listStatements(surveyId: number): Promise<Statement[]> {
    return firstValueFrom(this.api.get<Statement[]>(`/survey/${surveyId}/statement`));
  }

  async addSeedStatement(surveyId: number, text: string): Promise<Statement> {
    return firstValueFrom(this.api.post<Statement>(`/survey/${surveyId}/statement/seed`, { text }));
  }

  async submitStatement(surveyId: number, text: string): Promise<Statement> {
    return firstValueFrom(this.api.post<Statement>(`/survey/${surveyId}/statement`, { text }));
  }

  async getNextStatement(surveyId: number): Promise<Statement | null> {
    try {
      return await firstValueFrom(this.api.get<Statement>(`/survey/${surveyId}/statement/next`));
    } catch (e: any) {
      if (e?.status === 204) return null;
      throw e;
    }
  }
}
