import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Eye, EyeOff, Loader2, AtSign, Mail, Lock, User } from 'lucide-react';

type AuthMode = 'login' | 'register';

export const LoginPage: React.FC = () => {
  const { signIn, signUp } = useAuth();
  const [mode, setMode] = useState<AuthMode>('login');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);

  // Form fields
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [username, setUsername] = useState('');
  const [fullName, setFullName] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    setIsLoading(true);

    try {
      if (mode === 'login') {
        const { error } = await signIn(email, password);
        if (error) setError(error);
      } else {
        // Validate
        if (username.length < 3) {
          setError('Username ต้องมีอย่างน้อย 3 ตัวอักษร');
          setIsLoading(false);
          return;
        }
        if (password.length < 6) {
          setError('Password ต้องมีอย่างน้อย 6 ตัวอักษร');
          setIsLoading(false);
          return;
        }

        const { error } = await signUp(email, password, username, fullName);
        if (error) {
          setError(error);
        } else {
          setSuccess('✅ สมัครสมาชิกสำเร็จ! กรุณายืนยัน Email ที่ inbox ของคุณก่อน Login');
          setMode('login');
        }
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0c0d12] flex flex-col items-center justify-center p-4 font-sans">
      {/* Background gradient blobs */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-purple-600/20 rounded-full blur-3xl" />
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-pink-600/20 rounded-full blur-3xl" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-orange-500/10 rounded-full blur-3xl" />
      </div>

      <div className="relative w-full max-w-sm">
        {/* Logo */}
        <div className="flex flex-col items-center mb-8">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-[#833AB4] via-[#FD1D1D] to-[#FCB045] p-[3px] shadow-2xl shadow-pink-500/30 mb-4">
            <div className="w-full h-full bg-[#161722] rounded-[13px] flex items-center justify-center">
              <svg className="w-8 h-8 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
                <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
                <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" />
              </svg>
            </div>
          </div>
          <h1 className="text-2xl font-extrabold text-white tracking-tight">IG Travel Companion</h1>
          <p className="text-sm text-slate-400 mt-1">แพลนทริปกับเพื่อน ✈️ หารค่าใช้จ่ายอัจฉริยะ</p>
        </div>

        {/* Card */}
        <div className="bg-[#161820]/80 backdrop-blur-xl border border-slate-700/60 rounded-3xl p-6 shadow-2xl">
          {/* Tabs */}
          <div className="flex bg-slate-900/60 rounded-2xl p-1 mb-6">
            <button
              onClick={() => { setMode('login'); setError(null); setSuccess(null); }}
              className={`flex-1 py-2 text-sm font-semibold rounded-xl transition-all ${
                mode === 'login'
                  ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-md'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              เข้าสู่ระบบ
            </button>
            <button
              onClick={() => { setMode('register'); setError(null); setSuccess(null); }}
              className={`flex-1 py-2 text-sm font-semibold rounded-xl transition-all ${
                mode === 'register'
                  ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-md'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              สมัครสมาชิก
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Register only fields */}
            {mode === 'register' && (
              <>
                <div>
                  <label className="block text-xs font-medium text-slate-400 mb-1.5">
                    ชื่อเต็ม (Full Name)
                  </label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                    <input
                      type="text"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      placeholder="เช่น Pun Thanawin"
                      className="w-full bg-slate-900/60 border border-slate-700 rounded-xl pl-10 pr-4 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-pink-500 focus:ring-1 focus:ring-pink-500/50 transition-all"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-400 mb-1.5">
                    Username <span className="text-pink-400">*</span>
                  </label>
                  <div className="relative">
                    <AtSign className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                    <input
                      type="text"
                      value={username}
                      onChange={(e) => setUsername(e.target.value.replace(/[^a-z0-9._]/gi, '').toLowerCase())}
                      placeholder="username ของคุณ (ภาษาอังกฤษ)"
                      required
                      className="w-full bg-slate-900/60 border border-slate-700 rounded-xl pl-10 pr-4 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-pink-500 focus:ring-1 focus:ring-pink-500/50 transition-all"
                    />
                  </div>
                </div>
              </>
            )}

            {/* Email */}
            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1.5">
                Email <span className="text-pink-400">*</span>
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="your@email.com"
                  required
                  className="w-full bg-slate-900/60 border border-slate-700 rounded-xl pl-10 pr-4 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-pink-500 focus:ring-1 focus:ring-pink-500/50 transition-all"
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1.5">
                Password <span className="text-pink-400">*</span>
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder={mode === 'register' ? 'อย่างน้อย 6 ตัวอักษร' : 'Password ของคุณ'}
                  required
                  className="w-full bg-slate-900/60 border border-slate-700 rounded-xl pl-10 pr-10 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-pink-500 focus:ring-1 focus:ring-pink-500/50 transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 transition-colors"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Error/Success Messages */}
            {error && (
              <div className="bg-red-500/10 border border-red-500/30 rounded-xl px-4 py-3 text-xs text-red-400">
                ⚠️ {error}
              </div>
            )}
            {success && (
              <div className="bg-green-500/10 border border-green-500/30 rounded-xl px-4 py-3 text-xs text-green-400">
                {success}
              </div>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3 rounded-xl font-bold text-sm text-white bg-gradient-to-r from-purple-600 via-pink-600 to-orange-500 hover:from-purple-500 hover:via-pink-500 hover:to-orange-400 transition-all shadow-lg shadow-pink-600/30 disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center space-x-2 mt-2"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>กำลังดำเนินการ...</span>
                </>
              ) : (
                <span>{mode === 'login' ? '🚀 เข้าสู่ระบบ' : '✨ สมัครสมาชิก'}</span>
              )}
            </button>
          </form>
        </div>

        {/* Note */}
        <p className="text-center text-xs text-slate-500 mt-4">
          ปลอดภัยด้วย Supabase Auth 🔒 · ข้อมูล Sync Real-time ทุกอุปกรณ์
        </p>
      </div>
    </div>
  );
};
