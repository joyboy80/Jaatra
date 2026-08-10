import { ArrowRight, BrainCircuit, BusFront, Clock3, Lightbulb, TrendingUp } from "lucide-react";
import { useEffect, useState } from "react";
import Badge from "../../components/common/Badge";
import Skeleton from "../../components/common/Skeleton";
import PageHeader from "../../components/layout/PageHeader";
import DashboardLayout from "../../layouts/DashboardLayout";
import { getOccupancyPredictions, getSmartTransportationInsights } from "../../services/predictionService";
import { getBusAllocationRecommendations } from "../../services/recommendationService";

function demandTone(demand) {
  if (demand === "Very High") return "danger";
  if (demand === "High") return "warning";
  if (demand === "Moderate") return "info";
  return "neutral";
}

export default function AIInsightsPage() {
  const [data, setData] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    Promise.all([getOccupancyPredictions(), getBusAllocationRecommendations(), getSmartTransportationInsights()])
      .then(([predictions, allocations, insights]) => setData({ predictions, allocations, insights }))
      .catch(() => setError("AI insight data could not be loaded."));
  }, []);

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <PageHeader eyebrow="Jaatra Intelligence" title="AI insights" description="Demand forecasts and recommendation-only fleet allocation guidance for transport authority planning." actions={<Badge tone="info">Recommendations only</Badge>} />

        {error && <div className="rounded-xl bg-red-50 p-4 text-sm font-semibold text-red-700 ring-1 ring-red-100">{error}</div>}
        {!data && !error && <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">{Array.from({ length: 4 }, (_, index) => <div key={index} className="rounded-2xl bg-white p-5 ring-1 ring-slate-200"><Skeleton className="h-5 w-24" /><Skeleton className="mt-5 h-10 w-20" /><Skeleton className="mt-4 h-2 w-full" /></div>)}</section>}

        {data && <>
          <section>
            <div className="mb-4"><h2 className="text-lg font-bold text-jaatra-ink">Predicted occupancy</h2><p className="text-sm text-jaatra-gray">Expected demand for the next primary departure window.</p></div>
            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
              {data.predictions.map((prediction) => <article key={prediction.busId} className="rounded-2xl bg-white p-4 shadow-sm ring-1 ring-slate-200"><div className="flex items-center justify-between gap-2"><BusFront className="h-5 w-5 text-jaatra-teal" /><Badge tone={demandTone(prediction.demand)}>{prediction.demand}</Badge></div><h3 className="mt-4 font-bold text-jaatra-ink">{prediction.busName}</h3><p className="mt-1 text-3xl font-bold text-jaatra-ink">{prediction.occupancy}%</p><div className="mt-3 h-2 overflow-hidden rounded-full bg-slate-100"><div className={`h-full rounded-full ${prediction.occupancy >= 85 ? "bg-red-500" : prediction.occupancy >= 65 ? "bg-jaatra-amber" : "bg-jaatra-teal"}`} style={{ width: `${prediction.occupancy}%` }} /></div><p className="mt-3 text-xs font-semibold text-jaatra-gray">{prediction.confidence}% confidence</p><p className="mt-3 text-xs leading-5 text-jaatra-gray">{prediction.recommendation}</p></article>)}
            </div>
          </section>

          <section>
            <div className="mb-4"><h2 className="text-lg font-bold text-jaatra-ink">Bus allocation recommendations</h2><p className="text-sm text-jaatra-gray">Suggestions require administrator review and never alter schedules automatically.</p></div>
            <div className="grid gap-4 xl:grid-cols-2">
              {data.allocations.map((item) => <article key={item.id} className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-slate-200"><div className="flex items-center justify-between gap-3"><div className="flex items-center gap-2"><BrainCircuit className="h-5 w-5 text-jaatra-teal" /><p className="text-xs font-bold uppercase text-jaatra-teal">AI recommendation</p></div><Badge tone="info">{item.confidence}% confidence</Badge></div><div className="mt-5 grid grid-cols-[1fr_auto_1fr] items-center gap-3"><div className="rounded-xl bg-slate-50 p-3"><p className="text-xs font-semibold text-jaatra-gray">Source route</p><p className="mt-1 font-bold text-jaatra-ink">{item.sourceRoute}</p><p className="mt-2 text-2xl font-bold text-jaatra-teal">{item.sourceDemand}%</p></div><ArrowRight className="h-5 w-5 text-jaatra-gray" /><div className="rounded-xl bg-red-50 p-3"><p className="text-xs font-semibold text-red-700">High-demand route</p><p className="mt-1 font-bold text-jaatra-ink">{item.targetRoute}</p><p className="mt-2 text-2xl font-bold text-red-600">{item.targetDemand}%</p></div></div><p className="mt-4 flex items-center gap-2 text-xs font-semibold text-jaatra-gray"><Clock3 className="h-4 w-4 text-jaatra-teal" />{item.period}</p><p className="mt-3 text-sm leading-6 text-jaatra-ink">{item.recommendation}</p></article>)}
            </div>
          </section>

          <section>
            <div className="mb-4"><h2 className="text-lg font-bold text-jaatra-ink">Smart transportation insights</h2><p className="text-sm text-jaatra-gray">Signals synthesized from mock reservations, boarding, schedules, and utilization.</p></div>
            <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
              {data.insights.map((insight, index) => <article key={insight.label} className="rounded-2xl bg-white p-4 shadow-sm ring-1 ring-slate-200"><div className="grid h-10 w-10 place-items-center rounded-xl bg-jaatra-sky">{index % 2 ? <TrendingUp className="h-5 w-5 text-jaatra-teal" /> : <Lightbulb className="h-5 w-5 text-jaatra-amber" />}</div><p className="mt-4 text-xs font-bold uppercase text-jaatra-gray">{insight.label}</p><p className="mt-1 text-lg font-bold text-jaatra-ink">{insight.value}</p><p className="mt-2 text-xs leading-5 text-jaatra-gray">{insight.detail}</p></article>)}
            </div>
          </section>
        </>}
      </div>
    </DashboardLayout>
  );
}
