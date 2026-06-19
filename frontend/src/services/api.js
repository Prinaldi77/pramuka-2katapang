import axios from 'axios';

// Log for debugging production URL
console.log('Current VITE_API_URL:', import.meta.env.VITE_API_URL);

// Base Axios instance
const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_URL || '/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request Interceptor: Automatically inject JWT token from localStorage
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response Interceptor: Redirect to login on 401 Unauthorized, and unwrap response envelopes
apiClient.interceptors.response.use(
  (response) => {
    // If response contains data and success is true, unwrap the data property
    if (response.data && response.data.success === true && response.data.data !== undefined) {
      response.data = response.data.data;
    }
    return response;
  },
  (error) => {
    if (error.response && error.response.status === 401) {
      const token = localStorage.getItem('token');
      const isDashboardRoute = window.location.pathname.startsWith('/admin') ||
                               window.location.pathname.startsWith('/pembina') ||
                               window.location.pathname.startsWith('/siswa');
      if (token || isDashboardRoute) {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

// ==========================================
// API SERVICES EXPORT
// ==========================================
export const api = {
  // Auth API
  auth: {
    login: async (email, password) => {
      // 1. Authenticate with email/password
      const loginRes = await apiClient.post('/auth/login', { email, password });
      const { token, user } = loginRes.data;
      
      // Save token temporarily so subsequent request carries it
      localStorage.setItem('token', token);
      
      // 2. Fetch full profile to get siswa/pembina association id
      const profileRes = await apiClient.get('/auth/profile');
      const fullProfile = profileRes.data;
      
      // Construct the local user object with appropriate IDs
      const mappedUser = {
        id: fullProfile.id,
        email: fullProfile.email,
        role: fullProfile.role,
        name: fullProfile.nama || fullProfile.name || '',
      };
      
      if (fullProfile.role === 'siswa' && fullProfile.siswa) {
        mappedUser.siswaId = fullProfile.siswa.id;
      } else if (fullProfile.role === 'pembina' && fullProfile.pembina) {
        mappedUser.pembinaId = fullProfile.pembina.id;
      }
      
      localStorage.setItem('user', JSON.stringify(mappedUser));
      return { data: { token, user: mappedUser } };
    },
    logout: () => {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
    },
  },

  // Users Management
  users: {
    getAll: async () => {
      const res = await apiClient.get('/users');
      res.data = (res.data || []).map(u => ({
        ...u,
        name: u.nama || u.name || ''
      }));
      return res;
    },
    getById: async (id) => {
      const res = await apiClient.get(`/users/${id}`);
      if (res.data) {
        res.data = {
          ...res.data,
          name: res.data.nama || res.data.name || ''
        };
      }
      return res;
    },
    create: async (data) => {
      const payload = {
        ...data,
        nama: data.name || data.nama
      };
      return apiClient.post('/users', payload);
    },
    update: async (id, data) => {
      const payload = {
        ...data,
        nama: data.name || data.nama
      };
      return apiClient.put(`/users/${id}`, payload);
    },
    delete: async (id) => {
      return apiClient.delete(`/users/${id}`);
    },
  },

  // Siswa Management
  siswa: {
    getAll: async () => {
      const res = await apiClient.get('/siswa');
      res.data = (res.data || []).map(s => ({
        ...s,
        nama: s.users?.nama || s.users?.name || '',
        email: s.users?.email || '',
        nama_orang_tua: s.nama_ortu || '',
        nomor_hp_orang_tua: s.no_hp_ortu || ''
      }));
      return res;
    },
    getById: async (id) => {
      const res = await apiClient.get(`/siswa/${id}`);
      if (res.data) {
        res.data = {
          ...res.data,
          nama: res.data.users?.nama || res.data.users?.name || '',
          email: res.data.users?.email || '',
          nama_orang_tua: res.data.nama_ortu || '',
          nomor_hp_orang_tua: res.data.no_hp_ortu || ''
        };
      }
      return res;
    },
    create: async (data) => {
      // 1. Create user account first
      const userPayload = {
        name: data.nama,
        nama: data.nama,
        email: data.email || `${data.nis}@pramukasmpn2katapang.sch.id`,
        role: 'siswa',
        password: 'password'
      };
      const userRes = await apiClient.post('/users', userPayload);
      const createdUser = userRes.data;
      
      // 2. Create student profile
      const siswaPayload = {
        user_id: createdUser.id,
        nis: data.nis,
        kelas: data.kelas,
        jenis_kelamin: data.jenis_kelamin,
        tempat_lahir: data.tempat_lahir || null,
        tanggal_lahir: data.tanggal_lahir || null,
        nama_ortu: data.nama_orang_tua || null,
        no_hp_ortu: data.nomor_hp_orang_tua || null
      };
      return apiClient.post('/siswa', siswaPayload);
    },
    update: async (id, data) => {
      const getRes = await apiClient.get(`/siswa/${id}`);
      const currentSiswa = getRes.data;
      if (currentSiswa && currentSiswa.user_id) {
        const userPayload = {};
          if (data.nama) {
            userPayload.name = data.nama;
            userPayload.nama = data.nama;
          }
          if (data.email) userPayload.email = data.email;
          await apiClient.put(`/users/${currentSiswa.user_id}`, userPayload);
      }
      const siswaPayload = {
        nis: data.nis,
        kelas: data.kelas,
        jenis_kelamin: data.jenis_kelamin,
        tempat_lahir: data.tempat_lahir || null,
        tanggal_lahir: data.tanggal_lahir || null,
        nama_ortu: data.nama_orang_tua || null,
        no_hp_ortu: data.nomor_hp_orang_tua || null
      };
      return apiClient.put(`/siswa/${id}`, siswaPayload);
    },
    delete: async (id) => {
      return apiClient.delete(`/siswa/${id}`);
    },
  },

  // Pembina Management
  pembina: {
    getAll: async () => {
      const res = await apiClient.get('/pembina');
      res.data = (res.data || []).map(p => ({
        ...p,
        nama: p.users?.nama || p.users?.name || '',
        email: p.users?.email || '',
        nip: p.nip || '-',
        telepon: p.telepon || '-'
      }));
      return res;
    },
    getById: async (id) => {
      const res = await apiClient.get(`/pembina/${id}`);
      if (res.data) {
        res.data = {
          ...res.data,
          nama: res.data.users?.nama || res.data.users?.name || '',
          email: res.data.users?.email || '',
          nip: res.data.nip || '-',
          telepon: res.data.telepon || '-'
        };
      }
      return res;
    },
    create: async (data) => {
      const emailVal = data.email || `pembina_${Date.now()}@pramukasmpn2katapang.sch.id`;
      const userPayload = {
        name: data.nama,
        nama: data.nama,
        email: emailVal,
        role: 'pembina',
        password: 'password'
      };
      const userRes = await apiClient.post('/users', userPayload);
      const createdUser = userRes.data;
      
      const pembinaPayload = {
        user_id: createdUser.id,
        jabatan: data.jabatan
      };
      return apiClient.post('/pembina', pembinaPayload);
    },
    update: async (id, data) => {
      const getRes = await apiClient.get(`/pembina/${id}`);
      const currentPembina = getRes.data;
      if (currentPembina && currentPembina.user_id) {
        const userPayload = {};
          if (data.nama) {
            userPayload.name = data.nama;
            userPayload.nama = data.nama;
          }
          if (data.email) userPayload.email = data.email;
          await apiClient.put(`/users/${currentPembina.user_id}`, userPayload);
      }
      const pembinaPayload = {
        jabatan: data.jabatan
      };
      return apiClient.put(`/pembina/${id}`, pembinaPayload);
    },
    delete: async (id) => {
      return apiClient.delete(`/pembina/${id}`);
    },
  },

  // Profil Gudep
  profil: {
    get: async () => {
      return apiClient.get('/profil');
    },
    update: async (data) => {
      return apiClient.put('/profil', data);
    },
  },

  // Berita
  berita: {
    getAll: async () => {
      const res = await apiClient.get('/berita');
      res.data = (res.data || []).map(b => ({
        ...b,
        tanggal: b.created_at ? b.created_at.split('T')[0] : ''
      }));
      return res;
    },
    getById: async (id) => {
      const res = await apiClient.get(`/berita/${id}`);
      if (res.data) {
        res.data = {
          ...res.data,
          tanggal: res.data.created_at ? res.data.created_at.split('T')[0] : ''
        };
      }
      return res;
    },
    create: async (formData) => {
      return apiClient.post('/berita', formData, { headers: { 'Content-Type': 'multipart/form-data' } });
    },
    update: async (id, formData) => {
      return apiClient.put(`/berita/${id}`, formData, { headers: { 'Content-Type': 'multipart/form-data' } });
    },
    delete: async (id) => {
      return apiClient.delete(`/berita/${id}`);
    },
  },

  // Kegiatan
  kegiatan: {
    getAll: async () => {
      return apiClient.get('/kegiatan');
    },
    getById: async (id) => {
      return apiClient.get(`/kegiatan/${id}`);
    },
    create: async (formData) => {
      return apiClient.post('/kegiatan', formData, { headers: { 'Content-Type': 'multipart/form-data' } });
    },
    update: async (id, formData) => {
      return apiClient.put(`/kegiatan/${id}`, formData, { headers: { 'Content-Type': 'multipart/form-data' } });
    },
    delete: async (id) => {
      return apiClient.delete(`/kegiatan/${id}`);
    },
  },

  // Prestasi
  prestasi: {
    getAll: async () => {
      const res = await apiClient.get('/prestasi');
      res.data = (res.data || []).map(p => ({
        ...p,
        judul: p.nama_prestasi || ''
      }));
      return res;
    },
    getById: async (id) => {
      const res = await apiClient.get(`/prestasi/${id}`);
      if (res.data) {
        res.data = {
          ...res.data,
          judul: res.data.nama_prestasi || ''
        };
      }
      return res;
    },
    create: async (data) => {
      const payload = {
        nama_prestasi: data.judul,
        deskripsi: data.deskripsi,
        tanggal: data.tanggal,
        gambar: data.gambar || null
      };
      return apiClient.post('/prestasi', payload);
    },
    update: async (id, data) => {
      const payload = {
        nama_prestasi: data.judul,
        deskripsi: data.deskripsi,
        tanggal: data.tanggal,
        gambar: data.gambar || null
      };
      return apiClient.put(`/prestasi/${id}`, payload);
    },
    delete: async (id) => {
      return apiClient.delete(`/prestasi/${id}`);
    },
  },

  // Galeri
  galeri: {
    getAll: async () => {
      return apiClient.get('/galeri');
    },
    create: async (formData) => {
      return apiClient.post('/galeri', formData, { headers: { 'Content-Type': 'multipart/form-data' } });
    },
    delete: async (id) => {
      return apiClient.delete(`/galeri/${id}`);
    },
  },

  // Pesan
  pesan: {
    getAll: async () => {
      return apiClient.get('/pesan');
    },
    getById: async (id) => {
      return apiClient.get(`/pesan/${id}`);
    },
    create: async (data) => {
      return apiClient.post('/pesan', data);
    },
    read: async (id) => {
      return apiClient.patch(`/pesan/${id}/read`);
    },
    delete: async (id) => {
      return apiClient.delete(`/pesan/${id}`);
    },
  },

  // Agenda Absensi
  agenda: {
    getAll: async () => {
      return apiClient.get('/agenda');
    },
    getById: async (id) => {
      return apiClient.get(`/agenda/${id}`);
    },
    create: async (data) => {
      return apiClient.post('/agenda', data);
    },
    update: async (id, data) => {
      return apiClient.put(`/agenda/${id}`, data);
    },
    delete: async (id) => {
      return apiClient.delete(`/agenda/${id}`);
    },
  },

  // Absensi GPS
  absensi: {
    getAll: async () => {
      return apiClient.get('/absensi');
    },
    getById: async (id) => {
      return apiClient.get(`/absensi/${id}`);
    },
    getBySiswa: async (siswaId) => {
      return apiClient.get(`/absensi/siswa/${siswaId}`);
    },
    getByAgenda: async (agendaId) => {
      return apiClient.get(`/absensi/agenda/${agendaId}`);
    },
    submit: async (data) => {
      return apiClient.post('/absensi', data);
    },
  },

  // Penilaian Siswa
  nilai: {
    getAll: async () => {
      const response = await apiClient.get('/nilai');
      const rawList = response.data || [];
      const absensiRes = await apiClient.get('/absensi');
      const agendaRes = await apiClient.get('/agenda');
      
      const totalAgenda = agendaRes.data?.length || 0;
      const absensiList = absensiRes.data || [];
      
      const gradesBySiswa = {};
      rawList.forEach((row) => {
        const sId = row.siswa_id;
        if (!gradesBySiswa[sId]) {
          gradesBySiswa[sId] = {
            id: row.id,
            siswa_id: sId,
            keaktifan: 0,
            kedisiplinan: 0,
            kerjasama: 0,
            tanggung_jawab: 0,
            kehadiran: 0,
            catatan: "Sangat baik dalam mengikuti kegiatan pramuka. Tingkatkan terus kedisiplinan dan keterampilan kepramukaan Anda!"
          };
        }
        
        if (row.kategori_nilai_id === 1) gradesBySiswa[sId].keaktifan = row.nilai;
        else if (row.kategori_nilai_id === 2) gradesBySiswa[sId].kedisiplinan = row.nilai;
        else if (row.kategori_nilai_id === 3) gradesBySiswa[sId].kerjasama = row.nilai;
        else if (row.kategori_nilai_id === 4) gradesBySiswa[sId].tanggung_jawab = row.nilai;
      });
      
      Object.keys(gradesBySiswa).forEach((sId) => {
        const studentAbsenCount = absensiList.filter(a => a.siswa_id === Number(sId)).length;
        const kehadiranScore = totalAgenda > 0 ? Math.round((studentAbsenCount / totalAgenda) * 100) : 0;
        gradesBySiswa[sId].kehadiran = kehadiranScore;
      });
      
      return {
        data: Object.values(gradesBySiswa)
      };
    },
    getBySiswa: async (siswaId) => {
      const res = await apiClient.get(`/nilai/${siswaId}`);
      const list = res.data || [];
      if (list.length === 0) return { data: null };
      
      const grouped = {
        id: list[0].id,
        siswa_id: Number(siswaId),
        keaktifan: 0,
        kedisiplinan: 0,
        kerjasama: 0,
        tanggung_jawab: 0,
        kehadiran: 0
      };
      list.forEach(row => {
        if (row.kategori_nilai_id === 1) grouped.keaktifan = row.nilai;
        else if (row.kategori_nilai_id === 2) grouped.kedisiplinan = row.nilai;
        else if (row.kategori_nilai_id === 3) grouped.kerjasama = row.nilai;
        else if (row.kategori_nilai_id === 4) grouped.tanggung_jawab = row.nilai;
      });
      
      const absensiRes = await apiClient.get('/absensi');
      const agendaRes = await apiClient.get('/agenda');
      const totalAgenda = agendaRes.data?.length || 0;
      const studentAbsenCount = (absensiRes.data || []).filter(a => a.siswa_id === Number(siswaId)).length;
      grouped.kehadiran = totalAgenda > 0 ? Math.round((studentAbsenCount / totalAgenda) * 100) : 0;
      
      return { data: grouped };
    },
    create: async (data) => {
      const promises = [
        apiClient.post('/nilai', { siswa_id: data.siswa_id, kategori_nilai_id: 1, nilai: data.keaktifan }),
        apiClient.post('/nilai', { siswa_id: data.siswa_id, kategori_nilai_id: 2, nilai: data.kedisiplinan }),
        apiClient.post('/nilai', { siswa_id: data.siswa_id, kategori_nilai_id: 3, nilai: data.kerjasama }),
        apiClient.post('/nilai', { siswa_id: data.siswa_id, kategori_nilai_id: 4, nilai: data.tanggung_jawab })
      ];
      await Promise.all(promises);
      return { data: { success: true } };
    },
    update: async (id, data) => {
      return api.nilai.create(data);
    },
    delete: async (id) => {
      const response = await apiClient.get('/nilai');
      const rawList = response.data || [];
      const target = rawList.find(n => n.id === Number(id));
      
      if (target) {
        const sId = target.siswa_id;
        const studentGrades = rawList.filter(n => n.siswa_id === sId);
        await Promise.all(studentGrades.map(n => apiClient.delete(`/nilai/${n.id}`)));
      }
      return { data: { success: true } };
    },
    getRapor: async (siswaId) => {
      const response = await apiClient.get(`/nilai/rapor/${siswaId}`);
      const raporData = response.data;
      const rataRata = raporData.rata_rata || 0;
      const predikat = rataRata >= 85 ? 'A (Sangat Baik)' : rataRata >= 75 ? 'B (Baik)' : rataRata >= 60 ? 'C (Cukup)' : 'D (Kurang)';
      return {
        data: {
          nilai: {
            kehadiran: raporData.kehadiran || 0,
            keaktifan: raporData.keaktifan || 0,
            kedisiplinan: raporData.kedisiplinan || 0,
            kerjasama: raporData.kerjasama || 0,
            tanggung_jawab: raporData.tanggung_jawab || 0,
            catatan: "Sangat baik dalam mengikuti kegiatan pramuka. Tingkatkan terus kedisiplinan dan keterampilan kepramukaan Anda!"
          },
          rata_rata: rataRata,
          predikat: predikat
        }
      };
    },
  },

  // Pengurus
  pengurus: {
    getAll: async () => {
      const res = await apiClient.get('/pengurus');
      res.data = (res.data || []).map(p => ({
        ...p,
        nama: p.siswa?.users?.nama || p.siswa?.users?.name || '',
        kelas: p.siswa?.kelas || ''
      }));
      return res;
    },
    getById: async (id) => {
      const res = await apiClient.get(`/pengurus/${id}`);
      if (res.data) {
        res.data = {
          ...res.data,
          nama: res.data.siswa?.users?.nama || res.data.siswa?.users?.name || '',
          kelas: res.data.siswa?.kelas || ''
        };
      }
      return res;
    },
    create: async (data) => {
      const siswaListRes = await api.siswa.getAll();
      const siswaList = siswaListRes.data || [];
      const match = siswaList.find(s => s.nama.toLowerCase() === data.nama.toLowerCase());
      if (!match) {
        throw new Error(`Siswa dengan nama "${data.nama}" tidak ditemukan. Harap daftarkan siswa tersebut di menu Siswa Management terlebih dahulu.`);
      }
      const payload = {
        siswa_id: match.id,
        jabatan: data.jabatan,
        periode: data.periode || '2026/2027'
      };
      return apiClient.post('/pengurus', payload);
    },
    update: async (id, data) => {
      const siswaListRes = await api.siswa.getAll();
      const siswaList = siswaListRes.data || [];
      const match = siswaList.find(s => s.nama.toLowerCase() === data.nama.toLowerCase());
      if (!match) {
        throw new Error(`Siswa dengan nama "${data.nama}" tidak ditemukan. Harap daftarkan siswa tersebut di menu Siswa Management terlebih dahulu.`);
      }
      const payload = {
        siswa_id: match.id,
        jabatan: data.jabatan,
        periode: data.periode || '2026/2027'
      };
      return apiClient.put(`/pengurus/${id}`, payload);
    },
    delete: async (id) => {
      return apiClient.delete(`/pengurus/${id}`);
    },
  },

  // Pengaturan
  pengaturan: {
    get: async () => {
      return apiClient.get('/pengaturan');
    },
    update: async (data) => {
      return apiClient.put('/pengaturan', data);
    },
  },

  // Android Absensi
  androidAbsensi: {
    getAll: async () => {
      return apiClient.get('/android-absensi');
    },
    getKegiatan: async () => {
      return apiClient.get('/android-absensi/kegiatan');
    },
  },
};

