// const NHTSA_BASE_URL =
//   "https://vpic.nhtsa.dot.gov/api/vehicles";

// const CACHE_PREFIX = "titlebros_vehicle_";

// const CACHE_DURATION =
//   1000 * 60 * 60 * 24; // 24 hours


// /* =========================================================
//    CACHE
// ========================================================= */

// const canUseStorage = () => {
//   return (
//     typeof window !== "undefined" &&
//     typeof window.localStorage !== "undefined"
//   );
// };


// const getCache = (key) => {
//   if (!canUseStorage()) {
//     return null;
//   }

//   try {
//     const raw = window.localStorage.getItem(
//       `${CACHE_PREFIX}${key}`
//     );

//     if (!raw) {
//       return null;
//     }

//     const cached = JSON.parse(raw);

//     if (
//       !cached ||
//       typeof cached.timestamp !== "number"
//     ) {
//       window.localStorage.removeItem(
//         `${CACHE_PREFIX}${key}`
//       );

//       return null;
//     }

//     const expired =
//       Date.now() - cached.timestamp >
//       CACHE_DURATION;

//     if (expired) {
//       window.localStorage.removeItem(
//         `${CACHE_PREFIX}${key}`
//       );

//       return null;
//     }

//     return cached.data;
//   } catch (error) {
//     console.warn(
//       "Vehicle cache read failed:",
//       error
//     );

//     return null;
//   }
// };


// const setCache = (key, data) => {
//   if (!canUseStorage()) {
//     return;
//   }

//   try {
//     window.localStorage.setItem(
//       `${CACHE_PREFIX}${key}`,
//       JSON.stringify({
//         timestamp: Date.now(),
//         data,
//       })
//     );
//   } catch (error) {
//     console.warn(
//       "Vehicle cache write failed:",
//       error
//     );
//   }
// };


// /* =========================================================
//    API REQUEST
// ========================================================= */

// const requestNHTSA = async (
//   endpoint,
//   cacheKey
// ) => {
//   const cached = getCache(cacheKey);

//   if (cached) {
//     return cached;
//   }

//   const url =
//     `${NHTSA_BASE_URL}/${endpoint}?format=json`;

//   const response = await fetch(url, {
//     method: "GET",
//     headers: {
//       Accept: "application/json",
//     },
//   });

//   if (!response.ok) {
//     throw new Error(
//       `NHTSA request failed with status ${response.status}`
//     );
//   }

//   const data = await response.json();

//   if (
//     !data ||
//     !Array.isArray(data.Results)
//   ) {
//     throw new Error(
//       "Invalid response received from NHTSA."
//     );
//   }

//   setCache(cacheKey, data);

//   return data;
// };


// /* =========================================================
//    NORMALIZE STRING
// ========================================================= */

// const normalizeName = (value) => {
//   return String(value || "")
//     .trim()
//     .replace(/\s+/g, " ");
// };


// /* =========================================================
//    REMOVE DUPLICATES
// ========================================================= */

// const uniqueByName = (items) => {
//   const map = new Map();

//   items.forEach((item) => {
//     const name =
//       normalizeName(item.name);

//     if (!name) {
//       return;
//     }

//     const key =
//       name.toLowerCase();

//     if (!map.has(key)) {
//       map.set(key, {
//         ...item,
//         name,
//       });
//     }
//   });

//   return Array.from(
//     map.values()
//   ).sort((a, b) =>
//     a.name.localeCompare(
//       b.name
//     )
//   );
// };


// /* =========================================================
//    GET USA VEHICLE MAKES
// ========================================================= */

// export const getVehicleMakes =
//   async () => {
//     const data =
//       await requestNHTSA(
//         "GetMakesForVehicleType/car",
//         "makes_car"
//       );

//     const makes =
//       data.Results.map(
//         (item) => ({
//           id: item.MakeId,
//           name: item.MakeName,
//         })
//       );

//     return uniqueByName(
//       makes
//     );
//   };


// /* =========================================================
//    GET MODELS
// ========================================================= */

// export const getVehicleModels =
//   async ({
//     year,
//     make,
//   }) => {
//     if (!year || !make) {
//       return [];
//     }

//     const safeYear =
//       String(year).trim();

//     const safeMake =
//       String(make).trim();

//     const encodedMake =
//       encodeURIComponent(
//         safeMake
//       );

//     const endpoint =
//       `GetModelsForMakeYear/make/${encodedMake}/modelyear/${safeYear}/vehicletype/car`;

//     const cacheKey =
//       `models_${safeYear}_${safeMake
//         .toLowerCase()
//         .replace(/\s+/g, "_")}`;

//     const data =
//       await requestNHTSA(
//         endpoint,
//         cacheKey
//       );

//     const models =
//       data.Results.map(
//         (item) => ({
//           id: item.Model_ID,
//           name: item.Model_Name,
//         })
//       );

//     return uniqueByName(
//       models
//     );
//   };


// /* =========================================================
//    GET COMPLETE VEHICLE DATA
// ========================================================= */

