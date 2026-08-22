import { useEffect, useState } from "react";
import TicketCard from "../../components/ticket/TicketCard";
import EmptyState from "../../components/common/EmptyState";
import ErrorState from "../../components/common/ErrorState";
import Modal from "../../components/common/Modal";
import PageHeader from "../../components/layout/PageHeader";
import DashboardLayout from "../../layouts/DashboardLayout";
import { useAuth } from "../../context/AuthContext";
import { cancelReservation } from "../../services/reservationService";
import { getTickets, downloadTicket, shareTicket } from "../../services/ticketService";

export default function TicketsPage({ role }) {
  const { user, setToast } = useAuth();
  const [tickets, setTickets] = useState([]);
  const [cancelTarget, setCancelTarget] = useState(null);
  const [error, setError] = useState("");

  async function loadTickets() {
    try { setTickets(await getTickets(user.id)); setError(""); } catch (requestError) { setError(requestError.message); }
  }

  useEffect(() => {
    loadTickets();
  }, [user.id]);

  async function handleDownload(ticket) {
    try {
      await downloadTicket(ticket.id);
      setToast({ type: "success", message: "Ticket downloaded successfully." });
    } catch (err) {
      setToast({ type: "error", message: err.message });
    }
  }

  async function handleShare(ticket) {
    try {
      const link = await shareTicket(ticket.id);
      await navigator.clipboard.writeText(link);
      setToast({ type: "success", message: "Share link copied to clipboard!" });
    } catch (err) {
      setToast({ type: "error", message: err.message });
    }
  }

  async function confirmCancel() {
    if (!cancelTarget) return;
    await cancelReservation(cancelTarget.bookingId, user.id);
    setCancelTarget(null);
    setToast({ type: "info", message: "Ticket cancelled and reservation updated." });
    await loadTickets();
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <PageHeader
          eyebrow="Digital Tickets"
          title="My tickets"
          description="Backend-issued tickets and identifiers for Driver verification."
        />

        {error ? <ErrorState title="Tickets unavailable" message={error} /> : tickets.length > 0 ? (
          <section className="space-y-4">
            {tickets.map((ticket) => (
              <TicketCard
                key={ticket.ticketId}
                ticket={ticket}
                role={role}
                onCancel={setCancelTarget}
                onDownload={handleDownload}
                onShare={handleShare}
              />
            ))}
          </section>
        ) : (
          <EmptyState title="No tickets yet" message="Create a reservation to generate your first Safar ticket." />
        )}
      </div>

      <Modal
        open={Boolean(cancelTarget)}
        title="Cancel this reservation?"
        description="Are you sure you want to cancel this reservation? The ticket status will become Cancelled."
        confirmLabel="Cancel Reservation"
        danger
        onClose={() => setCancelTarget(null)}
        onConfirm={confirmCancel}
      />
    </DashboardLayout>
  );
}
