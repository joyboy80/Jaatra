import { BarChart3, BusFront, CirclePercent, TrendingUp, UserMinus } from "lucide-react";
import { useEffect, useState } from "react";
import StatCard from "../../components/common/StatCard";
import ErrorState from "../../components/common/ErrorState";
import PageHeader from "../../components/layout/PageHeader";
import DashboardLayout from "../../layouts/DashboardLayout";
import { getAnalytics } from "../../services/adminService";

function VerticalBars({ values, labels }) {
  const max = Math.max(...values, 1);
  return <div className="flex h-56 items-end gap-2 sm:gap-3">{values.map((value, index) => <div key={`${labels[index]}-${index}`} className="flex h-full min-w-0 flex-1 flex-col justify-end"><p className="mb-2 text-center text-xs font-bold text-safar-ink">{value}</p><div className="w-full rounded-t-lg bg-safar-teal transition-all" style={{ height: `${Math.max(8, value / max * 78)}%` }} /><p className="mt-2 truncate text-center text-xs font-semibold text-safar-gray">{labels[index]}</p></div>)}</div>;
}

function HorizontalBars({ items }) {
  const max = Math.max(...items.map((item) => item.value), 1);
  return <div className="space-y-4">{items.map((item) => <div key={item.label}><div className="mb-1 flex justify-between gap-3 text-sm"><span className="truncate font-semibold text-safar-ink">{item.label}</span><span className="font-bold text-safar-teal">{item.value}%</span></div><div className="h-2.5 overflow-hidden rounded-full bg-slate-100"><div className="h-full rounded-full bg-safar-teal" style={{ width: `${item.value / max * 100}%` }} /></div></div>)}</div>;
}

function ChartPanel({ title, description, children }) {
  return <section className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-slate-200"><h2 className="text-lg font-bold text-safar-ink">{title}</h2><p className="mt-1 text-sm text-safar-gray">{description}</p><div className="mt-6">{children}</div></section>;
}

export default function AnalyticsPage() {
  const [analytics, setAnalytics] = useState(null);
  const [error, setError] = useState("");
  useEffect(() => { getAnalytics().then(setAnalytics).catch((requestError) => setError(requestError.message)); }, []);
  if (error) return <DashboardLayout><ErrorState title="Analytics unavailable" message={error} /></DashboardLayout>;
  if (!analytics) return <DashboardLayout><p className="text-sm font-semibold text-safar-gray">Loading analytics...</p></DashboardLayout>;

  return <DashboardLayout><div className="space-y-6"><PageHeader eyebrow="Transportation Intelligence" title="Analytics" description="Understand demand, occupancy, route performance, peak periods, cancellations, no-shows, and fleet use." />
    <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
      <StatCard icon={CirclePercent} label="Cancellation Rate" value={`${analytics.cancellationRate}%`} helper="All reservations" />
      <StatCard icon={UserMinus} label="No-show Rate" value={`${analytics.noShowRate}%`} helper="Confirmed passengers" />
      <StatCard icon={BusFront} label="Bus Utilization" value={`${analytics.utilization}%`} helper="Fleet capacity used" />
      <StatCard icon={TrendingUp} label="Weekly Demand" value={analytics.weekly.at(-1)} helper="Reservations this week" />
    </section>
    <section className="grid gap-4 xl:grid-cols-2">
      <ChartPanel title="Daily reservations" description="Reservation volume over the last seven days."><VerticalBars values={analytics.daily} labels={["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"]} /></ChartPanel>
      <ChartPanel title="Weekly reservations" description="Four-week reservation trend."><VerticalBars values={analytics.weekly} labels={["Week 1", "Week 2", "Week 3", "Week 4"]} /></ChartPanel>
      <ChartPanel title="Bus occupancy" description="Average occupancy by transportation category."><HorizontalBars items={analytics.occupancy} /></ChartPanel>
      <ChartPanel title="Route popularity" description="Relative passenger demand on primary routes."><HorizontalBars items={analytics.routes} /></ChartPanel>
      <ChartPanel title="Peak hours" description="Demand intensity across major departure windows."><VerticalBars values={analytics.peakHours.map((item) => item.value)} labels={analytics.peakHours.map((item) => item.label)} /></ChartPanel>
      <ChartPanel title="Operational health" description="Backend-calculated rates for service quality and fleet performance."><div className="grid gap-4 sm:grid-cols-3">{[["Utilization", analytics.utilization, "text-safar-teal"], ["Cancellation", analytics.cancellationRate, "text-red-600"], ["No-show", analytics.noShowRate, "text-amber-600"]].map(([label, value, tone]) => <div key={label} className="rounded-xl bg-slate-50 p-4 text-center"><BarChart3 className={`mx-auto h-6 w-6 ${tone}`} /><p className="mt-3 text-2xl font-bold text-safar-ink">{value}%</p><p className="text-xs font-semibold text-safar-gray">{label}</p></div>)}</div></ChartPanel>
    </section>
  </div></DashboardLayout>;
}
