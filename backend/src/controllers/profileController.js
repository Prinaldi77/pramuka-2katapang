const supabase = require('../config/supabase');
const { sendSuccess, sendError } = require('../utils/responseHelper');

/**
 * Get personal profile for logged-in user
 */
const getMe = async (req, res, next) => {
  try {
    const user = req.user;
    
    // Fetch full profile detail based on role
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

/**
 * Update personal profile
 */
const updateProfile = async (req, res, next) => {
  try {
    const user = req.user;
    const { fullName, name, phoneNumber, phone, gugusDepan, kelas, nomorInduk, nis, jabatan } = req.body;

    const newName = fullName || name;
    const newPhone = phoneNumber || phone;
    const newKelas = kelas || gugusDepan;
    const newNis = nomorInduk || nis;

    // 1. Update users table (name/nama)
    if (newName) {
      const { error: userUpdateErr } = await supabase
        .from('users')
        .update({ nama: newName })
        .eq('id', user.id);
      
      if (userUpdateErr) throw userUpdateErr;
    }

    // 2. Update specific table based on role
    if (user.role === 'siswa') {
      // Check if student profile row already exists in the 'siswa' table
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
        // If it exists, perform an update
        const { error: siswaUpdateErr } = await supabase
          .from('siswa')
          .update(siswaUpdates)
          .eq('user_id', user.id);

        if (siswaUpdateErr) throw siswaUpdateErr;
      } else {
        // If it does not exist (admin only created the User account, not the profile), perform an insert automatically
        siswaUpdates.user_id = user.id;
        const { error: siswaInsertErr } = await supabase
          .from('siswa')
          .insert([siswaUpdates]);

        if (siswaInsertErr) throw siswaInsertErr;
      }
    } else if (user.role === 'pembina') {
      // Check if pembina profile already exists
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

    // 3. Fetch and return the updated profile details safely
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
