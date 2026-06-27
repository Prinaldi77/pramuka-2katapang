import React from 'react';
import { Link } from 'react-router-dom';
import logoImg from '../../assets/logo.png';
import { Mail, Phone, MapPin, Globe } from 'lucide-react';

const Footer = () => {
  return (
    <footer className="bg-slate-900 text-slate-300 border-t border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          
          {/* Identity Column */}
          <div className="space-y-4">
            <div className="flex items-center space-x-3">
              <img src={logoImg} alt="Logo" className="h-16 w-auto bg-white p-0.5 rounded-xl object-contain -my-4 shadow-xs" />
              <div className="flex flex-col">
                <span className="font-bold text-white text-base leading-tight">
                  BARISAN SATRIA BATARA
                </span>
                <span className="text-xs text-slate-400">
                  SMPN 2 Katapang
                </span>
              </div>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed">
              Sistem Informasi Pramuka Gugus Depan 28.065-28.066 Pangkalan SMP Negeri 2 Katapang. Membina generasi mandiri, disiplin, berkarakter, dan berprestasi tinggi.
            </p>
            <div className="flex space-x-3 pt-2">
              <a href="#" className="p-2 bg-slate-800 hover:bg-primary rounded-lg hover:text-white transition-colors" aria-label="Instagram">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4"><rect width="20" height="20" x="2" y="2" rx="5" ry="5"/><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/><line x1="17.5" x2="17.51" y1="6.5" y2="6.51"/></svg>
              </a>
              <a href="#" className="p-2 bg-slate-800 hover:bg-primary rounded-lg hover:text-white transition-colors" aria-label="Website">
                <Globe className="h-4 w-4" />
              </a>
            </div>
          </div>

          {/* Quick Links Column */}
          <div>
            <h3 className="text-white font-semibold text-sm tracking-wider uppercase mb-4">Navigasi</h3>
            <ul className="space-y-2 text-sm text-slate-400">
              <li><Link to="/" className="hover:text-white transition-colors">Beranda</Link></li>
              <li><Link to="/profil" className="hover:text-white transition-colors">Profil Gudep</Link></li>
              <li><Link to="/kepengurusan" className="hover:text-white transition-colors">Struktur Kepengurusan</Link></li>
              <li><Link to="/kegiatan" className="hover:text-white transition-colors">Kegiatan & Galeri</Link></li>
              <li><Link to="/prestasi" className="hover:text-white transition-colors">Prestasi Gudep</Link></li>
            </ul>
          </div>

          {/* Contact Details Column */}
          <div>
            <h3 className="text-white font-semibold text-sm tracking-wider uppercase mb-4">Kontak Kami</h3>
            <ul className="space-y-3 text-sm text-slate-400">
              <li className="flex items-start space-x-3">
                <MapPin className="h-5 w-5 text-primary-400 mt-0.5 flex-shrink-0" />
                <span className="text-xs">
                  Komplek Gading Junti Asri, Desa Sangkanhurip, Kecamatan Katapang, Kabupaten Bandung, Jawa Barat
                </span>
              </li>
              <li className="flex items-center space-x-3">
                <Phone className="h-4 w-4 text-primary-400 flex-shrink-0" />
                <span className="text-xs">087825056256</span>
              </li>
              <li className="flex items-center space-x-3">
                <Mail className="h-4 w-4 text-primary-400 flex-shrink-0" />
                <span className="text-xs">pramukasmpn2katapang@gmail.com</span>
              </li>
            </ul>
          </div>

          {/* Info Column */}
          <div>
            <h3 className="text-white font-semibold text-sm tracking-wider uppercase mb-4">Jam Latihan</h3>
            <div className="p-4 bg-slate-800/50 border border-slate-800 rounded-xl space-y-2">
              <p className="text-xs font-semibold text-white">Latihan Rutin Penggalang:</p>
              <p className="text-xs text-primary-400">Setiap Hari Sabtu</p>
              <p className="text-xs text-slate-400">Pukul 08.00 - 13.00 WIB</p>
              <p className="text-[10px] text-slate-500 italic">Mengenakan Pakaian Pramuka Lengkap</p>
            </div>
          </div>

        </div>

        {/* Bottom copyright */}
        <div className="mt-12 pt-6 border-t border-slate-800 flex flex-col sm:flex-row justify-between items-center text-xs text-slate-500">
          <p>&copy; {new Date().getFullYear()} Sistem Informasi Pramuka SMPN 2 Katapang. Hak Cipta Dilindungi.</p>
          <p className="mt-2 sm:mt-0">Dibuat dengan dedikasi kepramukaan</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
