import { inject, Injectable } from "@angular/core";
import { firstValueFrom } from "rxjs";
import { ApiService } from "./api.service";

export interface VoteProgress {
  voted: number;
  total: number;
}

@Injectable({
  providedIn: "root",
})
export class ResponseService {
  private api = inject(ApiService);

  async submitResponse(statementId: number, vote: string, isImportant: boolean) {
    return firstValueFrom(
      this.api.post(`/statement/${statementId}/response`, { vote, isImportant }),
    );
  }

  async getProgress(slug: string): Promise<VoteProgress> {
    return firstValueFrom(this.api.get<VoteProgress>(`/survey/${slug}/progress`));
  }
}
