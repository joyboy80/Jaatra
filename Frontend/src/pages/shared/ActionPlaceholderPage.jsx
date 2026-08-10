import { MapPinned, Ticket } from "lucide-react";
import PageHeader from "../../components/layout/PageHeader";
import DashboardLayout from "../../layouts/DashboardLayout";

const content = {
  reservations: {
    title: "Reserve Seat",
    description: "Seat reservation workflows will connect to the reservation API in the next phase.",
    icon: Ticket,
  },
  tracking: {
    title: "Track Bus",
    description: "Live tracking is ready for GPS, map, and WebSocket integration in Step 6.",
    icon: MapPinned,
  },
};

export default function ActionPlaceholderPage({ section = "reservations" }) {
  const page = content[section] || content.reservations;
  const Icon = page.icon;

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <PageHeader eyebrow="Jaatra Workflow" title={page.title} description={page.description} />
        <section className="grid min-h-72 place-items-center rounded-2xl bg-white p-6 text-center shadow-sm ring-1 ring-slate-200">
          <div>
            <Icon className="mx-auto h-10 w-10 text-jaatra-teal" />
            <h2 className="mt-4 text-lg font-bold text-jaatra-ink">{page.title} placeholder</h2>
            <p className="mt-2 max-w-md text-sm leading-6 text-jaatra-gray">
              The protected route and responsive layout are ready for backend integration.
            </p>
          </div>
        </section>
      </div>
    </DashboardLayout>
  );
}
