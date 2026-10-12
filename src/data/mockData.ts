import { User, Trip, TripMember, Flight, Hotel, DailyPlan, ActivityTransit, Expense, ChecklistItem } from '../types/database';

export const INITIAL_USERS: User[] = [
  {
    id: 'usr-1',
    ig_user_id: '17841401234567890',
    username: 'pun.travels',
    full_name: 'Pun Natthapat',
    profile_pic_url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
    promptpay_number: '0812345678',
    promptpay_qr_url: 'https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=00020101021129370016A000000677010111011300668123456785802TH53037646304',
  },
  {
    id: 'usr-2',
    ig_user_id: '17841409876543210',
    username: 'mook_journey',
    full_name: 'Mook Kanya',
    profile_pic_url: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=150&auto=format&fit=crop&q=80',
    promptpay_number: '0898765432',
    promptpay_qr_url: 'https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=00020101021129370016A000000677010111011300668987654325802TH53037646304',
  },
  {
    id: 'usr-3',
    ig_user_id: '17841405555555555',
    username: 'bright.film',
    full_name: 'Bright Tanyatorn',
    profile_pic_url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
    promptpay_number: '0855555555',
    promptpay_qr_url: 'https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=00020101021129370016A000000677010111011300668555555555802TH53037646304',
  },
  {
    id: 'usr-4',
    ig_user_id: '17841407777777777',
    username: 'ploy_chilling',
    full_name: 'Ploy Supisara',
    profile_pic_url: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80',
    promptpay_number: '0877777777',
    promptpay_qr_url: 'https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=00020101021129370016A000000677010111011300668777777775802TH53037646304',
  }
];

export const INITIAL_TRIP: Trip = {
  id: 'trip-tokyo-2026',
  title: '🇯🇵 Tokyo Autumn Leaves & Disneyland 2026',
  start_date: '2026-10-18',
  end_date: '2026-10-24',
  cover_image_url: 'https://images.unsplash.com/photo-1503899036084-c55cdd92da26?w=800&auto=format&fit=crop&q=80',
  invite_token: 'TOKYO-IG-8899',
  created_by: 'usr-1',
  created_at: new Date().toISOString(),
};

export const INITIAL_MEMBERS: TripMember[] = [
  { trip_id: 'trip-tokyo-2026', user_id: 'usr-1', role: 'ADMIN', joined_at: '2026-10-01T10:00:00Z', user: INITIAL_USERS[0] },
  { trip_id: 'trip-tokyo-2026', user_id: 'usr-2', role: 'MEMBER', joined_at: '2026-10-02T11:20:00Z', user: INITIAL_USERS[1] },
  { trip_id: 'trip-tokyo-2026', user_id: 'usr-3', role: 'MEMBER', joined_at: '2026-10-02T12:05:00Z', user: INITIAL_USERS[2] },
  { trip_id: 'trip-tokyo-2026', user_id: 'usr-4', role: 'MEMBER', joined_at: '2026-10-03T15:40:00Z', user: INITIAL_USERS[3] },
];

export const INITIAL_FLIGHTS: Flight[] = [
  {
    id: 'fl-1',
    trip_id: 'trip-tokyo-2026',
    airline: 'Thai Airways (TG)',
    flight_number: 'TG676',
    departure_airport: 'BKK (Suvarnabhumi)',
    arrival_airport: 'HND (Haneda Tokyo)',
    departure_time: '2026-10-18T07:35:00+07:00',
    arrival_time: '2026-10-18T15:45:00+09:00',
    terminal: 'Terminal 3',
    pnr_code: 'TG88J2',
    ticket_file_url: 'https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?w=600&auto=format&fit=crop&q=80',
    created_by: 'usr-1'
  },
  {
    id: 'fl-2',
    trip_id: 'trip-tokyo-2026',
    airline: 'Thai Airways (TG)',
    flight_number: 'TG677',
    departure_airport: 'HND (Haneda Tokyo)',
    arrival_airport: 'BKK (Suvarnabhumi)',
    departure_time: '2026-10-24T17:25:00+09:00',
    arrival_time: '2026-10-24T21:55:00+07:00',
    terminal: 'Terminal 3',
    pnr_code: 'TG88J2',
    ticket_file_url: 'https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?w=600&auto=format&fit=crop&q=80',
    created_by: 'usr-1'
  }
];

