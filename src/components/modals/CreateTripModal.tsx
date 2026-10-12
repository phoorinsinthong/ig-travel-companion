import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { X, Plane, Sparkles, Image as ImageIcon } from 'lucide-react';

interface CreateTripModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const CreateTripModal: React.FC<CreateTripModalProps> = ({ isOpen, onClose }) => {
  const { createTrip } = useApp();

  const [title, setTitle] = useState('');
  const [startDate, setStartDate] = useState('2026-11-15');
  const [endDate, setEndDate] = useState('2026-11-20');
  const [coverUrl, setCoverUrl] = useState(
    'https://images.unsplash.com/photo-1503899036084-c55cdd92da26?w=800&auto=format&fit=crop&q=80'
  );

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    createTrip({
      title: title.trim(),
      start_date: startDate,
      end_date: endDate,
      cover_image_url:
        coverUrl ||
        'https://images.unsplash.com/photo-1488646953014-85cb44e25828?w=800&auto=format&fit=crop&q=80',
    });
    onClose();
  };

  const sampleCovers = [
    {
      name: 'โตเกียว / ภูเขาไฟฟูจิ',
      url: 'https://images.unsplash.com/photo-1503899036084-c55cdd92da26?w=800&auto=format&fit=crop&q=80',
    },
    {
      name: 'เกาหลี โซล',
      url: 'https://images.unsplash.com/photo-1538485399081-7191377e8241?w=800&auto=format&fit=crop&q=80',
    },
    {
      name: 'สวิสเซอร์แลนด์',
      url: 'https://images.unsplash.com/photo-1530122037265-a5f1f91d3b99?w=800&auto=format&fit=crop&q=80',
    },
  ];

  return (
    <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4">
      <div className="w-full max-w-sm bg-[#161722] border border-slate-700 rounded-3xl p-5 shadow-2xl space-y-4">
        <div className="flex items-center justify-between pb-2 border-b border-slate-800">
          <div className="flex items-center space-x-2">
            <div className="p-1.5 rounded-xl bg-gradient-to-r from-purple-600 to-pink-600 text-white">
              <Plane className="w-4 h-4" />
            </div>
            <h3 className="text-base font-bold text-white">+ สร้างทริปใหม่</h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-full text-slate-400 hover:text-white"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-3 text-xs">
          <div>
            <label className="text-slate-300 font-medium">ชื่อทริป</label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="เช่น 🇯🇵 สเก็ตบอร์ดโตเกียว & ตะลุยชินจูกุ"
              className="w-full mt-1 px-3 py-2.5 rounded-xl bg-slate-800 border border-slate-700 text-white text-xs focus:outline-none focus:border-pink-500"
            />
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="text-slate-300 font-medium">วันเดินทางไป</label>
              <input
                type="date"
                required
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-full mt-1 px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-white text-xs"
              />
            </div>
            <div>
              <label className="text-slate-300 font-medium">วันเดินทางกลับ</label>
              <input
                type="date"
                required
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="w-full mt-1 px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-white text-xs"
              />
            </div>
          </div>

          <div>
            <label className="text-slate-300 font-medium flex items-center justify-between">
              <span>รูปหน้าปกทริป (Cover Image URL)</span>
              <Sparkles className="w-3.5 h-3.5 text-pink-400" />
            </label>
            <input
              type="url"
              value={coverUrl}
              onChange={(e) => setCoverUrl(e.target.value)}
              placeholder="https://..."
              className="w-full mt-1 px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-white text-xs"
            />

            {/* Quick preset images */}
            <div className="flex gap-1.5 mt-2">
              {sampleCovers.map((s, idx) => (
                <button
                  type="button"
                  key={idx}
                  onClick={() => setCoverUrl(s.url)}
                  className="text-[10px] px-2 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 truncate"
                >
                  {s.name}
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
              ยืนยันสร้างทริป
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
