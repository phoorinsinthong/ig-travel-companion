# IG Travel Companion - CONTEXT.md

## 1. Domain Model Overview
- **User**: Connects with Instagram account (`ig_user_id`, `username`, `full_name`, `profile_pic_url`, `promptpay_qr_url`, `promptpay_number`).
- **Trip**: Represents a group journey (`id`, `title`, `start_date`, `end_date`, `cover_image_url`, `invite_token`, `created_by`).
- **TripMember**: Relation between Trip and User with RBAC role (`ADMIN` vs `MEMBER`).
- **Flights**: Flight itinerary with airline, flight number, airport codes, times, terminal, PNR code, and barcode pass.
- **Hotels**: Accommodation details with dates, address, booking ref, and one-click Google Maps navigation.
- **DailyPlans**: Vertical timeline with time slot, title, location, and tips/notes.
- **ActivitiesTransit**: Ticket Wallet stubs (Disneyland, Shinkansen, Car rental) with big QR code view and automatic split expense linkage.
- **Expenses ("หารโว้ย")**: Item-by-item split with payer, total amount, currency, PromptPay QR, client-side compressed slip uploads, and payer receipt confirmation.
- **Checklist**: Hybrid model:
  - Personal Checklist: Tracked per-user independently (`personal_checklist_status`).
  - Shared Checklist: Assigned to specific member (`assigned_to`), status visible to all.

## 2. Security & RBAC Matrix
| Action | Item Creator | Member | Trip Admin |
| :--- | :---: | :---: | :---: |
| Create any item | ✅ Yes | ✅ Yes | ✅ Yes |
| Edit/Delete own item | ✅ Yes | ❌ No | ✅ Yes |
| Edit/Delete any member's item | ❌ No | ❌ No | ✅ Yes (Super Admin) |
| Kick member / Change role | ❌ No | ❌ No | ✅ Yes |
| Confirm payment in "หารโว้ย" | ✅ Payer | ❌ No | ✅ Admin Override |

## 3. Tech Stack
- Frontend: React 19 + TypeScript + Vite + Tailwind CSS
- UI Icons: Lucide React
- Visual Delights: Canvas Confetti
- In-App Mobile Browser: `100dvh` viewport, `pb-safe`, `pt-safe` for Instagram Webview
- Client-side Compression: `browser-image-compression` (brings 5-10MB slips down to <300KB)
- Database Migration: PostgreSQL / Supabase ready at `supabase/schema.sql`
