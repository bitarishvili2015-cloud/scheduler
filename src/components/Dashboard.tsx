import React, { useState } from 'react';
import { Job } from '../types';
import { 
  Play, Edit, Trash2, Clock, Calendar, CheckCircle, 
  XCircle, AlertCircle, Loader2, Database, ListCollapse, 
  Plus, Server, Settings, FileSpreadsheet, Activity 
} from 'lucide-react';

interface DashboardProps {
  jobs: Job[];
  onSelectJob: (job: Job) => void;
  onEditJob: (job: Job) => void;
  onDeleteJob: (jobId: string) => void;
  onAddNewReport: () => void;
  onRunNow: (jobId: string) => void;
  runningJobs: Record<string, boolean>;
}

export default function Dashboard({ 
  jobs, onSelectJob, onEditJob, onDeleteJob, 
  onAddNewReport, onRunNow, runningJobs 
}: DashboardProps) {
  
  // Custom delete confirmation state
  const [jobToDelete, setJobToDelete] = useState<Job | null>(null);

  // Computed Metrics
  const activeJobsCount = jobs.length;
  
  // "დღეს გაეშვა" - let's compute based on history runs belonging to 2026-06-19 or "დღეს"
  const todayRunsCount = jobs.reduce((count, job) => {
    const todayHits = job.history.filter(h => h.timestamp.includes('2026-06-19') || h.timestamp.includes('დღეს')).length;
    return count + todayHits;
  }, 0);

  // "შეცდომა" - count of current jobs whose last status is 'შეცდომა'
  const errorJobsCount = jobs.filter(job => job.lastStatus === 'შეცდომა').length;

  // Render a clean badge for database source
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
  const getFrequencyText = (job: Job) => {
    if (job.frequency === 'daily') return 'ორშ-კვი · 09:00, 18:00';
    if (job.frequency === 'weekdays') {
      const days = job.weekdays.length > 0 ? job.weekdays.join(', ') : 'ორშ, ოთხ, პარ';
      const hours = job.runTimes ? job.runTimes.join(', ') : '08:00';
      return `${days} · ${hours}`;
    }
    // everyN
    return `ყოველ ${job.everyNDays} დღეში · ${job.runTimes?.[0] || '08:00'}`;
  };

  const confirmDelete = (e: React.MouseEvent, job: Job) => {
    e.stopPropagation();
    setJobToDelete(job);
  };

  const handleConfirmDelete = () => {
    if (jobToDelete) {
      onDeleteJob(jobToDelete.id);
      setJobToDelete(null);
    }
  };

  return (
    <div className="space-y-6">
      
      {/* 3 Metrics Cards row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-8">
        {/* Active Jobs */}
        <div className="p-5 bg-white dark:bg-slate-900 border border-transparent hairline dark:border-slate-800/60 rounded-xl shadow-sm flex items-center justify-between text-left">
          <div className="flex flex-col gap-1">
            <span className="text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wilder font-sans">
              აქტიური job
            </span>
            <span className="text-3xl font-bold font-sans text-slate-850 dark:text-gray-100">
              {activeJobsCount}
            </span>
          </div>
          <div className="w-12 h-12 rounded-xl bg-sky-50 dark:bg-sky-950/40 text-[#185FA5] dark:text-sky-300 flex items-center justify-center">
            <Activity className="w-6 h-6" />
          </div>
        </div>

        {/* Today Run */}
        <div className="p-5 bg-white dark:bg-slate-900 border border-transparent hairline dark:border-slate-800/60 rounded-xl shadow-sm flex items-center justify-between text-left">
          <div className="flex flex-col gap-1">
            <span className="text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wilder font-sans">
              დღეს გაეშვა
            </span>
            <span className="text-3xl font-bold font-sans text-slate-850 dark:text-gray-100">
              {todayRunsCount}
            </span>
          </div>
          <div className="w-12 h-12 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
            <CheckCircle className="w-6 h-6" />
          </div>
        </div>

        {/* Errors card */}
        <div className={`p-5 bg-white dark:bg-slate-900 border-transparent border-l-4 hairline rounded-xl shadow-sm flex items-center justify-between text-left ${
          errorJobsCount > 0 ? 'border-l-red-500 border-y border-r border-slate-150 dark:border-slate-805' : 'border-l-transparent dark:border-slate-800/60'
        }`}>
          <div className="flex flex-col gap-1">
            <span className="text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wilder font-sans">
              შეცდომა
            </span>
            <span className={`text-3xl font-bold font-sans ${errorJobsCount > 0 ? 'text-red-650 dark:text-red-400' : 'text-slate-850 dark:text-gray-100'}`}>
              {errorJobsCount}
            </span>
          </div>
          <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
            errorJobsCount > 0 
              ? 'bg-red-50 dark:bg-red-950/40 text-red-500' 
              : 'bg-slate-50 dark:bg-slate-800/60 text-slate-400'
          }`}>
            <AlertCircle className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* Main List Column */}
      <div className="bg-white dark:bg-slate-900 rounded-xl hairline border-transparent dark:border-slate-800/60 shadow-sm overflow-hidden flex flex-col">
        <div className="px-6 py-4 border-b border-gray-100 dark:border-slate-800/80 bg-gray-50/50 dark:bg-slate-850/40 flex justify-between items-center">
          <h2 className="text-sm font-semibold text-slate-700 dark:text-slate-350 tracking-tight font-sans">
            ანგარიშების სია
          </h2>
          <span className="text-xs text-gray-500 dark:text-gray-400">
            სულ {jobs.length} ჩანაწერი
          </span>
        </div>

        {jobs.length > 0 ? (
          <div className="divide-y divide-gray-100 dark:divide-slate-800/60">
            {jobs.map((job) => {
              const worksNow = runningJobs[job.id] || false;
              
              return (
                <div 
                  key={job.id}
                  id={`job_row_${job.id}`}
                  onClick={() => onSelectJob(job)}
                  className="px-6 py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-gray-50/60 dark:hover:bg-slate-800/40 cursor-pointer transition-all active:bg-slate-100 group"
                >
                  
                  {/* Left Column: Status info + Title + Clock */}
                  <div className="flex items-center gap-4 text-left flex-1 min-w-0">
                    {/* Status Dot */}
                    <div className="select-none shrink-0 flex items-center">
                      {worksNow ? (
                        <div className="w-2.5 h-2.5 rounded-full bg-amber-500 animate-pulse" />
                      ) : job.lastStatus === 'წარმატება' ? (
                        <div className="w-2.5 h-2.5 rounded-full bg-green-500" title="გაშვება წარმატებულია" />
                      ) : job.lastStatus === 'შეცდომა' ? (
                        <div className="w-2.5 h-2.5 rounded-full bg-red-500" title="დაფიქსირდა შეცდომა" />
                      ) : (
                        <div className="w-2.5 h-2.5 rounded-full bg-slate-300 dark:bg-slate-700" title="ველოდებით გაშვებას" />
                      )}
                    </div>

                    {/* Meta info of scheduled task */}
                    <div className="space-y-1 overflow-hidden">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-sm font-semibold text-slate-850 dark:text-white truncate group-hover:text-[#185FA5] dark:group-hover:text-sky-300 transition-colors">
                          {job.name}
                        </span>
                        {renderSourceBadge(job.source)}
                      </div>

                      <div className="flex items-center gap-1.5 text-xs text-slate-400 dark:text-slate-500">
                        <Clock className="w-3.5 h-3.5 text-slate-400" />
                        <span className="truncate">
                          {getFrequencyText(job)}
                        </span>
                        <span className="text-slate-250 dark:text-slate-750 select-none">|</span>
                        <span className="truncate max-w-[140px] sm:max-w-none text-slate-400" title={job.excelFolder}>
                          {job.excelFolder}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Right Column: Status Summary Text & Action Buttons */}
                  <div className="flex items-center justify-between sm:justify-end gap-6 shrink-0 border-t sm:border-t-0 border-slate-100 dark:border-slate-850 pt-2 sm:pt-0">
                    
                    {/* Latest Run Status label */}
                    <div className="flex flex-col text-left sm:text-right">
                      <span className="text-[11px] font-mono text-slate-400 dark:text-slate-500">
                        {job.lastRun ? `ბოლო: ${job.lastRun}` : 'ჯერ არ გაშვებულა'}
                      </span>
                      
                      <span className={`text-xs font-bold font-sans mt-0.5 ${
                        worksNow 
                          ? 'text-amber-500 animate-pulse'
                          : job.lastStatus === 'წარმატება' 
                          ? 'text-emerald-600 dark:text-emerald-400' 
                          : job.lastStatus === 'შეცდომა' 
                          ? 'text-rose-600 dark:text-rose-400' 
                          : 'text-slate-400 dark:text-slate-500'
                      }`}>
                        {worksNow ? 'მუშაობს...' : job.lastStatus}
                      </span>
                    </div>

                    {/* Action Panel icons */}
                    <div className="flex items-center gap-1.5" onClick={(e) => e.stopPropagation()}>
                      {/* Play Action button */}
                      <button 
                        id={`run_job_now_btn_${job.id}`}
                        onClick={() => onRunNow(job.id)}
                        disabled={worksNow}
                        className={`p-2 rounded-lg border text-slate-600 border-slate-200 dark:border-slate-800 hover:text-emerald-600 hover:border-emerald-250 dark:hover:text-emerald-400 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors cursor-pointer disabled:opacity-50 disabled:pointer-events-none`}
                        title="ახლავე გაშვება"
                      >
                        {worksNow ? (
                          <Loader2 className="w-4 h-4 animate-spin text-amber-500" />
                        ) : (
                          <Play className="w-4 h-4" />
                        )}
                      </button>

                      {/* Edit Action button */}
                      <button 
                        id={`edit_job_btn_${job.id}`}
                        onClick={() => onEditJob(job)}
                        className="p-2 rounded-lg border text-slate-600 dark:text-slate-350 border-slate-200 dark:border-slate-800 hover:text-[#185FA5] hover:border-sky-300 dark:hover:text-sky-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                        title="რედაქტირება"
                      >
                        <Edit className="w-4 h-4" />
                      </button>

                      {/* Delete Action button */}
                      <button 
                        id={`delete_job_btn_${job.id}`}
                        onClick={(e) => confirmDelete(e, job)}
                        className="p-2 rounded-lg border text-slate-600 dark:text-slate-350 border-slate-200 dark:border-slate-800 hover:text-rose-600 hover:border-rose-250 dark:hover:text-rose-400 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                        title="წაშლა"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>

                  </div>

                </div>
              );
            })}
          </div>
        ) : (
          /* EMBEDDED EMPTY STATE PANEL */
          <div className="p-12 text-center flex flex-col items-center justify-center max-w-md mx-auto space-y-4">
            <div className="w-16 h-16 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-300 dark:text-slate-600 mb-2">
              <ListCollapse className="w-8 h-8" />
            </div>
            
            <h3 id="empty_state_title" className="text-base font-bold text-slate-800 dark:text-slate-200">
              ჯერ ანგარიში არ გაქვს
            </h3>
            
            <p className="text-xs text-slate-400 dark:text-slate-500 leading-relaxed font-sans">
              დააჭირეთ ქვემოთ მოცემულ ღილაკს, რომ შექმნათ თქვენი პირველი ავტომატიზებული SQL ექსპორტის მენეჯერი.
            </p>

            <button 
              id="empty_state_create_btn"
              onClick={onAddNewReport}
              className="px-5 py-2.5 bg-[#185FA5] hover:bg-[#124982] text-white font-medium text-xs rounded-lg transition-all inline-flex items-center gap-1.5 cursor-pointer shadow-md"
            >
              <Plus className="w-4 h-4" />
              ახალი ანგარიში
            </button>
          </div>
        )}
      </div>

      {/* CUSTOM BUILT-IN CONFIRM DELETE MODAL */}
      {jobToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/55 backdrop-blur-xs">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-slate-100 p-6 rounded-xl max-w-sm w-full space-y-4 shadow-2xl text-left animate-in fade-in duration-200">
            <div className="flex gap-3 text-rose-600">
              <AlertCircle className="w-8 h-8 shrink-0" />
              <div className="space-y-1">
                <h3 className="text-base font-bold font-sans">ნამდვილად გსურთ წაშლა?</h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                  ანგარიში <strong className="text-slate-700 dark:text-slate-300">"{jobToDelete.name}"</strong> წაიშლება შეუქცევადად ყველა განრიგთან და ისტორიასთან ერთად.
                </p>
              </div>
            </div>

            <div className="flex justify-end gap-2.5 pt-2">
              <button
                type="button"
                onClick={() => setJobToDelete(null)}
                className="px-4 py-2 border border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg text-xs font-semibold cursor-pointer text-slate-700 dark:text-slate-300 transition-colors"
              >
                გაუქმება
              </button>
              <button
                id="confirm_delete_button"
                type="button"
                onClick={handleConfirmDelete}
                className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-lg text-xs font-semibold cursor-pointer shadow-sm transition-colors"
              >
                წაშლა
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
