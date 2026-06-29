import React, { useState, useEffect } from 'react';
import { api } from '../../services/api';
import { useToast } from '../../context/ToastContext';
import { Plus, Edit, Trash2, Search, X, Clock, MapPin, Compass } from 'lucide-react';
import SkeletonLoader from '../../components/common/SkeletonLoader';
import EmptyState from '../../components/common/EmptyState';
import ConfirmDialog from '../../components/common/ConfirmDialog';
import { motion, AnimatePresence } from 'framer-motion';
import LocationPickerMap from '../../components/Map/LocationPickerMap';

const AgendaAbsensi = () => {
  const toast = useToast();
  const [agendas, setAgendas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  // Modals state
  const [modalOpen, setModalOpen] = useState(false);
  const [modalType, setModalType] = useState('add');
  const [selectedAgenda, setSelectedAgenda] = useState(null);

  // Form fields
  const [formData, setFormData] = useState({
    judul: '',
    toleransi: 0,
    tanggal: '',
    jam_mulai: '',
    jam_selesai: '',
    latitude: -7.0278,
    longitude: 107.5756,
    radius: 100,
    status: 'aktif',
  });
  const [formLoading, setFormLoading] = useState(false);

  // Deletion checks
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [agendaIdToDelete, setAgendaIdToDelete] = useState(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  const fetchAgendas = async () => {
    setLoading(true);
    try {
      const res = await api.agenda.getAll();
      setAgendas(res.data);
    } catch (err) {
      console.error(err);
      toast.error('Gagal mengambil data agenda absensi.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAgendas();
  }, []);

  const handleOpenAdd = () => {
    setFormData({
      judul: '',
      toleransi: 15, // Default toleransi keterlambatan 15 menit
      tanggal: new Date().toISOString().split('T')[0],
      jam_mulai: '14:00',
      jam_selesai: '17:00',
      latitude: -7.0278,
      longitude: 107.5756,
      radius: 100,
      status: 'aktif',
    });
    setModalType('add');
    setModalOpen(true);
  };

  const handleOpenEdit = (a) => {
    const parts = a.judul.split('||');
    setSelectedAgenda(a);
    setFormData({
      judul: parts[0],
      toleransi: parts[1] ? Number(parts[1]) : 0,
      tanggal: a.tanggal,
      jam_mulai: a.jam_mulai,
      jam_selesai: a.jam_selesai,
      latitude: Number(a.latitude),
      longitude: Number(a.longitude),
      radius: Number(a.radius),
      status: a.status,
    });
    setModalType('edit');
    setModalOpen(true);
  };

  const handleDeleteClick = (id) => {
    setAgendaIdToDelete(id);
    setDeleteOpen(true);
  };

  const handleDeleteConfirm = async () => {
    setDeleteLoading(true);
    try {
      await api.agenda.delete(agendaIdToDelete);
      toast.success('Agenda absensi berhasil dihapus!');
      fetchAgendas();
    } catch (err) {
      toast.error('Gagal menghapus agenda absensi.');
    } finally {
      setDeleteLoading(false);
      setDeleteOpen(false);
      setAgendaIdToDelete(null);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.judul || !formData.tanggal || !formData.jam_mulai || !formData.jam_selesai) {
      toast.warning('Judul, tanggal, dan jam latihan wajib diisi!');
      return;
    }

    setFormLoading(true);
    try {
      const realJudul = formData.judul.split('||')[0].trim();
      const toleransiVal = Math.max(0, parseInt(formData.toleransi) || 0);
      const combinedJudul = `${realJudul}||${toleransiVal}`;

      const cleanedData = {
        judul: combinedJudul,
        tanggal: formData.tanggal,
        jam_mulai: formData.jam_mulai,
        jam_selesai: formData.jam_selesai,
        latitude: parseFloat(String(formData.latitude).replace(',', '.')),
        longitude: parseFloat(String(formData.longitude).replace(',', '.')),
        radius: parseFloat(String(formData.radius).replace(',', '.')),
        status: formData.status,
      };

      if (isNaN(cleanedData.latitude) || isNaN(cleanedData.longitude) || isNaN(cleanedData.radius)) {
        toast.warning('Latitude, Longitude, dan Radius harus berupa angka!');
        setFormLoading(false);
        return;
      }

      if (modalType === 'add') {
        await api.agenda.create(cleanedData);
        toast.success('Agenda absensi baru berhasil dijadwalkan!');
      } else {
        await api.agenda.update(selectedAgenda.id, cleanedData);
        toast.success('Agenda absensi berhasil diperbarui!');
      }
      setModalOpen(false);
      fetchAgendas();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Gagal menyimpan agenda.');
    } finally {
      setFormLoading(false);
    }
  };

  const filteredAgendas = agendas.filter((a) =>
    a.judul.toLowerCase().includes(search.toLowerCase()) ||
    a.status.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      
      {/* Header Panel */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-800 tracking-tight flex items-center">
            <Clock className="h-6 w-6 text-primary mr-2" />
            Agenda Absensi GPS
          </h1>
          <p className="text-xs text-slate-500 mt-1">Mengelola penjadwalan latihan rutin dan radius absensi geofence GPS.</p>
        </div>
        <button
          onClick={handleOpenAdd}
          className="inline-flex items-center justify-center px-4 py-2.5 text-sm font-semibold text-white bg-primary rounded-xl hover:bg-primary-700 transition-colors shadow-sm min-h-[44px]"
        >
          <Plus className="h-4 w-4 mr-2" /> Buat Agenda
        </button>
      </div>

      {/* Control panel */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-soft flex items-center">
        <div className="relative w-full sm:w-80">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
          <input
            type="text"
            placeholder="Cari judul agenda absensi..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-11 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm placeholder-slate-400 focus:outline-none focus:border-primary focus:bg-white transition-all min-h-[44px]"
          />
        </div>
      </div>

      {/* Grid List */}
      {loading ? (
        <SkeletonLoader type="table" rows={4} />
      ) : filteredAgendas.length === 0 ? (
        <EmptyState
          title="Agenda Tidak Ditemukan"
          description={search ? `Pencarian "${search}" tidak menemukan kecocokan.` : 'Belum ada agenda absensi terjadwal.'}
          actionLabel="Buat Agenda Pertama"
          onAction={handleOpenAdd}
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {filteredAgendas.map((a) => (
            <div key={a.id} className="bg-white border border-slate-200 rounded-2xl p-6 shadow-soft flex flex-col justify-between hover:border-primary/40 transition-colors">
              <div className="space-y-4">
                <div className="flex justify-between items-start">
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-semibold border ${
                    a.status === 'aktif'
                      ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
                      : 'bg-slate-50 border-slate-200 text-slate-500'
                  }`}>
                    {a.status === 'aktif' ? 'Aktif (Sedang Berlangsung)' : 'Selesai'}
                  </span>
                  <span className="text-[10px] text-slate-400 font-semibold">{a.tanggal}</span>
                </div>

                <div>
                  {(() => {
                    const parts = a.judul.split('||');
                    const realJudul = parts[0];
                    const toleransiVal = parts[1] || 0;
                    return (
                      <>
                        <h3 className="font-bold text-slate-800 text-base leading-tight">{realJudul}</h3>
                        <p className="text-[11px] text-amber-600 font-semibold mt-1 bg-amber-50 border border-amber-200/50 rounded-lg px-2 py-0.5 inline-flex items-center">
                          <Clock className="h-3.5 w-3.5 mr-1 text-amber-500" />
                          Toleransi Telat: {toleransiVal} menit
                        </p>
                      </>
                    );
                  })()}
                  <p className="text-xs text-slate-400 mt-2 flex items-center">
                    <Clock className="h-3.5 w-3.5 mr-1 text-slate-400" />
                    Waktu Latihan: {a.jam_mulai} - {a.jam_selesai} WIB
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-3 pt-3 border-t border-slate-100 text-xs text-slate-500">
                  <div className="flex items-center">
                    <MapPin className="h-4 w-4 mr-1.5 text-slate-400" />
                    <span className="truncate">Koord: {a.latitude}, {a.longitude}</span>
                  </div>
                  <div className="flex items-center">
                    <Compass className="h-4 w-4 mr-1.5 text-slate-400" />
                    <span>Radius Geofence: {a.radius}m</span>
                  </div>
                </div>
              </div>

              <div className="flex space-x-2 pt-5 mt-4 border-t border-slate-100 justify-end">
                <button
                  onClick={() => handleOpenEdit(a)}
                  className="flex-1 inline-flex items-center justify-center px-3 py-2 text-xs font-semibold text-slate-600 bg-slate-50 border border-slate-200 rounded-lg hover:bg-slate-100 min-h-[44px]"
                >
                  <Edit className="h-4 w-4 mr-1.5" /> Edit
                </button>
                <button
                  onClick={() => handleDeleteClick(a.id)}
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
      <AnimatePresence>
        {modalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-0 sm:p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.2 }}
              className="w-full h-full sm:h-auto sm:max-w-lg bg-white sm:rounded-2xl shadow-xl flex flex-col justify-between overflow-hidden"
            >
              
              {/* Header */}
              <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50">
                <h3 className="font-bold text-slate-800">
                  {modalType === 'add' ? 'Jadwalkan Agenda Latihan' : 'Edit Agenda Latihan'}
                </h3>
                <button onClick={() => setModalOpen(false)} className="p-2 hover:bg-slate-100 rounded-full text-slate-400 hover:text-slate-600 min-h-[44px] min-w-[44px]">
                  <X className="h-5 w-5" />
                </button>
              </div>

              {/* Body */}
              <div className="p-6 overflow-y-auto flex-1 text-sm space-y-4">
                <form id="agendaForm" onSubmit={handleSubmit} className="space-y-4">
                  <div className="space-y-1">
                    <label htmlFor="judul" className="text-xs font-semibold text-slate-700">Nama/Judul Agenda</label>
                    <input
                      type="text"
                      id="judul"
                      value={formData.judul}
                      onChange={(e) => setFormData(prev => ({ ...prev, judul: e.target.value }))}
                      placeholder="Latihan Sandi Kotak & Sandi Morse"
                      className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-primary min-h-[44px]"
                      required
                    />
                  </div>
                  <div className="space-y-1">
                    <label htmlFor="toleransi" className="text-xs font-semibold text-slate-700">Toleransi Keterlambatan (Menit)</label>
                    <input
                      type="number"
                      id="toleransi"
                      min="0"
                      value={formData.toleransi}
                      onChange={(e) => setFormData(prev => ({ ...prev, toleransi: e.target.value }))}
                      placeholder="Masukkan toleransi menit (misal: 15)"
                      className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-primary min-h-[44px]"
                      required
                    />
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div className="space-y-1">
                      <label htmlFor="tgl" className="text-xs font-semibold text-slate-700">Tanggal Latihan</label>
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
                      <label htmlFor="mulai" className="text-xs font-semibold text-slate-700">Jam Mulai</label>
                      <input
                        type="time"
                        id="mulai"
                        value={formData.jam_mulai}
                        onChange={(e) => setFormData(prev => ({ ...prev, jam_mulai: e.target.value }))}
                        className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-primary min-h-[44px]"
                        required
                      />
                    </div>
                    <div className="space-y-1">
                      <label htmlFor="selesai" className="text-xs font-semibold text-slate-700">Jam Selesai</label>
                      <input
                        type="time"
                        id="selesai"
                        value={formData.jam_selesai}
                        onChange={(e) => setFormData(prev => ({ ...prev, jam_selesai: e.target.value }))}
                        className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-primary min-h-[44px]"
                        required
                      />
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div className="space-y-1">
                      <label htmlFor="lat" className="text-xs font-semibold text-slate-700">Latitude</label>
                      <input
                        type="text"
                        id="lat"
                        value={formData.latitude}
                        onChange={(e) => setFormData(prev => ({ ...prev, latitude: e.target.value }))}
                        className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-primary min-h-[44px]"
                        required
                      />
                    </div>
                    <div className="space-y-1">
                      <label htmlFor="lng" className="text-xs font-semibold text-slate-700">Longitude</label>
                      <input
                        type="text"
                        id="lng"
                        value={formData.longitude}
                        onChange={(e) => setFormData(prev => ({ ...prev, longitude: e.target.value }))}
                        className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-primary min-h-[44px]"
                        required
                      />
                    </div>
                    <div className="space-y-1">
                      <label htmlFor="rad" className="text-xs font-semibold text-slate-700">Radius Absen (meter)</label>
                      <input
                        type="number"
                        id="rad"
                        value={formData.radius}
                        onChange={(e) => setFormData(prev => ({ ...prev, radius: e.target.value }))}
                        className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-primary min-h-[44px]"
                        required
                      />
                    </div>
                  </div>

                  <div className="my-2 border border-slate-100 rounded-xl p-3 bg-slate-50/50">
                    <LocationPickerMap
                      latitude={parseFloat(String(formData.latitude).replace(',', '.')) || -7.0278}
                      longitude={parseFloat(String(formData.longitude).replace(',', '.')) || 107.5756}
                      radius={parseFloat(String(formData.radius).replace(',', '.')) || 100}
                      onChange={(lat, lng) => setFormData(prev => ({ ...prev, latitude: lat, longitude: lng }))}
                    />
                  </div>

                  <div className="space-y-1">
                    <label htmlFor="status" className="text-xs font-semibold text-slate-700">Status Agenda</label>
                    <select
                      id="status"
                      value={formData.status}
                      onChange={(e) => setFormData(prev => ({ ...prev, status: e.target.value }))}
                      className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-primary min-h-[44px]"
                    >
                      <option value="aktif">Aktif (Sedang Berlangsung)</option>
                      <option value="selesai">Selesai</option>
                    </select>
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
                  form="agendaForm"
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
        title="Hapus Agenda Absensi"
        message="Apakah Anda yakin ingin menghapus agenda absensi ini? Riwayat koordinat geofence juga akan terhapus."
        onConfirm={handleDeleteConfirm}
        onCancel={() => setDeleteOpen(false)}
        isLoading={deleteLoading}
      />

    </div>
  );
};

export default AgendaAbsensi;
