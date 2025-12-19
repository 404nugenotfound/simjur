/**
 * Mapping Role ke Nama User Contoh
 * Sesuai dengan API roles (1-5)
 */
export const roleToName: { [key: string]: string } = {
  // Level 1 - Administrator penuh
  admin: "Admin Sistem",
  
  // Level 2 - Admin administrasi
  administrasi: "Admin Administrasi",
  
  // Level 3 - User pengaju proposal
  pengaju: "User Pengaju",
  
  // Level 4 - Sekretaris jurusan
  sekretaris: "Sekretaris Jurusan",
  
  // Level 5 - Ketua jurusan
  ketua_jurusan: "Ketua Jurusan",
};
