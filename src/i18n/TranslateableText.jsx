import { useEffect, useState } from "react";
import { translationManager } from "./TranslationManager";

export function TranslateText({ text, lang }) {
  const [translated, setTranslated] = useState(text);

  useEffect(() => {
    if (!text) return;
    translationManager.requestTranslation(text, lang, setTranslated);
  }, [text, lang]);

  return <>{translated}</>;
}

export default TranslateText;
