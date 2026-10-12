import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  User,
  Trip,
  TripMember,
  Flight,
  Hotel,
  DailyPlan,
  ActivityTransit,
  Expense,
  ChecklistItem,
} from '../types/database';
import {
  INITIAL_USERS,
  INITIAL_TRIP,
  INITIAL_MEMBERS,
  INITIAL_FLIGHTS,
  INITIAL_HOTELS,
  INITIAL_DAILY_PLANS,
  INITIAL_ACTIVITIES,
  INITIAL_EXPENSES,
  INITIAL_CHECKLIST,
  INITIAL_PERSONAL_STATUS,
} from '../data/mockData';

interface AppContextType {
  currentUser: User;
  allUsers: User[];
  currentTrip: Trip;
  allTrips: Trip[];
  tripMembers: TripMember[];
  flights: Flight[];
  hotels: Hotel[];
  dailyPlans: DailyPlan[];
  activities: ActivityTransit[];
  expenses: Expense[];
  checklists: ChecklistItem[];
  personalChecklistStatus: Record<string, boolean>;

  // RBAC checks
  isAdmin: boolean;
  isCreator: (creatorId: string) => boolean;
  canManageItem: (creatorId: string) => boolean;

  // Actions
  setCurrentTrip: (trip: Trip) => void;
  switchUser: (userId: string) => void;
  loginWithInstagram: (username: string, fullName: string) => void;
  createTrip: (trip: Omit<Trip, 'id' | 'invite_token' | 'created_by' | 'created_at'>) => Trip;
  joinTripByToken: (token: string) => boolean;
  updateTripTitle: (newTitle: string) => void;

  // Admin Member Actions
  kickMember: (userId: string) => void;
  setMemberRole: (userId: string, role: 'ADMIN' | 'MEMBER') => void;

  // Items Actions
  addFlight: (flight: Omit<Flight, 'id' | 'trip_id' | 'created_by'>) => void;
  deleteFlight: (id: string) => void;

  addHotel: (hotel: Omit<Hotel, 'id' | 'trip_id' | 'created_by'>) => void;
  deleteHotel: (id: string) => void;

  addDailyPlan: (plan: Omit<DailyPlan, 'id' | 'trip_id' | 'created_by'>) => void;
  deleteDailyPlan: (id: string) => void;

  addActivity: (act: Omit<ActivityTransit, 'id' | 'trip_id' | 'created_by'>) => void;
  deleteActivity: (id: string) => void;

  addExpense: (expense: {
    title: string;
    total_amount: number;
    payer_id: string;
    receipt_url?: string;
    activity_id?: string;
    splitUserIds: string[];
  }) => void;
  deleteExpense: (id: string) => void;
  submitPaymentSlip: (expenseId: string, splitUserId: string, slipUrl: string) => void;
  confirmPayment: (expenseId: string, splitUserId: string) => void;

  // Checklist Actions
  toggleChecklistItem: (itemId: string, isShared: boolean) => void;
  addChecklistItem: (title: string, category: 'PERSONAL' | 'SHARED', assigned_to?: string) => void;
  deleteChecklistItem: (id: string) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

const STORAGE_KEY = 'ig_travel_companion_state_v1';

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Load saved state or use initial mock data
  const [currentUser, setCurrentUser] = useState<User>(() => {
    const saved = localStorage.getItem(`${STORAGE_KEY}_user`);
    return saved ? JSON.parse(saved) : INITIAL_USERS[0];
  });

  const [allUsers, setAllUsers] = useState<User[]>(() => {
    const saved = localStorage.getItem(`${STORAGE_KEY}_allUsers`);
    return saved ? JSON.parse(saved) : INITIAL_USERS;
  });

  const [allTrips, setAllTrips] = useState<Trip[]>(() => {
    const saved = localStorage.getItem(`${STORAGE_KEY}_allTrips`);
    return saved ? JSON.parse(saved) : [INITIAL_TRIP];
  });

  const [currentTrip, setCurrentTrip] = useState<Trip>(() => {
    const saved = localStorage.getItem(`${STORAGE_KEY}_currentTrip`);
    return saved ? JSON.parse(saved) : INITIAL_TRIP;
  });

