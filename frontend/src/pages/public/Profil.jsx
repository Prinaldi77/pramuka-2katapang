import React, { useState, useEffect } from 'react';
import { api } from '../../services/api';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import { Mail, Phone, MapPin, Award, CheckCircle } from 'lucide-react';
import logoImg from '../../assets/logo.png';

const Profil = () => {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await api.profil.get();
        setProfile(res.data);
      } catch (err) {
        console.error('Error fetching profile:', err);
        setError(true);
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (error || !profile) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-6 text-center">
        <p className="text-red-500 font-semibold text-lg">Gagal memuat profil pangkalan.</p>
        <button onClick={() => window.location.reload()} className="mt-4 px-4 py-2 bg-primary text-white rounded-lg">Coba Lagi</button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto space-y-12">
        
        {/* Header Block */}
        <div className="bg-white rounded-3xl border border-slate-200 p-8 sm:p-12 shadow-soft flex flex-col md:flex-row items-center md:space-x-8 text-center md:text-left">
          <img src={profile.logo || logoImg} alt="Logo" className="h-28 w-28 md:h-36 md:w-36 bg-slate-50 p-3 rounded-2xl border border-slate-200 object-contain flex-shrink-0 mb-6 md:mb-0" />
          <div className="space-y-4">
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-emerald-50 text-primary-800 border border-emerald-200">
              Profil Gugus Depan
            </span>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-800 tracking-tight leading-tight">
              {profile.nama_gudep}
            </h1>
            <p className="text-slate-600 text-sm leading-relaxed">
              {profile.deskripsi}
            </p>
          </div>
        </div>

        {/* Visi & Misi Block */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white rounded-2xl border border-slate-200 p-8 shadow-soft space-y-4">
            <div className="flex items-center space-x-2 text-primary-800">
              <Award className="h-6 w-6" />
              <h2 className="text-xl font-bold">Visi Kami</h2>
            </div>
            <p className="text-slate-600 text-sm leading-relaxed whitespace-pre-line italic">
              "{profile.visi}"
            </p>
          </div>
          <div className="bg-white rounded-2xl border border-slate-200 p-8 shadow-soft space-y-4">
            <div className="flex items-center space-x-2 text-primary-800">
              <CheckCircle className="h-6 w-6" />
              <h2 className="text-xl font-bold">Misi Kami</h2>
            </div>
            <p className="text-slate-600 text-sm leading-relaxed whitespace-pre-line">
              {profile.misi}
            </p>
          </div>
        </div>

        {/* Contact Block */}
        <div className="bg-white rounded-2xl border border-slate-200 p-8 shadow-soft">
          <h2 className="text-xl font-bold text-slate-800 mb-6 pb-2 border-b border-slate-100">Informasi Sekretariat</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="flex items-start space-x-3">
              <MapPin className="h-6 w-6 text-primary mt-0.5 flex-shrink-0" />
              <div>
                <h4 className="font-semibold text-slate-700 text-sm">Alamat Pangkalan</h4>
                <p className="text-xs text-slate-500 mt-1 leading-relaxed">{profile.alamat}</p>
              </div>
            </div>
            <div className="flex items-start space-x-3">
              <Phone className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
              <div>
                <h4 className="font-semibold text-slate-700 text-sm">Nomor Telepon</h4>
                <p className="text-xs text-slate-500 mt-1">{profile.telepon}</p>
              </div>
            </div>
            <div className="flex items-start space-x-3">
              <Mail className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
              <div>
                <h4 className="font-semibold text-slate-700 text-sm">Alamat Surat Elektronik</h4>
                <p className="text-xs text-slate-500 mt-1 underline">{profile.email}</p>
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};

export default Profil;
