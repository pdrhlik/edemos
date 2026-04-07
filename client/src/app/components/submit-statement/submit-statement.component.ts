import { Component, inject, input, output, signal } from "@angular/core";
import { FormsModule } from "@angular/forms";
import { TranslatePipe, TranslateService } from "@ngx-translate/core";
import {
  IonInput, IonButton, IonIcon, IonNote, IonText,
  ToastController
} from "@ionic/angular/standalone";
import { addIcons } from "ionicons";
import { sendOutline } from "ionicons/icons";
import { StatementService } from "../../services/statement.service";

@Component({
  selector: "app-submit-statement",
  standalone: true,
  imports: [
    FormsModule, TranslatePipe,
    IonInput, IonButton, IonIcon, IonNote, IonText
  ],
  templateUrl: "./submit-statement.component.html",
  styleUrls: ["./submit-statement.component.scss"]
})
export class SubmitStatementComponent {
  private statementService = inject(StatementService);
  private toastController = inject(ToastController);
  private translate = inject(TranslateService);

  surveyId = input.required<number>();
  charMin = input<number>(20);
  charMax = input<number>(150);

  statementSubmitted = output<void>();

  newText = "";
  submitted = signal(false);

  constructor() {
    addIcons({ sendOutline });
  }

  get charCount(): number {
    return this.newText.length;
  }

  get isValid(): boolean {
    const len = this.newText.length;
    return len >= this.charMin() && len <= this.charMax();
  }

  async submit() {
    if (!this.isValid) return;

    await this.statementService.submitStatement(this.surveyId(), this.newText.trim());
    this.newText = "";
    this.submitted.set(true);
    this.statementSubmitted.emit();

    const toast = await this.toastController.create({
      message: this.translate.instant("statement.submitted-for-moderation"),
      duration: 3000,
      color: "success",
      position: "bottom"
    });
    await toast.present();

    setTimeout(() => this.submitted.set(false), 3000);
  }
}
