const supabaseAndroid = require('../config/supabaseAndroid');

exports.getAndroidAbsensiLogs = async (req, res) => {
  try {
    // Fetch attendance data from Android Database
    // Join with profiles to get student name
    // Join with kegiatan to get activity name
    const { data: attendanceData, error } = await supabaseAndroid
      .from('attendance')
      .select(`
        id,
        user_id,
        kegiatan_id,
        latitude,
        longitude,
        distance,
        selfie,
        status,
        check_in,
        profiles:user_id ( name, nomor_induk, regu ),
        kegiatan:kegiatan_id ( title, start_time )
      `)
      .order('check_in', { ascending: false });

    if (error) {
      console.error('Error fetching Android attendance:', error);
      return res.status(500).json({ message: 'Gagal mengambil data absensi Android', error: error.message });
    }

    // Format the data so the frontend can easily consume it
    const formattedData = attendanceData.map(log => {
      // Handle the fact that profiles might use 'name' or 'full_name'
      const profile = log.profiles || {};
      const studentName = profile.name || 'Unknown Student';
      const studentId = profile.nomor_induk || log.user_id;
      
      const activity = log.kegiatan || {};
      const activityTitle = activity.title || 'Unknown Activity';

      // Formatting date time
      let formattedTime = log.check_in;
      if (formattedTime) {
        const d = new Date(formattedTime);
        formattedTime = d.toLocaleString('id-ID', { timeZone: 'Asia/Jakarta' });
      }

      return {
        id: log.id,
        siswa_id: studentId,
        nama_siswa: studentName,
        regu: profile.regu || '-',
        agenda_id: log.kegiatan_id,
        judul_agenda: activityTitle,
        waktu_absen: formattedTime,
        latitude: log.latitude,
        longitude: log.longitude,
        jarak: log.distance,
        foto_absen: log.selfie,
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
    const { data: kegiatanData, error } = await supabaseAndroid
      .from('kegiatan')
      .select('id, title, start_time')
      .order('start_time', { ascending: false });

    if (error) {
      console.error('Error fetching Android kegiatan:', error);
      return res.status(500).json({ message: 'Gagal mengambil data kegiatan Android', error: error.message });
    }

    res.json({ data: kegiatanData });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
};
