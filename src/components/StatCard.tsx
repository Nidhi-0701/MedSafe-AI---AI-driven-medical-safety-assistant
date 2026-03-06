import { motion } from "framer-motion";
import { LucideIcon, TrendingUp, TrendingDown } from "lucide-react";

interface StatCardProps {
  title: string;
  value: string;
  change: string;
  trend: "up" | "down";
  icon: LucideIcon;
  color: string;
  bgColor: string;
  delay?: number;
}

export function StatCard({ title, value, change, trend, icon: Icon, color, bgColor, delay = 0 }: StatCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.4 }}
      className="stat-card"
    >
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs font-medium text-muted-foreground mb-1">{title}</p>
          <p className="text-2xl font-bold font-display">{value}</p>
          <div className="flex items-center gap-1 mt-1.5">
            {trend === "up" ? (
              <TrendingUp className="w-3 h-3 text-medical-green" />
            ) : (
              <TrendingDown className="w-3 h-3 text-medical-red" />
            )}
            <span className={`text-[11px] font-medium ${trend === "up" ? "text-medical-green" : "text-medical-red"}`}>
              {change}
            </span>
            <span className="text-[11px] text-muted-foreground">vs last week</span>
          </div>
        </div>
        <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${bgColor}`}>
          <Icon className={`w-5 h-5 ${color}`} />
        </div>
      </div>
    </motion.div>
  );
}
