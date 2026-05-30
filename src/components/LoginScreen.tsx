/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Shield, Lock, User, AlertCircle, Coins } from 'lucide-react';

interface LoginScreenProps {
  onLoginSuccess: () => void;
}

export default function LoginScreen({ onLoginSuccess }: LoginScreenProps) {
  const [username, setUsername] = useState('admin');
  const [password, setPassword] = useState('123456');
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    // Simulate network authentication delay
    setTimeout(() => {
      const enteredUser = username.trim().toLowerCase();
      const enteredPass = password.trim();

      if (enteredUser === 'admin' && enteredPass === '123456') {
        const adminUser = {
          id: 'admin-default',
          username: 'admin',
          fullName: 'المحاسب العام (أدمن)',
          role: 'admin',
          createdAt: new Date().toLocaleDateString('ar-EG'),
          isActive: true
        };
        localStorage.setItem('smart_current_user', JSON.stringify(adminUser));
        localStorage.setItem('smart_controller_logged_in', 'true');
        onLoginSuccess();
      } else {
        setError('خطأ في اسم المستخدم أو كلمة المرور الحالية! يرجى تجربة اسم المستخدم: admin وكلمة المرور: 123456');
        setIsLoading(false);
      }
    }, 1000);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-950 text-slate-100 p-4 relative overflow-hidden" id="login-container">
      {/* Decorative financial background lines */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#1e293b_1px,transparent_1px),linear-gradient(to_bottom,#1e293b_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_50%,#000_70%,transparent_100%)] opacity-40 animate-pulse" />
      
      {/* Floating golden and blue glow blobs */}
      <div className="absolute -top-40 -left-40 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-40 -right-40 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />

      <motion.div 
        initial={{ opacity: 0, y: 35 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md bg-slate-900/90 backdrop-blur-xl border border-slate-800 rounded-3xl p-8 shadow-2xl relative z-10"
        id="login-card"
      >
        {/* Animated Coins Icon */}
        <div className="flex flex-col items-center mb-6" id="logo-section">
          <motion.div 
            initial={{ scale: 0.8 }}
            animate={{ scale: 1 }}
            transition={{ duration: 0.5, type: 'spring' }}
            className="w-20 h-20 rounded-2xl bg-gradient-to-tr from-amber-500 via-amber-600 to-yellow-400 p-0.5 flex items-center justify-center shadow-lg glowing-circle relative mb-4"
            id="glowing-logo"
          >
            <div className="w-full h-full rounded-2xl bg-slate-950 flex flex-col items-center justify-center">
              <Coins className="w-8 h-8 text-amber-400" />
            </div>
          </motion.div>
          
          <h1 className="text-2xl font-extrabold text-white text-center tracking-tight mb-2">
            مكتب سمارت نيتورك لخدمات الشبكات
          </h1>
          <p className="text-sm text-slate-400 text-center">
            برنامج محاسبي متكامل لإدارة شؤون موظفي وعمال المؤسسة ومسيرات الرواتب
          </p>
        </div>

        {/* Informative Help Box */}
        <div className="mb-6 p-3.5 rounded-xl bg-slate-950/60 border border-slate-800 text-slate-300 text-xs text-center select-none leading-relaxed">
          <span>بيانات الدخول التجريبية الافتراضية:</span>
          <div className="mt-1 flex justify-center gap-4 text-amber-400 font-mono text-sm leading-none">
            <span>الاسم: <strong className="text-white">admin</strong></span>
            <span>المرور: <strong className="text-white">123456</strong></span>
          </div>
        </div>

        {error && (
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="mb-6 p-4 rounded-xl bg-red-950/40 border border-red-800 text-red-200 text-sm flex items-start gap-3"
            id="error-banner"
          >
            <AlertCircle className="w-5 h-5 text-red-400 shrink-0 mt-0.5" />
            <span className="leading-normal">{error}</span>
          </motion.div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5" id="login-form">
          <div className="space-y-1.5 text-right">
            <label className="block text-xs font-bold text-slate-300">
              اسم المستخدم للمحاسب
            </label>
            <div className="relative">
              <span className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-500">
                <User className="w-5 h-5" />
              </span>
              <input 
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="أدخل اسم المستخدم"
                className="w-full bg-slate-950/60 border border-slate-800 rounded-xl py-3 pr-11 pl-4 text-white text-sm placeholder-slate-600 focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500 transition-all duration-200"
                required
                disabled={isLoading}
                id="username-input"
              />
            </div>
          </div>

          <div className="space-y-1.5 text-right">
            <label className="block text-xs font-bold text-slate-300">
              كلمة المرور السرية
            </label>
            <div className="relative">
              <span className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-500">
                <Lock className="w-5 h-5" />
              </span>
              <input 
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="أدخل كلمة المرور"
                className="w-full bg-slate-950/60 border border-slate-800 rounded-xl py-3 pr-11 pl-4 text-white text-sm placeholder-slate-600 focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500 transition-all duration-200"
                required
                disabled={isLoading}
                id="password-input"
              />
            </div>
          </div>

          <button 
            type="submit" 
            disabled={isLoading || !username || !password}
            className="w-full py-3.5 bg-gradient-to-r from-amber-500 hover:from-amber-400 to-yellow-600 hover:to-yellow-500 active:scale-[0.98] text-slate-950 font-bold rounded-xl flex items-center justify-center gap-2 shadow-lg disabled:opacity-50 disabled:pointer-events-none transition-all duration-200 mt-6 cursor-pointer"
            id="login-submit-btn"
          >
            {isLoading ? (
              <>
                <svg className="animate-spin h-5 w-5 text-slate-950" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
                <span>جاري فتح الخزنة والتحقق...</span>
              </>
            ) : (
              <>
                <Shield className="w-5 h-5 text-slate-950" />
                <span>دخول لوحة التحكم</span>
              </>
            )}
          </button>
        </form>
      </motion.div>
    </div>
  );
}
