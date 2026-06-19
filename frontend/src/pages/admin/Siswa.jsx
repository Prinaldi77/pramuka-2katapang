import React, { useState, useEffect } from 'react';
import { api } from '../../services/api';
import { useToast } from '../../context/ToastContext';
import { Plus, Edit, Trash2, Search, X, Eye, PhoneCall } from 'lucide-react';
import SkeletonLoader from '../../components/common/SkeletonLoader';
import EmptyState from '../../components/common/EmptyState';
import ConfirmDialog from '../../components/common/ConfirmDialog';
import { motion, AnimatePresence } from 'framer-motion';

const Siswa = () => {
  const toast = useToast();
  const [siswa, setSiswa] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  
  // Modals state
  const [modalOpen, setModalOpen] = useState(false);
  const [modalType, setModalType] = useState('add'); // 'add', 'edit', 'detail'
  const [selectedSiswa, setSelectedSiswa] = useState(null);

  // Form fields
  const [formData, setFormData] = useState({
    nama: '',
    nis: '',
    kelas: '',
    jenis_kelamin: 'Laki-laki',
    tempat_lahir: '',
    tanggal_lahir: '',
    nama_orang_tua: '',
    nomor_hp_orang_tua: '',
  });
  const [formLoading, setFormLoading] = useState(false);

  // Deletion checks
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [siswaIdToDelete, setSiswaIdToDelete] = useState(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  const fetchSiswa = async () => {
    setLoading(true);
    try {
      const res = await api.siswa.getAll();
      setSiswa(res.data);
    } catch (err) {
      console.error(err);
      toast.error('Gagal memuat data siswa.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSiswa();
  }, []);

  const handleOpenAdd = () => {
    setFormData({
      nama: '',
      nis: '',
      kelas: '',
      jenis_kelamin: 'Laki-laki',
      tempat_lahir: '',
      tanggal_lahir: '',
      nama_orang_tua: '',
      nomor_hp_orang_tua: '',
    });
    setModalType('add');
    setModalOpen(true);
  };

  const handleOpenEdit = (s) => {
    setSelectedSiswa(s);
    setFormData({
      nama: s.nama,
      nis: s.nis,
      kelas: s.kelas,
      jenis_kelamin: s.jenis_kelamin,
      tempat_lahir: s.tempat_lahir || '',
      tanggal_lahir: s.tanggal_lahir || '',
      nama_orang_tua: s.nama_orang_tua || '',
      nomor_hp_orang_tua: s.nomor_hp_orang_tua || '',
    });
    setModalType('edit');
    setModalOpen(true);
  };

  const handleOpenDetail = (s) => {
    setSelectedSiswa(s);
    setModalType('detail');
    setModalOpen(true);
  };

  const handleDeleteClick = (id) => {
    setSiswaIdToDelete(id);
    setDeleteOpen(true);
  };

  const handleDeleteConfirm = async () => {
    setDeleteLoading(true);
    try {
      await api.siswa.delete(siswaIdToDelete);
      toast.success('Data siswa berhasil dihapus.');
      fetchSiswa();
    } catch (err) {
      toast.error('Gagal menghapus data siswa.');
    } finally {
      setDeleteLoading(false);
      setDeleteOpen(false);
      setSiswaIdToDelete(null);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.nama || !formData.nis || !formData.kelas) {
      toast.warning('Nama, NIS, dan Kelas wajib diisi!');
      return;
    }

    setFormLoading(true);
    try {
      if (modalType === 'add') {
        await api.siswa.create(formData);
        toast.success('Siswa baru berhasil ditambahkan.');
      } else {
        await api.siswa.update(selectedSiswa.id, formData);
        toast.success('Data siswa berhasil diperbarui.');
      }
      setModalOpen(false);
      fetchSiswa();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Gagal menyimpan data.');
    } finally {
      setFormLoading(false);
    }
  };

  const filteredSiswa = siswa.filter((s) =>
    s.nama.toLowerCase().includes(search.toLowerCase()) ||
    s.nis.includes(search) ||
    s.kelas.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      
      {/* Header Panel */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-800 tracking-tight">Anggota Siswa Pramuka</h1>
          <p className="text-xs text-slate-500 mt-1">Mengelola daftar identitas lengkap seluruh penggalang aktif.</p>
        </div>
        <button
          onClick={handleOpenAdd}
          className="inline-flex items-center justify-center px-4 py-2.5 text-sm font-semibold text-white bg-primary rounded-xl hover:bg-primary-700 transition-colors shadow-sm min-h-[44px]"
        >
          <Plus className="h-4 w-4 mr-2" /> Tambah Siswa
        </button>
      </div>

      {/* Control panel */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-soft flex items-center">
        <div className="relative w-full sm:w-80">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
          <input
            type="text"
            placeholder="Cari nama, NIS, atau kelas..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-11 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm placeholder-slate-400 focus:outline-none focus:border-primary focus:bg-white transition-all min-h-[44px]"
          />
        </div>
      </div>

      {/* Main content viewport switcher */}
      {loading ? (
        <SkeletonLoader type="table" rows={6} />
      ) : filteredSiswa.length === 0 ? (
        <EmptyState
          title="Siswa Tidak Ditemukan"
          description={search ? `Pencarian "${search}" tidak menemukan kecocokan.` : 'Belum ada anggota siswa terdaftar.'}
          actionLabel="Daftarkan Siswa Baru"
          onAction={handleOpenAdd}
        />
      ) : (
        <>
          {/* Tablet / Desktop Grid: Complete Table view */}
          <div className="hidden md:block bg-white rounded-xl border border-slate-200 overflow-hidden shadow-soft">
            <div className="overflow-x-auto">
              <table className="w-full border-collapse text-left text-sm whitespace-nowrap">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 font-semibold">
                    <th className="px-6 py-4">Nama</th>
                    <th className="px-6 py-4">NIS</th>
                    <th className="px-6 py-4">Kelas</th>
                    <th className="px-6 py-4">Jenis Kelamin</th>
                    <th className="px-6 py-4">HP Orang Tua</th>
                    <th className="px-6 py-4 text-right">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-slate-700">
                  {filteredSiswa.map((s) => (
                    <tr key={s.id} className="hover:bg-slate-50/50">
                      <td className="px-6 py-4 font-bold text-slate-900">{s.nama}</td>
                      <td className="px-6 py-4 font-semibold text-slate-500">{s.nis}</td>
                      <td className="px-6 py-4">{s.kelas}</td>
                      <td className="px-6 py-4">{s.jenis_kelamin}</td>
                      <td className="px-6 py-4">{s.nomor_hp_orang_tua || '-'}</td>
                      <td className="px-6 py-4 text-right space-x-2">
                        <button
                          onClick={() => handleOpenDetail(s)}
                          className="inline-flex items-center justify-center p-2 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 min-h-[44px] min-w-[44px]"
                          title="Detail"
                        >
                          <Eye className="h-5 w-5" />
                        </button>
                        <button
                          onClick={() => handleOpenEdit(s)}
                          className="inline-flex items-center justify-center p-2 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 min-h-[44px] min-w-[44px]"
                          title="Edit"
                        >
                          <Edit className="h-5 w-5" />
                        </button>
                        <button
                          onClick={() => handleDeleteClick(s.id)}
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

          {/* Mobile Grid: Card List view */}
          <div className="grid grid-cols-1 gap-4 md:hidden">
            {filteredSiswa.map((s) => (
              <div key={s.id} className="bg-white border border-slate-200 p-5 rounded-2xl shadow-soft space-y-4">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="font-bold text-slate-800 text-base">{s.nama}</h3>
                    <p className="text-xs text-slate-400 mt-0.5">NIS: {s.nis} | Kelas: {s.kelas}</p>
                  </div>
                  <span className="text-[10px] px-2 py-0.5 rounded-full border bg-slate-50 text-slate-500 font-semibold">
                    {s.jenis_kelamin}
                  </span>
                </div>
                {s.nomor_hp_orang_tua && (
                  <div className="flex items-center text-xs text-slate-500 bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                    <PhoneCall className="h-4 w-4 text-primary mr-2 flex-shrink-0" />
                    <span>Ortu: {s.nama_orang_tua || 'Wali'} ({s.nomor_hp_orang_tua})</span>
                  </div>
                )}
                <div className="flex space-x-2 pt-2 border-t border-slate-100 justify-end">
                  <button
                    onClick={() => handleOpenDetail(s)}
                    className="flex-1 inline-flex items-center justify-center px-3 py-2 text-xs font-semibold text-slate-600 bg-slate-50 border border-slate-200 rounded-lg hover:bg-slate-100 min-h-[44px]"
                  >
                    <Eye className="h-4 w-4 mr-1.5" /> Detail
                  </button>
                  <button
                    onClick={() => handleOpenEdit(s)}
                    className="flex-1 inline-flex items-center justify-center px-3 py-2 text-xs font-semibold text-slate-600 bg-slate-50 border border-slate-200 rounded-lg hover:bg-slate-100 min-h-[44px]"
                  >
                    <Edit className="h-4 w-4 mr-1.5" /> Edit
                  </button>
                  <button
                    onClick={() => handleDeleteClick(s.id)}
                    className="flex-1 inline-flex items-center justify-center px-3 py-2 text-xs font-semibold text-white bg-red-600 rounded-lg hover:bg-red-700 min-h-[44px]"
                  >
                    <Trash2 className="h-4 w-4 mr-1.5" /> Hapus
                  </button>
                </div>
              </div>
            ))}
          </div>
        </>
      )}

      {/* Fullscreen Mobile / Centered Desktop Form modal */}
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
                {modalType === 'add' ? 'Registrasi Siswa Baru' : modalType === 'edit' ? 'Edit Identitas Siswa' : 'Identitas Lengkap Siswa'}
              </h3>
              <button
                onClick={() => setModalOpen(false)}
                className="p-2 hover:bg-slate-100 rounded-full text-slate-400 hover:text-slate-600 min-h-[44px] min-w-[44px]"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Content Body */}
            <div className="p-6 overflow-y-auto flex-1 text-sm">
              {modalType === 'detail' ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="border-b border-slate-100 pb-3">
                    <p className="text-[10px] text-slate-400 font-bold uppercase">Nama Lengkap</p>
                    <p className="font-bold text-slate-800 text-base mt-0.5">{selectedSiswa?.nama}</p>
                  </div>
                  <div className="border-b border-slate-100 pb-3">
                    <p className="text-[10px] text-slate-400 font-bold uppercase">Nomor Induk Siswa (NIS)</p>
                    <p className="font-semibold text-slate-700 mt-0.5">{selectedSiswa?.nis}</p>
                  </div>
                  <div className="border-b border-slate-100 pb-3">
                    <p className="text-[10px] text-slate-400 font-bold uppercase">Kelas & Rombel</p>
                    <p className="font-semibold text-slate-700 mt-0.5">{selectedSiswa?.kelas}</p>
                  </div>
                  <div className="border-b border-slate-100 pb-3">
                    <p className="text-[10px] text-slate-400 font-bold uppercase">Jenis Kelamin</p>
                    <p className="font-semibold text-slate-700 mt-0.5">{selectedSiswa?.jenis_kelamin}</p>
                  </div>
                  <div className="border-b border-slate-100 pb-3">
                    <p className="text-[10px] text-slate-400 font-bold uppercase">Tempat / Tanggal Lahir</p>
                    <p className="font-semibold text-slate-700 mt-0.5">
                      {selectedSiswa?.tempat_lahir || '-'}, {selectedSiswa?.tanggal_lahir || '-'}
                    </p>
                  </div>
                  <div className="border-b border-slate-100 pb-3">
                    <p className="text-[10px] text-slate-400 font-bold uppercase">Nama Orang Tua / Wali</p>
                    <p className="font-semibold text-slate-700 mt-0.5">{selectedSiswa?.nama_orang_tua || '-'}</p>
                  </div>
                  <div className="border-b border-slate-100 pb-3 md:col-span-2">
                    <p className="text-[10px] text-slate-400 font-bold uppercase">No. HP Orang Tua</p>
                    <p className="font-semibold text-slate-700 mt-0.5">{selectedSiswa?.nomor_hp_orang_tua || '-'}</p>
                  </div>
                </div>
              ) : (
                <form id="siswaForm" onSubmit={handleSubmit} className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <div className="space-y-1">
                    <label htmlFor="nama" className="text-xs font-semibold text-slate-700">Nama Lengkap</label>
                    <input
                      type="text"
                      id="nama"
                      value={formData.nama}
                      onChange={(e) => setFormData(prev => ({ ...prev, nama: e.target.value }))}
                      placeholder="Aldi Prinaldi"
                      className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-primary min-h-[44px]"
                      required
                    />
                  </div>
                  <div className="space-y-1">
                    <label htmlFor="nis" className="text-xs font-semibold text-slate-700">NIS (Nomor Induk Siswa)</label>
                    <input
                      type="text"
                      id="nis"
                      value={formData.nis}
                      onChange={(e) => setFormData(prev => ({ ...prev, nis: e.target.value }))}
                      placeholder="242507001"
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
                      placeholder="VIII-A"
                      className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-primary min-h-[44px]"
                      required
                    />
                  </div>
                  <div className="space-y-1">
                    <label htmlFor="jk" className="text-xs font-semibold text-slate-700">Jenis Kelamin</label>
                    <select
                      id="jk"
                      value={formData.jenis_kelamin}
                      onChange={(e) => setFormData(prev => ({ ...prev, jenis_kelamin: e.target.value }))}
                      className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-primary min-h-[44px]"
                    >
                      <option value="Laki-laki">Laki-laki</option>
                      <option value="Perempuan">Perempuan</option>
                    </select>
                  </div>
                  <div className="space-y-1">
                    <label htmlFor="tempat" className="text-xs font-semibold text-slate-700">Tempat Lahir</label>
                    <input
                      type="text"
                      id="tempat"
                      value={formData.tempat_lahir}
                      onChange={(e) => setFormData(prev => ({ ...prev, tempat_lahir: e.target.value }))}
                      placeholder="Bandung"
                      className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-primary min-h-[44px]"
                    />
                  </div>
                  <div className="space-y-1">
                    <label htmlFor="tgl" className="text-xs font-semibold text-slate-700">Tanggal Lahir</label>
                    <input
                      type="date"
                      id="tgl"
                      value={formData.tanggal_lahir}
                      onChange={(e) => setFormData(prev => ({ ...prev, tanggal_lahir: e.target.value }))}
                      className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-primary min-h-[44px]"
                    />
                  </div>
                  <div className="space-y-1">
                    <label htmlFor="ortu" className="text-xs font-semibold text-slate-700">Nama Orang Tua / Wali</label>
                    <input
                      type="text"
                      id="ortu"
                      value={formData.nama_orang_tua}
                      onChange={(e) => setFormData(prev => ({ ...prev, nama_orang_tua: e.target.value }))}
                      placeholder="Ahmad Supriadi"
                      className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-primary min-h-[44px]"
                    />
                  </div>
                  <div className="space-y-1">
                    <label htmlFor="hp_ortu" className="text-xs font-semibold text-slate-700">No. HP Orang Tua / Wali</label>
                    <input
                      type="tel"
                      id="hp_ortu"
                      value={formData.nomor_hp_orang_tua}
                      onChange={(e) => setFormData(prev => ({ ...prev, nomor_hp_orang_tua: e.target.value }))}
                      placeholder="081234567890"
                      className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-primary min-h-[44px]"
                    />
                  </div>
                </form>
              )}
            </div>

            {/* Modal Footer */}
            <div className="flex px-6 py-4 border-t border-slate-100 bg-slate-50 justify-end space-x-3">
              <button
                type="button"
                onClick={() => setModalOpen(false)}
                className="px-5 py-2.5 text-sm font-semibold text-slate-600 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 min-h-[44px]"
              >
                Tutup
              </button>
              {modalType !== 'detail' && (
                <button
                  type="submit"
                  form="siswaForm"
                  disabled={formLoading}
                  className="px-5 py-2.5 text-sm font-bold text-white bg-primary rounded-lg hover:bg-primary-700 min-h-[44px]"
                >
                  {formLoading ? 'Memproses...' : 'Simpan'}
                </button>
              )}
            </div>

            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Delete Dialog */}
      <ConfirmDialog
        isOpen={deleteOpen}
        title="Hapus Data Siswa"
        message="Apakah Anda yakin ingin menghapus data anggota penggalang ini? Tindakan ini menghapus catatan profil mereka."
        onConfirm={handleDeleteConfirm}
        onCancel={() => setDeleteOpen(false)}
        isLoading={deleteLoading}
      />

    </div>
  );
};

export default Siswa;
