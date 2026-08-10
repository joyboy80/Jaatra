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
    <div className="fixed inset-x-4 top-4 z-[70] flex max-w-sm items-center gap-3 rounded-xl bg-white px-4 py-3 text-sm font-medium text-jaatra-ink shadow-soft ring-1 ring-slate-200 sm:left-auto">
      <span className="grid h-8 w-8 shrink-0 place-items-center rounded-lg bg-jaatra-mint"><Icon className="h-4 w-4 text-jaatra-teal" /></span>
      <span>{toast.message}</span>
    </div>
  );
}
