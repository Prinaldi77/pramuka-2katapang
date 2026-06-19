import React from 'react';
import { createBrowserRouter, Navigate } from 'react-router-dom';

// Layout wrappers
import PublicLayout from '../components/layout/PublicLayout';
import DashboardLayout from '../components/layout/DashboardLayout';
import ProtectedRoute from './ProtectedRoute';

// Public pages
import Home from '../pages/public/Home';
import Profil from '../pages/public/Profil';
import Berita from '../pages/public/Berita';
import DetailBerita from '../pages/public/DetailBerita';
import Kegiatan from '../pages/public/Kegiatan';
import DetailKegiatan from '../pages/public/DetailKegiatan';
import Prestasi from '../pages/public/Prestasi';
import Galeri from '../pages/public/Galeri';
import Kontak from '../pages/public/Kontak';
import Login from '../pages/public/Login';

// Admin pages
import AdminDashboard from '../pages/admin/Dashboard';
import AdminUsers from '../pages/admin/Users';
import AdminSiswa from '../pages/admin/Siswa';
import AdminPembina from '../pages/admin/Pembina';
import AdminProfilGudep from '../pages/admin/ProfilGudep';
import AdminBerita from '../pages/admin/Berita';
import AdminKegiatan from '../pages/admin/Kegiatan';
import AdminPrestasi from '../pages/admin/Prestasi';
import AdminGaleri from '../pages/admin/Galeri';
import AdminPesan from '../pages/admin/Pesan';
import AdminAgenda from '../pages/admin/AgendaAbsensi';
import AdminAbsensi from '../pages/admin/Absensi';
import AbsensiAndroid from '../pages/admin/AbsensiAndroid';
import AdminNilai from '../pages/admin/Penilaian';
import AdminPengurus from '../pages/admin/Pengurus';
import AdminPengaturan from '../pages/admin/Pengaturan';

// Pembina pages
import PembinaDashboard from '../pages/pembina/Dashboard';
import PembinaSiswa from '../pages/pembina/Siswa';
import PembinaAgenda from '../pages/pembina/AgendaAbsensi';
import PembinaAbsensi from '../pages/pembina/Absensi';
import PembinaNilai from '../pages/pembina/Penilaian';
import PembinaPengurus from '../pages/pembina/Pengurus';

// Siswa pages
import SiswaDashboard from '../pages/siswa/Dashboard';
import SiswaProfilSaya from '../pages/siswa/ProfilSaya';
import SiswaAbsensiSaya from '../pages/siswa/AbsensiSaya';
import SiswaNilaiSaya from '../pages/siswa/NilaiSaya';

export const router = createBrowserRouter([
  // Public website routes
  {
    path: '/',
    element: <PublicLayout />,
    children: [
      { index: true, element: <Home /> },
      { path: 'profil', element: <Profil /> },
      { path: 'berita', element: <Berita /> },
      { path: 'berita/:id', element: <DetailBerita /> },
      { path: 'kegiatan', element: <Kegiatan /> },
      { path: 'kegiatan/:id', element: <DetailKegiatan /> },
      { path: 'prestasi', element: <Prestasi /> },
      { path: 'galeri', element: <Galeri /> },
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
      { path: 'berita', element: <AdminBerita /> },
      { path: 'kegiatan', element: <AdminKegiatan /> },
      { path: 'prestasi', element: <AdminPrestasi /> },
      { path: 'galeri', element: <AdminGaleri /> },
      { path: 'pesan', element: <AdminPesan /> },
      { path: 'agenda', element: <AdminAgenda /> },
      { path: 'absensi', element: <AbsensiAndroid /> },
      { path: 'nilai', element: <AdminNilai /> },
      { path: 'pengurus', element: <AdminPengurus /> },
      { path: 'pengaturan', element: <AdminPengaturan /> },
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
    ],
  },

  // Catch-all redirect to Home
  {
    path: '*',
    element: <Navigate to="/" replace />,
  },
]);
