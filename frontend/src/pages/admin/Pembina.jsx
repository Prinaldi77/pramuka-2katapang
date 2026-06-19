import React, { useState, useEffect } from 'react';
import { api } from '../../services/api';
import { useToast } from '../../context/ToastContext';
import { Plus, Edit, Trash2, Search, X, Users, PhoneCall } from 'lucide-react';
import SkeletonLoader from '../../components/common/SkeletonLoader';
import EmptyState from '../../components/common/EmptyState';
import ConfirmDialog from '../../components/common/ConfirmDialog';

const Pembina = () => {
  const toast = useToast();
  const [pembinas, setPembinas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  // Modals state
  const [modalOpen, setModalOpen] = useState(false);
  const [modalType, setModalType] = useState('add');
  const [selectedPembina, setSelectedPembina] = useState(null);

  // Form fields
  const [formData, setFormData] = useState({
    nama: '',
    nip: '',
    jabatan: '',
    telepon: '',
    email: '',
  });
  const [formLoading, setFormLoading] = useState(false);

  // Deletion checks
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [pembinaIdToDelete, setPembinaIdToDelete] = useState(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  const fetchPembinas = async () => {
    setLoading(true);
    try {
      const res = await api.pembina.getAll();
      setPembinas(res.data);
    } catch (err) {
      console.error(err);
      toast.error('Gagal mengambil data pembina.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPembinas();
  }, []);

  const handleOpenAdd = () => {
    setFormData({ nama: '', nip: '', jabatan: '', telepon: '', email: '' });
    setModalType('add');
    setModalOpen(true);
  };

  const handleOpenEdit = (p) => {
    setSelectedPembina(p);
    setFormData({
      nama: p.nama,
      nip: p.nip || '',
      jabatan: p.jabatan,
      telepon: p.telepon || '',
      email: p.email || '',
    });
    setModalType('edit');
    setModalOpen(true);
  };

  const handleDeleteClick = (id) => {
    setPembinaIdToDelete(id);
    setDeleteOpen(true);
  };

  const handleDeleteConfirm = async () => {
    setDeleteLoading(true);
    try {
      await api.pembina.delete(pembinaIdToDelete);
      toast.success('Data pembina berhasil dihapus.');
      fetchPembinas();
    } catch (err) {
      toast.error('Gagal menghapus pembina.');
    } finally {
      setDeleteLoading(false);
      setDeleteOpen(false);
      setPembinaIdToDelete(null);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.nama || !formData.jabatan) {
      toast.warning('Nama dan Jabatan pembina wajib diisi!');
      return;
    }

    setFormLoading(true);
    try {
      if (modalType === 'add') {
        await api.pembina.create(formData);
        toast.success('Pembina baru berhasil ditambahkan.');
      } else {
        await api.pembina.update(selectedPembina.id, formData);
        toast.success('Data pembina berhasil diperbarui.');
      }
      setModalOpen(false);
      fetchPembinas();
    } catch (err) {
      toast.error('Gagal menyimpan data pembina.');
    } finally {
      setFormLoading(false);
    }
  };

  const filteredPembinas = pembinas.filter((p) =>
    p.nama.toLowerCase().includes(search.toLowerCase()) ||
    (p.nip || '').includes(search) ||
    p.jabatan.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      
      {/* Header Panel */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-800 tracking-tight flex items-center">
            <Users className="h-6 w-6 text-primary mr-2" />
            Pembina Pramuka Gudep
          </h1>
          <p className="text-xs text-slate-500 mt-1">Mengelola daftar identitas Pembina Satuan Gerakan Pramuka SMPN 2 Katapang.</p>
        </div>
        <button
          onClick={handleOpenAdd}
          className="inline-flex items-center justify-center px-4 py-2.5 text-sm font-semibold text-white bg-primary rounded-xl hover:bg-primary-700 transition-colors shadow-sm min-h-[44px]"
        >
          <Plus className="h-4 w-4 mr-2" /> Tambah Pembina
        </button>
      </div>

      {/* Control panel */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-soft flex items-center">
        <div className="relative w-full sm:w-80">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
          <input
            type="text"
            placeholder="Cari nama, NIP, atau jabatan..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-11 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm placeholder-slate-400 focus:outline-none focus:border-primary focus:bg-white transition-all min-h-[44px]"
          />
        </div>
      </div>

      {/* Main List */}
      {loading ? (
        <SkeletonLoader type="table" rows={4} />
      ) : filteredPembinas.length === 0 ? (
        <EmptyState
          title="Pembina Tidak Ditemukan"
          description={search ? `Pencarian "${search}" tidak menemukan kecocokan.` : 'Belum ada pembina terdaftar.'}
          actionLabel="Tambah Pembina"
          onAction={handleOpenAdd}
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {filteredPembinas.map((p) => (
            <div key={p.id} className="bg-white border border-slate-200 rounded-2xl p-6 shadow-soft flex flex-col justify-between hover:border-primary/40 transition-colors">
              <div className="space-y-4">
                <div className="flex items-center space-x-3">
                  <div className="h-12 w-12 bg-primary/10 text-primary rounded-full flex items-center justify-center font-bold text-lg border border-primary/20 flex-shrink-0">
                    {p.nama.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-800 text-base leading-tight">{p.nama}</h3>
                    <p className="text-xs text-slate-400 mt-1">NIP: {p.nip || '-'}</p>
                  </div>
                </div>

                <div className="space-y-2 border-t border-slate-100 pt-4 text-xs text-slate-600">
                  <p><span className="font-semibold text-slate-400">Jabatan:</span> {p.jabatan}</p>
                  <p><span className="font-semibold text-slate-400">Telepon:</span> {p.telepon || '-'}</p>
                  <p><span className="font-semibold text-slate-400">Email:</span> {p.email || '-'}</p>
                </div>
              </div>

              <div className="flex space-x-2 pt-5 mt-4 border-t border-slate-100 justify-end">
                <button
                  onClick={() => handleOpenEdit(p)}
                  className="flex-1 inline-flex items-center justify-center px-3 py-2 text-xs font-semibold text-slate-600 bg-slate-50 border border-slate-200 rounded-lg hover:bg-slate-100 min-h-[44px]"
                >
                  <Edit className="h-4 w-4 mr-1.5" /> Edit
                </button>
                <button
                  onClick={() => handleDeleteClick(p.id)}
                  className="flex-1 inline-flex items-center justify-center px-3 py-2 text-xs font-semibold text-white bg-red-600 rounded-lg hover:bg-red-700 min-h-[44px]"
                >
                  <Trash2 className="h-4 w-4 mr-1.5" /> Hapus
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* CRUD Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-0 sm:p-4">
          <div className="w-full h-full sm:h-auto sm:max-w-md bg-white sm:rounded-2xl shadow-xl flex flex-col justify-between overflow-hidden animate-in fade-in duration-200">
            
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50">
              <h3 className="font-bold text-slate-800">
                {modalType === 'add' ? 'Tambah Pembina Baru' : 'Edit Data Pembina'}
              </h3>
              <button onClick={() => setModalOpen(false)} className="p-2 hover:bg-slate-100 rounded-full text-slate-400 hover:text-slate-600 min-h-[44px] min-w-[44px]">
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Body */}
            <div className="p-6 overflow-y-auto flex-1 text-sm space-y-4">
              <form id="pembinaForm" onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-1">
                  <label htmlFor="nama" className="text-xs font-semibold text-slate-700">Nama Lengkap & Gelar</label>
                  <input
                    type="text"
                    id="nama"
                    value={formData.nama}
                    onChange={(e) => setFormData(prev => ({ ...prev, nama: e.target.value }))}
                    placeholder="Kak Roni Hermawan, S.Pd."
                    className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-primary min-h-[44px]"
                    required
                  />
                </div>
                <div className="space-y-1">
                  <label htmlFor="nip" className="text-xs font-semibold text-slate-700">NIP (Nomor Induk Pegawai)</label>
                  <input
                    type="text"
                    id="nip"
                    value={formData.nip}
                    onChange={(e) => setFormData(prev => ({ ...prev, nip: e.target.value }))}
                    placeholder="198204122009031002"
                    className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-primary min-h-[44px]"
                  />
                </div>
                <div className="space-y-1">
                  <label htmlFor="jab" className="text-xs font-semibold text-slate-700">Jabatan Pembina</label>
                  <input
                    type="text"
                    id="jab"
                    value={formData.jabatan}
                    onChange={(e) => setFormData(prev => ({ ...prev, jabatan: e.target.value }))}
                    placeholder="Pembina Satuan Putra"
                    className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-primary min-h-[44px]"
                    required
                  />
                </div>
                <div className="space-y-1">
                  <label htmlFor="tel" className="text-xs font-semibold text-slate-700">Nomor HP / Telepon</label>
                  <input
                    type="tel"
                    id="tel"
                    value={formData.telepon}
                    onChange={(e) => setFormData(prev => ({ ...prev, telepon: e.target.value }))}
                    placeholder="081122334455"
                    className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-primary min-h-[44px]"
                  />
                </div>
                <div className="space-y-1">
                  <label htmlFor="email" className="text-xs font-semibold text-slate-700">Email Hubung</label>
                  <input
                    type="email"
                    id="email"
                    value={formData.email}
                    onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                    placeholder="pembina@gudep.sch.id"
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
                form="pembinaForm"
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
        title="Hapus Pembina"
        message="Apakah Anda yakin ingin menghapus data Pembina ini? Catatan keanggotaan mereka akan dihapus."
        onConfirm={handleDeleteConfirm}
        onCancel={() => setDeleteOpen(false)}
        isLoading={deleteLoading}
      />

    </div>
  );
};

export default Pembina;
