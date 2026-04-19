import { useEffect, useState } from "react";
import {
  collection,
  addDoc,
  getDocs,
  deleteDoc,
  doc,
} from "firebase/firestore";
import { db } from "../../firebase/config";
import { useAuth } from "../../context/AuthContext";
import { Plus, Trash2 } from "lucide-react";

export default function CategoriesManager() {
  const { restaurantId } = useAuth();
  const [categories, setCategories] = useState([]);
  const [form, setForm] = useState({ uz: "", ru: "", ko: "" });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchCategories();
  }, []);

  async function fetchCategories() {
    const snap = await getDocs(
      collection(db, "restaurants", restaurantId, "categories"),
    );
    setCategories(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
  }

  async function addCategory() {
    if (!form.uz) return;
    setSaving(true);
    await addDoc(collection(db, "restaurants", restaurantId, "categories"), {
      name: form,
    });
    setForm({ uz: "", ru: "", ko: "" });
    fetchCategories();
    setSaving(false);
  }

  async function deleteCategory(id) {
    if (!confirm("Delete this category?")) return;
    await deleteDoc(doc(db, "restaurants", restaurantId, "categories", id));
    fetchCategories();
  }

  return (
    <div>
      <h2 className="text-xl font-bold text-gray-800 mb-6">Categories</h2>

      {/* Add form */}
      <div className="bg-white rounded-2xl shadow-sm p-5 mb-6">
        <p className="text-sm font-medium text-gray-700 mb-3">
          Add new category
        </p>
        <div className="grid grid-cols-3 gap-3 mb-3">
          {["uz", "ru", "ko"].map((lang) => (
            <input
              key={lang}
              value={form[lang]}
              onChange={(e) =>
                setForm((f) => ({ ...f, [lang]: e.target.value }))
              }
              placeholder={lang.toUpperCase()}
              className="border border-gray-300 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
            />
          ))}
        </div>
        <button
          onClick={addCategory}
          disabled={saving || !form.uz}
          className="flex items-center gap-2 bg-blue-900 text-yellow-400 px-4 py-2 rounded-xl text-sm font-semibold hover:bg-blue-800 transition disabled:opacity-50"
        >
          <Plus size={16} />
          Add Category
        </button>
      </div>

      {/* List */}
      <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
        {categories.length === 0 ? (
          <div className="text-center text-gray-400 py-12">
            No categories yet
          </div>
        ) : (
          <div className="divide-y">
            {categories.map((cat) => (
              <div
                key={cat.id}
                className="flex items-center justify-between px-5 py-4"
              >
                <div className="flex gap-4">
                  <span className="text-sm font-medium text-gray-800">
                    {cat.name?.uz}
                  </span>
                  <span className="text-sm text-gray-400">{cat.name?.ru}</span>
                  <span className="text-sm text-gray-400">{cat.name?.ko}</span>
                </div>
                <button
                  onClick={() => deleteCategory(cat.id)}
                  className="p-2 hover:bg-gray-100 text-red-500 rounded-lg transition"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
