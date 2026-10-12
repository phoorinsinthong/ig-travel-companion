import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { X, Users, KeyRound, Check, AlertCircle } from 'lucide-react';

interface JoinTripModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const JoinTripModal: React.FC<JoinTripModalProps> = ({ isOpen, onClose }) => {
  const { joinTripByToken, allTrips } = useApp();

  const [token, setToken] = useState('');
  const [error, setError] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!token.trim()) return;

    const success = joinTripByToken(token.trim());
    if (success) {
      setError(false);
      onClose();
    } else {
      setError(true);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4">
      <div className="w-full max-w-sm bg-[#161722] border border-slate-700 rounded-3xl p-5 shadow-2xl space-y-4">
        <div className="flex items-center justify-between pb-2 border-b border-slate-800">
          <div className="flex items-center space-x-2">
            <div className="p-1.5 rounded-xl bg-pink-500/20 text-pink-400">
              <KeyRound className="w-4 h-4" />
            </div>
            <h3 className="text-base font-bold text-white">เข้าร่วมทริปด้วย Invite Token</h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-full text-slate-400 hover:text-white"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-3 text-xs">
          <p className="text-slate-400">
            ใส่รหัส Invite Token ที่เพื่อนส่งให้ทาง IG DM เพื่อดึงคุณเข้าทริปอัตโนมัติ
          </p>

          <div>
            <label className="text-slate-300 font-medium">Invite Token</label>
            <input
              type="text"
              required
              value={token}
              onChange={(e) => {
                setToken(e.target.value.toUpperCase());
                setError(false);
              }}
              placeholder="เช่น TOKYO-IG-8899"
              className="w-full mt-1 px-3 py-2.5 rounded-xl bg-slate-800 border border-slate-700 text-white font-mono uppercase text-sm focus:outline-none focus:border-pink-500"
            />
          </div>

          {error && (
            <div className="flex items-center space-x-1.5 p-2 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>ไม่พบทริปที่มี Token นี้ หรือรหัสหมดอายุ</span>
            </div>
          )}

          {/* Quick presets for existing trips */}
          <div className="space-y-1 pt-1">
            <span className="text-[10px] text-slate-500 font-semibold uppercase">Token ที่มีอยู่ในระบบ:</span>
            <div className="flex flex-wrap gap-1.5">
              {allTrips.map((t) => (
                <button
                  type="button"
                  key={t.id}
                  onClick={() => setToken(t.invite_token)}
                  className="text-[10px] px-2 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-amber-300 font-mono border border-slate-700"
                >
                  {t.invite_token}
                </button>
              ))}
            </div>
          </div>

          <div className="flex items-center justify-end space-x-2 pt-3 border-t border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="px-3 py-2 rounded-xl text-slate-400 hover:text-white"
            >
              ยกเลิก
            </button>
            <button
              type="submit"
              className="px-5 py-2.5 rounded-xl font-bold text-white bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 shadow-md shadow-pink-600/20"
            >
              เข้าร่วมทริป
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
