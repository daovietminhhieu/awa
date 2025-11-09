import React, { useEffect, useState } from "react";
import { translationManager } from "./TranslationManager";

export default function TranslatedHtml({ html, lang, className }) {
  const [translated, setTranslated] = useState(html);

  useEffect(() => {
    if (!html) return;
    translationManager.requestTranslation(html, lang, setTranslated);
  }, [html, lang]);

  return (
    <div
      className={className}
      dangerouslySetInnerHTML={{ __html: translated }}
    />
  );
}
