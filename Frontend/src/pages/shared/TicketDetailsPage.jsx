import { Navigate, useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import TicketCard from "../../components/ticket/TicketCard";
import Modal from "../../components/common/Modal";
import ErrorState from "../../components/common/ErrorState";
import PageHeader from "../../components/layout/PageHeader";
import DashboardLayout from "../../layouts/DashboardLayout";
import { useAuth } from "../../context/AuthContext";
import { cancelReservation } from "../../services/reservationService";
import { getTicketById, downloadTicket, shareTicket, downloadInvoice } from "../../services/ticketService";
import { canCancelReservation } from "../../utils/reservationRules";

export default function TicketDetailsPage({ role }) {
  const { ticketId } = useParams();
  const { user, setToast } = useAuth();
  const [ticket, setTicket] = useState(null);
  const [loaded, setLoaded] = useState(false);
  const [cancelOpen, setCancelOpen] = useState(false);
  const [error, setError] = useState("");

  async function loadTicket() {
    try { setTicket(await getTicketById(user.id, ticketId)); setError(""); } catch (requestError) { setError(requestError.message); } finally { setLoaded(true); }
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
          description="This ticket identifier is verified by the backend Driver endpoint."
        />
        {error && <ErrorState title="Ticket unavailable" message={error} />}
        {ticket && (
          <TicketCard
            ticket={ticket}
            role={role}
            detailed
            onCancel={() => canCancelReservation(ticket) && setCancelOpen(true)}
            onDownload={async () => {
              try {
                await downloadTicket(ticket.id);
                setToast({ type: "success", message: "Ticket downloaded successfully." });
              } catch (err) {
                setToast({ type: "error", message: err.message });
              }
            }}
            onDownloadInvoice={async () => {
              try {
                await downloadInvoice(ticket.id, ticket.invoice?.invoiceNumber);
                setToast({ type: "success", message: "Invoice downloaded successfully." });
              } catch (err) {
                setToast({ type: "error", message: err.message });
              }
            }}
            onShare={async () => {
              try {
                const link = await shareTicket(ticket.id);
                await navigator.clipboard.writeText(link);
                setToast({ type: "success", message: "Share link copied to clipboard!" });
              } catch (err) {
                setToast({ type: "error", message: err.message });
              }
            }}
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
