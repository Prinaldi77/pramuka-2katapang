'use client';

import React, { useState, useTransition } from 'react';
import { Shield, GraduationCap, Award, Trash2, Users, FolderKanban, Loader2, Edit3, X, CheckCircle2 } from 'lucide-react';
import RegisterUserForm from './user-form';
import ManageKepengurusan from './manage-kepengurusan';
import { deleteUserAction, updateSiswaTingkatanAction } from '@/app/actions/users';

interface UsersTabsContainerProps {
  usersList: any[];
  pembinaList: any[];
  siswaList: any[];
  pengurusList: any[];
  currentUserId: number;
}

export default function UsersTabsContainer({
  usersList,
  pembinaList,
  siswaList,
  pengurusList,
  currentUserId,
}: UsersTabsContainerProps) {
  const [activeTab, setActiveTab] = useState<'anggota' | 'kepengurusan'>('anggota');
  const [isDeletePending, startDeleteTransition] = useTransition();
  const [deleteError, setDeleteError] = useState<string | null>(null);

  // Edit Tingkatan Modal State
  const [selectedSiswaForEdit, setSelectedSiswaForEdit] = useState<{
    siswaId: number;
    userId: number;
    nama: string;
    nis: string;
    kelas: string;
    tingkatan: string;
    regu: string;
    jenisKelamin: string;
  } | null>(null);

  const [editTingkatan, setEditTingkatan] = useState('Penggalang Ramu');
  const [editRegu, setEditRegu] = useState('Regu Wolf');
  const [isUpdatePending, startUpdateTransition] = useTransition();
  const [updateError, setUpdateError] = useState<string | null>(null);
  const [updateSuccess, setUpdateSuccess] = useState<string | null>(null);

  const openEditModal = (user: any, siswa: any) => {
    const regu = siswa.regu || (siswa.jenis_kelamin === 'Perempuan' ? 'Regu Valerian' : 'Regu Wolf');
    setSelectedSiswaForEdit({
      siswaId: siswa.id,
      userId: user.id,
      nama: user.nama,
      nis: siswa.nis || '-',
      kelas: siswa.kelas || '-',
      tingkatan: siswa.tingkatan || 'Penggalang Ramu',
      regu: regu,
      jenisKelamin: siswa.jenis_kelamin || 'Laki-laki',
    });
    setEditTingkatan(siswa.tingkatan || 'Penggalang Ramu');
    setEditRegu(regu);
    setUpdateError(null);
    setUpdateSuccess(null);
  };

  const handleSaveTingkatan = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedSiswaForEdit) return;

    setUpdateError(null);
    setUpdateSuccess(null);

    const formData = new FormData();
    formData.append('siswa_id', selectedSiswaForEdit.siswaId.toString());
    formData.append('tingkatan', editTingkatan);
    formData.append('regu', editRegu);

    startUpdateTransition(async () => {
      const res = await updateSiswaTingkatanAction(formData);
      if (res.success) {
        setUpdateSuccess('Tingkatan anggota berhasil diperbarui!');
        setTimeout(() => {
          setSelectedSiswaForEdit(null);
          setUpdateSuccess(null);
        }, 1200);
      } else {
        setUpdateError(res.error || 'Gagal memperbarui tingkatan.');
      }
    });
  };

  const handleDeleteUser = async (id: number) => {
    if (!confirm('Apakah Anda yakin ingin menghapus akun ini secara permanen?')) return;
    
    setDeleteError(null);
    startDeleteTransition(async () => {
      try {
        await deleteUserAction(id);
      } catch (err: any) {
        setDeleteError(err.message || 'Gagal menghapus anggota.');
      }
    });
  };

  return (
    <div className="space-y-8">
      {/* TABS SELECTOR */}
      <div className="flex border-b border-[#D1C9BC]/50 pb-px">
        <button
          onClick={() => setActiveTab('anggota')}
          className={`flex items-center space-x-2 px-6 py-3 border-b-2 text-xs font-mono font-bold uppercase tracking-wider transition-all cursor-pointer ${
            activeTab === 'anggota'
              ? 'border-primary text-primary'
              : 'border-transparent text-gray-400 hover:text-[#5C3D2E]'
          }`}
        >
          <Users className="h-4 w-4" />
          <span>Kelola Anggota</span>
        </button>
        <button
          onClick={() => setActiveTab('kepengurusan')}
          className={`flex items-center space-x-2 px-6 py-3 border-b-2 text-xs font-mono font-bold uppercase tracking-wider transition-all cursor-pointer ${
            activeTab === 'kepengurusan'
              ? 'border-primary text-primary'
              : 'border-transparent text-gray-400 hover:text-[#5C3D2E]'
          }`}
        >
          <FolderKanban className="h-4 w-4" />
          <span>Kelola Jabatan Pengurus</span>
        </button>
      </div>

      {deleteError && (
        <div className="p-4 bg-red-50 border border-red-200 text-red-700 text-xs rounded-xl text-left">
          {deleteError}
        </div>
      )}

      {/* TAB CONTENT */}
      {activeTab === 'anggota' ? (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* ADD USER FORM */}
          <div className="lg:col-span-5">
            <RegisterUserForm />
          </div>

          {/* LIST TABLE */}
          <div className="lg:col-span-7 bg-white border border-[#D1C9BC] rounded-3xl p-8 shadow-sm space-y-6 text-left">
            <div className="flex items-center justify-between border-b border-[#D1C9BC]/45 pb-3">
              <h3 className="font-serif font-bold text-xl text-primary">
                Daftar Anggota Terdaftar
              </h3>
              <span className="text-xs font-mono text-[#5C3D2E] font-bold">
                Total: {usersList?.length || 0} Akun
              </span>
            </div>

            <div className="divide-y divide-[#D1C9BC]/35">
              {!usersList || usersList.length === 0 ? (
                <div className="text-center py-12 text-gray-400">Belum ada anggota terdaftar di database.</div>
              ) : (
                usersList.map((item: any, idx: number) => {
                  const siswa = Array.isArray(item.siswa) ? item.siswa[0] : item.siswa;
                  const reguName = siswa?.regu || (siswa?.jenis_kelamin === 'Perempuan' ? 'Regu Valerian' : 'Regu Wolf');
                  
                  return (
                    <div key={item.id || idx} className="py-4 flex justify-between items-center first:pt-0 last:pb-0 gap-4">
                      <div className="flex items-center space-x-4 min-w-0 flex-1">
                        <div className="p-3 bg-[#E6DFD3] text-primary rounded-xl shrink-0">
                          {item.role === 'admin' ? (
                            <Shield className="h-5 w-5" />
                          ) : item.role === 'pembina' ? (
                            <Award className="h-5 w-5" />
                          ) : (
                            <GraduationCap className="h-5 w-5" />
                          )}
                        </div>
                        <div className="text-left min-w-0 flex-1">
                          <div className="flex items-center flex-wrap gap-2">
                            <h4 className="font-serif font-bold text-sm text-primary truncate">{item.nama}</h4>
                            
                            {/* BADGE TINGKATAN & REGU JIKA SISWA */}
                            {item.role === 'siswa' && siswa && (
                              <div className="flex items-center gap-1.5 flex-wrap">
                                <span className={`px-2 py-0.5 rounded-md text-[10px] font-mono font-bold border ${
                                  (siswa.tingkatan || 'Penggalang Ramu') === 'Penggalang Terap'
                                    ? 'bg-purple-50 text-purple-800 border-purple-200'
                                    : (siswa.tingkatan || 'Penggalang Ramu') === 'Penggalang Rakit'
                                    ? 'bg-blue-50 text-blue-800 border-blue-200'
                                    : 'bg-emerald-50 text-emerald-800 border-emerald-200'
                                }`}>
                                  {siswa.tingkatan || 'Penggalang Ramu'}
                                </span>
                                
                                <span className={`px-2 py-0.5 rounded-md text-[10px] font-mono font-bold border ${
                                  reguName === 'Regu Wolf'
                                    ? 'bg-amber-50 text-amber-900 border-amber-200'
                                    : 'bg-rose-50 text-rose-900 border-rose-200'
                                }`}>
                                  {reguName}
                                </span>
                              </div>
                            )}
                          </div>
                          
                          <p className="text-[10px] font-mono text-gray-500 mt-1 truncate">
                            Email: {item.email} • Peran: <span className="font-bold text-[#5C3D2E] uppercase text-xs">{item.role}</span>
                            {item.role === 'siswa' && siswa && (
                              <span> • NIS: {siswa.nis || '-'} • Kelas: {siswa.kelas || '-'}</span>
                            )}
                          </p>
                        </div>
                      </div>
                      
                      {/* ACTION BUTTONS */}
                      <div className="flex items-center space-x-1 shrink-0">
                        {/* Tombol Ubah Tingkatan jika Siswa */}
                        {item.role === 'siswa' && siswa && (
                          <button
                            onClick={() => openEditModal(item, siswa)}
                            className="p-2 rounded-lg text-primary hover:bg-[#E6DFD3] transition-colors cursor-pointer"
                            title="Ubah Tingkatan Pramuka"
                          >
                            <Edit3 className="h-4 w-4" />
                          </button>
                        )}

                        {/* Prevent self deletion */}
                        {currentUserId !== item.id ? (
                          <button 
                            onClick={() => handleDeleteUser(item.id)}
                            disabled={isDeletePending}
                            className="p-2 rounded-lg text-gray-400 hover:text-red-600 hover:bg-red-50 transition-colors cursor-pointer"
                            title="Hapus Pengguna"
                          >
                            {isDeletePending ? (
                              <Loader2 className="h-4 w-4 animate-spin" />
                            ) : (
                              <Trash2 className="h-4 w-4" />
                            )}
                          </button>
                        ) : (
                          <span className="text-[9px] font-mono text-gray-400 uppercase px-2">[ Akun Anda ]</span>
                        )}
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>

        </div>
      ) : (
        <ManageKepengurusan 
          pembinaList={pembinaList} 
          siswaList={siswaList} 
          pengurusList={pengurusList} 
        />
      )}

      {/* MODAL UBAH TINGKATAN */}
      {selectedSiswaForEdit && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4 animate-fadeIn">
          <div className="bg-white border border-[#D1C9BC] rounded-3xl max-w-md w-full p-8 shadow-2xl space-y-6 text-left relative">
            
            {/* CLOSE BUTTON */}
            <button 
              onClick={() => setSelectedSiswaForEdit(null)}
              className="absolute top-6 right-6 p-2 text-gray-400 hover:text-primary rounded-xl hover:bg-[#FBF9F6] transition-colors cursor-pointer"
            >
              <X className="h-5 w-5" />
            </button>

            <div>
              <span className="text-[10px] font-mono text-[#5C3D2E] uppercase font-bold tracking-wider">[ PENGATURAN TINGKATAN ANGGOTA ]</span>
              <h3 className="font-serif font-bold text-2xl text-primary mt-1">Ubah Tingkatan Anggota</h3>
              <p className="text-xs text-gray-500 mt-1 font-mono">
                {selectedSiswaForEdit.nama} • Kelas {selectedSiswaForEdit.kelas} (NIS: {selectedSiswaForEdit.nis})
              </p>
            </div>

            {updateError && (
              <div className="p-3 bg-red-50 border border-red-200 text-red-700 text-xs rounded-xl">
                {updateError}
              </div>
            )}

            {updateSuccess && (
              <div className="p-3 bg-green-50 border border-green-200 text-green-700 text-xs rounded-xl flex items-center space-x-2">
                <CheckCircle2 className="h-4 w-4 shrink-0" />
                <span>{updateSuccess}</span>
              </div>
            )}

            <form onSubmit={handleSaveTingkatan} className="space-y-4">
              
              {/* SELECT TINGKATAN */}
              <div className="space-y-2">
                <label htmlFor="edit_tingkatan" className="text-[10px] font-mono text-[#5C3D2E] uppercase font-bold">
                  Pilih Tingkatan Baru
                </label>
                <select
                  id="edit_tingkatan"
                  value={editTingkatan}
                  onChange={(e) => setEditTingkatan(e.target.value)}
                  disabled={isUpdatePending}
                  className="w-full px-4 py-3 bg-[#FBF9F6] border border-[#D1C9BC] rounded-xl text-sm font-bold text-primary focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                >
                  <option value="Penggalang Ramu">Penggalang Ramu (Tingkat 1)</option>
                  <option value="Penggalang Rakit">Penggalang Rakit (Tingkat 2)</option>
                  <option value="Penggalang Terap">Penggalang Terap (Tingkat 3)</option>
                </select>
              </div>

              {/* SELECT REGU (OTOMATIS SESUAI GENDER ATAU BISA DIPASTIKAN) */}
              <div className="space-y-2">
                <label htmlFor="edit_regu" className="text-[10px] font-mono text-[#5C3D2E] uppercase font-bold">
                  Regu Keanggotaan
                </label>
                <select
                  id="edit_regu"
                  value={editRegu}
                  onChange={(e) => setEditRegu(e.target.value)}
                  disabled={isUpdatePending}
                  className="w-full px-4 py-3 bg-[#FBF9F6] border border-[#D1C9BC] rounded-xl text-sm font-bold text-primary focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                >
                  <option value="Regu Wolf">Regu Wolf (Khusus Putra)</option>
                  <option value="Regu Valerian">Regu Valerian (Khusus Putri)</option>
                </select>
                <p className="text-[10px] text-gray-500 font-mono">
                  Siswa ini berjenis kelamin: <span className="font-bold text-[#5C3D2E]">{selectedSiswaForEdit.jenisKelamin}</span>
                </p>
              </div>

              {/* ACTION BUTTONS */}
              <div className="flex items-center space-x-3 pt-2">
                <button
                  type="button"
                  onClick={() => setSelectedSiswaForEdit(null)}
                  disabled={isUpdatePending}
                  className="w-1/2 py-3 bg-gray-100 text-gray-700 font-mono font-bold uppercase tracking-wider text-xs rounded-xl hover:bg-gray-200 transition-all cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={isUpdatePending}
                  className="w-1/2 py-3 bg-primary text-[#E7E2D8] font-mono font-bold uppercase tracking-wider text-xs rounded-xl shadow-md hover:bg-opacity-95 transition-all flex justify-center items-center cursor-pointer"
                >
                  {isUpdatePending ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" /> Menyimpan...
                    </>
                  ) : (
                    'Simpan Tingkatan'
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

