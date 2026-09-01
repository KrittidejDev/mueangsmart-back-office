import { useState, useEffect, useCallback } from "react";
import { api } from "@/lib/api";
import { fetchSenseDeviceCountsForCities } from "@/services/gatewayService";

export interface City {
  id: string;
  name_th: string;
  name_en?: string;
  logo_url?: string;
  address_th: string;
  address_en?: string;
  phone?: string;
  latitude?: number;
  longitude?: number;
  status: string;
  created_by?: string;
  created_date?: string;
  updated_by?: string;
  updated_date?: string;
  modules_count?: number;
  active_modules_count?: number;
  river_status?: string | number;
  sense_status?: string | number;
  active_users_count?: number;
  registered_users_count?: number;
  total_users_count?: number;
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
  admin_password?: string;
  selected_module_ids?: string[];
}


export interface ModuleStatus {
  module_id: string;
  name_th: string;
  name_en: string;
  code: string;
  description: string;
  is_active: boolean;
}

export interface CityStatistics {
  city_id: string;
  registered_users: number;
  active_users: number;
  admin_users: number;
  elderly_and_disabled_count: number;
  elderly_count?: number;
  disabled_count?: number;
  elderly_and_disabled_both_count?: number;
  bedridden_count: number;
  general_complaints_count: number;
  total_complaints_count: number;
  resolved_complaints_count: number;
  tax_land_building_count: number;
  tax_signboard_count: number;
  pet_dogs_count: number;
  pet_cats_count: number;
  verified_users_count: number;
  public_relations_count: number;
  notifications_count: number;
  waste_members_count: number;
  waste_bills_count: number;
  waste_pending_bills_count: number;
  waste_paid_bills_count: number;
  waste_system_mode: string;
  cctv_cameras_count: number;
  cctv_views_count: number;
  river_stations_count: number;
  river_online_count: number;
  river_offline_count: number;
  sense_stations_count: number;
  sense_online_count: number;
  sense_offline_count: number;
}

function sortCitiesWithFahfonFirst(list: City[]): City[] {
  if (!list || list.length === 0) return [];
  const fahfon = list.find((item) => item.name_th?.includes("ฟ้าฝน"));
  const others = list
    .filter((item) => !item.name_th?.includes("ฟ้าฝน"))
    .sort((a, b) => (a.name_th || "").localeCompare(b.name_th || "", "th"));
  return fahfon ? [fahfon, ...others] : others;
}

let cachedCities: City[] | null = null;

