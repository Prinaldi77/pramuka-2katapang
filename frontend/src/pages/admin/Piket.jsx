import React, { useState, useEffect } from 'react';
import { api } from '../../services/api';
import { useToast } from '../../context/ToastContext';
import { CalendarRange, Save, Users, RefreshCw } from 'lucide-react';
import LoadingSpinner from '../../components/common/LoadingSpinner';

const Piket = () => {
  const toast = useToast();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [piketList, setPiketList] = useState([]);

  const fetchPiket = async () => {
    try {
      setLoading(true);
      const res = await api.piket.getAll();
      setPiketList(res.data);
    } catch (err) {
      console.error(err);
      toast.error('Gagal memuat jadwal piket.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPiket();
  }, []);

  const handleInputChange = (id, field, value) => {
    setPiketList((prevList) =>
      prevList.map((item) =>
        item.id === id ? { ...item, [field]: value } : item
      )
    );
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      // Simpan semua jadwal piket secara berurutan
      for (const item of piketList) {
        await api.piket.update(item.id, {
          regu_putra: item.regu_putra,
          regu_putri: item.regu_putri
        });
      }
      toast.success('Jadwal piket berhasil diperbarui!');
    } catch (err) {
      console.error(err);
      toast.error('Gagal memperbarui jadwal piket.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex h-[60vh] items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Judul Halaman */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-800 tracking-tight flex items-center">
            <CalendarRange className="h-6 w-6 text-primary mr-2" />
            Manajemen Jadwal Piket
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Mengatur daftar regu pramuka putra dan putri yang bertugas piket harian.
          </p>
        </div>
        <button
          onClick={fetchPiket}
          className="inline-flex items-center justify-center px-4 py-2 text-xs font-semibold text-slate-600 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 transition-colors h-10"
        >
          <RefreshCw className="h-4 w-4 mr-2" />
          Refresh
        </button>
      </div>

      {/* Grid Formulir */}
      <form onSubmit={handleSave} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {piketList.map((item) => (
            <div
              key={item.id}
              className="bg-white border border-slate-200 rounded-2xl shadow-soft p-5 hover:border-primary/30 transition-all duration-200"
            >
              <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-4">
                <span className="text-sm font-bold text-primary">{item.hari}</span>
                <span className="text-[10px] text-slate-400 bg-slate-100 px-2 py-0.5 rounded-full font-medium">
                  ID: {item.id}
                </span>
              </div>

              <div className="space-y-4">
                {/* Regu Putra */}
                <div className="space-y-1.5">
                  <label className="text-[11px] font-bold text-slate-600 flex items-center">
                    <Users className="h-3.5 w-3.5 mr-1.5 text-blue-500" />
                    Regu Putra
                  </label>
                  <input
                    type="text"
                    value={item.regu_putra || ''}
                    onChange={(e) => handleInputChange(item.id, 'regu_putra', e.target.value)}
                    placeholder="Contoh: Regu Rajawali"
                    className="w-full px-3.5 py-2 bg-white border border-slate-200 rounded-xl text-xs focus:outline-none focus:border-primary min-h-[40px]"
                    required
                  />
                </div>

                {/* Regu Putri */}
                <div className="space-y-1.5">
                  <label className="text-[11px] font-bold text-slate-600 flex items-center">
                    <Users className="h-3.5 w-3.5 mr-1.5 text-pink-500" />
                    Regu Putri
                  </label>
                  <input
                    type="text"
                    value={item.regu_putri || ''}
                    onChange={(e) => handleInputChange(item.id, 'regu_putri', e.target.value)}
                    placeholder="Contoh: Regu Melati"
                    className="w-full px-3.5 py-2 bg-white border border-slate-200 rounded-xl text-xs focus:outline-none focus:border-primary min-h-[40px]"
                    required
                  />
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Tombol Simpan */}
        <div className="flex justify-end pt-4 border-t border-slate-200">
          <button
            type="submit"
            disabled={saving}
            className="inline-flex items-center justify-center px-6 py-3 text-sm font-bold text-white bg-primary rounded-xl hover:bg-primary-700 transition-colors shadow-sm min-h-[44px]"
          >
            <Save className="h-4 w-4 mr-2" />
            {saving ? 'Menyimpan...' : 'Simpan Semua Jadwal'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default Piket;
