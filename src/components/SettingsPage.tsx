import React, { useState } from 'react';
import { Settings } from '../types';
import { 
  Settings as SettingsIcon, Monitor, Sun, Moon, 
  Folder, Mail, ToggleLeft, ToggleRight, Check, CheckCircle2 
} from 'lucide-react';

interface SettingsPageProps {
  settings: Settings;
  onSaveSettings: (settings: Settings) => void;
}

export default function SettingsPage({ settings, onSaveSettings }: SettingsPageProps) {
  const [startWithWindows, setStartWithWindows] = useState(settings.startWithWindows);
  const [defaultExcelFolder, setDefaultExcelFolder] = useState(settings.defaultExcelFolder);
  const [smtpServer, setSmtpServer] = useState(settings.defaultSmtp.server);
  const [smtpPort, setSmtpPort] = useState(settings.defaultSmtp.port);
  const [smtpSender, setSmtpSender] = useState(settings.defaultSmtp.sender);
  const [theme, setTheme] = useState<'light' | 'dark'>(settings.theme || 'light');
  
  const [showSavedFeedback, setShowSavedFeedback] = useState(false);
  const [showFolderPicker, setShowFolderPicker] = useState(false);

  const sampleFolders = [
    'C:\\Reports\\DefaultExports',
    'C:\\Reports\\Archived',
    'C:\\Reports\\Backup',
    'D:\\CompanyShared\\SQL_Exports',
  ];

  const handleApplyChanges = (updatedTheme?: 'light' | 'dark') => {
    const selectedTheme = updatedTheme || theme;
    const isWindowsStartup = startWithWindows;
    
    const newSettings: Settings = {
      startWithWindows: isWindowsStartup,
      defaultExcelFolder: defaultExcelFolder.trim(),
      defaultSmtp: {
        server: smtpServer.trim(),
        port: smtpPort.trim(),
        sender: smtpSender.trim(),
      },
      theme: selectedTheme,
    };
    
    // Pass up to the parent
    onSaveSettings(newSettings);
    
    // Toggle theme in Document Element
    if (selectedTheme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }

    // Show temporary feedback banner 
    setShowSavedFeedback(true);
    setTimeout(() => setShowSavedFeedback(false), 2000);
  };

  return (
    <div className="space-y-6 max-w-3xl text-left">
      {/* Header and status feedback banner */}
      <div className="flex items-center justify-between pb-4 border-b border-slate-200 dark:border-slate-800">
        <div className="flex items-center gap-2">
          <SettingsIcon className="w-5 h-5 text-[#185FA5] dark:text-sky-400" />
          <h1 className="text-xl font-bold font-sans tracking-tight text-slate-800 dark:text-white">
            პარამეტრები
          </h1>
        </div>

        {/* Saved Banner */}
        {showSavedFeedback && (
          <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400 border border-emerald-100 dark:border-emerald-900/50 rounded-lg text-xs font-semibold animate-fade-in">
            <CheckCircle2 className="w-4 h-4" />
            ცვლილებები შენახულია!
          </div>
        )}
      </div>

      {/* SECTION 1: GENERAL SETTINGS */}
      <div className="bg-white dark:bg-slate-900 border border-transparent hairline dark:border-slate-800/60 rounded-xl shadow-sm p-5 space-y-4">
        <div className="border-b border-slate-100 dark:border-slate-800 pb-2">
          <h2 className="text-sm font-bold text-slate-700 dark:text-slate-350 uppercase tracking-wider font-sans">
            ზოგადი პარამეტრები
          </h2>
        </div>

        {/* Windows startup toggle */}
        <div className="flex items-center justify-between py-1">
          <div className="flex flex-col">
            <span className="text-sm font-semibold text-slate-800 dark:text-slate-200">
              Windows-თან ერთად ავტომატური გაშვება
            </span>
            <span className="text-xs text-slate-400 dark:text-slate-500 font-sans mt-0.5">
              ჩატვირთავს სერვისს ფონურ რეჟიმში კომპიუტერის ჩართვისას
            </span>
          </div>

          <button 
            id="toggle_windows_startup"
            type="button" 
            onClick={() => {
              setStartWithWindows(!startWithWindows);
              // Save immediately for better interactive UX
              setTimeout(() => {
                const newSettings: Settings = {
                  startWithWindows: !startWithWindows,
                  defaultExcelFolder: defaultExcelFolder.trim(),
                  defaultSmtp: {
                    server: smtpServer.trim(),
                    port: smtpPort.trim(),
                    sender: smtpSender.trim(),
                  },
                  theme,
                };
                onSaveSettings(newSettings);
              }, 100);
            }}
            className="text-[#185FA5] transition-colors focus:outline-none cursor-pointer"
          >
            {startWithWindows ? (
              <ToggleRight className="w-12 h-8 text-[#185FA5] dark:text-sky-400" />
            ) : (
              <ToggleLeft className="w-12 h-8 text-slate-350 dark:text-slate-650" />
            )}
          </button>
        </div>

        {/* Default output folder path field */}
        <div className="flex flex-col gap-1.5 pt-2 relative">
          <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
            Excel ფაილების ნაგულისხმევი საქაღალდე
          </span>
          
          <div className="flex gap-2">
            <input 
              id="settings_default_folder_input"
              type="text"
              value={defaultExcelFolder}
              onChange={(e) => setDefaultExcelFolder(e.target.value)}
              className="flex-1 h-10 px-3 bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700 rounded-lg text-sm text-slate-700 dark:text-slate-250 outline-none focus:border-[#185FA5]"
            />
            
            <button 
              id="settings_browse_folder_btn"
              type="button"
              onClick={() => setShowFolderPicker(!showFolderPicker)}
              className="h-10 px-3 border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-lg text-xs font-medium inline-flex items-center gap-1.5 cursor-pointer text-slate-700 dark:text-slate-300"
            >
              <Folder className="w-4 h-4 text-[#185FA5]" />
              დათვალიერება
            </button>
          </div>

          <span className="text-xs text-slate-400 dark:text-slate-500 italic mt-0.5">
            გამოიყენება ახალი ანგარიშის შექმნისას საწყის მნიშვნელობად.
          </span>

          {/* Folder Simulator */}
          {showFolderPicker && (
            <div className="absolute right-0 top-18 z-20 w-64 bg-white dark:bg-slate-850 border border-slate-200 dark:border-slate-750 shadow-xl rounded-lg p-2 text-left">
              <div className="text-xs font-semibold px-2 py-1 text-slate-400 border-b border-slate-100 dark:border-slate-700 mb-1">
                აირჩიეთ საქაღალდე
              </div>
              {sampleFolders.map((pathOption) => (
                <button
                  key={pathOption}
                  type="button"
                  onClick={() => {
                    setDefaultExcelFolder(pathOption);
                    setShowFolderPicker(false);
                    // Trigger immediate feedback simulation
                    setTimeout(() => {
                      const newSettings: Settings = {
                        startWithWindows,
                        defaultExcelFolder: pathOption,
                        defaultSmtp: {
                          server: smtpServer.trim(),
                          port: smtpPort.trim(),
                          sender: smtpSender.trim(),
                        },
                        theme,
                      };
                      onSaveSettings(newSettings);
                    }, 50);
                  }}
                  className="w-full text-left text-xs px-2 py-1.5 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-md transition-colors truncate font-mono text-slate-600 dark:text-slate-350"
                >
                  {pathOption}
                </button>
              ))}
              <button
                type="button"
                onClick={() => setShowFolderPicker(false)}
                className="w-full text-center text-xs mt-2 py-1 text-red-500 font-semibold border-t border-slate-100 dark:border-slate-700"
              >
                დახურვა
              </button>
            </div>
          )}
        </div>
      </div>

      {/* SECTION 2: SMTP DEFAULT CONFIG */}
      <div className="bg-white dark:bg-slate-900 border border-transparent hairline dark:border-slate-800/60 rounded-xl shadow-sm p-5 space-y-4">
        <div className="border-b border-slate-100 dark:border-slate-800 pb-2">
          <h2 className="text-sm font-bold text-slate-700 dark:text-slate-350 uppercase tracking-wider font-sans">
            ნაგულისხმევი SMTP კავშირი
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="flex flex-col gap-1.5">
            <span className="text-xs font-semibold text-slate-400">SMTP სერვერი</span>
            <input 
              type="text"
              value={smtpServer}
              onChange={(e) => setSmtpServer(e.target.value)}
              className="h-10 px-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-750 rounded-lg text-sm text-slate-800 dark:text-slate-200 outline-none"
              placeholder="smtp.example.com"
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <span className="text-xs font-semibold text-slate-400">პორტი</span>
            <input 
              type="text"
              value={smtpPort}
              onChange={(e) => setSmtpPort(e.target.value)}
              className="h-10 px-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-750 rounded-lg text-sm text-slate-800 dark:text-slate-200 outline-none"
              placeholder="587 / 465"
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <span className="text-xs font-semibold text-slate-400">გამგზავნი</span>
            <input 
              type="text"
              value={smtpSender}
              onChange={(e) => setSmtpSender(e.target.value)}
              className="h-10 px-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-750 rounded-lg text-sm text-slate-800 dark:text-slate-200 outline-none"
              placeholder="reports@company.ge"
            />
          </div>
        </div>
      </div>

      {/* SECTION 3: VISUAL APPEARANCE / THEME */}
      <div className="bg-white dark:bg-slate-900 border border-transparent hairline dark:border-slate-800/60 rounded-xl shadow-sm p-5 space-y-4">
        <div className="border-b border-slate-100 dark:border-slate-800 pb-2">
          <h2 className="text-sm font-bold text-slate-700 dark:text-slate-350 uppercase tracking-wider font-sans">
            გარეგნობა და თემა
          </h2>
        </div>

        <div className="grid grid-cols-2 gap-4">
          {/* Light Theme Option Card */}
          <div 
            onClick={() => {
              setTheme('light');
              handleApplyChanges('light');
            }}
            className={`cursor-pointer p-4 rounded-xl border-2 flex items-center gap-3 transition-all ${
              theme === 'light'
                ? 'border-[#185FA5] bg-sky-50/10 dark:bg-slate-800'
                : 'border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700'
            }`}
          >
            <div className="p-2.5 rounded-lg bg-orange-100 text-orange-600 sm:text-orange-500">
              <Sun className="w-5 h-5 animate-pulse" />
            </div>
            <div className="flex flex-col">
              <span className="text-sm font-bold">ნათელი თემა</span>
              <span className="text-xs text-slate-400 dark:text-slate-500 font-sans mt-0.5">
                სტანდარტული თეთრი ფონი
              </span>
            </div>
            {theme === 'light' && (
              <Check className="w-5 h-5 text-[#185FA5] ml-auto" />
            )}
          </div>

          {/* Dark Theme Option Card */}
          <div 
            onClick={() => {
              setTheme('dark');
              handleApplyChanges('dark');
            }}
            className={`cursor-pointer p-4 rounded-xl border-2 flex items-center gap-3 transition-all ${
              theme === 'dark'
                ? 'border-[#185FA5] bg-[#185FA5]/10'
                : 'border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700'
            }`}
          >
            <div className="p-2.5 rounded-lg bg-slate-850 dark:bg-slate-800 text-sky-400">
              <Moon className="w-5 h-5" />
            </div>
            <div className="flex flex-col">
              <span className="text-sm font-bold">ბნელი თემა</span>
              <span className="text-xs text-slate-400 dark:text-slate-500 font-sans mt-0.5">
                კომფორტული მუქი ფონი
              </span>
            </div>
            {theme === 'dark' && (
              <Check className="w-5 h-5 text-[#185FA5] ml-auto" />
            )}
          </div>
        </div>
      </div>

      {/* Save Trigger Button */}
      <div className="flex justify-start">
        <button 
          id="settings_save_btn"
          type="button"
          onClick={() => handleApplyChanges()}
          className="h-11 px-6 bg-[#185FA5] hover:bg-[#124982] text-white font-medium text-xs rounded-lg transition-all inline-flex items-center gap-2 cursor-pointer shadow-sm active:scale-95"
        >
          <Check className="w-4 h-4" />
          პარამეტრების შენახვა
        </button>
      </div>

    </div>
  );
}
