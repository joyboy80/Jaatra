import Logo from "../common/Logo";
import ThemeToggle from "../common/ThemeToggle";
import Toast from "../common/Toast";

export default function AuthPageShell({ eyebrow, title, description, children }) {
  return (
    <main className="relative min-h-screen bg-slate-50 px-4 py-8 sm:px-6 dark:bg-slate-900 transition-colors duration-300 overflow-hidden">
      {/* Abstract Background Elements */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -left-[10%] top-0 h-[600px] w-[600px] rounded-full bg-brand-maroon/10 mix-blend-multiply blur-3xl dark:bg-pink-900/20 dark:mix-blend-lighten" />
        <div className="absolute -right-[10%] top-[20%] h-[700px] w-[700px] rounded-full bg-brand-cyan/10 mix-blend-multiply blur-3xl dark:bg-cyan-900/20 dark:mix-blend-lighten" />
      </div>

      <div className="relative z-10 mx-auto flex max-w-2xl items-center justify-between gap-4 animate-fade-in">
        <Logo />
        <ThemeToggle compact />
      </div>
      <section className="relative z-10 mx-auto mt-8 max-w-2xl rounded-3xl bg-white/80 p-6 shadow-2xl ring-1 ring-slate-200/60 backdrop-blur-xl sm:p-10 dark:bg-slate-900/80 dark:ring-slate-700/50 animate-slide-up">
        <p className="text-xs font-black uppercase tracking-[0.2em] text-brand-cyan dark:text-cyan-400">{eyebrow}</p>
        <h1 className="mt-3 text-4xl font-display font-black text-safar-ink dark:text-white">{title}</h1>
        <p className="mt-3 text-sm leading-relaxed text-safar-gray dark:text-slate-400">{description}</p>
        {children}
      </section>
      <Toast />
    </main>
  );
}
