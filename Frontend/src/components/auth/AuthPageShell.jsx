import Logo from "../common/Logo";
import ThemeToggle from "../common/ThemeToggle";
import Toast from "../common/Toast";

export default function AuthPageShell({ eyebrow, title, description, children }) {
  return (
    <main className="min-h-screen bg-slate-50 px-4 py-8 sm:px-6">
      <div className="mx-auto flex max-w-2xl items-center justify-between gap-4">
        <Logo />
        <ThemeToggle compact />
      </div>
      <section className="mx-auto mt-8 max-w-2xl rounded-xl bg-white p-5 shadow-soft ring-1 ring-slate-200 sm:p-8">
        <p className="text-xs font-extrabold uppercase tracking-widest text-jaatra-teal">{eyebrow}</p>
        <h1 className="mt-2 text-3xl font-extrabold text-jaatra-ink">{title}</h1>
        <p className="mt-2 text-sm leading-6 text-jaatra-gray">{description}</p>
        {children}
      </section>
      <Toast />
    </main>
  );
}
