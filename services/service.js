const jwt = require('jsonwebtoken');
require('dotenv').config();
const bcrypt = require('bcryptjs');
const db = require('../db.config/db.config.js')

const jenisSenjata = async () => {
    try {
        const query = `
        SELECT 
            * 
        FROM 
            jenis_senjata 
        ORDER BY id_jenis_senjata ASC`
        const result = await db.query(query)
        console.log(result)
        return ({
            code: 200,
            message: result.rows
        })
    } catch (error) {
        console.log(error)
        return (error.message);
    }
}

const modeTembakan = async () => {
    try {
        const query = `
        SELECT 
            * 
        FROM 
            mode_tembakan 
        ORDER BY id_mode_tembakan ASC`
        const result = await db.query(query)
        console.log(result)
        return ({
            code: 200,
            message: result.rows
        })
    } catch (error) {
        console.log(error)
        return (error.message);
    }
}

const sikapMenembak = async () => {
    try {
        const query = `
        SELECT 
            * 
        FROM 
            sikap_menembak 
        ORDER BY id_sikap_menembak ASC`
        const result = await db.query(query)
        console.log(result)
        return ({
            code: 200,
            message: result.rows
        })
    } catch (error) {
        console.log(error)
        return (error.message);
    }
}

const tipeTarget = async () => {
    try {
        const query = `
        SELECT 
            * 
        FROM 
            tipe_target 
        ORDER BY id_tipe_target ASC`
        const result = await db.query(query)
        console.log(result)
        return ({
            code: 200,
            message: result.rows
        })
    } catch (error) {
        console.log(error)
        return (error.message);
    }
}

const senjata = async () => {
    try {
        const query = `
        SELECT 
            s.*,
            js.nama_jenis_senjata
        FROM 
            senjata AS s
            LEFT JOIN jenis_senjata AS js ON s.id_jenis_senjata = js.id_jenis_senjata
        ORDER BY s.id_senjata ASC`
        const result = await db.query(query)
        console.log(result)
        return ({
            code: 200,
            message: result.rows
        })
    } catch (error) {
        console.log(error)
        return (error.message);
    }
}

const personelPenembak = async (page = 1, limit = 10, search = '') => {
    try {
        const offset = (page - 1) * limit
        let query = `
        SELECT 
            * 
        FROM 
            personel_penembak`
        let countQuery = `SELECT COUNT(*) FROM personel_penembak`
        const queryParams = []

        if (search) {
            query += ` WHERE nama_personel_penembak ILIKE $1 OR nrp ILIKE $1 OR satuan ILIKE $1`
            countQuery += ` WHERE nama_personel_penembak ILIKE $1 OR nrp ILIKE $1 OR satuan ILIKE $1`
            queryParams.push(`%${search}%`)
        }

        query += ` ORDER BY id_personel_penembak ASC LIMIT $${queryParams.length + 1} OFFSET $${queryParams.length + 2}`
        queryParams.push(limit, offset)

        const totalResult = await db.query(countQuery, search ? [`%${search}%`] : [])
        const totalRows = parseInt(totalResult.rows[0].count)

        const result = await db.query(query, queryParams)
        console.log(result)
        return ({
            code: 200,
            message: {
                data: result.rows,
                total: totalRows,
                page: Number(page),
                limit: Number(limit),
                total_pages: Math.ceil(totalRows / limit)
            }
        })
    } catch (error) {
        console.log(error)
        return (error.message);
    }
}

module.exports = {
    jenisSenjata,
    modeTembakan,
    sikapMenembak,
    tipeTarget,
    senjata,
    personelPenembak,
    personel: personelPenembak
}