// export const getVehicleOptions =
//   async ({
//     year,
//     make,
//   } = {}) => {
//     const makes =
//       await getVehicleMakes();

//     let models = [];

//     if (year && make) {
//       models =
//         await getVehicleModels({
//           year,
//           make,
//         });
//     }

//     return {
//       makes,
//       models,
//     };
//   };


// /* =========================================================
//    CLEAR VEHICLE CACHE
// ========================================================= */

// export const clearVehicleCache =
//   () => {
//     if (!canUseStorage()) {
//       return;
//     }

//     try {
//       const keys = [];

//       for (
//         let index = 0;
//         index <
//         window.localStorage.length;
//         index++
//       ) {
//         const key =
//           window.localStorage.key(
//             index
//           );

//         if (
//           key?.startsWith(
//             CACHE_PREFIX
//           )
//         ) {
//           keys.push(key);
//         }
//       }

//       keys.forEach((key) => {
//         window.localStorage.removeItem(
//           key
//         );
//       });
//     } catch (error) {
//       console.warn(
//         "Failed to clear vehicle cache:",
//         error
//       );
//     }
//   };


const NHTSA_BASE_URL =
  "https://vpic.nhtsa.dot.gov/api/vehicles";

const CACHE_PREFIX =
  "titlebros_vehicle_";

const CACHE_DURATION =
  1000 * 60 * 60 * 24;

const canUseStorage = () =>
  typeof window !== "undefined" &&
  typeof window.localStorage !==
    "undefined";

const getCache = (key) => {
  if (!canUseStorage()) return null;

  try {
    const raw =
      window.localStorage.getItem(
        `${CACHE_PREFIX}${key}`
      );

    if (!raw) return null;

    const cached = JSON.parse(raw);

    if (
      !cached ||
      typeof cached.timestamp !== "number"
    ) {
      window.localStorage.removeItem(
        `${CACHE_PREFIX}${key}`
      );

      return null;
    }

    if (
      Date.now() - cached.timestamp >
      CACHE_DURATION
    ) {
      window.localStorage.removeItem(
        `${CACHE_PREFIX}${key}`
      );

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

const requestNHTSA = async (
  endpoint,
  cacheKey
) => {
  const cached = getCache(cacheKey);

  if (cached) {
    return cached;
  }

  const url =
    `${NHTSA_BASE_URL}/${endpoint}?format=json`;

  const response = await fetch(url, {
    method: "GET",
    headers: {
      Accept: "application/json",
    },
  });

  if (!response.ok) {
    throw new Error(
      `NHTSA request failed with status ${response.status}`
    );
  }

  const data = await response.json();

  if (
    !data ||
    !Array.isArray(data.Results)
  ) {
    throw new Error(
      "Invalid response received from NHTSA."
    );
  }

  setCache(cacheKey, data);

  return data;
};

const normalizeName = (value) =>
  String(value || "")
    .trim()
    .replace(/\s+/g, " ");

const uniqueByName = (items) => {
  const map = new Map();

  items.forEach((item) => {
    const name = normalizeName(item.name);

    if (!name) return;

    const key = name.toLowerCase();

    if (!map.has(key)) {
      map.set(key, {
        ...item,
        name,
      });
    }
  });

  return Array.from(map.values()).sort(
    (a, b) =>
      a.name.localeCompare(b.name)
  );
};

export const getVehicleMakes = async () => {
  const data = await requestNHTSA(
    "GetMakesForVehicleType/car",
    "makes_car"
  );

  return uniqueByName(
    data.Results.map((item) => ({
      id: item.MakeId,
      name: item.MakeName,
    }))
  );
};

export const getVehicleModels = async ({
  year,
  make,
}) => {
  if (!year || !make) {
    return [];
  }

  const safeYear = String(year).trim();
  const safeMake = String(make).trim();

  const encodedMake =
    encodeURIComponent(safeMake);

  const endpoint =
    `GetModelsForMakeYear/make/${encodedMake}/modelyear/${safeYear}/vehicletype/car`;

  const cacheKey =
    `models_${safeYear}_${safeMake
      .toLowerCase()
      .replace(/\s+/g, "_")}`;

  const data = await requestNHTSA(
    endpoint,
    cacheKey
  );

  return uniqueByName(
    data.Results.map((item) => ({
      id: item.Model_ID,
      name: item.Model_Name,
    }))
  );
};

export const getVehicleOptions = async ({
  year,
  make,
} = {}) => {
  const makes =
    await getVehicleMakes();

  let models = [];

  if (year && make) {
    models =
      await getVehicleModels({
        year,
        make,
      });
  }

  return {
    makes,
    models,
  };
};

export const clearVehicleCache = () => {
  if (!canUseStorage()) return;

  try {
    const keys = [];

    for (
      let i = 0;
      i < window.localStorage.length;
      i++
    ) {
      const key =
        window.localStorage.key(i);

      if (
        key?.startsWith(CACHE_PREFIX)
      ) {
        keys.push(key);
      }
    }

    keys.forEach((key) =>
      window.localStorage.removeItem(key)
    );
  } catch {
    // Ignore localStorage failures.
  }
};