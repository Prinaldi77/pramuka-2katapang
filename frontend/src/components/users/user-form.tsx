'use client';

import React, { useState, useTransition } from 'react';
import { AlertCircle, CheckCircle2, Loader2 } from 'lucide-react';
import { createUserAction } from '@/app/actions/users';

export default function RegisterUserForm() {
  const [nama, setNama] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('siswa');
  
  // Additional fields for student
  const [nis, setNis] = useState('');
  const [kelas, setKelas] = useState('VIII-A');
  const [jenisKelamin, setJenisKelamin] = useState('Laki-laki');
  
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [isPending, startTransition] = useTransition();

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    setSuccess(false);

    if (!nama || !email || !password || !role) {
      setError('Semua input pendaftaran wajib diisi!');
      return;
    }

    if (password.length < 8) {
      setError('Kata sandi minimal harus 8 karakter!');
      return;
    }

    const formData = new FormData();
    formData.append('nama', nama);
    formData.append('email', email);
    formData.append('password', password);
    formData.append('role', role);
    
    if (role === 'siswa') {
      formData.append('nis', nis);
      formData.append('kelas', kelas);
      formData.append('jenis_kelamin', jenisKelamin);
    }

    startTransition(async () => {
      const result = await createUserAction(formData);
      if (result.success) {
        setSuccess(true);
        setNama('');
        setEmail('');
        setPassword('');
        setRole('siswa');
        setNis('');
        setKelas('VIII-A');
        setJenisKelamin('Laki-laki');
      } else {
        setError(result.error || 'Gagal mendaftarkan anggota baru.');
      }
    });
  };

  return (
    <div className="bg-white border border-[#D1C9BC] rounded-3xl p-8 shadow-sm space-y-6 text-left">
      <h3 className="font-serif font-bold text-xl text-primary border-b border-[#D1C9BC]/45 pb-3">Registrasi Anggota Baru</h3>
      
      {error && (
        <div className="flex items-center space-x-2 p-4 bg-red-50 border border-red-200 text-red-700 text-xs rounded-xl">
          <AlertCircle className="h-4 w-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {success && (
        <div className="flex items-center space-x-2 p-4 bg-green-50 border border-green-200 text-green-700 text-xs rounded-xl">
          <CheckCircle2 className="h-4 w-4 shrink-0" />
          <span>Anggota baru berhasil didaftarkan!</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* NAMA LENGKAP */}
        <div className="space-y-2">
          <label htmlFor="nama" className="text-[10px] font-mono text-[#5C3D2E] uppercase font-bold">Nama Lengkap</label>
          <input 
            id="nama"
            type="text" 
            required
            value={nama}
            onChange={(e) => setNama(e.target.value)}
            disabled={isPending}
            placeholder="Budi Santoso"
            className="w-full px-4 py-3 bg-[#FBF9F6] border border-[#D1C9BC] rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
          />
        </div>

        {/* EMAIL */}
        <div className="space-y-2">
          <label htmlFor="email" className="text-[10px] font-mono text-[#5C3D2E] uppercase font-bold">Alamat Email</label>
          <input 
            id="email"
            type="email" 
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            disabled={isPending}
            placeholder="budi@gmail.com"
            className="w-full px-4 py-3 bg-[#FBF9F6] border border-[#D1C9BC] rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
          />
        </div>

        {/* PASSWORD */}
        <div className="space-y-2">
          <label htmlFor="password" className="text-[10px] font-mono text-[#5C3D2E] uppercase font-bold">Kata Sandi Default</label>
          <input 
            id="password"
            type="password" 
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            disabled={isPending}
            placeholder="••••••••"
            className="w-full px-4 py-3 bg-[#FBF9F6] border border-[#D1C9BC] rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
          />
        </div>

        {/* ROLE */}
        <div className="space-y-2">
          <label htmlFor="role" className="text-[10px] font-mono text-[#5C3D2E] uppercase font-bold">Peran Anggota</label>
          <select 
            id="role"
            value={role}
            onChange={(e) => setRole(e.target.value)}
            disabled={isPending}
            className="w-full px-4 py-3 bg-[#FBF9F6] border border-[#D1C9BC] rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
          >
            <option value="siswa">Siswa (Penggalang)</option>
            <option value="pembina">Pembina Utama</option>
            <option value="admin">Administrator Sistem</option>
          </select>
        </div>

        {role === 'siswa' && (
          <div className="space-y-4 p-4 bg-[#FBF9F6] border border-[#D1C9BC]/50 rounded-2xl animate-fadeIn text-left">
            <span className="text-[9px] font-mono text-primary font-bold uppercase tracking-wider block mb-2">[ DETAIL PROFIL SISWA ]</span>
            
            {/* NIS */}
            <div className="space-y-2">
              <label htmlFor="nis" className="text-[10px] font-mono text-[#5C3D2E] uppercase font-bold">NIS (Nomor Induk Siswa) - Opsional</label>
              <input 
                id="nis"
                type="text"
                value={nis}
                onChange={(e) => setNis(e.target.value)}
                disabled={isPending}
                placeholder="22230104"
                className="w-full px-4 py-2.5 bg-white border border-[#D1C9BC] rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
              />
            </div>

            {/* KELAS */}
            <div className="space-y-2">
              <label htmlFor="kelas" className="text-[10px] font-mono text-[#5C3D2E] uppercase font-bold">Kelas</label>
              <select 
                id="kelas"
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
              <label htmlFor="jenis_kelamin" className="text-[10px] font-mono text-[#5C3D2E] uppercase font-bold">Jenis Kelamin</label>
              <select 
                id="jenis_kelamin"
                value={jenisKelamin}
                onChange={(e) => setJenisKelamin(e.target.value)}
                disabled={isPending}
                className="w-full px-4 py-2.5 bg-white border border-[#D1C9BC] rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
              >
                <option value="Laki-laki">Laki-laki (Siswa)</option>
                <option value="Perempuan">Perempuan (Siswi)</option>
              </select>
            </div>
          </div>
        )}

        {/* SUBMIT BUTTON */}
        <button 
          type="submit"
          disabled={isPending}
          className="w-full py-3.5 bg-primary text-[#E7E2D8] font-mono font-bold uppercase tracking-wider text-xs rounded-xl shadow-md hover:bg-opacity-95 transition-all flex justify-center items-center cursor-pointer"
        >
          {isPending ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" /> Mendaftarkan...
            </>
          ) : (
            'Daftarkan Anggota'
          )}
        </button>
      </form>
    </div>
  );
}
