/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { motion } from 'motion/react';
import { 
  Settings, 
  Building, 
  Coins, 
  Percent, 
  Trash2, 
  RefreshCw, 
  AlertCircle, 
  ShieldCheck, 
  Save,
  CheckCircle,
  Database
} from 'lucide-react';
import { SystemSettings } from '../types';

interface SettingsTabProps {
  settings: SystemSettings;
  onUpdateSettings: (settings: SystemSettings) => void;
  onLoadDemoData: () => void;
  onClearAllData: () => void;
}

export default function SettingsTab({
  settings,
  onUpdateSettings,
  onLoadDemoData,
  onClearAllData
}: SettingsTabProps) {

  // Local states matching type SystemSettings
  const [formCompany, setFormCompany] = useState(settings.companyName);
  const [formCurrency, setFormCurrency] = useState(settings.currency);
  
  const standardCurrencies = ['ريال يمني', 'ريال سعودي', 'دولار أمريكي', 'درهم إماراتي'];
  const isCustomCurrency = !standardCurrencies.includes(settings.currency);
  const [currencySelectMode, setCurrencySelectMode] = useState<string>(
    isCustomCurrency ? 'custom' : settings.currency
  );

  const [formMultiplier, setFormMultiplier] = useState(settings.defaultOvertimeMultiplier);
  const [formVat, setFormVat] = useState(settings.vatNumber || '');
  
  const [showDemoNotification, setShowDemoNotification] = useState(false);
  const [showSaveNotification, setShowSaveNotification] = useState(false);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdateSettings({
      companyName: formCompany.trim(),
      currency: formCurrency.trim(),
      defaultOvertimeMultiplier: Number(formMultiplier) || 1.5,
      vatNumber: formVat.trim() || undefined
    });

    setShowSaveNotification(true);
    setTimeout(() => setShowSaveNotification(false), 3000);
  };

  const triggerLoadDemoData = () => {
    if (confirm("هل ترغب بشحن ملفات عمال وسجلات مالية تجريبية نموذجية؟ سيؤدي ذلك لتحديث الجداول وإظهار المخططات الإحصائية ومسيرة مايو 2026 فورياً بالكامل!")) {
      onLoadDemoData();
      setShowDemoNotification(true);
      setTimeout(() => setShowDemoNotification(false), 3500);
    }
  };

  const triggerWipeData = () => {
    if (confirm("⚠️ تحذير شديد الخطورة: هل ترغب بحذف كافة العمال، السلف، المكافآت ومسيرات الرواتب نهائياً والبدء بصفحة فارغة؟ لا يمكن استرجاع البيانات المحذوفة!")) {
      onClearAllData();
      setFormCompany("مكتب سمارت نيتورك لخدمات الشبكات");
      setFormCurrency("ريال");
      setCurrencySelectMode("custom");
      setFormMultiplier(1.5);
      setFormVat("");
      alert("تم تصفير وإفراغ جميع جداول وقواعد البيانات المحلية بنجاح.");
    }
  };

  return (
    <div className="space-y-6" id="settings-tab">
      
      {/* Save Notification banner */}
      {showSaveNotification && (
        <motion.div
          initial={{ y: -10, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="p-4 rounded-xl bg-emerald-950/50 border border-emerald-900 text-emerald-400 text-xs flex items-center gap-2 select-none"
        >
          <CheckCircle className="w-5 h-5 text-emerald-400 shrink-0" />
          <span>تم حفظ الإعدادات الافتراضية وبيانات المنشأة وتحديث النظام بنجاح!</span>
        </motion.div>
      )}

      {/* Demo Notification banner */}
      {showDemoNotification && (
        <motion.div
          initial={{ y: -10, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="p-4 rounded-xl bg-amber-950/50 border border-amber-900 text-amber-400 text-xs flex items-center gap-2 select-none"
        >
          <Database className="w-5 h-5 text-amber-400 shrink-0" />
          <span>بنجاح! تم شحن (6) عمال، (3) سلف، (3) مكافآت وبدلات، وقيود إضافية. تصفح الداشبورد ومسير مايو فوراً!</span>
        </motion.div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6" id="settings-layout">
        
        {/* Left block: Core Settings Form */}
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 lg:col-span-2 space-y-6" id="settings-form-block">
          
          <div className="border-b border-slate-850 pb-4">
            <h3 className="text-sm font-black text-white flex items-center gap-2">
              <Settings className="w-4.5 h-4.5 text-amber-500" />
              <span>تهيئة إعدادات الشركة وقالب احتساب الأجر</span>
            </h3>
            <p className="text-[10px] text-slate-400 mt-1">تحديد المسميات الرسمية، والعملة المتداولة كبادئة للمسيرات، والرمز الضريبي للفاتورة وقوانين العمل الإضافي.</p>
          </div>

          <form onSubmit={handleSave} className="space-y-5 text-right">
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              
              {/* Company Name */}
              <div className="space-y-1.5 md:col-span-2">
                <label className="block text-xs font-bold text-slate-300 flex items-center gap-1">
                  <Building className="w-3.5 h-3.5 text-slate-500" />
                  <span>اسم المؤسسة أو المقاولات الرسمية</span>
                </label>
                <input
                  type="text"
                  value={formCompany}
                  onChange={(e) => setFormCompany(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl py-2.5 px-3.5 text-xs text-white focus:outline-none focus:border-amber-500"
                  required
                />
              </div>

              {/* Currency */}
              <div className="space-y-1.5 flex flex-col justify-end">
                <label className="block text-xs font-bold text-slate-300 flex items-center gap-1">
                  <Coins className="w-3.5 h-3.5 text-slate-500" />
                  <span>العملة المعتمدة للنظام</span>
                </label>
                <select
                  value={currencySelectMode}
                  onChange={(e) => {
                    const val = e.target.value;
                    setCurrencySelectMode(val);
                    if (val !== 'custom') {
                      setFormCurrency(val);
                    }
                  }}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl py-2.5 px-3.5 text-xs text-slate-300 focus:outline-none focus:border-amber-500"
                >
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

              {/* Vat default */}
              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-slate-300">الرقم الضريبي للمنشأة (VAT Number)</label>
                <input
                  type="text"
                  value={formVat}
                  onChange={(e) => setFormVat(e.target.value)}
                  placeholder="رقم السجل الضريبي الاختياري"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl py-2.5 px-3.5 text-xs text-white focus:outline-none focus:border-amber-500 font-mono"
                />
              </div>

              {/* Default Overtime Multiplier */}
              <div className="space-y-1.5 col-span-1 md:col-span-2 border-t border-slate-850 pt-3">
                <label className="block text-xs font-bold text-slate-300 flex items-center gap-1">
                  <Percent className="w-3.5 h-3.5 text-slate-500" />
                  <span>معامل احتساب ساعة العمل الإضافية الافتراضية (Multiplier)</span>
                </label>
                <select
                  value={formMultiplier}
                  onChange={(e) => setFormMultiplier(Number(e.target.value))}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl py-2.5 px-3.5 text-xs text-slate-300 focus:outline-none focus:border-amber-500 font-mono"
                >
                  <option value="1.5">x1.5 (ساعة العمل الإضافية تقابل ساعة ونصف)</option>
                  <option value="2.0">x2.0 (ضعف الأجر للأعياد ومناوبات الطوارئ)</option>
                  <option value="1.25">x1.25 (ساعة العمل تقابل ساعة وربع)</option>
                </select>
                <span className="text-[9px] text-slate-500 block mt-1">
                  * يمكن للمحاسب تعديل معدل الإضافي يدوياً لكل عامل أثناء تدوين ساعات الأوفرتايم المنفذة بفليكس جاف.
                </span>
              </div>

            </div>

            <div className="border-t border-slate-850 pt-4 flex items-center justify-end">
              <button
                type="submit"
                className="py-2.5 px-6 bg-amber-500 hover:bg-amber-400 text-slate-950 font-black rounded-xl text-xs flex items-center gap-2 cursor-pointer shadow-md transition-colors"
                id="save-settings-btn"
              >
                <Save className="w-4 h-4 text-slate-950" />
                <span>حفظ تمليس الإعدادات</span>
              </button>
            </div>

          </form>

        </div>

        {/* Right block: Danger zone and Demo loader */}
        <div className="space-y-6" id="settings-secondary-panel">
          
          {/* Section 1: Seed Demo Data */}
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 space-y-4">
            <h4 className="text-xs font-black text-amber-500 uppercase tracking-wider flex items-center gap-1.5">
              <Database className="w-4 h-4 text-amber-500" />
              <span>مختبر فحص الأنظمة والاختبار</span>
            </h4>
            <p className="text-xs text-slate-400 leading-relaxed">
              لتسهيل فحص وتقييم البرنامج فورياً دون إهدار وقتك في كتابة العمال، يمكنك إطلاق أداة "شحن داتا تجريبية" لحقن 6 ملفات عمال وسجلات مالية جاهزة كاملة للتجريب.
            </p>
            
            <button
              onClick={triggerLoadDemoData}
              className="w-full py-3 px-4 bg-slate-950 hover:bg-amber-500 hover:text-slate-950 border border-slate-800 hover:border-amber-500 text-amber-500 font-black rounded-xl text-xs flex items-center justify-center gap-2 transition-all cursor-pointer shadow-sm shadow-amber-950/20 active:scale-95"
              id="load-demo-btn"
            >
              <RefreshCw className="w-4 h-4" />
              <span>شحن قاعدة بيانات عمال وسلف تجريبية</span>
            </button>
          </div>

          {/* Section 2: Zero database wipe */}
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 space-y-4 border-l-4 border-l-red-500">
            <h4 className="text-xs font-black text-red-500 uppercase tracking-wider flex items-center gap-1.5">
              <AlertCircle className="w-4 h-4 text-red-500" />
              <span>منطقة العمل الحقيقي (تصفير ومسح)</span>
            </h4>
            <p className="text-xs text-slate-400 leading-relaxed text-right">
              حذف تام وشامل لكبسة قيود وسجلات العاملين والديون والسلف لتنظيف الحافظة كلياً وتسجيل عمال موقعك وطاقمك الفعلي من الصفر.
            </p>
            
            <button
              onClick={triggerWipeData}
              className="w-full py-3 px-4 bg-slate-950 hover:bg-red-950/60 border border-slate-800 hover:border-red-900/60 text-slate-400 hover:text-red-400 font-bold rounded-xl text-xs flex items-center justify-center gap-2 cursor-pointer transition-all active:scale-95"
              id="wipe-all-db-btn"
            >
              <Trash2 className="w-4 h-4 text-red-400" />
              <span>مسح ومحو كافة البيانات للبدء بالانطلاق</span>
            </button>
          </div>

          {/* Informative Security Footer */}
          <div className="p-4 bg-slate-950/40 rounded-2xl border border-slate-850/60 text-slate-500 text-[10px] space-y-1 select-none leading-normal">
            <div className="flex items-center gap-1.5 text-slate-400 font-bold">
              <ShieldCheck className="w-4 h-4 text-emerald-500 shrink-0" />
              <span>سرية بيانات الخادم المحلي</span>
            </div>
            <p>جميع القيود المحاسبية، وسير العمال وحوافظ السرف والديون يتم تخزينها وتشفيرها محلياً بأمان تام على متصفحك وجهازك الخاص دون إرسالها لأي جهة خارجية.</p>
          </div>

        </div>

      </div>

    </div>
  );
}
