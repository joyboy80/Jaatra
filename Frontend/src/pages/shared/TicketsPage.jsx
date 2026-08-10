import { useEffect, useState } from "react";
import TicketCard from "../../components/ticket/TicketCard";
import EmptyState from "../../components/common/EmptyState";
import Modal from "../../components/common/Modal";
import PageHeader from "../../components/layout/PageHeader";
import DashboardLayout from "../../layouts/DashboardLayout";
import { useAuth } from "../../context/AuthContext";
import { cancelReservation } from "../../services/reservationService";
import { getTickets } from "../../services/ticketService";

export default function TicketsPage({ role }) {
  const { user, setToast } = useAuth();
  const [tickets, setTickets] = useState([]);
  const [cancelTarget, setCancelTarget] = useState(null);

  async function loadTickets() {
    setTickets(await getTickets(user.id));
  }

  useEffect(() => {
    loadTickets();
  }, [user.id]);

  function handleDownload(ticket) {
    setToast({ type: "info", message: `Download prepared for ${ticket.ticketId}.` });
  }

  function handleShare(ticket) {
    setToast({ type: "info", message: `Share link prepared for ${ticket.ticketId}.` });
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
          description="Mobile-ready tickets with QR identifiers for future driver scanning."
        />

        {tickets.length > 0 ? (
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
          <EmptyState title="No tickets yet" message="Create a reservation to generate your first Jaatra ticket." />
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
