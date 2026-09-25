"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { MapPin, Loader2, Search, X } from "lucide-react";
import { Loader as GoogleMapsLoader } from "@googlemaps/js-api-loader";

const SERVER_URL =
  process.env.NEXT_PUBLIC_SERVER_URL ||
  (typeof window !== "undefined" && !window.location.hostname.includes("localhost")
    ? "https://title-bros-backend.onrender.com"
    : "http://localhost:5000");

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || `${SERVER_URL}/api/v1`;

/**
 * ==============================================================================
 * Dynamic Worldwide & UK Address Autocomplete Component
 * ==============================================================================
 * Works with OR without an API key!
 *
 * 1. If NEXT_PUBLIC_GOOGLE_MAPS_API_KEY is provided, uses Google Places API.
 * 2. If NO key is provided, automatically uses our fast backend geocoder
 *    (/api/v1/loans/geocode) and multi-source open geocoding (Open-Meteo,
 *    Postcodes.io for the UK, and OpenStreetMap).
 *
 * Automatically autofills:
 * - address (Primary place / street line)
 * - street (House number + Street / road)
 * - city (City, Town, Borough, or Locality)
 * - state (State, County, or Administrative Region, e.g. Greater London)
 * - zipCode (UK Postcode or US/International ZIP)
 */
