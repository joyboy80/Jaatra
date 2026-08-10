import { BusFront, Radio, Star } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import Badge from "../../components/common/Badge";
import LiveBusDetails from "../../components/tracking/LiveBusDetails";
import LiveMap from "../../components/tracking/LiveMap";
import LiveStatusBadge from "../../components/tracking/LiveStatusBadge";
import PageHeader from "../../components/layout/PageHeader";
import { useAuth } from "../../context/AuthContext";
import useLiveTracking from "../../hooks/useLiveTracking";
import DashboardLayout from "../../layouts/DashboardLayout";
import { getReservations } from "../../services/reservationService";
import { getBusesByRole } from "../../services/busService";
import { toDateInputValue } from "../../utils/date";

export default function LiveTrackingPage({ role }) {
  const { user } = useAuth();
  const { buses, connectionStatus } = useLiveTracking();
  const [selectedId, setSelectedId] = useState("");
  const [reservedBusId, setReservedBusId] = useState("");
  const [allowedIds, setAllowedIds] = useState(new Set());
  useEffect(() => { getBusesByRole(role).then((items) => setAllowedIds(new Set(items.map((bus) => bus.id)))); }, [role]);
  const roleBuses = useMemo(() => buses.filter((bus) => allowedIds.has(bus.id)), [allowedIds, buses]);

  useEffect(() => {
    getReservations(user.id).then((reservations) => {
      const activeReservation = reservations.find((reservation) => reservation.status === "Confirmed" && reservation.date >= toDateInputValue());
      if (activeReservation) {
        setReservedBusId(activeReservation.busId);
        setSelectedId(activeReservation.busId);
      }
    });
  }, [user.id]);

  useEffect(() => {
    if (!selectedId && roleBuses.length) setSelectedId(roleBuses[0].id);
  }, [roleBuses, selectedId]);

  const selectedBus = roleBuses.find((bus) => bus.id === selectedId) || roleBuses[0];
  const reservedBus = roleBuses.find((bus) => bus.id === reservedBusId);

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <PageHeader
          eyebrow="Real-Time Transportation"
          title="Live bus tracking"
          description="Follow active university buses with simulated GPS movement, live ETA, speed, delays, and service status."
          actions={<Badge tone={connectionStatus === "connected" ? "success" : "warning"}><span className="mr-1.5 inline-block h-2 w-2 rounded-full bg-current" />{connectionStatus === "connected" ? "Live" : "Connecting"}</Badge>}
        />

        <section className="grid min-w-0 gap-4 lg:grid-cols-[300px_minmax(0,1fr)]">
          <div className="order-3 min-w-0 rounded-2xl bg-white p-4 shadow-sm ring-1 ring-slate-200 lg:order-1 lg:row-span-2">
            <div className="flex items-center justify-between gap-3"><div><h2 className="font-bold text-jaatra-ink">Active buses</h2><p className="text-xs text-jaatra-gray">Available for your role</p></div><Badge tone="info">{roleBuses.length}</Badge></div>
            <div className="mt-4 space-y-2 lg:max-h-[680px] lg:overflow-y-auto lg:pr-1">
              {roleBuses.map((bus) => (
                <button key={bus.id} type="button" className={`focus-ring w-full rounded-xl p-3 text-left transition ${selectedBus?.id === bus.id ? "bg-jaatra-mint ring-1 ring-jaatra-teal/30" : "bg-slate-50 hover:bg-jaatra-sky"}`} onClick={() => setSelectedId(bus.id)}>
                  <div className="flex items-start justify-between gap-2"><div className="flex min-w-0 items-center gap-2"><BusFront className="h-4 w-4 shrink-0 text-jaatra-teal" /><span className="truncate font-bold text-jaatra-ink">{bus.name}</span>{reservedBusId === bus.id && <Star className="h-4 w-4 shrink-0 fill-jaatra-amber text-jaatra-amber" />}</div><LiveStatusBadge status={bus.status} /></div>
                  <p className="mt-2 truncate text-xs text-jaatra-gray">{bus.currentLocation.label}</p>
                  <div className="mt-2 flex items-center justify-between text-xs font-semibold text-jaatra-gray"><span>ETA {bus.etaMinutes} min</span><span>{bus.speed} km/h</span></div>
                </button>
              ))}
            </div>
          </div>

          <div className="order-1 min-w-0 lg:order-2">
            <LiveMap buses={roleBuses} selectedId={selectedBus?.id} highlightedId={reservedBusId} onSelect={setSelectedId} />
          </div>

          <div className="order-2 min-w-0 lg:order-3">
            {selectedBus && <LiveBusDetails bus={selectedBus} title={reservedBus?.id === selectedBus.id ? "Your Bus" : "Bus Information"} highlighted={reservedBus?.id === selectedBus.id} />}
            {!reservedBus && <div className="mt-3 flex items-center gap-2 rounded-xl bg-sky-50 p-3 text-sm font-semibold text-sky-700 ring-1 ring-sky-100"><Radio className="h-4 w-4" /> Reserve a future trip to highlight your bus automatically.</div>}
          </div>
        </section>
      </div>
    </DashboardLayout>
  );
}
