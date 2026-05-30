/**
 * @license
 * SPDX-License-Identifier: Apache-2.5
 */

import React, { useState, useMemo, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  FileSpreadsheet, 
  RefreshCw, 
  DollarSign, 
  Calendar, 
  ChevronLeft, 
  Printer, 
  CheckCircle, 
  Plus, 
  Trash2, 
  X,
  CreditCard,
  UserCheck,
  Percent,
  TrendingDown,
  Coins,
  ShieldCheck,
  CoinsIcon,
  Search
} from 'lucide-react';
import { Worker, Advance, Bonus, Deduction, OvertimeLog, PayrollRecord, SystemSettings } from '../types';

interface PayrollTabProps {
  workers: Worker[];
  advances: Advance[];
  bonuses: Bonus[];
  deductions: Deduction[];
  overtimeLogs: OvertimeLog[];
  settings: SystemSettings;
  payrollRecords: PayrollRecord[];
  
  onGeneratePayroll: (periodId: string, records: PayrollRecord[]) => void;
  onUpdateRecordStatus: (recordId: string, status: 'draft' | 'paid' | 'delayed', paymentDate?: string) => void;
  onClearPayrollPeriod: (periodId: string) => void;
  onAddLog: (text: string, type: 'info' | 'success' | 'warning' | 'error' | 'command') => void;
}

