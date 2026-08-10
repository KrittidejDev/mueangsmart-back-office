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
    <div className="ms-card ms-card-hover p-3.5 sm:p-4 lg:p-5 rounded-2xl flex flex-col justify-between min-w-0">
      <div className="flex justify-between items-start gap-1.5 sm:gap-2">
        <div className="min-w-0 flex-1">
          <p className="text-[11px] sm:text-xs font-bold uppercase text-slate-500 tracking-wider leading-snug">
            {title}
          </p>
          <h3 className="text-xl sm:text-2xl lg:text-3xl font-bold text-slate-900 mt-1 sm:mt-1.5 whitespace-nowrap">
            {loading ? "..." : value}
          </h3>
          {subtitle && (
            <p className="text-[11px] sm:text-xs text-slate-500 mt-1 sm:mt-1.5 font-medium whitespace-nowrap">
              {subtitle}
            </p>
          )}
        </div>
        <div className={`p-1.5 sm:p-2 lg:p-2.5 rounded-lg sm:rounded-xl border flex-shrink-0 ${iconBgColor} ${iconTextColor}`}>
          <Icon className="w-3.5 h-3.5 sm:w-4 sm:h-4 lg:w-5 lg:h-5" />
        </div>
      </div>
    </div>
  );
}
