export function Badge({ children, variant = "default" }: { children: React.ReactNode; variant?: "default" | "accent" | "success" | "warning" | "danger" }) {
  const styles = {
    default: "bg-card text-muted border-border",
    accent: "bg-accent-muted text-accent border-accent/30",
    success: "bg-success/10 text-success border-success/30",
    warning: "bg-warning/10 text-warning border-warning/30",
    danger: "bg-danger/10 text-danger border-danger/30",
  };

  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${styles[variant]}`}>
      {children}
    </span>
  );
}
