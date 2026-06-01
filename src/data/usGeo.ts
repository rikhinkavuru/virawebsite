/** Approximate [lng, lat] centroids for US states, used to place an optimistic
 *  "pending" node on the map the instant an application is submitted. Static and
 *  dependency-free — no geocoding API call. */
export const STATE_CENTROIDS: Record<string, [number, number]> = {
  AL: [-86.79, 32.81], AK: [-152.4, 64.2], AZ: [-111.66, 34.29], AR: [-92.44, 34.9],
  CA: [-119.68, 37.18], CO: [-105.55, 39.0], CT: [-72.76, 41.6], DE: [-75.51, 39.0],
  DC: [-77.02, 38.9], FL: [-81.69, 28.63], GA: [-83.43, 32.64], HI: [-156.3, 20.3],
  ID: [-114.66, 44.35], IL: [-89.0, 40.0], IN: [-86.28, 39.9], IA: [-93.5, 42.07],
  KS: [-98.38, 38.5], KY: [-84.86, 37.53], LA: [-91.96, 31.05], ME: [-69.24, 45.37],
  MD: [-76.8, 39.06], MA: [-71.8, 42.26], MI: [-84.71, 43.33], MN: [-94.31, 46.28],
  MS: [-89.66, 32.74], MO: [-92.46, 38.36], MT: [-109.65, 47.05], NE: [-99.79, 41.53],
  NV: [-116.65, 39.36], NH: [-71.58, 43.69], NJ: [-74.52, 40.19], NM: [-106.11, 34.41],
  NY: [-75.5, 42.94], NC: [-79.4, 35.54], ND: [-100.3, 47.45], OH: [-82.79, 40.29],
  OK: [-97.5, 35.58], OR: [-120.55, 43.94], PA: [-77.8, 40.87], RI: [-71.51, 41.68],
  SC: [-80.9, 33.86], SD: [-100.23, 44.44], TN: [-86.35, 35.86], TX: [-99.3, 31.5],
  UT: [-111.67, 39.32], VT: [-72.71, 44.07], VA: [-78.85, 37.52], WA: [-120.45, 47.38],
  WV: [-80.61, 38.64], WI: [-89.99, 44.62], WY: [-107.55, 42.99],
};

export const US_STATES: { code: string; name: string }[] = [
  { code: "AL", name: "Alabama" }, { code: "AK", name: "Alaska" }, { code: "AZ", name: "Arizona" },
  { code: "AR", name: "Arkansas" }, { code: "CA", name: "California" }, { code: "CO", name: "Colorado" },
  { code: "CT", name: "Connecticut" }, { code: "DE", name: "Delaware" }, { code: "DC", name: "District of Columbia" },
  { code: "FL", name: "Florida" }, { code: "GA", name: "Georgia" }, { code: "HI", name: "Hawaii" },
  { code: "ID", name: "Idaho" }, { code: "IL", name: "Illinois" }, { code: "IN", name: "Indiana" },
  { code: "IA", name: "Iowa" }, { code: "KS", name: "Kansas" }, { code: "KY", name: "Kentucky" },
  { code: "LA", name: "Louisiana" }, { code: "ME", name: "Maine" }, { code: "MD", name: "Maryland" },
  { code: "MA", name: "Massachusetts" }, { code: "MI", name: "Michigan" }, { code: "MN", name: "Minnesota" },
  { code: "MS", name: "Mississippi" }, { code: "MO", name: "Missouri" }, { code: "MT", name: "Montana" },
  { code: "NE", name: "Nebraska" }, { code: "NV", name: "Nevada" }, { code: "NH", name: "New Hampshire" },
  { code: "NJ", name: "New Jersey" }, { code: "NM", name: "New Mexico" }, { code: "NY", name: "New York" },
  { code: "NC", name: "North Carolina" }, { code: "ND", name: "North Dakota" }, { code: "OH", name: "Ohio" },
  { code: "OK", name: "Oklahoma" }, { code: "OR", name: "Oregon" }, { code: "PA", name: "Pennsylvania" },
  { code: "RI", name: "Rhode Island" }, { code: "SC", name: "South Carolina" }, { code: "SD", name: "South Dakota" },
  { code: "TN", name: "Tennessee" }, { code: "TX", name: "Texas" }, { code: "UT", name: "Utah" },
  { code: "VT", name: "Vermont" }, { code: "VA", name: "Virginia" }, { code: "WA", name: "Washington" },
  { code: "WV", name: "West Virginia" }, { code: "WI", name: "Wisconsin" }, { code: "WY", name: "Wyoming" },
];
