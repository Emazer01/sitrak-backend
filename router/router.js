const express = require('express')
const router = express.Router()
const { userController } = require('../controller')
const Auth = require('../middleware/auth')
const { Validation } = require('../validators')

router.get('/atribut', userController.atribut)
router.get('/personel', userController.personelPenembak)

module.exports = router