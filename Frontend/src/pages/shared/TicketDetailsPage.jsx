import { Navigate, useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import TicketCard from "../../components/ticket/TicketCard";
import Modal from "../../components/common/Modal";
import PageHeader from "../../components/layout/PageHeader";
import DashboardLayout from "../../layouts/DashboardLayout";
import { useAuth } from "../../context/AuthContext";
import { cancelReservation } from "../../services/reservationService";
import { getTicketById } from "../../services/ticketService";
import { canCancelReservation } from "../../utils/reservationRules";

export default function TicketDetailsPage({ role }) {
  const { ticketId } = useParams();
  const { user, setToast } = useAuth();
  const [ticket, setTicket] = useState(null);
  const [loaded, setLoaded] = useState(false);
  const [cancelOpen, setCancelOpen] = useState(false);

  async function loadTicket() {
    setTicket(await getTicketById(user.id, ticketId));
    setLoaded(true);
  }

  useEffect(() => {
    loadTicket();
  }, [ticketId, user.id]);

  if (loaded && !ticket) {
    return <Navigate to={`/${role}/tickets`} replace />;
  }

  async function confirmCancel() {
    await cancelReservation(ticket.bookingId, user.id);
    setCancelOpen(false);
    setToast({ type: "info", message: "Ticket cancelled and reservation updated." });
    await loadTicket();
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <PageHeader
          eyebrow="Digital Ticket"
          title="Ticket details"
          description="This QR code contains only the unique ticket identifier."
        />
        {ticket && (
          <TicketCard
            ticket={ticket}
            role={role}
            detailed
            onCancel={() => canCancelReservation(ticket) && setCancelOpen(true)}
            onDownload={() => setToast({ type: "info", message: `Download prepared for ${ticket.ticketId}.` })}
            onShare={() => setToast({ type: "info", message: `Share link prepared for ${ticket.ticketId}.` })}
          />
        )}
      </div>
      <Modal
        open={cancelOpen}
        title="Cancel this reservation?"
        description="Are you sure you want to cancel this reservation? The ticket status will become Cancelled."
        confirmLabel="Cancel Reservation"
        danger
        onClose={() => setCancelOpen(false)}
        onConfirm={confirmCancel}
      />
    </DashboardLayout>
  );
}
