export default function Loading({ label = "✨ Safar AI is thinking..." }) {
  return (
    <div className="glass-panel flex min-h-[300px] flex-col items-center justify-center rounded-3xl p-8 animate-fade-in">
      <div className="relative flex h-16 w-16 items-center justify-center">
        <div className="absolute inset-0 rounded-full bg-gradient-to-tr from-brand-maroon via-brand-purple to-brand-cyan opacity-40 blur-md animate-pulse-slow"></div>
        <div className="relative h-10 w-10 animate-spin rounded-full border-4 border-white/20 border-t-white shadow-[0_0_15px_rgba(255,255,255,0.5)]"></div>
      </div>
      <span className="mt-6 font-display text-sm font-semibold text-gradient animate-pulse">{label}</span>
    </div>
  );
}
