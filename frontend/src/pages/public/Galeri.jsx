import React, { useState, useEffect } from 'react';
import { api } from '../../services/api';
import { Image as ImageIcon, X, ZoomIn } from 'lucide-react';
import SkeletonLoader from '../../components/common/SkeletonLoader';
import EmptyState from '../../components/common/EmptyState';

const Galeri = () => {
  const [galeriList, setGaleriList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  
  // Lightbox state
  const [activeImage, setActiveImage] = useState(null);

  useEffect(() => {
    const fetchGaleri = async () => {
      try {
        const res = await api.galeri.getAll();
        setGaleriList(res.data);
      } catch (err) {
        console.error('Error fetching gallery:', err);
        setError(true);
      } finally {
        setLoading(false);
      }
    };
    fetchGaleri();
  }, []);

  const openLightbox = (item) => {
    setActiveImage(item);
  };

  const closeLightbox = () => {
    setActiveImage(null);
  };

  return (
    <div className="min-h-screen bg-slate-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto space-y-8">
        
        {/* Header Block */}
        <div className="border-b border-slate-200 pb-6">
          <h1 className="text-3xl font-extrabold text-slate-800 tracking-tight">Dokumentasi Galeri</h1>
          <p className="text-sm text-slate-500 mt-1">Dokumentasi visual dari kegiatan latihan rutin, upacara pelantikan, dan kemah bakti Pramuka.</p>
        </div>

        {/* Content Section */}
        {loading ? (
          <SkeletonLoader type="card" rows={6} />
        ) : error ? (
          <div className="text-center py-12">
            <p className="text-red-500 font-semibold">Gagal memuat galeri foto. Coba periksa koneksi Anda.</p>
          </div>
        ) : galeriList.length === 0 ? (
          <EmptyState
            title="Galeri Masih Kosong"
            description="Belum ada dokumentasi foto yang diunggah ke sistem."
          />
        ) : (
          /* Responsive Masonry-like Grid */
          <div className="columns-1 sm:columns-2 lg:columns-3 xl:columns-4 gap-4 space-y-4">
            {galeriList.map((item) => (
              <div
                key={item.id}
                onClick={() => openLightbox(item)}
                className="break-inside-avoid bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-soft group cursor-pointer relative hover:border-primary/40 transition-all duration-300"
              >
                <img
                  src={item.gambar}
                  alt={item.judul}
                  className="w-full h-auto object-cover max-h-96"
                />
                
                {/* Overlay on hover */}
                <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-between p-5 text-white">
                  <div className="self-end p-2 bg-white/20 rounded-full backdrop-blur-xs">
                    <ZoomIn className="h-4 w-4" />
                  </div>
                  <div>
                    <h3 className="font-bold text-sm leading-tight truncate">{item.judul}</h3>
                    <p className="text-[10px] text-slate-300 truncate mt-1">{item.deskripsi}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Lightbox Modal (Centered, overlay) */}
        {activeImage && (
          <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-xs p-4 animate-in fade-in duration-200"
            onClick={closeLightbox}
          >
            {/* Close Button */}
            <button
              onClick={closeLightbox}
              className="absolute top-4 right-4 p-2 bg-slate-800 hover:bg-slate-700 rounded-full text-white transition-colors z-50 min-h-[44px] min-w-[44px] flex items-center justify-center"
            >
              <X className="h-6 w-6" />
            </button>

            {/* Lightbox Container */}
            <div
              className="max-w-4xl max-h-[85vh] flex flex-col items-center justify-center bg-transparent relative"
              onClick={(e) => e.stopPropagation()}
            >
              <img
                src={activeImage.gambar}
                alt={activeImage.judul}
                className="max-w-full max-h-[70vh] object-contain rounded-lg shadow-2xl"
              />
              
              {/* Image Description Block */}
              <div className="w-full text-center mt-4 text-white max-w-lg space-y-1">
                <h3 className="font-bold text-lg leading-tight">{activeImage.judul}</h3>
                <p className="text-sm text-slate-300">{activeImage.deskripsi}</p>
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};

export default Galeri;
