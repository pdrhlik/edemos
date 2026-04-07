import { Component, inject, signal, OnInit } from "@angular/core";
import { ActivatedRoute, RouterLink } from "@angular/router";
import { TranslatePipe, TranslateService } from "@ngx-translate/core";
import {
  IonHeader, IonToolbar, IonTitle, IonContent,
  IonButtons, IonBackButton, IonButton,
  IonCard, IonCardHeader, IonCardTitle, IonCardContent,
  IonBadge, IonIcon, AlertController
} from "@ionic/angular/standalone";
import { addIcons } from "ionicons";
import { playOutline, closeOutline } from "ionicons/icons";
import { Survey } from "../../models/survey.model";
import { SurveyService } from "../../services/survey.service";
import { SurveyParticipant } from "../../models/participant.model";
import { ApiService } from "../../services/api.service";
import { AuthService } from "../../services/auth.service";
import { SeedStatementsComponent } from "../../components/seed-statements/seed-statements.component";
import { firstValueFrom } from "rxjs";

@Component({
  selector: "app-survey-detail",
  standalone: true,
  imports: [
    TranslatePipe, RouterLink,
    IonHeader, IonToolbar, IonTitle, IonContent,
    IonButtons, IonBackButton, IonButton,
    IonCard, IonCardHeader, IonCardTitle, IonCardContent,
    IonBadge, IonIcon,
    SeedStatementsComponent
  ],
  templateUrl: "./survey-detail.page.html",
  styleUrls: ["./survey-detail.page.scss"]
})
export class SurveyDetailPage implements OnInit {
  private route = inject(ActivatedRoute);
  private surveyService = inject(SurveyService);
  private translate = inject(TranslateService);
  private alertController = inject(AlertController);
  private api = inject(ApiService);
  private auth = inject(AuthService);

  survey = signal<Survey | null>(null);
  participant = signal<SurveyParticipant | null>(null);

  constructor() {
    addIcons({ playOutline, closeOutline });
  }

  ngOnInit() {
    const id = Number(this.route.snapshot.paramMap.get("id"));
    if (id) {
      this.loadSurvey(id);
    }
  }

  async loadSurvey(id: number) {
    const survey = await this.surveyService.getSurvey(id);
    this.survey.set(survey);

    // Check if current user is a participant
    try {
      const p = await firstValueFrom(this.api.get<SurveyParticipant>(`/survey/${id}/participant/me`));
      this.participant.set(p);
    } catch {
      this.participant.set(null);
    }
  }

  get isAdmin(): boolean {
    return this.participant()?.role === "admin";
  }

  get isParticipantOrAdmin(): boolean {
    return this.participant() !== null;
  }

  statusColor(status: string): string {
    switch (status) {
      case "draft": return "medium";
      case "active": return "success";
      case "closed": return "danger";
      default: return "medium";
    }
  }

  async activate() {
    const confirmed = await this.confirmAction(
      this.translate.instant("survey.activate"),
      this.translate.instant("survey.activate-confirm")
    );
    if (!confirmed) return;

    const s = this.survey();
    if (!s) return;
    const updated = await this.surveyService.updateSurvey(s.id, { status: "active" });
    this.survey.set(updated);
  }

  async closeSurvey() {
    const confirmed = await this.confirmAction(
      this.translate.instant("survey.close-survey"),
      this.translate.instant("survey.close-confirm")
    );
    if (!confirmed) return;

    const s = this.survey();
    if (!s) return;
    const updated = await this.surveyService.updateSurvey(s.id, { status: "closed" });
    this.survey.set(updated);
  }

  private async confirmAction(header: string, message: string): Promise<boolean> {
    const alert = await this.alertController.create({
      header,
      message,
      buttons: [
        { text: this.translate.instant("common.cancel"), role: "cancel" },
        { text: this.translate.instant("common.confirm"), role: "confirm" },
      ],
    });
    await alert.present();
    const { role } = await alert.onDidDismiss();
    return role === "confirm";
  }
}
