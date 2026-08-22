const variants = {
  primary: "bg-gradient-to-r from-brand-maroon via-brand-purple to-brand-cyan text-white hover:shadow-float hover:-translate-y-0.5",
  secondary: "bg-white text-safar-ink ring-1 ring-slate-200/60 shadow-sm hover:bg-slate-50 hover:shadow-float hover:-translate-y-0.5 dark:bg-slate-800 dark:ring-slate-700 dark:hover:bg-slate-750",
  danger: "bg-gradient-to-r from-rose-500 to-red-600 text-white hover:shadow-float hover:-translate-y-0.5",
  ghost: "bg-transparent text-safar-gray shadow-none hover:bg-slate-100 hover:text-safar-navy dark:hover:bg-slate-800",
};

export default function Button({
  children,
  className = "",
  variant = "primary",
  type = "button",
  loading = false,
  disabled = false,
  icon: Icon,
  ...props
}) {
  return (
    <button
      type={type}
      className={`focus-ring inline-flex min-h-11 items-center justify-center gap-2 rounded-full px-5 py-2.5 text-sm font-semibold transition-all duration-300 active:scale-95 disabled:pointer-events-none disabled:opacity-60 ${variants[variant]} ${className}`}
      disabled={loading || disabled}
      {...props}
    >
      {loading ? (
        <span className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
      ) : Icon ? (
        <Icon className="h-4 w-4" aria-hidden="true" />
      ) : null}
      {children}
    </button>
  );
}
