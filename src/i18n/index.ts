import i18n from "i18next";
import { initReactI18next } from "react-i18next";

import viAuth from "./locales/vi/auth.json";
import viCommon from "./locales/vi/common.json";
import viNav from "./locales/vi/nav.json";
import viSettings from "./locales/vi/settings.json";
import viLanding from "./locales/vi/landing.json";
import viWorkspace from "./locales/vi/workspace.json";
import viInvitations from "./locales/vi/invitations.json";
import viClient from "./locales/vi/client.json";
import viDashboard from "./locales/vi/dashboard.json";
import viEditor from "./locales/vi/editor.json";
import viCalendar from "./locales/vi/calendar.json";
import viHashtagGroups from "./locales/vi/hashtagGroups.json";
import viLibrary from "./locales/vi/library.json";
import viRequests from "./locales/vi/requests.json";
import viTemplates from "./locales/vi/templates.json";
import viAnalytics from "./locales/vi/analytics.json";
import viSocialAccounts from "./locales/vi/socialAccounts.json";
import viPublish from "./locales/vi/publish.json";
import viSubscription from "./locales/vi/subscription.json";
import viAiStudio from "./locales/vi/aiStudio.json";
import viReports from "./locales/vi/reports.json";
import viNotifications from "./locales/vi/notifications.json";

import enAuth from "./locales/en/auth.json";
import enCommon from "./locales/en/common.json";
import enNav from "./locales/en/nav.json";
import enSettings from "./locales/en/settings.json";
import enLanding from "./locales/en/landing.json";
import enWorkspace from "./locales/en/workspace.json";
import enInvitations from "./locales/en/invitations.json";
import enClient from "./locales/en/client.json";
import enDashboard from "./locales/en/dashboard.json";
import enEditor from "./locales/en/editor.json";
import enCalendar from "./locales/en/calendar.json";
import enHashtagGroups from "./locales/en/hashtagGroups.json";
import enLibrary from "./locales/en/library.json";
import enRequests from "./locales/en/requests.json";
import enTemplates from "./locales/en/templates.json";
import enAnalytics from "./locales/en/analytics.json";
import enSocialAccounts from "./locales/en/socialAccounts.json";
import enPublish from "./locales/en/publish.json";
import enSubscription from "./locales/en/subscription.json";
import enAiStudio from "./locales/en/aiStudio.json";
import enReports from "./locales/en/reports.json";
import enNotifications from "./locales/en/notifications.json";

const vi = {
  auth: viAuth,
  common: viCommon,
  nav: viNav,
  settings: viSettings,
  landing: viLanding,
  workspace: viWorkspace,
  invitations: viInvitations,
  client: viClient,
  dashboard: viDashboard,
  editor: viEditor,
  calendar: viCalendar,
  hashtagGroups: viHashtagGroups,
  library: viLibrary,
  requests: viRequests,
  templates: viTemplates,
  analytics: viAnalytics,
  socialAccounts: viSocialAccounts,
  publish: viPublish,
  subscription: viSubscription,
  aiStudio: viAiStudio,
  reports: viReports,
  notifications: viNotifications,
};

const en = {
  auth: enAuth,
  common: enCommon,
  nav: enNav,
  settings: enSettings,
  landing: enLanding,
  workspace: enWorkspace,
  invitations: enInvitations,
  client: enClient,
  dashboard: enDashboard,
  editor: enEditor,
  calendar: enCalendar,
  hashtagGroups: enHashtagGroups,
  library: enLibrary,
  requests: enRequests,
  templates: enTemplates,
  analytics: enAnalytics,
  socialAccounts: enSocialAccounts,
  publish: enPublish,
  subscription: enSubscription,
  aiStudio: enAiStudio,
  reports: enReports,
  notifications: enNotifications,
};

const savedLang = localStorage.getItem("brandhub-lang");

i18n.use(initReactI18next).init({
  resources: { vi: { translation: vi }, en: { translation: en } },
  lng: savedLang === "en" ? "en" : "vi",
  fallbackLng: "vi",
  interpolation: { escapeValue: false },
});

export default i18n;
