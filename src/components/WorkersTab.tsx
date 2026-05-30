/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Users, 
  Search, 
  UserPlus, 
  Edit, 
  UserX, 
  UserCheck, 
  Phone, 
  MapPin, 
  CreditCard, 
  Building, 
  Calendar,
  DollarSign,
  IdCard,
  FileSpreadsheet,
  X,
  Plus,
  Trash2,
  HandCoins,
  Gift,
  Clock,
  Printer,
  ShieldCheck,
  TrendingDown,
  Eye
} from 'lucide-react';
import { Worker, Advance, Bonus, Deduction, OvertimeLog, SystemSettings } from '../types';

interface WorkersTabProps {
  workers: Worker[];
  advances: Advance[];
  bonuses: Bonus[];
  deductions: Deduction[];
  overtimeLogs: OvertimeLog[];
  settings: SystemSettings;
  onAddWorker: (worker: Worker) => void;
  onUpdateWorker: (worker: Worker) => void;
  onDeleteWorker: (id: string) => void;
}

export default function WorkersTab({
  workers,
  advances,
  bonuses,
  deductions,
  overtimeLogs,
  settings,
  onAddWorker,
  onUpdateWorker,
  onDeleteWorker
}: WorkersTabProps) {
  
  // Local states
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDept, setSelectedDept] = useState('all');
  const [selectedType, setSelectedType] = useState('all');
  const [selectedStatus, setSelectedStatus] = useState('all');
  
  const [editingWorker, setEditingWorker] = useState<Worker | null>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [activeLedgerWorker, setActiveLedgerWorker] = useState<Worker | null>(null);
  const [workerToDelete, setWorkerToDelete] = useState<Worker | null>(null);

  // New worker state template
  const [formName, setFormName] = useState('');
  const [formJob, setFormJob] = useState('');
  const [formDept, setFormDept] = useState('');
  const [formSalaryType, setFormSalaryType] = useState<'monthly' | 'daily' | 'hourly'>('monthly');
  const [formBaseSalary, setFormBaseSalary] = useState<number>(3000);
  const [formOvertimeRate, setFormOvertimeRate] = useState<number>(30);
  const [formPhone, setFormPhone] = useState('');
  const [formNationalId, setFormNationalId] = useState('');
  const [formJoinDate, setFormJoinDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [formBankAccount, setFormBankAccount] = useState('نقدي - يدوي');
  const [formCurrency, setFormCurrency] = useState('');
  const [currencySelectMode, setCurrencySelectMode] = useState<string>('custom');
  
  const standardCurrencies = useMemo(() => ['ريال يمني', 'ريال سعودي', 'دولار أمريكي', 'درهم إماراتي'], []);

  // Load all unique departments for filters
  const departmentsList = useMemo(() => {
    const depts = new Set<string>();
    workers.forEach(w => { if (w.department) depts.add(w.department); });
    return Array.from(depts);
  }, [workers]);

  // Open form for adding worker
  const handleOpenAddForm = () => {
    setEditingWorker(null);
    setFormName('');
    setFormJob('');
    setFormDept('الإنشاءات والمقاولات');
    setFormSalaryType('monthly');
    setFormBaseSalary(3000);
    setFormOvertimeRate(30);
    setFormPhone('');
    setFormNationalId('');
    setFormJoinDate(new Date().toISOString().split('T')[0]);
    setFormBankAccount('نقدي - يدوي');
    setFormCurrency(settings.currency);
    setCurrencySelectMode(standardCurrencies.includes(settings.currency) ? settings.currency : 'custom');
    setIsFormOpen(true);
  };

  // Open form for editing worker
  const handleOpenEditForm = (worker: Worker) => {
    setEditingWorker(worker);
    setFormName(worker.name);
    setFormJob(worker.jobTitle);
    setFormDept(worker.department);
    setFormSalaryType(worker.salaryType);
    setFormBaseSalary(worker.baseSalary);
    setFormOvertimeRate(worker.hourlyOvertimeRate);
    setFormPhone(worker.phone);
    setFormNationalId(worker.nationalId);
    setFormJoinDate(worker.joiningDate);
    setFormBankAccount(worker.bankAccount || 'نقدي - يدوي');
    const workerCurrency = worker.currency || settings.currency;
    setFormCurrency(workerCurrency);
    setCurrencySelectMode(standardCurrencies.includes(workerCurrency) ? workerCurrency : 'custom');
    setIsFormOpen(true);
  };

  // Handle Form Submission
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formName.trim() || !formJob.trim() || !formDept.trim()) {
      alert('الرجاء إدخال الحقول الأساسية: الاسم، المسمى والوظيفة، والقسم');
      return;
    }

    const workerPayload: Worker = {
      id: editingWorker ? editingWorker.id : `W-${Math.floor(1000 + Math.random() * 9000)}`,
      name: formName.trim(),
      jobTitle: formJob.trim(),
      department: formDept.trim(),
      salaryType: formSalaryType,
      baseSalary: Number(formBaseSalary) || 0,
      hourlyOvertimeRate: Number(formOvertimeRate) || 0,
      phone: formPhone.trim(),
      nationalId: formNationalId.trim(),
      joiningDate: formJoinDate,
      status: editingWorker ? editingWorker.status : 'active',
      bankAccount: formBankAccount.trim(),
      currency: formCurrency || settings.currency
    };

    if (editingWorker) {
      onUpdateWorker(workerPayload);
    } else {
      onAddWorker(workerPayload);
    }
    
    setIsFormOpen(false);
  };

  // Toggle state
  const handleToggleStatus = (worker: Worker) => {
    const updated: Worker = {
      ...worker,
      status: worker.status === 'active' ? 'suspended' : 'active'
    };
    onUpdateWorker(updated);
  };

  // Filter workers based on controls
  const filteredWorkers = useMemo(() => {
    return workers.filter((worker) => {
      const matchSearch = 
        worker.name.includes(searchTerm) || 
        worker.jobTitle.includes(searchTerm) || 
        worker.id.includes(searchTerm) || 
        worker.nationalId.includes(searchTerm);
      
      const matchDept = selectedDept === 'all' || worker.department === selectedDept;
      const matchType = selectedType === 'all' || worker.salaryType === selectedType;
      const matchStatus = selectedStatus === 'all' || worker.status === selectedStatus;

      return matchSearch && matchDept && matchType && matchStatus;
    });
  }, [workers, searchTerm, selectedDept, selectedType, selectedStatus]);

  // Aggregate stats of selected worker for ledger
  const workerLedgerStats = useMemo(() => {
    if (!activeLedgerWorker) return null;
    const id = activeLedgerWorker.id;
    
    const workerAdvances = advances.filter(a => a.workerId === id);
    const workerBonuses = bonuses.filter(b => b.workerId === id);
    const workerDeductions = deductions.filter(d => d.workerId === id);
    const workerOvertimes = overtimeLogs.filter(o => o.workerId === id);

    const totalLoans = workerAdvances.reduce((sum, a) => sum + a.amount, 0);
    const unpaidLoans = workerAdvances.reduce((sum, a) => sum + a.remainingAmount, 0);
    const paidLoans = totalLoans - unpaidLoans;
    
    const totalAddedBonuses = workerBonuses.reduce((sum, b) => sum + b.amount, 0);
    const totalSubDeductions = workerDeductions.reduce((sum, d) => sum + d.amount, 0);
    
    const overtimeHours = workerOvertimes.reduce((sum, o) => sum + o.hours, 0);
    const overtimeCash = workerOvertimes.reduce((sum, o) => sum + (o.hours * activeLedgerWorker.hourlyOvertimeRate * o.multiplier), 0);

    return {
      advances: workerAdvances,
      bonuses: workerBonuses,
      deductions: workerDeductions,
      overtimes: workerOvertimes,
      totalLoans,
      unpaidLoans,
      paidLoans,
      totalAddedBonuses,
      totalSubDeductions,
      overtimeHours,
      overtimeCash
    };
  }, [activeLedgerWorker, advances, bonuses, deductions, overtimeLogs]);

  return (
    <div className="space-y-6" id="workers-panel">
      
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4" id="workers-header-controls">
        <div>
          <h2 className="text-lg font-black text-white flex items-center gap-2">
            <Users className="w-5 h-5 text-amber-500" />
            <span>تنظيم ملفات عمال المؤسسة ودفاتر الحسابات</span>
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            البحث عن العمال، تغيير عقود الراتب، تعطيل عمال مؤقتاً ومراجعة سجل كشف الحساب والديون التفصيلي لكل عامل.
          </p>
        </div>

        <button
          onClick={handleOpenAddForm}
          className="py-3 px-5 bg-gradient-to-r from-amber-500 to-yellow-600 hover:from-amber-400 hover:to-yellow-500 text-slate-950 font-black rounded-xl text-xs flex items-center justify-center gap-2 transition-all cursor-pointer shadow-lg self-start sm:self-auto"
          id="add-worker-drawer-btn"
        >
          <UserPlus className="w-4.5 h-4.5 text-slate-950" />
          <span>إلحاق عامل جديد</span>
        </button>
      </div>

      {/* Filter and Search Box */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3" id="filters-container">
        
        {/* Search */}
        <div className="relative lg:col-span-2">
          <span className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500">
            <Search className="w-4 h-4" />
          </span>
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="ابحث بالاسم، رقم الهوية أو الكود..."
            className="w-full bg-slate-950/65 border border-slate-800/80 rounded-xl py-2.5 pr-9 pl-3 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-500 transition-all"
            id="worker-search-input"
          />
        </div>

        {/* Dept filter */}
        <select
          value={selectedDept}
          onChange={(e) => setSelectedDept(e.target.value)}
          className="bg-slate-950/65 border border-slate-800/80 rounded-xl py-2.5 px-3 text-xs text-slate-300 focus:outline-none focus:border-amber-500"
          id="filter-dept"
        >
          <option value="all">كل الأقسام الإدارية والإنتاجية</option>
          {departmentsList.map(dept => (
            <option key={dept} value={dept}>{dept}</option>
          ))}
        </select>

        {/* Type filter */}
        <select
          value={selectedType}
          onChange={(e) => setSelectedType(e.target.value)}
          className="bg-slate-950/65 border border-slate-800/80 rounded-xl py-2.5 px-3 text-xs text-slate-300 focus:outline-none focus:border-amber-500"
          id="filter-type"
        >
          <option value="all">كل طرق احتساب الأجر</option>
          <option value="monthly">براتب شهري ثابت</option>
          <option value="daily">بيوميات مستقلة (يومي)</option>
          <option value="hourly">محتسب بالساعة (ساعي)</option>
        </select>

        {/* Status filter */}
        <select
          value={selectedStatus}
          onChange={(e) => setSelectedStatus(e.target.value)}
          className="bg-slate-950/65 border border-slate-800/80 rounded-xl py-2.5 px-3 text-xs text-slate-300 focus:outline-none focus:border-amber-500"
          id="filter-status"
        >
          <option value="all">كل حالات النشاط</option>
          <option value="active">نشط بالخدمة</option>
          <option value="suspended">موقوف مؤقتاً</option>
        </select>

      </div>

      {/* Workers main Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-md" id="workers-table-container">
        <div className="overflow-x-auto">
          {filteredWorkers.length === 0 ? (
            <div className="py-12 text-center text-slate-500 text-xs italic">
              لا توجد نتائج مطابقة لمعايير البحث والتصفية المختارة.
            </div>
          ) : (
            <table className="w-full text-right text-xs">
              <thead>
                <tr className="bg-slate-950/40 border-b border-slate-800 text-slate-400">
                  <th className="py-3 px-4">كود العامل</th>
                  <th className="py-3 px-4">اسم العامل</th>
                  <th className="py-3 px-4">القسم والوظيفة</th>
                  <th className="py-3 px-4">الأجر الأساسي العقد</th>
                  <th className="py-3 px-4">ساعة الإضافي</th>
                  <th className="py-3 px-4">رقم الجوال وبطاقة الهوية</th>
                  <th className="py-3 px-4">الحالة</th>
                  <th className="py-3 px-4 text-center">الإجراءات والبيانات</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-850">
                {filteredWorkers.map((worker) => (
                  <tr 
                    key={worker.id} 
                    className={`hover:bg-slate-850/30 transition-colors ${worker.status === 'suspended' ? 'opacity-65 bg-slate-950/10' : ''}`}
                    id={`row-${worker.id}`}
                  >
                    <td className="py-3.5 px-4 font-mono text-[10px] text-amber-500">{worker.id}</td>
                    <td className="py-3.5 px-4">
                      <div className="font-bold text-white text-sm">{worker.name}</div>
                      <div className="text-[10px] text-slate-500">تاريخ الانضمام: {worker.joiningDate}</div>
                    </td>
                    <td className="py-3.5 px-4">
                      <span className="text-xs text-slate-200 block">{worker.jobTitle}</span>
                      <span className="text-[10px] text-slate-400 font-bold bg-slate-950/50 border border-slate-850 px-2 py-0.5 rounded-md inline-block mt-0.5">{worker.department}</span>
                    </td>
                    <td className="py-3.5 px-4">
                      <span className="font-mono text-sm font-semibold text-white">
                        {worker.baseSalary}
                      </span>{' '}
                      <span className="text-[10px] text-slate-400">
                        {worker.currency || settings.currency} / {worker.salaryType === 'monthly' ? 'شهري' : worker.salaryType === 'daily' ? 'يومي' : 'ساعة'}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-slate-400 font-mono text-xs">
                      {worker.hourlyOvertimeRate} {worker.currency || settings.currency}
                    </td>
                    <td className="py-3.5 px-4 text-slate-400">
                      <div className="flex items-center gap-1 text-[10px]">
                        <Phone className="w-3 h-3 text-slate-500" />
                        <span>{worker.phone || 'بدون جوال'}</span>
                      </div>
                      <div className="text-[9px] font-mono mt-0.5">National ID: {worker.nationalId || 'بدون هوية'}</div>
                    </td>
                    <td className="py-3.5 px-4">
                      <button
                        onClick={() => handleToggleStatus(worker)}
                        className={`px-2.5 py-1 rounded-full text-[9px] font-bold border transition-all cursor-pointer flex items-center gap-1 ${
                          worker.status === 'active' 
                            ? 'bg-emerald-950/55 border-emerald-900/60 text-emerald-400 hover:bg-emerald-900/40' 
                            : 'bg-red-950/55 border-red-900/60 text-red-400 hover:bg-red-900/40'
                        }`}
                        title="انقر لتغيير حالة العامل الوظيفية"
                      >
                        {worker.status === 'active' ? (
                          <>
                            <UserCheck className="w-3.5 h-3.5" />
                            <span>نشط بالخدمة</span>
                          </>
                        ) : (
                          <>
                            <UserX className="w-3.5 h-3.5" />
                            <span>موقوف حالياً</span>
                          </>
                        )}
                      </button>
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="flex items-center justify-center gap-2">
                        <button
                          onClick={() => setActiveLedgerWorker(worker)}
                          className="py-1 px-2.5 bg-slate-950 hover:bg-slate-800 border border-slate-800 text-slate-300 hover:text-white rounded-lg text-[10px] font-semibold flex items-center gap-1 cursor-pointer transition-colors"
                          title="عرض كشف الحساب التفصيلي"
                          id={`ledger-${worker.id}`}
                        >
                          <FileSpreadsheet className="w-3.5 h-3.5 text-blue-400" />
                          <span>دفتر الأستاذ</span>
                        </button>

                        <button
                          onClick={() => handleOpenEditForm(worker)}
                          className="p-1.5 bg-slate-950 hover:bg-slate-800 border border-slate-800 hover:border-slate-700 text-slate-400 hover:text-white rounded-lg cursor-pointer transition-colors"
                          title="تعديل بيانات العامل وراتبه"
                          id={`edit-${worker.id}`}
                        >
                          <Edit className="w-3.5 h-3.5" />
                        </button>

                        <button
                          onClick={() => setWorkerToDelete(worker)}
                          className="p-1.5 bg-red-950/25 hover:bg-red-900 border border-red-900/40 hover:border-red-500 text-red-400 hover:text-white rounded-lg cursor-pointer transition-all duration-200 shadow-sm"
                          title="إزالة العامل نهائياً من النظام"
                          id={`delete-${worker.id}`}
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* Add/Edit Worker Drawer Modal */}
      <AnimatePresence>
        {isFormOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm" id="worker-form-modal">
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-slate-900 border border-slate-800 w-full max-w-2xl rounded-3xl overflow-hidden shadow-2xl flex flex-col"
              style={{ maxHeight: '90vh' }}
            >
              {/* Header */}
              <div className="bg-slate-950 border-b border-slate-850 px-6 py-4 flex items-center justify-between">
                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                  <UserPlus className="w-4.5 h-4.5 text-amber-500" />
                  <span>{editingWorker ? `تجهيز وثيقة تعديل الراتب للعامل: ${editingWorker.name}` : 'إلحاق وتسجيل ملف عامل جديد'}</span>
                </h3>
                <button
                  type="button"
                  onClick={() => setIsFormOpen(false)}
                  className="p-1 hover:bg-slate-800 rounded-full text-slate-400 hover:text-white transition-colors cursor-pointer"
                >
                  <X className="w-4.5 h-4.5" />
                </button>
              </div>

              {/* Form */}
              <form onSubmit={handleSubmit} className="p-6 md:p-8 overflow-y-auto space-y-5 text-right flex-1 scrollbar-thin">
                
                {/* Inputs Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  
                  {/* Name */}
                  <div className="space-y-1.5 col-span-1 md:col-span-2">
                    <label className="block text-xs font-bold text-slate-300">اسم العامل بالكامل (ثلاثي/رباعي) *</label>
                    <input
                      type="text"
                      value={formName}
                      onChange={(e) => setFormName(e.target.value)}
                      placeholder="أدخل الاسم الحقيقي الكامل للعامل"
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl py-2.5 px-3.5 text-xs text-white focus:outline-none focus:border-amber-500"
                      required
                    />
                  </div>

                  {/* Job title */}
                  <div className="space-y-1.5">
                    <label className="block text-xs font-bold text-slate-300">المسمى الوظيفي / المهنة الحرفية *</label>
                    <input
                      type="text"
                      value={formJob}
                      onChange={(e) => setFormJob(e.target.value)}
                      placeholder="مثال: عامل تشطيب، نجار مسلح، مهندس موقع"
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl py-2.5 px-3.5 text-xs text-white focus:outline-none focus:border-amber-500"
                      required
                    />
                  </div>

                  {/* Department */}
                  <div className="space-y-1.5">
                    <label className="block text-xs font-bold text-slate-300">القسم الإداري أو الورشة المخصصة *</label>
                    <input
                      type="text"
                      value={formDept}
                      onChange={(e) => setFormDept(e.target.value)}
                      placeholder="مثال: المعمار والخرسانة، الكهرباء والصيانة، الإدارة"
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl py-2.5 px-3.5 text-xs text-white focus:outline-none focus:border-amber-500"
                      required
                    />
                  </div>

                  {/* Salary type */}
                  <div className="space-y-1.5">
                    <label className="block text-xs font-bold text-slate-300">هيكل ونوع احتساب الراتب المالي *</label>
                    <select
                      value={formSalaryType}
                      onChange={(e) => setFormSalaryType(e.target.value as any)}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl py-2.5 px-3 text-xs text-slate-300 focus:outline-none focus:border-amber-500"
                    >
                      <option value="monthly">شهري ثابت (تحويل أو نقدي)</option>
                      <option value="daily">يومي مستقل (يوميات عمل)</option>
                      <option value="hourly">ساعي (أجر ساعات فعلي)</option>
                    </select>
                  </div>

                  {/* Worker Currency Selector */}
                  <div className="space-y-1.5 flex flex-col justify-end">
                    <label className="block text-xs font-bold text-slate-300">العملة المخصصة لهذا العامل *</label>
                    <select
                      value={currencySelectMode}
                      onChange={(e) => {
                        const val = e.target.value;
                        setCurrencySelectMode(val);
                        if (val === 'system') {
                          setFormCurrency(settings.currency);
                        } else if (val !== 'custom') {
                          setFormCurrency(val);
                        }
                      }}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl py-2.5 px-3 text-xs text-slate-300 focus:outline-none focus:border-amber-500"
                    >
                      <option value="system">العملة الافتراضية للنظام ({settings.currency})</option>
                      <option value="ريال يمني">ريال يمني</option>
                      <option value="ريال سعودي">ريال سعودي</option>
                      <option value="دولار أمريكي">دولار أمريكي</option>
                      <option value="درهم إماراتي">درهم إماراتي</option>
                      <option value="custom">عملة مخصصة أخرى...</option>
                    </select>

                    {currencySelectMode === 'custom' && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        className="mt-1"
                      >
                        <input
                          type="text"
                          value={formCurrency}
                          onChange={(e) => setFormCurrency(e.target.value)}
                          placeholder="اكتب رمز/اسم العملة (مثال: ريال، $، د.إ)"
                          className="w-full bg-slate-950 border border-slate-800 rounded-xl py-2 px-3.5 text-xs text-white focus:outline-none focus:border-amber-500"
                          required
                        />
                      </motion.div>
                    )}
                  </div>

                  {/* Base salary */}
                  <div className="space-y-1.5">
                    <label className="block text-xs font-bold text-slate-300">
                      قيمة راتب العقد الأساسي لليوم/الشهر/الساعة ({formCurrency || settings.currency}) *
                    </label>
                    <input
                      type="number"
                      value={formBaseSalary}
                      onChange={(e) => setFormBaseSalary(Number(e.target.value))}
                      placeholder="أدخل مبلغ المحاسبة المعتمد"
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl py-2.5 px-3.5 text-xs text-white focus:outline-none focus:border-amber-500 font-mono"
                      required
                      min={0}
                    />
                  </div>

                  {/* Overtime rate */}
                  <div className="space-y-1.5">
                    <label className="block text-xs font-bold text-slate-300">
                      أجر الساعة الإضافية العادية بالعمل ({formCurrency || settings.currency}/ساعة)
                    </label>
                    <input
                      type="number"
                      value={formOvertimeRate}
                      onChange={(e) => setFormOvertimeRate(Number(e.target.value))}
                      placeholder="أجر ساعة العمل الإضافية الافتراضية"
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl py-2.5 px-3.5 text-xs text-white focus:outline-none focus:border-amber-500 font-mono"
                      min={0}
                    />
                  </div>

                  {/* Join Date */}
                  <div className="space-y-1.5">
                    <label className="block text-xs font-bold text-slate-300">تاريخ إسباغ العقد والالتحاق بالموقع</label>
                    <input
                      type="date"
                      value={formJoinDate}
                      onChange={(e) => setFormJoinDate(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl py-2.5 px-3 text-xs text-slate-200 focus:outline-none focus:border-amber-500 font-mono"
                    />
                  </div>

                  {/* Phone */}
                  <div className="space-y-1.5">
                    <label className="block text-xs font-bold text-slate-300">رقم الهاتف الجوال</label>
                    <input
                      type="text"
                      value={formPhone}
                      onChange={(e) => setFormPhone(e.target.value)}
                      placeholder="مثال: 05XXXXXXXX"
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl py-2.5 px-3.5 text-xs text-white focus:outline-none focus:border-amber-500 font-mono"
                    />
                  </div>

                  {/* National ID */}
                  <div className="space-y-1.5">
                    <label className="block text-xs font-bold text-slate-300">رقم السجل المدني / بطاقة الإقامة</label>
                    <input
                      type="text"
                      value={formNationalId}
                      onChange={(e) => setFormNationalId(e.target.value)}
                      placeholder="مكون من 10 خانات"
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl py-2.5 px-3.5 text-xs text-white focus:outline-none focus:border-amber-500 font-mono"
                    />
                  </div>

                  {/* IBAN / Bank */}
                  <div className="space-y-1.5 col-span-1 md:col-span-2">
                    <label className="block text-xs font-bold text-slate-300">توجيه الصرف والآيبان البنكي (اختياري)</label>
                    <input
                      type="text"
                      value={formBankAccount}
                      onChange={(e) => setFormBankAccount(e.target.value)}
                      placeholder="أدخل الحساب البنكي آيبان SAXXXX، أو دعها نقدي يدوي"
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl py-2.5 px-3.5 text-xs text-white focus:outline-none focus:border-amber-500 font-mono text-right"
                    />
                  </div>

                </div>

                {/* Footer Buttons */}
                <div className="border-t border-slate-850 pt-5 mt-4 flex items-center justify-end gap-3">
                  {editingWorker && (
                    <button
                      type="button"
                      onClick={() => {
                        setWorkerToDelete(editingWorker);
                        setIsFormOpen(false);
                      }}
                      className="py-2.5 px-4 bg-red-950/20 hover:bg-red-950 border border-red-900/40 hover:border-red-500 text-red-400 font-bold rounded-xl text-xs cursor-pointer transition-all me-auto flex items-center gap-1.5"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      <span>حذف العامل نهائياً</span>
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={() => setIsFormOpen(false)}
                    className="py-2.5 px-5 bg-slate-950 hover:bg-slate-850 border border-slate-800 text-slate-300 rounded-xl text-xs font-bold cursor-pointer transition-all"
                  >
                    إلغاء التراجع
                  </button>
                  <button
                    type="submit"
                    className="py-2.5 px-6 bg-gradient-to-r from-amber-500 to-yellow-600 text-slate-950 font-black rounded-xl text-xs cursor-pointer hover:from-amber-400 transition-all shadow-md"
                  >
                    {editingWorker ? 'حفظ وتحديث العقد' : 'تسجيل العامل وبدء المحاسبة'}
                  </button>
                </div>

              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Worker Ledger Account View (دفتر الأستاذ للعامل) */}
      <AnimatePresence>
        {activeLedgerWorker && workerLedgerStats && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm" id="ledger-modal">
            <motion.div
              initial={{ scale: 0.95, opacity: 0, y: 15 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 15 }}
              className="bg-slate-900 border border-slate-800 w-full max-w-4xl rounded-3xl overflow-hidden shadow-2xl flex flex-col"
              style={{ maxHeight: '92vh' }}
              id="active-ledger-card"
            >
              {/* Header */}
              <div className="bg-slate-950 border-b border-slate-850 px-6 py-5 flex items-center justify-between text-right">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-blue-500/10 flex items-center justify-center">
                    <FileSpreadsheet className="w-5 h-5 text-blue-400" />
                  </div>
                  <div>
                    <h3 className="text-sm font-black text-white">دفتر حساب الأستاذ المالي الموحد</h3>
                    <p className="text-[10px] text-amber-500 font-mono">ملف كشف الحساب الخاص بالعامل: {activeLedgerWorker.name} ({activeLedgerWorker.id})</p>
                  </div>
                </div>
                <button
                  onClick={() => setActiveLedgerWorker(null)}
                  className="p-1.5 hover:bg-slate-800 rounded-full text-slate-400 hover:text-white transition-colors cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Ledger Content */}
              <div className="p-6 md:p-8 overflow-y-auto space-y-6 text-right flex-1 scrollbar-thin">
                
                {/* Visual Worker Info Card */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 bg-slate-950/80 border border-slate-850 rounded-2xl p-4 text-xs">
                  <div>
                    <span className="text-slate-500 block mb-1">الرقم الوطني / الإقامة:</span>
                    <strong className="text-slate-200 block font-mono">{activeLedgerWorker.nationalId || 'غير مدرج'}</strong>
                  </div>
                  <div>
                    <span className="text-slate-500 block mb-1">الهاتف الجوال الداخلي:</span>
                    <strong className="text-slate-200 block font-mono">{activeLedgerWorker.phone || 'غير مدرج'}</strong>
                  </div>
                  <div>
                    <span className="text-slate-500 block mb-1 font-sans">توجيه الصرف مع الكود:</span>
                    <strong className="text-slate-200 block font-mono truncate" title={activeLedgerWorker.bankAccount}>{activeLedgerWorker.bankAccount || 'نقدي يدوي'}</strong>
                  </div>
                  <div>
                    <span className="text-slate-500 block mb-1">تاريخ مباشرة العمل:</span>
                    <strong className="text-slate-200 block font-mono">{activeLedgerWorker.joiningDate}</strong>
                  </div>
                </div>

                {/* Sub-KPI Ledger Strip */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4" id="ledger-stats-strip">
                  
                  {/* KPI 1: Advances */}
                  <div className="bg-slate-950/40 border border-slate-850 rounded-xl p-4">
                    <span className="text-slate-400 text-[10px] uppercase font-bold flex items-center gap-1">
                      <HandCoins className="w-3.5 h-3.5 text-red-400" />
                      <span>قيد السلف المالية الجارية</span>
                    </span>
                    <div className="text-base font-black text-red-400 mt-1">
                      {workerLedgerStats.unpaidLoans} {activeLedgerWorker.currency || settings.currency}{' '}
                      <span className="text-[10px] text-slate-500 font-semibold">(من إجمالي {workerLedgerStats.totalLoans} {activeLedgerWorker.currency || settings.currency})</span>
                    </div>
                    <span className="text-[9px] text-slate-500 mt-1 block">تستقطع كلياً أو جزئياً تزامناً مع صرف الرواتب</span>
                  </div>

                  {/* KPI 2: Overtime hours and cash */}
                  <div className="bg-slate-950/40 border border-slate-850 rounded-xl p-4">
                    <span className="text-slate-400 text-[10px] uppercase font-bold flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5 text-blue-400" />
                      <span>العمل الإضافي المتراكم</span>
                    </span>
                    <div className="text-base font-black text-blue-400 mt-1">
                      {workerLedgerStats.overtimeCash} {activeLedgerWorker.currency || settings.currency}{' '}
                      <span className="text-[10px] text-slate-500 font-semibold">({workerLedgerStats.overtimeHours} ساعات)</span>
                    </div>
                    <span className="text-[9px] text-slate-500 mt-1 block">معدل الإنزال الساعي الفردي: {activeLedgerWorker.hourlyOvertimeRate} {activeLedgerWorker.currency || settings.currency}</span>
                  </div>

                  {/* KPI 3: Incentives vs penalties */}
                  <div className="bg-slate-950/40 border border-slate-850 rounded-xl p-4">
                    <span className="text-slate-400 text-[10px] uppercase font-bold flex items-center gap-1">
                      <Gift className="w-3.5 h-3.5 text-emerald-400" />
                      <span>صافي الحوافز والجزاءات المقطوعة</span>
                    </span>
                    <div className="text-base font-black text-emerald-400 mt-1">
                      {workerLedgerStats.totalAddedBonuses - workerLedgerStats.totalSubDeductions} {activeLedgerWorker.currency || settings.currency}
                    </div>
                    <span className="text-[9px] text-slate-500 mt-1 block">
                      المكافآت بـ: {workerLedgerStats.totalAddedBonuses} | الخصم بـ: {workerLedgerStats.totalSubDeductions}
                    </span>
                  </div>

                </div>

                {/* Grid Lists */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6" id="ledger-transactions-lists">
                  
                  {/* Grid 1: Advances list */}
                  <div className="bg-slate-950/20 border border-slate-850 rounded-2xl p-4 space-y-3">
                    <h4 className="text-xs font-extrabold text-white flex items-center gap-1 text-red-400">
                      <span>●</span>
                      <span>سجل وكشف السلف النقدية والقروض المسحوبة</span>
                    </h4>
                    {workerLedgerStats.advances.length === 0 ? (
                      <p className="text-[11px] text-slate-600 italic py-4">لم يتم سحب أي سلف لهذا العامل مسبقاً.</p>
                    ) : (
                      <div className="space-y-1.5" style={{ maxHeight: '180px', overflowY: 'auto' }}>
                        {workerLedgerStats.advances.map(a => (
                          <div key={a.id} className="bg-slate-950 border border-slate-850/60 p-2 rounded-xl flex items-center justify-between text-xs font-mono">
                            <div>
                              <span className="text-white font-sans text-xs block">{a.description}</span>
                              <span className="text-[9px] text-slate-500 font-mono block">{a.date} | كود: {a.id}</span>
                            </div>
                            <div className="text-left">
                              <span className="text-red-400 font-bold block">{a.remainingAmount} {activeLedgerWorker.currency || settings.currency}</span>
                              <span className="text-[9px] text-slate-500 block">من أصل {a.amount}</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Grid 2: Overtimes list */}
                  <div className="bg-slate-950/20 border border-slate-850 rounded-2xl p-4 space-y-3">
                    <h4 className="text-xs font-extrabold text-white flex items-center gap-1 text-blue-400">
                      <span>●</span>
                      <span>سجل وتفاصيل ساعات الأوفرتايم (شغل إضافي)</span>
                    </h4>
                    {workerLedgerStats.overtimes.length === 0 ? (
                      <p className="text-[11px] text-slate-600 italic py-4">لا توجد ساعات عمل إضافية مسجلة مسبقاً.</p>
                    ) : (
                      <div className="space-y-1.5" style={{ maxHeight: '180px', overflowY: 'auto' }}>
                        {workerLedgerStats.overtimes.map(o => (
                          <div key={o.id} className="bg-slate-950 border border-slate-850/60 p-2 rounded-xl flex items-center justify-between text-xs">
                            <div>
                              <span className="text-white text-xs block">{o.description || 'عمل إضافي عام بالموقع'}</span>
                              <span className="text-[9px] text-slate-500 font-mono block">{o.date} | المعامل: x{o.multiplier}</span>
                            </div>
                            <div className="text-left font-mono">
                              <span className="text-blue-400 font-bold block">
                                {o.hours * activeLedgerWorker.hourlyOvertimeRate * o.multiplier} {activeLedgerWorker.currency || settings.currency}
                              </span>
                              <span className="text-[9px] text-slate-500 block">({o.hours} ساعات)</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Grid 3: Bonuses list */}
                  <div className="bg-slate-950/20 border border-slate-850 rounded-2xl p-4 space-y-3">
                    <h4 className="text-xs font-extrabold text-white flex items-center gap-1 text-emerald-400">
                      <span>●</span>
                      <span>سجل المكافآت وحوافز التميز والبدلات</span>
                    </h4>
                    {workerLedgerStats.bonuses.length === 0 ? (
                      <p className="text-[11px] text-slate-600 italic py-4">لا توجد مكافآت أو بدلات مقيدة.</p>
                    ) : (
                      <div className="space-y-1.5" style={{ maxHeight: '180px', overflowY: 'auto' }}>
                        {workerLedgerStats.bonuses.map(b => (
                          <div key={b.id} className="bg-slate-950 border border-slate-850/60 p-2 rounded-xl flex items-center justify-between text-xs">
                            <div>
                              <span className="text-white text-xs block">{b.reason}</span>
                              <span className="text-[9px] text-slate-500 block">{b.date} | تصنيف: {b.type === 'allowance' ? 'بدل' : b.type === 'commission' ? 'عمولة' : 'مكافأة'}</span>
                            </div>
                            <span className="text-emerald-400 font-mono font-bold">{b.amount} {activeLedgerWorker.currency || settings.currency}</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Grid 4: Deductions list */}
                  <div className="bg-slate-950/20 border border-slate-850 rounded-2xl p-4 space-y-3">
                    <h4 className="text-xs font-extrabold text-white flex items-center gap-1 text-amber-500">
                      <span>●</span>
                      <span>سجل خصومات الغياب والمخالفات وسندات الغرامة</span>
                    </h4>
                    {workerLedgerStats.deductions.length === 0 ? (
                      <p className="text-[11px] text-slate-600 italic py-4">سجل نظيف! لا توجد خصومات أو مخالفات مدرجة.</p>
                    ) : (
                      <div className="space-y-1.5" style={{ maxHeight: '180px', overflowY: 'auto' }}>
                        {workerLedgerStats.deductions.map(d => (
                          <div key={d.id} className="bg-slate-950 border border-slate-850/60 p-2 rounded-xl flex items-center justify-between text-xs">
                            <div>
                              <span className="text-white text-xs block">{d.reason}</span>
                              <span className="text-[9px] text-slate-500 block">{d.date} | تصنيف: {d.type === 'attendance' ? 'غياب وتأخير' : 'عقوبة إدارية'}</span>
                            </div>
                            <span className="text-red-400 font-mono font-bold">-{d.amount} {activeLedgerWorker.currency || settings.currency}</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                </div>

              </div>

              {/* Footer */}
              <div className="bg-slate-950 border-t border-slate-850 px-6 py-4 flex flex-col sm:flex-row items-center justify-between gap-3 select-none">
                <span className="text-[11px] text-emerald-400 flex items-center gap-1">
                  <ShieldCheck className="w-4 h-4" />
                  <span>البيانات المحاسبية تطابق المعايير القياسية للرقابة المالية المزدوجة</span>
                </span>
                
                <div className="flex gap-2 w-full sm:w-auto justify-end">
                  <button
                    onClick={() => {
                      if (activeLedgerWorker && workerLedgerStats) {
                        const cur = activeLedgerWorker.currency || settings.currency;
                        const previewWindow = window.open('', '_blank');
                        if (previewWindow) {
                          previewWindow.document.open();
                          previewWindow.document.write(`
                            <html>
                              <head>
                                <title>معاينة كشف الحساب المالي - ${activeLedgerWorker.name}</title>
                                <style>
                                  @import url('https://fonts.googleapis.com/css2?family=Cairo:wght@400;700;900&display=swap');
                                  body { font-family: 'Cairo', sans-serif; direction: rtl; text-align: right; background-color: #f8fafc; color: #000; padding: 0; margin: 0; }
                                  .preview-toolbar {
                                    background-color: #0f172a;
                                    color: #f8fafc;
                                    padding: 12px 24px;
                                    display: flex;
                                    justify-content: space-between;
                                    align-items: center;
                                    box-shadow: 0 4px 6px -1px rgb(0 0 0 / 0.1);
                                    position: sticky;
                                    top: 0;
                                    z-index: 100;
                                  }
                                  .toolbar-title { font-size: 14px; font-weight: 700; }
                                  .toolbar-btn {
                                    background-color: #f59e0b;
                                    color: #0f172a;
                                    border: none;
                                    padding: 8px 16px;
                                    border-radius: 8px;
                                    font-family: 'Cairo', sans-serif;
                                    font-weight: 900;
                                    font-size: 12px;
                                    cursor: pointer;
                                    transition: background 0.2s;
                                  }
                                  .toolbar-btn:hover { background-color: #fbbf24; }
                                  .page-container {
                                    background: white;
                                    width: 210mm;
                                    min-height: 297mm;
                                    margin: 30px auto;
                                    padding: 20mm;
                                    box-shadow: 0 10px 15px -3px rgb(0 0 0 / 0.1);
                                    box-sizing: border-box;
                                    border-radius: 8px;
                                  }
                                  h4 { margin: 5px 0; font-size: 16px; font-weight: 900; }
                                  p { margin: 3px 0; font-size: 11px; color: #333; }
                                  .title { text-align: center; margin: 20px 0; font-size: 18px; font-weight: bold; border-bottom: 2px solid #000; padding-bottom: 5px; font-weight: 900; }
                                  table { width: 100%; border-collapse: collapse; margin-top: 15px; font-size: 11px; }
                                  th, td { border: 1px solid #000; padding: 6px; text-align: right; }
                                  th { background-color: #f5f5f5; font-weight: bold; }
                                  .profile-table { border: none; margin-bottom: 20px; width: 100%; }
                                  .profile-table td { border: none; padding: 4px; font-size: 11px; }
                                  .kpis { display: flex; gap: 15px; margin-bottom: 25px; margin-top: 15px; }
                                  .kpi-card { flex: 1; border: 1px solid #000; padding: 10px; background: #fafafa; border-radius: 4px; }
                                  .kpi-title { font-size: 10px; color: #555; font-weight: bold; }
                                  .kpi-val { font-size: 14px; font-weight: bold; margin-top: 4px; }
                                  .section-title { font-size: 12px; font-weight: bold; margin-top: 25px; border-right: 3px solid #000; padding-right: 6px; }
                                  .signatures { display: grid; grid-template-cols: 1fr 1fr 1fr; gap: 20px; text-align: center; margin-top: 60px; font-size: 10px; }
                                  .sig-line { width: 120px; border-bottom: 1.5px solid #000; margin: 35px auto 0; }
                                  
                                  @media print {
                                    body { background: white; }
                                    .preview-toolbar { display: none !important; }
                                    .page-container {
                                      margin: 0;
                                      padding: 0;
                                      width: auto;
                                      min-height: auto;
                                      box-shadow: none;
                                      border-radius: 0;
                                    }
                                  }
                                </style>
                              </head>
                              <body>
                                <div class="preview-toolbar">
                                  <span class="toolbar-title">معاينة كشف الحساب المالي (نسخة للطباعة)</span>
                                  <button class="toolbar-btn" onclick="window.print()">🖨️ بدء طباعة الدفتر الفورية</button>
                                </div>

                                <div class="page-container">
                                  <div style="display: flex; justify-content: space-between; align-items: start; border-bottom: 1px solid #ccc; padding-bottom: 10px;">
                                    <div>
                                      <h4>${settings.companyName}</h4>
                                      <p>قسم الحسابات والمراقبة المالية والموازنة</p>
                                      ${settings.vatNumber ? `<p>الرقم الضريبي للمؤسسة: ${settings.vatNumber}</p>` : ''}
                                    </div>
                                    <div style="text-align: left; font-size: 10px; color: #555;">
                                      <p>كود المستند: LEDGER-${activeLedgerWorker.id}</p>
                                      <p>تاريخ الكشف الحسابي: ${new Date().toLocaleDateString('ar-EG')}</p>
                                    </div>
                                  </div>

                                  <div class="title">دفتر حساب الأستاذ المالي للعمال وكشف المديونيات</div>

                                  <table class="profile-table">
                                    <tr>
                                      <td><strong>اسم العامل بالكامل:</strong> ${activeLedgerWorker.name}</td>
                                      <td><strong>كود العامل الفردي:</strong> ${activeLedgerWorker.id}</td>
                                    </tr>
                                    <tr>
                                      <td><strong>المسمى والوظيفة:</strong> ${activeLedgerWorker.jobTitle}</td>
                                      <td><strong>القسم والفرع:</strong> ${activeLedgerWorker.department}</td>
                                    </tr>
                                    <tr>
                                      <td><strong>رقم بطاقة الهوية / الإقامة:</strong> ${activeLedgerWorker.nationalId || 'غير مسجل'}</td>
                                      <td><strong>رقم جوال العامل:</strong> ${activeLedgerWorker.phone || 'غير مسجل'}</td>
                                    </tr>
                                    <tr>
                                      <td><strong>تاريخ مباشرة العقد:</strong> ${activeLedgerWorker.joiningDate}</td>
                                      <td><strong>توجيه صرف المستحقات والآيبان:</strong> ${activeLedgerWorker.bankAccount || 'صرف نقدي مباشر'}</td>
                                    </tr>
                                  </table>

                                  <div class="kpis">
                                    <div class="kpi-card">
                                      <div class="kpi-title">السلف المالية الجارية المستقطعة</div>
                                      <div class="kpi-val" style="color: #b91c1c;">${workerLedgerStats.unpaidLoans} ${cur}</div>
                                      <div style="font-size: 8px; color: #666; margin-top: 2px;">مستحق من إجمالي: ${workerLedgerStats.totalLoans} ${cur}</div>
                                    </div>
                                    <div class="kpi-card">
                                      <div class="kpi-title">علاوة ساعات الأوفرتايم (الإضافي)</div>
                                      <div class="kpi-val" style="color: #1d4ed8;">${workerLedgerStats.overtimeCash} ${cur}</div>
                                      <div style="font-size: 8px; color: #666; margin-top: 2px;">إجمالي الساعات: ${workerLedgerStats.overtimeHours} ساعة</div>
                                    </div>
                                    <div class="kpi-card">
                                      <div class="kpi-title">إجمالي البدلات والمكافآت والعمولات</div>
                                      <div class="kpi-val" style="color: #047857;">${workerLedgerStats.totalAddedBonuses} ${cur}</div>
                                      <div style="font-size: 8px; color: #666; margin-top: 2px;">حوافز تشجيعية واستحقاقات</div>
                                    </div>
                                    <div class="kpi-card">
                                      <div class="kpi-title">إجمالي الخصومات والجزاءات الفردية</div>
                                      <div class="kpi-val" style="color: #ea580c;">${workerLedgerStats.totalSubDeductions} ${cur}</div>
                                      <div style="font-size: 8px; color: #666; margin-top: 2px;">غيابات وتأخيرات وغرامات</div>
                                    </div>
                                  </div>

                                  <div class="section-title">سجل التفصيلي لحركات الحساب والمديونية البينية</div>
                                  <table>
                                    <thead>
                                      <tr>
                                        <th style="width: 80px;">التاريخ</th>
                                        <th style="width: 100px;">التصنيف</th>
                                        <th>الوصف والبيان المالي للعملية</th>
                                        <th style="text-align: left; width: 120px;">القيمة المضافة لحسابه (+)</th>
                                        <th style="text-align: left; width: 120px;">الاستقطاعات والخصومات منه (-)</th>
                                      </tr>
                                    </thead>
                                    <tbody>
                                      ${[
                                        ...workerLedgerStats.advances.map(a => ({ date: a.date, type: 'سحب سلفة نقدية', desc: `${a.description} (المتبقي غير المسدد: ${a.remainingAmount} ${cur})`, add: 0, sub: a.amount })),
                                        ...workerLedgerStats.overtimes.map(o => ({ date: o.date, type: 'ساعات إضافية جارية', desc: `${o.description || 'إنجاز عمل إضافي بالموقع'} (ساعات عمل: ${o.hours} x معامل المستحق x${o.multiplier})`, add: o.hours * activeLedgerWorker.hourlyOvertimeRate * o.multiplier, sub: 0 })),
                                        ...workerLedgerStats.bonuses.map(b => ({ date: b.date, type: b.type === 'allowance' ? 'بدل مالي' : 'مكافأة تميز', desc: b.reason, add: b.amount, sub: 0 })),
                                        ...workerLedgerStats.deductions.map(d => ({ date: d.date, type: 'خصم جزائي', desc: d.reason, add: 0, sub: d.amount }))
                                      ]
                                        .sort((a,b) => new Date(a.date).getTime() - new Date(b.date).getTime())
                                        .map(item => `
                                          <tr>
                                            <td>${item.date}</td>
                                            <td><strong>${item.type}</strong></td>
                                            <td>${item.desc}</td>
                                            <td style="text-align: left; font-weight: bold; color: ${item.add > 0 ? '#10b981' : '#333'}">${item.add > 0 ? `+${item.add} ${cur}` : '-'}</td>
                                            <td style="text-align: left; font-weight: bold; color: ${item.sub > 0 ? '#ef4444' : '#333'}">${item.sub > 0 ? `-${item.sub} ${cur}` : '-'}</td>
                                          </tr>
                                        `).join('')}
                                      ${[
                                        workerLedgerStats.advances.length,
                                        workerLedgerStats.overtimes.length,
                                        workerLedgerStats.bonuses.length,
                                        workerLedgerStats.deductions.length
                                      ].reduce((s,c) => s+c, 0) === 0 ? `<tr><td colspan="5" style="text-align: center; font-style: italic; color: #888; padding: 25px;">لا توجد أي قيود محاسبية أو ديون مسجلة على ملف هذا العامل.</td></tr>` : ''}
                                    </tbody>
                                  </table>

                                  <div style="margin-top: 25px; border: 1.5px solid #000; padding: 12px; background: #fafafa; border-radius: 4px; font-size: 11px;">
                                    <div style="display: flex; justify-content: space-between;">
                                      <span>مستحقات العمل المتراكم (المكافآت والإضافات الفعالة): <strong>${workerLedgerStats.totalAddedBonuses + workerLedgerStats.overtimeCash} ${cur}</strong></span>
                                      <span>الاستقطاعات المتخذة والتسليفات الجارية: <strong>${workerLedgerStats.totalSubDeductions + workerLedgerStats.unpaidLoans} ${cur}</strong></span>
                                    </div>
                                  </div>

                                  <div class="signatures">
                                    <div>
                                      <p>إعداد جهة تدقيق المعاملات (المحاسبة)</p>
                                      <div class="sig-line"></div>
                                    </div>
                                    <div>
                                      <p>المدير العام والتدقيق والمراجعة</p>
                                      <div class="sig-line"></div>
                                    </div>
                                    <div>
                                      <p>توقيع وبصمة العامل (إقرار الاستلام والمطابقة)</p>
                                      <div class="sig-line"></div>
                                    </div>
                                  </div>
                                </div>
                              </body>
                            </html>
                          `);
                          previewWindow.document.close();
                        }
                      }
                    }}
                    className="py-1.5 px-4 bg-slate-800 hover:bg-slate-750 text-slate-200 border border-slate-700 font-bold rounded-xl text-xs flex items-center justify-center gap-1.5 transition-all shadow-md cursor-pointer"
                    id="preview-ledger-button"
                  >
                    <Eye className="w-3.5 h-3.5" />
                    <span>معاينة الكشف (PDF Preview)</span>
                  </button>

                  <button
                    onClick={() => {
                      if (activeLedgerWorker && workerLedgerStats) {
                        const cur = activeLedgerWorker.currency || settings.currency;
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
                                <title>كشف الحساب المالي - ${activeLedgerWorker.name}</title>
                                <style>
                                  @import url('https://fonts.googleapis.com/css2?family=Cairo:wght@400;700;900&display=swap');
                                  body { font-family: 'Cairo', sans-serif; direction: rtl; text-align: right; background-color: #fff; color: #000; padding: 30px; }
                                  h4 { margin: 5px 0; font-size: 16px; font-weight: 900; }
                                  p { margin: 3px 0; font-size: 11px; color: #333; }
                                  .title { text-align: center; margin: 20px 0; font-size: 18px; font-weight: bold; border-bottom: 2px solid #000; padding-bottom: 5px; font-weight: 900; }
                                  table { width: 100%; border-collapse: collapse; margin-top: 15px; font-size: 11px; }
                                  th, td { border: 1px solid #000; padding: 6px; text-align: right; }
                                  th { background-color: #f5f5f5; font-weight: bold; }
                                  .profile-table { border: none; margin-bottom: 20px; width: 100%; }
                                  .profile-table td { border: none; padding: 4px; font-size: 11px; }
                                  .kpis { display: flex; gap: 15px; margin-bottom: 25px; margin-top: 15px; }
                                  .kpi-card { flex: 1; border: 1px solid #000; padding: 10px; background: #fafafa; border-radius: 4px; }
                                  .kpi-title { font-size: 10px; color: #555; font-weight: bold; }
                                  .kpi-val { font-size: 14px; font-weight: bold; margin-top: 4px; }
                                  .section-title { font-size: 12px; font-weight: bold; margin-top: 25px; border-right: 3px solid #000; padding-right: 6px; }
                                  .signatures { display: grid; grid-template-cols: 1fr 1fr 1fr; gap: 20px; text-align: center; margin-top: 60px; font-size: 10px; }
                                  .sig-line { width: 120px; border-bottom: 1.5px solid #000; margin: 35px auto 0; }
                                </style>
                              </head>
                              <body>
                                <div style="display: flex; justify-content: space-between; align-items: start; border-bottom: 1px solid #ccc; padding-bottom: 10px;">
                                  <div>
                                    <h4>${settings.companyName}</h4>
                                    <p>قسم الحسابات والمراقبة المالية والموازنة</p>
                                    ${settings.vatNumber ? `<p>الرقم الضريبي للمؤسسة: ${settings.vatNumber}</p>` : ''}
                                  </div>
                                  <div style="text-align: left; font-size: 10px; color: #555;">
                                    <p>كود المستند: LEDGER-${activeLedgerWorker.id}</p>
                                    <p>تاريخ الكشف الحسابي: ${new Date().toLocaleDateString('ar-EG')}</p>
                                  </div>
                                </div>

                                <div class="title">دفتر حساب الأستاذ المالي للعمال وكشف المديونيات</div>

                                <table class="profile-table">
                                  <tr>
                                    <td><strong>اسم العامل بالكامل:</strong> ${activeLedgerWorker.name}</td>
                                    <td><strong>كود العامل الفردي:</strong> ${activeLedgerWorker.id}</td>
                                  </tr>
                                  <tr>
                                    <td><strong>المسمى والوظيفة:</strong> ${activeLedgerWorker.jobTitle}</td>
                                    <td><strong>القسم والفرع:</strong> ${activeLedgerWorker.department}</td>
                                  </tr>
                                  <tr>
                                    <td><strong>رقم بطاقة الهوية / الإقامة:</strong> ${activeLedgerWorker.nationalId || 'غير مسجل'}</td>
                                    <td><strong>رقم جوال العامل:</strong> ${activeLedgerWorker.phone || 'غير مسجل'}</td>
                                  </tr>
                                  <tr>
                                    <td><strong>تاريخ مباشرة العقد:</strong> ${activeLedgerWorker.joiningDate}</td>
                                    <td><strong>توجيه صرف المستحقات والآيبان:</strong> ${activeLedgerWorker.bankAccount || 'صرف نقدي مباشر'}</td>
                                  </tr>
                                </table>

                                <div class="kpis">
                                  <div class="kpi-card">
                                    <div class="kpi-title">السلف المالية الجارية المستقطعة</div>
                                    <div class="kpi-val" style="color: #b91c1c;">${workerLedgerStats.unpaidLoans} ${cur}</div>
                                    <div style="font-size: 8px; color: #666; margin-top: 2px;">مستحق من إجمالي: ${workerLedgerStats.totalLoans} ${cur}</div>
                                  </div>
                                  <div class="kpi-card">
                                    <div class="kpi-title">علاوة ساعات الأوفرتايم (الإضافي)</div>
                                    <div class="kpi-val" style="color: #1d4ed8;">${workerLedgerStats.overtimeCash} ${cur}</div>
                                    <div style="font-size: 8px; color: #666; margin-top: 2px;">إجمالي الساعات: ${workerLedgerStats.overtimeHours} ساعة</div>
                                  </div>
                                  <div class="kpi-card">
                                    <div class="kpi-title">إجمالي البدلات والمكافآت والعمولات</div>
                                    <div class="kpi-val" style="color: #047857;">${workerLedgerStats.totalAddedBonuses} ${cur}</div>
                                    <div style="font-size: 8px; color: #666; margin-top: 2px;">حوافز تشجيعية واستحقاقات</div>
                                  </div>
                                  <div class="kpi-card">
                                    <div class="kpi-title">إجمالي الخصومات والجزاءات الفردية</div>
                                    <div class="kpi-val" style="color: #ea580c;">${workerLedgerStats.totalSubDeductions} ${cur}</div>
                                    <div style="font-size: 8px; color: #666; margin-top: 2px;">غيابات وتأخيرات وغرامات</div>
                                  </div>
                                </div>

                                <div class="section-title">سجل التفصيلي لحركات الحساب والمديونية البينية</div>
                                <table>
                                  <thead>
                                    <tr>
                                      <th style="width: 80px;">التاريخ</th>
                                      <th style="width: 100px;">التصنيف</th>
                                      <th>الوصف والبيان المالي للعملية</th>
                                      <th style="text-align: left; width: 120px;">القيمة المضافة لحسابه (+)</th>
                                      <th style="text-align: left; width: 120px;">الاستقطاعات والخصومات منه (-)</th>
                                    </tr>
                                  </thead>
                                  <tbody>
                                    ${[
                                      ...workerLedgerStats.advances.map(a => ({ date: a.date, type: 'سحب سلفة نقدية', desc: `${a.description} (المتبقي غير المسدد: ${a.remainingAmount} ${cur})`, add: 0, sub: a.amount })),
                                      ...workerLedgerStats.overtimes.map(o => ({ date: o.date, type: 'ساعات إضافية جارية', desc: `${o.description || 'إنجاز عمل إضافي بالموقع'} (ساعات عمل: ${o.hours} x معامل المستحق x${o.multiplier})`, add: o.hours * activeLedgerWorker.hourlyOvertimeRate * o.multiplier, sub: 0 })),
                                      ...workerLedgerStats.bonuses.map(b => ({ date: b.date, type: b.type === 'allowance' ? 'بدل مالي' : 'مكافأة تميز', desc: b.reason, add: b.amount, sub: 0 })),
                                      ...workerLedgerStats.deductions.map(d => ({ date: d.date, type: 'خصم جزائي', desc: d.reason, add: 0, sub: d.amount }))
                                    ]
                                      .sort((a,b) => new Date(a.date).getTime() - new Date(b.date).getTime())
                                      .map(item => `
                                        <tr>
                                          <td>${item.date}</td>
                                          <td><strong>${item.type}</strong></td>
                                          <td>${item.desc}</td>
                                          <td style="text-align: left; font-weight: bold; color: ${item.add > 0 ? '#10b981' : '#333'}">${item.add > 0 ? `+${item.add} ${cur}` : '-'}</td>
                                          <td style="text-align: left; font-weight: bold; color: ${item.sub > 0 ? '#ef4444' : '#333'}">${item.sub > 0 ? `-${item.sub} ${cur}` : '-'}</td>
                                        </tr>
                                      `).join('')}
                                    ${[
                                      workerLedgerStats.advances.length,
                                      workerLedgerStats.overtimes.length,
                                      workerLedgerStats.bonuses.length,
                                      workerLedgerStats.deductions.length
                                    ].reduce((s,c) => s+c, 0) === 0 ? `<tr><td colspan="5" style="text-align: center; font-style: italic; color: #888; padding: 25px;">لا توجد أي قيود محاسبية أو ديون مسجلة على ملف هذا العامل.</td></tr>` : ''}
                                  </tbody>
                                </table>

                                <div style="margin-top: 25px; border: 1.5px solid #000; padding: 12px; background: #fafafa; border-radius: 4px; font-size: 11px;">
                                  <div style="display: flex; justify-content: space-between;">
                                    <span>مستحقات العمل المتراكم (المكافآت والإضافات الفعالة): <strong>${workerLedgerStats.totalAddedBonuses + workerLedgerStats.overtimeCash} ${cur}</strong></span>
                                    <span>الاستقطاعات المتخذة والتسليفات الجارية: <strong>${workerLedgerStats.totalSubDeductions + workerLedgerStats.unpaidLoans} ${cur}</strong></span>
                                  </div>
                                </div>

                                <div class="signatures">
                                  <div>
                                    <p>إعداد جهة تدقيق المعاملات (المحاسبة)</p>
                                    <div class="sig-line"></div>
                                  </div>
                                  <div>
                                    <p>المدير العام والتدقيق والمراجعة</p>
                                    <div class="sig-line"></div>
                                  </div>
                                  <div>
                                    <p>توقيع وبصمة العامل (إقرار الاستلام والمطابقة)</p>
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
                    className="py-1.5 px-4 bg-amber-500 hover:bg-amber-400 text-slate-950 font-black rounded-xl text-xs flex items-center justify-center gap-1.5 transition-all shadow-md cursor-pointer"
                  >
                    <Printer className="w-3.5 h-3.5 text-slate-950" />
                    <span>طباعة وتصدير الكشف (PDF)</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setActiveLedgerWorker(null)}
                    className="py-1.5 px-4 bg-slate-900 border border-slate-850 hover:bg-slate-850 text-slate-300 rounded-xl text-xs font-bold cursor-pointer transition-colors"
                  >
                    إغلاق الصفحة
                  </button>
                </div>
              </div>

            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Custom Delete Confirmation Modal */}
      <AnimatePresence>
        {workerToDelete && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 animate-fade-in" id="delete-confirmation-backdrop">
            {/* Backdrop with elegant blur */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-slate-950/80 backdrop-blur-sm"
              onClick={() => setWorkerToDelete(null)}
            />

            {/* Container */}
            <motion.div
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              transition={{ type: 'spring', duration: 0.3 }}
              className="bg-slate-900 border-2 border-red-900/50 w-full max-w-md rounded-2xl overflow-hidden shadow-2xl relative z-10 p-6 flex flex-col gap-4 text-right"
              id="delete-confirmation-dialog"
            >
              <div className="flex items-center gap-3 border-b border-slate-850 pb-3">
                <div className="w-10 h-10 rounded-full bg-red-950/60 border border-red-900 flex items-center justify-center shrink-0">
                  <Trash2 className="w-5 h-5 text-red-500" />
                </div>
                <div>
                  <h4 className="text-sm font-black text-white font-sans">تأكيد حذف ملف العامل نهائياً</h4>
                  <p className="text-[10px] text-slate-400 mt-0.5 font-bold">إجراء حساس للغاية ولا يمكن التراجع عنه!</p>
                </div>
              </div>

              <div className="space-y-2.5 my-1">
                <p className="text-xs text-slate-200 leading-relaxed font-sans">
                  هل أنت متأكد تماماً من شطب وإلغاء بطاقة العامل{' '}
                  <span className="text-amber-500 font-extrabold">"{workerToDelete.name}"</span> (رقم التعريف:{' '}
                  <span className="font-mono text-amber-500 font-black">{workerToDelete.id}</span>)؟
                </p>

                <div className="bg-red-950/25 border border-red-920/45 rounded-xl p-3.5 space-y-1.5 text-[10px] text-red-200">
                  <p className="font-black flex items-center gap-1.5 text-xs text-red-400">
                    <span>⚠️ نتائج هذه العملية الفورية:</span>
                  </p>
                  <ul className="list-disc pr-4 space-y-1 font-semibold leading-normal">
                    <li>حذف كرت العمل ومعلومات الراتب وعملة العقد والمسمى الوظيفي.</li>
                    <li>شطب وتصفير كافة السندات المالية من سلف وقروض مستحقة بذمته.</li>
                    <li>إلغاء حركات وساعات الأوفرتايم (الإضافي) والمكافآت والخصومات في الفترات المفتوحة.</li>
                    <li>استبعاد العامل نهائياً من كشوفات ومسيرات صرف الرواتب.</li>
                  </ul>
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setWorkerToDelete(null)}
                  className="py-2.5 px-4 bg-slate-950 hover:bg-slate-850 border border-slate-800 text-slate-300 font-bold rounded-xl text-xs cursor-pointer transition-colors"
                >
                  إلغاء التراجع
                </button>
                <button
                  type="button"
                  onClick={() => {
                    onDeleteWorker(workerToDelete.id);
                    setWorkerToDelete(null);
                  }}
                  className="py-2.5 px-5 bg-red-600 hover:bg-red-500 text-white font-black rounded-xl text-xs cursor-pointer transition-all shadow-md flex items-center gap-1.5"
                  id="confirm-delete-button"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>تأكيد الحذف النهائي</span>
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
}
