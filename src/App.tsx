import React, { useState, useEffect } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { AppProvider, useApp } from './context/AppContext';
import { LoginPage } from './components/LoginPage';
import { Navbar } from './components/Navbar';
import { AdminSuperBar } from './components/AdminSuperBar';
import { BottomNav, MainTabType } from './components/BottomNav';
import { TravelProcessTab } from './components/tabs/TravelProcessTab';
import { ActivitiesTab } from './components/tabs/ActivitiesTab';
import { ExpenseSplitTab } from './components/tabs/ExpenseSplitTab';
import { ChecklistTab } from './components/tabs/ChecklistTab';
import { CreateTripModal } from './components/modals/CreateTripModal';
import { JoinTripModal } from './components/modals/JoinTripModal';
import { Calendar, MapPin, Loader2, PlusCircle, Users } from 'lucide-react';

// ─── Main shell (authenticated) ────────────────────────────────────────────────
const MainShell: React.FC = () => {
  const { currentTrip, tripMembers, joinTripByToken, isLoadingData } = useApp();
  const [activeTab, setActiveTab] = useState<MainTabType>('travel');
  const [showCreateTrip, setShowCreateTrip] = useState(false);
  const [showJoinTrip, setShowJoinTrip] = useState(false);

  // Auto join if URL has ?invite=TOKEN
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const inviteToken = params.get('invite');
    if (inviteToken) {
      joinTripByToken(inviteToken);
      // Clean URL
      window.history.replaceState({}, '', window.location.pathname);
    }
  }, []);

  // Loading skeleton
  if (isLoadingData) {
    return (
      <div className="min-h-screen bg-[#0c0d12] flex items-center justify-center">
        <div className="flex flex-col items-center space-y-3">
          <Loader2 className="w-8 h-8 text-pink-500 animate-spin" />
          <p className="text-sm text-slate-400">กำลังโหลดข้อมูลทริป...</p>
        </div>
      </div>
    );
  }

  // No trips yet
  if (!currentTrip) {
    return (
      <div className="min-h-screen bg-[#0c0d12] text-slate-100 flex flex-col font-sans">
        <Navbar
          onOpenCreateTrip={() => setShowCreateTrip(true)}
          onOpenJoinTrip={() => setShowJoinTrip(true)}
        />
        <div className="flex-1 flex flex-col items-center justify-center p-8 text-center">
          <div className="w-20 h-20 rounded-3xl bg-gradient-to-tr from-[#833AB4] via-[#FD1D1D] to-[#FCB045] p-[3px] shadow-2xl shadow-pink-500/30 mb-6">
            <div className="w-full h-full bg-[#161722] rounded-[26px] flex items-center justify-center">
              <MapPin className="w-10 h-10 text-pink-400" />
            </div>
          </div>
          <h2 className="text-xl font-bold text-white mb-2">ยังไม่มีทริป</h2>
          <p className="text-sm text-slate-400 mb-8 max-w-xs">
            สร้างทริปใหม่เพื่อเริ่มแพลนการเดินทาง<br />หรือเข้าร่วมทริปของเพื่อน
          </p>
          <div className="flex flex-col w-full max-w-xs space-y-3">
            <button
              onClick={() => setShowCreateTrip(true)}
              className="w-full py-3 rounded-2xl font-bold text-sm text-white bg-gradient-to-r from-purple-600 via-pink-600 to-orange-500 hover:opacity-90 transition-all shadow-lg shadow-pink-600/30 flex items-center justify-center space-x-2"
            >
              <PlusCircle className="w-5 h-5" />
              <span>+ สร้างทริปใหม่</span>
            </button>
            <button
              onClick={() => setShowJoinTrip(true)}
              className="w-full py-3 rounded-2xl font-semibold text-sm text-slate-300 border border-slate-700 hover:border-slate-500 hover:text-white transition-all flex items-center justify-center space-x-2"
            >
              <Users className="w-5 h-5" />
              <span>เข้าร่วมด้วย Invite Token</span>
            </button>
          </div>
        </div>

        <CreateTripModal isOpen={showCreateTrip} onClose={() => setShowCreateTrip(false)} />
        <JoinTripModal isOpen={showJoinTrip} onClose={() => setShowJoinTrip(false)} />
      </div>
    );
  }

  return (
    <div className="min-h-screen-dvh bg-[#0c0d12] text-slate-100 flex flex-col font-sans">
      {/* Top Navbar */}
      <Navbar
        onOpenCreateTrip={() => setShowCreateTrip(true)}
        onOpenJoinTrip={() => setShowJoinTrip(true)}
      />

      {/* Admin Super-Bar (Visible only to Trip Admin) */}
      <AdminSuperBar />

      {/* Main Scrollable Content */}
      <main className="flex-1 max-w-md w-full mx-auto px-4 py-3 space-y-4 pb-24">
        {/* Trip Hero Banner */}
        <div className="relative rounded-3xl overflow-hidden shadow-2xl border border-slate-800 group">
          <img
            src={currentTrip.cover_image_url || 'https://images.unsplash.com/photo-1528360983277-13d401cdc186?w=800&auto=format&fit=crop&q=80'}
            alt={currentTrip.title}
            className="w-full h-36 object-cover object-center group-hover:scale-105 transition-transform duration-500"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#0e101a] via-[#0e101a]/60 to-transparent flex flex-col justify-end p-4">
            <div className="flex items-center space-x-1.5 text-xs text-amber-300 font-semibold mb-1">
              <Calendar className="w-3.5 h-3.5" />
              <span>
                {currentTrip.start_date} ➔ {currentTrip.end_date}
              </span>
            </div>

            <div className="flex items-end justify-between">
              <div>
                <h1 className="text-base font-extrabold text-white tracking-tight line-clamp-1 drop-shadow-md">
                  {currentTrip.title}
                </h1>
                <div className="text-[11px] text-slate-300 flex items-center space-x-1 mt-0.5">
                  <MapPin className="w-3 h-3 text-pink-400" />
                  <span>Instagram Travel Companion</span>
                </div>
              </div>

              {/* Members Avatar Stack */}
              <div className="flex -space-x-2 overflow-hidden items-center pl-2">
                {tripMembers.slice(0, 4).map((member) => (
                  <img
                    key={member.user_id}
                    src={(member.user as any)?.profile_pic_url || `https://ui-avatars.com/api/?name=${member.user_id}&background=833AB4&color=fff&size=50`}
                    alt={(member.user as any)?.username || 'member'}
                    className="inline-block h-6 w-6 rounded-full ring-2 ring-[#0e101a] object-cover"
                  />
                ))}
                {tripMembers.length > 4 && (
                  <div className="h-6 w-6 rounded-full bg-slate-800 ring-2 ring-[#0e101a] flex items-center justify-center text-[10px] font-bold text-slate-300">
                    +{tripMembers.length - 4}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Tab Content Display */}
        {activeTab === 'travel' && <TravelProcessTab />}
        {activeTab === 'activities' && (
          <ActivitiesTab onGoToExpenses={() => setActiveTab('split')} />
        )}
        {activeTab === 'split' && <ExpenseSplitTab />}
        {activeTab === 'checklist' && <ChecklistTab />}
      </main>

      {/* Persistent Bottom Navigation Bar */}
      <BottomNav activeTab={activeTab} setActiveTab={setActiveTab} />

      {/* Modals */}
      <CreateTripModal
        isOpen={showCreateTrip}
        onClose={() => setShowCreateTrip(false)}
      />
      <JoinTripModal
        isOpen={showJoinTrip}
        onClose={() => setShowJoinTrip(false)}
      />
    </div>
  );
};

// ─── Auth Guard ────────────────────────────────────────────────────────────────
const AuthGuard: React.FC = () => {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#0c0d12] flex items-center justify-center">
        <div className="flex flex-col items-center space-y-3">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-[#833AB4] via-[#FD1D1D] to-[#FCB045] p-[2px]">
            <div className="w-full h-full bg-[#161722] rounded-xl flex items-center justify-center">
              <Loader2 className="w-6 h-6 text-pink-500 animate-spin" />
            </div>
          </div>
          <p className="text-sm text-slate-400">กำลังตรวจสอบการเข้าสู่ระบบ...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <LoginPage />;
  }

  return (
    <AppProvider>
      <MainShell />
    </AppProvider>
  );
};

// ─── Root App ─────────────────────────────────────────────────────────────────
export default function App() {
  return (
    <AuthProvider>
      <AuthGuard />
    </AuthProvider>
  );
}
