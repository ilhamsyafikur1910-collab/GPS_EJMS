import React from 'react';
import { useFleet } from '../context/FleetContext';
import { formatCoord, formatDateTime, formatDuration } from '../utils/geoUtils';
import {
  BarChart3,
  ShieldAlert,
  Clock,
  TrendingUp,
  MapPin,
  AlertTriangle,
  Award,
  Truck,
} from 'lucide-react';

export const AnalyticsTab: React.FC = () => {
  const { allStops, drivers, trips, alerts } = useFleet();

  const totalStops = allStops.length;
  const over60mStops = allStops.filter((s) => s.isOverLimit);
  const over60mCount = over60mStops.length;
  const normalStopsCount = totalStops - over60mCount;

  // Percentage over limit
  const overLimitPercentage = totalStops > 0 ? Math.round((over60mCount / totalStops) * 100) : 0;

  // Longest stops ranking
  const longestStops = [...allStops].sort((a, b) => b.durationMinutes - a.durationMinutes).slice(0, 8);

  // Driver idle summary
  const driverIdleSummary = drivers.map((driver) => {
    const driverStops = allStops.filter((s) => s.driverId === driver.id);
    const driverOverLimit = driverStops.filter((s) => s.isOverLimit).length;
    const totalIdleMinutes = driverStops.reduce((acc, curr) => acc + curr.durationMinutes, 0);

    return {
      driver,
      totalStops: driverStops.length,
      overLimitStops: driverOverLimit,
      totalIdleHours: (totalIdleMinutes / 60).toFixed(1),
      avgIdleMinutes: driverStops.length > 0 ? Math.round(totalIdleMinutes / driverStops.length) : 0,
    };
  });

  return (
    <div className="space-y-4">
      {/* Header Banner */}
      <div className="bg-white border border-slate-200 rounded-lg p-4 shadow-xs flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-indigo-600" />
            <h2 className="text-base font-bold text-slate-900">
              Analisis Efisiensi Armada &amp; Peringatan Berhenti &gt; 60 Menit
            </h2>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Audit operasional PT. Esa Jaya Mulia Sentosa berdasarkan data riwayat 30 hari terakhir.
          </p>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
        <div className="bg-white border border-slate-200 rounded-lg p-4 shadow-xs">
          <span className="text-xs text-slate-500 font-bold uppercase tracking-tight block mb-1">Total Titik Perhentian (30 Hari)</span>
          <div className="text-3xl font-extrabold text-slate-900 font-mono">{totalStops} Titik</div>
          <div className="text-[11px] text-slate-500 font-mono mt-1">Seluruh Armada Logistik</div>
        </div>

        <div className="bg-white border border-red-200 rounded-lg p-4 shadow-xs">
          <span className="text-xs text-red-700 font-bold uppercase tracking-tight block mb-1">Berhenti Melebihi Batas (&gt;60m)</span>
          <div className="text-3xl font-extrabold text-red-600 font-mono">{over60mCount} Titik</div>
          <div className="text-[11px] text-red-600 font-mono mt-1 font-semibold">{overLimitPercentage}% dari Total Perhentian</div>
        </div>

        <div className="bg-white border border-emerald-200 rounded-lg p-4 shadow-xs">
          <span className="text-xs text-emerald-700 font-bold uppercase tracking-tight block mb-1">Perhentian Normal (&lt;60m)</span>
          <div className="text-3xl font-extrabold text-emerald-600 font-mono">{normalStopsCount} Titik</div>
          <div className="text-[11px] text-emerald-700 font-mono mt-1 font-semibold">{100 - overLimitPercentage}% Sesuai SOP</div>
        </div>

        <div className="bg-white border border-slate-200 rounded-lg p-4 shadow-xs">
          <span className="text-xs text-slate-500 font-bold uppercase tracking-tight block mb-1">Total Alert Terkirim</span>
          <div className="text-3xl font-extrabold text-amber-600 font-mono">{alerts.length} Notifikasi</div>
          <div className="text-[11px] text-slate-500 font-mono mt-1">FCM &amp; Sistem Notif</div>
        </div>
      </div>

      {/* Two Columns: Driver Comparison & Top Longest Stops */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Left: Driver Idle Performance Table */}
        <div className="bg-white border border-slate-200 rounded-lg p-4 shadow-xs space-y-3">
          <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
            <Truck className="w-4 h-4 text-indigo-600" />
            Statistik Perhentian per Driver (30 Hari)
          </h3>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-500 font-mono border-b border-slate-200 text-[11px]">
                <tr>
                  <th className="p-2">Driver</th>
                  <th className="p-2">Plat</th>
                  <th className="p-2 text-center">Total Stop</th>
                  <th className="p-2 text-center">Alert &gt;60m</th>
                  <th className="p-2 text-right">Total Jam Diam</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-sans">
                {driverIdleSummary.map((item) => (
                  <tr key={item.driver.id} className="hover:bg-slate-50/80">
                    <td className="p-2 font-bold text-slate-900">{item.driver.name}</td>
                    <td className="p-2 font-mono text-indigo-700 font-semibold">{item.driver.vehiclePlate}</td>
                    <td className="p-2 text-center font-mono text-slate-700">{item.totalStops}</td>
                    <td className="p-2 text-center font-mono">
                      <span
                        className={`px-1.5 py-0.5 rounded font-bold ${
                          item.overLimitStops > 0
                            ? 'bg-red-100 text-red-700 border border-red-200'
                            : 'text-slate-500'
                        }`}
                      >
                        {item.overLimitStops}
                      </span>
                    </td>
                    <td className="p-2 text-right font-mono font-bold text-slate-800">
                      {item.totalIdleHours} Jam
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Right: Top Longest Idle Stops Record */}
        <div className="bg-white border border-slate-200 rounded-lg p-4 shadow-xs space-y-3">
          <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
            <AlertTriangle className="w-4 h-4 text-red-600" />
            Top Perhentian Terlama &gt; 60 Menit
          </h3>

          <div className="space-y-2 max-h-[340px] overflow-y-auto pr-1">
            {longestStops.map((stop, i) => (
              <div
                key={stop.id}
                className="p-2.5 rounded-md bg-slate-50 border border-slate-200 flex items-center justify-between text-xs font-mono"
              >
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-sans font-bold text-slate-900">{stop.driverName}</span>
                    <span className="text-[11px] text-indigo-700 font-semibold">({stop.vehiclePlate})</span>
                  </div>
                  <div className="text-[11px] text-slate-500 flex items-center gap-1 mt-0.5">
                    <MapPin className="w-3 h-3 text-slate-400" />
                    <span>{formatCoord(stop.lat, stop.lng)}</span>
                  </div>
                </div>

                <div className="text-right">
                  <div
                    className={`font-bold ${
                      stop.isOverLimit ? 'text-red-600' : 'text-slate-700'
                    }`}
                  >
                    {stop.durationMinutes} Menit
                  </div>
                  <div className="text-[10px] text-slate-500">{formatDateTime(stop.arrivalTime).split(',')[0]}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
