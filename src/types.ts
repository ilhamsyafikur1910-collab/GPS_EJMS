export type UserRole = 'owner' | 'admin' | 'driver';

export interface Driver {
  id: string;
  name: string;
  vehiclePlate: string;
  vehicleType: string;
  phone: string;
  email: string;
  avatar: string;
  status: 'driving' | 'idle' | 'stopped' | 'offline';
  currentCoord: {
    lat: number;
    lng: number;
    speed: number; // km/h
    heading: number; // degrees
    accuracy: number; // meters
    altitude?: number;
    timestamp: string;
  };
  currentTripId?: string;
  currentIdleMinutes: number; // minutes current stop has lasted
  currentIdleSince?: string;
  batteryLevel: number;
  totalTripsMonth: number;
  totalDistanceKm: number;
}

export interface StopPoint {
  id: string;
  tripId: string;
  driverId: string;
  driverName: string;
  vehiclePlate: string;
  lat: number;
  lng: number;
  arrivalTime: string; // ISO string
  departureTime: string; // ISO string
  durationMinutes: number;
  isOverLimit: boolean; // durationMinutes >= 60
  notes?: string;
  editedByOwner?: boolean;
  editedAt?: string;
}

export interface TripPathPoint {
  lat: number;
  lng: number;
  timestamp: string;
  speed: number;
  isStop?: boolean;
  stopId?: string;
}

export interface TripReport {
  id: string;
  driverId: string;
  driverName: string;
  vehiclePlate: string;
  startTime: string;
  endTime: string;
  status: 'active' | 'completed' | 'cancelled';
  totalDistanceKm: number;
  totalDurationMinutes: number;
  stopsCount: number;
  stopsOverLimitCount: number; // stops >= 60 min
  startCoord: { lat: number; lng: number };
  endCoord: { lat: number; lng: number };
  path: TripPathPoint[];
  stops: StopPoint[];
  cargoType?: string;
}

export interface IdleAlert {
  id: string;
  driverId: string;
  driverName: string;
  vehiclePlate: string;
  lat: number;
  lng: number;
  idleSince: string;
  idleDurationMinutes: number;
  isRead: boolean;
  createdAt: string;
}

export interface AdminUser {
  id: string;
  name: string;
  email: string;
  username: string;
  phone: string;
  department: string;
  role: 'admin';
  createdAt: string;
  lastActive?: string;
  status: 'active' | 'inactive';
}

export interface UserSession {
  role: UserRole;
  name: string;
  email: string;
  username?: string;
  driverId?: string;
  isAuthenticated: boolean;
}

export type TabType = 'live-tracking' | 'history-30d' | 'driver-portal' | 'analytics' | 'user-management';
