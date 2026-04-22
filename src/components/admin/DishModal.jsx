import { useEffect, useState } from "react";
import {
  collection,
  addDoc,
  doc,
  updateDoc,
  getDocs,
} from "firebase/firestore";
import { db } from "../../firebase/config";
import { X } from "lucide-react";
import ImageUploader from "./ImageUploader";
const LANGS = ["uz", "ru", "ko"];
const LANG_LABELS = { uz: "Uzbek", ru: "Russian", ko: "Korean" };

const empty = {
  name: { uz: "", ru: "", ko: "" },
  description: { uz: "", ru: "", ko: "" },
  price: "",
  category: "",
  inStock: true,
  isArchived: false,
  isNew: false,
  imageUrl: "",
};

export default function DishModal({ dish, restaurantId, onClose }) {
  const [form, setForm] = useState(dish || empty);
  const [categories, setCategories] = useState([]);
  const [saving, setSaving] = useState(false);
  const [activeLang, setActiveLang] = useState("uz");

  useEffect(() => {
    fetchCategories();
    if (dish) setForm(dish);
    else setForm(empty);
  }, [dish]);

  async function fetchCategories() {
    const snap = await getDocs(
      collection(db, "restaurants", restaurantId, "categories"),
    );
    setCategories(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
  }

  function setMultiLang(field, lang, value) {
    setForm((f) => ({ ...f, [field]: { ...f[field], [lang]: value } }));
  }

  async function handleSave() {
    setSaving(true);
    try {
      const data = {
        ...form,
        price: Number(form.price),
      };

      if (dish?.id) {
        await updateDoc(
          doc(db, "restaurants", restaurantId, "dishes", dish.id),
          data,
        );
      } else {
        await addDoc(collection(db, "restaurants", restaurantId, "dishes"), {
          ...data,
          createdAt: new Date(),
        });
      }
      onClose();
    } catch (err) {
      console.error(err);
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-end sm:items-center justify-center p-4">
      <div className="bg-white rounded-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b">
          <h3 className="font-bold text-gray-800 text-lg">
            {dish ? "Edit Dish" : "Add Dish"}
          </h3>
          <button
            onClick={onClose}
            className="p-1 hover:bg-gray-100 rounded-lg"
          >
            <X size={20} />
          </button>
        </div>

        <div className="p-5 space-y-5">
          {/* Language tabs */}
          <div className="flex gap-2">
            {LANGS.map((l) => (
              <button
                key={l}
                onClick={() => setActiveLang(l)}
                className={`px-3 py-1.5 rounded-lg text-sm font-medium transition
                  ${
                    activeLang === l
                      ? "bg-blue-900 text-yellow-400"
                      : "bg-gray-100 text-gray-600"
                  }`}
              >
                {LANG_LABELS[l]}
              </button>
            ))}
          </div>

          {/* Name */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Name ({LANG_LABELS[activeLang]})
            </label>
            <input
              value={form.name[activeLang]}
              onChange={(e) => setMultiLang("name", activeLang, e.target.value)}
              className="w-full border border-gray-300 rounded-xl px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
              placeholder={`Dish name in ${LANG_LABELS[activeLang]}`}
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Description ({LANG_LABELS[activeLang]})
            </label>
            <textarea
              value={form.description[activeLang]}
              onChange={(e) =>
                setMultiLang("description", activeLang, e.target.value)
              }
              rows={3}
              className="w-full border border-gray-300 rounded-xl px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400 resize-none"
              placeholder={`Description in ${LANG_LABELS[activeLang]}`}
            />
          </div>

          {/* Price */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Price (₩)
            </label>
            <input
              type="number"
              value={form.price}
              onChange={(e) =>
                setForm((f) => ({ ...f, price: e.target.value }))
              }
              className="w-full border border-gray-300 rounded-xl px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
              placeholder="15000"
            />
          </div>

          {/* Category */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Category
            </label>
            <select
              value={form.category}
              onChange={(e) =>
                setForm((f) => ({ ...f, category: e.target.value }))
              }
              className="w-full border border-gray-300 rounded-xl px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
            >
              <option value="">Select category</option>
              {categories.map((cat) => (
                <option key={cat.id} value={cat.id}>
                  {cat.name?.uz || cat.name?.ru}
                </option>
              ))}
            </select>
          </div>

          {/* NEW */}
          <ImageUploader
            value={form.imageUrl}
            onChange={(url) => setForm((f) => ({ ...f, imageUrl: url }))}
            restaurantId={restaurantId}
          />

          {/* Toggles */}
          <div className="flex flex-wrap gap-4">
            {[
  { key: "inStock",    label: "In Stock" },
  { key: "isNew",      label: "New Badge" },
  { key: "isPopular",  label: "Popular Badge" },
  { key: "isArchived", label: "Archived" },
].map(({ key, label }) => (
  <label key={key} className="flex items-center gap-2 cursor-pointer">
    <input
      type="checkbox"
      checked={form[key] || false}
      onChange={e => setForm(f => ({ ...f, [key]: e.target.checked }))}
      className="w-4 h-4 accent-blue-900"
    />
    <span className="text-sm text-gray-700">{label}</span>
  </label>
))}
          </div>
        </div>

        {/* Footer */}
        <div className="p-5 border-t flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 border border-gray-300 text-gray-600 py-2 rounded-xl text-sm font-medium hover:bg-gray-50 transition"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={saving}
            className="flex-1 bg-blue-900 text-yellow-400 py-2 rounded-xl text-sm font-semibold hover:bg-blue-800 transition disabled:opacity-50"
          >
            {saving ? "Saving..." : "Save"}
          </button>
        </div>
      </div>
    </div>
  );
}
