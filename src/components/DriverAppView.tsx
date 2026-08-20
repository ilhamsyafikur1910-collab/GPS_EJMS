import React, { useState, useEffect } from 'react';
import { useFleet } from '../context/FleetContext';
import { formatCoord, formatDuration } from '../utils/geoUtils';
import {
  Play,
  Square,
  Navigation,
  Compass,
  Battery,
  MapPin,
  Clock,
  AlertTriangle,
  Radio,
  CheckCircle2,
  Wifi,
  Sparkles,
} from 'lucide-react';

export const DriverAppView: React.FC = () => {
  const {
    drivers,
    activeDriverId,
    setActiveDriverId,
    startDriverTrip,
    stopDriverTrip,
    selectedDriver,
    updateDriverLocation,
  } = useFleet();

  const [useDeviceGps, setUseDeviceGps] = useState<boolean>(false);
  const [gpsError, setGpsError] = useState<string | null>(null);
  const [tripElapsedSeconds, setTripElapsedSeconds] = useState<number>(0);

  const currentDriver = selectedDriver || drivers[0];
  const isDriving = currentDriver.status === 'driving';
  const isOver60m = currentDriver.currentIdleMinutes >= 60;

  // Real device GPS watchPosition hook
  useEffect(() => {
    if (!useDeviceGps || !navigator.geolocation) return;

    const watchId = navigator.geolocation.watchPosition(
      (position) => {
        setGpsError(null);
        const speedKmh = position.coords.speed ? Math.round(position.coords.speed * 3.6) : isDriving ? 40 : 0;
        updateDriverLocation(
          currentDriver.id,
          Number(position.coords.latitude.toFixed(6)),
          Number(position.coords.longitude.toFixed(6)),
          speedKmh
        );
      },
      (err) => {
        setGpsError(`GPS Error: ${err.message} (Gunakan simulasi koordinat)`);
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 1000,
      }
    );

    return () => {
      navigator.geolocation.clearWatch(watchId);
    };
  }, [useDeviceGps, isDriving, currentDriver.id, updateDriverLocation]);

  // Trip duration timer counter
  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (isDriving) {
      timer = setInterval(() => {
        setTripElapsedSeconds((prev) => prev + 1);
      }, 1000);
    } else {
      setTripElapsedSeconds(0);
    }
    return () => clearInterval(timer);
  }, [isDriving]);

  const formatTimer = (seconds: number) => {
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${hrs.toString().padStart(2, '0')}:${mins
      .toString()
      .padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="max-w-md mx-auto space-y-4">
      {/* Driver Selector Header */}
      <div className="bg-white border border-slate-200 rounded-lg p-4 shadow-xs">
        <div className="flex items-center justify-between mb-3">
          <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
            Pengemudi Aktif
          </span>
          <span className="text-[10px] bg-amber-50 text-amber-700 font-mono font-bold px-2 py-0.5 rounded border border-amber-200">
            MODE DRIVER
          </span>
        </div>

        <div className="flex items-center gap-3">
          <img
            src={currentDriver.avatar}
            alt={currentDriver.name}
            className="w-12 h-12 rounded-full object-cover ring-2 ring-indigo-500"
          />
          <div className="flex-1">
            <select
              value={activeDriverId}
              onChange={(e) => setActiveDriverId(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-md px-2.5 py-1.5 text-xs text-slate-900 font-bold focus:outline-none focus:border-indigo-600 focus:bg-white"
            >
              {drivers.map((d) => (
                <option key={d.id} value={d.id}>
                  {d.name} — {d.vehiclePlate} ({d.vehicleType.split(' ')[0]})
                </option>
              ))}
            </select>
            <div className="text-[11px] text-slate-500 font-mono mt-1">
              PT. Esa Jaya Mulia Sentosa • {currentDriver.vehiclePlate}
            </div>
          </div>
        </div>
      </div>

      {/* Main Tactical Driver Console */}
      <div className="bg-white border border-slate-200 rounded-lg p-5 shadow-xs space-y-5">
        {/* Status Light & GPS Pulse */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div
              className={`w-3.5 h-3.5 rounded-full ${
                isDriving ? 'bg-emerald-500 animate-ping' : 'bg-slate-400'
              }`}
            />
            <span className="text-xs font-bold text-slate-800">
              {isDriving ? 'GPS TRACKER AKTIF' : 'STANDBY / PARKIR'}
            </span>
          </div>

          <div className="flex items-center gap-2 text-xs font-mono text-slate-600">
            <Battery className="w-4 h-4 text-emerald-600" />
            <span>{currentDriver.batteryLevel}%</span>
          </div>
        </div>

        {/* Big Speedometer & Coordinate Display */}
        <div className="text-center py-4 bg-slate-50 rounded-lg border border-slate-200 relative overflow-hidden">
          <div className="text-[11px] font-mono text-slate-500 uppercase tracking-widest mb-1">
            Kecepatan Real-time
          </div>
          <div className="text-6xl font-extrabold font-mono text-slate-900 tracking-tight">
            {currentDriver.currentCoord.speed}
            <span className="text-base text-slate-500 font-normal ml-1">km/h</span>
          </div>

          {/* Raw Coordinates - User explicitly requested pure coordinates */}
          <div className="mt-4 pt-3 border-t border-slate-200 px-4">
            <div className="text-[10px] font-mono text-indigo-700 uppercase tracking-wider mb-0.5 font-bold">
              Titik Koordinat GPS Terkini
            </div>
            <div className="font-mono text-sm font-bold text-indigo-900 bg-white py-1.5 px-3 rounded border border-indigo-200 inline-block shadow-xs">
              {formatCoord(currentDriver.currentCoord.lat, currentDriver.currentCoord.lng)}
            </div>
          </div>
        </div>

        {/* Idle Warning Box if Stopped */}
        {!isDriving && (
          <div
            className={`p-3.5 rounded-lg border text-xs font-mono transition-all ${
              isOver60m
                ? 'bg-red-50 border-red-300 text-red-800 animate-pulse'
                : 'bg-amber-50 border-amber-200 text-amber-900'
            }`}
          >
            <div className="flex items-center gap-2 font-bold mb-1">
              <AlertTriangle className="w-4 h-4 text-red-600 shrink-0" />
              <span>
                {isOver60m
                  ? '⚠️ PERINGATAN: BERHENTI > 60 MENIT!'
                  : 'STATUS: KENDARAAN SEDANG BERHENTI'}
              </span>
            </div>
            <p className="text-[11px] text-slate-700 leading-snug">
              Durasi diam saat ini: <strong>{currentDriver.currentIdleMinutes} Menit</strong>.
              {isOver60m &&
                ' Notifikasi peringatan telah dikirimkan ke sistem Owner dan Admin PT. Esa Jaya Mulia Sentosa.'}
            </p>
          </div>
        )}

        {/* Live Trip Telemetry (if active) */}
        {isDriving && (
          <div className="grid grid-cols-2 gap-3 text-center text-xs font-mono">
            <div className="bg-slate-50 p-3 rounded-lg border border-slate-200">
              <span className="text-[10px] text-slate-500 block mb-0.5">Waktu Berjalan:</span>
              <span className="text-base font-bold text-indigo-700">
                {formatTimer(tripElapsedSeconds)}
              </span>
            </div>
            <div className="bg-slate-50 p-3 rounded-lg border border-slate-200">
              <span className="text-[10px] text-slate-500 block mb-0.5">Akurasi GPS:</span>
              <span className="text-base font-bold text-emerald-700">
                ±{currentDriver.currentCoord.accuracy} m
              </span>
            </div>
          </div>
        )}

        {/* Big Tactile Action Button: Mulai & Berhentikan */}
        <div className="pt-2">
          {!isDriving ? (
            <button
              onClick={() => startDriverTrip(currentDriver.id)}
              className="w-full py-4 bg-emerald-600 hover:bg-emerald-700 active:scale-95 text-white rounded-lg font-bold text-base flex items-center justify-center gap-2.5 shadow-xs transition-all cursor-pointer"
            >
              <Play className="w-6 h-6 fill-white" />
              <span>MULAI PERJALANAN (START)</span>
            </button>
          ) : (
            <button
              onClick={() => stopDriverTrip(currentDriver.id)}
              className="w-full py-4 bg-rose-600 hover:bg-rose-700 active:scale-95 text-white rounded-lg font-bold text-base flex items-center justify-center gap-2.5 shadow-xs transition-all cursor-pointer animate-pulse"
            >
              <Square className="w-6 h-6 fill-white" />
              <span>BERHENTIKAN PERJALANAN (STOP)</span>
            </button>
          )}
        </div>

        {/* Device GPS Toggle & Sensor Status */}
        <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={useDeviceGps}
              onChange={(e) => setUseDeviceGps(e.target.checked)}
              className="rounded bg-slate-100 border-slate-300 text-indigo-600 focus:ring-indigo-500"
            />
            <span className="text-[11px]">Gunakan GPS Asli Perangkat (HTML5 Geolocation)</span>
          </label>
        </div>

        {gpsError && (
          <div className="p-2 bg-red-50 border border-red-200 text-red-700 text-[11px] rounded">
            {gpsError}
          </div>
        )}
      </div>
    </div>
  );
};
