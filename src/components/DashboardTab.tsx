/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useMemo } from 'react';
import { motion } from 'motion/react';
import { 
  Users, 
  DollarSign, 
  HandCoins, 
  TrendingUp, 
  Building, 
  ArrowUpLeft, 
  UserPlus, 
  AlertTriangle,
  Gift,
  Coins
} from 'lucide-react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell
} from 'recharts';
import { Worker, Advance, Bonus, Deduction, OvertimeLog, SystemSettings } from '../types';

interface DashboardTabProps {
  workers: Worker[];
  advances: Advance[];
  bonuses: Bonus[];
  deductions: Deduction[];
  overtimeLogs: OvertimeLog[];
  settings: SystemSettings;
  onAddLog: (text: string, type: 'info' | 'success' | 'warning' | 'error' | 'command') => void;
  setActiveTab: (tab: 'dashboard' | 'workers' | 'transactions' | 'payroll' | 'settings') => void;
  onOpenQuickModal: (type: 'worker' | 'advance' | 'bonus' | 'deduction') => void;
}

export default function DashboardTab({
  workers,
  advances,
  bonuses,
  deductions,
  overtimeLogs,
  settings,
  onAddLog,
  setActiveTab,
  onOpenQuickModal
}: DashboardTabProps) {

  // Colors for charts
  const COLORS = ['#f59e0b', '#3b82f6', '#10b981', '#ec4899', '#8b5cf6', '#ef4444'];

  // Calculations
  const activeWorkersCount = useMemo(() => {
    return workers.filter(w => w.status === 'active').length;
  }, [workers]);

  const totalPendingAdvances = useMemo(() => {
    return advances.reduce((sum, adv) => sum + adv.remainingAmount, 0);
  }, [advances]);

  const totalBonusesThisMonth = useMemo(() => {
    return bonuses.reduce((sum, b) => sum + b.amount, 0);
  }, [bonuses]);

  const totalDeductionsThisMonth = useMemo(() => {
    return deductions.reduce((sum, d) => sum + d.amount, 0);
  }, [deductions]);

  // Rough calculation of expected monthly payroll
  const expectedMonthlyPayroll = useMemo(() => {
    return workers.reduce((sum, worker) => {
      if (worker.status !== 'active') return sum;
      if (worker.salaryType === 'monthly') {
        return sum + worker.baseSalary;
      } else if (worker.salaryType === 'daily') {
        // Assume averaging 26 workdays
        return sum + (worker.baseSalary * 26);
      } else {
        // Hourly, assume typical 180 hours
        return sum + (worker.baseSalary * 180);
      }
    }, 0);
  }, [workers]);

  // Transform data for department costs
  const departmentData = useMemo(() => {
    const map: Record<string, { name: string; الراتب_الأساسي: number; المكافآت: number }> = {};
    
    // Base salary by dept
    workers.forEach(w => {
      if (w.status !== 'active') return;
      const dept = w.department || 'عام';
      if (!map[dept]) {
        map[dept] = { name: dept, الراتب_الأساسي: 0, المكافآت: 0 };
      }
      
      let baseVal = 0;
      if (w.salaryType === 'monthly') baseVal = w.baseSalary;
      else if (w.salaryType === 'daily') baseVal = w.baseSalary * 26;
      else baseVal = w.baseSalary * 180;

      map[dept].الراتب_الأساسي += baseVal;
    });

    // Bonuses by dept
    bonuses.forEach(b => {
      const worker = workers.find(w => w.id === b.workerId);
      const dept = worker?.department || 'عام';
      if (!map[dept]) {
        map[dept] = { name: dept, الراتب_الأساسي: 0, المكافآت: 0 };
      }
      map[dept].المكافآت += b.amount;
    });

    return Object.values(map);
  }, [workers, bonuses]);

  // Transform data for Salary Types Pie chart
  const salaryTypePieData = useMemo(() => {
    const counts = { monthly: 0, daily: 0, hourly: 0 };
    workers.forEach(w => {
      if (w.status === 'active') {
        counts[w.salaryType] = (counts[w.salaryType] || 0) + 1;
      }
    });

    return [
      { name: 'شهري', value: counts.monthly },
      { name: 'يومي', value: counts.daily },
      { name: 'بالساعة', value: counts.hourly }
    ].filter(item => item.value > 0);
  }, [workers]);

  return (
    <div className="space-y-6" id="dashboard-tab">
      
      {/* Top Banner / Corporate Greeting */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 relative overflow-hidden" id="dashboard-banner">
        {/* Subtle grid background */}
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,#f59e0b10,transparent_50%)] pointer-events-none" />
        
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <span className="text-[10px] uppercase tracking-widest font-black text-amber-500 bg-amber-950/40 border border-amber-900/60 px-3 py-1 rounded-full inline-block mb-3">
              رؤية محاسبية شاملة
            </span>
            <h2 className="text-xl md:text-2xl font-black text-white">{settings.companyName}</h2>
            <p className="text-xs text-slate-400 mt-1.5 leading-relaxed max-w-xl">
              مرحباً بك في المحاسب الذكي للرواتب. يوفر لك هذا النظام تتبعاً دقيقاً لبطاقات العمال، استحقاقات الساعات والأيام، والسيطرة المباشرة على الأرشيف المالي لمسيرات الرواتب بمرونة كاملة.
            </p>
          </div>
          
          <div className="flex items-center gap-3 shrink-0" id="quick-action-btns">
            <button
              onClick={() => onOpenQuickModal('worker')}
              className="py-3 px-4 bg-amber-500 hover:bg-amber-400 active:scale-95 text-slate-950 font-bold rounded-2xl text-xs flex items-center gap-2 transition-all cursor-pointer"
              id="quick-add-worker-btn"
            >
              <UserPlus className="w-4.5 h-4.5" />
              <span>إضافة عامل جديد</span>
            </button>
            <button
              onClick={() => onOpenQuickModal('advance')}
              className="py-3 px-4 bg-slate-950 hover:bg-slate-800 border border-slate-800 text-slate-200 font-bold rounded-2xl text-xs flex items-center gap-2 transition-all cursor-pointer"
              id="quick-add-advance-btn"
            >
              <HandCoins className="w-4.5 h-4.5 text-amber-400" />
              <span>تسجيل سلفة مالية</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main KPI Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4" id="kpi-grid">
        
        {/* Card 1: Active Workers */}
        <div className="bg-slate-900 border border-slate-800/80 rounded-2xl p-5 hover:border-slate-700/80 transition-all flex items-center gap-4" id="kpi-active-workers">
          <div className="w-12 h-12 rounded-xl bg-blue-500/10 flex items-center justify-center shrink-0">
            <Users className="w-6 h-6 text-blue-400" />
          </div>
          <div className="text-right flex-1">
            <p className="text-[11px] text-slate-400 font-bold">إجمالي قوت العمالة النشطة</p>
            <div className="flex items-baseline gap-1.5 mt-1">
              <span className="text-2xl font-black text-white">{activeWorkersCount}</span>
              <span className="text-xs text-slate-500">من أصل {workers.length} عمال</span>
            </div>
            <p className="text-[9px] text-emerald-400 mt-1 flex items-center gap-1">
              <TrendingUp className="w-3 h-3" />
              <span>جميع العمال قيد التشغيل والإنتاج</span>
            </p>
          </div>
        </div>

        {/* Card 2: Expected monthly payroll */}
        <div className="bg-slate-900 border border-slate-800/80 rounded-2xl p-5 hover:border-slate-700/80 transition-all flex items-center gap-4" id="kpi-expected-payroll">
          <div className="w-12 h-12 rounded-xl bg-amber-500/10 flex items-center justify-center shrink-0">
            <DollarSign className="w-6 h-6 text-amber-400" />
          </div>
          <div className="text-right flex-1">
            <p className="text-[11px] text-slate-400 font-bold">تقديري الرواتب للدورة الحالية</p>
            <div className="flex items-baseline gap-1 mt-1">
              <span className="text-2xl font-black text-amber-400">
                {expectedMonthlyPayroll.toLocaleString('ar-EG', { maximumFractionDigits: 1 })}
              </span>
              <span className="text-xs text-slate-500">{settings.currency}</span>
            </div>
            <p className="text-[9px] text-slate-500 mt-1">
              *باحتساب دورة 26 يوم للأجر اليومي
            </p>
          </div>
        </div>

        {/* Card 3: Unpaid loans/advances */}
        <div className="bg-slate-900 border border-slate-800/80 rounded-2xl p-5 hover:border-slate-700/80 transition-all flex items-center gap-4" id="kpi-pending-loans">
          <div className="w-12 h-12 rounded-xl bg-red-500/10 flex items-center justify-center shrink-0">
            <HandCoins className="w-6 h-6 text-red-400" />
          </div>
          <div className="text-right flex-1">
            <p className="text-[11px] text-slate-400 font-bold">ذمم السلف النشطة غير المستردة</p>
            <div className="flex items-baseline gap-1 mt-1">
              <span className="text-2xl font-black text-red-400">
                {totalPendingAdvances.toLocaleString('ar-EG')}
              </span>
              <span className="text-xs text-slate-500">{settings.currency}</span>
            </div>
            <p className="text-[9px] text-red-400 mt-1 flex items-center gap-1">
              <span>تستقطع تلقائياً عند أول معالجة راتب</span>
            </p>
          </div>
        </div>

        {/* Card 4: Monthly bonus/incentive totals */}
        <div className="bg-slate-900 border border-slate-800/80 rounded-2xl p-5 hover:border-slate-700/80 transition-all flex items-center gap-4" id="kpi-total-bonuses">
          <div className="w-12 h-12 rounded-xl bg-emerald-500/10 flex items-center justify-center shrink-0">
            <Gift className="w-6 h-6 text-emerald-400" />
          </div>
          <div className="text-right flex-1">
            <p className="text-[11px] text-slate-400 font-bold">إجمالي المكافآت والبدلات</p>
            <div className="flex items-baseline gap-1 mt-1">
              <span className="text-2xl font-black text-emerald-400">
                {totalBonusesThisMonth.toLocaleString('ar-EG')}
              </span>
              <span className="text-xs text-slate-500">{settings.currency}</span>
            </div>
            <p className="text-[9px] text-emerald-400 mt-1">
              الخصومات المقيّدة: {totalDeductionsThisMonth} {settings.currency}
            </p>
          </div>
        </div>

      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6" id="dashboard-charts-layout">
        
        {/* Left Column: Bar chart for Dept Cost */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 lg:col-span-2 space-y-4" id="chart-dept-cost">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Building className="w-4 h-4 text-amber-500" />
              <h3 className="text-sm font-bold text-white">تكاليف الدورات الإجمالية للرواتب والمكافآت (حسب القسم)</h3>
            </div>
            <span className="text-[10px] text-slate-500">القيمة بـ ({settings.currency})</span>
          </div>

          <div className="h-[280px] w-full text-xs">
            {departmentData.length === 0 ? (
              <div className="h-full flex items-center justify-center text-slate-500 italic">
                لا توجد بيانات رواتب أو أقسام متاحة لتوليد المخطط البياني.
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={departmentData}
                  margin={{ top: 10, right: 10, left: -10, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                  <XAxis 
                    dataKey="name" 
                    stroke="#64748b" 
                    tick={{ fontFamily: 'Cairo', fontSize: 10 }} 
                  />
                  <YAxis stroke="#64748b" />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', color: '#fff', borderRadius: '12px', fontFamily: 'Cairo', fontSize: '11px', textAlign: 'right' }} 
                  />
                  <Legend wrapperStyle={{ fontFamily: 'Cairo', fontSize: '11px' }} />
                  <Bar dataKey="الراتب_الأساسي" fill="#3b82f6" name="الراتب الأساسي التقديري" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="المكافآت" fill="#10b981" name="إجمالي المكافآت البديلة" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        {/* Right Column: Pie chart for Salary Type distribution */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 flex flex-col justify-between" id="chart-salary-types">
          <div className="space-y-4">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <Coins className="w-4 h-4 text-amber-500" />
              <span>هيكلية الدفع للعمالة النشطة</span>
            </h3>
            
            <div className="h-[200px] w-full flex justify-center items-center relative text-xs">
              {salaryTypePieData.length === 0 ? (
                <span className="text-slate-500 italic">لا توجد عمالة نشطة</span>
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={salaryTypePieData}
                      cx="50%"
                      cy="50%"
                      innerRadius={50}
                      outerRadius={75}
                      paddingAngle={4}
                      dataKey="value"
                    >
                      {salaryTypePieData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip 
                      contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', color: '#fff', borderRadius: '12px', fontFamily: 'Cairo', fontSize: '11px', textAlign: 'right' }} 
                    />
                  </PieChart>
                </ResponsiveContainer>
              )}
            </div>
          </div>

          <div className="border-t border-slate-800 pt-3 mt-2 grid grid-cols-3 gap-2 text-center text-[10px]">
            {salaryTypePieData.map((entry, idx) => (
              <div key={idx} className="flex flex-col items-center">
                <span className="flex items-center gap-1.5 font-bold text-slate-300">
                  <span className="w-2.5 h-2.5 rounded-full inline-block" style={{ backgroundColor: COLORS[idx % COLORS.length] }} />
                  {entry.name}
                </span>
                <span className="text-xs font-bold text-white mt-1">{entry.value} عمال</span>
              </div>
            ))}
          </div>
        </div>

      </div>

      {/* Bottom Block: Active Advances Ledger */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5" id="recent-advances-ledger">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
          <div>
            <h3 className="text-sm font-bold text-white flex items-center gap-1.5">
              <AlertTriangle className="w-4 h-4 text-amber-500" />
              <span>سندات السلف المستمرة المعلقة بالدمم</span>
            </h3>
            <p className="text-[10px] text-slate-400 mt-1">أحدث سلف الموظفين النشطة في السجل والتي لم يتم استردادها بالكامل من المرتب المالي بعد</p>
          </div>
          
          <button
            onClick={() => setActiveTab('transactions')}
            className="text-xs text-amber-500 hover:text-amber-400 font-bold flex items-center gap-1 transition-colors cursor-pointer self-start sm:self-auto"
          >
            <span>إدارة جميع السلف والحركات</span>
            <ArrowUpLeft className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="overflow-x-auto" id="advances-table-wrap">
          {advances.filter(a => a.remainingAmount > 0).length === 0 ? (
            <div className="py-8 text-center text-slate-500 text-xs italic border border-slate-850 rounded-xl bg-slate-950/20">
              جميع السلف والديون مسددة بالكامل بحمد الله! لا توجد ذمم معلقة حالياً.
            </div>
          ) : (
            <table className="w-full text-right text-xs">
              <thead>
                <tr className="border-b border-slate-800 text-slate-400">
                  <th className="py-2.5 px-3">رقم السند</th>
                  <th className="py-2.5 px-3">اسم العامل</th>
                  <th className="py-2.5 px-3">تاريخ القيد</th>
                  <th className="py-2.5 px-3">البيان / التفصيل</th>
                  <th className="py-2.5 px-3">القيمة الأصلية</th>
                  <th className="py-2.5 px-3 text-red-400">المتبقي غير المسدد</th>
                  <th className="py-2.5 px-3">الحالة</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-850">
                {advances
                  .filter(a => a.remainingAmount > 0)
                  .slice(0, 5)
                  .map((adv) => {
                    const pctPaid = Math.round(((adv.amount - adv.remainingAmount) / adv.amount) * 100);
                    return (
                      <tr key={adv.id} className="hover:bg-slate-850/40 text-slate-300">
                        <td className="py-3 px-3 font-mono text-[10px]">{adv.id}</td>
                        <td className="py-3 px-3 font-semibold text-white">{adv.workerName}</td>
                        <td className="py-3 px-3 text-slate-400">{adv.date}</td>
                        <td className="py-3 px-3 max-w-[200px] truncate" title={adv.description}>{adv.description}</td>
                        <td className="py-3 px-3 font-semibold text-slate-300">{adv.amount} {settings.currency}</td>
                        <td className="py-3 px-3 font-black text-red-400">{adv.remainingAmount} {settings.currency}</td>
                        <td className="py-3 px-3">
                          <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold ${adv.remainingAmount === adv.amount ? 'bg-red-950/60 border border-red-900/60 text-red-400' : 'bg-amber-950/60 border border-amber-900/60 text-amber-400'}`}>
                            {adv.remainingAmount === adv.amount ? 'معلقة بالكامل' : `مسددة جزئياً (%${pctPaid})`}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
              </tbody>
            </table>
          )}
        </div>
      </div>
      
    </div>
  );
}
