const supabase = require('../config/supabase');

exports.getAndroidAbsensiLogs = async (req, res) => {
  try {
    const { data: attendanceData, error } = await supabase
      .from('absensi')
      .select(`
        id,
        siswa_id,
        agenda_id,
        latitude,
        longitude,
        jarak,
        foto_absen,
        status,
        keterangan,
        created_at,
        siswa:siswa_id (
          nis,
          kelas,
          users(nama)
        ),
        agenda_absensi:agenda_id (
          judul,
          tanggal
        )
      `)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching Android attendance:', error);
      return res.status(500).json({ message: 'Gagal mengambil data absensi Android', error: error.message });
    }

    // Format the data so the frontend can easily consume it
    const formattedData = (attendanceData || []).map(log => {
      const siswa = log.siswa || {};
      const user = siswa.users || {};
      const studentName = user.nama || 'Siswa Tidak Diketahui';
      const studentId = siswa.nis || log.siswa_id;
      
      const agenda = log.agenda_absensi || {};
      const activityTitle = agenda.judul || 'Kegiatan Tidak Diketahui';

      // Formatting date time
      let formattedTime = log.created_at;
      if (formattedTime) {
        const d = new Date(formattedTime);
        formattedTime = d.toLocaleString('id-ID', { timeZone: 'Asia/Jakarta' });
      }

      return {
        id: log.id,
        siswa_id: studentId,
        nama_siswa: studentName,
        regu: siswa.kelas || '-',
        agenda_id: log.agenda_id,
        judul_agenda: activityTitle,
        waktu_absen: formattedTime,
        latitude: log.latitude,
        longitude: log.longitude,
        jarak: log.jarak,
        foto_absen: log.foto_absen,
        status: log.status || 'HADIR'
      };
    });

    res.json({ data: formattedData });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
};

exports.getAndroidKegiatanList = async (req, res) => {
  try {
    const { data: kegiatanData, error } = await supabase
      .from('agenda_absensi')
      .select('id, judul, tanggal')
      .order('tanggal', { ascending: false });

    if (error) {
      console.error('Error fetching Android kegiatan:', error);
      return res.status(500).json({ message: 'Gagal mengambil data kegiatan Android', error: error.message });
    }

    const formattedKegiatans = (kegiatanData || []).map(k => ({
      id: k.id,
      title: k.judul,
      start_time: k.tanggal
    }));

    res.json({ data: formattedKegiatans });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
};
