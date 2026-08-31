"use client";

import React, { useState } from "react";
import { GisLayerSummary } from "@/hooks/useGisMap";
import {
  Layers,
  ChevronLeft,
  ChevronRight,
  Search,
  Building2,
  AlertTriangle,
  Users,
  HeartPulse,
  Camera,
  PawPrint,
  CheckSquare,
  Square,
  Sparkles,
  Wrench,
  LifeBuoy,
  Activity,
  Syringe,
  Trash2,
  Truck,
} from "lucide-react";

interface CityOption {
  id: string;
  name_th: string;
}

interface GisLayerPanelProps {
  layers: GisLayerSummary[];
  activeLayers: string[];
  totalPointsCount: number;
  filteredPointsCount: number;
  cities: CityOption[];
  selectedCityId: string | null;
  searchQuery: string;
  hideCitySelector?: boolean;
  onToggleLayer: (layerKey: string) => void;
  onSelectAll: () => void;
  onClearAll: () => void;
  onSelectCity: (cityId: string | null) => void;
  onSearchChange: (q: string) => void;
}

export const GisLayerPanel: React.FC<GisLayerPanelProps> = ({
  layers,
  activeLayers,
  totalPointsCount,
  filteredPointsCount,
  cities,
  selectedCityId,
  searchQuery,
  hideCitySelector = false,
  onToggleLayer,
  onSelectAll,
  onClearAll,
  onSelectCity,
  onSearchChange,
}) => {
  const [isCollapsed, setIsCollapsed] = useState(false);

  const getLayerIcon = (key: string) => {
    switch (key) {
      case "complaint":
        return AlertTriangle;
      case "complaint_activity":
        return Wrench;
      case "elderly":
        return Users;
      case "elderly_assistance":
        return LifeBuoy;
      case "bedridden":
        return HeartPulse;
      case "bedridden_assistance":
        return Activity;
      case "cctv":
        return Camera;
      case "pet":
        return PawPrint;
      case "pet_service":
        return Syringe;
      case "waste_fee":
        return Trash2;
      case "municipality":
        return Building2;
      default:
        return Layers;
    }
  };

  return (
    <div
      className={`absolute top-4 left-4 z-[800] transition-all duration-300 ${
        isCollapsed ? "w-12" : "w-80 sm:w-88"
      }`}
    >
      <div className="bg-white/95 backdrop-blur-md rounded-2xl border border-slate-200/90 shadow-xl overflow-hidden flex flex-col max-h-[calc(100vh-14rem)] sm:max-h-[460px]">
        {/* Panel Header */}
        <div className="p-3 bg-gradient-to-r from-brand-primary to-indigo-900 text-white flex items-center justify-between shrink-0">
          {!isCollapsed && (
            <div className="flex items-center gap-2.5">
              <div className="w-7 h-7 rounded-lg bg-white/15 backdrop-blur-sm flex items-center justify-center">
                <Layers size={16} className="text-white" />
              </div>
              <div>
                <h3 className="font-bold text-xs leading-tight flex items-center gap-1.5">
                  ชั้นข้อมูลเชิงพื้นที่
                  <span className="text-[10px] bg-brand-cyan/20 text-brand-cyan px-1.5 py-0.2 rounded font-mono font-bold">
                    GIS
                  </span>
                </h3>
                <p className="text-[10px] text-white/70">Google My Maps Multi-Layer</p>
              </div>
            </div>
          )}

          <button
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="w-7 h-7 rounded-lg bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors text-white ml-auto cursor-pointer"
            title={isCollapsed ? "ขยายแถบเมนู" : "ย่อแถบเมนู"}
          >
            {isCollapsed ? <ChevronRight size={15} /> : <ChevronLeft size={15} />}
          </button>
        </div>

        {!isCollapsed && (
          <div className="p-3 space-y-3 overflow-y-auto flex-1 custom-scrollbar">
            {/* Total Points Live Counter */}
            <div className="p-2.5 rounded-xl bg-gradient-to-br from-indigo-50/80 via-blue-50/50 to-white border border-indigo-100 flex items-center justify-between">
              <div>
                <span className="text-[10px] font-semibold text-indigo-900/70 block">
                  พิกัดที่กำลังแสดงผล
                </span>
                <span className="text-lg font-black text-indigo-950 font-mono tracking-tight">
                  {filteredPointsCount.toLocaleString()}
                </span>
                <span className="text-[10px] text-slate-400 font-medium ml-1">
                  / {totalPointsCount.toLocaleString()} จุด
                </span>
              </div>
              <div className="w-8 h-8 rounded-xl bg-indigo-600/10 text-indigo-600 flex items-center justify-center">
                <Sparkles size={16} />
              </div>
            </div>

            {/* City Selector Filter (Hidden when in City Details Page) */}
            {!hideCitySelector && (
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-700 block">
                  เลือกเมือง / เทศบาล
                </label>
                <div className="relative">
                  <select
                    value={selectedCityId || ""}
                    onChange={(e) => onSelectCity(e.target.value ? e.target.value : null)}
                    className="w-full text-xs font-medium pl-8 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-brand-primary outline-none transition-all cursor-pointer"
                  >
                    <option value="">ทุกเมืองพร้อมกัน (All Cities Overview)</option>
                    {cities.map((city) => (
                      <option key={city.id} value={city.id}>
                        {city.name_th}
                      </option>
                    ))}
                  </select>
                  <Building2
                    size={13}
                    className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none"
                  />
                </div>
              </div>
            )}

            {/* Keyword Search */}
            <div className="relative">
              <input
                type="text"
                placeholder="ค้นหาชื่อ, ที่อยู่, เอกสาร..."
                value={searchQuery}
                onChange={(e) => onSearchChange(e.target.value)}
                className="w-full text-xs pl-8 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-brand-primary outline-none transition-all"
              />
              <Search
                size={13}
                className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none"
              />
            </div>

            {/* Layer Toggles List */}
            <div className="space-y-1.5 pt-1 border-t border-slate-100">
              <div className="flex items-center justify-between text-xs">
                <span className="font-bold text-slate-800 text-[11px]">ชั้นข้อมูล ({layers.length} หมวด)</span>
                <div className="flex items-center gap-2 text-[10px]">
                  <button
                    onClick={onSelectAll}
                    className="text-brand-primary hover:text-indigo-900 font-semibold transition-colors cursor-pointer"
                  >
                    เปิดทั้งหมด
                  </button>
                  <span className="text-slate-300">|</span>
                  <button
                    onClick={onClearAll}
                    className="text-slate-500 hover:text-slate-800 font-medium transition-colors cursor-pointer"
                  >
                    ล้าง
                  </button>
                </div>
              </div>

              <div className="space-y-1">
                {layers.map((layer) => {
                  const isActive = activeLayers.includes(layer.layer_key);
                  const Icon = getLayerIcon(layer.layer_key);

                  return (
                    <div
                      key={layer.layer_key}
                      onClick={() => onToggleLayer(layer.layer_key)}
                      className={`group flex items-center justify-between p-2 rounded-xl border transition-all cursor-pointer select-none ${
                        isActive
                          ? "bg-slate-50/90 border-slate-200 shadow-xs"
                          : "bg-white border-transparent opacity-45 hover:opacity-75"
                      }`}
                    >
                      <div className="flex items-center gap-2 min-w-0">
                        {isActive ? (
                          <CheckSquare size={15} className="text-brand-primary shrink-0" />
                        ) : (
                          <Square size={15} className="text-slate-300 shrink-0" />
                        )}

                        <div
                          className="w-5 h-5 rounded-md flex items-center justify-center shrink-0"
                          style={{
                            backgroundColor: `${layer.color}15`,
                            color: layer.color,
                          }}
                        >
                          <Icon size={12} />
                        </div>

                        <span className="text-xs font-medium text-slate-800 truncate">
                          {layer.name_th}
                        </span>
                      </div>

                      <span
                        className="text-[10px] font-mono font-bold px-1.5 py-0.2 rounded-md shrink-0 ml-2"
                        style={{
                          backgroundColor: `${layer.color}15`,
                          color: layer.color,
                        }}
                      >
                        {layer.count.toLocaleString()}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
