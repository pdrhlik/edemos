export interface IntakeConfig {
  fields: IntakeField[];
}

export interface IntakeField {
  id: string;
  type: "text" | "select" | "radio" | "checkbox";
  label: MultilingualText;
  required: boolean;
  placeholder?: MultilingualText;
  options?: IntakeFieldOption[];
  condition?: IntakeCondition;
}

export interface IntakeFieldOption {
  value: string;
  label: MultilingualText;
}

export interface IntakeCondition {
  fieldId: string;
  operator: "eq";
  value: string;
}

export interface MultilingualText {
  en: string;
  cs: string;
  [key: string]: string;
}
