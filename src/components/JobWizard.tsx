import React, { useState, useEffect } from 'react';
import { Job, Settings } from '../types';
import { 
  X, Folder, Database, Server, CheckCircle, 
  ArrowRight, ArrowLeft, Check, Plus, AlertCircle 
} from 'lucide-react';

interface JobWizardProps {
  initialJob: Job | null; // null means create new, otherwise edit
  defaultSettings: Settings;
  onSave: (job: Job) => void;
  onClose: () => void;
}

export default function JobWizard({ initialJob, defaultSettings, onSave, onClose }: JobWizardProps) {
  const [step, setStep] = useState<1 | 2>(1);
  
  // Form States - Step 1: Connection
  const [name, setName] = useState('');
  const [excelFolder, setExcelFolder] = useState('');
  const [source, setSource] = useState<'SQL Server' | 'MySQL'>('SQL Server');
  const [server, setServer] = useState('');
  const [database, setDatabase] = useState('');
  const [user, setUser] = useState('');
  const [password, setPassword] = useState('********');
  const [query, setQuery] = useState('');
  
  // Connection testing states
  const [testStatus, setTestStatus] = useState<'idle' | 'testing' | 'success' | 'error'>('idle');

  // Form States - Step 2: Schedule
  const [frequency, setFrequency] = useState<'daily' | 'weekdays' | 'everyN'>('daily');
  const [weekdays, setWeekdays] = useState<string[]>([]);
  const [everyNDays, setEveryNDays] = useState<number>(3);
  
  // Multiple times states
  const [runTimes, setRunTimes] = useState<string[]>(['08:00']);
  const [newTimeInput, setNewTimeInput] = useState('12:00');

  // Delivery Method states
  const [deliveryMethod, setDeliveryMethod] = useState<'Power Automate' | 'SMTP'>('SMTP');
  const [smtpServer, setSmtpServer] = useState('');
  const [smtpPort, setSmtpPort] = useState('');
  const [smtpSender, setSmtpSender] = useState('');

  // Recipients multi-chip states
  const [recipients, setRecipients] = useState<string[]>([]);
  const [emailInput, setEmailInput] = useState('');

  // Helper template folders for "დათვალიერება" folder picker simulation
  const [showFolderPicker, setShowFolderPicker] = useState(false);
  const sampleFolders = [
    'C:\\Reports\\GasMeters',
    'C:\\Reports\\Sales',
    'C:\\Reports\\FinanceExports',
    'C:\\Reports\\HrLobby',
    'C:\\Reports\\Operations',
  ];

  // Initialize form with initialJob or defaults
  useEffect(() => {
    if (initialJob) {
      setName(initialJob.name);
      setExcelFolder(initialJob.excelFolder);
      setSource(initialJob.source);
      setServer(initialJob.server);
      setDatabase(initialJob.database);
      setUser(initialJob.user);
      setQuery(initialJob.query);
      setFrequency(initialJob.frequency);
      setWeekdays(initialJob.weekdays || []);
      setEveryNDays(initialJob.everyNDays || 3);
      setRunTimes(initialJob.runTimes && initialJob.runTimes.length > 0 ? initialJob.runTimes : ['08:00']);
      setDeliveryMethod(initialJob.deliveryMethod);
      setRecipients(initialJob.recipients || []);
    } else {
      // Create mode
      setName('');
      setExcelFolder(defaultSettings.defaultExcelFolder);
      setSource('SQL Server');
      setServer('192.168.1.100');
      setDatabase('ReportingDB');
      setUser('sa');
      setQuery(`SELECT \n    fines.id,\n    fines.amount,\n    fines.issue_date,\n    users.full_name\nFROM fines\nJOIN users ON fines.user_id = users.id\nWHERE fines.status = 'pending'\nORDER BY issue_date DESC;`);
      setFrequency('daily');
      setWeekdays(['ორშ', 'ოთხ', 'პარ']);
      setEveryNDays(3);
      setRunTimes(['08:00']);
      setDeliveryMethod('SMTP');
      setRecipients([]);
    }
    // Initialize default SMTP fields either way if not explicit
    setSmtpServer(defaultSettings.defaultSmtp.server);
    setSmtpPort(defaultSettings.defaultSmtp.port);
    setSmtpSender(defaultSettings.defaultSmtp.sender);
    setTestStatus('idle');
  }, [initialJob, defaultSettings]);

  // Handle connection testing
  const handleTestConnection = () => {
    setTestStatus('testing');
    setTimeout(() => {
      if (server.trim() && database.trim()) {
        setTestStatus('success');
      } else {
        setTestStatus('error');
      }
    }, 800);
  };

  // Add a new execution hour/time
  const addTime = () => {
    if (!newTimeInput) return;
    if (!runTimes.includes(newTimeInput)) {
      setRunTimes([...runTimes, newTimeInput].sort());
    }
  };

  // Remove an execution hour
  const removeTime = (timeToRemove: string) => {
    if (runTimes.length <= 1) {
      // Keep at least one time
      return;
    }
    setRunTimes(runTimes.filter(t => t !== timeToRemove));
  };

  // Add an email to recipient list
  const addEmail = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const trimmed = emailInput.trim();
    if (!trimmed) return;
    if (trimmed.includes('@') && !recipients.includes(trimmed)) {
      setRecipients([...recipients, trimmed]);
      setEmailInput('');
    }
  };

  // Remove email chip
  const removeEmail = (email: string) => {
    setRecipients(recipients.filter(r => r !== email));
  };

  // Weekdays togglers
  const availableWeekdays = ['ორშ', 'სამ', 'ოთხ', 'ხუთ', 'პარ', 'შაბ', 'კვი'];
  const toggleWeekday = (day: string) => {
    if (weekdays.includes(day)) {
      setWeekdays(weekdays.filter(d => d !== day));
    } else {
      setWeekdays([...weekdays, day]);
    }
  };

  // Save changes
  const handleSave = () => {
    if (!name.trim()) {
      alert('გთხოვთ შეიყვანოთ ანგარიშის სახელი');
      return;
    }
    
    const finalizedJob: Job = {
      id: initialJob ? initialJob.id : `job-${Math.random().toString(36).substr(2, 9)}`,
      name: name.trim(),
      source,
      server: server.trim() || 'localhost',
      database: database.trim() || 'DefaultDB',
      user: user.trim() || 'sa',
      query: query.trim(),
      excelFolder: excelFolder.trim() || defaultSettings.defaultExcelFolder,
      frequency,
      weekdays: frequency === 'weekdays' ? weekdays : [],
      everyNDays: frequency === 'everyN' ? everyNDays : 1,
      runTimes,
      deliveryMethod,
      recipients: recipients.length > 0 ? recipients : [defaultSettings.defaultSmtp.sender],
      lastRun: initialJob ? initialJob.lastRun : '',
      lastStatus: initialJob ? initialJob.lastStatus : 'ველოდებით',
      history: initialJob ? initialJob.history : [],
    };

    onSave(finalizedJob);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs transition-opacity duration-300">
      <div className="bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 w-full max-w-3xl max-h-[95vh] flex flex-col rounded-xl border border-slate-200 dark:border-slate-800 shadow-2xl transition-all duration-300 overflow-hidden">
        
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-250 dark:border-slate-800 flex justify-between items-start">
          <div className="flex flex-col gap-1 text-left">
            <h2 className="text-xl font-semibold text-[#185FA5] dark:text-sky-400 font-sans">
              {initialJob ? 'ანგარიშის რედაქტირება' : 'ახალი ანგარიში'}
            </h2>
            <span className="text-xs font-medium text-slate-500 dark:text-slate-400 font-sans tracking-wide">
              {step === 1 ? 'ნაბიჯი 1/2 — კავშირი' : 'ნაბიჯი 2/2 — განრიგი'}
            </span>
          </div>
          <button 
            id="close_wizard_btn"
            onClick={onClose}
            className="p-1 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors cursor-pointer"
          >
            <X className="w-5 h-5 text-slate-500 dark:text-slate-400" />
          </button>
        </div>

        {/* Scrollable Flow Area */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {step === 1 ? (
            /* ================= STEP 1: CONNECTION ================= */
            <div className="space-y-5 text-left">
              {/* Report Name & Output Folder */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                    ანგარიშის სახელი
                  </label>
                  <input 
                    id="wizard_report_name"
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full h-10 px-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-sm focus:border-[#185FA5] focus:ring-1 focus:ring-[#185FA5] outline-none transition-all"
                    placeholder="მაგ: გაყიდვების რეპორტი"
                  />
                  <p className="text-xs text-slate-400 dark:text-slate-500 font-sans italic leading-relaxed">
                    Excel ფაილი დაერქმევა: სახელი - მიმდინარე თარიღი
                  </p>
                </div>

                <div className="flex flex-col gap-1.5 relative">
                  <label className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                    Excel საქაღალდე
                  </label>
                  <div className="flex gap-2">
                    <input 
                      id="wizard_excel_folder"
                      type="text"
                      value={excelFolder}
                      onChange={(e) => setExcelFolder(e.target.value)}
                      className="flex-1 h-10 px-3 bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-sm text-slate-600 dark:text-slate-300 outline-none focus:border-[#185FA5] focus:ring-1 focus:ring-[#185FA5]"
                      placeholder="იყენებს ნაგულისხმევს..."
                    />
                    <button 
                      id="wizard_browse_folder_btn"
                      type="button"
                      onClick={() => setShowFolderPicker(!showFolderPicker)}
                      className="h-10 px-3 border border-slate-200 dark:border-slate-700 dark:hover:bg-slate-800 rounded-lg text-xs font-medium inline-flex items-center gap-1.5 hover:bg-slate-50 cursor-pointer text-slate-700 dark:text-slate-300 transition-colors"
                    >
                      <Folder className="w-4 h-4 text-[#185FA5]" />
                      დათვალიერება
                    </button>
                  </div>
                  <p className="text-xs text-slate-400 dark:text-slate-500 font-sans italic leading-relaxed">
                    ცარიელის შემთხვევაში გამოიყენება ნაგულისხმევი საქაღალდე პარამეტრებიდან
                  </p>

                  {/* Simulated Folder Picker Panel */}
                  {showFolderPicker && (
                    <div className="absolute right-0 top-18 z-20 w-64 bg-white dark:bg-slate-800 border border-slate-20/50 dark:border-slate-705 shadow-xl rounded-lg p-2 text-left">
                      <div className="text-xs font-semibold px-2 py-1 text-slate-400 border-b border-slate-100 dark:border-slate-700 mb-1">
                        აირჩიეთ საქაღალდე
                      </div>
                      {sampleFolders.map((pathOption) => (
                        <button
                          key={pathOption}
                          type="button"
                          onClick={() => {
                            setExcelFolder(pathOption);
                            setShowFolderPicker(false);
                          }}
                          className="w-full text-left text-xs px-2 py-1.5 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-md transition-colors truncate font-mono text-slate-600 dark:text-slate-300"
                        >
                          {pathOption}
                        </button>
                      ))}
                      <button
                        type="button"
                        onClick={() => setShowFolderPicker(false)}
                        className="w-full text-center text-xs mt-2 py-1 text-red-500 font-semibold border-t border-slate-100 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-750"
                      >
                        დახურვა
                      </button>
                    </div>
                  )}
                </div>
              </div>

              {/* Data Source Cards Selection */}
              <div className="flex flex-col gap-2">
                <label className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                  მონაცემთა წყარო
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {/* SQL Server Selection */}
                  <div 
                    id="wizard_source_sqlserver_card"
                    onClick={() => setSource('SQL Server')}
                    className={`cursor-pointer min-h-[72px] p-4 rounded-xl border-2 flex items-center gap-3 transition-all ${
                      source === 'SQL Server' 
                        ? 'border-[#185FA5] bg-sky-50/20 dark:bg-sky-900/10' 
                        : 'border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700'
                    }`}
                  >
                    <div className="w-10 h-10 rounded-lg bg-sky-100 dark:bg-sky-900/30 text-[#185FA5] dark:text-sky-400 flex items-center justify-center shrink-0">
                      <Database className="w-5 h-5" />
                    </div>
                    <div className="flex flex-col">
                      <span className="text-sm font-semibold">SQL Server</span>
                      <span className="text-xs text-slate-400 dark:text-slate-500">pyodbc driver</span>
                    </div>
                    {source === 'SQL Server' && (
                      <div className="ml-auto">
                        <CheckCircle className="w-5 h-5 text-[#185FA5] dark:text-sky-400" />
                      </div>
                    )}
                  </div>

                  {/* MySQL Selection */}
                  <div 
                    id="wizard_source_mysql_card"
                    onClick={() => setSource('MySQL')}
                    className={`cursor-pointer min-h-[72px] p-4 rounded-xl border-2 flex items-center gap-3 transition-all ${
                      source === 'MySQL' 
                        ? 'border-[#185FA5] bg-sky-50/20 dark:bg-sky-900/10' 
                        : 'border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700'
                    }`}
                  >
                    <div className="w-10 h-10 rounded-lg bg-teal-150 dark:bg-teal-900/30 text-teal-600 dark:text-teal-400 flex items-center justify-center shrink-0">
                      <Database className="w-5 h-5" />
                    </div>
                    <div className="flex flex-col">
                      <span className="text-sm font-semibold">MySQL</span>
                      <span className="text-xs text-slate-400 dark:text-slate-500">pymysql driver</span>
                    </div>
                    {source === 'MySQL' && (
                      <div className="ml-auto">
                        <CheckCircle className="w-5 h-5 text-[#185FA5] dark:text-sky-400" />
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Server, DB, User, Password Grid */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 p-4 bg-slate-50 dark:bg-slate-800/50 border border-transparent hairline dark:border-slate-800/60 rounded-xl shadow-sm">
                <div className="col-span-2 sm:col-span-1 flex flex-col gap-1">
                  <span className="text-xs font-semibold text-slate-400 dark:text-slate-400">სერვერი</span>
                  <input 
                    type="text"
                    value={server}
                    onChange={(e) => setServer(e.target.value)}
                    className="w-full h-9 px-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-xs outline-none focus:border-[#185FA5]"
                    placeholder="localhost / IP"
                  />
                </div>
                <div className="col-span-2 sm:col-span-1 flex flex-col gap-1">
                  <span className="text-xs font-semibold text-slate-400 dark:text-slate-400">ბაზა</span>
                  <input 
                    type="text"
                    value={database}
                    onChange={(e) => setDatabase(e.target.value)}
                    className="w-full h-9 px-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-xs outline-none focus:border-[#185FA5]"
                    placeholder="ReportingDB"
                  />
                </div>
                <div className="col-span-1 flex flex-col gap-1">
                  <span className="text-xs font-semibold text-slate-400 dark:text-slate-400">მომხმარებელი</span>
                  <input 
                    type="text"
                    value={user}
                    onChange={(e) => setUser(e.target.value)}
                    className="w-full h-9 px-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-xs outline-none focus:border-[#185FA5]"
                    placeholder="sa"
                  />
                </div>
                <div className="col-span-1 flex flex-col gap-1">
                  <span className="text-xs font-semibold text-slate-400 dark:text-slate-400">პაროლი</span>
                  <input 
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full h-9 px-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-xs outline-none focus:border-[#185FA5]"
                    placeholder="********"
                  />
                </div>
              </div>

              {/* Monospace Query Area */}
              <div className="flex flex-col gap-1.5">
                <div className="flex justify-between items-center">
                  <label className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                    SQL მოთხოვნა
                  </label>
                  <span className="text-[11px] font-mono text-slate-400 dark:text-slate-500">
                    ReadOnly Execution
                  </span>
                </div>
                <textarea 
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  className="w-full h-40 p-4 border border-slate-200 dark:border-slate-700 rounded-lg font-mono text-xs dark:text-sky-300 bg-slate-900 text-slate-100 focus:ring-1 focus:ring-[#185FA5] outline-none"
                  spellCheck="false"
                  placeholder="SELECT * FROM table;"
                />
              </div>

              {/* Connection Test Controls */}
              <div className="flex flex-wrap items-center gap-4 pt-2">
                <button 
                  id="wizard_test_conn_btn"
                  type="button"
                  onClick={handleTestConnection}
                  disabled={testStatus === 'testing'}
                  className="h-10 px-4 border border-[#185FA5] hover:bg-sky-50/10 text-[#185FA5] dark:text-sky-400 dark:border-sky-500/50 font-medium text-xs rounded-lg transition-colors flex items-center gap-2 cursor-pointer disabled:opacity-50"
                >
                  <Server className={`w-4 h-4 ${testStatus === 'testing' ? 'animate-spin' : ''}`} />
                  {testStatus === 'testing' ? 'ირკვევა კავშირი...' : 'კავშირის ტესტი'}
                </button>

                {testStatus === 'success' && (
                  <div className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400 font-medium text-xs">
                    <Check className="w-5 h-5" />
                    კავშირი წარმატებულია
                  </div>
                )}

                {testStatus === 'error' && (
                  <div className="flex items-center gap-2 text-rose-600 dark:text-rose-400 font-medium text-xs">
                    <AlertCircle className="w-5 h-5" />
                    შეცდომა: სერვერი და ბაზა სავალდებულოა
                  </div>
                )}
              </div>
            </div>
          ) : (
            /* ================= STEP 2: SCHEDULE ================= */
            <div className="space-y-6 text-left">
              {/* Frequency Segmented Control */}
              <div className="flex flex-col gap-2">
                <label className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                  სიხშირე
                </label>
                <div className="grid grid-cols-3 bg-slate-100 dark:bg-slate-800 p-1 rounded-lg border border-slate-150 dark:border-slate-750">
                  <button
                    type="button"
                    onClick={() => setFrequency('daily')}
                    className={`py-1.5 text-xs font-medium rounded-md transition-all ${
                      frequency === 'daily'
                        ? 'bg-white dark:bg-slate-700 text-[#185FA5] dark:text-sky-300 shadow-xs'
                        : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-amber-100'
                    }`}
                  >
                    ყოველდღე
                  </button>
                  <button
                    type="button"
                    onClick={() => setFrequency('weekdays')}
                    className={`py-1.5 text-xs font-medium rounded-md transition-all ${
                      frequency === 'weekdays'
                        ? 'bg-white dark:bg-slate-700 text-[#185FA5] dark:text-sky-300 shadow-xs'
                        : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-amber-100'
                    }`}
                  >
                    კვირის დღეები
                  </button>
                  <button
                    type="button"
                    onClick={() => setFrequency('everyN')}
                    className={`py-1.5 text-xs font-medium rounded-md transition-all ${
                      frequency === 'everyN'
                        ? 'bg-white dark:bg-slate-700 text-[#185FA5] dark:text-sky-300 shadow-xs'
                        : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-amber-100'
                    }`}
                  >
                    ყოველ N დღეში
                  </button>
                </div>
              </div>

              {/* Conditional Display Area */}
              <div className="p-4 bg-slate-50 dark:bg-slate-800/40 rounded-xl border border-transparent hairline dark:border-slate-800/60 shadow-sm min-h-[72px] flex items-center justify-start">
                
                {frequency === 'daily' && (
                  <span className="text-xs font-medium text-slate-500 dark:text-slate-400 font-sans italic">
                    ყოველ დღე გაეშვება ავტომატურად.
                  </span>
                )}

                {frequency === 'weekdays' && (
                  <div className="flex flex-col gap-2.5 w-full">
                    <span className="text-xs font-semibold text-slate-400 dark:text-slate-500">
                      მონიშნეთ გაშვების დღეები:
                    </span>
                    <div className="flex flex-wrap gap-1.5">
                      {availableWeekdays.map((day) => {
                        const isSelected = weekdays.includes(day);
                        return (
                          <button
                            key={day}
                            type="button"
                            onClick={() => toggleWeekday(day)}
                            className={`px-3 py-1 text-xs font-medium rounded-full border transition-all ${
                              isSelected 
                                ? 'bg-[#185FA5] border-[#185FA5] text-white' 
                                : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:border-slate-300'
                            }`}
                          >
                            {day}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}

                {frequency === 'everyN' && (
                  <div className="flex items-center gap-3 w-full">
                    <span className="text-xs font-medium text-slate-500 dark:text-slate-400">
                      რეპორტის პერიოდულობა:
                    </span>
                    <div className="flex items-center border border-slate-200 dark:border-slate-700 rounded-lg overflow-hidden bg-white dark:bg-slate-850">
                      <button
                        type="button"
                        onClick={() => setEveryNDays(Math.max(1, everyNDays - 1))}
                        className="px-3 py-1.5 hover:bg-slate-100 dark:hover:bg-slate-750 font-bold border-r border-slate-200 dark:border-slate-700"
                      >
                        -
                      </button>
                      <span className="px-4 text-sm font-semibold text-center min-w-[3rem]">
                        {everyNDays} დღეში
                      </span>
                      <button
                        type="button"
                        onClick={() => setEveryNDays(everyNDays + 1)}
                        className="px-3 py-1.5 hover:bg-slate-100 dark:hover:bg-slate-750 font-bold border-l border-slate-200 dark:border-slate-700"
                      >
                        +
                      </button>
                    </div>
                  </div>
                )}

              </div>

              {/* Execution Run Times Manager */}
              <div className="space-y-2">
                <label className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                  გაშვების დრო
                </label>
                <div className="flex flex-wrap items-center gap-2">
                  {runTimes.map((time) => (
                    <div 
                      key={time} 
                      className="inline-flex items-center bg-sky-50 dark:bg-slate-850 border border-sky-100 dark:border-slate-700 rounded-lg px-2.5 py-1 text-xs text-sky-850 dark:text-sky-300"
                    >
                      <span className="font-mono font-bold mr-1">{time}</span>
                      <button 
                        type="button"
                        onClick={() => removeTime(time)}
                        className="p-0.5 hover:bg-sky-100 dark:hover:bg-slate-700 rounded-full text-slate-400 hover:text-slate-700 dark:hover:text-slate-220 cursor-pointer transition-colors"
                        disabled={runTimes.length <= 1}
                        title={runTimes.length <= 1 ? "მინიმუმ ერთი დრო სავალდებულოა" : "დროის წაშლა"}
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}

                  <div className="flex items-center gap-1 bg-slate-50 dark:bg-slate-850 border border-slate-200 dark:border-slate-750 p-1 rounded-lg">
                    <input 
                      type="time" 
                      value={newTimeInput}
                      onChange={(e) => setNewTimeInput(e.target.value)}
                      className="bg-transparent text-xs border-0 py-0.5 px-1 outline-none text-slate-700 dark:text-slate-300 font-mono"
                    />
                    <button
                      type="button"
                      onClick={addTime}
                      className="px-2 py-1 bg-white dark:bg-slate-700 hover:bg-slate-100 dark:hover:bg-slate-600 border border-slate-200 dark:border-slate-600 rounded-md text-[11px] font-semibold text-[#185FA5] dark:text-sky-300 transition-colors inline-flex items-center gap-0.5 cursor-pointer"
                    >
                      <Plus className="w-3 h-3" />
                      დამატება
                    </button>
                  </div>
                </div>
              </div>

              {/* Delivery channel setting & conditional SMTP details */}
              <div className="space-y-4">
                <div className="flex flex-col gap-2">
                  <label className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                    გაგზავნის არხი
                  </label>
                  <div className="flex bg-slate-150/70 dark:bg-slate-800 p-1 rounded-lg max-w-sm border border-slate-200 dark:border-slate-700">
                    <button
                      type="button"
                      onClick={() => setDeliveryMethod('SMTP')}
                      className={`flex-1 py-1 px-3 text-xs font-medium rounded-md transition-all cursor-pointer ${
                        deliveryMethod === 'SMTP'
                          ? 'bg-white dark:bg-slate-700 text-slate-850 dark:text-sky-300 shadow-xs ring-1 ring-black/5'
                          : 'text-slate-500 dark:text-slate-400'
                      }`}
                    >
                      SMTP
                    </button>
                    <button
                      type="button"
                      onClick={() => setDeliveryMethod('Power Automate')}
                      className={`flex-1 py-1 px-3 text-xs font-medium rounded-md transition-all cursor-pointer ${
                        deliveryMethod === 'Power Automate'
                          ? 'bg-white dark:bg-slate-700 text-slate-850 dark:text-sky-300 shadow-xs ring-1 ring-black/5'
                          : 'text-slate-500 dark:text-slate-400'
                      }`}
                    >
                      Power Automate
                    </button>
                  </div>
                </div>

                {deliveryMethod === 'SMTP' ? (
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3 p-4 bg-amber-500/5 dark:bg-slate-800/30 border border-transparent hairline dark:border-slate-850 rounded-xl shadow-sm">
                    <div className="flex flex-col gap-1 text-left">
                      <span className="text-[11px] font-semibold text-slate-400 dark:text-slate-400">SMTP სერვერი</span>
                      <input 
                        type="text"
                        value={smtpServer}
                        onChange={(e) => setSmtpServer(e.target.value)}
                        className="h-8 px-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-md text-xs outline-none"
                      />
                    </div>
                    <div className="flex flex-col gap-1 text-left">
                      <span className="text-[11px] font-semibold text-slate-400 dark:text-slate-400">პორტი</span>
                      <input 
                        type="text"
                        value={smtpPort}
                        onChange={(e) => setSmtpPort(e.target.value)}
                        className="h-8 px-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-md text-xs outline-none"
                      />
                    </div>
                    <div className="flex flex-col gap-1 text-left">
                      <span className="text-[11px] font-semibold text-slate-400 dark:text-slate-400">გამგზავნი</span>
                      <input 
                        type="text"
                        value={smtpSender}
                        onChange={(e) => setSmtpSender(e.target.value)}
                        className="h-8 px-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-md text-xs outline-none"
                      />
                    </div>
                  </div>
                ) : (
                  <div className="p-4 bg-sky-50 dark:bg-sky-950/20 text-sky-850 dark:text-sky-300 border border-sky-100 dark:border-sky-900/30 rounded-xl text-xs leading-relaxed">
                    <strong>Power Automate Integration:</strong> ექსპორტირებული Excel ფაილი აიტვირთება შერჩეულ საქაღალდეში, რის შემდეგაც გაეშვება webhook ტრიგერი მეილების ავტოდისტრიბუციისთვის.
                  </div>
                )}
              </div>

              {/* Recipients multi-chip email list */}
              <div className="space-y-2">
                <label className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                  მიმღებები
                </label>
                <div className="p-3 border border-transparent hairline dark:border-slate-700 rounded-xl shadow-sm space-y-3 bg-slate-50/20 dark:bg-slate-850/40">
                  <div className="flex flex-wrap gap-1.5">
                    {recipients.length === 0 ? (
                      <span className="text-xs text-slate-400 dark:text-slate-500 font-sans italic py-1">
                        მიმღებები არ არის დამატებული. გამოიყენება ნაგულისხმევი.
                      </span>
                    ) : (
                      recipients.map((email) => (
                        <div 
                          key={email} 
                          className="inline-flex items-center bg-[#185FA5]/10 dark:bg-slate-800 border border-[#185FA5]/20 dark:border-slate-700 text-[#185FA5] dark:text-sky-300 px-2.5 py-0.5 rounded-lg text-xs"
                        >
                          <span className="font-medium mr-1.5">{email}</span>
                          <button 
                            type="button"
                            onClick={() => removeEmail(email)}
                            className="p-0.5 hover:bg-[#185FA5]/25 hover:text-red-500 rounded-full transition-colors cursor-pointer"
                          >
                            <X className="w-3 h-3" />
                          </button>
                        </div>
                      ))
                    )}
                  </div>

                  <form onSubmit={addEmail} className="flex gap-2">
                    <input 
                      type="email"
                      placeholder="მაგ: user@company.ge"
                      value={emailInput}
                      onChange={(e) => setEmailInput(e.target.value)}
                      className="flex-1 h-9 px-3 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-xs outline-none focus:border-[#185FA5]"
                    />
                    <button 
                      type="button"
                      onClick={() => addEmail()}
                      className="h-9 px-3 bg-slate-200 dark:bg-slate-700 hover:bg-slate-300 dark:hover:bg-slate-650 rounded-lg text-xs font-semibold text-slate-800 dark:text-slate-200 transition-colors cursor-pointer"
                    >
                      დამატება
                    </button>
                  </form>
                </div>
              </div>

            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-850 flex justify-between items-center">
          {step === 2 ? (
            <button 
              type="button"
              onClick={() => setStep(1)}
              className="px-4 py-2 border border-slate-200 dark:border-slate-700 sm:hover:bg-slate-100 dark:hover:bg-slate-805 text-slate-700 dark:text-slate-300 font-medium text-xs rounded-lg transition-colors inline-flex items-center gap-1.5 cursor-pointer"
            >
              <ArrowLeft className="w-4 h-4" />
              უკან
            </button>
          ) : (
            <button 
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-slate-200 dark:border-slate-700 sm:hover:bg-slate-100 dark:hover:bg-slate-805 text-slate-700 dark:text-slate-300 font-medium text-xs rounded-lg transition-colors cursor-pointer"
            >
              გაუქმება
            </button>
          )}

          {step === 1 ? (
            <button 
              id="wizard_next_btn"
              type="button"
              onClick={() => setStep(2)}
              className="px-5 py-2 bg-[#185FA5] hover:bg-[#124982] text-white font-medium text-xs rounded-lg transition-all inline-flex items-center gap-1.5 cursor-pointer active:scale-95 shadow-sm"
            >
              შემდეგი
              <ArrowRight className="w-4 h-4" />
            </button>
          ) : (
            <button 
              id="wizard_save_btn"
              type="button"
              onClick={handleSave}
              className="px-5 py-2 bg-[#185FA5] hover:bg-[#124982] text-white font-medium text-xs rounded-lg transition-all inline-flex items-center gap-1.5 cursor-pointer active:scale-95 shadow-sm"
            >
              <Check className="w-4 h-4" />
              შენახვა
            </button>
          )}
        </div>

      </div>
    </div>
  );
}
