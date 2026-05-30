/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Worker, Advance, Deduction, Bonus, OvertimeLog, SystemSettings } from './types';

export const DEFAULT_SETTINGS: SystemSettings = {
  companyName: "مكتب سمارت نيتورك لخدمات الشبكات",
  currency: "ريال",
  defaultOvertimeMultiplier: 1.5,
  vatNumber: "300456123000003"
};

export const DEMO_WORKERS: Worker[] = [
  {
    id: "W-1001",
    name: "م. أحمد رامي الكردي",
    jobTitle: "مهندس موقع مدني",
    department: "إدارة المشاريع",
    salaryType: "monthly",
    baseSalary: 7500,
    hourlyOvertimeRate: 50,
    phone: "0554321987",
    nationalId: "1098765432",
    joiningDate: "2024-03-15",
    status: "active",
    bankAccount: "SA8040000001234567890123"
  },
  {
    id: "W-1002",
    name: "مصطفى عبد العزيز الشافعي",
    jobTitle: "فني تمديدات حديد",
    department: "الحدادة والتسليح",
    salaryType: "daily",
    baseSalary: 180, // 180 ر.س يومياً
    hourlyOvertimeRate: 25,
    phone: "0543210987",
    nationalId: "2409876543",
    joiningDate: "2025-01-10",
    status: "active",
    bankAccount: "نقدي - يدوي"
  },
  {
    id: "W-1003",
    name: "سليمان خلف الرويلي",
    jobTitle: "سائق رافعة شوكية ثقيلة",
    department: "النقليات واللوجستيات",
    salaryType: "monthly",
    baseSalary: 4800,
    hourlyOvertimeRate: 35,
    phone: "0567890123",
    nationalId: "1065432198",
    joiningDate: "2024-06-01",
    status: "active",
    bankAccount: "SA3550000009876543210987"
  },
  {
    id: "W-1004",
    name: "عبد الرحمن صبحي الهواري",
    jobTitle: "عامل بناء وتشطيبات",
    department: "المعمار والتشطيب",
    salaryType: "daily",
    baseSalary: 140, // 140 ر.س يومياً
    hourlyOvertimeRate: 20,
    phone: "0501234567",
    nationalId: "2354321987",
    joiningDate: "2025-02-20",
    status: "active",
    bankAccount: "نقدي - يدوي"
  },
  {
    id: "W-1005",
    name: "علي خالد مرزوق",
    jobTitle: "مشرف سلامة وصحة مهنية",
    department: "الأمن والسلامة",
    salaryType: "monthly",
    baseSalary: 6200,
    hourlyOvertimeRate: 40,
    phone: "0533221100",
    nationalId: "1032145678",
    joiningDate: "2023-11-01",
    status: "active",
    bankAccount: "SA9310000005544332211223"
  },
  {
    id: "W-1006",
    name: "كريم مأمون جاد الله",
    jobTitle: "كهربائي تمديدات صناعية",
    department: "الكهرباء والصيانة",
    salaryType: "hourly",
    baseSalary: 25, // 25 ر.س للساعة
    hourlyOvertimeRate: 35,
    phone: "0531122334",
    nationalId: "2055667788",
    joiningDate: "2025-03-01",
    status: "suspended",
    bankAccount: "SA2230000005556667778889"
  }
];

export const DEMO_ADVANCES: Advance[] = [
  {
    id: "ADV-501",
    workerId: "W-1001",
    workerName: "م. أحمد رامي الكردي",
    amount: 1500,
    date: "2026-05-10",
    description: "سلفة طارئة لشراء مستلزمات شخصية",
    status: "partially_deducted",
    remainingAmount: 1000
  },
  {
    id: "ADV-502",
    workerId: "W-1003",
    workerName: "سليمان خلف الرويلي",
    amount: 500,
    date: "2026-05-18",
    description: "سلفة لإصلاح سيارته الخاصة",
    status: "pending",
    remainingAmount: 500
  },
  {
    id: "ADV-503",
    workerId: "W-1002",
    workerName: "مصطفى عبد العزيز الشافعي",
    amount: 300,
    date: "2026-05-22",
    description: "سلفة نقدية مستعجلة",
    status: "pending",
    remainingAmount: 300
  }
];

export const DEMO_BONUSES: Bonus[] = [
  {
    id: "BNS-401",
    workerId: "W-1001",
    workerName: "م. أحمد رامي الكردي",
    amount: 700,
    date: "2026-05-25",
    reason: "بدل انتقال موقع بعيد وهاتف محمول",
    type: "allowance"
  },
  {
    id: "BNS-402",
    workerId: "W-1002",
    workerName: "مصطفى عبد العزيز الشافعي",
    amount: 250,
    date: "2026-05-26",
    reason: "مكافأة تسليم أعمال الحدادة للمبنى أ قبل الموعد",
    type: "reward"
  },
  {
    id: "BNS-403",
    workerId: "W-1005",
    workerName: "علي خالد مرزوق",
    amount: 500,
    date: "2026-05-28",
    reason: "بدل سكن للمشرفين المتنقلين",
    type: "allowance"
  }
];

export const DEMO_DEDUCTIONS: Deduction[] = [
  {
    id: "DED-301",
    workerId: "W-1003",
    workerName: "سليمان خلف الرويلي",
    amount: 150,
    date: "2026-05-20",
    reason: "تأخير متكرر عن نوبة الصباح لمدة 3 أيام دون عذر",
    type: "attendance"
  },
  {
    id: "DED-302",
    workerId: "W-1004",
    workerName: "عبد الرحمن صبحي الهواري",
    amount: 100,
    date: "2026-05-24",
    reason: "غياب غير مبرر يوم السبت الماضي",
    type: "attendance"
  }
];

export const DEMO_OVERTIME: OvertimeLog[] = [
  {
    id: "OVT-201",
    workerId: "W-1001",
    workerName: "م. أحمد رامي الكردي",
    hours: 12,
    date: "2026-05-15",
    multiplier: 1.5,
    description: "الإشراف على صب خرسانة الأساسات ليلياً"
  },
  {
    id: "OVT-202",
    workerId: "W-1002",
    workerName: "مصطفى عبد العزيز الشافعي",
    hours: 18,
    date: "2026-05-18",
    multiplier: 1.5,
    description: "عمل إضافي لتهيئة تسليح جدران القبو"
  },
  {
    id: "OVT-203",
    workerId: "W-1004",
    workerName: "عبد الرحمن صبحي الهواري",
    hours: 8,
    date: "2026-05-22",
    multiplier: 1.5,
    description: "أعمال لياسة وتنعيم إضافية في صالة الاستقبال"
  }
];
