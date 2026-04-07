import { Component, inject, OnInit, signal } from "@angular/core";
import { FormsModule } from "@angular/forms";
import {
  IonButtons,
  IonContent,
  IonHeader,
  IonItem,
  IonList,
  IonMenuButton,
  IonSelect,
  IonSelectOption,
  IonTitle,
  IonToolbar,
} from "@ionic/angular/standalone";
import { TranslatePipe } from "@ngx-translate/core";
import { LocaleService } from "../../services/locale.service";
import { ThemeMode, ThemeService } from "../../services/theme.service";

@Component({
  selector: "app-settings",
  standalone: true,
  imports: [
    FormsModule,
    TranslatePipe,
    IonHeader,
    IonToolbar,
    IonTitle,
    IonContent,
    IonButtons,
    IonMenuButton,
    IonList,
    IonItem,
    IonSelect,
    IonSelectOption,
  ],
  templateUrl: "./settings.page.html",
  styleUrls: ["./settings.page.scss"],
})
export class SettingsPage implements OnInit {
  private localeService = inject(LocaleService);
  themeService = inject(ThemeService);

  currentLang = signal("en");

  ngOnInit() {
    this.currentLang.set(this.localeService.currentLang());
  }

  async onLanguageChange(event: any) {
    const lang = event.detail.value;
    await this.localeService.setLanguage(lang);
    this.currentLang.set(lang);
  }

  onThemeChange(event: any) {
    this.themeService.setMode(event.detail.value as ThemeMode);
  }
}
