import React, { useState } from 'react';
import { api } from '../../services/api';
import { useToast } from '../../context/ToastContext';
import { Mail, Phone, MapPin, Send, MessageSquare } from 'lucide-react';
import { useDocumentMetadata } from '../../hooks/useDocumentMetadata';

const Kontak = () => {
  useDocumentMetadata('Hubungi Kami', 'Hubungi Kakak Pembina atau sekretariat Gugus Depan Pramuka SMP Negeri 2 Katapang melalui kontak atau form pesan di halaman ini.');

  const toast = useToast();
  const [formData, setFormData] = useState({
    nama: '',
    email: '',
    subjek: '',
    pesan: '',
  });
  const [submitting, setSubmitting] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.nama || !formData.email || !formData.subjek || !formData.pesan) {
      toast.warning('Semua kolom formulir harus diisi!');
      return;
    }

    setSubmitting(true);
    try {
      await api.pesan.create(formData);
      toast.success('Pesan Anda berhasil dikirim! Admin kami akan segera meninjau pesan Anda.');
      setFormData({ nama: '', email: '', subjek: '', pesan: '' });
    } catch (err) {
      console.error('Error sending message:', err);
      toast.error('Gagal mengirimkan pesan. Silakan coba beberapa saat lagi.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-5xl mx-auto space-y-12">
        
        {/* Header Halaman */}
        <div className="border-b border-slate-200 pb-6 text-center">
          <h1 className="text-3xl font-extrabold text-slate-800 tracking-tight">Hubungi Kami</h1>
          <p className="text-sm text-slate-500 mt-1">Kami senang mendengar pertanyaan, saran, atau tawaran kerja sama dari Anda.</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* Detail Kontak */}
          <div className="lg:col-span-5 bg-white border border-slate-200 rounded-3xl p-8 shadow-soft space-y-6">
            <h2 className="text-xl font-bold text-slate-800 flex items-center space-x-2">
              <MessageSquare className="h-5 w-5 text-primary" />
              <span>Detail Kontak</span>
            </h2>
            <p className="text-slate-600 text-xs sm:text-sm leading-relaxed">
              Silakan hubungi sekretariat Gugus Depan Pramuka SMPN 2 Katapang melalui kontak resmi di bawah ini atau kirim pesan langsung via formulir di samping.
            </p>

            <div className="space-y-6 pt-4 border-t border-slate-100">
              <div className="flex items-start space-x-4">
                <div className="p-3 bg-emerald-50 text-primary rounded-xl flex-shrink-0"><MapPin className="h-5 w-5" /></div>
                <div>
                  <h4 className="font-semibold text-slate-800 text-sm">Alamat Sekretariat</h4>
                  <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                     Komplek Gading Junti Asri, Desa Sangkanhurip, Kecamatan Katapang, Kabupaten Bandung, Jawa Barat
                  </p>
                </div>
              </div>
              <div className="flex items-start space-x-4">
                <div className="p-3 bg-emerald-50 text-primary rounded-xl flex-shrink-0"><Phone className="h-5 w-5" /></div>
                <div>
                  <h4 className="font-semibold text-slate-800 text-sm">No. Telepon/WhatsApp</h4>
                  <p className="text-xs text-slate-500 mt-1">087825056256</p>
                </div>
              </div>
              <div className="flex items-start space-x-4">
                <div className="p-3 bg-emerald-50 text-primary rounded-xl flex-shrink-0"><Mail className="h-5 w-5" /></div>
                <div>
                  <h4 className="font-semibold text-slate-800 text-sm">Email</h4>
                  <p className="text-xs text-slate-500 mt-1">pramukasmpn2katapang@gmail.com</p>
                </div>
              </div>
            </div>
          </div>

          {/* Formulir Kontak */}
          <form
            onSubmit={handleSubmit}
            className="lg:col-span-7 bg-white border border-slate-200 rounded-3xl p-8 shadow-soft space-y-6"
          >
            <h2 className="text-xl font-bold text-slate-800">Kirim Pesan Langsung</h2>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label htmlFor="nama" className="text-xs font-semibold text-slate-700">Nama Lengkap</label>
                <input
                  type="text"
                  id="nama"
                  name="nama"
                  value={formData.nama}
                  onChange={handleChange}
                  placeholder="Masukkan nama Anda"
                  className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm placeholder-slate-400 focus:outline-none focus:border-primary transition-colors min-h-[44px]"
                  required
                />
              </div>
              <div className="space-y-2">
                <label htmlFor="email" className="text-xs font-semibold text-slate-700">Alamat Email</label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="alamat@gmail.com"
                  className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm placeholder-slate-400 focus:outline-none focus:border-primary transition-colors min-h-[44px]"
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <label htmlFor="subjek" className="text-xs font-semibold text-slate-700">Perihal / Subjek</label>
              <input
                type="text"
                id="subjek"
                name="subjek"
                value={formData.subjek}
                onChange={handleChange}
                placeholder="Topik pesan Anda"
                className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm placeholder-slate-400 focus:outline-none focus:border-primary transition-colors min-h-[44px]"
                required
              />
            </div>

            <div className="space-y-2">
              <label htmlFor="pesan" className="text-xs font-semibold text-slate-700">Pesan Anda</label>
              <textarea
                id="pesan"
                name="pesan"
                value={formData.pesan}
                onChange={handleChange}
                placeholder="Tuliskan isi pesan Anda di sini..."
                rows="5"
                className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm placeholder-slate-400 focus:outline-none focus:border-primary transition-colors"
                required
              ></textarea>
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="inline-flex items-center justify-center px-6 py-3 text-sm font-bold text-white bg-primary rounded-xl hover:bg-primary-700 transition-colors shadow-sm w-full min-h-[44px]"
            >
              {submitting ? (
                <span>Mengirim...</span>
              ) : (
                <>
                  <Send className="h-4 w-4 mr-2" />
                  Kirim Pesan
                </>
              )}
            </button>
          </form>

        </div>
      </div>
    </div>
  );
};

export default Kontak;