export function useCities() {
  const [cities, setCities] = useState<City[]>(() => cachedCities || []);
  const [loading, setLoading] = useState(() => !cachedCities);
  const [updating, setUpdating] = useState(false);
  const [selectedCity, setSelectedCity] = useState<City | null>(null);
  const [modules, setModules] = useState<ModuleStatus[]>([]);
  const [loadingModules, setLoadingModules] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchCities = useCallback(async () => {
    try {
      setError(null);
      const res = await api.get("/cities");
      if (res.data && Array.isArray(res.data)) {
        const cityList: City[] = res.data.map((c: City) => {
          const totalUsers = c.total_users_count ?? 0;
          return {
            ...c,
            logo_url: c.logo_url ?? "",
            modules_count: c.modules_count ?? c.active_modules_count ?? 0,
            active_modules_count: c.active_modules_count ?? 0,
            admins_count: c.admins_count ?? 0,
            river_status: c.river_status ?? 0,
            sense_status: c.sense_status ?? 0,
            active_users_count: totalUsers,
            registered_users_count: totalUsers,
            total_users_count: totalUsers,
          };
        });

        const list = sortCitiesWithFahfonFirst(cityList);
        cachedCities = list;
        setCities(list);

        fetchSenseDeviceCountsForCities(list)
          .then((senseCounts) => {
            if (senseCounts && senseCounts.size > 0) {
              setCities((prev) => {
                const updated = prev.map((c) => {
                  const count = senseCounts.get(c.id);
                  if (count === undefined) return c;
                  return { ...c, sense_status: count };
                });
                cachedCities = updated;
                return updated;
              });
            }
          })
          .catch(() => {});
      } else {
        setCities([]);
      }
    } catch (err: unknown) {
      const errMsg = err instanceof Error ? err.message : "Failed to load cities";
      setError(errMsg);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      try {
        setError(null);
        const res = await api.get("/cities");
        if (cancelled) return;

        if (res.data && Array.isArray(res.data)) {
          const cityList: City[] = res.data.map((c: City) => {
            const totalUsers = c.total_users_count ?? 0;
            return {
              ...c,
              logo_url: c.logo_url ?? "",
              modules_count: c.modules_count ?? c.active_modules_count ?? 0,
              active_modules_count: c.active_modules_count ?? 0,
              admins_count: c.admins_count ?? 0,
              river_status: c.river_status ?? 0,
              sense_status: c.sense_status ?? 0,
              active_users_count: totalUsers,
              registered_users_count: totalUsers,
              total_users_count: totalUsers,
            };
          });

          const list = sortCitiesWithFahfonFirst(cityList);
          if (!cancelled) {
            cachedCities = list;
            setCities(list);
          }

          fetchSenseDeviceCountsForCities(list)
            .then((senseCounts) => {
              if (cancelled || !senseCounts || senseCounts.size === 0) return;
              setCities((prev) => {
                const updated = prev.map((c) => {
                  const count = senseCounts.get(c.id);
                  return count === undefined ? c : { ...c, sense_status: count };
                });
                cachedCities = updated;
                return updated;
              });
            })
            .catch(() => {});
        } else {
          if (!cancelled) setCities([]);
        }
      } catch (err: unknown) {
        if (!cancelled) {
          const errMsg = err instanceof Error ? err.message : "Failed to load cities";
          setError(errMsg);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    if (!cachedCities) {
      load();
    }

    return () => {
      cancelled = true;
    };
  }, []);

  const fetchCityByID = useCallback(async (id: string) => {
    try {
      const res = await api.get(`/cities/${id}`);
      if (res.data) {
        const c = res.data as City;
        return {
          ...c,
          logo_url: c.logo_url || "",
        };
      }
      return null;
    } catch {
      const found = cities.find((c) => c.id === id);
      return found || null;
    }
  }, [cities]);

  const fetchCityStatistics = useCallback(async (id: string): Promise<CityStatistics | null> => {
    try {
      const res = await api.get(`/cities/${id}/statistics`);
      if (res.data) {
        return res.data as CityStatistics;
      }
      return null;
    } catch {
      return null;
    }
  }, []);

  const selectCity = useCallback(async (city: City) => {
    setSelectedCity(city);
    setLoadingModules(true);
    try {
      const res = await api.get(`/cities/${city.id}/modules`);
      setModules(res.data || []);
    } catch {
      setModules([]);
    } finally {
      setLoadingModules(false);
    }
  }, []);

  async function createCity(data: Partial<City>): Promise<boolean> {
    setUpdating(true);
    try {
      const res = await api.post("/cities", {
        name_th: data.name_th,
        name_en: data.name_en,
        address_th: data.address_th,
        address_en: data.address_en,
        phone: data.phone,
        latitude: data.latitude || 13.7563,
        longitude: data.longitude || 100.5018,
        logo_url: data.logo_url || null,
        admin_name: data.admin_name || "",
        admin_last_name: data.admin_last_name || "",
        admin_email: data.admin_email || "",
        admin_phone: data.admin_phone || "",
        admin_password: data.admin_password || "",
        bank_name: data.bank_name || "",
        bank_account_number: data.bank_account_number || "",
        bank_account_name: data.bank_account_name || "",
        bank_branch: data.bank_branch || "",
        bank_type: data.bank_type || "",
        selected_module_ids: data.selected_module_ids || [],
      });


      if (res.status === 200 || res.status === 201) {
        await fetchCities();
        return true;
      }
      return false;
    } catch {
      return false;
    } finally {
      setUpdating(false);
    }
  }

  async function updateCity(id: string, data: Partial<City>): Promise<boolean> {
    setUpdating(true);
    try {
      const res = await api.put(`/cities/${id}`, {
        name_th: data.name_th,
        name_en: data.name_en || "",
        address_th: data.address_th || "",
        address_en: data.address_en || "",
        phone: data.phone || "",
        latitude: data.latitude,
        longitude: data.longitude,
        logo_url: data.logo_url || null,
        status: data.status,
        // Bank Details
        bank_name: data.bank_name || "",
        bank_account_number: data.bank_account_number || "",
        bank_account_name: data.bank_account_name || "",
        bank_branch: data.bank_branch || "",
        bank_type: data.bank_type || "",
        // Admin Info
        admin_name: data.admin_name || "",
        admin_last_name: data.admin_last_name || "",
        admin_email: data.admin_email || "",
        admin_phone: data.admin_phone || "",
        admin_password: data.admin_password || "",
        // Selected Modules
        selected_module_ids: data.selected_module_ids || [],
      });

      if (res.status === 200) {
        await fetchCities();
        return true;
      }
      return false;
    } catch {
      return false;
    } finally {
      setUpdating(false);
    }
  }


  async function toggleCityStatus(id: string, status: string): Promise<boolean> {
    setUpdating(true);
    try {
      const res = await api.patch(`/cities/${id}/status`, { status });
      if (res.status === 200) {
        await fetchCities();
        return true;
      }
      return false;
    } catch {
      return false;
    } finally {
      setUpdating(false);
    }
  }

  async function toggleModule(cityId: string, moduleId: string, currentStatus: boolean): Promise<boolean> {
    try {
      const res = await api.put(`/cities/${cityId}/modules/${moduleId}`, {
        is_active: !currentStatus,
      });
      if (res.status === 200) {
        setModules((prev) =>
          prev.map((m) => (m.module_id === moduleId ? { ...m, is_active: !currentStatus } : m))
        );
        return true;
      }
      return false;
    } catch {
      return false;
    }
  }

  const totalCities = cities.length;
  const activeCities = cities.filter(
    (c) => c.status === "ใช้งาน" || c.status === "Active"
  ).length;
  const inactiveCities = totalCities - activeCities;

  return {
    cities,
    totalCities,
    activeCities,
    inactiveCities,
    loading,
    updating,
    error,
    selectedCity,
    modules,
    loadingModules,
    selectCity,
    fetchCityByID,
    fetchCityStatistics,
    createCity,
    updateCity,
    toggleCityStatus,
    toggleModule,
    refetchCities: fetchCities,
  };
}