export default function PayrollTab({
  workers,
  advances,
  bonuses,
  deductions,
  overtimeLogs,
  settings,
  payrollRecords,
  onGeneratePayroll,
  onUpdateRecordStatus,
  onClearPayrollPeriod,
  onAddLog
}: PayrollTabProps) {

  // Current selected month/period
  const [currentPeriod, setCurrentPeriod] = useState('2026-05');
  const [searchTerm, setSearchTerm] = useState('');

  // Settle parameters inside drafting
  const [draftDaysMap, setDraftDaysMap] = useState<Record<string, number>>({});
  const [draftAdvanceDeductions, setDraftAdvanceDeductions] = useState<Record<string, number>>({});
  const [draftNotesMap, setDraftNotesMap] = useState<Record<string, string>>({});

  // Active Payslip Viewer state
  const [activePayslip, setActivePayslip] = useState<PayrollRecord | null>(null);
  const [showAllPayrollPrint, setShowAllPayrollPrint] = useState(false);

  // Filtered payroll records
  const currentPeriodRecords = useMemo(() => {
    return payrollRecords.filter(r => r.periodId === currentPeriod);
  }, [payrollRecords, currentPeriod]);

  // Sync default work unit limits for newly generated draft inputs
  useEffect(() => {
    if (currentPeriodRecords.length > 0) {
      const days: Record<string, number> = {};
      const advs: Record<string, number> = {};
      const notes: Record<string, string> = {};

      currentPeriodRecords.forEach(rec => {
        days[rec.workerId] = rec.workDaysCalculated;
        advs[rec.workerId] = rec.totalAdvancesDeducted;
        notes[rec.workerId] = rec.notes || '';
      });

      setDraftDaysMap(days);
      setDraftAdvanceDeductions(advs);
      setDraftNotesMap(notes);
    }
  }, [currentPeriodRecords]);

  // Generate current month payroll proposal
  const handleCalcDraftProposal = () => {
    const activeWorkers = workers.filter(w => w.status === 'active');
    if (activeWorkers.length === 0) {
      alert('لا يوجد عمال نشطين حالياً في النظام لتوليد رواتبهم! الرجاء تنشيط العمال أولاً.');
      return;
    }

    onAddLog(`جاري قيد وتدقيق الحسابات للفترة [${currentPeriod}]...`, 'command');

    const generatedRecords: PayrollRecord[] = activeWorkers.map(worker => {
      // 1. Base Days/Hours worked defaults
      let defaultUnits = 26; // days for daily staff
      if (worker.salaryType === 'monthly') defaultUnits = 30; // 30 days for monthly staff
      else if (worker.salaryType === 'hourly') defaultUnits = 180; // 180 working hours default

      // 2. Base salary calculated
      let baseCalculated = worker.baseSalary;
      if (worker.salaryType === 'daily') {
        baseCalculated = worker.baseSalary * defaultUnits;
      } else if (worker.salaryType === 'hourly') {
        baseCalculated = worker.baseSalary * defaultUnits;
      }

      // 3. Overtime calculation
      const rOvertimes = overtimeLogs.filter(o => o.workerId === worker.id && o.date.startsWith(currentPeriod));
      const totalOvertimeHours = rOvertimes.reduce((sum, o) => sum + o.hours, 0);
      const totalOvertimeAmount = rOvertimes.reduce((sum, o) => sum + (o.hours * worker.hourlyOvertimeRate * o.multiplier), 0);

      // 4. Bonuses
      const rBonuses = bonuses.filter(b => b.workerId === worker.id && b.date.startsWith(currentPeriod));
      const totalBonuses = rBonuses.reduce((sum, b) => sum + b.amount, 0);

      // 5. Deductions
      const rDeductions = deductions.filter(d => d.workerId === worker.id && d.date.startsWith(currentPeriod));
      const totalDeductions = rDeductions.reduce((sum, d) => sum + d.amount, 0);

      // 6. Advances automatically proposed (e.g. deduct up to 25% of base salary, or up to the total pending loan, whichever is less)
      const rAdvances = advances.filter(a => a.workerId === worker.id && a.remainingAmount > 0);
      const workerTotalLoanRemaining = rAdvances.reduce((sum, a) => sum + a.remainingAmount, 0);
      
      let proposedAdvanceDeduction = 0;
      if (workerTotalLoanRemaining > 0) {
        // limit deduction to 25% of base calculated pay or the total loan
        const quarterBase = Math.round(baseCalculated * 0.25);
        proposedAdvanceDeduction = Math.min(quarterBase, workerTotalLoanRemaining);
      }

      // 7. Net Salary calculation
      const netSalary = baseCalculated + totalOvertimeAmount + totalBonuses - totalDeductions - proposedAdvanceDeduction;

      return {
        id: `PAY-${currentPeriod}-${worker.id}`,
        periodId: currentPeriod,
        workerId: worker.id,
        workerName: worker.name,
        jobTitle: worker.jobTitle,
        salaryType: worker.salaryType,
        baseSalaryRate: worker.baseSalary,
        workDaysCalculated: defaultUnits,
        baseSalaryCalculated: baseCalculated,
        totalOvertimeHours,
        totalOvertimeAmount,
        totalBonuses,
        totalDeductions,
        totalAdvancesDeducted: proposedAdvanceDeduction,
        netSalary: Math.max(0, netSalary),
        status: 'draft',
        notes: ''
      };
    });

    onGeneratePayroll(currentPeriod, generatedRecords);
    onAddLog(`تم نجاح إعداد مسير الرواتب لـ [${generatedRecords.length}] عامل تحت الدورة [${currentPeriod}].`, 'success');
  };

  // Recalculate single row when interactive inputs (units worked, advances deducted) change
  const handleUpdateDraftRowVal = (workerId: string, updatedUnits: number, updatedAdvDeduction: number, updatedNotes: string) => {
    const worker = workers.find(w => w.id === workerId);
    if (!worker) return;

    // Recalculate record
    const recordIndex = currentPeriodRecords.findIndex(r => r.workerId === workerId);
    if (recordIndex === -1) return;

    const originalRecord = currentPeriodRecords[recordIndex];

    // Compute base salary based on new units
    let baseCalculated = worker.baseSalary;
    if (worker.salaryType === 'daily' || worker.salaryType === 'hourly') {
      baseCalculated = worker.baseSalary * updatedUnits;
    } else {
      // Monthly staff, but custom deduction if days != 30
      if (updatedUnits < 30) {
        baseCalculated = Math.round((worker.baseSalary / 30) * updatedUnits);
      }
    }

    const netSalary = baseCalculated + originalRecord.totalOvertimeAmount + originalRecord.totalBonuses - originalRecord.totalDeductions - updatedAdvDeduction;

    const modifiedRecord: PayrollRecord = {
      ...originalRecord,
      workDaysCalculated: updatedUnits,
      baseSalaryCalculated: baseCalculated,
      totalAdvancesDeducted: updatedAdvDeduction,
      netSalary: Math.max(0, netSalary),
      notes: updatedNotes
    };

    const newRecordsList = [...currentPeriodRecords];
    newRecordsList[recordIndex] = modifiedRecord;
    
    // Save to master array
    onGeneratePayroll(currentPeriod, newRecordsList);
  };

  // Trigger mark as Paid and deduct loans
  const handlePaySalaryDisburse = (recordId: string) => {
    const today = new Date().toISOString().split('T')[0];
    onUpdateRecordStatus(recordId, 'paid', today);
    onAddLog(`تم تخليد كشف الصرف للمعرف [${recordId}] ومطابقة الأرصدة البنكية بنجاح.`, 'success');
  };

  // Pay ALL draft salaries at once
  const handlePayAllDrafts = () => {
    const drafts = currentPeriodRecords.filter(r => r.status === 'draft');
    if (drafts.length === 0) return;
    
    if (confirm(`هل ترغب بصرف رواتب جميع العمال دفعة واحدة لعدد (${drafts.length}) عامل متبقي في المسير؟`)) {
      const today = new Date().toISOString().split('T')[0];
      drafts.forEach(r => {
        onUpdateRecordStatus(r.id, 'paid', today);
      });
      onAddLog(`تم صرف الرواتب بالكامل لجميع عمال دورة ${currentPeriod} بنجاح دفعة واحدة!`, 'success');
    }
  };

  // Clear Payroll Entire Month
  const handleClearMonthRecords = () => {
    if (confirm(`هل ترغب بحذف وإلغاء مسودة مسير الرواتب الحالية بالكامل لشهر [${currentPeriod}] وإعادة فتح الفترة؟`)) {
      onClearPayrollPeriod(currentPeriod);
      onAddLog(`تم تصفير وإلغاء مسيرة شهر ${currentPeriod} بنجاح.`, 'warning');
    }
  };

  // Calculated Aggregate totals for current period
  const totals = useMemo(() => {
    let baseSum = 0;
    let otSum = 0;
    let bonusSum = 0;
    let dedSum = 0;
    let advDeductedSum = 0;
    let netSum = 0;
    let paidCount = 0;

    currentPeriodRecords.forEach(r => {
      baseSum += r.baseSalaryCalculated;
      otSum += r.totalOvertimeAmount;
      bonusSum += r.totalBonuses;
      dedSum += r.totalDeductions;
      advDeductedSum += r.totalAdvancesDeducted;
      netSum += r.netSalary;
      if (r.status === 'paid') paidCount++;
    });

    return {
      baseSum,
      otSum,
      bonusSum,
      dedSum,
      advDeductedSum,
      netSum,
      paidCount,
      totalCount: currentPeriodRecords.length
    };
  }, [currentPeriodRecords]);

  // Safe get max advance worker list to prevent excess inputs
  const getWorkerMaxAdvanceAllowed = (wId: string) => {
    const rAdvances = advances.filter(a => a.workerId === wId && a.remainingAmount > 0);
    return rAdvances.reduce((sum, a) => sum + a.remainingAmount, 0);
  };

  // Safe filters
  const filteredRecords = useMemo(() => {
    return currentPeriodRecords.filter(r => 
      r.workerName.includes(searchTerm) || 
      r.jobTitle.includes(searchTerm) || 
      r.id.includes(searchTerm)
    );
  }, [currentPeriodRecords, searchTerm]);

  return (
    <div className="space-y-6" id="payroll-panel">
      
      {/* Top Controller Ribbon */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5" id="payroll-settings-ribbon">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/10 flex items-center justify-center">
              <FileSpreadsheet className="w-5 h-5 text-amber-500" />
            </div>
            <div>
              <h3 className="text-sm font-black text-white">إعداد واحتساب الرواتب ومسيرات الصرف الشهري</h3>
              <p className="text-[10px] text-slate-400 mt-0.5">قم باختيار الشهر المالي، إطلاق مسير الحسابات، ضبط استثناءات الأيام يدوياً والموافقة على الصرف.</p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            
            {/* Period Picker */}
            <div className="flex items-center gap-1.5" id="period-selector-block">
              <label className="text-xs text-slate-400 font-bold">الفترة المالية:</label>
              <select
                value={currentPeriod}
                onChange={(e) => setCurrentPeriod(e.target.value)}
                className="bg-slate-950 border border-slate-800 rounded-xl py-2 px-3 text-xs text-amber-400 font-mono focus:outline-none focus:border-amber-500"
              >
                <option value="2026-05">مايو 2026 (شهر جاري)</option>
                <option value="2026-06">يونيو 2026 (مسودة)</option>
                <option value="2026-04">أبريل 2026 (مغلق)</option>
                <option value="2026-03">مارس 2026 (مغلق)</option>
              </select>
            </div>

            {currentPeriodRecords.length === 0 ? (
              <button
                onClick={handleCalcDraftProposal}
                className="py-2.5 px-4 bg-gradient-to-r from-amber-500 to-yellow-600 text-slate-950 font-black rounded-xl text-xs flex items-center gap-1.5 cursor-pointer shadow-md shadow-amber-950/25 hover:from-amber-400 transition-all"
                id="generate-payroll-btn"
              >
                <RefreshCw className="w-4 h-4 text-slate-950" />
                <span>توليد مسير رواتب العمال</span>
              </button>
            ) : (
              <div className="flex flex-wrap gap-2">
                {totals.paidCount < totals.totalCount && (
                  <button
                    onClick={handlePayAllDrafts}
                    className="py-2.5 px-4 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black rounded-xl text-xs flex items-center gap-1.5 cursor-pointer transition-colors shadow-md"
                  >
                    <CheckCircle className="w-4 h-4 text-slate-950" />
                    <span>صرف كامل مسير الرواتب دفعة</span>
                  </button>
                )}
                
                <button
                  onClick={() => setShowAllPayrollPrint(true)}
                  className="py-2.5 px-4 bg-gradient-to-r from-amber-500 to-yellow-600 text-slate-950 font-black rounded-xl text-xs flex items-center gap-1.5 cursor-pointer hover:from-amber-400 transition-all shadow-md"
                >
                  <Printer className="w-4 h-4 text-slate-950" />
                  <span>تصدير وطباعة المسير</span>
                </button>

                <button
                  onClick={handleClearMonthRecords}
                  className="py-2.5 px-4.5 bg-slate-950 hover:bg-red-950/40 border border-slate-800 hover:border-red-900/60 text-slate-400 hover:text-red-400 rounded-xl text-xs font-bold cursor-pointer transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                  <span>حذف المسودة الحالية</span>
                </button>
              </div>
            )}

          </div>

        </div>
      </div>

      {currentPeriodRecords.length > 0 && (
        <>
          {/* Quick Aggregate Stats for generated payroll */}
          <div className="grid grid-cols-2 md:grid-cols-6 gap-3" id="payroll-month-kpis">
            
            <div className="bg-slate-900 border border-slate-850 p-3 rounded-xl text-right">
              <span className="text-[10px] text-slate-500 block">إجمالي كادر الصرف</span>
              <span className="text-sm font-black text-white">{totals.totalCount} عمالة</span>
            </div>

            <div className="bg-slate-900 border border-slate-850 p-3 rounded-xl text-right">
              <span className="text-[10px] text-slate-500 block">المستحق الأساسي</span>
              <span className="text-sm font-black text-slate-350">{totals.baseSum.toLocaleString('ar-EG')} {settings.currency}</span>
            </div>

            <div className="bg-slate-900 border border-slate-850 p-3 rounded-xl text-right">
              <span className="text-[10px] text-blue-400 block">إجمالي الإضافي والبدل</span>
              <span className="text-sm font-black text-blue-400">+{totals.otSum.toLocaleString('ar-EG')} {settings.currency}</span>
            </div>

            <div className="bg-slate-900 border border-slate-850 p-3 rounded-xl text-right">
              <span className="text-[10px] text-red-400 block">استحقاق استرداد السلف</span>
              <span className="text-sm font-black text-red-400">-{totals.advDeductedSum.toLocaleString('ar-EG')} {settings.currency}</span>
            </div>

            <div className="bg-slate-900 border border-slate-850 p-3 rounded-xl text-right md:col-span-2 bg-gradient-to-l from-amber-950/20 to-slate-900">
              <span className="text-[10px] text-amber-400 block font-bold">صافي النقدية المطلوب تخصيصها</span>
              <span className="text-base font-black text-amber-400">
                {totals.netSum.toLocaleString('ar-EG')}{' '}
                <span className="text-[10px] text-slate-400 font-semibold">{settings.currency}</span>
              </span>
              <div className="text-[8px] text-slate-400 select-none">
                تم صرف: ({totals.paidCount}) منصل ({totals.totalCount})
              </div>
            </div>

          </div>

          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 flex items-center relative" id="search-bar-payroll">
            <span className="absolute right-7 text-slate-500">
              <Search className="w-4 h-4" />
            </span>
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="البحث في كشف مسير هذا الشهر بالاسم أو كود العامل..."
              className="w-full bg-slate-950/70 border border-slate-800 rounded-xl py-2.5 pr-10 pl-3 text-xs text-white"
              id="payroll-search"
            />
          </div>

          {/* Interactive Calculation Settle Sheet */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-xl" id="payroll-sheet-wrap">
            <div className="overflow-x-auto">
              <table className="w-full text-right text-xs table-auto">
                <thead>
                  <tr className="bg-slate-950/50 border-b border-slate-800 text-slate-400">
                    <th className="py-2.5 px-3 select-none">اسم العامل ووظيفته</th>
                    <th className="py-2.5 px-3 text-center">أيام/ساعات العمل</th>
                    <th className="py-2.5 px-3">الراتب المستحق</th>
                    <th className="py-2.5 px-3 block md:table-cell text-blue-400">إضافي (ساعة)</th>
                    <th className="py-2.5 px-3 text-emerald-400">المكافآت والبدل</th>
                    <th className="py-2.5 px-3 text-red-500">الخصومات والغياب</th>
                    <th className="py-2.5 px-3 text-red-400 text-center">استقطاع جزء السلفة</th>
                    <th className="py-2.5 px-3 text-amber-400 font-black">صافي المستحق</th>
                    <th className="py-2.5 px-3 text-center">الحالة والصرف</th>
                    <th className="py-2.5 px-3 text-center">المستند / قسيمة</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-850">
                  {filteredRecords.map((r) => {
                    const maxAdvDeductVal = getWorkerMaxAdvanceAllowed(r.workerId);
                    const isDraftStatus = r.status === 'draft';
                    
                    return (
                      <tr key={r.id} className={`hover:bg-slate-850/20 text-slate-300 ${r.status === 'paid' ? 'bg-emerald-950/5' : ''}`}>
                        
                        {/* Worker metadata */}
                        <td className="py-3 px-3">
                          <div className="font-bold text-white text-xs">{r.workerName}</div>
                          <div className="text-[10px] text-slate-500">{r.jobTitle} • {r.salaryType === 'monthly' ? 'شهري' : r.salaryType === 'daily' ? 'يومي' : 'ساعي'}</div>
                        </td>

                        {/* Interactive Unit field */}
                        <td className="py-3 px-3 text-center">
                          {isDraftStatus ? (
                            <div className="flex items-center justify-center gap-1">
                              <input
                                type="number"
                                value={draftDaysMap[r.workerId] ?? r.workDaysCalculated}
                                onChange={(e) => {
                                  let val = Number(e.target.value);
                                  if (val < 0) val = 0;
                                  setDraftDaysMap(prev => ({ ...prev, [r.workerId]: val }));
                                  handleUpdateDraftRowVal(r.workerId, val, draftAdvanceDeductions[r.workerId] ?? r.totalAdvancesDeducted, draftNotesMap[r.workerId] ?? '');
                                }}
                                className="w-14 bg-slate-950 text-center border border-slate-800 hover:border-slate-700 focus:border-amber-500 rounded px-1 py-1 font-mono text-xs text-white"
                                min={0}
                                title={r.salaryType === 'hourly' ? "عدد الساعات المنفذة هذا الشهر" : "عدد أيام الحضور واليوميات المنفذة"}
                              />
                              <span className="text-[9px] text-slate-500">{r.salaryType === 'hourly' ? 'ساعة' : 'يوم'}</span>
                            </div>
                          ) : (
                            <span className="font-mono text-slate-200">{r.workDaysCalculated} {r.salaryType === 'hourly' ? 'ساعة' : 'يوم'}</span>
                          )}
                        </td>

                        {/* Computed salary */}
                        <td className="py-3 px-3">
                          <span className="font-mono font-semibold">{r.baseSalaryCalculated}</span>{' '}
                          <span className="text-[10px] text-slate-500">{r.currency || settings.currency}</span>
                        </td>

                        {/* Overtime indicators */}
                        <td className="py-3 px-3 block md:table-cell text-slate-350">
                          <div className="font-mono">+{r.totalOvertimeAmount} {r.currency || settings.currency}</div>
                          <div className="text-[9px] text-slate-500 font-bold">({r.totalOvertimeHours} س)</div>
                        </td>

                        {/* Bonuses */}
                        <td className="py-3 px-3">
                          <span className="text-emerald-400 font-mono">+{r.totalBonuses} {r.currency || settings.currency}</span>
                        </td>

                        {/* Deductions */}
                        <td className="py-3 px-3">
                          <span className="text-red-400 font-mono">-{r.totalDeductions} {r.currency || settings.currency}</span>
                        </td>

                        {/* Interactive Advances Deductions */}
                        <td className="py-3 px-3 text-center">
                          {isDraftStatus && maxAdvDeductVal > 0 ? (
                            <div className="flex flex-col items-center gap-1">
                              <input
                                type="number"
                                value={draftAdvanceDeductions[r.workerId] ?? r.totalAdvancesDeducted}
                                onChange={(e) => {
                                  let val = Number(e.target.value);
                                  if (val < 0) val = 0;
                                  if (val > maxAdvDeductVal) val = maxAdvDeductVal;
                                  setDraftAdvanceDeductions(prev => ({ ...prev, [r.workerId]: val }));
                                  handleUpdateDraftRowVal(r.workerId, draftDaysMap[r.workerId] ?? r.workDaysCalculated, val, draftNotesMap[r.workerId] ?? '');
                                }}
                                className="w-16 bg-slate-950 text-center border border-slate-800 hover:border-slate-700 focus:border-amber-500 rounded px-1.5 py-1 font-mono text-xs text-red-400 font-bold"
                                min={0}
                                max={maxAdvDeductVal}
                                title={`سيف استرداد القرض المتاح للاقتطاع: ${maxAdvDeductVal} ${r.currency || settings.currency}`}
                              />
                              <span className="text-[8px] text-slate-500 block">من متبقي {maxAdvDeductVal} سلف</span>
                            </div>
                          ) : (
                            <div className="font-mono text-red-400">
                              -{r.totalAdvancesDeducted} {r.currency || settings.currency}
                              {maxAdvDeductVal > 0 && <span className="text-[8px] text-slate-500 block mt-0.5">متبقي سلف: {maxAdvDeductVal}</span>}
                            </div>
                          )}
                        </td>

                        {/* Final Computed net salary */}
                        <td className="py-3 px-3 font-black text-sm text-amber-400 font-mono">
                          {r.netSalary} {r.currency || settings.currency}
                        </td>

                        {/* Disbursement control */}
                        <td className="py-3 px-3 text-center">
                          {isDraftStatus ? (
                            <button
                              onClick={() => handlePaySalaryDisburse(r.id)}
                              className="py-1 px-3 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold rounded-lg text-[10px] cursor-pointer transition-all hover:shadow-md"
                              id={`pay-btn-${r.id}`}
                            >
                              تاكيد وصرف
                            </button>
                          ) : (
                            <div className="flex flex-col items-center select-none">
                              <span className="px-2 py-0.5 rounded-full text-[9px] font-bold bg-emerald-950 border border-emerald-900 text-emerald-400 flex items-center gap-1">
                                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                                تم صرفه
                              </span>
                              {r.paymentDate && <span className="text-[8px] text-slate-500 font-mono mt-0.5">{r.paymentDate}</span>}
                            </div>
                          )}
                        </td>

                        {/* Interactive Receipt Generation */}
                        <td className="py-3 px-3 text-center">
                          <button
                            onClick={() => setActivePayslip(r)}
                            className="py-1 px-2.5 bg-slate-950 hover:bg-slate-800 border border-slate-800 text-slate-300 hover:text-white rounded-lg text-[10px] font-bold cursor-pointer flex items-center justify-center gap-1.5 mx-auto"
                            title="توليد قسيمة الراتب التفصيلية للمطابقة والطباعة"
                          >
                            <Printer className="w-3.5 h-3.5 text-amber-500" />
                            <span>قسيمة</span>
                          </button>
                        </td>

                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}

      {currentPeriodRecords.length === 0 && (
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-12 text-center" id="empty-payroll-splash">
          <div className="max-w-md mx-auto space-y-4">
            <div className="w-16 h-16 rounded-full bg-slate-950 border border-slate-800 flex items-center justify-center mx-auto float-none">
              <FileSpreadsheet className="w-8 h-8 text-slate-500" />
            </div>
            
            <h3 className="text-base font-bold text-white">لا توجد مسيرة رواتب نشطة لهذا الشهر بعد!</h3>
            
            <p className="text-xs text-slate-400 leading-normal">
              لاستعراض صافي الرواتب المستحقة واقتطاعات السلف وتصدير فواتير القبض للعمال، الرجاء النقر على الزر أعلاه لتوليد نموذج المقترح المالي المباشر لشهر <strong className="text-white">{currentPeriod}</strong>.
            </p>

            <button
              onClick={handleCalcDraftProposal}
              className="py-3 px-6 bg-amber-500 hover:bg-amber-400 active:scale-95 text-slate-950 font-black rounded-xl text-xs inline-flex items-center gap-2 transition-all cursor-pointer shadow-md"
            >
              <RefreshCw className="w-4.5 h-4.5 text-slate-950" />
              <span>إنشاء مسير الرواتب الآن</span>
            </button>
          </div>
        </div>
      )}

      {/* Printable Payslip Modal (قسيمة راتب عامل تفصيلية) */}
      <AnimatePresence>
        {activePayslip && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 p-4 backdrop-blur-sm" id="payslip-modal-wrapper">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-slate-900 border border-slate-800 w-full max-w-xl rounded-3xl overflow-hidden shadow-2xl flex flex-col"
              style={{ maxHeight: '92vh' }}
              id="payslip-modal"
            >
              
              {/* Header */}
              <div className="bg-slate-950 border-b border-slate-850 px-6 py-4 flex items-center justify-between">
                <h3 className="text-xs font-bold text-white flex items-center gap-1.5 select-none">
                  <Printer className="w-4.5 h-4.5 text-amber-500" />
                  <span>معاينة وتصدير قسيمة الراتب والقبض الرسمية للعامل</span>
                </h3>
                <button
                  onClick={() => setActivePayslip(null)}
                  className="p-1 hover:bg-slate-800 rounded-full text-slate-400 hover:text-white transition-colors cursor-pointer"
                >
                  <X className="w-4.5 h-4.5" />
                </button>
              </div>

              {/* Printable Body Wrap */}
              <div className="p-6 md:p-8 overflow-y-auto space-y-6 text-right flex-1 bg-slate-950/20 scrollbar-thin" id="payslip-print-section">
                
                {/* Traditional Corporate Payslip Outline */}
                <div className="border border-slate-800 bg-slate-950/40 rounded-2xl p-6 space-y-6 relative text-slate-350">
                  
                  {/* Watermark logo */}
                  <div className="absolute right-4 bottom-4 w-28 h-28 opacity-5 pointer-events-none stroke-current">
                    <Coins className="w-full h-full text-amber-500" />
                  </div>

                  {/* Header Row */}
                  <div className="flex justify-between items-start gap-4 border-b border-slate-800 pb-5">
                    <div className="space-y-1">
                      <h4 className="text-base font-black text-white">{settings.companyName}</h4>
                      {settings.vatNumber && <p className="text-[10px] text-slate-500 font-mono">الرقم الضريبي: {settings.vatNumber}</p>}
                      <p className="text-[10px] text-slate-400">قسم المحاسبة والموارد البشرية</p>
                    </div>
                    
                    <div className="text-left space-y-1 font-mono text-[10px] text-slate-400">
                      <div className="text-xs font-black text-amber-500 font-sans text-right">مسير رواتب العمال</div>
                      <div>رقم المستند: {activePayslip.id}</div>
                      <div>الفترة المالية: {activePayslip.periodId}</div>
                      <div>تاريخ السند: {new Date().toLocaleDateString('ar-EG')}</div>
                    </div>
                  </div>

                  {/* Employee Details Strip */}
                  <div className="grid grid-cols-2 gap-4 bg-slate-950 p-4 rounded-xl text-xs">
                    <div className="space-y-1">
                      <div>الاسم: <strong className="text-white text-sm">{activePayslip.workerName}</strong></div>
                      <div>الوظيفة: <strong className="text-slate-200">{activePayslip.jobTitle}</strong></div>
                    </div>
                    
                    <div className="space-y-1 font-sans text-right">
                      <div>كود العامل: <span className="font-mono text-amber-500 font-semibold">{activePayslip.workerId}</span></div>
                      <div>طريقة الأجر: <strong className="text-white">{activePayslip.salaryType === 'monthly' ? 'أجر شهري' : activePayslip.salaryType === 'daily' ? 'يوميات' : 'أجر ساعات'}</strong></div>
                    </div>
                  </div>

                  {/* Calculations breakdown details */}
                  <div className="space-y-3">
                    <h5 className="text-xs font-black text-white border-r-2 border-amber-500 pr-2">تفاصيل المفردات والاحتساب المالي</h5>
                    
                    <table className="w-full text-xs text-right border border-slate-850 rounded-lg overflow-hidden">
                      <thead>
                        <tr className="bg-slate-900 border-b border-slate-850 text-slate-400">
                          <th className="py-2 px-3">البيان / الوصف</th>
                          <th className="py-2 px-3 text-center">أيام/ساعات العمل</th>
                          <th className="py-2 px-3 text-left">عائد الموظف (+)</th>
                          <th className="py-2 px-3 text-left">استقطاعات منه (-)</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-850 font-mono">
                        
                        {/* Base calculated */}
                        <tr className="text-slate-300">
                          <td className="py-2 px-3 font-sans">الراتب العقدي الأساسي الفعلي للوحدات المنجزة</td>
                          <td className="py-2 px-3 text-center">{activePayslip.workDaysCalculated} {activePayslip.salaryType === 'hourly' ? 'س' : 'ي'}</td>
                          <td className="py-2 px-3 text-left text-white">{activePayslip.baseSalaryCalculated} {activePayslip.currency || settings.currency}</td>
                          <td className="py-2 px-3 text-left text-slate-600">-</td>
                        </tr>

                        {/* Overtime */}
                        {activePayslip.totalOvertimeAmount > 0 && (
                          <tr className="text-blue-400">
                            <td className="py-2 px-3 font-sans">علاوة الساعات الإضافية (الأوفرتايم الموقع)</td>
                            <td className="py-2 px-3 text-center">{activePayslip.totalOvertimeHours} س</td>
                            <td className="py-2 px-3 text-left">+{activePayslip.totalOvertimeAmount} {activePayslip.currency || settings.currency}</td>
                            <td className="py-2 px-3 text-left text-slate-600">-</td>
                          </tr>
                        )}

                        {/* Bonuses */}
                        {activePayslip.totalBonuses > 0 && (
                          <tr className="text-emerald-400">
                            <td className="py-2 px-3 font-sans">إجمالي البدلات والمكافآت والعمولات المستحقة</td>
                            <td className="py-2 px-3 text-center">-</td>
                            <td className="py-2 px-3 text-left">+{activePayslip.totalBonuses} {activePayslip.currency || settings.currency}</td>
                            <td className="py-2 px-3 text-left text-slate-600">-</td>
                          </tr>
                        )}

                        {/* Deductions */}
                        {activePayslip.totalDeductions > 0 && (
                          <tr className="text-red-400">
                            <td className="py-2 px-3 font-sans">جزاء غياب، تأخير أو مخالفات إدارية</td>
                            <td className="py-2 px-3 text-center">-</td>
                            <td className="py-2 px-3 text-left text-slate-600">-</td>
                            <td className="py-2 px-3 text-left">-{activePayslip.totalDeductions} {activePayslip.currency || settings.currency}</td>
                          </tr>
                        )}

                        {/* Advances Deducted */}
                        {activePayslip.totalAdvancesDeducted > 0 && (
                          <tr className="text-amber-500">
                            <td className="py-2 px-3 font-sans">استقطاع مستردات قيد السلف والقروض لشهر مايو</td>
                            <td className="py-2 px-3 text-center">-</td>
                            <td className="py-2 px-3 text-left text-slate-600">-</td>
                            <td className="py-2 px-3 text-left">-{activePayslip.totalAdvancesDeducted} {activePayslip.currency || settings.currency}</td>
                          </tr>
                        )}

                      </tbody>
                    </table>
                  </div>

                  {/* Net Summary box */}
                  <div className="flex justify-between items-center bg-slate-950 p-4 border border-slate-850 rounded-xl" id="payslip-totals-box">
                    <span className="text-xs font-bold text-white font-sans">صافي الراتب المستحق للصرف النهائي (Net Salary):</span>
                    <span className="text-lg font-black text-amber-400 font-mono">
                      {activePayslip.netSalary.toLocaleString('ar-EG')}{' '}
                      <span className="text-xs text-slate-400 font-sans font-bold">{activePayslip.currency || settings.currency}</span>
                    </span>
                  </div>

                  {/* Signatures Footer */}
                  <div className="grid grid-cols-2 gap-8 text-center pt-8 border-t border-slate-900 border-dashed text-[10px]">
                    <div className="space-y-6">
                      <p className="text-slate-500">توقيع وختم محاسب الموقع المالي</p>
                      <div className="h-0.5 w-32 bg-slate-800 mx-auto" />
                    </div>
                    
                    <div className="space-y-6">
                      <p className="text-slate-500">توقيع المستلم والـعـامـل</p>
                      <div className="h-0.5 w-32 bg-slate-800 mx-auto" />
                    </div>
                  </div>

                </div>

              </div>

              {/* Action Buttons */}
              <div className="bg-slate-950 border-t border-slate-850 px-6 py-4 flex items-center justify-between select-none">
                
                <button
                  onClick={() => {
                    const printContents = document.getElementById('payslip-print-section')?.innerHTML;
                    if (printContents) {
                      const printFrame = document.createElement('iframe');
                      printFrame.style.position = 'fixed';
                      printFrame.style.right = '0';
                      printFrame.style.bottom = '0';
                      printFrame.style.width = '0';
                      printFrame.style.height = '0';
                      printFrame.style.border = '0';
                      document.body.appendChild(printFrame);

                      const frameDoc = printFrame.contentWindow?.document || printFrame.contentDocument;
                      if (frameDoc) {
                        frameDoc.open();
                        frameDoc.write(`
                          <html>
                            <head>
                              <title>قسيمة راتب - ${activePayslip.workerName}</title>
                              <style>
                                @import url('https://fonts.googleapis.com/css2?family=Cairo:wght@400;700;900&display=swap');
                                body { font-family: 'Cairo', sans-serif; direction: rtl; text-align: right; background-color: #fff; color: #000; padding: 20px; }
                                h4, h5 { margin: 5px 0; }
                                table { width: 100%; border-collapse: collapse; margin-top: 20px; font-size:12px; }
                                th, td { border: 1px solid #ddd; padding: 8px; text-align: right; }
                                th { background-color: #f2f2f2; }
                                .net-box { border: 2px solid #000; padding: 10px; margin-top: 20px; text-align: left; font-weight: bold; }
                                .signatures { display: grid; grid-template-cols: 1fr 1fr; gap: 50px; text-align: center; margin-top: 40px; font-size:10px;}
                                .line { width: 150px; border-bottom: 1px solid #000; margin: 30px auto 0; }
                              </style>
                            </head>
                            <body>
                              ${printContents}
                              <script>
                                window.onload = function() {
                                  window.print();
                                };
                              </script>
                            </body>
                          </html>
                        `);
                        frameDoc.close();
                        setTimeout(() => {
                          if (printFrame.contentWindow) {
                            printFrame.contentWindow.focus();
                            printFrame.contentWindow.print();
                          }
                          setTimeout(() => {
                            document.body.removeChild(printFrame);
                          }, 1500);
                        }, 500);
                      }
                    }
                  }}
                  className="py-2 px-5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-black rounded-xl text-xs flex items-center gap-1.5 cursor-pointer shadow-md"
                >
                  <Printer className="w-4 h-4 text-slate-950" />
                  <span>طباعة أو تحميل كـ PDF</span>
                </button>

                <button
                  type="button"
                  onClick={() => setActivePayslip(null)}
                  className="py-2 px-5 bg-slate-900 hover:bg-slate-850 border border-slate-800 text-slate-300 rounded-xl text-xs font-bold cursor-pointer transition-colors"
                >
                  الرجوع للمسير
                </button>
              </div>

            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Printable All Payroll Modal (مسير رواتب شهري متكامل للطباعة) */}
      <AnimatePresence>
        {showAllPayrollPrint && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 p-4 backdrop-blur-sm" id="all-payroll-modal-wrapper">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-slate-900 border border-slate-800 w-full max-w-5xl rounded-3xl overflow-hidden shadow-2xl flex flex-col"
              style={{ maxHeight: '92vh' }}
              id="all-payroll-modal"
            >
              
              {/* Header */}
              <div className="bg-slate-950 border-b border-slate-850 px-6 py-4 flex items-center justify-between">
                <h3 className="text-xs font-bold text-white flex items-center gap-1.5 select-none">
                  <Printer className="w-4.5 h-4.5 text-amber-500" />
                  <span>تصدير وطباعة كشفت مسير الرواتب المالي العام للعمال</span>
                </h3>
                <button
                  type="button"
                  onClick={() => setShowAllPayrollPrint(false)}
                  className="p-1 hover:bg-slate-800 rounded-full text-slate-400 hover:text-white transition-colors cursor-pointer"
                >
                  <X className="w-4.5 h-4.5" />
                </button>
              </div>

              {/* Printable Body Wrap */}
              <div className="p-6 md:p-8 overflow-y-auto space-y-6 text-right flex-1 bg-slate-950/20 scrollbar-thin" id="all-payroll-print-section">
                
                <div className="border border-slate-800 bg-slate-950/40 rounded-2xl p-6 space-y-6 relative text-slate-350">
                  
                  {/* Traditional Header Row */}
                  <div className="flex justify-between items-start gap-4 border-b border-slate-800 pb-5">
                    <div className="space-y-1">
                      <h4 className="text-base font-black text-white">{settings.companyName}</h4>
                      {settings.vatNumber && <p className="text-[10px] text-slate-500 font-mono">الرقم الضريبي: {settings.vatNumber}</p>}
                      <p className="text-[10px] text-slate-400">قسم الحسابات العامة - كشف مسير الصرف المعتمد</p>
                    </div>
                    
                    <div className="text-left space-y-1 font-mono text-[10px] text-slate-400 font-bold">
                      <div className="text-xs font-black text-amber-500 font-sans text-right">مسير رواتب العمال العمومي</div>
                      <div>الفترة المالية: {currentPeriod}</div>
                      <div>تاريخ جرد المسير: {new Date().toLocaleDateString('ar-EG')}</div>
                      <div>عدد العمال المدرجين: {totals.totalCount} عمال</div>
                    </div>
                  </div>

                  {/* Summary aggregate block */}
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3 bg-slate-950 p-4 rounded-xl text-xs">
                    <div>
                      <span className="text-slate-500 block">إجمالي الأجور الأساسية:</span>
                      <strong className="text-white font-mono text-sm">{totals.baseSum} {settings.currency}</strong>
                    </div>
                    <div>
                      <span className="text-slate-500 block">إجمالي علاوة الإضافي (الأوفرتايم):</span>
                      <strong className="text-blue-400 font-mono text-sm">+{totals.otSum} {settings.currency}</strong>
                    </div>
                    <div>
                      <span className="text-slate-500 block">إجمالي البدلات والمكافآت:</span>
                      <strong className="text-emerald-400 font-mono text-sm">+{totals.bonusSum} {settings.currency}</strong>
                    </div>
                    <div>
                      <span className="text-slate-500 block">إجمالي مستقطع الخصومات والسلف:</span>
                      <strong className="text-red-400 font-mono text-sm">-{totals.dedSum + totals.advDeductedSum} {settings.currency}</strong>
                    </div>
                  </div>

                  {/* Complete Payroll Sheet Table for Print */}
                  <div className="overflow-x-auto border border-slate-855 rounded-xl">
                    <table className="w-full text-[11px] text-right">
                      <thead>
                        <tr className="bg-slate-900 border-b border-slate-850 text-slate-400">
                          <th className="py-2.5 px-3">كود العامل</th>
                          <th className="py-2.5 px-3">اسم العامل</th>
                          <th className="py-2.5 px-3">المهنة والوظيفة</th>
                          <th className="py-2.5 px-3">نوع الأجر</th>
                          <th className="py-2.5 px-3">أيام/ساعات العمل</th>
                          <th className="py-2.5 px-3 text-left">أجر أساسي (+)</th>
                          <th className="py-2.5 px-3 text-left">إضافي (+)</th>
                          <th className="py-2.5 px-3 text-left">بدلات/حوافز (+)</th>
                          <th className="py-2.5 px-3 text-left">خصومات غياب (-)</th>
                          <th className="py-2.5 px-3 text-left">مستقطع سلف (-)</th>
                          <th className="py-2.5 px-3 text-left font-bold text-amber-400 animate-pulse">صافي المستحق</th>
                          <th className="py-2.5 px-3 text-center w-24">توقيع المستلم</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-850 font-mono text-slate-300">
                        {currentPeriodRecords.map((record) => (
                          <tr key={record.id} className="hover:bg-slate-900/60 transition-colors">
                            <td className="py-2 px-3 text-amber-500 font-bold">{record.workerId}</td>
                            <td className="py-2 px-3 font-sans text-xs text-white font-bold">{record.workerName}</td>
                            <td className="py-2 px-3 font-sans text-slate-400">{record.jobTitle}</td>
                            <td className="py-2 px-3 font-sans text-slate-400">
                              {record.salaryType === 'monthly' ? 'شهري' : record.salaryType === 'daily' ? 'يومي' : 'ساعي'}
                            </td>
                            <td className="py-2 px-3 text-center">{record.workDaysCalculated} {record.salaryType === 'hourly' ? 'س' : 'ي'}</td>
                            <td className="py-2 px-3 text-left text-slate-200">{record.baseSalaryCalculated} <span className="text-[9px] text-slate-400 font-sans">{record.currency || settings.currency}</span></td>
                            <td className="py-2 px-3 text-left text-blue-400">+{record.totalOvertimeAmount} <span className="text-[9px] text-blue-500 font-sans">{record.currency || settings.currency}</span></td>
                            <td className="py-2 px-3 text-left text-emerald-400">+{record.totalBonuses} <span className="text-[9px] text-emerald-500 font-sans">{record.currency || settings.currency}</span></td>
                            <td className="py-2 px-3 text-left text-red-400">-{record.totalDeductions} <span className="text-[9px] text-red-500 font-sans">{record.currency || settings.currency}</span></td>
                            <td className="py-2 px-3 text-left text-orange-400">-{record.totalAdvancesDeducted} <span className="text-[9px] text-orange-500 font-sans">{record.currency || settings.currency}</span></td>
                            <td className="py-2 px-3 text-left font-bold text-white bg-slate-950/40">{record.netSalary} <span className="text-[9px] text-amber-500 font-sans">{record.currency || settings.currency}</span></td>
                            <td className="py-2 px-3 border-r border-slate-850 w-24"></td>
                          </tr>
                        ))}
                        {/* Table Totals Row */}
                        <tr className="bg-slate-900/80 font-bold border-t border-slate-800 text-slate-200">
                          <td colSpan={5} className="py-3 px-3 text-right font-sans">الإجماليات المالية الشاملة للمسير</td>
                          <td className="py-3 px-3 text-left text-white">{totals.baseSum}</td>
                          <td className="py-3 px-3 text-left text-blue-400">+{totals.otSum}</td>
                          <td className="py-3 px-3 text-left text-emerald-400">+{totals.bonusSum}</td>
                          <td className="py-3 px-3 text-left text-red-400">-{totals.dedSum}</td>
                          <td className="py-3 px-3 text-left text-orange-400">-{totals.advDeductedSum}</td>
                          <td className="py-3 px-3 text-left text-amber-400 font-extrabold text-sm">{totals.netSum}</td>
                          <td className="py-3 px-3 text-center text-[10px] text-slate-500 font-sans">عملة: {settings.currency}</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>

                  {/* Verification Note */}
                  <div className="flex justify-between items-center bg-slate-950 p-4 border border-slate-850 rounded-xl" id="payroll-totals-receipt-box">
                    <span className="text-xs font-bold text-slate-400 font-sans">إجمالي صافي الأجور والرواتب المستحقة للعمال والمطلوب صرفها:</span>
                    <span className="text-lg font-black text-amber-400 font-mono">
                      {totals.netSum.toLocaleString('ar-EG')}{' '}
                      <span className="text-xs text-slate-400 font-sans font-bold">{settings.currency}</span>
                    </span>
                  </div>

                  {/* Standard Signatures and Auditor seal */}
                  <div className="grid grid-cols-3 gap-6 text-center pt-8 border-t border-slate-900 border-dashed text-[10px]" id="signatures-audit-block">
                    <div className="space-y-6">
                      <p className="text-slate-500">إعداد / محاسب الموقع المالي</p>
                      <div className="h-0.5 w-24 bg-slate-800 mx-auto" stroke-dasharray="2,2" />
                    </div>
                    
                    <div className="space-y-6">
                      <p className="text-slate-500">مراجعة والتدقيق / الإدارة المالية ومكافحة الفساد</p>
                      <div className="h-0.5 w-24 bg-slate-800 mx-auto" stroke-dasharray="2,2" />
                    </div>

                    <div className="space-y-6">
                      <p className="text-slate-500">اعتماد وصرف رواتب / المدير العام المعتمد</p>
                      <div className="h-0.5 w-24 bg-slate-800 mx-auto" stroke-dasharray="2,2" />
                    </div>
                  </div>

                </div>

              </div>

              {/* Action Buttons */}
              <div className="bg-slate-950 border-t border-slate-850 px-6 py-4 flex items-center justify-between select-none">
                
                <button
                  onClick={() => {
                    const printSection = document.getElementById('all-payroll-print-section')?.innerHTML;
                    if (printSection) {
                      const printFrame = document.createElement('iframe');
                      printFrame.style.position = 'fixed';
                      printFrame.style.right = '0';
                      printFrame.style.bottom = '0';
                      printFrame.style.width = '0';
                      printFrame.style.height = '0';
                      printFrame.style.border = '0';
                      document.body.appendChild(printFrame);

                      const frameDoc = printFrame.contentWindow?.document || printFrame.contentDocument;
                      if (frameDoc) {
                        frameDoc.open();
                        frameDoc.write(`
                          <html>
                            <head>
                              <title>مسير الرواتب المالي العام - لشهر ${currentPeriod}</title>
                              <style>
                                @import url('https://fonts.googleapis.com/css2?family=Cairo:wght@400;700;900&display=swap');
                                body { font-family: 'Cairo', sans-serif; direction: rtl; text-align: right; background-color: #fff; color: #000; padding: 30px; }
                                h4 { margin: 5px 0; font-size: 16px; }
                                p { margin: 3px 0; font-size: 11px; color: #333; }
                                table { width: 100%; border-collapse: collapse; margin-top: 25px; font-size: 10px; }
                                th, td { border: 1px solid #000; padding: 6px 4px; text-align: right; }
                                th { background-color: #f5f5f5; font-weight: bold; }
                                .totals-row { background-color: #f9f9f9; font-weight: bold; }
                                .net-summary { border: 2px solid #000; padding: 12px; margin-top: 20px; font-size: 13px; text-align: right; font-weight: bold; }
                                .signatures-block { display: grid; grid-template-cols: 1fr 1fr 1fr; gap: 20px; text-align: center; margin-top: 60px; font-size: 10px; }
                                .sig-line { width: 120px; border-bottom: 1.5px solid #000; margin: 35px auto 0; }
                                .kpi-strip { display: flex; gap: 15px; margin-top: 15px; background: #fafafa; padding: 10px; border: 1px solid #ccc; border-radius: 5px; font-size: 11px; }
                                .kpi-item { flex: 1; }
                              </style>
                            </head>
                            <body>
                              <div style="text-align: right;">
                                <h4>${settings.companyName}</h4>
                                <p>قسم الحسابات العامة والميزانية</p>
                                <p><strong>مسير رواتب العمال العام لشهر: ${currentPeriod}</strong></p>
                                <p>تاريخ الاستخراج: ${new Date().toLocaleDateString('ar-EG')}</p>
                              </div>
                              
                              <div class="kpi-strip">
                                <div class="kpi-item">إجمالي الأساسي: ${totals.baseSum} ${settings.currency}</div>
                                <div class="kpi-item">علاوة الإضافي (الأوفرتايم): ${totals.otSum} ${settings.currency}</div>
                                <div class="kpi-item">المكافآت والبدلات: ${totals.bonusSum} ${settings.currency}</div>
                                <div class="kpi-item">الاستقطاعات الإجمالية: ${totals.dedSum + totals.advDeductedSum} ${settings.currency}</div>
                              </div>

                              <table dir="rtl">
                                <thead>
                                  <tr>
                                    <th>كود العامل</th>
                                    <th>اسم العامل</th>
                                    <th>الوظيفة</th>
                                    <th>نوع العقد</th>
                                    <th>المستوى (ي/س)</th>
                                    <th>أساسي (+)</th>
                                    <th>إضافي (+)</th>
                                    <th>بدلات (+)</th>
                                    <th>خصومات (-)</th>
                                    <th>مستقطع سلف (-)</th>
                                    <th>صافي المستحق</th>
                                    <th style="width: 110px; text-align: center;">التوقيع بالاستلام</th>
                                  </tr>
                                </thead>
                                <tbody>
                                  ${currentPeriodRecords.map(r => `
                                    <tr>
                                      <td>${r.workerId}</td>
                                      <td style="font-weight: bold;">${r.workerName}</td>
                                      <td>${r.jobTitle}</td>
                                      <td>${r.salaryType === 'monthly' ? 'شهري ثابت' : r.salaryType === 'daily' ? 'يومي مستقل' : 'ساعي'}</td>
                                      <td style="text-align: center;">${r.workDaysCalculated} ${r.salaryType === 'hourly' ? 'ساعة' : 'يوم'}</td>
                                      <td>${r.baseSalaryCalculated}</td>
                                      <td>${r.totalOvertimeAmount}</td>
                                      <td>${r.totalBonuses}</td>
                                      <td>${r.totalDeductions}</td>
                                      <td>${r.totalAdvancesDeducted}</td>
                                      <td style="font-weight: bold;">${r.netSalary}</td>
                                      <td></td>
                                    </tr>
                                  `).join('')}
                                  <tr class="totals-row">
                                    <td colspan="5" style="text-align: right;">الإجــمــالـيـات المــالــيـة للمسير العام</td>
                                    <td>${totals.baseSum}</td>
                                    <td>${totals.otSum}</td>
                                    <td>${totals.bonusSum}</td>
                                    <td>${totals.dedSum}</td>
                                    <td>${totals.advDeductedSum}</td>
                                    <td style="font-size: 11px; font-weight: bold;">${totals.netSum} ${settings.currency}</td>
                                    <td style="text-align: center; font-size: 8px;">معتمد ومطابق</td>
                                  </tr>
                                </tbody>
                              </table>

                              <div class="net-summary">
                                إجمالي المبالغ الصافية المطلوب توجيهها للصرف: ${totals.netSum.toLocaleString('ar-EG')} ${settings.currency}
                              </div>

                              <div class="signatures-block">
                                <div>
                                  <p>إعداد جهة الحسابات / المدقق</p>
                                  <div class="sig-line"></div>
                                </div>
                                <div>
                                  <p>مراجعة الإدارة المالية والتدقيق</p>
                                  <div class="sig-line"></div>
                                </div>
                                <div>
                                  <p>المدير العام للمؤسسة / رئيس مجلس الإدارة</p>
                                  <div class="sig-line"></div>
                                </div>
                              </div>
                              <script>
                                window.onload = function() {
                                  window.print();
                                };
                              </script>
                            </body>
                          </html>
                        `);
                        frameDoc.close();
                        setTimeout(() => {
                          if (printFrame.contentWindow) {
                            printFrame.contentWindow.focus();
                            printFrame.contentWindow.print();
                          }
                          setTimeout(() => {
                            document.body.removeChild(printFrame);
                          }, 1500);
                        }, 500);
                      }
                    }
                  }}
                  className="py-2 px-5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-black rounded-xl text-xs flex items-center gap-1.5 cursor-pointer shadow-md"
                >
                  <Printer className="w-4 h-4 text-slate-950" />
                  <span>بدء طباعة وتحميل المسير المالي (PDF)</span>
                </button>

                <button
                  type="button"
                  onClick={() => setShowAllPayrollPrint(false)}
                  className="py-2 px-5 bg-slate-900 hover:bg-slate-850 border border-slate-800 text-slate-300 rounded-xl text-xs font-bold cursor-pointer transition-colors"
                >
                  الرجوع للمسير
                </button>
              </div>

            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
}
