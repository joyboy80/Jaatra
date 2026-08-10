import { Bot, Database, MapPinned, Route } from "lucide-react";
import AIChatPanel from "../../components/ai/AIChatPanel";
import PageHeader from "../../components/layout/PageHeader";
import DashboardLayout from "../../layouts/DashboardLayout";

export default function JaatraAIPage() {
  return (
    <DashboardLayout>
      <div className="space-y-6">
        <PageHeader eyebrow="Smart Transportation" title="Jaatra AI" description="Ask natural-language questions about live buses, reservations, seats, delays, conditions, schedules, and route choices." />
        <section className="grid min-w-0 gap-4 xl:grid-cols-[minmax(0,1fr)_300px]">
          <div className="h-[min(720px,calc(100dvh-190px))] min-h-[560px] min-w-0"><AIChatPanel /></div>
          <aside className="hidden space-y-3 xl:block">
            {[[MapPinned, "Live-aware", "Uses current mock GPS, ETA, speed, and status."], [Database, "Context-aware", "Understands your role, reservation, ticket, and available seats."], [Route, "Recommendation-ready", "Suggests a suitable bus using schedule and capacity data."], [Bot, "API-ready", "The UI is separated from the mock AI provider."]].map(([Icon, title, text]) => <div key={title} className="rounded-2xl bg-white p-4 shadow-sm ring-1 ring-slate-200"><Icon className="h-5 w-5 text-jaatra-teal" /><h2 className="mt-3 font-bold text-jaatra-ink">{title}</h2><p className="mt-1 text-sm leading-6 text-jaatra-gray">{text}</p></div>)}
          </aside>
        </section>
      </div>
    </DashboardLayout>
  );
}
