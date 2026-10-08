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

const tambahSesi = async (req, res, next) => {
    try {
        const {
            nama_sesi,
            nama_tempat_menembak,
            tanggal,
            jumlah_jalur,
            total_gelombang,
            jarak_meter,
            id_senjata,
            id_mode_tembakan,
            id_sikap_menembak,
            id_tipe_target,
            status,
            gelombang,
            babak,
            personel
        } = req.body

        // 1. Simpan data Sesi
        var sesiResult = await Services.tambahSesi({
            nama_sesi,
            nama_tempat_menembak,
            tanggal,
            jumlah_jalur,
            total_gelombang,
            jarak_meter,
            id_senjata,
            id_mode_tembakan,
            id_sikap_menembak,
            id_tipe_target,
            status
        })

        if (sesiResult.code !== 201) {
            return res.status(sesiResult.code).send(sesiResult.message)
        }

        var id_sesi = sesiResult.message.id_sesi
        var hasilGelombang = []

        // 2. Jika data gelombang dikirim bersarang (hierarki: sesi -> gelombang -> babak -> personel / gelombang.personel)
        if (gelombang && Array.isArray(gelombang)) {
            for (let g = 0; g < gelombang.length; g++) {
                let gelItem = gelombang[g]
                var gelombangResult = await Services.tambahGelombang({
                    id_sesi: id_sesi,
                    nomor_gelombang: gelItem.nomor_gelombang || (g + 1),
                    lane: gelItem.lane || jumlah_jalur || 1
                })

                if (gelombangResult.code === 201) {
                    let id_gelombang = gelombangResult.message.id_gelombang
                    let hasilBabak = []

                    // 2a. Buat semua babak pada gelombang ini terlebih dahulu
                    if (gelItem.babak && Array.isArray(gelItem.babak)) {
                        for (let b = 0; b < gelItem.babak.length; b++) {
                            let babakItem = gelItem.babak[b]
                            var babakResult = await Services.tambahBabak({
                                id_gelombang: id_gelombang,
                                nomor_babak: babakItem.nomor_babak || (b + 1),
                                nama_babak: babakItem.nama_babak || `Babak ${b + 1}`,
                                jumlah_peluru: babakItem.jumlah_peluru || 10
                            })

                            if (babakResult.code === 201) {
                                hasilBabak.push(babakResult.message)
                            }
                        }
                    }

                    // 2b. Daftarkan HANYA personel yang menembak pada gelombang ini
                    // Prioritas: gelItem.personel atau personel yang terdaftar di babak gelombang tersebut
                    let listPersonel = gelItem.personel || (gelItem.babak && gelItem.babak[0] && gelItem.babak[0].personel)
                    
                    // Jika tidak ada di gelItem tetapi ada req.body.personel, filter berdasarkan nomor_gelombang / id_gelombang jika ada propertinya
                    if (!listPersonel && Array.isArray(req.body.personel)) {
                        const noGel = gelItem.nomor_gelombang || (g + 1)
                        const filtered = req.body.personel.filter(p => (
                            typeof p === 'object' && (p.nomor_gelombang === noGel || p.gelombang === noGel)
                        ))
                        if (filtered.length > 0) {
                            listPersonel = filtered
                        }
                    }

                    let hasilPersonel = []

                    if (listPersonel && (Array.isArray(listPersonel) ? listPersonel.length > 0 : true)) {
                        var perBabakResult = await Services.tambahPersonelBabak({
                            id_gelombang: id_gelombang,
                            id_personel_penembak: listPersonel
                        })
                        if (perBabakResult.code === 201) {
                            hasilPersonel = perBabakResult.message
                        }
                    }

                    hasilGelombang.push({
                        ...gelombangResult.message,
                        babak: hasilBabak,
                        personel_babak: hasilPersonel
                    })
                }
            }
        } else if (babak || personel) {
            // Alternatif jika format payload sederhana (sesi + babak + personel langsung)
            const jmlGelombang = total_gelombang || 1
            const kapasitasLane = jumlah_jalur || (Array.isArray(personel) ? Math.ceil(personel.length / jmlGelombang) : 1)

            for (let g = 1; g <= jmlGelombang; g++) {
                var gelombangResult = await Services.tambahGelombang({
                    id_sesi: id_sesi,
                    nomor_gelombang: g,
                    lane: jumlah_jalur || 1
                })

                if (gelombangResult.code === 201) {
                    let id_gelombang = gelombangResult.message.id_gelombang
                    let listBabak = Array.isArray(babak) ? babak : [{ nomor_babak: 1, nama_babak: 'Babak 1', jumlah_peluru: 10 }]
                    let hasilBabak = []

                    for (let b = 0; b < listBabak.length; b++) {
                        let babakItem = listBabak[b]
                        var babakResult = await Services.tambahBabak({
                            id_gelombang: id_gelombang,
                            nomor_babak: babakItem.nomor_babak || (b + 1),
                            nama_babak: babakItem.nama_babak || `Babak ${b + 1}`,
                            jumlah_peluru: babakItem.jumlah_peluru || 10
                        })

                        if (babakResult.code === 201) {
                            hasilBabak.push(babakResult.message)
                        }
                    }

                    // Ambil personel khusus untuk gelombang ini saja
                    let listPersonel = []
                    if (Array.isArray(personel)) {
                        // 1. Cek jika personel memiliki penanda gelombang
                        const filteredByWave = personel.filter(p => typeof p === 'object' && (p.nomor_gelombang === g || p.gelombang === g))
                        if (filteredByWave.length > 0) {
                            listPersonel = filteredByWave
                        } else {
                            // 2. Jika daftar datar tanpa penanda gelombang, bagi rata per gelombang sesuai kapasitas lane
                            const startIndex = (g - 1) * kapasitasLane
                            listPersonel = personel.slice(startIndex, startIndex + kapasitasLane)
                        }
                    } else if (personel) {
                        listPersonel = g === 1 ? [personel] : []
                    }

                    let hasilPersonel = []

                    if (listPersonel && listPersonel.length > 0) {
                        var perBabakResult = await Services.tambahPersonelBabak({
                            id_gelombang: id_gelombang,
                            id_personel_penembak: listPersonel
                        })
                        if (perBabakResult.code === 201) {
                            hasilPersonel = perBabakResult.message
                        }
                    }

                    hasilGelombang.push({
                        ...gelombangResult.message,
                        babak: hasilBabak,
                        personel_babak: hasilPersonel
                    })
                }
            }
        }

        res.status(201).send({
            message: "Berhasil menambahkan sesi dan data terkait",
            sesi: sesiResult.message,
            gelombang: hasilGelombang
        })
    } catch (error) {
        console.log(error)
        return res.status(500).send("Gangguan server")
    }
}

