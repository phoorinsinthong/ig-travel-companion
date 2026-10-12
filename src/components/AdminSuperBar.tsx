import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import {
  ShieldCheck,
  Copy,
  Check,
  Share2,
  Users,
  Edit2,
  Crown,
  UserX,
  X,
  Database,
  ExternalLink,
  Sparkles,
} from 'lucide-react';
import { isSupabaseConfigured } from '../lib/supabase';

export const AdminSuperBar: React.FC = () => {
  const {
    isAdmin,
    currentTrip,
    tripMembers,
    kickMember,
    setMemberRole,
    updateTripTitle,
    currentUser,
  } = useApp();

  const [copied, setCopied] = useState(false);
  const [copiedSql, setCopiedSql] = useState(false);
  const [showMemberModal, setShowMemberModal] = useState(false);
  const [showEditTitleModal, setShowEditTitleModal] = useState(false);
  const [showDatabaseModal, setShowDatabaseModal] = useState(false);
  const [newTitle, setNewTitle] = useState(currentTrip.title);

  if (!isAdmin) return null;

  const inviteUrl = `${window.location.origin}${window.location.pathname}?invite=${currentTrip.invite_token}`;

  const handleCopyLink = () => {
    navigator.clipboard.writeText(inviteUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleShareToIG = () => {
    if (navigator.share) {
      navigator.share({
        title: currentTrip.title,
        text: `เฮ้! กดลิงก์นี้เพื่อเข้าทริป ${currentTrip.title} ด้วยกันบน IG Companion:`,
        url: inviteUrl,
      }).catch(() => {});
    } else {
      handleCopyLink();
      window.open('https://instagram.com/direct/inbox/', '_blank');
    }
  };

  return (
    <div className="bg-gradient-to-r from-amber-500/15 via-orange-500/10 to-pink-500/15 border-b border-amber-500/30 px-3 py-2">
      <div className="max-w-md mx-auto flex items-center justify-between gap-2 text-xs">
        <div className="flex items-center space-x-1.5 min-w-0">
          <div className="p-1 rounded-md bg-amber-500/20 text-amber-400 shrink-0">
            <ShieldCheck className="w-3.5 h-3.5" />
          </div>
          <span className="font-semibold text-amber-300 truncate">
            Admin Super-Bar
          </span>
          <button
            onClick={() => setShowDatabaseModal(true)}
            className={`inline-flex items-center space-x-1 text-[10px] px-1.5 py-0.5 rounded-full border transition-colors ${
              isSupabaseConfigured
                ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30'
                : 'bg-slate-800 text-slate-300 border-slate-700 hover:border-amber-400'
            }`}
            title="คลิกดูสถานะฐานข้อมูล Supabase"
          >
            <Database className="w-2.5 h-2.5" />
            <span>{isSupabaseConfigured ? 'Supabase Live' : 'Local Mode'}</span>
          </button>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center space-x-1 shrink-0">
          <button
            onClick={handleCopyLink}
            className="flex items-center space-x-1 px-2 py-1 rounded-lg bg-slate-800/90 hover:bg-slate-700 text-slate-200 border border-slate-700 transition-colors"
            title="คัดลอก Invite Link"
          >
            {copied ? (
              <>
                <Check className="w-3 h-3 text-emerald-400" />
                <span className="text-[10px] text-emerald-400">คัดลอกแล้ว</span>
              </>
            ) : (
              <>
                <Copy className="w-3 h-3 text-slate-300" />
                <span className="text-[10px]">ลิงก์เชิญ</span>
              </>
            )}
          </button>

          <button
            onClick={handleShareToIG}
            className="flex items-center space-x-1 px-2 py-1 rounded-lg bg-gradient-to-r from-[#833AB4] to-[#FD1D1D] hover:opacity-90 text-white font-medium shadow-sm transition-opacity"
            title="แชร์ลง Instagram DM"
          >
            <Share2 className="w-3 h-3" />
            <span className="text-[10px]">ส่ง IG</span>
          </button>

          <button
            onClick={() => setShowMemberModal(true)}
            className="p-1.5 rounded-lg bg-slate-800/90 hover:bg-slate-700 text-slate-200 border border-slate-700 transition-colors"
            title="จัดการสมาชิกในทริป"
          >
            <Users className="w-3.5 h-3.5" />
          </button>

          <button
            onClick={() => {
              setNewTitle(currentTrip.title);
              setShowEditTitleModal(true);
            }}
            className="p-1.5 rounded-lg bg-slate-800/90 hover:bg-slate-700 text-slate-200 border border-slate-700 transition-colors"
            title="แก้ไขชื่อทริป"
          >
            <Edit2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Database Setup & Status Modal */}
      {showDatabaseModal && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4">
          <div className="w-full max-w-sm bg-[#161722] border border-slate-700 rounded-3xl p-5 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-slate-800">
              <div className="flex items-center space-x-2">
                <Database className="w-4 h-4 text-emerald-400" />
                <h3 className="text-sm font-bold text-white">การเชื่อมต่อฐานข้อมูล (Supabase)</h3>
              </div>
              <button
                onClick={() => setShowDatabaseModal(false)}
                className="p-1 rounded-full text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div className="p-3 rounded-2xl bg-slate-800/80 border border-slate-700 space-y-1.5">
                <div className="flex items-center justify-between font-semibold">
                  <span className="text-slate-300">สถานะปัจจุบัน:</span>
                  <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                    isSupabaseConfigured
                      ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                      : 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                  }`}>
                    {isSupabaseConfigured ? '🟢 เชื่อมต่อ Cloud Live แล้ว' : '🟡 ใช้งานแบบ Local + Offline Store'}
                  </span>
                </div>
                <p className="text-[11px] text-slate-400 leading-relaxed">
                  {isSupabaseConfigured
                    ? 'ข้อมูลทั้งหมดจะซิงค์แบบเรียลไทม์ผ่าน PostgreSQL บน Supabase Cloud และรูปสลิปจะอัปโหลดเข้า Storage Bucket'
                    : 'แอปกำลังบันทึกข้อมูลลงใน LocalStorage อัตโนมัติ (พร้อมใช้งาน 100% แม้ไม่มีเน็ต). หากต้องการต่อกับ Supabase ให้ใส่กุญแจในไฟล์ .env'}
                </p>
              </div>

              <div className="space-y-1.5">
                <div className="text-slate-300 font-semibold">วิธีเชื่อมต่อ Cloud Supabase (3 สเต็ป):</div>
                <ol className="list-decimal list-inside space-y-1 text-slate-400 text-[11px]">
                  <li>เปิด <a href="https://supabase.com" target="_blank" rel="noreferrer" className="text-pink-400 underline">supabase.com</a> แล้วสร้าง Project ใหม่</li>
                  <li>นำโค้ดใน <span className="font-mono text-amber-300">supabase/schema.sql</span> ไปรันใน SQL Editor</li>
                  <li>คัดลอก Project URL & Anon Key มาวางในไฟล์ <span className="font-mono text-amber-300">.env</span></li>
                </ol>
              </div>

              <div className="pt-2 border-t border-slate-800 flex items-center justify-between">
                <span className="text-[10px] text-slate-500">ไฟล์ Schema: supabase/schema.sql</span>
                <button
                  onClick={() => {
                    navigator.clipboard.writeText('supabase/schema.sql');
                    setCopiedSql(true);
                    setTimeout(() => setCopiedSql(false), 2000);
                  }}
                  className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-[11px] text-slate-200 border border-slate-700 flex items-center space-x-1"
                >
                  {copiedSql ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                  <span>{copiedSql ? 'คัดลอกชื่อไฟล์แล้ว' : 'คัดลอกพาธ'}</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Members Management Modal */}
      {showMemberModal && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-end sm:items-center justify-center p-0 sm:p-4">
          <div className="w-full sm:max-w-md bg-[#161722] border border-slate-700 rounded-t-3xl sm:rounded-3xl p-5 shadow-2xl max-h-[85vh] flex flex-col">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center space-x-2">
                <Users className="w-5 h-5 text-amber-400" />
                <h3 className="font-bold text-base text-white">จัดการสมาชิกในทริป ({tripMembers.length})</h3>
              </div>
              <button
                onClick={() => setShowMemberModal(false)}
                className="p-1 rounded-full text-slate-400 hover:text-white hover:bg-slate-800"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="py-3 flex-1 overflow-y-auto space-y-2">
              {tripMembers.map((member) => {
                const u = member.user;
                if (!u) return null;
                const isMemberAdmin = member.role === 'ADMIN';
                const isMe = u.id === currentUser.id;

                return (
                  <div
                    key={member.user_id}
                    className="flex items-center justify-between p-3 rounded-2xl bg-slate-800/60 border border-slate-700/60"
                  >
                    <div className="flex items-center space-x-3 min-w-0">
                      <img
                        src={u.profile_pic_url}
                        alt={u.username}
                        className="w-10 h-10 rounded-full object-cover ring-2 ring-slate-700 shrink-0"
                      />
                      <div className="min-w-0">
                        <div className="flex items-center space-x-1.5">
                          <span className="font-semibold text-sm text-white truncate">
                            @{u.username}
                          </span>
                          {isMemberAdmin && (
                            <span className="px-1.5 py-0.5 rounded-full text-[9px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30 flex items-center">
                              <Crown className="w-2.5 h-2.5 mr-0.5" /> Admin
                            </span>
                          )}
                        </div>
                        <div className="text-xs text-slate-400 truncate">{u.full_name}</div>
                      </div>
                    </div>

                    {!isMe && (
                      <div className="flex items-center space-x-1 shrink-0">
                        <button
                          onClick={() => setMemberRole(u.id, isMemberAdmin ? 'MEMBER' : 'ADMIN')}
                          className={`p-1.5 rounded-lg text-xs font-medium border transition-colors ${
                            isMemberAdmin
                              ? 'bg-slate-700/60 text-slate-300 border-slate-600 hover:bg-slate-700'
                              : 'bg-amber-500/10 text-amber-300 border-amber-500/30 hover:bg-amber-500/20'
                          }`}
                          title={isMemberAdmin ? 'ปลดออกจาก Admin' : 'แต่งตั้งเป็น Admin'}
                        >
                          <Crown className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => {
                            if (confirm(`คุณต้องการเตะ @${u.username} ออกจากทริปนี้หรือไม่?`)) {
                              kickMember(u.id);
                            }
                          }}
                          className="p-1.5 rounded-lg text-xs text-rose-400 bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/20 transition-colors"
                          title="เตะสมาชิกออกจากทริป"
                        >
                          <UserX className="w-4 h-4" />
                        </button>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            <div className="pt-3 border-t border-slate-800 text-center">
              <p className="text-xs text-slate-400">
                Super Admin มีสิทธิ์จัดการสมาชิกและแก้ไข/ลบข้อมูลของทุกคนในทริป
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Edit Title Modal */}
      {showEditTitleModal && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-sm bg-[#161722] border border-slate-700 rounded-3xl p-5 shadow-2xl space-y-4">
            <h3 className="font-bold text-base text-white">แก้ไขชื่อทริป</h3>
            <input
              type="text"
              value={newTitle}
              onChange={(e) => setNewTitle(e.target.value)}
              className="w-full px-3 py-2.5 rounded-xl bg-slate-800 border border-slate-700 text-white text-sm focus:outline-none focus:border-amber-400"
              placeholder="ชื่อทริปใหม่..."
            />
            <div className="flex items-center justify-end space-x-2">
              <button
                onClick={() => setShowEditTitleModal(false)}
                className="px-3 py-2 rounded-xl text-xs font-semibold text-slate-300 hover:bg-slate-800"
              >
                ยกเลิก
              </button>
              <button
                onClick={() => {
                  if (newTitle.trim()) {
                    updateTripTitle(newTitle.trim());
                    setShowEditTitleModal(false);
                  }
                }}
                className="px-4 py-2 rounded-xl text-xs font-semibold bg-amber-500 hover:bg-amber-400 text-black font-bold transition-colors"
              >
                บันทึกชื่อทริป
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
