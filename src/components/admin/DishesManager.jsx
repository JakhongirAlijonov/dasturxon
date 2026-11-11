import { useEffect, useState } from "react";
import {
  collection,
  getDocs,
  doc,
  deleteDoc,
  updateDoc,
  writeBatch,
} from "firebase/firestore";
import { db } from "../../firebase/config";
import { useAuth } from "../../context/AuthContext";
import { useTranslation } from "react-i18next";
import { Plus, Pencil, Trash2, Eye, EyeOff, Archive } from "lucide-react";
import DishModal from "./DishModal";

export default function DishesManager() {
  const { restaurantId } = useAuth();
  const { i18n } = useTranslation();
  const lang = i18n.language;

  const [dishes, setDishes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [deletingDishId, setDeletingDishId] = useState(null);

  useEffect(() => {
    fetchDishes();
  }, []);

  async function fetchDishes() {
    setLoading(true);
    const snap = await getDocs(
      collection(db, "restaurants", restaurantId, "dishes"),
    );
    setDishes(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
    setLoading(false);
  }

  async function toggleStock(dish) {
    await updateDoc(doc(db, "restaurants", restaurantId, "dishes", dish.id), {
      inStock: !dish.inStock,
    });
    fetchDishes();
  }

  async function toggleArchive(dish) {
    await updateDoc(doc(db, "restaurants", restaurantId, "dishes", dish.id), {
      isArchived: !dish.isArchived,
    });
    fetchDishes();
  }

  async function deleteDish(dish) {
    if (!window.confirm("Delete this dish and its reviews? This cannot be undone.")) return;
    setDeletingDishId(dish.id);
    try {
      const reviews = await getDocs(
        collection(db, "restaurants", restaurantId, "dishes", dish.id, "reviews"),
      );
      for (let i = 0; i < reviews.docs.length; i += 450) {
        const batch = writeBatch(db);
        reviews.docs.slice(i, i + 450).forEach((review) => batch.delete(review.ref));
        await batch.commit();
      }
      await deleteDoc(doc(db, "restaurants", restaurantId, "dishes", dish.id));
      setDishes((current) => current.filter((item) => item.id !== dish.id));
    } catch (error) {
      console.error("Failed to delete dish:", error);
      window.alert("Could not delete this dish. Check your Firestore permissions and try again.");
    } finally {
      setDeletingDishId(null);
    }
  }

  function openAdd() {
    setEditing(null);
    setModalOpen(true);
  }
  function openEdit(dish) {
    setEditing(dish);
    setModalOpen(true);
  }
  function closeModal() {
    setModalOpen(false);
    setEditing(null);
    fetchDishes();
  }

  if (loading) return <div className="text-gray-400">Loading...</div>;

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-bold text-gray-800">Dishes</h2>
        <button
          onClick={openAdd}
          className="flex items-center gap-2 bg-blue-900 text-yellow-400 px-4 py-2 rounded-xl text-sm font-semibold hover:bg-blue-800 transition"
        >
          <Plus size={16} />
          Add Dish
        </button>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
        {dishes.length === 0 ? (
          <div className="text-center text-gray-400 py-16">No dishes yet</div>
        ) : (
          <div className="divide-y">
            {dishes.map((dish) => (
              <div
                key={dish.id}
                className={`flex items-center gap-3 p-4 ${dish.isArchived ? "opacity-50" : ""}`}
              >
                {/* Image */}
                {dish.imageUrl ? (
                  <img
                    src={dish.imageUrl}
                    className="w-14 h-14 rounded-xl object-cover flex-shrink-0"
                  />
                ) : (
                  <div className="w-14 h-14 rounded-xl bg-amber-100 flex items-center justify-center flex-shrink-0 text-2xl">
                    🍽️
                  </div>
                )}

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-gray-800 truncate">
                    {dish.name?.[lang] || dish.name?.uz || "—"}
                  </p>
                  <p className="text-sm text-gray-400">
                    {dish.price?.toLocaleString()} ₩
                  </p>
                  <div className="flex gap-2 mt-1">
                    {dish.isNew && (
                      <span className="text-xs bg-yellow-100 text-yellow-700 px-2 py-0.5 rounded-full">
                        New
                      </span>
                    )}
                    {!dish.inStock && (
                      <span className="text-xs bg-red-100 text-red-600 px-2 py-0.5 rounded-full">
                        Out of stock
                      </span>
                    )}
                    {dish.isArchived && (
                      <span className="text-xs bg-gray-100 text-gray-500 px-2 py-0.5 rounded-full">
                        Archived
                      </span>
                    )}
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2 flex-shrink-0">
                  <button
                    onClick={() => toggleStock(dish)}
                    title="Toggle stock"
                    className="p-2 rounded-lg hover:bg-gray-100 text-gray-500 transition"
                  >
                    {dish.inStock ? <Eye size={16} /> : <EyeOff size={16} />}
                  </button>
                  <button
                    onClick={() => toggleArchive(dish)}
                    title="Archive"
                    className="p-2 rounded-lg hover:bg-gray-100 text-gray-500 transition"
                  >
                    <Archive size={16} />
                  </button>
                  <button
                    onClick={() => openEdit(dish)}
                    title="Edit"
                    className="p-2 rounded-lg hover:bg-gray-100 text-blue-600 transition"
                  >
                    <Pencil size={16} />
                  </button>
                  <button
                    onClick={() => deleteDish(dish)}
                    disabled={deletingDishId === dish.id}
                    title="Delete dish and its reviews"
                    className="flex items-center gap-1.5 px-2.5 py-2 rounded-lg hover:bg-red-50 text-red-600 transition disabled:opacity-50 text-sm font-medium"
                  >
                    <Trash2 size={16} />
                    {deletingDishId === dish.id ? "Deleting..." : "Delete"}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Modal */}
      {modalOpen && (
        <DishModal
          dish={editing}
          restaurantId={restaurantId}
          onClose={closeModal}
        />
      )}
    </div>
  );
}
