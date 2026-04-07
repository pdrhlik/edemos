import { Component } from "@angular/core";
import { RouterLink } from "@angular/router";
import { IonButton, IonContent, IonIcon } from "@ionic/angular/standalone";
import { TranslatePipe } from "@ngx-translate/core";
import { addIcons } from "ionicons";
import { homeOutline } from "ionicons/icons";

@Component({
  selector: "app-not-found",
  standalone: true,
  imports: [RouterLink, TranslatePipe, IonContent, IonButton, IonIcon],
  templateUrl: "./not-found.page.html",
  styleUrls: ["./not-found.page.scss"],
})
export class NotFoundPage {
  constructor() {
    addIcons({ homeOutline });
  }
}
