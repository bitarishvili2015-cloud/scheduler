import React, { useState, useEffect } from 'react';
import { Job, Settings, HistoryEntry } from './types';
import { INITIAL_JOBS, INITIAL_SETTINGS } from './mockData';
import Dashboard from './components/Dashboard';
import JobWizard from './components/JobWizard';
import JobDetail from './components/JobDetail';
import SettingsPage from './components/SettingsPage';
import { 
  FileSpreadsheet, Plus, Settings as SettingsIcon, Sun, Moon, 
  Clock, Database, Terminal, ChevronRight, LayoutGrid 
} from 'lucide-react';

export default function App() {
  // Primary Local States
  const [jobs, setJobs] = useState<Job[]>(INITIAL_JOBS);
  const [settings, setSettings] = useState<Settings>(INITIAL_SETTINGS);
  
  // Navigation State
  // 'dashboard' | 'settings' | 'detail'
  const [currentTab, setCurrentTab] = useState<'dashboard' | 'settings' | 'detail'>('dashboard');
  const [selectedJobId, setSelectedJobId] = useState<string | null>(null);

  // Wizard Dialog States
  const [wizardOpen, setWizardOpen] = useState(false);
  const [editingJob, setEditingJob] = useState<Job | null>(null);

  // Real-time Running Simulations State
  const [runningJobs, setRunningJobs] = useState<Record<string, boolean>>({});

  // Apply default theme on mount
  useEffect(() => {
    const savedTheme = settings.theme || 'light';
    if (savedTheme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [settings.theme]);

  // Active Job selection helper
  const activeJob = jobs.find(j => j.id === selectedJobId) || null;

  // Handle Play simulation
  const triggerRunNow = (jobId: string) => {
    if (runningJobs[jobId]) return;

    // Set simulating
    setRunningJobs(prev => ({ ...prev, [jobId]: true }));

    // Update job status to 'მუშაობს...' during simulation
    setJobs(prevJobs => prevJobs.map(job => {
      if (job.id === jobId) {
        return {
          ...job,
          lastStatus: 'მუშაობს...',
        };
      }
      return job;
    }));

    setTimeout(() => {
      const activeDateTime = new Date();
      const currentHours = activeDateTime.getHours().toString().padStart(2, '0');
      const currentMinutes = activeDateTime.getMinutes().toString().padStart(2, '0');
      const timestampString = `2026-06-19 ${currentHours}:${currentMinutes}`;
      const lastRunLabel = `დღეს ${currentHours}:${currentMinutes}`;

      const newHistoryEntry: HistoryEntry = {
        id: `h-sim-${Math.random().toString(36).substr(2, 9)}`,
        timestamp: timestampString,
        status: 'წარმატება',
        records: Math.floor(Math.random() * 1200) + 240,
        duration: `${(Math.random() * 4 + 1.2).toFixed(1)}წმ`,
        message: 'რბილი გაშვება (ახლავე გაშვება). რეპორტი წარმატებით მომზადდა, Microsoft Excel ფაილი დაგენერირდა და გაიგზავნა.',
      };

      setJobs(prevJobs => prevJobs.map(job => {
        if (job.id === jobId) {
          return {
            ...job,
            lastRun: lastRunLabel,
            lastStatus: 'წარმატება',
            history: [newHistoryEntry, ...job.history],
          };
        }
        return job;
      }));

      // Turn off simulating state
      setRunningJobs(prev => ({ ...prev, [jobId]: false }));
    }, 1500);
  };

  // Handle Editing Job initiation (opens wizard prefilled)
  const handleEditJobInitiate = (job: Job) => {
    setEditingJob(job);
    setWizardOpen(true);
  };

  // Handle Add New Report initiation
  const handleAddNewReportInitiate = () => {
    setEditingJob(null);
    setWizardOpen(true);
  };

  // Save/Update job inside the state array
  const handleSaveWizardJob = (savedJob: Job) => {
    // Check if it exists to replace, otherwise insert
    const exists = jobs.some(j => j.id === savedJob.id);
    if (exists) {
      setJobs(prevJobs => prevJobs.map(j => j.id === savedJob.id ? savedJob : j));
    } else {
      setJobs(prevJobs => [savedJob, ...prevJobs]);
    }
    setWizardOpen(false);
    setEditingJob(null);

    // If we were viewing the detail page of the current editing job, we keep viewing it but updated!
    if (currentTab === 'detail' && selectedJobId === savedJob.id) {
      // It stays on detail but automatically uses updated values
    }
  };

  // Delete job inside the state array
  const handleDeleteJob = (jobId: string) => {
    setJobs(prevJobs => prevJobs.filter(j => j.id !== jobId));
    if (selectedJobId === jobId) {
      setSelectedJobId(null);
      setCurrentTab('dashboard');
    }
  };

  // Switch to dark/light immediately
  const handleToggleThemeInHeader = () => {
    const nextTheme = settings.theme === 'light' ? 'dark' : 'light';
    const updated = { ...settings, theme: nextTheme };
    setSettings(updated);
    if (nextTheme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  };

  return (
    <div className="min-h-screen bg-[#F3F4F6] dark:bg-slate-950 font-sans text-slate-800 dark:text-slate-100 flex flex-col transition-colors duration-200">
      
      {/* PROFESSIONAL TOP HEADER */}
      <header className="bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800/80 px-6 py-3.5 flex flex-wrap items-center justify-between gap-4 sticky top-0 z-40 shadow-xs">
        {/* App Title Group */}
        <div 
          onClick={() => { setSelectedJobId(null); setCurrentTab('dashboard'); }}
          className="flex items-center gap-2.5 cursor-pointer select-none group"
        >
          <div className="w-9 h-9 rounded-lg bg-[#185FA5] text-white flex items-center justify-center shadow-xs transition-transform group-hover:scale-105">
            <FileSpreadsheet className="w-5 h-5 font-bold" />
          </div>
          <div className="flex flex-col text-left">
            <h1 className="text-sm font-extrabold tracking-tight text-slate-850 dark:text-white uppercase leading-none font-sans">
              Report Scheduler
            </h1>
            <span className="text-[10px] text-slate-400 dark:text-slate-500 font-mono mt-0.5">
              Windows Client Edition · v1.2
            </span>
          </div>
        </div>

        {/* Center navigation tabs strictly aligned */}
        <div className="flex items-center bg-slate-100 dark:bg-slate-850/60 p-1 rounded-lg border border-slate-200 dark:border-slate-800">
          <button
            onClick={() => { setSelectedJobId(null); setCurrentTab('dashboard'); }}
            className={`px-4 py-1.5 text-xs font-bold rounded-md flex items-center gap-1.5 transition-all cursor-pointer ${
              currentTab === 'dashboard' || currentTab === 'detail'
                ? 'bg-white dark:bg-slate-700 text-[#185FA5] dark:text-sky-300 shadow-xs'
                : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-amber-100'
            }`}
          >
            <LayoutGrid className="w-3.5 h-3.5" />
            რეპორტები
          </button>
          
          <button
            id="settings_tab_btn"
            onClick={() => { setSelectedJobId(null); setCurrentTab('settings'); }}
            className={`px-4 py-1.5 text-xs font-bold rounded-md flex items-center gap-1.5 transition-all cursor-pointer ${
              currentTab === 'settings'
                ? 'bg-white dark:bg-slate-700 text-[#185FA5] dark:text-sky-300 shadow-xs'
                : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-amber-100'
            }`}
          >
            <SettingsIcon className="w-3.5 h-3.5" />
            პარამეტრები
          </button>
        </div>

        {/* Right action block */}
        <div className="flex items-center gap-3">
          {/* Theme switcher */}
          <button
            onClick={handleToggleThemeInHeader}
            className="p-2 border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-lg text-slate-500 dark:text-slate-400 transition-all cursor-pointer text-xs inline-flex items-center gap-1.5"
            title="გარეგნობის გადართვა"
          >
            {settings.theme === 'dark' ? (
              <>
                <Sun className="w-4 h-4 text-orange-400 animate-pulse" />
                <span className="hidden sm:inline font-semibold">ნათელი</span>
              </>
            ) : (
              <>
                <Moon className="w-4 h-4 text-sky-600" />
                <span className="hidden sm:inline font-semibold">ბნელი</span>
              </>
            )}
          </button>

          {/* New Report Wizard trigger button */}
          <button 
            id="create_new_report_btn"
            onClick={handleAddNewReportInitiate}
            className="px-4.5 py-2 bg-[#185FA5] hover:bg-[#124982] text-white rounded-lg font-semibold text-xs inline-flex items-center gap-1.5 transition-all cursor-pointer active:scale-95 shadow-xs"
          >
            <Plus className="w-4 h-4 font-bold" />
            ახალი ანგარიში
          </button>
        </div>
      </header>

      {/* RENDER DYNAMIC COMPONENT BREADCRUMB INDICATOR IF WE ARE DEEP IN DETAIL VIEW */}
      {currentTab === 'detail' && activeJob && (
        <div className="max-w-7xl mx-auto w-full px-6 pt-4 text-left">
          <div className="flex items-center gap-1.5 text-xs text-slate-400 dark:text-slate-500">
            <span 
              onClick={() => { setSelectedJobId(null); setCurrentTab('dashboard'); }}
              className="hover:text-[#185FA5] cursor-pointer"
            >
              ანგარიშები
            </span>
            <ChevronRight className="w-3 h-3" />
            <span className="text-slate-600 dark:text-slate-400 font-semibold truncate">
              {activeJob.name}
            </span>
          </div>
        </div>
      )}

      {/* PRIMARY WORKSPACE CONTENT STAGE */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 pb-12">
        {currentTab === 'dashboard' && (
          <Dashboard
            jobs={jobs}
            onSelectJob={(job) => {
              setSelectedJobId(job.id);
              setCurrentTab('detail');
            }}
            onEditJob={handleEditJobInitiate}
            onDeleteJob={handleDeleteJob}
            onAddNewReport={handleAddNewReportInitiate}
            onRunNow={triggerRunNow}
            runningJobs={runningJobs}
          />
        )}

        {currentTab === 'detail' && activeJob && (
          <JobDetail
            job={activeJob}
            onBack={() => {
              setSelectedJobId(null);
              setCurrentTab('dashboard');
            }}
            onEdit={handleEditJobInitiate}
            onRunNow={triggerRunNow}
            runningJobs={runningJobs}
          />
        )}

        {currentTab === 'settings' && (
          <SettingsPage
            settings={settings}
            onSaveSettings={(updatedSettings) => setSettings(updatedSettings)}
          />
        )}
      </main>

      {/* TWO-STEP JOB CREATION & EDIT WIZARD (MODAL) */}
      {wizardOpen && (
        <JobWizard
          initialJob={editingJob}
          defaultSettings={settings}
          onSave={handleSaveWizardJob}
          onClose={() => {
            setWizardOpen(false);
            setEditingJob(null);
          }}
        />
      )}

    </div>
  );
}
