'use client';

import React, { useState, useTransition } from 'react';
import { Shield, GraduationCap, Award, Trash2, Users, FolderKanban, Loader2 } from 'lucide-react';
import RegisterUserForm from './user-form';
import ManageKepengurusan from './manage-kepengurusan';
import { deleteUserAction } from '@/app/actions/users';

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
            <h3 className="font-serif font-bold text-xl text-primary border-b border-[#D1C9BC]/45 pb-3">
              Daftar Anggota Terdaftar
            </h3>

            <div className="divide-y divide-[#D1C9BC]/35">
              {!usersList || usersList.length === 0 ? (
                <div className="text-center py-12 text-gray-400">Belum ada anggota terdaftar di database.</div>
              ) : (
                usersList.map((item: any, idx: number) => (
                  <div key={item.id || idx} className="py-4 flex justify-between items-center first:pt-0 last:pb-0">
                    <div className="flex items-center space-x-4 min-w-0">
                      <div className="p-3 bg-[#E6DFD3] text-primary rounded-xl shrink-0">
                        {item.role === 'admin' ? (
                          <Shield className="h-5 w-5" />
                        ) : item.role === 'pembina' ? (
                          <Award className="h-5 w-5" />
                        ) : (
                          <GraduationCap className="h-5 w-5" />
                        )}
                      </div>
                      <div className="text-left min-w-0">
                        <h4 className="font-serif font-bold text-sm text-primary truncate">{item.nama}</h4>
                        <p className="text-[10px] font-mono text-gray-500 mt-1 truncate">
                          Email: {item.email} • Peran: <span className="font-bold text-[#5C3D2E] uppercase text-xs">{item.role}</span>
                        </p>
                      </div>
                    </div>
                    
                    {/* Prevent self deletion */}
                    {currentUserId !== item.id ? (
                      <button 
                        onClick={() => handleDeleteUser(item.id)}
                        disabled={isDeletePending}
                        className="p-2 rounded-lg text-gray-400 hover:text-red-600 hover:bg-red-50 transition-colors cursor-pointer shrink-0"
                        title="Hapus Pengguna"
                      >
                        {isDeletePending ? (
                          <Loader2 className="h-5 w-5 animate-spin" />
                        ) : (
                          <Trash2 className="h-5 w-5" />
                        )}
                      </button>
                    ) : (
                      <span className="text-[9px] font-mono text-gray-400 uppercase shrink-0">[ Akun Anda ]</span>
                    )}
                  </div>
                ))
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
    </div>
  );
}
