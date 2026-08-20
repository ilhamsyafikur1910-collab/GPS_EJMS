import { Driver, TripReport, StopPoint, IdleAlert, AdminUser } from '../types';

export const INITIAL_DRIVERS: Driver[] = [
  {
    id: 'drv-01',
    name: 'Budi Santoso',
    vehiclePlate: 'B 9123 EJ',
    vehicleType: 'Truk Box Isuzu Giga (10 Ton)',
    phone: '+62 812-8877-6651',
    email: 'budi.santoso@esajaya.com',
    avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80',
    status: 'idle',
    currentCoord: {
      lat: -6.21462,
      lng: 106.84513,
      speed: 0,
      heading: 45,
      accuracy: 8,
      timestamp: new Date().toISOString(),
    },
    currentIdleMinutes: 78, // Over 60 minutes! Triggers alert
    currentIdleSince: new Date(Date.now() - 78 * 60 * 1000).toISOString(),
    batteryLevel: 84,
    totalTripsMonth: 28,
    totalDistanceKm: 3420,
  },
  {
    id: 'drv-02',
    name: 'Ahmad Fauzi',
    vehiclePlate: 'B 8456 EJ',
    vehicleType: 'Mitsubishi Fuso Canter (Colt Diesel)',
    phone: '+62 813-2211-9988',
    email: 'ahmad.fauzi@esajaya.com',
    avatar: 'https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?w=150&auto=format&fit=crop&q=80',
    status: 'driving',
    currentCoord: {
      lat: -6.17539,
      lng: 106.82715,
      speed: 48,
      heading: 120,
      accuracy: 5,
      timestamp: new Date().toISOString(),
    },
    currentIdleMinutes: 0,
    batteryLevel: 92,
    totalTripsMonth: 34,
    totalDistanceKm: 4180,
  },
  {
    id: 'drv-03',
    name: 'Hendra Wijaya',
    vehiclePlate: 'B 7789 EJ',
    vehicleType: 'Hino Dutro 130 HD (Dump/Logistics)',
    phone: '+62 815-6677-4433',
    email: 'hendra.wijaya@esajaya.com',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
    status: 'idle',
    currentCoord: {
      lat: -6.28945,
      lng: 106.83291,
      speed: 0,
      heading: 270,
      accuracy: 6,
      timestamp: new Date().toISOString(),
    },
    currentIdleMinutes: 65, // Over 60 minutes!
    currentIdleSince: new Date(Date.now() - 65 * 60 * 1000).toISOString(),
    batteryLevel: 68,
    totalTripsMonth: 22,
    totalDistanceKm: 2890,
  },
  {
    id: 'drv-04',
    name: 'Joko Prasetyo',
    vehiclePlate: 'B 9901 EJ',
    vehicleType: 'Tronton Wingbox Hino 500 (20 Ton)',
    phone: '+62 818-0988-1234',
    email: 'joko.prasetyo@esajaya.com',
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80',
    status: 'driving',
    currentCoord: {
      lat: -6.32451,
      lng: 107.01234,
      speed: 55,
      heading: 90,
      accuracy: 7,
      timestamp: new Date().toISOString(),
    },
    currentIdleMinutes: 0,
    batteryLevel: 76,
    totalTripsMonth: 30,
    totalDistanceKm: 5210,
  },
  {
    id: 'drv-05',
    name: 'Rian Saputra',
    vehiclePlate: 'B 3342 EJ',
    vehicleType: 'Daihatsu Gran Max Blind Van Express',
    phone: '+62 819-4455-6677',
    email: 'rian.saputra@esajaya.com',
    avatar: 'https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?w=150&auto=format&fit=crop&q=80',
    status: 'stopped',
    currentCoord: {
      lat: -6.13421,
      lng: 106.91245,
      speed: 0,
      heading: 0,
      accuracy: 10,
      timestamp: new Date().toISOString(),
    },
    currentIdleMinutes: 25,
    currentIdleSince: new Date(Date.now() - 25 * 60 * 1000).toISOString(),
    batteryLevel: 45,
    totalTripsMonth: 41,
    totalDistanceKm: 3120,
  },
];

