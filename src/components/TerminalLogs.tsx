/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useRef, useEffect } from 'react';
import { Terminal, Trash2, ShieldCheck } from 'lucide-react';
import { TerminalLog } from '../types';

interface TerminalLogsProps {
  logs: TerminalLog[];
  onClear: () => void;
}

export default function TerminalLogs({ logs, onClear }: TerminalLogsProps) {
  const terminalRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (terminalRef.current) {
      terminalRef.current.scrollTop = terminalRef.current.scrollHeight;
    }
  }, [logs]);

  return (
    <div className="bg-slate-950 border border-slate-800 rounded-2xl overflow-hidden shadow-xl" id="accounting-logger">
      {/* Logger Titlebar */}
      <div className="bg-slate-900 border-b border-slate-800 px-4 py-3 flex items-center justify-between" id="terminal-bar">
        <div className="flex items-center gap-2">
          <div className="flex gap-1.5">
            <span className="w-3 h-3 rounded-full bg-red-500/85 inline-block" />
            <span className="w-3 h-3 rounded-full bg-amber-500/85 inline-block" />
            <span className="w-3 h-3 rounded-full bg-emerald-500/85 inline-block" />
          </div>
          <span className="text-xs font-semibold text-slate-400 mr-2 flex items-center gap-1.5 select-none">
            <Terminal className="w-4 h-4 text-amber-500" />
            سجل التدقيق والمراقبة المحاسبية الفوري (Audit & Activity Logs)
          </span>
        </div>
        
        <div className="flex items-center gap-2">
          <span className="text-[10px] font-mono text-amber-400 bg-amber-950/40 px-2 py-0.5 rounded-full border border-amber-900/60 flex items-center gap-1 select-none">
            <ShieldCheck className="w-3.5 h-3.5" />
            دفتر الأستاذ مشفر محلياً
          </span>
          <button
            onClick={onClear}
            disabled={logs.length === 0}
            className="p-1 hover:bg-slate-800 rounded text-slate-400 hover:text-slate-200 transition-colors disabled:opacity-30 disabled:pointer-events-none cursor-pointer"
            title="مسح سجل العمليات"
            id="clear-logs-btn"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Logger Output */}
      <div 
        ref={terminalRef}
        className="p-4 h-36 overflow-y-auto font-mono text-xs space-y-1.5 scrollbar-thin scrollbar-thumb-slate-800 scrollbar-track-transparent select-text"
        id="terminal-output"
      >
        {logs.length === 0 ? (
          <div className="text-slate-600 flex items-center justify-center h-full text-xs italic">
            بانتظار الحركات المالية... قم بإضافة عمال أو تسجيل سلف ومكافآت أو صرف رواتب لمشاهدة قيود التدقيق المزدوج هنا.
          </div>
        ) : (
          logs.map((log, index) => {
            let textColor = 'text-slate-300';
            let prefix = '⚙️';
            
            if (log.type === 'success') {
              textColor = 'text-emerald-400';
              prefix = '🟢 [تم]';
            } else if (log.type === 'error') {
              textColor = 'text-red-400 font-bold';
              prefix = '🔴 [فشل]';
            } else if (log.type === 'warning') {
              textColor = 'text-amber-400';
              prefix = '⚠️ [تنبيه]';
            } else if (log.type === 'command') {
              textColor = 'text-blue-400';
              prefix = '🔵 [قيد]';
            }

            return (
              <div key={index} className="flex items-start gap-2 py-1 border-b border-slate-900/30 hover:bg-slate-900/50 rounded px-1 transition-colors">
                <span className="text-[10px] text-slate-500 shrink-0 select-none">{log.timestamp}</span>
                <span className="text-slate-400 text-[10px] uppercase font-bold shrink-0 select-none mr-1">{prefix}</span>
                <span className="whitespace-pre-wrap break-all leading-relaxed text-right md:text-right font-sans">
                  {log.text}
                </span>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
