import { X } from "lucide-react";
import Button from "./Button";

export default function Modal({ open, title, description, onClose, onConfirm, confirmLabel = "Confirm", danger }) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 p-4 backdrop-blur-md animate-fade-in" role="dialog" aria-modal="true" aria-labelledby="modal-title">
      <div className="w-full max-w-md rounded-3xl bg-white p-6 shadow-2xl ring-1 ring-white/20 animate-scale-in dark:bg-slate-900">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h2 id="modal-title" className="text-xl font-display font-bold text-safar-ink">{title}</h2>
            {description && <p className="mt-2 text-sm leading-6 text-safar-gray">{description}</p>}
          </div>
          <button className="focus-ring icon-button rounded-full" onClick={onClose} aria-label="Close modal">
            <X className="h-5 w-5" />
          </button>
        </div>
        <div className="mt-8 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
          <Button variant="secondary" onClick={onClose}>
            Cancel
          </Button>
          <Button variant={danger ? "danger" : "primary"} onClick={onConfirm}>
            {confirmLabel}
          </Button>
        </div>
      </div>
    </div>
  );
}
