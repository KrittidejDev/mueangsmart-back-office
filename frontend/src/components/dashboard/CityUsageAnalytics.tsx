"use client";

import React, { useState, useEffect } from "react";
import { Calendar, ChevronDown } from "lucide-react";
import {
  ResponsiveContainer,
  ComposedChart,
  Area,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  PieChart,
  Pie,
  Cell,
} from "recharts";

import { Overview } from "@/hooks/useAnalytics";

interface MonthlyData {
  month: string;
  active: number;
  inactive: number;
}

interface CityUsageAnalyticsProps {
  overview?: Overview | null;
}

const renderActiveLabel = (props: { x?: number; y?: number; value?: number }) => {
  const { x, y, value } = props;
  if (x === undefined || y === undefined || value === undefined) return <g />;
  return (
    <text
      x={x}
      y={y - 8}
      fill="#2563EB"
      fontSize={11}
      fontWeight="bold"
      textAnchor="middle"
    >
      {value}
    </text>
  );
};

const renderInactiveLabel = (props: { x?: number; y?: number; value?: number }) => {
  const { x, y, value } = props;
  if (x === undefined || y === undefined || value === undefined) return <g />;
  return (
    <text
      x={x}
      y={y + 14}
      fill="#EF4444"
      fontSize={11}
      fontWeight="bold"
      textAnchor="middle"
    >
      {value}
    </text>
  );
};

// Custom Tooltip to prevent duplicates and style items clearly
const CustomChartTooltip = ({ active, payload, label }: { active?: boolean; payload?: Array<{ dataKey: string; value: number }>; label?: string }) => {
  if (active && payload && payload.length) {
    const activeItem = payload.find((item) => item.dataKey === "active");
    const inactiveItem = payload.find((item) => item.dataKey === "inactive");

    return (
      <div className="bg-white p-3 border border-slate-200 rounded-xl shadow-lg text-xs space-y-1.5 min-w-[140px]">
        <p className="font-bold text-slate-700 pb-1 border-b border-slate-100">{label}</p>
        {activeItem && (
          <div className="flex items-center justify-between gap-2 font-semibold text-blue-600">
            <span>เปิดใช้งาน :</span>
            <span>{activeItem.value} เมือง</span>
          </div>
        )}
        {inactiveItem && (
          <div className="flex items-center justify-between gap-2 font-semibold text-red-500">
            <span>ไม่ได้ใช้งาน :</span>
            <span>{inactiveItem.value} เมือง</span>
          </div>
        )}
      </div>
    );
  }
  return null;
};

const subscribe = () => () => {};

