import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import logoImg from '../../assets/logo.png';
import { motion, AnimatePresence } from 'framer-motion';
import {
  LayoutDashboard,
  Users,
  UserCheck,
  UserCog,
  FileText,
  Calendar,
  Award,
  Image as ImageIcon,
  MessageSquare,
  Clock,
  Compass,
  GraduationCap,
  Users2,
  Settings,
  LogOut,
  ChevronLeft,
  ChevronRight,
  User,
  Smartphone,
  X
} from 'lucide-react';

const Sidebar = ({ isCollapsed, setIsCollapsed, isMobileOpen, setIsMobileOpen }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const toast = useToast();

  const handleLogout = () => {
    logout();
    toast.success('Logout berhasil! Sampai jumpa kembali.');
    navigate('/login');
  };

  // Daftar menu navigasi berdasarkan role user
  const menus = {
    admin: [
      { name: 'Dashboard', path: '/admin/dashboard', icon: LayoutDashboard },
      { name: 'Users Management', path: '/admin/users', icon: UserCog },
      { name: 'Siswa Management', path: '/admin/siswa', icon: UserCheck },
      { name: 'Pembina Management', path: '/admin/pembina', icon: Users },
      { name: 'Profil Gudep', path: '/admin/profil', icon: FileText },
      { name: 'Kegiatan & Galeri', path: '/admin/kegiatan', icon: Calendar },
      { name: 'Prestasi', path: '/admin/prestasi', icon: Award },
      { name: 'Pesan Masuk', path: '/admin/pesan', icon: MessageSquare },
      { name: 'Agenda Absensi', path: '/admin/agenda', icon: Clock },
      { name: 'Rekap Absensi', path: '/admin/absensi', icon: Smartphone },
      { name: 'Penilaian Siswa', path: '/admin/nilai', icon: GraduationCap },
      { name: 'Pengurus Gudep', path: '/admin/pengurus', icon: Users2 },
      { name: 'Jadwal Piket', path: '/admin/piket', icon: Calendar },
      { name: 'Pengaturan', path: '/admin/pengaturan', icon: Settings },
    ],
    pembina: [
      { name: 'Dashboard', path: '/pembina/dashboard', icon: LayoutDashboard },
      { name: 'Data Siswa', path: '/pembina/siswa', icon: UserCheck },
      { name: 'Agenda Absensi', path: '/pembina/agenda', icon: Clock },
      { name: 'Kelola Absensi', path: '/pembina/absensi', icon: Compass },
      { name: 'Input Penilaian', path: '/pembina/nilai', icon: GraduationCap },
      { name: 'Pengurus Gudep', path: '/pembina/pengurus', icon: Users2 },
    ],
    siswa: [
      { name: 'Dashboard (Absen)', path: '/siswa/dashboard', icon: LayoutDashboard },
      { name: 'Daftar Anggota', path: '/siswa/anggota', icon: Users },
      { name: 'Kalender Kegiatan', path: '/siswa/kalender', icon: Calendar },
      { name: 'Menu Lainnya', path: '/siswa/menu-lainnya', icon: Smartphone },
    ],
  };

  const roleMenus = menus[user?.role] || [];

  // Kelas gaya aktif dan tidak aktif dengan sentuhan futuristik
  const activeClass = 'bg-gradient-to-r from-emerald-950/60 to-slate-900/40 text-emerald-400 border-l-4 border-emerald-500 font-semibold pl-[9px] shadow-[inset_0_1px_1px_rgba(255,255,255,0.02),0_0_12px_-3px_rgba(16,185,129,0.15)]';
  const inactiveClass = 'text-slate-400 hover:bg-white/[0.03] hover:text-slate-100 border-l-4 border-transparent';

  const sidebarContent = (
    <div className="flex flex-col h-full bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 text-slate-100 border-r border-slate-900 select-none">
      
      {/* Header Sidebar */}
      <div className="flex items-center justify-between px-6 py-4 border-b border-slate-900 h-16 flex-shrink-0">
        <div className="flex items-center space-x-3 overflow-hidden">
          <img 
            src={logoImg} 
            alt="Logo" 
            className="h-10 w-10 bg-white/95 p-0.5 rounded-xl flex-shrink-0 object-contain -my-2 shadow-[0_0_10px_rgba(16,185,129,0.25)]" 
          />
          {!isCollapsed && (
            <div className="flex flex-col">
              <span className="font-extrabold text-white text-xs tracking-wider leading-none uppercase bg-gradient-to-r from-white to-slate-300 bg-clip-text text-transparent">
                Satria Batara
              </span>
              <span className="text-[9px] text-slate-500 font-bold uppercase tracking-wider mt-1">
                SMPN 2 Katapang
              </span>
            </div>
          )}
        </div>

        {/* Tombol Lipat Sidebar (Desktop) */}
        <button
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="hidden md:flex p-1.5 rounded-lg bg-slate-900 border border-slate-800 text-slate-400 hover:text-white hover:border-slate-700 transition-all duration-200"
        >
          {isCollapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
        </button>

        {/* Tombol Tutup Sidebar (Mobile) */}
        <button
          onClick={() => setIsMobileOpen(false)}
          className="md:hidden p-1.5 rounded-lg bg-slate-900/80 border border-slate-800 text-slate-400 hover:text-white transition-all duration-200"
        >
          <X className="h-4 w-4" />
        </button>
      </div>

      {/* Panel Profil Pengguna (Gaya ID Card) */}
      {!isCollapsed && (
        <div className="p-4 mx-4 mt-4 bg-gradient-to-br from-slate-900/50 to-slate-950/40 border border-slate-800/60 rounded-2xl flex items-center space-x-3 backdrop-blur-xs relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-16 h-16 bg-emerald-500/5 rounded-full blur-xl pointer-events-none"></div>
          <div className="h-10 w-10 rounded-full bg-emerald-500/10 text-emerald-400 flex items-center justify-center font-bold ring-2 ring-emerald-500/20 shadow-inner group-hover:ring-emerald-500/40 transition-all duration-300">
            {user?.name?.charAt(0).toUpperCase() || 'U'}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs font-bold text-white truncate tracking-wide">{user?.name}</p>
            <p className="text-[9px] text-slate-500 font-extrabold uppercase tracking-widest mt-0.5">{user?.role}</p>
          </div>
        </div>
      )}

      {/* Menu Navigasi Utama */}
      <div className="flex-1 overflow-y-auto px-3 py-6 space-y-1 no-scrollbar">
        {roleMenus.map((menu) => {
          const Icon = menu.icon;
          return (
            <NavLink
              key={menu.path}
              to={menu.path}
              onClick={() => setIsMobileOpen(false)}
              className={({ isActive }) =>
                `flex items-center space-x-3 px-3.5 py-3 rounded-xl text-sm transition-all duration-200 ${
                  isActive ? activeClass : inactiveClass
                } ${isCollapsed ? 'justify-center pl-0 border-l-0' : ''}`
              }
              title={menu.name}
            >
              <Icon className="h-4.5 w-4.5 flex-shrink-0 transition-transform duration-200 group-hover:scale-110" />
              {!isCollapsed && <span className="truncate tracking-wide">{menu.name}</span>}
            </NavLink>
          );
        })}
      </div>

      {/* Footer / Tombol Logout */}
      <div className="p-3 border-t border-slate-900/60 mt-auto flex-shrink-0">
        <button
          onClick={handleLogout}
          className={`flex items-center space-x-3 px-3.5 py-3 rounded-xl text-sm text-red-400 hover:bg-red-500/5 hover:text-red-300 transition-all duration-200 w-full min-h-[44px] ${
            isCollapsed ? 'justify-center' : ''
          }`}
          title="Keluar"
        >
          <LogOut className="h-4.5 w-4.5 flex-shrink-0" />
          {!isCollapsed && <span className="tracking-wide">Keluar</span>}
        </button>
      </div>

    </div>
  );

  return (
    <>
      {/* Sidebar Desktop */}
      <aside
        className={`hidden md:block h-screen fixed top-0 left-0 z-30 transition-all duration-300 flex-shrink-0 ${
          isCollapsed ? 'w-20' : 'w-64'
        }`}
      >
        {sidebarContent}
      </aside>

      {/* Sidebar Mobile Overlay (Glassmorphism) */}
      <AnimatePresence>
        {isMobileOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="md:hidden fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex"
            onClick={() => setIsMobileOpen(false)}
          >
            <motion.div
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'tween', duration: 0.22 }}
              className="w-4/5 max-w-xs h-full"
              onClick={(e) => e.stopPropagation()}
            >
              {sidebarContent}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default Sidebar;
