import React, { createContext, useContext, useMemo, useState } from "react";
import en from "./en.json";
import vi from "./vi.json";

const resources = { en, vi };
const DEFAULT_LANG = "en";

const I18nContext = createContext();

export function I18nProvider({ children }) {
  const [lang, setLang] = useState(() => {
    try {
      return sessionStorage.getItem("lang") || DEFAULT_LANG;
    } catch {
      return DEFAULT_LANG;
    }
  });

  const changeLang = (next) => {
    setLang(next);
    try {
      sessionStorage.setItem("lang", next);
    } catch {}
  };

  // t(path, varsOrFallback?) supports either a fallback string or an object of variables for interpolation
  const t = (path, varsOrFallback = "", options = {}) => {
    const parts = path.split(".");
    let obj = resources[lang];

    for (const p of parts) {
      if (!obj)
        return typeof varsOrFallback === "string"
          ? varsOrFallback || path
          : path;
      obj = obj[p];
    }

    // ✅ Nếu là object hoặc array và returnObjects=true thì trả thẳng luôn
    if (options.returnObjects && typeof obj === "object") return obj;

    let str =
      obj ??
      (typeof varsOrFallback === "string" ? varsOrFallback : null) ??
      path;

    // 🔁 Nếu varsOrFallback là object thì interpolate {{var}}
    if (
      str &&
      typeof str === "string" &&
      varsOrFallback &&
      typeof varsOrFallback === "object"
    ) {
      for (const [k, v] of Object.entries(varsOrFallback)) {
        const re = new RegExp(`{{\\s*${k}\\s*}}`, "g");
        str = str.replace(re, String(v));
      }
    }

    return str;
  };

  const value = useMemo(() => ({ lang, changeLang, t }), [lang]);
  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
}

export function useI18n() {
  return useContext(I18nContext);
}

export default I18nContext;
