import { Component, inject, input, output } from "@angular/core";
import { FormsModule } from "@angular/forms";
import {
  IonCheckbox,
  IonInput,
  IonItem,
  IonLabel,
  IonList,
  IonRadio,
  IonRadioGroup,
  IonSelect,
  IonSelectOption,
} from "@ionic/angular/standalone";
import { TranslatePipe, TranslateService } from "@ngx-translate/core";
import { IntakeField, IntakeFieldOption, MultilingualText } from "../../models/intake-config.model";

@Component({
  selector: "app-intake-form-renderer",
  standalone: true,
  imports: [
    FormsModule,
    TranslatePipe,
    IonList,
    IonItem,
    IonLabel,
    IonInput,
    IonSelect,
    IonSelectOption,
    IonRadioGroup,
    IonRadio,
    IonCheckbox,
  ],
  templateUrl: "./intake-form-renderer.component.html",
  styleUrls: ["./intake-form-renderer.component.scss"],
})
export class IntakeFormRendererComponent {
  private translate = inject(TranslateService);

  fields = input.required<IntakeField[]>();
  formData = input.required<Record<string, any>>();
  formDataChange = output<Record<string, any>>();

  getLabel(labelObj: MultilingualText): string {
    const lang = this.translate.currentLang || "en";
    return labelObj?.[lang] || labelObj?.["en"] || "";
  }

  getOptionLabel(option: IntakeFieldOption): string {
    return this.getLabel(option.label);
  }

  getPlaceholder(field: IntakeField): string {
    if (!field.placeholder) return "";
    return this.getLabel(field.placeholder);
  }

  isFieldVisible(field: IntakeField): boolean {
    if (!field.condition) return true;
    const depValue = this.formData()[field.condition.fieldId];
    if (field.condition.operator === "eq") {
      if (Array.isArray(depValue)) {
        return depValue.includes(field.condition.value);
      }
      return depValue === field.condition.value;
    }
    return true;
  }

  isChecked(fieldId: string, value: string): boolean {
    const arr = this.formData()[fieldId];
    return Array.isArray(arr) && arr.includes(value);
  }

  toggleCheckbox(fieldId: string, value: string) {
    const data = { ...this.formData() };
    const arr: string[] = Array.isArray(data[fieldId]) ? [...data[fieldId]] : [];
    const idx = arr.indexOf(value);
    if (idx >= 0) {
      arr.splice(idx, 1);
    } else {
      arr.push(value);
    }
    data[fieldId] = arr;
    this.formDataChange.emit(data);
  }

  onFieldChange(fieldId: string, value: any) {
    const data = { ...this.formData() };
    data[fieldId] = value;
    this.formDataChange.emit(data);
  }
}
