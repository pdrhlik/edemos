import { Component, inject, signal } from "@angular/core";
import { Router } from "@angular/router";
import { FormsModule } from "@angular/forms";
import { TranslatePipe } from "@ngx-translate/core";
import {
  IonHeader, IonToolbar, IonTitle, IonContent,
  IonInput, IonTextarea, IonButton, IonButtons,
  IonBackButton, IonText
} from "@ionic/angular/standalone";
import { SurveyService } from "../../services/survey.service";

@Component({
  selector: "app-survey-create",
  standalone: true,
  imports: [
    FormsModule, TranslatePipe,
    IonHeader, IonToolbar, IonTitle, IonContent,
    IonInput, IonTextarea, IonButton, IonButtons,
    IonBackButton, IonText
  ],
  templateUrl: "./survey-create.page.html",
  styleUrls: ["./survey-create.page.scss"]
})
export class SurveyCreatePage {
  private surveyService = inject(SurveyService);
  private router = inject(Router);

  title = "";
  description = "";
  error = signal(false);

  async onSubmit() {
    this.error.set(false);
    if (!this.title.trim()) {
      this.error.set(true);
      return;
    }

    try {
      const survey = await this.surveyService.createSurvey({
        title: this.title.trim(),
        description: this.description.trim() || undefined,
      });
      this.router.navigateByUrl(`/survey/${survey.id}`);
    } catch {
      this.error.set(true);
    }
  }
}
