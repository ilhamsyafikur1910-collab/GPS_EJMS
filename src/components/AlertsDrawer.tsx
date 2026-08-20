import React from 'react';
import { useFleet } from '../context/FleetContext';
import { formatCoord, formatDateTime, formatDuration, playAlertBeep } from '../utils/geoUtils';
import {
  Bell,
  X,
  ShieldAlert,
  MapPin,
  ExternalLink,
  CheckCircle2,
  Trash2,
  Volume2,
} from 'lucide-react';

interface AlertsDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AlertsDrawer: React.FC<AlertsDrawerProps> = ({ isOpen, onClose }) => {
  const { alerts, markAlertAsRead, clearAllAlerts, isSoundEnabled } = useFleet();

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[2000] flex justify-end bg-slate-900/40 backdrop-blur-xs animate-in fade-in duration-150">
      <div
        className="w-full max-w-md bg-white border-l border-slate-200 h-full flex flex-col shadow-2xl animate-in slide-in-from-right duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-4 border-b border-slate-200 flex items-center justify-between bg-slate-50">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-md bg-red-100 border border-red-200 flex items-center justify-center text-red-600">
              <ShieldAlert className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold text-sm text-slate-900">Notifikasi Peringatan Idle</h3>
              <p className="text-[11px] text-slate-500">Driver Berhenti &gt; 60 Menit</p>
            </div>
          </div>

          <div className="flex items-center gap-1">
            <button
              onClick={() => playAlertBeep()}
              className="p-1.5 rounded bg-white hover:bg-slate-100 text-slate-700 border border-slate-200 text-xs shadow-xs"
              title="Uji Suara Sirine Peringatan"
            >
              <Volume2 className="w-4 h-4 text-indigo-600" />
            </button>
            <button
              onClick={onClose}
              className="p-1.5 rounded hover:bg-slate-200 text-slate-500 hover:text-slate-900"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Action Bar */}
        <div className="px-4 py-2 bg-slate-50 border-b border-slate-200 flex items-center justify-between text-xs text-slate-600 font-mono">
          <span>{alerts.length} Notifikasi Tersimpan</span>
          {alerts.length > 0 && (
            <button
              onClick={clearAllAlerts}
              className="text-red-600 hover:text-red-800 flex items-center gap-1 text-[11px] font-semibold"
            >
              <Trash2 className="w-3 h-3" />
              <span>Hapus Semua</span>
            </button>
          )}
        </div>

        {/* Alerts List */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {alerts.length === 0 ? (
            <div className="py-16 text-center text-slate-400 text-xs">
              <CheckCircle2 className="w-8 h-8 text-emerald-500 mx-auto mb-2" />
              Tidak ada peringatan idle aktif saat ini.
            </div>
          ) : (
            alerts.map((alert) => (
              <div
                key={alert.id}
                className={`p-3.5 rounded-lg border transition-all ${
                  alert.isRead
                    ? 'bg-slate-50 border-slate-200 opacity-75'
                    : 'bg-red-50/70 border-red-200 shadow-xs ring-1 ring-red-300'
                }`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-1.5">
                    <span className="font-bold text-sm text-slate-900">{alert.driverName}</span>
                    <span className="text-[10px] font-mono font-bold bg-white text-indigo-700 border border-indigo-200 px-1.5 py-0.2 rounded">
                      {alert.vehiclePlate}
                    </span>
                  </div>
                  <span className="text-[10px] font-mono text-red-700 font-bold bg-red-100 border border-red-200 px-2 py-0.5 rounded">
                    {alert.idleDurationMinutes} Menit
                  </span>
                </div>

                <div className="mt-2 text-xs font-mono text-indigo-700 font-semibold flex items-center gap-1.5">
                  <MapPin className="w-3.5 h-3.5 text-indigo-600 shrink-0" />
                  <span>{formatCoord(alert.lat, alert.lng)}</span>
                </div>

                <div className="mt-1 text-[11px] text-slate-500 font-mono">
                  Waktu Peringatan: {formatDateTime(alert.createdAt)}
                </div>

                <div className="mt-3 pt-2 border-t border-slate-200 flex items-center justify-between text-xs">
                  <a
                    href={`https://www.google.com/maps?q=${alert.lat},${alert.lng}`}
                    target="_blank"
                    rel="noreferrer"
                    className="text-indigo-600 hover:text-indigo-800 flex items-center gap-1 font-semibold text-[11px]"
                  >
                    <span>Peta Google Maps</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>

                  {!alert.isRead && (
                    <button
                      onClick={() => markAlertAsRead(alert.id)}
                      className="px-2 py-1 bg-white hover:bg-slate-100 text-slate-700 border border-slate-200 rounded text-[11px] font-semibold shadow-xs"
                    >
                      Tandai Dibaca
                    </button>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};
