export default function Card({
  children,
  className = "",
  padding = "default",
  ...props
}) {
  const paddingClasses = {
    none: "",
    sm: "p-4",
    default: "p-6",
    lg: "p-8",
  };

  return (
    <div
      className={`brand-surface rounded-2xl shadow-sm border brand-border ${paddingClasses[padding]} ${className}`}
      {...props}
    >
      {children}
    </div>
  );
}

export function CardHeader({ children, className = "" }) {
  return (
    <div className={`border-b brand-border pb-4 mb-4 ${className}`}>
      {children}
    </div>
  );
}

export function CardTitle({ children, className = "" }) {
  return (
    <h2
      className={`text-xl font-semibold text-[var(--color-text)] ${className}`}
    >
      {children}
    </h2>
  );
}

export function CardContent({ children, className = "" }) {
  return <div className={className}>{children}</div>;
}
