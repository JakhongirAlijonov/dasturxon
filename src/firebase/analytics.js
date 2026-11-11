import { signInAnonymously } from "firebase/auth";
import {
  collection,
  doc,
  getDocs,
  increment,
  query,
  setDoc,
  where,
} from "firebase/firestore";
import { auth, db } from "./config";

let anonymousSignInPromise = null;

function dateKey(date = new Date()) {
  const pad = (value) => String(value).padStart(2, "0");
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
}

async function ensureAnalyticsUser() {
  if (auth.currentUser) return;
  if (!anonymousSignInPromise) {
    anonymousSignInPromise = signInAnonymously(auth).finally(() => {
      anonymousSignInPromise = null;
    });
  }
  await anonymousSignInPromise;
}

function analyticsDayRef(restaurantId, date = dateKey()) {
  return doc(db, "restaurants", restaurantId, "analyticsDaily", date);
}

export async function recordMenuOpen(restaurantId, { tableNumber, source } = {}) {
  try {
    const date = dateKey();
    await ensureAnalyticsUser();
    const dayRef = analyticsDayRef(restaurantId, date);
    const isQrOpen = source === "qr" || Boolean(tableNumber);

    await setDoc(
      dayRef,
      {
        date,
        menuOpens: increment(1),
        qrOpens: increment(isQrOpen ? 1 : 0),
      },
      { merge: true },
    );

    if (isQrOpen && tableNumber) {
      const label = String(tableNumber).trim().slice(0, 40);
      const tableId = label.replace(/[^a-zA-Z0-9_-]/g, "_") || "unknown";
      await setDoc(
        doc(dayRef, "tables", tableId),
        { tableNumber: label, scans: increment(1) },
        { merge: true },
      );
    }
  } catch (error) {
    // Analytics must not prevent a customer from viewing the menu.
    console.warn("Could not record menu analytics:", error);
  }
}

export async function recordDishOpen(restaurantId, dishId) {
  try {
    const date = dateKey();
    await ensureAnalyticsUser();
    const dayRef = analyticsDayRef(restaurantId, date);
    await setDoc(
      dayRef,
      {
        date,
        menuOpens: increment(0),
        qrOpens: increment(0),
      },
      { merge: true },
    );
    await setDoc(
      doc(dayRef, "dishes", dishId),
      { views: increment(1) },
      { merge: true },
    );
  } catch (error) {
    console.warn("Could not record dish analytics:", error);
  }
}

export async function loadRestaurantAnalytics(restaurantId, dayCount = 30) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const start = new Date(today);
  start.setDate(start.getDate() - dayCount + 1);
  const todayKey = dateKey(today);
  const startKey = dateKey(start);

  const [daysSnap, dishesSnap] = await Promise.all([
    getDocs(
      query(
        collection(db, "restaurants", restaurantId, "analyticsDaily"),
        where("date", ">=", startKey),
        where("date", "<=", todayKey),
      ),
    ),
    getDocs(collection(db, "restaurants", restaurantId, "dishes")),
  ]);

  const daysByDate = new Map(
    daysSnap.docs.map((dayDoc) => [dayDoc.id, dayDoc.data()]),
  );
  const days = Array.from({ length: dayCount }, (_, index) => {
    const date = new Date(start);
    date.setDate(start.getDate() + index);
    const key = dateKey(date);
    const data = daysByDate.get(key) || {};
    return {
      date: key,
      menuOpens: data.menuOpens || 0,
      qrOpens: data.qrOpens || 0,
    };
  });

  const tableTotals = new Map();
  const dishViewTotals = new Map();
  await Promise.all(
    daysSnap.docs.map(async (dayDoc) => {
      const [tablesSnap, dishViewsSnap] = await Promise.all([
        getDocs(collection(dayDoc.ref, "tables")),
        getDocs(collection(dayDoc.ref, "dishes")),
      ]);

      tablesSnap.docs.forEach((tableDoc) => {
        const data = tableDoc.data();
        const key = data.tableNumber || tableDoc.id;
        tableTotals.set(key, (tableTotals.get(key) || 0) + (data.scans || 0));
      });

      dishViewsSnap.docs.forEach((dishDoc) => {
        dishViewTotals.set(
          dishDoc.id,
          (dishViewTotals.get(dishDoc.id) || 0) + (dishDoc.data().views || 0),
        );
      });
    }),
  );

  const dishes = dishesSnap.docs.map((dishDoc) => {
    const data = dishDoc.data();
    return {
      id: dishDoc.id,
      name: data.name || {},
      views: dishViewTotals.get(dishDoc.id) || 0,
      ratingAverage: data.ratingAverage || 0,
      ratingCount: data.ratingCount || 0,
    };
  });

  return {
    days,
    tables: [...tableTotals.entries()]
      .map(([tableNumber, scans]) => ({ tableNumber, scans }))
      .sort((a, b) => b.scans - a.scans),
    dishes: dishes.sort((a, b) => b.views - a.views),
  };
}

export { dateKey };
