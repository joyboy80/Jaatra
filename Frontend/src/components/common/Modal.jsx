import { X } from "lucide-react";
import Button from "./Button";

export default function Modal({ open, title, description, onClose, onConfirm, confirmLabel = "Confirm", danger }) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 p-4 backdrop-blur-sm" role="dialog" aria-modal="true" aria-labelledby="modal-title">
      <div className="w-full max-w-md rounded-xl bg-white p-5 shadow-soft ring-1 ring-slate-200">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h2 id="modal-title" className="text-lg font-bold text-jaatra-ink">{title}</h2>
            {description && <p className="mt-2 text-sm leading-6 text-jaatra-gray">{description}</p>}
          </div>
          <button className="focus-ring icon-button" onClick={onClose} aria-label="Close modal">
            <X className="h-5 w-5" />
          </button>
        </div>
        <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
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
