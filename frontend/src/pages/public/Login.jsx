import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { Eye, EyeOff, Lock, Mail, ShieldAlert } from 'lucide-react';
import logoImg from '../../assets/logo.png';
import { useDocumentMetadata } from '../../hooks/useDocumentMetadata';

const Login = () => {
  useDocumentMetadata('Login', 'Masuk ke Sistem Informasi Pramuka SMP Negeri 2 Katapang untuk melakukan absensi, melihat nilai, dan mengelola data pangkalan.');

  const { login } = useAuth();
  const toast = useToast();
  const navigate = useNavigate();
  const location = useLocation();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState(null);

  // Redirection target
  const from = location.state?.from?.pathname;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email || !password) {
      setErrorMsg('Semua kolom wajib diisi!');
      return;
    }

    setLoading(true);
    setErrorMsg(null);

    try {
      const loggedInUser = await login(email, password);
      toast.success(`Selamat datang kembali, ${loggedInUser.name || 'User'}!`);

      // Determine default dashboard path based on role
      let redirectPath = `/${loggedInUser.role}/dashboard`;
      
      // If user came from a protected route and role matches, direct them back
      if (from && from.startsWith(`/${loggedInUser.role}`)) {
        redirectPath = from;
      }

      navigate(redirectPath, { replace: true });
    } catch (err) {
      console.error('Login error:', err);
      setErrorMsg(err.message || 'Email atau password salah.');
      toast.error(err.message || 'Login gagal. Silakan coba lagi.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[85vh] bg-slate-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
      {/* Ornamen latar belakang untuk estetika premium */}
      <div className="absolute top-1/4 left-1/4 w-72 h-72 bg-primary/10 rounded-full blur-3xl pointer-events-none"></div>
      <div className="absolute bottom-1/4 right-1/4 w-72 h-72 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none"></div>

      <div className="w-full max-w-md bg-white border border-slate-200 rounded-3xl p-8 sm:p-10 shadow-soft glass-card z-10 animate-in fade-in zoom-in-95 duration-200">
        
        {/* Identitas Gudep */}
        <div className="flex flex-col items-center space-y-4 text-center">
          <img src={logoImg} alt="Logo" className="h-28 w-auto object-contain bg-white p-1 rounded-3xl border border-slate-200 shadow-sm" />
          <div>
            <h2 className="text-xl sm:text-2xl font-extrabold text-slate-800 tracking-tight leading-tight uppercase">Satria Batara</h2>
            <p className="text-xs text-slate-400 font-semibold mt-1">Sistem Informasi Pramuka SMPN 2 Katapang</p>
          </div>
        </div>

        {/* Notifikasi Error */}
        {errorMsg && (
          <div className="mt-6 p-4 bg-red-50 border border-red-200 rounded-2xl flex items-start space-x-3 text-red-950 text-xs sm:text-sm animate-in shake duration-200">
            <ShieldAlert className="h-5 w-5 text-red-600 flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <span className="font-semibold">Login Gagal:</span>
              <p className="mt-0.5 text-red-700">{errorMsg}</p>
            </div>
          </div>
        )}

        {/* Form Login */}
        <form onSubmit={handleSubmit} className="mt-8 space-y-6">
          <div className="space-y-4">
            
            {/* Input Email */}
            <div className="space-y-1.5">
              <label htmlFor="email" className="text-xs font-bold text-slate-700">Alamat Email</label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
                <input
                  type="email"
                  id="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="nama@gudep.sch.id"
                  className="w-full pl-11 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm placeholder-slate-400 focus:outline-none focus:border-primary transition-colors min-h-[44px]"
                  required
                />
              </div>
            </div>

            {/* Input Password */}
            <div className="space-y-1.5">
              <label htmlFor="password" className="text-xs font-bold text-slate-700">Kata Sandi</label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  id="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-11 pr-11 py-2.5 bg-white border border-slate-200 rounded-xl text-sm placeholder-slate-400 focus:outline-none focus:border-primary transition-colors min-h-[44px]"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-slate-400 hover:text-slate-600 rounded-md min-h-[44px] min-w-[44px] flex items-center justify-center"
                >
                  {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
              </div>
            </div>

          </div>

          {/* Opsi Ingat Saya */}
          <div className="flex items-center justify-between text-xs sm:text-sm">
            <label className="flex items-center space-x-2 text-slate-600 cursor-pointer">
              <input
                type="checkbox"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                className="h-4 w-4 rounded border-slate-300 text-primary focus:ring-primary cursor-pointer"
              />
              <span className="font-medium">Ingat Saya</span>
            </label>
            <a href="#" className="font-semibold text-primary hover:underline" onClick={(e) => {e.preventDefault(); toast.info('Fitur reset sandi harap menghubungi Pembina Gudep.');}}>
              Lupa Sandi?
            </a>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 px-4 text-sm font-bold text-white bg-primary rounded-xl hover:bg-primary-700 transition-colors shadow-sm focus:outline-none min-h-[44px] flex items-center justify-center disabled:opacity-85"
          >
            {loading ? (
              <span className="flex items-center space-x-2">
                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                <span>Memproses...</span>
              </span>
            ) : (
              <span>Masuk Sekarang</span>
            )}
          </button>
        </form>
      </div>
    </div>
  );
};

export default Login;
