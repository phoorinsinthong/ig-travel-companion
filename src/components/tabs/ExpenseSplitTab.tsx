import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import {
  Receipt,
  Plus,
  CheckCircle2,
  Clock,
  AlertCircle,
  Copy,
  Check,
  Upload,
  Eye,
  Trash2,
  X,
  CreditCard,
  Sparkles,
  Download,
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { QRCodeSVG } from 'qrcode.react';
import { compressImageForUpload } from '../../utils/imageCompressor';
import { generatePromptPayPayload } from '../../utils/promptpay';
import { uploadToSupabaseStorage } from '../../lib/supabase';
import { Expense } from '../../types/database';

export const ExpenseSplitTab: React.FC = () => {
  const {
    expenses,
    currentUser,
    isAdmin,
    canManageItem,
    addExpense,
    deleteExpense,
    submitPaymentSlip,
    confirmPayment,
    tripMembers,
  } = useApp();

  // Modals
  const [showAddModal, setShowAddModal] = useState(false);
  const [activePaymentExpense, setActivePaymentExpense] = useState<Expense | null>(null);
  const [activeVerifyExpense, setActiveVerifyExpense] = useState<Expense | null>(null);
  const [previewSlipUrl, setPreviewSlipUrl] = useState<string | null>(null);

  // Add Expense form
  const [newTitle, setNewTitle] = useState('');
  const [newTotal, setNewTotal] = useState<number>(1000);
  const [newPayerId, setNewPayerId] = useState(currentUser.id);
  const [selectedUserIds, setSelectedUserIds] = useState<string[]>(
    tripMembers.map((m) => m.user_id)
  );

  // Payment modal state
  const [copiedAmount, setCopiedAmount] = useState(false);
  const [copiedPayload, setCopiedPayload] = useState(false);
  const [compressing, setCompressing] = useState(false);
  const [uploadingSlip, setUploadingSlip] = useState(false);
  const [compressedSlip, setCompressedSlip] = useState<{
    file: Blob;
    dataUrl: string;
    origKb: number;
    compKb: number;
  } | null>(null);

  // Calculate personal overview stats
  let totalIOwe = 0;
  let totalOthersOweMe = 0;

  expenses.forEach((exp) => {
    if (exp.payer_id === currentUser.id) {
      exp.splits.forEach((sp) => {
        if (sp.user_id !== currentUser.id && sp.status !== 'CONFIRMED') {
          totalOthersOweMe += sp.amount;
        }
      });
    } else {
      const mySplit = exp.splits.find((s) => s.user_id === currentUser.id);
      if (mySplit && mySplit.status === 'UNPAID') {
        totalIOwe += mySplit.amount;
      }
    }
  });

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setCompressing(true);
    try {
      const result = await compressImageForUpload(file);
      setCompressedSlip({
        file: result.file,
        dataUrl: result.dataUrl,
        origKb: result.originalSizeKb,
        compKb: result.compressedSizeKb,
      });
    } catch (err) {
      console.error(err);
    } finally {
      setCompressing(false);
    }
  };

  const handleConfirmReceive = (expenseId: string, splitUserId: string) => {
    confirmPayment(expenseId, splitUserId);
    confetti({
      particleCount: 80,
      spread: 70,
      origin: { y: 0.6 },
      colors: ['#833AB4', '#FD1D1D', '#FCB045', '#10B981'],
    });
  };

  const handleSubmitSlip = async () => {
    if (!activePaymentExpense) return;
    setUploadingSlip(true);

    let finalSlipUrl = compressedSlip?.dataUrl || 'https://images.unsplash.com/photo-1554224155-6726b3ff858f?w=400&auto=format&fit=crop&q=80';

    // If Supabase Storage is connected, upload real blob
    if (compressedSlip?.file) {
      const filePath = `slips/${activePaymentExpense.id}_${currentUser.id}_${Date.now()}.jpg`;
      const uploadedUrl = await uploadToSupabaseStorage('slips', filePath, compressedSlip.file);
      if (uploadedUrl) {
        finalSlipUrl = uploadedUrl;
      }
    }

    submitPaymentSlip(activePaymentExpense.id, currentUser.id, finalSlipUrl);
    setUploadingSlip(false);
    setActivePaymentExpense(null);
  };

  return (
    <div className="space-y-4 pb-20">
      {/* Overview Balance Cards */}
      <div className="grid grid-cols-2 gap-2.5">
        <div className="rounded-2xl p-3.5 bg-gradient-to-br from-amber-950/40 to-slate-900 border border-amber-500/30">
          <div className="text-[10px] font-bold uppercase tracking-wider text-amber-300/80">
            คุณต้องจ่ายเพื่อน (ค้างชำระ)
          </div>
          <div className="text-xl font-extrabold text-amber-400 mt-1">
            ฿{totalIOwe.toLocaleString()}
          </div>
          <div className="text-[10px] text-slate-400 mt-0.5">จากทุกบิลที่ยังไม่ได้โอน</div>
        </div>

        <div className="rounded-2xl p-3.5 bg-gradient-to-br from-emerald-950/40 to-slate-900 border border-emerald-500/30">
          <div className="text-[10px] font-bold uppercase tracking-wider text-emerald-300/80">
            เพื่อนต้องโอนคืนคุณ (เจ้าหนี้)
          </div>
          <div className="text-xl font-extrabold text-emerald-400 mt-1">
            ฿{totalOthersOweMe.toLocaleString()}
          </div>
          <div className="text-[10px] text-slate-400 mt-0.5">ยอดที่คุณจ่ายล่วงหน้าไปก่อน</div>
        </div>
      </div>

      {/* Header & Add Bill Button */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-sm font-bold text-slate-200 flex items-center space-x-2">
            <Receipt className="w-4 h-4 text-pink-400" />
            <span>รายการบิลทั้งหมด ({expenses.length})</span>
          </h2>
          <p className="text-[11px] text-slate-400">ระบบสร้าง PromptPay QR จริง สแกนจ่ายผ่านแอปธนาคารได้ทันที</p>
        </div>

        <button
          onClick={() => {
            setNewPayerId(currentUser.id);
            setSelectedUserIds(tripMembers.map((m) => m.user_id));
            setShowAddModal(true);
          }}
          className="flex items-center space-x-1 text-xs font-semibold text-pink-400 hover:text-pink-300 bg-pink-500/10 px-2.5 py-1.5 rounded-xl border border-pink-500/20 transition-colors"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>+ สร้างบิลใหม่</span>
        </button>
      </div>

      {/* Expenses Feed */}
      {expenses.length === 0 ? (
        <div className="text-center py-10 bg-slate-900/40 rounded-2xl border border-slate-800">
          <Receipt className="w-10 h-10 text-slate-600 mx-auto mb-2" />
          <p className="text-xs text-slate-400">ยังไม่มีรายการค่าใช้จ่าย</p>
        </div>
      ) : (
        <div className="space-y-3">
          {expenses.map((exp) => {
            const payer = exp.payer || tripMembers.find((m) => m.user_id === exp.payer_id)?.user;
            const isMePayer = exp.payer_id === currentUser.id;
            const mySplit = exp.splits.find((s) => s.user_id === currentUser.id);

            const confirmedCount = exp.splits.filter((s) => s.status === 'CONFIRMED').length;
            const pendingVerifyCount = exp.splits.filter((s) => s.status === 'PENDING_VERIFY').length;

            return (
              <div
                key={exp.id}
                className="rounded-2xl bg-gradient-to-br from-[#191b28] to-[#13141f] border border-slate-700/80 p-4 shadow-xl space-y-3"
              >
                {/* Header: Title, Payer Avatar, Delete */}
                <div className="flex items-start justify-between">
                  <div className="flex items-start space-x-3">
                    <img
                      src={payer?.profile_pic_url}
                      alt={payer?.username}
                      className="w-10 h-10 rounded-full object-cover ring-2 ring-pink-500/50 shrink-0 mt-0.5"
                    />
                    <div>
                      <h3 className="font-bold text-sm text-white leading-snug">{exp.title}</h3>
                      <div className="flex items-center space-x-1.5 text-xs text-slate-400 mt-0.5">
                        <span>คนจ่าย:</span>
                        <span className="font-semibold text-slate-200">@{payer?.username}</span>
                        {isMePayer && (
                          <span className="text-[10px] text-pink-400 font-bold">(ตัวคุณ)</span>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center space-x-1">
                    {canManageItem(exp.created_by) && (
                      <button
                        onClick={() => deleteExpense(exp.id)}
                        className="p-1.5 rounded-lg text-slate-500 hover:text-rose-400 hover:bg-rose-500/10 transition-colors"
                        title="ลบบิลนี้"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                </div>

                {/* Amounts Breakdown */}
                <div className="flex items-center justify-between bg-slate-900/80 p-2.5 rounded-xl border border-slate-800 text-xs">
                  <div>
                    <div className="text-[10px] text-slate-400">ยอดบิลรวม</div>
                    <div className="font-extrabold text-white text-sm">
                      ฿{exp.total_amount.toLocaleString()}
                    </div>
                  </div>

                  <div className="text-right">
                    <div className="text-[10px] text-slate-400">หารกัน {exp.splits.length} คน</div>
                    <div className="font-semibold text-slate-300">
                      คนละ ฿{exp.splits[0]?.amount.toLocaleString() || '0'}
                    </div>
                  </div>
                </div>

                {/* Status for Current User & Action */}
                <div className="flex items-center justify-between pt-1">
                  <div>
                    {isMePayer ? (
                      <div className="flex items-center space-x-1.5">
                        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-purple-500/20 text-purple-300 border border-purple-500/30">
                          👑 คุณเป็นคนจ่ายบิลนี้
                        </span>
                        {pendingVerifyCount > 0 && (
                          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30 animate-pulse">
                            ⚠️ มี {pendingVerifyCount} สลิปรอตรวจ
                          </span>
                        )}
                      </div>
                    ) : mySplit?.status === 'CONFIRMED' ? (
                      <span className="inline-flex items-center space-x-1 px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
                        <CheckCircle2 className="w-3 h-3" />
                        <span>ชำระเรียบร้อยแล้ว</span>
                      </span>
                    ) : mySplit?.status === 'PENDING_VERIFY' ? (
                      <span className="inline-flex items-center space-x-1 px-2.5 py-1 rounded-full text-xs font-bold bg-amber-500/15 text-amber-400 border border-amber-500/30">
                        <Clock className="w-3 h-3" />
                        <span>ส่งสลิปแล้ว (รอเพื่อนยืนยัน)</span>
                      </span>
                    ) : (
                      <span className="inline-flex items-center space-x-1 px-2.5 py-1 rounded-full text-xs font-bold bg-rose-500/15 text-rose-400 border border-rose-500/30">
                        <AlertCircle className="w-3 h-3" />
                        <span>รอชำระ ฿{mySplit?.amount.toLocaleString()}</span>
                      </span>
                    )}
                  </div>

                  <div className="flex items-center space-x-2">
                    {!isMePayer && mySplit && mySplit.status === 'UNPAID' && (
                      <button
                        onClick={() => {
                          setCompressedSlip(null);
                          setActivePaymentExpense(exp);
                        }}
                        className="flex items-center space-x-1.5 py-1.5 px-3 rounded-xl bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white font-bold text-xs shadow-md shadow-pink-600/20 transition-all"
                      >
                        <CreditCard className="w-3.5 h-3.5" />
                        <span>จ่ายบิลนี้</span>
                      </button>
                    )}

                    {(isMePayer || isAdmin) && (
                      <button
                        onClick={() => setActiveVerifyExpense(exp)}
                        className="flex items-center space-x-1 py-1.5 px-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-200 border border-slate-700 transition-colors"
                      >
                        <span>ตรวจยอด ({confirmedCount}/{exp.splits.length})</span>
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* ============================================================== */}
      {/* REAL EMVCo PROMPTPAY QR PAYMENT MODAL */}
      {/* ============================================================== */}
      {activePaymentExpense && (() => {
        const mySplit = activePaymentExpense.splits.find((s) => s.user_id === currentUser.id);
        const myAmount = mySplit?.amount || 0;
        const payerPhone = activePaymentExpense.payer?.promptpay_number || '0812345678';
        const emvcoPayload = generatePromptPayPayload(payerPhone, myAmount);

        return (
          <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4">
            <div className="w-full max-w-sm bg-[#161722] border border-slate-700 rounded-3xl p-5 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto">
              <div className="flex items-center justify-between pb-2 border-b border-slate-800">
                <div>
                  <h3 className="text-sm font-bold text-white">Thai QR Payment (พร้อมเพย์)</h3>
                  <p className="text-[11px] text-slate-400">
                    โอนให้ @{activePaymentExpense.payer?.username} ({activePaymentExpense.payer?.full_name})
                  </p>
                </div>
                <button
                  onClick={() => setActivePaymentExpense(null)}
                  className="p-1 rounded-full text-slate-400 hover:text-white"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Official Thai QR Payment Box */}
              <div className="p-4 bg-white rounded-3xl text-center space-y-2 shadow-2xl border-4 border-[#003b71]">
                {/* PromptPay Top Branding Bar */}
                <div className="bg-[#003b71] text-white py-1 px-3 rounded-lg flex items-center justify-between text-[11px] font-bold">
                  <span>THAI QR PAYMENT</span>
                  <span className="text-amber-300">พร้อมเพย์</span>
                </div>

                <div className="py-2 flex justify-center">
                  <QRCodeSVG
                    value={emvcoPayload}
                    size={200}
                    level="M"
                    includeMargin={false}
                  />
                </div>

                <div className="border-t border-slate-200 pt-1 text-slate-800">
                  <div className="text-[11px] font-medium text-slate-500">หมายเลขพร้อมเพย์</div>
                  <div className="text-sm font-black font-mono tracking-wider text-[#003b71]">
                    {payerPhone}
                  </div>
                  <div className="text-xs font-bold text-emerald-600 mt-0.5">
                    จำนวนเงิน: ฿{myAmount.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                  </div>
                </div>
              </div>

              {/* Amount to pay & Quick Copy */}
              <div className="flex items-center justify-between p-3 rounded-2xl bg-slate-800/80 border border-slate-700">
                <div>
                  <div className="text-[10px] text-slate-400">ยอดที่ต้องโอนตรงเป๊ะ</div>
                  <div className="text-lg font-black text-pink-400">
                    ฿{myAmount.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                  </div>
                </div>
                <button
                  onClick={() => {
                    navigator.clipboard.writeText(myAmount.toString());
                    setCopiedAmount(true);
                    setTimeout(() => setCopiedAmount(false), 2000);
                  }}
                  className="flex items-center space-x-1 px-3 py-1.5 rounded-xl bg-slate-700 hover:bg-slate-600 text-xs font-semibold text-white transition-colors"
                >
                  {copiedAmount ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-emerald-400" />
                      <span className="text-emerald-400">คัดลอกแล้ว</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5 text-slate-300" />
                      <span>คัดลอกยอด</span>
                    </>
                  )}
                </button>
              </div>

              {/* Slip Upload with Client-Side Image Compression */}
              <div className="space-y-2">
                <label className="text-xs font-semibold text-slate-300 flex items-center justify-between">
                  <span>แนบสลิปการโอนเงิน (Client-side Compression)</span>
                  {compressing && (
                    <span className="text-[10px] text-pink-400 animate-pulse">กำลังบีบอัดรูป...</span>
                  )}
                </label>

                {compressedSlip ? (
                  <div className="relative rounded-2xl overflow-hidden border border-emerald-500/40 bg-slate-900/80 p-2 space-y-2">
                    <div className="flex items-center justify-between text-[11px] text-slate-300">
                      <span className="text-emerald-400 font-bold flex items-center space-x-1">
                        <Sparkles className="w-3 h-3" />
                        <span>บีบอัดสำเร็จ! ({compressedSlip.origKb}KB ➔ {compressedSlip.compKb}KB)</span>
                      </span>
                      <button
                        onClick={() => setCompressedSlip(null)}
                        className="text-xs text-rose-400 hover:text-rose-300"
                      >
                        เปลี่ยนรูป
                      </button>
                    </div>
                    <img
                      src={compressedSlip.dataUrl}
                      alt="Uploaded Slip"
                      className="w-full h-32 object-cover rounded-xl"
                    />
                  </div>
                ) : (
                  <label className="flex flex-col items-center justify-center p-4 border-2 border-dashed border-slate-700 rounded-2xl cursor-pointer hover:border-pink-500/50 bg-slate-900/50 transition-colors">
                    <Upload className="w-6 h-6 text-slate-400 mb-1" />
                    <span className="text-xs text-slate-300 font-medium">
                      แตะเพื่อเลือกรูปสลิปจากมือถือ
                    </span>
                    <span className="text-[10px] text-slate-500">
                      บีบอัดอัตโนมัติให้เหลือ &lt;300KB ประหยัดเน็ตโรมมิ่ง
                    </span>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleFileUpload}
                      className="hidden"
                    />
                  </label>
                )}
              </div>

              {/* Submit Button */}
              <button
                disabled={uploadingSlip}
                onClick={handleSubmitSlip}
                className="w-full py-3 rounded-2xl bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white font-bold text-xs shadow-lg shadow-pink-600/25 transition-all disabled:opacity-50"
              >
                {uploadingSlip ? 'กำลังส่งข้อมูล...' : 'แจ้งโอนเงินแล้ว'}
              </button>
            </div>
          </div>
        );
      })()}

      {/* PAYER VERIFICATION DASHBOARD MODAL */}
      {activeVerifyExpense && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4">
          <div className="w-full max-w-sm bg-[#161722] border border-slate-700 rounded-3xl p-5 shadow-2xl space-y-4 max-h-[90vh] flex flex-col">
            <div className="flex items-center justify-between pb-2 border-b border-slate-800">
              <div>
                <h3 className="text-sm font-bold text-white">ตรวจสลิป & ยืนยันยอดรับเงิน</h3>
                <p className="text-[11px] text-slate-400">{activeVerifyExpense.title}</p>
              </div>
              <button
                onClick={() => setActiveVerifyExpense(null)}
                className="p-1 rounded-full text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="py-2 flex-1 overflow-y-auto space-y-2.5">
              {activeVerifyExpense.splits.map((split) => {
                const u = split.user || tripMembers.find((m: { user_id: string; user?: any }) => m.user_id === split.user_id)?.user;
                const isPayerSelf = split.user_id === activeVerifyExpense.payer_id;

                return (
                  <div
                    key={split.id}
                    className="p-3 rounded-2xl bg-slate-800/60 border border-slate-700/60 space-y-2"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2.5">
                        <img
                          src={u?.profile_pic_url}
                          alt={u?.username}
                          className="w-8 h-8 rounded-full object-cover shrink-0"
                        />
                        <div>
                          <div className="text-xs font-semibold text-white">@{u?.username}</div>
                          <div className="text-[10px] text-slate-400">
                            ยอด ฿{split.amount.toLocaleString()}
                          </div>
                        </div>
                      </div>

                      <div>
                        {isPayerSelf ? (
                          <span className="text-[10px] font-semibold text-slate-400">คนจ่ายบิล</span>
                        ) : split.status === 'CONFIRMED' ? (
                          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                            ✓ ได้รับแล้ว
                          </span>
                        ) : split.status === 'PENDING_VERIFY' ? (
                          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30">
                            ⏳ แนบสลิปแล้ว
                          </span>
                        ) : (
                          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-500/20 text-rose-400 border border-rose-500/30">
                            ✕ ยังไม่โอน
                          </span>
                        )}
                      </div>
                    </div>

                    {!isPayerSelf && split.status === 'PENDING_VERIFY' && (
                      <div className="flex items-center space-x-2 pt-1 border-t border-slate-700/60">
                        {split.slip_url && (
                          <button
                            onClick={() => setPreviewSlipUrl(split.slip_url!)}
                            className="flex-1 flex items-center justify-center space-x-1 py-1.5 px-2 rounded-xl bg-slate-700 hover:bg-slate-600 text-xs text-slate-200 transition-colors"
                          >
                            <Eye className="w-3.5 h-3.5" />
                            <span>ดูรูปสลิป</span>
                          </button>
                        )}
                        <button
                          onClick={() => handleConfirmReceive(activeVerifyExpense.id, split.user_id)}
                          className="flex-1 flex items-center justify-center space-x-1 py-1.5 px-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-md shadow-emerald-600/20 transition-all"
                        >
                          <Check className="w-3.5 h-3.5" />
                          <span>ยืนยันได้รับเงิน</span>
                        </button>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* SLIP PREVIEW MODAL */}
      {previewSlipUrl && (
        <div className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex items-center justify-center p-4">
          <div className="w-full max-w-sm bg-[#161722] border border-slate-700 rounded-3xl p-5 shadow-2xl space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-slate-800">
              <h3 className="text-sm font-bold text-white">หลักฐานสลิปการโอนเงิน</h3>
              <button
                onClick={() => setPreviewSlipUrl(null)}
                className="p-1 rounded-full text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <img
              src={previewSlipUrl}
              alt="Slip"
              className="w-full rounded-2xl object-contain max-h-[60vh]"
            />
          </div>
        </div>
      )}

      {/* ADD EXPENSE MODAL */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-sm bg-[#161722] border border-slate-700 rounded-3xl p-5 shadow-2xl space-y-3">
            <h3 className="text-sm font-bold text-white flex items-center space-x-1.5">
              <Receipt className="w-4 h-4 text-pink-400" />
              <span>สร้างบิลใหม่ (หารโว้ย)</span>
            </h3>

            <div className="space-y-2 text-xs">
              <div>
                <label className="text-slate-400">ชื่อรายการ</label>
                <input
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  placeholder="เช่น มื้อค่ำร้านเนื้อย่าง Jumbo"
                  className="w-full mt-1 px-2.5 py-2 rounded-xl bg-slate-800 border border-slate-700 text-white"
                />
              </div>

              <div>
                <label className="text-slate-400">ยอดเงินรวม (บาท)</label>
                <input
                  type="number"
                  value={newTotal}
                  onChange={(e) => setNewTotal(Number(e.target.value))}
                  placeholder="1000"
                  className="w-full mt-1 px-2.5 py-2 rounded-xl bg-slate-800 border border-slate-700 text-white font-bold"
                />
              </div>

              <div>
                <label className="text-slate-400">ใครเป็นคนออกเงินก่อน?</label>
                <select
                  value={newPayerId}
                  onChange={(e) => setNewPayerId(e.target.value)}
                  className="w-full mt-1 px-2.5 py-2 rounded-xl bg-slate-800 border border-slate-700 text-white"
                >
                  {tripMembers.map((m) => (
                    <option key={m.user_id} value={m.user_id}>
                      @{m.user?.username} ({m.user?.full_name})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-slate-400">
                  เลือกเพื่อนที่ร่วมหาร ({selectedUserIds.length} คน • ตกคนละ ฿
                  {Math.round(newTotal / (selectedUserIds.length || 1))})
                </label>
                <div className="grid grid-cols-2 gap-1.5 mt-1.5">
                  {tripMembers.map((m) => {
                    const isChecked = selectedUserIds.includes(m.user_id);
                    return (
                      <label
                        key={m.user_id}
                        className={`flex items-center space-x-2 p-2 rounded-xl border cursor-pointer transition-colors ${
                          isChecked
                            ? 'bg-pink-500/15 border-pink-500/40 text-white'
                            : 'bg-slate-800 border-slate-700 text-slate-400'
                        }`}
                      >
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setSelectedUserIds([...selectedUserIds, m.user_id]);
                            } else {
                              setSelectedUserIds(selectedUserIds.filter((id) => id !== m.user_id));
                            }
                          }}
                          className="hidden"
                        />
                        <img
                          src={m.user?.profile_pic_url}
                          alt=""
                          className="w-5 h-5 rounded-full object-cover shrink-0"
                        />
                        <span className="text-[11px] font-medium truncate">@{m.user?.username}</span>
                      </label>
                    );
                  })}
                </div>
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
                  if (newTitle.trim() && newTotal > 0 && selectedUserIds.length > 0) {
                    addExpense({
                      title: newTitle.trim(),
                      total_amount: newTotal,
                      payer_id: newPayerId,
                      splitUserIds: selectedUserIds,
                    });
                    setNewTitle('');
                    setShowAddModal(false);
                  }
                }}
                className="px-4 py-2 rounded-xl text-xs font-bold bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-md shadow-pink-600/20"
              >
                บันทึกบิลหาร
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