// Helper to generate 30-day realistic trips with coordinates and stop points
export function generate30DaysTrips(): TripReport[] {
  const reports: TripReport[] = [];
  const now = new Date();

  // Coordinate base hubs
  const coordClusters = [
    { start: { lat: -6.14251, lng: 106.89214 }, mid: { lat: -6.21462, lng: 106.84513 }, end: { lat: -6.32451, lng: 107.01234 } },
    { start: { lat: -6.22341, lng: 106.78129 }, mid: { lat: -6.28945, lng: 106.83291 }, end: { lat: -6.17539, lng: 106.82715 } },
    { start: { lat: -6.10542, lng: 106.92134 }, mid: { lat: -6.20145, lng: 106.87412 }, end: { lat: -6.38912, lng: 106.74512 } },
    { start: { lat: -6.25142, lng: 106.99214 }, mid: { lat: -6.31451, lng: 107.12451 }, end: { lat: -6.28451, lng: 106.91234 } },
  ];

  let tripCounter = 101;

  // Loop back 30 days
  for (let dayOffset = 0; dayOffset < 30; dayOffset++) {
    const tripDate = new Date(now.getTime() - dayOffset * 24 * 60 * 60 * 1000);
    
    // Generate 2 - 4 trips per day across drivers
    const driversForDay = INITIAL_DRIVERS.slice(0, (dayOffset % 4) + 2);

    driversForDay.forEach((driver, idx) => {
      const cluster = coordClusters[(dayOffset + idx) % coordClusters.length];
      
      const startHour = 7 + (idx * 2) % 4;
      const startTime = new Date(tripDate);
      startTime.setHours(startHour, 15, 0, 0);

      const durationHours = 4 + (idx % 4);
      const endTime = new Date(startTime.getTime() + durationHours * 3600 * 1000);

      const tripId = `TRIP-EJ-${tripDate.getFullYear()}${(tripDate.getMonth() + 1).toString().padStart(2, '0')}-${tripCounter++}`;

      // Generate 2 - 4 stops
      const stops: StopPoint[] = [];
      const numStops = 2 + (dayOffset % 3);

      for (let s = 0; s < numStops; s++) {
        const stopArrival = new Date(startTime.getTime() + (s + 1) * 70 * 60 * 1000);
        
        // Some stops have >60 minutes (over limit)
        const isLongStop = (dayOffset + s + idx) % 3 === 0;
        const durationMins = isLongStop ? 65 + ((dayOffset * 7 + s * 13) % 55) : 15 + ((dayOffset * 3 + s * 7) % 35);
        const stopDeparture = new Date(stopArrival.getTime() + durationMins * 60 * 1000);

        const stopLat = Number((cluster.mid.lat + (s * 0.015) - (idx * 0.008)).toFixed(6));
        const stopLng = Number((cluster.mid.lng + (s * 0.012) + (idx * 0.006)).toFixed(6));

        stops.push({
          id: `STOP-${tripId}-${s + 1}`,
          tripId: tripId,
          driverId: driver.id,
          driverName: driver.name,
          vehiclePlate: driver.vehiclePlate,
          lat: stopLat,
          lng: stopLng,
          arrivalTime: stopArrival.toISOString(),
          departureTime: stopDeparture.toISOString(),
          durationMinutes: durationMins,
          isOverLimit: durationMins >= 60,
          notes: isLongStop 
            ? 'Bongkar muat kontainer & antrean gudang logistik' 
            : 'Perhentian transit pengiriman reguler',
        });
      }

      // Generate breadcrumb path
      const pathPoints = [
        { lat: cluster.start.lat, lng: cluster.start.lng, timestamp: startTime.toISOString(), speed: 0 },
        { lat: (cluster.start.lat + cluster.mid.lat) / 2 + 0.004, lng: (cluster.start.lng + cluster.mid.lng) / 2 - 0.003, timestamp: new Date(startTime.getTime() + 30 * 60000).toISOString(), speed: 45 },
        ...stops.map((st, i) => ({
          lat: st.lat,
          lng: st.lng,
          timestamp: st.arrivalTime,
          speed: 0,
          isStop: true,
          stopId: st.id,
        })),
        { lat: (cluster.mid.lat + cluster.end.lat) / 2 - 0.002, lng: (cluster.mid.lng + cluster.end.lng) / 2 + 0.005, timestamp: new Date(endTime.getTime() - 40 * 60000).toISOString(), speed: 52 },
        { lat: cluster.end.lat, lng: cluster.end.lng, timestamp: endTime.toISOString(), speed: 0 },
      ];

      const distanceKm = 45 + ((dayOffset * 17 + idx * 23) % 95);
      const stopsOverLimit = stops.filter((st) => st.isOverLimit).length;

      reports.push({
        id: tripId,
        driverId: driver.id,
        driverName: driver.name,
        vehiclePlate: driver.vehiclePlate,
        startTime: startTime.toISOString(),
        endTime: endTime.toISOString(),
        status: dayOffset === 0 && idx === 0 ? 'active' : 'completed',
        totalDistanceKm: distanceKm,
        totalDurationMinutes: durationHours * 60,
        stopsCount: stops.length,
        stopsOverLimitCount: stopsOverLimit,
        startCoord: cluster.start,
        endCoord: cluster.end,
        path: pathPoints,
        stops: stops,
        cargoType: ['Material Konstruksi', 'Logistik Pabrik', 'Suku Cadang Mesin', 'Consumer Goods', 'Bahan Kimia Industri'][idx % 5],
      });
    });
  }

  return reports;
}

