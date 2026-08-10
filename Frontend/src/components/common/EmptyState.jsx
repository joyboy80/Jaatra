import { Inbox } from "lucide-react";

export default function EmptyState({ title = "Nothing here yet", message = "New information will appear here soon." }) {
  return (
    <div className="app-surface rounded-xl p-8 text-center">
      <div className="mx-auto grid h-14 w-14 place-items-center rounded-xl bg-jaatra-mint"><Inbox className="h-7 w-7 text-jaatra-teal" /></div>
      <h3 className="mt-4 text-base font-bold text-jaatra-ink">{title}</h3>
      <p className="mt-2 text-sm text-jaatra-gray">{message}</p>
    </div>
  );
}
