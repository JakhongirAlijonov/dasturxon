import { useTranslation } from "react-i18next";

export default function DishCard({ dish }) {
  const { t, i18n } = useTranslation();
  const lang = i18n.language;
  const name = dish.name?.[lang] || dish.name?.uz || dish.name?.ru || "—";
  const desc = dish.description?.[lang] || dish.description?.uz || "";

  return (
    <div className="bg-white rounded-2xl overflow-hidden shadow-sm border border-cream-dark flex flex-col group">
      {/* Image */}
      <div className="relative overflow-hidden">
        {dish.imageUrl ? (
          <img
            src={dish.imageUrl}
            alt={name}
            loading="lazy"
            className="w-full h-36 object-cover group-hover:scale-105 transition-transform duration-300"
          />
        ) : (
          <div className="w-full h-36 bg-gradient-to-br from-cream to-cream-dark flex items-center justify-center">
            <span className="text-5xl opacity-40">🍽️</span>
          </div>
        )}

        {/* Badges */}
        <div className="absolute top-2 left-2 flex flex-col gap-1">
          {dish.isNew && (
            <span className="bg-gold text-lapis-dark text-xs font-bold px-2 py-0.5 rounded-full font-body tracking-wide">
              {t("menu.new")}
            </span>
          )}
          {!dish.inStock && (
            <span className="bg-rust text-white text-xs font-bold px-2 py-0.5 rounded-full">
              {t("menu.outOfStock")}
            </span>
          )}
        </div>

        {/* Gold bottom border on image */}
        <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-gold/40 to-transparent" />
      </div>

      {/* Info */}
      <div className="p-3 flex flex-col flex-1">
        <h3 className="font-display font-semibold text-lapis-dark text-sm leading-tight line-clamp-2">
          {name}
        </h3>
        {desc && (
          <p className="text-gray-400 text-xs mt-1 line-clamp-2 font-light leading-relaxed">
            {desc}
          </p>
        )}
        <div className="mt-auto pt-2 flex items-center justify-between">
          <span className="text-gold-dark font-bold text-sm font-body">
            {dish.price?.toLocaleString()} ₩
          </span>
          {dish.inStock && (
            <span className="w-1.5 h-1.5 bg-green-400 rounded-full" />
          )}
        </div>
      </div>
    </div>
  );
}
