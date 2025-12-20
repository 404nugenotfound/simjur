# Sistem Manajemen Pengelolaan Dana Kegiatan Jurusan

Aplikasi web untuk mengelola pengajuan TOR dan LPJ, proses approval berjenjang, serta monitoring dana kegiatan jurusan secara terstruktur dan transparan.

Project ini dibangun menggunakan **React (Create React App)** dan ditujukan untuk penggunaan internal jurusan.

---

## 📌 Gambaran Umum Sistem

Sistem ini digunakan untuk:
- Pengajuan TOR (Term of Reference)
- Pengajuan LPJ (Laporan Pertanggungjawaban)
- Approval paralel dan berjenjang
- Pengelolaan dana kegiatan jurusan
- Monitoring kegiatan dan dana melalui dashboard

Sistem dirancang untuk menggantikan proses manual berbasis spreadsheet dan dokumen terpisah.

---

## 👥 Role Pengguna & Hak Akses

### 1. Pengaju (Mahasiswa / Dosen)
Hak akses:
- Menambahkan TOR
- Menambahkan LPJ
- Generate file TOR & LPJ
- Upload, download, dan hapus file (sebelum disetujui)
- Melihat status approval
- Melihat catatan revisi

Detail kegiatan di role pengaju terbagi:
- Detail TOR
- Detail LPJ

---

### 2. Administrasi Jurusan (Admin)
Hak akses:
- Melihat seluruh kegiatan TOR & LPJ
- Melakukan Approval 1
- Memberikan catatan revisi
- Input dana tahunan jurusan (khusus dashboard)
- Monitoring seluruh kegiatan melalui dashboard

---

### 3. Sekretariat Jurusan (Sekjur)
Hak akses:
- Melihat seluruh kegiatan TOR & LPJ
- Melakukan Approval 2
- Memberikan catatan revisi
- Mengisi dana yang disetujui jurusan
- Melihat detail ringkas kegiatan

---

### 4. Ketua Jurusan (Kajur)
Hak akses:
- Melihat seluruh kegiatan TOR & LPJ
- Melakukan Approval 3 (Final)
- Melihat detail ringkas kegiatan
- Monitoring melalui dashboard

---

## 🔄 Alur Pengajuan TOR & LPJ

### A. Pengajuan TOR
1. Pengaju klik **Tambah TOR**
2. Mengisi form TOR
3. Sistem meng-generate file TOR
4. Pengaju merapikan file
5. File diupload ke detail kegiatan
6. Data masuk ke daftar TOR

---

### B. Pengajuan LPJ
1. Pengaju klik **Tambah LPJ**
2. Mengisi form LPJ
3. Sistem meng-generate file LPJ
4. Pengaju merapikan file
5. File diupload ke detail kegiatan
6. Data masuk ke daftar LPJ

---

## ✅ Mekanisme Approval

### Skema Approval Paralel
1. Approval 1 → Administrasi Jurusan  
2. Approval 2 → Sekretariat Jurusan  
   - Admin dan Sekjur **tidak harus berurutan**
   - Selama keduanya approve, proses lanjut
3. Approval 3 (Final) → Ketua Jurusan

Jika ada revisi:
- Status kembali ke pengaju
- Pengaju memperbaiki dan upload ulang file

---

## 📂 Manajemen File

| Role | Upload | Download | Hapus |
|----|----|----|----|
| Pengaju | ✅ | ✅ | ✅ |
| Admin | ❌ | ✅ | ❌ |
| Sekjur | ❌ | ✅ | ❌ |
| Kajur | ❌ | ✅ | ❌ |

---

## 📊 Dashboard Sistem

Semua role dapat mengakses dashboard.

Dashboard menampilkan:
- Jumlah TOR & LPJ
- Total dana diajukan
- Total dana disetujui
- Sisa dana jurusan
- Rekap kegiatan per tahun

### Fitur Khusus Admin
- Input dana tahunan jurusan
- Dana otomatis diakumulasi dan dihitung oleh sistem

---

## ⚙️ Getting Started (Create React App)

Project ini dibuat menggunakan **Create React App**.

### Prasyarat
- Node.js (disarankan versi LTS)
- npm atau yarn

---

## 🚀 Available Scripts

Di direktori project, jalankan:

### `npm start`
Menjalankan aplikasi dalam mode development.  
Buka [http://localhost:3000](http://localhost:3000) di browser.

### `npm test`
Menjalankan test runner dalam mode watch.

### `npm run build`
Membuild aplikasi untuk production ke folder `build`.

### `npm run eject`
Mengeluarkan konfigurasi CRA (one-way operation).


---

## 📝 Catatan

- Sistem dirancang untuk penggunaan internal jurusan
- Approval dilakukan sepenuhnya melalui sistem
- Semua data dan aktivitas tercatat otomatis
- Dashboard digunakan sebagai alat monitoring dan evaluasi

