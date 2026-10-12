import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  Trip,
  TripMember,
  Flight,
  Hotel,
  DailyPlan,
  ActivityTransit,
  Expense,
  ChecklistItem,
} from '../types/database';
import { useAuth, AppUser } from './AuthContext';
import { supabase, isSupabaseConfigured } from '../lib/supabase';

interface AppContextType {
  currentUser: AppUser;
  currentTrip: Trip | null;
  allTrips: Trip[];
  tripMembers: TripMember[];
  flights: Flight[];
  hotels: Hotel[];
  dailyPlans: DailyPlan[];
  activities: ActivityTransit[];
  expenses: Expense[];
  checklists: ChecklistItem[];
  personalChecklistStatus: Record<string, boolean>;
  isLoadingData: boolean;

  // RBAC checks
  isAdmin: boolean;
  isCreator: (creatorId: string) => boolean;
  canManageItem: (creatorId: string) => boolean;

  // Actions
  setCurrentTrip: (trip: Trip) => void;
  createTrip: (trip: Omit<Trip, 'id' | 'invite_token' | 'created_by' | 'created_at'>) => Promise<Trip | null>;
  joinTripByToken: (token: string) => Promise<boolean>;
  updateTripTitle: (newTitle: string) => Promise<void>;

  // Admin Member Actions
  kickMember: (userId: string) => Promise<void>;
  setMemberRole: (userId: string, role: 'ADMIN' | 'MEMBER') => Promise<void>;

  // Items Actions
  addFlight: (flight: Omit<Flight, 'id' | 'trip_id' | 'created_by'>) => Promise<void>;
  deleteFlight: (id: string) => Promise<void>;

  addHotel: (hotel: Omit<Hotel, 'id' | 'trip_id' | 'created_by'>) => Promise<void>;
  deleteHotel: (id: string) => Promise<void>;

  addDailyPlan: (plan: Omit<DailyPlan, 'id' | 'trip_id' | 'created_by'>) => Promise<void>;
  deleteDailyPlan: (id: string) => Promise<void>;

  addActivity: (act: Omit<ActivityTransit, 'id' | 'trip_id' | 'created_by'>) => Promise<void>;
  deleteActivity: (id: string) => Promise<void>;

  addExpense: (expense: {
    title: string;
    total_amount: number;
    payer_id: string;
    receipt_url?: string;
    activity_id?: string;
    splitUserIds: string[];
  }) => Promise<void>;
  deleteExpense: (id: string) => Promise<void>;
  submitPaymentSlip: (expenseId: string, splitUserId: string, slipUrl: string) => Promise<void>;
  confirmPayment: (expenseId: string, splitUserId: string) => Promise<void>;

  // Checklist Actions
  toggleChecklistItem: (itemId: string, isShared: boolean) => Promise<void>;
  addChecklistItem: (title: string, category: 'PERSONAL' | 'SHARED', assigned_to?: string) => Promise<void>;
  deleteChecklistItem: (id: string) => Promise<void>;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { appUser } = useAuth();

  const [allTrips, setAllTrips] = useState<Trip[]>([]);
  const [currentTrip, setCurrentTripState] = useState<Trip | null>(null);
  const [tripMembers, setTripMembers] = useState<TripMember[]>([]);
  const [flights, setFlights] = useState<Flight[]>([]);
  const [hotels, setHotels] = useState<Hotel[]>([]);
  const [dailyPlans, setDailyPlans] = useState<DailyPlan[]>([]);
  const [activities, setActivities] = useState<ActivityTransit[]>([]);
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [checklists, setChecklists] = useState<ChecklistItem[]>([]);
  const [personalChecklistStatus, setPersonalChecklistStatus] = useState<Record<string, boolean>>({});
  const [isLoadingData, setIsLoadingData] = useState(true);

