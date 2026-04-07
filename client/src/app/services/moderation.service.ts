import { inject, Injectable } from "@angular/core";
import { firstValueFrom } from "rxjs";
import { Statement } from "../models/statement.model";
import { ApiService } from "./api.service";

@Injectable({
  providedIn: "root",
})
export class ModerationService {
  private api = inject(ApiService);

  async getQueue(slug: string): Promise<Statement[]> {
    return firstValueFrom(this.api.get<Statement[]>(`/survey/${slug}/moderation`));
  }

  async moderate(statementId: number, status: "approved" | "rejected"): Promise<Statement> {
    return firstValueFrom(
      this.api.patch<Statement>(`/statement/${statementId}/moderate`, { status }),
    );
  }
}
