const SiswaModel = require('../models/siswaModel');
const PembinaModel = require('../models/pembinaModel');
const UserModel = require('../models/userModel');
const { sendSuccess, sendError } = require('../utils/responseHelper');

// Ambil data profil pribadi user yang sedang login
const getMe = async (req, res, next) => {
  try {
    const user = req.user;
    
    // Susun data struktur profil default
    let profileData = {
      id: user.id,
      name: user.nama,
      email: user.email,
      role: user.role,
      phone: '',
      rank: '',
      regu: '',
      avatar: user.foto_profil || '',
      gugusDepan: '',
      nomorInduk: '',
      jabatan: '',
      isActive: true,
      kelas: '',
      jenis_kelamin: ''
    };

    if (user.role === 'siswa') {
      const siswa = await SiswaModel.findByUserId(user.id);

      if (siswa) {
        profileData.nomorInduk = siswa.nis || '';
        profileData.gugusDepan = siswa.kelas || '';
        profileData.kelas = siswa.kelas || '';
        profileData.phone = siswa.no_hp_ortu || '';
        profileData.jenis_kelamin = siswa.jenis_kelamin || 'Laki-laki';
        profileData.jabatan = 'Siswa';
      }
    } else if (user.role === 'pembina') {
      const pembina = await PembinaModel.findByUserId(user.id);

      if (pembina) {
        profileData.jabatan = pembina.jabatan || 'Pembina';
      }
    }

    return sendSuccess(res, 'Profil user berhasil diambil.', profileData);
  } catch (error) {
    next(error);
  }
};

// Update profil pribadi user yang sedang login
const updateProfile = async (req, res, next) => {
  try {
    const user = req.user;
    const { fullName, name, phoneNumber, phone, gugusDepan, kelas, nomorInduk, nis, jabatan, avatar, foto_profil, password, jenisKelamin, jenis_kelamin } = req.body;

    const newName = fullName || name;
    const newPhone = phoneNumber || phone;
    const newKelas = kelas || gugusDepan;
    const newNis = nomorInduk || nis;
    const newAvatar = avatar || foto_profil;
    const newJenisKelamin = jenisKelamin || jenis_kelamin;

    const userUpdates = {};
    if (newName) userUpdates.nama = newName;
    if (newAvatar !== undefined) userUpdates.foto_profil = newAvatar;

    if (password) {
      const bcrypt = require('bcryptjs');
      const salt = await bcrypt.genSalt(10);
      userUpdates.password = await bcrypt.hash(password, salt);
    }

    // 1. Update tabel users (nama, foto_profil, password jika ada)
    if (Object.keys(userUpdates).length > 0) {
      await UserModel.update(user.id, userUpdates);
    }

    // 2. Update tabel spesifik berdasarkan role
    if (user.role === 'siswa') {
      // Periksa apakah profil siswa sudah ada di tabel siswa
      const existingSiswa = await SiswaModel.findByUserId(user.id);

      const siswaUpdates = {};
      if (newNis !== undefined) siswaUpdates.nis = newNis;
      if (newKelas !== undefined) siswaUpdates.kelas = newKelas;
      if (newPhone !== undefined) siswaUpdates.no_hp_ortu = newPhone;
      if (newJenisKelamin !== undefined) siswaUpdates.jenis_kelamin = newJenisKelamin;

      if (existingSiswa) {
        // Jika profil sudah ada, jalankan update
        await SiswaModel.update(existingSiswa.id, siswaUpdates);
      } else {
        // Jika profil belum ada, jalankan insert otomatis
        siswaUpdates.user_id = user.id;
        await SiswaModel.create(siswaUpdates);
      }
    } else if (user.role === 'pembina') {
      // Periksa apakah profil pembina sudah ada
      const existingPembina = await PembinaModel.findByUserId(user.id);

      const pembinaUpdates = {};
      if (jabatan !== undefined) pembinaUpdates.jabatan = jabatan;

      if (existingPembina) {
        await PembinaModel.update(existingPembina.id, pembinaUpdates);
      } else {
        pembinaUpdates.user_id = user.id;
        await PembinaModel.create(pembinaUpdates);
      }
    }

    // 3. Ambil data profil terbaru untuk dikembalikan ke client
    const updatedUser = await UserModel.findById(user.id);

    let profileData = {
      id: updatedUser.id,
      name: updatedUser.nama,
      email: updatedUser.email,
      role: updatedUser.role,
      phone: '',
      rank: '',
      regu: '',
      avatar: updatedUser.foto_profil || '',
      gugusDepan: '',
      nomorInduk: '',
      jabatan: '',
      isActive: true,
      kelas: '',
      jenis_kelamin: ''
    };

    if (updatedUser.role === 'siswa') {
      const siswa = await SiswaModel.findByUserId(updatedUser.id);
      
      if (siswa) {
        profileData.nomorInduk = siswa.nis || '';
        profileData.gugusDepan = siswa.kelas || '';
        profileData.kelas = siswa.kelas || '';
        profileData.phone = siswa.no_hp_ortu || '';
        profileData.jenis_kelamin = siswa.jenis_kelamin || 'Laki-laki';
      }
      profileData.jabatan = 'Siswa';
    } else if (updatedUser.role === 'pembina') {
      const pembina = await PembinaModel.findByUserId(updatedUser.id);
      if (pembina) {
        profileData.jabatan = pembina.jabatan || 'Pembina';
      }
    }

    return sendSuccess(res, 'Profil berhasil diperbarui.', profileData);
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getMe,
  updateProfile
};
