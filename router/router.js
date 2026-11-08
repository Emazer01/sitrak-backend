const express = require('express')
const router = express.Router()
const { userController } = require('../controller')
const Auth = require('../middleware/auth')
const { Validation } = require('../validators')

// ==========================================
// RUTE AUTENTIKASI LOGIN & MANAJEMEN AKUN (POSTGRESQL)
// ==========================================
router.post('/auth/login', userController.login)
router.post('/login', userController.login)
router.get('/auth/me', Auth.verifyToken, userController.me)
router.get('/me', Auth.verifyToken, userController.me)

router.get('/users', userController.daftarUsers)
router.get('/auth/users', userController.daftarUsers)
router.post('/users', userController.tambahUser)
router.post('/auth/users', userController.tambahUser)
router.post('/auth/register', userController.tambahUser)
router.put('/users/:id', userController.updateUser)
router.patch('/users/:id', userController.updateUser)
router.delete('/users/:id', userController.hapusUser)
router.delete('/auth/users/:id', userController.hapusUser)

// ==========================================
// RUTE ATRIBUT & MASTER DATA
// ==========================================
router.get('/atribut', userController.atribut)
router.get('/personel', userController.personelPenembak)

// Master Data CRUD Routes (Personel, Senjata, Jenis Senjata, Tipe Target, Mode Tembakan, Sikap Menembak)
router.post('/personel/bulk', userController.bulkTambahPersonel)
router.post('/personel/import', userController.bulkTambahPersonel)
router.post('/personel', userController.tambahPersonel)
router.delete('/personel/:id', userController.hapusPersonel)
router.delete('/personel', userController.hapusPersonel)

router.post('/senjata', userController.tambahSenjata)
router.delete('/senjata/:id', userController.hapusSenjata)
router.delete('/senjata', userController.hapusSenjata)

router.post('/jenis-senjata', userController.tambahJenisSenjata)
router.post('/jenis_senjata', userController.tambahJenisSenjata)
router.delete('/jenis-senjata/:id', userController.hapusJenisSenjata)
router.delete('/jenis_senjata/:id', userController.hapusJenisSenjata)

router.post('/tipe-target', userController.tambahTipeTarget)
router.post('/tipe_target', userController.tambahTipeTarget)
router.delete('/tipe-target/:id', userController.hapusTipeTarget)
router.delete('/tipe_target/:id', userController.hapusTipeTarget)

router.post('/mode-tembakan', userController.tambahModeTembakan)
router.post('/mode_tembakan', userController.tambahModeTembakan)
router.delete('/mode-tembakan/:id', userController.hapusModeTembakan)
router.delete('/mode_tembakan/:id', userController.hapusModeTembakan)

router.post('/sikap-menembak', userController.tambahSikapMenembak)
router.post('/sikap_menembak', userController.tambahSikapMenembak)
router.delete('/sikap-menembak/:id', userController.hapusSikapMenembak)
router.delete('/sikap_menembak/:id', userController.hapusSikapMenembak)

// Dukungan alias dengan prefix /atribut/...
router.post('/atribut/senjata', userController.tambahSenjata)
router.post('/atribut/jenis-senjata', userController.tambahJenisSenjata)
router.post('/atribut/tipe-target', userController.tambahTipeTarget)
router.post('/atribut/mode-tembakan', userController.tambahModeTembakan)
router.post('/atribut/sikap-menembak', userController.tambahSikapMenembak)

// ==========================================
// RUTE SESI LATIHAN & DETEKSI TEMBAKAN
// ==========================================
router.get('/sesi', userController.daftarSesi)
router.get('/sesi/detail', userController.detailSesi)
router.get('/sesi/:id', userController.detailSesi)
router.post('/sesi', userController.tambahSesi)
router.patch('/sesi/:id/status', userController.updateStatusSesi)
router.put('/sesi/:id/status', userController.updateStatusSesi)

// Rute untuk menyimpan hasil deteksi tembakan (SITRAK-Detect) ke sitrak-backend
router.post('/deteksi', userController.simpanDeteksi)
router.post('/tembakan', userController.simpanDeteksi)
router.post('/sesi/:id/deteksi', userController.simpanDeteksi)
router.post('/personel-babak/:id/deteksi', userController.simpanDeteksi)
router.put('/personel-babak/:id/deteksi', userController.simpanDeteksi)

module.exports = router
