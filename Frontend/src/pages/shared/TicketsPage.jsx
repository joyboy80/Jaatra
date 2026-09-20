import { Sparkles, Ticket } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import TicketFlashcard from "../../components/ticket/TicketFlashcard";
import EmptyState from "../../components/common/EmptyState";
import ErrorState from "../../components/common/ErrorState";
import Modal from "../../components/common/Modal";
import PageHeader from "../../components/layout/PageHeader";
import DashboardLayout from "../../layouts/DashboardLayout";
import { useAuth } from "../../context/AuthContext";
import { cancelReservation, getReservations } from "../../services/reservationService";
import {
  getTickets,
} from "../../services/ticketService";

const filterTabs = ["All", "Confirmed", "Used", "Cancelled", "Expired"];

export default function TicketsPage({ role }) {
  const { user, setToast } = useAuth();
  const [tickets, setTickets] = useState([]);
  const [cancelTarget, setCancelTarget] = useState(null);
  const [error, setError] = useState("");
  const [activeFilter, setActiveFilter] = useState("All");

  async function loadTickets() {
    try {
      const [ticketRes, reservationRes] = await Promise.allSettled([
        getTickets(user.id),
        getReservations(user.id),
      ]);
      const ticketList = ticketRes.status === "fulfilled" ? (ticketRes.value || []) : [];
      const reservationList = reservationRes.status === "fulfilled" ? (reservationRes.value || []) : [];

      const combined = [];
      const seenBookingIds = new Set();
      const seenTicketIds = new Set();

      // First include tickets
      for (const t of ticketList) {
        if (t.bookingId) seenBookingIds.add(t.bookingId);
        if (t.ticketId) seenTicketIds.add(t.ticketId);
        combined.push(t);
      }

      // Then add reservations not already present
      for (const r of reservationList) {
        const tId = r.ticketId || r.ticket_id;
        const bId = r.bookingId || r.id;
        if ((bId && seenBookingIds.has(bId)) || (tId && seenTicketIds.has(tId))) {
          continue;
        }
        if (bId) seenBookingIds.add(bId);
        if (tId) seenTicketIds.add(tId);
        combined.push({
          ...r,
          id: tId || bId,
          ticketId: tId || bId,
          bookingId: bId,
        });
      }

      // Sort newest first (queue behavior)
      combined.sort((a, b) => {
        const dateA = new Date(a.createdAt || a.bookingDate || 0);
        const dateB = new Date(b.createdAt || b.bookingDate || 0);
        return dateB - dateA;
      });

      setTickets(combined);
      setError("");
    } catch (requestError) {
      setError(requestError.message);
    }
  }

  useEffect(() => {
    loadTickets();
  }, [user.id]);

  const filteredTickets = useMemo(() => {
    if (activeFilter === "All") return tickets;
    return tickets.filter((t) => t.status === activeFilter);
  }, [activeFilter, tickets]);

  async function confirmCancel() {
    if (!cancelTarget) return;
    try {
      await cancelReservation(cancelTarget.bookingId, user.id);
      setCancelTarget(null);
      setToast({ type: "info", message: "Ticket cancelled and reservation updated." });
      await loadTickets();
    } catch (err) {
      setToast({ type: "danger", message: err.message || "Failed to cancel ticket." });
    }
  }

  return (
    <DashboardLayout>
      <div className="space-y-4">
        <PageHeader
          eyebrow="Digital Tickets"
          title="My Tickets"
          description="Your reservation summaries at a glance."
        />

        {error ? (
          <ErrorState title="Tickets unavailable" message={error} retry={loadTickets} />
        ) : tickets.length > 0 ? (
          <div className="space-y-3">
            {/* Filter Pills */}
            <div className="flex gap-1.5 overflow-x-auto border-b border-slate-200 pb-2.5 dark:border-slate-800">
              {filterTabs.map((tab) => {
                const count =
                  tab === "All"
                    ? tickets.length
                    : tickets.filter((t) => t.status === tab).length;

                return (
                  <button
                    key={tab}
                    type="button"
                    className={`focus-ring inline-flex items-center gap-1.5 rounded-xl px-3 py-1 text-[11px] font-bold transition ${
                      activeFilter === tab
                        ? "bg-safar-teal text-white shadow-sm"
                        : "bg-white text-safar-gray hover:bg-slate-100 hover:text-safar-ink dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700"
                    }`}
                    onClick={() => setActiveFilter(tab)}
                  >
                    <span>{tab}</span>
                    <span
                      className={`rounded-full px-1.5 text-[9px] font-semibold ${
                        activeFilter === tab
                          ? "bg-white/25 text-white"
                          : "bg-slate-100 text-slate-600 dark:bg-slate-700 dark:text-slate-300"
                      }`}
                    >
                      {count}
                    </span>
                  </button>
                );
              })}
            </div>

            {/* Count hint */}
            <div className="flex items-center gap-1.5 text-[11px] text-safar-gray dark:text-slate-400">
              <Sparkles className="h-3 w-3 text-safar-teal" />
              <span>
                {filteredTickets.length} {filteredTickets.length === 1 ? "ticket" : "tickets"}
              </span>
            </div>

            {/* Flashcards Grid */}
            <section className="grid gap-2.5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {filteredTickets.map((ticket) => (
                <TicketFlashcard
                  key={ticket.ticketId}
                  ticket={ticket}
                  onCancel={setCancelTarget}
                />
              ))}
            </section>

            {filteredTickets.length === 0 && (
              <div className="rounded-xl border border-slate-200 bg-white p-6 text-center text-xs font-semibold text-safar-gray shadow-sm dark:border-slate-800 dark:bg-slate-900 dark:text-slate-400">
                No {activeFilter.toLowerCase()} tickets found.
              </div>
            )}
          </div>
        ) : (
          <EmptyState
            title="No tickets yet"
            message="You don't have any bus reservations or tickets yet. Browse available buses to reserve your seat."
            action={
              <Link
                to={`/${role}/available-buses`}
                className="focus-ring inline-flex min-h-11 items-center justify-center rounded-xl bg-safar-teal px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-safar-navy"
              >
                Browse Available Buses
              </Link>
            }
          />
        )}
      </div>

      {/* Cancel Confirmation Modal */}
      <Modal
        open={Boolean(cancelTarget)}
        title="Cancel this reservation?"
        description={
          cancelTarget
            ? `Are you sure you want to cancel your seat (${cancelTarget.seatNumber}) on ${cancelTarget.busName}? The ticket will be marked Cancelled.`
            : "Are you sure you want to cancel this reservation?"
        }
        confirmLabel="Cancel Reservation"
        danger
        onClose={() => setCancelTarget(null)}
        onConfirm={confirmCancel}
      />
    </DashboardLayout>
  );
}