  const [tripMembers, setTripMembers] = useState<TripMember[]>(() => {
    const saved = localStorage.getItem(`${STORAGE_KEY}_members`);
    return saved ? JSON.parse(saved) : INITIAL_MEMBERS;
  });

  const [flights, setFlights] = useState<Flight[]>(() => {
    const saved = localStorage.getItem(`${STORAGE_KEY}_flights`);
    return saved ? JSON.parse(saved) : INITIAL_FLIGHTS;
  });

  const [hotels, setHotels] = useState<Hotel[]>(() => {
    const saved = localStorage.getItem(`${STORAGE_KEY}_hotels`);
    return saved ? JSON.parse(saved) : INITIAL_HOTELS;
  });

  const [dailyPlans, setDailyPlans] = useState<DailyPlan[]>(() => {
    const saved = localStorage.getItem(`${STORAGE_KEY}_dailyPlans`);
    return saved ? JSON.parse(saved) : INITIAL_DAILY_PLANS;
  });

  const [activities, setActivities] = useState<ActivityTransit[]>(() => {
    const saved = localStorage.getItem(`${STORAGE_KEY}_activities`);
    return saved ? JSON.parse(saved) : INITIAL_ACTIVITIES;
  });

  const [expenses, setExpenses] = useState<Expense[]>(() => {
    const saved = localStorage.getItem(`${STORAGE_KEY}_expenses`);
    return saved ? JSON.parse(saved) : INITIAL_EXPENSES;
  });

  const [checklists, setChecklists] = useState<ChecklistItem[]>(() => {
    const saved = localStorage.getItem(`${STORAGE_KEY}_checklists`);
    return saved ? JSON.parse(saved) : INITIAL_CHECKLIST;
  });

  const [personalChecklistStatus, setPersonalChecklistStatus] = useState<Record<string, boolean>>(() => {
    const saved = localStorage.getItem(`${STORAGE_KEY}_personalStatus`);
    return saved ? JSON.parse(saved) : INITIAL_PERSONAL_STATUS;
  });

  // Save to localStorage on change
  useEffect(() => {
    localStorage.setItem(`${STORAGE_KEY}_user`, JSON.stringify(currentUser));
  }, [currentUser]);

  useEffect(() => {
    localStorage.setItem(`${STORAGE_KEY}_allUsers`, JSON.stringify(allUsers));
  }, [allUsers]);

  useEffect(() => {
    localStorage.setItem(`${STORAGE_KEY}_allTrips`, JSON.stringify(allTrips));
  }, [allTrips]);

  useEffect(() => {
    localStorage.setItem(`${STORAGE_KEY}_currentTrip`, JSON.stringify(currentTrip));
  }, [currentTrip]);

  useEffect(() => {
    localStorage.setItem(`${STORAGE_KEY}_members`, JSON.stringify(tripMembers));
  }, [tripMembers]);

  useEffect(() => {
    localStorage.setItem(`${STORAGE_KEY}_flights`, JSON.stringify(flights));
  }, [flights]);

  useEffect(() => {
    localStorage.setItem(`${STORAGE_KEY}_hotels`, JSON.stringify(hotels));
  }, [hotels]);

  useEffect(() => {
    localStorage.setItem(`${STORAGE_KEY}_dailyPlans`, JSON.stringify(dailyPlans));
  }, [dailyPlans]);

  useEffect(() => {
    localStorage.setItem(`${STORAGE_KEY}_activities`, JSON.stringify(activities));
  }, [activities]);

  useEffect(() => {
    localStorage.setItem(`${STORAGE_KEY}_expenses`, JSON.stringify(expenses));
  }, [expenses]);

  useEffect(() => {
    localStorage.setItem(`${STORAGE_KEY}_checklists`, JSON.stringify(checklists));
  }, [checklists]);

  useEffect(() => {
    localStorage.setItem(`${STORAGE_KEY}_personalStatus`, JSON.stringify(personalChecklistStatus));
  }, [personalChecklistStatus]);

