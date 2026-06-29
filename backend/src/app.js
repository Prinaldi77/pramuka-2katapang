const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const path = require('path');
require('dotenv').config();

const { sendError } = require('./utils/responseHelper');

// Import router
const authRoutes = require('./routes/authRoutes');
const userRoutes = require('./routes/userRoutes');
const siswaRoutes = require('./routes/siswaRoutes');
const pembinaRoutes = require('./routes/pembinaRoutes');
const profilRoutes = require('./routes/profilRoutes');
const beritaRoutes = require('./routes/beritaRoutes');
const kegiatanRoutes = require('./routes/kegiatanRoutes');
const prestasiRoutes = require('./routes/prestasiRoutes');
const galeriRoutes = require('./routes/galeriRoutes');
const pesanRoutes = require('./routes/pesanRoutes');
const pengurusRoutes = require('./routes/pengurusRoutes');
const agendaRoutes = require('./routes/agendaRoutes');
const absensiRoutes = require('./routes/absensiRoutes');
const androidAbsensiRoutes = require('./routes/androidAbsensiRoutes');
const nilaiRoutes = require('./routes/nilaiRoutes');
const pengaturanRoutes = require('./routes/pengaturanRoutes');
const piketRoutes = require('./routes/piketRoutes');
const profileRoutes = require('./routes/profileRoutes');
const attendanceRoutes = require('./routes/attendanceRoutes');

const app = express();

// Middleware umum
app.use(helmet({
  crossOriginResourcePolicy: { policy: "cross-origin" }
}));
app.use(cors());

// Batasan limit request
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 menit
  max: 300, // Maksimal 300 request per 15 menit dari satu IP
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: 'Terlalu banyak permintaan dari IP ini, silakan coba lagi setelah 15 menit.'
  }
});
app.use('/api', apiLimiter);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// File statis untuk uploads
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// Health check endpoint utama
app.get('/', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Welcome to REST API Sistem Informasi Pramuka SMPN 2 Katapang.'
  });
});

// Daftar rute API
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/siswa', siswaRoutes);
app.use('/api/pembina', pembinaRoutes);
app.use('/api/profil', profilRoutes);
app.use('/api/berita', beritaRoutes);
app.use('/api/kegiatan', kegiatanRoutes);
app.use('/api/prestasi', prestasiRoutes);
app.use('/api/galeri', galeriRoutes);
app.use('/api/pesan', pesanRoutes);
app.use('/api/pengurus', pengurusRoutes);
app.use('/api/agenda', agendaRoutes);
app.use('/api/absensi', absensiRoutes);
app.use('/api/android-absensi', androidAbsensiRoutes);
app.use('/api/nilai', nilaiRoutes);
app.use('/api/pengaturan', pengaturanRoutes);
app.use('/api/piket', piketRoutes);
app.use('/api/profile', profileRoutes);
app.use('/api/attendance', attendanceRoutes);

// Tangani rute tidak ditemukan (404)
app.use((req, res) => {
  return sendError(res, `Endpoint ${req.originalUrl} tidak ditemukan.`, 404);
});

// Penanganan error global
app.use((err, req, res, next) => {
  console.error('API Error: ', err.stack || err);
  
  const statusCode = err.status || err.statusCode || 500;
  const errMessage = err.message || 'Terjadi kesalahan internal pada server.';
  
  return sendError(res, errMessage, statusCode);
});

module.exports = app;
