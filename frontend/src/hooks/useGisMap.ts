import { useState, useEffect, useCallback, useMemo } from "react";
import { api } from "@/lib/api";

export type GisLayerType =
  | "complaint"
  | "complaint_activity"
  | "elderly"
  | "elderly_assistance"
  | "bedridden"
  | "bedridden_assistance"
  | "cctv"
  | "pet"
  | "pet_service"
  | "waste_fee"
  | "municipality"
  | "sensor";

export interface GisPoint {
  id: string;
  layer_type: GisLayerType;
  title: string;
  subtitle?: string;
  category?: string;
  status?: string;
  latitude: number;
  longitude: number;
  address?: string;
  city_id: string;
  city_name: string;
  photo_url?: string;
  contact?: string;
  created_date?: string;
  extra_metadata?: Record<string, unknown>;
}

export interface GisLayerSummary {
  layer_key: string;
  name_th: string;
  name_en: string;
  icon: string;
  color: string;
  count: number;
  is_default_on: boolean;
}

const ALL_GIS_LAYERS = [
  "complaint",
  "complaint_activity",
  "elderly",
  "elderly_assistance",
  "bedridden",
  "bedridden_assistance",
  "cctv",
  "pet",
  "pet_service",
  "waste_fee",
  "municipality",
];

export function useGisMap(initialCityId: string | null = null) {
  const [layers, setLayers] = useState<GisLayerSummary[]>([]);
  const [points, setPoints] = useState<GisPoint[]>([]);
  const [activeLayers, setActiveLayers] = useState<string[]>(ALL_GIS_LAYERS);
  const [selectedCityId, setSelectedCityId] = useState<string | null>(initialCityId);
  const [selectedPoint, setSelectedPoint] = useState<GisPoint | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [loadingLayers, setLoadingLayers] = useState(true);
  const [loadingPoints, setLoadingPoints] = useState(true);

  // Fetch layer summaries
  const fetchLayers = useCallback(async (cityId?: string | null) => {
    try {
      setLoadingLayers(true);
      const params = cityId ? { city_id: cityId } : {};
      const res = await api.get<{ layers: GisLayerSummary[] }>("/gis-map/layers", { params });
      if (res.data && res.data.layers) {
        setLayers(res.data.layers);
      }
    } catch {
      // Fallback
    } finally {
      setLoadingLayers(false);
    }
  }, []);

  // Fetch points based on active filters
  const fetchPoints = useCallback(async () => {
    try {
      setLoadingPoints(true);
      const params: Record<string, string> = {};
      if (selectedCityId) {
        params.city_id = selectedCityId;
      }
      if (activeLayers.length > 0) {
        params.layers = activeLayers.join(",");
      } else {
        params.layers = "none";
      }
      if (searchQuery.trim()) {
        params.search = searchQuery.trim();
      }

      const res = await api.get<{ total: number; points: GisPoint[] }>("/gis-map/points", { params });
      if (res.data && res.data.points) {
        setPoints(res.data.points);
      }
    } catch {
      // Fallback
    } finally {
      setLoadingPoints(false);
    }
  }, [selectedCityId, activeLayers, searchQuery]);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      if (!cancelled) {
        await fetchLayers(selectedCityId);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [selectedCityId, fetchLayers]);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      if (!cancelled) {
        await fetchPoints();
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [fetchPoints]);

  const toggleLayer = useCallback((layerKey: string) => {
    setActiveLayers((prev) =>
      prev.includes(layerKey) ? prev.filter((k) => k !== layerKey) : [...prev, layerKey]
    );
  }, []);

  const selectAllLayers = useCallback(() => {
    setActiveLayers(ALL_GIS_LAYERS);
  }, []);

  const clearAllLayers = useCallback(() => {
    setActiveLayers([]);
  }, []);

  const totalPointsCount = useMemo(() => {
    return layers.reduce((acc, curr) => acc + curr.count, 0);
  }, [layers]);

  return {
    layers,
    points,
    activeLayers,
    selectedCityId,
    selectedPoint,
    searchQuery,
    loadingLayers,
    loadingPoints,
    totalPointsCount,
    setSelectedCityId,
    setSelectedPoint,
    setSearchQuery,
    toggleLayer,
    selectAllLayers,
    clearAllLayers,
    refresh: fetchPoints,
  };
}
