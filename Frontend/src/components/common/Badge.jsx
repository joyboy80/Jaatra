const styles = {
  success: "bg-emerald-50 text-emerald-700 ring-emerald-100 before:bg-emerald-500",
  warning: "bg-amber-50 text-amber-700 ring-amber-100 before:bg-amber-500",
  danger: "bg-red-50 text-red-700 ring-red-100 before:bg-red-500",
  info: "bg-sky-50 text-sky-700 ring-sky-100 before:bg-cyan-500",
  neutral: "bg-slate-100 text-slate-700 ring-slate-200",
  ai: "bg-violet-50 text-violet-700 ring-violet-100 before:bg-violet-500",
};

export default function Badge({ children, tone = "neutral" }) {
  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold ring-1 before:h-1.5 before:w-1.5 before:rounded-full ${styles[tone]}`}>
      {children}
    </span>
  );
}
