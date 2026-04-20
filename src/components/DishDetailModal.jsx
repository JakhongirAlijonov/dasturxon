import { X } from "lucide-react";
import { useTranslation } from "react-i18next";
import Reviews from "./Reviews";
import StarRating from "./StarRating";

export default function DishDetailModal({ dish, restaurantId, onClose }) {
  const { i18n } = useTranslation();
  const lang = i18n.language;

  const name = dish.name?.[lang] || dish.name?.uz || "—";
  const desc = dish.description?.[lang] || dish.description?.uz || "";

  return (
    <div className="fixed inset-0 bg-black/60 z-50 flex items-end justify-center">
      <div
        className="bg-cream w-full max-w-lg rounded-t-3xl max-h-[90vh] overflow-y-auto"
        style={{ fontFamily: "Inter, sans-serif" }}
      >
        {/* Image */}
        <div className="relative">
          {dish.imageUrl ? (
            <img
              src={dish.imageUrl}
              alt={name}
              className="w-full h-56 object-cover rounded-t-3xl"
            />
          ) : (
            <div className="w-full h-56 bg-gradient-to-br from-cream to-cream-dark rounded-t-3xl flex items-center justify-center">
              <span className="text-7xl opacity-30">🍽️</span>
            </div>
          )}

          {/* Close button */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 bg-black/40 text-white p-2 rounded-full hover:bg-black/60 transition"
          >
            <X size={18} />
          </button>

          {/* Gold border */}
          <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-gold/60 to-transparent" />
        </div>

        {/* Content */}
        <div className="p-5">
          {/* Name + price */}
          <div className="flex items-start justify-between gap-3 mb-2">
            <h2 className="font-display text-xl font-bold text-lapis-dark leading-tight">
              {name}
            </h2>
            <span className="text-gold-dark font-bold text-lg flex-shrink-0">
              {dish.price?.toLocaleString()} ₩
            </span>
          </div>

          {/* Rating summary */}
          {dish.ratingCount > 0 && (
            <div className="flex items-center gap-2 mb-3">
              <StarRating
                value={Math.round(dish.ratingAverage)}
                readonly
                size={14}
              />
              <span className="text-sm text-gray-500">
                {dish.ratingAverage} ({dish.ratingCount})
              </span>
            </div>
          )}

          {/* Description */}
          {desc && (
            <p className="text-gray-500 text-sm leading-relaxed mb-4">{desc}</p>
          )}

          {/* Badges */}
          <div className="flex gap-2 mb-4">
            {dish.isNew && (
              <span className="bg-gold text-lapis-dark text-xs font-bold px-3 py-1 rounded-full">
                NEW
              </span>
            )}
            {!dish.inStock && (
              <span className="bg-rust text-white text-xs font-bold px-3 py-1 rounded-full">
                Out of stock
              </span>
            )}
          </div>

          {/* Divider */}
          <div className="flex items-center gap-3 my-4">
            <div className="h-px flex-1 bg-gold/20" />
            <span className="text-xs text-gold/60 tracking-widest uppercase">
              Reviews
            </span>
            <div className="h-px flex-1 bg-gold/20" />
          </div>

          {/* Reviews */}
          <Reviews restaurantId={restaurantId} dishId={dish.id} />
        </div>
      </div>
    </div>
  );
}
