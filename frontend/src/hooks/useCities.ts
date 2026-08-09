import { useState, useEffect, useCallback } from "react";
import { api } from "@/lib/api";

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
}

export interface ModuleStatus {
  module_id: string;
  name_th: string;
  name_en: string;
  code: string;
  description: string;
  is_active: boolean;
}

const INITIAL_MOCK_CITIES: City[] = [
  {
    id: "1",
    name_th: "เมืองฟ้าฝน",
    name_en: "Fah Fon Town Municipality",
    address_th: "9 Subdistrict ตำบล คลองนารายณ์ อำเภอเมืองจันทบุรี จันทบุรี 22000",
    address_en: "9 Moo 14, Khlong Narai ,Mueang Chanthaburi District ,Chanthaburi ,22000 ,Thailand",
    status: "ใช้งาน",
    modules_count: 13,
    active_modules_count: 12,
    river_status: 28,
    sense_status: 50,
    active_users_count: 865,
    registered_users_count: 4540,
    total_users_count: 4540,
    phone: "024567890",
    latitude: 12.12356,
    longitude: 15.32154,
  },
  {
    id: "2",
    name_th: "เทศบาลตำบลพลับพลานารายณ์",
    name_en: "Phlapphla Narai Subdistrict Municipality",
    address_th: "9 Subdistrict ตำบล คลองนารายณ์ อำเภอเมืองจันทบุรี จันทบุรี 22000",
    address_en: "9 Moo 14, Khlong Narai ,Mueang Chanthaburi District ,Chanthaburi ,22000 ,Thailand",
    status: "ใช้งาน",
    modules_count: 8,
    active_modules_count: 8,
    river_status: 15,
    sense_status: 18,
    active_users_count: 320,
    registered_users_count: 480,
    total_users_count: 480,
    phone: "039-311-890",
    latitude: 12.612,
    longitude: 102.104,
  },
  {
    id: "3",
    name_th: "องค์การบริหารส่วนตำบลศาลาแดง",
    name_en: "Sala Daeng Subdistrict SAO",
    address_th: "59 หมู่ที่ 12 ถนน หนองจอก-บ้านสร้าง ต.ศาลาแดง อ.บางน้ำเปรี้ยว จ.ฉะเชิงเทรา 24000",
    status: "ใช้งาน",
    modules_count: 8,
    active_modules_count: 8,
    river_status: 12,
    sense_status: 14,
    active_users_count: 150,
    registered_users_count: 225,
    total_users_count: 225,
    phone: "038-511-234",
    latitude: 13.882,
    longitude: 100.912,
  },
  {
    id: "4",
    name_th: "องค์การบริหารส่วนตำบลเสม็ดใต้",
    name_en: "Samed Tai Subdistrict SAO",
    address_th: "เลขที่ 111 หมู่ที่ 4 ต.เสม็ดใต้ อ.บางคล้า จ.ฉะเชิงเทรา 24110",
    status: "ใช้งาน",
    modules_count: 8,
    active_modules_count: 8,
    river_status: 6,
    sense_status: 8,
    active_users_count: 82,
    registered_users_count: 125,
    total_users_count: 125,
    phone: "038-541-111",
    latitude: 13.721,
    longitude: 101.213,
  },
  {
    id: "5",
    name_th: "เทศบาลเมืองบางแม่นาง",
    name_en: "Bang Mae Nang Town Municipality",
    address_th: "เลขที่ 24/5 หมู่ 4 ต.บางแม่นาง อ.บางใหญ่ จ.นนทบุรี 11140",
    status: "ใช้งาน",
    modules_count: 8,
    active_modules_count: 8,
    river_status: 8,
    sense_status: 12,
    active_users_count: 152,
    registered_users_count: 230,
    total_users_count: 230,
    phone: "02-927-5511",
    latitude: 13.885,
    longitude: 100.388,
  },
  {
    id: "6",
    name_th: "เทศบาลเมืองบ้านฉาง",
    name_en: "Ban Chang Town Municipality",
    address_th: "ต.บ้านฉาง อ.บ้านฉาง จ.ระยอง 21130",
    status: "ใช้งาน",
    modules_count: 8,
    active_modules_count: 8,
    river_status: 11,
    sense_status: 16,
    active_users_count: 103,
    registered_users_count: 160,
    total_users_count: 160,
    phone: "038-601-111",
    latitude: 12.724,
    longitude: 101.071,
  },
  {
    id: "7",
    name_th: "เทศบาลเมืองสามพราน",
    name_en: "Sam Phran Town Municipality",
    address_th: "98/19 หมู่ที่ 7 ถนนสามพราน 2 ต.สามพราน อ.สามพราน จ.นครปฐม 73110",
    status: "ใช้งาน",
    modules_count: 8,
    active_modules_count: 8,
    river_status: 9,
    sense_status: 14,
    active_users_count: 260,
    registered_users_count: 388,
    total_users_count: 388,
    phone: "034-311-234",
    latitude: 13.725,
    longitude: 100.215,
  },
  {
    id: "8",
    name_th: "เมืองฟ้าฝน",
    name_en: "Fah Fon Town Municipality",
    address_th: "ที่อยู่ 9 หมู่ 14 ต.คลองนารายณ์ อ.เมืองจันทบุรี จ.จันทบุรี 22000",
    status: "ใช้งาน",
    modules_count: 8,
    active_modules_count: 8,
    river_status: 14,
    sense_status: 17,
    active_users_count: 290,
    registered_users_count: 435,
    total_users_count: 435,
    phone: "039-441-234",
    latitude: 12.595,
    longitude: 102.121,
  },
  {
    id: "9",
    name_th: "เทศบาลตำบลศาลายา",
    name_en: "Salaya Subdistrict Municipality",
    address_th: "อ.ศาลายา จ.นครปฐม 73170",
    status: "ไม่ใช้งาน",
    modules_count: 8,
    active_modules_count: 8,
    river_status: 4,
    sense_status: "-",
    active_users_count: 31,
    registered_users_count: 48,
    total_users_count: 48,
    phone: "034-297-123",
    latitude: 13.805,
    longitude: 100.325,
  },
  {
    id: "10",
    name_th: "เทศบาลนครนนทบุรี",
    name_en: "Nonthaburi City Municipality",
    address_th: "ต.สวนใหญ่ อ.เมืองนนทบุรี จ.นนทบุรี 11000",
    status: "ใช้งาน",
    modules_count: 8,
    active_modules_count: 8,
    river_status: 18,
    sense_status: 20,
    active_users_count: 450,
    registered_users_count: 680,
    total_users_count: 680,
    phone: "02-589-0500",
    latitude: 13.862,
    longitude: 100.513,
  },
  {
    id: "11",
    name_th: "เทศบาลนครเชียงใหม่",
    name_en: "Chiang Mai City Municipality",
    address_th: "ต.ช้างคลาน อ.เมืองเชียงใหม่ จ.เชียงใหม่ 50100",
    status: "ใช้งาน",
    modules_count: 8,
    active_modules_count: 8,
    river_status: 20,
    sense_status: 19,
    active_users_count: 520,
    registered_users_count: 780,
    total_users_count: 780,
    phone: "053-259-000",
    latitude: 18.788,
    longitude: 98.985,
  },
  {
    id: "12",
    name_th: "เทศบาลนครขอนแก่น",
    name_en: "Khon Kaen City Municipality",
    address_th: "ต.ในเมือง อ.เมืองขอนแก่น จ.ขอนแก่น 40000",
    status: "ใช้งาน",
    modules_count: 8,
    active_modules_count: 8,
    river_status: 16,
    sense_status: 18,
    active_users_count: 410,
    registered_users_count: 615,
    total_users_count: 615,
    phone: "043-221-202",
    latitude: 16.441,
    longitude: 102.835,
  },
  {
    id: "13",
    name_th: "เทศบาลนครหาดใหญ่",
    name_en: "Hat Yai City Municipality",
    address_th: "ต.หาดใหญ่ อ.หาดใหญ่ จ.สงขลา 90110",
    status: "ใช้งาน",
    modules_count: 8,
    active_modules_count: 8,
    river_status: 14,
    sense_status: 17,
    active_users_count: 390,
    registered_users_count: 585,
    total_users_count: 585,
    phone: "074-200-000",
    latitude: 7.008,
    longitude: 100.474,
  },
  {
    id: "14",
    name_th: "เทศบาลนครพิษณุโลก",
    name_en: "Phitsanulok City Municipality",
    address_th: "ต.ในเมือง อ.เมืองพิษณุโลก จ.พิษณุโลก 65000",
    status: "ใช้งาน",
    modules_count: 8,
    active_modules_count: 8,
    river_status: 12,
    sense_status: "-",
    active_users_count: 240,
    registered_users_count: 360,
    total_users_count: 360,
    phone: "055-258-000",
    latitude: 16.821,
    longitude: 100.265,
  },
  {
    id: "15",
    name_th: "เทศบาลนครนครราชสีมา",
    name_en: "Nakhon Ratchasima City Municipality",
    address_th: "ต.ในเมือง อ.เมืองนครราชสีมา จ.นครราชสีมา 30000",
    status: "ใช้งาน",
    modules_count: 8,
    active_modules_count: 8,
    river_status: 17,
    sense_status: 20,
    active_users_count: 480,
    registered_users_count: 720,
    total_users_count: 720,
    phone: "044-242-000",
    latitude: 14.979,
    longitude: 102.097,
  },
  {
    id: "16",
    name_th: "เทศบาลเมืองปราณบุรี",
    name_en: "Pran Buri Town Municipality",
    address_th: "ต.เขาน้อย อ.ปราณบุรี จ.ประจวบคีรีขันธ์ 77120",
    status: "ไม่ใช้งาน",
    modules_count: 8,
    active_modules_count: 8,
    river_status: "-",
    sense_status: "-",
    active_users_count: 65,
    registered_users_count: 95,
    total_users_count: 95,
    phone: "032-621-123",
    latitude: 12.395,
    longitude: 99.912,
  },
  {
    id: "17",
    name_th: "เทศบาลเมืองชลบุรี",
    name_en: "Chonburi Town Municipality",
    address_th: "ต.บางปลาสร้อย อ.เมืองชลบุรี จ.ชลบุรี 20000",
    status: "ใช้งาน",
    modules_count: 8,
    active_modules_count: 8,
    river_status: 11,
    sense_status: 15,
    active_users_count: 330,
    registered_users_count: 495,
    total_users_count: 495,
    phone: "038-278-000",
    latitude: 13.361,
    longitude: 100.984,
  },
  {
    id: "18",
    name_th: "เทศบาลเมืองระยอง",
    name_en: "Rayong Town Municipality",
    address_th: "ต.ท่าประดู่ อ.เมืองระยอง จ.ระยอง 21000",
    status: "ใช้งาน",
    modules_count: 8,
    active_modules_count: 8,
    river_status: 13,
    sense_status: 16,
    active_users_count: 290,
    registered_users_count: 435,
    total_users_count: 435,
    phone: "038-611-000",
    latitude: 12.681,
    longitude: 101.281,
  },
  {
    id: "19",
    name_th: "เทศบาลเมืองภูเก็ต",
    name_en: "Phuket Town Municipality",
    address_th: "ต.ตลาดใหญ่ อ.เมืองภูเก็ต จ.ภูเก็ต 83000",
    status: "ใช้งาน",
    modules_count: 8,
    active_modules_count: 8,
    river_status: "-",
    sense_status: 14,
    active_users_count: 360,
    registered_users_count: 540,
    total_users_count: 540,
    phone: "076-211-000",
    latitude: 7.880,
    longitude: 98.392,
  },
  {
    id: "20",
    name_th: "เทศบาลเมืองหัวหิน",
    name_en: "Hua Hin Town Municipality",
    address_th: "ต.หัวหิน อ.หัวหิน จ.ประจวบคีรีขันธ์ 77110",
    status: "ใช้งาน",
    modules_count: 8,
    active_modules_count: 8,
    river_status: 10,
    sense_status: 15,
    active_users_count: 175,
    registered_users_count: 260,
    total_users_count: 260,
    phone: "032-511-047",
    latitude: 12.568,
    longitude: 99.957,
  },
];

