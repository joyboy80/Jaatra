import { AlertTriangle } from "lucide-react";

export default function ErrorState({ title = "Something went wrong", message = "Please try again." }) {
  return (
    <div className="rounded-2xl bg-red-50 p-6 text-red-800 ring-1 ring-red-100">
      <div className="flex gap-3">
        <AlertTriangle className="h-5 w-5 shrink-0" />
        <div>
          <h3 className="font-bold">{title}</h3>
          <p className="mt-1 text-sm">{message}</p>
        </div>
      </div>
    </div>
  );
}
