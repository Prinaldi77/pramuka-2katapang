import React, { lazy } from 'react';
import { createBrowserRouter, Navigate } from 'react-router-dom';

// Layout wrappers
import PublicLayout from '../components/layout/PublicLayout';
import DashboardLayout from '../components/layout/DashboardLayout';
import ProtectedRoute from './ProtectedRoute';

// Public pages
const Home = lazy(() => import('../pages/public/Home'));
const Profil = lazy(() => import('../pages/public/Profil'));
const Kepengurusan = lazy(() => import('../pages/public/Kepengurusan'));
const Kegiatan = lazy(() => import('../pages/public/Kegiatan'));
const DetailKegiatan = lazy(() => import('../pages/public/DetailKegiatan'));
const Prestasi = lazy(() => import('../pages/public/Prestasi'));
// const Galeri = lazy(() => import('../pages/public/Galeri'));
const Kontak = lazy(() => import('../pages/public/Kontak'));
const Login = lazy(() => import('../pages/public/Login'));

// Admin pages
const AdminDashboard = lazy(() => import('../pages/admin/Dashboard'));
const AdminUsers = lazy(() => import('../pages/admin/Users'));
const AdminSiswa = lazy(() => import('../pages/admin/Siswa'));
const AdminPembina = lazy(() => import('../pages/admin/Pembina'));
const AdminProfilGudep = lazy(() => import('../pages/admin/ProfilGudep'));
const AdminKegiatan = lazy(() => import('../pages/admin/Kegiatan'));
const AdminPrestasi = lazy(() => import('../pages/admin/Prestasi'));
// const AdminGaleri = lazy(() => import('../pages/admin/Galeri'));
const AdminPesan = lazy(() => import('../pages/admin/Pesan'));
const AdminAgenda = lazy(() => import('../pages/admin/AgendaAbsensi'));
const AbsensiAndroid = lazy(() => import('../pages/admin/AbsensiAndroid'));
const AdminNilai = lazy(() => import('../pages/admin/Penilaian'));
const AdminPengurus = lazy(() => import('../pages/admin/Pengurus'));
const AdminPengaturan = lazy(() => import('../pages/admin/Pengaturan'));
const AdminPiket = lazy(() => import('../pages/admin/Piket'));

// Pembina pages
const PembinaDashboard = lazy(() => import('../pages/pembina/Dashboard'));
const PembinaSiswa = lazy(() => import('../pages/pembina/Siswa'));
const PembinaAgenda = lazy(() => import('../pages/pembina/AgendaAbsensi'));
const PembinaAbsensi = lazy(() => import('../pages/pembina/Absensi'));
const PembinaNilai = lazy(() => import('../pages/pembina/Penilaian'));
const PembinaPengurus = lazy(() => import('../pages/pembina/Pengurus'));

// Siswa pages
const SiswaDashboard = lazy(() => import('../pages/siswa/Dashboard'));
const SiswaProfilSaya = lazy(() => import('../pages/siswa/ProfilSaya'));
const SiswaAbsensiSaya = lazy(() => import('../pages/siswa/AbsensiSaya'));
const SiswaNilaiSaya = lazy(() => import('../pages/siswa/NilaiSaya'));
const SiswaAnggota = lazy(() => import('../pages/siswa/Anggota'));
const SiswaKalender = lazy(() => import('../pages/siswa/Kalender'));
const SiswaMenuLainnya = lazy(() => import('../pages/siswa/MenuLainnya'));

export const router = createBrowserRouter([
  // Public website routes
  {
    path: '/',
    element: <PublicLayout />,
    children: [
      { index: true, element: <Home /> },
      { path: 'profil', element: <Profil /> },
      { path: 'kepengurusan', element: <Kepengurusan /> },
      { path: 'kegiatan', element: <Kegiatan /> },
      { path: 'kegiatan/:id', element: <DetailKegiatan /> },
      { path: 'prestasi', element: <Prestasi /> },
      { path: 'galeri', element: <Navigate to="/kegiatan" replace /> },
      { path: 'kontak', element: <Kontak /> },
      { path: 'login', element: <Login /> },
    ],
  },
  
  // Admin dashboard workspace
  {
    path: '/admin',
    element: (
      <ProtectedRoute allowedRoles={['admin']}>
        <DashboardLayout />
      </ProtectedRoute>
    ),
    children: [
      { index: true, element: <Navigate to="/admin/dashboard" replace /> },
      { path: 'dashboard', element: <AdminDashboard /> },
      { path: 'users', element: <AdminUsers /> },
      { path: 'siswa', element: <AdminSiswa /> },
      { path: 'pembina', element: <AdminPembina /> },
      { path: 'profil', element: <AdminProfilGudep /> },
      { path: 'kegiatan', element: <AdminKegiatan /> },
      { path: 'prestasi', element: <AdminPrestasi /> },
      { path: 'galeri', element: <Navigate to="/admin/kegiatan" replace /> },
      { path: 'pesan', element: <AdminPesan /> },
      { path: 'agenda', element: <AdminAgenda /> },
      { path: 'absensi', element: <AbsensiAndroid /> },
      { path: 'nilai', element: <AdminNilai /> },
      { path: 'pengurus', element: <AdminPengurus /> },
      { path: 'pengaturan', element: <AdminPengaturan /> },
      { path: 'piket', element: <AdminPiket /> },
    ],
  },

  // Pembina dashboard workspace
  {
    path: '/pembina',
    element: (
      <ProtectedRoute allowedRoles={['pembina']}>
        <DashboardLayout />
      </ProtectedRoute>
    ),
    children: [
      { index: true, element: <Navigate to="/pembina/dashboard" replace /> },
      { path: 'dashboard', element: <PembinaDashboard /> },
      { path: 'siswa', element: <PembinaSiswa /> },
      { path: 'agenda', element: <PembinaAgenda /> },
      { path: 'absensi', element: <PembinaAbsensi /> },
      { path: 'nilai', element: <PembinaNilai /> },
      { path: 'pengurus', element: <PembinaPengurus /> },
    ],
  },

  // Siswa dashboard workspace
  {
    path: '/siswa',
    element: (
      <ProtectedRoute allowedRoles={['siswa']}>
        <DashboardLayout />
      </ProtectedRoute>
    ),
    children: [
      { index: true, element: <Navigate to="/siswa/dashboard" replace /> },
      { path: 'dashboard', element: <SiswaDashboard /> },
      { path: 'profil', element: <SiswaProfilSaya /> },
      { path: 'absensi', element: <SiswaAbsensiSaya /> },
      { path: 'nilai', element: <SiswaNilaiSaya /> },
      { path: 'anggota', element: <SiswaAnggota /> },
      { path: 'kalender', element: <SiswaKalender /> },
      { path: 'menu-lainnya', element: <SiswaMenuLainnya /> },
    ],
  },

  // Catch-all redirect to Home
  {
    path: '*',
    element: <Navigate to="/" replace />,
  },
]);
