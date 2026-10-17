'use client';

import React, { useState } from 'react';
import { Calendar, Trash2, QrCode, Clock } from 'lucide-react';
import { deleteAgendaAction } from '@/app/actions/absensi';
import DynamicQRModal from './dynamic-qr-modal';

interface AgendaListWithQRProps {
  agendaList: any[];
}

export default function AgendaListWithQR({ agendaList }: AgendaListWithQRProps) {
  const [selectedAgenda, setSelectedAgenda] = useState<{ id: number; judul: string } | null>(null);
  const [deletingId, setDeletingId] = useState<number | null>(null);

  const handleDelete = async (id: number) => {
    if (!confirm('Apakah Anda yakin ingin menghapus agenda absensi ini?')) return;
    setDeletingId(id);
    try {
      await deleteAgendaAction(id);
    } catch (err) {
      console.error('Delete error:', err);
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <>
      <div className="bg-white border border-[#D1C9BC] rounded-3xl p-8 shadow-sm space-y-6 text-left">
        <div className="flex items-center justify-between border-b border-[#D1C9BC]/45 pb-3">
          <h3 className="font-serif font-bold text-xl text-primary">Agenda Absensi Aktif</h3>
          <span className="text-xs font-mono text-[#5C3D2E] font-bold">
            Total: {agendaList?.length || 0} Agenda
          </span>
        </div>

        <div className="p-4 bg-[#FBF9F6] border border-[#D1C9BC] rounded-2xl flex items-center justify-between">
          <div className="flex items-center space-x-3 text-left">
            <div className="p-2.5 bg-[#1E3F20]/10 text-primary rounded-xl shrink-0">
              <QrCode className="h-6 w-6 text-primary" />
            </div>
            <div>
              <h4 className="font-serif font-bold text-sm text-primary">Tampilkan QR Presensi ke Siswa</h4>
              <p className="text-[11px] font-mono text-gray-500">
                Klik tombol <span className="text-[#1E3F20] font-bold">"BUKA QR LIVE"</span> di bawah untuk menampilkan QR Code 60 detik di layar proyektor / laptop pembina.
              </p>
            </div>
          </div>
        </div>

        <div className="divide-y divide-[#D1C9BC]/35">
          {!agendaList || agendaList.length === 0 ? (
            <div className="text-center py-8 text-gray-400">
              Belum ada agenda absensi aktif terdaftar. Buat agenda di formulir sebelah kiri untuk memulai.
            </div>
          ) : (
            agendaList.map((item: any, idx: number) => (
              <div key={item.id || idx} className="py-4 flex flex-col sm:flex-row sm:items-center justify-between first:pt-0 last:pb-0 gap-3">
                <div className="flex items-center space-x-4 min-w-0">
                  <div className="p-3 bg-secondary text-primary rounded-xl shrink-0">
                    <Calendar className="h-5 w-5" />
                  </div>
                  <div className="text-left min-w-0">
                    <h4 className="font-serif font-bold text-sm text-primary truncate">{item.judul}</h4>
                    <p className="text-[10px] font-mono text-gray-500 mt-1 truncate">
                      Tgl: {item.tanggal} • Waktu: {item.jam_mulai} - {item.jam_selesai} WIB
                    </p>
                  </div>
                </div>

                {/* ACTION BUTTONS */}
                <div className="flex items-center space-x-2 shrink-0 self-end sm:self-auto">
                  {/* TOMBOL BUKA QR DINAMIS */}
                  <button
                    onClick={() => setSelectedAgenda({ id: item.id, judul: item.judul })}
                    className="px-4 py-2.5 bg-[#1E3F20] hover:bg-[#2A562D] text-[#E7E2D8] font-mono text-xs font-bold uppercase rounded-xl transition-all shadow-md flex items-center space-x-2 cursor-pointer border border-[#D4AF37]/50 ring-1 ring-primary/20 hover:scale-[1.02]"
                    title="Tampilkan QR Code Dinamis di Layar Proyektor"
                  >
                    <QrCode className="h-4 w-4 text-[#D4AF37]" />
                    <span>BUKA QR LIVE</span>
                  </button>

                  {/* TOMBOL HAPUS */}
                  <button
                    onClick={() => handleDelete(item.id)}
                    disabled={deletingId === item.id}
                    className="p-2.5 rounded-xl text-gray-400 hover:text-red-600 hover:bg-red-50 transition-colors cursor-pointer"
                    title="Hapus Agenda"
                  >
                    <Trash2 className="h-5 w-5" />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* DYNAMIC QR MODAL */}
      {selectedAgenda && (
        <DynamicQRModal
          agendaId={selectedAgenda.id}
          agendaTitle={selectedAgenda.judul}
          onClose={() => setSelectedAgenda(null)}
        />
      )}
    </>
  );
}
