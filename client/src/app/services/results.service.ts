import { Injectable, inject } from "@angular/core";
import { firstValueFrom } from "rxjs";
import { ApiService } from "./api.service";
import { ResultsResponse } from "../models/results.model";

@Injectable({
  providedIn: "root"
})
export class ResultsService {
  private api = inject(ApiService);

  async getResults(slug: string): Promise<ResultsResponse> {
    return firstValueFrom(this.api.get<ResultsResponse>(`/survey/${slug}/results`));
  }
}