  // Load user's trips from Supabase
  useEffect(() => {
    if (!appUser || !supabase || !isSupabaseConfigured) {
      setIsLoadingData(false);
      return;
    }
    const db = supabase;

    const loadTrips = async () => {
      setIsLoadingData(true);
      try {
        // Get all trips where user is a member
        const { data: memberRows } = await db
          .from('trip_members')
          .select('trip_id')
          .eq('user_id', appUser.id);

        const tripIds = memberRows?.map((r: { trip_id: string }) => r.trip_id) || [];

        if (tripIds.length === 0) {
          setAllTrips([]);
          setCurrentTripState(null);
          setIsLoadingData(false);
          return;
        }

        const { data: tripsData } = await db
          .from('trips')
          .select('*')
          .in('id', tripIds)
          .order('created_at', { ascending: false });

        const trips = tripsData || [];
        setAllTrips(trips);

        if (trips.length > 0 && !currentTrip) {
          setCurrentTripState(trips[0]);
        }
      } catch (err) {
        console.error('Error loading trips:', err);
      } finally {
        setIsLoadingData(false);
      }
    };

    loadTrips();
  }, [appUser]);

  // Load trip data when current trip changes
  useEffect(() => {
    if (!currentTrip || !supabase || !appUser) return;
    const db = supabase;

    const loadTripData = async () => {
      const tripId = currentTrip.id;

      const [membersRes, flightsRes, hotelsRes, plansRes, activitiesRes, expensesRes, checklistRes, personalStatusRes] =
        await Promise.all([
          db.from('trip_members').select('*, user:users(*)').eq('trip_id', tripId),
          db.from('flights').select('*').eq('trip_id', tripId).order('departure_time'),
          db.from('hotels').select('*').eq('trip_id', tripId).order('check_in'),
          db.from('daily_plans').select('*').eq('trip_id', tripId).order('plan_date').order('time_slot'),
          db.from('activities_transit').select('*').eq('trip_id', tripId).order('scheduled_at'),
          db.from('expenses').select('*, payer:users(*), splits:expense_splits(*, user:users(*))').eq('trip_id', tripId).order('created_at', { ascending: false }),
          db.from('checklist_items').select('*, assigned_user:users!assigned_to(*)').eq('trip_id', tripId).order('created_at'),
          db.from('personal_checklist_status').select('*').eq('user_id', appUser.id),
        ]);

      setTripMembers((membersRes.data || []) as TripMember[]);
      setFlights((flightsRes.data || []) as Flight[]);
      setHotels((hotelsRes.data || []) as Hotel[]);
      setDailyPlans((plansRes.data || []) as DailyPlan[]);
      setActivities((activitiesRes.data || []) as ActivityTransit[]);
      setExpenses((expensesRes.data || []).map((e: any) => ({
        ...e,
        splits: (e.splits || []).map((s: any) => ({
          ...s,
          user: s.user,
        })),
      })) as Expense[]);
      setChecklists((checklistRes.data || []) as ChecklistItem[]);

      const statusMap: Record<string, boolean> = {};
      (personalStatusRes.data || []).forEach((row: { item_id: string; is_done: boolean }) => {
        statusMap[row.item_id] = row.is_done;
      });
      setPersonalChecklistStatus(statusMap);
    };

    loadTripData();
  }, [currentTrip?.id, appUser?.id]);

  // RBAC
  const currentMember = tripMembers.find((m) => m.user_id === appUser?.id);
  const isAdmin = !!(currentMember?.role === 'ADMIN' || currentTrip?.created_by === appUser?.id);
  const isCreator = (creatorId: string) => appUser?.id === creatorId;
  const canManageItem = (creatorId: string) => isAdmin || isCreator(creatorId);

  const setCurrentTrip = (trip: Trip) => {
    setCurrentTripState(trip);
  };