export const INITIAL_HOTELS: Hotel[] = [
  {
    id: 'ht-1',
    trip_id: 'trip-tokyo-2026',
    name: 'Hotel Gracery Shinjuku (Godzilla Hotel)',
    check_in: '2026-10-18',
    check_out: '2026-10-24',
    address: '1-19-1 Kabukicho, Shinjuku-ku, Tokyo 160-8466, Japan',
    booking_reference: 'AGODA-JP-9928172',
    google_maps_url: 'https://maps.google.com/?q=Hotel+Gracery+Shinjuku',
    voucher_url: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=600&auto=format&fit=crop&q=80',
    created_by: 'usr-1'
  }
];

export const INITIAL_DAILY_PLANS: DailyPlan[] = [
  {
    id: 'dp-1',
    trip_id: 'trip-tokyo-2026',
    plan_date: '2026-10-18',
    time_slot: '16:30',
    title: 'นั่งรถไฟ Skyliner เข้าโรงแรม Hotel Gracery Shinjuku',
    location_name: 'Shinjuku Kabukicho',
    google_maps_url: 'https://maps.google.com/?q=Shinjuku+Station',
    note: 'เช็คอินฝากกระเป๋า ถ่ายรูปหัวก๊อตซิลล่าที่ระเบียงชั้น 8',
    created_by: 'usr-1'
  },
  {
    id: 'dp-2',
    trip_id: 'trip-tokyo-2026',
    plan_date: '2026-10-18',
    time_slot: '19:00',
    title: 'ทานมื้อค่ำ Yakiniku Jumbo Hanare & เดินชินจูกุ',
    location_name: 'Yakiniku Jumbo Hanare',
    google_maps_url: 'https://maps.google.com/?q=Yakiniku+Jumbo+Hanare',
    note: 'จองไว้เวลา 19:30 อย่าไปสายเด็ดขาด',
    created_by: 'usr-2'
  },
  {
    id: 'dp-3',
    trip_id: 'trip-tokyo-2026',
    plan_date: '2026-10-19',
    time_slot: '08:00',
    title: '🏰 ตะลุย Tokyo Disneyland เต็มวัน!',
    location_name: 'Tokyo Disneyland',
    google_maps_url: 'https://maps.google.com/?q=Tokyo+Disneyland',
    note: 'เปิดแอป Tokyo Disney Resort จอง DPA เครื่องเล่น Beauty and the Beast ทันทีที่แตะตั๋วเข้าปาร์ค',
    created_by: 'usr-1'
  },
  {
    id: 'dp-4',
    trip_id: 'trip-tokyo-2026',
    plan_date: '2026-10-20',
    time_slot: '10:00',
    title: 'ไหว้พระวัด Asakusa Sensoji & ชิมชาเขียวเข้มระดับ 7',
    location_name: 'Senso-ji Temple',
    google_maps_url: 'https://maps.google.com/?q=Sensoji+Temple',
    note: 'แวะร้าน Suzukien Matcha ใกล้วัด',
    created_by: 'usr-3'
  },
  {
    id: 'dp-5',
    trip_id: 'trip-tokyo-2026',
    plan_date: '2026-10-20',
    time_slot: '16:30',
    title: 'ชมพระอาทิตย์ตกดินที่ Shibuya Sky Rooftop',
    location_name: 'SHIBUYA SKY',
    google_maps_url: 'https://maps.google.com/?q=Shibuya+Sky',
    note: 'ห้ามนำขาตั้งกล้องและกระเป๋าเป้ใบใหญ่ขึ้นไป ต้องฝากล็อกเกอร์ 100 เยน',
    created_by: 'usr-4'
  }
];

