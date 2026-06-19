import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { api } from '../../services/api';
import { Calendar, ArrowLeft, BookOpen } from 'lucide-react';
import LoadingSpinner from '../../components/common/LoadingSpinner';

const DetailBerita = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [berita, setBerita] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    const fetchDetail = async () => {
      try {
        const res = await api.berita.getById(id);
        setBerita(res.data);
      } catch (err) {
        console.error('Error fetching news detail:', err);
        setError(true);
      } finally {
        setLoading(false);
      }
    };
    fetchDetail();
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (error || !berita) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-6 text-center">
        <p className="text-red-500 font-semibold text-lg">Berita tidak ditemukan.</p>
        <Link to="/berita" className="mt-4 px-4 py-2 bg-primary text-white rounded-lg flex items-center">
          <ArrowLeft className="h-4 w-4 mr-2" /> Kembali ke Berita
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 py-12 px-4 sm:px-6 lg:px-8">
      <article className="max-w-3xl mx-auto bg-white border border-slate-200 rounded-3xl overflow-hidden shadow-soft">
        
        {/* Banner image */}
        <div className="w-full aspect-[21/9] bg-slate-100 overflow-hidden relative">
          <img src={berita.gambar} alt={berita.judul} className="w-full h-full object-cover" />
          <div className="absolute top-4 left-4">
            <button
              onClick={() => navigate(-1)}
              className="inline-flex items-center justify-center p-2 rounded-xl bg-white/80 backdrop-blur-xs text-slate-700 hover:bg-white hover:text-primary transition-colors shadow-sm min-h-[44px] min-w-[44px]"
            >
              <ArrowLeft className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* Content body */}
        <div className="p-8 sm:p-12 space-y-6">
          <div className="flex items-center space-x-2 text-xs font-semibold text-slate-400">
            <Calendar className="h-4 w-4" />
            <span>Diterbitkan: {berita.tanggal}</span>
          </div>

          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-800 leading-tight">
            {berita.judul}
          </h1>

          <div className="text-slate-600 text-sm sm:text-base leading-relaxed whitespace-pre-wrap pt-4 border-t border-slate-100">
            {berita.isi}
          </div>
        </div>

        {/* Footer actions */}
        <div className="px-8 sm:px-12 py-6 bg-slate-50 border-t border-slate-100 flex justify-between items-center">
          <Link to="/berita" className="text-sm font-semibold text-slate-500 hover:text-primary flex items-center min-h-[44px]">
            <ArrowLeft className="h-4 w-4 mr-1.5" /> Kembali ke Berita
          </Link>
          <span className="text-xs text-slate-400 font-medium">Halaman Berita Satria Batara</span>
        </div>

      </article>
    </div>
  );
};

export default DetailBerita;
