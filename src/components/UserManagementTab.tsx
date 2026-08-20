import React, { useState } from 'react';
import { useFleet } from '../context/FleetContext';
import { Driver, AdminUser } from '../types';
import { formatCoord, formatDateTime } from '../utils/geoUtils';
import {
  Users,
  Shield,
  Truck,
  UserPlus,
  Edit2,
  Trash2,
  Lock,
  Unlock,
  KeyRound,
  CheckCircle,
  AlertTriangle,
  Search,
  Phone,
  Mail,
  Building,
  Radio,
  MapPin,
  X,
  Save,
  LogIn,
  LogOut,
  ChevronRight,
  UserCheck,
} from 'lucide-react';

export const UserManagementTab: React.FC = () => {
  const {
    userRole,
    setUserRole,
    isOwnerAuthenticated,
    loginOwner,
    logoutOwner,
    drivers,
    admins,
    addDriver,
    updateDriver,
    deleteDriver,
    addAdmin,
    updateAdmin,
    deleteAdmin,
  } = useFleet();

  // Active sub-tab
  const [subTab, setSubTab] = useState<'drivers' | 'admins'>('drivers');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Login form state (for Owner authentication)
  const [loginUsername, setLoginUsername] = useState<string>('owner');
  const [loginPassword, setLoginPassword] = useState<string>('owneresa1234');
  const [loginError, setLoginError] = useState<string>('');

  // Driver modal state
  const [isDriverModalOpen, setIsDriverModalOpen] = useState<boolean>(false);
  const [editingDriver, setEditingDriver] = useState<Driver | null>(null);
  const [driverFormData, setDriverFormData] = useState({
    name: '',
    vehiclePlate: '',
    vehicleType: '',
    phone: '',
    email: '',
    status: 'idle' as Driver['status'],
    lat: -6.21462,
    lng: 106.84513,
  });

  // Admin modal state
  const [isAdminModalOpen, setIsAdminModalOpen] = useState<boolean>(false);
  const [editingAdmin, setEditingAdmin] = useState<AdminUser | null>(null);
  const [adminFormData, setAdminFormData] = useState({
    name: '',
    username: '',
    email: '',
    phone: '',
    department: 'Operasional Logistik & Dispatcher',
    status: 'active' as 'active' | 'inactive',
  });

  // Handle Owner Login
  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError('');
    const success = loginOwner(loginUsername, loginPassword);
    if (!success) {
      setLoginError('Kredensial tidak valid. Gunakan username: owner & password: owneresa1234');
    }
  };

  // Open Driver Form (Add / Edit)
  const handleOpenAddDriver = () => {
    setEditingDriver(null);
    setDriverFormData({
      name: '',
      vehiclePlate: 'B ' + Math.floor(1000 + Math.random() * 9000) + ' EJ',
      vehicleType: 'Truk Box Isuzu Giga (10 Ton)',
      phone: '+62 812-8800-' + Math.floor(1000 + Math.random() * 9000),
      email: '',
      status: 'idle',
      lat: Number((-6.2088 + (Math.random() - 0.5) * 0.08).toFixed(6)),
      lng: Number((106.8456 + (Math.random() - 0.5) * 0.08).toFixed(6)),
    });
    setIsDriverModalOpen(true);
  };

  const handleOpenEditDriver = (driver: Driver) => {
    setEditingDriver(driver);
    setDriverFormData({
      name: driver.name,
      vehiclePlate: driver.vehiclePlate,
      vehicleType: driver.vehicleType,
      phone: driver.phone,
      email: driver.email,
      status: driver.status,
      lat: driver.currentCoord.lat,
      lng: driver.currentCoord.lng,
    });
    setIsDriverModalOpen(true);
  };

  const handleSaveDriver = (e: React.FormEvent) => {
    e.preventDefault();
    if (!driverFormData.name.trim() || !driverFormData.vehiclePlate.trim()) {
      alert('Nama dan Nomor Plat Kendaraan wajib diisi.');
      return;
    }

    if (editingDriver) {
      updateDriver(editingDriver.id, {
        name: driverFormData.name,
        vehiclePlate: driverFormData.vehiclePlate,
        vehicleType: driverFormData.vehicleType,
        phone: driverFormData.phone,
        email: driverFormData.email || `${driverFormData.name.toLowerCase().replace(/\s+/g, '.')}@esajaya.com`,
        status: driverFormData.status,
        currentCoord: {
          ...editingDriver.currentCoord,
          lat: Number(driverFormData.lat),
          lng: Number(driverFormData.lng),
        },
      });
    } else {
      addDriver({
        name: driverFormData.name,
        vehiclePlate: driverFormData.vehiclePlate,
        vehicleType: driverFormData.vehicleType,
        phone: driverFormData.phone,
        email: driverFormData.email || `${driverFormData.name.toLowerCase().replace(/\s+/g, '.')}@esajaya.com`,
        status: driverFormData.status,
        currentCoord: {
          lat: Number(driverFormData.lat),
          lng: Number(driverFormData.lng),
          speed: driverFormData.status === 'driving' ? 40 : 0,
          heading: 0,
          accuracy: 8,
          timestamp: new Date().toISOString(),
        },
      });
    }

    setIsDriverModalOpen(false);
  };

  const handleDeleteDriverConfirm = (driver: Driver) => {
    if (window.confirm(`Konfirmasi Hapus: Apakah Owner yakin ingin menghapus driver "${driver.name}" (${driver.vehiclePlate}) dari armada PT. Esa Jaya Mulia Sentosa?`)) {
      deleteDriver(driver.id);
    }
  };

  // Open Admin Form (Add / Edit)
  const handleOpenAddAdmin = () => {
    setEditingAdmin(null);
    const randNum = Math.floor(100 + Math.random() * 900);
    setAdminFormData({
      name: '',
      username: `admin_${randNum}`,
      email: '',
      phone: '+62 811-2300-' + Math.floor(1000 + Math.random() * 9000),
      department: 'Operasional Logistik & Dispatcher',
      status: 'active',
    });
    setIsAdminModalOpen(true);
  };

  const handleOpenEditAdmin = (admin: AdminUser) => {
    setEditingAdmin(admin);
    setAdminFormData({
      name: admin.name,
      username: admin.username,
      email: admin.email,
      phone: admin.phone,
      department: admin.department,
      status: admin.status,
    });
    setIsAdminModalOpen(true);
  };

  const handleSaveAdmin = (e: React.FormEvent) => {
    e.preventDefault();
    if (!adminFormData.name.trim() || !adminFormData.username.trim()) {
      alert('Nama Admin dan Username wajib diisi.');
      return;
    }

    if (editingAdmin) {
      updateAdmin(editingAdmin.id, {
        name: adminFormData.name,
        username: adminFormData.username,
        email: adminFormData.email || `${adminFormData.username}@esajaya.com`,
        phone: adminFormData.phone,
        department: adminFormData.department,
        status: adminFormData.status,
      });
    } else {
      addAdmin({
        name: adminFormData.name,
        username: adminFormData.username,
        email: adminFormData.email || `${adminFormData.username}@esajaya.com`,
        phone: adminFormData.phone,
        department: adminFormData.department,
        status: adminFormData.status,
      });
    }

    setIsAdminModalOpen(false);
  };

  const handleDeleteAdminConfirm = (admin: AdminUser) => {
    if (window.confirm(`Konfirmasi Hapus: Apakah Owner yakin ingin menghapus akun Admin "${admin.name}" (${admin.username})?`)) {
      deleteAdmin(admin.id);
    }
  };

  // Filtered lists
  const filteredDrivers = drivers.filter((d) => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return (
      d.name.toLowerCase().includes(q) ||
      d.vehiclePlate.toLowerCase().includes(q) ||
      d.vehicleType.toLowerCase().includes(q) ||
      d.email.toLowerCase().includes(q) ||
      d.phone.toLowerCase().includes(q)
    );
  });

  const filteredAdmins = admins.filter((a) => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return (
      a.name.toLowerCase().includes(q) ||
      a.username.toLowerCase().includes(q) ||
      a.department.toLowerCase().includes(q) ||
      a.email.toLowerCase().includes(q)
    );
  });

  // If user is not authenticated as Owner, show Owner Authentication Barrier
  if (userRole !== 'owner' || !isOwnerAuthenticated) {
    return (
      <div className="max-w-2xl mx-auto py-8 px-4">
        <div className="bg-white border border-slate-200 rounded-xl shadow-lg overflow-hidden">
          {/* Header */}
          <div className="bg-[#1A237E] p-6 text-white text-center relative">
            <div className="w-16 h-16 bg-white/10 rounded-2xl flex items-center justify-center mx-auto mb-3 border border-white/20 shadow-inner">
              <Shield className="w-8 h-8 text-emerald-400" />
            </div>
            <h2 className="text-xl font-extrabold tracking-tight">
              Otorisasi Owner PT. Esa Jaya Mulia Sentosa
            </h2>
            <p className="text-xs text-indigo-200 mt-1 max-w-md mx-auto">
              Fitur Manajemen Pengguna (Tambah, Edit, Hapus Driver &amp; Admin) dilindungi dengan otentikasi hak akses Owner.
            </p>
          </div>

          {/* Login Form */}
          <div className="p-6 sm:p-8 space-y-6">
            {/* Quick credentials hint banner */}
            <div className="p-3.5 bg-emerald-50 border border-emerald-200 rounded-lg flex items-start gap-3 text-xs text-emerald-900 font-mono">
              <KeyRound className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
              <div>
                <span className="font-bold block text-emerald-800 text-sm mb-0.5">
                  Kredensial Login Owner:
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-1 text-[11px]">
                  <div>
                    Username: <span className="bg-white px-1.5 py-0.5 rounded border border-emerald-300 font-bold text-slate-800">owner</span>
                  </div>
                  <div>
                    Password: <span className="bg-white px-1.5 py-0.5 rounded border border-emerald-300 font-bold text-slate-800">owneresa1234</span>
                  </div>
                </div>
              </div>
            </div>

            {loginError && (
              <div className="p-3 bg-red-50 border border-red-200 text-red-700 text-xs rounded-lg flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 shrink-0 text-red-600" />
                <span>{loginError}</span>
              </div>
            )}

            <form onSubmit={handleLoginSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-tight mb-1">
                  Username Owner
                </label>
                <input
                  type="text"
                  value={loginUsername}
                  onChange={(e) => setLoginUsername(e.target.value)}
                  placeholder="Masukkan username owner..."
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3.5 py-2.5 text-xs text-slate-800 focus:outline-none focus:border-indigo-600 focus:bg-white font-mono"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-tight mb-1">
                  Password Akun
                </label>
                <input
                  type="password"
                  value={loginPassword}
                  onChange={(e) => setLoginPassword(e.target.value)}
                  placeholder="Masukkan password..."
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3.5 py-2.5 text-xs text-slate-800 focus:outline-none focus:border-indigo-600 focus:bg-white font-mono"
                  required
                />
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  className="w-full py-3 px-4 bg-[#1A237E] hover:bg-indigo-900 text-white rounded-lg text-xs font-extrabold flex items-center justify-center gap-2 shadow-md transition-all active:scale-[0.99]"
                >
                  <LogIn className="w-4 h-4 text-emerald-400" />
                  <span>Verifikasi &amp; Buka Manajemen Pengguna</span>
                </button>
              </div>
            </form>

            <div className="border-t border-slate-100 pt-4 text-center">
              <p className="text-[11px] text-slate-500">
                PT. Esa Jaya Mulia Sentosa • Sistem Keamanan Berbasis Peran Terpadu
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Authenticated Owner View
  return (
    <div className="space-y-5">
      {/* Top Banner Header */}
      <div className="bg-white border border-slate-200 rounded-lg p-4 shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <Shield className="w-5 h-5 text-emerald-600" />
            <h2 className="text-base font-bold text-slate-900">
              Manajemen Pengguna (Driver &amp; Admin)
            </h2>
            <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200 font-mono flex items-center gap-1">
              <CheckCircle className="w-3 h-3" />
              Owner Authorized
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Hak akses penuh Pemilik Perusahaan untuk mengelola armada driver, nomor plat kendaraan, dan staf admin operasional.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {subTab === 'drivers' ? (
            <button
              onClick={handleOpenAddDriver}
              className="px-3.5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-md text-xs font-bold flex items-center gap-1.5 transition-all shadow-xs active:scale-95"
            >
              <UserPlus className="w-4 h-4" />
              <span>+ Tambah Driver Baru</span>
            </button>
          ) : (
            <button
              onClick={handleOpenAddAdmin}
              className="px-3.5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-md text-xs font-bold flex items-center gap-1.5 transition-all shadow-xs active:scale-95"
            >
              <UserPlus className="w-4 h-4" />
              <span>+ Tambah Admin Baru</span>
            </button>
          )}

          <button
            onClick={logoutOwner}
            className="px-3 py-2 bg-slate-100 hover:bg-red-50 hover:text-red-700 text-slate-600 rounded-md text-xs font-semibold flex items-center gap-1 transition-all border border-slate-200"
            title="Keluar dari sesi Owner"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Keluar Sesi</span>
          </button>
        </div>
      </div>

      {/* Sub Tab Navigation & Search Bar */}
      <div className="bg-white border border-slate-200 rounded-lg p-3 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="flex items-center gap-1.5 bg-slate-100 p-1 rounded-lg w-full sm:w-auto">
          <button
            onClick={() => setSubTab('drivers')}
            className={`flex items-center gap-2 px-4 py-1.5 rounded-md text-xs font-bold transition-all ${
              subTab === 'drivers'
                ? 'bg-indigo-600 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Truck className="w-3.5 h-3.5" />
            <span>Driver Lapangan ({drivers.length})</span>
          </button>

          <button
            onClick={() => setSubTab('admins')}
            className={`flex items-center gap-2 px-4 py-1.5 rounded-md text-xs font-bold transition-all ${
              subTab === 'admins'
                ? 'bg-indigo-600 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <UserCheck className="w-3.5 h-3.5" />
            <span>Admin Operasional ({admins.length})</span>
          </button>
        </div>

        {/* Search */}
        <div className="relative w-full sm:w-72">
          <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder={subTab === 'drivers' ? 'Cari nama driver, plat, tipe...' : 'Cari admin, username, divisi...'}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-slate-50 border border-slate-200 rounded-md pl-9 pr-3 py-1.5 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:border-indigo-600 focus:bg-white font-mono"
          />
        </div>
      </div>

      {/* Main Content Area */}
      {subTab === 'drivers' ? (
        /* DRIVERS LIST */
        <div className="bg-white border border-slate-200 rounded-lg overflow-hidden shadow-xs">
          <div className="p-3 bg-slate-50 border-b border-slate-200 flex items-center justify-between text-xs">
            <span className="font-bold text-slate-800 uppercase tracking-wider">
              Daftar Driver PT. Esa Jaya Mulia Sentosa ({filteredDrivers.length} Pengemudi)
            </span>
            <span className="text-[11px] text-slate-500 font-mono">
              Total Armada Aktif: {drivers.filter((d) => d.status === 'driving').length}
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50/80 text-slate-500 font-mono text-[11px] border-b border-slate-200">
                <tr>
                  <th className="p-3">Pengemudi</th>
                  <th className="p-3">Plat &amp; Kendaraan</th>
                  <th className="p-3">Kontak &amp; Email</th>
                  <th className="p-3">Status Armada</th>
                  <th className="p-3">Titik Koordinat Terakhir</th>
                  <th className="p-3 text-right">Aksi Owner</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredDrivers.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="p-8 text-center text-slate-400 text-xs">
                      Tidak ada data driver yang ditemukan.
                    </td>
                  </tr>
                ) : (
                  filteredDrivers.map((driver) => {
                    const isDriving = driver.status === 'driving';
                    const isIdle = driver.status === 'idle';
                    const isOver60m = driver.currentIdleMinutes >= 60;

                    return (
                      <tr key={driver.id} className="hover:bg-slate-50/80 transition-all">
                        <td className="p-3">
                          <div className="flex items-center gap-3">
                            <img
                              src={driver.avatar}
                              alt={driver.name}
                              className="w-9 h-9 rounded-full object-cover border border-slate-200"
                            />
                            <div>
                              <div className="font-bold text-slate-900 text-xs">{driver.name}</div>
                              <div className="text-[10px] text-slate-400 font-mono">ID: {driver.id}</div>
                            </div>
                          </div>
                        </td>

                        <td className="p-3">
                          <div className="font-mono font-bold text-indigo-700 text-xs">
                            {driver.vehiclePlate}
                          </div>
                          <div className="text-[11px] text-slate-500 truncate max-w-[180px]">
                            {driver.vehicleType}
                          </div>
                        </td>

                        <td className="p-3 text-[11px] text-slate-600 space-y-0.5">
                          <div className="flex items-center gap-1 font-mono">
                            <Phone className="w-3 h-3 text-slate-400" />
                            <span>{driver.phone}</span>
                          </div>
                          <div className="flex items-center gap-1 text-slate-400 truncate max-w-[180px]">
                            <Mail className="w-3 h-3" />
                            <span>{driver.email}</span>
                          </div>
                        </td>

                        <td className="p-3 font-mono">
                          <span
                            className={`px-2 py-0.5 rounded text-[10px] font-bold inline-flex items-center gap-1 ${
                              isDriving
                                ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                                : isIdle && isOver60m
                                ? 'bg-red-100 text-red-800 border border-red-300 animate-pulse'
                                : 'bg-slate-100 text-slate-700 border border-slate-200'
                            }`}
                          >
                            <span
                              className={`w-1.5 h-1.5 rounded-full ${
                                isDriving ? 'bg-emerald-500' : isIdle && isOver60m ? 'bg-red-500' : 'bg-slate-400'
                              }`}
                            ></span>
                            {driver.status.toUpperCase()}
                            {isIdle && isOver60m ? ` (${driver.currentIdleMinutes}m)` : ''}
                          </span>
                        </td>

                        <td className="p-3 font-mono text-[11px] text-slate-700">
                          <div className="font-semibold text-indigo-700">
                            {formatCoord(driver.currentCoord.lat, driver.currentCoord.lng)}
                          </div>
                          <div className="text-[10px] text-slate-400">
                            {formatDateTime(driver.currentCoord.timestamp)}
                          </div>
                        </td>

                        <td className="p-3 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            <button
                              onClick={() => handleOpenEditDriver(driver)}
                              className="px-2.5 py-1 bg-amber-50 hover:bg-amber-600 text-amber-700 hover:text-white rounded border border-amber-200 text-xs font-semibold flex items-center gap-1 transition-all"
                              title="Edit Data Driver"
                            >
                              <Edit2 className="w-3 h-3" />
                              <span>Edit</span>
                            </button>

                            <button
                              onClick={() => handleDeleteDriverConfirm(driver)}
                              className="px-2.5 py-1 bg-red-50 hover:bg-red-600 text-red-700 hover:text-white rounded border border-red-200 text-xs font-semibold flex items-center gap-1 transition-all"
                              title="Hapus Driver Dari Sistem"
                            >
                              <Trash2 className="w-3 h-3" />
                              <span>Hapus</span>
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        /* ADMINS LIST */
        <div className="bg-white border border-slate-200 rounded-lg overflow-hidden shadow-xs">
          <div className="p-3 bg-slate-50 border-b border-slate-200 flex items-center justify-between text-xs">
            <span className="font-bold text-slate-800 uppercase tracking-wider">
              Daftar Staf Admin Operasional ({filteredAdmins.length} Akun)
            </span>
            <span className="text-[11px] text-slate-500 font-mono">
              Otoritas: Monitoring &amp; Unduh Laporan
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50/80 text-slate-500 font-mono text-[11px] border-b border-slate-200">
                <tr>
                  <th className="p-3">Nama Admin</th>
                  <th className="p-3">Username &amp; Akun</th>
                  <th className="p-3">Kontak &amp; Telepon</th>
                  <th className="p-3">Divisi / Departemen</th>
                  <th className="p-3">Status</th>
                  <th className="p-3 text-right">Aksi Owner</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredAdmins.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="p-8 text-center text-slate-400 text-xs">
                      Tidak ada data admin yang ditemukan.
                    </td>
                  </tr>
                ) : (
                  filteredAdmins.map((admin) => (
                    <tr key={admin.id} className="hover:bg-slate-50/80 transition-all">
                      <td className="p-3">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center font-bold text-xs">
                            {admin.name.slice(0, 2).toUpperCase()}
                          </div>
                          <div>
                            <div className="font-bold text-slate-900 text-xs">{admin.name}</div>
                            <div className="text-[10px] text-slate-400 font-mono">ID: {admin.id}</div>
                          </div>
                        </div>
                      </td>

                      <td className="p-3">
                        <div className="font-mono font-bold text-indigo-700 text-xs">
                          @{admin.username}
                        </div>
                        <div className="text-[11px] text-slate-500">{admin.email}</div>
                      </td>

                      <td className="p-3 text-[11px] text-slate-600 font-mono">
                        <div className="flex items-center gap-1">
                          <Phone className="w-3 h-3 text-slate-400" />
                          <span>{admin.phone}</span>
                        </div>
                      </td>

                      <td className="p-3 text-[11px] text-slate-700">
                        <div className="flex items-center gap-1 font-medium">
                          <Building className="w-3 h-3 text-slate-400" />
                          <span>{admin.department}</span>
                        </div>
                      </td>

                      <td className="p-3 font-mono">
                        <span
                          className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                            admin.status === 'active'
                              ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                              : 'bg-slate-100 text-slate-600'
                          }`}
                        >
                          {admin.status.toUpperCase()}
                        </span>
                      </td>

                      <td className="p-3 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => handleOpenEditAdmin(admin)}
                            className="px-2.5 py-1 bg-amber-50 hover:bg-amber-600 text-amber-700 hover:text-white rounded border border-amber-200 text-xs font-semibold flex items-center gap-1 transition-all"
                            title="Edit Akun Admin"
                          >
                            <Edit2 className="w-3 h-3" />
                            <span>Edit</span>
                          </button>

                          <button
                            onClick={() => handleDeleteAdminConfirm(admin)}
                            className="px-2.5 py-1 bg-red-50 hover:bg-red-600 text-red-700 hover:text-white rounded border border-red-200 text-xs font-semibold flex items-center gap-1 transition-all"
                            title="Hapus Akun Admin"
                          >
                            <Trash2 className="w-3 h-3" />
                            <span>Hapus</span>
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* DRIVER MODAL (ADD / EDIT) */}
      {isDriverModalOpen && (
        <div className="fixed inset-0 z-[2000] bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-2xl border border-slate-200 max-w-lg w-full overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            <div className="bg-[#1A237E] p-4 text-white flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Truck className="w-5 h-5 text-amber-400" />
                <h3 className="font-bold text-sm">
                  {editingDriver ? `Edit Driver: ${editingDriver.name}` : 'Tambah Driver Armada Baru'}
                </h3>
              </div>
              <button
                onClick={() => setIsDriverModalOpen(false)}
                className="text-indigo-200 hover:text-white p-1 rounded"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveDriver} className="p-5 space-y-3.5">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-slate-600 uppercase mb-1">
                    Nama Lengkap Driver
                  </label>
                  <input
                    type="text"
                    value={driverFormData.name}
                    onChange={(e) => setDriverFormData({ ...driverFormData, name: e.target.value })}
                    placeholder="Contoh: Budi Santoso"
                    className="w-full bg-slate-50 border border-slate-200 rounded-md p-2 text-xs focus:bg-white focus:border-indigo-600 font-medium"
                    required
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-600 uppercase mb-1">
                    Nomor Plat Polisi
                  </label>
                  <input
                    type="text"
                    value={driverFormData.vehiclePlate}
                    onChange={(e) => setDriverFormData({ ...driverFormData, vehiclePlate: e.target.value })}
                    placeholder="Contoh: B 9123 EJ"
                    className="w-full bg-slate-50 border border-slate-200 rounded-md p-2 text-xs focus:bg-white focus:border-indigo-600 font-mono font-bold text-indigo-700"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-600 uppercase mb-1">
                  Tipe / Model Kendaraan
                </label>
                <input
                  type="text"
                  value={driverFormData.vehicleType}
                  onChange={(e) => setDriverFormData({ ...driverFormData, vehicleType: e.target.value })}
                  placeholder="Contoh: Truk Box Isuzu Giga (10 Ton)"
                  className="w-full bg-slate-50 border border-slate-200 rounded-md p-2 text-xs focus:bg-white focus:border-indigo-600"
                  required
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-slate-600 uppercase mb-1">
                    Nomor WhatsApp / HP
                  </label>
                  <input
                    type="text"
                    value={driverFormData.phone}
                    onChange={(e) => setDriverFormData({ ...driverFormData, phone: e.target.value })}
                    placeholder="+62 812-xxxx-xxxx"
                    className="w-full bg-slate-50 border border-slate-200 rounded-md p-2 text-xs font-mono"
                    required
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-600 uppercase mb-1">
                    Status Armada
                  </label>
                  <select
                    value={driverFormData.status}
                    onChange={(e) => setDriverFormData({ ...driverFormData, status: e.target.value as Driver['status'] })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-md p-2 text-xs font-semibold"
                  >
                    <option value="driving">DRIVING (Sedang Jalan)</option>
                    <option value="idle">IDLE (Berhenti Mesin Nyala)</option>
                    <option value="stopped">STOPPED (Parkir / Mati)</option>
                    <option value="offline">OFFLINE</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 bg-slate-50 p-3 rounded-lg border border-slate-200">
                <div>
                  <label className="block text-[10px] font-bold text-slate-500 uppercase font-mono mb-1">
                    Koordinat Latitude
                  </label>
                  <input
                    type="number"
                    step="0.000001"
                    value={driverFormData.lat}
                    onChange={(e) => setDriverFormData({ ...driverFormData, lat: parseFloat(e.target.value) || 0 })}
                    className="w-full bg-white border border-slate-300 rounded p-1.5 text-xs font-mono"
                    required
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-slate-500 uppercase font-mono mb-1">
                    Koordinat Longitude
                  </label>
                  <input
                    type="number"
                    step="0.000001"
                    value={driverFormData.lng}
                    onChange={(e) => setDriverFormData({ ...driverFormData, lng: parseFloat(e.target.value) || 0 })}
                    className="w-full bg-white border border-slate-300 rounded p-1.5 text-xs font-mono"
                    required
                  />
                </div>
              </div>

              <div className="pt-3 flex items-center justify-end gap-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsDriverModalOpen(false)}
                  className="px-3.5 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-md text-xs font-semibold"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 bg-[#1A237E] hover:bg-indigo-900 text-white rounded-md text-xs font-bold flex items-center gap-1.5 shadow-sm"
                >
                  <Save className="w-3.5 h-3.5" />
                  <span>{editingDriver ? 'Simpan Perubahan' : 'Daftarkan Driver'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ADMIN MODAL (ADD / EDIT) */}
      {isAdminModalOpen && (
        <div className="fixed inset-0 z-[2000] bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-2xl border border-slate-200 max-w-lg w-full overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            <div className="bg-[#1A237E] p-4 text-white flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Shield className="w-5 h-5 text-blue-400" />
                <h3 className="font-bold text-sm">
                  {editingAdmin ? `Edit Admin: ${editingAdmin.name}` : 'Tambah Staf Admin Operasional Baru'}
                </h3>
              </div>
              <button
                onClick={() => setIsAdminModalOpen(false)}
                className="text-indigo-200 hover:text-white p-1 rounded"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveAdmin} className="p-5 space-y-3.5">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-slate-600 uppercase mb-1">
                    Nama Lengkap Admin
                  </label>
                  <input
                    type="text"
                    value={adminFormData.name}
                    onChange={(e) => setAdminFormData({ ...adminFormData, name: e.target.value })}
                    placeholder="Contoh: Siti Rahmawati"
                    className="w-full bg-slate-50 border border-slate-200 rounded-md p-2 text-xs focus:bg-white focus:border-indigo-600 font-medium"
                    required
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-600 uppercase mb-1">
                    Username Login
                  </label>
                  <input
                    type="text"
                    value={adminFormData.username}
                    onChange={(e) => setAdminFormData({ ...adminFormData, username: e.target.value })}
                    placeholder="Contoh: siti.admin"
                    className="w-full bg-slate-50 border border-slate-200 rounded-md p-2 text-xs focus:bg-white focus:border-indigo-600 font-mono font-bold text-indigo-700"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-600 uppercase mb-1">
                  Departemen / Divisi
                </label>
                <input
                  type="text"
                  value={adminFormData.department}
                  onChange={(e) => setAdminFormData({ ...adminFormData, department: e.target.value })}
                  placeholder="Contoh: Operasional Logistik & Dispatcher"
                  className="w-full bg-slate-50 border border-slate-200 rounded-md p-2 text-xs focus:bg-white focus:border-indigo-600"
                  required
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-slate-600 uppercase mb-1">
                    Nomor WhatsApp / HP
                  </label>
                  <input
                    type="text"
                    value={adminFormData.phone}
                    onChange={(e) => setAdminFormData({ ...adminFormData, phone: e.target.value })}
                    placeholder="+62 811-xxxx-xxxx"
                    className="w-full bg-slate-50 border border-slate-200 rounded-md p-2 text-xs font-mono"
                    required
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-600 uppercase mb-1">
                    Status Akun
                  </label>
                  <select
                    value={adminFormData.status}
                    onChange={(e) => setAdminFormData({ ...adminFormData, status: e.target.value as 'active' | 'inactive' })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-md p-2 text-xs font-semibold"
                  >
                    <option value="active">ACTIVE (Aktif)</option>
                    <option value="inactive">INACTIVE (Nonaktif)</option>
                  </select>
                </div>
              </div>

              <div className="pt-3 flex items-center justify-end gap-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsAdminModalOpen(false)}
                  className="px-3.5 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-md text-xs font-semibold"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 bg-[#1A237E] hover:bg-indigo-900 text-white rounded-md text-xs font-bold flex items-center gap-1.5 shadow-sm"
                >
                  <Save className="w-3.5 h-3.5" />
                  <span>{editingAdmin ? 'Simpan Perubahan' : 'Buat Akun Admin'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