export const INITIAL_ACTIVITIES: ActivityTransit[] = [
  {
    id: 'act-1',
    trip_id: 'trip-tokyo-2026',
    title: '🏰 ตั๋ว Tokyo Disneyland 1-Day Passport (4 ท่าน)',
    type: 'DISNEY',
    scheduled_at: '2026-10-19T08:30:00+09:00',
    booking_reference: 'TDL-2026-X99281',
    ticket_qr_url: 'https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=TDL-VALID-2026-10-19-DISNEY-PASSPORT',
    location_name: 'Maihama, Urayasu, Chiba',
    has_expense: true,
    expense_amount: 12800,
    created_by: 'usr-1'
  },
  {
    id: 'act-2',
    trip_id: 'trip-tokyo-2026',
    title: '🚄 ตั๋วรถไฟ Shinkansen Nozomi (Tokyo ↔ Kyoto)',
    type: 'TRAIN',
    scheduled_at: '2026-10-21T09:12:00+09:00',
    booking_reference: 'JR-SHINKANSEN-88219',
    ticket_qr_url: 'https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=JR-EAST-SMARTEX-CAR-7-SEAT-12A',
    location_name: 'Tokyo Station Platform 14',
    has_expense: true,
    expense_amount: 17200,
    created_by: 'usr-3'
  },
  {
    id: 'act-3',
    trip_id: 'trip-tokyo-2026',
    title: '🚗 รถเช่า Toyota Alphard 7 ที่นั่ง (วันเที่ยวฟูจิ)',
    type: 'RENTAL_CAR',
    scheduled_at: '2026-10-22T08:00:00+09:00',
    booking_reference: 'TOYOTA-RENT-00219',
    location_name: 'Toyota Rent a Car Shinjuku',
    has_expense: false,
    created_by: 'usr-2'
  }
];

export const INITIAL_EXPENSES: Expense[] = [
  {
    id: 'exp-1',
    trip_id: 'trip-tokyo-2026',
    payer_id: 'usr-1',
    title: '🎟️ ตั๋ว Tokyo Disneyland 1-Day Passport (4 คน)',
    total_amount: 12800,
    currency: 'THB',
    receipt_url: 'https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?w=600&auto=format&fit=crop&q=80',
    promptpay_qr_url: INITIAL_USERS[0].promptpay_qr_url || '',
    activity_id: 'act-1',
    created_by: 'usr-1',
    created_at: '2026-10-05T14:20:00Z',
    payer: INITIAL_USERS[0],
    splits: [
      { id: 'sp-1-1', expense_id: 'exp-1', user_id: 'usr-1', amount: 3200, status: 'CONFIRMED', user: INITIAL_USERS[0] },
      { id: 'sp-1-2', expense_id: 'exp-1', user_id: 'usr-2', amount: 3200, status: 'CONFIRMED', paid_at: '2026-10-06T10:00:00Z', user: INITIAL_USERS[1] },
      { id: 'sp-1-3', expense_id: 'exp-1', user_id: 'usr-3', amount: 3200, status: 'PENDING_VERIFY', slip_url: 'https://images.unsplash.com/photo-1554224155-6726b3ff858f?w=400&auto=format&fit=crop&q=80', paid_at: '2026-10-08T18:30:00Z', user: INITIAL_USERS[2] },
      { id: 'sp-1-4', expense_id: 'exp-1', user_id: 'usr-4', amount: 3200, status: 'UNPAID', user: INITIAL_USERS[3] },
    ]
  },
  {
    id: 'exp-2',
    trip_id: 'trip-tokyo-2026',
    payer_id: 'usr-2',
    title: '🥩 ค่ามัดจำร้านเนื้อย่าง Yakiniku Jumbo Hanare',
    total_amount: 4000,
    currency: 'THB',
    receipt_url: 'https://images.unsplash.com/photo-1544025162-d76694265947?w=600&auto=format&fit=crop&q=80',
    promptpay_qr_url: INITIAL_USERS[1].promptpay_qr_url || '',
    created_by: 'usr-2',
    created_at: '2026-10-08T19:00:00Z',
    payer: INITIAL_USERS[1],
    splits: [
      { id: 'sp-2-1', expense_id: 'exp-2', user_id: 'usr-1', amount: 1000, status: 'UNPAID', user: INITIAL_USERS[0] },
      { id: 'sp-2-2', expense_id: 'exp-2', user_id: 'usr-2', amount: 1000, status: 'CONFIRMED', user: INITIAL_USERS[1] },
      { id: 'sp-2-3', expense_id: 'exp-2', user_id: 'usr-3', amount: 1000, status: 'CONFIRMED', paid_at: '2026-10-09T09:15:00Z', user: INITIAL_USERS[2] },
      { id: 'sp-2-4', expense_id: 'exp-2', user_id: 'usr-4', amount: 1000, status: 'UNPAID', user: INITIAL_USERS[3] },
    ]
  }
];

