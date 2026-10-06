const express = require('express')
const router = express.Router()
const { userController } = require('../controller')
const Auth = require('../middleware/auth')
const { Validation } = require('../validators')

router.post('/login', userController.login)

router.get('/verify', Auth.verifyToken, userController.verify)

router.get('/atribut', Auth.verifyToken, userController.atribut)

router.get('/kadet/all', Auth.verifyToken, userController.kadets)

router.get('/kadet/detail', Auth.verifyToken, userController.kadet)

router.get('/kadet/my', Auth.verifyToken, userController.myKadet)

router.get('/accounts', Auth.verifyToken, Auth.verifyAdmin, userController.accounts)

router.post('/accounts/addKadet', Auth.verifyToken, Auth.verifyAdmin, Validation.register, userController.tambahKadet)

router.post('/accounts/add', Auth.verifyToken, Auth.verifyAdmin, Validation.register, userController.tambahAkun)

router.post('/tambahJabatan', Auth.verifyToken, Auth.verifyAdmin, userController.tambahJabatan)

router.post('/tambahDD', Auth.verifyToken, Auth.verifyAdmin, userController.tambahDD)

router.put('/changePassword', Auth.verifyToken, userController.changePassword)

router.put('/editKadet', Auth.verifyToken, userController.editKadet)

router.get('/jabatans', Auth.verifyToken, userController.jabatans)

router.get('/dds', Auth.verifyToken, userController.dds)

router.put('/jabatans/assign', Auth.verifyToken, Auth.verifyAdmin, userController.assignJabatan)

router.put('/dds/assign', Auth.verifyToken, Auth.verifyAdmin, userController.assignDinas)

router.get('/wewenang', Auth.verifyToken, userController.wewenang)

router.post('/laporan/apel/create', Auth.verifyToken, userController.dataApel)

router.get('/laporan/apel', Auth.verifyToken, userController.listLapApel)

router.post('/laporan/apel/forward', Auth.verifyToken, userController.lapApel)

router.get('/laporan/apel/detail', Auth.verifyToken, userController.apel)

router.post('/laporan/apel/edit', Auth.verifyToken, userController.editApel)

router.post('/laporan/giat/create', Auth.verifyToken, userController.lapGiat)

router.put('/approveGiat', Auth.verifyToken, userController.approveGiat)

router.get('/laporan/giat', Auth.verifyToken, userController.listLapGiat)

router.get('/giat', Auth.verifyToken, userController.giat)

router.get('/listUnapprovedGiat', Auth.verifyToken, userController.listUnapprovedGiat)

router.get('/trends', Auth.verifyToken, userController.trends)

module.exports = router