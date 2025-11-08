import React, { useState, useEffect } from "react";

export default function TranslatableText({ text, lang }) {
  const [translated, setTranslated] = useState(text);

  useEffect(() => {
    if (!text) return;
    async function translate() {
      try {
        const target = lang === "vi" ? "vi" : "en";

        const res = await fetch(
          `https://translation.googleapis.com/language/translate/v2?key=key`,
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              q: text,
              target,
              format: "text",
            }),
          }
        );

        const data = await res.json();
        if (data.data && data.data.translations) {
          setTranslated(data.data.translations[0].translatedText);
        } else {
          console.error("Unexpected response:", data);
          setTranslated(text);
        }
      } catch (err) {
        console.error(err);
        setTranslated(text); // fallback
      }
    }
    translate();
  }, [text, lang]);

  return <>{translated}</>;
}
