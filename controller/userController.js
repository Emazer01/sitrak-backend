const express = require('express')
const jwt = require('jsonwebtoken');
const { Services } = require('../services');

const atribut = async (req, res, next) => {
    try {
        var jenisSenjata = await Services.jenisSenjata()
        var modeTembakan = await Services.modeTembakan()
        var sikapMenembak = await Services.sikapMenembak()
        var tipeTarget = await Services.tipeTarget()
        var senjata = await Services.senjata()
        console.log({
            jenis_senjata: jenisSenjata.message,
            mode_tembakan: modeTembakan.message,
            sikap_menembak: sikapMenembak.message,
            tipe_target: tipeTarget.message,
            senjata: senjata.message
        })
        res.status(200).send({
            jenis_senjata: jenisSenjata.message,
            mode_tembakan: modeTembakan.message,
            sikap_menembak: sikapMenembak.message,
            tipe_target: tipeTarget.message,
            senjata: senjata.message
        })
    } catch (error) {
        return res.status(500).send("Gangguan server")
    }
}

const personelPenembak = async (req, res, next) => {
    try {
        const page = parseInt(req.query.page) || 1
        const limit = parseInt(req.query.limit) || 10
        const search = req.query.search || ''

        var result = await Services.personelPenembak(page, limit, search)
        res.status(result.code).send(result.message)
    } catch (error) {
        return res.status(500).send("Gangguan server")
    }
}

module.exports = {
    atribut,
    personelPenembak,
    personel: personelPenembak
}