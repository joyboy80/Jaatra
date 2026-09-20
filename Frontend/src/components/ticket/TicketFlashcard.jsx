import { AlertTriangle, CalendarDays, CheckCircle2, Clock, MapPin, Ticket } from "lucide-react";
import Badge from "../common/Badge";
import { formatDisplayDate, toDateInputValue } from "../../utils/date";
import { parseDepartureMinutes } from "../../utils/busAccess";

export function getTicketStatusInfo(ticket) {
  // If cancelled
  if (ticket.status === "Cancelled") {
    return { label: "Cancelled", tone: "danger", isDateOver: false, isUsed: false, isCancelled: true };
  }

  // If driver scanned ticket, or passenger claimed journey / boarded
  if (ticket.status === "Used" || ticket.boardingStatus === "Boarded" || Boolean(ticket.usedAt)) {
    return { label: "Used", tone: "neutral", isDateOver: false, isUsed: true, isCancelled: false };
  }

  // Check if crossed schedule deadline (Date Over)
  const todayValue = toDateInputValue();
  let isDateOver = false;

  if (ticket.date < todayValue) {
    isDateOver = true;
  } else if (ticket.date === todayValue && ticket.departureTime) {
    try {
      const now = new Date();
      const nowMinutes = now.getHours() * 60 + now.getMinutes();
      const depMinutes = parseDepartureMinutes(ticket.departureTime);
      if (nowMinutes > depMinutes) {
        isDateOver = true;
      }
    } catch {
      // fallback
    }
  }

  if (isDateOver || ticket.status === "Expired") {
    return { label: "Date Over", tone: "warning", isDateOver: true, isUsed: false, isCancelled: false };
  }

  return { label: "Confirmed", tone: "success", isDateOver: false, isUsed: false, isCancelled: false };
}

export default function TicketFlashcard({ ticket }) {
  const statusInfo = getTicketStatusInfo(ticket);

  return (
    <article
      className={`relative flex flex-col gap-1.5 overflow-hidden rounded-lg border-l-[3px] bg-white px-2.5 py-2 shadow-xs ring-1 dark:bg-slate-900 ${
        statusInfo.isDateOver
          ? "border-l-amber-500 ring-amber-200/80 dark:ring-amber-900/50"
          : statusInfo.isUsed
            ? "border-l-slate-400 ring-slate-200 dark:ring-slate-800"
            : statusInfo.isCancelled
              ? "border-l-rose-500 ring-rose-200 dark:ring-rose-900/50"
              : "border-l-safar-teal ring-slate-200/90 dark:ring-slate-800"
      }`}
    >
      {/* Row 1: Bus name + Status badge */}
      <div className="flex items-center justify-between gap-1.5">
        <h4 className="text-[12px] font-extrabold text-safar-ink dark:text-white truncate leading-tight">
          {ticket.busName}
        </h4>
        <Badge tone={statusInfo.tone} className="px-1.5 py-px text-[9px] font-bold shrink-0 leading-none">
          {statusInfo.label}
        </Badge>
      </div>

      {/* Row 2: Route + Seat */}
      <div className="flex items-center justify-between gap-1">
        <span className="flex items-center gap-1 text-[10px] font-medium text-safar-gray dark:text-slate-300 truncate min-w-0">
          <MapPin className="h-2.5 w-2.5 shrink-0 text-safar-teal" />
          <span className="truncate">{ticket.route}</span>
        </span>
        <span className="shrink-0 rounded bg-emerald-50 px-1.5 py-px text-[9px] font-black text-emerald-800 ring-1 ring-emerald-200/70 dark:bg-emerald-950/60 dark:text-emerald-300 dark:ring-emerald-800/60 leading-none">
          {ticket.seatNumber ? `S${ticket.seatNumber}` : "Rsv"}
        </span>
      </div>

      {/* Row 3: Date & Time */}
      <div className="flex items-center justify-between text-[9px] font-semibold text-safar-ink dark:text-slate-200">
        <span className="flex items-center gap-0.5">
          <CalendarDays className="h-2.5 w-2.5 text-safar-teal shrink-0" />
          {formatDisplayDate(ticket.date)}
        </span>
        <span className="flex items-center gap-0.5">
          <Clock className="h-2.5 w-2.5 text-safar-teal shrink-0" />
          {ticket.departureTime}
        </span>
      </div>

      {/* Status callout (only for Date Over / Used) */}
      {statusInfo.isDateOver && (
        <div className="flex items-center gap-1 rounded bg-amber-50 px-1.5 py-0.5 text-[9px] font-bold text-amber-800 ring-1 ring-amber-200/70 dark:bg-amber-950/40 dark:text-amber-300 dark:ring-amber-800">
          <AlertTriangle className="h-2.5 w-2.5 shrink-0 text-amber-600 dark:text-amber-400" />
          <span>Date over</span>
        </div>
      )}

      {statusInfo.isUsed && (
        <div className="flex items-center gap-1 rounded bg-slate-100 px-1.5 py-0.5 text-[9px] font-bold text-slate-600 ring-1 ring-slate-200 dark:bg-slate-800/80 dark:text-slate-300 dark:ring-slate-700">
          <CheckCircle2 className="h-2.5 w-2.5 shrink-0 text-slate-500" />
          <span>Used</span>
        </div>
      )}
    </article>
  );
}
