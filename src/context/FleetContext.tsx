import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { Driver, TripReport, StopPoint, IdleAlert, UserRole, TripPathPoint, AdminUser, TabType } from '../types';
import { INITIAL_DRIVERS, INITIAL_ADMINS, generate30DaysTrips, INITIAL_IDLE_ALERTS } from '../data/mockFleetData';
import { playAlertBeep, getDistanceMeters } from '../utils/geoUtils';

interface FleetContextType {
  userRole: UserRole;
  setUserRole: (role: UserRole) => void;
  isOwnerAuthenticated: boolean;
  loginOwner: (username: string, pass: string) => boolean;
  logoutOwner: () => void;
  activeDriverId: string;
  setActiveDriverId: (id: string) => void;
  drivers: Driver[];
  admins: AdminUser[];
  trips: TripReport[];
  alerts: IdleAlert[];
  allStops: StopPoint[];
  selectedDriver: Driver | null;
  selectedTrip: TripReport | null;
  setSelectedTrip: (trip: TripReport | null) => void;
  isDriverTracking: boolean;
  driverCurrentTrip: TripReport | null;
  isSoundEnabled: boolean;
  setIsSoundEnabled: (val: boolean) => void;
  isSimulationRunning: boolean;
  setIsSimulationRunning: (val: boolean) => void;
  deviceViewMode: 'fullscreen' | 'mobile-android';
  setDeviceViewMode: (mode: 'fullscreen' | 'mobile-android') => void;
  activeTab: TabType;
  setActiveTab: (tab: TabType) => void;
  
  // Actions
  startDriverTrip: (driverId: string) => void;
  stopDriverTrip: (driverId: string) => void;
  updateDriverLocation: (driverId: string, lat: number, lng: number, speed?: number) => void;
  editStopPoint: (stopId: string, updatedData: Partial<StopPoint>) => void;
  deleteStopPoint: (stopId: string) => void;
  deleteTrip: (tripId: string) => void;
  
  // Driver & Admin Management (Owner only)
  addDriver: (driver: Partial<Driver>) => void;
  updateDriver: (driverId: string, driverData: Partial<Driver>) => void;
  deleteDriver: (driverId: string) => void;
  addAdmin: (admin: Partial<AdminUser>) => void;
  updateAdmin: (adminId: string, adminData: Partial<AdminUser>) => void;
  deleteAdmin: (adminId: string) => void;

  markAlertAsRead: (alertId: string) => void;
  clearAllAlerts: () => void;
  resetAllData: () => void;
  toastMessage: { title: string; desc: string; type?: 'info' | 'alert' | 'success' } | null;
  setToastMessage: (msg: { title: string; desc: string; type?: 'info' | 'alert' | 'success' } | null) => void;
}

const FleetContext = createContext<FleetContextType | undefined>(undefined);

const LOCAL_STORAGE_KEY_DRIVERS = 'esajaya_drivers_v2';
const LOCAL_STORAGE_KEY_ADMINS = 'esajaya_admins_v2';
const LOCAL_STORAGE_KEY_TRIPS = 'esajaya_trips_v2';
const LOCAL_STORAGE_KEY_ALERTS = 'esajaya_alerts_v2';
const LOCAL_STORAGE_KEY_OWNER_AUTH = 'esajaya_owner_auth_v2';

