import React, { useState, useEffect } from 'react';
import { api } from '../../services/api';
import { useToast } from '../../context/ToastContext';
import { Plus, Edit, Trash2, Search, X, Calendar, MapPin } from 'lucide-react';
import SkeletonLoader from '../../components/common/SkeletonLoader';
import EmptyState from '../../components/common/EmptyState';
import ConfirmDialog from '../../components/common/ConfirmDialog';
import { motion, AnimatePresence } from 'framer-motion';

const Kegiatan = () => {
  const toast = useToast();
  const [kegiatan, setKegiatan] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  // Modals state
  const [modalOpen, setModalOpen] = useState(false);
  const [modalType, setModalType] = useState('add');
  const [selectedKegiatan, setSelectedKegiatan] = useState(null);

  // Form fields
  const [formData, setFormData] = useState({ nama_kegiatan: '', deskripsi: '', tanggal: '', lokasi: '', gambar: '' });
  const [formLoading, setFormLoading] = useState(false);

  // Deletion checks
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [kegIdToDelete, setKegIdToDelete] = useState(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  const fetchKegiatan = async () => {
    setLoading(true);
    try {
      const res = await api.kegiatan.getAll();
      setKegiatan(res.data);
    } catch (err) {
      console.error(err);
      toast.error('Gagal mengambil daftar kegiatan.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchKegiatan();
  }, []);

  const handleOpenAdd = () => {
    setFormData({ nama_kegiatan: '', deskripsi: '', tanggal: new Date().toISOString().split('T')[0], lokasi: '', gambar: '' });
    setModalType('add');
    setModalOpen(true);
  };

  const handleOpenEdit = (k) => {
    setSelectedKegiatan(k);
    setFormData({
      nama_kegiatan: k.nama_kegiatan,
      deskripsi: k.deskripsi,
      tanggal: k.tanggal,
      lokasi: k.lokasi,
      gambar: k.gambar || '',
    });
    setModalType('edit');
    setModalOpen(true);
  };

  const handleDeleteClick = (id) => {
    setKegIdToDelete(id);
    setDeleteOpen(true);
  };

  const handleDeleteConfirm = async () => {
    setDeleteLoading(true);
    try {
      await api.kegiatan.delete(kegIdToDelete);
      toast.success('Kegiatan berhasil dihapus.');
      fetchKegiatan();
    } catch (err) {
      toast.error('Gagal menghapus kegiatan.');
    } finally {
      setDeleteLoading(false);
      setDeleteOpen(false);
      setKegIdToDelete(null);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.nama_kegiatan || !formData.tanggal || !formData.lokasi) {
      toast.warning('Nama kegiatan, tanggal, dan lokasi wajib diisi!');
      return;
    }

    setFormLoading(true);
    try {
      if (modalType === 'add') {
        await api.kegiatan.create(formData);
        toast.success('Kegiatan baru berhasil dijadwalkan.');
      } else {
        await api.kegiatan.update(selectedKegiatan.id, formData);
        toast.success('Kegiatan berhasil diperbarui.');
      }
      setModalOpen(false);
      fetchKegiatan();
    } catch (err) {
      toast.error('Gagal menyimpan kegiatan.');
    } finally {
      setFormLoading(false);
    }
  };

  const filteredKegiatan = kegiatan.filter((k) =>
    k.nama_kegiatan.toLowerCase().includes(search.toLowerCase()) ||
    k.lokasi.toLowerCase().includes(search.toLowerCase()) ||
    k.deskripsi.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      
      {/* Header Panel */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-800 tracking-tight flex items-center">
            <Calendar className="h-6 w-6 text-primary mr-2" />
            Manajemen Kegiatan
          </h1>
          <p className="text-xs text-slate-500 mt-1">Mengelola draf promosi, detail, dan galeri agenda kegiatan luar ruangan pangkalan.</p>
        </div>
        <button
          onClick={handleOpenAdd}
          className="inline-flex items-center justify-center px-4 py-2.5 text-sm font-semibold text-white bg-primary rounded-xl hover:bg-primary-700 transition-colors shadow-sm min-h-[44px]"
        >
          <Plus className="h-4 w-4 mr-2" /> Buat Kegiatan
        </button>
      </div>

      {/* Control panel */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-soft flex items-center">
        <div className="relative w-full sm:w-80">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
          <input
            type="text"
            placeholder="Cari nama atau lokasi kegiatan..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-11 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm placeholder-slate-400 focus:outline-none focus:border-primary focus:bg-white transition-all min-h-[44px]"
          />
        </div>
      </div>

      {/* Grid view */}
      {loading ? (
        <SkeletonLoader type="card" rows={3} />
      ) : filteredKegiatan.length === 0 ? (
        <EmptyState
          title="Kegiatan Tidak Ditemukan"
          description={search ? `Pencarian "${search}" tidak menemukan kecocokan.` : 'Belum ada agenda kegiatan dibuat.'}
          actionLabel="Buat Agenda Kegiatan"
          onAction={handleOpenAdd}
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {filteredKegiatan.map((k) => (
            <div key={k.id} className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-soft flex flex-col justify-between hover:border-primary/35 transition-colors">
              <div className="aspect-video w-full overflow-hidden bg-slate-100 border-b border-slate-100">
                <img src={k.gambar} alt={k.nama_kegiatan} className="w-full h-full object-cover" />
              </div>
              
              <div className="p-5 flex-1 flex flex-col justify-between">
                <div>
                  <div className="flex flex-wrap gap-2 text-[10px] text-slate-400 font-semibold mb-1">
                    <span className="flex items-center"><Calendar className="h-3.5 w-3.5 mr-1 text-slate-400" /> {k.tanggal}</span>
                    <span className="flex items-center"><MapPin className="h-3.5 w-3.5 mr-1 text-slate-400" /> {k.lokasi}</span>
                  </div>
                  <h3 className="font-bold text-slate-800 text-sm">{k.nama_kegiatan}</h3>
                  <p className="text-slate-500 text-xs mt-2 line-clamp-3 leading-relaxed">{k.deskripsi}</p>
                </div>

                <div className="flex space-x-2 pt-5 mt-4 border-t border-slate-100 justify-end">
                  <button
                    onClick={() => handleOpenEdit(k)}
                    className="flex-1 inline-flex items-center justify-center px-3 py-2 text-xs font-semibold text-slate-600 bg-slate-50 border border-slate-200 rounded-lg hover:bg-slate-100 min-h-[44px]"
                  >
                    <Edit className="h-4 w-4 mr-1.5" /> Edit
                  </button>
                  <button
                    onClick={() => handleDeleteClick(k.id)}
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
                  {modalType === 'add' ? 'Jadwalkan Kegiatan Baru' : 'Edit Agenda Kegiatan'}
                </h3>
                <button onClick={() => setModalOpen(false)} className="p-2 hover:bg-slate-100 rounded-full text-slate-400 hover:text-slate-600 min-h-[44px] min-w-[44px]">
                  <X className="h-5 w-5" />
                </button>
              </div>

              {/* Body */}
              <div className="p-6 overflow-y-auto flex-1 text-sm space-y-4">
                <form id="kegiatanForm" onSubmit={handleSubmit} className="space-y-4">
                  <div className="space-y-1">
                    <label htmlFor="nama" className="text-xs font-semibold text-slate-700">Nama Kegiatan</label>
                    <input
                      type="text"
                      id="nama"
                      value={formData.nama_kegiatan}
                      onChange={(e) => setFormData(prev => ({ ...prev, nama_kegiatan: e.target.value }))}
                      placeholder="Masukkan nama kegiatan"
                      className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-primary min-h-[44px]"
                      required
                    />
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label htmlFor="tgl" className="text-xs font-semibold text-slate-700">Tanggal Kegiatan</label>
                      <input
                        type="date"
                        id="tgl"
                        value={formData.tanggal}
                        onChange={(e) => setFormData(prev => ({ ...prev, tanggal: e.target.value }))}
                        className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-primary min-h-[44px]"
                        required
                      />
                    </div>
                    <div className="space-y-1">
                      <label htmlFor="lok" className="text-xs font-semibold text-slate-700">Lokasi / Tempat Latihan</label>
                      <input
                        type="text"
                        id="lok"
                        value={formData.lokasi}
                        onChange={(e) => setFormData(prev => ({ ...prev, lokasi: e.target.value }))}
                        placeholder="Bumi Perkemahan Kiara Payung"
                        className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-primary min-h-[44px]"
                        required
                      />
                    </div>
                  </div>
                  <div className="space-y-1">
                    <label htmlFor="gambar" className="text-xs font-semibold text-slate-700">Tautan Gambar (Preview)</label>
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
                    <label htmlFor="desc" className="text-xs font-semibold text-slate-700">Deskripsi Kegiatan</label>
                    <textarea
                      id="desc"
                      value={formData.deskripsi}
                      onChange={(e) => setFormData(prev => ({ ...prev, deskripsi: e.target.value }))}
                      placeholder="Tuliskan isi deskripsi kegiatan di sini..."
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
                  form="kegiatanForm"
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
        title="Hapus Agenda Kegiatan"
        message="Apakah Anda yakin ingin menghapus agenda kegiatan ini? Catatan rincian kegiatan tidak akan ditayangkan."
        onConfirm={handleDeleteConfirm}
        onCancel={() => setDeleteOpen(false)}
        isLoading={deleteLoading}
      />

    </div>
  );
};

export default Kegiatan;
