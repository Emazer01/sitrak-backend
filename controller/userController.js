const express = require('express')
const jwt = require('jsonwebtoken');
const { Services } = require('../services');

const subOrdinates = {
    'resimen': 'batalyon',
    'batalyon': 'kompi',
    'kompi': 'pleton',
    'pleton': ''
}

const singkat = {
    'resimen': 'men',
    'batalyon': 'yon',
    'kompi': 'ki',
    'pleton': 'ton'
}

const sambung = {
    'resimen': 'ym',
    'batalyon': 'ky',
    'kompi': 'tk'
}

const login = async (req, res, next) => {
    const { username, password } = req.body
    try {
        var result = await Services.login(username, password)
        var aktifitas = await Services.aktifitas(result.id, 'Login')
        res.status(result.code).send(result.message)
    } catch (error) {
        res.status(500).send("Gangguan server");
    }
}

const verify = async (req, res, next) => {
    try {
        const decode = req.user
        res.status(200).json(decode)
    } catch (err) {
        console.log(err.message);
        return res.status(500).send(err)
    }
}

const trends = async (req, res, next) => {
    try {
        var listLapApel = await Services.listLapApel('resimen', 1, '', 'WHERE a.resimen_id = $1', 'LIMIT 15')
        var aktifitas = await Services.getAktifitas()
        var giat = await Services.getLapGiat('approve', 1)
        res.status(listLapApel.code).send({
            trends: listLapApel.lap_apel,
            aktifitas: aktifitas.message,
            giat: giat.message
        })
    } catch (error) {
        return res.status(500).send("Gangguan server")
    }
}

const accounts = async (req, res, next) => {
    try {
        var result = await Services.accounts()
        res.status(result.code).send(result.message)
    } catch (error) {
        return res.status(500).send("Gangguan server")
    }
}

const kadets = async (req, res, next) => {
    try {
        var result = await Services.kadets()
        res.status(result.code).send(result.message)
    } catch (error) {
        return res.status(500).send("Gangguan server")
    }
}

const kadet = async (req, res, next) => {
    try {
        var result = await Services.kadet('kadet_nim', req.query.nim)
        var riwayatApel = await Services.getKadetRiwayatApel(req.query.nim, req.query.riwayatApel)
        result.message.riwayatApel = riwayatApel.message
        console.log(riwayatApel.message)
        var rangkuman = await Services.getRangkuman(result.message.kadet_id)
        result.message.rangkuman = rangkuman.message
        /*var riwayatGiat = await Services.getDataGiat('kadet_id', result.message.kadet_id)
        var listLapGiat = []
        for (let index = 0; index < riwayatGiat.message.length; index++) {
            var pesertaGiat = await Services.getLapGiat('giat_id', riwayatGiat.message[index].giat_id)
            listLapGiat.push(pesertaGiat.message[0])
        }
        result.message.listLapGiat = listLapGiat*/
        console.log(result)
        res.status(result.code).send(result.message)
    } catch (error) {
        return res.status(500).send("Gangguan server")
    }
}

const jabatans = async (req, res, next) => {
    try {
        var result = await Services.jabatans()
        res.status(result.code).send(result.hasil)
    } catch (error) {
        return res.status(500).send("Gangguan server")
    }
}

const dds = async (req, res, next) => {
    try {
        var result = await Services.dds()
        res.status(result.code).send(result.hasil)
    } catch (error) {
        return res.status(500).send("Gangguan server")
    }
}

const myKadet = async (req, res, next) => {
    try {
        var result = await Services.kadet('akun_id', req.user.id)
        var riwayatApel = await Services.getKadetRiwayatApel(result.message.kadet_nim, req.query.riwayatApel)
        result.message.riwayatApel = riwayatApel.message
        console.log(result.message)
        var rangkuman = await Services.getRangkuman(result.message.kadet_id)
        result.message.rangkuman = rangkuman.message
        /*var riwayatGiat = await Services.getDataGiat('kadet_id', result.message.kadet_id)
        var listLapGiat = []
        for (let index = 0; index < riwayatGiat.message.length; index++) {
            var pesertaGiat = await Services.getLapGiat('giat_id', riwayatGiat.message[index].giat_id)
            listLapGiat.push(pesertaGiat.message[0])
        }
        result.message.listLapGiat = listLapGiat*/
        res.status(result.code).send(result.message)
    } catch (error) {
        console.log(error)
        return res.status(500).send("Gangguan server")
    }
}

