export default function Select({ label, className = "", ...props }) {
  return (
    <label className={`block ${className}`}>
      {label && <span className="mb-2 block text-sm font-semibold text-safar-ink">{label}</span>}
      <select
        className="focus-ring h-11 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm font-medium text-safar-ink shadow-sm transition hover:border-safar-teal/40"
        {...props}
      />
    </label>
  );
}
