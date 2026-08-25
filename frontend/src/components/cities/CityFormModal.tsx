"use client";

import React, { useState, useEffect, useRef } from "react";
import Image from "next/image";
import type * as L from "leaflet";
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
  CloudRain,
  Layers,
  Building2,
  CheckCircle2,
  Landmark,
  User,
  Lock,
  Eye,
  EyeOff
} from "lucide-react";
import { City, ModuleStatus } from "@/hooks/useCities";
import { api } from "@/lib/api";
import { resolveImageUrl } from "@/lib/image";

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
        checked ? "bg-brand-primary" : "bg-slate-300"
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

function getDynamicModuleIcon(nameTh: string = "", code: string = "") {
  const text = (nameTh + " " + code).toLowerCase();
  if (text.includes("ติดเตียง") || text.includes("bedridden")) return Bed;
  if (text.includes("สูงอายุ") || text.includes("elderly") || text.includes("พิการ") || text.includes("disabled")) return HeartHandshake;
  if (text.includes("ภาษี") || text.includes("tax")) return CreditCard;
  if (text.includes("ยืนยัน") || text.includes("verify")) return ShieldCheck;
  if (text.includes("ประชาสัมพันธ์") || text.includes("public")) return Megaphone;
  if (text.includes("ศูนย์ร้องทุกข์") || text.includes("complaint center")) return Truck;
  if (text.includes("ร้องทุกข์") || text.includes("complaint")) return MessageSquare;
  if (text.includes("สุนัข") || text.includes("แมว") || text.includes("pet")) return Heart;
  if (text.includes("แจ้งเตือน") || text.includes("notification") || text.includes("alert")) return Bell;
  if (text.includes("ขยะ") || text.includes("waste")) return Trash2;
  if (text.includes("กล้อง") || text.includes("cctv")) return Camera;
  if (text.includes("ระดับน้ำ") || text.includes("river") || text.includes("water")) return Waves;
  if (text.includes("ฟ้าฝน") || text.includes("weather") || text.includes("fahfon")) return CloudRain;
  if (text.includes("จัดการเมือง") || text.includes("back office")) return Building2;
  return Layers;
}



