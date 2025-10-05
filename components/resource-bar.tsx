interface ResourceBarProps {
  label: string
  value: number
  max: number
  color: "primary" | "secondary" | "accent"
  icon: string
}

export function ResourceBar({ label, value, max, color, icon }: ResourceBarProps) {
  const percentage = (value / max) * 100

  const colorClasses = {
    primary: "from-primary to-primary/60",
    secondary: "from-secondary to-secondary/60",
    accent: "from-accent to-accent/60",
  }

  const textColorClasses = {
    primary: "text-primary",
    secondary: "text-secondary",
    accent: "text-accent",
  }

  return (
    <div className="space-y-1">
      <div className="flex items-center justify-between text-xs">
        <span className="text-muted-foreground flex items-center gap-1">
          <span>{icon}</span>
          <span>{label}</span>
        </span>
        <span className={`font-bold ${textColorClasses[color]}`}>
          {value.toLocaleString()} / {max.toLocaleString()}
        </span>
      </div>
      <div className="h-2 bg-muted rounded-full overflow-hidden">
        <div
          className={`h-full bg-gradient-to-r ${colorClasses[color]} transition-all duration-300`}
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  )
}