const tambahPersonelBabak = async (req, res, next) => {
    try {
        const { id_gelombang, id_personel_penembak, total_skor, akurasi_persen } = req.body
        if (!id_gelombang || !id_personel_penembak) {
            return res.status(400).send("Parameter id_gelombang dan id_personel_penembak diperlukan")
        }

        const result = await Services.tambahPersonelBabak({
            id_gelombang,
            id_personel_penembak,
            total_skor,
            akurasi_persen
        })
        res.status(result.code).send(result.message)
    } catch (error) {
        console.log(error)
        return res.status(500).send("Gangguan server")
    }
}

const daftarSesi = async (req, res, next) => {
    try {
        const page = parseInt(req.query.page) || 1
        const limit = parseInt(req.query.limit) || 10
        const search = req.query.search || ''
        const status = req.query.status || ''

        var result = await Services.daftarSesi(page, limit, search, status)
        res.status(result.code).send(result.message)
    } catch (error) {
        return res.status(500).send("Gangguan server")
    }
}

const detailSesi = async (req, res, next) => {
    try {
        const id_sesi = req.params.id || req.query.id
        if (!id_sesi) {
            return res.status(400).send("Parameter id sesi diperlukan")
        }
        var result = await Services.detailSesi(id_sesi)
        res.status(result.code).send(result.message)
    } catch (error) {
        return res.status(500).send("Gangguan server")
    }
}

const updateStatusSesi = async (req, res, next) => {
    try {
        const id_sesi = req.params.id || req.body.id_sesi
        const status = req.body.status

        if (!id_sesi) {
            return res.status(400).send("Parameter id sesi diperlukan")
        }
        if (!status) {
            return res.status(400).send("Parameter status diperlukan")
        }

        var result = await Services.updateStatusSesi(id_sesi, status)
        res.status(result.code).send(result.message)
    } catch (error) {
        console.log(error)
        return res.status(500).send("Gangguan server")
    }
}

module.exports = {
    atribut,
    personelPenembak,
    personel: personelPenembak,
    tambahSesi,
    tambahPersonelBabak,
    daftarSesi,
    sesi: daftarSesi,
    detailSesi,
    updateStatusSesi
}