const atribut = async (req, res, next) => {
    try {
        var result = await Services.atribut()
        res.status(result.code).send(result.message)
    } catch (error) {
        return res.status(500).send("Gangguan server")
    }
}

const changePassword = async = async (req, res, next) => {
    try {
        const login = await Services.login(req.user.username, req.body.oldPassword)
        if (login.code != 200) {
            res.status(login.code).send(login.message)
        }
        var result = await Services.changePassword(req.user.id, req.body.newPassword)
        res.status(result.code).send(result.message)
    } catch (error) {
        return res.status(500).send("Gangguan server")
    }
}

const assignJabatan = async = async (req, res, next) => {
    try {
        var getLogPangkat = await Services.getLogPangkat('kadet_id', req.body.kadet_id)
        var result = await Services.assignJabatan(req.body.tingkat, req.body.jabatan_id, req.body.kadet_id, getLogPangkat.message.log_pangkat_id)
        res.status(result.code).send(result.message)
    } catch (error) {
        return res.status(500).send("Gangguan server")
    }
}

const assignDinas = async = async (req, res, next) => {
    try {
        var getLogPangkat = await Services.getLogPangkat('kadet_id', req.body.kadet_id)
        var result = await Services.assignDinas(req.body.tingkat, req.body.dinas_id, req.body.kadet_id, getLogPangkat.message.log_pangkat_id)
        res.status(result.code).send(result.message)
    } catch (error) {
        return res.status(500).send("Gangguan server")
    }
}

const tambahKadet = async (req, res, next) => {
    try {
        var akun = await Services.register(req.body.username, req.body.password, req.body.role)

        var foto = await Services.foto(req.body.fotoUrl)

        var result = await Services.tambahKadet(req.body.nim, req.body.nama, 1, foto.foto_id, akun.akun_id, req.body.jk, req.body.angkatan, req.body.pangkat, req.body.pleton)
        if (result.code != 200) {
            var rollback = await Services.rollbackTambahKadet(foto.foto_id, akun.akun_id)
            console.log(result)
            res.status(rollback.code).send(rollback.message)
        } else {
            var log_pangkat = await Services.log_pangkat(result.kadet_id, req.body.pangkat)
            var log_pleton = await Services.log_pleton(result.kadet_id, req.body.pleton)
            res.status(result.code).send(result.message)
        }
    } catch (error) {
        return res.status(500).send("Gangguan server")
    }
}

const editKadet = async = async (req, res, next) => {
    try {
        var kadet = await Services.kadet('akun_id', req.user.id)
        const editKadet = await Services.editKadet(req.body.nim, req.body.nama, req.body.pleton, req.body.pangkat, req.user.id, req.body.jk, req.body.angkatan)
        if (editKadet.code == 200) {
            const foto = await Services.editFoto(editKadet.foto_id, req.body.fotoUrl)
            if (req.body.pleton != kadet.message.pleton_id) {
                const log_pleton = await Services.log_pleton(kadet.message.kadet_id, req.body.pleton)
            }
            if (req.body.pangkat != kadet.message.pangkat_id) {
                const log_pleton = await Services.log_pangkat(kadet.message.kadet_id, req.body.pangkat)
            }
            res.status(foto.code).send(foto.message)
        } else {
            res.status(editKadet.code).send('Gangguan server')
        }
    } catch (error) {
        return res.status(500).send("Gangguan server")
    }
}

const tambahAkun = async (req, res, next) => {
    try {
        var akun = await Services.register(req.body.username, req.body.password, req.body.role)
        console.log(akun)
        res.status(akun.code).send('Berhasil tambah akun')
    } catch (error) {
        return res.status(500).send("Gangguan server")
    }
}

const tambahJabatan = async (req, res, next) => {
    try {
        var jabatan = await Services.tambahJabatan(req.body.jenis_jabatan, req.body.tingkat, req.body.yurisdiksi, req.body.nama_jabatan)
        res.status(jabatan.code).send('Berhasil tambah jabatan')
    } catch (error) {
        return res.status(500).send("Gangguan server")
    }
}

const tambahDD = async (req, res, next) => {
    try {
        var dd = await Services.tambahDD(req.body.jenis_jabatan, req.body.tingkat, req.body.yurisdiksi, req.body.nama_dd, req.body.jk)
        res.status(dd.code).send('Berhasil tambah dinas dalam')
    } catch (error) {
        return res.status(500).send("Gangguan server")
    }
}

