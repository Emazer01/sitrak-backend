const express = require('express')
const router = express.Router()
const { userController } = require('../controller')
const Auth = require('../middleware/auth')
const { Validation } = require('../validators')

router.get('/atribut', userController.atribut)
router.get('/personel', userController.personelPenembak)

router.get('/sesi', userController.daftarSesi)
router.get('/sesi/detail', userController.detailSesi)
router.get('/sesi/:id', userController.detailSesi)
router.post('/sesi', userController.tambahSesi)
router.patch('/sesi/:id/status', userController.updateStatusSesi)
router.put('/sesi/:id/status', userController.updateStatusSesi)

module.exports = router