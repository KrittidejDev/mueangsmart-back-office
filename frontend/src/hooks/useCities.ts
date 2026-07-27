import { useState, useEffect, useCallback } from "react";
import { api } from "@/lib/api";

export interface City {
  id: string;
  name_th: string;
  name_en: string;
  address_th: string;
  address_en?: string;
  phone: string;
  latitude: number;
  longitude: number;
  status: string;
  active_modules_count: number;
  total_users_count: number;
  admins_count?: number;
  vulnerable_count?: number;
  bank_name?: string;
  bank_account_number?: string;
  bank_account_name?: string;
  bank_branch?: string;
  bank_type?: string;
  admin_name?: string;
  admin_last_name?: string;
  admin_email?: string;
  admin_phone?: string;
}

export interface ModuleStatus {
  module_id: string;
  name_th: string;
  name_en: string;
  code: string;
  description: string;
  is_active: boolean;
}

export function useCities() {
  const [cities, setCities] = useState<City[]>([]);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [selectedCity, setSelectedCity] = useState<City | null>(null);
  const [modules, setModules] = useState<ModuleStatus[]>([]);
  const [loadingModules, setLoadingModules] = useState(false);

  useEffect(() => {
    fetchCities();
  }, []);

  async function fetchCities() {
    try {
      setLoading(true);
      const res = await api.get("/cities");
      setCities(res.data || []);
    } catch (err) {
      console.error("Failed to fetch cities:", err);
    } finally {
      setLoading(false);
    }
  }

  const fetchCityByID = useCallback(async (id: string) => {
    try {
      const res = await api.get(`/cities/${id}`);
      return res.data as City;
    } catch (err) {
      console.error("Failed to fetch city details:", err);
      return null;
    }
  }, []);

  const selectCity = useCallback(async (city: City) => {
    setSelectedCity(city);
    setLoadingModules(true);
    try {
      const res = await api.get(`/cities/${city.id}/modules`);
      setModules(res.data || []);
    } catch (err) {
      console.error("Failed to fetch city modules:", err);
    } finally {
      setLoadingModules(false);
    }
  }, []);

  async function updateCity(id: string, data: Partial<City>) {
    setUpdating(true);
    try {
      await api.put(`/cities/${id}`, data);
      await fetchCities();
      return true;
    } catch (err) {
      console.error("Failed to update city details:", err);
      return false;
    } finally {
      setUpdating(false);
    }
  }

  async function toggleModule(cityId: string, moduleId: string, currentStatus: boolean) {
    try {
      await api.patch(`/cities/${cityId}/modules/${moduleId}`, {
        is_active: !currentStatus,
      });
      setModules((prev) =>
        prev.map((m) => (m.module_id === moduleId ? { ...m, is_active: !currentStatus } : m))
      );
      fetchCities();
      return true;
    } catch (err) {
      console.error("Failed to toggle module:", err);
      return false;
    }
  }

  const totalCities = cities.length;
  const activeCities = cities.filter((c) => c.status === "Active").length;
  const inactiveCities = totalCities - activeCities;

  return {
    cities,
    totalCities,
    activeCities,
    inactiveCities,
    loading,
    updating,
    selectedCity,
    modules,
    loadingModules,
    selectCity,
    fetchCityByID,
    updateCity,
    toggleModule,
    refetchCities: fetchCities,
  };
}
