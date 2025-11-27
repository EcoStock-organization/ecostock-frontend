import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { cn } from "@/lib/utils"
import type { LucideIcon } from "lucide-react"
import { TrendingUp, TrendingDown } from "lucide-react"

interface MetricCardProps {
  title: string
  value: string | number
  change?: number
  changeLabel?: string
  icon: LucideIcon
  className?: string
  variant?: "default" | "warning"
}

export function MetricCard({
  title,
  value,
  change,
  changeLabel,
  icon: Icon,
  className,
  variant = "default",
}: MetricCardProps) {
  const isPositive = change && change > 0
  const isNegative = change && change < 0

  return (
    <Card
      className={cn(
        /* Bordas mais arredondadas e orgânicas, sombras suaves */
        "transition-organic hover-lift border border-border/40 shadow-lg bg-gradient-to-br from-card via-card to-card/98 backdrop-blur-sm overflow-hidden relative",
        variant === "warning" && "border-status-warning/30 bg-gradient-to-br from-status-warning/5 to-card",
        className,
      )}
    >
      <div className="absolute -top-8 -right-8 w-24 h-24 bg-brand/5 rounded-full blur-2xl" />

      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3 relative z-10">
        <CardTitle className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">{title}</CardTitle>
        <div className="p-2.5 rounded-2xl bg-brand/10 transition-organic hover:bg-brand/20 hover:scale-110 shadow-sm">
          <Icon className="h-5 w-5 text-brand" strokeWidth={1.5} />
        </div>
      </CardHeader>
      <CardContent className="relative z-10">
        <div className="text-3xl font-bold text-foreground tracking-tight font-display">{value}</div>
        {change !== undefined && (
          <div className="flex items-center gap-1.5 mt-3">
            {isPositive && <TrendingUp className="h-4 w-4 text-status-success" strokeWidth={2} />}
            {isNegative && <TrendingDown className="h-4 w-4 text-status-critical" strokeWidth={2} />}
            <p className="text-xs text-muted-foreground font-medium">
              <span
                className={cn(
                  "font-bold",
                  isPositive && "text-status-success",
                  isNegative && "text-status-critical",
                  !isPositive && !isNegative && "text-muted-foreground",
                )}
              >
                {isPositive && "+"}
                {change}%
              </span>
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
