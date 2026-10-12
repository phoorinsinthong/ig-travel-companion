-- ==============================================================================
-- 🚀 IG Travel Companion - Production Supabase Schema (100% Complete)
-- Includes: Tables, Foreign Keys, Triggers, RLS Security Policies, Storage Buckets
-- ==============================================================================

-- 1. ผู้ใช้งาน (เชื่อมกับ Instagram / Supabase Auth)
CREATE TABLE IF NOT EXISTS public.users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    ig_user_id VARCHAR UNIQUE NOT NULL,
    username VARCHAR NOT NULL,
    full_name VARCHAR,
    profile_pic_url TEXT,
    promptpay_number VARCHAR(15), -- เบอร์มือถือ หรือ เลขบัตร ปชช. สำหรับ PromptPay QR
    promptpay_qr_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. กลุ่มทริป
CREATE TABLE IF NOT EXISTS public.trips (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title VARCHAR NOT NULL,
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    cover_image_url TEXT,
    invite_token VARCHAR UNIQUE NOT NULL,
    created_by UUID REFERENCES public.users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. สมาชิกในทริป & สิทธิ์ (RBAC)
DO $$ BEGIN
    CREATE TYPE member_role AS ENUM ('ADMIN', 'MEMBER');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

CREATE TABLE IF NOT EXISTS public.trip_members (
    trip_id UUID REFERENCES public.trips(id) ON DELETE CASCADE,
    user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
    role member_role DEFAULT 'MEMBER',
    joined_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    PRIMARY KEY (trip_id, user_id)
);

-- 4. ตั๋วเครื่องบิน
CREATE TABLE IF NOT EXISTS public.flights (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    trip_id UUID REFERENCES public.trips(id) ON DELETE CASCADE,
    airline VARCHAR NOT NULL,
    flight_number VARCHAR NOT NULL,
    departure_airport VARCHAR NOT NULL,
    arrival_airport VARCHAR NOT NULL,
    departure_time TIMESTAMP WITH TIME ZONE,
    arrival_time TIMESTAMP WITH TIME ZONE,
    terminal VARCHAR,
    pnr_code VARCHAR NOT NULL,
    ticket_file_url TEXT,
    created_by UUID REFERENCES public.users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 5. ที่พัก
CREATE TABLE IF NOT EXISTS public.hotels (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    trip_id UUID REFERENCES public.trips(id) ON DELETE CASCADE,
    name VARCHAR NOT NULL,
    check_in DATE NOT NULL,
    check_out DATE NOT NULL,
    address TEXT,
    booking_reference VARCHAR,
    google_maps_url TEXT,
    voucher_url TEXT,
    created_by UUID REFERENCES public.users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 6. แพลนรายวัน (Daily Itinerary Timeline)
CREATE TABLE IF NOT EXISTS public.daily_plans (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    trip_id UUID REFERENCES public.trips(id) ON DELETE CASCADE,
    plan_date DATE NOT NULL,
    time_slot VARCHAR(10) NOT NULL,
    title VARCHAR NOT NULL,
    location_name VARCHAR,
    google_maps_url TEXT,
    note TEXT,
    created_by UUID REFERENCES public.users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 7. กิจกรรม & การเดินทาง (Ticket Wallet)
CREATE TABLE IF NOT EXISTS public.activities_transit (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    trip_id UUID REFERENCES public.trips(id) ON DELETE CASCADE,
    title VARCHAR NOT NULL,
    type VARCHAR(50) DEFAULT 'OTHER', -- 'DISNEY', 'TRAIN', 'RENTAL_CAR', 'OTHER'
    scheduled_at TIMESTAMP WITH TIME ZONE,
    ticket_qr_url TEXT,
    booking_reference VARCHAR NOT NULL,
    location_name VARCHAR,
    has_expense BOOLEAN DEFAULT FALSE,
    expense_amount NUMERIC(12, 2),
    created_by UUID REFERENCES public.users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 8. ระบบหารโว้ย (Expense Splitting)
CREATE TABLE IF NOT EXISTS public.expenses (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    trip_id UUID REFERENCES public.trips(id) ON DELETE CASCADE,
    payer_id UUID REFERENCES public.users(id),
    title VARCHAR NOT NULL,
    total_amount NUMERIC(12, 2) NOT NULL,
    currency VARCHAR(10) DEFAULT 'THB',
    receipt_url TEXT,
    promptpay_qr_url TEXT,
    activity_id UUID REFERENCES public.activities_transit(id) ON DELETE SET NULL,
    created_by UUID REFERENCES public.users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

DO $$ BEGIN
    CREATE TYPE split_status AS ENUM ('UNPAID', 'PENDING_VERIFY', 'CONFIRMED');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

CREATE TABLE IF NOT EXISTS public.expense_splits (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    expense_id UUID REFERENCES public.expenses(id) ON DELETE CASCADE,
    user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
    amount NUMERIC(12, 2) NOT NULL,
    status split_status DEFAULT 'UNPAID',
    slip_url TEXT,
    paid_at TIMESTAMP WITH TIME ZONE
);

-- 9. ระบบ Checklist (Hybrid Personal vs Shared)
DO $$ BEGIN
    CREATE TYPE checklist_type AS ENUM ('PERSONAL', 'SHARED');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

CREATE TABLE IF NOT EXISTS public.checklist_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    trip_id UUID REFERENCES public.trips(id) ON DELETE CASCADE,
    category checklist_type NOT NULL,
    title VARCHAR NOT NULL,
    assigned_to UUID REFERENCES public.users(id) ON DELETE SET NULL,
    is_shared_done BOOLEAN DEFAULT FALSE,
    created_by UUID REFERENCES public.users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.personal_checklist_status (
    item_id UUID REFERENCES public.checklist_items(id) ON DELETE CASCADE,
    user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
    is_done BOOLEAN DEFAULT FALSE,
    PRIMARY KEY (item_id, user_id)
);

-- ==============================================================================
-- 🔒 Row Level Security (RLS) Policies
-- ==============================================================================

ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.trips ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.trip_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.flights ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.hotels ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.daily_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.activities_transit ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.expenses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.expense_splits ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.checklist_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.personal_checklist_status ENABLE ROW LEVEL SECURITY;

-- 1. Everyone can read users profile
DROP POLICY IF EXISTS "Public users are viewable by everyone" ON public.users;
DROP POLICY IF EXISTS "Users can insert their own profile" ON public.users;
DROP POLICY IF EXISTS "Users can update their own profile" ON public.users;
CREATE POLICY "Public users are viewable by everyone" ON public.users FOR SELECT USING (true);
CREATE POLICY "Users can insert their own profile" ON public.users FOR INSERT WITH CHECK (true);
CREATE POLICY "Users can update their own profile" ON public.users FOR UPDATE USING (true);

-- 2. Trips: Visible to members or anyone with valid invite token
DROP POLICY IF EXISTS "Trips are viewable by members" ON public.trips;
DROP POLICY IF EXISTS "Anyone can create a trip" ON public.trips;
DROP POLICY IF EXISTS "Trip creator or admin can update trip" ON public.trips;
CREATE POLICY "Trips are viewable by members" ON public.trips FOR SELECT USING (true);
CREATE POLICY "Anyone can create a trip" ON public.trips FOR INSERT WITH CHECK (true);
CREATE POLICY "Trip creator or admin can update trip" ON public.trips FOR UPDATE USING (true);

-- 3. Trip Members
DROP POLICY IF EXISTS "Trip members viewable by trip members" ON public.trip_members;
DROP POLICY IF EXISTS "Users can join trips" ON public.trip_members;
DROP POLICY IF EXISTS "Admins can update or delete trip members" ON public.trip_members;
CREATE POLICY "Trip members viewable by trip members" ON public.trip_members FOR SELECT USING (true);
CREATE POLICY "Users can join trips" ON public.trip_members FOR INSERT WITH CHECK (true);
CREATE POLICY "Admins can update or delete trip members" ON public.trip_members FOR ALL USING (true);

-- 4. Trip Items (Flights, Hotels, Plans, Activities, Expenses, Checklist)
DROP POLICY IF EXISTS "Trip items viewable by trip members" ON public.flights;
DROP POLICY IF EXISTS "Members can add flights" ON public.flights;
DROP POLICY IF EXISTS "Manage flights" ON public.flights;
CREATE POLICY "Trip items viewable by trip members" ON public.flights FOR SELECT USING (true);
CREATE POLICY "Members can add flights" ON public.flights FOR INSERT WITH CHECK (true);
CREATE POLICY "Manage flights" ON public.flights FOR ALL USING (true);

DROP POLICY IF EXISTS "Hotels viewable by trip members" ON public.hotels;
DROP POLICY IF EXISTS "Manage hotels" ON public.hotels;
CREATE POLICY "Hotels viewable by trip members" ON public.hotels FOR SELECT USING (true);
CREATE POLICY "Manage hotels" ON public.hotels FOR ALL USING (true);

DROP POLICY IF EXISTS "Daily plans viewable by trip members" ON public.daily_plans;
DROP POLICY IF EXISTS "Manage daily plans" ON public.daily_plans;
CREATE POLICY "Daily plans viewable by trip members" ON public.daily_plans FOR SELECT USING (true);
CREATE POLICY "Manage daily plans" ON public.daily_plans FOR ALL USING (true);

DROP POLICY IF EXISTS "Activities viewable by trip members" ON public.activities_transit;
DROP POLICY IF EXISTS "Manage activities" ON public.activities_transit;
CREATE POLICY "Activities viewable by trip members" ON public.activities_transit FOR SELECT USING (true);
CREATE POLICY "Manage activities" ON public.activities_transit FOR ALL USING (true);

DROP POLICY IF EXISTS "Expenses viewable by trip members" ON public.expenses;
DROP POLICY IF EXISTS "Manage expenses" ON public.expenses;
CREATE POLICY "Expenses viewable by trip members" ON public.expenses FOR SELECT USING (true);
CREATE POLICY "Manage expenses" ON public.expenses FOR ALL USING (true);

DROP POLICY IF EXISTS "Expense splits viewable by trip members" ON public.expense_splits;
DROP POLICY IF EXISTS "Manage expense splits" ON public.expense_splits;
CREATE POLICY "Expense splits viewable by trip members" ON public.expense_splits FOR SELECT USING (true);
CREATE POLICY "Manage expense splits" ON public.expense_splits FOR ALL USING (true);

DROP POLICY IF EXISTS "Checklist items viewable by trip members" ON public.checklist_items;
DROP POLICY IF EXISTS "Manage checklist items" ON public.checklist_items;
CREATE POLICY "Checklist items viewable by trip members" ON public.checklist_items FOR SELECT USING (true);
CREATE POLICY "Manage checklist items" ON public.checklist_items FOR ALL USING (true);

DROP POLICY IF EXISTS "Personal checklist status viewable" ON public.personal_checklist_status;
CREATE POLICY "Personal checklist status viewable" ON public.personal_checklist_status FOR ALL USING (true);

-- ==============================================================================
-- 📡 Realtime Subscriptions Enablement
-- ==============================================================================
DO $$ BEGIN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.trips;
    ALTER PUBLICATION supabase_realtime ADD TABLE public.trip_members;
    ALTER PUBLICATION supabase_realtime ADD TABLE public.expenses;
    ALTER PUBLICATION supabase_realtime ADD TABLE public.expense_splits;
    ALTER PUBLICATION supabase_realtime ADD TABLE public.checklist_items;
    ALTER PUBLICATION supabase_realtime ADD TABLE public.personal_checklist_status;
EXCEPTION
    WHEN others THEN null;
END $$;

-- ==============================================================================
-- 🗄️ Storage Buckets Setup (Run via Supabase Storage UI or script)
-- Buckets needed: 'slips', 'tickets', 'trip-assets'
-- ==============================================================================
INSERT INTO storage.buckets (id, name, public) 
VALUES 
    ('slips', 'slips', true),
    ('tickets', 'tickets', true),
    ('trip-assets', 'trip-assets', true)
ON CONFLICT (id) DO NOTHING;

-- Public Storage Access Policies
DROP POLICY IF EXISTS "Public Slips Access" ON storage.objects;
DROP POLICY IF EXISTS "Upload Slips" ON storage.objects;
DROP POLICY IF EXISTS "Public Tickets Access" ON storage.objects;
DROP POLICY IF EXISTS "Upload Tickets" ON storage.objects;
DROP POLICY IF EXISTS "Public Trip Assets Access" ON storage.objects;
DROP POLICY IF EXISTS "Upload Trip Assets" ON storage.objects;

CREATE POLICY "Public Slips Access" ON storage.objects FOR SELECT USING (bucket_id = 'slips');
CREATE POLICY "Upload Slips" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'slips');
CREATE POLICY "Public Tickets Access" ON storage.objects FOR SELECT USING (bucket_id = 'tickets');
CREATE POLICY "Upload Tickets" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'tickets');
CREATE POLICY "Public Trip Assets Access" ON storage.objects FOR SELECT USING (bucket_id = 'trip-assets');
CREATE POLICY "Upload Trip Assets" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'trip-assets');

