import en from "./en.json";
import cs from "./cs.json";

const translations: Record<string, typeof en> = { en, cs };
const APP_URL = import.meta.env.PUBLIC_APP_URL || "";

export function t(locale: string, key: string): string {
  const keys = key.split(".");
  let result: any = translations[locale] || translations["en"];
  for (const k of keys) {
    result = result?.[k];
  }
  return result || key;
}

export function getLocale(url: URL): string {
  const [, lang] = url.pathname.split("/");
  return lang === "cs" ? "cs" : "en";
}

export function localePath(locale: string, path: string): string {
  if (locale === "en") return path;
  return `/${locale}${path}`;
}

export function appLink(path: string): string {
  return `${APP_URL}${path}`;
}

export function switchLocalePath(url: URL, targetLocale: string): string {
  const currentLocale = getLocale(url);
  let path = url.pathname;

  if (currentLocale === "cs") {
    path = path.replace(/^\/cs/, "") || "/";
  }

  if (targetLocale === "cs") {
    return `/cs${path === "/" ? "" : path}`;
  }
  return path;
}
