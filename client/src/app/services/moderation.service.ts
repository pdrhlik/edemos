import { Injectable, inject } from "@angular/core";
import { firstValueFrom } from "rxjs";
import { ApiService } from "./api.service";
import { Statement } from "../models/statement.model";

@Injectable({
  providedIn: "root"
})
export class ModerationService {
  private api = inject(ApiService);

  async getQueue(surveyId: number): Promise<Statement[]> {
    return firstValueFrom(this.api.get<Statement[]>(`/survey/${surveyId}/moderation`));
  }

  async moderate(statementId: number, status: "approved" | "rejected"): Promise<Statement> {
    return firstValueFrom(this.api.patch<Statement>(`/statement/${statementId}/moderate`, { status }));
  }
}
