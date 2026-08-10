export default function Loading({ label = "Loading Jaatra" }) {
  return (
    <div className="app-surface grid min-h-48 place-items-center rounded-xl">
      <div className="flex flex-col items-center gap-3 text-jaatra-gray">
        <span className="h-8 w-8 animate-spin rounded-full border-4 border-jaatra-mint border-t-jaatra-teal" />
        <span className="text-sm font-semibold">{label}</span>
      </div>
    </div>
  );
}
