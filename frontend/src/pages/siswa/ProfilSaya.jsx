import React, { useState, useEffect } from 'react';
import { api } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { User, Phone, MapPin, Award } from 'lucide-react';
import LoadingSpinner from '../../components/common/LoadingSpinner';

const ProfilSaya = () => {
  const { user } = useAuth();
  const toast = useToast();
  const [siswaData, setSiswaData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSiswaData = async () => {
      try {
        const res = await api.siswa.getById(user.siswaId || 101);
        setSiswaData(res.data);
      } catch (err) {
        console.error(err);
        toast.error('Gagal mengambil data profil Anda.');
      } finally {
        setLoading(false);
      }
    };
    fetchSiswaData();
  }, [user]);

  if (loading) {
    return (
      <div className="space-y-8 animate-pulse">
        {/* Title */}
        <div className="space-y-2">
          <div className="h-8 bg-slate-200 rounded-md w-1/4"></div>
          <div className="h-4 bg-slate-200 rounded-md w-1/3"></div>
        </div>

        {/* Profile Card Skeleton */}
        <div className="bg-white border border-slate-200 rounded-3xl p-8 space-y-8 max-w-3xl">
          {/* Avatar + title */}
          <div className="flex flex-col sm:flex-row items-center sm:space-x-6 pb-6 border-b border-slate-100">
            <div className="h-20 w-20 rounded-full bg-slate-200 mb-4 sm:mb-0"></div>
            <div className="space-y-2 flex-1 w-full">
              <div className="h-6 bg-slate-200 rounded-md w-1/2 mx-auto sm:mx-0"></div>
              <div className="h-4 bg-slate-100 rounded-md w-1/3 mx-auto sm:mx-0"></div>
              <div className="h-4 bg-slate-100 rounded-md w-1/4 mx-auto sm:mx-0"></div>
            </div>
          </div>

          {/* Details grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="space-y-2">
                <div className="h-3 bg-slate-100 rounded-md w-1/3"></div>
                <div className="h-5 bg-slate-200 rounded-md w-2/3"></div>
              </div>
            ))}
          </div>

          {/* Note Banner */}
          <div className="h-16 bg-slate-100 rounded-2xl"></div>
        </div>
      </div>
    );
  }

  if (!siswaData) {
    return (
      <div className="bg-white border border-slate-200 rounded-3xl p-8 text-center space-y-4 shadow-soft">
        <User className="h-12 w-12 text-slate-300 mx-auto" />
        <h3 className="font-bold text-slate-700">Profil Tidak Ditemukan</h3>
        <p className="text-xs text-slate-400 max-w-sm mx-auto">
          Catatan data anggota penggalang Anda belum ditautkan oleh Pembina. Harap hubungi Admin Gudep.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Title */}
      <div>
        <h1 className="text-xl font-bold text-slate-800 tracking-tight flex items-center">
          <User className="h-6 w-6 text-primary mr-2" />
          Profil Anggota Saya
        </h1>
        <p className="text-xs text-slate-500 mt-1">Informasi identitas lengkap keanggotaan pramuka penggalang Anda.</p>
      </div>

      <div className="bg-white border border-slate-200 rounded-3xl p-8 shadow-soft space-y-8 max-w-3xl">
        
        {/* Profile Card Header */}
        <div className="flex flex-col sm:flex-row items-center sm:space-x-6 pb-6 border-b border-slate-100 text-center sm:text-left">
          <div className="h-20 w-20 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold text-2xl mb-4 sm:mb-0 border border-primary/20">
            {siswaData.nama.charAt(0).toUpperCase()}
          </div>
          <div className="space-y-1">
            <h2 className="text-xl font-bold text-slate-800 leading-tight">{siswaData.nama}</h2>
            <p className="text-sm text-slate-400">NIS: {siswaData.nis} | Kelas: {siswaData.kelas}</p>
            <span className="inline-block mt-2 text-[10px] font-semibold px-2 py-0.5 rounded-full border bg-slate-50 text-slate-500 capitalize">
              {siswaData.jenis_kelamin}
            </span>
          </div>
        </div>

        {/* Detailed Fields */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 text-sm">
          <div className="space-y-1">
            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Tempat / Tanggal Lahir</p>
            <p className="font-bold text-slate-700 flex items-center">
              <MapPin className="h-4 w-4 mr-1.5 text-slate-400" />
              {siswaData.tempat_lahir || '-'}, {siswaData.tanggal_lahir || '-'}
            </p>
          </div>

          <div className="space-y-1">
            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Nama Orang Tua / Wali</p>
            <p className="font-bold text-slate-700 flex items-center">
              <Award className="h-4 w-4 mr-1.5 text-slate-400" />
              {siswaData.nama_orang_tua || '-'}
            </p>
          </div>

          <div className="space-y-1 sm:col-span-2">
            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">No. HP Orang Tua / Wali</p>
            <p className="font-bold text-slate-700 flex items-center">
              <Phone className="h-4 w-4 mr-1.5 text-slate-400" />
              {siswaData.nomor_hp_orang_tua || '-'}
            </p>
          </div>
        </div>

        {/* Notes banner */}
        <div className="p-4 bg-slate-50 border border-slate-200/60 rounded-2xl text-[11px] text-slate-500 leading-relaxed">
          <p className="font-bold text-slate-700 mb-1">Catatan Penting:</p>
          Jika terdapat kesalahan penulisan nama, NIS, tempat lahir, atau data wali, mohon segera lapor kepada **Pembina Pramuka** untuk dilakukan perbaikan data di panel admin.
        </div>

      </div>
    </div>
  );
};

export default ProfilSaya;
