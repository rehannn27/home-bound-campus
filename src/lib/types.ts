export type ItemKind = "lost" | "found";
export type ItemStatus = "open" | "claimed" | "returned";

export interface Item {
  id: string;
  kind: ItemKind;
  title: string;
  description: string;
  category: string;
  brand: string | null;
  color: string | null;
  location: string;
  occurred_on: string;
  images: string[];
  user_id: string;
  status: ItemStatus;
  contact: string | null;
  created_at: string;
}

export interface Profile {
  id: string;
  name: string;
  email: string;
  student_id: string | null;
  profile_image: string | null;
  department: string | null;
  year: string | null;
  banned: boolean;
  created_at: string;
}

export interface Claim {
  id: string;
  item_id: string;
  claimer_id: string;
  owner_id: string;
  proof: string;
  status: "pending" | "approved" | "rejected";
  created_at: string;
  updated_at: string;
}

export interface Message {
  id: string;
  sender_id: string;
  receiver_id: string;
  item_id: string | null;
  content: string;
  read_at: string | null;
  created_at: string;
}

export interface AppNotification {
  id: string;
  user_id: string;
  message: string;
  type: string;
  link: string | null;
  is_read: boolean;
  created_at: string;
}