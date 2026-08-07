"use client";

import React, { useState, useEffect, useRef } from "react";
import { 
  X, 
  UploadCloud, 
  Search, 
  MapPin, 
  Loader2, 
  AlertCircle, 
  Plus, 
  Bed, 
  HeartHandshake, 
  CreditCard, 
  ShieldCheck, 
  Megaphone, 
  Truck, 
  MessageSquare, 
  Heart, 
  Bell, 
  Trash2, 
  Camera, 
  Waves, 
  CloudRain 
} from "lucide-react";
import { City } from "@/hooks/useCities";

export interface CityFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  mode: "create" | "edit";
  cityData?: City | null;
  onSave: (data: Partial<City>) => Promise<boolean> | boolean;
}

interface ToggleSwitchProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
}

function ToggleSwitch({ checked, onChange }: ToggleSwitchProps) {
  return (
    <button
      type="button"
      onClick={() => onChange(!checked)}
      className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
        checked ? "bg-sky-600" : "bg-slate-300"
      }`}
    >
      <span
        className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-sm ring-0 transition duration-200 ease-in-out ${
          checked ? "translate-x-5" : "translate-x-0"
        }`}
      />
    </button>
  );
}

export function CityFormModal({
  isOpen,
  onClose,
  mode,
  cityData,
  onSave,
}: CityFormModalProps) {
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [stampFile, setStampFile] = useState<File | null>(null);
  const [logoPreview, setLogoPreview] = useState<string>("");
  const [stampPreview, setStampPreview] = useState<string>("");

  const [nameTh, setNameTh] = useState("");
  const [nameEn, setNameEn] = useState("");
  const [addressTh, setAddressTh] = useState("");
  const [addressEn, setAddressEn] = useState("");
  const [phone, setPhone] = useState("");
  const [status, setStatus] = useState("Active");
  const [latitude, setLatitude] = useState<number>(13.7563);
  const [longitude, setLongitude] = useState<number>(100.5018);

  const mapContainerRef = useRef<HTMLDivElement | null>(null);
  const mapInstanceRef = useRef<any>(null);
  const markerRef = useRef<any>(null);

  const [mapSearch, setMapSearch] = useState("");
  const [searchResults, setSearchResults] = useState<Array<{ display_name: string; lat: string; lon: string }>>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [searchError, setSearchError] = useState("");

  const [modBedridden, setModBedridden] = useState(true);
  const [modElderlyDisabled, setModElderlyDisabled] = useState(true);
  const [modOnlineTax, setModOnlineTax] = useState(true);
  const [modIdentityVerification, setModIdentityVerification] = useState(true);
  const [modPublicRelations, setModPublicRelations] = useState(true);

  const [modComplaintCenter, setModComplaintCenter] = useState(true);
  const [modComplaints, setModComplaints] = useState(true);
  const [modPetHealth, setModPetHealth] = useState(true);
  const [modNotifications, setModNotifications] = useState(true);

  const [modWasteFee, setModWasteFee] = useState(true);
  const [modWasteFeeSystem, setModWasteFeeSystem] = useState<"old" | "new">("old");

  const [modCctv, setModCctv] = useState(false);
  const [modWaterLevel, setModWaterLevel] = useState(false);
  const [modFahFon, setModFahFon] = useState(false);
  const [modFahFonUuid, setModFahFonUuid] = useState("550e8400-e29b-41d4-a716-446655440000");

  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState("");

  useEffect(() => {
    if (!isOpen) return;

    if (mode === "edit" && cityData) {
      setNameTh(cityData.name_th || "");
      setNameEn(cityData.name_en || "");
      setAddressTh(cityData.address_th || "");
      setAddressEn(cityData.address_en || "");
      setPhone(cityData.phone || "02-123-4567, 02-515-2458");
      setStatus(cityData.status === "ไม่ใช้งาน" || cityData.status === "Inactive" ? "Inactive" : "Active");
      setLatitude(cityData.latitude || 13.7563);
      setLongitude(cityData.longitude || 100.5018);

      setModBedridden(true);
      setModElderlyDisabled(true);
      setModOnlineTax(true);
      setModIdentityVerification(true);
      setModPublicRelations(true);
      setModComplaintCenter(true);
      setModComplaints(true);
      setModPetHealth(true);
      setModNotifications(true);
      setModWasteFee(true);
      setModWasteFeeSystem("old");
      setModCctv(false);
      setModWaterLevel(false);
      setModFahFon(false);
      setModFahFonUuid("550e8400-e29b-41d4-a716-446655440000");
    } else {
      setNameTh("");
      setNameEn("");
      setAddressTh("");
      setAddressEn("");
      setPhone("");
      setStatus("Active");
      setLatitude(13.7563);
      setLongitude(100.5018);
      setLogoFile(null);
      setStampFile(null);
      setLogoPreview("");
      setStampPreview("");

      setModBedridden(true);
      setModElderlyDisabled(true);
      setModOnlineTax(true);
      setModIdentityVerification(true);
      setModPublicRelations(true);
      setModComplaintCenter(true);
      setModComplaints(true);
      setModPetHealth(true);
      setModNotifications(true);
      setModWasteFee(true);
      setModWasteFeeSystem("old");
      setModCctv(false);
      setModWaterLevel(false);
      setModFahFon(false);
      setModFahFonUuid("550e8400-e29b-41d4-a716-446655440000");
    }
    setMapSearch("");
    setSearchResults([]);
    setSearchError("");
    setFormError("");
  }, [isOpen, mode, cityData]);

  // Initialize Real Leaflet Map inside Modal
  useEffect(() => {
    if (!isOpen) return;

    let isMounted = true;

    async function initMap() {
      if (!mapContainerRef.current) return;

      const targetLat = cityData?.latitude ?? latitude ?? 13.7563;
      const targetLng = cityData?.longitude ?? longitude ?? 100.5018;

      if (mapInstanceRef.current) {
        if (markerRef.current) {
          markerRef.current.setLatLng([targetLat, targetLng]);
        }
        mapInstanceRef.current.setView([targetLat, targetLng], 13);
        mapInstanceRef.current.invalidateSize();
        return;
      }

      const L = (await import("leaflet")).default;
      if (!isMounted || !mapContainerRef.current) return;

      const map = L.map(mapContainerRef.current, {
        center: [targetLat, targetLng],
        zoom: 13,
        zoomControl: false,
        attributionControl: false,
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

      const customHtml = `
        <div class="relative transition-all duration-200 cursor-pointer flex items-center justify-center filter drop-shadow-md">
          <svg width="28" height="36" viewBox="0 0 24 32" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M12 0C5.37 0 0 5.37 0 12C0 21 12 32 12 32C12 32 24 21 24 12C24 5.37 18.63 0 12 0ZM12 16C9.79 16 8 14.21 8 12C8 9.79 9.79 8 12 8C14.21 8 16 9.79 16 12C16 14.21 14.21 16 12 16Z" fill="#0284c7"/>
          </svg>
        </div>
      `;

      const customIcon = L.divIcon({
        html: customHtml,
        className: "custom-modal-pin-icon",
        iconSize: [28, 36],
        iconAnchor: [14, 36],
      });

      const marker = L.marker([targetLat, targetLng], {
        icon: customIcon,
        draggable: true,
      }).addTo(map);

      marker.on("dragend", () => {
        const position = marker.getLatLng();
        const newLat = Number(position.lat.toFixed(6));
        const newLng = Number(position.lng.toFixed(6));
        setLatitude(newLat);
        setLongitude(newLng);
      });

      map.on("click", (e: any) => {
        const { lat, lng } = e.latlng;
        const newLat = Number(lat.toFixed(6));
        const newLng = Number(lng.toFixed(6));
        setLatitude(newLat);
        setLongitude(newLng);
        marker.setLatLng([newLat, newLng]);
      });

      mapInstanceRef.current = map;
      markerRef.current = marker;

      setTimeout(() => {
        if (mapInstanceRef.current) {
          mapInstanceRef.current.invalidateSize();
        }
      }, 250);
    }

    initMap();

    return () => {
      isMounted = false;
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
        markerRef.current = null;
      }
    };
  }, [isOpen]);

  const handleLatitudeChange = (val: string) => {
    const newLat = parseFloat(val);
    setLatitude(isNaN(newLat) ? 0 : newLat);
    if (!isNaN(newLat) && mapInstanceRef.current && markerRef.current) {
      markerRef.current.setLatLng([newLat, longitude]);
      mapInstanceRef.current.panTo([newLat, longitude]);
    }
  };

  const handleLongitudeChange = (val: string) => {
    const newLng = parseFloat(val);
    setLongitude(isNaN(newLng) ? 0 : newLng);
    if (!isNaN(newLng) && mapInstanceRef.current && markerRef.current) {
      markerRef.current.setLatLng([latitude, newLng]);
      mapInstanceRef.current.panTo([latitude, newLng]);
    }
  };

  const handleSearchLocation = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!mapSearch.trim()) return;

    setIsSearching(true);
    setSearchError("");
    setSearchResults([]);

    try {
      const res = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(
          mapSearch
        )}&countrycodes=th&limit=5`,
        {
          headers: {
            "Accept-Language": "th,en",
          },
        }
      );
      const data = await res.json();
      if (Array.isArray(data) && data.length > 0) {
        setSearchResults(data);
      } else {
        const globalRes = await fetch(
          `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(
            mapSearch
          )}&limit=5`
        );
        const globalData = await globalRes.json();
        if (Array.isArray(globalData) && globalData.length > 0) {
          setSearchResults(globalData);
        } else {
          setSearchError("ไม่พบสถานที่ที่ค้นหา");
        }
      }
    } catch {
      setSearchError("เกิดข้อผิดพลาดในการค้นหา");
    } finally {
      setIsSearching(false);
    }
  };

  const handleSelectSearchResult = (result: { lat: string; lon: string; display_name: string }) => {
    const newLat = Number(parseFloat(result.lat).toFixed(6));
    const newLng = Number(parseFloat(result.lon).toFixed(6));

    setLatitude(newLat);
    setLongitude(newLng);

    if (mapInstanceRef.current && markerRef.current) {
      markerRef.current.setLatLng([newLat, newLng]);
      mapInstanceRef.current.flyTo([newLat, newLng], 14, { duration: 1 });
    }

    setSearchResults([]);
    setSearchError("");
  };

  const handleZoomIn = () => {
    mapInstanceRef.current?.zoomIn();
  };

  const handleZoomOut = () => {
    mapInstanceRef.current?.zoomOut();
  };

  if (!isOpen) return null;

  const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setLogoFile(file);
      setLogoPreview(URL.createObjectURL(file));
    }
  };

  const handleStampChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setStampFile(file);
      setStampPreview(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!nameTh.trim()) {
      setFormError("กรุณากรอกชื่อเทศบาล (ภาษาไทย)");
      return;
    }
    if (!addressTh.trim()) {
      setFormError("กรุณากรอกที่อยู่ติดต่อ (ภาษาไทย)");
      return;
    }
    if (!phone.trim()) {
      setFormError("กรุณากรอกเบอร์ติดต่อ");
      return;
    }
    setFormError("");
    setSaving(true);

    try {
      const success = await onSave({
        name_th: nameTh,
        name_en: nameEn,
        address_th: addressTh,
        address_en: addressEn,
        phone: phone,
        status: status === "Active" ? "ใช้งาน" : "ไม่ใช้งาน",
        latitude: Number(latitude),
        longitude: Number(longitude),
        modules_count: 8,
        active_modules_count: 8,
      });

      if (success) {
        onClose();
      } else {
        setFormError("เกิดข้อผิดพลาดในการบันทึกข้อมูล กรุณาลองใหม่อีกครั้ง");
      }
    } catch {
      setFormError("เกิดข้อผิดพลาดในการบันทึกข้อมูล กรุณาลองใหม่อีกครั้ง");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 overflow-y-auto">
      <div 
        className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs transition-opacity" 
        onClick={onClose} 
      />

      <div className="relative bg-white w-full max-w-4xl rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh] z-10 border border-slate-100">
        <div className="p-6 sm:px-8 sm:py-6 border-b border-slate-100 flex items-center justify-between bg-white sticky top-0 z-20">
          <div>
            <h2 className="text-lg sm:text-xl font-bold text-slate-900">
              {mode === "create" ? "สร้างเมืองใหม่" : "แก้ไขรายละเอียดเมือง"}
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              {mode === "create"
                ? "กรอกข้อมูลเมืองเพื่อสร้างเมืองใหม่ในระบบ"
                : "แก้ไขและอัปเดตข้อมูลเมืองในระบบ"}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-xl transition-all cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col flex-1 min-h-0 overflow-hidden">
          <div className="p-6 sm:p-8 space-y-6 overflow-y-auto flex-1">
            {formError && (
              <div className="p-3 bg-red-50 border border-red-200 text-red-600 rounded-2xl text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                <span>{formError}</span>
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  อัปโหลดโลโก้เทศบาล <span className="text-red-500">*</span>
                </label>
                <label className="border-2 border-dashed border-slate-200 hover:border-sky-400 bg-slate-50/50 hover:bg-sky-50/30 rounded-2xl p-5 text-center transition-all cursor-pointer block">
                  <input type="file" accept="image/*" className="hidden" onChange={handleLogoChange} />
                  {logoPreview ? (
                    <div className="flex flex-col items-center">
                      <img src={logoPreview} alt="Logo Preview" className="h-16 object-contain mb-2 rounded-lg" />
                      <span className="text-xs text-sky-600 font-semibold">{logoFile?.name || "โลโก้ที่เลือก"}</span>
                    </div>
                  ) : (
                    <>
                      <div className="w-10 h-10 rounded-full bg-sky-50 text-sky-600 flex items-center justify-center mx-auto mb-2 border border-sky-100">
                        <UploadCloud className="w-5 h-5" />
                      </div>
                      <p className="text-xs sm:text-sm font-bold text-slate-700">คลิกเพื่ออัปโหลด</p>
                      <p className="text-[11px] text-slate-400 mt-0.5">รองรับไฟล์ .jpg, .png (ขนาดไม่เกิน 2MB)</p>
                    </>
                  )}
                </label>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  อัปโหลดตรายาง <span className="text-slate-400 font-normal">(สำหรับใช้ในใบเสร็จรับเงิน)</span>
                </label>
                <label className="border-2 border-dashed border-slate-200 hover:border-sky-400 bg-slate-50/50 hover:bg-sky-50/30 rounded-2xl p-5 text-center transition-all cursor-pointer block">
                  <input type="file" accept="image/*" className="hidden" onChange={handleStampChange} />
                  {stampPreview ? (
                    <div className="flex flex-col items-center">
                      <img src={stampPreview} alt="Stamp Preview" className="h-16 object-contain mb-2 rounded-lg" />
                      <span className="text-xs text-sky-600 font-semibold">{stampFile?.name || "ตรายางที่เลือก"}</span>
                    </div>
                  ) : (
                    <>
                      <div className="w-10 h-10 rounded-full bg-sky-50 text-sky-600 flex items-center justify-center mx-auto mb-2 border border-sky-100">
                        <UploadCloud className="w-5 h-5" />
                      </div>
                      <p className="text-xs sm:text-sm font-bold text-slate-700">คลิกเพื่ออัปโหลด</p>
                      <p className="text-[11px] text-slate-400 mt-0.5">รองรับไฟล์ .jpg, .png (ขนาดไม่เกิน 2MB)</p>
                    </>
                  )}
                </label>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  ชื่อเทศบาล (ภาษาไทย) <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="กรอกชื่อภาษาไทย"
                  value={nameTh}
                  onChange={(e) => setNameTh(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 focus:border-sky-500 focus:bg-white rounded-2xl py-2.5 px-4 text-xs sm:text-sm text-slate-900 outline-none transition-all placeholder:text-slate-400"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  ชื่อเทศบาล (ภาษาอังกฤษ) <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  placeholder="กรอกชื่อภาษาอังกฤษ"
                  value={nameEn}
                  onChange={(e) => setNameEn(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 focus:border-sky-500 focus:bg-white rounded-2xl py-2.5 px-4 text-xs sm:text-sm text-slate-900 outline-none transition-all placeholder:text-slate-400"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  ที่อยู่ติดต่อ (ภาษาไทย) <span className="text-red-500">*</span>
                </label>
                <textarea
                  rows={3}
                  required
                  placeholder="กรอกที่อยู่ภาษาไทย"
                  value={addressTh}
                  onChange={(e) => setAddressTh(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 focus:border-sky-500 focus:bg-white rounded-2xl py-2.5 px-4 text-xs sm:text-sm text-slate-900 outline-none transition-all resize-none placeholder:text-slate-400"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  ที่อยู่ติดต่อ (ภาษาอังกฤษ) <span className="text-red-500">*</span>
                </label>
                <textarea
                  rows={3}
                  placeholder="กรอกที่อยู่ภาษาอังกฤษ"
                  value={addressEn}
                  onChange={(e) => setAddressEn(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 focus:border-sky-500 focus:bg-white rounded-2xl py-2.5 px-4 text-xs sm:text-sm text-slate-900 outline-none transition-all resize-none placeholder:text-slate-400"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  เบอร์ติดต่อ <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="เช่น 0865482544, 0251524587"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 focus:border-sky-500 focus:bg-white rounded-2xl py-2.5 px-4 text-xs sm:text-sm text-slate-900 outline-none transition-all placeholder:text-slate-400"
                />
                <p className="text-[11px] text-slate-400 mt-1">สามารถใส่ได้มากกว่า 1 เบอร์ คั่นด้วยเครื่องหมายจุลภาค (,)</p>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  สถานะเมือง (Status) <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <select
                    value={status}
                    onChange={(e) => setStatus(e.target.value)}
                    className={`w-full rounded-2xl py-2.5 px-4 text-xs sm:text-sm font-semibold outline-none transition-all appearance-none cursor-pointer pr-10 border ${
                      status === "Active"
                        ? "bg-emerald-50/60 border-emerald-500 text-emerald-700 focus:ring-2 focus:ring-emerald-500/20"
                        : "bg-rose-50/60 border-rose-500 text-rose-700 focus:ring-2 focus:ring-rose-500/20"
                    }`}
                  >
                    <option value="Active" className="text-emerald-700 bg-white font-semibold">เปิดใช้งาน</option>
                    <option value="Inactive" className="text-rose-700 bg-white font-semibold">ปิดใช้งาน</option>
                  </select>
                  <div className={`absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-xs ${
                    status === "Active" ? "text-emerald-600" : "text-rose-600"
                  }`}>
                    ▼
                  </div>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  ตำแหน่งที่ตั้ง <span className="text-red-500">*</span>
                </label>
                <div className="bg-slate-100 rounded-2xl overflow-hidden border border-slate-200 relative h-64 flex flex-col justify-between p-3">
                  {/* Search Header */}
                  <div className="relative z-20">
                    <div className="relative">
                      <input
                        type="text"
                        placeholder="ค้นหาสถานที่..."
                        value={mapSearch}
                        onChange={(e) => setMapSearch(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === "Enter") {
                            e.preventDefault();
                            handleSearchLocation();
                          }
                        }}
                        className="w-full bg-white/95 backdrop-blur-md border border-slate-200 rounded-xl py-2 px-3 pl-8 pr-16 text-xs text-slate-800 outline-none shadow-md focus:border-sky-500"
                      />
                      <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
                      <button
                        type="button"
                        onClick={() => handleSearchLocation()}
                        disabled={isSearching}
                        className="absolute right-1.5 top-1/2 -translate-y-1/2 px-2.5 py-1 bg-sky-600 hover:bg-sky-700 text-white rounded-lg text-[11px] font-medium transition-colors flex items-center gap-1 shadow-xs cursor-pointer"
                      >
                        {isSearching ? <Loader2 className="w-3 h-3 animate-spin" /> : "ค้นหา"}
                      </button>
                    </div>

                    {/* Search Dropdown Results */}
                    {searchResults.length > 0 && (
                      <div className="absolute top-full left-0 right-0 mt-1 bg-white rounded-xl border border-slate-200 shadow-xl overflow-hidden z-30 max-h-48 overflow-y-auto">
                        {searchResults.map((item, idx) => (
                          <button
                            key={idx}
                            type="button"
                            onClick={() => handleSelectSearchResult(item)}
                            className="w-full text-left px-3 py-2 text-xs hover:bg-sky-50 text-slate-700 border-b border-slate-100 last:border-0 transition-colors flex items-start gap-2 cursor-pointer"
                          >
                            <MapPin className="w-3.5 h-3.5 text-sky-600 flex-shrink-0 mt-0.5" />
                            <span className="line-clamp-2">{item.display_name}</span>
                          </button>
                        ))}
                      </div>
                    )}

                    {searchError && (
                      <div className="absolute top-full left-0 right-0 mt-1 bg-rose-50 border border-rose-200 text-rose-600 rounded-xl p-2 text-[11px] z-30 shadow-md">
                        {searchError}
                      </div>
                    )}
                  </div>

                  {/* Real Leaflet Map Container */}
                  <div className="absolute inset-0 z-0">
                    <div ref={mapContainerRef} className="w-full h-full" />
                  </div>

                  {/* Zoom Controls */}
                  <div className="flex justify-end gap-2 relative z-10 self-end">
                    <button
                      type="button"
                      onClick={handleZoomIn}
                      className="w-9 h-9 bg-white/95 backdrop-blur-md text-slate-700 hover:text-sky-600 border border-slate-200 rounded-xl text-base font-bold shadow-md hover:bg-white transition-all cursor-pointer flex items-center justify-center select-none"
                    >
                      +
                    </button>
                    <button
                      type="button"
                      onClick={handleZoomOut}
                      className="w-9 h-9 bg-white/95 backdrop-blur-md text-slate-700 hover:text-sky-600 border border-slate-200 rounded-xl text-base font-bold shadow-md hover:bg-white transition-all cursor-pointer flex items-center justify-center select-none"
                    >
                      -
                    </button>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">
                    ละติจูด (Latitude) <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <input
                      type="number"
                      step="any"
                      required
                      value={latitude}
                      onChange={(e) => handleLatitudeChange(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 focus:border-sky-500 focus:bg-white rounded-2xl py-2.5 px-4 pl-9 text-xs sm:text-sm text-slate-900 outline-none transition-all"
                    />
                    <MapPin className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">
                    ลองจิจูด (Longitude) <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <input
                      type="number"
                      step="any"
                      required
                      value={longitude}
                      onChange={(e) => handleLongitudeChange(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 focus:border-sky-500 focus:bg-white rounded-2xl py-2.5 px-4 pl-9 text-xs sm:text-sm text-slate-900 outline-none transition-all"
                    />
                    <MapPin className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  </div>
                  <p className="text-[11px] text-slate-400 mt-1">คลิกหรือลากหมุดบนแผนที่เพื่อเลือกตำแหน่ง หรือกรอกค่าด้วยตัวเอง</p>
                </div>
              </div>
            </div>

            <div className="bg-slate-50/70 rounded-3xl p-5 sm:p-6 border border-slate-200/80 space-y-6">
              <h3 className="text-base sm:text-lg font-bold text-slate-900">โมดูลทั้งหมด</h3>

              <div className="space-y-2.5">
                <h4 className="text-xs font-bold text-slate-500">โมดูลหลัก (พื้นฐาน)</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="bg-white rounded-2xl p-4 border border-slate-200/80 space-y-3.5 shadow-2xs">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2.5 text-xs sm:text-sm font-semibold text-slate-800">
                        <Bed className="w-4 h-4 text-sky-600" />
                        <span>ผู้ป่วยติดเตียง</span>
                      </div>
                      <ToggleSwitch checked={modBedridden} onChange={setModBedridden} />
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2.5 text-xs sm:text-sm font-semibold text-slate-800">
                        <HeartHandshake className="w-4 h-4 text-sky-600" />
                        <span>ผู้สูงอายุและผู้พิการ</span>
                      </div>
                      <ToggleSwitch checked={modElderlyDisabled} onChange={setModElderlyDisabled} />
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2.5 text-xs sm:text-sm font-semibold text-slate-800">
                        <CreditCard className="w-4 h-4 text-sky-600" />
                        <span>จ่ายภาษีออนไลน์</span>
                      </div>
                      <ToggleSwitch checked={modOnlineTax} onChange={setModOnlineTax} />
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2.5 text-xs sm:text-sm font-semibold text-slate-800">
                        <ShieldCheck className="w-4 h-4 text-sky-600" />
                        <span>ยืนยันตัวตน</span>
                      </div>
                      <ToggleSwitch checked={modIdentityVerification} onChange={setModIdentityVerification} />
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2.5 text-xs sm:text-sm font-semibold text-slate-800">
                        <Megaphone className="w-4 h-4 text-sky-600" />
                        <span>ประชาสัมพันธ์</span>
                      </div>
                      <ToggleSwitch checked={modPublicRelations} onChange={setModPublicRelations} />
                    </div>
                  </div>

                  <div className="bg-white rounded-2xl p-4 border border-slate-200/80 space-y-3.5 shadow-2xs">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2.5 text-xs sm:text-sm font-semibold text-slate-800">
                        <Truck className="w-4 h-4 text-sky-600" />
                        <span>ศูนย์ร้องทุกข์ร้องเรียน</span>
                      </div>
                      <ToggleSwitch checked={modComplaintCenter} onChange={setModComplaintCenter} />
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2.5 text-xs sm:text-sm font-semibold text-slate-800">
                        <MessageSquare className="w-4 h-4 text-sky-600" />
                        <span>ร้องทุกข์ร้องเรียน</span>
                      </div>
                      <ToggleSwitch checked={modComplaints} onChange={setModComplaints} />
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2.5 text-xs sm:text-sm font-semibold text-slate-800">
                        <Heart className="w-4 h-4 text-sky-600" />
                        <span>สุขภาพสุนัขและแมว</span>
                      </div>
                      <ToggleSwitch checked={modPetHealth} onChange={setModPetHealth} />
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2.5 text-xs sm:text-sm font-semibold text-slate-800">
                        <Bell className="w-4 h-4 text-sky-600" />
                        <span>การแจ้งเตือน</span>
                      </div>
                      <ToggleSwitch checked={modNotifications} onChange={setModNotifications} />
                    </div>
                  </div>
                </div>
              </div>

              <div className="space-y-2.5">
                <h4 className="text-xs font-bold text-slate-500">โมดูลเลือกระบบ</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="bg-white rounded-2xl p-4 border border-slate-200/80 space-y-3.5 shadow-2xs">
                    {/* Top Row: Icon + Title + Toggle */}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2.5 text-xs sm:text-sm font-semibold text-slate-800">
                        <Trash2 className="w-4 h-4 text-emerald-600" />
                        <span>ค่าธรรมเนียมขยะ</span>
                      </div>
                      <ToggleSwitch checked={modWasteFee} onChange={setModWasteFee} />
                    </div>

                    {/* Bottom Row: System setting box matching ฟ้าฝน UUID style */}
                    <div className="flex items-center border border-slate-200 rounded-xl overflow-hidden bg-slate-50/50">
                      <span className="px-3 py-2 text-xs font-semibold text-slate-500 bg-slate-100 border-r border-slate-200 whitespace-nowrap select-none">
                        ตั้งค่าระบบ
                      </span>
                      <div className="flex-1 flex items-center justify-around px-3 py-1.5 bg-white">
                        <label className="flex items-center gap-1.5 cursor-pointer select-none">
                          <input
                            type="radio"
                            name="wasteSystem"
                            value="old"
                            checked={modWasteFeeSystem === "old"}
                            onChange={() => setModWasteFeeSystem("old")}
                            className="w-4 h-4 text-sky-600 focus:ring-sky-500 cursor-pointer accent-sky-600"
                          />
                          <span className="text-xs font-semibold text-slate-700">ระบบเก่า</span>
                        </label>
                        <label className="flex items-center gap-1.5 cursor-pointer select-none">
                          <input
                            type="radio"
                            name="wasteSystem"
                            value="new"
                            checked={modWasteFeeSystem === "new"}
                            onChange={() => setModWasteFeeSystem("new")}
                            className="w-4 h-4 text-sky-600 focus:ring-sky-500 cursor-pointer accent-sky-600"
                          />
                          <span className="text-xs font-semibold text-slate-700">ระบบใหม่</span>
                        </label>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="space-y-2.5">
                <h4 className="text-xs font-bold text-slate-500">โมดูลเสริม</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="bg-white rounded-2xl p-4 border border-slate-200/80 space-y-3.5 shadow-2xs">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2.5 text-xs sm:text-sm font-semibold text-slate-800">
                        <Camera className="w-4 h-4 text-sky-600" />
                        <span>กล้องวงจรปิด</span>
                      </div>
                      <ToggleSwitch checked={modCctv} onChange={setModCctv} />
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2.5 text-xs sm:text-sm font-semibold text-slate-800">
                        <Waves className="w-4 h-4 text-sky-600" />
                        <span>ข้อมูลระดับน้ำ</span>
                      </div>
                      <ToggleSwitch checked={modWaterLevel} onChange={setModWaterLevel} />
                    </div>
                  </div>

                  <div className="bg-white rounded-2xl p-4 border border-slate-200/80 space-y-3.5 shadow-2xs">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2.5 text-xs sm:text-sm font-semibold text-slate-800">
                        <CloudRain className="w-4 h-4 text-sky-600" />
                        <span>ฟ้าฝน</span>
                      </div>
                      <ToggleSwitch checked={modFahFon} onChange={setModFahFon} />
                    </div>

                    <div className="flex items-center border border-slate-200 rounded-xl overflow-hidden bg-slate-50/50">
                      <span className="px-3 py-2 text-xs font-semibold text-slate-500 bg-slate-100 border-r border-slate-200 whitespace-nowrap select-none">
                        UUID
                      </span>
                      <input
                        type="text"
                        placeholder="กรอก UUID (Optional)"
                        value={modFahFonUuid}
                        onChange={(e) => setModFahFonUuid(e.target.value)}
                        className="w-full bg-white py-1.5 px-3 text-xs text-slate-900 outline-none placeholder:text-slate-400"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Fixed Modal Footer Bar */}
          <div className="p-4 sm:px-8 sm:py-5 border-t border-slate-100 bg-white flex items-center justify-end gap-3 shrink-0 z-20">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs sm:text-sm font-semibold transition-all cursor-pointer"
            >
              ยกเลิก
            </button>
            <button
              type="submit"
              disabled={saving}
              className="px-6 py-2.5 bg-sky-600 hover:bg-sky-500 active:bg-sky-700 text-white rounded-xl text-xs sm:text-sm font-semibold shadow-md shadow-sky-600/20 transition-all flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
            >
              {saving ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>กำลังบันทึก...</span>
                </>
              ) : mode === "create" ? (
                <>
                  <Plus className="w-4 h-4" />
                  <span>สร้างเมือง</span>
                </>
              ) : (
                <span>บันทึกการเปลี่ยนแปลง</span>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