export function CityUsageAnalytics({ overview }: CityUsageAnalyticsProps) {
  const [selectedYear, setSelectedYear] = useState<string>("2569");
  const mounted = React.useSyncExternalStore(
    subscribe,
    () => true,
    () => false
  );

  const beYear = parseInt(selectedYear, 10);
  const ceYear = beYear - 543;

  const monthlyChartData: MonthlyData[] = React.useMemo(() => {
    const monthLabels = ["ม.ค.", "ก.พ.", "มี.ค.", "เม.ย.", "พ.ค.", "มิ.ย.", "ก.ค.", "ส.ค.", "ก.ย.", "ต.ค.", "พ.ย.", "ธ.ค."];
    if (overview?.monthly_trends && overview.monthly_trends.length > 0) {
      const yearTrends = overview.monthly_trends.filter((t) => t.year === ceYear || t.year === beYear);
      return monthLabels.map((name, idx) => {
        const mNum = idx + 1;
        const found = yearTrends.find((t) => t.month === mNum);
        return {
          month: name,
          active: found ? Number(found.active_count) : 0,
          inactive: found ? -Math.abs(Number(found.inactive_count)) : 0,
        };
      });
    }

    return monthLabels.map((name) => ({
      month: name,
      active: 0,
      inactive: 0,
    }));
  }, [overview?.monthly_trends, ceYear, beYear]);

  const activeCount = overview?.active_cities || 0;
  const inactiveCount = overview?.inactive_cities !== undefined
    ? overview.inactive_cities
    : Math.max(0, (overview?.total_cities || 0) - activeCount);
  const totalCount = activeCount + inactiveCount;
  const activePercent = totalCount > 0 ? Number(((activeCount / totalCount) * 100).toFixed(2)) : 0;
  const inactivePercent = totalCount > 0 ? Number(((inactiveCount / totalCount) * 100).toFixed(2)) : 0;

  const donutData = [
    { name: "เปิดใช้งาน", value: activeCount, color: "#2563EB" },
    { name: "ไม่ได้ใช้งาน", value: inactiveCount, color: "#EF4444" },
  ];

  if (!mounted) {
    return (
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 ms-card p-6 rounded-2xl h-[380px] flex items-center justify-center text-slate-400 text-sm">
          กำลังโหลดสถิติกราฟ...
        </div>
        <div className="ms-card p-6 rounded-2xl h-[380px] flex items-center justify-center text-slate-400 text-sm">
          กำลังโหลดสัดส่วนโดนัท...
        </div>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Line Chart Card (Left - ~67% width) */}
      <div className="lg:col-span-2 ms-card p-4 sm:p-6 rounded-2xl flex flex-col justify-between">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
          <div className="flex flex-wrap items-center gap-4">
            <h3 className="text-base font-bold text-slate-800 tracking-tight">
              กราฟ (เปิดใช้งาน และไม่ได้ใช้งาน)
            </h3>
            {/* Chart Legends */}
            <div className="flex items-center gap-4 text-xs font-semibold">
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-blue-600 border border-blue-400 inline-block"></span>
                <span className="text-slate-600">เปิดใช้งาน (เมือง)</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-red-500 border border-red-400 inline-block"></span>
                <span className="text-slate-600">ไม่ได้ใช้งาน (เมือง)</span>
              </div>
            </div>
          </div>

          {/* Year Dropdown Selector */}
          <div className="relative inline-flex items-center">
            <Calendar className="w-4 h-4 text-slate-500 absolute left-3 pointer-events-none" />
            <select
              value={selectedYear}
              onChange={(e) => setSelectedYear(e.target.value)}
              className="appearance-none bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-700 text-xs font-bold rounded-xl pl-9 pr-8 py-2 cursor-pointer transition-all focus:outline-none focus:ring-2 focus:ring-sky-500"
            >
              <option value="2569">ปี 2569</option>
              <option value="2568">ปี 2568</option>
              <option value="2567">ปี 2567</option>
            </select>
            <ChevronDown className="w-4 h-4 text-slate-400 absolute right-2.5 pointer-events-none" />
          </div>
        </div>

        {/* Line Chart Area */}
        <div className="w-full h-[280px] sm:h-[300px] mt-2">
          <ResponsiveContainer width="100%" height="100%">
            <ComposedChart
              data={monthlyChartData}
              margin={{ top: 20, right: 15, left: -15, bottom: 5 }}
            >
              <defs>
                <linearGradient id="activeGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#2563EB" stopOpacity={0.2} />
                  <stop offset="95%" stopColor="#2563EB" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="inactiveGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#EF4444" stopOpacity={0.2} />
                  <stop offset="95%" stopColor="#EF4444" stopOpacity={0} />
                </linearGradient>
              </defs>

              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F1F5F9" />
              <XAxis
                dataKey="month"
                tick={{ fontSize: 11, fill: "#64748B" }}
                axisLine={{ stroke: "#CBD5E1" }}
                tickLine={false}
              />
              <YAxis
                domain={[-20, 100]}
                ticks={[-20, 0, 20, 40, 60, 80, 100]}
                tick={{ fontSize: 11, fill: "#64748B" }}
                axisLine={false}
                tickLine={false}
              />
              <Tooltip content={<CustomChartTooltip />} />

              {/* Gradient Areas */}
              <Area
                type="monotone"
                dataKey="active"
                stroke="none"
                fill="url(#activeGradient)"
                tooltipType="none"
              />
              <Area
                type="monotone"
                dataKey="inactive"
                stroke="none"
                fill="url(#inactiveGradient)"
                tooltipType="none"
              />

              {/* Active Series Line */}
              <Line
                type="monotone"
                dataKey="active"
                stroke="#2563EB"
                strokeWidth={2.5}
                dot={{ r: 4, fill: "#FFFFFF", stroke: "#2563EB", strokeWidth: 2 }}
                activeDot={{ r: 6, fill: "#2563EB" }}
                label={renderActiveLabel}
              />

              {/* Inactive Series Line */}
              <Line
                type="monotone"
                dataKey="inactive"
                stroke="#EF4444"
                strokeWidth={2.5}
                dot={{ r: 4, fill: "#FFFFFF", stroke: "#EF4444", strokeWidth: 2 }}
                activeDot={{ r: 6, fill: "#EF4444" }}
                label={renderInactiveLabel}
              />
            </ComposedChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Donut Chart Card (Right - ~33% width) */}
      <div className="ms-card p-4 sm:p-6 rounded-2xl flex flex-col justify-between">
        <div>
          <h3 className="text-base font-bold text-slate-800 tracking-tight mb-2">
            สัดส่วนการใช้งานระบบ (เมือง)
          </h3>

          {/* Donut Chart with Center Percentage */}
          <div className="relative w-full h-[220px] flex items-center justify-center my-2">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={donutData}
                  cx="50%"
                  cy="50%"
                  innerRadius={68}
                  outerRadius={92}
                  paddingAngle={3}
                  dataKey="value"
                  startAngle={90}
                  endAngle={-270}
                >
                  {donutData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} stroke="none" />
                  ))}
                </Pie>
              </PieChart>
            </ResponsiveContainer>

            {/* Center Donut Label */}
            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
              <span className="text-3xl font-extrabold text-slate-900 tracking-tight">
                {activePercent}%
              </span>
              <span className="text-xs font-semibold text-slate-500 mt-0.5">
                เปิดใช้งาน
              </span>
            </div>
          </div>
        </div>

        {/* Bottom Legend & Totals Breakdown */}
        <div className="grid grid-cols-2 gap-3 pt-4 border-t border-slate-100">
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded bg-blue-600 flex-shrink-0"></span>
            <div>
              <p className="text-xs text-slate-500 font-medium">เปิดใช้งาน</p>
              <p className="text-xs sm:text-sm font-bold text-slate-800">
                {activeCount} เมือง ({activePercent}%)
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded bg-red-500 flex-shrink-0"></span>
            <div>
              <p className="text-xs text-slate-500 font-medium">ไม่ได้ใช้งาน</p>
              <p className="text-xs sm:text-sm font-bold text-slate-800">
                {inactiveCount} เมือง ({inactivePercent}%)
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
