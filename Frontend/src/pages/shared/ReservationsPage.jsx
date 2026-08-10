import { Eye, XCircle } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import Badge from "../../components/common/Badge";
import Button from "../../components/common/Button";
import Modal from "../../components/common/Modal";
import PageHeader from "../../components/layout/PageHeader";
import DashboardLayout from "../../layouts/DashboardLayout";
import { useAuth } from "../../context/AuthContext";
import { cancelReservation, getReservations } from "../../services/reservationService";
import { canCancelReservation, getReservationState } from "../../utils/reservationRules";

const tabs = ["Upcoming", "Active", "Completed", "Cancelled"];

function toneForState(state) {
  if (state === "Upcoming" || state === "Active") return "success";
  if (state === "Cancelled") return "danger";
  if (state === "Completed") return "neutral";
  return "warning";
}

export default function ReservationsPage({ role }) {
  const { user, setToast } = useAuth();
  const [activeTab, setActiveTab] = useState("Upcoming");
  const [reservations, setReservations] = useState([]);
  const [cancelTarget, setCancelTarget] = useState(null);

  async function loadReservations() {
    setReservations(await getReservations(user.id));
  }

  useEffect(() => {
    loadReservations();
  }, [user.id]);

  const visibleReservations = useMemo(
    () => reservations.filter((reservation) => getReservationState(reservation) === activeTab),
    [activeTab, reservations]
  );

  async function confirmCancel() {
    if (!cancelTarget) return;
    await cancelReservation(cancelTarget.bookingId, user.id);
    setCancelTarget(null);
    setToast({ type: "info", message: "Reservation cancelled and the seat is available again." });
    await loadReservations();
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <PageHeader
          eyebrow="My Reservations"
          title="Reservation history"
          description="Review upcoming, active, completed, and cancelled reservations."
          actions={
            <Link
              className="focus-ring inline-flex min-h-11 items-center justify-center rounded-xl bg-jaatra-teal px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-jaatra-navy"
              to={`/${role}/reservations/new`}
            >
              New Reservation
            </Link>
          }
        />

        <div className="flex gap-2 overflow-x-auto rounded-2xl bg-white p-2 shadow-sm ring-1 ring-slate-200">
          {tabs.map((tab) => (
            <button
              key={tab}
              className={`focus-ring min-h-10 shrink-0 rounded-xl px-4 text-sm font-semibold transition ${
                activeTab === tab ? "bg-jaatra-teal text-white" : "text-jaatra-gray hover:bg-slate-100 hover:text-jaatra-ink"
              }`}
              onClick={() => setActiveTab(tab)}
              type="button"
            >
              {tab}
            </button>
          ))}
        </div>

        <section className="space-y-3">
          {visibleReservations.map((reservation) => {
            const state = getReservationState(reservation);

            return (
              <article key={reservation.bookingId} className="rounded-2xl bg-white p-4 shadow-sm ring-1 ring-slate-200">
                <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <h2 className="text-lg font-bold text-jaatra-ink">{reservation.busName}</h2>
                      <Badge tone={toneForState(state)}>{state}</Badge>
                    </div>
                    <p className="mt-1 text-sm text-jaatra-gray">{reservation.route}</p>
                    <div className="mt-3 grid gap-2 text-sm text-jaatra-gray sm:grid-cols-2 lg:grid-cols-4">
                      <span>{reservation.date}</span>
                      <span>
                        {reservation.departureTime} - {reservation.arrivalTime}
                      </span>
                      <span>Seat {reservation.seatNumber}</span>
                      <span className="break-all">Booking {reservation.bookingId}</span>
                    </div>
                  </div>
                  <div className="grid gap-2 sm:grid-cols-2 lg:min-w-72">
                    <Link
                      className="focus-ring inline-flex min-h-11 items-center justify-center gap-2 rounded-xl bg-white px-3 py-2.5 text-sm font-semibold text-jaatra-ink shadow-sm ring-1 ring-slate-200 transition hover:bg-slate-50"
                      to={`/${role}/tickets/${reservation.ticketId}`}
                    >
                      <Eye className="h-4 w-4" />
                      View Ticket
                    </Link>
                    <Button
                      variant="danger"
                      icon={XCircle}
                      disabled={!canCancelReservation(reservation)}
                      onClick={() => setCancelTarget(reservation)}
                    >
                      Cancel
                    </Button>
                  </div>
                </div>
              </article>
            );
          })}
          {visibleReservations.length === 0 && (
            <div className="rounded-2xl bg-white p-8 text-center text-sm font-semibold text-jaatra-gray shadow-sm ring-1 ring-slate-200">
              No {activeTab.toLowerCase()} reservations yet.
            </div>
          )}
        </section>
      </div>

      <Modal
        open={Boolean(cancelTarget)}
        title="Cancel this reservation?"
        description="Are you sure you want to cancel this reservation? The seat will become available again."
        confirmLabel="Cancel Reservation"
        danger
        onClose={() => setCancelTarget(null)}
        onConfirm={confirmCancel}
      />
    </DashboardLayout>
  );
}
