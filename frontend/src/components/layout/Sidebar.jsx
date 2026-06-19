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
  Smartphone
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

  // Menu lists based on user role
  const menus = {
    admin: [
      { name: 'Dashboard', path: '/admin/dashboard', icon: LayoutDashboard },
      { name: 'Users Management', path: '/admin/users', icon: UserCog },
      { name: 'Siswa Management', path: '/admin/siswa', icon: UserCheck },
      { name: 'Pembina Management', path: '/admin/pembina', icon: Users },
      { name: 'Profil Gudep', path: '/admin/profil', icon: FileText },
      { name: 'Berita', path: '/admin/berita', icon: FileText },
      { name: 'Kegiatan', path: '/admin/kegiatan', icon: Calendar },
      { name: 'Prestasi', path: '/admin/prestasi', icon: Award },
      { name: 'Galeri', path: '/admin/galeri', icon: ImageIcon },
      { name: 'Pesan Masuk', path: '/admin/pesan', icon: MessageSquare },
      { name: 'Agenda Absensi', path: '/admin/agenda', icon: Clock },
      { name: 'Rekap Absensi', path: '/admin/absensi', icon: Smartphone },
      { name: 'Penilaian Siswa', path: '/admin/nilai', icon: GraduationCap },
      { name: 'Pengurus Gudep', path: '/admin/pengurus', icon: Users2 },
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
      { name: 'Dashboard', path: '/siswa/dashboard', icon: LayoutDashboard },
      { name: 'Profil Saya', path: '/siswa/profil', icon: User },
      { name: 'Absensi Saya', path: '/siswa/absensi', icon: Compass },
      { name: 'Nilai Rapor', path: '/siswa/nilai', icon: GraduationCap },
    ],
  };

  const roleMenus = menus[user?.role] || [];

  const activeClass = 'bg-primary-800 text-white font-medium';
  const inactiveClass = 'text-slate-300 hover:bg-slate-800/50 hover:text-white';

  const sidebarContent = (
    <div className="flex flex-col h-full bg-slate-950 text-slate-100 border-r border-slate-900 select-none">
      
      {/* Sidebar Header Brand */}
      <div className="flex items-center justify-between px-6 py-4 border-b border-slate-900 h-16 flex-shrink-0">
        <div className="flex items-center space-x-3 overflow-hidden">
          <img src={logoImg} alt="Logo" className="h-10 w-10 bg-white p-0.5 rounded-lg flex-shrink-0 object-contain -my-2" />
          {!isCollapsed && (
            <div className="flex flex-col">
              <span className="font-bold text-white text-sm tracking-tight leading-none uppercase">Satria Batara</span>
              <span className="text-[10px] text-slate-500 font-medium mt-1">SMPN 2 Katapang</span>
            </div>
          )}
        </div>
        {/* Toggle button on desktop/tablet */}
        <button
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="hidden md:flex p-1.5 rounded-lg bg-slate-900 border border-slate-800 text-slate-400 hover:text-white transition-colors"
        >
          {isCollapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
        </button>
      </div>

      {/* Profile summary */}
      {!isCollapsed && (
        <div className="p-4 mx-4 mt-4 bg-slate-900/40 border border-slate-900 rounded-xl flex items-center space-x-3">
          <div className="h-10 w-10 rounded-full bg-primary/20 text-primary-400 flex items-center justify-center font-bold">
            {user?.name?.charAt(0).toUpperCase() || 'U'}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs font-semibold text-white truncate">{user?.name}</p>
            <p className="text-[10px] text-slate-500 capitalize">{user?.role}</p>
          </div>
        </div>
      )}

      {/* Nav Menu Items */}
      <div className="flex-1 overflow-y-auto px-3 py-4 space-y-1.5 no-scrollbar">
        {roleMenus.map((menu) => {
          const Icon = menu.icon;
          return (
            <NavLink
              key={menu.path}
              to={menu.path}
              onClick={() => setIsMobileOpen(false)}
              className={({ isActive }) =>
                `flex items-center space-x-3 px-3 py-3 rounded-lg text-sm transition-all duration-150 ${
                  isActive ? activeClass : inactiveClass
                } ${isCollapsed ? 'justify-center' : ''}`
              }
              title={menu.name}
            >
              <Icon className="h-5 w-5 flex-shrink-0" />
              {!isCollapsed && <span className="truncate">{menu.name}</span>}
            </NavLink>
          );
        })}
      </div>

      {/* Logout button */}
      <div className="p-3 border-t border-slate-900 mt-auto flex-shrink-0">
        <button
          onClick={handleLogout}
          className={`flex items-center space-x-3 px-3 py-3 rounded-lg text-sm text-red-400 hover:bg-red-500/10 hover:text-red-300 transition-all duration-150 w-full min-h-[44px] ${
            isCollapsed ? 'justify-center' : ''
          }`}
          title="Keluar"
        >
          <LogOut className="h-5 w-5 flex-shrink-0" />
          {!isCollapsed && <span>Keluar</span>}
        </button>
      </div>
    </div>
  );

  return (
    <>
      {/* Tablet / Desktop Sidebar */}
      <aside
        className={`hidden md:block h-screen fixed top-0 left-0 z-30 transition-all duration-300 flex-shrink-0 ${
          isCollapsed ? 'w-20' : 'w-64'
        }`}
      >
        {sidebarContent}
      </aside>

      {/* Mobile Drawer Sidebar Overlay */}
      <AnimatePresence>
        {isMobileOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="md:hidden fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex"
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