  // RBAC checks
  const currentMember = tripMembers.find(
    (m) => m.trip_id === currentTrip.id && m.user_id === currentUser.id
  );
  const isAdmin = currentMember?.role === 'ADMIN' || currentTrip.created_by === currentUser.id;

  const isCreator = (creatorId: string) => currentUser.id === creatorId;
  const canManageItem = (creatorId: string) => isAdmin || isCreator(creatorId);

  // Switch User
  const switchUser = (userId: string) => {
    const target = allUsers.find((u) => u.id === userId);
    if (target) {
      setCurrentUser(target);
    }
  };

  // Instagram Mock Login
  const loginWithInstagram = (username: string, fullName: string) => {
    const cleanUsername = username.replace(/^@/, '').toLowerCase().trim();
    let existing = allUsers.find((u) => u.username.toLowerCase() === cleanUsername);
    if (!existing) {
      existing = {
        id: `usr-${Date.now()}`,
        ig_user_id: `ig_${Date.now()}`,
        username: cleanUsername,
        full_name: fullName || `@${cleanUsername}`,
        profile_pic_url: `https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80`,
        promptpay_number: '0810000000',
        promptpay_qr_url: `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=PROMPTPAY_${cleanUsername}`,
      };
      setAllUsers((prev) => [...prev, existing!]);
    }
    setCurrentUser(existing);

    // Auto join current trip if not member
    const alreadyMember = tripMembers.some(
      (m) => m.trip_id === currentTrip.id && m.user_id === existing!.id
    );
    if (!alreadyMember) {
      setTripMembers((prev) => [
        ...prev,
        {
          trip_id: currentTrip.id,
          user_id: existing!.id,
          role: 'MEMBER',
          joined_at: new Date().toISOString(),
          user: existing,
        },
      ]);
    }
  };

  // Create Trip
  const createTrip = (tripData: Omit<Trip, 'id' | 'invite_token' | 'created_by' | 'created_at'>) => {
    const newTripId = `trip-${Date.now()}`;
    const token = `IG-${Math.random().toString(36).substring(2, 8).toUpperCase()}`;
    const newTrip: Trip = {
      ...tripData,
      id: newTripId,
      invite_token: token,
      created_by: currentUser.id,
      created_at: new Date().toISOString(),
    };
    setAllTrips((prev) => [newTrip, ...prev]);
    setCurrentTrip(newTrip);

    // Set current user as ADMIN
    setTripMembers((prev) => [
      ...prev,
      {
        trip_id: newTripId,
        user_id: currentUser.id,
        role: 'ADMIN',
        joined_at: new Date().toISOString(),
        user: currentUser,
      },
    ]);
    return newTrip;
  };

  const updateTripTitle = (newTitle: string) => {
    setCurrentTrip((prev) => ({ ...prev, title: newTitle }));
    setAllTrips((prev) => prev.map((t) => (t.id === currentTrip.id ? { ...t, title: newTitle } : t)));
  };

  // Join trip by token
  const joinTripByToken = (token: string) => {
    const target = allTrips.find((t) => t.invite_token.toLowerCase() === token.trim().toLowerCase());
    if (!target) return false;

    setCurrentTrip(target);
    const isMember = tripMembers.some((m) => m.trip_id === target.id && m.user_id === currentUser.id);
    if (!isMember) {
      setTripMembers((prev) => [
        ...prev,
        {
          trip_id: target.id,
          user_id: currentUser.id,
          role: 'MEMBER',
          joined_at: new Date().toISOString(),
          user: currentUser,
        },
      ]);
    }
    return true;
  };

  // Member Management
  const kickMember = (userId: string) => {
    if (!isAdmin) return;
    setTripMembers((prev) => prev.filter((m) => !(m.trip_id === currentTrip.id && m.user_id === userId)));
  };

  const setMemberRole = (userId: string, role: 'ADMIN' | 'MEMBER') => {
    if (!isAdmin) return;
    setTripMembers((prev) =>
      prev.map((m) =>
        m.trip_id === currentTrip.id && m.user_id === userId ? { ...m, role } : m
      )
    );
  };

