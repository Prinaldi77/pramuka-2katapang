# Sistem Informasi & Presensi Kepramukaan SMPN 2 Katapang
> **Proyek Tugas Pengembangan & Pengamanan Aplikasi Web — Mata Kuliah Cyber Security**

Aplikasi web modern berbasis Next.js 15 dan Supabase yang dirancang untuk mengelola administrasi pangkalan pramuka SMPN 2 Katapang (Barisan Satria Batara) dengan fokus utama pada **pengamanan sistem presensi digital anti-fraud menggunakan Time-Based Rotating QR Code (HMAC-SHA256)**.

* **URL Aplikasi Aktif (Produksi):** [https://pramuka2katapang.vercel.app](https://pramuka2katapang.vercel.app)
* **URL Repository Git:** [https://github.com/Prinaldi77/pramuka-2katapang](https://github.com/Prinaldi77/pramuka-2katapang)
* **Kandidat Pengembang:** Muhamad Prinaldi

---

## 1. Fitur Utama Aplikasi

1. **Autentikasi & Role-Based Access Control (RBAC):**
   - Pemisahan hak akses berjenjang: **Admin / Pembina** dan **Siswa (Anggota)**.
   - Sesi terenkripsi menggunakan JSON Web Token (JWT) yang disimpan dalam cookie berstatus `HttpOnly`, `Secure`, dan `SameSite=Strict`.
   - Penyimpanan kata sandi aman menggunakan hashing algoritma `bcrypt` (10 salt rounds) dan penolakan otomatis kata sandi lemah (< 8 karakter).
2. **Presensi Digital Dinamis Anti-Kecurangan (Dynamic Rotating QR Code):**
   - Generator kode QR dinamis dengan tanda tangan kriptografi **HMAC-SHA256** (`PRAMUKA_QR:<agendaId>:<timeWindow>:<signature>`).
   - Kode QR berotasi otomatis setiap **60 detik** (*countdown bar live*).
   - Menghalangi kecurangan *screenshot sharing* atau titip absen (pemindaian tangkapan layar yang kedaluwarsa akan ditolak oleh server).
   - Mode Proyektor / Layar Penuh (*fullscreen*) untuk memudahkan penayangan oleh pembina di depan kelas/lapangan.
   - Kamera pemindai (*webcam/smartphone back camera*) berbasis `html5-qrcode` langsung di browser siswa tanpa perlu instalasi aplikasi tambahan.
3. **Pengelolaan Data Lengkap (CRUD):**
   - **Data Anggota**: Penambahan anggota, penyortiran tingkatan (Penggalang Ramu, Rakit, Terap), pembagian otomatis regu (Putra = Regu Wolf, Putri = Regu Valerian), pengubahan tingkatan, dan penghapusan data.
   - **Jadwal & Agenda Latihan**: Pembuatan agenda latihan, penentuan jam operasional, dan penghapusan jadwal.
   - **Penilaian SKU/SKK**: Verifikasi dan rekam jejak syarat kecakapan anggota.
4. **Pelaporan & Analisis Data:**
   - **Grafik Tren Kehadiran**: Visualisasi rekap presensi latihan pada dashboard analitik admin.
   - **Ekspor Data CSV/Excel**: Pengunduhan data rekapitulasi riwayat presensi siswa dengan 1 klik untuk dokumentasi arsip pangkalan.
   - **Paspor Ekspedisi Digital**: Portofolio riwayat pencapaian dan presensi masing-masing siswa.

---

## 2. Arsitektur & Teknologi

* **Frontend Framework:** Next.js 15 (React 19, App Router)
* **Bahasa Pemrograman:** TypeScript, Node.js
* **Styling & Desain:** Tailwind CSS & Vanilla CSS (Desain editorial Pramuka: Forest Green `#1E3F20`, Scout Gold `#D4AF37`, Earth `#5C3D2E`)
* **Basis Data:** Supabase (Managed PostgreSQL)
* **Kriptografi & Keamanan:**
  - `bcryptjs`: Password hashing
  - `jsonwebtoken`: Autentikasi berbasis token JWT
  - `crypto` (Node.js native): HMAC-SHA256 signature token rotation
* **Hosting & Deployment:** Vercel (Edge Network dengan sertifikat SSL/TLS valid HTTPS otomatis)

---

## 3. Penerapan Aspek Keamanan (Cyber Security)

| Mekanisme Keamanan | Implementasi pada Proyek | Manfaat / Perlindungan |
| :--- | :--- | :--- |
| **Password Hashing** | `bcryptjs` (salt rounds: 10) | Mencegah kebocoran kata sandi dalam bentuk plaintext apabila database terekspos. |
| **Session Cookie Security** | `HttpOnly`, `Secure`, `SameSite=Strict` | Mencegah pencurian token sesi melalui serangan Cross-Site Scripting (XSS) dan mitigasi CSRF. |
| **Anti-Replay QR Signature** | HMAC-SHA256 dengan time-window 60s | Memastikan QR Code tidak dapat dipalsukan, dimanipulasi, atau digunakan ulang via tangkapan layar. |
| **Server-Side RBAC** | Verifikasi peran di Server Components & Actions | Memblokir akses tidak sah (Broken Access Control/IDOR) ke halaman admin maupun data pengguna lain. |
| **SQL Injection Defense** | Supabase PostgREST Parameterized Queries | Seluruh query database menggunakan parameter binding otomatis; input pengguna tidak dapat menginjeksi sintaks SQL. |
| **XSS Protection** | React Virtual DOM JSX Escaping | Karakter berbahaya di-escape secara otomatis sebelum dirender ke browser. |
| **HTTP Security Headers** | `X-Frame-Options: DENY`, `X-Content-Type-Options: nosniff`, `HSTS`, `Referrer-Policy` | Mencegah Clickjacking, MIME sniffing, serta menegakkan transmisi wajib HTTPS. |

---

## 4. Panduan Menjalankan Secara Lokal

### Prasyarat
* Node.js versi 18.x atau 20.x
* Akun dan project Supabase aktif

### Langkah Instalasi
1. Kloning repository:
   ```bash
   git clone https://github.com/Prinaldi77/pramuka-2katapang.git
   cd pramuka-2katapang/frontend
   ```
2. Pasang dependensi:
   ```bash
   npm install
   ```
3. Siapkan berkas konfigurasi lingkungan (`.env.local`):
   Salin atau buat file `.env.local` di folder `frontend/` (lihat konfigurasi di bawah).
4. Jalankan server pengembangan:
   ```bash
   npm run dev
   ```
5. Buka peramban di `http://localhost:3000`.

---

## 5. Konfigurasi Environment Variables

Buat file `.env.local` pada folder `frontend/` dengan struktur berikut (tanpa menyertakan nilai rahasia asli di repository):

```env
# Koneksi Supabase (Database PostgreSQL)
NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key

# Kunci Rahasia Autentikasi JWT (Minimal 32 karakter acak)
JWT_SECRET=your-random-jwt-secret-key-min-32-chars

# Kunci Rahasia Tanda Tangan Kriptografi QR Code (HMAC-SHA256)
QR_SECRET_KEY=your-random-secret-key-for-qr-signature
```

> **Catatan Keamanan:** Berkas `.env.local` telah dimasukkan ke dalam `.gitignore` sehingga tidak pernah ter-commit ke GitHub. Nilai sebenarnya dikonfigurasi melalui dashboard environment variables Vercel.

---

## 6. Ringkasan Penggunaan AI Agent

Sesuai ketentuan tugas (Poin 3e), pembuatan dan perancangan aplikasi ini dibantu oleh AI Agent dengan pengawasan dan tanggung jawab penuh mahasiswa:

* **Alat AI yang Digunakan:** Google Antigravity / Gemini Coding Agent.
* **Cakupan Bantuan:**
  1. *Perancangan Protokol Kriptografi QR*: Merumuskan algoritma HMAC-SHA256 time-window 60 detik pada Next.js Server Action (`getDynamicQRTokenAction` dan `checkInWithQRAction`).
  2. *Refaktorisasi Komponen & Routing*: Memigrasikan halaman dashboard ke Next.js 15 App Router dan menyusun integrasi widget pemindai kamera HTML5.
  3. *Implementasi Keamanan*: Penyusunan HTTP Security Headers, validasi session server-side, dan pembuatan sanitasi form.
* **Contoh Prompt Utama:**
  > *"Rancang fungsi pembuatan token presensi dinamis menggunakan HMAC-SHA256 di Next.js Server Action dengan rotasi waktu per 60 detik agar kebal terhadap kecurangan screenshot sharing antar siswa."*
* **Cara Peninjauan & Verifikasi Mahasiswa:**
  Setiap baris kode hasil AI ditinjau secara manual, diuji coba alur pemindaian kameranya langsung melalui smartphone, serta diverifikasi bahwa kunci rahasia (*secret keys*) tetap berada di sisi server (*environment variable*) dan tidak bocor ke sisi klien (*client bundle*).

---

## 7. Hasil Ringkasan Self-Testing Keamanan

| No | Skenario Pengujian | Metode Uji | Hasil | Status |
| :-: | :--- | :--- | :--- | :-: |
| 1 | **SQL Injection** | Uji coba payload `' OR '1'='1' --` pada form login dan formulir agenda. | Input diperlakukan sebagai string murni oleh query parameterized; login gagal. | **LOLOS** |
| 2 | **Cross-Site Scripting (XSS)** | Uji coba injeksi script `<script>alert('XSS')</script>` pada nama agenda/anggota. | Karakter khusus otomatis di-escape oleh React JSX (`&lt;script&gt;`); script tidak dieksekusi. | **LOLOS** |
| 3 | **Broken Access Control & IDOR** | Siswa mencoba membuka URL langsung `/admin` dan `/admin/absensi`. | Middleware dan server verification me-redirect otomatis ke `/login`. Data siswa lain tidak dapat dimanipulasi. | **LOLOS** |
| 4 | **Replay Attack Presensi QR** | Pengambilan screenshot QR Code, lalu dipindai setelah jeda waktu > 60 detik. | Sistem menolak absensi dengan pesan *"Kode QR sudah kedaluwarsa"*. | **LOLOS** |
| 5 | **Password Lemah** | Pendaftaran user baru dengan password 4-5 karakter. | Ditolak oleh server action dengan pesan error *"Kata sandi minimal 8 karakter!"*. | **LOLOS** |
| 6 | **HTTP Security Headers** | Analisis header respons HTTP melalui curl dan devtools. | Header `X-Frame-Options: DENY`, `X-Content-Type-Options: nosniff`, dan `HSTS` aktif. | **LOLOS** |