const wewenang = async (req, res, next) => {
    try {
        var wewenang = await Services.cekJabatan(req.user.id)
        if (wewenang) {
            if (wewenang.data.tingkat != 'pleton') {
                res.status(wewenang.code).send({
                    jabatan: {
                        tingkat: wewenang.data.tingkat,
                        jabatan_nama: wewenang.data.jabatan
                    },
                    pleton_id: 0,
                    pleton_nama: "",
                    kadets: []
                })
            } else {
                var kadets = await Services.accessKadet(wewenang.data.tingkat, wewenang.data.yurisdiksi)
                var listKadet = []
                for (let index = 0; index < kadets.hasil.length; index++) {
                    listKadet.push({
                        kadet_id: kadets.hasil[index].kadet_id,
                        kadet_nama: kadets.hasil[index].kadet_nama
                    })
                }
                res.status(kadets.code).send({
                    jabatan: {
                        tingkat: wewenang.data.tingkat,
                        jabatan_nama: wewenang.data.jabatan
                    },
                    pleton_id: kadets.hasil[0].pleton_id,
                    pleton_nama: `${kadets.hasil[0].pleton_nama} ${kadets.hasil[0].kompi_nama} ${kadets.hasil[0].batalyon_nama}`,
                    kadets: listKadet
                })
            }
        } else {
            res.status(404).send("Tidak Punya Wewenang")
        }

    } catch (error) {
        return res.status(500).send("Gangguan server")
    }
}

const dataApel = async (req, res, next) => {
    try {
        var wewenang = await Services.cekJabatan(req.user.id)
        console.log(wewenang.data)
        if (wewenang) {
            if (wewenang.data.tingkat != 'pleton') {
                res.status(403).send("Tidak Punya Wewenang")
            } else if (wewenang.data.yurisdiksi == req.body.pleton_id) {
                var getLogPangkat = await Services.getLogPangkat('kadet_id', wewenang.data.kadet_id)
                var getLogJabatan = await Services.getLogJabatan(wewenang.data.tingkat, 'log_pangkat_id', getLogPangkat.message.log_pangkat_id)
                var getLogDinas = await Services.getLogDinas(wewenang.data.tingkat, 'log_pangkat_id', getLogPangkat.message.log_pangkat_id)
                var apel = await Services.lapApel('pleton', wewenang.data.yurisdiksi, getLogPangkat.message.log_pangkat_id, getLogJabatan.message.log_jab_id, getLogDinas.message.log_dd_id, req.body.jenis_apel)
                if (apel.lap_apel_id) {
                    for (let index = 0; index < req.body.data.length; index++) {
                        var dataApel = await Services.dataApel(req.body.data[index].keterangan_id, req.body.data[index].kadet_id, apel.lap_apel_id, sakit_id, izin_id)
                        var sakit_id = null
                        var izin_id = null
                        if (req.body.data[index].keterangan_id == 2) {
                            var foto = await Services.foto(req.body.data[index].foto_sakit)
                            sakit_id = await Services.sakit(dataApel.message, req.body.data[index].sakit, req.body.data[index].detail_sakit, foto.foto_id)
                        } else if (req.body.data[index].keterangan_id == 3) {
                            var foto = await Services.foto(req.body.data[index].foto_izin)
                            izin_id = await Services.izin(dataApel.message, req.body.data[index].izin, req.body.data[index].detail_izin, foto.foto_id)
                        }
                    }
                    var aktifitas = await Services.aktifitas(req.user.id, 'Menulis laporan apel pleton')
                    res.status(200).send('berhasil')
                } else {
                    res.status(500).send("Gangguan server")
                }
                //res.status(apel.code).send('Berhasil tambah apel')
            }
        } else {
            res.status(404).send("Tidak Punya Wewenang")
        }
    } catch (error) {
        console.log(error)
        return res.status(500).send("Gangguan server")
    }
}