  // Flight actions
  const addFlight = (flight: Omit<Flight, 'id' | 'trip_id' | 'created_by'>) => {
    const newFlight: Flight = {
      ...flight,
      id: `fl-${Date.now()}`,
      trip_id: currentTrip.id,
      created_by: currentUser.id,
    };
    setFlights((prev) => [...prev, newFlight]);
  };

  const deleteFlight = (id: string) => {
    setFlights((prev) => prev.filter((f) => f.id !== id));
  };

  // Hotel actions
  const addHotel = (hotel: Omit<Hotel, 'id' | 'trip_id' | 'created_by'>) => {
    const newHotel: Hotel = {
      ...hotel,
      id: `ht-${Date.now()}`,
      trip_id: currentTrip.id,
      created_by: currentUser.id,
    };
    setHotels((prev) => [...prev, newHotel]);
  };

  const deleteHotel = (id: string) => {
    setHotels((prev) => prev.filter((h) => h.id !== id));
  };

  // Daily Plan actions
  const addDailyPlan = (plan: Omit<DailyPlan, 'id' | 'trip_id' | 'created_by'>) => {
    const newPlan: DailyPlan = {
      ...plan,
      id: `dp-${Date.now()}`,
      trip_id: currentTrip.id,
      created_by: currentUser.id,
    };
    setDailyPlans((prev) => [...prev, newPlan]);
  };

  const deleteDailyPlan = (id: string) => {
    setDailyPlans((prev) => prev.filter((p) => p.id !== id));
  };

  // Activity actions
  const addActivity = (act: Omit<ActivityTransit, 'id' | 'trip_id' | 'created_by'>) => {
    const newAct: ActivityTransit = {
      ...act,
      id: `act-${Date.now()}`,
      trip_id: currentTrip.id,
      created_by: currentUser.id,
    };
    setActivities((prev) => [...prev, newAct]);

    // If marked has_expense, automatically create expense in "หารโว้ย"
    if (newAct.has_expense && newAct.expense_amount && newAct.expense_amount > 0) {
      const activeMembers = tripMembers.filter((m) => m.trip_id === currentTrip.id);
      const splitAmount = Math.round((newAct.expense_amount / (activeMembers.length || 1)) * 100) / 100;
      const splits = activeMembers.map((m) => ({
        id: `sp-${Date.now()}-${m.user_id}`,
        expense_id: `exp-${Date.now()}`,
        user_id: m.user_id,
        amount: splitAmount,
        status: (m.user_id === currentUser.id ? 'CONFIRMED' : 'UNPAID') as any,
        user: m.user || allUsers.find((u) => u.id === m.user_id),
      }));

      const newExp: Expense = {
        id: `exp-${Date.now()}`,
        trip_id: currentTrip.id,
        payer_id: currentUser.id,
        title: `🎟️ ${newAct.title}`,
        total_amount: newAct.expense_amount,
        currency: 'THB',
        promptpay_qr_url: currentUser.promptpay_qr_url || '',
        activity_id: newAct.id,
        created_by: currentUser.id,
        created_at: new Date().toISOString(),
        payer: currentUser,
        splits,
      };
      setExpenses((prev) => [newExp, ...prev]);
    }
  };

  const deleteActivity = (id: string) => {
    setActivities((prev) => prev.filter((a) => a.id !== id));
  };

  // Expense actions
  const addExpense = ({
    title,
    total_amount,
    payer_id,
    receipt_url,
    activity_id,
    splitUserIds,
  }: {
    title: string;
    total_amount: number;
    payer_id: string;
    receipt_url?: string;
    activity_id?: string;
    splitUserIds: string[];
  }) => {
    const expId = `exp-${Date.now()}`;
    const payer = allUsers.find((u) => u.id === payer_id) || currentUser;
    const splitCount = splitUserIds.length || 1;
    const splitAmount = Math.round((total_amount / splitCount) * 100) / 100;

    const splits = splitUserIds.map((uId) => ({
      id: `sp-${Date.now()}-${uId}`,
      expense_id: expId,
      user_id: uId,
      amount: splitAmount,
      status: (uId === payer_id ? 'CONFIRMED' : 'UNPAID') as any,
      user: allUsers.find((u) => u.id === uId),
    }));

    const newExp: Expense = {
      id: expId,
      trip_id: currentTrip.id,
      payer_id,
      title,
      total_amount,
      currency: 'THB',
      receipt_url,
      promptpay_qr_url: payer.promptpay_qr_url || '',
      activity_id,
      created_by: currentUser.id,
      created_at: new Date().toISOString(),
      payer,
      splits,
    };
    setExpenses((prev) => [newExp, ...prev]);
  };

