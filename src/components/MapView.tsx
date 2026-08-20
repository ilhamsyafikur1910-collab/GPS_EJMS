import React, { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import { Driver, StopPoint, TripReport } from '../types';
import { formatCoord, formatDateTime, formatDuration } from '../utils/geoUtils';
import { Layers, Navigation, LocateFixed, Eye, ShieldAlert, Sparkles } from 'lucide-react';

interface MapViewProps {
  drivers?: Driver[];
  selectedDriverId?: string | null;
  onSelectDriver?: (driverId: string) => void;
  stops?: StopPoint[];
  activeTrip?: TripReport | null;
  heightClass?: string;
  showStopsLayerDefault?: boolean;
}

export const MapView: React.FC<MapViewProps> = ({
  drivers = [],
  selectedDriverId,
  onSelectDriver,
  stops = [],
  activeTrip,
  heightClass = 'h-[540px]',
  showStopsLayerDefault = true,
}) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const markersLayerRef = useRef<L.LayerGroup | null>(null);
  const stopsLayerRef = useRef<L.LayerGroup | null>(null);
  const routeLayerRef = useRef<L.LayerGroup | null>(null);
  const tileLayerRef = useRef<L.TileLayer | null>(null);

  const [mapStyle, setMapStyle] = useState<'dark' | 'streets' | 'satellite' | 'light'>('streets');
  const [showStops, setShowStops] = useState<boolean>(showStopsLayerDefault);
  const [showRoutes, setShowRoutes] = useState<boolean>(true);

  // Initialize Map
  useEffect(() => {
    if (!mapContainerRef.current) return;
    if (mapInstanceRef.current) return; // already initialized

    // Center around Jakarta / Jabodetabek logistics corridor
    const initialLat = -6.21462;
    const initialLng = 106.84513;

    const map = L.map(mapContainerRef.current, {
      center: [initialLat, initialLng],
      zoom: 12,
      zoomControl: false,
      attributionControl: false,
    });

    // Custom Zoom control at bottom right
    L.control.zoom({ position: 'bottomright' }).addTo(map);

    // Initial tile layer
    const tileLayer = L.tileLayer(
      'https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png',
      {
        maxZoom: 19,
        subdomains: 'abcd',
      }
    ).addTo(map);

    tileLayerRef.current = tileLayer;

    // Create Layer Groups
    markersLayerRef.current = L.layerGroup().addTo(map);
    stopsLayerRef.current = L.layerGroup().addTo(map);
    routeLayerRef.current = L.layerGroup().addTo(map);

    mapInstanceRef.current = map;

    return () => {
      map.remove();
      mapInstanceRef.current = null;
    };
  }, []);

  // Update Tile Layer based on mapStyle
  useEffect(() => {
    if (!mapInstanceRef.current || !tileLayerRef.current) return;

    let url = 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png';
    if (mapStyle === 'streets') {
      url = 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png';
    } else if (mapStyle === 'satellite') {
      url = 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}';
    } else if (mapStyle === 'light') {
      url = 'https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png';
    }

    tileLayerRef.current.setUrl(url);
  }, [mapStyle]);

  // Update Driver Markers
  useEffect(() => {
    if (!mapInstanceRef.current || !markersLayerRef.current) return;

    markersLayerRef.current.clearLayers();

    drivers.forEach((driver) => {
      const isSelected = selectedDriverId === driver.id;
      const isMoving = driver.status === 'driving';
      const isOver60m = driver.currentIdleMinutes >= 60;

      // Marker Icon creation
      let pulseColor = 'bg-blue-500';
      let pinColor = '#3b82f6';
      let statusBadge = `${driver.currentCoord.speed} km/h`;
      let statusClass = 'bg-blue-600 text-white';

      if (isOver60m) {
        pulseColor = 'bg-red-500';
        pinColor = '#ef4444';
        statusBadge = `Berhenti ${driver.currentIdleMinutes}m (>60m)`;
        statusClass = 'bg-red-600 text-white animate-pulse font-bold';
      } else if (driver.status === 'idle') {
        pulseColor = 'bg-amber-500';
        pinColor = '#f59e0b';
        statusBadge = `Diam ${driver.currentIdleMinutes}m`;
        statusClass = 'bg-amber-600 text-white';
      } else if (driver.status === 'stopped') {
        pulseColor = 'bg-slate-500';
        pinColor = '#64748b';
        statusBadge = 'Off / Parkir';
        statusClass = 'bg-slate-700 text-slate-200';
      }

      const customHtml = `
        <div class="relative flex flex-col items-center group cursor-pointer" style="transform: translate(-50%, -100%);">
          <!-- Floating Label -->
          <div class="px-2 py-0.5 rounded shadow-lg text-[11px] whitespace-nowrap mb-1 flex items-center gap-1.5 border ${
            isSelected ? 'border-amber-400 ring-2 ring-amber-400/50' : 'border-slate-700'
          } ${statusClass}">
            <span class="font-bold">${driver.name.split(' ')[0]}</span>
            <span class="opacity-80 text-[10px]">(${driver.vehiclePlate})</span>
            ${isOver60m ? '<span class="text-[10px] bg-white text-red-700 font-extrabold px-1 rounded">ALERT</span>' : ''}
          </div>

          <!-- Pin Icon Pin -->
          <div class="relative flex items-center justify-center">
            ${
              isMoving || isOver60m
                ? `<div class="absolute -inset-2 rounded-full ${pulseColor} opacity-75 animate-ping"></div>`
                : ''
            }
            <div class="relative w-8 h-8 rounded-full border-2 border-white shadow-xl flex items-center justify-center" style="background-color: ${pinColor};">
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                <path d="M19 17h2c.6 0 1-.4 1-1v-3c0-.9-.7-1.7-1.5-1.9C18.7 10.6 16 10 16 10s-1.3-1.4-2.2-2.3c-.5-.4-1.1-.7-1.8-.7H5c-.6 0-1.1.4-1.4.9l-1.5 2.8C2.1 11 2 11.5 2 12v4c0 .6.4 1 1 1h2"/>
                <circle cx="7" cy="17" r="2"/><path d="M9 17h6"/><circle cx="17" cy="17" r="2"/>
              </svg>
            </div>
          </div>
          <!-- Pointer Arrow -->
          <div class="w-0 h-0 border-l-[6px] border-l-transparent border-r-[6px] border-r-transparent border-t-[6px] -mt-[1px]" style="border-t-color: ${pinColor};"></div>
        </div>
      `;

      const customIcon = L.divIcon({
        html: customHtml,
        className: 'custom-driver-pin',
        iconSize: [0, 0],
        iconAnchor: [0, 0],
      });

      const marker = L.marker([driver.currentCoord.lat, driver.currentCoord.lng], { icon: customIcon });

      // Popup Content - strictly exact coordinates & telemetry
      const popupContent = `
        <div class="p-2 font-sans text-slate-900 min-w-[220px]">
          <div class="flex items-center justify-between border-b pb-1.5 mb-2">
            <span class="font-bold text-sm text-indigo-950">${driver.name}</span>
            <span class="text-xs bg-slate-100 text-slate-700 px-1.5 py-0.5 rounded font-mono font-bold">${driver.vehiclePlate}</span>
          </div>
          <div class="text-xs space-y-1">
            <div class="flex justify-between">
              <span class="text-slate-500">Koordinat:</span>
              <span class="font-mono font-semibold text-indigo-700">${formatCoord(driver.currentCoord.lat, driver.currentCoord.lng)}</span>
            </div>
            <div class="flex justify-between">
              <span class="text-slate-500">Kecepatan:</span>
              <span class="font-semibold">${driver.currentCoord.speed} km/jam</span>
            </div>
            <div class="flex justify-between">
              <span class="text-slate-500">Status:</span>
              <span class="font-semibold ${isOver60m ? 'text-red-600' : 'text-emerald-600'}">
                ${isOver60m ? `⚠️ Berhenti > 60m (${driver.currentIdleMinutes} Min)` : driver.status.toUpperCase()}
              </span>
            </div>
            <div class="flex justify-between">
              <span class="text-slate-500">Akurasi GPS:</span>
              <span>±${driver.currentCoord.accuracy} meter</span>
            </div>
            <div class="flex justify-between">
              <span class="text-slate-500">Baterai HP:</span>
              <span>${driver.batteryLevel}%</span>
            </div>
            <div class="flex justify-between">
              <span class="text-slate-500">Armada:</span>
              <span class="text-slate-700 truncate max-w-[140px]">${driver.vehicleType}</span>
            </div>
          </div>
        </div>
      `;

      marker.bindPopup(popupContent);

      marker.on('click', () => {
        if (onSelectDriver) {
          onSelectDriver(driver.id);
        }
      });

      marker.addTo(markersLayerRef.current!);
    });

    // If a driver is selected, pan smoothly to their coordinate
    if (selectedDriverId) {
      const selected = drivers.find((d) => d.id === selectedDriverId);
      if (selected) {
        mapInstanceRef.current.panTo([selected.currentCoord.lat, selected.currentCoord.lng], {
          animate: true,
          duration: 0.8,
        });
      }
    }
  }, [drivers, selectedDriverId, onSelectDriver]);

  // Update Stop Point Markers
  useEffect(() => {
    if (!mapInstanceRef.current || !stopsLayerRef.current) return;

    stopsLayerRef.current.clearLayers();

    if (!showStops) return;

    stops.forEach((stop, index) => {
      const isOver60m = stop.isOverLimit;
      const markerColor = isOver60m ? '#dc2626' : '#2563eb';
      const badgeText = isOver60m ? `⚠️ ${stop.durationMinutes}m` : `${stop.durationMinutes}m`;

      const stopHtml = `
        <div class="relative flex flex-col items-center cursor-pointer" style="transform: translate(-50%, -100%);">
          <div class="px-1.5 py-0.5 rounded shadow text-[10px] font-bold whitespace-nowrap mb-0.5 border ${
            isOver60m
              ? 'bg-red-600 text-white border-red-800 animate-bounce'
              : 'bg-indigo-900 text-white border-indigo-700'
          }">
            ${badgeText}
          </div>
          <div class="w-6 h-6 rounded-full border border-white shadow-md flex items-center justify-center" style="background-color: ${markerColor};">
            <span class="text-white text-[10px] font-extrabold">${index + 1}</span>
          </div>
          <div class="w-0 h-0 border-l-[4px] border-l-transparent border-r-[4px] border-r-transparent border-t-[5px]" style="border-t-color: ${markerColor};"></div>
        </div>
      `;

      const stopIcon = L.divIcon({
        html: stopHtml,
        className: 'custom-stop-pin',
        iconSize: [0, 0],
        iconAnchor: [0, 0],
      });

      const stopMarker = L.marker([stop.lat, stop.lng], { icon: stopIcon });

      const popupHtml = `
        <div class="p-2 font-sans text-slate-900 min-w-[210px]">
          <div class="flex items-center justify-between border-b pb-1 mb-1.5">
            <span class="font-bold text-xs text-indigo-950">Titik Perhentian #${index + 1}</span>
            <span class="text-[10px] ${isOver60m ? 'bg-red-100 text-red-700 font-bold' : 'bg-slate-100 text-slate-600'} px-1 py-0.5 rounded">
              ${isOver60m ? 'LEBIH DARI 60 MENIT' : 'NORMAL'}
            </span>
          </div>
          <div class="text-xs space-y-1">
            <div class="flex justify-between">
              <span class="text-slate-500">Driver:</span>
              <span class="font-medium">${stop.driverName}</span>
            </div>
            <div class="flex justify-between">
              <span class="text-slate-500">Plat:</span>
              <span class="font-mono">${stop.vehiclePlate}</span>
            </div>
            <div class="flex justify-between">
              <span class="text-slate-500">Koordinat:</span>
              <span class="font-mono font-semibold text-indigo-700">${formatCoord(stop.lat, stop.lng)}</span>
            </div>
            <div class="flex justify-between">
              <span class="text-slate-500">Tiba:</span>
              <span>${formatDateTime(stop.arrivalTime)}</span>
            </div>
            <div class="flex justify-between">
              <span class="text-slate-500">Keluar:</span>
              <span>${formatDateTime(stop.departureTime)}</span>
            </div>
            <div class="flex justify-between">
              <span class="text-slate-500">Durasi:</span>
              <span class="font-bold ${isOver60m ? 'text-red-600' : 'text-slate-800'}">${formatDuration(stop.durationMinutes)}</span>
            </div>
            ${
              stop.notes
                ? `<div class="mt-1 p-1 bg-slate-50 rounded text-[11px] text-slate-600 border border-slate-200">
                    <span class="font-semibold">Catatan:</span> ${stop.notes}
                   </div>`
                : ''
            }
          </div>
        </div>
      `;

      stopMarker.bindPopup(popupHtml);
      stopMarker.addTo(stopsLayerRef.current!);
    });
  }, [stops, showStops]);

  // Update Route / Path Polyline
  useEffect(() => {
    if (!mapInstanceRef.current || !routeLayerRef.current) return;

    routeLayerRef.current.clearLayers();

    if (!showRoutes || !activeTrip || !activeTrip.path || activeTrip.path.length < 2) return;

    const latLngs: [number, number][] = activeTrip.path.map((p) => [p.lat, p.lng]);

    const polyline = L.polyline(latLngs, {
      color: '#6366f1',
      weight: 5,
      opacity: 0.85,
      dashArray: activeTrip.status === 'active' ? '8, 8' : undefined,
    });

    polyline.addTo(routeLayerRef.current);

    // Fit bounds to entire route
    const bounds = L.latLngBounds(latLngs);
    mapInstanceRef.current.fitBounds(bounds, { padding: [40, 40] });
  }, [activeTrip, showRoutes]);

  // Center on fleet action
  const handleCenterFleet = () => {
    if (!mapInstanceRef.current || drivers.length === 0) return;
    const group = L.featureGroup(
      drivers.map((d) => L.marker([d.currentCoord.lat, d.currentCoord.lng]))
    );
    mapInstanceRef.current.fitBounds(group.getBounds().pad(0.2));
  };

  return (
    <div className={`relative w-full ${heightClass} rounded-lg overflow-hidden border border-slate-200 shadow-xs bg-slate-100`}>
      {/* Map Container */}
      <div ref={mapContainerRef} className="w-full h-full z-0" />

      {/* Floating Header Info on Map */}
      <div className="absolute top-3 left-3 z-[500] flex flex-wrap items-center gap-2 pointer-events-auto">
        <div className="bg-white/95 backdrop-blur-md border border-slate-200 px-3 py-1.5 rounded-md shadow-sm flex items-center gap-2.5">
          <div className="flex h-2.5 w-2.5 relative">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-500 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-600"></span>
          </div>
          <div>
            <div className="text-[11px] font-bold text-slate-800 uppercase tracking-wider font-mono">
              MAP_VIEW_PORT: GPS_LIVE
            </div>
            <div className="text-[10px] text-slate-500 font-mono">
              PT. Esa Jaya Mulia Sentosa
            </div>
          </div>
        </div>

        {/* Over 60m alert pill if any */}
        {drivers.filter((d) => d.currentIdleMinutes >= 60).length > 0 && (
          <div className="bg-red-50/95 border border-red-300 text-red-700 px-3 py-1.5 rounded-md shadow-sm flex items-center gap-1.5 text-xs font-bold animate-pulse">
            <ShieldAlert className="w-4 h-4 text-red-600 shrink-0" />
            <span>{drivers.filter((d) => d.currentIdleMinutes >= 60).length} Driver Berhenti &gt; 60 Menit</span>
          </div>
        )}
      </div>

      {/* Floating Controls Overlay */}
      <div className="absolute top-3 right-3 z-[500] flex items-center gap-1.5 bg-white/95 backdrop-blur-md border border-slate-200 p-1.5 rounded-md shadow-sm">
        {/* Style Selector */}
        <div className="flex items-center gap-1 bg-slate-100 p-0.5 rounded text-xs">
          <button
            onClick={() => setMapStyle('streets')}
            className={`px-2 py-1 rounded transition-all ${
              mapStyle === 'streets' ? 'bg-indigo-600 text-white font-bold shadow-xs' : 'text-slate-600 hover:text-slate-900'
            }`}
            title="Tampilan Peta Jalan"
          >
            Jalan
          </button>
          <button
            onClick={() => setMapStyle('light')}
            className={`px-2 py-1 rounded transition-all ${
              mapStyle === 'light' ? 'bg-indigo-600 text-white font-bold shadow-xs' : 'text-slate-600 hover:text-slate-900'
            }`}
            title="Tampilan Terang"
          >
            Light
          </button>
          <button
            onClick={() => setMapStyle('satellite')}
            className={`px-2 py-1 rounded transition-all ${
              mapStyle === 'satellite' ? 'bg-indigo-600 text-white font-bold shadow-xs' : 'text-slate-600 hover:text-slate-900'
            }`}
            title="Tampilan Citra Satelit"
          >
            Satelit
          </button>
          <button
            onClick={() => setMapStyle('dark')}
            className={`px-2 py-1 rounded transition-all ${
              mapStyle === 'dark' ? 'bg-indigo-600 text-white font-bold shadow-xs' : 'text-slate-600 hover:text-slate-900'
            }`}
            title="Tampilan Gelap Komando"
          >
            Dark
          </button>
        </div>

        {/* Toggle Stops */}
        <button
          onClick={() => setShowStops(!showStops)}
          className={`p-1.5 rounded text-xs flex items-center gap-1 border transition-all ${
            showStops
              ? 'bg-indigo-50 border-indigo-300 text-indigo-700 font-semibold'
              : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
          }`}
          title="Tampilkan/Sembunyikan Titik Perhentian"
        >
          <Eye className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">Stops ({stops.length})</span>
        </button>

        {/* Reset / Center Fleet */}
        <button
          onClick={handleCenterFleet}
          className="p-1.5 rounded bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 transition-all flex items-center gap-1 text-xs font-medium shadow-xs"
          title="Pusatkan Semua Armada"
        >
          <LocateFixed className="w-3.5 h-3.5 text-indigo-600" />
          <span className="hidden sm:inline">Fit Armada</span>
        </button>
      </div>

      {/* Map Legend Overlay */}
      <div className="absolute bottom-3 left-3 z-[500] bg-white/95 backdrop-blur-md border border-slate-200 rounded-md p-2 text-[11px] text-slate-700 shadow-sm hidden md:flex items-center gap-4">
        <div className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 ring-2 ring-emerald-500/20"></span>
          <span className="font-medium">Bergerak (Driving)</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-amber-500 ring-2 ring-amber-500/20"></span>
          <span className="font-medium">Diam &lt; 60m (Idle)</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-red-600 animate-pulse ring-2 ring-red-500/20"></span>
          <span className="text-red-700 font-bold">Berhenti &gt; 60m (Alert)</span>
        </div>
        <div className="flex items-center gap-1.5 font-mono text-[10px] text-slate-400 pl-2 border-l border-slate-200">
          <span>Format Presisi: (Lat, Lng)</span>
        </div>
      </div>
    </div>
  );
};
