'use client';

import React, { useState, useTransition } from 'react';
import { AlertCircle, CheckCircle2, Loader2, Trash2, Award, UserCheck, Users } from 'lucide-react';
import { updatePembinaJabatanAction, addDewanPengurusAction, deleteDewanPengurusAction } from '@/app/actions/kepengurusan';

interface ManageKepengurusanProps {
  pembinaList: any[];
  siswaList: any[];
  pengurusList: any[];
}

export default function ManageKepengurusan({ pembinaList, siswaList, pengurusList }: ManageKepengurusanProps) {
  const [pembinaError, setPembinaError] = useState<string | null>(null);
  const [pembinaSuccess, setPembinaSuccess] = useState(false);
  const [pengurusError, setPengurusError] = useState<string | null>(null);
  const [pengurusSuccess, setPengurusSuccess] = useState(false);

  const [isPembinaPending, startPembinaTransition] = useTransition();
  const [isPengurusPending, startPengurusTransition] = useTransition();
  const [isDeletePending, startDeleteTransition] = useTransition();

  // Form states
  const [selectedPembinaId, setSelectedPembinaId] = useState('');
  const [pembinaJabatan, setPembinaJabatan] = useState('Kamabigus');

  const [selectedSiswaId, setSelectedSiswaId] = useState('');
  const [pengurusJabatan, setPengurusJabatan] = useState('Pratama Putra');
  const [periode, setPeriode] = useState('2025/2026');

  const handleUpdatePembina = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setPembinaError(null);
    setPembinaSuccess(false);

    if (!selectedPembinaId) {
      setPembinaError('Silakan pilih Pembina terlebih dahulu.');
      return;
    }

    const formData = new FormData();
    formData.append('pembinaId', selectedPembinaId);
    formData.append('jabatan', pembinaJabatan);

    startPembinaTransition(async () => {
      const res = await updatePembinaJabatanAction(formData);
      if (res.success) {
        setPembinaSuccess(true);
        setSelectedPembinaId('');
      } else {
        setPembinaError(res.error || 'Gagal memperbarui jabatan Pembina.');
      }
    });
  };

  const handleAddPengurus = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setPengurusError(null);
    setPengurusSuccess(false);

    if (!selectedSiswaId) {
      setPengurusError('Silakan pilih Siswa terlebih dahulu.');
      return;
    }

    if (!periode.trim()) {
      setPengurusError('Periode wajib diisi.');
      return;
    }

    const formData = new FormData();
    formData.append('siswaId', selectedSiswaId);
    formData.append('jabatan', pengurusJabatan);
    formData.append('periode', periode);

    startPengurusTransition(async () => {
      const res = await addDewanPengurusAction(formData);
      if (res.success) {
        setPengurusSuccess(true);
        setSelectedSiswaId('');
      } else {
        setPengurusError(res.error || 'Gagal menambahkan dewan pengurus.');
      }
    });
  };

  const handleDeletePengurus = async (id: number) => {
    if (!confirm('Apakah Anda yakin ingin menghapus anggota ini dari Dewan Pengurus?')) return;
    
    setPengurusError(null);
    setPengurusSuccess(false);

    startDeleteTransition(async () => {
      const res = await deleteDewanPengurusAction(id);
      if (res.success) {
        setPengurusSuccess(true);
      } else {
        setPengurusError(res.error || 'Gagal menghapus dewan pengurus.');
      }
    });
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start text-left">
      
      {/* LEFT COLUMN: ASSIGNMENT FORMS */}
      <div className="lg:col-span-5 space-y-8">
        
        {/* FORM 1: MANAGE PEMBINA JABATAN */}
        <div className="bg-white border border-[#D1C9BC] rounded-3xl p-8 shadow-sm space-y-6">
          <h3 className="font-serif font-bold text-xl text-primary border-b border-[#D1C9BC]/45 pb-3 flex items-center">
            <UserCheck className="h-5 w-5 mr-2 text-accent" /> Tetapkan Jabatan Pembina
          </h3>

          {pembinaError && (
            <div className="flex items-center space-x-2 p-4 bg-red-50 border border-red-200 text-red-700 text-xs rounded-xl">
              <AlertCircle className="h-4 w-4 shrink-0" />
              <span>{pembinaError}</span>
            </div>
          )}

          {pembinaSuccess && (
            <div className="flex items-center space-x-2 p-4 bg-green-50 border border-green-200 text-green-700 text-xs rounded-xl">
              <CheckCircle2 className="h-4 w-4 shrink-0" />
              <span>Jabatan Pembina berhasil diperbarui!</span>
            </div>
          )}

          <form onSubmit={handleUpdatePembina} className="space-y-4">
            <div className="space-y-2">
              <label htmlFor="pembina-select" className="text-[10px] font-mono text-[#5C3D2E] uppercase font-bold">Pilih Pembina</label>
              <select
                id="pembina-select"
                value={selectedPembinaId}
                onChange={(e) => setSelectedPembinaId(e.target.value)}
                disabled={isPembinaPending}
                className="w-full px-4 py-3 bg-[#FBF9F6] border border-[#D1C9BC] rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
              >
                <option value="">-- Pilih Akun Pembina --</option>
                {pembinaList.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.users?.nama || 'Pembina'} ({p.users?.email}) [{p.jabatan || 'Pembina'}]
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-2">
              <label htmlFor="pembina-jabatan" className="text-[10px] font-mono text-[#5C3D2E] uppercase font-bold">Pilih Jabatan Utama</label>
              <select
                id="pembina-jabatan"
                value={pembinaJabatan}
                onChange={(e) => setPembinaJabatan(e.target.value)}
                disabled={isPembinaPending}
                className="w-full px-4 py-3 bg-[#FBF9F6] border border-[#D1C9BC] rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
              >
                <option value="Kamabigus">Kamabigus (Mabigus)</option>
                <option value="Pembina Putra">Pembina Putra</option>
                <option value="Pembina Putri">Pembina Putri</option>
                <option value="Pembina Utama">Pembina Utama (Staff)</option>
              </select>
            </div>

            <button
              type="submit"
              disabled={isPembinaPending}
              className="w-full py-3 bg-primary text-[#E7E2D8] font-mono font-bold uppercase tracking-wider text-xs rounded-xl shadow-md hover:bg-opacity-95 transition-all flex justify-center items-center cursor-pointer"
            >
              {isPembinaPending ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Perbarui Jabatan'}
            </button>
          </form>
        </div>

        {/* FORM 2: ASSIGN SISWA TO DEWAN PENGURUS */}
        <div className="bg-white border border-[#D1C9BC] rounded-3xl p-8 shadow-sm space-y-6">
          <h3 className="font-serif font-bold text-xl text-primary border-b border-[#D1C9BC]/45 pb-3 flex items-center">
            <Award className="h-5 w-5 mr-2 text-accent" /> Tambah Dewan Pengurus
          </h3>

          {pengurusError && (
            <div className="flex items-center space-x-2 p-4 bg-red-50 border border-red-200 text-red-700 text-xs rounded-xl">
              <AlertCircle className="h-4 w-4 shrink-0" />
              <span>{pengurusError}</span>
            </div>
          )}

          {pengurusSuccess && (
            <div className="flex items-center space-x-2 p-4 bg-green-50 border border-green-200 text-green-700 text-xs rounded-xl">
              <CheckCircle2 className="h-4 w-4 shrink-0" />
              <span>Dewan Pengurus berhasil ditambahkan!</span>
            </div>
          )}

          <form onSubmit={handleAddPengurus} className="space-y-4">
            <div className="space-y-2">
              <label htmlFor="siswa-select" className="text-[10px] font-mono text-[#5C3D2E] uppercase font-bold">Pilih Siswa</label>
              <select
                id="siswa-select"
                value={selectedSiswaId}
                onChange={(e) => setSelectedSiswaId(e.target.value)}
                disabled={isPengurusPending}
                className="w-full px-4 py-3 bg-[#FBF9F6] border border-[#D1C9BC] rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
              >
                <option value="">-- Pilih Akun Siswa --</option>
                {siswaList.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.users?.nama || 'Siswa'} - NIS: {s.nis || '-'} (Kelas {s.kelas || '-'})
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-2">
              <label htmlFor="pengurus-jabatan" className="text-[10px] font-mono text-[#5C3D2E] uppercase font-bold">Jabatan Struktur</label>
              <select
                id="pengurus-jabatan"
                value={pengurusJabatan}
                onChange={(e) => setPengurusJabatan(e.target.value)}
                disabled={isPengurusPending}
                className="w-full px-4 py-3 bg-[#FBF9F6] border border-[#D1C9BC] rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
              >
                <option value="Pratama Putra">Pratama Putra</option>
                <option value="Pratama Putri">Pratama Putri</option>
                <option value="Sekretaris 1">Sekretaris 1</option>
                <option value="Sekretaris 2">Sekretaris 2</option>
                <option value="Bendahara 1">Bendahara 1</option>
                <option value="Bendahara 2">Bendahara 2</option>
              </select>
            </div>

            <div className="space-y-2">
              <label htmlFor="pengurus-periode" className="text-[10px] font-mono text-[#5C3D2E] uppercase font-bold">Periode Kepengurusan</label>
              <input
                id="pengurus-periode"
                type="text"
                required
                value={periode}
                onChange={(e) => setPeriode(e.target.value)}
                disabled={isPengurusPending}
                placeholder="2025/2026"
                className="w-full px-4 py-3 bg-[#FBF9F6] border border-[#D1C9BC] rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
              />
            </div>

            <button
              type="submit"
              disabled={isPengurusPending}
              className="w-full py-3 bg-primary text-[#E7E2D8] font-mono font-bold uppercase tracking-wider text-xs rounded-xl shadow-md hover:bg-opacity-95 transition-all flex justify-center items-center cursor-pointer"
            >
              {isPengurusPending ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Tambahkan Dewan Kerja'}
            </button>
          </form>
        </div>

      </div>

      {/* RIGHT COLUMN: ACTIVE DEWAN PENGURUS LIST */}
      <div className="lg:col-span-7 bg-white border border-[#D1C9BC] rounded-3xl p-8 shadow-sm space-y-6">
        <h3 className="font-serif font-bold text-xl text-primary border-b border-[#D1C9BC]/45 pb-3 flex items-center">
          <Users className="h-5 w-5 mr-2 text-primary" /> Dewan Pengurus Aktif
        </h3>

        <div className="divide-y divide-[#D1C9BC]/35">
          {pengurusList.length === 0 ? (
            <div className="text-center py-12 text-gray-400">Belum ada dewan pengurus aktif terdaftar di database.</div>
          ) : (
            pengurusList.map((item) => (
              <div key={item.id} className="py-4 flex justify-between items-center first:pt-0 last:pb-0">
                <div>
                  <h4 className="font-serif font-bold text-sm text-primary">{item.siswa?.users?.nama || 'Siswa Tanpa Nama'}</h4>
                  <p className="text-[10px] font-mono text-gray-500 mt-1">
                    Jabatan: <span className="font-bold text-[#5C3D2E] uppercase text-xs">{item.jabatan}</span> • Periode: <span className="font-bold">{item.periode}</span>
                  </p>
                </div>
                
                <button
                  onClick={() => handleDeletePengurus(item.id)}
                  disabled={isDeletePending}
                  className="p-2 rounded-lg text-gray-400 hover:text-red-600 hover:bg-red-50 transition-colors cursor-pointer"
                  title="Hapus dari Pengurus"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            ))
          )}
        </div>
      </div>

    </div>
  );
}
