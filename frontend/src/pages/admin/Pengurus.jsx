import React, { useState, useEffect } from 'react';
import { api } from '../../services/api';
import { useToast } from '../../context/ToastContext';
import { Plus, Edit, Trash2, Search, X, Users2 } from 'lucide-react';
import SkeletonLoader from '../../components/common/SkeletonLoader';
import EmptyState from '../../components/common/EmptyState';
import ConfirmDialog from '../../components/common/ConfirmDialog';

const Pengurus = () => {
  const toast = useToast();
  const [pengurus, setPengurus] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  // Modals state
  const [modalOpen, setModalOpen] = useState(false);
  const [modalType, setModalType] = useState('add');
  const [selectedPengurus, setSelectedPengurus] = useState(null);

  // Form fields
  const [formData, setFormData] = useState({ nama: '', jabatan: '', kelas: '' });
  const [formLoading, setFormLoading] = useState(false);

  // Deletion checks
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [pengurusIdToDelete, setPengurusIdToDelete] = useState(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  const fetchPengurus = async () => {
    setLoading(true);
    try {
      const res = await api.pengurus.getAll();
      setPengurus(res.data);
    } catch (err) {
      console.error(err);
      toast.error('Gagal mengambil data pengurus gudep.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPengurus();
  }, []);

  const handleOpenAdd = () => {
    setFormData({ nama: '', jabatan: '', kelas: '' });
    setModalType('add');
    setModalOpen(true);
  };

  const handleOpenEdit = (p) => {
    setSelectedPengurus(p);
    setFormData({ nama: p.nama, jabatan: p.jabatan, kelas: p.kelas || '' });
    setModalType('edit');
    setModalOpen(true);
  };

  const handleDeleteClick = (id) => {
    setPengurusIdToDelete(id);
    setDeleteOpen(true);
  };

  const handleDeleteConfirm = async () => {
    setDeleteLoading(true);
    try {
      await api.pengurus.delete(pengurusIdToDelete);
      toast.success('Pengurus gudep berhasil dihapus.');
      fetchPengurus();
    } catch (err) {
      toast.error('Gagal menghapus pengurus.');
    } finally {
      setDeleteLoading(false);
      setDeleteOpen(false);
      setPengurusIdToDelete(null);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.nama || !formData.jabatan) {
      toast.warning('Nama dan Jabatan wajib diisi!');
      return;
    }

    setFormLoading(true);
    try {
      if (modalType === 'add') {
        await api.pengurus.create(formData);
        toast.success('Pengurus baru berhasil didaftarkan.');
      } else {
        await api.pengurus.update(selectedPengurus.id, formData);
        toast.success('Data pengurus berhasil diperbarui.');
      }
      setModalOpen(false);
      fetchPengurus();
    } catch (err) {
      toast.error('Gagal menyimpan pengurus.');
    } finally {
      setFormLoading(false);
    }
  };

  const filteredPengurus = pengurus.filter((p) =>
    p.nama.toLowerCase().includes(search.toLowerCase()) ||
    p.jabatan.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      
      {/* Header Panel */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-800 tracking-tight flex items-center">
            <Users2 className="h-6 w-6 text-primary mr-2" />
            Pengurus Dewan Penggalang
          </h1>
          <p className="text-xs text-slate-500 mt-1">Mengelola daftar struktur Dewan Kerja Penggalang (DKP) dan pemimpin regu.</p>
        </div>
        <button
          onClick={handleOpenAdd}
          className="inline-flex items-center justify-center px-4 py-2.5 text-sm font-semibold text-white bg-primary rounded-xl hover:bg-primary-700 transition-colors shadow-sm min-h-[44px]"
        >
          <Plus className="h-4 w-4 mr-2" /> Tambah Pengurus
        </button>
      </div>

      {/* Control panel */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-soft flex items-center">
        <div className="relative w-full sm:w-80">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
          <input
            type="text"
            placeholder="Cari nama atau jabatan pengurus..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-11 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm placeholder-slate-400 focus:outline-none focus:border-primary focus:bg-white transition-all min-h-[44px]"
          />
        </div>
      </div>

      {/* Table view */}
      {loading ? (
        <SkeletonLoader type="table" rows={4} />
      ) : filteredPengurus.length === 0 ? (
        <EmptyState
          title="Pengurus Tidak Ditemukan"
          description={search ? `Pencarian "${search}" tidak menemukan kecocokan.` : 'Belum ada pengurus DKP terdaftar.'}
          actionLabel="Daftarkan Pengurus Pertama"
          onAction={handleOpenAdd}
        />
      ) : (
        <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-soft">
          <div className="overflow-x-auto">
            <table className="w-full border-collapse text-left text-sm whitespace-nowrap">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 font-semibold">
                  <th className="px-6 py-4">Nama Lengkap</th>
                  <th className="px-6 py-4">Jabatan Pengurus</th>
                  <th className="px-6 py-4">Kelas</th>
                  <th className="px-6 py-4 text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {filteredPengurus.map((p) => (
                  <tr key={p.id} className="hover:bg-slate-50/50">
                    <td className="px-6 py-4 font-bold text-slate-900">{p.nama}</td>
                    <td className="px-6 py-4 font-medium text-slate-600">{p.jabatan}</td>
                    <td className="px-6 py-4">{p.kelas || '-'}</td>
                    <td className="px-6 py-4 text-right space-x-2">
                      <button
                        onClick={() => handleOpenEdit(p)}
                        className="inline-flex items-center justify-center p-2 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 min-h-[44px] min-w-[44px]"
                        title="Edit"
                      >
                        <Edit className="h-5 w-5" />
                      </button>
                      <button
                        onClick={() => handleDeleteClick(p.id)}
                        className="inline-flex items-center justify-center p-2 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 min-h-[44px] min-w-[44px]"
                        title="Hapus"
                      >
                        <Trash2 className="h-5 w-5" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* CRUD Form Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-0 sm:p-4">
          <div className="w-full h-full sm:h-auto sm:max-w-md bg-white sm:rounded-2xl shadow-xl flex flex-col justify-between overflow-hidden animate-in fade-in duration-200">
            
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50">
              <h3 className="font-bold text-slate-800">
                {modalType === 'add' ? 'Registrasi Pengurus Baru' : 'Edit Jabatan Pengurus'}
              </h3>
              <button onClick={() => setModalOpen(false)} className="p-2 hover:bg-slate-100 rounded-full text-slate-400 hover:text-slate-600 min-h-[44px] min-w-[44px]">
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Body */}
            <div className="p-6 overflow-y-auto flex-1 text-sm space-y-4">
              <form id="pengurusForm" onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-1">
                  <label htmlFor="nama" className="text-xs font-semibold text-slate-700">Nama Lengkap</label>
                  <input
                    type="text"
                    id="nama"
                    value={formData.nama}
                    onChange={(e) => setFormData(prev => ({ ...prev, nama: e.target.value }))}
                    placeholder="Rian Hidayat"
                    className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-primary min-h-[44px]"
                    required
                  />
                </div>
                <div className="space-y-1">
                  <label htmlFor="jab" className="text-xs font-semibold text-slate-700">Jabatan Pengurus</label>
                  <input
                    type="text"
                    id="jab"
                    value={formData.jabatan}
                    onChange={(e) => setFormData(prev => ({ ...prev, jabatan: e.target.value }))}
                    placeholder="Pratama Regu Singa / DKP"
                    className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-primary min-h-[44px]"
                    required
                  />
                </div>
                <div className="space-y-1">
                  <label htmlFor="kelas" className="text-xs font-semibold text-slate-700">Kelas</label>
                  <input
                    type="text"
                    id="kelas"
                    value={formData.kelas}
                    onChange={(e) => setFormData(prev => ({ ...prev, kelas: e.target.value }))}
                    placeholder="IX-B"
                    className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-primary min-h-[44px]"
                  />
                </div>
              </form>
            </div>

            {/* Footer */}
            <div className="flex px-6 py-4 border-t border-slate-100 bg-slate-50 justify-end space-x-3">
              <button
                type="button"
                onClick={() => setModalOpen(false)}
                className="px-5 py-2.5 text-sm font-semibold text-slate-600 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 min-h-[44px]"
              >
                Tutup
              </button>
              <button
                type="submit"
                form="pengurusForm"
                disabled={formLoading}
                className="px-5 py-2.5 text-sm font-bold text-white bg-primary rounded-lg hover:bg-primary-700 min-h-[44px]"
              >
                {formLoading ? 'Memproses...' : 'Simpan'}
              </button>
            </div>

          </div>
        </div>
      )}

      {/* Delete Dialog */}
      <ConfirmDialog
        isOpen={deleteOpen}
        title="Hapus Jabatan Pengurus"
        message="Apakah Anda yakin ingin menghapus data pengurus DKP ini? Tindakan ini menghapusnya dari kepengurusan pangkalan."
        onConfirm={handleDeleteConfirm}
        onCancel={() => setDeleteOpen(false)}
        isLoading={deleteLoading}
      />

    </div>
  );
};

export default Pengurus;
