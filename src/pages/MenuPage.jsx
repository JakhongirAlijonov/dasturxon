import { useEffect, useRef, useState } from "react";
import { useParams, useSearchParams } from "react-router-dom";
import DishDetailModal from "../components/DishDetailModal";
import {
  collection,
  query,
  where,
  getDocs,
  doc,
  getDoc,
} from "firebase/firestore";
import { db } from "../firebase/config";
import { recordDishOpen, recordMenuOpen } from "../firebase/analytics";
import { useTranslation } from "react-i18next";
import DishCard from "../components/Dishcard";
import CategoryFilter from "../components/CategoryFilter";
import LanguageSwitcher from "../components/LanguageSwitcher";
import UzbekPattern from "../components/UzbekPattern";
import { Search } from "lucide-react";

export default function MenuPage() {
  const { restaurantId } = useParams();
  const [searchParams] = useSearchParams();
  const table = searchParams.get("table");
  const source = searchParams.get("source");
  const { t, i18n } = useTranslation();
  const lang = i18n.language;
  const [selectedDish, setSelectedDish] = useState(null);
  const [restaurant, setRestaurant] = useState(null);
  const [loadedRestaurantId, setLoadedRestaurantId] = useState(null);
  const [dishes, setDishes] = useState([]);
  const [categories, setCategories] = useState([]);
  const [activeCategory, setActiveCategory] = useState("all");
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const trackedMenuOpen = useRef(null);

  useEffect(() => {
    fetchMenuData();
  }, [restaurantId]);

  useEffect(() => {
    if (!restaurant || loadedRestaurantId !== restaurantId) return;
    const visitKey = `${restaurantId}:${table || ""}:${source || ""}`;
    if (trackedMenuOpen.current === visitKey) return;
    trackedMenuOpen.current = visitKey;
    void recordMenuOpen(restaurantId, {
      tableNumber: table,
      source,
    });
  }, [restaurant, loadedRestaurantId, restaurantId, table, source]);

  async function fetchMenuData() {
    setLoading(true);
    setRestaurant(null);
    setLoadedRestaurantId(null);
    try {
      const restSnap = await getDoc(doc(db, "restaurants", restaurantId));
      if (restSnap.exists()) {
        const data = restSnap.data();

        // block inactive restaurants
        if (data.active === false) {
          setRestaurant(null);
          setLoadedRestaurantId(restaurantId);
          setLoading(false);
          return;
        }

        setRestaurant(data);
        setLoadedRestaurantId(restaurantId);
      } else {
        setRestaurant(null);
        setLoadedRestaurantId(restaurantId);
        setLoading(false);
        return;
      }

      const catSnap = await getDocs(
        collection(db, "restaurants", restaurantId, "categories"),
      );
      setCategories(catSnap.docs.map((d) => ({ id: d.id, ...d.data() })));

      const dishQuery = query(
        collection(db, "restaurants", restaurantId, "dishes"),
        where("isArchived", "==", false),
      );
      const dishSnap = await getDocs(dishQuery);
      setDishes(dishSnap.docs.map((d) => ({ id: d.id, ...d.data() })));
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  function openDish(dish) {
    setSelectedDish(dish);
    void recordDishOpen(restaurantId, dish.id);
  }

  const filtered = dishes
    .filter((dish) => {
      const matchCat =
        activeCategory === "all" || dish.category === activeCategory;
      const matchSearch =
        dish.name?.uz?.toLowerCase().includes(search.toLowerCase()) ||
        dish.name?.ru?.toLowerCase().includes(search.toLowerCase()) ||
        dish.name?.ko?.toLowerCase().includes(search.toLowerCase());
      return matchCat && matchSearch;
    })
    .sort((a, b) => {
      if (a.isPopular && !b.isPopular) return -1;
      if (!a.isPopular && b.isPopular) return 1;
      return 0;
    });

  if (loading) return <MenuSkeleton />;

  if (!restaurant)
    return (
      <div className="min-h-screen bg-lapis-dark flex flex-col items-center justify-center px-6 text-center">
        <div className="text-6xl mb-6">🔒</div>
        <h1 className="font-display text-2xl font-bold text-gold mb-3">
          Restaurant Closed
        </h1>
        <p className="text-gold/50 text-sm">
          This restaurant is currently unavailable. Please try again later.
        </p>
      </div>
    );
  return (
    <div className="min-h-screen bg-cream font-body">
      {/* Hero Header */}
      <div className="relative bg-lapis-dark overflow-hidden">
        {/* Geometric pattern overlay */}
        <UzbekPattern className="absolute top-0 right-0 text-gold opacity-20 w-48 h-48" />
        <UzbekPattern className="absolute bottom-0 left-0 text-gold opacity-10 w-32 h-32" />

        {/* Gold top border */}
        <div className="h-1 bg-gradient-to-r from-gold-dark via-gold-light to-gold-dark" />

        <div className="relative px-5 pt-6 pb-8">
          {/* Language switcher */}
          <div className="flex justify-end mb-4">
            <LanguageSwitcher />
          </div>

          {/* Restaurant name */}
          <div className="text-center mb-6">
            {/* Decorative line */}
            <div className="flex items-center justify-center gap-3 mb-3">
              <div className="h-px w-12 bg-gold opacity-60" />
              <div className="w-2 h-2 bg-gold rounded-full opacity-80" />
              <div className="h-px w-12 bg-gold opacity-60" />
            </div>

            <h1 className="font-display text-3xl font-bold text-gold-light tracking-wide">
              {restaurant?.name || "Dasturxon"}
            </h1>

            <div className="flex items-center justify-center gap-3 mt-3">
              <div className="h-px w-12 bg-gold opacity-60" />
              <div className="w-2 h-2 bg-gold rounded-full opacity-80" />
              <div className="h-px w-12 bg-gold opacity-60" />
            </div>

            {table && (
              <p className="text-gold-light/60 text-sm mt-3 font-light tracking-widest uppercase">
                {t("menu.table")} {table}
              </p>
            )}
          </div>

          {/* Search bar */}
          <div className="relative">
            <Search
              size={16}
              className="absolute left-4 top-1/2 -translate-y-1/2 text-gold opacity-60"
            />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder={t("menu.search")}
              className="w-full bg-lapis/80 text-white placeholder-white/40 rounded-2xl pl-10 pr-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-gold/50 border border-gold/20"
            />
          </div>
        </div>
      </div>

      {/* Category filter */}
      <CategoryFilter
        categories={categories}
        active={activeCategory}
        onChange={setActiveCategory}
      />

      {/* Dish grid */}
      <div className="px-4 py-5 max-w-2xl mx-auto">
        {filtered.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-gray-400 font-display text-lg">
              {t("menu.empty")}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-3 items-stretch">
            {filtered.map((dish) => (
              <div
                key={dish.id}
                onClick={() => openDish(dish)}
                className="cursor-pointer h-full"
              >
                <DishCard dish={dish} />
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="text-center py-8 px-4">
        <div className="flex items-center justify-center gap-3 mb-2">
          <div className="h-px w-8 bg-gold/30" />
          <div className="w-1.5 h-1.5 bg-gold/40 rounded-full" />
          <div className="h-px w-8 bg-gold/30" />
        </div>
        <p className="text-xs text-gray-400 font-light tracking-widest uppercase">
          Dasturxon
        </p>
      </div>
      {selectedDish && (
        <DishDetailModal
          dish={selectedDish}
          restaurantId={restaurantId}
          onClose={() => setSelectedDish(null)}
        />
      )}
    </div>
  );
}

function MenuSkeleton() {
  return (
    <div className="min-h-screen bg-cream">
      <div className="bg-lapis-dark h-52 animate-pulse" />
      <div className="h-14 bg-white animate-pulse" />
      <div className="px-4 py-5 grid grid-cols-2 gap-3">
        {[...Array(6)].map((_, i) => (
          <div key={i} className="bg-gray-200 rounded-2xl h-52 animate-pulse" />
        ))}
      </div>
    </div>
  );
}
