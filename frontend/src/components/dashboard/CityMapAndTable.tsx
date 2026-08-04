"use client";

import React, { useState, useEffect, useRef } from "react";
import { MapPin, ChevronLeft, ChevronRight } from "lucide-react";

export interface CityLocationData {
  id: string;
  name: string;
  isActive: boolean;
  modulesCount: number;
  riverSensors: number;
  senseSensors: number;
  population: number;
  activeUsers: number;
  registeredUsers: number;
  displayUserFormat: string;
  lat: number;
  lng: number;
}

const CITY_MOCK_DATA: CityLocationData[] = [
  // Page 1 (1-10)
  {
    id: "1",
    name: "เทศบาลเมืองสกลนคร",
    isActive: true,
    modulesCount: 8,
    riverSensors: 10,
    senseSensors: 15,
    population: 98765,
    activeUsers: 24457,
    registeredUsers: 28900,
    displayUserFormat: "24,457",
    lat: 17.155,
    lng: 104.148,
  },
  {
    id: "2",
    name: "เทศบาลนครนนทบุรี",
    isActive: true,
    modulesCount: 12,
    riverSensors: 18,
    senseSensors: 20,
    population: 267071,
    activeUsers: 65321,
    registeredUsers: 72000,
    displayUserFormat: "65,321",
    lat: 13.862,
    lng: 100.513,
  },
  {
    id: "3",
    name: "เทศบาลเมืองปากเกร็ด",
    isActive: true,
    modulesCount: 10,
    riverSensors: 14,
    senseSensors: 18,
    population: 136258,
    activeUsers: 33987,
    registeredUsers: 39500,
    displayUserFormat: "33,987",
    lat: 13.913,
    lng: 100.498,
  },
  {
    id: "4",
    name: "เทศบาลเมืองบางใหญ่",
    isActive: true,
    modulesCount: 6,
    riverSensors: 8,
    senseSensors: 12,
    population: 71954,
    activeUsers: 17892,
    registeredUsers: 21000,
    displayUserFormat: "17,892",
    lat: 13.876,
    lng: 100.413,
  },
  {
    id: "5",
    name: "เทศบาลเมืองบางกรวย",
    isActive: true,
    modulesCount: 7,
    riverSensors: 9,
    senseSensors: 14,
    population: 57884,
    activeUsers: 14765,
    registeredUsers: 18000,
    displayUserFormat: "14,765",
    lat: 13.805,
    lng: 100.473,
  },
  {
    id: "6",
    name: "เทศบาลเมืองนครปฐม",
    isActive: true,
    modulesCount: 9,
    riverSensors: 12,
    senseSensors: 17,
    population: 73211,
    activeUsers: 18456,
    registeredUsers: 22000,
    displayUserFormat: "18,456",
    lat: 13.819,
    lng: 100.06,
  },
  {
    id: "7",
    name: "เทศบาลเมืองสมุทรสาคร",
    isActive: true,
    modulesCount: 11,
    riverSensors: 16,
    senseSensors: 19,
    population: 64231,
    activeUsers: 15274,
    registeredUsers: 19000,
    displayUserFormat: "15,274",
    lat: 13.547,
    lng: 100.274,
  },
  {
    id: "8",
    name: "เทศบาลเมืองสุรินทร์แฮม",
    isActive: false,
    modulesCount: 5,
    riverSensors: 7,
    senseSensors: 10,
    population: 29876,
    activeUsers: 7856,
    registeredUsers: 11000,
    displayUserFormat: "7,856",
    lat: 14.882,
    lng: 103.493,
  },
  {
    id: "9",
    name: "เทศบาลเมืองลำลูกกา",
    isActive: false,
    modulesCount: 10,
    riverSensors: 13,
    senseSensors: 16,
    population: 115812,
    activeUsers: 27963,
    registeredUsers: 32000,
    displayUserFormat: "27,963",
    lat: 13.932,
    lng: 100.748,
  },
  {
    id: "10",
    name: "เทศบาลเมืองบางบัวทอง",
    isActive: false,
    modulesCount: 8,
    riverSensors: 11,
    senseSensors: 13,
    population: 56112,
    activeUsers: 13245,
    registeredUsers: 16500,
    displayUserFormat: "13,245",
    lat: 13.916,
    lng: 100.423,
  },

  // Page 2 (11-20)
  {
    id: "11",
    name: "เทศบาลนครเชียงใหม่",
    isActive: true,
    modulesCount: 14,
    riverSensors: 20,
    senseSensors: 25,
    population: 127240,
    activeUsers: 35120,
    registeredUsers: 41000,
    displayUserFormat: "35,120",
    lat: 18.788,
    lng: 98.985,
  },
  {
    id: "12",
    name: "เทศบาลนครเชียงราย",
    isActive: true,
    modulesCount: 10,
    riverSensors: 15,
    senseSensors: 18,
    population: 76500,
    activeUsers: 19840,
    registeredUsers: 24000,
    displayUserFormat: "19,840",
    lat: 19.91,
    lng: 99.84,
  },
  {
    id: "13",
    name: "เทศบาลเมืองพิษณุโลก",
    isActive: true,
    modulesCount: 9,
    riverSensors: 12,
    senseSensors: 16,
    population: 89400,
    activeUsers: 22150,
    registeredUsers: 27000,
    displayUserFormat: "22,150",
    lat: 16.821,
    lng: 100.265,
  },
  {
    id: "14",
    name: "เทศบาลนครขอนแก่น",
    isActive: true,
    modulesCount: 13,
    riverSensors: 17,
    senseSensors: 22,
    population: 113800,
    activeUsers: 31400,
    registeredUsers: 38000,
    displayUserFormat: "31,400",
    lat: 16.441,
    lng: 102.835,
  },
  {
    id: "15",
    name: "เทศบาลนครอุบลราชธานี",
    isActive: true,
    modulesCount: 11,
    riverSensors: 16,
    senseSensors: 19,
    population: 106500,
    activeUsers: 28900,
    registeredUsers: 35000,
    displayUserFormat: "28,900",
    lat: 15.228,
    lng: 104.859,
  },
  {
    id: "16",
    name: "เทศบาลนครนครราชสีมา",
    isActive: true,
    modulesCount: 15,
    riverSensors: 22,
    senseSensors: 28,
    population: 142100,
    activeUsers: 41200,
    registeredUsers: 49000,
    displayUserFormat: "41,200",
    lat: 14.979,
    lng: 102.097,
  },
  {
    id: "17",
    name: "เทศบาลนครหาดใหญ่",
    isActive: true,
    modulesCount: 12,
    riverSensors: 14,
    senseSensors: 21,
    population: 156800,
    activeUsers: 45300,
    registeredUsers: 53000,
    displayUserFormat: "45,300",
    lat: 7.008,
    lng: 100.474,
  },
  {
    id: "18",
    name: "เทศบาลเมืองชลบุรี",
    isActive: true,
    modulesCount: 10,
    riverSensors: 11,
    senseSensors: 15,
    population: 82300,
    activeUsers: 21700,
    registeredUsers: 26000,
    displayUserFormat: "21,700",
    lat: 13.361,
    lng: 100.984,
  },
  {
    id: "19",
    name: "เทศบาลเมืองหัวหิน",
    isActive: false,
    modulesCount: 6,
    riverSensors: 8,
    senseSensors: 11,
    population: 63400,
    activeUsers: 14800,
    registeredUsers: 18500,
    displayUserFormat: "14,800",
    lat: 12.568,
    lng: 99.957,
  },
  {
    id: "20",
    name: "เทศบาลนครสุราษฎร์ธานี",
    isActive: false,
    modulesCount: 7,
    riverSensors: 10,
    senseSensors: 13,
    population: 128500,
    activeUsers: 29400,
    registeredUsers: 36000,
    displayUserFormat: "29,400",
    lat: 9.138,
    lng: 99.333,
  },

  // Page 3 (21-30)
  {
    id: "21",
    name: "เทศบาลนครอุดรธานี",
    isActive: true,
    modulesCount: 12,
    riverSensors: 15,
    senseSensors: 20,
    population: 130500,
    activeUsers: 33600,
    registeredUsers: 40000,
    displayUserFormat: "33,600",
    lat: 17.415,
    lng: 102.787,
  },
  {
    id: "22",
    name: "เทศบาลเมืองลำปาง",
    isActive: true,
    modulesCount: 8,
    riverSensors: 11,
    senseSensors: 14,
    population: 54200,
    activeUsers: 13900,
    registeredUsers: 17000,
    displayUserFormat: "13,900",
    lat: 18.292,
    lng: 99.492,
  },
  {
    id: "23",
    name: "เทศบาลเมืองระยอง",
    isActive: true,
    modulesCount: 11,
    riverSensors: 13,
    senseSensors: 18,
    population: 67800,
    activeUsers: 18200,
    registeredUsers: 22000,
    displayUserFormat: "18,200",
    lat: 12.681,
    lng: 101.281,
  },
  {
    id: "24",
    name: "เทศบาลนครภูเก็ต",
    isActive: true,
    modulesCount: 14,
    riverSensors: 18,
    senseSensors: 24,
    population: 79200,
    activeUsers: 26400,
    registeredUsers: 31000,
    displayUserFormat: "26,400",
    lat: 7.88,
    lng: 98.392,
  },
  {
    id: "25",
    name: "เทศบาลเมืองกาญจนบุรี",
    isActive: true,
    modulesCount: 7,
    riverSensors: 12,
    senseSensors: 13,
    population: 48900,
    activeUsers: 11500,
    registeredUsers: 14500,
    displayUserFormat: "11,500",
    lat: 14.022,
    lng: 99.532,
  },
  {
    id: "26",
    name: "เทศบาลเมืองราชบุรี",
    isActive: true,
    modulesCount: 8,
    riverSensors: 10,
    senseSensors: 15,
    population: 52400,
    activeUsers: 12800,
    registeredUsers: 16000,
    displayUserFormat: "12,800",
    lat: 13.537,
    lng: 99.816,
  },
  {
    id: "27",
    name: "เทศบาลเมืองฉะเชิงเทรา",
    isActive: true,
    modulesCount: 9,
    riverSensors: 14,
    senseSensors: 16,
    population: 59100,
    activeUsers: 15600,
    registeredUsers: 19000,
    displayUserFormat: "15,600",
    lat: 13.69,
    lng: 101.077,
  },
  {
    id: "28",
    name: "เทศบาลเมืองสระบุรี",
    isActive: true,
    modulesCount: 8,
    riverSensors: 9,
    senseSensors: 13,
    population: 61300,
    activeUsers: 16100,
    registeredUsers: 20000,
    displayUserFormat: "16,100",
    lat: 14.528,
    lng: 100.91,
  },
  {
    id: "29",
    name: "เทศบาลเมืองอยุธยา",
    isActive: true,
    modulesCount: 10,
    riverSensors: 15,
    senseSensors: 17,
    population: 72600,
    activeUsers: 20300,
    registeredUsers: 25000,
    displayUserFormat: "20,300",
    lat: 14.353,
    lng: 100.568,
  },
  {
    id: "30",
    name: "เทศบาลนครยะลา",
    isActive: true,
    modulesCount: 9,
    riverSensors: 11,
    senseSensors: 14,
    population: 63700,
    activeUsers: 17400,
    registeredUsers: 21500,
    displayUserFormat: "17,400",
    lat: 6.541,
    lng: 101.281,
  },
];

