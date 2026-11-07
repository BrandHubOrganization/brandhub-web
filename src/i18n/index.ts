import i18n, { type BackendModule, type ResourceKey } from "i18next";
import { initReactI18next } from "react-i18next";

const savedLang =
  typeof window !== "undefined" && typeof localStorage !== "undefined"
    ? localStorage.getItem("brandhub-lang")
    : null;

// Each language is its own chunk, so a visitor does not download the one they are not reading.
const languageChunks: Record<string, () => Promise<{ default: object }>> = {
  vi: () => import("./locales/vi"),
  en: () => import("./locales/en"),
};
const languageBackend: BackendModule = {
  type: "backend",
  init() {},
  read(language, _namespace, callback) {
    const load = languageChunks[language];
    if (!load) return callback(null, {});
    load().then(
      (chunk) => callback(null, chunk.default as ResourceKey),
      (error) => callback(error, null),
    );
  },
};

export const i18nReady = i18n.use(languageBackend).use(initReactI18next).init({
  lng: savedLang === "en" ? "en" : "vi",
  fallbackLng: "vi",
  interpolation: { escapeValue: false },
});

// Every language switch goes through here, so each screen need not save it itself.
const applyLanguage = (lng: string) => {
  if (typeof window !== "undefined" && typeof localStorage !== "undefined") {
    localStorage.setItem("brandhub-lang", lng);
    if (typeof document !== "undefined" && document.documentElement) {
      document.documentElement.lang = lng;
    }
  }
};
void i18nReady.then(() => applyLanguage(i18n.language));
i18n.on("languageChanged", applyLanguage);

export default i18n;
