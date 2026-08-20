import React, { useState, useMemo } from 'react';
import { useFleet } from '../context/FleetContext';
import { MapView } from './MapView';
import { StopPoint, TripReport } from '../types';
import { formatCoord, formatDateTime, formatDuration, formatDateOnly, formatTimeOnly } from '../utils/geoUtils';
import { exportStopsToExcel, exportStopsToPdf, exportStopsToCsv } from '../utils/exportUtils';
import {
  Calendar,
  FileSpreadsheet,
  FileText,
  Trash2,
  Edit,
  Search,
  Filter,
  Play,
  Pause,
  AlertTriangle,
  Download,
  MapPin,
  Clock,
  Shield,
  Eye,
  CheckCircle2,
  ExternalLink,
} from 'lucide-react';

interface HistoryReportsTabProps {
  onEditStop?: (stop: StopPoint) => void;
}

export const HistoryReportsTab: React.FC<HistoryReportsTabProps> = ({ onEditStop }) => {
  const {
    allStops,
    trips,
    drivers,
    userRole,
    deleteStopPoint,
    deleteTrip,
    selectedTrip,
    setSelectedTrip,
  } = useFleet();

  // Filters
  const [selectedDriverFilter, setSelectedDriverFilter] = useState<string>('all');
  const [dayRangeFilter, setDayRangeFilter] = useState<number>(30); // 30 days default
  const [onlyOverLimit, setOnlyOverLimit] = useState<boolean>(false);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [viewMode, setViewMode] = useState<'stops' | 'trips'>('stops');
  const [focusedStop, setFocusedStop] = useState<StopPoint | null>(null);

  // Playback state
  const [isPlayingRoute, setIsPlayingRoute] = useState<boolean>(false);
  const [playbackProgress, setPlaybackProgress] = useState<number>(0);

  // Filtered Stops based on 30-day range and criteria
  const filteredStops = useMemo(() => {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - dayRangeFilter);

    return allStops.filter((stop) => {
      const stopDate = new Date(stop.arrivalTime);
      if (stopDate < cutoffDate) return false;

      if (selectedDriverFilter !== 'all' && stop.driverId !== selectedDriverFilter) {
        return false;
      }

      if (onlyOverLimit && !stop.isOverLimit) {
        return false;
      }

      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesName = stop.driverName.toLowerCase().includes(q);
        const matchesPlate = stop.vehiclePlate.toLowerCase().includes(q);
        const matchesCoord = `${stop.lat}, ${stop.lng}`.includes(q);
        const matchesNotes = (stop.notes || '').toLowerCase().includes(q);
        if (!matchesName && !matchesPlate && !matchesCoord && !matchesNotes) return false;
      }

      return true;
    });
  }, [allStops, dayRangeFilter, selectedDriverFilter, onlyOverLimit, searchQuery]);

  // Filtered Trips
  const filteredTrips = useMemo(() => {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - dayRangeFilter);

    return trips.filter((t) => {
      const tripDate = new Date(t.startTime);
      if (tripDate < cutoffDate) return false;

      if (selectedDriverFilter !== 'all' && t.driverId !== selectedDriverFilter) {
        return false;
      }

      if (onlyOverLimit && t.stopsOverLimitCount === 0) {
        return false;
      }

      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        return (
          t.id.toLowerCase().includes(q) ||
          t.driverName.toLowerCase().includes(q) ||
          t.vehiclePlate.toLowerCase().includes(q)
        );
      }

      return true;
    });
  }, [trips, dayRangeFilter, selectedDriverFilter, onlyOverLimit, searchQuery]);

  // Export handlers
  const handleExportExcel = () => {
    exportStopsToExcel(
      filteredStops,
      'PT. ESA JAYA MULIA SENTOSA',
      userRole === 'owner' ? 'Owner Management' : 'Admin Operasional'
    );
  };

  const handleExportPdf = () => {
    exportStopsToPdf(
      filteredStops,
      'PT. ESA JAYA MULIA SENTOSA',
      userRole === 'owner' ? 'Owner Management' : 'Admin Operasional'
    );
  };

  const handleExportCsv = () => {
    exportStopsToCsv(filteredStops, 'PT. ESA JAYA MULIA SENTOSA');
  };

  // Owner Delete Confirmation
  const handleDeleteStopConfirm = (stop: StopPoint) => {
    if (userRole !== 'owner') {
      alert('Akses Ditolak: Hanya Owner yang berhak menghapus data laporan.');
      return;
    }

    if (
      window.confirm(
        `Konfirmasi Hapus: Apakah Owner yakin ingin menghapus data perhentian Driver ${stop.driverName} di koordinat ${formatCoord(
          stop.lat,
          stop.lng
        )}?`
      )
    ) {
      deleteStopPoint(stop.id);
    }
  };

  const handleDeleteTripConfirm = (trip: TripReport) => {
    if (userRole !== 'owner') {
      alert('Akses Ditolak: Hanya Owner yang berhak menghapus seluruh riwayat perjalanan.');
      return;
    }

    if (
      window.confirm(
        `Konfirmasi Hapus: Hapus seluruh laporan perjalanan #${trip.id} (${trip.driverName}) beserta seluruh titik perhentiannya?`
      )
    ) {
      deleteTrip(trip.id);
    }
  };

  // Summary counts for current filtered view
  const totalStopsCount = filteredStops.length;
  const over60mStopsCount = filteredStops.filter((s) => s.isOverLimit).length;
  const totalIdleDurationMinutes = filteredStops.reduce((acc, curr) => acc + curr.durationMinutes, 0);

  return (
    <div className="space-y-4">
      {/* Top Banner & Export Actions (Technical Dashboard Style) */}
      <div className="bg-white border border-slate-200 rounded-lg p-4 shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <Calendar className="w-5 h-5 text-indigo-600" />
            <h2 className="text-base font-bold text-slate-900">
              Riwayat Perjalanan &amp; Titik Perhentian 30 Hari
            </h2>
            <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-indigo-50 text-indigo-700 border border-indigo-200 font-mono">
              Koordinat GPS Asli
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Data lengkap perhentian armada PT. Esa Jaya Mulia Sentosa dengan durasi berhenti dan deteksi &gt;60 menit.
          </p>
        </div>

        {/* Export Buttons (Available to Owner & Admin) */}
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={handleExportExcel}
            className="px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-md text-xs font-bold flex items-center gap-1.5 transition-all shadow-xs active:scale-95"
            title="Download Laporan Format Microsoft Excel (.xlsx)"
          >
            <FileSpreadsheet className="w-4 h-4" />
            <span>Unduh Excel (.xlsx)</span>
          </button>

          <button
            onClick={handleExportPdf}
            className="px-3.5 py-1.5 bg-rose-600 hover:bg-rose-700 text-white rounded-md text-xs font-bold flex items-center gap-1.5 transition-all shadow-xs active:scale-95"
            title="Download Laporan Format PDF Resmi"
          >
            <FileText className="w-4 h-4" />
            <span>Unduh PDF</span>
          </button>

          <button
            onClick={handleExportCsv}
            className="px-2.5 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200 rounded-md text-xs font-semibold flex items-center gap-1 transition-all"
            title="Export CSV"
          >
            <Download className="w-3.5 h-3.5" />
            <span>CSV</span>
          </button>
        </div>
      </div>

      {/* Role Permission Guidance Banner */}
      <div
        className={`p-3 rounded-lg border text-xs flex items-center justify-between gap-3 ${
          userRole === 'owner'
            ? 'bg-emerald-50 border-emerald-200 text-emerald-900'
            : userRole === 'admin'
            ? 'bg-blue-50 border-blue-200 text-blue-900'
            : 'bg-amber-50 border-amber-200 text-amber-900'
        }`}
      >
        <div className="flex items-center gap-2">
          <Shield className="w-4 h-4 shrink-0" />
          <span>
            {userRole === 'owner' && (
              <>
                <strong>Mode Owner Aktif:</strong> Anda memiliki otorisasi penuh untuk <strong>Melihat</strong>, <strong>Mengedit</strong>, <strong>Mengunduh Excel/PDF</strong>, dan <strong>Menghapus</strong> data perhentian.
              </>
            )}
            {userRole === 'admin' && (
              <>
                <strong>Mode Admin Aktif:</strong> Anda memiliki otorisasi untuk <strong>Melihat</strong> dan <strong>Mengunduh Laporan (Excel/PDF)</strong>. Tombol edit &amp; hapus dinonaktifkan.
              </>
            )}
            {userRole === 'driver' && (
              <>
                <strong>Mode Driver:</strong> Akses laporan dibatasi untuk view audit armada. Gunakan tab "Layar Driver" untuk tracking GPS.
              </>
            )}
          </span>
        </div>
      </div>

      {/* Filter and Control Bar */}
      <div className="bg-white border border-slate-200 rounded-lg p-3.5 shadow-xs space-y-3">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-2.5">
          {/* Driver Selector */}
          <div>
            <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-tight mb-1">
              Filter Driver:
            </label>
            <select
              value={selectedDriverFilter}
              onChange={(e) => setSelectedDriverFilter(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-md px-2.5 py-1.5 text-xs text-slate-800 focus:outline-none focus:border-indigo-600 focus:bg-white font-mono"
            >
              <option value="all">Semua Driver ({drivers.length})</option>
              {drivers.map((d) => (
                <option key={d.id} value={d.id}>
                  {d.name} ({d.vehiclePlate})
                </option>
              ))}
            </select>
          </div>

          {/* Day Range Selector */}
          <div>
            <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-tight mb-1">
              Rentang Waktu:
            </label>
            <select
              value={dayRangeFilter}
              onChange={(e) => setDayRangeFilter(Number(e.target.value))}
              className="w-full bg-slate-50 border border-slate-200 rounded-md px-2.5 py-1.5 text-xs text-slate-800 focus:outline-none focus:border-indigo-600 focus:bg-white font-mono"
            >
              <option value={1}>Hari Ini (1 Hari Terakhir)</option>
              <option value={7}>7 Hari Terakhir</option>
              <option value={14}>14 Hari Terakhir</option>
              <option value={30}>30 Hari Terakhir (Lengkap)</option>
            </select>
          </div>

          {/* Search Query */}
          <div>
            <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-tight mb-1">
              Pencarian Koordinat / Catatan:
            </label>
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2" />
              <input
                type="text"
                placeholder="Cari lat, lng, catatan..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-md pl-8 pr-2.5 py-1.5 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:border-indigo-600 focus:bg-white font-mono"
              />
            </div>
          </div>

          {/* Idle >60m Only Toggle */}
          <div className="flex flex-col justify-end">
            <button
              onClick={() => setOnlyOverLimit(!onlyOverLimit)}
              className={`w-full py-1.5 px-3 rounded-md border text-xs font-bold flex items-center justify-center gap-1.5 transition-all ${
                onlyOverLimit
                  ? 'bg-red-600 border-red-600 text-white shadow-xs'
                  : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
              }`}
            >
              <AlertTriangle className="w-3.5 h-3.5" />
              <span>Hanya Berhenti &gt;60 Menit</span>
            </button>
          </div>
        </div>

        {/* View mode switcher & Metric strip */}
        <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-slate-100 text-xs">
          <div className="flex items-center gap-1 bg-slate-100 p-0.5 rounded-md">
            <button
              onClick={() => setViewMode('stops')}
              className={`px-3 py-1 rounded text-xs font-semibold transition-all ${
                viewMode === 'stops' ? 'bg-indigo-600 text-white shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Daftar Titik Perhentian ({totalStopsCount})
            </button>
            <button
              onClick={() => setViewMode('trips')}
              className={`px-3 py-1 rounded text-xs font-semibold transition-all ${
                viewMode === 'trips' ? 'bg-indigo-600 text-white shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Daftar Sesi Perjalanan ({filteredTrips.length})
            </button>
          </div>

          <div className="flex items-center gap-3 text-slate-500 font-mono text-[11px]">
            <span>
              Total Waktu Berhenti: <strong className="text-slate-800">{(totalIdleDurationMinutes / 60).toFixed(1)} Jam</strong>
            </span>
            <span>•</span>
            <span className="text-red-600 font-bold">
              Alert &gt;60m: {over60mStopsCount} Titik
            </span>
          </div>
        </div>
      </div>

      {/* Main Content Layout: Table/List and Interactive Map with Stop Highlighting */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        {/* Left / Top: Interactive Map showing stop points (5 Cols) */}
        <div className="lg:col-span-5 space-y-3">
          <div className="bg-white border border-slate-200 rounded-lg p-3 shadow-xs">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5 text-indigo-600" />
                Peta Sebaran Titik Perhentian
              </span>
              <span className="text-[10px] text-slate-500 font-mono">
                {filteredStops.length} Titik Ditampilkan
              </span>
            </div>
            <MapView
              stops={filteredStops.slice(0, 40)}
              activeTrip={selectedTrip}
              heightClass="h-[400px]"
            />
          </div>

          {/* Focused Stop Inspector Card */}
          {focusedStop && (
            <div className="bg-white border border-indigo-300 rounded-lg p-3.5 shadow-sm animate-in fade-in duration-200">
              <div className="flex items-start justify-between">
                <div>
                  <div className="text-[10px] font-mono text-indigo-600 font-bold uppercase tracking-wider">
                    Detail Titik Terpilih #{focusedStop.id}
                  </div>
                  <div className="font-bold text-slate-900 text-sm mt-0.5">
                    {focusedStop.driverName} ({focusedStop.vehiclePlate})
                  </div>
                </div>
                <span
                  className={`px-2 py-0.5 text-[10px] font-bold rounded ${
                    focusedStop.isOverLimit ? 'bg-red-600 text-white animate-pulse' : 'bg-slate-100 text-slate-700'
                  }`}
                >
                  {focusedStop.isOverLimit ? '⚠️ ALERT >60 MENIT' : 'Normal'}
                </span>
              </div>

              <div className="mt-2.5 grid grid-cols-2 gap-2 text-xs font-mono">
                <div className="bg-slate-50 p-2 rounded border border-slate-200">
                  <span className="text-slate-500 block text-[10px]">Titik Koordinat:</span>
                  <span className="text-indigo-700 font-bold">{formatCoord(focusedStop.lat, focusedStop.lng)}</span>
                </div>
                <div className="bg-slate-50 p-2 rounded border border-slate-200">
                  <span className="text-slate-500 block text-[10px]">Durasi Berhenti:</span>
                  <span className={focusedStop.isOverLimit ? 'text-red-600 font-bold' : 'text-slate-800 font-bold'}>
                    {formatDuration(focusedStop.durationMinutes)}
                  </span>
                </div>
                <div className="bg-slate-50 p-2 rounded border border-slate-200">
                  <span className="text-slate-500 block text-[10px]">Waktu Tiba:</span>
                  <span className="text-slate-700">{formatDateTime(focusedStop.arrivalTime)}</span>
                </div>
                <div className="bg-slate-50 p-2 rounded border border-slate-200">
                  <span className="text-slate-500 block text-[10px]">Waktu Berangkat:</span>
                  <span className="text-slate-700">{formatDateTime(focusedStop.departureTime)}</span>
                </div>
              </div>

              {focusedStop.notes && (
                <div className="mt-2 text-xs bg-slate-50 p-2 rounded border border-slate-200 text-slate-700">
                  <span className="text-slate-500 font-bold block text-[10px]">Keterangan:</span>
                  {focusedStop.notes}
                </div>
              )}

              <div className="mt-3 flex items-center justify-between">
                <a
                  href={`https://www.google.com/maps?q=${focusedStop.lat},${focusedStop.lng}`}
                  target="_blank"
                  rel="noreferrer"
                  className="text-xs text-indigo-600 hover:text-indigo-800 flex items-center gap-1 font-semibold"
                >
                  <span>Lihat di Google Maps</span>
                  <ExternalLink className="w-3 h-3" />
                </a>

                {userRole === 'owner' && (
                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() => onEditStop && onEditStop(focusedStop)}
                      className="px-2.5 py-1 bg-amber-600 hover:bg-amber-700 text-white rounded text-xs font-bold flex items-center gap-1"
                    >
                      <Edit className="w-3 h-3" />
                      <span>Edit</span>
                    </button>
                    <button
                      onClick={() => handleDeleteStopConfirm(focusedStop)}
                      className="px-2.5 py-1 bg-red-600 hover:bg-red-700 text-white rounded text-xs font-bold flex items-center gap-1"
                    >
                      <Trash2 className="w-3 h-3" />
                      <span>Hapus</span>
                    </button>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Right / Bottom: Detailed Stop Points Table (7 Cols) */}
        <div className="lg:col-span-7 space-y-3">
          {viewMode === 'stops' ? (
            <div className="bg-white border border-slate-200 rounded-lg overflow-hidden shadow-xs">
              <div className="p-3 border-b border-slate-100 flex items-center justify-between">
                <span className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                  Daftar Titik Perhentian ({filteredStops.length} Catatan)
                </span>
                <span className="text-[11px] text-slate-500 font-mono">
                  Menampilkan 30 Hari Terakhir
                </span>
              </div>

              {filteredStops.length === 0 ? (
                <div className="p-12 text-center text-slate-400 text-xs">
                  Tidak ada catatan perhentian yang cocok dengan filter yang dipilih.
                </div>
              ) : (
                <div className="overflow-x-auto max-h-[560px]">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-slate-50 text-slate-500 font-mono text-[11px] sticky top-0 z-10 border-b border-slate-200">
                      <tr>
                        <th className="p-2.5">No</th>
                        <th className="p-2.5">Driver &amp; Plat</th>
                        <th className="p-2.5">Koordinat (Lat, Lng)</th>
                        <th className="p-2.5">Waktu Tiba - Keluar</th>
                        <th className="p-2.5">Durasi</th>
                        <th className="p-2.5 text-right">Aksi</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 font-sans">
                      {filteredStops.map((stop, idx) => {
                        const isOverLimit = stop.isOverLimit;
                        const isFocused = focusedStop?.id === stop.id;

                        return (
                          <tr
                            key={stop.id}
                            onClick={() => setFocusedStop(stop)}
                            className={`cursor-pointer transition-all ${
                              isFocused
                                ? 'bg-indigo-50 font-medium'
                                : isOverLimit
                                ? 'bg-red-50/40 hover:bg-red-50/80'
                                : 'hover:bg-slate-50/80'
                            }`}
                          >
                            <td className="p-2.5 font-mono text-slate-400">{idx + 1}</td>
                            <td className="p-2.5">
                              <div className="font-bold text-slate-900">{stop.driverName}</div>
                              <div className="font-mono text-[11px] text-indigo-700 font-semibold">
                                {stop.vehiclePlate}
                              </div>
                            </td>
                            <td className="p-2.5 font-mono text-xs text-indigo-700 font-semibold">
                              {formatCoord(stop.lat, stop.lng)}
                            </td>
                            <td className="p-2.5 text-[11px] text-slate-600">
                              <div>{formatDateTime(stop.arrivalTime)}</div>
                              <div className="text-slate-400 font-mono">
                                s/d {formatTimeOnly(stop.departureTime)}
                              </div>
                            </td>
                            <td className="p-2.5 font-mono">
                              <span
                                className={`px-2 py-0.5 rounded text-[11px] font-bold ${
                                  isOverLimit
                                    ? 'bg-red-100 text-red-700 border border-red-300 animate-pulse'
                                    : 'bg-slate-100 text-slate-700'
                                }`}
                              >
                                {stop.durationMinutes} Min
                              </span>
                            </td>
                            <td className="p-2.5 text-right" onClick={(e) => e.stopPropagation()}>
                              <div className="flex items-center justify-end gap-1">
                                {userRole === 'owner' ? (
                                  <>
                                    <button
                                      onClick={() => onEditStop && onEditStop(stop)}
                                      className="p-1.5 bg-amber-50 hover:bg-amber-600 text-amber-700 hover:text-white rounded border border-amber-200 transition-all"
                                      title="Edit Koordinat/Durasi (Khusus Owner)"
                                    >
                                      <Edit className="w-3.5 h-3.5" />
                                    </button>
                                    <button
                                      onClick={() => handleDeleteStopConfirm(stop)}
                                      className="p-1.5 bg-red-50 hover:bg-red-600 text-red-700 hover:text-white rounded border border-red-200 transition-all"
                                      title="Hapus Titik (Khusus Owner)"
                                    >
                                      <Trash2 className="w-3.5 h-3.5" />
                                    </button>
                                  </>
                                ) : (
                                  <button
                                    onClick={() => setFocusedStop(stop)}
                                    className="p-1.5 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded"
                                    title="Lihat Detail Titik"
                                  >
                                    <Eye className="w-3.5 h-3.5" />
                                  </button>
                                )}
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          ) : (
            /* Trips View */
            <div className="space-y-2.5 max-h-[560px] overflow-y-auto pr-1">
              {filteredTrips.map((trip) => (
                <div
                  key={trip.id}
                  onClick={() => setSelectedTrip(trip)}
                  className={`p-3.5 rounded-lg border transition-all cursor-pointer bg-white shadow-xs ${
                    selectedTrip?.id === trip.id
                      ? 'border-indigo-600 ring-2 ring-indigo-500/20 bg-indigo-50/40'
                      : 'border-slate-200 hover:border-slate-300 hover:bg-slate-50/70'
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-slate-900 text-sm">{trip.id}</span>
                        <span
                          className={`text-[10px] font-bold px-1.5 py-0.2 rounded font-mono ${
                            trip.status === 'active'
                              ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                              : 'bg-slate-100 text-slate-600'
                          }`}
                        >
                          {trip.status.toUpperCase()}
                        </span>
                      </div>
                      <div className="text-xs text-slate-500 mt-0.5">
                        {trip.driverName} • <strong className="text-indigo-700 font-mono">{trip.vehiclePlate}</strong>
                      </div>
                    </div>

                    <div className="text-right font-mono">
                      <div className="text-xs font-bold text-slate-800">{trip.totalDistanceKm} KM</div>
                      <div className="text-[11px] text-slate-500">{formatDuration(trip.totalDurationMinutes)}</div>
                    </div>
                  </div>

                  <div className="mt-2.5 pt-2 border-t border-slate-100 flex items-center justify-between text-xs font-mono text-slate-500">
                    <div>
                      Titik Berhenti: <strong className="text-slate-800">{trip.stopsCount}</strong> (
                      <span className={trip.stopsOverLimitCount > 0 ? 'text-red-600 font-bold' : 'text-slate-500'}>
                        {trip.stopsOverLimitCount} Alert &gt;60m
                      </span>
                      )
                    </div>

                    {userRole === 'owner' && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeleteTripConfirm(trip);
                        }}
                        className="text-red-600 hover:text-red-800 flex items-center gap-1 text-[11px] font-semibold"
                      >
                        <Trash2 className="w-3 h-3" />
                        <span>Hapus Sesi</span>
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
