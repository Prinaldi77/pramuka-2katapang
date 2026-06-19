import React, { useState, useEffect } from 'react';
import { api } from '../../services/api';
import { useToast } from '../../context/ToastContext';
import { Settings, Save, ShieldAlert } from 'lucide-react';
import LoadingSpinner from '../../components/common/LoadingSpinner';

const Pengaturan = () => {
  const toast = useToast();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [formData, setFormData] = useState({
    tahun_ajaran: '',
    semester: 'Ganjil',
    minimal_kehadiran: 75,
    pendaftaran_open: true,
  });

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const res = await api.pengaturan.get();
        setFormData(res.data);
      } catch (err) {
        console.error(err);
        toast.error('Gagal memuat pengaturan sistem.');
      } finally {
        setLoading(false);
      }
    };
    fetchSettings();
  }, []);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : type === 'number' ? Number(value) : value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await api.pengaturan.update(formData);
      toast.success('Pengaturan sistem berhasil disimpan!');
    } catch (err) {
      toast.error('Gagal menyimpan pengaturan.');
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
      {/* Title */}
      <div>
        <h1 className="text-xl font-bold text-slate-800 tracking-tight flex items-center">
          <Settings className="h-6 w-6 text-primary mr-2" />
          Pengaturan Sistem
        </h1>
        <p className="text-xs text-slate-500 mt-1">Mengatur parameter global pendaftaran anggota dan rasio syarat minimal kehadiran absensi.</p>
      </div>

      <form onSubmit={handleSubmit} className="bg-white border border-slate-200 rounded-2xl shadow-soft p-6 sm:p-8 space-y-6 max-w-2xl">
        <div className="space-y-4">
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-xs font-semibold text-slate-700">Tahun Ajaran</label>
              <input
                type="text"
                name="tahun_ajaran"
                value={formData.tahun_ajaran}
                onChange={handleChange}
                placeholder="2026/2027"
                className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-primary min-h-[44px]"
                required
              />
            </div>

            <div className="space-y-2">
              <label className="text-xs font-semibold text-slate-700">Semester</label>
              <select
                name="semester"
                value={formData.semester}
                onChange={handleChange}
                className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-primary min-h-[44px]"
              >
                <option value="Ganjil">Ganjil</option>
                <option value="Genap">Genap</option>
              </select>
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-xs font-semibold text-slate-700">Batas Minimal Kehadiran (%)</label>
            <input
              type="number"
              name="minimal_kehadiran"
              value={formData.minimal_kehadiran}
              onChange={handleChange}
              min="0"
              max="100"
              className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-primary min-h-[44px]"
              required
            />
            <p className="text-[10px] text-slate-400">Poin kelayakan kehadiran siswa dalam keikutsertaan latihan pramuka.</p>
          </div>

          <div className="pt-4 border-t border-slate-100 flex items-center justify-between text-sm">
            <div>
              <p className="font-semibold text-slate-700">Penerimaan Anggota Baru (Open)</p>
              <p className="text-[10px] text-slate-400 mt-0.5">Membuka atau menutup status registrasi penggalang luar.</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                name="pendaftaran_open"
                checked={formData.pendaftaran_open}
                onChange={handleChange}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
            </label>
          </div>

        </div>

        {/* Submit */}
        <div className="pt-4 border-t border-slate-100 flex justify-end">
          <button
            type="submit"
            disabled={saving}
            className="inline-flex items-center justify-center px-6 py-3 text-sm font-bold text-white bg-primary rounded-xl hover:bg-primary-700 transition-colors shadow-sm min-h-[44px]"
          >
            <Save className="h-4 w-4 mr-2" />
            {saving ? 'Menyimpan...' : 'Simpan Pengaturan'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default Pengaturan;