export const FleetProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [userRole, setUserRole] = useState<UserRole>('owner');
  const [activeDriverId, setActiveDriverId] = useState<string>('drv-01');
  const [isSoundEnabled, setIsSoundEnabled] = useState<boolean>(true);
  const [isSimulationRunning, setIsSimulationRunning] = useState<boolean>(true);
  const [deviceViewMode, setDeviceViewMode] = useState<'fullscreen' | 'mobile-android'>('fullscreen');
  const [activeTab, setActiveTab] = useState<TabType>('live-tracking');
  const [selectedTrip, setSelectedTrip] = useState<TripReport | null>(null);
  const [toastMessage, setToastMessage] = useState<{ title: string; desc: string; type?: 'info' | 'alert' | 'success' } | null>(null);

  // Owner authentication state
  const [isOwnerAuthenticated, setIsOwnerAuthenticated] = useState<boolean>(() => {
    try {
      return localStorage.getItem(LOCAL_STORAGE_KEY_OWNER_AUTH) === 'true';
    } catch {
      return false;
    }
  });

  const loginOwner = useCallback((username: string, pass: string): boolean => {
    const cleanUser = username.trim().toLowerCase();
    const isUserValid = cleanUser === 'owner' || cleanUser === 'owner@esajaya.com';
    const isPassValid = pass === 'owneresa1234';

    if (isUserValid && isPassValid) {
      setIsOwnerAuthenticated(true);
      setUserRole('owner');
      try {
        localStorage.setItem(LOCAL_STORAGE_KEY_OWNER_AUTH, 'true');
      } catch {}
      setToastMessage({
        title: 'Login Owner Berhasil',
        desc: 'Selamat datang Owner PT. Esa Jaya Mulia Sentosa. Hak akses penuh aktif.',
        type: 'success',
      });
      return true;
    } else {
      setToastMessage({
        title: 'Login Gagal',
        desc: 'Username atau password Owner salah. Silakan coba lagi.',
        type: 'alert',
      });
      return false;
    }
  }, []);

  const logoutOwner = useCallback(() => {
    setIsOwnerAuthenticated(false);
    try {
      localStorage.removeItem(LOCAL_STORAGE_KEY_OWNER_AUTH);
    } catch {}
    setUserRole('admin');
    setToastMessage({
      title: 'Logout Berhasil',
      desc: 'Sesi Owner telah berakhir. Beralih ke mode Admin Operasional.',
      type: 'info',
    });
  }, []);

  // Initialize drivers from localStorage or mock
  const [drivers, setDrivers] = useState<Driver[]>(() => {
    try {
      const saved = localStorage.getItem(LOCAL_STORAGE_KEY_DRIVERS);
      if (saved) return JSON.parse(saved);
    } catch {
      // fallback
    }
    return INITIAL_DRIVERS;
  });

  // Initialize admins from localStorage or mock
  const [admins, setAdmins] = useState<AdminUser[]>(() => {
    try {
      const saved = localStorage.getItem(LOCAL_STORAGE_KEY_ADMINS);
      if (saved) return JSON.parse(saved);
    } catch {
      // fallback
    }
    return INITIAL_ADMINS;
  });

  // Initialize trips from localStorage or generate 30 days
  const [trips, setTrips] = useState<TripReport[]>(() => {
    try {
      const saved = localStorage.getItem(LOCAL_STORAGE_KEY_TRIPS);
      if (saved) return JSON.parse(saved);
    } catch {
      // fallback
    }
    return generate30DaysTrips();
  });

  // Initialize alerts
  const [alerts, setAlerts] = useState<IdleAlert[]>(() => {
    try {
      const saved = localStorage.getItem(LOCAL_STORAGE_KEY_ALERTS);
      if (saved) return JSON.parse(saved);
    } catch {
      // fallback
    }
    return INITIAL_IDLE_ALERTS;
  });

  // Save to localStorage whenever state changes
  useEffect(() => {
    try {
      localStorage.setItem(LOCAL_STORAGE_KEY_DRIVERS, JSON.stringify(drivers));
    } catch {}
  }, [drivers]);

  useEffect(() => {
    try {
      localStorage.setItem(LOCAL_STORAGE_KEY_ADMINS, JSON.stringify(admins));
    } catch {}
  }, [admins]);

  useEffect(() => {
    try {
      localStorage.setItem(LOCAL_STORAGE_KEY_TRIPS, JSON.stringify(trips));
    } catch {}
  }, [trips]);

  useEffect(() => {
    try {
      localStorage.setItem(LOCAL_STORAGE_KEY_ALERTS, JSON.stringify(alerts));
    } catch {}
  }, [alerts]);

  // Derived all stops array flattened from trips
  const allStops: StopPoint[] = React.useMemo(() => {
    return trips.flatMap((t) => t.stops).sort((a, b) => new Date(b.arrivalTime).getTime() - new Date(a.arrivalTime).getTime());
  }, [trips]);

  // Find active driver
  const selectedDriver = drivers.find((d) => d.id === activeDriverId) || drivers[0] || null;

  // Check if active driver is currently tracking
  const isDriverTracking = selectedDriver ? selectedDriver.status === 'driving' : false;

  // Active driver current trip
  const driverCurrentTrip = trips.find(
    (t) => t.driverId === activeDriverId && t.status === 'active'
  ) || null;

  // Helper to trigger Idle Alert for stops >= 60 minutes
  const triggerIdleAlert = useCallback((driver: Driver, idleMinutes: number, lat: number, lng: number) => {
    const alertId = `ALT-${driver.id}-${Date.now().toString().slice(-4)}`;
    const newAlert: IdleAlert = {
      id: alertId,
      driverId: driver.id,
      driverName: driver.name,
      vehiclePlate: driver.vehiclePlate,
      lat,
      lng,
      idleSince: driver.currentIdleSince || new Date().toISOString(),
      idleDurationMinutes: idleMinutes,
      isRead: false,
      createdAt: new Date().toISOString(),
    };

    setAlerts((prev) => {
      // Avoid duplicate alert within 15 minutes for same driver
      const existing = prev.find(
        (a) => a.driverId === driver.id && Date.now() - new Date(a.createdAt).getTime() < 15 * 60 * 1000
      );
      if (existing) return prev;
      return [newAlert, ...prev];
    });

    if (isSoundEnabled) {
      playAlertBeep();
    }

    setToastMessage({
      title: `⚠️ PERINGATAN IDLE > 60 MENIT!`,
      desc: `Driver ${driver.name} (${driver.vehiclePlate}) telah berhenti selama ${idleMinutes} menit di koordinat ${lat.toFixed(6)}, ${lng.toFixed(6)}`,
      type: 'alert',
    });
  }, [isSoundEnabled]);

  // Start Driver Trip
  const startDriverTrip = useCallback((driverId: string) => {
    const driver = drivers.find((d) => d.id === driverId);
    if (!driver) return;

    const nowIso = new Date().toISOString();
    const newTripId = `TRIP-EJ-${Date.now().toString().slice(-6)}`;

    const newTrip: TripReport = {
      id: newTripId,
      driverId: driver.id,
      driverName: driver.name,
      vehiclePlate: driver.vehiclePlate,
      startTime: nowIso,
      endTime: '',
      status: 'active',
      totalDistanceKm: 0,
      totalDurationMinutes: 0,
      stopsCount: 0,
      stopsOverLimitCount: 0,
      startCoord: { lat: driver.currentCoord.lat, lng: driver.currentCoord.lng },
      endCoord: { lat: driver.currentCoord.lat, lng: driver.currentCoord.lng },
      path: [
        {
          lat: driver.currentCoord.lat,
          lng: driver.currentCoord.lng,
          timestamp: nowIso,
          speed: 0,
        },
      ],
      stops: [],
      cargoType: 'Distribusi Logistik PT. Esa Jaya',
    };

    setTrips((prev) => [newTrip, ...prev]);

    setDrivers((prev) =>
      prev.map((d) =>
        d.id === driverId
          ? {
              ...d,
              status: 'driving',
              currentTripId: newTripId,
              currentIdleMinutes: 0,
              currentIdleSince: undefined,
              currentCoord: {
                ...d.currentCoord,
                speed: 35,
                timestamp: nowIso,
              },
            }
          : d
      )
    );

    setToastMessage({
      title: 'Perjalanan Dimulai',
      desc: `Driver ${driver.name} berhasil memulai GPS Tracking perjalanan #${newTripId}`,
      type: 'success',
    });
  }, [drivers]);

  // Stop Driver Trip
  const stopDriverTrip = useCallback((driverId: string) => {
    const driver = drivers.find((d) => d.id === driverId);
    if (!driver) return;

    const nowIso = new Date().toISOString();

    setTrips((prev) =>
      prev.map((t) => {
        if (t.driverId === driverId && t.status === 'active') {
          const duration = Math.max(
            5,
            Math.round((Date.now() - new Date(t.startTime).getTime()) / 60000)
          );
          return {
            ...t,
            endTime: nowIso,
            status: 'completed',
            totalDurationMinutes: duration,
            endCoord: { lat: driver.currentCoord.lat, lng: driver.currentCoord.lng },
          };
        }
        return t;
      })
    );

    setDrivers((prev) =>
      prev.map((d) =>
        d.id === driverId
          ? {
              ...d,
              status: 'stopped',
              currentTripId: undefined,
              currentIdleMinutes: 0,
              currentIdleSince: nowIso,
              currentCoord: {
                ...d.currentCoord,
                speed: 0,
                timestamp: nowIso,
              },
            }
          : d
      )
    );

    setToastMessage({
      title: 'Perjalanan Dihentikan',
      desc: `Driver ${driver.name} telah menyelesaikan sesi perjalanan dan koordinat disimpan.`,
      type: 'info',
    });
  }, [drivers]);

  // Update Location for a driver
  const updateDriverLocation = useCallback((driverId: string, lat: number, lng: number, speed: number = 0) => {
    const nowIso = new Date().toISOString();

    setDrivers((prev) =>
      prev.map((d) => {
        if (d.id !== driverId) return d;

        const isMoving = speed > 5;
        let newIdleMins = d.currentIdleMinutes;
        let idleSince = d.currentIdleSince;

        if (!isMoving) {
          if (!idleSince) idleSince = nowIso;
          newIdleMins = Math.round((Date.now() - new Date(idleSince).getTime()) / 60000);
          
          if (newIdleMins >= 60 && d.currentIdleMinutes < 60) {
            triggerIdleAlert(d, newIdleMins, lat, lng);
          }
        } else {
          newIdleMins = 0;
          idleSince = undefined;
        }

        return {
          ...d,
          status: isMoving ? 'driving' : newIdleMins > 10 ? 'idle' : 'stopped',
          currentIdleMinutes: newIdleMins,
          currentIdleSince: idleSince,
          currentCoord: {
            ...d.currentCoord,
            lat,
            lng,
            speed,
            timestamp: nowIso,
          },
        };
      })
    );

    // Update active trip path if any
    setTrips((prev) =>
      prev.map((t) => {
        if (t.driverId === driverId && t.status === 'active') {
          const lastPoint = t.path[t.path.length - 1];
          const distIncrement = lastPoint ? getDistanceMeters(lastPoint.lat, lastPoint.lng, lat, lng) / 1000 : 0;
          
          const newPathPoint: TripPathPoint = {
            lat,
            lng,
            timestamp: nowIso,
            speed,
          };

          return {
            ...t,
            totalDistanceKm: Number((t.totalDistanceKm + distIncrement).toFixed(2)),
            path: [...t.path, newPathPoint],
          };
        }
        return t;
      })
    );
  }, [triggerIdleAlert]);

  // Owner only: Edit a Stop Point
  const editStopPoint = useCallback((stopId: string, updatedData: Partial<StopPoint>) => {
    if (userRole !== 'owner') {
      alert('Akses Ditolak: Hanya Owner yang berhak mengedit laporan dan titik koordinat.');
      return;
    }

    setTrips((prevTrips) =>
      prevTrips.map((trip) => {
        const hasStop = trip.stops.some((s) => s.id === stopId);
        if (!hasStop) return trip;

        const updatedStops = trip.stops.map((stop) => {
          if (stop.id === stopId) {
            const newDuration = updatedData.durationMinutes ?? stop.durationMinutes;
            return {
              ...stop,
              ...updatedData,
              durationMinutes: newDuration,
              isOverLimit: newDuration >= 60,
              editedByOwner: true,
              editedAt: new Date().toISOString(),
            };
          }
          return stop;
        });

        const overLimitCount = updatedStops.filter((s) => s.isOverLimit).length;
        return {
          ...trip,
          stops: updatedStops,
          stopsOverLimitCount: overLimitCount,
        };
      })
    );

    setToastMessage({
      title: 'Laporan Diperbarui',
      desc: `Titik koordinat perhentian #${stopId} berhasil diubah oleh Owner.`,
      type: 'success',
    });
  }, [userRole]);

  // Owner only: Delete a Stop Point
  const deleteStopPoint = useCallback((stopId: string) => {
    if (userRole !== 'owner') {
      alert('Akses Ditolak: Hanya Owner yang berhak menghapus data laporan.');
      return;
    }

    setTrips((prevTrips) =>
      prevTrips.map((trip) => {
        const hasStop = trip.stops.some((s) => s.id === stopId);
        if (!hasStop) return trip;

        const filteredStops = trip.stops.filter((s) => s.id !== stopId);
        return {
          ...trip,
          stopsCount: filteredStops.length,
          stopsOverLimitCount: filteredStops.filter((s) => s.isOverLimit).length,
          stops: filteredStops,
        };
      })
    );

    setToastMessage({
      title: 'Data Dihapus',
      desc: `Titik perhentian #${stopId} berhasil dihapus permanen oleh Owner.`,
      type: 'info',
    });
  }, [userRole]);

  // Owner only: Delete an Entire Trip Report
  const deleteTrip = useCallback((tripId: string) => {
    if (userRole !== 'owner') {
      alert('Akses Ditolak: Hanya Owner yang berhak menghapus seluruh riwayat perjalanan.');
      return;
    }

    setTrips((prev) => prev.filter((t) => t.id !== tripId));
    if (selectedTrip?.id === tripId) {
      setSelectedTrip(null);
    }

    setToastMessage({
      title: 'Riwayat Dihapus',
      desc: `Laporan perjalanan #${tripId} berhasil dihapus dari sistem.`,
      type: 'info',
    });
  }, [userRole, selectedTrip]);

  // Owner CRUD for Drivers
  const addDriver = useCallback((driverData: Partial<Driver>) => {
    if (userRole !== 'owner') {
      alert('Akses Ditolak: Hanya Owner yang dapat menambahkan data Driver.');
      return;
    }

    const newId = `drv-${Date.now().toString().slice(-4)}`;
    const newDriver: Driver = {
      id: newId,
      name: driverData.name || 'Driver Baru',
      vehiclePlate: driverData.vehiclePlate || 'B 1234 EJ',
      vehicleType: driverData.vehicleType || 'Truk Box Isuzu Giga',
      phone: driverData.phone || '+62 812-0000-0000',
      email: driverData.email || `${driverData.name?.toLowerCase().replace(/\s+/g, '.') || 'driver'}@esajaya.com`,
      avatar:
        driverData.avatar ||
        `https://images.unsplash.com/photo-${1535713875002 + Math.floor(Math.random() * 1000)}?w=150&auto=format&fit=crop&q=80`,
      status: driverData.status || 'idle',
      currentCoord: driverData.currentCoord || {
        lat: Number((-6.2088 + (Math.random() - 0.5) * 0.05).toFixed(6)),
        lng: Number((106.8456 + (Math.random() - 0.5) * 0.05).toFixed(6)),
        speed: 0,
        heading: 0,
        accuracy: 8,
        timestamp: new Date().toISOString(),
      },
      currentIdleMinutes: 0,
      batteryLevel: driverData.batteryLevel || 95,
      totalTripsMonth: 0,
      totalDistanceKm: 0,
    };

    setDrivers((prev) => [newDriver, ...prev]);
    setToastMessage({
      title: 'Driver Ditambahkan',
      desc: `Pengemudi ${newDriver.name} (${newDriver.vehiclePlate}) berhasil didaftarkan ke sistem armada.`,
      type: 'success',
    });
  }, [userRole]);

  const updateDriver = useCallback((driverId: string, driverData: Partial<Driver>) => {
    if (userRole !== 'owner') {
      alert('Akses Ditolak: Hanya Owner yang dapat mengedit data Driver.');
      return;
    }

    setDrivers((prev) =>
      prev.map((d) => (d.id === driverId ? { ...d, ...driverData } : d))
    );

    setToastMessage({
      title: 'Data Driver Diperbarui',
      desc: `Informasi driver #${driverId} berhasil diperbarui.`,
      type: 'success',
    });
  }, [userRole]);

  const deleteDriver = useCallback((driverId: string) => {
    if (userRole !== 'owner') {
      alert('Akses Ditolak: Hanya Owner yang dapat menghapus data Driver.');
      return;
    }

    setDrivers((prev) => prev.filter((d) => d.id !== driverId));
    if (activeDriverId === driverId) {
      setActiveDriverId('drv-01');
    }

    setToastMessage({
      title: 'Driver Dihapus',
      desc: `Driver #${driverId} telah dihapus dari sistem armada.`,
      type: 'info',
    });
  }, [userRole, activeDriverId]);

  // Owner CRUD for Admins
  const addAdmin = useCallback((adminData: Partial<AdminUser>) => {
    if (userRole !== 'owner') {
      alert('Akses Ditolak: Hanya Owner yang dapat menambahkan akun Admin.');
      return;
    }

    const newId = `adm-${Date.now().toString().slice(-4)}`;
    const newAdmin: AdminUser = {
      id: newId,
      name: adminData.name || 'Admin Baru',
      username: adminData.username || `admin_${newId}`,
      email: adminData.email || `${adminData.username || 'admin'}@esajaya.com`,
      phone: adminData.phone || '+62 812-0000-0000',
      department: adminData.department || 'Operasional Logistik',
      role: 'admin',
      createdAt: new Date().toISOString(),
      lastActive: new Date().toISOString(),
      status: adminData.status || 'active',
    };

    setAdmins((prev) => [newAdmin, ...prev]);
    setToastMessage({
      title: 'Admin Ditambahkan',
      desc: `Akun Admin untuk ${newAdmin.name} (${newAdmin.department}) berhasil dibuat.`,
      type: 'success',
    });
  }, [userRole]);

  const updateAdmin = useCallback((adminId: string, adminData: Partial<AdminUser>) => {
    if (userRole !== 'owner') {
      alert('Akses Ditolak: Hanya Owner yang dapat mengedit data Admin.');
      return;
    }

    setAdmins((prev) =>
      prev.map((a) => (a.id === adminId ? { ...a, ...adminData } : a))
    );

    setToastMessage({
      title: 'Data Admin Diperbarui',
      desc: `Informasi akun Admin #${adminId} berhasil diperbarui.`,
      type: 'success',
    });
  }, [userRole]);

  const deleteAdmin = useCallback((adminId: string) => {
    if (userRole !== 'owner') {
      alert('Akses Ditolak: Hanya Owner yang dapat menghapus akun Admin.');
      return;
    }

    setAdmins((prev) => prev.filter((a) => a.id !== adminId));
    setToastMessage({
      title: 'Admin Dihapus',
      desc: `Akun Admin #${adminId} berhasil dinonaktifkan dan dihapus.`,
      type: 'info',
    });
  }, [userRole]);

  // Mark alert as read
  const markAlertAsRead = useCallback((alertId: string) => {
    setAlerts((prev) =>
      prev.map((a) => (a.id === alertId ? { ...a, isRead: true } : a))
    );
  }, []);

  // Clear all alerts
  const clearAllAlerts = useCallback(() => {
    setAlerts([]);
  }, []);

  // Reset demo data
  const resetAllData = useCallback(() => {
    localStorage.removeItem(LOCAL_STORAGE_KEY_DRIVERS);
    localStorage.removeItem(LOCAL_STORAGE_KEY_ADMINS);
    localStorage.removeItem(LOCAL_STORAGE_KEY_TRIPS);
    localStorage.removeItem(LOCAL_STORAGE_KEY_ALERTS);
    localStorage.removeItem(LOCAL_STORAGE_KEY_OWNER_AUTH);
    setDrivers(INITIAL_DRIVERS);
    setAdmins(INITIAL_ADMINS);
    setTrips(generate30DaysTrips());
    setAlerts(INITIAL_IDLE_ALERTS);
    setIsOwnerAuthenticated(false);
    setToastMessage({
      title: 'Data Direset',
      desc: 'Database 30 hari telah dipulihkan ke data standar PT. Esa Jaya Mulia Sentosa.',
      type: 'success',
    });
  }, []);

  // Simulation loop for realistic movement and idle accumulation
  useEffect(() => {
    if (!isSimulationRunning) return;

    const interval = setInterval(() => {
      setDrivers((prevDrivers) =>
        prevDrivers.map((driver) => {
          if (driver.status === 'driving') {
            // Small coordinate jitter along route
            const latDelta = (Math.random() - 0.48) * 0.0012;
            const lngDelta = (Math.random() - 0.45) * 0.0015;
            const speed = Math.floor(30 + Math.random() * 45);
            return {
              ...driver,
              currentCoord: {
                ...driver.currentCoord,
                lat: Number((driver.currentCoord.lat + latDelta).toFixed(6)),
                lng: Number((driver.currentCoord.lng + lngDelta).toFixed(6)),
                speed,
                timestamp: new Date().toISOString(),
              },
            };
          } else if (driver.status === 'idle') {
            // Accumulate idle minutes
            const newIdle = driver.currentIdleMinutes + 1;
            if (newIdle === 60 || (newIdle > 60 && newIdle % 15 === 0)) {
              triggerIdleAlert(driver, newIdle, driver.currentCoord.lat, driver.currentCoord.lng);
            }
            return {
              ...driver,
              currentIdleMinutes: newIdle,
            };
          }
          return driver;
        })
      );
    }, 8000); // simulation tick

    return () => clearInterval(interval);
  }, [isSimulationRunning, triggerIdleAlert]);

  return (
    <FleetContext.Provider
      value={{
        userRole,
        setUserRole,
        isOwnerAuthenticated,
        loginOwner,
        logoutOwner,
        activeDriverId,
        setActiveDriverId,
        drivers,
        admins,
        trips,
        alerts,
        allStops,
        selectedDriver,
        selectedTrip,
        setSelectedTrip,
        isDriverTracking,
        driverCurrentTrip,
        isSoundEnabled,
        setIsSoundEnabled,
        isSimulationRunning,
        setIsSimulationRunning,
        deviceViewMode,
        setDeviceViewMode,
        activeTab,
        setActiveTab,
        startDriverTrip,
        stopDriverTrip,
        updateDriverLocation,
        editStopPoint,
        deleteStopPoint,
        deleteTrip,
        addDriver,
        updateDriver,
        deleteDriver,
        addAdmin,
        updateAdmin,
        deleteAdmin,
        markAlertAsRead,
        clearAllAlerts,
        resetAllData,
        toastMessage,
        setToastMessage,
      }}
    >
      {children}
    </FleetContext.Provider>
  );
};

export const useFleet = () => {
  const context = useContext(FleetContext);
  if (!context) {
    throw new Error('useFleet must be used within a FleetProvider');
  }
  return context;
};
