import { CheckCircle2, Info, XCircle } from "lucide-react";
import { useEffect } from "react";
import { useAuth } from "../../context/AuthContext";

const icons = {
  success: CheckCircle2,
  error: XCircle,
  info: Info,
};

export default function Toast() {
  const { toast, setToast } = useAuth();

  useEffect(() => {
    if (!toast) return undefined;
    const timer = setTimeout(() => setToast(null), 3200);
    return () => clearTimeout(timer);
  }, [setToast, toast]);

  if (!toast) return null;

  const Icon = icons[toast.type] || Info;

  return (
    <div className="fixed inset-x-4 top-4 z-[70] flex max-w-sm items-center gap-4 rounded-2xl bg-white/90 px-4 py-3.5 text-sm font-medium text-safar-ink shadow-float ring-1 ring-slate-200/50 backdrop-blur-xl sm:left-auto sm:right-4 animate-slide-down dark:bg-slate-900/90 dark:ring-slate-700/50">
      <span className={`grid h-10 w-10 shrink-0 place-items-center rounded-xl shadow-inner ${toast.type === "error" ? "bg-red-50 text-red-600 dark:bg-red-900/30 dark:text-red-400" : toast.type === "success" ? "bg-emerald-50 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-400" : "bg-brand-maroon/10 text-brand-maroon dark:bg-pink-900/30 dark:text-pink-400"}`}><Icon className="h-5 w-5" /></span>
      <span>{toast.message}</span>
    </div>
  );
}
