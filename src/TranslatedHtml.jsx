import React, { useEffect, useState } from "react";

// TranslatedHtml: translates a block of HTML (preserving markup) using
// Google Translate and renders the translated HTML via dangerouslySetInnerHTML.
// Props:
// - html: string (HTML content)
// - lang: target language code ('vi'|'en' etc.)
// - className: optional className to apply to the wrapper div
export default function TranslatedHtml({ html, lang, className }) {
	const [translated, setTranslated] = useState(html || "");

	useEffect(() => {
		if (!html) {
			setTranslated("");
			return;
		}

		let cancelled = false;

			async function translateHtml() {
				const target = lang === "vi" ? "vi" : "en";

				try {
					const res = await fetch(
						`https://translation.googleapis.com/language/translate/v2?key=AIzaSyAGk0V5ElpYTU7Y5iCNzawfSRWrZodHMVI`,
						{
							method: "POST",
							headers: { "Content-Type": "application/json" },
							body: JSON.stringify({ q: html, target, format: "html" }),
						}
					);

					// If HTML translate fails (400/CORS/etc), try a plain-text fallback below
					if (!res.ok) {
						const txt = await res.text();
						console.warn("TranslatedHtml: HTML translate failed (status", res.status, "):", txt);
						throw new Error("HTML translate failed");
					}

					const data = await res.json();
					if (!cancelled) {
						if (data && data.data && data.data.translations && data.data.translations[0]) {
							setTranslated(data.data.translations[0].translatedText);
							return;
						}
					}
				} catch (err) {
					console.debug("TranslatedHtml: HTML translation attempt failed, trying text fallback. Reason:", err.message);

					// Fallback: extract plain text and try translating as text (more likely to succeed from browser)
					try {
						const tmp = document.createElement("div");
						tmp.innerHTML = html;
						const plain = tmp.textContent || tmp.innerText || "";

						if (!plain) {
							if (!cancelled) setTranslated(html); // nothing to do
							return;
						}

						const res2 = await fetch(
							`https://translation.googleapis.com/language/translate/v2?key=AIzaSyAGk0V5ElpYTU7Y5iCNzawfSRWrZodHMVI`,
							{
								method: "POST",
								headers: { "Content-Type": "application/json" },
								body: JSON.stringify({ q: plain, target, format: "text" }),
							}
						);

						if (!res2.ok) {
							const txt2 = await res2.text();
							console.warn("TranslatedHtml: text translate fallback failed (status", res2.status, "):", txt2);
							if (!cancelled) setTranslated(html);
							return;
						}

						const data2 = await res2.json();
						if (!cancelled && data2 && data2.data && data2.data.translations && data2.data.translations[0]) {
							// Render translated plain text inside a <div> to preserve layout (note: markup lost)
							const escaped = data2.data.translations[0].translatedText
								.replace(/\n/g, "<br/>")
								.replace(/</g, "&lt;")
								.replace(/>/g, "&gt;");
							setTranslated(`<p>${escaped}</p>`);
							return;
						}

						if (!cancelled) setTranslated(html);
					} catch (err2) {
						console.error("TranslatedHtml fallback error:", err2);
						if (!cancelled) setTranslated(html);
					}
				}

		}

		translateHtml();

		return () => {
			cancelled = true;
		};
	}, [html, lang]);

	return (
		<div
			className={className}
			// ⚠️ We intentionally render HTML received from the server after translating it.
			// Ensure your backend/content is sanitized if it can contain unsafe input.
			dangerouslySetInnerHTML={{ __html: translated }}
		/>
	);
}
