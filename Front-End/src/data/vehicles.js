export const VEHICLE_YEARS = Array.from(
  { length: 30 },
  (_, i) => new Date().getFullYear() - i
);

export const MAKES = [
  "Acura",
  "Audi",
  "BMW",
  "Buick",
  "Cadillac",
  "Chevrolet",
  "Chrysler",
  "Dodge",
  "Ford",
  "GMC",
  "Honda",
  "Hyundai",
  "Infiniti",
  "Jeep",
  "Kia",
  "Lexus",
  "Lincoln",
  "Mazda",
  "Mercedes-Benz",
  "Nissan",
  "Ram",
  "Subaru",
  "Tesla",
  "Toyota",
  "Volkswagen",
  "Volvo",
];

export const MODELS = {
  Toyota: [
    "Camry",
    "Corolla",
    "RAV4",
    "Highlander",
    "Tacoma",
    "Tundra",
    "4Runner",
  ],

  Honda: [
    "Accord",
    "Civic",
    "CR-V",
    "Pilot",
    "HR-V",
    "Ridgeline",
  ],

  Ford: [
    "F-150",
    "Escape",
    "Explorer",
    "Mustang",
    "Bronco",
    "Ranger",
    "Edge",
  ],

  Chevrolet: [
    "Silverado",
    "Equinox",
    "Tahoe",
    "Malibu",
    "Traverse",
    "Colorado",
  ],

  Nissan: [
    "Altima",
    "Sentra",
    "Rogue",
    "Pathfinder",
    "Frontier",
    "Titan",
  ],

  BMW: [
    "3 Series",
    "5 Series",
    "X3",
    "X5",
    "7 Series",
  ],

  "Mercedes-Benz": [
    "C-Class",
    "E-Class",
    "GLC",
    "GLE",
    "S-Class",
  ],

  Jeep: [
    "Wrangler",
    "Grand Cherokee",
    "Cherokee",
    "Compass",
    "Gladiator",
  ],
};

export const CONDITIONS = [
  {
    value: "excellent",
    label: "Excellent",
    description: "Like new",
    multiplier: 1.1,
  },
  {
    value: "good",
    label: "Good",
    description: "Minor wear",
    multiplier: 1,
  },
  {
    value: "fair",
    label: "Fair",
    description: "Normal wear",
    multiplier: 0.87,
  },
  {
    value: "poor",
    label: "Poor",
    description: "Needs work",
    multiplier: 0.7,
  },
];

export const TITLE_STATUSES = [
  {
    value: "clear-title",
    label: "Clear title",
    description: "No active lien",
    multiplier: 1,
  },
  {
    value: "paid-off-vehicle",
    label: "Paid-off vehicle",
    description: "Loan is paid",
    multiplier: 1,
  },
  {
    value: "existing-lien",
    label: "Existing lien",
    description: "Vehicle currently has a lien",
    multiplier: 0.92,
  },
  {
    value: "rebuilt-title",
    label: "Rebuilt title",
    description: "Vehicle has a rebuilt title",
    multiplier: 0.75,
  },
  {
    value: "i-dont-know",
    label: "I don't know",
    description: "Title status unknown",
    multiplier: 0.95,
  },
];

export const EMPLOYMENT = [
  "Employed",
  "Self-employed",
  "Retired",
  "Other",
];