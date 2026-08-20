import React, { useState } from 'react';
import { FleetProvider, useFleet } from './context/FleetContext';
import { Navbar } from './components/Navbar';
import { LiveTrackingTab } from './components/LiveTrackingTab';
import { HistoryReportsTab } from './components/HistoryReportsTab';
import { DriverAppView } from './components/DriverAppView';
import { AnalyticsTab } from './components/AnalyticsTab';
import { UserManagementTab } from './components/UserManagementTab';
import { AlertsDrawer } from './components/AlertsDrawer';
import { EditReportModal } from './components/EditReportModal';
import { ToastNotification } from './components/ToastNotification';
import { StopPoint } from './types';
import { Smartphone, Monitor, Shield, Truck, Compass, CheckCircle2 } from 'lucide-react';

const FleetAppContent: React.FC = () => {
  const { activeTab, setActiveTab, deviceViewMode, setDeviceViewMode, userRole } = useFleet();
  const [isAlertsOpen, setIsAlertsOpen] = useState<boolean>(false);
  const [editingStop, setEditingStop] = useState<StopPoint | null>(null);

  return (
    <div className="min-h-screen bg-[#F0F2F5] text-slate-800 flex flex-col font-sans selection:bg-indigo-600 selection:text-white">
      {/* Top Navbar */}
      <Navbar onOpenAlerts={() => setIsAlertsOpen(true)} />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-3 sm:p-5 lg:p-6">
        {deviceViewMode === 'mobile-android' ? (
          /* Android Smartphone Simulator Shell */
          <div className="py-4 flex flex-col items-center justify-center">
            <div className="text-center mb-3">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-amber-100 border border-amber-300 text-amber-900 shadow-xs">
                <Smartphone className="w-3.5 h-3.5" />
                Simulasi Perangkat Android Mobile (APK PT. Esa Jaya Mulia Sentosa)
              </span>
              <p className="text-[11px] text-slate-600 mt-1">
                Tampilan antarmuka saat aplikasi dipasang di smartphone Android Driver atau Owner.
              </p>
            </div>

            {/* Android Device Frame */}
            <div className="w-full max-w-[390px] h-[820px] bg-slate-900 rounded-[48px] p-3 shadow-2xl border-4 border-slate-700 relative overflow-hidden flex flex-col ring-12 ring-slate-800/80">
              {/* Phone Speaker & Camera Notch */}
              <div className="absolute top-4 left-1/2 -translate-x-1/2 w-32 h-5 bg-black rounded-full z-50 flex items-center justify-center">
                <div className="w-3 h-3 rounded-full bg-slate-900 mr-2 border border-slate-800"></div>
                <div className="w-12 h-1 bg-slate-800 rounded-full"></div>
              </div>

              {/* Status Bar */}
              <div className="h-7 pt-2 px-6 flex items-center justify-between text-[11px] font-mono text-slate-300 z-40 bg-slate-900">
                <span>08:45</span>
                <div className="flex items-center gap-1.5 text-[10px]">
                  <span>4G LTE</span>
                  <span>100%</span>
                </div>
              </div>

              {/* Android Screen Body */}
              <div className="flex-1 overflow-y-auto bg-slate-900 rounded-b-[36px] p-3 pb-8 space-y-3">
                {activeTab === 'driver-portal' && <DriverAppView />}
                {activeTab === 'live-tracking' && <LiveTrackingTab />}
                {activeTab === 'history-30d' && (
                  <HistoryReportsTab onEditStop={(stop) => setEditingStop(stop)} />
                )}
                {activeTab === 'analytics' && <AnalyticsTab />}
                {activeTab === 'user-management' && <UserManagementTab />}
              </div>

              {/* Bottom Android Home Bar */}
              <div className="h-4 bg-slate-900 flex items-center justify-center">
                <div className="w-28 h-1 bg-slate-600 rounded-full"></div>
              </div>
            </div>
          </div>
        ) : (
          /* Full Desktop / Command Center Workspace */
          <div className="space-y-5">
            {activeTab === 'live-tracking' && <LiveTrackingTab />}
            {activeTab === 'history-30d' && (
              <HistoryReportsTab onEditStop={(stop) => setEditingStop(stop)} />
            )}
            {activeTab === 'driver-portal' && <DriverAppView />}
            {activeTab === 'analytics' && <AnalyticsTab />}
            {activeTab === 'user-management' && <UserManagementTab />}
          </div>
        )}
      </main>

      {/* Footer (Technical Dashboard Style) */}
      <footer className="border-t border-slate-200 bg-white py-3.5 px-6 text-slate-600 text-xs shadow-sm mt-auto">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="font-mono text-[11px] text-slate-700 flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
            <span>&copy; {new Date().getFullYear()} <strong>PT. ESA JAYA MULIA SENTOSA</strong> • Sistem Pelacakan GPS Armada</span>
          </div>
          <div className="flex items-center gap-3 text-[11px] font-mono text-slate-500">
            <span className="flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-blue-500"></span>
              GPS Engine v2.4 (Online)
            </span>
            <span>•</span>
            <span>Format Titik Koordinat (Lat, Lng)</span>
            <span>•</span>
            <span>Riwayat 30 Hari Aktif</span>
            <span>•</span>
            <span className="text-red-600 font-bold bg-red-50 px-1.5 py-0.5 rounded border border-red-200">Idle Alert &gt; 60m</span>
          </div>
        </div>
      </footer>

      {/* Drawers & Modals */}
      <AlertsDrawer isOpen={isAlertsOpen} onClose={() => setIsAlertsOpen(false)} />
      <EditReportModal stop={editingStop} onClose={() => setEditingStop(null)} />
      <ToastNotification />
    </div>
  );
};

export default function App() {
  return (
    <FleetProvider>
      <FleetAppContent />
    </FleetProvider>
  );
}
