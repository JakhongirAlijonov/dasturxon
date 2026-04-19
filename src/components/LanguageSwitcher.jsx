import { useTranslation } from "react-i18next";

const LANGS = [
  { code: "uz", label: "UZ" },
  { code: "ru", label: "RU" },
  { code: "ko", label: "한" },
];

export default function LanguageSwitcher() {
  const { i18n } = useTranslation();

  function changeLang(code) {
    i18n.changeLanguage(code);
    localStorage.setItem("lang", code);
  }

  return (
    <div className="flex gap-1 bg-lapis/50 rounded-xl p-1">
      {LANGS.map((lang) => (
        <button
          key={lang.code}
          onClick={() => changeLang(lang.code)}
          className={`px-3 py-1 rounded-lg text-xs font-bold tracking-wider transition
            ${
              i18n.language === lang.code
                ? "bg-gold text-lapis-dark"
                : "text-white/60 hover:text-white"
            }`}
        >
          {lang.label}
        </button>
      ))}
    </div>
  );
}