  // Create Trip
  const createTrip = async (tripData: Omit<Trip, 'id' | 'invite_token' | 'created_by' | 'created_at'>): Promise<Trip | null> => {
    if (!supabase || !appUser) return null;

    const token = `IG-${Math.random().toString(36).substring(2, 8).toUpperCase()}`;
    const { data: newTrip, error } = await supabase
      .from('trips')
      .insert({
        ...tripData,
        invite_token: token,
        created_by: appUser.id,
      })
      .select()
      .single();

    if (error || !newTrip) {
      console.error('Error creating trip:', error);
      return null;
    }

    // Add creator as ADMIN
    await supabase.from('trip_members').insert({
      trip_id: newTrip.id,
      user_id: appUser.id,
      role: 'ADMIN',
    });

    setAllTrips((prev) => [newTrip, ...prev]);
    setCurrentTripState(newTrip);
    return newTrip;
  };

  const updateTripTitle = async (newTitle: string) => {
    if (!supabase || !currentTrip) return;
    await supabase.from('trips').update({ title: newTitle }).eq('id', currentTrip.id);
    setCurrentTripState((prev) => prev ? { ...prev, title: newTitle } : prev);
    setAllTrips((prev) => prev.map((t) => t.id === currentTrip.id ? { ...t, title: newTitle } : t));
  };

  // Join trip by token
  const joinTripByToken = async (token: string): Promise<boolean> => {
    if (!supabase || !appUser) return false;

    const { data: trip } = await supabase
      .from('trips')
      .select('*')
      .ilike('invite_token', token.trim())
      .single();

    if (!trip) return false;

    // Check if already member
    const { data: existing } = await supabase
      .from('trip_members')
      .select('*')
      .eq('trip_id', trip.id)
      .eq('user_id', appUser.id)
      .maybeSingle();

    if (!existing) {
      await supabase.from('trip_members').insert({
        trip_id: trip.id,
        user_id: appUser.id,
        role: 'MEMBER',
      });
    }

    setAllTrips((prev) => prev.find((t) => t.id === trip.id) ? prev : [trip, ...prev]);
    setCurrentTripState(trip);
    return true;
  };

  // Member Management
  const kickMember = async (userId: string) => {
    if (!supabase || !isAdmin || !currentTrip) return;
    await supabase.from('trip_members').delete().eq('trip_id', currentTrip.id).eq('user_id', userId);
    setTripMembers((prev) => prev.filter((m) => !(m.trip_id === currentTrip.id && m.user_id === userId)));
  };

  const setMemberRole = async (userId: string, role: 'ADMIN' | 'MEMBER') => {
    if (!supabase || !isAdmin || !currentTrip) return;
    await supabase.from('trip_members').update({ role }).eq('trip_id', currentTrip.id).eq('user_id', userId);
    setTripMembers((prev) => prev.map((m) =>
      m.trip_id === currentTrip.id && m.user_id === userId ? { ...m, role } : m
    ));
  };

  // Flight actions
  const addFlight = async (flight: Omit<Flight, 'id' | 'trip_id' | 'created_by'>) => {
    if (!supabase || !appUser || !currentTrip) return;
    const { data } = await supabase.from('flights').insert({
      ...flight,
      trip_id: currentTrip.id,
      created_by: appUser.id,
    }).select().single();
    if (data) setFlights((prev) => [...prev, data as Flight]);
  };

  const deleteFlight = async (id: string) => {
    if (!supabase) return;
    await supabase.from('flights').delete().eq('id', id);
    setFlights((prev) => prev.filter((f) => f.id !== id));
  };

  // Hotel actions
  const addHotel = async (hotel: Omit<Hotel, 'id' | 'trip_id' | 'created_by'>) => {
    if (!supabase || !appUser || !currentTrip) return;
    const { data } = await supabase.from('hotels').insert({
      ...hotel,
      trip_id: currentTrip.id,
      created_by: appUser.id,
    }).select().single();
    if (data) setHotels((prev) => [...prev, data as Hotel]);
  };

  const deleteHotel = async (id: string) => {
    if (!supabase) return;
    await supabase.from('hotels').delete().eq('id', id);
    setHotels((prev) => prev.filter((h) => h.id !== id));
  };

