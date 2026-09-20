import { ExternalLink, X } from "lucide-react";
import { useEffect } from "react";
import { Link } from "react-router-dom";
import TicketCard from "./TicketCard";

export default function FullTicketModal({
  ticket,
  role,
  isOpen,
  onClose,
  onCancel,
  onDownload,
  onDownloadInvoice,
  onShare,
}) {
  useEffect(() => {
    function handleKeyDown(event) {
      if (event.key === "Escape") {
        onClose?.();
      }
    }
    if (isOpen) {
      document.addEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "hidden";
    }
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "";
    };
  }, [isOpen, onClose]);

  if (!isOpen || !ticket) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 p-4 backdrop-blur-md animate-fade-in overflow-y-auto"
      role="dialog"
      aria-modal="true"
      onClick={onClose}
    >
      <div
        className="relative my-8 w-full max-w-2xl rounded-3xl bg-white shadow-2xl ring-1 ring-white/20 animate-scale-in dark:bg-slate-900 overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="flex items-center justify-between border-b border-slate-100 px-6 py-4 dark:border-slate-800">
          <div>
            <h2 className="text-lg font-bold text-safar-ink dark:text-white">Full Digital Ticket Pass</h2>
            <p className="text-xs text-safar-gray dark:text-slate-400">
              Complete boarding verification pass with driver verification QR code
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Link
              to={`/${role}/tickets/${ticket.ticketId}`}
              className="focus-ring inline-flex h-9 w-9 items-center justify-center rounded-xl border border-slate-200 bg-white text-safar-gray transition hover:bg-slate-50 hover:text-safar-ink dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300"
              title="Open full page view"
            >
              <ExternalLink className="h-4 w-4" />
            </Link>
            <button
              type="button"
              className="focus-ring inline-flex h-9 w-9 items-center justify-center rounded-xl border border-slate-200 bg-white text-safar-gray transition hover:bg-slate-50 hover:text-safar-ink dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300"
              onClick={onClose}
              aria-label="Close ticket modal"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* Modal Body: Complete TicketCard */}
        <div className="p-4 sm:p-6 max-h-[calc(85vh-80px)] overflow-y-auto">
          <TicketCard
            ticket={ticket}
            role={role}
            detailed
            onCancel={onCancel}
            onDownload={onDownload}
            onDownloadInvoice={onDownloadInvoice}
            onShare={onShare}
          />
        </div>
      </div>
    </div>
  );
}
