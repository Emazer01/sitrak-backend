-- ====================================================================
-- SITRAK (Sistem Informasi & Tracking Latihan Menembak)
-- PostgreSQL Database Schema & Initial Seed Data
-- ====================================================================

-- 1. TABEL PENGGUNA & AUTENTIKASI
CREATE TABLE IF NOT EXISTS users (
    id_user SERIAL PRIMARY KEY,
    username VARCHAR(100) UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    nama_lengkap VARCHAR(200) NOT NULL,
    pangkat VARCHAR(100) DEFAULT '-',
    nrp VARCHAR(50) DEFAULT '-',
    jabatan VARCHAR(150) DEFAULT '-',
    satuan VARCHAR(150) DEFAULT '-',
    role VARCHAR(50) NOT NULL DEFAULT 'operator' CHECK (role IN ('operator', 'administrator', 'pelatih')),
    is_default BOOLEAN DEFAULT FALSE,
    status VARCHAR(30) DEFAULT 'Aktif',
    last_login TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- 2. TABEL ATRIBUT MASTER
CREATE TABLE IF NOT EXISTS jenis_senjata (
    id_jenis_senjata SERIAL PRIMARY KEY,
    nama_jenis_senjata VARCHAR(100) NOT NULL UNIQUE
);

CREATE TABLE IF NOT EXISTS mode_tembakan (
    id_mode_tembakan SERIAL PRIMARY KEY,
    nama_mode_tembakan VARCHAR(100) NOT NULL UNIQUE
);

CREATE TABLE IF NOT EXISTS sikap_menembak (
    id_sikap_menembak SERIAL PRIMARY KEY,
    nama_sikap_menembak VARCHAR(100) NOT NULL UNIQUE
);

CREATE TABLE IF NOT EXISTS tipe_target (
    id_tipe_target SERIAL PRIMARY KEY,
    nama_tipe_target VARCHAR(100) NOT NULL UNIQUE
);

CREATE TABLE IF NOT EXISTS senjata (
    id_senjata SERIAL PRIMARY KEY,
    model_senjata VARCHAR(150) NOT NULL,
    id_jenis_senjata INT REFERENCES jenis_senjata(id_jenis_senjata) ON DELETE SET NULL,
    kaliber VARCHAR(50),
    pabrikan VARCHAR(150)
);

-- 3. TABEL MASTER PERSONEL PENEMBAK
CREATE TABLE IF NOT EXISTS personel_penembak (
    id_personel_penembak SERIAL PRIMARY KEY,
    nrp VARCHAR(50) UNIQUE,
    nama_personel_penembak VARCHAR(200) NOT NULL,
    pangkat VARCHAR(100) DEFAULT '-',
    satuan VARCHAR(150)
);

-- 4. TABEL HIERARKI SESI LATIHAN MENEMBAK
CREATE TABLE IF NOT EXISTS sesi (
    id_sesi SERIAL PRIMARY KEY,
    nama_sesi VARCHAR(255) NOT NULL,
    nama_tempat_menembak VARCHAR(255),
    jumlah_jalur INT DEFAULT 1,
    total_gelombang INT DEFAULT 1,
    jarak_meter INT DEFAULT 25,
    id_senjata INT REFERENCES senjata(id_senjata) ON DELETE SET NULL,
    id_mode_tembakan INT REFERENCES mode_tembakan(id_mode_tembakan) ON DELETE SET NULL,
    id_sikap_menembak INT REFERENCES sikap_menembak(id_sikap_menembak) ON DELETE SET NULL,
    id_tipe_target INT REFERENCES tipe_target(id_tipe_target) ON DELETE SET NULL,
    status VARCHAR(50) DEFAULT 'Menunggu',
    tanggal DATE DEFAULT CURRENT_DATE
);

CREATE TABLE IF NOT EXISTS gelombang (
    id_gelombang SERIAL PRIMARY KEY,
    id_sesi INT NOT NULL REFERENCES sesi(id_sesi) ON DELETE CASCADE,
    nomor_gelombang INT NOT NULL,
    lane INT DEFAULT 1
);

CREATE TABLE IF NOT EXISTS babak (
    id_babak SERIAL PRIMARY KEY,
    id_gelombang INT NOT NULL REFERENCES gelombang(id_gelombang) ON DELETE CASCADE,
    nomor_babak INT NOT NULL,
    nama_babak VARCHAR(150) NOT NULL,
    jumlah_peluru INT DEFAULT 10
);

CREATE TABLE IF NOT EXISTS personel_babak (
    id_personel_babak SERIAL PRIMARY KEY,
    id_personel_penembak INT NOT NULL REFERENCES personel_penembak(id_personel_penembak) ON DELETE CASCADE,
    id_babak INT NOT NULL REFERENCES babak(id_babak) ON DELETE CASCADE,
    total_skor NUMERIC(6,2) DEFAULT 0.00,
    akurasi_persen NUMERIC(5,2) DEFAULT 0.00
);

-- 5. TABEL HASIL DETEKSI TEMBAKAN (SITRAK-DETECT)
CREATE TABLE IF NOT EXISTS foto_target (
    id_foto_target SERIAL PRIMARY KEY,
    id_personel_babak INT NOT NULL REFERENCES personel_babak(id_personel_babak) ON DELETE CASCADE,
    url_foto_asli TEXT,
    url_foto_teranotasi TEXT,
    total_peluru_terdeteksi INT DEFAULT 0,
    total_skor NUMERIC(6,2) DEFAULT 0.00,
    akurasi_persen NUMERIC(5,2) DEFAULT 0.00,
    grouping_radius_mm NUMERIC(8,3),
    center_offset_x_mm NUMERIC(8,3),
    center_offset_y_mm NUMERIC(8,3),
    kategori_kelulusan VARCHAR(50),
    status_analisis VARCHAR(50) DEFAULT 'Selesai',
    catatan_analisis TEXT,
    waktu_unggah TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    waktu_selesai_analisis TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS detail_deteksi_tembakan (
    id_deteksi_tembakan BIGSERIAL PRIMARY KEY,
    id_foto_target INT NOT NULL REFERENCES foto_target(id_foto_target) ON DELETE CASCADE,
    nomor_tembakan INT NOT NULL,
    koordinat_x NUMERIC(8,3) NOT NULL,
    koordinat_y NUMERIC(8,3) NOT NULL,
    jarak_dari_pusat_mm NUMERIC(8,3),
    skor_poin NUMERIC(4,1) NOT NULL DEFAULT 0.0,
    ring_zona VARCHAR(20),
    confidence_score NUMERIC(5,4) DEFAULT 1.0000,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- ====================================================================
-- INITIAL SEED DATA
-- ====================================================================

-- 1. Default Jenis Senjata
INSERT INTO jenis_senjata (nama_jenis_senjata) VALUES 
('Senapan Serbu'),
('Pistol'),
('Senapan Runduk (Sniper)'),
('Submachine Gun (SMG)')
ON CONFLICT (nama_jenis_senjata) DO NOTHING;

-- 2. Default Mode Tembakan
INSERT INTO mode_tembakan (nama_mode_tembakan) VALUES 
('Tunggal (Single)'),
('Otomatis (Full Auto)'),
('Tiga Butir (Burst)')
ON CONFLICT (nama_mode_tembakan) DO NOTHING;

-- 3. Default Sikap Menembak
INSERT INTO sikap_menembak (nama_sikap_menembak) VALUES 
('Tiarap (Prone)'),
('Duduk (Sitting)'),
('Berlutut (Kneeling)'),
('Berdiri (Standing)')
ON CONFLICT (nama_sikap_menembak) DO NOTHING;

-- 4. Default Tipe Target
INSERT INTO tipe_target (nama_tipe_target) VALUES 
('Target Lingkaran Bullseye (1-10 Ring)'),
('Siluet L1'),
('Siluet Setengah Badan'),
('Plat Baja')
ON CONFLICT (nama_tipe_target) DO NOTHING;

-- 5. Default Akun Administrator (Password: AdminMenkor1.)
-- Hash bcrypt 10 salt rounds untuk password 'AdminMenkor1.'
INSERT INTO users (username, password_hash, nama_lengkap, pangkat, nrp, jabatan, satuan, role, is_default, status)
VALUES (
    'admin',
    '$2a$10$fV3M4mZ8kZqI5uL0Jq096uJkS4uG5hF2c8L7e0V5z8X4lY6eK7m6C',
    'Administrator Sistem Menkor',
    'Mayor',
    '11223344',
    'Administrator Utama',
    'Kodiklat TNI AL',
    'administrator',
    TRUE,
    'Aktif'
)
ON CONFLICT (username) DO NOTHING;