  // Daily Plan actions
  const addDailyPlan = async (plan: Omit<DailyPlan, 'id' | 'trip_id' | 'created_by'>) => {
    if (!supabase || !appUser || !currentTrip) return;
    const { data } = await supabase.from('daily_plans').insert({
      ...plan,
      trip_id: currentTrip.id,
      created_by: appUser.id,
    }).select().single();
    if (data) setDailyPlans((prev) => [...prev, data as DailyPlan]);
  };

  const deleteDailyPlan = async (id: string) => {
    if (!supabase) return;
    await supabase.from('daily_plans').delete().eq('id', id);
    setDailyPlans((prev) => prev.filter((p) => p.id !== id));
  };

  // Activity actions
  const addActivity = async (act: Omit<ActivityTransit, 'id' | 'trip_id' | 'created_by'>) => {
    if (!supabase || !appUser || !currentTrip) return;
    const { data } = await supabase.from('activities_transit').insert({
      ...act,
      trip_id: currentTrip.id,
      created_by: appUser.id,
    }).select().single();
    if (data) {
      setActivities((prev) => [...prev, data as ActivityTransit]);

      // Auto-create expense if has_expense
      if ((data as ActivityTransit).has_expense && (data as ActivityTransit).expense_amount) {
        const splitCount = tripMembers.length || 1;
        const splitAmount = Math.round(((data as ActivityTransit).expense_amount! / splitCount) * 100) / 100;

        const { data: newExp } = await supabase.from('expenses').insert({
          trip_id: currentTrip.id,
          payer_id: appUser.id,
          title: `🎟️ ${(data as ActivityTransit).title}`,
          total_amount: (data as ActivityTransit).expense_amount,
          currency: 'THB',
          promptpay_qr_url: appUser.promptpay_qr_url || '',
          activity_id: (data as ActivityTransit).id,
          created_by: appUser.id,
        }).select().single();

        if (newExp) {
          // Create splits
          const splitRows = tripMembers.map((m) => ({
            expense_id: newExp.id,
            user_id: m.user_id,
            amount: splitAmount,
            status: m.user_id === appUser.id ? 'CONFIRMED' : 'UNPAID',
          }));
          await supabase.from('expense_splits').insert(splitRows);

          // Reload expenses
          const { data: fullExp } = await supabase
            .from('expenses')
            .select('*, payer:users(*), splits:expense_splits(*, user:users(*))')
            .eq('id', newExp.id)
            .single();
          if (fullExp) setExpenses((prev) => [fullExp as Expense, ...prev]);
        }
      }
    }
  };

  const deleteActivity = async (id: string) => {
    if (!supabase) return;
    await supabase.from('activities_transit').delete().eq('id', id);
    setActivities((prev) => prev.filter((a) => a.id !== id));
  };

  // Expense actions
  const addExpense = async ({
    title, total_amount, payer_id, receipt_url, activity_id, splitUserIds,
  }: {
    title: string;
    total_amount: number;
    payer_id: string;
    receipt_url?: string;
    activity_id?: string;
    splitUserIds: string[];
  }) => {
    if (!supabase || !appUser || !currentTrip) return;

    const payer = tripMembers.find((m) => m.user_id === payer_id)?.user;

    const { data: newExp } = await supabase.from('expenses').insert({
      trip_id: currentTrip.id,
      payer_id,
      title,
      total_amount,
      currency: 'THB',
      receipt_url,
      promptpay_qr_url: (payer as any)?.promptpay_qr_url || '',
      activity_id,
      created_by: appUser.id,
    }).select().single();

    if (!newExp) return;

    const splitCount = splitUserIds.length || 1;
    const splitAmount = Math.round((total_amount / splitCount) * 100) / 100;

    const splitRows = splitUserIds.map((uId) => ({
      expense_id: newExp.id,
      user_id: uId,
      amount: splitAmount,
      status: uId === payer_id ? 'CONFIRMED' : 'UNPAID',
    }));

    await supabase.from('expense_splits').insert(splitRows);

    // Reload full expense with relations
    const { data: fullExp } = await supabase
      .from('expenses')
      .select('*, payer:users(*), splits:expense_splits(*, user:users(*))')
      .eq('id', newExp.id)
      .single();
    if (fullExp) setExpenses((prev) => [fullExp as Expense, ...prev]);
  };

