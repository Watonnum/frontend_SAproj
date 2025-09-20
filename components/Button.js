export default function Button({
  children,
  variant = "primary",
  size = "md",
  disabled = false,
  loading = false,
  onClick,
  type = "button",
  className = "",
  ...props
}) {
  const baseClasses =
    "inline-flex items-center justify-center font-medium rounded-lg transition focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-60 disabled:cursor-not-allowed";

  const variantClasses = {
    primary:
      "bg-[var(--color-primary)] text-[var(--color-on-primary)] hover:brightness-110 focus:ring-[var(--color-accent)]",
    outline:
      "border brand-border text-[var(--color-text)] bg-[var(--color-surface)] hover:bg-black/5 focus:ring-[var(--color-accent)]",
    danger: "bg-red-600 text-white hover:bg-red-700 focus:ring-red-400",
    subtle:
      "bg-[var(--color-surface)] text-[var(--color-text)] border brand-border hover:bg-black/5",
  };

  const sizeClasses = {
    sm: "h-9 px-3 text-sm",
    md: "h-10 px-4 text-sm",
    lg: "h-11 px-5 text-base",
  };

  const classes = `${baseClasses} ${
    variantClasses[variant] ?? variantClasses.primary
  } ${sizeClasses[size] ?? sizeClasses.md} ${className}`;

  return (
    <button
      type={type}
      disabled={disabled || loading}
      onClick={onClick}
      className={classes}
      {...props}
    >
      {loading && (
        <svg
          className="animate-spin -ml-1 mr-2 h-4 w-4 text-current"
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
        >
          <circle
            className="opacity-25"
            cx="12"
            cy="12"
            r="10"
            stroke="currentColor"
            strokeWidth="4"
          ></circle>
          <path
            className="opacity-75"
            fill="currentColor"
            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
          ></path>
        </svg>
      )}
      {children}
    </button>
  );
}
