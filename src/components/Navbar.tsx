import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Users, Sparkles, ChevronDown, PlusCircle, Check, Crown } from 'lucide-react';

interface NavbarProps {
  onOpenCreateTrip: () => void;
  onOpenJoinTrip: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ onOpenCreateTrip, onOpenJoinTrip }) => {
  const {
    currentUser,
    allUsers,
    switchUser,
    currentTrip,
    allTrips,
    setCurrentTrip,
    isAdmin,
    tripMembers,
  } = useApp();

  const [showUserDropdown, setShowUserDropdown] = useState(false);
  const [showTripDropdown, setShowTripDropdown] = useState(false);

  return (
    <header className="sticky top-0 z-40 bg-[#0e0f17]/90 backdrop-blur-md border-b border-slate-800/80 px-4 py-3">
      <div className="max-w-md mx-auto flex items-center justify-between">
        {/* Left: Trip Switcher & Branding */}
        <div className="relative">
          <button
            onClick={() => setShowTripDropdown(!showTripDropdown)}
            className="flex items-center space-x-2 text-left group"
          >
            <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-[#833AB4] via-[#FD1D1D] to-[#FCB045] p-[2px] shadow-sm shadow-pink-500/20">
              <div className="w-full h-full bg-[#161722] rounded-[10px] flex items-center justify-center">
                <svg className="w-4 h-4 text-white group-hover:scale-110 transition-transform" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect>
                  <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path>
                  <line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line>
                </svg>
              </div>
            </div>
            <div>
              <div className="flex items-center space-x-1">
                <h1 className="text-sm font-bold text-white tracking-tight line-clamp-1 max-w-[150px]">
                  {currentTrip.title}
                </h1>
                <ChevronDown className="w-3.5 h-3.5 text-slate-400 group-hover:text-white transition-colors" />
              </div>
              <div className="flex items-center space-x-1.5 text-[11px] text-slate-400">
                <span>{tripMembers.length} สมาชิก</span>
                {isAdmin && (
                  <span className="inline-flex items-center px-1.5 py-0.2 rounded-full text-[9px] font-semibold bg-amber-500/10 text-amber-400 border border-amber-500/20">
                    <Crown className="w-2.5 h-2.5 mr-0.5" /> Admin
                  </span>
                )}
              </div>
            </div>
          </button>

          {/* Trip Dropdown */}
          {showTripDropdown && (
            <div className="absolute top-full left-0 mt-2 w-72 rounded-2xl bg-[#181a26] border border-slate-700/80 shadow-2xl p-2 z-50 animate-in fade-in zoom-in-95 duration-150">
              <div className="text-[11px] font-semibold uppercase text-slate-400 px-3 py-1.5">
                ทริปทั้งหมดของคุณ
              </div>
              <div className="space-y-1">
                {allTrips.map((trip) => (
                  <button
                    key={trip.id}
                    onClick={() => {
                      setCurrentTrip(trip);
                      setShowTripDropdown(false);
                    }}
                    className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-left text-xs transition-colors ${
                      trip.id === currentTrip.id
                        ? 'bg-pink-500/15 text-pink-300 font-semibold border border-pink-500/30'
                        : 'text-slate-300 hover:bg-slate-800'
                    }`}
                  >
                    <span className="line-clamp-1">{trip.title}</span>
                    {trip.id === currentTrip.id && <Check className="w-4 h-4 text-pink-400 shrink-0" />}
                  </button>
                ))}
              </div>

              <div className="mt-2 pt-2 border-t border-slate-700/60 space-y-1">
                <button
                  onClick={() => {
                    setShowTripDropdown(false);
                    onOpenCreateTrip();
                  }}
                  className="w-full flex items-center space-x-2 px-3 py-2 rounded-xl text-xs font-semibold text-white bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 transition-all shadow-md shadow-pink-600/20"
                >
                  <PlusCircle className="w-4 h-4" />
                  <span>+ สร้างทริปใหม่</span>
                </button>
                <button
                  onClick={() => {
                    setShowTripDropdown(false);
                    onOpenJoinTrip();
                  }}
                  className="w-full flex items-center space-x-2 px-3 py-2 rounded-xl text-xs font-medium text-slate-300 hover:bg-slate-800 transition-colors"
                >
                  <Users className="w-4 h-4" />
                  <span>เข้าร่วมด้วย Invite Token</span>
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Right: Switch User Simulator (To test RBAC & Payer views) */}
        <div className="relative">
          <button
            onClick={() => setShowUserDropdown(!showUserDropdown)}
            className="flex items-center space-x-1.5 p-1 rounded-full bg-slate-800/80 hover:bg-slate-700/80 border border-slate-700 transition-all"
            title="สลับบัญชีเพื่อทดสอบมุมมอง Member vs Payer"
          >
            <div className="relative">
              <img
                src={currentUser.profile_pic_url}
                alt={currentUser.username}
                className="w-7 h-7 rounded-full object-cover ring-2 ring-pink-500/60"
              />
              {isAdmin && (
                <div className="absolute -bottom-0.5 -right-0.5 bg-amber-500 text-black text-[8px] font-bold rounded-full w-3.5 h-3.5 flex items-center justify-center">
                  ★
                </div>
              )}
            </div>
            <div className="hidden sm:block text-left pr-1.5">
              <div className="text-[11px] font-semibold text-white leading-tight">
                @{currentUser.username}
              </div>
              <div className="text-[9px] text-pink-400">สลับผู้ใช้</div>
            </div>
            <ChevronDown className="w-3 h-3 text-slate-400 pr-0.5" />
          </button>

          {/* User Switcher Dropdown */}
          {showUserDropdown && (
            <div className="absolute top-full right-0 mt-2 w-64 rounded-2xl bg-[#181a26] border border-slate-700/80 shadow-2xl p-2 z-50 animate-in fade-in zoom-in-95 duration-150">
              <div className="flex items-center justify-between px-3 py-1.5 text-[11px] font-semibold text-slate-400 border-b border-slate-700/50 pb-2">
                <span>จำลองการเข้าสู่ระบบ IG</span>
                <Sparkles className="w-3.5 h-3.5 text-pink-400" />
              </div>
              <div className="mt-1 space-y-1">
                {allUsers.map((user) => {
                  const isCurrent = user.id === currentUser.id;
                  const isUserAdmin = currentTrip.created_by === user.id;
                  return (
                    <button
                      key={user.id}
                      onClick={() => {
                        switchUser(user.id);
                        setShowUserDropdown(false);
                      }}
                      className={`w-full flex items-center space-x-2.5 px-2.5 py-2 rounded-xl text-left transition-colors ${
                        isCurrent
                          ? 'bg-gradient-to-r from-purple-900/40 to-pink-900/40 border border-pink-500/30'
                          : 'hover:bg-slate-800'
                      }`}
                    >
                      <img
                        src={user.profile_pic_url}
                        alt={user.username}
                        className="w-8 h-8 rounded-full object-cover shrink-0"
                      />
                      <div className="flex-1 min-w-0">
                        <div className="text-xs font-semibold text-white truncate flex items-center space-x-1">
                          <span>@{user.username}</span>
                          {isUserAdmin && (
                            <span className="text-[9px] text-amber-400 font-normal">👑</span>
                          )}
                        </div>
                        <div className="text-[10px] text-slate-400 truncate">{user.full_name}</div>
                      </div>
                      {isCurrent && <Check className="w-4 h-4 text-pink-400 shrink-0" />}
                    </button>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
