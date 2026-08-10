const accents = ["stat-violet", "stat-cyan", "stat-emerald", "stat-amber", "stat-rose"];

export default function StatCard({ icon: Icon, label, value, helper, tone = "text-jaatra-teal", accent }) {
  const derivedAccent = accent || accents[(label?.length || 0) % accents.length];
  return (
    <div className={`stat-card ${derivedAccent}`}>
      <div className="flex items-center gap-3">
        <div className="stat-icon grid h-11 w-11 shrink-0 place-items-center rounded-lg">
          <Icon className={`h-5 w-5 ${tone}`} />
        </div>
        <div className="min-w-0">
          <p className="text-sm font-medium text-jaatra-gray">{label}</p>
          <p className="text-2xl font-bold text-jaatra-ink">{value}</p>
          {helper && <p className="truncate text-xs font-medium text-jaatra-gray">{helper}</p>}
        </div>
      </div>
    </div>
  );
}
