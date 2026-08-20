import React, { useState, useEffect } from 'react';
import { useFleet } from '../context/FleetContext';
import { UserRole } from '../types';
import {
  Truck,
  Shield,
  UserCheck,
  Smartphone,
  Bell,
  Volume2,
  VolumeX,
  Play,
  Pause,
  RotateCcw,
  Monitor,
  Calendar,
  Radio,
  FileSpreadsheet,
  BarChart3,
  ChevronDown,
  AlertTriangle,
  Users,
  KeyRound,
  Lock,
  Unlock,
} from 'lucide-react';

interface NavbarProps {
  onOpenAlerts: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ onOpenAlerts }) => {
  const {
    userRole,
    setUserRole,
    isOwnerAuthenticated,
    loginOwner,
    logoutOwner,
    alerts,
    isSoundEnabled,
    setIsSoundEnabled,
    isSimulationRunning,
    setIsSimulationRunning,
    deviceViewMode,
    setDeviceViewMode,
    activeTab,
    setActiveTab,
    resetAllData,
    drivers,
    admins,
  } = useFleet();

  const [currentTime, setCurrentTime] = useState<string>('');
  const [roleDropdownOpen, setRoleDropdownOpen] = useState<boolean>(false);
  const [isQuickLoginOpen, setIsQuickLoginOpen] = useState<boolean>(false);
  const [quickPass, setQuickPass] = useState<string>('owneresa1234');
  const [quickUser, setQuickUser] = useState<string>('owner');

  // Unread or active over 60m stops
  const unreadAlerts = alerts.filter((a) => !a.isRead);
  const over60mDrivers = drivers.filter((d) => d.currentIdleMinutes >= 60);

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setCurrentTime(
        new Intl.DateTimeFormat('id-ID', {
          timeZone: 'Asia/Jakarta',
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit',
          weekday: 'short',
          day: 'numeric',
          month: 'short',
          year: 'numeric',
        }).format(now) + ' WIB'
      );
    };

    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  const roles: { role: UserRole; title: string; desc: string; badge: string; color: string }[] = [
    {
      role: 'owner',
      title: 'Owner (Pemilik)',
      desc: 'Akses Penuh: CRUD Driver & Admin, Edit, Hapus, Unduh Laporan',
      badge: isOwnerAuthenticated ? 'Authenticated' : 'Login: owneresa1234',
      color: 'bg-emerald-600/20 text-emerald-300 border-emerald-500/40',
    },
    {
      role: 'admin',
      title: 'Admin Operasional',
      desc: 'Akses Monitoring: Lihat & Unduh Laporan (Tanpa Edit/Hapus)',
      badge: 'Read & Download Only',
      color: 'bg-blue-600/20 text-blue-300 border-blue-500/40',
    },
    {
      role: 'driver',
      title: 'Driver (Pengemudi)',
      desc: 'Akses Lapangan: Hanya Mulai & Berhentikan Perjalanan',
      badge: 'Start/Stop Trip',
      color: 'bg-amber-600/20 text-amber-300 border-amber-500/40',
    },
  ];

  const handleQuickLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const success = loginOwner(quickUser, quickPass);
    if (success) {
      setIsQuickLoginOpen(false);
      setActiveTab('user-management');
    }
  };

  return (
    <header className="sticky top-0 z-[1000] bg-[#1A237E] text-white shadow-lg shrink-0">
      {/* Top Main Brand Header (#1A237E) */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 gap-3">
          {/* Logo & Company Title */}
          <div className="flex items-center gap-3.5">
            <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center text-[#1A237E] font-extrabold text-xl shadow-md shrink-0">
              E
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-lg tracking-tight text-white">
                  PT. ESA JAYA MULIA SENTOSA
                </span>
                <span className="hidden md:inline-block font-light text-indigo-200/75 text-xs font-mono ml-1 px-2 py-0.5 rounded bg-white/10 border border-white/15">
                  GPS Tracker Control
                </span>
              </div>
              <p className="text-[11px] text-indigo-200/70 font-mono truncate hidden sm:block">
                Sistem Pemantauan Armada &amp; Riwayat Titik Koordinat 30 Hari
              </p>
            </div>
          </div>

          {/* Right Action Controls */}
          <div className="flex items-center gap-3">
            {/* Live simulation toggle */}
            <div className="hidden lg:flex items-center bg-[#151c66] border border-indigo-400/20 rounded-lg p-1 text-xs">
              <button
                onClick={() => setIsSimulationRunning(!isSimulationRunning)}
                className={`px-2.5 py-1 rounded flex items-center gap-1.5 font-medium transition-all ${
                  isSimulationRunning
                    ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-400/30'
                    : 'text-indigo-200/70 hover:text-white'
                }`}
                title="Simulasi Pergerakan GPS Real-time"
              >
                {isSimulationRunning ? (
                  <>
                    <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                    <span className="font-mono text-[11px]">GPS LIVE: ON</span>
                  </>
                ) : (
                  <>
                    <Pause className="w-3 h-3 text-indigo-300" />
                    <span className="font-mono text-[11px]">GPS PAUSED</span>
                  </>
                )}
              </button>
            </div>

            {/* Sound Toggle */}
            <button
              onClick={() => setIsSoundEnabled(!isSoundEnabled)}
              className={`p-2 rounded-lg border text-xs transition-all ${
                isSoundEnabled
                  ? 'bg-indigo-700/60 border-indigo-300/40 text-white shadow'
                  : 'bg-[#151c66] border-indigo-400/20 text-indigo-200/70 hover:text-white'
              }`}
              title={isSoundEnabled ? 'Suara Sirine Alert Aktif' : 'Suara Sirine Alert Mati'}
            >
              {isSoundEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
            </button>

            {/* Notification Bell with Over-Limit Badge */}
            <button
              onClick={onOpenAlerts}
              className="relative p-2 rounded-lg bg-[#151c66] hover:bg-indigo-900 border border-indigo-400/20 text-white transition-all shadow-sm"
              title="Daftar Peringatan Driver Berhenti > 60 Menit"
            >
              <Bell className="w-4 h-4" />
              {(unreadAlerts.length > 0 || over60mDrivers.length > 0) && (
                <span className="absolute -top-1 -right-1 flex h-4 min-w-[16px] px-1 items-center justify-center rounded-full bg-red-500 text-white text-[10px] font-extrabold animate-pulse shadow-md ring-2 ring-[#1A237E]">
                  {unreadAlerts.length || over60mDrivers.length}
                </span>
              )}
            </button>

            {/* View Mode Toggle: Desktop vs Android Phone */}
            <button
              onClick={() => setDeviceViewMode(deviceViewMode === 'fullscreen' ? 'mobile-android' : 'fullscreen')}
              className={`hidden sm:flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border text-xs font-semibold transition-all ${
                deviceViewMode === 'mobile-android'
                  ? 'bg-amber-500 text-slate-900 border-amber-300 font-bold shadow'
                  : 'bg-[#151c66] hover:bg-indigo-900 border-indigo-400/20 text-indigo-100'
              }`}
              title="Simulasi Tampilan HP Android"
            >
              {deviceViewMode === 'mobile-android' ? (
                <>
                  <Monitor className="w-3.5 h-3.5" />
                  <span>Mode Desktop</span>
                </>
              ) : (
                <>
                  <Smartphone className="w-3.5 h-3.5 text-amber-300" />
                  <span>Simulasi Android</span>
                </>
              )}
            </button>

            {/* Role Display & Switcher */}
            <div className="relative">
              <button
                onClick={() => setRoleDropdownOpen(!roleDropdownOpen)}
                className="flex items-center gap-3 pl-3 pr-2 py-1 rounded-lg bg-[#151c66] hover:bg-indigo-900/90 border border-indigo-400/30 transition-all shadow-sm"
              >
                <div className="flex flex-col items-end">
                  <div className="flex items-center gap-1">
                    <span className="text-[9px] font-bold uppercase tracking-wider text-indigo-200/80">User Role</span>
                    {userRole === 'owner' && (
                      <span className={`w-1.5 h-1.5 rounded-full ${isOwnerAuthenticated ? 'bg-emerald-400' : 'bg-amber-400 animate-pulse'}`}></span>
                    )}
                  </div>
                  <span className="text-xs font-bold text-white leading-tight">
                    {userRole === 'owner'
                      ? isOwnerAuthenticated
                        ? 'Owner (Verified)'
                        : 'Owner (Guest)'
                      : userRole === 'admin'
                      ? 'Admin Operasional'
                      : 'Driver Lapangan'}
                  </span>
                </div>
                <div className="w-8 h-8 rounded-full bg-indigo-400/30 border-2 border-white/30 flex items-center justify-center font-bold text-xs text-white">
                  {userRole === 'owner' ? 'OW' : userRole === 'admin' ? 'AD' : 'DR'}
                </div>
                <ChevronDown className="w-3.5 h-3.5 text-indigo-200" />
              </button>

              {/* Role Dropdown Menu */}
              {roleDropdownOpen && (
                <div
                  className="absolute right-0 mt-2 w-76 rounded-xl bg-white border border-slate-200 shadow-2xl p-2 z-[1100] text-slate-800 animate-in fade-in slide-in-from-top-2 duration-150"
                  onClick={() => setRoleDropdownOpen(false)}
                >
                  <div className="px-2 py-1.5 border-b border-slate-100 mb-1.5">
                    <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                      Pilih Hak Akses (Role)
                    </div>
                    <div className="text-[10px] text-slate-400">
                      Sistem Multi-Role PT. Esa Jaya Mulia Sentosa
                    </div>
                  </div>

                  <div className="space-y-1">
                    {roles.map((r) => (
                      <button
                        key={r.role}
                        onClick={() => {
                          setUserRole(r.role);
                          if (r.role === 'driver') {
                            setActiveTab('driver-portal');
                          } else if (r.role === 'owner') {
                            if (!isOwnerAuthenticated) {
                              setIsQuickLoginOpen(true);
                            }
                          }
                        }}
                        className={`w-full text-left p-2 rounded-lg border transition-all flex items-start gap-2.5 ${
                          userRole === r.role
                            ? 'bg-indigo-50 border-indigo-300 font-bold shadow-xs'
                            : 'border-transparent hover:bg-slate-50 text-slate-700'
                        }`}
                      >
                        <div className="mt-0.5">
                          {r.role === 'owner' && <Shield className="w-4 h-4 text-emerald-600" />}
                          {r.role === 'admin' && <UserCheck className="w-4 h-4 text-blue-600" />}
                          {r.role === 'driver' && <Truck className="w-4 h-4 text-amber-600" />}
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center justify-between">
                            <span className="text-xs text-slate-900">{r.title}</span>
                            <span className="text-[10px] px-1.5 py-0.2 rounded font-mono font-semibold bg-slate-100 text-slate-600">
                              {r.badge}
                            </span>
                          </div>
                          <p className="text-[10px] text-slate-500 mt-0.5 leading-snug">{r.desc}</p>
                        </div>
                      </button>
                    ))}
                  </div>

                  {/* Owner Credentials helper inside menu */}
                  <div className="mt-2 p-2 bg-emerald-50 rounded-lg border border-emerald-200 text-[10px] text-emerald-900">
                    <div className="font-bold flex items-center gap-1 text-emerald-800 mb-0.5">
                      <KeyRound className="w-3 h-3 text-emerald-600" />
                      <span>Owner Access:</span>
                    </div>
                    <div>User: <strong>owner</strong> | Pass: <strong>owneresa1234</strong></div>
                  </div>

                  <div className="mt-2 pt-2 border-t border-slate-100 flex items-center justify-between px-2 text-[10px] text-slate-500">
                    <span>Domain: @esajaya.com</span>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        resetAllData();
                      }}
                      className="text-indigo-600 hover:text-indigo-800 font-semibold flex items-center gap-1"
                      title="Reset Data Demo"
                    >
                      <RotateCcw className="w-3 h-3" />
                      <span>Reset Data</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Sub-Navigation Bar (#263238 - Technical Dashboard Style) */}
      <div className="bg-[#263238] border-t border-[#1b252a] text-slate-300">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between py-1.5 overflow-x-auto no-scrollbar">
          <nav className="flex items-center space-x-1 sm:space-x-2">
            <button
              onClick={() => setActiveTab('live-tracking')}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-md text-xs font-semibold whitespace-nowrap transition-all ${
                activeTab === 'live-tracking'
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'text-slate-300 hover:bg-slate-700/70 hover:text-white'
              }`}
            >
              <span className="w-2 h-2 rounded-full bg-white animate-pulse"></span>
              <span>1. Real-time Monitoring</span>
            </button>

            <button
              onClick={() => setActiveTab('history-30d')}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-md text-xs font-semibold whitespace-nowrap transition-all ${
                activeTab === 'history-30d'
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'text-slate-300 hover:bg-slate-700/70 hover:text-white'
              }`}
            >
              <Calendar className="w-3.5 h-3.5 opacity-70" />
              <span>2. 30-Day History &amp; Stops</span>
            </button>

            <button
              onClick={() => setActiveTab('driver-portal')}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-md text-xs font-semibold whitespace-nowrap transition-all ${
                activeTab === 'driver-portal'
                  ? 'bg-amber-600 text-white shadow-sm'
                  : 'text-slate-300 hover:bg-slate-700/70 hover:text-white'
              }`}
            >
              <Smartphone className="w-3.5 h-3.5 opacity-70" />
              <span>3. Driver Portal &amp; GPS</span>
            </button>

            <button
              onClick={() => setActiveTab('analytics')}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-md text-xs font-semibold whitespace-nowrap transition-all ${
                activeTab === 'analytics'
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'text-slate-300 hover:bg-slate-700/70 hover:text-white'
              }`}
            >
              <BarChart3 className="w-3.5 h-3.5 opacity-70" />
              <span>4. Fleet Analytics</span>
            </button>

            {/* TAB 5: USER MANAGEMENT (OWNER ONLY CRUD DRIVER & ADMIN) */}
            <button
              onClick={() => setActiveTab('user-management')}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-md text-xs font-semibold whitespace-nowrap transition-all ${
                activeTab === 'user-management'
                  ? 'bg-emerald-600 text-white shadow-sm'
                  : 'text-slate-300 hover:bg-slate-700/70 hover:text-white'
              }`}
            >
              <Users className="w-3.5 h-3.5 text-emerald-400" />
              <span>5. Manajemen User (Driver &amp; Admin)</span>
              <span className="text-[10px] font-mono px-1 py-0.2 bg-emerald-950/70 border border-emerald-400/40 text-emerald-300 rounded font-bold">
                Owner
              </span>
            </button>
          </nav>

          {/* System Status & Time indicator */}
          <div className="hidden lg:flex items-center gap-4 text-[11px] font-mono text-slate-300 pl-4 shrink-0">
            <div className="flex items-center gap-2">
              <span className="text-slate-400">System:</span>
              <span className="px-1.5 py-0.5 bg-green-500/20 text-green-400 rounded border border-green-500/30 font-bold text-[10px]">
                ONLINE
              </span>
            </div>
            <span className="text-slate-600">|</span>
            <div className="text-slate-300">
              {currentTime}
            </div>
          </div>
        </div>
      </div>

      {/* Quick Login Dialog for Owner */}
      {isQuickLoginOpen && (
        <div className="fixed inset-0 z-[2500] bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-2xl border border-slate-200 max-w-sm w-full overflow-hidden text-slate-800 animate-in fade-in zoom-in-95 duration-150">
            <div className="bg-[#1A237E] p-4 text-white flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Shield className="w-5 h-5 text-emerald-400" />
                <h3 className="font-bold text-sm">Autentikasi Owner</h3>
              </div>
              <button
                onClick={() => setIsQuickLoginOpen(false)}
                className="text-indigo-200 hover:text-white text-xs"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleQuickLoginSubmit} className="p-5 space-y-3.5">
              <div className="p-2.5 bg-emerald-50 border border-emerald-200 rounded text-[11px] text-emerald-900 font-mono">
                <div>User: <strong>owner</strong></div>
                <div>Pass: <strong>owneresa1234</strong></div>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-600 uppercase mb-1">
                  Username
                </label>
                <input
                  type="text"
                  value={quickUser}
                  onChange={(e) => setQuickUser(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded p-2 text-xs font-mono"
                  required
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-600 uppercase mb-1">
                  Password
                </label>
                <input
                  type="password"
                  value={quickPass}
                  onChange={(e) => setQuickPass(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded p-2 text-xs font-mono"
                  required
                />
              </div>

              <div className="pt-2 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsQuickLoginOpen(false)}
                  className="px-3 py-1.5 bg-slate-100 text-slate-600 rounded text-xs"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 bg-[#1A237E] text-white rounded text-xs font-bold"
                >
                  Login Owner
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </header>
  );
};
