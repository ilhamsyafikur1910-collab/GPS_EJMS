import React, { useState, useEffect } from 'react';
import { StopPoint } from '../types';
import { useFleet } from '../context/FleetContext';
import { formatCoord, formatDateTime } from '../utils/geoUtils';
import { Edit3, X, Save, AlertTriangle } from 'lucide-react';

interface EditReportModalProps {
  stop: StopPoint | null;
  onClose: () => void;
}

export const EditReportModal: React.FC<EditReportModalProps> = ({ stop, onClose }) => {
  const { editStopPoint, userRole } = useFleet();

  const [lat, setLat] = useState<number>(0);
  const [lng, setLng] = useState<number>(0);
  const [durationMinutes, setDurationMinutes] = useState<number>(0);
  const [notes, setNotes] = useState<string>('');

  useEffect(() => {
    if (stop) {
      setLat(stop.lat);
      setLng(stop.lng);
      setDurationMinutes(stop.durationMinutes);
      setNotes(stop.notes || '');
    }
  }, [stop]);

  if (!stop) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (userRole !== 'owner') {
      alert('Akses Ditolak: Hanya Owner yang berhak mengedit data perhentian.');
      return;
    }

    editStopPoint(stop.id, {
      lat: Number(lat),
      lng: Number(lng),
      durationMinutes: Number(durationMinutes),
      notes: notes.trim(),
    });

    onClose();
  };

  return (
    <div className="fixed inset-0 z-[2100] flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs animate-in fade-in duration-150">
      <div
        className="w-full max-w-md bg-white border border-slate-200 rounded-lg shadow-2xl overflow-hidden animate-in zoom-in-95 duration-150"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-md bg-amber-100 border border-amber-200 flex items-center justify-center text-amber-700">
              <Edit3 className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold text-sm text-slate-900">Edit Laporan Titik Perhentian</h3>
              <p className="text-[11px] text-slate-500 font-mono">ID: {stop.id}</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1 rounded-md text-slate-400 hover:text-slate-700 hover:bg-slate-100">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-4 space-y-3.5 text-xs">
          <div className="bg-slate-50 p-3 rounded-md border border-slate-200 space-y-1">
            <div className="text-slate-600">
              Driver: <strong className="text-slate-900">{stop.driverName}</strong> ({stop.vehiclePlate})
            </div>
            <div className="text-slate-600">
              Waktu Masuk: <strong className="text-slate-800 font-mono">{formatDateTime(stop.arrivalTime)}</strong>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-[11px] font-bold text-slate-600 mb-1">
                Latitude:
              </label>
              <input
                type="number"
                step="0.000001"
                required
                value={lat}
                onChange={(e) => setLat(parseFloat(e.target.value))}
                className="w-full bg-slate-50 border border-slate-200 rounded-md px-3 py-2 text-slate-900 font-mono focus:outline-none focus:border-indigo-600 focus:bg-white"
              />
            </div>

            <div>
              <label className="block text-[11px] font-bold text-slate-600 mb-1">
                Longitude:
              </label>
              <input
                type="number"
                step="0.000001"
                required
                value={lng}
                onChange={(e) => setLng(parseFloat(e.target.value))}
                className="w-full bg-slate-50 border border-slate-200 rounded-md px-3 py-2 text-slate-900 font-mono focus:outline-none focus:border-indigo-600 focus:bg-white"
              />
            </div>
          </div>

          <div>
            <label className="block text-[11px] font-bold text-slate-600 mb-1">
              Durasi Berhenti (Menit):
            </label>
            <input
              type="number"
              min="1"
              max="1440"
              required
              value={durationMinutes}
              onChange={(e) => setDurationMinutes(parseInt(e.target.value) || 0)}
              className="w-full bg-slate-50 border border-slate-200 rounded-md px-3 py-2 text-slate-900 font-mono focus:outline-none focus:border-indigo-600 focus:bg-white"
            />
            {durationMinutes >= 60 && (
              <span className="text-[10px] text-red-600 mt-1 block font-semibold">
                ⚠️ Nilai ini &ge; 60 menit akan memicu label Peringatan (Alert Over-Limit).
              </span>
            )}
          </div>

          <div>
            <label className="block text-[11px] font-bold text-slate-600 mb-1">
              Catatan / Alasan Perhentian:
            </label>
            <textarea
              rows={2}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Contoh: Pengisian BBM & bongkar muat gudang..."
              className="w-full bg-slate-50 border border-slate-200 rounded-md px-3 py-2 text-slate-900 placeholder-slate-400 focus:outline-none focus:border-indigo-600 focus:bg-white"
            />
          </div>

          <div className="pt-2 border-t border-slate-200 flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-3.5 py-2 rounded-md bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold"
            >
              Batal
            </button>
            <button
              type="submit"
              className="px-4 py-2 rounded-md bg-indigo-600 hover:bg-indigo-700 text-white font-bold flex items-center gap-1.5 shadow-xs"
            >
              <Save className="w-4 h-4" />
              <span>Simpan Perubahan</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