const listLapApel = async (req, res, next) => {
    try {
        var wewenang = await Services.cekJabatan(req.user.id)
        if (wewenang) {
            var result = await Services.listLapApel(wewenang.data.tingkat, wewenang.data.yurisdiksi, '', `WHERE a.${wewenang.data.tingkat}_id = $1`, '')
            var listSub = []
            for (let index = 0; index < wewenang.data.sub_ordinates.length; index++) {
                var subResult = await Services.listLapApel(subOrdinates[wewenang.data.tingkat], wewenang.data.sub_ordinates[index].subordinates_id, `AND date_trunc('day',a.apel_${singkat[subOrdinates[wewenang.data.tingkat]]}_date) = date_trunc('day', now())`, `WHERE a.${subOrdinates[wewenang.data.tingkat]}_id = $1`, '')
                var menkorps = await Services.cekPejabat('jabatan', subOrdinates[wewenang.data.tingkat], wewenang.data.sub_ordinates[index].subordinates_id, 1)
                var dinas = await Services.cekPejabat('dd', subOrdinates[wewenang.data.tingkat], wewenang.data.sub_ordinates[index].subordinates_id, 1)
                listSub.push({
                    subordinates_id: wewenang.data.sub_ordinates[index].subordinates_id,
                    subordinates_nama: wewenang.data.sub_ordinates[index].subordinates_nama,
                    pejabat_menkorps: menkorps.hasil,
                    pejabat_dinas: dinas.hasil,
                    lap_apel: subResult.lap_apel
                })

            }
            console.log(listSub)
            res.status(result.code).send({
                lap_apel: result.lap_apel,
                subordinates: listSub
            })
        } else {
            res.status(404).send("Tidak Punya Wewenang")
        }
    } catch (error) {
        return res.status(500).send("Gangguan server")
    }
}

const lapApel = async (req, res, next) => {
    try {
        var wewenang = await Services.cekJabatan(req.user.id)
        if (wewenang && req.body.subordinates_lap_id[0] != null) {
            var getLogPangkat = await Services.getLogPangkat('kadet_id', wewenang.data.kadet_id)
            var getLogJabatan = await Services.getLogJabatan(wewenang.data.tingkat, 'log_pangkat_id', getLogPangkat.message.log_pangkat_id)
            var getLogDinas = await Services.getLogDinas(wewenang.data.tingkat, 'log_pangkat_id', getLogPangkat.message.log_pangkat_id)
            var apel = await Services.lapApel(wewenang.data.tingkat, wewenang.data.yurisdiksi, getLogPangkat.message.log_pangkat_id, getLogJabatan.message.log_jab_id, getLogDinas.message.log_dd_id, req.body.jenis_apel)
            if (apel.lap_apel_id) {
                for (let index = 0; index < req.body.subordinates_lap_id.length; index++) {
                    var forward = await Services.forwardApel(wewenang.data.tingkat, subOrdinates[wewenang.data.tingkat], apel.lap_apel_id, req.body.subordinates_lap_id[index])
                    console.log(forward)
                }
                if (wewenang.data.tingkat == 'resimen') {
                    var apel_ton_id = []
                    var sub = await Services.listLapApel('pleton', apel.lap_apel_id, '', `WHERE ${sambung[wewenang.data.tingkat]}.apel_${singkat[wewenang.data.tingkat]}_id = $1`, '')
                    for (let index = 0; index < sub.lap_apel.length; index++) {
                        apel_ton_id.push(sub.lap_apel[index].apel_id)
                    }
                    console.log('apel_ton_id =', apel_ton_id)
                    for (let index = 0; index < apel_ton_id.length; index++) {
                        var data_apel = await Services.getDataApel(apel_ton_id[index])
                        for (let index = 0; index < data_apel.message.length; index++) {
                            var log_ket = await Services.logKeterangan(data_apel.message[index].keterangan_id, data_apel.message[index].kadet_id)
                            var updateKeterangan = await Services.updateKeterangan(data_apel.message[index].kadet_id, data_apel.message[index].keterangan_id)
                        }
                    }
                }
                var aktifitas = await Services.aktifitas(req.user.id, `Menulis laporan apel ${wewenang.data.tingkat}`)
                res.status(200).send('berhasil')
            } else {
                res.status(500).send("Gangguan server")
            }
        } else {
            res.status(404).send("Tidak Punya Wewenang")
        }
    } catch (error) {
        return res.status(500).send("Gangguan server")
    }
}

