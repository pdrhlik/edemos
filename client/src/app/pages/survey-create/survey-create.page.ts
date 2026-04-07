import { Component, inject, signal } from "@angular/core";
import { FormsModule } from "@angular/forms";
import { Router } from "@angular/router";
import {
  IonBackButton,
  IonButton,
  IonButtons,
  IonContent,
  IonHeader,
  IonInput,
  IonSpinner,
  IonTextarea,
  IonTitle,
  IonToolbar,
} from "@ionic/angular/standalone";
import { TranslatePipe } from "@ngx-translate/core";
import { SurveyService } from "../../services/survey.service";
import { ToastService } from "../../services/toast.service";

@Component({
  selector: "app-survey-create",
  standalone: true,
  imports: [
    FormsModule,
    TranslatePipe,
    IonHeader,
    IonToolbar,
    IonTitle,
    IonContent,
    IonInput,
    IonTextarea,
    IonButton,
    IonButtons,
    IonBackButton,
    IonSpinner,
  ],
  templateUrl: "./survey-create.page.html",
  styleUrls: ["./survey-create.page.scss"],
})
export class SurveyCreatePage {
  private surveyService = inject(SurveyService);
  private router = inject(Router);
  private toast = inject(ToastService);

  title = "";
  description = "";
  submitting = signal(false);

  async onSubmit() {
    if (!this.title.trim()) return;

    this.submitting.set(true);
    try {
      const survey = await this.surveyService.createSurvey({
        title: this.title.trim(),
        description: this.description.trim() || undefined,
      });
      this.router.navigateByUrl(`/survey/${survey.slug}`, { replaceUrl: true });
    } catch (e) {
      this.toast.apiError(e);
    } finally {
      this.submitting.set(false);
    }
  }
}
