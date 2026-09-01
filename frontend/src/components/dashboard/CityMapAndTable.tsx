"use client";

import React, { useState, useEffect, useRef, useMemo } from "react";
import { MapPin, ChevronLeft, ChevronRight, ArrowUpDown, ArrowUp, ArrowDown, Plus, Minus, RotateCcw } from "lucide-react";
import { useCities } from "@/hooks/useCities";

function SortIcon({
  field,
  currentField,
  direction,
}: {
  field: string;
  currentField: string | null;
  direction: "asc" | "desc" | null;
}) {
  if (currentField !== field) {
    return <ArrowUpDown className="w-3 h-3 text-slate-400 opacity-40 shrink-0" />;
  }
  return direction === "asc" ? (
    <ArrowUp className="w-3 h-3 text-sky-600 font-bold shrink-0" />
  ) : (
    <ArrowDown className="w-3 h-3 text-sky-600 font-bold shrink-0" />
  );
}

export interface CityLocationData {
  id: string;
  name: string;
  isActive: boolean;
  modulesCount: number;
  riverSensors: number;
  senseSensors: number;
  activeUsers: number;
  registeredUsers: number;
  lat: number;
  lng: number;
}

export function CityMapAndTable() {
  const { cities } = useCities();
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [hoveredCityId, setHoveredCityId] = useState<string | null>(null);

  const mapContainerRef = useRef<HTMLDivElement | null>(null);
  const mapInstanceRef = useRef<any>(null);
  const markersRef = useRef<{ [key: string]: any }>({});
  const hoverTimerRef = useRef<NodeJS.Timeout | null>(null);

  type CitySortField = "name" | "modulesCount" | "riverSensors" | "senseSensors" | "activeUsers" | "registeredUsers";
  const [sortField, setSortField] = useState<CitySortField | null>(null);
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("desc");

  const cityLocationData: CityLocationData[] = useMemo(() => {
    return (cities || []).map((c) => {
      const isActive = c.status?.toLowerCase().includes("active") || c.status?.includes("ใช้งาน");
      return {
        id: c.id,
        name: c.name_th,
        isActive: !!isActive,
        modulesCount: c.active_modules_count || c.modules_count || 0,
        riverSensors: typeof c.river_status === "number" ? c.river_status : (Number(c.river_status) || 0),
        senseSensors: typeof c.sense_status === "number" ? c.sense_status : (Number(c.sense_status) || 0),
        activeUsers: c.active_users_count || c.total_users_count || 0,
        registeredUsers: c.registered_users_count || c.total_users_count || 0,
        lat: c.latitude && c.latitude !== 0 ? c.latitude : 13.7563,
        lng: c.longitude && c.longitude !== 0 ? c.longitude : 100.5018,
      };
    });
  }, [cities]);

  const handleSort = (field: CitySortField) => {
    if (sortField === field) {
      setSortDirection((prev) => (prev === "desc" ? "asc" : "desc"));
    } else {
      setSortField(field);
      setSortDirection("desc");
    }
  };

  const sortedCities = useMemo(() => {
    if (!sortField) return cityLocationData;
    return [...cityLocationData].sort((a, b) => {
      const aVal = a[sortField];
      const bVal = b[sortField];

      if (aVal === bVal) return 0;
      if (aVal === null || aVal === undefined) return 1;
      if (bVal === null || bVal === undefined) return -1;

      let comparison = 0;
      if (typeof aVal === "number" && typeof bVal === "number") {
        comparison = aVal - bVal;
      } else if (typeof aVal === "boolean" && typeof bVal === "boolean") {
        comparison = (aVal ? 1 : 0) - (bVal ? 1 : 0);
      } else {
        const strA = String(aVal);
        const strB = String(bVal);
        comparison = strA.localeCompare(strB, "th", { numeric: true, sensitivity: "base" });
      }

      return sortDirection === "asc" ? comparison : -comparison;
    });
  }, [cityLocationData, sortField, sortDirection]);

  const itemsPerPage = 10;
  const totalCitiesCount = sortedCities.length;
  const totalPages = Math.max(1, Math.ceil(totalCitiesCount / itemsPerPage));

  const startIndex = (currentPage - 1) * itemsPerPage;
  const currentTableCities = sortedCities.slice(startIndex, startIndex + itemsPerPage);

  const [mapReady, setMapReady] = useState(false);

  // Initialize Real Leaflet Map on Client Side
  useEffect(() => {
    let isMounted = true;

    async function initLeafletMap() {
      if (!mapContainerRef.current || mapInstanceRef.current) return;

      const L = (await import("leaflet")).default;

      if (!isMounted || !mapContainerRef.current) return;

      const map = L.map(mapContainerRef.current, {
        center: [13.2, 101.2],
        zoom: 6,
        zoomControl: false,
        attributionControl: false,
        scrollWheelZoom: true,
      });

      L.tileLayer(
        "https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png",
        {
          attribution:
            '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>',
          subdomains: "abcd",
          maxZoom: 19,
        }
      ).addTo(map);

      mapInstanceRef.current = map;
      setMapReady(true);

      setTimeout(() => {
        if (map && isMounted) {
          map.invalidateSize();
        }
      }, 250);
    }

    initLeafletMap();

    return () => {
      isMounted = false;
      setMapReady(false);
      if (hoverTimerRef.current) {
        clearTimeout(hoverTimerRef.current);
      }
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, []);

  // Sync Markers with Live cityLocationData & Map Readiness
  useEffect(() => {
    if (!mapReady || !mapInstanceRef.current || cityLocationData.length === 0) return;
    const map = mapInstanceRef.current;

    Object.values(markersRef.current).forEach((marker: any) => {
      if (marker && map) {
        map.removeLayer(marker);
      }
    });
    markersRef.current = {};

    import("leaflet").then((leafletModule) => {
      const L = leafletModule.default;
      cityLocationData.forEach((city) => {
        const pinBgColor = city.isActive ? "#10b981" : "#ef4444";

        const customHtml = `
          <div id="pin-${city.id}" class="relative transition-all duration-200 cursor-pointer flex items-center justify-center filter drop-shadow-md">
            <svg width="28" height="36" viewBox="0 0 24 32" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M12 0C5.37 0 0 5.37 0 12C0 21 12 32 12 32C12 32 24 21 24 12C24 5.37 18.63 0 12 0ZM12 16C9.79 16 8 14.21 8 12C8 9.79 9.79 8 12 8C14.21 8 16 9.79 16 12C16 14.21 14.21 16 12 16Z" fill="${pinBgColor}"/>
            </svg>
          </div>
        `;

        const customIcon = L.divIcon({
          html: customHtml,
          className: "",
          iconSize: [28, 36],
          iconAnchor: [14, 36],
          popupAnchor: [0, -34],
        });

        const popupContent = `
          <div style="font-family: var(--font-prompt), Inter, sans-serif;">
            <p style="font-weight: 700; font-size: 13px; color: ${pinBgColor}; margin: 0 0 4px 0; line-height: 1.2;">${city.name}</p>
            <p style="font-size: 11px; color: #475569; margin: 2px 0 0 0;">ผู้ใช้งาน: <strong style="color: #0f172a;">${city.activeUsers.toLocaleString()}</strong> คน</p>
            <p style="font-size: 11px; color: #475569; margin: 2px 0 0 0;">ลงทะเบียน: <strong style="color: #10b981;">${city.registeredUsers.toLocaleString()}</strong> คน</p>
          </div>
        `;

        const marker = L.marker([city.lat, city.lng], { icon: customIcon }).addTo(map);
        marker.bindPopup(popupContent, { closeButton: false });

        marker.on("mouseover", () => {
          setHoveredCityId(city.id);
          marker.openPopup();
        });

        marker.on("mouseout", () => {
          setHoveredCityId(null);
          marker.closePopup();
        });

        marker.on("click", () => {
          setHoveredCityId(city.id);
          map.flyTo([city.lat, city.lng], 10, { duration: 1 });
          marker.openPopup();
        });

        markersRef.current[city.id] = marker;
      });

      map.invalidateSize();
    });
  }, [mapReady, cityLocationData]);

  // Sync Table Hover & Center Map on Selected/Hovered City
  useEffect(() => {
    if (!mapInstanceRef.current) return;

    Object.keys(markersRef.current).forEach((id) => {
      const marker = markersRef.current[id];
      const pinElement = document.getElementById(`pin-${id}`);

      if (id === hoveredCityId) {
        if (pinElement) {
          pinElement.style.transform = "scale(1.35)";
          pinElement.style.zIndex = "999";
        }
        marker.openPopup();
      } else {
        if (pinElement) {
          pinElement.style.transform = "scale(1)";
          pinElement.style.zIndex = "10";
        }
      }
    });
  }, [hoveredCityId]);

  // Map Zoom & View Controls
  const handleZoomIn = () => {
    if (mapInstanceRef.current) {
      mapInstanceRef.current.zoomIn();
    }
  };

  const handleZoomOut = () => {
    if (mapInstanceRef.current) {
      mapInstanceRef.current.zoomOut();
    }
  };

  const handleResetZoom = () => {
    if (mapInstanceRef.current) {
      mapInstanceRef.current.flyTo([13.2, 101.2], 6, { duration: 1 });
    }
  };

  // Delayed Hover Handler (2 seconds delay) for Table Rows
  const handleRowMouseEnter = (city: CityLocationData) => {
    if (hoverTimerRef.current) {
      clearTimeout(hoverTimerRef.current);
    }
    hoverTimerRef.current = setTimeout(() => {
      setHoveredCityId(city.id);
      if (mapInstanceRef.current) {
        mapInstanceRef.current.flyTo([city.lat, city.lng], 10, { duration: 1.2 });
      }
    }, 2000);
  };

  const handleRowMouseLeave = () => {
    if (hoverTimerRef.current) {
      clearTimeout(hoverTimerRef.current);
      hoverTimerRef.current = null;
    }
    setHoveredCityId(null);
  };

  // Immediate Click Handler for Table Rows
  const handleCityRowClick = (city: CityLocationData) => {
    if (hoverTimerRef.current) {
      clearTimeout(hoverTimerRef.current);
      hoverTimerRef.current = null;
    }
    setHoveredCityId(city.id);
    if (mapInstanceRef.current) {
      mapInstanceRef.current.flyTo([city.lat, city.lng], 10, { duration: 1.2 });
    }
    if (markersRef.current[city.id]) {
      markersRef.current[city.id].openPopup();
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
      {/* Interactive Real Leaflet Map Panel (Left ~5 cols / ~45% width) */}
      <div className="lg:col-span-5 ms-card rounded-2xl overflow-hidden relative min-h-[480px] lg:min-h-[520px] bg-slate-100/90 border border-slate-200 shadow-sm flex flex-col justify-between p-4">
        {/* Map Header Legend */}
        <div className="absolute top-6 left-6 z-20 bg-white/85 backdrop-blur-md px-3 py-2.5 rounded-xl border border-slate-200/70 text-xs font-bold space-y-2 pointer-events-none select-none">
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <span className="p-1 bg-emerald-50 border border-emerald-200/80 rounded-md text-emerald-600">
                <MapPin className="w-3.5 h-3.5 fill-emerald-500 text-emerald-100" />
              </span>
              <span className="text-slate-700 font-bold">เปิดใช้งาน</span>
            </div>
            <span className="px-2 py-0.5 rounded-full text-[11px] font-bold bg-emerald-50 text-emerald-600 border border-emerald-200/80">
              {cityLocationData.filter((c) => c.isActive).length} เมือง
            </span>
          </div>

          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <span className="p-1 bg-rose-50 border border-rose-200/80 rounded-md text-rose-600">
                <MapPin className="w-3.5 h-3.5 fill-rose-500 text-rose-100" />
              </span>
              <span className="text-slate-700 font-bold">ไม่ได้ใช้งาน</span>
            </div>
            <span className="px-2 py-0.5 rounded-full text-[11px] font-bold bg-rose-50 text-rose-500 border border-rose-200/80">
              {cityLocationData.filter((c) => !c.isActive).length} เมือง
            </span>
          </div>
        </div>

        {/* Real Leaflet Map Container */}
        <div className="relative w-full h-full flex-1 min-h-[400px] overflow-hidden rounded-xl">
          <div ref={mapContainerRef} className="w-full h-full min-h-[400px] z-10" />

          {/* Map Controls: Zoom In, Zoom Out, Reset Center (Bottom-Right) */}
          <div className="absolute bottom-4 right-4 z-20 flex flex-col gap-1.5 bg-white/85 backdrop-blur-md p-1.5 rounded-xl border border-slate-200/70 select-none shadow-none">
            <button
              type="button"
              onClick={handleZoomIn}
              title="ซูมเข้า (Zoom In)"
              className="p-2 rounded-lg bg-white/90 hover:bg-sky-50 text-slate-700 hover:text-sky-600 border border-slate-200/80 transition-all cursor-pointer shadow-2xs"
            >
              <Plus className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={handleZoomOut}
              title="ซูมออก (Zoom Out)"
              className="p-2 rounded-lg bg-white/90 hover:bg-sky-50 text-slate-700 hover:text-sky-600 border border-slate-200/80 transition-all cursor-pointer shadow-2xs"
            >
              <Minus className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={handleResetZoom}
              title="รีเซ็ตมุมมองประเทศไทย"
              className="p-2 rounded-lg bg-white/90 hover:bg-sky-50 text-slate-700 hover:text-sky-600 border border-slate-200/80 transition-all cursor-pointer shadow-2xs"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Municipalities Data Table Panel (Right ~7 cols / ~55% width) */}
      <div className="lg:col-span-7 bg-white rounded-2xl border border-slate-200 shadow-2xs flex flex-col justify-between overflow-hidden min-h-[480px] lg:min-h-[520px]">
        <div className="overflow-x-auto flex-1">
          <table className="w-full text-left text-xs sm:text-sm border-collapse table-fixed min-w-[600px]">
            <colgroup>
              <col className="w-[34%]" />
              <col className="w-[12%]" />
              <col className="w-[12%]" />
              <col className="w-[12%]" />
              <col className="w-[15%]" />
              <col className="w-[15%]" />
            </colgroup>
            <thead className="bg-slate-50/80 border-b border-slate-200 text-slate-700 text-xs font-bold select-none">
              <tr>
                <th
                  onClick={() => handleSort("name")}
                  className="py-3 pl-4 sm:pl-6 pr-3 text-left cursor-pointer hover:bg-slate-100/80 transition-colors"
                >
                  <div className="flex items-center gap-1">
                    <span>เมือง</span>
                    <SortIcon field="name" currentField={sortField} direction={sortDirection} />
                  </div>
                </th>
                <th
                  onClick={() => handleSort("modulesCount")}
                  className="py-3 px-3 text-center cursor-pointer hover:bg-slate-100/80 transition-colors"
                >
                  <div className="flex items-center justify-center gap-1">
                    <span>MODULE</span>
                    <SortIcon field="modulesCount" currentField={sortField} direction={sortDirection} />
                  </div>
                </th>
                <th
                  onClick={() => handleSort("riverSensors")}
                  className="py-3 px-3 text-center cursor-pointer hover:bg-slate-100/80 transition-colors"
                >
                  <div className="flex items-center justify-center gap-1">
                    <span>RIVER</span>
                    <SortIcon field="riverSensors" currentField={sortField} direction={sortDirection} />
                  </div>
                </th>
                <th
                  onClick={() => handleSort("senseSensors")}
                  className="py-3 px-3 text-center cursor-pointer hover:bg-slate-100/80 transition-colors"
                >
                  <div className="flex items-center justify-center gap-1">
                    <span>SENSE</span>
                    <SortIcon field="senseSensors" currentField={sortField} direction={sortDirection} />
                  </div>
                </th>
                <th
                  onClick={() => handleSort("activeUsers")}
                  className="py-3 px-3 text-right cursor-pointer hover:bg-slate-100/80 transition-colors"
                >
                  <div className="flex items-center justify-end gap-1">
                    <span>ผู้ใช้งาน</span>
                    <SortIcon field="activeUsers" currentField={sortField} direction={sortDirection} />
                  </div>
                </th>
                <th
                  onClick={() => handleSort("registeredUsers")}
                  className="py-3 pl-3 pr-4 sm:pr-6 text-right cursor-pointer hover:bg-slate-100/80 transition-colors"
                >
                  <div className="flex items-center justify-end gap-1">
                    <span>ลงทะเบียน</span>
                    <SortIcon field="registeredUsers" currentField={sortField} direction={sortDirection} />
                  </div>
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {currentTableCities.map((city) => {
                const isHovered = hoveredCityId === city.id;
                return (
                  <tr
                    key={city.id}
                    onClick={() => handleCityRowClick(city)}
                    onMouseEnter={() => handleRowMouseEnter(city)}
                    onMouseLeave={handleRowMouseLeave}
                    className={`cursor-pointer transition-colors duration-150 ${
                      isHovered ? "bg-emerald-50/90 font-medium" : "hover:bg-slate-50/80"
                    }`}
                  >
                    {/* City Name with Status Pin Icon */}
                    <td className="py-3 pl-4 sm:pl-6 pr-3 whitespace-nowrap overflow-hidden">
                      <div className="flex items-center gap-2 min-w-0">
                        <MapPin
                          className={`w-4 h-4 flex-shrink-0 ${
                            city.isActive ? "text-emerald-500 fill-emerald-100" : "text-rose-500 fill-rose-100"
                          }`}
                        />
                        <span
                          className={`font-semibold truncate ${
                            city.isActive ? "text-slate-800" : "text-rose-600"
                          }`}
                          title={city.name}
                        >
                          {city.name}
                        </span>
                      </div>
                    </td>

                    <td className="py-3 px-3 text-center text-slate-600 font-medium">
                      {city.modulesCount}
                    </td>
                    <td className="py-3 px-3 text-center text-slate-600 font-medium">
                      {city.riverSensors}
                    </td>
                    <td className="py-3 px-3 text-center text-slate-600 font-medium">
                      {city.senseSensors}
                    </td>
                    <td className="py-3 px-3 text-right text-slate-700 font-semibold">
                      {city.activeUsers.toLocaleString()}
                    </td>
                    <td className="py-3 pl-3 pr-4 sm:pr-6 text-right text-slate-800 font-bold whitespace-nowrap">
                      {city.registeredUsers.toLocaleString()}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Pagination & Footer Controls */}
        <div className="p-4 sm:p-6 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-500 font-medium">
          <div>
            {startIndex + 1}-{startIndex + currentTableCities.length} จาก {totalCitiesCount} เมือง
          </div>

          <div className="flex items-center gap-1">
            <button
              onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
              disabled={currentPage === 1}
              className="p-1.5 rounded-lg border border-slate-200 hover:bg-slate-100 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
            >
              <ChevronLeft className="w-4 h-4 text-slate-600" />
            </button>

            {Array.from({ length: totalPages }, (_, i) => i + 1).map((pageNum) => (
              <button
                key={pageNum}
                onClick={() => setCurrentPage(pageNum)}
                className={`w-7 h-7 rounded-lg text-xs font-bold transition-all ${
                  currentPage === pageNum
                    ? "bg-brand-primary text-white shadow-sm"
                    : "text-slate-600 hover:bg-slate-100 border border-transparent"
                }`}
              >
                {pageNum}
              </button>
            ))}

            <button
              onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
              disabled={currentPage === totalPages}
              className="p-1.5 rounded-lg border border-slate-200 hover:bg-slate-100 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
            >
              <ChevronRight className="w-4 h-4 text-slate-600" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
