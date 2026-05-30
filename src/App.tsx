/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Coins, 
  Users, 
  HandCoins, 
  FileSpreadsheet, 
  Settings as SettingsIcon, 
  LogOut, 
  ShieldCheck, 
  TrendingUp, 
  Activity,
  Award,
  BookOpen
} from 'lucide-react';

import LoginScreen from './components/LoginScreen';
import DashboardTab from './components/DashboardTab';
import WorkersTab from './components/WorkersTab';
import TransactionsTab from './components/TransactionsTab';
import PayrollTab from './components/PayrollTab';
import SettingsTab from './components/SettingsTab';
import TerminalLogs from './components/TerminalLogs';

import { Worker, Advance, Bonus, Deduction, OvertimeLog, PayrollRecord, TerminalLog, SystemSettings } from './types';
import { DEMO_WORKERS, DEMO_ADVANCES, DEMO_BONUSES, DEMO_DEDUCTIONS, DEMO_OVERTIME, DEFAULT_SETTINGS } from './data';

export default function App() {
  
  // Is Logged in check
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(() => {
    return localStorage.getItem('payroll_logged_in') === 'true';
  });

  const [currentUser, setCurrentUser] = useState<any>(null);

  // Active Main Navigation Tab ('dashboard' | 'workers' | 'transactions' | 'payroll' | 'settings')
  const [activeTab, setActiveTab] = useState<'dashboard' | 'workers' | 'transactions' | 'payroll' | 'settings'>('dashboard');

  // Interactive hooks for automatic tab navigation from Dashboard
  const [autoOpenWorkerForm, setAutoOpenWorkerForm] = useState(false);

  // Core Payroll Databases states
  const [workers, setWorkers] = useState<Worker[]>(() => {
    const stored = localStorage.getItem('payroll_workers');
    return stored ? JSON.parse(stored) : DEMO_WORKERS;
  });

  const [advances, setAdvances] = useState<Advance[]>(() => {
    const stored = localStorage.getItem('payroll_advances');
    return stored ? JSON.parse(stored) : DEMO_ADVANCES;
  });

  const [bonuses, setBonuses] = useState<Bonus[]>(() => {
    const stored = localStorage.getItem('payroll_bonuses');
    return stored ? JSON.parse(stored) : DEMO_BONUSES;
  });

  const [deductions, setDeductions] = useState<Deduction[]>(() => {
    const stored = localStorage.getItem('payroll_deductions');
    return stored ? JSON.parse(stored) : DEMO_DEDUCTIONS;
  });

  const [overtimeLogs, setOvertimeLogs] = useState<OvertimeLog[]>(() => {
    const stored = localStorage.getItem('payroll_overtimes');
    return stored ? JSON.parse(stored) : DEMO_OVERTIME;
  });

  const [payrollRecords, setPayrollRecords] = useState<PayrollRecord[]>(() => {
    const stored = localStorage.getItem('payroll_records');
    return stored ? JSON.parse(stored) : [];
  });

  const [settings, setSettings] = useState<SystemSettings>(() => {
    const stored = localStorage.getItem('payroll_settings');
    if (stored) {
      const parsed = JSON.parse(stored);
      if (parsed.companyName === "شركة الأساس للإنشاءات والمقاولات العامة" || parsed.companyName === "مؤسستك الشخصية للمقاولات العامة") {
        parsed.companyName = "مكتب سمارت نيتورك لخدمات الشبكات";
        localStorage.setItem('payroll_settings', JSON.stringify(parsed));
      }
      return parsed;
    }
    return DEFAULT_SETTINGS;
  });

  // Audit Logs Stream at the foot of screen
  const [logs, setLogs] = useState<TerminalLog[]>([]);

  // Push audit logs with timestamps
  const addLog = (text: string, type: 'info' | 'success' | 'warning' | 'error' | 'command') => {
    const timestamp = new Date().toLocaleTimeString('ar-EG', { hour12: false });
    setLogs((prev) => [...prev, { timestamp, text, type }]);
  };

  // Sync to local registers
  useEffect(() => {
    if (isLoggedIn) {
      localStorage.setItem('payroll_logged_in', 'true');
      const actUser = localStorage.getItem('smart_current_user');
      setCurrentUser(actUser ? JSON.parse(actUser) : { fullName: 'المحاسب المسؤول' });
      addLog('تم تصدير صلاحيات الدخول للمشغل والمحاسب العام.', 'success');
      addLog('مكتب سمارت نيتورك لخدمات الشبكات نشط ومحمي ببطاقة الائتمان المحلية.', 'success');
    } else {
      localStorage.removeItem('payroll_logged_in');
      setCurrentUser(null);
    }
  }, [isLoggedIn]);

  // Sync state helpers to persistent Storage
  const saveWorkers = (data: Worker[]) => {
    setWorkers(data);
    localStorage.setItem('payroll_workers', JSON.stringify(data));
  };

  const saveAdvances = (data: Advance[]) => {
    setAdvances(data);
    localStorage.setItem('payroll_advances', JSON.stringify(data));
  };

  const saveBonuses = (data: Bonus[]) => {
    setBonuses(data);
    localStorage.setItem('payroll_bonuses', JSON.stringify(data));
  };

  const saveDeductions = (data: Deduction[]) => {
    setDeductions(data);
    localStorage.setItem('payroll_deductions', JSON.stringify(data));
  };

  const saveOvertimes = (data: OvertimeLog[]) => {
    setOvertimeLogs(data);
    localStorage.setItem('payroll_overtimes', JSON.stringify(data));
  };

  const savePayrollRecords = (data: PayrollRecord[]) => {
    setPayrollRecords(data);
    localStorage.setItem('payroll_records', JSON.stringify(data));
  };

  const saveSettings = (data: SystemSettings) => {
    setSettings(data);
    localStorage.setItem('payroll_settings', JSON.stringify(data));
  };

  // Core Modifiers API
  // 1. Worker additions
  const handleAddWorker = (w: Worker) => {
    const updated = [...workers, w];
    saveWorkers(updated);
    addLog(`تم تثبيت ملف عقد العامل الجديد في السجل: [${w.name}] بكود ${w.id} براتب ${w.baseSalary} ${settings.currency}.`, 'success');
  };

  const handleUpdateWorker = (w: Worker) => {
    const updated = workers.map(item => item.id === w.id ? w : item);
    saveWorkers(updated);
    addLog(`تم تعديل بيانات وأجور العامل: [${w.name}] بنجاح. حالة الخدمة: [${w.status === 'active' ? 'نشط' : 'موقف'}].`, 'info');
  };

  const handleDeleteWorker = (id: string) => {
    const w = workers.find(item => item.id === id);
    if (!w) return;
    
    // Core filter and save
    const updated = workers.filter(item => item.id !== id);
    saveWorkers(updated);
    
    // Cascade delete related records
    const updatedAdvances = advances.filter(item => item.workerId !== id);
    saveAdvances(updatedAdvances);
    
    const updatedBonuses = bonuses.filter(item => item.workerId !== id);
    saveBonuses(updatedBonuses);
    
    const updatedDeductions = deductions.filter(item => item.workerId !== id);
    saveDeductions(updatedDeductions);
    
    const updatedOvertimes = overtimeLogs.filter(item => item.workerId !== id);
    saveOvertimes(updatedOvertimes);
    
    const updatedPayrolls = payrollRecords.filter(item => item.workerId !== id);
    savePayrollRecords(updatedPayrolls);
    
    addLog(`تم شطب وإزالة بطاقة العامل [${w.name}] وكافة مستنداته وسجلاته المالية (سلف، حوافز، جزاءات، أوفرتايم) نهائياً من النظام.`, 'warning');
  };

  // 2. Advances (السلف المفتوحة)
  const handleAddAdvance = (adv: Advance) => {
    const updated = [...advances, adv];
    saveAdvances(updated);
    addLog(`قيد محاسبي جديد: تسجيل سلفة مالية بقيمة ${adv.amount} ${settings.currency} منسوبة للعامل [${adv.workerName}].`, 'command');
  };

  const handleSettleAdvance = (id: string, settleAmount: number) => {
    const actAdv = advances.find(item => item.id === id);
    if (!actAdv) return;

    const updatedRemaining = Math.max(0, actAdv.remainingAmount - settleAmount);
    const updatedStatus = updatedRemaining === 0 ? 'deducted' : 'partially_deducted';

    const updated = advances.map(item => {
      if (item.id === id) {
        return {
          ...item,
          remainingAmount: updatedRemaining,
          status: updatedStatus as any
        };
      }
      return item;
    });

    saveAdvances(updated);
    addLog(`تسجيل سداد نقدي يدوي بقيمة ${settleAmount} ${settings.currency} للسند [${id}]. المتبقي بذمة العامل [${actAdv.workerName}]: ${updatedRemaining} ${settings.currency}.`, 'success');
  };

  const handleDeleteAdvance = (id: string) => {
    const updated = advances.filter(item => item.id !== id);
    saveAdvances(updated);
    addLog(`تم إلغاء وشطب سند السلفة المفتوح كود [${id}] من حساب الأستاذ الموحد.`, 'warning');
  };

  // 3. Bonuses (المكافآت والبدلات)
  const handleAddBonus = (b: Bonus) => {
    const updated = [...bonuses, b];
    saveBonuses(updated);
    addLog(`تسجيل مكافأة/بدل مستحق بقيمة ${b.amount} ${settings.currency} للعامل [${b.workerName}] بسبب: "${b.reason}".`, 'success');
  };

  const handleDeleteBonus = (id: string) => {
    const updated = bonuses.filter(item => item.id !== id);
    saveBonuses(updated);
    addLog(`تم شطب وحذف مستند المكافأة كود [${id}] بنجاح.`, 'warning');
  };

  // 4. Deductions (الخصومات والغياب)
  const handleAddDeduction = (d: Deduction) => {
    const updated = [...deductions, d];
    saveDeductions(updated);
    addLog(`تقييد خصم مالي عقابي بقيمة ${d.amount} ${settings.currency} على العامل [${d.workerName}]. السبب: "${d.reason}".`, 'command');
  };

  const handleDeleteDeduction = (id: string) => {
    const updated = deductions.filter(item => item.id !== id);
    saveDeductions(updated);
    addLog(`تم شطب الغرامة/الخصم كود [${id}] من كشف العامل المالي.`, 'warning');
  };

  // 5. Overtime Hours (ساعات العمل الإضافي)
  const handleAddOvertime = (ovt: OvertimeLog) => {
    const updated = [...overtimeLogs, ovt];
    saveOvertimes(updated);
    addLog(`تسجيل ${ovt.hours} ساعات إضافية للعامل [${ovt.workerName}] بمعامل ضربي x${ovt.multiplier}.`, 'success');
  };

  const handleDeleteOvertime = (id: string) => {
    const updated = overtimeLogs.filter(item => item.id !== id);
    saveOvertimes(updated);
    addLog(`تم إلغاء قيد ساعات الإضافي كود [${id}].`, 'warning');
  };

  // 6. Monthly Payroll Generator (مسيرات الرواتب)
  const handleGeneratePayroll = (periodId: string, records: PayrollRecord[]) => {
    // Delete previous draft or existing records for this specific period to prevent double calculations
    const cleared = payrollRecords.filter(item => item.periodId !== periodId);
    const updated = [...cleared, ...records];
    savePayrollRecords(updated);
  };

  // Mark draft as PAID and execute automatic bookkeeping loan deduction!
  const handleUpdateRecordStatus = (recordId: string, status: 'draft' | 'paid' | 'delayed', paymentDate?: string) => {
    const actRecord = payrollRecords.find(r => r.id === recordId);
    if (!actRecord) return;

    // Automatic Bookkeeping: deduct from actual Advances if there is a positive totalAdvancesDeducted!
    if (status === 'paid' && actRecord.totalAdvancesDeducted > 0) {
      let D = actRecord.totalAdvancesDeducted;
      
      const updatedAdvances = advances.map(adv => {
        if (adv.workerId === actRecord.workerId && adv.remainingAmount > 0 && D > 0) {
          const deductionForThisLoan = Math.min(D, adv.remainingAmount);
          D -= deductionForThisLoan;
          const leftInLoan = adv.remainingAmount - deductionForThisLoan;
          return {
            ...adv,
            remainingAmount: leftInLoan,
            status: (leftInLoan === 0 ? 'deducted' : 'partially_deducted') as any
          };
        }
        return adv;
      });

      saveAdvances(updatedAdvances);
      addLog(`[تسوية آلية]: تم سداد وتخفيض قيمة ${actRecord.totalAdvancesDeducted} ${settings.currency} من سلف العامل [${actRecord.workerName}] تزامناً مع صرف الراتب لبطاقته لـ ${actRecord.periodId}.`, 'success');
    }

    const updatedRecords = payrollRecords.map(item => {
      if (item.id === recordId) {
        return {
          ...item,
          status,
          paymentDate
        };
      }
      return item;
    });

    savePayrollRecords(updatedRecords);
    addLog(`تم تعديل حالة مستند مسير الراتب ${recordId} إلى الوضع: [${status === 'paid' ? 'تم الصرف بنجاح' : 'معلق'}].`, 'info');
  };

  const handleClearPayrollPeriod = (periodId: string) => {
    const updated = payrollRecords.filter(item => item.periodId !== periodId);
    savePayrollRecords(updated);
  };

  // Settings modification
  const handleUpdateSettings = (s: SystemSettings) => {
    saveSettings(s);
    addLog(`تم تعديل بيانات المنشأة الافتراضية بنجاح إلى [${s.companyName}].`, 'success');
  };

  // Seed Complete Mock/Demo database
  const handleLoadDemoData = () => {
    saveWorkers(DEMO_WORKERS);
    saveAdvances(DEMO_ADVANCES);
    saveBonuses(DEMO_BONUSES);
    saveDeductions(DEMO_DEDUCTIONS);
    saveOvertimes(DEMO_OVERTIME);
    savePayrollRecords([]); // Clear old payrolls so they can calculate them freshly
    saveSettings(DEFAULT_SETTINGS);
    addLog('تم تصدير وحقن قاعدة البيانات التجريبية الموسعة النموذجية بالكامل بنجاح.', 'success');
    setActiveTab('dashboard');
  };

  // Clear or wipe database completely
  const handleClearAllData = () => {
    saveWorkers([]);
    saveAdvances([]);
    saveBonuses([]);
    saveDeductions([]);
    saveOvertimes([]);
    savePayrollRecords([]);
    saveSettings({
      companyName: "مكتب سمارت نيتورك لخدمات الشبكات",
      currency: "ريال",
      defaultOvertimeMultiplier: 1.5
    });
    setLogs([]);
    addLog('تحذير: تم تصفير قاعدة البيانات ومحو سجلات الخادم بالكامل للبدء من الصفر.', 'warning');
  };

  // Logout handler
  const handleLogout = () => {
    setIsLoggedIn(false);
    localStorage.removeItem('payroll_logged_in');
    localStorage.removeItem('smart_current_user');
    setCurrentUser(null);
  };

  // Handling Quick triggers from Dashboard
  const handleOpenQuickModal = (type: 'worker' | 'advance' | 'bonus' | 'deduction') => {
    if (type === 'worker') {
      setActiveTab('workers');
      // trigger open form on the client
      setAutoOpenWorkerForm(true);
      // reset trigger shortly after
      setTimeout(() => setAutoOpenWorkerForm(false), 800);
    } else {
      setActiveTab('transactions');
    }
  };

  if (!isLoggedIn) {
    return <LoginScreen onLoginSuccess={() => setIsLoggedIn(true)} />;
  }

  return (
    <div className="min-h-screen bg-slate-950 font-sans text-slate-100 flex flex-col relative" id="app-root" dir="rtl">
      
      {/* Dynamic network lines background */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#0f172a_1.5px,transparent_1.5px),linear-gradient(to_bottom,#0f172a_1.5px,transparent_1.5px)] bg-[size:5rem_5rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_50%,#000_70%,transparent_100%)] opacity-35 pointer-events-none" />

      {/* Corporate Site Top bar */}
      <header className="bg-slate-900/90 backdrop-blur-md border-b border-slate-800 px-6 py-4 sticky top-0 z-40" id="smart-control-header">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
          
          {/* Logo and title */}
          <div className="flex items-center gap-3" id="header-branding">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-amber-500 to-yellow-600 p-0.5 flex items-center justify-center glow-sm shrink-0">
              <div className="w-full h-full rounded-2xl bg-slate-950 flex flex-col items-center justify-center">
                <span className="text-[10px] font-black tracking-wider text-amber-500">PAYROLL</span>
              </div>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-base sm:text-lg font-black text-white tracking-tight">مكتب سمارت نيتورك لخدمات الشبكات</h1>
                <span className="text-[9px] font-bold py-0.5 px-2 bg-emerald-950 text-emerald-400 rounded-full border border-emerald-920">v2.5</span>
              </div>
              <p className="text-[10px] text-slate-400 flex items-center gap-1 mt-0.5">
                <Activity className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                <span className="truncate">{settings.companyName}</span>
              </p>
            </div>
          </div>

          {/* User profile details & Logout */}
          <div className="flex items-center gap-3" id="header-user">
            <div className="hidden sm:flex flex-col text-right items-start select-none" id="user-badge">
              <span className="text-xs font-bold text-white">{currentUser?.fullName || 'مسؤول المحاسبة المالية'}</span>
              <span className="text-[10px] text-amber-500 font-bold bg-amber-950/20 px-1.5 rounded-md mt-0.5 border border-amber-900/30">
                الحساب: أدمن
              </span>
            </div>

            <span className="h-6 w-[1.5px] bg-slate-800 hidden sm:inline" />

            <button
              onClick={handleLogout}
              className="py-2 px-3 bg-slate-950 hover:bg-slate-800 border border-slate-800 hover:border-slate-750 text-slate-300 hover:text-white rounded-xl text-xs font-bold flex items-center gap-1.5 active:scale-95 transition-all cursor-pointer"
              id="logout-btn"
            >
              <LogOut className="w-4 h-4 text-red-400" />
              <span>تسجيل الخروج</span>
            </button>
          </div>

        </div>
      </header>

      {/* Master Tabs Controller Nav */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 space-y-6 relative z-10 flex flex-col" id="main-content-layout">
        
        {/* Main Ribbon Navigation Tab Tabs Menu */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-1.5 flex gap-1.5 overflow-x-auto shrink-0 scrollbar-none" id="tabs-navigation">
          
          {/* Dashboard */}
          <button
            onClick={() => { setActiveTab('dashboard'); addLog('تصفح لوحة المؤشرات المالية والتحليل الإحصائي.', 'command'); }}
            className={`py-3 px-5 rounded-xl text-xs sm:text-xs font-black flex items-center gap-1.5 transition-all shrink-0 cursor-pointer ${activeTab === 'dashboard' ? 'bg-gradient-to-r from-amber-500 to-yellow-600 text-slate-950 font-black shadow-md' : 'text-slate-400 hover:text-slate-200'}`}
            id="tab-btn-dashboard"
          >
            <TrendingUp className="w-4.5 h-4.5" />
            <span>لوحة الإحصائيات العامة</span>
          </button>

          {/* Workers list */}
          <button
            onClick={() => { setActiveTab('workers'); addLog('تصفح كشوف ملفات عمال المنشأة والأجر التعاقدي.', 'command'); }}
            className={`py-3 px-5 rounded-xl text-xs sm:text-xs font-black flex items-center gap-1.5 transition-all shrink-0 cursor-pointer ${activeTab === 'workers' ? 'bg-gradient-to-r from-amber-500 to-yellow-600 text-slate-950 font-black shadow-md' : 'text-slate-400 hover:text-slate-200'}`}
            id="tab-btn-workers"
          >
            <Users className="w-4.5 h-4.5" />
            <span>ملفات وبطاقات العمال</span>
          </button>

          {/* Transactions ledger */}
          <button
            onClick={() => { setActiveTab('transactions'); addLog('تصفح حركات الخصومات، البدلات الإضافية، وسجلات السلف والقروض.', 'command'); }}
            className={`py-3 px-5 rounded-xl text-xs sm:text-xs font-black flex items-center gap-1.5 transition-all shrink-0 cursor-pointer ${activeTab === 'transactions' ? 'bg-gradient-to-r from-amber-500 to-yellow-600 text-slate-950 font-black shadow-md' : 'text-slate-400 hover:text-slate-200'}`}
            id="tab-btn-transactions"
          >
            <HandCoins className="w-4.5 h-4.5" />
            <span>السلف والمكافآت والخصومات</span>
          </button>

          {/* Monthly Payroll Closed Sheet */}
          <button
            onClick={() => { setActiveTab('payroll'); addLog('فتح منضدة احتساب رواتب العمال وإصدار المسيرات.', 'command'); }}
            className={`py-3 px-5 rounded-xl text-xs sm:text-xs font-black flex items-center gap-1.5 transition-all shrink-0 cursor-pointer ${activeTab === 'payroll' ? 'bg-gradient-to-r from-amber-500 to-yellow-600 text-slate-950 font-black shadow-md' : 'text-slate-400 hover:text-slate-200'}`}
            id="tab-btn-payroll"
          >
            <FileSpreadsheet className="w-4.5 h-4.5" />
            <span>مسيرات الرواتب وقسائم القبض</span>
          </button>

          {/* System Settings */}
          <button
            onClick={() => { setActiveTab('settings'); addLog('دخول لوحة إعدادات النظام وتصدير عينات البيانات المسيرة.', 'command'); }}
            className={`py-3 px-5 rounded-xl text-xs sm:text-xs font-black flex items-center gap-1.5 transition-all shrink-0 cursor-pointer ${activeTab === 'settings' ? 'bg-gradient-to-r from-amber-500 to-yellow-600 text-slate-950 font-black shadow-md' : 'text-slate-400 hover:text-slate-200'}`}
            id="tab-btn-settings"
          >
            <SettingsIcon className="w-4.5 h-4.5" />
            <span>تهيئة النظام والبيانات التجريبية</span>
          </button>

        </div>

        {/* Dynamic Display area containing standard subtabs */}
        <div id="dynamic-panel" className="flex-1 min-h-[460px]">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
              transition={{ duration: 0.2 }}
            >
              
              {activeTab === 'dashboard' && (
                <DashboardTab 
                  workers={workers}
                  advances={advances}
                  bonuses={bonuses}
                  deductions={deductions}
                  overtimeLogs={overtimeLogs}
                  settings={settings}
                  onAddLog={addLog}
                  setActiveTab={setActiveTab}
                  onOpenQuickModal={handleOpenQuickModal}
                />
              )}

              {activeTab === 'workers' && (
                <WorkersTab 
                  workers={workers}
                  advances={advances}
                  bonuses={bonuses}
                  deductions={deductions}
                  overtimeLogs={overtimeLogs}
                  settings={settings}
                  onAddWorker={handleAddWorker}
                  onUpdateWorker={handleUpdateWorker}
                  onDeleteWorker={handleDeleteWorker}
                />
              )}

              {activeTab === 'transactions' && (
                <TransactionsTab 
                  workers={workers}
                  advances={advances}
                  bonuses={bonuses}
                  deductions={deductions}
                  overtimeLogs={overtimeLogs}
                  settings={settings}
                  onAddAdvance={handleAddAdvance}
                  onSettleAdvance={handleSettleAdvance}
                  onDeleteAdvance={handleDeleteAdvance}
                  onAddBonus={handleAddBonus}
                  onDeleteBonus={handleDeleteBonus}
                  onAddDeduction={handleAddDeduction}
                  onDeleteDeduction={handleDeleteDeduction}
                  onAddOvertime={handleAddOvertime}
                  onDeleteOvertime={handleDeleteOvertime}
                />
              )}

              {activeTab === 'payroll' && (
                <PayrollTab 
                  workers={workers}
                  advances={advances}
                  bonuses={bonuses}
                  deductions={deductions}
                  overtimeLogs={overtimeLogs}
                  settings={settings}
                  payrollRecords={payrollRecords}
                  onGeneratePayroll={handleGeneratePayroll}
                  onUpdateRecordStatus={handleUpdateRecordStatus}
                  onClearPayrollPeriod={handleClearPayrollPeriod}
                  onAddLog={addLog}
                />
              )}

              {activeTab === 'settings' && (
                <SettingsTab 
                  settings={settings}
                  onUpdateSettings={handleUpdateSettings}
                  onLoadDemoData={handleLoadDemoData}
                  onClearAllData={handleClearAllData}
                />
              )}

            </motion.div>
          </AnimatePresence>
        </div>

        {/* Foot Console Audit logs live feed */}
        <div id="live-activity-audit-feed">
          <TerminalLogs logs={logs} onClear={() => setLogs([])} />
        </div>

      </main>

      {/* Subtle brand footer */}
      <footer className="py-6 border-t border-slate-900 border-opacity-70 text-center text-[11px] text-slate-600 leading-normal select-none" id="smart-control-footer">
        <p>برنامج المحاسب الذكي لإدارة العمال ورواتب المسيرات © {new Date().getFullYear()} • جميع الحقوق محفوظة ومحفوظة الخصوصية محلياً.</p>
      </footer>

    </div>
  );
}
