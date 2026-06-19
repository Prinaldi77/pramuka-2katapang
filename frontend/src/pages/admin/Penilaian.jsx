import React, { useState, useEffect } from 'react';
import { api } from '../../services/api';
import { useToast } from '../../context/ToastContext';
import { Search, Plus, Edit, Trash2, X, Eye, Award, GraduationCap } from 'lucide-react';
import { ResponsiveContainer, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, BarChart, Bar, XAxis, YAxis, Tooltip } from 'recharts';
import SkeletonLoader from '../../components/common/SkeletonLoader';
import EmptyState from '../../components/common/EmptyState';
import ConfirmDialog from '../../components/common/ConfirmDialog';
import { motion, AnimatePresence } from 'framer-motion';

const Penilaian = () => {
  const toast = useToast();
  const [loading, setLoading] = useState(true);
  const [siswaList, setSiswaList] = useState([]);
  const [nilaiList, setNilaiList] = useState([]);
  const [search, setSearch] = useState('');

  // Modals state
  const [modalOpen, setModalOpen] = useState(false);
  const [modalType, setModalType] = useState('add'); // 'add', 'edit', 'rapor'
  const [selectedSiswa, setSelectedSiswa] = useState(null);
  const [selectedNilai, setSelectedNilai] = useState(null);
  const [raporData, setRaporData] = useState(null);
  const [raporLoading, setRaporLoading] = useState(false);

  // Form state
  const [formData, setFormData] = useState({
    siswa_id: '',
    kehadiran: 80,
    keaktifan: 80,
    kedisiplinan: 80,
    kerjasama: 80,
    tanggung_jawab: 80,
    catatan: '',
  });
  const [formLoading, setFormLoading] = useState(false);

  // Delete Confirm State
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [nilaiIdToDelete, setNilaiIdToDelete] = useState(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  const loadData = async () => {
    setLoading(true);
    try {
      const [siswaRes, nilaiRes] = await Promise.all([
        api.siswa.getAll(),
        api.nilai.getAll(),
      ]);
      setSiswaList(siswaRes.data);
      setNilaiList(nilaiRes.data);
    } catch (err) {
      console.error(err);
      toast.error('Gagal mengambil data penilaian.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleOpenAdd = () => {
    setFormData({
      siswa_id: siswaList[0]?.id || '',
      kehadiran: 80,
      keaktifan: 80,
      kedisiplinan: 80,
      kerjasama: 80,
      tanggung_jawab: 80,
      catatan: '',
    });
    setModalType('add');
    setModalOpen(true);
  };

  const handleOpenEdit = (n, s) => {
    setSelectedNilai(n);
    setSelectedSiswa(s);
    setFormData({
      siswa_id: n.siswa_id,
      kehadiran: n.kehadiran,
      keaktifan: n.keaktifan,
      kedisiplinan: n.kedisiplinan,
      kerjasama: n.kerjasama,
      tanggung_jawab: n.tanggung_jawab,
      catatan: n.catatan || '',
    });
    setModalType('edit');
    setModalOpen(true);
  };

  const handleOpenRapor = async (siswaId, s) => {
    setSelectedSiswa(s);
    setModalType('rapor');
    setModalOpen(true);
    setRaporLoading(true);
    try {
      const res = await api.nilai.getRapor(siswaId);
      setRaporData(res.data);
    } catch (err) {
      toast.error('Gagal memuat rapor siswa.');
      setModalOpen(false);
    } finally {
      setRaporLoading(false);
    }
  };

  const handleDeleteClick = (id) => {
    setNilaiIdToDelete(id);
    setDeleteOpen(true);
  };

  const handleDeleteConfirm = async () => {
    setDeleteLoading(true);
    try {
      await api.nilai.delete(nilaiIdToDelete);
      toast.success('Penilaian siswa berhasil dihapus.');
      loadData();
    } catch (err) {
      toast.error('Gagal menghapus penilaian.');
    } finally {
      setDeleteLoading(false);
      setDeleteOpen(false);
      setNilaiIdToDelete(null);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.siswa_id) {
      toast.warning('Pilih siswa terlebih dahulu!');
      return;
    }

    setFormLoading(true);
    try {
      if (modalType === 'add') {
        // Check if student already graded
        const exists = nilaiList.some(n => n.siswa_id === Number(formData.siswa_id));
        if (exists) {
          toast.error('Siswa ini sudah memiliki penilaian! Gunakan opsi edit.');
          setFormLoading(false);
          return;
        }
        await api.nilai.create(formData);
        toast.success('Penilaian siswa berhasil disimpan!');
      } else {
        await api.nilai.update(selectedNilai.id, formData);
        toast.success('Penilaian berhasil diperbarui.');
      }
      setModalOpen(false);
      loadData();
    } catch (err) {
      toast.error('Gagal menyimpan nilai.');
    } finally {
      setFormLoading(false);
    }
  };

  // Combine Siswa with Nilai details
  const decoratedSiswa = siswaList.map((s) => {
    const nilai = nilaiList.find((n) => n.siswa_id === s.id);
    return { ...s, nilai };
  });

  const filteredSiswa = decoratedSiswa.filter((s) =>
    s.nama.toLowerCase().includes(search.toLowerCase()) ||
    s.nis.includes(search)
  );

  return (
    <div className="space-y-6">
      
      {/* Header Panel */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-800 tracking-tight flex items-center">
            <GraduationCap className="h-6 w-6 text-primary mr-2" />
            Penilaian Karakter Penggalang
          </h1>
          <p className="text-xs text-slate-500 mt-1">Menginput dan mengevaluasi poin kehadiran, keaktifan, kedisiplinan, kerjasama, dan tanggung jawab.</p>
        </div>
        <button
          onClick={handleOpenAdd}
          className="inline-flex items-center justify-center px-4 py-2.5 text-sm font-semibold text-white bg-primary rounded-xl hover:bg-primary-700 transition-colors shadow-sm min-h-[44px]"
        >
          <Plus className="h-4 w-4 mr-2" /> Input Nilai Baru
        </button>
      </div>

      {/* Control panel */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-soft flex items-center">
        <div className="relative w-full sm:w-80">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
          <input
            type="text"
            placeholder="Cari nama atau NIS siswa..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-11 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm placeholder-slate-400 focus:outline-none focus:border-primary focus:bg-white transition-all min-h-[44px]"
          />
        </div>
      </div>

      {/* Grid Table */}
      {loading ? (
        <SkeletonLoader type="table" rows={6} />
      ) : filteredSiswa.length === 0 ? (
        <EmptyState
          title="Siswa Tidak Ditemukan"
          description={search ? `Pencarian "${search}" tidak menemukan kecocokan.` : 'Belum ada penilaian siswa terdaftar.'}
        />
      ) : (
        <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-soft">
          <div className="overflow-x-auto">
            <table className="w-full border-collapse text-left text-sm whitespace-nowrap">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 font-semibold">
                  <th className="px-6 py-4">Nama Siswa</th>
                  <th className="px-6 py-4">NIS</th>
                  <th className="px-6 py-4">Rata-Rata Nilai</th>
                  <th className="px-6 py-4">Status Nilai</th>
                  <th className="px-6 py-4 text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {filteredSiswa.map((s) => {
                  const hasNilai = !!s.nilai;
                  const avg = hasNilai
                    ? Math.round(
                        (s.nilai.kehadiran +
                          s.nilai.keaktifan +
                          s.nilai.kedisiplinan +
                          s.nilai.kerjasama +
                          s.nilai.tanggung_jawab) / 5
                      )
                    : null;

                  return (
                    <tr key={s.id} className="hover:bg-slate-50/50">
                      <td className="px-6 py-4 font-bold text-slate-900">{s.nama}</td>
                      <td className="px-6 py-4 font-semibold text-slate-500">{s.nis}</td>
                      <td className="px-6 py-4 font-bold">
                        {hasNilai ? (
                          <span className={avg >= 80 ? 'text-emerald-600' : avg >= 70 ? 'text-amber-600' : 'text-rose-600'}>
                            {avg}
                          </span>
                        ) : (
                          <span className="text-slate-400">-</span>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                          hasNilai 
                            ? 'bg-emerald-50 text-emerald-800 border border-emerald-200' 
                            : 'bg-slate-50 text-slate-400 border border-slate-200'
                        }`}>
                          {hasNilai ? 'Sudah Dinilai' : 'Belum Dinilai'}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right space-x-2">
                        {hasNilai ? (
                          <>
                            <button
                              onClick={() => handleOpenRapor(s.id, s)}
                              className="inline-flex items-center justify-center p-2 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 min-h-[44px] min-w-[44px]"
                              title="Rapor & Grafik"
                            >
                              <Eye className="h-5 w-5" />
                            </button>
                            <button
                              onClick={() => handleOpenEdit(s.nilai, s)}
                              className="inline-flex items-center justify-center p-2 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 min-h-[44px] min-w-[44px]"
                              title="Edit Nilai"
                            >
                              <Edit className="h-5 w-5" />
                            </button>
                            <button
                              onClick={() => handleDeleteClick(s.nilai.id)}
                              className="inline-flex items-center justify-center p-2 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 min-h-[44px] min-w-[44px]"
                              title="Hapus Nilai"
                            >
                              <Trash2 className="h-5 w-5" />
                            </button>
                          </>
                        ) : (
                          <button
                            onClick={() => {
                              handleOpenAdd();
                              setFormData(prev => ({ ...prev, siswa_id: s.id }));
                            }}
                            className="inline-flex items-center justify-center px-3 py-1.5 text-xs font-semibold text-primary border border-primary/30 rounded-lg hover:bg-emerald-50 min-h-[44px]"
                          >
                            <Plus className="h-3.5 w-3.5 mr-1" /> Input Nilai
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Add / Edit / Rapor Modals */}
      <AnimatePresence>
        {modalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-0 sm:p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.2 }}
              className={`w-full h-full sm:h-auto ${modalType === 'rapor' ? 'sm:max-w-3xl' : 'sm:max-w-xl'} bg-white sm:rounded-2xl shadow-xl flex flex-col justify-between overflow-hidden`}
            >
            
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50">
              <h3 className="font-bold text-slate-800">
                {modalType === 'add' ? 'Input Penilaian Baru' : modalType === 'edit' ? `Edit Nilai: ${selectedSiswa?.nama}` : `Rapor Perkembangan: ${selectedSiswa?.nama}`}
              </h3>
              <button onClick={() => setModalOpen(false)} className="p-2 hover:bg-slate-100 rounded-full text-slate-400 hover:text-slate-600 min-h-[44px] min-w-[44px]">
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Body */}
            <div className="p-6 overflow-y-auto flex-1 text-sm">
              {modalType === 'rapor' ? (
                raporLoading ? (
                  <div className="flex h-64 items-center justify-center"><LoadingSpinner size="md" /></div>
                ) : (
                  raporData && (
                    <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-start">
                      
                      {/* Left Block: Stats */}
                      <div className="md:col-span-5 space-y-4">
                        <div className="p-5 bg-emerald-50/50 border border-emerald-100 rounded-2xl flex flex-col items-center text-center">
                          <Award className="h-10 w-10 text-primary mb-2" />
                          <h4 className="text-slate-500 font-medium text-xs">Nilai Rata-Rata Rapor</h4>
                          <p className="text-3xl font-extrabold text-emerald-800 mt-1">{raporData.rata_rata}</p>
                          <span className="mt-2 text-xs font-semibold px-3 py-1 bg-emerald-800 text-white rounded-full">
                            Predikat: {raporData.predikat}
                          </span>
                        </div>

                        <div className="space-y-1.5 p-4 bg-slate-50 border border-slate-200/60 rounded-xl">
                          <p className="text-[10px] text-slate-400 font-bold uppercase">Catatan Pembina</p>
                          <p className="text-slate-600 italic text-xs leading-relaxed mt-1">
                            "{raporData.nilai.catatan || 'Tidak ada catatan.'}"
                          </p>
                        </div>
                      </div>

                      {/* Right Block: Recharts Chart */}
                      <div className="md:col-span-7 border border-slate-200 rounded-2xl p-4 flex flex-col justify-between">
                        <p className="font-bold text-slate-700 text-xs mb-4">Grafik Radar Karakter Penggalang</p>
                        
                        <div className="w-full h-60">
                          <ResponsiveContainer width="100%" height="100%">
                            <RadarChart cx="50%" cy="50%" outerRadius="80%" data={[
                              { subject: 'Kehadiran', A: raporData.nilai.kehadiran, fullMark: 100 },
                              { subject: 'Keaktifan', A: raporData.nilai.keaktifan, fullMark: 100 },
                              { subject: 'Kedisiplinan', A: raporData.nilai.kedisiplinan, fullMark: 100 },
                              { subject: 'Kerjasama', A: raporData.nilai.kerjasama, fullMark: 100 },
                              { subject: 'Tanggung Jawab', A: raporData.nilai.tanggung_jawab, fullMark: 100 },
                            ]}>
                              <PolarGrid stroke="#e2e8f0" />
                              <PolarAngleAxis dataKey="subject" tick={{ fill: '#475569', fontSize: 10 }} />
                              <PolarRadiusAxis angle={30} domain={[0, 100]} tick={{ fill: '#94a3b8', fontSize: 8 }} />
                              <Radar name={selectedSiswa?.nama} dataKey="A" stroke="#2a4a29" fill="#2a4a29" fillOpacity={0.4} />
                            </RadarChart>
                          </ResponsiveContainer>
                        </div>
                      </div>

                    </div>
                  )
                )
              ) : (
                <form id="nilaiForm" onSubmit={handleSubmit} className="space-y-4">
                  {modalType === 'add' && (
                    <div className="space-y-1">
                      <label htmlFor="siswa" className="text-xs font-semibold text-slate-700">Pilih Siswa</label>
                      <select
                        id="siswa"
                        value={formData.siswa_id}
                        onChange={(e) => setFormData(prev => ({ ...prev, siswa_id: e.target.value }))}
                        className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-primary min-h-[44px]"
                      >
                        {siswaList.map(s => (
                          <option key={s.id} value={s.id}>{s.nama} ({s.nis})</option>
                        ))}
                      </select>
                    </div>
                  )}

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label className="text-xs font-semibold text-slate-700">Nilai Kehadiran (0-100)</label>
                      <input
                        type="number"
                        min="0"
                        max="100"
                        value={formData.kehadiran}
                        onChange={(e) => setFormData(prev => ({ ...prev, kehadiran: Number(e.target.value) }))}
                        className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm min-h-[44px]"
                        required
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-xs font-semibold text-slate-700">Nilai Keaktifan (0-100)</label>
                      <input
                        type="number"
                        min="0"
                        max="100"
                        value={formData.keaktifan}
                        onChange={(e) => setFormData(prev => ({ ...prev, keaktifan: Number(e.target.value) }))}
                        className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm min-h-[44px]"
                        required
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-xs font-semibold text-slate-700">Nilai Kedisiplinan (0-100)</label>
                      <input
                        type="number"
                        min="0"
                        max="100"
                        value={formData.kedisiplinan}
                        onChange={(e) => setFormData(prev => ({ ...prev, kedisiplinan: Number(e.target.value) }))}
                        className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm min-h-[44px]"
                        required
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-xs font-semibold text-slate-700">Nilai Kerjasama (0-100)</label>
                      <input
                        type="number"
                        min="0"
                        max="100"
                        value={formData.kerjasama}
                        onChange={(e) => setFormData(prev => ({ ...prev, kerjasama: Number(e.target.value) }))}
                        className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm min-h-[44px]"
                        required
                      />
                    </div>
                    <div className="space-y-1 sm:col-span-2">
                      <label className="text-xs font-semibold text-slate-700">Nilai Tanggung Jawab (0-100)</label>
                      <input
                        type="number"
                        min="0"
                        max="100"
                        value={formData.tanggung_jawab}
                        onChange={(e) => setFormData(prev => ({ ...prev, tanggung_jawab: Number(e.target.value) }))}
                        className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm min-h-[44px]"
                        required
                      />
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label htmlFor="catatan" className="text-xs font-semibold text-slate-700">Catatan Evaluasi / Rekomendasi</label>
                    <textarea
                      id="catatan"
                      value={formData.catatan}
                      onChange={(e) => setFormData(prev => ({ ...prev, catatan: e.target.value }))}
                      placeholder="Pertahankan keaktifan pionering..."
                      rows="3"
                      className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-primary"
                    ></textarea>
                  </div>
                </form>
              )}
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
              {modalType !== 'rapor' && (
                <button
                  type="submit"
                  form="nilaiForm"
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
        title="Hapus Nilai Rapor Siswa"
        message="Apakah Anda yakin ingin menghapus data penilaian karakter siswa ini? Rapor siswa akan kembali kosong."
        onConfirm={handleDeleteConfirm}
        onCancel={() => setDeleteOpen(false)}
        isLoading={deleteLoading}
      />

    </div>
  );
};

export default Penilaian;
