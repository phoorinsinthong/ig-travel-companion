import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import {
  CheckSquare,
  User,
  Users,
  Plus,
  Trash2,
  CheckCircle2,
  Circle,
  Sparkles,
} from 'lucide-react';

export const ChecklistTab: React.FC = () => {
  const {
    checklists,
    personalChecklistStatus,
    toggleChecklistItem,
    addChecklistItem,
    deleteChecklistItem,
    currentUser,
    tripMembers,
    canManageItem,
  } = useApp();

  const [activeCategory, setActiveCategory] = useState<'PERSONAL' | 'SHARED'>('PERSONAL');
  const [showAddModal, setShowAddModal] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [assignedTo, setAssignedTo] = useState(currentUser.id);

  const personalItems = checklists.filter((c) => c.category === 'PERSONAL');
  const sharedItems = checklists.filter((c) => c.category === 'SHARED');

  // Personal Progress
  const personalDoneCount = personalItems.filter((c) => personalChecklistStatus[c.id]).length;
  const personalPercent =
    personalItems.length > 0 ? Math.round((personalDoneCount / personalItems.length) * 100) : 0;

  // Shared Progress
  const sharedDoneCount = sharedItems.filter((c) => c.is_shared_done).length;
  const sharedPercent =
    sharedItems.length > 0 ? Math.round((sharedDoneCount / sharedItems.length) * 100) : 0;

  return (
    <div className="space-y-4 pb-20">
      {/* Category Switcher Tabs */}
      <div className="grid grid-cols-2 gap-2 p-1 bg-slate-900/90 rounded-2xl border border-slate-800">
        <button
          onClick={() => setActiveCategory('PERSONAL')}
          className={`flex items-center justify-center space-x-1.5 py-2.5 px-2 rounded-xl text-xs font-semibold transition-all ${
            activeCategory === 'PERSONAL'
              ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-md shadow-pink-600/20'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          <User className="w-3.5 h-3.5" />
          <span>ของส่วนตัว ({personalDoneCount}/{personalItems.length})</span>
        </button>

        <button
          onClick={() => setActiveCategory('SHARED')}
          className={`flex items-center justify-center space-x-1.5 py-2.5 px-2 rounded-xl text-xs font-semibold transition-all ${
            activeCategory === 'SHARED'
              ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-md shadow-pink-600/20'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          <Users className="w-3.5 h-3.5" />
          <span>ของส่วนกลาง ({sharedDoneCount}/{sharedItems.length})</span>
        </button>
      </div>

      {/* Progress Bar Card */}
      <div className="rounded-2xl p-4 bg-gradient-to-br from-[#191b28] to-[#141520] border border-slate-700/80 shadow-xl space-y-2.5">
        <div className="flex items-center justify-between text-xs">
          <div className="flex items-center space-x-1.5 text-slate-300 font-bold">
            <Sparkles className="w-4 h-4 text-pink-400" />
            <span>
              {activeCategory === 'PERSONAL'
                ? `ความพร้อมส่วนตัวของคุณ (@${currentUser.username})`
                : 'ความพร้อมสัมภาระกองกลางของแก๊ง'}
            </span>
          </div>
          <span className="text-pink-400 font-extrabold text-sm">
            {activeCategory === 'PERSONAL' ? `${personalPercent}%` : `${sharedPercent}%`}
          </span>
        </div>

        {/* Progress bar track */}
        <div className="w-full h-2.5 bg-slate-800 rounded-full overflow-hidden p-0.5 border border-slate-700/60">
          <div
            className="h-full bg-gradient-to-r from-purple-500 via-pink-500 to-orange-400 rounded-full transition-all duration-300 shadow-sm"
            style={{
              width: `${activeCategory === 'PERSONAL' ? personalPercent : sharedPercent}%`,
            }}
          />
        </div>

        <div className="text-[11px] text-slate-400">
          {activeCategory === 'PERSONAL'
            ? 'แต่ละคนสามารถติ๊กเตรียมของของตัวเองได้อิสระ ไม่ปนกับเพื่อน'
            : 'มีผู้รับผิดชอบชัดเจน หากใครเตรียมแล้วจะขึ้นสถานะเสร็จให้ทุกคนเห็นพร้อมกัน'}
        </div>
      </div>

      {/* Header & Add Button */}
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-bold text-slate-200 flex items-center space-x-2">
          <CheckSquare className="w-4 h-4 text-pink-400" />
          <span>
            {activeCategory === 'PERSONAL'
              ? `รายการของส่วนตัว (${personalItems.length})`
              : `รายการของกองกลาง (${sharedItems.length})`}
          </span>
        </h2>

        <button
          onClick={() => setShowAddModal(true)}
          className="flex items-center space-x-1 text-xs font-semibold text-pink-400 hover:text-pink-300 bg-pink-500/10 px-2.5 py-1.5 rounded-xl border border-pink-500/20 transition-colors"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>เพิ่มของ</span>
        </button>
      </div>

      {/* Items List */}
      <div className="space-y-2">
        {(activeCategory === 'PERSONAL' ? personalItems : sharedItems).map((item) => {
          const isDone =
            activeCategory === 'PERSONAL'
              ? !!personalChecklistStatus[item.id]
              : !!item.is_shared_done;

          return (
            <div
              key={item.id}
              onClick={() => toggleChecklistItem(item.id, activeCategory === 'SHARED')}
              className={`flex items-center justify-between p-3.5 rounded-2xl border cursor-pointer transition-all ${
                isDone
                  ? 'bg-slate-900/60 border-slate-800 text-slate-400'
                  : 'bg-gradient-to-br from-[#191b28] to-[#141520] border-slate-700/80 text-white shadow-md'
              }`}
            >
              <div className="flex items-center space-x-3 min-w-0">
                <button className="shrink-0">
                  {isDone ? (
                    <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                  ) : (
                    <Circle className="w-5 h-5 text-slate-500 hover:text-pink-400 transition-colors" />
                  )}
                </button>

                <div className="min-w-0">
                  <div
                    className={`text-xs font-semibold truncate ${
                      isDone ? 'line-through text-slate-500' : 'text-slate-100'
                    }`}
                  >
                    {item.title}
                  </div>

                  {activeCategory === 'SHARED' && item.assigned_user && (
                    <div className="flex items-center space-x-1 text-[10px] text-slate-400 mt-0.5">
                      <span>คนดูแล:</span>
                      <span className="font-semibold text-pink-300">
                        @{item.assigned_user.username}
                      </span>
                    </div>
                  )}
                </div>
              </div>

              <div className="flex items-center space-x-2 shrink-0">
                {activeCategory === 'SHARED' && item.assigned_user && (
                  <img
                    src={item.assigned_user.profile_pic_url}
                    alt=""
                    className="w-6 h-6 rounded-full object-cover ring-1 ring-slate-700"
                    title={`มอบหมายให้ @${item.assigned_user.username}`}
                  />
                )}

                {canManageItem(item.created_by) && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      deleteChecklistItem(item.id);
                    }}
                    className="p-1 rounded-lg text-slate-500 hover:text-rose-400 hover:bg-rose-500/10 transition-colors"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Add Item Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-sm bg-[#161722] border border-slate-700 rounded-3xl p-5 shadow-2xl space-y-3">
            <h3 className="text-sm font-bold text-white flex items-center space-x-1.5">
              <CheckSquare className="w-4 h-4 text-pink-400" />
              <span>เพิ่มรายการตรวจของ ({activeCategory === 'PERSONAL' ? 'ของส่วนตัว' : 'ของกองกลาง'})</span>
            </h3>

            <div className="space-y-2 text-xs">
              <div>
                <label className="text-slate-400">ชื่อสิ่งของ</label>
                <input
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  placeholder="เช่น ยาแก้เมาคลื่น, ปลั๊กพ่วง"
                  className="w-full mt-1 px-2.5 py-2 rounded-xl bg-slate-800 border border-slate-700 text-white"
                />
              </div>

              {activeCategory === 'SHARED' && (
                <div>
                  <label className="text-slate-400">มอบหมายให้ใครเตรียม</label>
                  <select
                    value={assignedTo}
                    onChange={(e) => setAssignedTo(e.target.value)}
                    className="w-full mt-1 px-2.5 py-2 rounded-xl bg-slate-800 border border-slate-700 text-white"
                  >
                    {tripMembers.map((m) => (
                      <option key={m.user_id} value={m.user_id}>
                        @{m.user?.username} ({m.user?.full_name})
                      </option>
                    ))}
                  </select>
                </div>
              )}
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
                  if (newTitle.trim()) {
                    addChecklistItem(
                      newTitle.trim(),
                      activeCategory,
                      activeCategory === 'SHARED' ? assignedTo : undefined
                    );
                    setNewTitle('');
                    setShowAddModal(false);
                  }
                }}
                className="px-4 py-2 rounded-xl text-xs font-bold bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-md shadow-pink-600/20"
              >
                บันทึกรายการ
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
