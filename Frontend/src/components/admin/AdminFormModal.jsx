import { X } from "lucide-react";
import Button from "../common/Button";

export default function AdminFormModal({ open, title, children, onClose, onSubmit, submitLabel = "Save", loading = false }) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-safar-ink/45 p-0 sm:items-center sm:p-4">
      <form className="max-h-[92vh] w-full overflow-y-auto rounded-t-2xl bg-white p-5 shadow-soft sm:max-w-2xl sm:rounded-2xl" onSubmit={onSubmit}>
        <div className="flex items-center justify-between gap-4">
          <h2 className="text-lg font-bold text-safar-ink">{title}</h2>
          <button className="focus-ring rounded-lg p-2 text-safar-gray hover:bg-slate-100" type="button" onClick={onClose} aria-label="Close form">
            <X className="h-5 w-5" />
          </button>
        </div>
        <div className="mt-5 space-y-4">{children}</div>
        <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
          <Button variant="secondary" type="button" onClick={onClose}>Cancel</Button>
          <Button loading={loading} type="submit">{submitLabel}</Button>
        </div>
      </form>
    </div>
  );
}