const apel = async (req, res, next) => {
    try {
        var apel_ton_id = []
        var list_data_apel = []
        var subordinates = []
        var result = await Services.listLapApel(req.query.tingkat, req.query.id, '', `WHERE a.apel_${singkat[req.query.tingkat]}_id = $1`, '')
        console.log(result)
        if (req.query.tingkat != 'pleton') {
            subordinates = await Services.listLapApel(subOrdinates[req.query.tingkat], req.query.id, '', `WHERE ${sambung[req.query.tingkat]}.apel_${singkat[req.query.tingkat]}_id = $1`, '')
            var sub = await Services.listLapApel('pleton', req.query.id, '', `WHERE ${sambung[req.query.tingkat]}.apel_${singkat[req.query.tingkat]}_id = $1`, '')
            for (let index = 0; index < sub.lap_apel.length; index++) {
                apel_ton_id.push(sub.lap_apel[index].apel_id)
            }
        } else if (req.query.tingkat == 'pleton') {
            apel_ton_id.push(result.lap_apel[0].apel_id)
        }
        for (let index = 0; index < apel_ton_id.length; index++) {
            var data_apel = await Services.getDataApel(apel_ton_id[index])
            for (let index = 0; index < data_apel.message.length; index++) {
                if (data_apel.message[index].keterangan_nama == 'Sakit') {
                    var sakit = await Services.getSakit('data_apel_id', data_apel.message[index].data_apel_id)
                    data_apel.message[index].sakit = sakit.message
                } else if (data_apel.message[index].keterangan_nama == 'Izin') {
                    var izin = await Services.getIzin('data_apel_id', data_apel.message[index].data_apel_id)
                    data_apel.message[index].izin = izin.message
                }
                list_data_apel.push(data_apel.message[index])
            }
        }
        return res.status(200).send({
            lapApel: result,
            sub: subordinates,
            dataApel: list_data_apel
        })
    } catch (error) {
        return res.status(500).send("Gangguan server")
    }
}

const lapGiat = async (req, res, next) => {
    try {
        var foto_id = []
        for (let index = 0; index < req.body.foto.length; index++) {
            var foto = await Services.foto(req.body.foto[index].url)
            foto_id.push(foto.foto_id)
        }
        var link_id = []
        for (let index = 0; index < req.body.attachment.length; index++) {
            var link = await Services.link(req.body.attachment[index])
            link_id.push(link.link_id)
        }
        var kadet = await Services.cekKadet(req.user.id)
        var getLogPangkat = await Services.getLogPangkat('kadet_id', kadet.message.kadet_id)
        var giat = await Services.lapGiat(req.body.nama_kegiatan, req.body.detail_kegiatan, req.body.date_kegiatan, getLogPangkat.message.log_pangkat_id)
        for (let index = 0; index < req.body.peserta.length; index++) {
            var getLogPangkat = await Services.getLogPangkat('kadet_id', req.body.peserta[index].kadet_id)
            var getLogPleton = await Services.getLogPleton('kadet_id', req.body.peserta[index].kadet_id)
            var peserta = await Services.dataGiat(giat.giat_id, getLogPangkat.message.log_pangkat_id, getLogPleton.message.log_pleton_id)
        }
        for (let index = 0; index < foto_id.length; index++) {
            var foto_giat = await Services.foto_giat(giat.giat_id, foto_id[index])
        }
        for (let index = 0; index < link_id.length; index++) {
            var attachment_giat = await Services.attachment_giat(giat.giat_id, link_id[index])
        }
        return res.status(200).send('berhasil')
    } catch (error) {
        return res.status(500).send("Gangguan server")
    }
}

const approveGiat = async (req, res, next) => {
    try {
        var wewenang = await Services.cekJabatan(req.user.id)
        console.log(wewenang.data)
        if (wewenang.data.tingkat != 'resimen') {
            return res.status(403).send('Not Authorize')
        } else {
            if (wewenang.data.jabordd == 'jab') {
                var getLogJabatan = await Services.getLogJabatan('resimen', 'log_jab_men_id', wewenang.data.jabordd_id)
                var giat = await Services.approveGiat(req.body.giat_id, 'log_jab_men_id', getLogJabatan.message.log_jab_id)
                console.log(giat)
            } else if (wewenang.data.jabordd == 'dd') {
                var getLogDinas = await Services.getLogDinas('resimen', 'log_dd_men_id', wewenang.data.jabordd_id)
                var giat = await Services.approveGiat(req.body.giat_id, 'log_dd_men_id', getLogDinas.message.log_dd_id)
                console.log(giat)
            }
        }
        return res.status(200).send('berhasil')
    } catch (error) {
        return res.status(500).send("Gangguan server")
    }
}

const listLapGiat = async (req, res, next) => {
    try {
        var kadet = await Services.cekKadet(req.user.id)
        var listLapGiat = await Services.getLapGiat('k.kadet_id', kadet.message.kadet_id)
        return res.status(200).send(listLapGiat.message)
    } catch (error) {
        return res.status(500).send("Gangguan server")
    }
}

