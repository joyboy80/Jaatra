export default function PageHeader({ eyebrow, title, description, actions }) {
  return (
    <div className="page-header flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between animate-fade-in pb-4">
      <div className="min-w-0 flex-1">
        {eyebrow && <p className="text-xs font-black uppercase tracking-[0.2em] text-brand-cyan mb-2 dark:text-cyan-400">{eyebrow}</p>}
        <h1 className="text-3xl font-display font-black tracking-tight text-safar-ink sm:text-4xl md:text-5xl dark:text-slate-50">{title}</h1>
        {description && <p className="mt-4 max-w-3xl text-sm leading-relaxed text-safar-gray sm:text-base dark:text-slate-400">{description}</p>}
      </div>
      {actions && <div className="flex shrink-0 flex-wrap gap-3 sm:pb-1 animate-slide-up" style={{ animationDelay: '100ms' }}>{actions}</div>}
    </div>
  );
}
