const supabase = require('../config/supabase');
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
      avatar: '',
      gugusDepan: '',
      nomorInduk: '',
      jabatan: '',
      isActive: true,
      kelas: ''
    };

    if (user.role === 'siswa') {
      const { data: siswa, error } = await supabase
        .from('siswa')
        .select('*')
        .eq('user_id', user.id)
        .maybeSingle();

      if (siswa) {
        profileData.nomorInduk = siswa.nis || '';
        profileData.gugusDepan = siswa.kelas || '';
        profileData.kelas = siswa.kelas || '';
        profileData.phone = siswa.no_hp_ortu || '';
        profileData.jabatan = 'Siswa';
      }
    } else if (user.role === 'pembina') {
      const { data: pembina, error } = await supabase
        .from('pembina')
        .select('*')
        .eq('user_id', user.id)
        .maybeSingle();

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
    const { fullName, name, phoneNumber, phone, gugusDepan, kelas, nomorInduk, nis, jabatan } = req.body;

    const newName = fullName || name;
    const newPhone = phoneNumber || phone;
    const newKelas = kelas || gugusDepan;
    const newNis = nomorInduk || nis;

    // 1. Update tabel users (nama lengkap)
    if (newName) {
      const { error: userUpdateErr } = await supabase
        .from('users')
        .update({ nama: newName })
        .eq('id', user.id);
      
      if (userUpdateErr) throw userUpdateErr;
    }

    // 2. Update tabel spesifik berdasarkan role
    if (user.role === 'siswa') {
      // Periksa apakah profil siswa sudah ada di tabel siswa
      const { data: existingSiswa, error: fetchErr } = await supabase
        .from('siswa')
        .select('id')
        .eq('user_id', user.id)
        .maybeSingle();
      
      if (fetchErr) throw fetchErr;

      const siswaUpdates = {};
      if (newNis !== undefined) siswaUpdates.nis = newNis;
      if (newKelas !== undefined) siswaUpdates.kelas = newKelas;
      if (newPhone !== undefined) siswaUpdates.no_hp_ortu = newPhone;

      if (existingSiswa) {
        // Jika profil sudah ada, jalankan update
        const { error: siswaUpdateErr } = await supabase
          .from('siswa')
          .update(siswaUpdates)
          .eq('user_id', user.id);

        if (siswaUpdateErr) throw siswaUpdateErr;
      } else {
        // Jika profil belum ada, jalankan insert otomatis
        siswaUpdates.user_id = user.id;
        const { error: siswaInsertErr } = await supabase
          .from('siswa')
          .insert([siswaUpdates]);

        if (siswaInsertErr) throw siswaInsertErr;
      }
    } else if (user.role === 'pembina') {
      // Periksa apakah profil pembina sudah ada
      const { data: existingPembina, error: fetchErr } = await supabase
        .from('pembina')
        .select('id')
        .eq('user_id', user.id)
        .maybeSingle();
      
      if (fetchErr) throw fetchErr;

      const pembinaUpdates = {};
      if (jabatan !== undefined) pembinaUpdates.jabatan = jabatan;

      if (existingPembina) {
        const { error: pembinaUpdateErr } = await supabase
          .from('pembina')
          .update(pembinaUpdates)
          .eq('user_id', user.id);

        if (pembinaUpdateErr) throw pembinaUpdateErr;
      } else {
        pembinaUpdates.user_id = user.id;
        const { error: pembinaInsertErr } = await supabase
          .from('pembina')
          .insert([pembinaUpdates]);

        if (pembinaInsertErr) throw pembinaInsertErr;
      }
    }

    // 3. Ambil data profil terbaru untuk dikembalikan ke client
    const { data: updatedUser } = await supabase
      .from('users')
      .select('*')
      .eq('id', user.id)
      .single();

    let profileData = {
      id: updatedUser.id,
      name: updatedUser.nama,
      email: updatedUser.email,
      role: updatedUser.role,
      phone: '',
      rank: '',
      regu: '',
      avatar: '',
      gugusDepan: '',
      nomorInduk: '',
      jabatan: '',
      isActive: true,
      kelas: ''
    };

    if (updatedUser.role === 'siswa') {
      const { data: siswa } = await supabase
        .from('siswa')
        .select('*')
        .eq('user_id', updatedUser.id)
        .maybeSingle();
      
      if (siswa) {
        profileData.nomorInduk = siswa.nis || '';
        profileData.gugusDepan = siswa.kelas || '';
        profileData.kelas = siswa.kelas || '';
        profileData.phone = siswa.no_hp_ortu || '';
      }
      profileData.jabatan = 'Siswa';
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
