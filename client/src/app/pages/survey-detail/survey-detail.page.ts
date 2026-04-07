import { Component, inject, signal, OnInit } from "@angular/core";
import { ActivatedRoute } from "@angular/router";
import { TranslatePipe, TranslateService } from "@ngx-translate/core";
import {
  IonHeader, IonToolbar, IonTitle, IonContent,
  IonButtons, IonBackButton, IonButton,
  IonCard, IonCardHeader, IonCardTitle, IonCardContent,
  IonBadge, IonIcon
} from "@ionic/angular/standalone";
import { AlertController } from "@ionic/angular/standalone";
import { addIcons } from "ionicons";
import { playOutline, closeOutline } from "ionicons/icons";
import { Survey } from "../../models/survey.model";
import { SurveyService } from "../../services/survey.service";

@Component({
  selector: "app-survey-detail",
  standalone: true,
  imports: [
    TranslatePipe,
    IonHeader, IonToolbar, IonTitle, IonContent,
    IonButtons, IonBackButton, IonButton,
    IonCard, IonCardHeader, IonCardTitle, IonCardContent,
    IonBadge, IonIcon
  ],
  templateUrl: "./survey-detail.page.html",
  styleUrls: ["./survey-detail.page.scss"]
})
export class SurveyDetailPage implements OnInit {
  private route = inject(ActivatedRoute);
  private surveyService = inject(SurveyService);
  private translate = inject(TranslateService);
  private alertController = inject(AlertController);

  survey = signal<Survey | null>(null);

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
