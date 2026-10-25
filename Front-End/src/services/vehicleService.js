import { API_BASE_URL } from './loanService';

const CACHE_PREFIX = "titlebros_vehicle_";
const CACHE_DURATION = 1000 * 60 * 60 * 24; // 24 hours

const canUseStorage = () =>
  typeof window !== "undefined" && typeof window.localStorage !== "undefined";

const getCache = (key) => {
  if (!canUseStorage()) return null;
  try {
    const raw = window.localStorage.getItem(`${CACHE_PREFIX}${key}`);
    if (!raw) return null;
    const cached = JSON.parse(raw);
    if (!cached || typeof cached.timestamp !== "number") {
      window.localStorage.removeItem(`${CACHE_PREFIX}${key}`);
      return null;
    }
    if (Date.now() - cached.timestamp > CACHE_DURATION) {
      window.localStorage.removeItem(`${CACHE_PREFIX}${key}`);
      return null;
    }
    return cached.data;
  } catch {
    return null;
  }
};

const setCache = (key, data) => {
  if (!canUseStorage()) return;
  try {
    window.localStorage.setItem(
      `${CACHE_PREFIX}${key}`,
      JSON.stringify({
        timestamp: Date.now(),
        data,
      })
    );
  } catch {
    // Ignore localStorage failures.
  }
};

const requestBackend = async (endpoint, cacheKey) => {
  if (cacheKey) {
    const cached = getCache(cacheKey);
    if (cached) return cached;
  }

  const url = `${API_BASE_URL}${endpoint}`;
  const response = await fetch(url, {
    method: "GET",
    headers: {
      Accept: "application/json",
    },
  });

  if (!response.ok) {
    throw new Error(`Vehicle API request failed with status ${response.status}`);
  }

  const result = await response.json();
  const data = result.data; // assuming the standard ApiResponse format

  if (cacheKey && data) {
    setCache(cacheKey, data);
  }

  return data;
};

const normalizeName = (value) =>
  String(value || "").trim().replace(/\s+/g, " ");

const uniqueByName = (items) => {
  const map = new Map();
  items.forEach((item) => {
    const name = normalizeName(item.name);
    if (!name) return;
    const key = name.toLowerCase();
    if (!map.has(key)) {
      map.set(key, { ...item, name });
    }
  });
  return Array.from(map.values()).sort((a, b) => a.name.localeCompare(b.name));
};

export const decodeVin = async (vin) => {
  if (!vin) return null;
  const safeVin = String(vin).trim();
  const data = await requestBackend(`/vehicles/decode-vin/${safeVin}`, `vin_${safeVin}`);
  return data;
};

export const getVehicleMakes = async (year) => {
  const endpoint = year ? `/vehicles/makes/${String(year).trim()}` : '/vehicles/makes';
  const cacheKey = year ? `makes_${String(year).trim()}` : 'makes_all';
  const data = await requestBackend(endpoint, cacheKey);
  
  if (!data || !Array.isArray(data.Results)) return [];

  return uniqueByName(
    data.Results.map((item) => ({
      id: item.MakeId || item.Make_ID,
      name: item.MakeName || item.Make_Name,
    }))
  );
};

export const getVehicleModels = async ({ year, make }) => {
  if (!year || !make) return [];

  const safeYear = String(year).trim();
  const safeMake = String(make).trim();
  const encodedMake = encodeURIComponent(safeMake);

  const cacheKey = `models_${safeYear}_${safeMake.toLowerCase().replace(/\s+/g, "_")}`;
  const data = await requestBackend(`/vehicles/models/${encodedMake}/${safeYear}`, cacheKey);

  if (!data || !Array.isArray(data.Results)) return [];

  return uniqueByName(
    data.Results.map((item) => ({
      id: item.Model_ID,
      name: item.Model_Name,
    }))
  );
};

export const getVehicleOptions = async ({ year, make } = {}) => {
  let makes = [];
  let models = [];

  if (year) {
    makes = await getVehicleMakes(year);
  }

  if (year && make) {
    models = await getVehicleModels({ year, make });
  }

  return { makes, models };
};

export const clearVehicleCache = () => {
  if (!canUseStorage()) return;
  try {
    const keys = [];
    for (let i = 0; i < window.localStorage.length; i++) {
      const key = window.localStorage.key(i);
      if (key?.startsWith(CACHE_PREFIX)) {
        keys.push(key);
      }
    }
    keys.forEach((key) => window.localStorage.removeItem(key));
  } catch {
    // Ignore localStorage failures.
  }
};