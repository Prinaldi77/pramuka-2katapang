'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Camera, CameraOff, CheckCircle2, AlertCircle, RefreshCw, Clock, Award, ShieldCheck } from 'lucide-react';
import { checkInWithQRAction } from '@/app/actions/absensi';

interface QRScannerWidgetProps {
  siswaId: number;
  initialLogs?: any[];
}

export default function QRScannerWidget({ siswaId, initialLogs = [] }: QRScannerWidgetProps) {
  const [isScanning, setIsScanning] = useState(false);
  const [loading, setLoading] = useState(false);
  const [scanResult, setScanResult] = useState<{
    success: boolean;
    status?: string;
    judulAgenda?: string;
    namaSiswa?: string;
    waktu?: string;
    error?: string;
  } | null>(null);

  const scannerRef = useRef<any>(null);
  const isProcessingRef = useRef(false);

  // Initialize and start scanner when isScanning becomes true
  useEffect(() => {
    let html5QrCodeInstance: any = null;

    if (isScanning) {
      // Dynamic import to ensure it runs only in browser client
      import('html5-qrcode')
        .then(({ Html5Qrcode }) => {
          const readerElement = document.getElementById('qr-reader-container');
          if (!readerElement) return;

          html5QrCodeInstance = new Html5Qrcode('qr-reader-container');
          scannerRef.current = html5QrCodeInstance;

          html5QrCodeInstance
            .start(
              { facingMode: 'environment' }, // Prefer back camera
              {
                fps: 10,
                qrbox: { width: 250, height: 250 },
                aspectRatio: 1.0,
              },
              async (decodedText: string) => {
                if (isProcessingRef.current) return;
                isProcessingRef.current = true;

                // Stop scanning while verifying
                try {
                  await html5QrCodeInstance.stop();
                } catch (e) {
                  // ignore
                }
                setIsScanning(false);
                setLoading(true);

                // Call server action
                const result = await checkInWithQRAction(decodedText);
                setLoading(false);
                isProcessingRef.current = false;

                if (result.success) {
                  setScanResult({
                    success: true,
                    status: result.status,
                    judulAgenda: result.judulAgenda,
                    namaSiswa: result.namaSiswa,
                    waktu: result.waktu,
                  });
                } else {
                  setScanResult({
                    success: false,
                    error: result.error || 'Gagal memproses absensi.',
                  });
                }
              },
              () => {
                // Ignore regular frame scanning errors
              }
            )
            .catch((err: any) => {
              console.error('Camera start error:', err);
              setIsScanning(false);
              setScanResult({
                success: false,
                error: 'Tidak dapat mengakses kamera. Pastikan Anda telah memberikan izin kamera pada browser Anda.',
              });
            });
        })
        .catch((err) => {
          console.error('Failed to load html5-qrcode module:', err);
        });
    }

    return () => {
      if (scannerRef.current) {
        try {
          scannerRef.current.stop().catch(() => {});
        } catch (e) {}
      }
    };
  }, [isScanning]);

  const handleStartScan = () => {
    setScanResult(null);
    setIsScanning(true);
  };

  const handleStopScan = () => {
    if (scannerRef.current) {
      try {
        scannerRef.current.stop().catch(() => {});
      } catch (e) {}
    }
    setIsScanning(false);
  };

  return (
    <div className="bg-[#E6DFD3]/30 border border-[#D1C9BC] rounded-3xl p-6 md:p-8 shadow-sm space-y-6 text-left">
      
      {/* HEADER */}
      <div className="flex items-center justify-between border-b border-[#D1C9BC]/50 pb-4">
        <div>
          <span className="text-[10px] font-mono text-[#5C3D2E] uppercase font-bold tracking-wider">
            [ ABSENSI WEB • SCANNER LIVE ]
          </span>
          <h3 className="font-serif font-bold text-2xl text-primary mt-1">
            Scan QR Code Kehadiran
          </h3>
        </div>
        <div className="p-3 bg-primary/10 text-primary rounded-2xl shrink-0">
          <Camera className="h-6 w-6" />
        </div>
      </div>

      {/* DESCRIPTION */}
      <p className="text-xs text-gray-600 leading-relaxed font-mono">
        Arahkan kamera ke layar proyektor / laptop pembina yang sedang menampilkan QR Code Absensi.
        Pastikan scan dilakukan sebelum kode berganti (durasi waktu 1 menit).
      </p>

      {/* SUCCESS RESULT CARD */}
      {scanResult?.success && (
        <div className="p-6 bg-emerald-50 border-2 border-emerald-300 rounded-3xl space-y-4 animate-fadeIn text-left">
          <div className="flex items-center space-x-3">
            <div className="p-2.5 bg-emerald-500 text-white rounded-xl">
              <CheckCircle2 className="h-6 w-6" />
            </div>
            <div>
              <h4 className="font-serif font-black text-lg text-emerald-950">
                Absensi Berhasil Tercatat!
              </h4>
              <p className="text-xs font-mono text-emerald-700">
                {scanResult.judulAgenda} • Pukul {scanResult.waktu} WIB
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-2 pt-2 border-t border-emerald-200 text-xs font-mono">
            <span className="text-emerald-800">Status Kehadiran:</span>
            <span className={`px-2.5 py-0.5 rounded-full font-bold uppercase ${
              scanResult.status === 'telat'
                ? 'bg-amber-100 text-amber-800 border border-amber-300'
                : 'bg-emerald-200 text-emerald-900 border border-emerald-400'
            }`}>
              {scanResult.status === 'telat' ? 'Hadir (Terlambat)' : 'Hadir Tepat Waktu'}
            </span>
          </div>

          <button
            onClick={() => setScanResult(null)}
            className="w-full py-2.5 bg-emerald-700 text-white font-mono text-xs font-bold uppercase rounded-xl hover:bg-emerald-800 transition-colors cursor-pointer"
          >
            Tutup & Selesai
          </button>
        </div>
      )}

      {/* ERROR RESULT CARD */}
      {scanResult && !scanResult.success && (
        <div className="p-6 bg-red-50 border-2 border-red-300 rounded-3xl space-y-4 animate-fadeIn text-left">
          <div className="flex items-start space-x-3">
            <div className="p-2.5 bg-red-500 text-white rounded-xl shrink-0 mt-0.5">
              <AlertCircle className="h-6 w-6" />
            </div>
            <div className="space-y-1">
              <h4 className="font-serif font-black text-lg text-red-950">
                Gagal Mencatat Absensi
              </h4>
              <p className="text-xs font-mono text-red-700 leading-relaxed">
                {scanResult.error}
              </p>
            </div>
          </div>

          <button
            onClick={handleStartScan}
            className="w-full py-2.5 bg-red-700 text-white font-mono text-xs font-bold uppercase rounded-xl hover:bg-red-800 transition-colors cursor-pointer flex items-center justify-center space-x-2"
          >
            <RefreshCw className="h-4 w-4" />
            <span>Coba Scan Ulang</span>
          </button>
        </div>
      )}

      {/* SCANNER CAMERA CONTAINER */}
      {isScanning ? (
        <div className="space-y-4 animate-fadeIn">
          <div className="relative overflow-hidden rounded-3xl border-2 border-primary bg-black aspect-square max-w-sm mx-auto shadow-lg">
            <div id="qr-reader-container" className="w-full h-full" />
            
            {/* SCANNING OVERLAY VIEWFINDER */}
            <div className="absolute inset-0 pointer-events-none flex flex-col items-center justify-center">
              <div className="w-56 h-56 border-2 border-dashed border-white/80 rounded-2xl relative animate-pulse">
                {/* Laser scan line animation */}
                <div className="absolute left-0 right-0 h-0.5 bg-red-500 shadow-[0_0_8px_#ef4444] animate-bounce" />
              </div>
              <span className="text-[10px] font-mono text-white/90 bg-black/60 px-3 py-1 rounded-full mt-4">
                Arahkan kotak ke QR Code Pembina
              </span>
            </div>
          </div>

          <button
            onClick={handleStopScan}
            className="w-full py-3 bg-gray-200 text-gray-700 font-mono text-xs font-bold uppercase rounded-xl hover:bg-gray-300 transition-colors flex items-center justify-center space-x-2 cursor-pointer"
          >
            <CameraOff className="h-4 w-4" />
            <span>Batal / Tutup Kamera</span>
          </button>
        </div>
      ) : (
        !scanResult?.success && (
          <button
            onClick={handleStartScan}
            disabled={loading}
            className="w-full py-4 bg-primary text-[#E7E2D8] font-mono text-xs font-bold uppercase tracking-wider rounded-2xl shadow-md hover:bg-opacity-95 transition-all flex items-center justify-center space-x-2 cursor-pointer"
          >
            {loading ? (
              <>
                <RefreshCw className="h-5 w-5 animate-spin mr-2" />
                <span>Memproses Data Absensi...</span>
              </>
            ) : (
              <>
                <Camera className="h-5 w-5 mr-2" />
                <span>Buka Kamera & Scan QR Sekarang</span>
              </>
            )}
          </button>
        )
      )}

      {/* INFO SECURITY BADGE */}
      <div className="flex items-center space-x-2 text-[11px] font-mono text-[#5C3D2E]">
        <ShieldCheck className="h-4 w-4 text-primary shrink-0" />
        <span>Anti-Kecurangan: QR rotasi 1 menit membatalkan hasil screenshot kiriman.</span>
      </div>
    </div>
  );
}
