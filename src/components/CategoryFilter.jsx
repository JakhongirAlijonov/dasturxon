import { useTranslation } from "react-i18next";

export default function CategoryFilter({ categories, active, onChange }) {
  const { t, i18n } = useTranslation();
  const lang = i18n.language;

  return (
    <div className="bg-white border-b border-cream-dark sticky top-0 z-10">
      <div className="flex gap-2 overflow-x-auto px-4 py-3 no-scrollbar">
        <button
          onClick={() => onChange("all")}
          className={`flex-shrink-0 px-4 py-1.5 rounded-full text-xs font-semibold tracking-wide transition border
            ${
              active === "all"
                ? "bg-lapis text-gold border-lapis"
                : "bg-transparent text-gray-500 border-gray-200 hover:border-lapis/30"
            }`}
        >
          {t("menu.all")}
        </button>

        {categories.map((cat) => (
          <button
            key={cat.id}
            onClick={() => onChange(cat.id)}
            className={`flex-shrink-0 px-4 py-1.5 rounded-full text-xs font-semibold tracking-wide transition border
              ${
                active === cat.id
                  ? "bg-lapis text-gold border-lapis"
                  : "bg-transparent text-gray-500 border-gray-200 hover:border-lapis/30"
              }`}
          >
            {cat.name?.[lang] || cat.name?.uz}
          </button>
        ))}
      </div>
    </div>
  );
}