  const deleteExpense = (id: string) => {
    setExpenses((prev) => prev.filter((e) => e.id !== id));
  };

  const submitPaymentSlip = (expenseId: string, splitUserId: string, slipUrl: string) => {
    setExpenses((prev) =>
      prev.map((exp) => {
        if (exp.id !== expenseId) return exp;
        return {
          ...exp,
          splits: exp.splits.map((sp) => {
            if (sp.user_id !== splitUserId) return sp;
            return {
              ...sp,
              status: 'PENDING_VERIFY',
              slip_url: slipUrl,
              paid_at: new Date().toISOString(),
            };
          }),
        };
      })
    );
  };

  const confirmPayment = (expenseId: string, splitUserId: string) => {
    setExpenses((prev) =>
      prev.map((exp) => {
        if (exp.id !== expenseId) return exp;
        return {
          ...exp,
          splits: exp.splits.map((sp) => {
            if (sp.user_id !== splitUserId) return sp;
            return {
              ...sp,
              status: 'CONFIRMED',
            };
          }),
        };
      })
    );
  };

  // Checklist Actions
  const toggleChecklistItem = (itemId: string, isShared: boolean) => {
    if (isShared) {
      setChecklists((prev) =>
        prev.map((c) => (c.id === itemId ? { ...c, is_shared_done: !c.is_shared_done } : c))
      );
    } else {
      setPersonalChecklistStatus((prev) => ({
        ...prev,
        [itemId]: !prev[itemId],
      }));
    }
  };

  const addChecklistItem = (
    title: string,
    category: 'PERSONAL' | 'SHARED',
    assigned_to?: string
  ) => {
    const newItem: ChecklistItem = {
      id: `chk-${Date.now()}`,
      trip_id: currentTrip.id,
      category,
      title,
      assigned_to: category === 'SHARED' ? assigned_to : undefined,
      is_shared_done: false,
      created_by: currentUser.id,
      assigned_user: allUsers.find((u) => u.id === assigned_to),
    };
    setChecklists((prev) => [...prev, newItem]);
  };

  const deleteChecklistItem = (id: string) => {
    setChecklists((prev) => prev.filter((c) => c.id !== id));
  };

  return (
    <AppContext.Provider
      value={{
        currentUser,
        allUsers,
        currentTrip,
        allTrips,
        tripMembers: tripMembers.map((m) => ({
          ...m,
          user: allUsers.find((u) => u.id === m.user_id) || m.user,
        })),
        flights: flights.filter((f) => f.trip_id === currentTrip.id),
        hotels: hotels.filter((h) => h.trip_id === currentTrip.id),
        dailyPlans: dailyPlans.filter((p) => p.trip_id === currentTrip.id),
        activities: activities.filter((a) => a.trip_id === currentTrip.id),
        expenses: expenses.filter((e) => e.trip_id === currentTrip.id),
        checklists: checklists.filter((c) => c.trip_id === currentTrip.id),
        personalChecklistStatus,
        isAdmin,
        isCreator,
        canManageItem,
        setCurrentTrip,
        switchUser,
        loginWithInstagram,
        createTrip,
        joinTripByToken,
        updateTripTitle,
        kickMember,
        setMemberRole,
        addFlight,
        deleteFlight,
        addHotel,
        deleteHotel,
        addDailyPlan,
        deleteDailyPlan,
        addActivity,
        deleteActivity,
        addExpense,
        deleteExpense,
        submitPaymentSlip,
        confirmPayment,
        toggleChecklistItem,
        addChecklistItem,
        deleteChecklistItem,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) throw new Error('useApp must be used within an AppProvider');
  return context;
};
