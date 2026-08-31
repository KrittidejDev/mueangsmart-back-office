"use client";

import React from "react";
import { GisPoint } from "@/hooks/useGisMap";
import {
  X,
  MapPin,
  Building2,
  Calendar,
  Phone,
  AlertTriangle,
  Users,
  HeartPulse,
  Camera,
  PawPrint,
  CheckCircle,
  Clock,
  Wrench,
  LifeBuoy,
  Activity,
  Syringe,
  Trash2,
  Truck,
  Video,
  ExternalLink,
} from "lucide-react";

interface GisPointModalProps {
  point: GisPoint | null;
  onClose: () => void;
}

export const GisPointModal: React.FC<GisPointModalProps> = ({ point, onClose }) => {
  if (!point) return null;

  const getLayerMeta = (type: string) => {
    switch (type) {
      case "complaint":
        return {
          icon: AlertTriangle,
          label: "เรื่องร้องทุกข์ร้องเรียน",
          bgColor: "bg-red-50 text-red-700 border-red-200",
          iconColor: "text-red-600",
        };
      case "complaint_activity":
        return {
          icon: Wrench,
          label: "จุดลงพื้นที่แก้ไขเรื่องร้องทุกข์",
          bgColor: "bg-orange-50 text-orange-700 border-orange-200",
          iconColor: "text-orange-600",
        };
      case "elderly":
        return {
          icon: Users,
          label: "ผู้สูงอายุ / ผู้พิการ",
          bgColor: "bg-blue-50 text-blue-700 border-blue-200",
          iconColor: "text-blue-600",
        };
      case "elderly_assistance":
        return {
          icon: LifeBuoy,
          label: "คำร้องขอความช่วยเหลือผู้สูงอายุ",
          bgColor: "bg-sky-50 text-sky-700 border-sky-200",
          iconColor: "text-sky-600",
        };
      case "bedridden":
        return {
          icon: HeartPulse,
          label: "ผู้ป่วยติดเตียง",
          bgColor: "bg-purple-50 text-purple-700 border-purple-200",
          iconColor: "text-purple-600",
        };
      case "bedridden_assistance":
        return {
          icon: Activity,
          label: "คำร้องขอความช่วยเหลือผู้ป่วยติดเตียง",
          bgColor: "bg-violet-50 text-violet-700 border-violet-200",
          iconColor: "text-violet-600",
        };
      case "cctv":
        return {
          icon: Camera,
          label: "กล้องวงจรปิด CCTV",
          bgColor: "bg-emerald-50 text-emerald-700 border-emerald-200",
          iconColor: "text-emerald-600",
        };
      case "pet":
        return {
          icon: PawPrint,
          label: "สัตว์เลี้ยง (สุนัข/แมว)",
          bgColor: "bg-amber-50 text-amber-700 border-amber-200",
          iconColor: "text-amber-600",
        };
      case "pet_service":
        return {
          icon: Syringe,
          label: "จุดบริการ/ฉีดวัคซีนสัตว์เลี้ยง",
          bgColor: "bg-amber-100 text-amber-800 border-amber-300",
          iconColor: "text-amber-700",
        };
      case "waste_fee":
        return {
          icon: Trash2,
          label: "จุดจัดเก็บค่าธรรมเนียมขยะ",
          bgColor: "bg-teal-50 text-teal-700 border-teal-200",
          iconColor: "text-teal-600",
        };
      case "municipality":
        return {
          icon: Building2,
          label: "สำนักงานเทศบาล",
          bgColor: "bg-indigo-50 text-indigo-700 border-indigo-200",
          iconColor: "text-indigo-600",
        };
      default:
        return {
          icon: MapPin,
          label: "พิกัดข้อมูล",
          bgColor: "bg-slate-50 text-slate-700 border-slate-200",
          iconColor: "text-slate-600",
        };
    }
  };

  const meta = getLayerMeta(point.layer_type);
  const IconComponent = meta.icon;

  return (
    <div className="absolute bottom-6 right-6 z-[850] w-96 max-w-[calc(100vw-3rem)] animate-in fade-in slide-in-from-bottom-4 duration-200">
      <div className="bg-white/95 backdrop-blur-md rounded-2xl border border-slate-200/80 shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="p-4 border-b border-slate-100 flex items-start justify-between gap-3 bg-gradient-to-r from-slate-50/80 to-white">
          <div className="flex items-center gap-2.5">
            <div className={`w-9 h-9 rounded-xl border flex items-center justify-center ${meta.bgColor}`}>
              <IconComponent size={18} className={meta.iconColor} />
            </div>
            <div>
              <span className={`text-[11px] font-semibold px-2 py-0.5 rounded-full border ${meta.bgColor}`}>
                {meta.label}
              </span>
              <h4 className="font-bold text-slate-900 text-sm mt-0.5 line-clamp-1">{point.title}</h4>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-7 h-7 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 flex items-center justify-center transition-colors cursor-pointer"
          >
            <X size={16} />
          </button>
        </div>

        {/* Body */}
        <div className="p-4 space-y-3 text-xs">
          {point.subtitle && (
            <p className="text-slate-600 bg-slate-50/70 p-2.5 rounded-xl border border-slate-100 leading-relaxed">
              {point.subtitle}
            </p>
          )}

          <div className="grid grid-cols-2 gap-2 text-slate-600">
            {point.city_name && (
              <div className="flex items-center gap-1.5 bg-slate-50 p-2 rounded-lg">
                <Building2 size={13} className="text-slate-400 shrink-0" />
                <span className="truncate font-medium">{point.city_name}</span>
              </div>
            )}
            {point.status && (
              <div className="flex items-center gap-1.5 bg-slate-50 p-2 rounded-lg">
                {point.status.toLowerCase().includes("complete") || point.status === "Active" ? (
                  <CheckCircle size={13} className="text-emerald-500 shrink-0" />
                ) : (
                  <Clock size={13} className="text-amber-500 shrink-0" />
                )}
                <span className="truncate font-medium">{point.status}</span>
              </div>
            )}
          </div>

          {point.address && (
            <div className="flex items-start gap-2 text-slate-600">
              <MapPin size={14} className="text-slate-400 shrink-0 mt-0.5" />
              <span className="line-clamp-2">{point.address}</span>
            </div>
          )}

          {point.contact && (
            <div className="flex items-center gap-2 text-slate-600">
              <Phone size={14} className="text-slate-400 shrink-0" />
              <span className="font-mono">{point.contact}</span>
            </div>
          )}

          {point.created_date && (
            <div className="flex items-center gap-2 text-slate-400 text-[11px]">
              <Calendar size={13} className="shrink-0" />
              <span>
                {new Date(point.created_date).toLocaleDateString("th-TH", {
                  year: "numeric",
                  month: "short",
                  day: "numeric",
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </span>
            </div>
          )}

          {point.layer_type === "cctv" && point.photo_url && (
            <div className="pt-1">
              <a
                href={point.photo_url}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full inline-flex items-center justify-center gap-2 py-2 px-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-medium transition-colors shadow-sm cursor-pointer text-xs"
              >
                <Video size={14} />
                <span>เปิดดูสัญญาณสตรีมสด (Live Stream)</span>
                <ExternalLink size={12} className="opacity-80" />
              </a>
            </div>
          )}

          {/* Coordinates Bar */}
          <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-400 font-mono">
            <span>
              พิกัด: {point.latitude.toFixed(5)}, {point.longitude.toFixed(5)}
            </span>
            <a
              href={`https://www.google.com/maps/search/?api=1&query=${point.latitude},${point.longitude}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-600 hover:text-blue-800 font-sans font-medium flex items-center gap-1"
            >
              เปิดใน Google Maps →
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};
