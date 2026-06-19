import React, { useState, useEffect } from 'react';
import { api } from '../../services/api';
import { useToast } from '../../context/ToastContext';
import { Plus, Trash2, X, Image as ImageIcon, ZoomIn } from 'lucide-react';
import SkeletonLoader from '../../components/common/SkeletonLoader';
import EmptyState from '../../components/common/EmptyState';
import ConfirmDialog from '../../components/common/ConfirmDialog';

const Galeri = () => {
  const toast = useToast();
  const [galeri, setGaleri] = useState([]);
  const [loading, setLoading] = useState(true);

  // Modals state
  const [modalOpen, setModalOpen] = useState(false);
  const [formData, setFormData] = useState({ judul: '', deskripsi: '', gambar: '' });
  const [formLoading, setFormLoading] = useState(false);

  // Deletion checks
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [photoIdToDelete, setPhotoIdToDelete] = useState(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  const fetchGaleri = async () => {
    setLoading(true);
    try {
      const res = await api.galeri.getAll();
      setGaleri(res.data);
    } catch (err) {
      console.error(err);
      toast.error('Gagal memuat galeri foto.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchGaleri();
  }, []);

  const handleOpenAdd = () => {
    setFormData({ judul: '', deskripsi: '', gambar: '' });
    setModalOpen(true);
  };

  const handleDeleteClick = (id) => {
    setPhotoIdToDelete(id);
    setDeleteOpen(true);
  };

  const handleDeleteConfirm = async () => {
    setDeleteLoading(true);
    try {
      await api.galeri.delete(photoIdToDelete);
      toast.success('Foto dokumentasi berhasil dihapus.');
      fetchGaleri();
    } catch (err) {
      toast.error('Gagal menghapus foto.');
    } finally {
      setDeleteLoading(false);
      setDeleteOpen(false);
      setPhotoIdToDelete(null);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.judul || !formData.gambar) {
      toast.warning('Judul foto dan tautan gambar wajib diisi!');
      return;
    }

    setFormLoading(true);
    try {
      await api.galeri.create(formData);
      toast.success('Foto baru berhasil diunggah.');
      setModalOpen(false);
      fetchGaleri();
    } catch (err) {
      toast.error('Gagal menyimpan foto.');
    } finally {
      setFormLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Header Panel */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-800 tracking-tight flex items-center">
            <ImageIcon className="h-6 w-6 text-primary mr-2" />
            Galeri Dokumentasi
          </h1>
          <p className="text-xs text-slate-500 mt-1">Mengunggah dan mengelola berkas dokumentasi foto latihan kepramukaan.</p>
        </div>
        <button
          onClick={handleOpenAdd}
          className="inline-flex items-center justify-center px-4 py-2.5 text-sm font-semibold text-white bg-primary rounded-xl hover:bg-primary-700 transition-colors shadow-sm min-h-[44px]"
        >
          <Plus className="h-4 w-4 mr-2" /> Tambah Foto
        </button>
      </div>

      {/* Grid view */}
      {loading ? (
        <SkeletonLoader type="card" rows={4} />
      ) : galeri.length === 0 ? (
        <EmptyState
          title="Galeri Kosong"
          description="Belum ada berkas dokumentasi foto yang diunggah."
          actionLabel="Unggah Foto Pertama"
          onAction={handleOpenAdd}
        />
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          {galeri.map((item) => (
            <div key={item.id} className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-soft flex flex-col justify-between hover:border-primary/40 transition-colors group relative">
              <div className="aspect-square w-full overflow-hidden bg-slate-100 relative">
                <img src={item.gambar} alt={item.judul} className="w-full h-full object-cover" />
                <button
                  onClick={() => handleDeleteClick(item.id)}
                  className="absolute top-2 right-2 p-2 bg-red-600/90 text-white rounded-xl hover:bg-red-700 transition-colors shadow-md z-20 min-h-[44px] min-w-[44px] flex items-center justify-center opacity-0 group-hover:opacity-100 duration-200"
                  title="Hapus Foto"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
              
              <div className="p-4 bg-slate-50 border-t border-slate-100">
                <h4 className="font-bold text-slate-800 text-xs truncate">{item.judul}</h4>
                <p className="text-[10px] text-slate-400 truncate mt-0.5">{item.deskripsi || 'Tidak ada keterangan.'}</p>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Upload Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-0 sm:p-4">
          <div className="w-full h-full sm:h-auto sm:max-w-md bg-white sm:rounded-2xl shadow-xl flex flex-col justify-between overflow-hidden animate-in fade-in duration-200">
            
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50">
              <h3 className="font-bold text-slate-800">Unggah Foto Galeri</h3>
              <button onClick={() => setModalOpen(false)} className="p-2 hover:bg-slate-100 rounded-full text-slate-400 hover:text-slate-600 min-h-[44px] min-w-[44px]">
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Body */}
            <div className="p-6 overflow-y-auto flex-1 text-sm space-y-4">
              <form id="galeriForm" onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-1">
                  <label htmlFor="judul" className="text-xs font-semibold text-slate-700">Judul Foto</label>
                  <input
                    type="text"
                    id="judul"
                    value={formData.judul}
                    onChange={(e) => setFormData(prev => ({ ...prev, judul: e.target.value }))}
                    placeholder="Makan Malam Bersama Perkemahan"
                    className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-primary min-h-[44px]"
                    required
                  />
                </div>
                <div className="space-y-1">
                  <label htmlFor="gambar" className="text-xs font-semibold text-slate-700">Tautan File Gambar (URL)</label>
                  <input
                    type="text"
                    id="gambar"
                    value={formData.gambar}
                    onChange={(e) => setFormData(prev => ({ ...prev, gambar: e.target.value }))}
                    placeholder="https://images.unsplash.com/photo-..."
                    className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-primary min-h-[44px]"
                    required
                  />
                  {formData.gambar && (
                    <div className="mt-2 rounded-xl overflow-hidden border border-slate-200 max-h-36">
                      <img src={formData.gambar} alt="Preview" className="w-full h-full object-cover" />
                    </div>
                  )}
                </div>
                <div className="space-y-1">
                  <label htmlFor="desc" className="text-xs font-semibold text-slate-700">Keterangan / Kategori</label>
                  <textarea
                    id="desc"
                    value={formData.deskripsi}
                    onChange={(e) => setFormData(prev => ({ ...prev, deskripsi: e.target.value }))}
                    placeholder="Kebersamaan penggalang saat santap malam di bumi perkemahan..."
                    rows="3"
                    className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-primary"
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
                form="galeriForm"
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
        title="Hapus Foto Dokumentasi"
        message="Apakah Anda yakin ingin menghapus foto ini dari galeri pangkalan?"
        onConfirm={handleDeleteConfirm}
        onCancel={() => setDeleteOpen(false)}
        isLoading={deleteLoading}
      />

    </div>
  );
};

export default Galeri;
