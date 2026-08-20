import React, { useState } from 'react';
import { useFleet } from '../context/FleetContext';
import { MapView } from './MapView';
import { formatCoord, formatDateTime, formatDuration } from '../utils/geoUtils';
import {
  Truck,
  Compass,
  Battery,
  Wifi,
  ExternalLink,
  ShieldAlert,
  Search,
  Filter,
  Activity,
  Maximize2,
  Clock,
  MapPin,
  CheckCircle2,
} from 'lucide-react';

export const LiveTrackingTab: React.FC = () => {
  const { drivers, activeDriverId, setActiveDriverId, userRole } = useFleet();

  const [searchQuery, setSearchQuery] = useState<string>('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'driving' | 'idle' | 'stopped' | 'over60m'>('all');
  const [selectedDriverForDetail, setSelectedDriverForDetail] = useState<string>(activeDriverId);

  // Filtered drivers list
  const filteredDrivers = drivers.filter((driver) => {
    const matchesSearch =
      driver.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      driver.vehiclePlate.toLowerCase().includes(searchQuery.toLowerCase()) ||
      driver.vehicleType.toLowerCase().includes(searchQuery.toLowerCase());

    if (!matchesSearch) return false;

    if (statusFilter === 'all') return true;
    if (statusFilter === 'driving') return driver.status === 'driving';
    if (statusFilter === 'idle') return driver.status === 'idle' && driver.currentIdleMinutes < 60;
    if (statusFilter === 'stopped') return driver.status === 'stopped';
    if (statusFilter === 'over60m') return driver.currentIdleMinutes >= 60;
    return true;
  });

  const selectedDriver = drivers.find((d) => d.id === selectedDriverForDetail) || drivers[0];

  // Quick summary counts
  const totalFleet = drivers.length;
  const drivingCount = drivers.filter((d) => d.status === 'driving').length;
  const idleCount = drivers.filter((d) => d.status === 'idle' && d.currentIdleMinutes < 60).length;
  const over60mCount = drivers.filter((d) => d.currentIdleMinutes >= 60).length;

  return (
    <div className="space-y-4">
      {/* Top Telemetry KPI Bar (Technical Dashboard Style) */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5">
        <div className="bg-white border border-slate-200 rounded-lg p-4 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-tight">Total Armada</span>
            <Truck className="w-4 h-4 text-indigo-600" />
          </div>
          <div className="text-2xl font-light text-slate-800 mt-1.5">{totalFleet} <span className="text-base font-normal text-slate-500">Unit</span></div>
          <div className="text-[11px] text-slate-500 font-mono mt-0.5">PT. Esa Jaya Mulia Sentosa</div>
        </div>

        <div className="bg-white border border-slate-200 rounded-lg p-4 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-tight">Bergerak (Driving)</span>
            <Activity className="w-4 h-4 text-emerald-600 animate-pulse" />
          </div>
          <div className="text-2xl font-light text-slate-800 mt-1.5 flex items-baseline gap-2">
            <span>{drivingCount}</span>
            <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
              {Math.round((drivingCount / (totalFleet || 1)) * 100)}% AKTIF
            </span>
          </div>
          <div className="text-[11px] text-slate-500 font-mono mt-0.5">Transmisi GPS Live</div>
        </div>

        <div className="bg-white border border-slate-200 rounded-lg p-4 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-tight">Diam &lt; 60 Menit</span>
            <Clock className="w-4 h-4 text-amber-600" />
          </div>
          <div className="text-2xl font-light text-slate-800 mt-1.5">{idleCount} <span className="text-base font-normal text-slate-500">Driver</span></div>
          <div className="text-[11px] text-slate-500 font-mono mt-0.5">Dalam Batas Toleransi</div>
        </div>

        <div className={`rounded-lg p-4 border shadow-xs transition-all ${
          over60mCount > 0
            ? 'bg-white border-red-300 ring-2 ring-red-500/20'
            : 'bg-white border-slate-200'
        }`}>
          <div className="flex items-center justify-between">
            <span className={`text-xs font-bold uppercase tracking-tight ${over60mCount > 0 ? 'text-red-700' : 'text-slate-500'}`}>
              Berhenti &gt; 60 Menit
            </span>
            <ShieldAlert className={`w-4 h-4 ${over60mCount > 0 ? 'text-red-600' : 'text-slate-400'}`} />
          </div>
          <div className={`text-2xl font-light mt-1.5 ${over60mCount > 0 ? 'text-red-600 font-semibold' : 'text-slate-800'}`}>
            {over60mCount} <span className="text-base font-normal text-slate-500">Driver</span>
          </div>
          <div className="mt-0.5">
            {over60mCount > 0 ? (
              <span className="text-[10px] font-bold bg-red-100 text-red-700 px-2 py-0.5 rounded border border-red-200 inline-block font-mono">
                ⚠️ IDLE ALERT TRIGGERED
              </span>
            ) : (
              <span className="text-[11px] text-slate-500 font-mono">Semua Sesuai Batas</span>
            )}
          </div>
        </div>
      </div>

      {/* Main Grid: Driver List on Left, Map & Telemetry on Right */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        {/* Left Column: Driver List & Filters (4 Cols) */}
        <div className="lg:col-span-4 space-y-3 flex flex-col h-full">
          {/* Search and Filters */}
          <div className="bg-white border border-slate-200 rounded-lg p-3 shadow-xs space-y-2.5">
            <div className="relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
              <input
                type="text"
                placeholder="Cari driver, nomor plat, armada..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-md pl-9 pr-3 py-2 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:border-indigo-600 focus:bg-white transition-all font-mono"
              />
            </div>

            {/* Status Filter Chips */}
            <div className="flex flex-wrap gap-1.5 text-[11px]">
              <button
                onClick={() => setStatusFilter('all')}
                className={`px-2.5 py-1 rounded font-medium transition-all ${
                  statusFilter === 'all'
                    ? 'bg-indigo-600 text-white font-bold shadow-xs'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                Semua ({drivers.length})
              </button>
              <button
                onClick={() => setStatusFilter('driving')}
                className={`px-2.5 py-1 rounded font-medium transition-all ${
                  statusFilter === 'driving'
                    ? 'bg-emerald-600 text-white font-bold shadow-xs'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                Jalan ({drivingCount})
              </button>
              <button
                onClick={() => setStatusFilter('over60m')}
                className={`px-2.5 py-1 rounded font-medium transition-all ${
                  statusFilter === 'over60m'
                    ? 'bg-red-600 text-white font-bold shadow-xs'
                    : 'bg-red-50 text-red-700 border border-red-200 hover:bg-red-100'
                }`}
              >
                &gt;60m Alert ({over60mCount})
              </button>
              <button
                onClick={() => setStatusFilter('stopped')}
                className={`px-2.5 py-1 rounded font-medium transition-all ${
                  statusFilter === 'stopped'
                    ? 'bg-slate-700 text-white font-bold shadow-xs'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                Parkir
              </button>
            </div>
          </div>

          {/* Scrollable Driver Cards List */}
          <div className="space-y-2.5 max-h-[580px] overflow-y-auto pr-1">
            {filteredDrivers.length === 0 ? (
              <div className="bg-white border border-slate-200 rounded-lg p-8 text-center text-slate-400 text-xs shadow-xs">
                Tidak ada driver yang cocok dengan pencarian / filter.
              </div>
            ) : (
              filteredDrivers.map((driver) => {
                const isSelected = selectedDriverForDetail === driver.id;
                const isOver60m = driver.currentIdleMinutes >= 60;
                const isMoving = driver.status === 'driving';

                return (
                  <div
                    key={driver.id}
                    onClick={() => {
                      setSelectedDriverForDetail(driver.id);
                      setActiveDriverId(driver.id);
                    }}
                    className={`p-3.5 rounded-lg border transition-all cursor-pointer relative overflow-hidden bg-white shadow-xs ${
                      isSelected
                        ? 'border-indigo-600 ring-2 ring-indigo-500/20 bg-indigo-50/40'
                        : isOver60m
                        ? 'border-red-300 hover:border-red-400 bg-red-50/20'
                        : 'border-slate-200 hover:border-slate-300 hover:bg-slate-50/70'
                    }`}
                  >
                    {/* Status accent strip */}
                    <div
                      className={`absolute top-0 left-0 bottom-0 w-1.5 ${
                        isOver60m ? 'bg-red-500' : isMoving ? 'bg-emerald-500' : 'bg-amber-500'
                      }`}
                    />

                    <div className="flex items-start justify-between gap-2 pl-2">
                      <div className="flex items-center gap-2.5">
                        <img
                          src={driver.avatar}
                          alt={driver.name}
                          className="w-10 h-10 rounded-full object-cover ring-2 ring-slate-200 shadow-xs"
                        />
                        <div>
                          <div className="flex items-center gap-1.5">
                            <span className="font-bold text-sm text-slate-900">{driver.name}</span>
                            {isOver60m && (
                              <span className="px-1.5 py-0.2 bg-red-600 text-white font-extrabold text-[9px] rounded uppercase animate-pulse">
                                ALERT &gt;60m
                              </span>
                            )}
                          </div>
                          <div className="text-xs font-mono font-bold text-indigo-700">
                            {driver.vehiclePlate}
                          </div>
                          <div className="text-[11px] text-slate-500 truncate max-w-[180px]">
                            {driver.vehicleType}
                          </div>
                        </div>
                      </div>

                      {/* Speed / Status Badge */}
                      <div className="text-right">
                        {isMoving ? (
                          <div className="text-xs font-bold text-emerald-700 font-mono bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded">
                            {driver.currentCoord.speed} km/h
                          </div>
                        ) : isOver60m ? (
                          <div className="text-xs font-extrabold text-red-700 font-mono bg-red-100 border border-red-300 px-2 py-0.5 rounded">
                            Diam {driver.currentIdleMinutes}m
                          </div>
                        ) : (
                          <div className="text-xs font-medium text-amber-800 font-mono bg-amber-50 border border-amber-200 px-2 py-0.5 rounded">
                            Diam {driver.currentIdleMinutes}m
                          </div>
                        )}
                        <div className="text-[10px] text-slate-400 font-mono mt-1">
                          Baterai: {driver.batteryLevel}%
                        </div>
                      </div>
                    </div>

                    {/* Coordinate Footnote - Strictly Raw Coordinates */}
                    <div className="mt-2.5 pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] pl-2 font-mono">
                      <div className="flex items-center gap-1 text-slate-500">
                        <MapPin className="w-3.5 h-3.5 text-indigo-600 shrink-0" />
                        <span className="text-slate-800 font-semibold">
                          {formatCoord(driver.currentCoord.lat, driver.currentCoord.lng)}
                        </span>
                      </div>
                      <span className="text-[10px] text-slate-400">
                        {formatDateTime(driver.currentCoord.timestamp).split(',')[1]}
                      </span>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Right Column: Live Map & Selected Driver Telemetry Detail (8 Cols) */}
        <div className="lg:col-span-8 space-y-3">
          {/* Leaflet Map View */}
          <MapView
            drivers={drivers}
            selectedDriverId={selectedDriverForDetail}
            onSelectDriver={(id) => {
              setSelectedDriverForDetail(id);
              setActiveDriverId(id);
            }}
            heightClass="h-[460px]"
          />

          {/* Selected Driver Detailed Telemetry Box */}
          {selectedDriver && (
            <div className="bg-white border border-slate-200 rounded-lg p-4 shadow-xs">
              <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 pb-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-indigo-50 border border-indigo-200 flex items-center justify-center font-bold text-indigo-700">
                    <Compass className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="font-bold text-slate-900 text-base">{selectedDriver.name}</h3>
                      <span className="font-mono text-xs bg-slate-100 text-slate-700 px-2 py-0.5 rounded border border-slate-200 font-bold">
                        {selectedDriver.vehiclePlate}
                      </span>
                    </div>
                    <p className="text-xs text-slate-500 font-mono">
                      {selectedDriver.vehicleType} • {selectedDriver.phone}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <a
                    href={`https://www.google.com/maps?q=${selectedDriver.currentCoord.lat},${selectedDriver.currentCoord.lng}`}
                    target="_blank"
                    rel="noreferrer"
                    className="px-3 py-1.5 bg-slate-50 hover:bg-slate-100 text-slate-700 border border-slate-200 rounded-md text-xs font-semibold flex items-center gap-1.5 transition-all shadow-xs"
                    title="Buka titik koordinat langsung di Google Maps"
                  >
                    <span>Google Maps</span>
                    <ExternalLink className="w-3 h-3 text-indigo-600" />
                  </a>
                </div>
              </div>

              {/* Coordinate & Sensor Telemetry Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-3 pt-1 text-xs">
                <div className="bg-slate-50 p-3 rounded-lg border border-slate-200">
                  <div className="text-[11px] text-slate-500 font-medium mb-0.5">Koordinat Presisi:</div>
                  <div className="font-mono font-bold text-indigo-700 text-xs">
                    {formatCoord(selectedDriver.currentCoord.lat, selectedDriver.currentCoord.lng)}
                  </div>
                </div>

                <div className="bg-slate-50 p-3 rounded-lg border border-slate-200">
                  <div className="text-[11px] text-slate-500 font-medium mb-0.5">Kecepatan Kendaraan:</div>
                  <div className="font-mono font-bold text-slate-800 text-xs">
                    {selectedDriver.currentCoord.speed} km/jam
                  </div>
                </div>

                <div className="bg-slate-50 p-3 rounded-lg border border-slate-200">
                  <div className="text-[11px] text-slate-500 font-medium mb-0.5">Status &amp; Durasi Diam:</div>
                  <div
                    className={`font-mono font-bold text-xs ${
                      selectedDriver.currentIdleMinutes >= 60
                        ? 'text-red-600'
                        : 'text-emerald-700'
                    }`}
                  >
                    {selectedDriver.currentIdleMinutes > 0
                      ? `${selectedDriver.currentIdleMinutes} Menit (${selectedDriver.currentIdleMinutes >= 60 ? 'ALERT' : 'Normal'})`
                      : 'Sedang Berjalan'}
                  </div>
                </div>

                <div className="bg-slate-50 p-3 rounded-lg border border-slate-200">
                  <div className="text-[11px] text-slate-500 font-medium mb-0.5">Akurasi &amp; Update:</div>
                  <div className="font-mono text-slate-700 text-xs">
                    ±{selectedDriver.currentCoord.accuracy}m • {formatDateTime(selectedDriver.currentCoord.timestamp).split(',')[1]}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
