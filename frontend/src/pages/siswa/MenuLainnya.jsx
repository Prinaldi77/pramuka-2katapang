import React, { useState, useEffect } from 'react';
import { api } from '../../services/api';
import { BookOpen, ShieldAlert, Award, Info, Calendar, User, Compass } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const MenuLainnya = () => {
  const [activeSubTab, setActiveSubTab] = useState('piket');
  const [leaderboardData, setLeaderboardData] = useState([]);
  const [loading, setLoading] = useState(false);

  // Jadwal Piket data
  const jadwalPiket = [
    { hari: 'Senin', reguPutra: 'Regu Singa', reguPutri: 'Regu Melati', tugas: 'Kebersihan Sanggar & Inventaris' },
    { hari: 'Selasa', reguPutra: 'Regu Elang', reguPutri: 'Regu Mawar', tugas: 'Pengecekan Atribut Upacara' },
    { hari: 'Rabu', reguPutra: 'Regu Tiger', reguPutri: 'Regu Orchid', tugas: 'Perawatan Bendera & Semaphore' },
    { hari: 'Kamis', reguPutra: 'Regu Cobra', reguPutri: 'Regu Tulip', tugas: 'Perapihan Buku & Administrasi' },
    { hari: 'Sabtu', reguPutra: 'Latihan Rutin', reguPutri: 'Latihan Rutin', tugas: 'Seluruh Anggota Gudep' },
  ];

  // Peraturan data
  const dasaDarma = [
    'Takwa kepada Tuhan Yang Maha Esa.',
    'Cinta alam dan kasih sayang sesama manusia.',
    'Patriot yang sopan dan kesatria.',
    'Patuh dan suka bermusyawarah.',
    'Rela menolong dan tabah.',
    'Rajin, terampil, dan gembira.',
    'Hemat, cermat, dan bersahaja.',
    'Disiplin, berani, dan setia.',
    'Bertanggung jawab dan dapat dipercaya.',
    'Suci dalam pikiran, perkataan, dan perbuatan.'
  ];

  useEffect(() => {
    if (activeSubTab === 'leaderboard') {
      const loadLeaderboard = async () => {
        setLoading(true);
        try {
          const res = await api.siswa.getAll();
          // Map students to add mock points based on a stable formula for display realism
          const mapped = (res.data || []).map(s => {
            const points = ((s.id * 17) % 45) + 55; // stable score between 55 and 100
            return {
              ...s,
              poin: points
            };
          }).sort((a, b) => b.poin - a.poin);
          setLeaderboardData(mapped);
        } catch (err) {
          console.error(err);
        } finally {
          setLoading(false);
        }
      };
      loadLeaderboard();
    }
  }, [activeSubTab]);

  return (
    <div className="space-y-6">
      
      {/* Title */}
      <div>
        <h1 className="text-xl font-bold text-slate-800 tracking-tight">
          Menu Lainnya
        </h1>
        <p className="text-xs text-slate-500 mt-1">Akses jadwal piket harian, peraturan organisasi, leaderboard keaktifan, dan info aplikasi.</p>
      </div>

      {/* Sub-tab Navigation */}
      <div className="flex flex-wrap gap-2 border-b border-slate-200 pb-3">
        <button
          onClick={() => setActiveSubTab('piket')}
          className={`px-3 py-1.5 text-xs font-bold rounded-lg border transition-all ${
            activeSubTab === 'piket'
              ? 'bg-primary text-white border-primary shadow-xs'
              : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
          }`}
        >
          <span className="flex items-center space-x-1.5">
            <Calendar className="h-3.5 w-3.5" />
            <span>Jadwal Piket</span>
          </span>
        </button>
        <button
          onClick={() => setActiveSubTab('peraturan')}
          className={`px-3 py-1.5 text-xs font-bold rounded-lg border transition-all ${
            activeSubTab === 'peraturan'
              ? 'bg-primary text-white border-primary shadow-xs'
              : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
          }`}
        >
          <span className="flex items-center space-x-1.5">
            <BookOpen className="h-3.5 w-3.5" />
            <span>Peraturan</span>
          </span>
        </button>
        <button
          onClick={() => setActiveSubTab('leaderboard')}
          className={`px-3 py-1.5 text-xs font-bold rounded-lg border transition-all ${
            activeSubTab === 'leaderboard'
              ? 'bg-primary text-white border-primary shadow-xs'
              : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
          }`}
        >
          <span className="flex items-center space-x-1.5">
            <Award className="h-3.5 w-3.5" />
            <span>Leaderboard</span>
          </span>
        </button>
        <button
          onClick={() => setActiveSubTab('tentang')}
          className={`px-3 py-1.5 text-xs font-bold rounded-lg border transition-all ${
            activeSubTab === 'tentang'
              ? 'bg-primary text-white border-primary shadow-xs'
              : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
          }`}
        >
          <span className="flex items-center space-x-1.5">
            <Info className="h-3.5 w-3.5" />
            <span>Tentang</span>
          </span>
        </button>
      </div>

      {/* Tab Panels */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-soft min-h-[300px]">
        <AnimatePresence mode="wait">
          {activeSubTab === 'piket' && (
            <motion.div
              key="panel-piket"
              initial={{ opacity: 0, y: 5 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -5 }}
              className="space-y-4"
            >
              <h2 className="text-sm font-bold text-slate-800 border-b pb-2">Jadwal Piket Mingguan Sanggar</h2>
              <div className="overflow-x-auto">
                <table className="w-full border-collapse text-left text-xs sm:text-sm">
                  <thead>
                    <tr className="border-b border-slate-200 text-slate-400 font-semibold">
                      <th className="py-2.5">Hari</th>
                      <th className="py-2.5">Regu Putra</th>
                      <th className="py-2.5">Regu Putri</th>
                      <th className="py-2.5">Tugas Utama</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-slate-700">
                    {jadwalPiket.map((p, idx) => (
                      <tr key={idx} className="hover:bg-slate-50/50">
                        <td className="py-3 font-bold text-slate-900">{p.hari}</td>
                        <td className="py-3">{p.reguPutra}</td>
                        <td className="py-3">{p.reguPutri}</td>
                        <td className="py-3 text-slate-500 italic">{p.tugas}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </motion.div>
          )}

          {activeSubTab === 'peraturan' && (
            <motion.div
              key="panel-peraturan"
              initial={{ opacity: 0, y: 5 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -5 }}
              className="space-y-6"
            >
              <div className="space-y-2">
                <h2 className="text-sm font-bold text-slate-800 border-b pb-2">Tri Satya Pramuka</h2>
                <p className="text-xs sm:text-sm text-slate-600 leading-relaxed italic whitespace-pre-line bg-slate-50 p-4 rounded-xl border border-slate-100">
                  "Demi kehormatanku aku berjanji akan bersungguh-sungguh:<br/>
                  1. Menjalankan kewajibanku terhadap Tuhan, Negara Kesatuan Republik Indonesia dan mengamalkan Pancasila.<br/>
                  2. Menolong sesama hidup dan mempersiapkan diri membangun masyarakat.<br/>
                  3. Menepati Dasa Darma."
                </p>
              </div>

              <div className="space-y-3">
                <h2 className="text-sm font-bold text-slate-800 border-b pb-2">Dasa Darma Pramuka</h2>
                <ol className="space-y-2 text-xs sm:text-sm text-slate-600">
                  {dasaDarma.map((d, idx) => (
                    <li key={idx} className="flex items-start space-x-2">
                      <span className="h-5 w-5 bg-primary-50 text-primary border border-primary-100 rounded-full flex items-center justify-center font-bold text-[10px] flex-shrink-0 mt-0.5">
                        {idx + 1}
                      </span>
                      <span className="pt-0.5">{d}</span>
                    </li>
                  ))}
                </ol>
              </div>
            </motion.div>
          )}

          {activeSubTab === 'leaderboard' && (
            <motion.div
              key="panel-leaderboard"
              initial={{ opacity: 0, y: 5 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -5 }}
              className="space-y-4"
            >
              <h2 className="text-sm font-bold text-slate-800 border-b pb-2">Leaderboard Keaktifan Siswa</h2>
              {loading ? (
                <div className="py-8 text-center text-xs text-slate-400">Loading data peringkat...</div>
              ) : (
                <div className="space-y-3">
                  {leaderboardData.map((student, idx) => (
                    <div
                      key={student.id}
                      className="flex items-center justify-between p-3 rounded-xl border border-slate-100 bg-slate-50 hover:bg-slate-100/50 transition-colors"
                    >
                      <div className="flex items-center space-x-3 min-w-0">
                        <span className={`h-6 w-6 rounded-full flex items-center justify-center font-bold text-xs flex-shrink-0 ${
                          idx === 0 ? 'bg-amber-100 text-amber-700 border border-amber-200' :
                          idx === 1 ? 'bg-slate-200 text-slate-700' :
                          idx === 2 ? 'bg-orange-100 text-orange-700 border border-orange-200' :
                          'bg-slate-100 text-slate-400'
                        }`}>
                          {idx + 1}
                        </span>
                        <div className="min-w-0">
                          <p className="font-bold text-slate-800 text-xs sm:text-sm truncate">{student.nama}</p>
                          <p className="text-[10px] text-slate-400 mt-0.5">Kelas: {student.kelas}</p>
                        </div>
                      </div>
                      <div className="text-right flex-shrink-0">
                        <span className="text-xs font-bold text-primary bg-primary-50 border border-primary-100 px-2 py-0.5 rounded-lg">
                          {student.poin} Poin
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </motion.div>
          )}

          {activeSubTab === 'tentang' && (
            <motion.div
              key="panel-tentang"
              initial={{ opacity: 0, y: 5 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -5 }}
              className="space-y-4 text-center py-6"
            >
              <div className="h-16 w-16 bg-primary-50 rounded-2xl flex items-center justify-center text-primary mx-auto mb-3 shadow-soft border border-primary-100">
                <Compass className="h-8 w-8" />
              </div>
              <h2 className="text-base font-extrabold text-slate-800">Scoutify Mobile Web Client</h2>
              <p className="text-xs text-slate-400 max-w-sm mx-auto leading-relaxed">
                Aplikasi PWA pendukung absensi realtime siswa berbasis Geofence (Radius GPS) dan Verifikasi Wajah (Face Scan Verification).
              </p>
              <div className="border-t border-slate-100 max-w-xs mx-auto my-4 pt-3 text-[10px] text-slate-500 space-y-1">
                <p>Versi Aplikasi: 1.0.0 (Stable)</p>
                <p>Pangkalan: SMP Negeri 2 Katapang</p>
                <p>&copy; 2026 Gerakan Pramuka Gudep 28.065-28.066</p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

    </div>
  );
};

export default MenuLainnya;
