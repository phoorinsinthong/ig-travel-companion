import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import {
  Plane,
  Building2,
  CalendarDays,
  Plus,
  MapPin,
  ExternalLink,
  QrCode,
  Clock,
  Trash2,
  X,
  FileText,
  AlertCircle,
  Navigation,
  Loader2,
} from 'lucide-react';

export const TravelProcessTab: React.FC = () => {
  const {
    flights,
    hotels,
    dailyPlans,
    currentTrip,
    canManageItem,
    addFlight,
    deleteFlight,
    addHotel,
    deleteHotel,
    addDailyPlan,
    deleteDailyPlan,
  } = useApp();

  const [subTab, setSubTab] = useState<'flights' | 'hotels' | 'itinerary'>('flights');
  const [selectedTicketUrl, setSelectedTicketUrl] = useState<string | null>(null);

  // Itinerary selected date
  const [selectedDate, setSelectedDate] = useState<string>('2026-10-18');

  // Modal states
  const [showFlightModal, setShowFlightModal] = useState(false);
  const [showHotelModal, setShowHotelModal] = useState(false);
  const [showPlanModal, setShowPlanModal] = useState(false);

  // Form states
  const [newAirline, setNewAirline] = useState('Thai Airways');
  const [newFlightNo, setNewFlightNo] = useState('TG676');
  const [newDepAirport, setNewDepAirport] = useState('BKK');
  const [newArrAirport, setNewArrAirport] = useState('HND');
  const [newFlightDate, setNewFlightDate] = useState(
    currentTrip?.start_date || new Date().toISOString().split('T')[0]
  );
  const [newDepTime, setNewDepTime] = useState('07:35');
  const [newArrTime, setNewArrTime] = useState('15:45');
  const [newTerminal, setNewTerminal] = useState('T3');
  const [newPnr, setNewPnr] = useState('TG88J2');
  const [isSubmittingFlight, setIsSubmittingFlight] = useState(false);
  const [flightError, setFlightError] = useState<string | null>(null);

  const formatToIsoTimestamp = (dateStr: string, timeStr: string): string => {
    try {
      const dStr = dateStr || (currentTrip?.start_date || new Date().toISOString().split('T')[0]);
      if (!timeStr) return new Date(`${dStr}T00:00:00+07:00`).toISOString();
      if (timeStr.includes('T')) return new Date(timeStr).toISOString();
      const cleanTime = timeStr.trim();
      const formattedTime = cleanTime.length === 5 ? `${cleanTime}:00` : cleanTime;
      const d = new Date(`${dStr}T${formattedTime}+07:00`);
      if (isNaN(d.getTime())) {
        return new Date().toISOString();
      }
      return d.toISOString();
    } catch {
      return new Date().toISOString();
    }
  };

  const formatDisplayTime = (timeStr: string) => {
    if (!timeStr) return '--:--';
    try {
      const d = new Date(timeStr);
      if (!isNaN(d.getTime())) {
        return d.toLocaleTimeString('th-TH', { hour: '2-digit', minute: '2-digit', hour12: false });
      }
    } catch {}
    if (timeStr.includes('T')) return timeStr.split('T')[1].substring(0, 5);
    return timeStr;
  };

  const formatDisplayDate = (timeStr: string) => {
    if (!timeStr) return '';
    try {
      const d = new Date(timeStr);
      if (!isNaN(d.getTime())) {
        return d.toLocaleDateString('th-TH', { day: 'numeric', month: 'short' });
      }
    } catch {}
    return '';
  };

  const [newHotelName, setNewHotelName] = useState('');
  const [newCheckIn, setNewCheckIn] = useState('2026-10-18');
  const [newCheckOut, setNewCheckOut] = useState('2026-10-24');
  const [newAddress, setNewAddress] = useState('');
  const [newBookingRef, setNewBookingRef] = useState('');
  const [newMapsUrl, setNewMapsUrl] = useState('');

  const [newPlanTime, setNewPlanTime] = useState('10:00');
  const [newPlanTitle, setNewPlanTitle] = useState('');
  const [newPlanLocation, setNewPlanLocation] = useState('');
  const [newPlanNote, setNewPlanNote] = useState('');

  // Generate itinerary days list from start to end date
  const tripDays: { dayNum: number; dateStr: string; label: string }[] = [
    { dayNum: 1, dateStr: '2026-10-18', label: 'Day 1 (18 ต.ค.)' },
    { dayNum: 2, dateStr: '2026-10-19', label: 'Day 2 (19 ต.ค.)' },
    { dayNum: 3, dateStr: '2026-10-20', label: 'Day 3 (20 ต.ค.)' },
    { dayNum: 4, dateStr: '2026-10-21', label: 'Day 4 (21 ต.ค.)' },
    { dayNum: 5, dateStr: '2026-10-22', label: 'Day 5 (22 ต.ค.)' },
    { dayNum: 6, dateStr: '2026-10-23', label: 'Day 6 (23 ต.ค.)' },
    { dayNum: 7, dateStr: '2026-10-24', label: 'Day 7 (24 ต.ค.)' },
  ];

  const filteredPlans = dailyPlans.filter((p) => p.plan_date === selectedDate);

  return (
    <div className="space-y-4 pb-20">
      {/* 3 Steps Switcher Pills */}
      <div className="grid grid-cols-3 gap-1.5 p-1 bg-slate-900/90 rounded-2xl border border-slate-800">
        <button
          onClick={() => setSubTab('flights')}
          className={`flex items-center justify-center space-x-1.5 py-2 px-1 rounded-xl text-xs font-semibold transition-all ${
            subTab === 'flights'
              ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-md shadow-pink-600/20'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          <Plane className="w-3.5 h-3.5" />
          <span>1. ตั๋วบิน</span>
        </button>

        <button
          onClick={() => setSubTab('hotels')}
          className={`flex items-center justify-center space-x-1.5 py-2 px-1 rounded-xl text-xs font-semibold transition-all ${
            subTab === 'hotels'
              ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-md shadow-pink-600/20'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          <Building2 className="w-3.5 h-3.5" />
          <span>2. ที่พัก</span>
        </button>

        <button
          onClick={() => setSubTab('itinerary')}
          className={`flex items-center justify-center space-x-1.5 py-2 px-1 rounded-xl text-xs font-semibold transition-all ${
            subTab === 'itinerary'
              ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-md shadow-pink-600/20'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          <CalendarDays className="w-3.5 h-3.5" />
          <span>3. แพลนวัน</span>
        </button>
      </div>

      {/* ============================================================== */}
      {/* TAB 1: FLIGHTS */}
      {/* ============================================================== */}
      {subTab === 'flights' && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-bold text-slate-200 flex items-center space-x-2">
              <Plane className="w-4 h-4 text-pink-400" />
              <span>ข้อมูลตั๋วเครื่องบิน ({flights.length})</span>
            </h2>
            <button
              onClick={() => setShowFlightModal(true)}
              className="flex items-center space-x-1 text-xs font-semibold text-pink-400 hover:text-pink-300 bg-pink-500/10 px-2.5 py-1.5 rounded-xl border border-pink-500/20 transition-colors"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>เพิ่มไฟล์ต</span>
            </button>
          </div>

          {flights.length === 0 ? (
            <div className="text-center py-10 bg-slate-900/40 rounded-2xl border border-slate-800">
              <Plane className="w-10 h-10 text-slate-600 mx-auto mb-2" />
              <p className="text-xs text-slate-400">ยังไม่มีข้อมูลเที่ยวบิน</p>
            </div>
          ) : (
            <div className="space-y-3">
              {flights.map((flight) => (
                <div
                  key={flight.id}
                  className="rounded-2xl bg-gradient-to-br from-[#1a1c29] to-[#141520] border border-slate-700/80 p-4 shadow-xl relative overflow-hidden group"
                >
                  {/* Decorative flight track background */}
                  <div className="absolute top-0 right-0 -mt-4 -mr-4 w-24 h-24 bg-pink-500/5 rounded-full blur-2xl" />

                  {/* Header: Airline & PNR */}
                  <div className="flex items-center justify-between border-b border-slate-800 pb-2.5 mb-3">
                    <div className="flex items-center space-x-2">
                      <div className="w-7 h-7 rounded-lg bg-pink-500/20 flex items-center justify-center text-pink-400 font-bold text-xs">
                        ✈️
                      </div>
                      <div>
                        <div className="text-xs font-bold text-white leading-tight">
                          {flight.airline} • {flight.flight_number}
                        </div>
                        {flight.terminal && (
                          <div className="text-[10px] text-slate-400">
                            Terminal: {flight.terminal}
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center space-x-2">
                      <div className="text-right">
                        <div className="text-[9px] uppercase tracking-wider text-slate-400 font-medium">
                          PNR Code
                        </div>
                        <div className="text-xs font-mono font-bold text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/20">
                          {flight.pnr_code}
                        </div>
                      </div>

                      {canManageItem(flight.created_by) && (
                        <button
                          onClick={() => deleteFlight(flight.id)}
                          className="p-1 rounded-lg text-slate-500 hover:text-rose-400 hover:bg-rose-500/10 transition-colors"
                          title="ลบเที่ยวบินนี้"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Flight Route Visualization */}
                  <div className="flex items-center justify-between px-2 py-1">
                    <div className="text-left">
                      <div className="text-lg font-extrabold text-white tracking-wide">
                        {flight.departure_airport.split(' ')[0]}
                      </div>
                      <div className="text-[11px] text-slate-400">
                        {flight.departure_airport}
                      </div>
                      <div className="text-xs font-semibold text-pink-400 mt-1">
                        {formatDisplayTime(flight.departure_time)}
                        {formatDisplayDate(flight.departure_time) && (
                          <span className="text-[10px] text-slate-400 ml-1.5 font-normal">
                            ({formatDisplayDate(flight.departure_time)})
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="flex-1 px-4 flex flex-col items-center">
                      <div className="text-[10px] text-slate-400 font-medium mb-1">บินตรง</div>
                      <div className="w-full flex items-center">
                        <div className="w-2 h-2 rounded-full bg-pink-500" />
                        <div className="flex-1 border-t-2 border-dashed border-slate-700 mx-1" />
                        <Plane className="w-4 h-4 text-pink-400 transform rotate-90 mx-0.5 shrink-0" />
                        <div className="flex-1 border-t-2 border-dashed border-slate-700 mx-1" />
                        <div className="w-2 h-2 rounded-full bg-orange-400" />
                      </div>
                    </div>

                    <div className="text-right">
                      <div className="text-lg font-extrabold text-white tracking-wide">
                        {flight.arrival_airport.split(' ')[0]}
                      </div>
                      <div className="text-[11px] text-slate-400">
                        {flight.arrival_airport}
                      </div>
                      <div className="text-xs font-semibold text-orange-400 mt-1">
                        {formatDisplayTime(flight.arrival_time)}
                        {formatDisplayDate(flight.arrival_time) && (
                          <span className="text-[10px] text-slate-400 ml-1.5 font-normal">
                            ({formatDisplayDate(flight.arrival_time)})
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Actions: View E-Ticket / Barcode */}
                  <div className="mt-3 pt-2.5 border-t border-slate-800 flex items-center justify-between">
                    <button
                      onClick={() =>
                        setSelectedTicketUrl(
                          flight.ticket_file_url ||
                            `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=BOARDING-PASS-${flight.flight_number}-${flight.pnr_code}`
                        )
                      }
                      className="w-full flex items-center justify-center space-x-1.5 py-2 px-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-medium text-slate-200 border border-slate-700 transition-colors"
                    >
                      <QrCode className="w-3.5 h-3.5 text-pink-400" />
                      <span>ขยายดู E-Ticket & Barcode สแกนขึ้นเครื่อง</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ============================================================== */}
      {/* TAB 2: HOTELS */}
      {/* ============================================================== */}
      {subTab === 'hotels' && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-bold text-slate-200 flex items-center space-x-2">
              <Building2 className="w-4 h-4 text-pink-400" />
              <span>ที่พักสำหรับทริปนี้ ({hotels.length})</span>
            </h2>
            <button
              onClick={() => setShowHotelModal(true)}
              className="flex items-center space-x-1 text-xs font-semibold text-pink-400 hover:text-pink-300 bg-pink-500/10 px-2.5 py-1.5 rounded-xl border border-pink-500/20 transition-colors"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>เพิ่มที่พัก</span>
            </button>
          </div>

          {hotels.length === 0 ? (
            <div className="text-center py-10 bg-slate-900/40 rounded-2xl border border-slate-800">
              <Building2 className="w-10 h-10 text-slate-600 mx-auto mb-2" />
              <p className="text-xs text-slate-400">ยังไม่มีข้อมูลที่พัก</p>
            </div>
          ) : (
            <div className="space-y-3">
              {hotels.map((hotel) => (
                <div
                  key={hotel.id}
                  className="rounded-2xl bg-gradient-to-br from-[#1a1c29] to-[#141520] border border-slate-700/80 p-4 shadow-xl space-y-3"
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="text-base font-bold text-white leading-snug">
                        {hotel.name}
                      </h3>
                      {hotel.booking_reference && (
                        <div className="text-[11px] text-amber-300 font-mono mt-0.5">
                          Booking Ref: {hotel.booking_reference}
                        </div>
                      )}
                    </div>

                    {canManageItem(hotel.created_by) && (
                      <button
                        onClick={() => deleteHotel(hotel.id)}
                        className="p-1 rounded-lg text-slate-500 hover:text-rose-400 hover:bg-rose-500/10 transition-colors"
                        title="ลบที่พัก"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-xs bg-slate-900/80 p-2.5 rounded-xl border border-slate-800">
                    <div>
                      <div className="text-[10px] text-slate-400">Check-in</div>
                      <div className="font-semibold text-emerald-400">{hotel.check_in}</div>
                    </div>
                    <div>
                      <div className="text-[10px] text-slate-400">Check-out</div>
                      <div className="font-semibold text-rose-400">{hotel.check_out}</div>
                    </div>
                  </div>

                  <div className="flex items-start space-x-2 text-xs text-slate-300">
                    <MapPin className="w-4 h-4 text-pink-400 shrink-0 mt-0.5" />
                    <span>{hotel.address}</span>
                  </div>

                  {/* One-click Google Maps Button */}
                  <div className="pt-2 border-t border-slate-800 flex items-center space-x-2">
                    <a
                      href={hotel.google_maps_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex-1 flex items-center justify-center space-x-1.5 py-2 px-3 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-semibold text-xs shadow-md shadow-indigo-600/20 transition-all"
                    >
                      <Navigation className="w-3.5 h-3.5" />
                      <span>เปิด Google Maps นำทาง</span>
                      <ExternalLink className="w-3 h-3 ml-0.5 opacity-80" />
                    </a>

                    {hotel.voucher_url && (
                      <button
                        onClick={() => setSelectedTicketUrl(hotel.voucher_url!)}
                        className="py-2 px-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-medium text-slate-300 border border-slate-700 transition-colors"
                      >
                        <FileText className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ============================================================== */}
      {/* TAB 3: DAILY ITINERARY */}
      {/* ============================================================== */}
      {subTab === 'itinerary' && (
        <div className="space-y-4">
          {/* Horizontal Day Selector Pills */}
          <div className="flex items-center space-x-2 overflow-x-auto pb-1 no-scrollbar">
            {tripDays.map((day) => {
              const isSelected = selectedDate === day.dateStr;
              return (
                <button
                  key={day.dayNum}
                  onClick={() => setSelectedDate(day.dateStr)}
                  className={`px-3 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
                    isSelected
                      ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-md shadow-pink-600/20 scale-105'
                      : 'bg-slate-900/90 text-slate-400 hover:text-white border border-slate-800'
                  }`}
                >
                  {day.label}
                </button>
              );
            })}
          </div>

          <div className="flex items-center justify-between">
            <h2 className="text-sm font-bold text-slate-200">
              แพลนวันที่ {selectedDate} ({filteredPlans.length} รายการ)
            </h2>
            <button
              onClick={() => setShowPlanModal(true)}
              className="flex items-center space-x-1 text-xs font-semibold text-pink-400 hover:text-pink-300 bg-pink-500/10 px-2.5 py-1.5 rounded-xl border border-pink-500/20 transition-colors"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>เพิ่มจุดเที่ยว</span>
            </button>
          </div>

          {filteredPlans.length === 0 ? (
            <div className="text-center py-10 bg-slate-900/40 rounded-2xl border border-slate-800">
              <Clock className="w-10 h-10 text-slate-600 mx-auto mb-2" />
              <p className="text-xs text-slate-400">ยังไม่มีแพลนสำหรับวันนี้</p>
            </div>
          ) : (
            <div className="relative pl-6 space-y-4 before:absolute before:left-2.5 before:top-3 before:bottom-3 before:w-0.5 before:bg-gradient-to-b before:from-pink-500 before:via-purple-500 before:to-orange-500">
              {filteredPlans
                .sort((a, b) => a.time_slot.localeCompare(b.time_slot))
                .map((plan) => (
                  <div key={plan.id} className="relative group">
                    {/* Timeline Node Dot */}
                    <div className="absolute -left-[19px] top-3.5 w-3 h-3 rounded-full bg-pink-500 ring-4 ring-[#0f101a] group-hover:scale-125 transition-transform" />

                    <div className="p-3.5 rounded-2xl bg-gradient-to-br from-[#1a1c29] to-[#141520] border border-slate-700/80 shadow-md space-y-2">
                      <div className="flex items-start justify-between">
                        <div>
                          <div className="inline-flex items-center space-x-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-pink-500/20 text-pink-300 border border-pink-500/30">
                            <Clock className="w-2.5 h-2.5" />
                            <span>{plan.time_slot}</span>
                          </div>
                          <h3 className="font-bold text-sm text-white mt-1">{plan.title}</h3>
                        </div>

                        {canManageItem(plan.created_by) && (
                          <button
                            onClick={() => deleteDailyPlan(plan.id)}
                            className="p-1 rounded-lg text-slate-500 hover:text-rose-400 hover:bg-rose-500/10 transition-colors"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>

                      {plan.location_name && (
                        <div className="flex items-center space-x-1.5 text-xs text-slate-300">
                          <MapPin className="w-3.5 h-3.5 text-orange-400 shrink-0" />
                          <span>{plan.location_name}</span>
                        </div>
                      )}

                      {plan.note && (
                        <p className="text-xs text-slate-400 bg-slate-900/60 p-2 rounded-xl border border-slate-800/80">
                          💡 {plan.note}
                        </p>
                      )}

                      {plan.google_maps_url && (
                        <a
                          href={plan.google_maps_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center space-x-1 text-[11px] font-semibold text-blue-400 hover:text-blue-300"
                        >
                          <Navigation className="w-3 h-3" />
                          <span>นำทางด้วย Google Maps</span>
                        </a>
                      )}
                    </div>
                  </div>
                ))}
            </div>
          )}
        </div>
      )}

      {/* ============================================================== */}
      {/* TICKET / QR CODE VIEWER MODAL */}
      {/* ============================================================== */}
      {selectedTicketUrl && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4">
          <div className="w-full max-w-sm bg-[#161722] border border-slate-700 rounded-3xl p-6 text-center space-y-4 shadow-2xl animate-in zoom-in-95">
            <div className="flex items-center justify-between pb-2 border-b border-slate-800">
              <h3 className="text-sm font-bold text-white">E-Ticket & Pass Barcode</h3>
              <button
                onClick={() => setSelectedTicketUrl(null)}
                className="p-1 rounded-full text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-4 bg-white rounded-2xl inline-block shadow-inner">
              <img
                src={selectedTicketUrl}
                alt="Ticket QR Code"
                className="w-56 h-56 object-contain mx-auto"
              />
            </div>

            <p className="text-xs text-slate-400">
              สแกนที่เคาน์เตอร์เช็คอิน หรือประตูทางเข้าขึ้นเครื่อง
            </p>
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* ADD FLIGHT MODAL */}
      {/* ============================================================== */}
      {showFlightModal && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-sm bg-[#161722] border border-slate-700 rounded-3xl p-5 shadow-2xl space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-white flex items-center space-x-1.5">
                <Plane className="w-4 h-4 text-pink-400" />
                <span>เพิ่มเที่ยวบินใหม่</span>
              </h3>
              <button
                onClick={() => {
                  setShowFlightModal(false);
                  setFlightError(null);
                }}
                className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {flightError && (
              <div className="p-2.5 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-center space-x-2">
                <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
                <span>{flightError}</span>
              </div>
            )}

            <div className="space-y-2.5 text-xs">
              <div>
                <label className="text-slate-400 font-medium">สายการบิน & เที่ยวบิน</label>
                <div className="grid grid-cols-2 gap-2 mt-1">
                  <input
                    value={newAirline}
                    onChange={(e) => setNewAirline(e.target.value)}
                    placeholder="เช่น Thai Airways"
                    className="w-full px-2.5 py-2 rounded-xl bg-slate-800 border border-slate-700 text-white placeholder-slate-500 focus:outline-none focus:border-pink-500"
                  />
                  <input
                    value={newFlightNo}
                    onChange={(e) => setNewFlightNo(e.target.value)}
                    placeholder="เช่น TG676"
                    className="w-full px-2.5 py-2 rounded-xl bg-slate-800 border border-slate-700 text-white placeholder-slate-500 uppercase font-mono focus:outline-none focus:border-pink-500"
                  />
                </div>
              </div>

              <div>
                <label className="text-slate-400 font-medium">วันที่เดินทาง</label>
                <input
                  type="date"
                  value={newFlightDate}
                  onChange={(e) => setNewFlightDate(e.target.value)}
                  className="w-full mt-1 px-2.5 py-2 rounded-xl bg-slate-800 border border-slate-700 text-white focus:outline-none focus:border-pink-500"
                />
              </div>

              <div>
                <label className="text-slate-400 font-medium">เวลาออก ➔ เวลาถึง</label>
                <div className="grid grid-cols-2 gap-2 mt-1">
                  <input
                    type="time"
                    value={newDepTime}
                    onChange={(e) => setNewDepTime(e.target.value)}
                    className="w-full px-2.5 py-2 rounded-xl bg-slate-800 border border-slate-700 text-white focus:outline-none focus:border-pink-500"
                  />
                  <input
                    type="time"
                    value={newArrTime}
                    onChange={(e) => setNewArrTime(e.target.value)}
                    className="w-full px-2.5 py-2 rounded-xl bg-slate-800 border border-slate-700 text-white focus:outline-none focus:border-pink-500"
                  />
                </div>
              </div>

              <div>
                <label className="text-slate-400 font-medium">สนามบินต้นทาง ➔ ปลายทาง</label>
                <div className="grid grid-cols-2 gap-2 mt-1">
                  <input
                    value={newDepAirport}
                    onChange={(e) => setNewDepAirport(e.target.value)}
                    placeholder="BKK"
                    className="w-full px-2.5 py-2 rounded-xl bg-slate-800 border border-slate-700 text-white uppercase placeholder-slate-500 focus:outline-none focus:border-pink-500"
                  />
                  <input
                    value={newArrAirport}
                    onChange={(e) => setNewArrAirport(e.target.value)}
                    placeholder="HND"
                    className="w-full px-2.5 py-2 rounded-xl bg-slate-800 border border-slate-700 text-white uppercase placeholder-slate-500 focus:outline-none focus:border-pink-500"
                  />
                </div>
              </div>

              <div>
                <label className="text-slate-400 font-medium">Terminal & PNR Code</label>
                <div className="grid grid-cols-2 gap-2 mt-1">
                  <input
                    value={newTerminal}
                    onChange={(e) => setNewTerminal(e.target.value)}
                    placeholder="เช่น T3 (ไม่บังคับ)"
                    className="w-full px-2.5 py-2 rounded-xl bg-slate-800 border border-slate-700 text-white placeholder-slate-500 focus:outline-none focus:border-pink-500"
                  />
                  <input
                    value={newPnr}
                    onChange={(e) => setNewPnr(e.target.value)}
                    placeholder="เช่น TG88J2"
                    className="w-full px-2.5 py-2 rounded-xl bg-slate-800 border border-slate-700 text-white uppercase font-mono placeholder-slate-500 focus:outline-none focus:border-pink-500"
                  />
                </div>
              </div>
            </div>

            <div className="flex items-center justify-end space-x-2 pt-2">
              <button
                type="button"
                onClick={() => {
                  setShowFlightModal(false);
                  setFlightError(null);
                }}
                disabled={isSubmittingFlight}
                className="px-3 py-2 rounded-xl text-xs text-slate-400 hover:text-white"
              >
                ยกเลิก
              </button>
              <button
                type="button"
                disabled={isSubmittingFlight}
                onClick={async () => {
                  if (!newAirline.trim() || !newFlightNo.trim()) {
                    setFlightError('กรุณากรอกสายการบินและเลขเที่ยวบิน');
                    return;
                  }
                  if (!newDepAirport.trim() || !newArrAirport.trim()) {
                    setFlightError('กรุณากรอกสนามบินต้นทางและปลายทาง');
                    return;
                  }
                  if (!newPnr.trim()) {
                    setFlightError('กรุณากรอกรหัส PNR Code');
                    return;
                  }

                  setIsSubmittingFlight(true);
                  setFlightError(null);

                  const depIso = formatToIsoTimestamp(newFlightDate, newDepTime);
                  const arrIso = formatToIsoTimestamp(newFlightDate, newArrTime);

                  const res = await addFlight({
                    airline: newAirline.trim(),
                    flight_number: newFlightNo.trim().toUpperCase(),
                    departure_airport: newDepAirport.trim().toUpperCase(),
                    arrival_airport: newArrAirport.trim().toUpperCase(),
                    departure_time: depIso,
                    arrival_time: arrIso,
                    terminal: newTerminal.trim() || undefined,
                    pnr_code: newPnr.trim().toUpperCase(),
                    ticket_file_url: `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=BOARDING-${newFlightNo.trim().toUpperCase()}-${newPnr.trim().toUpperCase()}`,
                  });

                  setIsSubmittingFlight(false);

                  if (res?.error) {
                    setFlightError(res.error);
                  } else {
                    setShowFlightModal(false);
                  }
                }}
                className="flex items-center space-x-1.5 px-4 py-2 rounded-xl text-xs font-bold bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-md shadow-pink-600/20 disabled:opacity-50"
              >
                {isSubmittingFlight ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    <span>กำลังบันทึก...</span>
                  </>
                ) : (
                  <span>บันทึกเที่ยวบิน</span>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* ADD HOTEL MODAL */}
      {/* ============================================================== */}
      {showHotelModal && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-sm bg-[#161722] border border-slate-700 rounded-3xl p-5 shadow-2xl space-y-3">
            <h3 className="text-sm font-bold text-white flex items-center space-x-1.5">
              <Building2 className="w-4 h-4 text-pink-400" />
              <span>เพิ่มที่พัก</span>
            </h3>

            <div className="space-y-2 text-xs">
              <div>
                <label className="text-slate-400">ชื่อโรงแรม</label>
                <input
                  value={newHotelName}
                  onChange={(e) => setNewHotelName(e.target.value)}
                  placeholder="เช่น Hotel Gracery Shinjuku"
                  className="w-full mt-1 px-2.5 py-2 rounded-xl bg-slate-800 border border-slate-700 text-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-slate-400">Check-in</label>
                  <input
                    type="date"
                    value={newCheckIn}
                    onChange={(e) => setNewCheckIn(e.target.value)}
                    className="w-full mt-1 px-2.5 py-2 rounded-xl bg-slate-800 border border-slate-700 text-white"
                  />
                </div>
                <div>
                  <label className="text-slate-400">Check-out</label>
                  <input
                    type="date"
                    value={newCheckOut}
                    onChange={(e) => setNewCheckOut(e.target.value)}
                    className="w-full mt-1 px-2.5 py-2 rounded-xl bg-slate-800 border border-slate-700 text-white"
                  />
                </div>
              </div>

              <div>
                <label className="text-slate-400">ที่อยู่</label>
                <input
                  value={newAddress}
                  onChange={(e) => setNewAddress(e.target.value)}
                  placeholder="1-19-1 Kabukicho, Tokyo"
                  className="w-full mt-1 px-2.5 py-2 rounded-xl bg-slate-800 border border-slate-700 text-white"
                />
              </div>

              <div>
                <label className="text-slate-400">รหัสจอง (Booking Ref)</label>
                <input
                  value={newBookingRef}
                  onChange={(e) => setNewBookingRef(e.target.value)}
                  placeholder="AGODA-9928172"
                  className="w-full mt-1 px-2.5 py-2 rounded-xl bg-slate-800 border border-slate-700 text-white"
                />
              </div>

              <div>
                <label className="text-slate-400">Google Maps Link</label>
                <input
                  value={newMapsUrl}
                  onChange={(e) => setNewMapsUrl(e.target.value)}
                  placeholder="https://maps.google.com/?q=..."
                  className="w-full mt-1 px-2.5 py-2 rounded-xl bg-slate-800 border border-slate-700 text-white"
                />
              </div>
            </div>

            <div className="flex items-center justify-end space-x-2 pt-2">
              <button
                onClick={() => setShowHotelModal(false)}
                className="px-3 py-2 rounded-xl text-xs text-slate-400 hover:text-white"
              >
                ยกเลิก
              </button>
              <button
                onClick={() => {
                  if (newHotelName.trim()) {
                    addHotel({
                      name: newHotelName.trim(),
                      check_in: newCheckIn,
                      check_out: newCheckOut,
                      address: newAddress || 'Tokyo, Japan',
                      booking_reference: newBookingRef,
                      google_maps_url: newMapsUrl || `https://maps.google.com/?q=${encodeURIComponent(newHotelName)}`,
                    });
                    setShowHotelModal(false);
                  }
                }}
                className="px-4 py-2 rounded-xl text-xs font-bold bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-md shadow-pink-600/20"
              >
                บันทึกที่พัก
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* ADD DAILY PLAN MODAL */}
      {/* ============================================================== */}
      {showPlanModal && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-sm bg-[#161722] border border-slate-700 rounded-3xl p-5 shadow-2xl space-y-3">
            <h3 className="text-sm font-bold text-white flex items-center space-x-1.5">
              <Clock className="w-4 h-4 text-pink-400" />
              <span>เพิ่มจุดเที่ยว ({selectedDate})</span>
            </h3>

            <div className="space-y-2 text-xs">
              <div className="grid grid-cols-3 gap-2">
                <div className="col-span-1">
                  <label className="text-slate-400">เวลา</label>
                  <input
                    value={newPlanTime}
                    onChange={(e) => setNewPlanTime(e.target.value)}
                    placeholder="10:00"
                    className="w-full mt-1 px-2.5 py-2 rounded-xl bg-slate-800 border border-slate-700 text-white font-mono"
                  />
                </div>
                <div className="col-span-2">
                  <label className="text-slate-400">ชื่อกิจกรรม / สถานที่</label>
                  <input
                    value={newPlanTitle}
                    onChange={(e) => setNewPlanTitle(e.target.value)}
                    placeholder="เช่น เที่ยว Shibuya Sky"
                    className="w-full mt-1 px-2.5 py-2 rounded-xl bg-slate-800 border border-slate-700 text-white"
                  />
                </div>
              </div>

              <div>
                <label className="text-slate-400">ชื่อสถานที่บน Maps</label>
                <input
                  value={newPlanLocation}
                  onChange={(e) => setNewPlanLocation(e.target.value)}
                  placeholder="Shibuya Sky"
                  className="w-full mt-1 px-2.5 py-2 rounded-xl bg-slate-800 border border-slate-700 text-white"
                />
              </div>

              <div>
                <label className="text-slate-400">โน้ตเตือนความจำ</label>
                <textarea
                  value={newPlanNote}
                  onChange={(e) => setNewPlanNote(e.target.value)}
                  placeholder="รายละเอียด หรือคำแนะนำ..."
                  rows={2}
                  className="w-full mt-1 px-2.5 py-2 rounded-xl bg-slate-800 border border-slate-700 text-white"
                />
              </div>
            </div>

            <div className="flex items-center justify-end space-x-2 pt-2">
              <button
                onClick={() => setShowPlanModal(false)}
                className="px-3 py-2 rounded-xl text-xs text-slate-400 hover:text-white"
              >
                ยกเลิก
              </button>
              <button
                onClick={() => {
                  if (newPlanTitle.trim()) {
                    addDailyPlan({
                      plan_date: selectedDate,
                      time_slot: newPlanTime,
                      title: newPlanTitle.trim(),
                      location_name: newPlanLocation,
                      note: newPlanNote,
                      google_maps_url: newPlanLocation
                        ? `https://maps.google.com/?q=${encodeURIComponent(newPlanLocation)}`
                        : undefined,
                    });
                    setNewPlanTitle('');
                    setNewPlanNote('');
                    setShowPlanModal(false);
                  }
                }}
                className="px-4 py-2 rounded-xl text-xs font-bold bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-md shadow-pink-600/20"
              >
                บันทึกจุดเที่ยว
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
