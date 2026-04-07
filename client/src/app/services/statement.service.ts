import { inject, Injectable } from "@angular/core";
import { firstValueFrom } from "rxjs";
import { Statement } from "../models/statement.model";
import { ApiService } from "./api.service";

@Injectable({
  providedIn: "root",
})
export class StatementService {
  private api = inject(ApiService);

  async listStatements(slug: string): Promise<Statement[]> {
    return firstValueFrom(this.api.get<Statement[]>(`/survey/${slug}/statement`));
  }

  async addSeedStatement(slug: string, text: string): Promise<Statement> {
    return firstValueFrom(this.api.post<Statement>(`/survey/${slug}/statement/seed`, { text }));
  }

  async submitStatement(slug: string, text: string): Promise<Statement> {
    return firstValueFrom(this.api.post<Statement>(`/survey/${slug}/statement`, { text }));
  }

  async getNextStatement(slug: string): Promise<Statement | null> {
    try {
      return await firstValueFrom(this.api.get<Statement>(`/survey/${slug}/statement/next`));
    } catch (e: any) {
      if (e?.status === 204) return null;
      throw e;
    }
  }
}
