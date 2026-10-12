import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import {
  Ticket,
  Train,
  Car,
  QrCode,
  Plus,
  Trash2,
  Receipt,
  Sparkles,
  ExternalLink,
  X,
  Check,
} from 'lucide-react';
import { ActivityType } from '../../types/database';

interface ActivitiesTabProps {
  onGoToExpenses: () => void;
}

export const ActivitiesTab: React.FC<ActivitiesTabProps> = ({ onGoToExpenses }) => {
  const { activities, canManageItem, deleteActivity, addActivity } = useApp();

  const [selectedQrActivity, setSelectedQrActivity] = useState<any | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);

  // Form states
  const [title, setTitle] = useState('');
  const [type, setType] = useState<ActivityType>('DISNEY');
  const [bookingRef, setBookingRef] = useState('');
  const [locationName, setLocationName] = useState('');
  const [hasExpense, setHasExpense] = useState(true);
  const [expenseAmount, setExpenseAmount] = useState<number>(3200);

  const getActivityIcon = (actType: ActivityType) => {
    switch (actType) {
      case 'DISNEY':
        return <Ticket className="w-4 h-4 text-pink-400" />;
      case 'TRAIN':
        return <Train className="w-4 h-4 text-emerald-400" />;
      case 'RENTAL_CAR':
        return <Car className="w-4 h-4 text-amber-400" />;
      default:
        return <Ticket className="w-4 h-4 text-purple-400" />;
    }
  };

  return (
    <div className="space-y-4 pb-20">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-sm font-bold text-slate-200 flex items-center space-x-2">
            <Ticket className="w-4 h-4 text-pink-400" />
            <span>Ticket Wallet & การเดินทาง ({activities.length})</span>
          </h2>
          <p className="text-[11px] text-slate-400">
            แตะที่ตั๋วเพื่อเปิด QR Code สแกนผ่านประตูได้ทันที
          </p>
        </div>

        <button
          onClick={() => setShowAddModal(true)}
          className="flex items-center space-x-1 text-xs font-semibold text-pink-400 hover:text-pink-300 bg-pink-500/10 px-2.5 py-1.5 rounded-xl border border-pink-500/20 transition-colors"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>เพิ่มตั๋ว</span>
        </button>
      </div>

      {/* Ticket Cards Feed */}
      {activities.length === 0 ? (
        <div className="text-center py-10 bg-slate-900/40 rounded-2xl border border-slate-800">
          <Ticket className="w-10 h-10 text-slate-600 mx-auto mb-2" />
          <p className="text-xs text-slate-400">ยังไม่มีตั๋วหรือกิจกรรมในกระเป๋า</p>
        </div>
      ) : (
        <div className="space-y-4">
          {activities.map((act) => (
            <div
              key={act.id}
              className="relative rounded-3xl bg-[#191b28] border border-slate-700/80 shadow-2xl overflow-hidden"
            >
              {/* Ticket Notch effect (Left & Right cutout circle) */}
              <div className="absolute top-1/2 -left-3 -mt-3 w-6 h-6 rounded-full bg-[#0c0d12] border-r border-slate-700 z-10" />
              <div className="absolute top-1/2 -right-3 -mt-3 w-6 h-6 rounded-full bg-[#0c0d12] border-l border-slate-700 z-10" />

              {/* Ticket Stub Top Section */}
              <div className="p-4 bg-gradient-to-r from-purple-900/30 via-pink-900/20 to-orange-900/20 border-b border-dashed border-slate-700/80 relative">
                <div className="flex items-start justify-between">
                  <div className="space-y-1">
                    <div className="flex items-center space-x-1.5">
                      {getActivityIcon(act.type)}
                      <span className="text-[10px] font-bold uppercase tracking-wider text-slate-300">
                        {act.type === 'DISNEY' ? 'สวนสนุก / ธีมปาร์ค' : act.type === 'TRAIN' ? 'รถไฟความเร็วสูง' : 'การเดินทาง'}
                      </span>
                    </div>
                    <h3 className="font-extrabold text-base text-white leading-snug">
                      {act.title}
                    </h3>
                    {act.location_name && (
                      <div className="text-xs text-slate-400">{act.location_name}</div>
                    )}
                  </div>

                  {canManageItem(act.created_by) && (
                    <button
                      onClick={() => deleteActivity(act.id)}
                      className="p-1.5 rounded-lg text-slate-500 hover:text-rose-400 hover:bg-rose-500/10 transition-colors"
                      title="ลบตั๋วนี้"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>

                <div className="mt-3 flex items-center justify-between text-xs">
                  <div>
                    <div className="text-[10px] text-slate-400">Booking Reference</div>
                    <div className="font-mono font-bold text-amber-300">{act.booking_reference}</div>
                  </div>

                  {act.has_expense && (
                    <div className="text-right">
                      <div className="text-[10px] text-slate-400">ยอดส่งไปหารโว้ย</div>
                      <div className="font-bold text-pink-400">
                        ฿{act.expense_amount?.toLocaleString() || '0'}
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Ticket Stub Bottom Section (Actions & QR) */}
              <div className="p-4 bg-[#151622] flex items-center justify-between gap-3">
                <button
                  onClick={() => setSelectedQrActivity(act)}
                  className="flex-1 flex items-center justify-center space-x-2 py-2.5 px-3 rounded-2xl bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white font-bold text-xs shadow-lg shadow-pink-600/25 transition-all"
                >
                  <QrCode className="w-4 h-4" />
                  <span>แตะเพื่อเปิด QR Code สแกน</span>
                </button>

                {act.has_expense && (
                  <button
                    onClick={onGoToExpenses}
                    className="flex items-center space-x-1 py-2.5 px-3 rounded-2xl bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-200 border border-slate-700 transition-colors"
                    title="ไปที่เมนูหารโว้ย"
                  >
                    <Receipt className="w-4 h-4 text-emerald-400" />
                    <span className="hidden sm:inline">ดูบิลหาร</span>
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ============================================================== */}
      {/* BIG QR CODE PASS MODAL */}
      {/* ============================================================== */}
      {selectedQrActivity && (
        <div className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex items-center justify-center p-4">
          <div className="w-full max-w-sm bg-[#161722] border border-slate-700 rounded-3xl p-6 text-center space-y-4 shadow-2xl animate-in zoom-in-95">
            <div className="flex items-center justify-between pb-2 border-b border-slate-800">
              <div className="text-left">
                <div className="text-[10px] text-pink-400 font-bold uppercase">Pass Ticket</div>
                <h3 className="text-sm font-bold text-white line-clamp-1">
                  {selectedQrActivity.title}
                </h3>
              </div>
              <button
                onClick={() => setSelectedQrActivity(null)}
                className="p-1 rounded-full text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-4 bg-white rounded-3xl inline-block shadow-2xl ring-4 ring-pink-500/20">
              <img
                src={
                  selectedQrActivity.ticket_qr_url ||
                  `https://api.qrserver.com/v1/create-qr-code/?size=350x350&data=TICKET-${selectedQrActivity.booking_reference}`
                }
                alt="Ticket QR"
                className="w-60 h-60 object-contain mx-auto"
              />
            </div>

            <div className="space-y-1">
              <div className="text-xs font-mono font-bold text-white">
                {selectedQrActivity.booking_reference}
              </div>
              <p className="text-xs text-slate-400">
                สแกนกับเครื่องตรวจตั๋วหน้างาน หรือยื่นให้เจ้าหน้าที่
              </p>
            </div>
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* ADD ACTIVITY MODAL */}
      {/* ============================================================== */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-sm bg-[#161722] border border-slate-700 rounded-3xl p-5 shadow-2xl space-y-3">
            <h3 className="text-sm font-bold text-white flex items-center space-x-1.5">
              <Ticket className="w-4 h-4 text-pink-400" />
              <span>เพิ่มตั๋ว / บัตรการเดินทาง</span>
            </h3>

            <div className="space-y-2 text-xs">
              <div>
                <label className="text-slate-400">ประเภทตั๋ว</label>
                <select
                  value={type}
                  onChange={(e) => setType(e.target.value as ActivityType)}
                  className="w-full mt-1 px-2.5 py-2 rounded-xl bg-slate-800 border border-slate-700 text-white"
                >
                  <option value="DISNEY">🏰 สวนสนุก (Disneyland / USJ)</option>
                  <option value="TRAIN">🚄 รถไฟ / Shinkansen</option>
                  <option value="RENTAL_CAR">🚗 รถเช่า / เรือ</option>
                  <option value="OTHER">🎟️ กิจกรรมอื่นๆ</option>
                </select>
              </div>

              <div>
                <label className="text-slate-400">ชื่อรายการ</label>
                <input
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="เช่น ตั๋ว Universal Studios Japan"
                  className="w-full mt-1 px-2.5 py-2 rounded-xl bg-slate-800 border border-slate-700 text-white"
                />
              </div>

              <div>
                <label className="text-slate-400">รหัสการจอง / หมายเลขอ้างอิง</label>
                <input
                  value={bookingRef}
                  onChange={(e) => setBookingRef(e.target.value)}
                  placeholder="เช่น USJ-2026-QR99"
                  className="w-full mt-1 px-2.5 py-2 rounded-xl bg-slate-800 border border-slate-700 text-white font-mono"
                />
              </div>

              <div>
                <label className="text-slate-400">สถานที่</label>
                <input
                  value={locationName}
                  onChange={(e) => setLocationName(e.target.value)}
                  placeholder="เช่น Osaka, Japan"
                  className="w-full mt-1 px-2.5 py-2 rounded-xl bg-slate-800 border border-slate-700 text-white"
                />
              </div>

              {/* Expense Integration Switch */}
              <div className="p-3 rounded-2xl bg-slate-800/80 border border-slate-700 space-y-2">
                <label className="flex items-center space-x-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={hasExpense}
                    onChange={(e) => setHasExpense(e.target.checked)}
                    className="w-4 h-4 rounded text-pink-500 focus:ring-pink-500 bg-slate-700 border-slate-600"
                  />
                  <span className="font-bold text-white text-xs">
                    หารค่าใช้จ่ายรายการนี้ (ส่งเข้าเมนู "หารโว้ย")
                  </span>
                </label>

                {hasExpense && (
                  <div>
                    <label className="text-[11px] text-slate-400">ยอดรวมทั้งหมด (บาท)</label>
                    <input
                      type="number"
                      value={expenseAmount}
                      onChange={(e) => setExpenseAmount(Number(e.target.value))}
                      placeholder="3200"
                      className="w-full mt-1 px-2.5 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white font-bold"
                    />
                  </div>
                )}
              </div>
            </div>

            <div className="flex items-center justify-end space-x-2 pt-2">
              <button
                onClick={() => setShowAddModal(false)}
                className="px-3 py-2 rounded-xl text-xs text-slate-400 hover:text-white"
              >
                ยกเลิก
              </button>
              <button
                onClick={() => {
                  if (title.trim()) {
                    addActivity({
                      title: title.trim(),
                      type,
                      scheduled_at: new Date().toISOString(),
                      booking_reference: bookingRef || `REF-${Math.floor(Math.random() * 900000)}`,
                      location_name: locationName,
                      has_expense: hasExpense,
                      expense_amount: hasExpense ? expenseAmount : undefined,
                      ticket_qr_url: `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=PASS-${bookingRef || title}`,
                    });
                    setTitle('');
                    setShowAddModal(false);
                  }
                }}
                className="px-4 py-2 rounded-xl text-xs font-bold bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-md shadow-pink-600/20"
              >
                บันทึกตั๋ว
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
