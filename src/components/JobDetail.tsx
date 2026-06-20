import React, { useState } from 'react';
import { Job, HistoryEntry } from '../types';
import { 
  ArrowLeft, Edit, Play, Clock, Inbox, Folder, 
  ChevronDown, ChevronUp, Terminal, CheckCircle2, 
  XCircle, Loader2, Calendar, FileSpreadsheet, Mail 
} from 'lucide-react';

interface JobDetailProps {
  job: Job;
  onBack: () => void;
  onEdit: (job: Job) => void;
  onRunNow: (jobId: string) => void;
  runningJobs: Record<string, boolean>;
}

export default function JobDetail({ job, onBack, onEdit, onRunNow, runningJobs }: JobDetailProps) {
  const [logsExpanded, setLogsExpanded] = useState(true);
  const isCurrentlyRunning = runningJobs[job.id] || false;

  // Render a clean badge for datasource
  const renderSourceBadge = (source: 'SQL Server' | 'MySQL') => {
    if (source === 'SQL Server') {
      return (
        <span className="inline-flex items-center px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-[#E0F2FE] dark:bg-sky-950/45 text-[#0369A1] dark:text-sky-300">
          SQL Server
        </span>
      );
    }
    return (
      <span className="inline-flex items-center px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-[#F0FDFA] dark:bg-teal-950/45 text-[#0F766E] dark:text-teal-300">
        MySQL
      </span>
    );
  };

  // Convert English frequency to elegant Georgian description
  const getFrequencyText = () => {
    if (job.frequency === 'daily') return 'ყოველდღე';
    if (job.frequency === 'weekdays') return `კვირის დღეები (${job.weekdays.join(', ')})`;
    return `ყოველ ${job.everyNDays} დღეში`;
  };

  // Get active run times separated by comma
  const getTimesText = () => {
    return job.runTimes ? job.runTimes.join(', ') : '08:00';
  };

  // Generate logs on the fly based on history or state
  const mockSystemLogs = [
    `[2026-06-19 10:45:32] [INFO] Starting report scheduler service engine...`,
    `[2026-06-19 10:45:32] [INFO] Target job loaded: "${job.name}" (ID: ${job.id})`,
    `[2026-06-19 10:45:33] [INFO] Connecting to remote host address "${job.server}" on DB "${job.database}"...`,
    `[2026-06-19 10:45:34] [INFO] Driver PyODBC handshake completed successfully. Connection established.`,
    `[2026-06-19 10:45:34] [INFO] Executive parser running user SQL Query...`,
    `[2026-06-19 10:45:35] [SQL] ${job.query.substring(0, 120)}${job.query.length > 120 ? '...' : ''}`,
    `[2026-06-19 10:45:35] [SUCCESS] DB query returned active rows. Mapping cell structures into XLSX stream...`,
    `[2026-06-19 10:45:36] [INFO] Writing output file: ${job.excelFolder || 'DefaultPath'}\\${job.name || 'Report'}-20260619.xlsx`,
    `[2026-06-19 10:45:36] [INFO] File serialization success. Size: 184 KB.`,
    `[2026-06-19 10:45:36] [INFO] Initiated delivery method dispatch via channel [${job.deliveryMethod}]`,
    `[2026-06-19 10:45:37] [SMTP] Prepared recipient stream envelope: [${job.recipients.join(', ')}]`,
    `[2026-06-19 10:45:38] [SUCCESS] All pipeline actions executed. Status: OK. duration=${job.history[0]?.duration || '2.4s'}.`,
  ];

  return (
    <div className="space-y-6">
      {/* Back navigation & primary action headers */}
      <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-slate-200 dark:border-slate-800">
        <div className="flex items-center gap-3">
          <button 
            id="job_detail_back_btn"
            onClick={onBack}
            className="p-2 border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors cursor-pointer text-slate-600 dark:text-slate-350"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
          
          <div className="flex flex-col text-left">
            <div className="flex items-center gap-2 flex-wrap">
              <h1 className="text-xl font-bold font-sans tracking-tight text-slate-800 dark:text-white">
                {job.name}
              </h1>
              {renderSourceBadge(job.source)}
            </div>
            <span className="text-xs text-slate-400 dark:text-slate-500 font-mono mt-0.5">
              ID: {job.id} · ბაზა: {job.database}
            </span>
          </div>
        </div>

        {/* Action button grouping */}
        <div className="flex items-center gap-2">
          {/* Edit button */}
          <button 
            id="job_detail_edit_btn"
            onClick={() => onEdit(job)}
            className="h-10 px-4 border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-lg text-xs font-semibold inline-flex items-center gap-1.5 transition-colors cursor-pointer text-slate-700 dark:text-slate-350"
          >
            <Edit className="w-4 h-4 text-[#185FA5]" />
            რედაქტირება
          </button>

          {/* Run Now Button */}
          <button 
            id="job_detail_run_btn"
            onClick={() => onRunNow(job.id)}
            disabled={isCurrentlyRunning}
            className={`h-10 px-5 font-semibold text-xs rounded-lg transition-all inline-flex items-center gap-1.5 cursor-pointer shadow-sm active:scale-95 text-white ${
              isCurrentlyRunning 
                ? 'bg-amber-500 pointer-events-none' 
                : 'bg-[#185FA5] hover:bg-[#124982]'
            }`}
          >
            {isCurrentlyRunning ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                მუშაობს...
              </>
            ) : (
              <>
                <Play className="w-4 h-4" />
                ახლავე გაშვება
              </>
            )}
          </button>
        </div>
      </div>

      {/* Summary grid details strip */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        {/* Schedule */}
        <div className="p-4 bg-white dark:bg-slate-900 border border-transparent hairline dark:border-slate-800/60 rounded-xl shadow-sm flex items-start gap-3 text-left">
          <div className="p-2 rounded-lg bg-sky-50 dark:bg-sky-950/35 text-[#185FA5] dark:text-sky-400 shrink-0">
            <Clock className="w-5 h-5" />
          </div>
          <div className="flex flex-col overflow-hidden">
            <span className="text-[11px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
              განრიგი
            </span>
            <span className="text-sm font-semibold truncate text-slate-850 dark:text-slate-200">
              {getFrequencyText()}
            </span>
            <span className="text-xs text-slate-400 dark:text-slate-500 mt-0.5">
              დრო: {getTimesText()}
            </span>
          </div>
        </div>

        {/* Delivery Method */}
        <div className="p-4 bg-white dark:bg-slate-900 border border-transparent hairline dark:border-slate-800/60 rounded-xl shadow-sm flex items-start gap-3 text-left">
          <div className="p-2 rounded-lg bg-emerald-50 dark:bg-emerald-950/35 text-emerald-600 dark:text-emerald-400 shrink-0">
            <Inbox className="w-5 h-5" />
          </div>
          <div className="flex flex-col overflow-hidden">
            <span className="text-[11px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
              გაგზავნის არხი
            </span>
            <span className="text-sm font-semibold truncate text-slate-850 dark:text-slate-200">
              {job.deliveryMethod}
            </span>
            <span className="text-xs text-slate-400 dark:text-slate-500 mt-0.5">
              არხი: {job.deliveryMethod === 'SMTP' ? 'მყისიერი მეილი' : 'ფაილი + Webhook'}
            </span>
          </div>
        </div>

        {/* Recipients */}
        <div className="p-4 bg-white dark:bg-slate-900 border border-transparent hairline dark:border-slate-800/60 rounded-xl shadow-sm flex items-start gap-3 text-left">
          <div className="p-2 rounded-lg bg-purple-50 dark:bg-purple-950/35 text-purple-600 dark:text-purple-400 shrink-0">
            <Mail className="w-5 h-5" />
          </div>
          <div className="flex flex-col overflow-hidden w-full">
            <span className="text-[11px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
              მიმღებები
            </span>
            <span className="text-sm font-semibold truncate text-slate-850 dark:text-slate-200" title={job.recipients.join(', ')}>
              {job.recipients[0] || 'Default'}
            </span>
            <span className="text-xs text-slate-400 dark:text-slate-500 mt-0.5 truncate">
              {job.recipients.length > 1 ? `და სხვა ${job.recipients.length - 1}` : 'სულ 1 მისამართი'}
            </span>
          </div>
        </div>

        {/* Folder */}
        <div className="p-4 bg-white dark:bg-slate-900 border border-transparent hairline dark:border-slate-800/60 rounded-xl shadow-sm flex items-start gap-3 text-left">
          <div className="p-2 rounded-lg bg-amber-50 dark:bg-amber-950/35 text-amber-600 dark:text-amber-400 shrink-0">
            <Folder className="w-5 h-5" />
          </div>
          <div className="flex flex-col overflow-hidden w-full">
            <span className="text-[11px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
              EXCEL საქაღალდე
            </span>
            <span className="text-sm font-semibold truncate text-slate-850 dark:text-slate-200" title={job.excelFolder}>
              {job.excelFolder}
            </span>
            <span className="text-xs text-slate-400 dark:text-slate-500 mt-0.5">
              ლოკალური დირექტორია
            </span>
          </div>
        </div>

        {/* Next Run Time */}
        <div className="p-4 bg-white dark:bg-slate-900 border border-transparent hairline dark:border-slate-800/60 rounded-xl shadow-sm flex items-start gap-3 text-left">
          <div className="p-2 rounded-lg bg-indigo-50 dark:bg-indigo-950/35 text-indigo-600 dark:text-indigo-400 shrink-0">
            <Calendar className="w-5 h-5" />
          </div>
          <div className="flex flex-col overflow-hidden">
            <span className="text-[11px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
              შემდეგი გაშვება
            </span>
            <span className="text-sm font-semibold truncate text-slate-850 dark:text-slate-200">
              დღეს {job.runTimes?.[1] || '18:00'}
            </span>
            <span className="text-xs text-slate-400 dark:text-slate-500 mt-0.5">
              სისტემური ტრიგერი
            </span>
          </div>
        </div>
      </div>

      {/* SQL Query block */}
      <div className="bg-white dark:bg-slate-900 border border-transparent hairline dark:border-slate-800/60 rounded-xl shadow-sm p-4 text-left space-y-2">
        <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
          SQL EXECUTION CODE
        </h3>
        <pre className="font-mono text-xs p-3 bg-slate-900 dark:bg-slate-950 text-sky-400 dark:text-sky-300 rounded-lg overflow-x-auto leading-relaxed max-h-36 overflow-y-auto">
          {job.query}
        </pre>
      </div>

      {/* Past run statistics table list */}
      <div className="bg-white dark:bg-slate-900 border border-transparent hairline dark:border-slate-800/60 rounded-xl shadow-sm overflow-hidden text-left">
        <div className="px-5 py-4 border-b border-slate-150 dark:border-slate-800 flex justify-between items-center bg-slate-50/50 dark:bg-slate-850/50">
          <h2 className="text-sm font-bold text-slate-700 dark:text-white uppercase tracking-wider font-sans">
            ისტორია (ბოლო 5 გაშვება)
          </h2>
          <span className="text-xs px-2.5 py-0.5 rounded-full font-semibold bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-350">
            ჯამში: {job.history ? job.history.length : 0}
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-150 dark:border-slate-800 bg-slate-50 dark:bg-slate-850 text-[11px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
                <th className="px-5 py-3 font-medium">თარიღი</th>
                <th className="px-5 py-3 font-medium text-center">სტატუსი</th>
                <th className="px-5 py-3 font-medium text-right">ჩანაწერები</th>
                <th className="px-5 py-3 font-medium text-right">ხანგრძლივობა</th>
                <th className="px-5 py-3 font-medium">შეტყობინება</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-150 dark:divide-slate-800">
              {job.history && job.history.length > 0 ? (
                job.history.map((run) => (
                  <tr 
                    key={run.id} 
                    className="hover:bg-slate-50 dark:hover:bg-slate-850/40 text-xs transition-colors"
                  >
                    <td className="px-5 py-3 font-medium font-mono text-slate-500 dark:text-slate-400 shrink-0 whitespace-nowrap">
                      {run.timestamp}
                    </td>
                    <td className="px-5 py-3 text-center">
                      <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold ${
                        run.status === 'წარმატება' 
                          ? 'bg-emerald-100 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-400' 
                          : 'bg-rose-100 dark:bg-rose-950/50 text-rose-700 dark:text-rose-400'
                      }`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${
                          run.status === 'წარმატება' ? 'bg-emerald-500' : 'bg-rose-500'
                        }`} />
                        {run.status}
                      </span>
                    </td>
                    <td className="px-5 py-3 text-right font-medium font-mono">
                      {run.records.toLocaleString()}
                    </td>
                    <td className="px-5 py-3 text-right font-medium font-mono text-slate-500 dark:text-slate-400">
                      {run.duration}
                    </td>
                    <td className="px-5 py-3 text-slate-600 dark:text-slate-350 max-w-sm truncate lg:max-w-md" title={run.message}>
                      {run.message}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={5} className="px-5 py-8 text-center text-xs text-slate-400 dark:text-slate-500 italic">
                    ისტორია ცარიელია
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Monospace collapsible active logs panel */}
      <div className="bg-slate-900 border border-slate-950 rounded-xl overflow-hidden text-left shadow-lg">
        <button
          onClick={() => setLogsExpanded(!logsExpanded)}
          className="w-full px-5 py-3.5 flex items-center justify-between hover:bg-slate-850 transition-colors text-slate-200 cursor-pointer"
        >
          <div className="flex items-center gap-2">
            <Terminal className="w-4 h-4 text-emerald-400" />
            <span className="text-xs font-semibold uppercase tracking-wider font-sans">
              ლოგი (სტატუს კონსოლი)
            </span>
          </div>
          {logsExpanded ? (
            <ChevronUp className="w-4 h-4 text-slate-400" />
          ) : (
            <ChevronDown className="w-4 h-4 text-slate-400" />
          )}
        </button>

        {logsExpanded && (
          <div className="p-4 bg-slate-950 text-emerald-400 dark:text-emerald-450 border-t border-slate-900 font-mono text-xs leading-relaxed space-y-1.5 max-h-[240px] overflow-y-auto selection:bg-emerald-800 selection:text-white">
            {mockSystemLogs.map((logLine, index) => (
              <div key={index} className="truncate select-text">
                <span className="text-slate-500 select-none mr-2">{(index + 1).toString().padStart(2, '0')}</span>
                {logLine}
              </div>
            ))}
            {isCurrentlyRunning && (
              <div className="flex items-center gap-1.5 text-amber-400 animate-pulse font-bold mt-2">
                <span>&gt;&gt; Pipe stream working... [EXCEL EXPORT INTERPRETER RUNNING]</span>
              </div>
            )}
          </div>
        )}
      </div>

    </div>
  );
}
