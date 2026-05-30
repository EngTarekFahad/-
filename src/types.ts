/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface Worker {
  id: string; // المعرف الفريد للعامل
  name: string; // اسم العامل الكامل
  jobTitle: string; // المسمى الوظيفي
  department: string; // القسم أو الورشة
  salaryType: 'monthly' | 'daily' | 'hourly'; // طريقة احتساب الراتب
  baseSalary: number; // الراتب الأساسي أو الأجر اليومي/سعر الساعة
  hourlyOvertimeRate: number; // سعر ساعة العمل الإضافي
  phone: string; // رقم الهاتف للاتصال
  nationalId: string; // رقم الهوية الوطنية أو الإقامة
  joiningDate: string; // تاريخ بدء العمل
  status: 'active' | 'suspended'; // حالة العامل (نشط / موقوف مؤقتاً)
  bankAccount?: string; // الحساب البنكي أو طريقة استلام النقد
  currency?: string; // العملة الخاصة بالعامل
}

export interface Advance {
  id: string; // رقم السلفة المعرف
  workerId: string; // العامل المستلف
  workerName: string; // اسم العامل للتسجيل والمطابقة
  amount: number; // مبلغ السلفة الأصلي
  date: string; // تاريخ تقديم السلفة
  description: string; // تدوين تفاصيل أو سبب السلفة
  status: 'pending' | 'deducted' | 'partially_deducted'; // حالة السلفة
  remainingAmount: number; // المبلغ المتبقي للسداد
}

export interface Deduction {
  id: string; // رقم الخصم المعرف
  workerId: string;
  workerName: string;
  amount: number; // قيمة الخصم المالي
  date: string;
  reason: string; // سبب الخصم (خصم غياب، مخالفة، تلفيات)
  type: 'attendance' | 'penalty' | 'other';
}

export interface Bonus {
  id: string; // رقم المكافأة المعرف
  workerId: string;
  workerName: string;
  amount: number; // قيمة المكافأة أو البديل
  date: string;
  reason: string; // سبب الإضافة (مكافأة تميز، بدل سكن، بدل انتقال)
  type: 'reward' | 'allowance' | 'commission';
}

export interface OvertimeLog {
  id: string;
  workerId: string;
  workerName: string;
  hours: number; // عدد ساعات العمل الإضافية المنجزة
  date: string;
  multiplier: number; // قيمة معامل الساعة الإضافية (مثلاً 1.5)
  description?: string; // إيضاح المهام الإضافية
}

export interface PayrollRecord {
  id: string; // معرف مسير الراتب
  periodId: string; // الشهر المالي الجاري (مثل 2026-05)
  workerId: string;
  workerName: string;
  jobTitle: string;
  salaryType: 'monthly' | 'daily' | 'hourly';
  baseSalaryRate: number; // الراتب الأساسي الافتراضي
  workDaysCalculated: number; // عدد أيام أو ساعات العمل المسجلة
  baseSalaryCalculated: number; // الراتب الأساسي المستحق الفعلي لهذا الشهر
  totalOvertimeHours: number; // إجمالي ساعات العمل الإضافية
  totalOvertimeAmount: number; // إجمالي قيمة العمل الإضافي
  totalBonuses: number; // إجمالي المكافآت والبدلات المضافة
  totalDeductions: number; // إجمالي الخصومات والغيابات
  totalAdvancesDeducted: number; // السلف المستقطعة المستردة هذا الشهر
  netSalary: number; // الأجر الصافي النهائي القابل للصرف
  status: 'draft' | 'paid' | 'delayed'; // حالة الدفع
  paymentDate?: string; // تاريخ صرف الراتب النهائي
  notes?: string; // ملاحظات أو وثيقة إضافية
  currency?: string; // عملة العامل المسجلة في المسير
}

export interface TerminalLog {
  timestamp: string;
  text: string;
  type: 'info' | 'success' | 'warning' | 'error' | 'command';
}

export interface SystemSettings {
  companyName: string; // اسم المؤسسة أو المقاولات
  currency: string; // العملة الافتراضية للرواتب
  defaultOvertimeMultiplier: number; // معامل الإضافي الافتراضي (مثل 1.5)
  vatNumber?: string; // الرقم الضريبي للمنشأة إن وجد
}