  const deleteExpense = async (id: string) => {
    if (!supabase) return;
    await supabase.from('expenses').delete().eq('id', id);
    setExpenses((prev) => prev.filter((e) => e.id !== id));
  };

  const submitPaymentSlip = async (expenseId: string, splitUserId: string, slipUrl: string) => {
    if (!supabase) return;
    await supabase.from('expense_splits')
      .update({ status: 'PENDING_VERIFY', slip_url: slipUrl, paid_at: new Date().toISOString() })
      .eq('expense_id', expenseId)
      .eq('user_id', splitUserId);

    setExpenses((prev) => prev.map((exp) => {
      if (exp.id !== expenseId) return exp;
      return {
        ...exp,
        splits: exp.splits.map((sp) =>
          sp.user_id !== splitUserId ? sp : { ...sp, status: 'PENDING_VERIFY', slip_url: slipUrl, paid_at: new Date().toISOString() }
        ),
      };
    }));
  };

  const confirmPayment = async (expenseId: string, splitUserId: string) => {
    if (!supabase) return;
    await supabase.from('expense_splits')
      .update({ status: 'CONFIRMED' })
      .eq('expense_id', expenseId)
      .eq('user_id', splitUserId);

    setExpenses((prev) => prev.map((exp) => {
      if (exp.id !== expenseId) return exp;
      return {
        ...exp,
        splits: exp.splits.map((sp) =>
          sp.user_id !== splitUserId ? sp : { ...sp, status: 'CONFIRMED' }
        ),
      };
    }));
  };

  // Checklist Actions
  const toggleChecklistItem = async (itemId: string, isShared: boolean) => {
    if (!supabase || !appUser) return;

    if (isShared) {
      const current = checklists.find((c) => c.id === itemId);
      const newVal = !current?.is_shared_done;
      await supabase.from('checklist_items').update({ is_shared_done: newVal }).eq('id', itemId);
      setChecklists((prev) => prev.map((c) => c.id === itemId ? { ...c, is_shared_done: newVal } : c));
    } else {
      const newVal = !personalChecklistStatus[itemId];
      await supabase.from('personal_checklist_status')
        .upsert({ item_id: itemId, user_id: appUser.id, is_done: newVal }, { onConflict: 'item_id,user_id' });
      setPersonalChecklistStatus((prev) => ({ ...prev, [itemId]: newVal }));
    }
  };

  const addChecklistItem = async (title: string, category: 'PERSONAL' | 'SHARED', assigned_to?: string) => {
    if (!supabase || !appUser || !currentTrip) return;
    const { data } = await supabase.from('checklist_items').insert({
      trip_id: currentTrip.id,
      category,
      title,
      assigned_to: category === 'SHARED' ? assigned_to || null : null,
      is_shared_done: false,
      created_by: appUser.id,
    }).select('*, assigned_user:users!assigned_to(*)').single();
    if (data) setChecklists((prev) => [...prev, data as ChecklistItem]);
  };

  const deleteChecklistItem = async (id: string) => {
    if (!supabase) return;
    await supabase.from('checklist_items').delete().eq('id', id);
    setChecklists((prev) => prev.filter((c) => c.id !== id));
  };

  if (!appUser) return null; // Should never reach here (App.tsx guards this)

  return (
    <AppContext.Provider
      value={{
        currentUser: appUser,
        currentTrip,
        allTrips,
        tripMembers,
        flights,
        hotels,
        dailyPlans,
        activities,
        expenses,
        checklists,
        personalChecklistStatus,
        isLoadingData,
        isAdmin,
        isCreator,
        canManageItem,
        setCurrentTrip,
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
