import { useEffect, useState } from "react";
import {
  collection,
  getDocs,
  doc,
  setDoc,
  updateDoc,
} from "firebase/firestore";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { auth, db } from "../../firebase/config";
import { Plus, ToggleLeft, ToggleRight } from "lucide-react";

export default function AdminsManager() {
  const [admins, setAdmins] = useState([]);
  const [restaurants, setRestaurants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [form, setForm] = useState({
    email: "",
    password: "",
    restaurantId: "",
  });

  useEffect(() => {
    fetchData();
  }, []);

  async function fetchData() {
    setLoading(true);

    const [adminSnap, restSnap] = await Promise.all([
      getDocs(collection(db, "users")),
      getDocs(collection(db, "restaurants")),
    ]);

    setAdmins(
      adminSnap.docs
        .map((d) => ({ id: d.id, ...d.data() }))
        .filter((u) => u.role === "restaurant_admin"),
    );
    setRestaurants(restSnap.docs.map((d) => ({ id: d.id, ...d.data() })));
    setLoading(false);
  }

  async function createAdmin() {
    if (!form.email || !form.password || !form.restaurantId) return;
    setSaving(true);
    setError("");

    try {
      // create Firebase Auth user
      const cred = await createUserWithEmailAndPassword(
        auth,
        form.email,
        form.password,
      );

      // save role in Firestore
      await setDoc(doc(db, "users", cred.user.uid), {
        email: form.email,
        role: "restaurant_admin",
        restaurantId: form.restaurantId,
        active: true,
        createdAt: new Date(),
      });

      setForm({ email: "", password: "", restaurantId: "" });
      setShowForm(false);
      fetchData();
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  }

  async function toggleAdminActive(admin) {
    await updateDoc(doc(db, "users", admin.id), {
      active: !admin.active,
    });
    fetchData();
  }

  function getRestaurantName(id) {
    return restaurants.find((r) => r.id === id)?.name || id;
  }

  if (loading) return <div className="text-gray-400">Loading...</div>;

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-bold text-gray-800">Restaurant Admins</h2>
        <button
          onClick={() => setShowForm((v) => !v)}
          className="flex items-center gap-2 bg-gray-900 text-yellow-400 px-4 py-2 rounded-xl text-sm font-semibold hover:bg-gray-800 transition"
        >
          <Plus size={16} />
          Add Admin
        </button>
      </div>

      {/* Add form */}
      {showForm && (
        <div className="bg-white rounded-2xl shadow-sm p-5 mb-6 space-y-3">
          {error && (
            <div className="bg-red-50 text-red-600 text-sm px-4 py-3 rounded-xl">
              {error}
            </div>
          )}
          <input
            type="email"
            value={form.email}
            onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
            placeholder="Admin email"
            className="w-full border border-gray-300 rounded-xl px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gray-400"
          />
          <input
            type="password"
            value={form.password}
            onChange={(e) =>
              setForm((f) => ({ ...f, password: e.target.value }))
            }
            placeholder="Password (min 6 chars)"
            className="w-full border border-gray-300 rounded-xl px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gray-400"
          />
          <select
            value={form.restaurantId}
            onChange={(e) =>
              setForm((f) => ({ ...f, restaurantId: e.target.value }))
            }
            className="w-full border border-gray-300 rounded-xl px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gray-400"
          >
            <option value="">Select restaurant</option>
            {restaurants.map((r) => (
              <option key={r.id} value={r.id}>
                {r.name}
              </option>
            ))}
          </select>
          <button
            onClick={createAdmin}
            disabled={
              saving || !form.email || !form.password || !form.restaurantId
            }
            className="bg-gray-900 text-yellow-400 px-5 py-2 rounded-xl text-sm font-semibold hover:bg-gray-800 transition disabled:opacity-50"
          >
            {saving ? "Creating..." : "Create Admin"}
          </button>
        </div>
      )}

      {/* List */}
      <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
        {admins.length === 0 ? (
          <div className="text-center text-gray-400 py-16">No admins yet</div>
        ) : (
          <div className="divide-y">
            {admins.map((admin) => (
              <div
                key={admin.id}
                className="p-5 flex items-center justify-between gap-4"
              >
                <div>
                  <p className="font-medium text-gray-800">{admin.email}</p>
                  <p className="text-sm text-gray-400">
                    {getRestaurantName(admin.restaurantId)}
                  </p>
                </div>
                <button
                  onClick={() => toggleAdminActive(admin)}
                  className={`flex-shrink-0 flex items-center gap-2 px-3 py-1.5 rounded-xl text-sm font-medium transition
                    ${
                      admin.active !== false
                        ? "bg-green-100 text-green-700 hover:bg-green-200"
                        : "bg-red-100 text-red-600 hover:bg-red-200"
                    }`}
                >
                  {admin.active !== false ? (
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
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
