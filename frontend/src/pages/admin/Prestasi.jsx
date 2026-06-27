import React, { useState, useEffect } from 'react';
import { api } from '../../services/api';
import { useToast } from '../../context/ToastContext';
import { Plus, Edit, Trash2, Search, X, Award, Calendar } from 'lucide-react';
import SkeletonLoader from '../../components/common/SkeletonLoader';
import EmptyState from '../../components/common/EmptyState';
import ConfirmDialog from '../../components/common/ConfirmDialog';
import { motion, AnimatePresence } from 'framer-motion';

const Prestasi = () => {
  const toast = useToast();
  const [prestasi, setPrestasi] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  // Modals state
  const [modalOpen, setModalOpen] = useState(false);
  const [modalType, setModalType] = useState('add');
  const [selectedPrestasi, setSelectedPrestasi] = useState(null);

  // Form fields
  const [formData, setFormData] = useState({ judul: '', deskripsi: '', tanggal: '' });
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState('');
  const [formLoading, setFormLoading] = useState(false);

  // Deletion checks
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [presIdToDelete, setPresIdToDelete] = useState(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  const fetchPrestasi = async () => {
    setLoading(true);
    try {
      const res = await api.prestasi.getAll();
      setPrestasi(res.data);
    } catch (err) {
      console.error(err);
      toast.error('Gagal mengambil daftar prestasi.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPrestasi();
  }, []);

  const handleOpenAdd = () => {
    setFormData({ judul: '', deskripsi: '', tanggal: new Date().toISOString().split('T')[0] });
    setImageFile(null);
    setImagePreview('');
    setModalType('add');
    setModalOpen(true);
  };

  const handleOpenEdit = (p) => {
    setSelectedPrestasi(p);
    setFormData({ judul: p.judul, deskripsi: p.deskripsi, tanggal: p.tanggal });
    setImageFile(null);
    setImagePreview(p.gambar || '');
    setModalType('edit');
    setModalOpen(true);
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImageFile(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const handleDeleteClick = (id) => {
    setPresIdToDelete(id);
    setDeleteOpen(true);
  };

  const handleDeleteConfirm = async () => {
    setDeleteLoading(true);
    try {
      await api.prestasi.delete(presIdToDelete);
      toast.success('Prestasi berhasil dihapus.');
      fetchPrestasi();
    } catch (err) {
      toast.error('Gagal menghapus prestasi.');
    } finally {
      setDeleteLoading(false);
      setDeleteOpen(false);
      setPresIdToDelete(null);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.judul || !formData.tanggal || !formData.deskripsi) {
      toast.warning('Judul, tanggal, dan deskripsi prestasi wajib diisi!');
      return;
    }

    setFormLoading(true);
    try {
      const data = new FormData();
      data.append('nama_prestasi', formData.judul);
      data.append('tanggal', formData.tanggal);
      data.append('deskripsi', formData.deskripsi);
      if (imageFile) {
        data.append('gambar', imageFile);
      }

      if (modalType === 'add') {
        await api.prestasi.create(data);
        toast.success('Catatan prestasi baru berhasil disimpan.');
      } else {
        await api.prestasi.update(selectedPrestasi.id, data);
        toast.success('Catatan prestasi berhasil diperbarui.');
      }
      setModalOpen(false);
      fetchPrestasi();
    } catch (err) {
      toast.error('Gagal menyimpan prestasi.');
    } finally {
      setFormLoading(false);
    }
  };

  const filteredPrestasi = prestasi.filter((p) =>
    p.judul.toLowerCase().includes(search.toLowerCase()) ||
    p.deskripsi.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      
      {/* Header Panel */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-800 tracking-tight flex items-center">
            <Award className="h-6 w-6 text-primary mr-2" />
            Manajemen Prestasi
          </h1>
          <p className="text-xs text-slate-500 mt-1">Mengelola daftar rekapitulasi piala kejuaraan dan penghargaan regu pangkalan.</p>
        </div>
        <button
          onClick={handleOpenAdd}
          className="inline-flex items-center justify-center px-4 py-2.5 text-sm font-semibold text-white bg-primary rounded-xl hover:bg-primary-700 transition-colors shadow-sm min-h-[44px]"
        >
          <Plus className="h-4 w-4 mr-2" /> Tambah Prestasi
        </button>
      </div>

      {/* Control panel */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-soft flex items-center">
        <div className="relative w-full sm:w-80">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
          <input
            type="text"
            placeholder="Cari judul atau keterangan prestasi..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-11 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm placeholder-slate-400 focus:outline-none focus:border-primary focus:bg-white transition-all min-h-[44px]"
          />
        </div>
      </div>

      {/* Table view */}
      {loading ? (
        <SkeletonLoader type="table" rows={4} />
      ) : filteredPrestasi.length === 0 ? (
        <EmptyState
          title="Prestasi Tidak Ditemukan"
          description={search ? `Pencarian "${search}" tidak menemukan kecocokan.` : 'Belum ada prestasi dicatat.'}
          actionLabel="Tambah Catatan Prestasi"
          onAction={handleOpenAdd}
        />
      ) : (
        <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-soft">
          <div className="overflow-x-auto">
            <table className="w-full border-collapse text-left text-sm whitespace-nowrap">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 font-semibold">
                  <th className="px-6 py-4">Foto</th>
                  <th className="px-6 py-4">Judul Penghargaan</th>
                  <th className="px-6 py-4">Keterangan</th>
                  <th className="px-6 py-4">Tanggal Diraih</th>
                  <th className="px-6 py-4 text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {filteredPrestasi.map((p) => (
                  <tr key={p.id} className="hover:bg-slate-50/50">
                    <td className="px-6 py-4">
                      <div className="h-10 w-16 rounded-lg overflow-hidden border border-slate-100 bg-slate-50">
                        {p.gambar ? (
                          <img src={p.gambar} alt="Award" className="h-full w-full object-cover" />
                        ) : (
                          <div className="h-full w-full flex items-center justify-center text-amber-500 bg-amber-50">
                            <Award className="h-4 w-4" />
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 font-bold text-slate-900">{p.judul}</td>
                    <td className="px-6 py-4 max-w-xs truncate">{p.deskripsi}</td>
                    <td className="px-6 py-4 text-xs text-slate-400">{p.tanggal}</td>
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

      {/* CRUD Modal */}
      <AnimatePresence>
        {modalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-0 sm:p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.2 }}
              className="w-full h-full sm:h-auto sm:max-w-md bg-white sm:rounded-2xl shadow-xl flex flex-col justify-between overflow-hidden"
            >
              
              {/* Header */}
              <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50">
                <h3 className="font-bold text-slate-800">
                  {modalType === 'add' ? 'Tambah Catatan Prestasi' : 'Edit Catatan Prestasi'}
                </h3>
                <button onClick={() => setModalOpen(false)} className="p-2 hover:bg-slate-100 rounded-full text-slate-400 hover:text-slate-600 min-h-[44px] min-w-[44px] flex items-center justify-center">
                  <X className="h-5 w-5" />
                </button>
              </div>

              {/* Body */}
              <div className="p-6 overflow-y-auto flex-1 text-sm space-y-4 max-h-[70vh]">
                <form id="prestasiForm" onSubmit={handleSubmit} className="space-y-4">
                  <div className="space-y-1">
                    <label htmlFor="judul" className="text-xs font-semibold text-slate-700">Nama Kejuaraan / Penghargaan</label>
                    <input
                      type="text"
                      id="judul"
                      value={formData.judul}
                      onChange={(e) => setFormData(prev => ({ ...prev, judul: e.target.value }))}
                      placeholder="Juara 1 Pionering Kabupaten Bandung"
                      className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-primary min-h-[44px]"
                      required
                    />
                  </div>
                  <div className="space-y-1">
                    <label htmlFor="tgl" className="text-xs font-semibold text-slate-700">Tanggal Diraih</label>
                    <input
                      type="date"
                      id="tgl"
                      value={formData.tanggal}
                      onChange={(e) => setFormData(prev => ({ ...prev, tanggal: e.target.value }))}
                      className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-primary min-h-[44px]"
                      required
                    />
                  </div>

                  {/* Prestasi File Upload Selector */}
                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-slate-700 block">Foto Dokumentasi Prestasi / Piala</label>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageChange}
                      className="text-xs block w-full text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-primary-50 file:text-primary file:hover:bg-primary-100 file:cursor-pointer"
                    />
                    {imagePreview && (
                      <div className="mt-2 rounded-xl overflow-hidden border border-slate-200 max-h-36">
                        <img src={imagePreview} alt="Preview" className="w-full h-full object-cover" />
                      </div>
                    )}
                  </div>

                  <div className="space-y-1">
                    <label htmlFor="desc" className="text-xs font-semibold text-slate-700">Deskripsi / Keterangan Pencapaian</label>
                    <textarea
                      id="desc"
                      value={formData.deskripsi}
                      onChange={(e) => setFormData(prev => ({ ...prev, deskripsi: e.target.value }))}
                      placeholder="Piala bergilir diraih oleh Regu Singa atas pencapaian poin tertinggi..."
                      rows="4"
                      className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-primary"
                      required
                    ></textarea>
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
                  form="prestasiForm"
                  disabled={formLoading}
                  className="px-5 py-2.5 text-sm font-bold text-white bg-primary rounded-lg hover:bg-primary-700 min-h-[44px]"
                >
                  {formLoading ? 'Memproses...' : 'Simpan'}
                </button>
              </div>

            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Delete Dialog */}
      <ConfirmDialog
        isOpen={deleteOpen}
        title="Hapus Catatan Prestasi"
        message="Apakah Anda yakin ingin menghapus catatan prestasi ini? Data tidak akan dipublikasikan."
        onConfirm={handleDeleteConfirm}
        onCancel={() => setDeleteOpen(false)}
        isLoading={deleteLoading}
      />

    </div>
  );
};

export default Prestasi;
