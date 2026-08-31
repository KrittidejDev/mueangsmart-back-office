"use client";

import React, { useEffect, useRef, useState } from "react";
import L from "leaflet";
import { GisPoint } from "@/hooks/useGisMap";
import { Maximize2, Minimize2, ZoomIn, ZoomOut, Compass, Map } from "lucide-react";

interface GisMapLeafletProps {
  points: GisPoint[];
  activeLayers: string[];
  selectedPoint: GisPoint | null;
  onSelectPoint: (point: GisPoint | null) => void;
  isFullscreen: boolean;
  onToggleFullscreen: () => void;
}

export const GisMapLeaflet: React.FC<GisMapLeafletProps> = ({
  points,
  activeLayers,
  selectedPoint,
  onSelectPoint,
  isFullscreen,
  onToggleFullscreen,
}) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const markersLayerGroupRef = useRef<L.LayerGroup | null>(null);
  const [activeTile, setActiveTile] = useState<"standard" | "satellite">("standard");

  // Filter visible points strictly by activeLayers
  const visiblePoints = React.useMemo(() => {
    return points.filter((pt) => activeLayers.includes(pt.layer_type));
  }, [points, activeLayers]);

  // Create custom pin icons using L.divIcon
  const createCustomIcon = React.useCallback(
    (point: GisPoint) => {
      let color = "#3b82f6";
      let glyph = "•";

      switch (point.layer_type) {
        case "complaint":
          color = "#ef4444";
          glyph = "🚨";
          break;
        case "complaint_activity":
          color = "#f97316";
          glyph = "🛠️";
          break;
        case "elderly":
          color = "#2563eb";
          glyph = "🧓";
          break;
        case "elderly_assistance":
          color = "#0284c7";
          glyph = "🆘";
          break;
        case "bedridden":
          color = "#a855f7";
          glyph = "🛏️";
          break;
        case "bedridden_assistance":
          color = "#7c3aed";
          glyph = "🚑";
          break;
        case "cctv":
          color = "#10b981";
          glyph = "📹";
          break;
        case "pet":
          color = "#f59e0b";
          glyph = "🐾";
          break;
        case "pet_service":
          color = "#d97706";
          glyph = "💉";
          break;
        case "waste_fee":
          color = "#14b8a6";
          glyph = "🗑️";
          break;
        case "municipality":
          color = "#4338ca";
          glyph = "🏛️";
          break;
      }

      const isSelected = selectedPoint?.id === point.id;

      const html = `
        <div class="relative group cursor-pointer flex items-center justify-center transition-transform hover:scale-125 ${
          isSelected ? "scale-125 z-50 animate-bounce" : ""
        }">
          <div class="w-7 h-7 rounded-full shadow-lg flex items-center justify-center text-[12px] border-2 border-white"
               style="background: radial-gradient(circle, ${color} 0%, ${color}dd 100%);">
            <span class="drop-shadow-sm">${glyph}</span>
          </div>
          <div class="w-1.5 h-1.5 rounded-full bg-slate-900/30 -bottom-1 absolute blur-[1px]"></div>
        </div>
      `;

      return L.divIcon({
        html,
        className: "custom-gis-pin",
        iconSize: [28, 28],
        iconAnchor: [14, 14],
        popupAnchor: [0, -14],
      });
    },
    [selectedPoint]
  );

  // Initialize Map
  useEffect(() => {
    if (!mapContainerRef.current || mapInstanceRef.current) return;

    // Default center: Thailand
    const map = L.map(mapContainerRef.current, {
      center: [13.0, 101.5],
      zoom: 10,
      zoomControl: false,
      attributionControl: false,
    });

    // Clean OpenStreetMap Standard Tile Layer without watermark
    const tileLayer = L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      maxZoom: 19,
      attribution: "&copy; OpenStreetMap contributors",
    });
    tileLayer.addTo(map);

    const markersGroup = L.layerGroup().addTo(map);
    markersLayerGroupRef.current = markersGroup;
    mapInstanceRef.current = map;

    return () => {
      map.remove();
      mapInstanceRef.current = null;
    };
  }, []);

  // Update Points / Markers
  useEffect(() => {
    const map = mapInstanceRef.current;
    const markersGroup = markersLayerGroupRef.current;
    if (!map || !markersGroup) return;

    markersGroup.clearLayers();

    const validBounds: L.LatLngTuple[] = [];

    visiblePoints.forEach((pt) => {
      // Thailand bounds check
      if (
        !pt.latitude ||
        !pt.longitude ||
        isNaN(pt.latitude) ||
        isNaN(pt.longitude) ||
        pt.latitude < 5.0 ||
        pt.latitude > 21.0 ||
        pt.longitude < 97.0 ||
        pt.longitude > 106.0
      ) {
        return;
      }

      validBounds.push([pt.latitude, pt.longitude]);

      const marker = L.marker([pt.latitude, pt.longitude], {
        icon: createCustomIcon(pt),
      });

      // Tooltip on hover
      marker.bindTooltip(
        `<div class="p-1 font-sans">
          <div class="font-bold text-xs">${pt.title}</div>
          <div class="text-[11px] text-slate-500">${pt.city_name || ""} • ${pt.category || ""}</div>
        </div>`,
        {
          direction: "top",
          offset: [0, -10],
          opacity: 0.95,
        }
      );

      // On Click select point
      marker.on("click", () => {
        onSelectPoint(pt);
      });

      markersGroup.addLayer(marker);
    });

    // Auto-fit bounds if we have points and not currently focused on a single point
    if (validBounds.length > 0 && !selectedPoint) {
      map.fitBounds(L.latLngBounds(validBounds), {
        padding: [60, 60],
        maxZoom: 15,
      });
    }
  }, [visiblePoints, selectedPoint, onSelectPoint, createCustomIcon]);

  // Pan to selected point if clicked
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map || !selectedPoint) return;

    map.flyTo([selectedPoint.latitude, selectedPoint.longitude], 16, {
      duration: 1.2,
    });
  }, [selectedPoint]);

  // Change Tile Layer
  const handleToggleTile = () => {
    const map = mapInstanceRef.current;
    if (!map) return;

    map.eachLayer((layer) => {
      if (layer instanceof L.TileLayer) {
        map.removeLayer(layer);
      }
    });

    if (activeTile === "standard") {
      // Switch to Satellite (Esri World Imagery)
      L.tileLayer(
        "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}",
        { maxZoom: 18 }
      ).addTo(map);
      setActiveTile("satellite");
    } else {
      // Switch back to OSM Standard
      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        maxZoom: 19,
      }).addTo(map);
      setActiveTile("standard");
    }
  };

  const handleZoomIn = () => mapInstanceRef.current?.zoomIn();
  const handleZoomOut = () => mapInstanceRef.current?.zoomOut();
  const handleResetView = () => {
    const validBounds = visiblePoints
      .filter((p) => p.latitude >= 5.0 && p.latitude <= 21.0 && p.longitude >= 97.0 && p.longitude <= 106.0)
      .map((p) => [p.latitude, p.longitude] as L.LatLngTuple);
    if (validBounds.length > 0) {
      mapInstanceRef.current?.fitBounds(L.latLngBounds(validBounds), {
        padding: [60, 60],
      });
    }
  };

  return (
    <div className="relative w-full h-full min-h-[480px] overflow-hidden rounded-2xl bg-slate-100 border border-slate-200">
      {/* Map Container */}
      <div ref={mapContainerRef} className="w-full h-full z-0" />

      {/* Floating Map Controls (Right Side) */}
      <div className="absolute top-4 right-4 z-[800] flex flex-col gap-2">
        {/* Fullscreen Presentation Button */}
        <button
          onClick={onToggleFullscreen}
          className="w-10 h-10 rounded-xl bg-white/95 backdrop-blur-md border border-slate-200/90 shadow-lg hover:bg-white text-slate-700 hover:text-brand-primary flex items-center justify-center transition-all active:scale-95 group cursor-pointer"
          title={isFullscreen ? "ออกจากโหมดเต็มจอ" : "โหมดนำเสนอเต็มจอ (Presentation Mode)"}
        >
          {isFullscreen ? <Minimize2 size={18} /> : <Maximize2 size={18} />}
        </button>

        {/* Tile Layer Toggle */}
        <button
          onClick={handleToggleTile}
          className="w-10 h-10 rounded-xl bg-white/95 backdrop-blur-md border border-slate-200/90 shadow-lg hover:bg-white text-slate-700 hover:text-brand-primary flex items-center justify-center transition-all active:scale-95 cursor-pointer"
          title={activeTile === "standard" ? "เปลี่ยนเป็นภาพดาวเทียม (Satellite)" : "เปลี่ยนเป็นแผนที่ถนน (Map)"}
        >
          <Map size={18} />
        </button>

        {/* Reset View */}
        <button
          onClick={handleResetView}
          className="w-10 h-10 rounded-xl bg-white/95 backdrop-blur-md border border-slate-200/90 shadow-lg hover:bg-white text-slate-700 hover:text-brand-primary flex items-center justify-center transition-all active:scale-95 cursor-pointer"
          title="รีเซ็ตมุมมองแผนที่"
        >
          <Compass size={18} />
        </button>

        {/* Zoom In & Out */}
        <div className="flex flex-col rounded-xl bg-white/95 backdrop-blur-md border border-slate-200/90 shadow-lg overflow-hidden">
          <button
            onClick={handleZoomIn}
            className="w-10 h-10 hover:bg-slate-50 text-slate-700 hover:text-brand-primary flex items-center justify-center transition-colors border-b border-slate-100 cursor-pointer"
            title="ขยาย (Zoom In)"
          >
            <ZoomIn size={18} />
          </button>
          <button
            onClick={handleZoomOut}
            className="w-10 h-10 hover:bg-slate-50 text-slate-700 hover:text-brand-primary flex items-center justify-center transition-colors cursor-pointer"
            title="ย่อ (Zoom Out)"
          >
            <ZoomOut size={18} />
          </button>
        </div>
      </div>
    </div>
  );
};
