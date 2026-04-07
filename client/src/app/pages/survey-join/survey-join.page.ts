import { Component, inject, OnInit, signal } from "@angular/core";
import { FormsModule } from "@angular/forms";
import { ActivatedRoute, Router } from "@angular/router";
import {
  IonBackButton,
  IonButton, IonButtons, IonContent, IonHeader, IonInput, IonItem,
  IonLabel, IonRadio, IonRadioGroup, IonSelect,
  IonSelectOption, IonTitle, IonToolbar
} from "@ionic/angular/standalone";
import { TranslatePipe, TranslateService } from "@ngx-translate/core";
import { firstValueFrom } from "rxjs";
import { Survey } from "../../models/survey.model";
import { ApiService } from "../../services/api.service";
import { SurveyService } from "../../services/survey.service";

@Component({
  selector: "app-survey-join",
  standalone: true,
  imports: [
    FormsModule,
    TranslatePipe,
    IonHeader,
    IonToolbar,
    IonTitle,
    IonContent,
    IonButtons,
    IonBackButton,
    IonButton,
    IonSelect,
    IonSelectOption,
    IonRadioGroup,
    IonRadio,
    IonItem,
    IonLabel,
    IonInput,
  ],
  templateUrl: "./survey-join.page.html",
  styleUrls: ["./survey-join.page.scss"],
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
      this.api.post(`/survey/${s.slug}/join`, { intakeData: intakeData || null }),
    );
    this.router.navigateByUrl(`/survey/${s.slug}`, { replaceUrl: true });
  }
}
