import { provideHttpClient, withInterceptors } from "@angular/common/http";
import { inject, provideAppInitializer, provideZoneChangeDetection } from "@angular/core";
import { bootstrapApplication } from "@angular/platform-browser";
import {
  PreloadAllModules,
  provideRouter,
  RouteReuseStrategy,
  withPreloading,
} from "@angular/router";
import { IonicRouteStrategy, provideIonicAngular } from "@ionic/angular/standalone";
import { provideTranslateService } from "@ngx-translate/core";
import { provideTranslateHttpLoader } from "@ngx-translate/http-loader";

import { AppComponent } from "./app/app.component";
import { routes } from "./app/app.routes";
import { authInterceptor } from "./app/interceptors/auth.interceptor";
import { AuthService } from "./app/services/auth.service";
import { LocaleService } from "./app/services/locale.service";
import { ThemeService } from "./app/services/theme.service";

bootstrapApplication(AppComponent, {
  providers: [
    provideZoneChangeDetection(),
    { provide: RouteReuseStrategy, useClass: IonicRouteStrategy },
    provideIonicAngular({ animated: false }),
    provideRouter(routes, withPreloading(PreloadAllModules)),
    provideHttpClient(withInterceptors([authInterceptor])),
    provideTranslateService({
      loader: provideTranslateHttpLoader({
        prefix: "./assets/i18n/",
        suffix: ".json",
      }),
    }),
    provideAppInitializer(() => inject(ThemeService).init()),
    provideAppInitializer(() => inject(LocaleService).init()),
    provideAppInitializer(() => inject(AuthService).init()),
  ],
});
