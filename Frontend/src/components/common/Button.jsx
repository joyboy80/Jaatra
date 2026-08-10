const variants = {
  primary: "bg-jaatra-teal text-white hover:bg-jaatra-navy hover:shadow-glow",
  secondary: "bg-white text-jaatra-ink ring-1 ring-slate-200 hover:bg-jaatra-mint hover:text-jaatra-navy hover:ring-jaatra-teal/20",
  danger: "bg-jaatra-red text-white hover:bg-red-700",
  ghost: "bg-transparent text-jaatra-gray shadow-none hover:bg-jaatra-mint hover:text-jaatra-navy",
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
      className={`focus-ring inline-flex min-h-11 items-center justify-center gap-2 rounded-lg px-4 py-2.5 text-sm font-semibold shadow-sm transition duration-200 disabled:cursor-not-allowed disabled:opacity-60 ${variants[variant]} ${className}`}
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
