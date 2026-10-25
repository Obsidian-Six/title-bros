// import asyncHandler from '../utils/asyncHandler.js';
// import ApiResponse from '../utils/ApiResponse.js';
// import ApiError from '../utils/ApiError.js';

// /**
//  * @desc    Decode VIN using NHTSA API
//  * @route   GET /api/v1/vehicles/decode-vin/:vin
//  * @access  Public
//  */
// export const decodeVin = asyncHandler(async (req, res) => {
//   const { vin } = req.params;
//   if (!vin) throw new ApiError(400, 'VIN is required');

//   const response = await fetch(`https://vpic.nhtsa.dot.gov/api/vehicles/DecodeVin/${encodeURIComponent(vin)}?format=json`);
//   if (!response.ok) throw new ApiError(500, 'Failed to fetch from NHTSA API');
  
//   const data = await response.json();
//   res.status(200).json(new ApiResponse(200, data, 'VIN decoded successfully'));
// });

// /**
//  * @desc    Get all vehicle makes (optionally for a specific year)
//  * @route   GET /api/v1/vehicles/makes
//  * @route   GET /api/v1/vehicles/makes/:year
//  * @access  Public
//  */
// export const getMakes = asyncHandler(async (req, res) => {
//   const { year } = req.params;
  
//   const url = year 
//     ? `https://vpic.nhtsa.dot.gov/api/vehicles/GetMakesForVehicleYear/year/${encodeURIComponent(year)}?format=json`
//     : `https://vpic.nhtsa.dot.gov/api/vehicles/GetMakesForVehicleType/car?format=json`;

//   const response = await fetch(url);
//   if (!response.ok) throw new ApiError(500, 'Failed to fetch makes from NHTSA API');
  
//   const data = await response.json();
//   res.status(200).json(new ApiResponse(200, data, 'Makes retrieved successfully'));
// });

// /**
//  * @desc    Get all vehicle models for a specific make and year
//  * @route   GET /api/v1/vehicles/models/:make/:year
//  * @access  Public
//  */
// export const getModelsForMakeYear = asyncHandler(async (req, res) => {
//   const { make, year } = req.params;
//   if (!make || !year) throw new ApiError(400, 'Make and Year are required');

//   const response = await fetch(`https://vpic.nhtsa.dot.gov/api/vehicles/GetModelsForMakeYear/make/${encodeURIComponent(make)}/modelyear/${encodeURIComponent(year)}?format=json`);
//   if (!response.ok) throw new ApiError(500, 'Failed to fetch models from NHTSA API');
  
//   const data = await response.json();
//   res.status(200).json(new ApiResponse(200, data, 'Models retrieved successfully'));
// });



import asyncHandler from "../utils/asyncHandler.js";
import ApiResponse from "../utils/ApiResponse.js";
import ApiError from "../utils/ApiError.js";

const NHTSA_BASE_URL =
  "https://vpic.nhtsa.dot.gov/api/vehicles";

const fetchNhtsa = async (url) => {
  let response;

  try {
    response = await fetch(url, {
      headers: {
        Accept: "application/json",
      },
      signal: AbortSignal.timeout(15000),
    });
  } catch (error) {
    console.error("NHTSA connection error:", error.message);

    throw new ApiError(
      502,
      "Unable to connect to NHTSA API."
    );
  }

  if (!response.ok) {
    const body = await response.text().catch(() => "");

    console.error("NHTSA API Error:", {
      status: response.status,
      url,
      body: body.slice(0, 500),
    });

    throw new ApiError(
      502,
      `NHTSA API request failed with status ${response.status}.`
    );
  }

  try {
    return await response.json();
  } catch {
    throw new ApiError(
      502,
      "NHTSA returned an invalid JSON response."
    );
  }
};

const validateYear = (year) => {
  const numericYear = Number(year);

  if (
    !Number.isInteger(numericYear) ||
    numericYear < 1900 ||
    numericYear > new Date().getFullYear() + 1
  ) {
    throw new ApiError(400, "Please provide a valid vehicle year.");
  }

  return numericYear;
};

/**
 * GET /api/v1/vehicles/decode-vin/:vin
 */
export const decodeVin = asyncHandler(async (req, res) => {
  const vin = String(req.params.vin || "")
    .trim()
    .toUpperCase();

  if (!vin) {
    throw new ApiError(400, "VIN is required.");
  }

  if (vin.length !== 17) {
    throw new ApiError(400, "VIN must be exactly 17 characters.");
  }

  const url =
    `${NHTSA_BASE_URL}/DecodeVin/` +
    `${encodeURIComponent(vin)}?format=json`;

  const data = await fetchNhtsa(url);

  return res.status(200).json(
    new ApiResponse(200, data, "VIN decoded successfully.")
  );
});

/**
 * GET /api/v1/vehicles/makes
 * GET /api/v1/vehicles/makes/:year
 *
 * Uses the working vehicle-type endpoint for car makes.
 * The year parameter is validated, but the makes list itself
 * is not filtered by year. Models are filtered separately.
 */
export const getMakes = asyncHandler(async (req, res) => {
  const { year } = req.params;

  if (year) {
    validateYear(year);
  }

  const url =
    `${NHTSA_BASE_URL}/GetMakesForVehicleType/car?format=json`;

  const data = await fetchNhtsa(url);

  return res.status(200).json(
    new ApiResponse(
      200,
      data,
      year
        ? `Car makes retrieved for vehicle selection. Models can be filtered by ${year}.`
        : "Car makes retrieved successfully."
    )
  );
});

/**
 * GET /api/v1/vehicles/models/:make/:year
 */
export const getModelsForMakeYear = asyncHandler(
  async (req, res) => {
    const make = String(req.params.make || "").trim();

    if (!make) {
      throw new ApiError(400, "Vehicle make is required.");
    }

    const year = validateYear(req.params.year);

    const url =
      `${NHTSA_BASE_URL}/GetModelsForMakeYear/` +
      `make/${encodeURIComponent(make)}/` +
      `modelyear/${year}?format=json`;

    const data = await fetchNhtsa(url);

    return res.status(200).json(
      new ApiResponse(
        200,
        data,
        `Models for ${make} (${year}) retrieved successfully.`
      )
    );
  }
);
