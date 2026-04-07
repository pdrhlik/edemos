import { Routes } from "@angular/router";
import { authGuard } from "./guards/auth.guard";

export const routes: Routes = [
  {
    path: "login",
    loadComponent: () => import("./pages/login/login.page").then(m => m.LoginPage),
  },
  {
    path: "register",
    loadComponent: () => import("./pages/register/register.page").then(m => m.RegisterPage),
  },
  {
    path: "surveys",
    canActivate: [authGuard],
    loadComponent: () => import("./pages/survey-list/survey-list.page").then(m => m.SurveyListPage),
  },
  {
    path: "survey/create",
    canActivate: [authGuard],
    loadComponent: () => import("./pages/survey-create/survey-create.page").then(m => m.SurveyCreatePage),
  },
  {
    path: "survey/:id",
    canActivate: [authGuard],
    loadComponent: () => import("./pages/survey-detail/survey-detail.page").then(m => m.SurveyDetailPage),
  },
  {
    path: "",
    redirectTo: "surveys",
    pathMatch: "full",
  },
];