export default function AddressAutocomplete({
  value = "",
  onChange,
  onSelectAddress,
  error = "",
  label = "Address",
  placeholder = "Type your address, city, or UK postcode...",
  className = "",
}) {
  const [query, setQuery] = useState(value);
  const [suggestions, setSuggestions] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);
  const containerRef = useRef(null);
  const debounceTimerRef = useRef(null);

  // Sync external value
  useEffect(() => {
    setQuery(value || "");
  }, [value]);

  // Click outside to dismiss
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Fast multi-source fallback (backend proxy + Open-Meteo + Postcodes.io + Photon)
  const fetchDynamicSuggestions = async (text) => {
    let items = [];

    // 1. Try our Backend Geocode Proxy first (handles CORS & aggregates providers)
    try {
      const res = await fetch(
        `${API_BASE_URL}/loans/geocode?q=${encodeURIComponent(text)}`,
        { signal: AbortSignal.timeout(4000) }
      );
      if (res.ok) {
        const json = await res.json();
        if (Array.isArray(json.data) && json.data.length > 0) {
          items = json.data;
        }
      }
    } catch (backendErr) {
      // Backend proxy unavailable, fall through to direct APIs
    }

    // 2. If backend proxy gave no results, query Open-Meteo (ultra fast, sub-100ms, open CORS)
    if (!items.length) {
      try {
        const omRes = await fetch(
          `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(
            text
          )}&count=5&language=en&format=json`,
          { signal: AbortSignal.timeout(3500) }
        );
        if (omRes.ok) {
          const omData = await omRes.json();
          if (Array.isArray(omData.results)) {
            items = omData.results.map((r, idx) => {
              const city = r.name || "";
              const state = r.admin2 || r.admin1 || "";
              const country = r.country || "";
              const secondary = [state, country].filter(Boolean).join(", ");
              return {
                id: `om-${r.id || idx}`,
                primary: city,
                secondary,
                fullText: `${city}${secondary ? `, ${secondary}` : ""}`,
                source: "open-meteo",
                parsed: {
                  street: "",
                  city,
                  state,
                  zipCode: r.postcodes?.[0] || "",
                  country,
                },
              };
            });
          }
        }
      } catch (omErr) {
        // Continue
      }
    }

    // 3. If query looks like a UK postcode (or letters/digits), check postcodes.io
    const isPostcode = /^[A-Z]{1,2}[0-9][A-Z0-9]?\s?[0-9]?[A-Z]{0,2}$/i.test(
      text.trim()
    );
    if (!items.length && isPostcode) {
      try {
        const cleanPc = text.trim().replace(/\s+/g, "");
        const pcRes = await fetch(
          `https://api.postcodes.io/postcodes?q=${encodeURIComponent(
            cleanPc
          )}&limit=5`,
          { signal: AbortSignal.timeout(3500) }
        );
        if (pcRes.ok) {
          const pcData = await pcRes.json();
          if (Array.isArray(pcData.result)) {
            items = pcData.result.map((item, idx) => ({
              id: `pc-${item.postcode || idx}`,
              primary: `${item.postcode}, ${
                item.admin_district || item.parish || "London"
              }`,
              secondary: `${item.region || "England"}, ${
                item.country || "United Kingdom"
              }`,
              fullText: `${item.postcode}, ${
                item.admin_district || ""
              }, United Kingdom`,
              source: "postcodes.io",
              parsed: {
                street: "",
                city: item.admin_district || item.parish || "London",
                state: item.region || item.admin_county || "Greater London",
                zipCode: item.postcode,
                country: item.country || "United Kingdom",
              },
            }));
          }
        }
      } catch (pcErr) {
        // Continue
      }
    }

    // 4. Try Photon for street-level addresses
    if (!items.length) {
      try {
        const phRes = await fetch(
          `https://photon.komoot.io/api/?q=${encodeURIComponent(text)}&limit=6`,
          { signal: AbortSignal.timeout(4500) }
        );
        if (phRes.ok) {
          const data = await phRes.json();
          items = (data.features || []).map((feat, idx) => {
            const p = feat.properties || {};
            const house = p.housenumber ? `${p.housenumber} ` : "";
            const street = p.street || p.name || "";
            const city = p.city || p.town || p.district || p.suburb || "";
            const state = p.state || p.county || "";
            const postcode = p.postcode || "";
            const country = p.country || "";

            const primary = `${house}${street}`.trim() || p.name || city;
            const secondary = [city, state, postcode, country]
              .filter(Boolean)
              .join(", ");

            return {
              id: `ph-${p.osm_id || idx}-${Math.random()}`,
              primary,
              secondary,
              fullText: `${primary}${secondary ? `, ${secondary}` : ""}`,
              source: "photon",
              parsed: {
                street: `${house}${p.street || p.name || ""}`.trim(),
                city,
                state,
                zipCode: postcode,
                country,
              },
            };
          });
        }
      } catch (phErr) {
        // Continue
      }
    }

    setSuggestions(items);
    setIsOpen(true);
    setHasSearched(true);
    setIsLoading(false);
  };

  // Main suggestion fetcher
  const fetchSuggestions = useCallback(async (text) => {
    if (!text || text.trim().length < 2) {
      setSuggestions([]);
      setIsLoading(false);
      setIsOpen(false);
      setHasSearched(false);
      return;
    }

    setIsLoading(true);

    try {
      const googleApiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;
      if (
        googleApiKey &&
        googleApiKey !== "YOUR_GOOGLE_MAPS_API_KEY" &&
        typeof window !== "undefined"
      ) {
        try {
          const loader = new GoogleMapsLoader({
            apiKey: googleApiKey,
            version: "weekly",
            libraries: ["places"],
          });
          const google = await loader.load();
          const autocompleteService =
            new google.maps.places.AutocompleteService();

          autocompleteService.getPlacePredictions(
            { input: text },
            (predictions, status) => {
              if (
                status === google.maps.places.PlacesServiceStatus.OK &&
                predictions?.length
              ) {
                const results = predictions.slice(0, 6).map((p) => ({
                  id: p.place_id,
                  primary: p.structured_formatting?.main_text || p.description,
                  secondary: p.structured_formatting?.secondary_text || "",
                  fullText: p.description,
                  source: "google",
                  placeId: p.place_id,
                }));
                setSuggestions(results);
                setIsOpen(true);
                setHasSearched(true);
                setIsLoading(false);
                return;
              }
              fetchDynamicSuggestions(text);
            }
          );
          return;
        } catch (gErr) {
          console.warn("Google Maps Loader fallback:", gErr);
        }
      }

      await fetchDynamicSuggestions(text);
    } catch (err) {
      console.error("Address autocomplete error:", err);
      setIsLoading(false);
    }
  }, []);

  const handleInputChange = (e) => {
    const val = e.target.value;
    setQuery(val);
    if (onChange) onChange(val);

    if (debounceTimerRef.current) clearTimeout(debounceTimerRef.current);
    debounceTimerRef.current = setTimeout(() => {
      fetchSuggestions(val);
    }, 250);
  };

  const handleSelect = (item) => {
    const chosenAddress = item.primary || item.fullText;
    setQuery(chosenAddress);
    setIsOpen(false);
    setActiveIndex(-1);

    if (item.source === "google" && item.placeId && window.google) {
      try {
        const placesService = new window.google.maps.places.PlacesService(
          document.createElement("div")
        );
        placesService.getDetails(
          {
            placeId: item.placeId,
            fields: ["address_components", "formatted_address", "name"],
          },
          (place, status) => {
            if (
              status === window.google.maps.places.PlacesServiceStatus.OK &&
              place
            ) {
              let streetNumber = "";
              let route = "";
              let city = "";
              let state = "";
              let zipCode = "";

              for (const comp of place.address_components || []) {
                const types = comp.types || [];
                if (types.includes("street_number"))
                  streetNumber = comp.long_name;
                if (types.includes("route")) route = comp.long_name;
                if (
                  types.includes("locality") ||
                  types.includes("postal_town") ||
                  types.includes("sublocality")
                ) {
                  city = city || comp.long_name;
                }
                if (
                  types.includes("administrative_area_level_1") ||
                  types.includes("administrative_area_level_2")
                ) {
                  state = state || comp.long_name || comp.short_name;
                }
                if (types.includes("postal_code")) zipCode = comp.long_name;
              }

              const street =
                `${streetNumber} ${route}`.trim() || place.name || "";
              if (onSelectAddress) {
                onSelectAddress({
                  address: street || chosenAddress,
                  street: street,
                  city: city,
                  state: state,
                  zipCode: zipCode,
                });
              }
              return;
            }
          }
        );
        return;
      } catch (e) {
        console.error("Google place details error:", e);
      }
    }

    // Default dynamic parsed geocoding object
    if (item.parsed && onSelectAddress) {
      onSelectAddress({
        address: item.primary || item.fullText,
        street: item.parsed.street || item.primary,
        city: item.parsed.city || "",
        state: item.parsed.state || "",
        zipCode: item.parsed.zipCode || "",
      });
    }
  };

  const handleKeyDown = (e) => {
    if (!isOpen || !suggestions.length) return;
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActiveIndex((prev) => (prev < suggestions.length - 1 ? prev + 1 : 0));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActiveIndex((prev) => (prev > 0 ? prev - 1 : suggestions.length - 1));
    } else if (e.key === "Enter") {
      e.preventDefault();
      if (activeIndex >= 0 && activeIndex < suggestions.length) {
        handleSelect(suggestions[activeIndex]);
      }
    } else if (e.key === "Escape") {
      setIsOpen(false);
    }
  };

  return (
    <div ref={containerRef} className={`relative ${className}`}>
      {label && (
        <label className="mb-2 block text-xs font-black uppercase tracking-[.1em] text-[var(--ink)]/60">
          {label}
        </label>
      )}

      <div className="relative">
        <span className="pointer-events-none absolute left-4 top-1/2 z-10 -translate-y-1/2 text-[#087a45]">
          <MapPin size={18} />
        </span>

        <input
          type="text"
          value={query}
          onChange={handleInputChange}
          onFocus={() => {
            if (suggestions.length > 0) setIsOpen(true);
          }}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          autoComplete="off"
          className={[
            "h-14 w-full rounded-2xl border bg-white px-4 pl-11 pr-11",
            "text-zinc-900 font-semibold outline-none transition text-sm shadow-sm",
            "placeholder:text-zinc-400 placeholder:font-normal",
            "focus:border-[#087a45] focus:ring-4 focus:ring-[#087a45]/15",
            error ? "border-red-400" : "border-black/15",
          ].join(" ")}
        />

        {isLoading ? (
          <span className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2">
            <Loader2 size={17} className="animate-spin text-[#087a45]" />
          </span>
        ) : query ? (
          <button
            type="button"
            onClick={() => {
              setQuery("");
              if (onChange) onChange("");
              setSuggestions([]);
              setIsOpen(false);
            }}
            className="absolute right-3.5 top-1/2 -translate-y-1/2 flex h-6 w-6 items-center justify-center rounded-full text-zinc-400 hover:bg-zinc-100 hover:text-zinc-600"
          >
            <X size={14} />
          </button>
        ) : null}
      </div>

      {error && <span className="mt-1 block text-xs text-red-500">{error}</span>}

      {/* Floating Suggestions Dropdown */}
      {isOpen && (
        <div className="absolute left-0 right-0 top-full z-[9999] mt-2 max-h-80 overflow-y-auto rounded-2xl border border-zinc-200 bg-white p-2 shadow-2xl backdrop-blur-md">
          <div className="flex items-center justify-between px-3 py-1.5 text-[10px] font-black uppercase tracking-wider text-zinc-400 border-b border-zinc-100 mb-1">
            <span>Location Suggestions</span>
            <span className="text-[#087a45]">Click to autofill</span>
          </div>

          {suggestions.length > 0 ? (
            suggestions.map((item, index) => {
              const isSelected = index === activeIndex;
              return (
                <button
                  key={item.id}
                  type="button"
                  onMouseDown={() => handleSelect(item)}
                  onMouseEnter={() => setActiveIndex(index)}
                  className={`flex w-full items-start gap-3 rounded-xl px-3 py-2.5 text-left transition ${
                    isSelected
                      ? "bg-[#eef7df] text-zinc-900"
                      : "text-zinc-800 hover:bg-zinc-50"
                  }`}
                >
                  <MapPin
                    size={16}
                    className={`mt-0.5 shrink-0 ${
                      isSelected ? "text-[#087a45]" : "text-zinc-400"
                    }`}
                  />
                  <div className="min-w-0 flex-1">
                    <div className="font-bold text-sm text-zinc-900 truncate">
                      {item.primary}
                    </div>
                    {item.secondary && (
                      <div className="text-xs text-zinc-500 truncate mt-0.5">
                        {item.secondary}
                      </div>
                    )}
                  </div>
                </button>
              );
            })
          ) : hasSearched && !isLoading ? (
            <div className="py-4 text-center text-xs text-zinc-400">
              No matching address found. You can enter your details manually below.
            </div>
          ) : null}
        </div>
      )}
    </div>
  );
}
