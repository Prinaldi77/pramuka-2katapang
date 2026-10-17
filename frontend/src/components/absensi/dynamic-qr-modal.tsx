'use client';

import React, { useState, useEffect, useRef } from 'react';
import QRCode from 'qrcode';
import { QrCode, X, RefreshCw, Maximize2, Minimize2, ShieldCheck, Clock, AlertCircle } from 'lucide-react';
import { getDynamicQRTokenAction } from '@/app/actions/absensi';

interface DynamicQRModalProps {
  agendaId: number;
  agendaTitle: string;
  onClose: () => void;
}

export default function DynamicQRModal({ agendaId, agendaTitle, onClose }: DynamicQRModalProps) {
  const [token, setToken] = useState<string>('');
  const [secondsRemaining, setSecondsRemaining] = useState<number>(60);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);
  const [refreshCount, setRefreshCount] = useState<number>(0);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const modalContainerRef = useRef<HTMLDivElement | null>(null);

  // Fetch token from server action
  const fetchNewToken = async () => {
    try {
      const res = await getDynamicQRTokenAction(agendaId);
      if (res.success && res.token) {
        setToken(res.token);
        setSecondsRemaining(res.secondsRemaining || 60);
        setError(null);
        setRefreshCount((prev) => prev + 1);
      } else {
        setError(res.error || 'Gagal memuat token QR.');
      }
    } catch (err: any) {
      setError(err.message || 'Terjadi kesalahan saat memuat QR.');
    } finally {
      setLoading(false);
    }
  };

  // Initial fetch and interval countdown
  useEffect(() => {
    fetchNewToken();
  }, [agendaId]);

  // Countdown timer: tick every 1 second
  useEffect(() => {
    const timer = setInterval(() => {
      setSecondsRemaining((prev) => {
        if (prev <= 1) {
          // Time expired for this 60-second window, fetch fresh token
          fetchNewToken();
          return 60;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [agendaId]);

  // Render QR Code to canvas whenever token changes
  useEffect(() => {
    if (canvasRef.current && token) {
      QRCode.toCanvas(
        canvasRef.current,
        token,
        {
          width: isFullscreen ? 400 : 280,
          margin: 2,
          color: {
            dark: '#1E3F20', // Primary scout green
            light: '#FFFFFF',
          },
        },
        (err) => {
          if (err) console.error('QR Render Error:', err);
        }
      );
    }
  }, [token, isFullscreen]);

  // Toggle fullscreen
  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      modalContainerRef.current?.requestFullscreen?.();
      setIsFullscreen(true);
    } else {
      document.exitFullscreen?.();
      setIsFullscreen(false);
    }
  };

  // Listen for fullscreen change events (e.g. user presses Esc)
  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };
    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
  }, []);

  const progressPercent = (secondsRemaining / 60) * 100;

  return (
    <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4 animate-fadeIn">
      <div
        ref={modalContainerRef}
        className={`bg-white border border-[#D1C9BC] rounded-3xl p-6 md:p-8 shadow-2xl flex flex-col items-center text-center relative transition-all duration-300 ${
          isFullscreen
            ? 'w-full h-full max-w-none rounded-none justify-center bg-[#FBF9F6]'
            : 'max-w-lg w-full'
        }`}
      >
        {/* TOP ACTIONS */}
        <div className="absolute top-6 right-6 flex items-center space-x-2">
          <button
            onClick={toggleFullscreen}
            className="p-2 text-gray-500 hover:text-primary rounded-xl hover:bg-[#F3EFEA] transition-colors cursor-pointer"
            title={isFullscreen ? 'Keluar Layar Penuh' : 'Mode Proyektor (Layar Penuh)'}
          >
            {isFullscreen ? <Minimize2 className="h-5 w-5" /> : <Maximize2 className="h-5 w-5" />}
          </button>
          <button
            onClick={onClose}
            className="p-2 text-gray-500 hover:text-red-600 rounded-xl hover:bg-red-50 transition-colors cursor-pointer"
            title="Tutup Modal"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* HEADER */}
        <div className="space-y-1 mb-4">
          <div className="inline-flex items-center space-x-1.5 px-3 py-1 bg-[#1E3F20]/10 text-primary rounded-full text-[10px] font-mono font-bold uppercase tracking-wider">
            <ShieldCheck className="h-3.5 w-3.5" />
            <span>Dynamic Anti-Screenshot QR Code</span>
          </div>
          <h3 className="font-serif font-black text-2xl text-primary mt-2">
            Absensi: {agendaTitle}
          </h3>
          <p className="text-xs text-gray-500 font-mono">
            Arahkan kamera siswa ke QR Code ini untuk mencatat kehadiran.
          </p>
        </div>

        {/* ERROR STATE */}
        {error && (
          <div className="p-4 bg-red-50 border border-red-200 text-red-700 text-xs rounded-xl flex items-center space-x-2 mb-4 w-full">
            <AlertCircle className="h-4 w-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* QR CODE CONTAINER */}
        <div className="p-4 bg-white border-2 border-[#D1C9BC] rounded-3xl shadow-inner relative flex flex-col items-center justify-center my-2">
          {loading ? (
            <div className="w-64 h-64 flex flex-col items-center justify-center space-y-3">
              <RefreshCw className="h-8 w-8 text-primary animate-spin" />
              <span className="text-xs font-mono text-gray-500">Membuat QR Dinamis...</span>
            </div>
          ) : (
            <>
              <canvas ref={canvasRef} className="rounded-xl" />
              
              {/* WATERMARK BADGE IN QR */}
              <div className="absolute bottom-2 bg-primary/90 text-[#E7E2D8] text-[9px] font-mono px-2.5 py-0.5 rounded-full shadow-sm">
                SMPN 2 KATAPANG • LIVE
              </div>
            </>
          )}
        </div>

        {/* COUNTDOWN PROGRESS BAR */}
        <div className="w-full max-w-xs space-y-2 mt-4">
          <div className="flex justify-between items-center text-xs font-mono">
            <span className="flex items-center text-gray-600 font-bold">
              <Clock className="h-3.5 w-3.5 mr-1 text-[#5C3D2E]" />
              Rotasi QR Berikutnya:
            </span>
            <span className={`font-bold px-2 py-0.5 rounded-md ${
              secondsRemaining <= 10
                ? 'bg-red-100 text-red-700 animate-pulse'
                : 'bg-emerald-100 text-emerald-800'
            }`}>
              {secondsRemaining} detik
            </span>
          </div>

          <div className="w-full bg-[#E6DFD3] rounded-full h-2.5 overflow-hidden">
            <div
              className={`h-full transition-all duration-1000 ease-linear rounded-full ${
                secondsRemaining <= 10 ? 'bg-red-500' : 'bg-primary'
              }`}
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        </div>

        {/* NOTICE INFO */}
        <div className="mt-6 p-3 bg-[#FBF9F6] border border-[#D1C9BC]/60 rounded-2xl max-w-sm text-left">
          <p className="text-[11px] text-[#5C3D2E] leading-relaxed flex items-start space-x-2">
            <span className="font-bold shrink-0">ℹ Info:</span>
            <span>
              Kode QR ini berganti setiap 60 detik. Tangkapan layar (*screenshot*) yang dikirimkan ke luar lokasi tidak akan berlaku setelah waktu habis.
            </span>
          </p>
        </div>

        {/* MANUAL REFRESH */}
        <button
          onClick={fetchNewToken}
          disabled={loading}
          className="mt-4 inline-flex items-center space-x-1.5 text-xs font-mono text-gray-500 hover:text-primary transition-colors cursor-pointer"
        >
          <RefreshCw className={`h-3.5 w-3.5 ${loading ? 'animate-spin' : ''}`} />
          <span>Segarkan QR Sekarang</span>
        </button>
      </div>
    </div>
  );
}
