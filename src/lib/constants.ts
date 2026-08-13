export const CATEGORIES = [
  "Electronics",
  "ID & Cards",
  "Books & Notes",
  "Bags",
  "Clothing",
  "Keys",
  "Accessories",
  "Sports",
  "Stationery",
  "Other",
] as const;

export const CAMPUS_LOCATIONS = [
  "Main Library",
  "Cafeteria",
  "Auditorium",
  "Block A",
  "Block B",
  "Science Lab",
  "Sports Ground",
  "Hostel",
  "Parking Lot",
  "Bus Stop",
  "Other",
] as const;

export const STATUS_LABELS: Record<string, string> = {
  open: "Open",
  claimed: "Claim pending",
  returned: "Returned",
};