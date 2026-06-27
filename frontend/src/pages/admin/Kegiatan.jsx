import React, { useState, useEffect } from 'react';
import { api } from '../../services/api';
import { useToast } from '../../context/ToastContext';
import { Plus, Edit, Trash2, Search, X, Calendar, MapPin, Image as ImageIcon, ZoomIn } from 'lucide-react';
import SkeletonLoader from '../../components/common/SkeletonLoader';
import EmptyState from '../../components/common/EmptyState';
import ConfirmDialog from '../../components/common/ConfirmDialog';
import { motion, AnimatePresence } from 'framer-motion';

const Kegiatan = () => {
  const toast = useToast();
  
  // Tab state
  const [activeTab, setActiveTab] = useState('kegiatan');

  // Loading states
  const [loadingKegiatan, setLoadingKegiatan] = useState(true);
  const [loadingGaleri, setLoadingGaleri] = useState(true);

  // Data lists
  const [kegiatan, setKegiatan] = useState([]);
  const [galeri, setGaleri] = useState([]);

  // Search states
  const [searchKegiatan, setSearchKegiatan] = useState('');

  // Modals state for Kegiatan
  const [kegModalOpen, setKegModalOpen] = useState(false);
  const [kegModalType, setKegModalType] = useState('add');
  const [selectedKegiatan, setSelectedKegiatan] = useState(null);
  const [kegFormData, setKegFormData] = useState({ nama_kegiatan: '', deskripsi: '', tanggal: '', lokasi: '' });
  const [kegImageFile, setKegImageFile] = useState(null);
  const [kegImagePreview, setKegImagePreview] = useState('');
  const [kegFormLoading, setKegFormLoading] = useState(false);

  // Modals state for Galeri
  const [galModalOpen, setGalModalOpen] = useState(false);
  const [galFormData, setGalFormData] = useState({ judul: '' });
  const [galImageFile, setGalImageFile] = useState(null);
  const [galImagePreview, setGalImagePreview] = useState('');
  const [galFormLoading, setGalFormLoading] = useState(false);

  // Deletion checks for Kegiatan
  const [kegDeleteOpen, setKegDeleteOpen] = useState(false);
  const [kegIdToDelete, setKegIdToDelete] = useState(null);
  const [kegDeleteLoading, setKegDeleteLoading] = useState(false);

  // Deletion checks for Galeri
  const [galDeleteOpen, setGalDeleteOpen] = useState(false);
  const [galIdToDelete, setGalIdToDelete] = useState(null);
  const [galDeleteLoading, setGalDeleteLoading] = useState(false);

  // Lightbox for Galeri
  const [lightboxImage, setLightboxImage] = useState(null);

  // Fetch functions
  const fetchKegiatan = async () => {
    setLoadingKegiatan(true);
    try {
      const res = await api.kegiatan.getAll();
      setKegiatan(res.data);
    } catch (err) {
      console.error(err);
      toast.error('Gagal mengambil daftar kegiatan.');
    } finally {
      setLoadingKegiatan(false);
    }
  };

  const fetchGaleri = async () => {
    setLoadingGaleri(true);
    try {
      const res = await api.galeri.getAll();
      setGaleri(res.data);
    } catch (err) {
      console.error(err);
      toast.error('Gagal memuat galeri foto.');
    } finally {
      setLoadingGaleri(false);
    }
  };

  useEffect(() => {
    fetchKegiatan();
    fetchGaleri();
  }, []);

  // --- KEGIATAN ACTIONS ---
  const handleOpenKegAdd = () => {
    setKegFormData({ nama_kegiatan: '', deskripsi: '', tanggal: new Date().toISOString().split('T')[0], lokasi: '' });
    setKegImageFile(null);
    setKegImagePreview('');
    setKegModalType('add');
    setKegModalOpen(true);
  };

  const handleOpenKegEdit = (k) => {
    setSelectedKegiatan(k);
    setKegFormData({
      nama_kegiatan: k.nama_kegiatan,
      deskripsi: k.deskripsi,
      tanggal: k.tanggal,
      lokasi: k.lokasi,
    });
    setKegImageFile(null);
    setKegImagePreview(k.gambar || '');
    setKegModalType('edit');
    setKegModalOpen(true);
  };

  const handleKegImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setKegImageFile(file);
      setKegImagePreview(URL.createObjectURL(file));
    }
  };

  const handleKegDeleteClick = (id) => {
    setKegIdToDelete(id);
    setKegDeleteOpen(true);
  };

  const handleKegDeleteConfirm = async () => {
    setKegDeleteLoading(true);
    try {
      await api.kegiatan.delete(kegIdToDelete);
      toast.success('Kegiatan berhasil dihapus.');
      fetchKegiatan();
    } catch (err) {
      toast.error('Gagal menghapus kegiatan.');
    } finally {
      setKegDeleteLoading(false);
      setKegDeleteOpen(false);
      setKegIdToDelete(null);
    }
  };

  const handleKegSubmit = async (e) => {
    e.preventDefault();
    if (!kegFormData.nama_kegiatan || !kegFormData.tanggal || !kegFormData.lokasi) {
      toast.warning('Nama kegiatan, tanggal, dan lokasi wajib diisi!');
      return;
    }

    setKegFormLoading(true);
    try {
      const data = new FormData();
      data.append('nama_kegiatan', kegFormData.nama_kegiatan);
      data.append('tanggal', kegFormData.tanggal);
      data.append('lokasi', kegFormData.lokasi);
      data.append('deskripsi', kegFormData.deskripsi);
      if (kegImageFile) {
        data.append('gambar', kegImageFile);
      }

      if (kegModalType === 'add') {
        if (!kegImageFile) {
          toast.warning('Foto utama kegiatan wajib diunggah!');
          setKegFormLoading(false);
          return;
        }
        await api.kegiatan.create(data);
        toast.success('Kegiatan baru berhasil dijadwalkan.');
      } else {
        await api.kegiatan.update(selectedKegiatan.id, data);
        toast.success('Kegiatan berhasil diperbarui.');
      }
      setKegModalOpen(false);
      fetchKegiatan();
    } catch (err) {
      toast.error('Gagal menyimpan kegiatan.');
    } finally {
      setKegFormLoading(false);
    }
  };

  // --- GALERI ACTIONS ---
  const handleOpenGalAdd = () => {
    setGalFormData({ judul: '' });
    setGalImageFile(null);
    setGalImagePreview('');
    setGalModalOpen(true);
  };

  const handleGalImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setGalImageFile(file);
      setGalImagePreview(URL.createObjectURL(file));
    }
  };

  const handleGalDeleteClick = (id) => {
    setGalIdToDelete(id);
    setGalDeleteOpen(true);
  };

  const handleGalDeleteConfirm = async () => {
    setGalDeleteLoading(true);
    try {
      await api.galeri.delete(galIdToDelete);
      toast.success('Foto dokumentasi berhasil dihapus.');
      fetchGaleri();
    } catch (err) {
      toast.error('Gagal menghapus foto.');
    } finally {
      setGalDeleteLoading(false);
      setGalDeleteOpen(false);
      setGalIdToDelete(null);
    }
  };

  const handleGalSubmit = async (e) => {
    e.preventDefault();
    if (!galFormData.judul || !galImageFile) {
      toast.warning('Judul foto dan file gambar wajib diisi!');
      return;
    }

    setGalFormLoading(true);
    try {
      const data = new FormData();
      data.append('judul', galFormData.judul);
      data.append('gambar', galImageFile);

      await api.galeri.create(data);
      toast.success('Foto baru berhasil diunggah.');
      setGalModalOpen(false);
      fetchGaleri();
    } catch (err) {
      toast.error('Gagal menyimpan foto ke galeri.');
    } finally {
      setGalFormLoading(false);
    }
  };

  // Filtering
  const filteredKegiatan = kegiatan.filter((k) =>
    k.nama_kegiatan.toLowerCase().includes(searchKegiatan.toLowerCase()) ||
    k.lokasi.toLowerCase().includes(searchKegiatan.toLowerCase()) ||
    k.deskripsi.toLowerCase().includes(searchKegiatan.toLowerCase())
  );

  return (
    <div className="space-y-6">
      
      {/* Header Panel */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-800 tracking-tight flex items-center">
            <Calendar className="h-6 w-6 text-primary mr-2" />
            Kelola Kegiatan & Galeri
          </h1>
          <p className="text-xs text-slate-500 mt-1">Mengelola draf agenda latihan mingguan, perkemahan, serta mengunggah galeri foto dokumentasi.</p>
        </div>
        
        {activeTab === 'kegiatan' ? (
          <button
            onClick={handleOpenKegAdd}
            className="inline-flex items-center justify-center px-4 py-2.5 text-sm font-semibold text-white bg-primary rounded-xl hover:bg-primary-700 transition-colors shadow-sm min-h-[44px]"
          >
            <Plus className="h-4 w-4 mr-2" /> Buat Kegiatan
          </button>
        ) : (
          <button
            onClick={handleOpenGalAdd}
            className="inline-flex items-center justify-center px-4 py-2.5 text-sm font-semibold text-white bg-primary rounded-xl hover:bg-primary-700 transition-colors shadow-sm min-h-[44px]"
          >
            <Plus className="h-4 w-4 mr-2" /> Tambah Foto
          </button>
        )}
      </div>

      {/* Tabs Switcher */}
      <div className="flex border-b border-slate-200 space-x-6">
        <button
          onClick={() => setActiveTab('kegiatan')}
          className={`pb-3 text-sm font-bold border-b-2 transition-all ${
            activeTab === 'kegiatan'
              ? 'border-primary text-primary-800'
              : 'border-transparent text-slate-400 hover:text-slate-600'
          }`}
        >
          Agenda Kegiatan ({kegiatan.length})
        </button>
        <button
          onClick={() => setActiveTab('galeri')}
          className={`pb-3 text-sm font-bold border-b-2 transition-all ${
            activeTab === 'galeri'
              ? 'border-primary text-primary-800'
              : 'border-transparent text-slate-400 hover:text-slate-600'
          }`}
        >
          Galeri Foto ({galeri.length})
        </button>
      </div>

      {/* Control panel for Kegiatan */}
      {activeTab === 'kegiatan' && (
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-soft flex items-center">
          <div className="relative w-full sm:w-80">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
            <input
              type="text"
              placeholder="Cari kegiatan..."
              value={searchKegiatan}
              onChange={(e) => setSearchKegiatan(e.target.value)}
              className="w-full pl-11 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm placeholder-slate-400 focus:outline-none focus:border-primary focus:bg-white transition-all min-h-[44px]"
            />
          </div>
        </div>
      )}

      {/* Main Tab Views */}
      <AnimatePresence mode="wait">
        {activeTab === 'kegiatan' ? (
          <motion.div
            key="kegiatan-tab-admin"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.15 }}
          >
            {loadingKegiatan ? (
              <SkeletonLoader type="table" rows={4} />
            ) : filteredKegiatan.length === 0 ? (
              <EmptyState
                title="Kegiatan Tidak Ditemukan"
                description={searchKegiatan ? `Pencarian "${searchKegiatan}" tidak menemukan kecocokan.` : 'Belum ada agenda kegiatan.'}
                actionLabel="Buat Agenda Pertama"
                onAction={handleOpenKegAdd}
              />
            ) : (
              <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-soft">
                <div className="overflow-x-auto">
                  <table className="w-full border-collapse text-left text-sm whitespace-nowrap">
                    <thead>
                      <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 font-semibold">
                        <th className="px-6 py-4">Gambar</th>
                        <th className="px-6 py-4">Nama Kegiatan</th>
                        <th className="px-6 py-4">Tanggal</th>
                        <th className="px-6 py-4">Lokasi</th>
                        <th className="px-6 py-4 text-right">Aksi</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 text-slate-700">
                      {filteredKegiatan.map((k) => (
                        <tr key={k.id} className="hover:bg-slate-50/50">
                          <td className="px-6 py-4">
                            <div className="h-12 w-20 rounded-lg overflow-hidden border border-slate-100 bg-slate-50">
                              <img src={k.gambar} alt="Thumbnail" className="h-full w-full object-cover" />
                            </div>
                          </td>
                          <td className="px-6 py-4 font-bold text-slate-900">{k.nama_kegiatan}</td>
                          <td className="px-6 py-4 text-xs text-slate-400">{k.tanggal}</td>
                          <td className="px-6 py-4 text-slate-600 truncate max-w-xs">{k.lokasi}</td>
                          <td className="px-6 py-4 text-right space-x-2">
                            <button
                              onClick={() => handleOpenKegEdit(k)}
                              className="inline-flex items-center justify-center p-2 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 min-h-[44px] min-w-[44px]"
                              title="Edit"
                            >
                              <Edit className="h-5 w-5" />
                            </button>
                            <button
                              onClick={() => handleKegDeleteClick(k.id)}
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
          </motion.div>
        ) : (
          <motion.div
            key="galeri-tab-admin"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.15 }}
          >
            {loadingGaleri ? (
              <SkeletonLoader type="card" rows={4} />
            ) : galeri.length === 0 ? (
              <EmptyState
                title="Galeri Kosong"
                description="Belum ada dokumentasi foto yang diunggah ke sistem."
                actionLabel="Unggah Foto Pertama"
                onAction={handleOpenGalAdd}
              />
            ) : (
              <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                {galeri.map((item) => (
                  <div key={item.id} className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-soft flex flex-col justify-between hover:border-primary/40 transition-colors group relative">
                    <div className="aspect-square w-full overflow-hidden bg-slate-100 relative cursor-zoom-in" onClick={() => setLightboxImage(item)}>
                      <img src={item.gambar} alt={item.judul} className="w-full h-full object-cover" />
                      <button
                        onClick={(e) => { e.stopPropagation(); handleGalDeleteClick(item.id); }}
                        className="absolute top-2 right-2 p-2 bg-red-600/90 text-white rounded-xl hover:bg-red-700 transition-colors shadow-md z-20 min-h-[44px] min-w-[44px] flex items-center justify-center opacity-0 group-hover:opacity-100 duration-200"
                        title="Hapus Foto"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                    <div className="p-4 bg-slate-50 border-t border-slate-100">
                      <h4 className="font-bold text-slate-800 text-xs truncate">{item.judul}</h4>
                      <p className="text-[10px] text-slate-400 mt-0.5">Dokumentasi Foto</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* KEGIATAN MODAL */}
      <AnimatePresence>
        {kegModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-0 sm:p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full h-full sm:h-auto sm:max-w-md bg-white sm:rounded-2xl shadow-xl flex flex-col justify-between overflow-hidden"
            >
              <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50">
                <h3 className="font-bold text-slate-800">
                  {kegModalType === 'add' ? 'Jadwalkan Kegiatan Baru' : 'Edit Detail Kegiatan'}
                </h3>
                <button onClick={() => setKegModalOpen(false)} className="p-2 hover:bg-slate-100 rounded-full text-slate-400 hover:text-slate-600 min-h-[44px] min-w-[44px] flex items-center justify-center">
                  <X className="h-5 w-5" />
                </button>
              </div>

              <div className="p-6 overflow-y-auto flex-1 text-sm space-y-4 max-h-[70vh]">
                <form id="kegForm" onSubmit={handleKegSubmit} className="space-y-4">
                  <div className="space-y-1">
                    <label htmlFor="nama_keg" className="text-xs font-semibold text-slate-700">Nama Kegiatan</label>
                    <input
                      type="text"
                      id="nama_keg"
                      value={kegFormData.nama_kegiatan}
                      onChange={(e) => setKegFormData(prev => ({ ...prev, nama_kegiatan: e.target.value }))}
                      placeholder="Latihan Rutin Pramuka Pionering"
                      className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-primary min-h-[44px]"
                      required
                    />
                  </div>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label htmlFor="tgl_keg" className="text-xs font-semibold text-slate-700">Tanggal</label>
                      <input
                        type="date"
                        id="tgl_keg"
                        value={kegFormData.tanggal}
                        onChange={(e) => setKegFormData(prev => ({ ...prev, tanggal: e.target.value }))}
                        className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-primary min-h-[44px]"
                        required
                      />
                    </div>
                    <div className="space-y-1">
                      <label htmlFor="lok_keg" className="text-xs font-semibold text-slate-700">Lokasi / Tempat</label>
                      <input
                        type="text"
                        id="lok_keg"
                        value={kegFormData.lokasi}
                        onChange={(e) => setKegFormData(prev => ({ ...prev, lokasi: e.target.value }))}
                        placeholder="Lapangan Sekolah"
                        className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-primary min-h-[44px]"
                        required
                      />
                    </div>
                  </div>

                  {/* Kegiatan File Upload Selector */}
                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-slate-700 block">Foto Utama Kegiatan</label>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleKegImageChange}
                      className="text-xs block w-full text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-primary-50 file:text-primary file:hover:bg-primary-100 file:cursor-pointer"
                    />
                    {kegImagePreview && (
                      <div className="mt-2 rounded-xl overflow-hidden border border-slate-200 max-h-36">
                        <img src={kegImagePreview} alt="Preview" className="w-full h-full object-cover" />
                      </div>
                    )}
                  </div>

                  <div className="space-y-1">
                    <label htmlFor="desc_keg" className="text-xs font-semibold text-slate-700">Deskripsi Kegiatan</label>
                    <textarea
                      id="desc_keg"
                      value={kegFormData.deskripsi}
                      onChange={(e) => setKegFormData(prev => ({ ...prev, deskripsi: e.target.value }))}
                      placeholder="Materi latihan meliputi pembuatan tandu darurat..."
                      rows="4"
                      className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-primary"
                      required
                    ></textarea>
                  </div>
                </form>
              </div>

              <div className="flex px-6 py-4 border-t border-slate-100 bg-slate-50 justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => setKegModalOpen(false)}
                  className="px-5 py-2.5 text-sm font-semibold text-slate-600 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 min-h-[44px]"
                >
                  Tutup
                </button>
                <button
                  type="submit"
                  form="kegForm"
                  disabled={kegFormLoading}
                  className="px-5 py-2.5 text-sm font-bold text-white bg-primary rounded-lg hover:bg-primary-700 min-h-[44px]"
                >
                  {kegFormLoading ? 'Memproses...' : 'Simpan'}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* GALERI MODAL */}
      <AnimatePresence>
        {galModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-0 sm:p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full h-full sm:h-auto sm:max-w-md bg-white sm:rounded-2xl shadow-xl flex flex-col justify-between overflow-hidden"
            >
              <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50">
                <h3 className="font-bold text-slate-800">Unggah Dokumentasi Foto</h3>
                <button onClick={() => setGalModalOpen(false)} className="p-2 hover:bg-slate-100 rounded-full text-slate-400 hover:text-slate-600 min-h-[44px] min-w-[44px] flex items-center justify-center">
                  <X className="h-5 w-5" />
                </button>
              </div>

              <div className="p-6 overflow-y-auto flex-1 text-sm space-y-4">
                <form id="galForm" onSubmit={handleGalSubmit} className="space-y-4">
                  <div className="space-y-1">
                    <label htmlFor="judul_gal" className="text-xs font-semibold text-slate-700">Judul / Keterangan Foto</label>
                    <input
                      type="text"
                      id="judul_gal"
                      value={galFormData.judul}
                      onChange={(e) => setGalFormData({ judul: e.target.value })}
                      placeholder="Upacara Pelantikan Bantara"
                      className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-primary min-h-[44px]"
                      required
                    />
                  </div>

                  {/* Galeri File Upload Selector */}
                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-slate-700 block">Unggah Gambar</label>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleGalImageChange}
                      className="text-xs block w-full text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-primary-50 file:text-primary file:hover:bg-primary-100 file:cursor-pointer"
                      required
                    />
                    {galImagePreview && (
                      <div className="mt-2 rounded-xl overflow-hidden border border-slate-200 max-h-48 bg-slate-50">
                        <img src={galImagePreview} alt="Preview" className="w-full h-full object-contain mx-auto" />
                      </div>
                    )}
                  </div>
                </form>
              </div>

              <div className="flex px-6 py-4 border-t border-slate-100 bg-slate-50 justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => setGalModalOpen(false)}
                  className="px-5 py-2.5 text-sm font-semibold text-slate-600 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 min-h-[44px]"
                >
                  Tutup
                </button>
                <button
                  type="submit"
                  form="galForm"
                  disabled={galFormLoading}
                  className="px-5 py-2.5 text-sm font-bold text-white bg-primary rounded-lg hover:bg-primary-700 min-h-[44px]"
                >
                  {galFormLoading ? 'Mengunggah...' : 'Unggah Foto'}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* CONFIRM DIALOGS */}
      <ConfirmDialog
        isOpen={kegDeleteOpen}
        title="Hapus Agenda Kegiatan"
        message="Apakah Anda yakin ingin menghapus agenda kegiatan ini? Semua data terkait akan terhapus."
        onConfirm={handleKegDeleteConfirm}
        onCancel={() => setKegDeleteOpen(false)}
        isLoading={kegDeleteLoading}
      />

      <ConfirmDialog
        isOpen={galDeleteOpen}
        title="Hapus Foto Dokumentasi"
        message="Apakah Anda yakin ingin menghapus foto dokumentasi ini dari galeri?"
        onConfirm={handleGalDeleteConfirm}
        onCancel={() => setGalDeleteOpen(false)}
        isLoading={galDeleteLoading}
      />

      {/* LIGHTBOX FOR GALERI */}
      {lightboxImage && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-xs p-4 animate-in fade-in duration-200"
          onClick={() => setLightboxImage(null)}
        >
          <button
            onClick={() => setLightboxImage(null)}
            className="absolute top-4 right-4 p-2 bg-slate-900/80 text-white rounded-full hover:bg-slate-800 transition-colors min-h-[44px] min-w-[44px] flex items-center justify-center"
          >
            <X className="h-6 w-6" />
          </button>
          <div className="relative max-w-4xl max-h-[85vh] overflow-hidden rounded-xl" onClick={(e) => e.stopPropagation()}>
            <img src={lightboxImage.gambar} alt={lightboxImage.judul} className="max-w-full max-h-[80vh] object-contain mx-auto" />
            <div className="absolute bottom-0 inset-x-0 p-4 bg-black/60 text-white text-center">
              <h4 className="font-bold text-sm">{lightboxImage.judul}</h4>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default Kegiatan;