export const INITIAL_CHECKLIST: ChecklistItem[] = [
  // Shared Items
  { id: 'chk-s1', trip_id: 'trip-tokyo-2026', category: 'SHARED', title: '🔌 หัวแปลงปลั๊ก Universal Adapter (2 ชุด)', assigned_to: 'usr-2', is_shared_done: true, created_by: 'usr-1', assigned_user: INITIAL_USERS[1] },
  { id: 'chk-s2', trip_id: 'trip-tokyo-2026', category: 'SHARED', title: '📶 Pocket WiFi ญี่ปุ่น + ซิมสำรอง Unlimited', assigned_to: 'usr-1', is_shared_done: true, created_by: 'usr-1', assigned_user: INITIAL_USERS[0] },
  { id: 'chk-s3', trip_id: 'trip-tokyo-2026', category: 'SHARED', title: '💊 ยาสามัญ (ยาแก้แพ้, แก้ปวด, ยาแก้ท้องเสีย, พลาสเตอร์)', assigned_to: 'usr-3', is_shared_done: false, created_by: 'usr-2', assigned_user: INITIAL_USERS[2] },
  { id: 'chk-s4', trip_id: 'trip-tokyo-2026', category: 'SHARED', title: '💨 ไดร์เป่าผมและที่หนีบผม (กำลังไฟ 100V-240V)', assigned_to: 'usr-4', is_shared_done: false, created_by: 'usr-2', assigned_user: INITIAL_USERS[3] },

  // Personal Items
  { id: 'chk-p1', trip_id: 'trip-tokyo-2026', category: 'PERSONAL', title: '🛂 พาสปอร์ต (อายุเหลือเกิน 6 เดือน)', created_by: 'usr-1' },
  { id: 'chk-p2', trip_id: 'trip-tokyo-2026', category: 'PERSONAL', title: '📱 ลงทะเบียน Visit Japan Web (QR รหัสศุลกากร/ตม.)', created_by: 'usr-1' },
  { id: 'chk-p3', trip_id: 'trip-tokyo-2026', category: 'PERSONAL', title: '🔋 Power Bank ความจุไม่เกิน 20,000 mAh (ถือขึ้นเครื่อง)', created_by: 'usr-1' },
  { id: 'chk-p4', trip_id: 'trip-tokyo-2026', category: 'PERSONAL', title: '💳 บัตร Travel Card / เงินสดเยนสำหรับหยอดตู้', created_by: 'usr-1' },
  { id: 'chk-p5', trip_id: 'trip-tokyo-2026', category: 'PERSONAL', title: '🧥 เสื้อโค้ทกันหนาว / ฮีทเทค (อุณหภูมิประมาณ 14-18°C)', created_by: 'usr-1' },
];

export const INITIAL_PERSONAL_STATUS: Record<string, boolean> = {
  'chk-p1': true,
  'chk-p2': true,
  'chk-p3': false,
  'chk-p4': true,
  'chk-p5': false,
};
