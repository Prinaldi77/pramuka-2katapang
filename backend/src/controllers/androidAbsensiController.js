const AbsensiModel = require('../models/absensiModel');
const AgendaModel = require('../models/agendaModel');

exports.getAndroidAbsensiLogs = async (req, res) => {
  try {
    const attendanceData = await AbsensiModel.findAndroidLogs();

    // Format the data so the frontend can easily consume it
    const formattedData = (attendanceData || []).map(log => {
      const siswa = log.siswa || {};
      const user = siswa.users || {};
      const studentName = user.nama || 'Siswa Tidak Diketahui';
      const studentId = siswa.nis || log.siswa_id;
      
      const agenda = log.agenda_absensi || {};
      // Bersihkan judul agenda dari separator
      const activityTitle = (agenda.judul || 'Kegiatan Tidak Diketahui').split('||')[0];

      // Formatting date time
      let formattedTime = log.created_at;
      if (formattedTime) {
        const d = new Date(formattedTime);
        formattedTime = d.toLocaleString('id-ID', { timeZone: 'Asia/Jakarta' });
      }

      // Hitung status secara dinamis berdasarkan jam_mulai dan toleransi
      let calculatedStatus = 'HADIR';
      if (agenda && agenda.jam_mulai && log.created_at) {
        const titleParts = (agenda.judul || '').split('||');
        const toleransi = titleParts[1] ? Number(titleParts[1]) : 0;
        
        const checkIn = new Date(log.created_at);
        const [h, m] = agenda.jam_mulai.split(':');
        const start = new Date(agenda.tanggal);
        start.setHours(Number(h), Number(m), 0, 0);
        
        const diffMins = Math.floor((checkIn - start) / 60000);
        if (diffMins > toleransi) {
          calculatedStatus = 'TELAT';
        }
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
        status: calculatedStatus
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
    const kegiatanData = await AgendaModel.findAll();

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
