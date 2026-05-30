/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo } from 'react';
import { motion } from 'motion/react';
import { 
  HandCoins, 
  Gift, 
  AlertTriangle, 
  Clock, 
  Plus, 
  Trash2, 
  Search, 
  Calendar, 
  DollarSign,
  TrendingDown,
  UserPlus,
  Coins
} from 'lucide-react';
import { Worker, Advance, Bonus, Deduction, OvertimeLog, SystemSettings } from '../types';

interface TransactionsTabProps {
  workers: Worker[];
  advances: Advance[];
  bonuses: Bonus[];
  deductions: Deduction[];
  overtimeLogs: OvertimeLog[];
  settings: SystemSettings;
  
  // API modifiers
  onAddAdvance: (adv: Advance) => void;
  onSettleAdvance: (id: string, settleAmount: number) => void;
  onDeleteAdvance: (id: string) => void;
  
  onAddBonus: (bonus: Bonus) => void;
  onDeleteBonus: (id: string) => void;
  
  onAddDeduction: (ded: Deduction) => void;
  onDeleteDeduction: (id: string) => void;
  
  onAddOvertime: (ovt: OvertimeLog) => void;
  onDeleteOvertime: (id: string) => void;
}

export default function TransactionsTab({
  workers,
  advances,
  bonuses,
  deductions,
  overtimeLogs,
  settings,
  onAddAdvance,
  onSettleAdvance,
  onDeleteAdvance,
  onAddBonus,
  onDeleteBonus,
  onAddDeduction,
  onDeleteDeduction,
  onAddOvertime,
  onDeleteOvertime
}: TransactionsTabProps) {
  
  // Tabs: 'advances' | 'bonuses' | 'deductions' | 'overtime'
  const [activeSubTab, setActiveSubTab] = useState<'advances' | 'bonuses' | 'deductions' | 'overtime'>('advances');
  
  // Search state
  const [searchTerm, setSearchTerm] = useState('');

  // Form modals trigger
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [selectedWorkerId, setSelectedWorkerId] = useState('');
  
  // Shared inputs
  const [amountInput, setAmountInput] = useState<number>(100);
  const [hoursInput, setHoursInput] = useState<number>(4);
  const [multiplierInput, setMultiplierInput] = useState<number>(1.5);
  const [reasonInput, setReasonInput] = useState('');
  const [dateInput, setDateInput] = useState(() => new Date().toISOString().split('T')[0]);
  const [typeSelect, setTypeSelect] = useState('reward'); // allowance / penalty / attendance
  
  // Settle advance state
  const [settleAdvanceId, setSettleAdvanceId] = useState<string | null>(null);
  const [settleAmount, setSettleAmount] = useState<number>(0);

  // Filter out suspended workers for addition lists, but keep in data matching
  const activeWorkers = useMemo(() => {
    return workers.filter(w => w.status === 'active');
  }, [workers]);

  // Sync default worker selection when opening forms
  const handleOpenForm = () => {
    if (activeWorkers.length > 0) {
      setSelectedWorkerId(activeWorkers[0].id);
    } else {
      setSelectedWorkerId('');
    }
    setAmountInput(activeSubTab === 'overtime' ? 0 : 200);
    setHoursInput(activeSubTab === 'overtime' ? 4 : 0);
    setMultiplierInput(settings.defaultOvertimeMultiplier);
    setReasonInput('');
    setDateInput(new Date().toISOString().split('T')[0]);
    setIsFormOpen(true);
  };

  // Settle loan manually
  const checkSettleAdvance = (adv: Advance) => {
    setSettleAdvanceId(adv.id);
    setSettleAmount(adv.remainingAmount);
  };

  const handleConfirmSettle = () => {
    if (!settleAdvanceId || settleAmount <= 0) return;
    onSettleAdvance(settleAdvanceId, Number(settleAmount));
    setSettleAdvanceId(null);
  };

  // Submit operations
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedWorkerId) {
      alert('الرجاء اختيار اسم العامل المقيد!');
      return;
    }

    const matchedWorker = workers.find(w => w.id === selectedWorkerId);
    if (!matchedWorker) return;

    if (activeSubTab === 'advances') {
      const advPayload: Advance = {
        id: `ADV-${Math.floor(100 + Math.random() * 900)}`,
        workerId: selectedWorkerId,
        workerName: matchedWorker.name,
        amount: Number(amountInput),
        date: dateInput,
        description: reasonInput.trim() || 'سلفة معتمدة نقداً',
        status: 'pending',
        remainingAmount: Number(amountInput)
      };
      onAddAdvance(advPayload);
    } else if (activeSubTab === 'bonuses') {
      const bonusPayload: Bonus = {
        id: `BNS-${Math.floor(100 + Math.random() * 900)}`,
        workerId: selectedWorkerId,
        workerName: matchedWorker.name,
        amount: Number(amountInput),
        date: dateInput,
        reason: reasonInput.trim() || 'مكافأة تشجيعية',
        type: typeSelect as any
      };
      onAddBonus(bonusPayload);
    } else if (activeSubTab === 'deductions') {
      const dedPayload: Deduction = {
        id: `DED-${Math.floor(100 + Math.random() * 900)}`,
        workerId: selectedWorkerId,
        workerName: matchedWorker.name,
        amount: Number(amountInput),
        date: dateInput,
        reason: reasonInput.trim() || 'خصم إداري',
        type: typeSelect as any
      };
      onAddDeduction(dedPayload);
    } else if (activeSubTab === 'overtime') {
      const ovtPayload: OvertimeLog = {
        id: `OVT-${Math.floor(100 + Math.random() * 900)}`,
        workerId: selectedWorkerId,
        workerName: matchedWorker.name,
        hours: Number(hoursInput),
        date: dateInput,
        multiplier: Number(multiplierInput) || 1.5,
        description: reasonInput.trim() || 'عمل إضافي متفرق بالموقع'
      };
      onAddOvertime(ovtPayload);
    }

    setIsFormOpen(false);
  };

  // Filtering list based on search and tab
  const datasetForList = useMemo(() => {
    switch (activeSubTab) {
      case 'advances':
        return advances.filter(item => 
          item.workerName.includes(searchTerm) || 
          item.id.includes(searchTerm) ||
          item.description.includes(searchTerm)
        );
      case 'bonuses':
        return bonuses.filter(item => 
          item.workerName.includes(searchTerm) || 
          item.id.includes(searchTerm) ||
          item.reason.includes(searchTerm)
        );
      case 'deductions':
        return deductions.filter(item => 
          item.workerName.includes(searchTerm) || 
          item.id.includes(searchTerm) ||
          item.reason.includes(searchTerm)
        );
      case 'overtime':
        return overtimeLogs.filter(item => 
          item.workerName.includes(searchTerm) || 
          item.id.includes(searchTerm) ||
          (item.description && item.description.includes(searchTerm))
        );
      default:
        return [];
    }
  }, [activeSubTab, advances, bonuses, deductions, overtimeLogs, searchTerm]);

  return (
    <div className="space-y-6" id="transactions-tab">
      
      {/* Subtabs and top buttons */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4" id="transactions-header">
        
        {/* Navigation Buttons inside Subtab */}
        <div className="bg-slate-950 border border-slate-800 rounded-2xl p-1 flex gap-1 overflow-x-auto" id="subtab-pills">
          <button
            onClick={() => { setActiveSubTab('advances'); setSearchTerm(''); }}
            className={`py-2 px-4 rounded-xl text-xs font-bold leading-none flex items-center gap-2 transition-all shrink-0 cursor-pointer ${activeSubTab === 'advances' ? 'bg-amber-500 text-slate-950' : 'text-slate-400 hover:text-slate-200'}`}
          >
            <HandCoins className="w-4 h-4" />
            <span>السلف النقدية والقروض</span>
          </button>
          
          <button
            onClick={() => { setActiveSubTab('bonuses'); setSearchTerm(''); }}
            className={`py-2 px-4 rounded-xl text-xs font-bold leading-none flex items-center gap-2 transition-all shrink-0 cursor-pointer ${activeSubTab === 'bonuses' ? 'bg-emerald-500 text-slate-950' : 'text-slate-400 hover:text-slate-200'}`}
          >
            <Gift className="w-4 h-4" />
            <span>المكافآت والبدلات</span>
          </button>

          <button
            onClick={() => { setActiveSubTab('deductions'); setSearchTerm(''); }}
            className={`py-2 px-4 rounded-xl text-xs font-bold leading-none flex items-center gap-2 transition-all shrink-0 cursor-pointer ${activeSubTab === 'deductions' ? 'bg-rose-500 text-white' : 'text-slate-400 hover:text-slate-200'}`}
          >
            <AlertTriangle className="w-4 h-4" />
            <span>الخصومات والجزاءات</span>
          </button>

          <button
            onClick={() => { setActiveSubTab('overtime'); setSearchTerm(''); }}
            className={`py-2 px-4 rounded-xl text-xs font-bold leading-none flex items-center gap-2 transition-all shrink-0 cursor-pointer ${activeSubTab === 'overtime' ? 'bg-blue-500 text-slate-950' : 'text-slate-400 hover:text-slate-200'}`}
          >
            <Clock className="w-4 h-4" />
            <span>سجل ساعات الإضافي</span>
          </button>
        </div>

        {/* Create action button */}
        <button
          onClick={handleOpenForm}
          disabled={activeWorkers.length === 0}
          className={`py-2.5 px-4 rounded-xl text-xs font-black flex items-center justify-center gap-1.5 cursor-pointer shadow-lg active:scale-95 transition-all self-start md:self-auto ${
            activeSubTab === 'advances' ? 'bg-amber-500 text-slate-950 hover:bg-amber-400' :
            activeSubTab === 'bonuses' ? 'bg-emerald-500 text-slate-950 hover:bg-emerald-400' :
            activeSubTab === 'deductions' ? 'bg-rose-500 text-white hover:bg-rose-450' :
            'bg-blue-500 text-slate-950 hover:bg-blue-400'
          }`}
        >
          <Plus className="w-4.5 h-4.5" />
          <span>
            {activeSubTab === 'advances' && 'قيد سلفة جديدة'}
            {activeSubTab === 'bonuses' && 'تسجيل مكافأة / بدل'}
            {activeSubTab === 'deductions' && 'تطبيق خصم وغياب'}
            {activeSubTab === 'overtime' && 'إضافة ساعات أوفرتايم'}
          </span>
        </button>

      </div>

      {/* Filter / Search Bar */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 flex items-center relative" id="search-bar-trans">
        <span className="absolute right-7 text-slate-500">
          <Search className="w-4 h-4" />
        </span>
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder={`البحث في سجل ${activeSubTab === 'advances' ? 'السلف' : activeSubTab === 'bonuses' ? 'المكافآت' : activeSubTab === 'deductions' ? 'الخصومات' : 'العمل الإضافي'} بالاسم أو رمز السند...`}
          className="w-full bg-slate-950/70 border border-slate-800 rounded-xl py-2.5 pr-10 pl-3 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-500"
          id="trans-search-input"
        />
      </div>

      {/* Main Table Panel depending on activeSubTab */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-md" id="trans-table-wrap">
        <div className="overflow-x-auto">
          {datasetForList.length === 0 ? (
            <div className="py-12 text-center text-slate-550 text-xs italic">
              السجل فارغ تماماً حالياً! لا توجد قيود للمعالجة.
            </div>
          ) : (
            <table className="w-full text-right text-xs">
              
              {/* Advances Table rendering */}
              {activeSubTab === 'advances' && (
                <>
                  <thead>
                    <tr className="bg-slate-950/40 border-b border-slate-800 text-slate-400">
                      <th className="py-3 px-4">رقم السند</th>
                      <th className="py-3 px-4">اسم العامل المقيد</th>
                      <th className="py-3 px-4">تاريخ السداد/القيد</th>
                      <th className="py-3 px-4">تفاصيل ونوع السلفة</th>
                      <th className="py-3 px-4">المبلغ الأصلي</th>
                      <th className="py-3 px-4 text-red-400">المتبقي للـسداد</th>
                      <th className="py-3 px-4">الحالة</th>
                      <th className="py-3 px-4 text-center">خيارات سداد جزئي أو حذف</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-850">
                    {datasetForList.map((adv: any) => {
                      const pctSettle = Math.round(((adv.amount - adv.remainingAmount) / adv.amount) * 100);
                      return (
                        <tr key={adv.id} className="hover:bg-slate-850/20 text-slate-350">
                          <td className="py-3.5 px-4 font-mono font-bold text-[10px] text-amber-500">{adv.id}</td>
                          <td className="py-3.5 px-4 font-bold text-white text-sm">{adv.workerName}</td>
                          <td className="py-3.5 px-4 font-mono text-slate-400 text-xs">{adv.date}</td>
                          <td className="py-3.5 px-4">{adv.description}</td>
                          <td className="py-3.5 px-4 text-white font-semibold">{adv.amount} {settings.currency}</td>
                          <td className="py-3.5 px-4 font-black text-red-400 text-sm">{adv.remainingAmount} {settings.currency}</td>
                          <td className="py-3.5 px-4">
                            {adv.remainingAmount === 0 ? (
                              <span className="px-2 py-0.5 rounded-full text-[9px] font-bold bg-emerald-950/60 border border-emerald-900 text-emerald-400">مسددة بالكامل</span>
                            ) : adv.remainingAmount === adv.amount ? (
                              <span className="px-2 py-0.5 rounded-full text-[9px] font-bold bg-red-950/60 border border-red-900 text-red-400">معلقة</span>
                            ) : (
                              <span className="px-2 py-0.5 rounded-full text-[9px] font-bold bg-amber-950/60 border border-amber-900 text-amber-400">سُدد %{pctSettle}</span>
                            )}
                          </td>
                          <td className="py-3.5 px-4 text-center">
                            <div className="flex items-center justify-center gap-2">
                              {adv.remainingAmount > 0 && (
                                <button
                                  onClick={() => checkSettleAdvance(adv)}
                                  className="py-1 px-2.5 bg-slate-950 hover:bg-slate-800 border border-slate-800 hover:border-slate-750 text-amber-400 hover:text-amber-300 rounded-lg text-[10px] font-black cursor-pointer transition-colors"
                                >
                                  تسديد نقدي
                                </button>
                              )}
                              <button
                                onClick={() => { if (confirm('هل ترغب بحذف سند السلفة هذا بالكامل؟')) onDeleteAdvance(adv.id); }}
                                className="p-1.5 bg-slate-950 hover:bg-red-950/40 text-slate-500 hover:text-red-400 border border-slate-850 hover:border-red-900/60 rounded-lg cursor-pointer transition-colors"
                                title="إزالة قيد السلفة"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </>
              )}

              {/* Bonuses Table rendering */}
              {activeSubTab === 'bonuses' && (
                <>
                  <thead>
                    <tr className="bg-slate-950/40 border-b border-slate-800 text-slate-400">
                      <th className="py-3 px-4">رقم القيد</th>
                      <th className="py-3 px-4">اسم العامل المستحق</th>
                      <th className="py-3 px-4">التاريخ الفعلي</th>
                      <th className="py-3 px-4">النوع</th>
                      <th className="py-3 px-4">السبب والبيان المحاسبي</th>
                      <th className="py-3 px-4 text-emerald-400">المبلغ الإضافي</th>
                      <th className="py-3 px-4 text-center">خيارات حذف</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-850">
                    {datasetForList.map((bonus: any) => (
                      <tr key={bonus.id} className="hover:bg-slate-850/20 text-slate-350">
                        <td className="py-3.5 px-4 font-mono font-bold text-[10px] text-emerald-400">{bonus.id}</td>
                        <td className="py-3.5 px-4 font-bold text-white text-sm">{bonus.workerName}</td>
                        <td className="py-3.5 px-4 font-mono text-slate-400 text-xs">{bonus.date}</td>
                        <td className="py-3.5 px-4">
                          <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold border ${bonus.type === 'allowance' ? 'bg-indigo-950/80 border-indigo-900/50 text-indigo-300' : bonus.type === 'commission' ? 'bg-amber-950/80 border-amber-900/50 text-amber-300' : 'bg-emerald-950/80 border-emerald-900/50 text-emerald-300'}`}>
                            {bonus.type === 'allowance' ? 'بدل انتقال/سكن' : bonus.type === 'commission' ? 'عمولة إنجاز كفاءة' : 'حافز أداء'}
                          </span>
                        </td>
                        <td className="py-3.5 px-4">{bonus.reason}</td>
                        <td className="py-3.5 px-4 font-black text-emerald-400 text-sm">+{bonus.amount} {settings.currency}</td>
                        <td className="py-3.5 px-4 text-center">
                          <button
                            onClick={() => { if (confirm('حذف قيد هذه المكافأة نهائياً؟')) onDeleteBonus(bonus.id); }}
                            className="p-1.5 bg-slate-950 hover:bg-red-950/40 text-slate-500 hover:text-red-400 border border-slate-850 hover:border-red-900/60 rounded-lg cursor-pointer transition-colors"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </>
              )}

              {/* Deductions Table rendering */}
              {activeSubTab === 'deductions' && (
                <>
                  <thead>
                    <tr className="bg-slate-950/40 border-b border-slate-800 text-slate-400">
                      <th className="py-3 px-4">رقم القيد</th>
                      <th className="py-3 px-4">اسم الموظف المخصوم عليه</th>
                      <th className="py-3 px-4">تاريخ الخصم</th>
                      <th className="py-3 px-4">النوع</th>
                      <th className="py-3 px-4">سبب الخصم والغياب</th>
                      <th className="py-3 px-4 text-red-400">القيمة المخصومة</th>
                      <th className="py-3 px-4 text-center">خيارات حذف</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-850">
                    {datasetForList.map((ded: any) => (
                      <tr key={ded.id} className="hover:bg-slate-850/20 text-slate-350">
                        <td className="py-3.5 px-4 font-mono font-bold text-[10px] text-rose-450">{ded.id}</td>
                        <td className="py-3.5 px-4 font-bold text-white text-sm">{ded.workerName}</td>
                        <td className="py-3.5 px-4 font-mono text-slate-400 text-xs">{ded.date}</td>
                        <td className="py-3.5 px-4">
                          <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold border ${ded.type === 'attendance' ? 'bg-amber-950/80 border-amber-900/50 text-amber-300' : 'bg-red-950/80 border-red-900/50 text-red-300'}`}>
                            {ded.type === 'attendance' ? 'حضور وغياب وتأخير' : 'عقوبة ومخالفة إدارية'}
                          </span>
                        </td>
                        <td className="py-3.5 px-4">{ded.reason}</td>
                        <td className="py-3.5 px-4 font-black text-red-400 text-sm">-{ded.amount} {settings.currency}</td>
                        <td className="py-3.5 px-4 text-center">
                          <button
                            onClick={() => { if (confirm('حذف قيد الخصم نهائياً من سجل الموظف؟')) onDeleteDeduction(ded.id); }}
                            className="p-1.5 bg-slate-950 hover:bg-red-950/40 text-slate-500 hover:text-red-400 border border-slate-850 hover:border-red-900/60 rounded-lg cursor-pointer transition-colors"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </>
              )}

              {/* Overtime Table rendering */}
              {activeSubTab === 'overtime' && (
                <>
                  <thead>
                    <tr className="bg-slate-950/40 border-b border-slate-800 text-slate-400">
                      <th className="py-3 px-4">رقم القيد</th>
                      <th className="py-3 px-4">اسم العامل المكلف</th>
                      <th className="py-3 px-4">تاريخ الإضافي</th>
                      <th className="py-3 px-4">عدد الساعات الإضافية</th>
                      <th className="py-3 px-4">المعامل الضربي</th>
                      <th className="py-3 px-4">البيان والمهام المنجزة</th>
                      <th className="py-3 px-4 text-blue-400">علاوة الإضافي المالي</th>
                      <th className="py-3 px-4 text-center">خيارات حذف</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-850">
                    {datasetForList.map((ovt: any) => {
                      // Calculate the numeric amount from worker base overtime rate
                      const workerObj = workers.find(w => w.id === ovt.workerId);
                      const rate = workerObj ? workerObj.hourlyOvertimeRate : 0;
                      const overtimeCashVal = (ovt.hours * rate * ovt.multiplier);
                      return (
                        <tr key={ovt.id} className="hover:bg-slate-850/20 text-slate-350">
                          <td className="py-3.5 px-4 font-mono font-bold text-[10px] text-blue-400">{ovt.id}</td>
                          <td className="py-3.5 px-4 font-bold text-white text-sm">{ovt.workerName}</td>
                          <td className="py-3.5 px-4 font-mono text-slate-400 text-xs">{ovt.date}</td>
                          <td className="py-3.5 px-4 font-mono font-bold text-sm text-slate-100">{ovt.hours} ساعة إضافية</td>
                          <td className="py-3.5 px-4 font-mono text-slate-400">x{ovt.multiplier}</td>
                          <td className="py-3.5 px-4">{ovt.description || 'عمل إضافي متفرق'}</td>
                          <td className="py-3.5 px-4 font-black text-blue-400 text-sm">
                            +{overtimeCashVal} {settings.currency}{' '}
                            <span className="text-[9px] text-slate-500 font-normal">({rate}/ساعة)</span>
                          </td>
                          <td className="py-3.5 px-4 text-center">
                            <button
                              onClick={() => { if (confirm('هل ترغب بإلغاء ساعات هذا الإضافي؟')) onDeleteOvertime(ovt.id); }}
                              className="p-1.5 bg-slate-950 hover:bg-red-950/40 text-slate-500 hover:text-red-400 border border-slate-850 hover:border-red-900/60 rounded-lg cursor-pointer transition-colors"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </>
              )}

            </table>
          )}
        </div>
      </div>

      {/* Manual Settle Advance Dialog */}
      {settleAdvanceId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm" id="settle-adv-modal">
          <div className="bg-slate-900 border border-slate-800 max-w-sm w-full rounded-2xl overflow-hidden p-6 text-right space-y-4">
            <h4 className="text-sm font-black text-white flex items-center gap-1.5">
              <HandCoins className="w-5 h-5 text-amber-500" />
              <span>تسجيل سداد نقدي خارجي للسلفة</span>
            </h4>
            <p className="text-xs text-slate-400 leading-normal">
              هل قام العامل بتسليم دفعة مالية بقيمة السلفة لتنزيليها يدوياً من حسابه خارج مسير الرواتب؟ حدد القيمة:
            </p>
            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-slate-300">مبلغ السداد المستلم ({settings.currency})</label>
              <input
                type="number"
                value={settleAmount}
                onChange={(e) => setSettleAmount(Number(e.target.value))}
                min={1}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl py-2 px-3 text-sm text-white font-mono text-center focus:outline-none focus:border-amber-500"
              />
            </div>
            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setSettleAdvanceId(null)}
                className="py-1.5 px-4 bg-slate-950 hover:bg-slate-800 border border-slate-800 text-slate-300 rounded-xl text-xs font-semibold cursor-pointer"
              >
                تراجع
              </button>
              <button
                onClick={handleConfirmSettle}
                className="py-1.5 px-4 bg-amber-500 hover:bg-amber-400 text-slate-950 font-black rounded-xl text-xs cursor-pointer shadow-md"
              >
                تأكيد وباقي الحساب
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Dynamic Master Adding Form Component */}
      {isFormOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm" id="trans-master-modal">
          <div className="bg-slate-900 border border-slate-800 w-full max-w-md rounded-2xl overflow-hidden shadow-2xl p-6 text-right space-y-5">
            
            <div className="flex items-center justify-between border-b border-slate-850 pb-3">
              <h3 className="text-sm font-bold text-white flex items-center gap-1.5">
                {activeSubTab === 'advances' && <HandCoins className="w-4.5 h-4.5 text-amber-500" />}
                {activeSubTab === 'bonuses' && <Gift className="w-4.5 h-4.5 text-emerald-400" />}
                {activeSubTab === 'deductions' && <AlertTriangle className="w-4.5 h-4.5 text-rose-500" />}
                {activeSubTab === 'overtime' && <Clock className="w-4.5 h-4.5 text-blue-400" />}
                <span>
                  {activeSubTab === 'advances' && 'تقييد سلفة مالية جديدة'}
                  {activeSubTab === 'bonuses' && 'تقييد مكافأة وحافز مالي'}
                  {activeSubTab === 'deductions' && 'تقييد غياب أو جزاء مالي'}
                  {activeSubTab === 'overtime' && 'قيد ساعات عمل إضافي للعمال'}
                </span>
              </h3>
              <button onClick={() => setIsFormOpen(false)} className="p-1 hover:bg-slate-800 rounded-full text-slate-400 transition-colors cursor-pointer">
                <Plus className="w-4.5 h-4.5 rotate-45" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              
              {/* Select worker */}
              <div className="space-y-1">
                <label className="block text-xs font-bold text-slate-300">اسم العامل المنسوب له القيد *</label>
                <select
                  value={selectedWorkerId}
                  onChange={(e) => setSelectedWorkerId(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl py-2.5 px-3 text-xs text-slate-200 focus:outline-none focus:border-amber-500 font-sans"
                  required
                >
                  <option value="">-- اختر عامل من قائمة النشطين --</option>
                  {activeWorkers.map(w => (
                    <option key={w.id} value={w.id}>{w.name} ({w.jobTitle} - {w.department})</option>
                  ))}
                </select>
              </div>

              {/* Amount / Hours block */}
              {activeSubTab !== 'overtime' ? (
                <div className="space-y-1">
                  <label className="block text-xs font-bold text-slate-300">القيمة والكمية المالية بالعملة ({settings.currency}) *</label>
                  <input
                    type="number"
                    value={amountInput}
                    onChange={(e) => setAmountInput(Number(e.target.value))}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl py-2 px-3 text-sm text-white font-mono"
                    required
                    min={1}
                  />
                </div>
              ) : (
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="block text-xs font-bold text-slate-300">عدد الساعات الإضافية *</label>
                    <input
                      type="number"
                      value={hoursInput}
                      onChange={(e) => setHoursInput(Number(e.target.value))}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl py-2 px-3 text-xs text-white font-mono"
                      required
                      min={0.5}
                      step={0.5}
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="block text-xs font-bold text-slate-300">معامل الساعة (الضربي) *</label>
                    <select
                      value={multiplierInput}
                      onChange={(e) => setMultiplierInput(Number(e.target.value))}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl py-2 px-2.5 text-xs text-slate-350 font-mono"
                    >
                      <option value="1.5">x1.5 (عادي مسائي)</option>
                      <option value="2.0">x2.0 (أيام العطل ومناوبات)</option>
                      <option value="1.25">x1.25 (صباحي تكميلي)</option>
                    </select>
                  </div>
                </div>
              )}

              {/* Dynamic types select for bonus & deductions */}
              {activeSubTab === 'bonuses' && (
                <div className="space-y-1">
                  <label className="block text-xs font-bold text-slate-300">نوع البدل أو المكافأة</label>
                  <select
                    value={typeSelect}
                    onChange={(e) => setTypeSelect(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl py-2 px-3 text-xs text-slate-300"
                  >
                    <option value="reward">مكافأة أداء وتشجيع</option>
                    <option value="allowance">بدل انتقال/سكن أو تواصل</option>
                    <option value="commission">عمولة إنتاجية أو نسبة أعمال</option>
                  </select>
                </div>
              )}

              {activeSubTab === 'deductions' && (
                <div className="space-y-1">
                  <label className="block text-xs font-bold text-slate-300">نوع الخصم من الراتب</label>
                  <select
                    value={typeSelect}
                    onChange={(e) => setTypeSelect(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl py-2 px-3 text-xs text-slate-300"
                  >
                    <option value="attendance">حضور وغياب (غياب، تأخر، خروج مبكر)</option>
                    <option value="penalty">عقوبة وجزاءات إدارية (مخالفة سلوك أو تلف أدوات)</option>
                    <option value="other">خصم آخر متفرق بالمطابقة</option>
                  </select>
                </div>
              )}

              {/* Date */}
              <div className="space-y-1 border-t border-slate-850 pt-2">
                <label className="block text-xs font-bold text-slate-300">تاريخ المعاملة المعتمد</label>
                <input
                  type="date"
                  value={dateInput}
                  onChange={(e) => setDateInput(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl py-2 px-3 text-xs text-slate-200 font-mono"
                  required
                />
              </div>

              {/* Reason / Bio */}
              <div className="space-y-1">
                <label className="block text-xs font-bold text-slate-300">البيان وسبب المعاملة المحاسبية</label>
                <textarea
                  value={reasonInput}
                  onChange={(e) => setReasonInput(e.target.value)}
                  placeholder="دوّن تفاصيل المعاملة للرجوع إليها لاحقاً..."
                  rows={2}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl py-2 px-3 text-xs text-white placeholder-slate-650 resize-none focus:outline-none focus:border-amber-500"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-2 border-t border-slate-850">
                <button
                  type="button"
                  onClick={() => setIsFormOpen(false)}
                  className="py-1.5 px-4 bg-slate-950 hover:bg-slate-850 border border-slate-800 text-slate-300 rounded-xl text-xs font-bold cursor-pointer transition-colors"
                >
                  إلغاء التراجع
                </button>
                <button
                  type="submit"
                  className={`py-1.5 px-5 font-black text-slate-950 rounded-xl text-xs cursor-pointer shadow-md transition-all ${
                    activeSubTab === 'advances' ? 'bg-amber-500 hover:bg-amber-400' :
                    activeSubTab === 'bonuses' ? 'bg-emerald-500 hover:bg-emerald-400' :
                    activeSubTab === 'deductions' ? 'bg-rose-500 text-white hover:bg-rose-450' :
                    'bg-blue-500 hover:bg-blue-400'
                  }`}
                >
                  حقن وتقييد السند
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

    </div>
  );
}
