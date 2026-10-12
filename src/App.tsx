import React, { useState, useEffect } from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { Navbar } from './components/Navbar';
import { AdminSuperBar } from './components/AdminSuperBar';
import { BottomNav, MainTabType } from './components/BottomNav';
import { TravelProcessTab } from './components/tabs/TravelProcessTab';
import { ActivitiesTab } from './components/tabs/ActivitiesTab';
import { ExpenseSplitTab } from './components/tabs/ExpenseSplitTab';
import { ChecklistTab } from './components/tabs/ChecklistTab';
import { CreateTripModal } from './components/modals/CreateTripModal';
import { JoinTripModal } from './components/modals/JoinTripModal';
import { Calendar, Users, Sparkles, MapPin } from 'lucide-react';

const MainShell: React.FC = () => {
  const { currentTrip, tripMembers, joinTripByToken } = useApp();
  const [activeTab, setActiveTab] = useState<MainTabType>('travel');
  const [showCreateTrip, setShowCreateTrip] = useState(false);
  const [showJoinTrip, setShowJoinTrip] = useState(false);

  // Auto join if URL has ?invite=TOKEN
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const inviteToken = params.get('invite');
    if (inviteToken) {
      joinTripByToken(inviteToken);
    }
  }, [joinTripByToken]);

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
      <main className="flex-1 max-w-md w-full mx-auto px-4 py-3 space-y-4">
        {/* Trip Hero Banner */}
        <div className="relative rounded-3xl overflow-hidden shadow-2xl border border-slate-800 group">
          <img
            src={currentTrip.cover_image_url}
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
                    src={member.user?.profile_pic_url}
                    alt={member.user?.username}
                    className="inline-block h-6 w-6 rounded-full ring-2 ring-[#0e101a] object-cover"
                    title={`@${member.user?.username}`}
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

export default function App() {
  return (
    <AppProvider>
      <MainShell />
    </AppProvider>
  );
}
