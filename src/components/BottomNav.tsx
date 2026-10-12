import React from 'react';
import { Plane, Ticket, Receipt, CheckSquare } from 'lucide-react';
import { useApp } from '../context/AppContext';

export type MainTabType = 'travel' | 'activities' | 'split' | 'checklist';

interface BottomNavProps {
  activeTab: MainTabType;
  setActiveTab: (tab: MainTabType) => void;
}

export const BottomNav: React.FC<BottomNavProps> = ({ activeTab, setActiveTab }) => {
  const { expenses, currentUser, checklists, personalChecklistStatus } = useApp();

  // Count pending or unpaid bills for current user
  const unpaidCount = expenses.reduce((count, exp) => {
    const mySplit = exp.splits.find((s) => s.user_id === currentUser.id);
    if (mySplit && (mySplit.status === 'UNPAID' || mySplit.status === 'PENDING_VERIFY')) {
      return count + 1;
    }
    return count;
  }, 0);

  // Count pending personal checklist items
  const personalItems = checklists.filter((c) => c.category === 'PERSONAL');
  const personalPending = personalItems.filter((c) => !personalChecklistStatus[c.id]).length;

  const tabs: {
    id: MainTabType;
    label: string;
    icon: React.ComponentType<{ className?: string }>;
    badge?: number;
  }[] = [
    { id: 'travel', label: 'กระบวนการเที่ยว', icon: Plane },
    { id: 'activities', label: 'กิจกรรม & เดินทาง', icon: Ticket },
    { id: 'split', label: 'หารโว้ย', icon: Receipt, badge: unpaidCount },
    { id: 'checklist', label: 'Checklist', icon: CheckSquare, badge: personalPending > 0 ? personalPending : undefined },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 bg-[#0f101a]/95 backdrop-blur-xl border-t border-slate-800/80 pb-safe">
      <div className="max-w-md mx-auto grid grid-cols-4 px-2 py-2">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;

          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`relative flex flex-col items-center justify-center py-1.5 px-1 rounded-2xl transition-all duration-200 ${
                isActive
                  ? 'text-white'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              {/* Active glow pill */}
              {isActive && (
                <div className="absolute inset-0 bg-gradient-to-r from-purple-500/10 via-pink-500/15 to-orange-500/10 rounded-2xl border border-pink-500/20" />
              )}

              <div className="relative">
                <Icon
                  className={`w-5 h-5 transition-transform duration-200 ${
                    isActive ? 'scale-110 text-pink-400' : ''
                  }`}
                />

                {/* Badge */}
                {tab.badge !== undefined && tab.badge > 0 && (
                  <span className="absolute -top-1.5 -right-2 bg-gradient-to-r from-red-500 to-pink-500 text-white text-[10px] font-bold rounded-full w-4 h-4 flex items-center justify-center ring-2 ring-[#0f101a]">
                    {tab.badge}
                  </span>
                )}
              </div>

              <span
                className={`text-[10px] mt-1 font-medium tracking-tight truncate max-w-full relative ${
                  isActive ? 'text-pink-300 font-semibold' : ''
                }`}
              >
                {tab.label}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
};
