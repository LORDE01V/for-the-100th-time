import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';
// Optional: import a backend if loading translations from files, e.g., i18next-http-backend
// import HttpBackend from 'i18next-http-backend';

i18n
  // load translation using http -> see /public/locales (i.e. https://github.com/i18next/react-i18next/tree/master/example/react/public/locales)
  // learn more: https://github.com/i18next/i18next-http-backend
  // .use(HttpBackend) // Uncomment if loading translations from public/locales

  // detect user language
  // learn more: https://github.com/i18next/i18next-browser-languageDetector
  .use(LanguageDetector)

  // pass the i18n instance to react-i18next.
  .use(initReactI18next)

  // init i18next
  // for all options read: https://www.i18next.com/overview/configuration-options
  .init({
    debug: true, // Set to false in production
    fallbackLng: 'en', // Fallback language
    interpolation: {
      escapeValue: false, // not needed for react as it escapes by default
    },
    // If not using HttpBackend, define resources directly here
    resources: {
      en: {
        translation: {
          // English translations will go here
          // Example:
          "settings.title": "Settings",
          "settings.lastLogin": "Last login:",
          "settings.accountSettings": "Account Settings",
          "settings.oldPassword": "Old Password",
          "settings.newPassword": "New Password",
          "settings.confirmNewPassword": "Confirm New Password",
          "settings.changePassword": "Change Password",
          "settings.preferences": "Preferences",
          "settings.language": "Language",
          "settings.receiveSmsAlerts": "Receive SMS Alerts",
          "settings.receiveEmailAlerts": "Receive Email Alerts",
          "settings.savePreferences": "Save Preferences",
          "settings.dangerZone": "Danger Zone",
          "settings.deleteAccount": "Delete My Account",
          "settings.accountDeleted": "Account Deleted.",
          "settings.passwordUpdated": "Password updated successfully.",
          "settings.preferencesSaved": "Preferences updated.",
          "common.backToHome": "Back to Home",
          "languages.en": "English",
          "languages.zu": "isiZulu",
        }
      },
      zu: {
        translation: {
          // IsiZulu translations will go here
          // Example:
          "settings.title": "Izilungiselelo",
          "settings.lastLogin": "Ukungena kwakamuva:",
          "settings.accountSettings": "Izilungiselelo Ze-Akhawunti",
          "settings.oldPassword": "Iphasiwedi endala",
          "settings.newPassword": "Iphasiwedi entsha",
          "settings.confirmNewPassword": "Qinisekisa iphasiwedi entsha",
          "settings.changePassword": "Shintsha Iphasiwedi",
          "settings.preferences": "Izintandokazi",
          "settings.language": "Ulimi",
          "settings.receiveSmsAlerts": "Thola Izaziso nge-SMS",
          "settings.receiveEmailAlerts": "Thola Izaziso nge-Email",
          "settings.savePreferences": "Gcina Izintandokazi",
          "settings.dangerZone": "Indawo Eyingozi",
          "settings.deleteAccount": "Susa I-Akhawunti Yami",
          "settings.accountDeleted": "I-Akhawunti Isusiwe.",
          "settings.passwordUpdated": "Iphasiwedi isishintshiwe ngempumelelo.",
          "settings.preferencesSaved": "Izintandokazi zigciniwe.",
           "common.backToHome": "Buyela Ekhaya",
          "languages.en": "English",
          "languages.zu": "isiZulu",
        }
      }
    }
  });

export default i18n;
