import { Component, inject, signal } from "@angular/core";
import { Router, RouterLink } from "@angular/router";
import {
  IonButton,
  IonContent,
  IonHeader,
  IonIcon,
  IonSpinner,
  IonTitle,
  IonToolbar,
} from "@ionic/angular/standalone";
import { TranslatePipe } from "@ngx-translate/core";
import { addIcons } from "ionicons";
import { mailOutline } from "ionicons/icons";
import { AuthService } from "../../services/auth.service";
import { ToastService } from "../../services/toast.service";

@Component({
  selector: "app-registration-success",
  standalone: true,
  imports: [
    RouterLink,
    TranslatePipe,
    IonHeader,
    IonToolbar,
    IonTitle,
    IonContent,
    IonButton,
    IonIcon,
    IonSpinner,
  ],
  templateUrl: "./registration-success.page.html",
  styleUrls: ["./registration-success.page.scss"],
})
export class RegistrationSuccessPage {
  private auth = inject(AuthService);
  private router = inject(Router);
  private toast = inject(ToastService);

  resending = signal(false);
  cooldown = signal(0);
  private cooldownInterval: ReturnType<typeof setInterval> | null = null;

  constructor() {
    addIcons({ mailOutline });
  }

  get email(): string {
    return this.auth.currentUser()?.email ?? "";
  }

  async resendVerification() {
    this.resending.set(true);
    try {
      await this.auth.resendVerification();
      this.toast.success("auth.verification-sent");
      this.startCooldown(30);
    } catch (e) {
      this.toast.apiError(e);
    } finally {
      this.resending.set(false);
    }
  }

  private startCooldown(seconds: number) {
    this.cooldown.set(seconds);
    if (this.cooldownInterval) clearInterval(this.cooldownInterval);
    this.cooldownInterval = setInterval(() => {
      const remaining = this.cooldown() - 1;
      this.cooldown.set(remaining);
      if (remaining <= 0 && this.cooldownInterval) {
        clearInterval(this.cooldownInterval);
        this.cooldownInterval = null;
      }
    }, 1000);
  }
}
