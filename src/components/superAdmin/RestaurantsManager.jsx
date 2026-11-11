import { useEffect, useState } from "react";
import {
  collection,
  getDocs,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  writeBatch,
} from "firebase/firestore";
import { db } from "../../firebase/config";
import { Plus, ToggleLeft, ToggleRight, Copy, Trash2 } from "lucide-react";
import { QrCode } from "lucide-react";
import QRModal from "./QRModal";

export default function RestaurantsManager() {
  const [restaurants, setRestaurants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [saving, setSaving] = useState(false);
  const [deletingRestaurantId, setDeletingRestaurantId] = useState(null);
  const [copied, setCopied] = useState(null);
  const [qrRestaurant, setQrRestaurant] = useState(null);
  const [form, setForm] = useState({
    name: "",
    address: "",
    ownerName: "",
    ownerPhone: "",
    instagram: "",
    telegram: "",
    phone: "",
  });

  useEffect(() => {
    fetchRestaurants();
  }, []);

  async function fetchRestaurants() {
    setLoading(true);
    const snap = await getDocs(collection(db, "restaurants"));
    setRestaurants(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
    setLoading(false);
  }

  async function addRestaurant() {
    if (!form.name) return;
    setSaving(true);
    await addDoc(collection(db, "restaurants"), {
      name: form.name,
      address: form.address,
      ownerName: form.ownerName,
      ownerPhone: form.ownerPhone,
      instagram: form.instagram,
      telegram: form.telegram,
      phone: form.phone,
      active: true,
      createdAt: new Date(),
    });

    setForm({
      name: "",
      address: "",
      ownerName: "",
      ownerPhone: "",
      instagram: "",
      telegram: "",
      phone: "",
    });
    setForm({ name: "", address: "", ownerName: "", ownerPhone: "" });
    setShowForm(false);
    await fetchRestaurants(); // make sure this line exists
    setSaving(false);
  }

  async function toggleActive(restaurant) {
    await updateDoc(doc(db, "restaurants", restaurant.id), {
      active: !restaurant.active,
    });
    fetchRestaurants();
  }

  async function deleteRestaurant(restaurant) {
    const confirmed = window.confirm(
      `Delete ${restaurant.name}? This also removes its categories, dishes, reviews, and admin profile documents. Firebase Auth accounts and Cloudinary images are not deleted. This cannot be undone.`,
    );
    if (!confirmed) return;

    setDeletingRestaurantId(restaurant.id);
    try {
      const [categorySnap, dishSnap, userSnap, analyticsSnap] = await Promise.all([
        getDocs(collection(db, "restaurants", restaurant.id, "categories")),
        getDocs(collection(db, "restaurants", restaurant.id, "dishes")),
        getDocs(collection(db, "users")),
        getDocs(collection(db, "restaurants", restaurant.id, "analyticsDaily")),
      ]);

      const [reviewSnaps, analyticsChildren] = await Promise.all([
        Promise.all(
          dishSnap.docs.map((dish) =>
            getDocs(
              collection(
                db,
                "restaurants",
                restaurant.id,
                "dishes",
                dish.id,
                "reviews",
              ),
            ),
          ),
        ),
        Promise.all(
          analyticsSnap.docs.map(async (day) => {
            const [tables, dishes] = await Promise.all([
              getDocs(collection(day.ref, "tables")),
              getDocs(collection(day.ref, "dishes")),
            ]);
            return { day: day.ref, children: [...tables.docs, ...dishes.docs] };
          }),
        ),
      ]);
      const relatedAdminDocs = userSnap.docs.filter(
        (user) =>
          user.data().role === "restaurant_admin" &&
          user.data().restaurantId === restaurant.id,
      );

      const refsToDelete = [
        ...reviewSnaps.flatMap((snap) => snap.docs.map((review) => review.ref)),
        ...dishSnap.docs.map((dish) => dish.ref),
        ...categorySnap.docs.map((category) => category.ref),
        ...relatedAdminDocs.map((user) => user.ref),
        ...analyticsChildren.flatMap((day) => day.children.map((child) => child.ref)),
        ...analyticsSnap.docs.map((day) => day.ref),
      ];

      // Firestore batches support up to 500 writes. Keep each batch below that.
      for (let i = 0; i < refsToDelete.length; i += 450) {
        const batch = writeBatch(db);
        refsToDelete.slice(i, i + 450).forEach((ref) => batch.delete(ref));
        await batch.commit();
      }

      await deleteDoc(doc(db, "restaurants", restaurant.id));
      setRestaurants((current) =>
        current.filter((item) => item.id !== restaurant.id),
      );
    } catch (error) {
      console.error("Failed to delete restaurant:", error);
      window.alert(
        "Could not delete this restaurant. Check your Firestore permissions and try again.",
      );
    } finally {
      setDeletingRestaurantId(null);
    }
  }

  function copyId(id) {
    navigator.clipboard.writeText(id);
    setCopied(id);
    setTimeout(() => setCopied(null), 2000);
  }

  if (loading) return <div className="text-gray-400">Loading...</div>;

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-bold text-gray-800">Restaurants</h2>
        <button
          onClick={() => setShowForm((v) => !v)}
          className="flex items-center gap-2 bg-gray-900 text-yellow-400 px-4 py-2 rounded-xl text-sm font-semibold hover:bg-gray-800 transition"
        >
          <Plus size={16} />
          Add Restaurant
        </button>
      </div>

      {/* Add form */}
      {showForm && (
        <div className="bg-white rounded-2xl shadow-sm p-5 mb-6 space-y-3">
          <input
            value={form.name}
            onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
            placeholder="Restaurant name"
            className="w-full border border-gray-300 rounded-xl px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gray-400"
          />
          <input
            value={form.address}
            onChange={(e) =>
              setForm((f) => ({ ...f, address: e.target.value }))
            }
            placeholder="Address (optional)"
            className="w-full border border-gray-300 rounded-xl px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gray-400"
          />
          <input
            value={form.ownerName}
            onChange={(e) =>
              setForm((f) => ({ ...f, ownerName: e.target.value }))
            }
            placeholder="Owner name"
            className="w-full border border-gray-300 rounded-xl px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gray-400"
          />
          <input
            value={form.ownerPhone}
            onChange={(e) =>
              setForm((f) => ({ ...f, ownerPhone: e.target.value }))
            }
            placeholder="Owner phone number"
            className="w-full border border-gray-300 rounded-xl px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gray-400"
          />
          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">
              @
            </span>
            <input
              value={form.instagram}
              onChange={(e) =>
                setForm((f) => ({ ...f, instagram: e.target.value }))
              }
              placeholder="Instagram username"
              className="w-full border border-gray-300 rounded-xl pl-7 pr-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gray-400"
            />
          </div>
          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">
              @
            </span>
            <input
              value={form.telegram}
              onChange={(e) =>
                setForm((f) => ({ ...f, telegram: e.target.value }))
              }
              placeholder="Telegram username"
              className="w-full border border-gray-300 rounded-xl pl-7 pr-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gray-400"
            />
          </div>
          <input
            value={form.phone}
            onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))}
            placeholder="Phone number e.g. +82 10 1234 5678"
            className="w-full border border-gray-300 rounded-xl px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gray-400"
          />
          <button
            onClick={addRestaurant}
            disabled={saving || !form.name}
            className="bg-gray-900 text-yellow-400 px-5 py-2 rounded-xl text-sm font-semibold hover:bg-gray-800 transition disabled:opacity-50"
          >
            {saving ? "Creating..." : "Create Restaurant"}
          </button>
        </div>
      )}

      {/* List */}
      <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
        {restaurants.length === 0 ? (
          <div className="text-center text-gray-400 py-16">
            No restaurants yet
          </div>
        ) : (
          <div className="divide-y">
            {restaurants.map((r) => (
              <div
                key={r.id}
                className="p-5 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4"
              >
                <div className="min-w-0">
                  <p className="font-semibold text-gray-800">{r.name}</p>
                  {r.address && (
                    <p className="text-sm text-gray-400 truncate">
                      {r.address}
                    </p>
                  )}

                  {/* Restaurant ID + copy */}
                  <div className="flex items-center gap-2 mt-1">
                    <code className="text-xs text-gray-400 bg-gray-100 px-2 py-0.5 rounded">
                      {r.id}
                    </code>
                    <button
                      onClick={() => copyId(r.id)}
                      className="text-gray-400 hover:text-gray-600 transition"
                      title="Copy ID"
                    >
                      <Copy size={13} />
                    </button>
                    {copied === r.id && (
                      <span className="text-xs text-green-500">Copied!</span>
                    )}
                  </div>
                  {r.ownerName && (
                    <p className="text-sm text-gray-400">
                      {r.ownerName} · {r.ownerPhone}
                    </p>
                  )}
                  {/* Menu link */}
                  <a
                    href={`/menu/${r.id}`}
                    target="_blank"
                    rel="noreferrer"
                    className="text-xs text-blue-500 hover:underline mt-1 inline-block"
                  >
                    /menu/{r.id}
                  </a>
                </div>

                {/* Active toggle */}
                <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto sm:flex-shrink-0">
                  <button
                    onClick={() => setQrRestaurant(r)}
                    className="flex items-center gap-2 px-3 py-1.5 rounded-xl text-sm font-medium bg-blue-100 text-blue-700 hover:bg-blue-200 transition"
                  >
                    <QrCode size={16} />
                    QR
                  </button>

                  <button
                    onClick={() => toggleActive(r)}
                    className={`flex items-center gap-2 px-3 py-1.5 rounded-xl text-sm font-medium transition
      ${
        r.active
          ? "bg-green-100 text-green-700 hover:bg-green-200"
          : "bg-red-100 text-red-600 hover:bg-red-200"
      }`}
                  >
                    {r.active ? (
                      <>
                        <ToggleRight size={16} /> Active
                      </>
                    ) : (
                      <>
                        <ToggleLeft size={16} /> Inactive
                      </>
                    )}
                  </button>
                  <button
                    onClick={() => deleteRestaurant(r)}
                    disabled={deletingRestaurantId === r.id}
                    title="Delete restaurant and its Firestore menu data"
                    className="flex items-center gap-2 px-3 py-1.5 rounded-xl text-sm font-medium bg-red-100 text-red-700 hover:bg-red-200 transition disabled:opacity-50"
                  >
                    <Trash2 size={16} />
                    {deletingRestaurantId === r.id
                      ? "Deleting..."
                      : "Delete Restaurant"}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
      {qrRestaurant && (
        <QRModal
          restaurant={qrRestaurant}
          onClose={() => setQrRestaurant(null)}
        />
      )}
    </div>
  );
}
