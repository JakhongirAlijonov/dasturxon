import { useEffect, useState } from "react";
import {
  collection,
  addDoc,
  getDocs,
  doc,
  query,
  orderBy,
  limit,
  startAfter,
  runTransaction,
  getDoc,
  serverTimestamp,
} from "firebase/firestore";
import { db } from "../firebase/config";
import { useAnonymousAuth } from "../hooks/useAnonymousAuth";
import { useAuth } from "../context/AuthContext";
import StarRating from "./StarRating";
import { Trash2, ChevronDown } from "lucide-react";

const PAGE_SIZE = 10;

export default function Reviews({ restaurantId, dishId }) {
  const { anonUser } = useAnonymousAuth();
  const { role } = useAuth();

  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [lastDoc, setLastDoc] = useState(null);
  const [hasMore, setHasMore] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [alreadyReviewed, setAlreadyReviewed] = useState(false);
  const [stats, setStats] = useState({ average: 0, count: 0 });

  const [form, setForm] = useState({ rating: 0, comment: "" });

  useEffect(() => {
    fetchReviews(true);
    fetchStats();
  }, [dishId]);

  useEffect(() => {
    if (!anonUser) return;
    checkAlreadyReviewed();
  }, [anonUser, dishId]);

  async function fetchStats() {
    const dishSnap = await getDoc(
      doc(db, "restaurants", restaurantId, "dishes", dishId),
    );
    if (dishSnap.exists()) {
      const data = dishSnap.data();
      setStats({
        average: data.ratingAverage || 0,
        count: data.ratingCount || 0,
      });
    }
  }

  async function fetchReviews(reset = false) {
    setLoading(true);
    try {
      let q = query(
        collection(
          db,
          "restaurants",
          restaurantId,
          "dishes",
          dishId,
          "reviews",
        ),
        orderBy("createdAt", "desc"),
        limit(PAGE_SIZE),
      );

      if (!reset && lastDoc) {
        q = query(
          collection(
            db,
            "restaurants",
            restaurantId,
            "dishes",
            dishId,
            "reviews",
          ),
          orderBy("createdAt", "desc"),
          startAfter(lastDoc),
          limit(PAGE_SIZE),
        );
      }

      const snap = await getDocs(q);
      const docs = snap.docs.map((d) => ({ id: d.id, ...d.data() }));

      setReviews((prev) => (reset ? docs : [...prev, ...docs]));
      setLastDoc(snap.docs[snap.docs.length - 1] || null);
      setHasMore(snap.docs.length === PAGE_SIZE);
    } finally {
      setLoading(false);
    }
  }

  async function checkAlreadyReviewed() {
    const key = `reviewed_${dishId}`;
    if (localStorage.getItem(key)) {
      setAlreadyReviewed(true);
    }
  }

  async function submitReview() {
    if (!form.rating || !anonUser) return;
    setSubmitting(true);

    try {
      const dishRef = doc(db, "restaurants", restaurantId, "dishes", dishId);

      // add review
      await addDoc(
        collection(
          db,
          "restaurants",
          restaurantId,
          "dishes",
          dishId,
          "reviews",
        ),
        {
          rating: form.rating,
          comment: form.comment.trim(),
          userId: anonUser.uid,
          createdAt: serverTimestamp(),
          language: localStorage.getItem("lang") || "uz",
        },
      );

      // update average + count with transaction
      await runTransaction(db, async (transaction) => {
        const dishSnap = await transaction.get(dishRef);
        const data = dishSnap.data();
        const oldCount = data.ratingCount || 0;
        const oldAvg = data.ratingAverage || 0;
        const newCount = oldCount + 1;
        const newAvg = (oldAvg * oldCount + form.rating) / newCount;

        transaction.update(dishRef, {
          ratingCount: newCount,
          ratingAverage: Math.round(newAvg * 10) / 10,
        });
      });

      // mark as reviewed in localStorage
      localStorage.setItem(`reviewed_${dishId}`, "true");
      setAlreadyReviewed(true);
      setForm({ rating: 0, comment: "" });
      fetchReviews(true);
      fetchStats();
    } catch (err) {
      console.error(err);
    } finally {
      setSubmitting(false);
    }
  }

  async function deleteReview(reviewId) {
    if (!confirm("Delete this review?")) return;
    const reviewRef = doc(
      db,
      "restaurants",
      restaurantId,
      "dishes",
      dishId,
      "reviews",
      reviewId,
    );
    const dishRef = doc(db, "restaurants", restaurantId, "dishes", dishId);

    await runTransaction(db, async (transaction) => {
      const [reviewSnap, dishSnap] = await Promise.all([
        transaction.get(reviewRef),
        transaction.get(dishRef),
      ]);
      if (!reviewSnap.exists()) return;

      transaction.delete(reviewRef);
      if (!dishSnap.exists()) return;

      const dish = dishSnap.data();
      const oldCount = dish.ratingCount || 0;
      const newCount = Math.max(0, oldCount - 1);
      const newAverage = newCount
        ? ((dish.ratingAverage || 0) * oldCount - reviewSnap.data().rating) /
          newCount
        : 0;
      transaction.update(dishRef, {
        ratingCount: newCount,
        ratingAverage: Math.round(newAverage * 10) / 10,
      });
    });
    fetchReviews(true);
    fetchStats();
  }

  return (
    <div className="mt-4">
      {/* Stats bar */}
      {stats.count > 0 && (
        <div className="flex items-center gap-3 mb-4">
          <StarRating value={Math.round(stats.average)} readonly size={18} />
          <span className="font-bold text-lapis-dark">{stats.average}</span>
          <span className="text-gray-400 text-sm">({stats.count} reviews)</span>
        </div>
      )}

      {/* Submit form */}
      {!alreadyReviewed ? (
        <div className="bg-cream rounded-2xl p-4 mb-4 border border-cream-dark">
          <p className="text-sm font-semibold text-lapis-dark mb-3">
            Leave a review
          </p>
          <StarRating
            value={form.rating}
            onChange={(r) => setForm((f) => ({ ...f, rating: r }))}
            size={28}
          />
          <textarea
            value={form.comment}
            onChange={(e) =>
              setForm((f) => ({ ...f, comment: e.target.value }))
            }
            placeholder="Share your experience (optional)"
            rows={3}
            className="w-full mt-3 border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gold/40 resize-none bg-white"
          />
          <button
            onClick={submitReview}
            disabled={!form.rating || submitting}
            className="mt-3 bg-lapis text-gold px-5 py-2 rounded-xl text-sm font-semibold hover:bg-lapis-dark transition disabled:opacity-50"
          >
            {submitting ? "Submitting..." : "Submit Review"}
          </button>
        </div>
      ) : (
        <div className="bg-green-50 text-green-700 text-sm px-4 py-3 rounded-xl mb-4">
          ✓ You already reviewed this dish
        </div>
      )}

      {/* Reviews list */}
      <div className="space-y-3">
        {reviews.map((review) => (
          <div
            key={review.id}
            className="bg-white rounded-2xl p-4 border border-cream-dark"
          >
            <div className="flex items-start justify-between gap-2">
              <div>
                <StarRating value={review.rating} readonly size={14} />
                {review.comment && (
                  <p className="text-sm text-gray-600 mt-2 leading-relaxed">
                    {review.comment}
                  </p>
                )}
                <p className="text-xs text-gray-300 mt-2">
                  {review.createdAt?.toDate?.()?.toLocaleDateString() || ""}
                </p>
              </div>

              {/* Admin delete */}
              {(role === "restaurant_admin" || role === "super_admin") && (
                <button
                  onClick={() => deleteReview(review.id)}
                  className="text-red-400 hover:text-red-600 transition flex-shrink-0"
                >
                  <Trash2 size={15} />
                </button>
              )}
            </div>
          </div>
        ))}

        {loading && (
          <div className="text-center text-gray-400 text-sm py-4">
            Loading...
          </div>
        )}

        {/* Load more */}
        {hasMore && !loading && (
          <button
            onClick={() => fetchReviews(false)}
            className="w-full flex items-center justify-center gap-2 text-sm text-gray-500 hover:text-lapis py-3 transition"
          >
            <ChevronDown size={16} />
            Load more reviews
          </button>
        )}

        {reviews.length === 0 && !loading && (
          <p className="text-center text-gray-400 text-sm py-4">
            No reviews yet. Be the first!
          </p>
        )}
      </div>
    </div>
  );
}
