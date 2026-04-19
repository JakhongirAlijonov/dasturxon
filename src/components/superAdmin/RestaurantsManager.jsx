import { useEffect, useState } from "react";
import {
  collection,
  getDocs,
  addDoc,
  updateDoc,
  doc,
} from "firebase/firestore";
import { db } from "../../firebase/config";
import { Plus, ToggleLeft, ToggleRight, Copy } from "lucide-react";
import { QrCode } from "lucide-react";
import QRModal from "./QRModal";

export default function RestaurantsManager() {
  const [restaurants, setRestaurants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [saving, setSaving] = useState(false);
  const [copied, setCopied] = useState(null);
  const [qrRestaurant, setQrRestaurant] = useState(null);
  const [form, setForm] = useState({
    name: "",
    address: "",
    ownerName: "",
    ownerPhone: "",
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
      active: true,
      createdAt: new Date(),
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
                className="p-5 flex items-center justify-between gap-4"
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
                <div className="flex items-center gap-2 flex-shrink-0">
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