function sortCitiesWithFahfonFirst(list: City[]): City[] {
  const filtered = list.filter(
    (item) => !item.name_th?.toLowerCase().includes("default") && !item.name_en?.toLowerCase().includes("default")
  );
  const fahfon = filtered.find((item) => item.name_th === "เมืองฟ้าฝน" || item.id === "1");
  const others = filtered
    .filter((item) => item.name_th !== "เมืองฟ้าฝน" && item.id !== "1")
    .sort((a, b) => {
      const idA = parseInt(a.id, 10);
      const idB = parseInt(b.id, 10);
      if (!isNaN(idA) && !isNaN(idB)) return idB - idA;
      return b.name_th.localeCompare(a.name_th, "th");
    });
  return fahfon ? [fahfon, ...others] : others;
}

let cachedCities: City[] | null = null;

export function useCities() {
  const [cities, setCities] = useState<City[]>(() => cachedCities || sortCitiesWithFahfonFirst(INITIAL_MOCK_CITIES));
  const [loading, setLoading] = useState(() => !cachedCities);
  const [updating, setUpdating] = useState(false);
  const [selectedCity, setSelectedCity] = useState<City | null>(null);
  const [modules, setModules] = useState<ModuleStatus[]>([]);
  const [loadingModules, setLoadingModules] = useState(false);

  useEffect(() => {
    fetchCities();
  }, []);

  async function fetchCities() {
    try {
      const res = await api.get("/cities");
      if (res.data && Array.isArray(res.data) && res.data.length > 0) {
        const mergedMap = new Map<string, City>();
        INITIAL_MOCK_CITIES.forEach((item) => mergedMap.set(item.name_th, item));

        res.data.forEach((c: City, idx: number) => {
          if (c.name_th?.toLowerCase().includes("default") || c.name_en?.toLowerCase().includes("default")) {
            return;
          }
          const mockItem = INITIAL_MOCK_CITIES[idx % INITIAL_MOCK_CITIES.length];
          const active = mockItem.active_users_count || 150;
          const registered = Math.round(active * 1.5);

          mergedMap.set(c.name_th, {
            ...mockItem,
            ...c,
            modules_count: 8,
            active_modules_count: 8,
            river_status: c.river_status ?? mockItem.river_status ?? 10,
            sense_status: c.sense_status ?? mockItem.sense_status ?? 15,
            active_users_count: active,
            registered_users_count: registered,
            total_users_count: registered,
          });
        });

        const list = sortCitiesWithFahfonFirst(Array.from(mergedMap.values()));
        cachedCities = list;
        setCities(list);
      } else {
        const fallback = sortCitiesWithFahfonFirst(INITIAL_MOCK_CITIES);
        cachedCities = fallback;
        setCities(fallback);
      }
    } catch {
      const fallback = sortCitiesWithFahfonFirst(INITIAL_MOCK_CITIES);
      cachedCities = fallback;
      setCities(fallback);
    } finally {
      setLoading(false);
    }
  }

  const fetchCityByID = useCallback(async (id: string) => {
    const found = cities.find((c) => c.id === id);
    if (found) return found;
    try {
      const res = await api.get(`/cities/${id}`);
      return res.data as City;
    } catch {
      return null;
    }
  }, [cities]);

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

  async function createCity(data: Omit<City, "id">) {
    setUpdating(true);
    try {
      const active = data.active_users_count || 200;
      const registered = Math.round(active * 1.5);

      const newCity: City = {
        ...data,
        modules_count: 8,
        active_modules_count: 8,
        river_status: data.river_status ?? 10,
        sense_status: data.sense_status ?? 12,
        active_users_count: active,
        registered_users_count: registered,
        total_users_count: registered,
        id: String(Date.now()),
      };
      setCities((prev) => {
        const updated = [newCity, ...prev];
        cachedCities = updated;
        return updated;
      });
      return true;
    } catch {
      return false;
    } finally {
      setUpdating(false);
    }
  }

  async function updateCity(id: string, data: Partial<City>) {
    setUpdating(true);
    try {
      setCities((prev) => {
        const updated = prev.map((c) => {
          if (c.id !== id) return c;
          const active = data.active_users_count ?? c.active_users_count ?? 200;
          const registered = Math.round(active * 1.5);
          return {
            ...c,
            ...data,
            modules_count: 8,
            active_modules_count: 8,
            river_status: data.river_status ?? c.river_status ?? 10,
            sense_status: data.sense_status ?? c.sense_status ?? 12,
            active_users_count: active,
            registered_users_count: registered,
            total_users_count: registered,
          };
        });
        cachedCities = updated;
        return updated;
      });
      return true;
    } catch {
      return false;
    } finally {
      setUpdating(false);
    }
  }

  async function toggleModule(cityId: string, moduleId: string, currentStatus: boolean) {
    try {
      setModules((prev) =>
        prev.map((m) => (m.module_id === moduleId ? { ...m, is_active: !currentStatus } : m))
      );
      return true;
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
    selectedCity,
    modules,
    loadingModules,
    selectCity,
    fetchCityByID,
    createCity,
    updateCity,
    toggleModule,
    refetchCities: fetchCities,
  };
}
