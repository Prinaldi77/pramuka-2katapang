import React, { useState, useEffect } from 'react';
import { api } from '../../services/api';
import { useToast } from '../../context/ToastContext';
import { Search, Trash2, CheckCircle, MessageSquare, X, MailOpen, Mail } from 'lucide-react';
import SkeletonLoader from '../../components/common/SkeletonLoader';
import EmptyState from '../../components/common/EmptyState';
import ConfirmDialog from '../../components/common/ConfirmDialog';

const Pesan = () => {
  const toast = useToast();
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  // Dialog / Details
  const [detailOpen, setDetailOpen] = useState(false);
  const [selectedMsg, setSelectedMsg] = useState(null);

  // Deletion checks
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [msgIdToDelete, setMsgIdToDelete] = useState(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  const fetchMessages = async () => {
    setLoading(true);
    try {
      const res = await api.pesan.getAll();
      setMessages(res.data);
    } catch (err) {
      console.error(err);
      toast.error('Gagal mengambil data pesan masuk.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMessages();
  }, []);

  const handleOpenDetail = async (msg) => {
    setSelectedMsg(msg);
    setDetailOpen(true);
    
    // If message is unread, mark it as read automatically
    if (!msg.is_read) {
      try {
        await api.pesan.read(msg.id);
        // Refresh local state without full reload
        setMessages((prev) =>
          prev.map((m) => (m.id === msg.id ? { ...m, is_read: true } : m))
        );
      } catch (err) {
        console.error('Failed to mark message as read:', err);
      }
    }
  };

  const handleDeleteClick = (id) => {
    setMsgIdToDelete(id);
    setDeleteOpen(true);
  };

  const handleDeleteConfirm = async () => {
    setDeleteLoading(true);
    try {
      await api.pesan.delete(msgIdToDelete);
      toast.success('Pesan berhasil dihapus.');
      fetchMessages();
    } catch (err) {
      toast.error('Gagal menghapus pesan.');
    } finally {
      setDeleteLoading(false);
      setDeleteOpen(false);
      setMsgIdToDelete(null);
    }
  };

  const filteredMessages = messages.filter((m) =>
    m.nama.toLowerCase().includes(search.toLowerCase()) ||
    m.subjek.toLowerCase().includes(search.toLowerCase()) ||
    m.pesan.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      
      {/* Title */}
      <div>
        <h1 className="text-xl font-bold text-slate-800 tracking-tight flex items-center">
          <MessageSquare className="h-6 w-6 text-primary mr-2" />
          Pesan Masuk Hubungi Kami
        </h1>
        <p className="text-xs text-slate-500 mt-1">Membaca dan mengelola pesan saran, aduan, atau pertanyaan dari masyarakat umum.</p>
      </div>

      {/* Control panel */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-soft flex items-center">
        <div className="relative w-full sm:w-80">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
          <input
            type="text"
            placeholder="Cari nama pengirim, subjek, pesan..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-11 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm placeholder-slate-400 focus:outline-none focus:border-primary focus:bg-white transition-all min-h-[44px]"
          />
        </div>
      </div>

      {/* Main List */}
      {loading ? (
        <SkeletonLoader type="table" rows={4} />
      ) : filteredMessages.length === 0 ? (
        <EmptyState
          title="Tidak Ada Pesan"
          description={search ? `Pencarian "${search}" tidak menemukan kecocokan.` : 'Kotak masuk pesan Anda kosong.'}
        />
      ) : (
        <div className="grid grid-cols-1 gap-4">
          {filteredMessages.map((m) => (
            <div
              key={m.id}
              onClick={() => handleOpenDetail(m)}
              className={`p-5 rounded-2xl border transition-all cursor-pointer shadow-soft flex items-start justify-between ${
                m.is_read
                  ? 'bg-white border-slate-200 hover:border-slate-300'
                  : 'bg-emerald-50/20 border-emerald-100 hover:border-emerald-200'
              }`}
            >
              <div className="flex items-start space-x-4 min-w-0 flex-1">
                <div className={`p-3 rounded-xl flex-shrink-0 mt-0.5 ${
                  m.is_read ? 'bg-slate-100 text-slate-400' : 'bg-emerald-50 text-primary'
                }`}>
                  {m.is_read ? <MailOpen className="h-5 w-5" /> : <Mail className="h-5 w-5" />}
                </div>
                
                <div className="space-y-1 flex-1 min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <h3 className={`text-sm leading-tight truncate ${m.is_read ? 'text-slate-700' : 'font-bold text-slate-900'}`}>
                      {m.nama}
                    </h3>
                    <span className="text-[10px] text-slate-400 font-semibold">&bull; {m.tanggal}</span>
                  </div>
                  <p className={`text-xs truncate ${m.is_read ? 'text-slate-500' : 'font-semibold text-slate-800'}`}>
                    {m.subjek}
                  </p>
                  <p className="text-slate-400 text-[11px] truncate leading-relaxed">
                    {m.pesan}
                  </p>
                </div>
              </div>

              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleDeleteClick(m.id);
                }}
                className="p-2 text-slate-400 hover:text-red-600 rounded-lg hover:bg-slate-100 flex-shrink-0 min-h-[44px] min-w-[44px] flex items-center justify-center ml-4"
                title="Hapus Pesan"
              >
                <Trash2 className="h-5 w-5" />
              </button>

            </div>
          ))}
        </div>
      )}

      {/* Message Details Modal */}
      {detailOpen && selectedMsg && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-0 sm:p-4">
          <div className="w-full h-full sm:h-auto sm:max-w-lg bg-white sm:rounded-2xl shadow-xl flex flex-col justify-between overflow-hidden animate-in fade-in duration-200">
            
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50">
              <h3 className="font-bold text-slate-800">Detail Pesan Masuk</h3>
              <button
                onClick={() => setDetailOpen(false)}
                className="p-2 hover:bg-slate-100 rounded-full text-slate-400 hover:text-slate-600 min-h-[44px] min-w-[44px]"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Body */}
            <div className="p-6 overflow-y-auto flex-1 space-y-4 text-sm">
              <div className="grid grid-cols-2 gap-4 pb-4 border-b border-slate-100">
                <div>
                  <p className="text-[10px] text-slate-400 font-bold uppercase">Pengirim</p>
                  <p className="font-bold text-slate-800 mt-0.5">{selectedMsg.nama}</p>
                </div>
                <div>
                  <p className="text-[10px] text-slate-400 font-bold uppercase">Tanggal Masuk</p>
                  <p className="font-semibold text-slate-600 mt-0.5">{selectedMsg.tanggal}</p>
                </div>
                <div className="col-span-2">
                  <p className="text-[10px] text-slate-400 font-bold uppercase">Email Hubung</p>
                  <p className="font-semibold text-slate-600 underline mt-0.5">{selectedMsg.email}</p>
                </div>
              </div>

              <div className="space-y-1.5">
                <p className="text-[10px] text-slate-400 font-bold uppercase">Subjek / Perihal</p>
                <p className="font-bold text-slate-800">{selectedMsg.subjek}</p>
              </div>

              <div className="space-y-1.5 p-4 bg-slate-50 border border-slate-100 rounded-2xl">
                <p className="text-[10px] text-slate-400 font-bold uppercase mb-1">Isi Pesan</p>
                <p className="text-slate-600 text-xs leading-relaxed whitespace-pre-wrap">
                  {selectedMsg.pesan}
                </p>
              </div>
            </div>

            {/* Footer */}
            <div className="flex px-6 py-4 border-t border-slate-100 bg-slate-50 justify-end space-x-3">
              <button
                onClick={() => setDetailOpen(false)}
                className="px-5 py-2.5 text-sm font-semibold text-slate-600 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 min-h-[44px]"
              >
                Tutup
              </button>
              <button
                onClick={() => {
                  setDetailOpen(false);
                  handleDeleteClick(selectedMsg.id);
                }}
                className="px-5 py-2.5 text-sm font-bold text-white bg-red-600 rounded-lg hover:bg-red-700 min-h-[44px]"
              >
                Hapus Pesan
              </button>
            </div>

          </div>
        </div>
      )}

      {/* Delete Dialog */}
      <ConfirmDialog
        isOpen={deleteOpen}
        title="Hapus Pesan"
        message="Apakah Anda yakin ingin menghapus pesan ini dari rekap pesan masuk?"
        onConfirm={handleDeleteConfirm}
        onCancel={() => setDeleteOpen(false)}
        isLoading={deleteLoading}
      />

    </div>
  );
};

export default Pesan;
