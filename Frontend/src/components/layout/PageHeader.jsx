export default function PageHeader({ eyebrow, title, description, actions }) {
  return (
    <div className="page-header flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
      <div className="min-w-0">
        {eyebrow && <p className="text-xs font-extrabold uppercase tracking-widest text-jaatra-teal">{eyebrow}</p>}
        <h1 className="mt-1.5 text-2xl font-extrabold text-jaatra-ink sm:text-3xl">{title}</h1>
        {description && <p className="mt-2 max-w-3xl text-sm leading-6 text-jaatra-gray sm:text-base">{description}</p>}
      </div>
      {actions && <div className="flex shrink-0 flex-wrap gap-2">{actions}</div>}
    </div>
  );
}
