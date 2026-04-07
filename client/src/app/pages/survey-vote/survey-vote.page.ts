import { Component, inject, signal, OnInit } from "@angular/core";
import { ActivatedRoute, RouterLink } from "@angular/router";
import { TranslatePipe } from "@ngx-translate/core";
import {
  IonHeader, IonToolbar, IonTitle, IonContent,
  IonButtons, IonBackButton, IonButton, IonIcon,
  IonCard, IonCardContent, IonToggle, IonProgressBar,
  IonText
} from "@ionic/angular/standalone";
import { FormsModule } from "@angular/forms";
import { addIcons } from "ionicons";
import {
  thumbsUpOutline, thumbsDownOutline, removeOutline
} from "ionicons/icons";
import { Statement } from "../../models/statement.model";
import { StatementService } from "../../services/statement.service";
import { ResponseService, VoteProgress } from "../../services/response.service";

@Component({
  selector: "app-survey-vote",
  standalone: true,
  imports: [
    FormsModule, RouterLink, TranslatePipe,
    IonHeader, IonToolbar, IonTitle, IonContent,
    IonButtons, IonBackButton, IonButton, IonIcon,
    IonCard, IonCardContent, IonToggle, IonProgressBar,
    IonText
  ],
  templateUrl: "./survey-vote.page.html",
  styleUrls: ["./survey-vote.page.scss"]
})
export class SurveyVotePage implements OnInit {
  private route = inject(ActivatedRoute);
  private statementService = inject(StatementService);
  private responseService = inject(ResponseService);

  surveyId = 0;
  currentStatement = signal<Statement | null>(null);
  progress = signal<VoteProgress>({ voted: 0, total: 0 });
  isImportant = false;
  allDone = signal(false);

  constructor() {
    addIcons({ thumbsUpOutline, thumbsDownOutline, removeOutline });
  }

  ngOnInit() {
    this.surveyId = Number(this.route.snapshot.paramMap.get("id"));
    if (this.surveyId) {
      this.loadNext();
      this.loadProgress();
    }
  }

  async loadNext() {
    const st = await this.statementService.getNextStatement(this.surveyId);
    if (st) {
      this.currentStatement.set(st);
      this.isImportant = false;
      this.allDone.set(false);
    } else {
      this.currentStatement.set(null);
      this.allDone.set(true);
    }
  }

  async loadProgress() {
    const p = await this.responseService.getProgress(this.surveyId);
    this.progress.set(p);
  }

  get progressFraction(): number {
    const p = this.progress();
    return p.total > 0 ? p.voted / p.total : 0;
  }

  async vote(vote: string) {
    const st = this.currentStatement();
    if (!st) return;

    await this.responseService.submitResponse(st.id, vote, this.isImportant);
    await this.loadProgress();
    await this.loadNext();
  }
}
