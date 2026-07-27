import React from "react";
import { LucideIcon } from "lucide-react";

interface MetricCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: LucideIcon;
  iconBgColor?: string;
  iconTextColor?: string;
  loading?: boolean;
}

export function MetricCard({
  title,
  value,
  subtitle,
  icon: Icon,
  iconBgColor = "bg-sky-50 border-sky-100",
  iconTextColor = "text-sky-600",
  loading = false,
}: MetricCardProps) {
  return (
    <div className="ms-card ms-card-hover p-6 rounded-2xl">
      <div className="flex justify-between items-start">
        <div>
          <p className="text-xs font-bold uppercase text-slate-500 tracking-wider">{title}</p>
          <h3 className="text-3xl font-bold text-slate-900 mt-2">
            {loading ? "..." : value}
          </h3>
          {subtitle && <p className="text-xs text-slate-500 mt-2 font-medium">{subtitle}</p>}
        </div>
        <div className={`p-3 rounded-xl border ${iconBgColor} ${iconTextColor}`}>
          <Icon className="w-6 h-6" />
        </div>
      </div>
    </div>
  );
}
