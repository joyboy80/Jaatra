export default function Toggle({ checked, onChange, label }) {
  return (
    <button
      type="button"
      className={`focus-ring relative h-7 w-12 shrink-0 rounded-full transition ${checked ? "bg-jaatra-teal" : "bg-slate-300"}`}
      role="switch"
      aria-checked={checked}
      aria-label={label}
      onClick={() => onChange(!checked)}
    >
      <span className={`absolute top-1 h-5 w-5 rounded-full bg-white shadow-sm transition ${checked ? "left-6" : "left-1"}`} />
    </button>
  );
}
