export type MemberRole = 'ADMIN' | 'MEMBER';

export interface User {
  id: string;
  ig_user_id: string;
  username: string;
  full_name: string;
  profile_pic_url: string;
  promptpay_qr_url?: string;
  promptpay_number?: string;
  created_at?: string;
}

export interface Trip {
  id: string;
  title: string;
  start_date: string;
  end_date: string;
  cover_image_url: string;
  invite_token: string;
  created_by: string;
  created_at: string;
}

export interface TripMember {
  trip_id: string;
  user_id: string;
  role: MemberRole;
  joined_at: string;
  user?: User;
}

export interface Flight {
  id: string;
  trip_id: string;
  airline: string;
  flight_number: string;
  departure_time: string;
  arrival_time: string;
  departure_airport: string;
  arrival_airport: string;
  terminal?: string;
  pnr_code: string;
  ticket_file_url?: string;
  created_by: string;
}

export interface Hotel {
  id: string;
  trip_id: string;
  name: string;
  check_in: string;
  check_out: string;
  address: string;
  booking_reference?: string;
  google_maps_url: string;
  voucher_url?: string;
  created_by: string;
}

export interface DailyPlan {
  id: string;
  trip_id: string;
  plan_date: string;
  time_slot: string;
  title: string;
  location_name: string;
  google_maps_url?: string;
  note?: string;
  created_by: string;
}

export type ActivityType = 'DISNEY' | 'TRAIN' | 'RENTAL_CAR' | 'OTHER';

export interface ActivityTransit {
  id: string;
  trip_id: string;
  title: string;
  type: ActivityType;
  scheduled_at: string;
  ticket_qr_url?: string;
  booking_reference: string;
  location_name?: string;
  has_expense?: boolean;
  expense_amount?: number;
  created_by: string;
}

export type SplitStatus = 'UNPAID' | 'PENDING_VERIFY' | 'CONFIRMED';

export interface ExpenseSplit {
  id: string;
  expense_id: string;
  user_id: string;
  amount: number;
  status: SplitStatus;
  slip_url?: string;
  paid_at?: string;
  user?: User;
}

export interface Expense {
  id: string;
  trip_id: string;
  payer_id: string;
  title: string;
  total_amount: number;
  currency: string;
  receipt_url?: string;
  promptpay_qr_url: string;
  activity_id?: string;
  created_by: string;
  created_at: string;
  splits: ExpenseSplit[];
  payer?: User;
}

export type ChecklistType = 'PERSONAL' | 'SHARED';

export interface ChecklistItem {
  id: string;
  trip_id: string;
  category: ChecklistType;
  title: string;
  assigned_to?: string; // for shared items
  is_shared_done?: boolean;
  created_by: string;
  assigned_user?: User;
}

export interface PersonalChecklistStatus {
  item_id: string;
  user_id: string;
  is_done: boolean;
}
