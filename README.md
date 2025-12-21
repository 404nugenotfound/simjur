# 📘 **USER MANUAL**

## Sistem Manajemen Pengelolaan Dana Kegiatan Jurusan (SIMJUR)

---

## 🧩 1. Pendahuluan Sistem Manajemen Pengelolaan Dana Kegiatan Jurusan

SIMJUR (Sistem Manajemen Pengelolaan Dana Kegiatan Jurusan) merupakan aplikasi web yang digunakan untuk mengelola proses pengajuan TOR dan LPJ, persetujuan berjenjang, serta monitoring dana kegiatan jurusan secara terstruktur dan transparan.

Sistem ini dirancang untuk menggantikan proses manual berbasis spreadsheet dan dokumen terpisah, serta ditujukan untuk penggunaan internal jurusan.

---

## 📌 2. Gambaran Umum Sistem

SIMJUR digunakan untuk mendukung kegiatan berikut:

* Pengajuan TOR (Term of Reference)
* Pengajuan LPJ (Laporan Pertanggungjawaban)
* Proses approval paralel dan berjenjang
* Pengelolaan dan monitoring dana kegiatan jurusan
* Penyajian rekap data kegiatan melalui dashboard

Seluruh aktivitas pengguna tercatat secara otomatis oleh sistem.

---

## 👥 3. Peran Pengguna dan Hak Akses

### 👤 3.1 Pengaju (Mahasiswa / Dosen)

**Hak Akses:**

* Menambahkan TOR
* Menambahkan LPJ
* Generate file TOR dan LPJ
* Upload, download, dan menghapus file sebelum disetujui
* Melihat status approval
* Melihat catatan revisi dari approver

**Struktur Data Kegiatan:**

* Detail TOR
* Detail LPJ

---

### 🗂️ 3.2 Administrasi Jurusan (Admin)

**Hak Akses:**

* Melihat seluruh data TOR dan LPJ
* Melakukan Approval tahap pertama
* Memberikan catatan revisi
* Menginput dana tahunan jurusan (dashboard)
* Monitoring seluruh kegiatan melalui dashboard

---

### 🧑‍💼 3.3 Sekretariat Jurusan (Sekjur)

**Hak Akses:**

* Melihat seluruh data TOR dan LPJ
* Melakukan Approval tahap kedua
* Memberikan catatan revisi
* Mengisi dana yang disetujui jurusan
* Melihat ringkasan detail kegiatan

---

### 👑 3.4 Ketua Jurusan (Kajur)

**Hak Akses:**

* Melihat seluruh data TOR dan LPJ
* Melakukan Approval tahap akhir (final)
* Melihat ringkasan detail kegiatan
* Monitoring kegiatan melalui dashboard

---

## 🔄 4. Panduan Penggunaan Sistem

### 📄 4.1 Pengajuan TOR

Langkah-langkah pengajuan TOR:

1. Pengaju memilih menu **Tambah TOR**
2. Mengisi formulir TOR sesuai data kegiatan
3. Sistem otomatis meng-generate file TOR
4. Pengaju melakukan pengecekan dan perapihan file
5. File TOR diupload ke detail kegiatan
6. Data TOR masuk ke daftar pengajuan dan siap diproses

---

### 🧾 4.2 Pengajuan LPJ

Langkah-langkah pengajuan LPJ:

1. Pengaju memilih menu **Tambah LPJ**
2. Mengisi formulir LPJ
3. Sistem meng-generate file LPJ
4. Pengaju melakukan perapihan file
5. File LPJ diupload ke detail kegiatan
6. Data LPJ masuk ke daftar LPJ dan siap diproses

---

## ✅ 5. Mekanisme Approval

### 🔀 5.1 Skema Approval Paralel dan Berjenjang

Proses approval dilakukan sebagai berikut:

1. **Approval 1** oleh Administrasi Jurusan
2. **Approval 2** oleh Sekretariat Jurusan

   * Admin dan Sekjur tidak harus berurutan
   * Selama keduanya menyetujui, proses dapat dilanjutkan
3. **Approval 3 (Final)** oleh Ketua Jurusan

---

### 🔁 5.2 Mekanisme Revisi dan Upload Ulang Dokumen

Jika salah satu approver memberikan **catatan revisi**:

* Status dokumen berubah menjadi **Revisi**
* Proses approval dihentikan sementara
* Dokumen dikembalikan ke pengaju

**Langkah yang harus dilakukan pengaju:**

1. Menghapus file lama yang berstatus revisi
2. Mengupload ulang file hasil perbaikan
3. Sistem secara otomatis mereset status dokumen menjadi **Pending**
4. Proses approval dapat dilakukan ulang oleh Admin, Sekjur, dan Kajur

Mekanisme ini memastikan setiap siklus approval menggunakan versi dokumen terbaru.

---

## 📂 6. Manajemen File

| Role    | Upload | Download | Hapus |
| ------- | ------ | -------- | ----- |
| Pengaju | Ya     | Ya       | Ya    |
| Admin   | Tidak  | Ya       | Tidak |
| Sekjur  | Tidak  | Ya       | Tidak |
| Kajur   | Tidak  | Ya       | Tidak |

---

## 📊 7. Dashboard Sistem

Dashboard dapat diakses oleh seluruh role pengguna dan menampilkan:

* Jumlah TOR dan LPJ
* Total dana yang diajukan
* Total dana yang disetujui
* Sisa dana jurusan
* Rekap kegiatan per tahun

**Fitur Khusus Admin:**

* Input dana tahunan jurusan
* Sistem otomatis melakukan perhitungan dan akumulasi dana

---

## 📝 8. Catatan Penggunaan

* Sistem digunakan untuk kebutuhan internal jurusan
* Seluruh proses approval dilakukan melalui sistem
* Aktivitas pengguna tercatat secara otomatis
* Dashboard digunakan sebagai alat monitoring dan evaluasi

---
