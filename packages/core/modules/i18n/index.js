import i18next from "i18next";
import { translations as validationTranslations } from "./validation/translations";

export const NSV = "raqbvalidation";
export const NSVP = `${NSV}:`;

const i18n = i18next.createInstance();
i18n.init({
  fallbackLng: "en",
});
i18n.addResources("en", NSV, validationTranslations);

export const translateValidation = (key, args) => {
  if (key?.str) {
    // already translated
    return key.str;
  }
  if (key?.key) {
    return translateValidation(key.key, key.args);
  }
  if (args === null) {
    return key;
  }
  return i18n.t(
    key.includes(":") ? key : NSVP+key,
    args
  );
};

export default i18n;
