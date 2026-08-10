import { Download, Eye, Share2, XCircle } from "lucide-react";
import { Link } from "react-router-dom";
import Badge from "../common/Badge";
import Button from "../common/Button";
import Logo from "../common/Logo";
import QRCode from "./QRCode";
import { canCancelReservation } from "../../utils/reservationRules";

function statusTone(status) {
  if (status === "Confirmed") return "success";
  if (status === "Cancelled") return "danger";
  if (status === "Expired") return "warning";
  return "neutral";
}

export default function TicketCard({ ticket, role, detailed = false, onCancel, onDownload, onShare }) {
  return (
    <article className="ticket-card overflow-hidden rounded-xl bg-white shadow-sm ring-1 ring-slate-200">
      <div className="ticket-header border-b border-slate-100 p-4">
        <div className="flex items-start justify-between gap-3">
          <Logo compact={!detailed} />
          <Badge tone={statusTone(ticket.status)}>{ticket.status}</Badge>
        </div>
      </div>

      <div className="grid gap-5 p-4 md:grid-cols-[1fr_auto]">
        <div className="space-y-4">
          <div>
            <p className="text-xs font-extrabold uppercase tracking-widest text-jaatra-teal">Digital travel pass</p>
            <h2 className="mt-1 text-xl font-extrabold text-jaatra-ink">{ticket.busName}</h2>
            <p className="mt-1 text-sm text-jaatra-gray">{ticket.route}</p>
          </div>
          <dl className="grid gap-2 text-sm sm:grid-cols-2">
            <div><dt className="font-semibold text-jaatra-gray">Passenger</dt><dd className="mt-1 text-jaatra-ink">{ticket.passengerName}</dd></div>
            <div><dt className="font-semibold text-jaatra-gray">University ID</dt><dd className="mt-1 text-jaatra-ink">{ticket.universityId}</dd></div>
            <div><dt className="font-semibold text-jaatra-gray">User type</dt><dd className="mt-1 text-jaatra-ink">{ticket.roleLabel}</dd></div>
            <div><dt className="font-semibold text-jaatra-gray">Category</dt><dd className="mt-1 text-jaatra-ink">{ticket.busCategory}</dd></div>
            <div><dt className="font-semibold text-jaatra-gray">Date</dt><dd className="mt-1 text-jaatra-ink">{ticket.date}</dd></div>
            <div className="rounded-lg bg-jaatra-mint p-3"><dt className="font-semibold text-jaatra-gray">Seat</dt><dd className="mt-1 text-xl font-extrabold text-jaatra-navy">{ticket.seatNumber}</dd></div>
            <div><dt className="font-semibold text-jaatra-gray">Departure</dt><dd className="mt-1 text-jaatra-ink">{ticket.departureTime}</dd></div>
            <div><dt className="font-semibold text-jaatra-gray">Arrival</dt><dd className="mt-1 text-jaatra-ink">{ticket.arrivalTime}</dd></div>
            <div><dt className="font-semibold text-jaatra-gray">Booking ID</dt><dd className="mt-1 break-all text-jaatra-ink">{ticket.bookingId}</dd></div>
            <div><dt className="font-semibold text-jaatra-gray">Ticket ID</dt><dd className="mt-1 break-all text-jaatra-ink">{ticket.ticketId}</dd></div>
          </dl>
        </div>
        <div className="flex flex-col items-center justify-center gap-2">
          <QRCode value={ticket.qrPayload || ticket.ticketId} />
          <p className="text-center text-xs font-semibold text-jaatra-gray">QR contains ticket ID only</p>
        </div>
      </div>

      <div className="grid gap-2 border-t border-slate-100 p-4 sm:grid-cols-4">
        {!detailed && (
          <Link
            className="focus-ring inline-flex min-h-11 items-center justify-center gap-2 rounded-lg bg-white px-3 py-2.5 text-sm font-semibold text-jaatra-ink shadow-sm ring-1 ring-slate-200 transition hover:bg-slate-50"
            to={`/${role}/tickets/${ticket.ticketId}`}
          >
            <Eye className="h-4 w-4" />
            View Ticket
          </Link>
        )}
        <Button variant="secondary" icon={Download} onClick={() => onDownload?.(ticket)}>Download Ticket</Button>
        <Button variant="secondary" icon={Share2} onClick={() => onShare?.(ticket)}>Share Ticket</Button>
        <Button variant="danger" icon={XCircle} disabled={!canCancelReservation(ticket)} onClick={() => onCancel?.(ticket)}>
          Cancel Reservation
        </Button>
      </div>
    </article>
  );
}