export function CityMapAndTable() {
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [hoveredCityId, setHoveredCityId] = useState<string | null>(null);

  const mapContainerRef = useRef<HTMLDivElement | null>(null);
  const mapInstanceRef = useRef<any>(null);
  const markersRef = useRef<{ [key: string]: any }>({});

  const itemsPerPage = 10;
  const totalCitiesCount = 30;
  const totalPages = Math.ceil(CITY_MOCK_DATA.length / itemsPerPage);

  const startIndex = (currentPage - 1) * itemsPerPage;
  const currentTableCities = CITY_MOCK_DATA.slice(startIndex, startIndex + itemsPerPage);

  // Initialize Real Leaflet Map on Client Side
  useEffect(() => {
    let isMounted = true;

    async function initLeafletMap() {
      if (!mapContainerRef.current || mapInstanceRef.current) return;

      const L = (await import("leaflet")).default;

      if (!isMounted || !mapContainerRef.current) return;

      // Center map on Thailand
      const map = L.map(mapContainerRef.current, {
        center: [13.2, 101.2],
        zoom: 6,
        zoomControl: true,
        scrollWheelZoom: true,
      });

      // CartoDB Voyager Tile Layer for clean, beautiful corporate look
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

      // Render Leaflet Markers for all 30 cities
      CITY_MOCK_DATA.forEach((city) => {
        const pinBgColor = city.isActive ? "#10b981" : "#ef4444"; // Green for Active, Red for Inactive

        const customHtml = `
          <div id="pin-${city.id}" class="relative transition-all duration-200 cursor-pointer flex items-center justify-center filter drop-shadow-md">
            <svg width="28" height="36" viewBox="0 0 24 32" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M12 0C5.37 0 0 5.37 0 12C0 21 12 32 12 32C12 32 24 21 24 12C24 5.37 18.63 0 12 0ZM12 16C9.79 16 8 14.21 8 12C8 9.79 9.79 8 12 8C14.21 8 16 9.79 16 12C16 14.21 14.21 16 12 16Z" fill="${pinBgColor}"/>
            </svg>
          </div>
        `;

        const customIcon = L.divIcon({
          html: customHtml,
          className: "custom-leaflet-pin-icon",
          iconSize: [28, 36],
          iconAnchor: [14, 36],
          popupAnchor: [0, -34],
        });

        const popupContent = `
          <div style="font-family: var(--font-prompt), Inter, sans-serif;">
            <p style="font-weight: 700; font-size: 13px; color: ${pinBgColor}; margin: 0 0 4px 0; line-height: 1.2;">${city.name}</p>
            <p style="font-size: 11px; color: #475569; margin: 2px 0 0 0;">ประชากร: <strong style="color: #0f172a;">${city.population.toLocaleString()}</strong> คน</p>
            <p style="font-size: 11px; color: #475569; margin: 2px 0 0 0;">ผู้ใช้งาน: <strong style="color: #10b981;">${city.displayUserFormat}</strong> คน</p>
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
    }

    initLeafletMap();

    return () => {
      isMounted = false;
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, []);

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

  // Handle Clicking Row in Table to Center Map to City
  const handleCityRowClick = (city: CityLocationData) => {
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
        <div className="absolute top-4 left-4 z-20 bg-white/95 backdrop-blur-md p-2.5 rounded-xl border border-slate-200/80 shadow-md text-xs font-bold space-y-1.5 pointer-events-none">
          <div className="flex items-center gap-2">
            <span className="p-1 bg-emerald-50 border border-emerald-100 rounded-md text-emerald-600">
              <MapPin className="w-3.5 h-3.5 fill-emerald-500 text-white" />
            </span>
            <span className="text-slate-700">เปิดใช้งาน</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="p-1 bg-rose-50 border border-rose-100 rounded-md text-rose-600">
              <MapPin className="w-3.5 h-3.5 fill-rose-500 text-white" />
            </span>
            <span className="text-slate-700">ไม่ได้ใช้งาน</span>
          </div>
        </div>

        {/* Real Leaflet Map Container */}
        <div className="relative w-full h-full flex-1 min-h-[400px] overflow-hidden rounded-xl">
          <div ref={mapContainerRef} className="w-full h-full min-h-[400px] z-10" />
        </div>
      </div>

      {/* Municipalities Data Table Panel (Right ~7 cols / ~55% width) */}
      <div className="lg:col-span-7 ms-card p-4 sm:p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col justify-between min-h-[480px] lg:min-h-[520px]">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs sm:text-sm border-collapse">
            <thead>
              <tr className="border-b border-slate-200 text-slate-500 font-bold uppercase tracking-wider text-[11px]">
                <th className="py-3 px-2 sm:px-3">เมือง</th>
                <th className="py-3 px-2 sm:px-3 text-center">Module</th>
                <th className="py-3 px-2 sm:px-3 text-center">River</th>
                <th className="py-3 px-2 sm:px-3 text-center">Sense</th>
                <th className="py-3 px-2 sm:px-3 text-right">ประชากร</th>
                <th className="py-3 px-2 sm:px-3 text-right">ผู้ใช้งาน (ลงทะเบียน)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {currentTableCities.map((city) => {
                const isHovered = hoveredCityId === city.id;
                return (
                  <tr
                    key={city.id}
                    onClick={() => handleCityRowClick(city)}
                    onMouseEnter={() => setHoveredCityId(city.id)}
                    onMouseLeave={() => setHoveredCityId(null)}
                    className={`cursor-pointer transition-colors duration-150 ${
                      isHovered ? "bg-emerald-50/90 font-medium" : "hover:bg-slate-50/80"
                    }`}
                  >
                    {/* City Name with Status Pin Icon */}
                    <td className="py-3 px-2 sm:px-3 whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        <MapPin
                          className={`w-4 h-4 flex-shrink-0 ${
                            city.isActive ? "text-emerald-500 fill-emerald-100" : "text-rose-500 fill-rose-100"
                          }`}
                        />
                        <span
                          className={`font-semibold ${
                            city.isActive ? "text-slate-800" : "text-rose-600"
                          }`}
                        >
                          {city.name}
                        </span>
                      </div>
                    </td>

                    <td className="py-3 px-2 sm:px-3 text-center text-slate-600 font-medium">
                      {city.modulesCount}
                    </td>
                    <td className="py-3 px-2 sm:px-3 text-center text-slate-600 font-medium">
                      {city.riverSensors}
                    </td>
                    <td className="py-3 px-2 sm:px-3 text-center text-slate-600 font-medium">
                      {city.senseSensors}
                    </td>
                    <td className="py-3 px-2 sm:px-3 text-right text-slate-700 font-semibold">
                      {city.population.toLocaleString()}
                    </td>
                    <td className="py-3 px-2 sm:px-3 text-right text-slate-800 font-bold whitespace-nowrap">
                      {city.displayUserFormat}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Pagination & Footer Controls */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-4 mt-2 border-t border-slate-100 text-xs text-slate-500 font-medium">
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
                    ? "bg-sky-600 text-white shadow-sm"
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
