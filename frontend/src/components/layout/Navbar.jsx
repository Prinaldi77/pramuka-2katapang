import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Menu, X, LogIn, ShieldAlert } from 'lucide-react';
import logoImg from '../../assets/logo.png';
import { useAuth } from '../../context/AuthContext';

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const location = useLocation();
  const { user, isAuthenticated } = useAuth();

  const toggleMenu = () => setIsOpen(!isOpen);

  const navLinks = [
    { name: 'Beranda', path: '/' },
    { name: 'Profil', path: '/profil' },
    { name: 'Kepengurusan', path: '/kepengurusan' },
    { name: 'Kegiatan', path: '/kegiatan' },
    { name: 'Prestasi', path: '/prestasi' },
    { name: 'Galeri', path: '/galeri' },
    { name: 'Kontak', path: '/kontak' },
  ];

  const getActiveStyle = (path) => {
    const isHome = path === '/';
    const active = isHome 
      ? location.pathname === '/' 
      : location.pathname.startsWith(path);
    
    return active
      ? 'text-primary-800 font-semibold border-b-2 border-primary-800'
      : 'text-slate-600 hover:text-primary hover:font-medium';
  };

  return (
    <nav className="sticky top-0 z-40 w-full glass-nav shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo & Identity */}
          <Link to="/" className="flex items-center space-x-3 group">
            <img src={logoImg} alt="Logo" className="h-20 w-auto object-contain -my-4 bg-white p-0.5 rounded-xl shadow-xs transition-transform group-hover:scale-105" />
            <div className="flex flex-col">
              <span className="font-bold text-slate-800 text-sm md:text-base leading-tight tracking-tight uppercase">
                Satria Batara
              </span>
              <span className="text-[10px] text-slate-500 font-medium">
                SMPN 2 Katapang
              </span>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden lg:flex items-center space-x-6">
            {navLinks.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                className={`px-1 py-2 text-sm transition-all duration-200 ${getActiveStyle(link.path)}`}
              >
                {link.name}
              </Link>
            ))}
            
            {isAuthenticated ? (
              <Link
                to={`/${user.role}/dashboard`}
                className="inline-flex items-center justify-center px-4 py-2 text-sm font-semibold text-white bg-primary rounded-lg hover:bg-primary-700 transition-colors shadow-sm min-h-[44px]"
              >
                <ShieldAlert className="h-4 w-4 mr-2" />
                Dashboard
              </Link>
            ) : (
              <Link
                to="/login"
                className="inline-flex items-center justify-center px-4 py-2 text-sm font-semibold text-white bg-primary rounded-lg hover:bg-primary-700 transition-colors shadow-sm min-h-[44px]"
              >
                <LogIn className="h-4 w-4 mr-2" />
                Login
              </Link>
            )}
          </div>

          {/* Mobile Hamburger Menu Button */}
          <div className="lg:hidden flex items-center">
            <button
              onClick={toggleMenu}
              className="inline-flex items-center justify-center p-2 rounded-lg text-slate-500 hover:text-slate-700 hover:bg-slate-100 transition-colors focus:outline-none min-h-[44px] min-w-[44px]"
              aria-label="Toggle Menu"
            >
              {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu Drawer Overlay */}
      {isOpen && (
        <div className="lg:hidden fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex justify-end" onClick={toggleMenu}>
          <div
            className="w-4/5 max-w-xs bg-white h-full p-6 shadow-xl flex flex-col justify-between transform transition-transform duration-300 animate-in slide-in-from-right"
            onClick={(e) => e.stopPropagation()}
          >
            <div>
              <div className="flex items-center justify-between pb-6 border-b border-slate-100">
                <div className="flex items-center space-x-2">
                  <img src={logoImg} alt="Logo" className="h-18 w-auto object-contain bg-white p-0.5 rounded-lg border border-slate-100" />
                  <span className="font-bold text-slate-800 text-sm">Satria Batara</span>
                </div>
                <button
                  onClick={toggleMenu}
                  className="p-2 rounded-md hover:bg-slate-100 text-slate-400 hover:text-slate-600 min-h-[44px] min-w-[44px]"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              <div className="flex flex-col space-y-4 mt-6">
                {navLinks.map((link) => (
                  <Link
                    key={link.path}
                    to={link.path}
                    onClick={toggleMenu}
                    className={`px-3 py-3 rounded-lg text-base font-medium transition-colors ${
                      location.pathname === link.path
                        ? 'bg-primary/10 text-primary-800 font-semibold'
                        : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                    }`}
                  >
                    {link.name}
                  </Link>
                ))}
              </div>
            </div>

            <div className="pt-6 border-t border-slate-100">
              {isAuthenticated ? (
                <Link
                  to={`/${user.role}/dashboard`}
                  onClick={toggleMenu}
                  className="flex items-center justify-center w-full px-4 py-3 text-base font-semibold text-white bg-primary rounded-lg hover:bg-primary-700 transition-colors shadow-sm min-h-[44px]"
                >
                  <ShieldAlert className="h-5 w-5 mr-2" />
                  Dashboard ({user.role})
                </Link>
              ) : (
                <Link
                  to="/login"
                  onClick={toggleMenu}
                  className="flex items-center justify-center w-full px-4 py-3 text-base font-semibold text-white bg-primary rounded-lg hover:bg-primary-700 transition-colors shadow-sm min-h-[44px]"
                >
                  <LogIn className="h-5 w-5 mr-2" />
                  Login Anggota
                </Link>
              )}
            </div>
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
