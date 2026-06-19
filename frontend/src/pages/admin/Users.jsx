import React, { useState, useEffect } from 'react';
import { api } from '../../services/api';
import { useToast } from '../../context/ToastContext';
import { Plus, Edit, Trash2, Search, X, Eye } from 'lucide-react';
import SkeletonLoader from '../../components/common/SkeletonLoader';
import EmptyState from '../../components/common/EmptyState';
import ConfirmDialog from '../../components/common/ConfirmDialog';
import { motion, AnimatePresence } from 'framer-motion';

const Users = () => {
  const toast = useToast();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;

  // Dialog State
  const [modalOpen, setModalOpen] = useState(false);
  const [modalType, setModalType] = useState('add'); // 'add', 'edit', 'detail'
  const [selectedUser, setSelectedUser] = useState(null);
  
  // Form State
  const [formData, setFormData] = useState({ name: '', email: '', role: 'siswa', password: '' });
  const [formLoading, setFormLoading] = useState(false);

  // Delete Confirm State
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [userIdToDelete, setUserIdToDelete] = useState(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const res = await api.users.getAll();
      setUsers(res.data);
    } catch (err) {
      console.error(err);
      toast.error('Gagal mengambil data user.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleOpenAdd = () => {
    setFormData({ name: '', email: '', role: 'siswa', password: '' });
    setModalType('add');
    setModalOpen(true);
  };

  const handleOpenEdit = (user) => {
    setSelectedUser(user);
    setFormData({ name: user.name || user.nama || '', email: user.email, role: user.role, password: '' });
    setModalType('edit');
    setModalOpen(true);
  };

  const handleOpenDetail = (user) => {
    setSelectedUser(user);
    setModalType('detail');
    setModalOpen(true);
  };

  const handleDeleteClick = (id) => {
    setUserIdToDelete(id);
    setDeleteOpen(true);
  };

  const handleDeleteConfirm = async () => {
    setDeleteLoading(true);
    try {
      await api.users.delete(userIdToDelete);
      toast.success('User berhasil dihapus!');
      fetchUsers();
    } catch (err) {
      toast.error('Gagal menghapus user.');
    } finally {
      setDeleteLoading(false);
      setDeleteOpen(false);
      setUserIdToDelete(null);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.email || (modalType === 'add' && !formData.password)) {
      toast.warning('Email dan password wajib diisi!');
      return;
    }

    setFormLoading(true);
    try {
      if (modalType === 'add') {
        await api.users.create(formData);
        toast.success('User baru berhasil ditambahkan!');
      } else {
        // Edit mode
        const payload = { ...formData };
        if (!payload.password) delete payload.password; // Don't send empty password
        await api.users.update(selectedUser.id, payload);
        toast.success('Data user berhasil diperbarui!');
      }
      setModalOpen(false);
      fetchUsers();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Gagal memproses data.');
    } finally {
      setFormLoading(false);
    }
  };

  // Filter & Search Logic
  const filteredUsers = users.filter((u) =>
    (u.name || u.nama || '').toLowerCase().includes(search.toLowerCase()) ||
    u.email.toLowerCase().includes(search.toLowerCase()) ||
    u.role.toLowerCase().includes(search.toLowerCase())
  );

  // Pagination Logic
  const totalPages = Math.ceil(filteredUsers.length / itemsPerPage);
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredUsers.slice(indexOfFirstItem, indexOfLastItem);

  return (
    <div className="space-y-6">
      
      {/* Header Panel */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-800 tracking-tight">Akun Pengguna</h1>
          <p className="text-xs text-slate-500 mt-1">Mengelola akun akses login admin, pembina, dan siswa.</p>
        </div>
        <button
          onClick={handleOpenAdd}
          className="inline-flex items-center justify-center px-4 py-2.5 text-sm font-semibold text-white bg-primary rounded-xl hover:bg-primary-700 transition-colors shadow-sm min-h-[44px]"
        >
          <Plus className="h-4 w-4 mr-2" /> Tambah User
        </button>
      </div>

      {/* Control Panel: Search */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-soft flex items-center">
        <div className="relative w-full sm:w-80">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
          <input
            type="text"
            placeholder="Cari nama, email, atau role..."
            value={search}
            onChange={(e) => { setSearch(e.target.value); setCurrentPage(1); }}
            className="w-full pl-11 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm placeholder-slate-400 focus:outline-none focus:border-primary focus:bg-white transition-all min-h-[44px]"
          />
        </div>
      </div>

      {/* Table & Cards section */}
      {loading ? (
        <SkeletonLoader type="table" rows={6} />
      ) : filteredUsers.length === 0 ? (
        <EmptyState
          title="User Tidak Ditemukan"
          description={search ? `Pencarian "${search}" tidak menemukan kecocokan.` : 'Belum ada data user terdaftar.'}
          actionLabel="Tambah User Baru"
          onAction={handleOpenAdd}
        />
      ) : (
        <div className="space-y-4">
          
          {/* Table for Laptop / Desktop (MD up) */}
          <div className="hidden md:block bg-white rounded-xl border border-slate-200 overflow-hidden shadow-soft">
            <div className="overflow-x-auto">
              <table className="w-full border-collapse text-left text-sm">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 font-semibold">
                    <th className="px-6 py-4">Nama</th>
                    <th className="px-6 py-4">Email</th>
                    <th className="px-6 py-4">Role</th>
                    <th className="px-6 py-4 text-right">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-slate-700">
                  {currentItems.map((u) => (
                    <tr key={u.id} className="hover:bg-slate-50/50">
                      <td className="px-6 py-4 font-medium text-slate-900">{u.name || u.nama || '-'}</td>
                      <td className="px-6 py-4">{u.email}</td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold border ${
                          u.role === 'admin' 
                            ? 'bg-rose-50 border-rose-200 text-rose-800' 
                            : u.role === 'pembina' 
                            ? 'bg-blue-50 border-blue-200 text-blue-800' 
                            : 'bg-emerald-50 border-emerald-200 text-primary-800'
                        }`}>
                          {u.role}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right space-x-2">
                        <button
                          onClick={() => handleOpenDetail(u)}
                          className="inline-flex items-center justify-center p-2 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 min-h-[44px] min-w-[44px]"
                          title="Detail"
                        >
                          <Eye className="h-5 w-5" />
                        </button>
                        <button
                          onClick={() => handleOpenEdit(u)}
                          className="inline-flex items-center justify-center p-2 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 min-h-[44px] min-w-[44px]"
                          title="Edit"
                        >
                          <Edit className="h-5 w-5" />
                        </button>
                        <button
                          onClick={() => handleDeleteClick(u.id)}
                          className="inline-flex items-center justify-center p-2 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 min-h-[44px] min-w-[44px]"
                          title="Hapus"
                        >
                          <Trash2 className="h-5 w-5" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Cards for Mobile viewport */}
          <div className="grid grid-cols-1 gap-4 md:hidden">
            {currentItems.map((u) => (
              <div key={u.id} className="bg-white border border-slate-200 p-5 rounded-2xl shadow-soft space-y-4">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="font-bold text-slate-800 text-base">{u.name || u.nama || 'User Baru'}</h3>
                    <p className="text-xs text-slate-400 mt-0.5">{u.email}</p>
                  </div>
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-semibold border ${
                    u.role === 'admin' 
                      ? 'bg-rose-50 border-rose-200 text-rose-800' 
                      : u.role === 'pembina' 
                      ? 'bg-blue-50 border-blue-200 text-blue-800' 
                      : 'bg-emerald-50 border-emerald-200 text-primary-800'
                  }`}>
                    {u.role}
                  </span>
                </div>
                <div className="flex space-x-2 pt-2 border-t border-slate-100 justify-end">
                  <button
                    onClick={() => handleOpenDetail(u)}
                    className="flex-1 inline-flex items-center justify-center px-3 py-2 text-xs font-semibold text-slate-600 bg-slate-50 border border-slate-200 rounded-lg hover:bg-slate-100 min-h-[44px]"
                  >
                    <Eye className="h-4 w-4 mr-1.5" /> Detail
                  </button>
                  <button
                    onClick={() => handleOpenEdit(u)}
                    className="flex-1 inline-flex items-center justify-center px-3 py-2 text-xs font-semibold text-slate-600 bg-slate-50 border border-slate-200 rounded-lg hover:bg-slate-100 min-h-[44px]"
                  >
                    <Edit className="h-4 w-4 mr-1.5" /> Edit
                  </button>
                  <button
                    onClick={() => handleDeleteClick(u.id)}
                    className="flex-1 inline-flex items-center justify-center px-3 py-2 text-xs font-semibold text-white bg-red-600 rounded-lg hover:bg-red-700 min-h-[44px]"
                  >
                    <Trash2 className="h-4 w-4 mr-1.5" /> Hapus
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Pagination Controls */}
          {totalPages > 1 && (
            <div className="flex items-center justify-center space-x-2 pt-4">
              <button
                onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                disabled={currentPage === 1}
                className="px-3 py-1.5 text-xs font-medium text-slate-600 bg-white border border-slate-200 rounded-lg disabled:opacity-50 min-h-[44px]"
              >
                Kembali
              </button>
              <span className="text-xs text-slate-500">Halaman {currentPage} dari {totalPages}</span>
              <button
                onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                disabled={currentPage === totalPages}
                className="px-3 py-1.5 text-xs font-medium text-slate-600 bg-white border border-slate-200 rounded-lg disabled:opacity-50 min-h-[44px]"
              >
                Lanjut
              </button>
            </div>
          )}
        </div>
      )}

      {/* Fullscreen on Mobile / Centered on Desktop CRUD Modal */}
      <AnimatePresence>
        {modalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-0 sm:p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.2 }}
              className="w-full h-full sm:h-auto sm:max-w-md bg-white sm:rounded-2xl shadow-xl flex flex-col justify-between overflow-hidden"
            >
              
              {/* Modal Header */}
              <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50">
                <h3 className="font-bold text-slate-800">
                  {modalType === 'add' ? 'Tambah User Baru' : modalType === 'edit' ? 'Edit Data User' : 'Detail Data User'}
                </h3>
                <button
                  onClick={() => setModalOpen(false)}
                  className="p-2 hover:bg-slate-100 rounded-full text-slate-400 hover:text-slate-600 min-h-[44px] min-w-[44px]"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              {/* Modal Body */}
              <div className="p-6 overflow-y-auto flex-1 space-y-4 text-sm">
                {modalType === 'detail' ? (
                  <div className="space-y-4">
                    <div className="border-b border-slate-100 pb-3">
                      <p className="text-[10px] text-slate-400 font-bold uppercase">Nama Lengkap</p>
                      <p className="font-bold text-slate-800 text-base mt-0.5">{selectedUser?.name || selectedUser?.nama || '-'}</p>
                    </div>
                    <div className="border-b border-slate-100 pb-3">
                      <p className="text-[10px] text-slate-400 font-bold uppercase">Alamat Email</p>
                      <p className="font-semibold text-slate-700 mt-0.5">{selectedUser?.email}</p>
                    </div>
                    <div className="pb-2">
                      <p className="text-[10px] text-slate-400 font-bold uppercase">Level / Peran Akses</p>
                      <span className="inline-block mt-1.5 px-3 py-1 text-xs font-semibold bg-emerald-50 border border-emerald-200 text-primary rounded-full capitalize">
                        {selectedUser?.role}
                      </span>
                    </div>
                  </div>
                ) : (
                  <form id="userForm" onSubmit={handleSubmit} className="space-y-4">
                    <div className="space-y-1">
                      <label htmlFor="name" className="text-xs font-semibold text-slate-700">Nama Lengkap</label>
                      <input
                        type="text"
                        id="name"
                        value={formData.name}
                        onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                        placeholder="Kak Roni Hermawan"
                        className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm placeholder-slate-400 focus:outline-none focus:border-primary min-h-[44px]"
                      />
                    </div>
                    <div className="space-y-1">
                      <label htmlFor="email" className="text-xs font-semibold text-slate-700">Alamat Email</label>
                      <input
                        type="email"
                        id="email"
                        value={formData.email}
                        onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                        placeholder="roni@gmail.com"
                        className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm placeholder-slate-400 focus:outline-none focus:border-primary min-h-[44px]"
                        required
                        disabled={modalType === 'edit'}
                      />
                    </div>
                    <div className="space-y-1">
                      <label htmlFor="role" className="text-xs font-semibold text-slate-700">Level Akses</label>
                      <select
                        id="role"
                        value={formData.role}
                        onChange={(e) => setFormData(prev => ({ ...prev, role: e.target.value }))}
                        className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-primary min-h-[44px]"
                      >
                        <option value="admin">Admin</option>
                        <option value="pembina">Pembina</option>
                        <option value="siswa">Siswa</option>
                      </select>
                    </div>
                    <div className="space-y-1">
                      <label htmlFor="pass" className="text-xs font-semibold text-slate-700">
                        Kata Sandi {modalType === 'edit' && '(Kosongkan jika tak diubah)'}
                      </label>
                      <input
                        type="password"
                        id="pass"
                        value={formData.password}
                        onChange={(e) => setFormData(prev => ({ ...prev, password: e.target.value }))}
                        placeholder="••••••••"
                        className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm placeholder-slate-400 focus:outline-none focus:border-primary min-h-[44px]"
                        required={modalType === 'add'}
                      />
                    </div>
                  </form>
                )}
              </div>

              {/* Modal Footer */}
              <div className="flex px-6 py-4 border-t border-slate-100 bg-slate-50 justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="px-5 py-2.5 text-sm font-semibold text-slate-600 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 min-h-[44px]"
                >
                  Tutup
                </button>
                {modalType !== 'detail' && (
                  <button
                    type="submit"
                    form="userForm"
                    disabled={formLoading}
                    className="px-5 py-2.5 text-sm font-bold text-white bg-primary rounded-lg hover:bg-primary-700 min-h-[44px]"
                  >
                    {formLoading ? 'Memproses...' : 'Simpan'}
                  </button>
                )}
              </div>

            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Delete Dialog */}
      <ConfirmDialog
        isOpen={deleteOpen}
        title="Hapus Akun Pengguna"
        message="Apakah Anda yakin ingin menghapus akun user ini? Akses login mereka akan langsung dinonaktifkan."
        onConfirm={handleDeleteConfirm}
        onCancel={() => setDeleteOpen(false)}
        isLoading={deleteLoading}
      />

    </div>
  );
};

export default Users;
