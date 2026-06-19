import React, { useState, useEffect } from 'react';
import { api } from '../../services/api';
import { useToast } from '../../context/ToastContext';
import { FileText, Save, Edit3, Image } from 'lucide-react';
import LoadingSpinner from '../../components/common/LoadingSpinner';

const ProfilGudep = () => {
  const toast = useToast();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [formData, setFormData] = useState({
    nama_gudep: '',
    deskripsi: '',
    visi: '',
    misi: '',
    alamat: '',
    email: '',
    telepon: '',
    logo: '',
  });

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await api.profil.get();
        setFormData(res.data);
      } catch (err) {
        console.error(err);
        toast.error('Gagal memuat profil pangkalan.');
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await api.profil.update(formData);
      toast.success('Profil Gugus Depan berhasil diperbarui!');
    } catch (err) {
      toast.error('Gagal memperbarui profil pangkalan.');
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
          <FileText className="h-6 w-6 text-primary mr-2" />
          Kelola Profil Gudep
        </h1>
        <p className="text-xs text-slate-500 mt-1">Mengedit informasi utama, visi, misi, dan kontak pangkalan Gerakan Pramuka.</p>
      </div>

      <form onSubmit={handleSubmit} className="bg-white border border-slate-200 rounded-2xl shadow-soft p-6 sm:p-8 space-y-6">
        
        {/* Logo preview and details */}
        <div className="flex flex-col sm:flex-row items-center sm:space-x-6 pb-6 border-b border-slate-100">
          <div className="relative group overflow-hidden rounded-2xl border border-slate-200 p-2 bg-slate-50 mb-4 sm:mb-0">
            <img src={formData.logo} alt="Logo" className="h-28 w-28 object-contain" />
            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity cursor-pointer">
              <Image className="h-6 w-6 text-white" />
            </div>
          </div>
          <div className="text-center sm:text-left space-y-1">
            <h3 className="font-bold text-slate-800 text-base">Logo Gugus Depan</h3>
            <p className="text-xs text-slate-400">Dimensi logo disarankan rasio 1:1 format PNG transparan.</p>
            <input
              type="text"
              name="logo"
              value={formData.logo}
              onChange={handleChange}
              placeholder="URL Gambar Logo"
              className="mt-2 w-full max-w-xs px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs focus:outline-none focus:border-primary focus:bg-white"
            />
          </div>
        </div>

        {/* Input Fields */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2 md:col-span-2">
            <label className="text-xs font-semibold text-slate-700">Nama Gugus Depan</label>
            <input
              type="text"
              name="nama_gudep"
              value={formData.nama_gudep}
              onChange={handleChange}
              className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-primary min-h-[44px]"
              required
            />
          </div>

          <div className="space-y-2 md:col-span-2">
            <label className="text-xs font-semibold text-slate-700">Deskripsi Pangkalan</label>
            <textarea
              name="deskripsi"
              value={formData.deskripsi}
              onChange={handleChange}
              rows="3"
              className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-primary"
              required
            ></textarea>
          </div>

          <div className="space-y-2">
            <label className="text-xs font-semibold text-slate-700">Visi</label>
            <textarea
              name="visi"
              value={formData.visi}
              onChange={handleChange}
              rows="5"
              className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-primary"
              required
            ></textarea>
          </div>

          <div className="space-y-2">
            <label className="text-xs font-semibold text-slate-700">Misi (Pisahkan per baris)</label>
            <textarea
              name="misi"
              value={formData.misi}
              onChange={handleChange}
              rows="5"
              className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-primary"
              required
            ></textarea>
          </div>

          <div className="space-y-2 md:col-span-2">
            <label className="text-xs font-semibold text-slate-700">Alamat Lengkap</label>
            <input
              type="text"
              name="alamat"
              value={formData.alamat}
              onChange={handleChange}
              className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-primary min-h-[44px]"
              required
            />
          </div>

          <div className="space-y-2">
            <label className="text-xs font-semibold text-slate-700">Alamat Email Resmi</label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-primary min-h-[44px]"
              required
            />
          </div>

          <div className="space-y-2">
            <label className="text-xs font-semibold text-slate-700">Telepon / Fax</label>
            <input
              type="text"
              name="telepon"
              value={formData.telepon}
              onChange={handleChange}
              className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-primary min-h-[44px]"
              required
            />
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
            {saving ? 'Menyimpan...' : 'Simpan Perubahan'}
          </button>
        </div>

      </form>
    </div>
  );
};

export default ProfilGudep;
