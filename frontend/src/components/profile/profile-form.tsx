'use client';

import React, { useState, useTransition } from 'react';
import { Camera, AlertCircle, CheckCircle2, Loader2, Compass } from 'lucide-react';
import { updateProfileAction } from '@/app/actions/profile';

interface ProfileFormProps {
  user: {
    id: number;
    nama: string;
    email: string;
    role: string;
    foto_profil?: string;
    nis?: string;
    kelas?: string;
    jenis_kelamin?: string;
    phone?: string;
  };
}

export default function ProfileForm({ user }: ProfileFormProps) {
  const [nama, setNama] = useState(user.nama);
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [isPending, startTransition] = useTransition();

  // Student specific states
  const [nis, setNis] = useState(user.nis || '');
  const [kelas, setKelas] = useState(user.kelas || '');
  const [jenisKelamin, setJenisKelamin] = useState(user.jenis_kelamin || 'Laki-laki');
  const [phone, setPhone] = useState(user.phone || '');

  // For image preview
  const [previewUrl, setPreviewUrl] = useState<string | null>(user.foto_profil || null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewUrl(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    setSuccess(false);

    if (!nama || nama.trim() === '') {
      setError('Nama lengkap tidak boleh kosong.');
      return;
    }

    if (password && password.length < 8) {
      setError('Kata sandi baru minimal harus 8 karakter.');
      return;
    }

    const formData = new FormData();
    formData.append('nama', nama);
    formData.append('password', password);
    if (selectedFile) {
      formData.append('foto', selectedFile);
    }
    
    if (user.role === 'siswa') {
      formData.append('nis', nis);
      formData.append('kelas', kelas);
      formData.append('jenis_kelamin', jenisKelamin);
      formData.append('phone', phone);
    }

    startTransition(async () => {
      const response = await updateProfileAction(formData);
      if (response.success) {
        setSuccess(true);
        setPassword(''); // Reset password input
      } else {
        setError(response.error || 'Terjadi kesalahan saat memperbarui profil.');
      }
    });
  };

  return (
    <div className="max-w-2xl mx-auto bg-white border border-[#D1C9BC] rounded-3xl p-8 md:p-12 shadow-sm space-y-8 text-left">
      <div>
        <span className="text-[10px] font-mono tracking-widest text-[#5C3D2E] uppercase font-bold">[ PENGATURAN AKUN ]</span>
        <h2 className="text-3xl font-serif font-bold text-primary mt-2">Edit Profil Pribadi</h2>
        <p className="text-xs text-gray-500 mt-1 leading-relaxed">
          Perbarui nama lengkap, foto profil, dan kata sandi masuk Anda.
        </p>
      </div>

      {error && (
        <div className="flex items-center space-x-2 p-4 bg-red-50 border border-red-200 text-red-700 text-xs rounded-xl">
          <AlertCircle className="h-4 w-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {success && (
        <div className="flex items-center space-x-2 p-4 bg-green-50 border border-green-200 text-green-700 text-xs rounded-xl">
          <CheckCircle2 className="h-4 w-4 shrink-0" />
          <span>Profil Anda berhasil diperbarui!</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* FOTO PROFIL UPLOAD */}
        <div className="flex flex-col sm:flex-row items-center space-y-4 sm:space-y-0 sm:space-x-6 pb-4 border-b border-[#D1C9BC]/45">
          <div className="relative group w-24 h-24 rounded-full border-2 border-primary overflow-hidden bg-[#FBF9F6] flex items-center justify-center">
            {previewUrl ? (
              <img 
                src={previewUrl} 
                alt="Pratinjau Foto Profil" 
                className="w-full h-full object-cover"
              />
            ) : (
              <Compass className="h-10 w-10 text-primary/60" />
            )}
            
            <label 
              htmlFor="foto-upload"
              className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer text-white"
            >
              <Camera className="h-5 w-5" />
            </label>
            <input 
              id="foto-upload"
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleFileChange}
              disabled={isPending}
            />
          </div>
          <div className="flex-1 text-center sm:text-left space-y-1">
            <span className="text-[10px] font-mono text-[#5C3D2E] uppercase font-bold block">Foto Profil</span>
            <p className="text-[11px] text-gray-400">
              Format JPG, PNG, atau WEBP. Klik ikon kamera pada lingkaran foto untuk mengunggah.
            </p>
          </div>
        </div>

        {/* NAMA LENGKAP */}
        <div className="space-y-2">
          <label htmlFor="nama" className="text-[10px] font-mono text-[#5C3D2E] uppercase font-bold">
            Nama Lengkap
          </label>
          <input
            id="nama"
            type="text"
            required
            value={nama}
            onChange={(e) => setNama(e.target.value)}
            disabled={isPending}
            placeholder="Masukkan nama lengkap Anda"
            className="w-full px-4 py-3 bg-[#FBF9F6] border border-[#D1C9BC] rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
          />
        </div>

        {/* EMAIL (READ-ONLY) */}
        <div className="space-y-2">
          <label htmlFor="email" className="text-[10px] font-mono text-[#5C3D2E] uppercase font-bold">
            Alamat Email (Tidak Dapat Diubah)
          </label>
          <input
            id="email"
            type="email"
            readOnly
            value={user.email}
            className="w-full px-4 py-3 bg-[#E6DFD3]/30 border border-[#D1C9BC]/70 rounded-xl text-sm text-gray-500 cursor-not-allowed outline-none"
          />
        </div>

        {/* ROLE (READ-ONLY) */}
        <div className="space-y-2">
          <label className="text-[10px] font-mono text-[#5C3D2E] uppercase font-bold">
            Hak Akses Peran
          </label>
          <div className="w-fit px-3 py-1 bg-secondary text-primary rounded-lg text-xs font-mono font-bold uppercase tracking-wider">
            {user.role}
          </div>
        </div>

        {user.role === 'siswa' && (
          <div className="space-y-4 p-4 bg-[#FBF9F6] border border-[#D1C9BC]/50 rounded-2xl text-left">
            <span className="text-[9px] font-mono text-primary font-bold uppercase tracking-wider block mb-2">[ DETAIL DATA SISWA ]</span>
            
            {/* NIS */}
            <div className="space-y-2">
              <label htmlFor="profile-nis" className="text-[10px] font-mono text-[#5C3D2E] uppercase font-bold">NIS (Nomor Induk Siswa)</label>
              <input 
                id="profile-nis"
                type="text"
                value={nis}
                onChange={(e) => setNis(e.target.value)}
                disabled={isPending}
                className="w-full px-4 py-2.5 bg-white border border-[#D1C9BC] rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
              />
            </div>

            {/* KELAS */}
            <div className="space-y-2">
              <label htmlFor="profile-kelas" className="text-[10px] font-mono text-[#5C3D2E] uppercase font-bold">Kelas</label>
              <select 
                id="profile-kelas"
                value={kelas}
                onChange={(e) => setKelas(e.target.value)}
                disabled={isPending}
                className="w-full px-4 py-2.5 bg-white border border-[#D1C9BC] rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
              >
                <option value="VII-A">VII-A</option>
                <option value="VII-B">VII-B</option>
                <option value="VII-C">VII-C</option>
                <option value="VIII-A">VIII-A</option>
                <option value="VIII-B">VIII-B</option>
                <option value="VIII-C">VIII-C</option>
                <option value="IX-A">IX-A</option>
                <option value="IX-B">IX-B</option>
                <option value="IX-C">IX-C</option>
              </select>
            </div>

            {/* JENIS KELAMIN */}
            <div className="space-y-2">
              <label htmlFor="profile-jk" className="text-[10px] font-mono text-[#5C3D2E] uppercase font-bold">Jenis Kelamin</label>
              <select 
                id="profile-jk"
                value={jenisKelamin}
                onChange={(e) => setJenisKelamin(e.target.value)}
                disabled={isPending}
                className="w-full px-4 py-2.5 bg-white border border-[#D1C9BC] rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
              >
                <option value="Laki-laki">Laki-laki (Siswa)</option>
                <option value="Perempuan">Perempuan (Siswi)</option>
              </select>
            </div>

            {/* NO HP ORTU */}
            <div className="space-y-2">
              <label htmlFor="profile-phone" className="text-[10px] font-mono text-[#5C3D2E] uppercase font-bold">Nomor HP Orang Tua</label>
              <input 
                id="profile-phone"
                type="text"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                disabled={isPending}
                placeholder="0812XXXXXXXX"
                className="w-full px-4 py-2.5 bg-white border border-[#D1C9BC] rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
              />
            </div>
          </div>
        )}

        {/* PASSWORD BARU */}
        <div className="space-y-2 pt-2 border-t border-[#D1C9BC]/45">
          <label htmlFor="password-baru" className="text-[10px] font-mono text-[#5C3D2E] uppercase font-bold">
            Ganti Kata Sandi (Kosongkan jika tidak ingin mengubah)
          </label>
          <input
            id="password-baru"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            disabled={isPending}
            placeholder="Masukkan kata sandi baru (minimal 8 karakter)"
            className="w-full px-4 py-3 bg-[#FBF9F6] border border-[#D1C9BC] rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
          />
        </div>

        {/* SUBMIT BUTTON */}
        <button
          type="submit"
          disabled={isPending}
          className="w-full py-3.5 bg-primary text-[#E7E2D8] font-mono font-bold uppercase tracking-wider text-xs rounded-xl shadow-md hover:bg-opacity-95 transition-all flex justify-center items-center cursor-pointer"
        >
          {isPending ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" /> Memproses Pembaruan...
            </>
          ) : (
            'Simpan Perubahan Profil'
          )}
        </button>
      </form>
    </div>
  );
}
