import { Component, inject, signal, OnInit } from "@angular/core";
import { ActivatedRoute, Router } from "@angular/router";
import { FormsModule } from "@angular/forms";
import { TranslatePipe, TranslateService } from "@ngx-translate/core";
import {
  IonHeader, IonToolbar, IonTitle, IonContent,
  IonButtons, IonBackButton, IonButton, IonSelect,
  IonSelectOption, IonRadioGroup, IonRadio, IonItem,
  IonLabel, IonInput
} from "@ionic/angular/standalone";
import { ApiService } from "../../services/api.service";
import { Survey } from "../../models/survey.model";
import { SurveyService } from "../../services/survey.service";
import { firstValueFrom } from "rxjs";

@Component({
  selector: "app-survey-join",
  standalone: true,
  imports: [
    FormsModule, TranslatePipe,
    IonHeader, IonToolbar, IonTitle, IonContent,
    IonButtons, IonBackButton, IonButton, IonSelect,
    IonSelectOption, IonRadioGroup, IonRadio, IonItem,
    IonLabel, IonInput
  ],
  templateUrl: "./survey-join.page.html",
  styleUrls: ["./survey-join.page.scss"]
})
export class SurveyJoinPage implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private api = inject(ApiService);
  private surveyService = inject(SurveyService);
  private translate = inject(TranslateService);

  survey = signal<Survey | null>(null);
  intakeFields = signal<any[]>([]);
  formData: Record<string, any> = {};

  ngOnInit() {
    const slug = this.route.snapshot.paramMap.get("slug");
    if (slug) {
      this.loadSurvey(slug);
    }
  }

  async loadSurvey(slug: string) {
    // Check if already a participant — redirect back if so
    try {
      await firstValueFrom(this.api.get(`/survey/${slug}/participant/me`));
      this.router.navigateByUrl(`/survey/${slug}`, { replaceUrl: true });
      return;
    } catch {
      // Not a participant — continue to join flow
    }

    const survey = await this.surveyService.getSurvey(slug);
    this.survey.set(survey);

    if (survey.intakeConfig?.fields) {
      this.intakeFields.set(survey.intakeConfig.fields);
    }
  }

  getLabel(field: any): string {
    const lang = this.translate.currentLang || "en";
    if (typeof field.label === "string") return field.label;
    return field.label?.[lang] || field.label?.["en"] || field.key;
  }

  getOptionLabel(option: any): string {
    const lang = this.translate.currentLang || "en";
    if (typeof option.label === "string") return option.label;
    return option.label?.[lang] || option.label?.["en"] || option.value;
  }

  async onSubmit() {
    const s = this.survey();
    if (!s) return;

    const intakeData = Object.keys(this.formData).length > 0 ? this.formData : undefined;
    await firstValueFrom(
      this.api.post(`/survey/${s.slug}/join`, { intakeData: intakeData || null })
    );
    this.router.navigateByUrl(`/survey/${s.slug}`, { replaceUrl: true });
  }
}