function CityFormModalContent({
  onClose,
  mode,
  cityData,
  onSave,
}: Omit<CityFormModalProps, "isOpen">) {

  const isEdit = mode === "edit" && !!cityData;

  const [logoPreview, setLogoPreview] = useState<string>(() => {
    if (!isEdit || !cityData?.logo_url) {
      return "";
    }
    if (cityData.logo_url.startsWith("blob:") || cityData.logo_url.startsWith("data:")) {
      return "";
    }
    return cityData.logo_url;
  });
  const [logoAssetId, setLogoAssetId] = useState<string>(() => {
    if (
      !isEdit ||
      !cityData?.logo_url ||
      cityData.logo_url.startsWith("blob:") ||
      cityData.logo_url.startsWith("data:")
    ) {
      return "";
    }
    return cityData.logo_url;
  });
  const [uploadingLogo, setUploadingLogo] = useState(false);

  const [nameTh, setNameTh] = useState(() => (isEdit ? cityData.name_th || "" : ""));
  const [nameEn, setNameEn] = useState(() => (isEdit ? cityData.name_en || "" : ""));
  const [addressTh, setAddressTh] = useState(() => (isEdit ? cityData.address_th || "" : ""));
  const [addressEn, setAddressEn] = useState(() => (isEdit ? cityData.address_en || "" : ""));
  const [phone, setPhone] = useState(() => (isEdit ? cityData.phone || "" : ""));
  const [status, setStatus] = useState(() =>
    isEdit
      ? cityData.status === "ไม่ใช้งาน" || cityData.status === "Inactive"
        ? "Inactive"
        : "Active"
      : "Active"
  );
  const initialLat = isEdit ? cityData.latitude || 13.7563 : 13.7563;
  const initialLng = isEdit ? cityData.longitude || 100.5018 : 100.5018;

  const [latitude, setLatitude] = useState<number>(initialLat);
  const [longitude, setLongitude] = useState<number>(initialLng);

  const mapContainerRef = useRef<HTMLDivElement | null>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const markerRef = useRef<L.Marker | null>(null);

  const [mapSearch, setMapSearch] = useState("");
  const [searchResults, setSearchResults] = useState<Array<{ display_name: string; lat: string; lon: string }>>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [searchError, setSearchError] = useState("");

  const [dynamicModules, setDynamicModules] = useState<ModuleStatus[]>([]);
  const [loadingModules, setLoadingModules] = useState(true);
  const [modWasteFeeSystem, setModWasteFeeSystem] = useState<"old" | "new">("old");
  const [modFahFonUuid, setModFahFonUuid] = useState("");

  // Bank Details state (pre-filled from cityData in edit mode)
  const [bankName, setBankName] = useState(() => isEdit ? cityData?.bank_name || "" : "");
  const [bankAccountNumber, setBankAccountNumber] = useState(() => isEdit ? cityData?.bank_account_number || "" : "");
  const [bankAccountName, setBankAccountName] = useState(() => isEdit ? cityData?.bank_account_name || "" : "");
  const [bankBranch, setBankBranch] = useState(() => isEdit ? cityData?.bank_branch || "" : "");
  const [bankType, setBankType] = useState(() => isEdit ? cityData?.bank_type || "ออมทรัพย์" : "ออมทรัพย์");

  // Local Admin Account state (pre-filled from cityData in edit mode)
  const [adminName, setAdminName] = useState(() => isEdit ? cityData?.admin_name || "" : "");
  const [adminLastName, setAdminLastName] = useState(() => isEdit ? cityData?.admin_last_name || "" : "");
  const [adminEmail, setAdminEmail] = useState(() => isEdit ? cityData?.admin_email || "" : "");
  const [adminPhone, setAdminPhone] = useState(() => isEdit ? cityData?.admin_phone || "" : "");
  const [adminPassword, setAdminPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState("");

  useEffect(() => {
    if (cityData && isEdit) {
      if (cityData.logo_url) {
        setLogoPreview(cityData.logo_url);
      }
      if (cityData.name_th) setNameTh(cityData.name_th);
      if (cityData.name_en) setNameEn(cityData.name_en);
      if (cityData.address_th) setAddressTh(cityData.address_th);
      if (cityData.address_en) setAddressEn(cityData.address_en);
      if (cityData.phone) setPhone(cityData.phone);
      if (cityData.bank_name) setBankName(cityData.bank_name);
      if (cityData.bank_account_number) setBankAccountNumber(cityData.bank_account_number);
      if (cityData.bank_account_name) setBankAccountName(cityData.bank_account_name);
      if (cityData.bank_branch) setBankBranch(cityData.bank_branch);
      if (cityData.bank_type) setBankType(cityData.bank_type);
      if (cityData.admin_name) setAdminName(cityData.admin_name);
      if (cityData.admin_last_name) setAdminLastName(cityData.admin_last_name);
      if (cityData.admin_email) setAdminEmail(cityData.admin_email);
      if (cityData.admin_phone) setAdminPhone(cityData.admin_phone);
    }
  }, [cityData, isEdit]);

  useEffect(() => {
    async function loadBackendModules() {
      setLoadingModules(true);
      try {
        if (isEdit && cityData?.id) {
          const res = await api.get(`/cities/${cityData.id}/modules`);
          if (res.data && Array.isArray(res.data)) {
            setDynamicModules(res.data);
          }
        } else {
          const res = await api.get("/modules");
          if (res.data && Array.isArray(res.data)) {
            setDynamicModules(res.data);
          }
        }
      } catch {
        // Handled gracefully
      } finally {
        setLoadingModules(false);
      }
    }
    loadBackendModules();
  }, [isEdit, cityData?.id]);

  const handleToggleModule = (moduleId: string) => {
    setDynamicModules((prev) =>
      prev.map((mod) =>
        mod.module_id === moduleId ? { ...mod, is_active: !mod.is_active } : mod
      )
    );
  };

  useEffect(() => {
    let isMounted = true;

    async function initMap() {
      if (!mapContainerRef.current) return;

      const leafletModule = await import("leaflet");
      const Leaflet = leafletModule.default;
      if (!isMounted || !mapContainerRef.current) return;

      const map = Leaflet.map(mapContainerRef.current, {
        center: [initialLat, initialLng],
        zoom: 13,
        zoomControl: false,
        attributionControl: false,
      });

      Leaflet.tileLayer(
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
            <path d="M12 0C5.37 0 0 5.37 0 12C0 21 12 32 12 32C12 32 24 21 24 12C24 5.37 18.63 0 12 0ZM12 16C9.79 16 8 14.21 8 12C8 9.79 9.79 8 12 8C14.21 8 16 9.79 16 12C16 14.21 14.21 16 12 16Z" fill="#210e79"/>
          </svg>
        </div>
      `;

      const customIcon = Leaflet.divIcon({
        html: customHtml,
        className: "custom-modal-pin-icon",
        iconSize: [28, 36],
        iconAnchor: [14, 36],
      });

      const marker = Leaflet.marker([initialLat, initialLng], {
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

      map.on("click", (e: L.LeafletMouseEvent) => {
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
  }, [initialLat, initialLng]);

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
      const data = (await res.json()) as Array<{ display_name: string; lat: string; lon: string }>;
      if (Array.isArray(data) && data.length > 0) {
        setSearchResults(data);
      } else {
        const globalRes = await fetch(
          `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(
            mapSearch
          )}&limit=5`
        );
        const globalData = (await globalRes.json()) as Array<{ display_name: string; lat: string; lon: string }>;
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

  const handleLogoChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      // Local preview immediately
      const reader = new FileReader();
      reader.onloadend = () => {
        if (typeof reader.result === "string") {
          setLogoPreview(reader.result);
        }
      };
      reader.readAsDataURL(file);

      // Upload to MinIO/S3 FileRecords via backend /assets/upload
      const formData = new FormData();
      formData.append("file", file);
      formData.append("zone", "public");
      formData.append("path", "logo-municipality");
      if (isEdit && cityData?.id) {
        formData.append("municipalityId", cityData.id);
      }

      try {
        setUploadingLogo(true);
        const res = await api.post("/assets/upload", formData, {
          headers: { "Content-Type": "multipart/form-data" },
        });
        if (res.data?.id) {
          setLogoAssetId(res.data.id);
        }
      } catch (err) {
        console.error("Asset upload error", err);
        setFormError("เกิดข้อผิดพลาดในการอัปโหลดรูปภาพขึ้นระบบ S3");
      } finally {
        setUploadingLogo(false);
      }
    }
  };


  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (uploadingLogo) {
      setFormError("ระบบกำลังอัปโหลดโลโก้ขึ้นคลาวด์ กรุณารอสักครู่...");
      return;
    }
    if (!logoPreview && !logoAssetId) {
      setFormError("กรุณาอัปโหลดโลโก้เทศบาล");
      return;
    }
    if (!nameTh.trim()) {
      setFormError("กรุณากรอกชื่อเทศบาล (ภาษาไทย)");
      return;
    }
    if (!nameEn.trim()) {
      setFormError("กรุณากรอกชื่อเทศบาล (ภาษาอังกฤษ)");
      return;
    }
    if (!addressTh.trim()) {
      setFormError("กรุณากรอกที่อยู่ติดต่อ (ภาษาไทย)");
      return;
    }
    if (!addressEn.trim()) {
      setFormError("กรุณากรอกที่อยู่ติดต่อ (ภาษาอังกฤษ)");
      return;
    }
    if (!phone.trim()) {
      setFormError("กรุณากรอกเบอร์ติดต่อ");
      return;
    }
    if (!status) {
      setFormError("กรุณาเลือกสถานะเมือง");
      return;
    }
    if (latitude === undefined || latitude === null || isNaN(Number(latitude))) {
      setFormError("กรุณาระบุพิกัดละติจูด (Latitude)");
      return;
    }
    if (longitude === undefined || longitude === null || isNaN(Number(longitude))) {
      setFormError("กรุณาระบุพิกัดลองจิจูด (Longitude)");
      return;
    }
    setFormError("");
    setSaving(true);

    try {
      const selectedModuleIds = dynamicModules
        .filter((m) => m.is_active)
        .map((m) => m.module_id);

      const finalLogoUrl =
        logoAssetId ||
        (logoPreview &&
        !logoPreview.startsWith("data:") &&
        !logoPreview.startsWith("blob:")
          ? logoPreview
          : undefined);

      const success = await onSave({
        name_th: nameTh,
        name_en: nameEn,
        address_th: addressTh,
        address_en: addressEn,
        phone: phone,
        status: status === "Active" ? "Active" : "Inactive",
        latitude: Number(latitude),
        longitude: Number(longitude),
        logo_url: finalLogoUrl,
        selected_module_ids: selectedModuleIds,
        // Bank Details
        bank_name: bankName,
        bank_account_number: bankAccountNumber,
        bank_account_name: bankAccountName,
        bank_branch: bankBranch,
        bank_type: bankType,
        // Local Admin Account
        admin_name: adminName,
        admin_last_name: adminLastName,
        admin_email: adminEmail,
        admin_phone: adminPhone,
        admin_password: adminPassword,
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

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                อัปโหลดโลโก้เทศบาล <span className="text-red-500">*</span>
              </label>
              {logoPreview ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="border border-slate-200 bg-slate-50/80 rounded-2xl p-3 flex flex-col items-center justify-center h-28 relative">
                    <Image 
                      src={resolveImageUrl(logoPreview)} 
                      alt="Logo Preview" 
                      width={80} 
                      height={80} 
                      unoptimized 
                      className="max-h-20 object-contain rounded-lg" 
                    />
                  </div>

                  <label className="border-2 border-dashed border-slate-200 hover:border-brand-primary bg-slate-50/50 hover:bg-brand-light/30 rounded-2xl p-3 flex flex-col items-center justify-center text-center transition-all cursor-pointer h-28 block">
                    <input type="file" accept="image/*" className="hidden" disabled={uploadingLogo} onChange={handleLogoChange} />
                    <div className="w-8 h-8 rounded-full bg-brand-light text-brand-primary flex items-center justify-center mb-1 border border-brand-primary/20 shrink-0">
                      {uploadingLogo ? <Loader2 className="w-4 h-4 animate-spin text-brand-primary" /> : <UploadCloud className="w-4 h-4" />}
                    </div>
                    <p className="text-xs font-bold text-slate-800 leading-none">
                      {uploadingLogo ? "กำลังอัปโหลด..." : "เปลี่ยนโลโก้"}
                    </p>
                    <p className="text-[11px] text-slate-400 mt-1.5 leading-tight">
                      รองรับไฟล์ .jpg, .png<br />
                      (ขนาดไม่เกิน 2MB)
                    </p>
                  </label>
                </div>
              ) : (
                <label className="border-2 border-dashed border-slate-200 hover:border-brand-primary bg-slate-50/50 hover:bg-brand-light/30 rounded-2xl p-4 text-center transition-all cursor-pointer block h-28 flex flex-col items-center justify-center">
                  <input type="file" accept="image/*" className="hidden" disabled={uploadingLogo} onChange={handleLogoChange} />
                  <div className="w-8 h-8 rounded-full bg-brand-light text-brand-primary flex items-center justify-center mb-1 border border-brand-primary/20 shrink-0">
                    {uploadingLogo ? <Loader2 className="w-4 h-4 animate-spin text-brand-primary" /> : <UploadCloud className="w-4 h-4" />}
                  </div>
                  <p className="text-xs sm:text-sm font-bold text-slate-700 leading-none">
                    {uploadingLogo ? "กำลังอัปโหลด..." : "คลิกเพื่ออัปโหลด"}
                  </p>
                  <p className="text-[11px] text-slate-400 mt-1.5 leading-tight">
                    รองรับไฟล์ .jpg, .png<br />
                    (ขนาดไม่เกิน 2MB)
                  </p>
                </label>
              )}
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
                  className="w-full bg-slate-50 border border-slate-200 focus:border-brand-primary focus:bg-white rounded-2xl py-2.5 px-4 text-xs sm:text-sm text-slate-900 outline-none transition-all placeholder:text-slate-400"
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
                  className="w-full bg-slate-50 border border-slate-200 focus:border-brand-primary focus:bg-white rounded-2xl py-2.5 px-4 text-xs sm:text-sm text-slate-900 outline-none transition-all placeholder:text-slate-400"
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
                  className="w-full bg-slate-50 border border-slate-200 focus:border-brand-primary focus:bg-white rounded-2xl py-2.5 px-4 text-xs sm:text-sm text-slate-900 outline-none transition-all resize-none placeholder:text-slate-400"
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
                  className="w-full bg-slate-50 border border-slate-200 focus:border-brand-primary focus:bg-white rounded-2xl py-2.5 px-4 text-xs sm:text-sm text-slate-900 outline-none transition-all resize-none placeholder:text-slate-400"
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
                  className="w-full bg-slate-50 border border-slate-200 focus:border-brand-primary focus:bg-white rounded-2xl py-2.5 px-4 text-xs sm:text-sm text-slate-900 outline-none transition-all placeholder:text-slate-400"
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
                        className="w-full bg-white/95 backdrop-blur-md border border-slate-200 rounded-xl py-2 px-3 pl-8 pr-16 text-xs text-slate-800 outline-none shadow-md focus:border-brand-primary"
                      />
                      <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
                      <button
                        type="button"
                        onClick={() => handleSearchLocation()}
                        disabled={isSearching}
                        className="absolute right-1.5 top-1/2 -translate-y-1/2 px-2.5 py-1 bg-brand-primary hover:bg-brand-hover text-white rounded-lg text-[11px] font-medium transition-colors flex items-center gap-1 shadow-xs cursor-pointer"
                      >
                        {isSearching ? <Loader2 className="w-3 h-3 animate-spin" /> : "ค้นหา"}
                      </button>
                    </div>

                    {searchResults.length > 0 && (
                      <div className="absolute top-full left-0 right-0 mt-1 bg-white rounded-xl border border-slate-200 shadow-xl overflow-hidden z-30 max-h-48 overflow-y-auto">
                        {searchResults.map((item, idx) => (
                          <button
                            key={idx}
                            type="button"
                            onClick={() => handleSelectSearchResult(item)}
                            className="w-full text-left px-3 py-2 text-xs hover:bg-brand-light text-slate-700 border-b border-slate-100 last:border-0 transition-colors flex items-start gap-2 cursor-pointer"
                          >
                            <MapPin className="w-3.5 h-3.5 text-brand-primary flex-shrink-0 mt-0.5" />
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

                  <div className="absolute inset-0 z-0">
                    <div ref={mapContainerRef} className="w-full h-full" />
                  </div>

                  <div className="flex justify-end gap-2 relative z-10 self-end">
                    <button
                      type="button"
                      onClick={handleZoomIn}
                      className="w-9 h-9 bg-white/95 backdrop-blur-md text-slate-700 hover:text-brand-primary border border-slate-200 rounded-xl text-base font-bold shadow-md hover:bg-white transition-all cursor-pointer flex items-center justify-center select-none"
                    >
                      +
                    </button>
                    <button
                      type="button"
                      onClick={handleZoomOut}
                      className="w-9 h-9 bg-white/95 backdrop-blur-md text-slate-700 hover:text-brand-primary border border-slate-200 rounded-xl text-base font-bold shadow-md hover:bg-white transition-all cursor-pointer flex items-center justify-center select-none"
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
                      className="w-full bg-slate-50 border border-slate-200 focus:border-brand-primary focus:bg-white rounded-2xl py-2.5 px-4 pl-9 text-xs sm:text-sm text-slate-900 outline-none transition-all"
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
                      className="w-full bg-slate-50 border border-slate-200 focus:border-brand-primary focus:bg-white rounded-2xl py-2.5 px-4 pl-9 text-xs sm:text-sm text-slate-900 outline-none transition-all"
                    />
                    <MapPin className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  </div>
                  <p className="text-[11px] text-slate-400 mt-1">คลิกหรือลากหมุดบนแผนที่เพื่อเลือกตำแหน่ง หรือกรอกค่าด้วยตัวเอง</p>
                </div>
              </div>
            </div>

            {/* Bank Details Section */}
            <div className="bg-slate-50/70 rounded-3xl p-5 sm:p-6 border border-slate-200/80 space-y-5">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-emerald-50 text-emerald-600 rounded-xl border border-emerald-100">
                    <Landmark className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-slate-900">ข้อมูลบัญชีธนาคาร</h3>
                    <p className="text-xs text-slate-500 mt-0.5">สำหรับรับชำระค่าธรรมเนียมและบริการของเทศบาล (ถ้ามี)</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1.5">ชื่อธนาคาร</label>
                    <input
                      type="text"
                      placeholder="เช่น ธนาคารกรุงไทย (KTB)"
                      value={bankName}
                      onChange={(e) => setBankName(e.target.value)}
                      className="w-full bg-white border border-slate-200 focus:border-emerald-400 focus:bg-white rounded-2xl py-2.5 px-4 text-xs sm:text-sm text-slate-900 outline-none transition-all placeholder:text-slate-400"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1.5">เลขที่บัญชี</label>
                    <input
                      type="text"
                      placeholder="เช่น 999-9-99999-9"
                      value={bankAccountNumber}
                      onChange={(e) => setBankAccountNumber(e.target.value)}
                      className="w-full bg-white border border-slate-200 focus:border-emerald-400 focus:bg-white rounded-2xl py-2.5 px-4 text-xs sm:text-sm text-slate-900 outline-none transition-all placeholder:text-slate-400"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1.5">ชื่อบัญชี</label>
                    <input
                      type="text"
                      placeholder="เช่น เทศบาลตำบลศาลาแดง"
                      value={bankAccountName}
                      onChange={(e) => setBankAccountName(e.target.value)}
                      className="w-full bg-white border border-slate-200 focus:border-emerald-400 focus:bg-white rounded-2xl py-2.5 px-4 text-xs sm:text-sm text-slate-900 outline-none transition-all placeholder:text-slate-400"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1.5">สาขา</label>
                    <input
                      type="text"
                      placeholder="เช่น สาขาฉะเชิงเทรา"
                      value={bankBranch}
                      onChange={(e) => setBankBranch(e.target.value)}
                      className="w-full bg-white border border-slate-200 focus:border-emerald-400 focus:bg-white rounded-2xl py-2.5 px-4 text-xs sm:text-sm text-slate-900 outline-none transition-all placeholder:text-slate-400"
                    />
                  </div>
                </div>

                <div className="max-w-xs">
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">ประเภทบัญชี</label>
                  <select
                    value={bankType}
                    onChange={(e) => setBankType(e.target.value)}
                    className="w-full bg-white border border-slate-200 focus:border-emerald-400 rounded-2xl py-2.5 px-4 text-xs sm:text-sm text-slate-900 outline-none transition-all appearance-none cursor-pointer"
                  >
                    <option value="ออมทรัพย์">ออมทรัพย์</option>
                    <option value="กระแสรายวัน">กระแสรายวัน</option>
                    <option value="ฝากประจำ">ฝากประจำ</option>
                  </select>
                </div>
              </div>

            {/* Local Admin Account Section */}
            <div className="bg-slate-50/70 rounded-3xl p-5 sm:p-6 border border-slate-200/80 space-y-5">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-violet-50 text-violet-600 rounded-xl border border-violet-100">
                    <User className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-slate-900">บัญชีผู้ดูแลระบบเทศบาล</h3>
                    <p className="text-xs text-slate-500 mt-0.5">บัญชี SuperAdmin เริ่มต้นสำหรับจัดการเมืองนี้ในแอปพลิเคชัน (ถ้ามี)</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1.5">ชื่อ</label>
                    <input
                      type="text"
                      placeholder="เช่น สมชาย"
                      value={adminName}
                      onChange={(e) => setAdminName(e.target.value)}
                      className="w-full bg-white border border-slate-200 focus:border-violet-400 focus:bg-white rounded-2xl py-2.5 px-4 text-xs sm:text-sm text-slate-900 outline-none transition-all placeholder:text-slate-400"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1.5">นามสกุล</label>
                    <input
                      type="text"
                      placeholder="เช่น ใจดี"
                      value={adminLastName}
                      onChange={(e) => setAdminLastName(e.target.value)}
                      className="w-full bg-white border border-slate-200 focus:border-violet-400 focus:bg-white rounded-2xl py-2.5 px-4 text-xs sm:text-sm text-slate-900 outline-none transition-all placeholder:text-slate-400"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1.5">อีเมล</label>
                    <input
                      type="email"
                      placeholder="เช่น admin@fahfon.info"
                      value={adminEmail}
                      onChange={(e) => setAdminEmail(e.target.value)}
                      className="w-full bg-white border border-slate-200 focus:border-violet-400 focus:bg-white rounded-2xl py-2.5 px-4 text-xs sm:text-sm text-slate-900 outline-none transition-all placeholder:text-slate-400"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1.5">เบอร์โทรศัพท์</label>
                    <input
                      type="text"
                      placeholder="เช่น 0812345678"
                      value={adminPhone}
                      onChange={(e) => setAdminPhone(e.target.value)}
                      className="w-full bg-white border border-slate-200 focus:border-violet-400 focus:bg-white rounded-2xl py-2.5 px-4 text-xs sm:text-sm text-slate-900 outline-none transition-all placeholder:text-slate-400"
                    />
                  </div>
                </div>

                <div className="max-w-sm">
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">
                    {isEdit ? "เปลี่ยนรหัสผ่าน" : "รหัสผ่านเริ่มต้น"}
                    <span className="ml-1.5 font-normal text-slate-400">
                      {isEdit ? "(ปล่อยว่างเพื่อคงรหัสผ่านเดิม)" : "(ปล่อยว่างเพื่อใช้รหัสอัตโนมัติ)"}
                    </span>
                  </label>
                  <div className="relative">
                    <input
                      type={showPassword ? "text" : "password"}
                      placeholder={isEdit ? "กรอกรหัสผ่านใหม่" : "ตั้งรหัสผ่านเริ่มต้น"}
                      value={adminPassword}
                      onChange={(e) => setAdminPassword(e.target.value)}
                      className="w-full bg-white border border-slate-200 focus:border-violet-400 focus:bg-white rounded-2xl py-2.5 px-4 pr-10 text-xs sm:text-sm text-slate-900 outline-none transition-all placeholder:text-slate-400"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword((p) => !p)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                  <p className="text-[11px] text-slate-400 mt-1">
                    <Lock className="w-3 h-3 inline mr-0.5 mb-0.5" />
                    รหัสผ่านจะถูก Hash ด้วย bcrypt ก่อนบันทึกลงฐานข้อมูล
                  </p>
                </div>
              </div>


            <div className="bg-slate-50/70 rounded-3xl p-5 sm:p-6 border border-slate-200/80 space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-base sm:text-lg font-bold text-slate-900">โมดูลทั้งหมด</h3>
                  <p className="text-xs text-slate-500 mt-0.5">เลือกเปิด/ปิดโมดูลการทำงานสำหรับเทศบาลนี้ (เชื่อมต่อสดจากระบบ)</p>
                </div>
                {loadingModules && (
                  <div className="flex items-center gap-2 text-xs font-semibold text-brand-primary bg-brand-primary/10 px-3 py-1.5 rounded-full">
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    <span>กำลังโหลดโมดูล...</span>
                  </div>
                )}
              </div>

              {dynamicModules.length === 0 && !loadingModules ? (
                <div className="text-center py-6 text-xs text-slate-400">ไม่พบรายการโมดูลในระบบ</div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {dynamicModules.map((mod) => {
                    const IconComp = getDynamicModuleIcon(mod.name_th, mod.code);
                    const isWasteModule = mod.name_th.includes("ขยะ") || mod.code.includes("WASTE");
                    const isFahFonModule = mod.name_th.includes("ฟ้าฝน") || mod.code.includes("FAHFON");

                    return (
                      <div
                        key={mod.module_id}
                        className={`bg-white rounded-2xl p-4 border transition-all shadow-2xs space-y-3.5 ${
                          mod.is_active ? "border-brand-primary/40 shadow-sm" : "border-slate-200/80 opacity-75"
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2.5 text-xs sm:text-sm font-semibold text-slate-800">
                            <div className={`p-2 rounded-xl ${mod.is_active ? "bg-brand-primary/10 text-brand-primary" : "bg-slate-100 text-slate-400"}`}>
                              <IconComp className="w-4 h-4" />
                            </div>
                            <div>
                              <div className="flex items-center gap-1.5">
                                <span>{mod.name_th}</span>
                                {mod.is_active && <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0" />}
                              </div>
                              {mod.name_en && <p className="text-[10px] text-slate-400 font-normal">{mod.name_en}</p>}
                            </div>
                          </div>
                          <ToggleSwitch checked={mod.is_active} onChange={() => handleToggleModule(mod.module_id)} />
                        </div>

                        {/* Configurable sub-options if applicable */}
                        {isWasteModule && mod.is_active && (
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
                                  className="w-4 h-4 text-brand-primary accent-brand-primary cursor-pointer rounded-full outline-none focus:outline-none focus:ring-0 focus:ring-offset-0"
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
                                  className="w-4 h-4 text-brand-primary accent-brand-primary cursor-pointer rounded-full outline-none focus:outline-none focus:ring-0 focus:ring-offset-0"
                                />
                                <span className="text-xs font-semibold text-slate-700">ระบบใหม่</span>
                              </label>
                            </div>
                          </div>
                        )}

                        {isFahFonModule && mod.is_active && (
                          <div className="flex items-center border border-slate-200 focus-within:border-brand-primary focus-within:ring-3 focus-within:ring-brand-primary/15 rounded-xl overflow-hidden bg-slate-50/50 transition-all">
                            <span className="px-3 py-2 text-xs font-semibold text-slate-500 bg-slate-100 border-r border-slate-200 whitespace-nowrap select-none shrink-0">
                              UUID
                            </span>
                            <input
                              type="text"
                              placeholder="กรอก UUID ฟ้าฝน (Optional)"
                              value={modFahFonUuid}
                              onChange={(e) => setModFahFonUuid(e.target.value)}
                              className="w-full bg-white py-1.5 px-3 text-xs text-slate-900 outline-none focus:outline-none focus:ring-0 focus:border-transparent placeholder:text-slate-400"
                            />
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>

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
              className="px-6 py-2.5 bg-brand-primary hover:bg-brand-hover active:bg-brand-hover text-white rounded-xl text-xs sm:text-sm font-semibold shadow-md shadow-brand-primary/20 transition-all flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
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

export function CityFormModal(props: CityFormModalProps) {
  if (!props.isOpen) return null;
  return (
    <CityFormModalContent
      key={`${props.mode}-${props.cityData?.id || "new"}-${props.cityData?.logo_url || ""}`}
      onClose={props.onClose}
      mode={props.mode}
      cityData={props.cityData}
      onSave={props.onSave}
    />
  );
}
