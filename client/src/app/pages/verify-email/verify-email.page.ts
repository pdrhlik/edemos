import { Component, inject, OnInit } from "@angular/core";
import { ActivatedRoute, Router } from "@angular/router";
import { IonContent, IonSpinner } from "@ionic/angular/standalone";
import { AuthService } from "../../services/auth.service";
import { ToastService } from "../../services/toast.service";

@Component({
  selector: "app-verify-email",
  standalone: true,
  imports: [IonContent, IonSpinner],
  template: `<ion-content class="ion-padding"
    ><div class="center"><ion-spinner name="crescent"></ion-spinner></div
  ></ion-content>`,
  styles: [
    `
      .center {
        display: flex;
        justify-content: center;
        padding-top: 20vh;
      }
    `,
  ],
})
export class VerifyEmailPage implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private auth = inject(AuthService);
  private toast = inject(ToastService);

  async ngOnInit() {
    const token = this.route.snapshot.paramMap.get("token");
    if (!token) {
      this.router.navigateByUrl("/login", { replaceUrl: true });
      return;
    }
    try {
      await this.auth.verifyEmail(token);
      this.toast.success("auth.verify-email-success");
      this.router.navigateByUrl("/surveys", { replaceUrl: true });
    } catch {
      this.toast.error("auth.verify-email-failed");
      this.router.navigateByUrl("/login", { replaceUrl: true });
    }
  }
}