const giat = async (req, res, next) => {
    try {
        var listLapGiat = await Services.getLapGiat('giat_id', req.query.nomor)
        var peserta = await Services.getDataGiat('giat_id', req.query.nomor)
        var foto_giat = await Services.getFotoGiat('giat_id', req.query.nomor)
        var attachment_giat = await Services.getAttachmentGiat('giat_id', req.query.nomor)
        return res.status(200).send({
            giat: listLapGiat.message[0],
            peserta: peserta.message,
            foto: foto_giat.message,
            attachment: attachment_giat.message
        })
    } catch (error) {
        return res.status(500).send("Gangguan server")
    }
}

const listUnapprovedGiat = async (req, res, next) => {
    try {
        var wewenang = await Services.cekJabatan(req.user.id)
        if (wewenang.data.tingkat != 'resimen') {
            res.status(403).send("Tidak Punya Wewenang")
        } else {
            var listLapGiat = await Services.getLapGiat('l.approve', 0)
            console.log(listLapGiat)
            return res.status(200).send(listLapGiat.message)
        }
    } catch (error) {
        return res.status(500).send("Gangguan server")
    }
}

const editApel = async (req, res, next) => {
    try {
        console.log(req.body)
        var wewenang = await Services.cekJabatan(req.user.id)
        console.log(wewenang)
        if (req.body.cek.tingkat.toLowerCase() == wewenang.data.tingkat && req.body.cek.satuan_id == wewenang.data.yurisdiksi) {
            console.log("oke")
            for (let index = 0; index < req.body.major.length; index++) {
                console.log(req.body.major[index])
                var editDataApel = await Services.editDataApel(req.body.major[index].data_apel_id, req.body.major[index].keterangan_id)
                if (req.body.major[index].keterangan_id == 2) {
                    var foto = await Services.foto(req.body.major[index].sakit.foto)
                    var sakit = await Services.sakit(req.body.major[index].data_apel_id, req.body.major[index].sakit.sakit_nama, req.body.major[index].sakit.sakit_detail, foto.foto_id)
                } else if (req.body.major[index].keterangan_id == 3) {
                    var foto = await Services.foto(req.body.major[index].izin.foto)
                    var izin = await Services.izin(req.body.major[index].data_apel_id, req.body.major[index].izin.izin_nama, req.body.major[index].izin.izin_detail, foto.foto_id)
                }
                console.log(editDataApel)
            }
            for (let index = 0; index < req.body.minor.sakit.length; index++) {
                var editFoto = await Services.editFoto(req.body.minor.sakit[index].foto_id, req.body.minor.sakit[index].foto)
                var editSakit = await Services.editSakitIzin('sakit', req.body.minor.sakit[index].sakit_nama, req.body.minor.sakit[index].sakit_detail, req.body.minor.sakit[index].sakit_id)
            }
            for (let index = 0; index < req.body.minor.izin.length; index++) {
                var editFoto = await Services.editFoto(req.body.minor.izin[index].foto_id, req.body.minor.izin[index].foto)
                var editIzin = await Services.editSakitIzin('izin', req.body.minor.izin[index].izin_nama, req.body.minor.izin[index].izin_detail, req.body.minor.izin[index].izin_id)
            }
            for (let index = 0; index < req.body.toDel.sakit.length; index++) {
                var delSakit = await Services.deleteEntry('sakit', req.body.toDel.sakit[index])
            }
            for (let index = 0; index < req.body.toDel.izin.length; index++) {
                var delIzin = await Services.deleteEntry('izin', req.body.toDel.izin[index])
            }
            for (let index = 0; index < req.body.toDel.foto.length; index++) {
                var delFoto = await Services.deleteEntry('foto', req.body.toDel.foto[index])
            }
        }
        return res.status(200).send('berhasil')
    } catch (error) {
        return res.status(500).send("Gangguan server")
    }
}

module.exports = {
    login,
    verify,
    accounts,
    atribut,
    tambahKadet,
    tambahAkun,
    kadets,
    kadet,
    changePassword,
    myKadet,
    editKadet,
    tambahJabatan,
    jabatans,
    assignJabatan,
    tambahDD,
    dds,
    assignDinas,
    wewenang,
    dataApel,
    listLapApel,
    lapApel,
    apel,
    lapGiat,
    giat,
    approveGiat,
    listLapGiat,
    listUnapprovedGiat,
    editApel,
    trends
}