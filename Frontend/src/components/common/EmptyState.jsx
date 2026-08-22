import { Inbox } from "lucide-react";

export default function EmptyState({ title = "Nothing here yet", message = "New information will appear here soon.", icon: Icon = Inbox }) {
  return (
    <div className="glass-panel flex min-h-[300px] flex-col justify-center rounded-3xl p-8 text-center animate-fade-in">
      <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-2xl bg-gradient-to-br from-brand-maroon/10 to-brand-cyan/10 shadow-inner">
        <Icon className="h-10 w-10 text-brand-maroon dark:text-pink-400" />
      </div>
      <h3 className="mt-6 text-xl font-display font-bold text-safar-ink">{title}</h3>
      <p className="mt-2 text-sm text-safar-gray max-w-sm mx-auto">{message}</p>
    </div>
  );
}
