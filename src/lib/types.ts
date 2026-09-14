export type UserRole = "admin" | "electrician";
export type SiteStatus = "in_progress" | "completed";

export type Profile = {
  id: string;
  company_id: string | null;
  role: UserRole | null;
  full_name: string | null;
  phone: string | null;
  avatar_url: string | null;
  created_at: string;
  updated_at: string;
};

export type Company = {
  id: string;
  name: string;
  invite_code: string;
  display_name: string | null;
  created_at: string;
};

export type ItemLibrary = {
  id: string;
  company_id: string;
  category: string;
  name: string;
  default_unit: string;
  brand: string | null;
  created_by: string | null;
  created_at: string;
};

export type WorkLibrary = {
  id: string;
  company_id: string;
  name: string;
  default_unit: string;
  created_by: string | null;
  created_at: string;
};

export type Site = {
  id: string;
  company_id: string;
  created_by: string;
  customer_name: string;
  customer_phone: string | null;
  site_name: string;
  site_address: string | null;
  site_date: string;
  notes: string | null;
  status: SiteStatus;
  created_at: string;
  updated_at: string;
};

export type SiteMaterial = {
  id: string;
  site_id: string;
  company_id: string;
  library_item_id: string | null;
  name: string;
  category: string | null;
  brand: string | null;
  unit: string;
  qty_required: number;
  qty_used: number;
  unit_price: number | null;
  remarks: string | null;
  created_at: string;
  updated_at: string;
};

export type DailyReport = {
  id: string;
  site_id: string;
  company_id: string;
  created_by: string;
  report_date: string;
  notes: string | null;
  pending_work: string | null;
  created_at: string;
};

export type DailyReportWork = {
  id: string;
  report_id: string;
  work_library_id: string | null;
  name: string;
  quantity: number;
  unit: string;
};

export type DailyReportPhoto = {
  id: string;
  report_id: string;
  storage_path: string;
  created_at: string;
};

export const ITEM_CATEGORIES = [
  "MCB & Distribution",
  "Switches",
  "Sockets",
  "Modular Boards",
  "Wires & Cables",
  "Lights",
  "Fans",
  "Conduits & Pipes",
  "Junction Boxes",
  "Electrical Accessories",
  "Tools",
  "Other",
] as const;

export const UNITS = ["Pc", "Meter", "Roll", "Pack", "Job", "Kg", "Box"] as const;
