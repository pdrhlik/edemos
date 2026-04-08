import { Component, effect, inject, input, output, signal } from "@angular/core";
import { FormsModule } from "@angular/forms";
import {
  IonButton,
  IonCard,
  IonCardContent,
  IonCardHeader,
  IonCardTitle,
  IonIcon,
  IonInput,
  IonItem,
  IonLabel,
  IonList,
  IonNote,
  IonSelect,
  IonSelectOption,
  IonText,
  IonToggle,
} from "@ionic/angular/standalone";
import { TranslatePipe, TranslateService } from "@ngx-translate/core";
import { addIcons } from "ionicons";
import {
  addOutline,
  arrowDownOutline,
  arrowUpOutline,
  eyeOutline,
  createOutline,
  trashOutline,
} from "ionicons/icons";
import { IntakeConfig, IntakeField, IntakeFieldOption } from "../../models/intake-config.model";
import { IntakeFormRendererComponent } from "../intake-form-renderer/intake-form-renderer.component";

@Component({
  selector: "app-intake-config-builder",
  standalone: true,
  imports: [
    FormsModule,
    TranslatePipe,
    IonCard,
    IonCardHeader,
    IonCardTitle,
    IonCardContent,
    IonList,
    IonItem,
    IonLabel,
    IonInput,
    IonSelect,
    IonSelectOption,
    IonButton,
    IonIcon,
    IonToggle,
    IonNote,
    IonText,
    IntakeFormRendererComponent,
  ],
  templateUrl: "./intake-config-builder.component.html",
  styleUrls: ["./intake-config-builder.component.scss"],
})
export class IntakeConfigBuilderComponent {
  private translate = inject(TranslateService);

  config = input<IntakeConfig | null>(null);
  configChange = output<IntakeConfig>();

  fields = signal<IntakeField[]>([]);
  previewMode = signal(false);
  previewFormData = signal<Record<string, any>>({});

  constructor() {
    addIcons({
      addOutline,
      arrowUpOutline,
      arrowDownOutline,
      trashOutline,
      eyeOutline,
      createOutline,
    });

    effect(() => {
      const c = this.config();
      if (c?.fields) {
        this.fields.set(structuredClone(c.fields));
      }
    });
  }

  addField() {
    const fields = [...this.fields()];
    fields.push({
      id: "",
      type: "text",
      label: { en: "", cs: "" },
      required: false,
      placeholder: { en: "", cs: "" },
    });
    this.fields.set(fields);
    this.emitConfig();
  }

  removeField(index: number) {
    const fields = [...this.fields()];
    const removedId = fields[index].id;
    fields.splice(index, 1);
    // Clean up conditions referencing the removed field
    for (const f of fields) {
      if (f.condition?.fieldId === removedId) {
        f.condition = undefined;
      }
    }
    this.fields.set(fields);
    this.emitConfig();
  }

  moveField(index: number, direction: "up" | "down") {
    const fields = [...this.fields()];
    const target = direction === "up" ? index - 1 : index + 1;
    if (target < 0 || target >= fields.length) return;
    [fields[index], fields[target]] = [fields[target], fields[index]];
    this.fields.set(fields);
    this.emitConfig();
  }

  updateField(index: number) {
    this.fields.update((f) => [...f]);
    this.emitConfig();
  }

  onTypeChange(index: number, type: string) {
    const fields = [...this.fields()];
    fields[index].type = type as IntakeField["type"];
    if ((type === "select" || type === "radio" || type === "checkbox") && !fields[index].options) {
      fields[index].options = [{ value: "", label: { en: "", cs: "" } }];
    }
    if (type === "text") {
      fields[index].options = undefined;
      if (!fields[index].placeholder) {
        fields[index].placeholder = { en: "", cs: "" };
      }
    }
    this.fields.set(fields);
    this.emitConfig();
  }

  addOption(fieldIndex: number) {
    const fields = [...this.fields()];
    if (!fields[fieldIndex].options) fields[fieldIndex].options = [];
    fields[fieldIndex].options!.push({ value: "", label: { en: "", cs: "" } });
    this.fields.set(fields);
    this.emitConfig();
  }

  removeOption(fieldIndex: number, optionIndex: number) {
    const fields = [...this.fields()];
    fields[fieldIndex].options?.splice(optionIndex, 1);
    this.fields.set(fields);
    this.emitConfig();
  }

  toggleCondition(index: number) {
    const fields = [...this.fields()];
    if (fields[index].condition) {
      fields[index].condition = undefined;
    } else {
      fields[index].condition = { fieldId: "", operator: "eq", value: "" };
    }
    this.fields.set(fields);
    this.emitConfig();
  }

  getOtherFields(currentIndex: number): IntakeField[] {
    return this.fields().filter((_, i) => i !== currentIndex && this.fields()[i].id);
  }

  hasOptions(type: string): boolean {
    return type === "select" || type === "radio" || type === "checkbox";
  }

  togglePreview() {
    this.previewMode.update((v) => !v);
    this.previewFormData.set({});
  }

  private emitConfig() {
    this.configChange.emit({ fields: this.fields() });
  }
}
