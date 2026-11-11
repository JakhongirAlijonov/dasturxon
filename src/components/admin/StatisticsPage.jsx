import { useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { BarChart3, Eye, MessageSquare, QrCode, Star } from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import { loadRestaurantAnalytics } from "../../firebase/analytics";

function StatCard({ icon: Icon, label, value, tint }) {
  return (
    <div className="bg-white rounded-2xl shadow-sm p-5 flex items-center gap-4">
      <div className={`w-11 h-11 rounded-xl flex items-center justify-center ${tint}`}>
        <Icon size={20} />
      </div>
      <div className="min-w-0">
        <p className="text-sm text-gray-500 truncate">{label}</p>
        <p className="text-2xl font-bold text-gray-800">{value}</p>
      </div>
    </div>
  );
}

export default function StatisticsPage() {
  const { restaurantId } = useAuth();
  const { t, i18n } = useTranslation();
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const formatNumber = useMemo(
    () => new Intl.NumberFormat(i18n.language),
    [i18n.language],
  );

  useEffect(() => {
    let cancelled = false;
    async function load() {
      if (!restaurantId) return;
      setLoading(true);
      setError(false);
      try {
        const result = await loadRestaurantAnalytics(restaurantId, 30);
        if (!cancelled) setAnalytics(result);
      } catch (err) {
        console.error("Failed to load restaurant statistics:", err);
        if (!cancelled) setError(true);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    load();
    return () => {
      cancelled = true;
    };
  }, [restaurantId]);

  const summary = useMemo(() => {
    const days = analytics?.days || [];
    const today = days.at(-1);
    const lastWeek = days.slice(-7);
    const sum = (items, key) =>
      items.reduce((total, item) => total + (item[key] || 0), 0);
    const dishes = analytics?.dishes || [];
    const reviewCount = sum(dishes, "ratingCount");
    const weightedRating = dishes.reduce(
      (total, dish) => total + dish.ratingAverage * dish.ratingCount,
      0,
    );

    return {
      todayMenuOpens: today?.menuOpens || 0,
      todayQrOpens: today?.qrOpens || 0,
      weekQrOpens: sum(lastWeek, "qrOpens"),
      monthQrOpens: sum(days, "qrOpens"),
      monthMenuOpens: sum(days, "menuOpens"),
      reviewCount,
      averageRating: reviewCount ? weightedRating / reviewCount : 0,
    };
  }, [analytics]);

  if (loading) return <div className="text-gray-400">Loading...</div>;
  if (error)
    return (
      <div className="bg-red-50 text-red-700 rounded-xl p-4 text-sm">
        {t("admin.stats.loadError")}
      </div>
    );

  const dailyActivity = [...(analytics?.days || [])].reverse();
  const maxDailyScans = Math.max(1, ...dailyActivity.map((day) => day.qrOpens));
  const dateLabel = (value) =>
    new Date(`${value}T00:00:00`).toLocaleDateString(i18n.language, {
      month: "short",
      day: "numeric",
    });

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold text-gray-800">
          {t("admin.stats.title")}
        </h2>
        <p className="text-sm text-gray-500 mt-1">
          {t("admin.stats.description")}
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-3">
        <StatCard
          icon={Eye}
          label={t("admin.stats.menuOpens")}
          value={formatNumber.format(summary.todayMenuOpens)}
          tint="bg-blue-50 text-blue-700"
        />
        <StatCard
          icon={QrCode}
          label={t("admin.stats.qrOpens")}
          value={formatNumber.format(summary.todayQrOpens)}
          tint="bg-amber-50 text-amber-700"
        />
        <StatCard
          icon={BarChart3}
          label={t("admin.stats.qrWeek")}
          value={formatNumber.format(summary.weekQrOpens)}
          tint="bg-violet-50 text-violet-700"
        />
        <StatCard
          icon={QrCode}
          label={t("admin.stats.qrMonth")}
          value={formatNumber.format(summary.monthQrOpens)}
          tint="bg-green-50 text-green-700"
        />
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
        <section className="bg-white rounded-2xl shadow-sm p-5">
          <h3 className="font-semibold text-gray-800 mb-4">
            {t("admin.stats.dailyActivity")}
          </h3>
          <div className="space-y-3 max-h-[460px] overflow-y-auto">
            {dailyActivity.map((day) => (
              <div key={day.date} className="grid grid-cols-[58px_1fr_42px] items-center gap-3">
                <span className="text-xs text-gray-500">{dateLabel(day.date)}</span>
                <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-amber-500 rounded-full"
                    style={{ width: `${(day.qrOpens / maxDailyScans) * 100}%` }}
                  />
                </div>
                <span className="text-xs text-right font-medium text-gray-700">
                  {formatNumber.format(day.qrOpens)}
                </span>
              </div>
            ))}
          </div>
          <p className="text-xs text-gray-400 mt-4">
            {t("admin.stats.monthMenuOpens")}: {formatNumber.format(summary.monthMenuOpens)}
          </p>
        </section>

        <section className="bg-white rounded-2xl shadow-sm p-5">
          <h3 className="font-semibold text-gray-800 mb-4 flex items-center gap-2">
            <QrCode size={17} className="text-amber-600" />
            {t("admin.stats.tableScans")}
          </h3>
          {analytics?.tables?.length ? (
            <div className="divide-y">
              {analytics.tables.map((table) => (
                <div key={table.tableNumber} className="flex items-center justify-between py-3">
                  <span className="text-sm text-gray-700">
                    {t("menu.table")} {table.tableNumber}
                  </span>
                  <span className="font-semibold text-gray-800">
                    {formatNumber.format(table.scans)}
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-gray-400 py-8 text-center">
              {t("admin.stats.noTableScans")}
            </p>
          )}
        </section>
      </div>

      <section className="bg-white rounded-2xl shadow-sm overflow-hidden">
        <div className="p-5 border-b flex flex-wrap items-center justify-between gap-3">
          <h3 className="font-semibold text-gray-800">
            {t("admin.stats.dishStats")}
          </h3>
          <div className="flex items-center gap-4 text-sm text-gray-500">
            <span className="flex items-center gap-1.5">
              <MessageSquare size={15} /> {formatNumber.format(summary.reviewCount)}
            </span>
            <span className="flex items-center gap-1.5">
              <Star size={15} className="text-amber-500" />
              {summary.averageRating.toFixed(1)}
            </span>
          </div>
        </div>
        {analytics?.dishes?.length ? (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 text-gray-500 text-left">
                <tr>
                  <th className="px-5 py-3 font-medium">{t("admin.stats.dish")}</th>
                  <th className="px-5 py-3 font-medium text-right">{t("admin.stats.views")}</th>
                  <th className="px-5 py-3 font-medium text-right">{t("admin.stats.rating")}</th>
                  <th className="px-5 py-3 font-medium text-right">{t("admin.stats.reviews")}</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {analytics.dishes.map((dish) => (
                  <tr key={dish.id}>
                    <td className="px-5 py-3 font-medium text-gray-800">
                      {dish.name?.[i18n.language] || dish.name?.uz || "—"}
                    </td>
                    <td className="px-5 py-3 text-right text-gray-600">
                      {formatNumber.format(dish.views)}
                    </td>
                    <td className="px-5 py-3 text-right text-gray-600">
                      <span className="inline-flex items-center gap-1">
                        <Star size={13} className="text-amber-500" />
                        {dish.ratingAverage.toFixed(1)}
                      </span>
                    </td>
                    <td className="px-5 py-3 text-right text-gray-600">
                      {formatNumber.format(dish.ratingCount)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="text-sm text-gray-400 py-10 text-center">
            {t("admin.stats.noDishViews")}
          </p>
        )}
      </section>
    </div>
  );
}
