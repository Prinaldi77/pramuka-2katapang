import React, { useState, useEffect } from 'react';
import { api } from '../../services/api';
import { useToast } from '../../context/ToastContext';
import { Plus, Edit, Trash2, Search, X, FileText, Image as ImageIcon } from 'lucide-react';
import SkeletonLoader from '../../components/common/SkeletonLoader';
import EmptyState from '../../components/common/EmptyState';
import ConfirmDialog from '../../components/common/ConfirmDialog';
import { motion, AnimatePresence } from 'framer-motion';

const Berita = () => {
  const toast = useToast();
  const [berita, setBerita] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  // Modals state
  const [modalOpen, setModalOpen] = useState(false);
  const [modalType, setModalType] = useState('add');
  const [selectedBerita, setSelectedBerita] = useState(null);

  // Form fields
  const [formData, setFormData] = useState({ judul: '', isi: '', gambar: '' });
  const [formLoading, setFormLoading] = useState(false);

  // Deletion checks
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [beritaIdToDelete, setBeritaIdToDelete] = useState(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  const fetchBerita = async () => {
    setLoading(true);
    try {
      const res = await api.berita.getAll();
      setBerita(res.data);
    } catch (err) {
      console.error(err);
      toast.error('Gagal memuat daftar berita.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBerita();
  }, []);

  const handleOpenAdd = () => {
    setFormData({ judul: '', isi: '', gambar: '' });
    setModalType('add');
    setModalOpen(true);
  };

  const handleOpenEdit = (b) => {
    setSelectedBerita(b);
    setFormData({ judul: b.judul, isi: b.isi, gambar: b.gambar || '' });
    setModalType('edit');
    setModalOpen(true);
  };

  const handleDeleteClick = (id) => {
    setBeritaIdToDelete(id);
    setDeleteOpen(true);
  };

  const handleDeleteConfirm = async () => {
    setDeleteLoading(true);
    try {
      await api.berita.delete(beritaIdToDelete);
      toast.success('Berita berhasil dihapus.');
      fetchBerita();
    } catch (err) {
      toast.error('Gagal menghapus berita.');
    } finally {
      setDeleteLoading(false);
      setDeleteOpen(false);
      setBeritaIdToDelete(null);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.judul || !formData.isi) {
      toast.warning('Judul dan Isi Berita wajib diisi!');
      return;
    }

    setFormLoading(true);
    try {
      // In a real API, this can be FormData if uploading file.
      // But to be fully flexible, we support sending the payload directly as JSON.
      // If we need true FormData, we can map it. We implemented both in api.js!
      const payload = new FormData();
      payload.append('judul', formData.judul);
      payload.append('isi', formData.isi);
      if (formData.gambar) payload.append('gambar', formData.gambar);

      if (modalType === 'add') {
        // We pass the raw object or FormData depending on backend configuration.
        // We configure it to accept standard object if offline, which api.js handles beautifully.
        await api.berita.create(formData);
        toast.success('Berita baru berhasil dirilis.');
      } else {
        await api.berita.update(selectedBerita.id, formData);
        toast.success('Berita berhasil diperbarui.');
      }
      setModalOpen(false);
      fetchBerita();
    } catch (err) {
      toast.error('Gagal menyimpan berita.');
    } finally {
      setFormLoading(false);
    }
  };

  const filteredBerita = berita.filter((b) =>
    b.judul.toLowerCase().includes(search.toLowerCase()) ||
    b.isi.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      
      {/* Header Panel */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-800 tracking-tight flex items-center">
            <FileText className="h-6 w-6 text-primary mr-2" />
            Manajemen Berita
          </h1>
          <p className="text-xs text-slate-500 mt-1">Mengelola rilis berita, pengumuman, dan artikel kepramukaan pangkalan.</p>
        </div>
        <button
          onClick={handleOpenAdd}
          className="inline-flex items-center justify-center px-4 py-2.5 text-sm font-semibold text-white bg-primary rounded-xl hover:bg-primary-700 transition-colors shadow-sm min-h-[44px]"
        >
          <Plus className="h-4 w-4 mr-2" /> Buat Berita
        </button>
      </div>

      {/* Control panel */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-soft flex items-center">
        <div className="relative w-full sm:w-80">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
          <input
            type="text"
            placeholder="Cari judul atau isi berita..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-11 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm placeholder-slate-400 focus:outline-none focus:border-primary focus:bg-white transition-all min-h-[44px]"
          />
        </div>
      </div>

      {/* List Grid */}
      {loading ? (
        <SkeletonLoader type="card" rows={3} />
      ) : filteredBerita.length === 0 ? (
        <EmptyState
          title="Berita Tidak Ditemukan"
          description={search ? `Pencarian "${search}" tidak menemukan kecocokan.` : 'Belum ada berita yang diterbitkan.'}
          actionLabel="Rilis Berita Pertama"
          onAction={handleOpenAdd}
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {filteredBerita.map((b) => (
            <div key={b.id} className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-soft flex flex-col justify-between hover:border-primary/35 transition-colors">
              <div className="aspect-video w-full overflow-hidden bg-slate-100 border-b border-slate-100 relative">
                <img src={b.gambar} alt={b.judul} className="w-full h-full object-cover" />
              </div>
              
              <div className="p-5 flex-1 flex flex-col justify-between">
                <div>
                  <span className="text-[10px] text-slate-400 font-semibold">{b.tanggal}</span>
                  <h3 className="font-bold text-slate-800 text-sm mt-1 line-clamp-2">{b.judul}</h3>
                  <p className="text-slate-500 text-xs mt-2 line-clamp-3 leading-relaxed">{b.isi}</p>
                </div>

                <div className="flex space-x-2 pt-5 mt-4 border-t border-slate-100 justify-end">
                  <button
                    onClick={() => handleOpenEdit(b)}
                    className="flex-1 inline-flex items-center justify-center px-3 py-2 text-xs font-semibold text-slate-600 bg-slate-50 border border-slate-200 rounded-lg hover:bg-slate-100 min-h-[44px]"
                  >
                    <Edit className="h-4 w-4 mr-1.5" /> Edit
                  </button>
                  <button
                    onClick={() => handleDeleteClick(b.id)}
                    className="flex-1 inline-flex items-center justify-center px-3 py-2 text-xs font-semibold text-white bg-red-600 rounded-lg hover:bg-red-700 min-h-[44px]"
                  >
                    <Trash2 className="h-4 w-4 mr-1.5" /> Hapus
                  </button>
                </div>
              </div>
            </div>
          ))}
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
              className="w-full h-full sm:h-auto sm:max-w-2xl bg-white sm:rounded-2xl shadow-xl flex flex-col justify-between overflow-hidden"
            >
              
              {/* Header */}
              <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50">
                <h3 className="font-bold text-slate-800">
                  {modalType === 'add' ? 'Tulis Berita Baru' : 'Edit Artikel Berita'}
                </h3>
                <button onClick={() => setModalOpen(false)} className="p-2 hover:bg-slate-100 rounded-full text-slate-400 hover:text-slate-600 min-h-[44px] min-w-[44px]">
                  <X className="h-5 w-5" />
                </button>
              </div>

              {/* Body */}
              <div className="p-6 overflow-y-auto flex-1 text-sm space-y-4">
                <form id="beritaForm" onSubmit={handleSubmit} className="space-y-4">
                  <div className="space-y-1">
                    <label htmlFor="judul" className="text-xs font-semibold text-slate-700">Judul Berita</label>
                    <input
                      type="text"
                      id="judul"
                      value={formData.judul}
                      onChange={(e) => setFormData(prev => ({ ...prev, judul: e.target.value }))}
                      placeholder="Masukkan judul berita utama"
                      className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-primary min-h-[44px]"
                      required
                    />
                  </div>
                  <div className="space-y-1">
                    <label htmlFor="gambar" className="text-xs font-semibold text-slate-700">Tautan Gambar Sampul (Preview)</label>
                    <input
                      type="text"
                      id="gambar"
                      value={formData.gambar}
                      onChange={(e) => setFormData(prev => ({ ...prev, gambar: e.target.value }))}
                      placeholder="https://images.unsplash.com/photo-..."
                      className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-primary min-h-[44px]"
                    />
                    {formData.gambar && (
                      <div className="mt-2 rounded-xl overflow-hidden border border-slate-200 max-h-40">
                        <img src={formData.gambar} alt="Preview" className="w-full h-full object-cover" />
                      </div>
                    )}
                  </div>
                  <div className="space-y-1">
                    <label htmlFor="isi" className="text-xs font-semibold text-slate-700">Isi Konten Artikel</label>
                    <textarea
                      id="isi"
                      value={formData.isi}
                      onChange={(e) => setFormData(prev => ({ ...prev, isi: e.target.value }))}
                      placeholder="Tuliskan detail berita lengkap di sini..."
                      rows="6"
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
                  form="beritaForm"
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
        title="Hapus Rilis Berita"
        message="Apakah Anda yakin ingin menghapus artikel berita ini? Artikel tidak akan muncul lagi di halaman publik."
        onConfirm={handleDeleteConfirm}
        onCancel={() => setDeleteOpen(false)}
        isLoading={deleteLoading}
      />

    </div>
  );
};

export default Berita;
