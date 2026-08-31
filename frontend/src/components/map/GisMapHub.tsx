"use client";

import React, { useState } from "react";
import dynamic from "next/dynamic";
import { useGisMap } from "@/hooks/useGisMap";
import { useCities } from "@/hooks/useCities";
import { GisLayerPanel } from "./GisLayerPanel";
import { GisPointModal } from "./GisPointModal";
import {
  MapPin,
  Sparkles,
  RefreshCw,
  Loader2,
} from "lucide-react";

// Dynamically import Leaflet map component with SSR disabled
const DynamicGisMapLeaflet = dynamic(
  () => import("./GisMapLeaflet").then((mod) => mod.GisMapLeaflet),
  {
    ssr: false,
    loading: () => (
      <div className="w-full h-full min-h-[600px] rounded-2xl bg-slate-100 border border-slate-200 flex flex-col items-center justify-center gap-3">
        <Loader2 size={32} className="animate-spin text-brand-primary" />
        <span className="text-sm font-medium text-slate-500">กำลังโหลดระบบแผนที่เชิงพื้นที่ GIS...</span>
      </div>
    ),
  }
);

interface GisMapHubProps {
  cityId?: string;
  cityName?: string;
  hideHeader?: boolean;
  hideCitySelector?: boolean;
  heightClassName?: string;
}

export const GisMapHub: React.FC<GisMapHubProps> = ({
  cityId,
  cityName,
  hideHeader = false,
  hideCitySelector = false,
  heightClassName,
}) => {
  const { cities } = useCities();
  const {
    layers,
    points,
    activeLayers,
    selectedCityId,
    selectedPoint,
    searchQuery,
    loadingPoints,
    totalPointsCount,
    setSelectedCityId,
    setSelectedPoint,
    setSearchQuery,
    toggleLayer,
    selectAllLayers,
    clearAllLayers,
    refresh,
  } = useGisMap(cityId || null);

  const [isFullscreen, setIsFullscreen] = useState(false);

  const cityOptions = cities.map((c) => ({
    id: c.id,
    name_th: c.name_th,
  }));

  const visiblePointsCount = React.useMemo(() => {
    return points.filter((p) => activeLayers.includes(p.layer_type)).length;
  }, [points, activeLayers]);

  return (
    <div
      className={`relative flex flex-col gap-4 transition-all duration-300 ${
        isFullscreen
          ? "fixed inset-0 z-[9999] bg-white p-4 overflow-hidden"
          : "w-full"
      }`}
    >
      {/* Top Banner & Stats Overview */}
      {!isFullscreen && !hideHeader && (
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-gradient-to-r from-brand-primary via-indigo-900 to-slate-900 p-5 rounded-2xl text-white shadow-lg shadow-brand-primary/10">
          <div>
            <div className="flex items-center gap-2">
              <span className="bg-brand-cyan/20 text-brand-cyan text-xs font-bold px-2.5 py-0.5 rounded-full border border-brand-cyan/30 flex items-center gap-1 font-mono">
                <Sparkles size={12} />
                ENTERPRISE GIS HUB
              </span>
              <span className="text-white/60 text-xs">• {cityName ? `แผนที่ข้อมูลเชิงพื้นที่ ${cityName}` : "ข้อมูลพิกัดเชิงพื้นที่รวม"}</span>
            </div>
            <h1 className="text-xl sm:text-2xl font-black mt-1 tracking-tight">
              {cityName ? `แผนที่ข้อมูลเชิงพื้นที่ ${cityName}` : "แผนที่ข้อมูลเมืองอัจฉริยะ (Multi-Layer GIS Map)"}
            </h1>
            <p className="text-xs text-white/70 mt-0.5">
              แสดงพิกัดจริงทุกมิติข้อมูล ร้องทุกข์ กลุ่มเปราะบาง กล้องวงจรปิด และสัตว์เลี้ยง
            </p>
          </div>

          {/* Quick Metrics Badge */}
          <div className="flex items-center gap-3 shrink-0">
            <div className="bg-white/10 backdrop-blur-md px-4 py-2.5 rounded-xl border border-white/15 text-right">
              <span className="text-[11px] text-white/70 block">พิกัดในระบบ</span>
              <div className="flex items-baseline justify-end gap-1.5 font-mono">
                <span className="text-2xl font-black text-brand-cyan tracking-tight">
                  {totalPointsCount.toLocaleString()}
                </span>
                <span className="text-xs font-semibold text-white/80">จุดพิกัด</span>
              </div>
            </div>

            <button
              onClick={refresh}
              disabled={loadingPoints}
              className="w-10 h-10 rounded-xl bg-white/10 hover:bg-white/20 border border-white/15 flex items-center justify-center transition-colors text-white active:scale-95 disabled:opacity-50 cursor-pointer"
              title="รีเฟรชข้อมูลพิกัด"
            >
              <RefreshCw size={18} className={loadingPoints ? "animate-spin" : ""} />
            </button>
          </div>
        </div>
      )}

      {/* Main Map Canvas Area */}
      <div
        className={`w-full rounded-2xl overflow-hidden shadow-sm ${
          isFullscreen
            ? "fixed inset-0 z-50 rounded-none bg-slate-900"
            : `relative isolate z-10 ${heightClassName || "h-[600px] min-h-[500px]"}`
        }`}
      >
        {/* Google My Maps Style Layer Panel */}
        <GisLayerPanel
          layers={layers}
          activeLayers={activeLayers}
          totalPointsCount={totalPointsCount}
          filteredPointsCount={visiblePointsCount}
          cities={cityOptions}
          selectedCityId={selectedCityId}
          searchQuery={searchQuery}
          hideCitySelector={hideCitySelector}
          onToggleLayer={toggleLayer}
          onSelectAll={selectAllLayers}
          onClearAll={clearAllLayers}
          onSelectCity={setSelectedCityId}
          onSearchChange={setSearchQuery}
        />

        {/* Leaflet Interactive Map */}
        <DynamicGisMapLeaflet
          points={points}
          activeLayers={activeLayers}
          selectedPoint={selectedPoint}
          onSelectPoint={setSelectedPoint}
          isFullscreen={isFullscreen}
          onToggleFullscreen={() => setIsFullscreen(!isFullscreen)}
        />

        {/* Selected Point Glass Card Detail Modal */}
        <GisPointModal point={selectedPoint} onClose={() => setSelectedPoint(null)} />

        {/* Loading Spinner Badge */}
        {loadingPoints && (
          <div className="absolute top-4 left-1/2 -translate-x-1/2 z-[1000] bg-white/95 backdrop-blur-md px-3.5 py-2 rounded-full border border-slate-200 shadow-md flex items-center gap-2 text-xs font-semibold text-slate-700">
            <Loader2 size={15} className="animate-spin text-brand-primary" />
            <span>กำลังดึงข้อมูลพิกัด...</span>
          </div>
        )}

        {/* Empty State Overlay */}
        {!loadingPoints && points.length === 0 && (
          <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-[1000] bg-white/95 backdrop-blur-md px-4 py-2.5 rounded-2xl border border-slate-200 shadow-lg flex items-center gap-2 text-xs font-medium text-slate-600">
            <MapPin size={16} className="text-amber-500" />
            <span>ไม่พบพิกัดตามเงื่อนไขที่เลือก กรุณาเลือกเปิด Layer หรือเปลี่ยนคำค้นหา</span>
          </div>
        )}
      </div>
    </div>
  );
};