export const INITIAL_IDLE_ALERTS: IdleAlert[] = [
  {
    id: 'alt-001',
    driverId: 'drv-01',
    driverName: 'Budi Santoso',
    vehiclePlate: 'B 9123 EJ',
    lat: -6.21462,
    lng: 106.84513,
    idleSince: new Date(Date.now() - 78 * 60 * 1000).toISOString(),
    idleDurationMinutes: 78,
    isRead: false,
    createdAt: new Date(Date.now() - 18 * 60 * 1000).toISOString(),
  },
  {
    id: 'alt-002',
    driverId: 'drv-03',
    driverName: 'Hendra Wijaya',
    vehiclePlate: 'B 7789 EJ',
    lat: -6.28945,
    lng: 106.83291,
    idleSince: new Date(Date.now() - 65 * 60 * 1000).toISOString(),
    idleDurationMinutes: 65,
    isRead: false,
    createdAt: new Date(Date.now() - 5 * 60 * 1000).toISOString(),
  },
];

export const INITIAL_ADMINS: AdminUser[] = [
  {
    id: 'adm-01',
    name: 'Siti Rahmawati',
    username: 'siti.admin',
    email: 'siti.rahmawati@esajaya.com',
    phone: '+62 811-2345-6789',
    department: 'Operasional Logistik & Fleet Control',
    role: 'admin',
    createdAt: '2024-01-15T08:00:00.000Z',
    lastActive: '2024-08-20T08:30:00.000Z',
    status: 'active',
  },
  {
    id: 'adm-02',
    name: 'Dedi Kurniawan',
    username: 'dedi.admin',
    email: 'dedi.kurniawan@esajaya.com',
    phone: '+62 812-9876-5432',
    department: 'Dispatch & Monitoring Wilayah Jabodetabek',
    role: 'admin',
    createdAt: '2024-02-01T09:00:00.000Z',
    lastActive: '2024-08-20T07:45:00.000Z',
    status: 'active',
  },
];
