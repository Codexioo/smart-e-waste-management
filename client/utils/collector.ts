export interface PickupRequest {
  id: number;
  request_code: string;
  customer_name: string;
  customer_email: string;
  customer_telephone: string;
  district: string;
  city: string;
  address: string;
  waste_types: string;
  status: string;
  latitude?: number | null;
  longitude?: number | null;
  create_date?: string;
  started_at?: string | null;
  collected_at?: string | null;
  waste_weight?: number | null;
}

export interface CollectorStats {
  assigned_count: number;
  in_progress_count: number;
  completed_count: number;
  cancelled_count: number;
  today_earnings: number;
  week_earnings: number;
  total_earnings: number;
  completion_rate: number;
  weekly_earnings: { day: string; points: number }[];
  user: {
    username: string;
    email: string;
    level: string;
    total_reward_points: number;
    profile_image?: string | null;
  };
}

export type PickupFilter = "all" | "pending" | "completed";

export const getPickupDisplayStatus = (item: PickupRequest): string => {
  if (item.status === "completed") return "COMPLETED";
  if (item.started_at && !item.collected_at) return "IN PROGRESS";
  if (item.status === "Assigned" && !item.started_at) return "PENDING";
  return item.status.toUpperCase();
};

export const getStatusColor = (status: string): string => {
  const s = status.toLowerCase();
  if (s.includes("pending") || s === "assigned") return "#F59E0B";
  if (s.includes("progress")) return "#3B82F6";
  if (s.includes("complete")) return "#22C55E";
  if (s.includes("reject") || s.includes("cancel")) return "#EF4444";
  return "#64748B";
};

export const filterPickups = (items: PickupRequest[], filter: PickupFilter): PickupRequest[] => {
  if (filter === "all") return items;
  if (filter === "pending") {
    return items.filter((r) => r.status === "Assigned" || (r.started_at && !r.collected_at));
  }
  return items.filter((r) => r.status === "completed");
};

export const formatWasteTypes = (wasteTypes: string): string[] =>
  wasteTypes.split(",").map((t) => t.trim()).filter(Boolean);
