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

const tambahSesi = async (
    nama_sesi,
    nama_tempat_menembak,
    jumlah_jalur = 1,
    total_gelombang = 1,
    jarak_meter = 25,
    id_senjata,
    id_mode_tembakan,
    id_sikap_menembak,
    id_tipe_target,
    status = 'Menunggu',
    tanggal
) => {
    if (typeof nama_sesi === 'object' && nama_sesi !== null) {
        ({
            nama_sesi,
            nama_tempat_menembak,
            jumlah_jalur = 1,
            total_gelombang = 1,
            jarak_meter = 25,
            id_senjata,
            id_mode_tembakan,
            id_sikap_menembak,
            id_tipe_target,
            status = 'Menunggu',
            tanggal
        } = nama_sesi);
    }
    try {
        const query = `
        INSERT INTO sesi (
            nama_sesi,
            nama_tempat_menembak,
            jumlah_jalur,
            total_gelombang,
            jarak_meter,
            id_senjata,
            id_mode_tembakan,
            id_sikap_menembak,
            id_tipe_target,
            status,
            tanggal
        ) VALUES (
            $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, COALESCE($11, CURRENT_DATE)
        ) RETURNING *;`;

        const values = [
            nama_sesi,
            nama_tempat_menembak,
            jumlah_jalur,
            total_gelombang,
            jarak_meter,
            id_senjata,
            id_mode_tembakan,
            id_sikap_menembak,
            id_tipe_target,
            status,
            tanggal || null
        ];

        const result = await db.query(query, values);
        return ({
            code: 201,
            message: result.rows[0]
        });
    } catch (error) {
        console.log(error);
        return ({
            code: 500,
            message: error.message
        });
    }
};

const tambahGelombang = async (id_sesi, nomor_gelombang, lane) => {
    if (typeof id_sesi === 'object' && id_sesi !== null) {
        ({ id_sesi, nomor_gelombang, lane } = id_sesi);
    }
    try {
        const query = `
        INSERT INTO gelombang (
            id_sesi,
            nomor_gelombang,
            lane
        ) VALUES (
            $1, $2, $3
        ) RETURNING *;`;

        const result = await db.query(query, [id_sesi, nomor_gelombang, lane]);
        return ({
            code: 201,
            message: result.rows[0]
        });
    } catch (error) {
        console.log(error);
        return ({
            code: 500,
            message: error.message
        });
    }
};

const tambahBabak = async (id_gelombang, nomor_babak, nama_babak, jumlah_peluru = 10) => {
    if (typeof id_gelombang === 'object' && id_gelombang !== null) {
        ({ id_gelombang, nomor_babak, nama_babak, jumlah_peluru = 10 } = id_gelombang);
    }
    try {
        const query = `
        INSERT INTO babak (
            id_gelombang,
            nomor_babak,
            nama_babak,
            jumlah_peluru
        ) VALUES (
            $1, $2, $3, $4
        ) RETURNING *;`;

        const result = await db.query(query, [id_gelombang, nomor_babak, nama_babak, jumlah_peluru]);
        return ({
            code: 201,
            message: result.rows[0]
        });
    } catch (error) {
        console.log(error);
        return ({
            code: 500,
            message: error.message
        });
    }
};

const tambahPersonelBabak = async (id_gelombang, id_personel_penembak, total_skor = 0.00, akurasi_persen = 0.00) => {
    if (typeof id_gelombang === 'object' && id_gelombang !== null) {
        ({
            id_gelombang,
            id_personel_penembak,
            total_skor = 0.00,
            akurasi_persen = 0.00
        } = id_gelombang);
    }
    try {
        // 1. Query select untuk mengambil daftar babak dengan menerima parameter id_gelombang
        const queryBabak = `
        SELECT id_babak 
        FROM babak 
        WHERE id_gelombang = $1 
        ORDER BY nomor_babak ASC;`;
        const resBabak = await db.query(queryBabak, [id_gelombang]);
        const daftarBabak = resBabak.rows;

        if (daftarBabak.length === 0) {
            return ({
                code: 404,
                message: "Daftar babak untuk gelombang ini tidak ditemukan"
            });
        }

        // Normalisasi id_personel_penembak (bisa array ataupun nilai tunggal)
        let listPersonel = Array.isArray(id_personel_penembak)
            ? id_personel_penembak
            : [id_personel_penembak];

        // Jika objek personel memiliki penanda gelombang (id_gelombang/nomor_gelombang), filter hanya yang cocok dengan gelombang ini
        listPersonel = listPersonel.filter(p => {
            if (typeof p === 'object' && p !== null) {
                if (p.id_gelombang !== undefined && p.id_gelombang !== id_gelombang) {
                    return false;
                }
            }
            return true;
        });

        const insertedRecords = [];

        // 2. Loop query insert personel_babak sesuai hasil daftar babak dengan parameter id_personel_penembak yang menembak pada gelombang tersebut
        for (const babak of daftarBabak) {
            for (const personel of listPersonel) {
                const pId = typeof personel === 'object' && personel !== null
                    ? personel.id_personel_penembak
                    : personel;
                const skor = typeof personel === 'object' && personel !== null && personel.total_skor !== undefined
                    ? personel.total_skor
                    : total_skor;
                const akurasi = typeof personel === 'object' && personel !== null && personel.akurasi_persen !== undefined
                    ? personel.akurasi_persen
                    : akurasi_persen;

                if (!pId) continue;

                const queryInsert = `
                INSERT INTO personel_babak (
                    id_personel_penembak,
                    id_babak,
                    total_skor,
                    akurasi_persen
                ) VALUES (
                    $1, $2, $3, $4
                ) RETURNING *;`;

                const result = await db.query(queryInsert, [pId, babak.id_babak, skor, akurasi]);
                insertedRecords.push(result.rows[0]);
            }
        }

        return ({
            code: 201,
            message: insertedRecords
        });
    } catch (error) {
        console.log(error);
        return ({
            code: 500,
            message: error.message
        });
    }
};

const daftarSesi = async (page = 1, limit = 10, search = '', status = '') => {
    try {
        const offset = (page - 1) * limit
        let query = `
        SELECT 
            s.id_sesi,
            s.nama_sesi,
            s.nama_tempat_menembak,
            s.tanggal,
            s.jumlah_jalur,
            s.total_gelombang,
            s.jarak_meter,
            s.status,
            s.created_at,
            s.id_senjata,
            sen.model_senjata,
            s.id_mode_tembakan,
            mt.nama_mode_tembakan,
            s.id_sikap_menembak,
            sm.nama_sikap_menembak,
            s.id_tipe_target,
            tt.nama_tipe_target
        FROM 
            sesi s
            LEFT JOIN senjata sen ON s.id_senjata = sen.id_senjata
            LEFT JOIN mode_tembakan mt ON s.id_mode_tembakan = mt.id_mode_tembakan
            LEFT JOIN sikap_menembak sm ON s.id_sikap_menembak = sm.id_sikap_menembak
            LEFT JOIN tipe_target tt ON s.id_tipe_target = tt.id_tipe_target`

        let countQuery = `SELECT COUNT(*) FROM sesi s`
        const queryParams = []
        const whereClauses = []

        if (search) {
            queryParams.push(`%${search}%`)
            whereClauses.push(`(s.nama_sesi ILIKE $${queryParams.length} OR s.nama_tempat_menembak ILIKE $${queryParams.length})`)
        }

        if (status) {
            queryParams.push(status)
            whereClauses.push(`s.status = $${queryParams.length}`)
        }

        if (whereClauses.length > 0) {
            const whereSQL = ` WHERE ` + whereClauses.join(' AND ')
            query += whereSQL
            countQuery += whereSQL
        }

        query += ` ORDER BY s.id_sesi DESC LIMIT $${queryParams.length + 1} OFFSET $${queryParams.length + 2}`

        const countParams = queryParams.slice()
        queryParams.push(limit, offset)

        const totalResult = await db.query(countQuery, countParams)
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
        console.log(error);
        return ({
            code: 500,
            message: error.message
        });
    }
};

const detailSesi = async (id_sesi) => {
    try {
        const querySesi = `
        SELECT 
            s.id_sesi,
            s.nama_sesi,
            s.nama_tempat_menembak,
            s.tanggal,
            s.jumlah_jalur,
            s.total_gelombang,
            s.jarak_meter,
            s.status,
            s.created_at,
            s.id_senjata,
            sen.model_senjata,
            sen.kaliber,
            sen.pabrikan,
            s.id_mode_tembakan,
            mt.nama_mode_tembakan,
            s.id_sikap_menembak,
            sm.nama_sikap_menembak,
            s.id_tipe_target,
            tt.nama_tipe_target
        FROM 
            sesi s
            LEFT JOIN senjata sen ON s.id_senjata = sen.id_senjata
            LEFT JOIN mode_tembakan mt ON s.id_mode_tembakan = mt.id_mode_tembakan
            LEFT JOIN sikap_menembak sm ON s.id_sikap_menembak = sm.id_sikap_menembak
            LEFT JOIN tipe_target tt ON s.id_tipe_target = tt.id_tipe_target
        WHERE 
            s.id_sesi = $1;`;

        const resSesi = await db.query(querySesi, [id_sesi]);
        if (resSesi.rows.length === 0) {
            return ({
                code: 404,
                message: "Data sesi tidak ditemukan"
            });
        }

        const dataSesi = resSesi.rows[0];

        // Ambil data gelombang untuk sesi ini
        const queryGelombang = `
        SELECT * FROM gelombang 
        WHERE id_sesi = $1 
        ORDER BY nomor_gelombang ASC;`;
        const resGelombang = await db.query(queryGelombang, [id_sesi]);

        const gelombangList = [];
        for (const gel of resGelombang.rows) {
            // Ambil data babak untuk tiap gelombang
            const queryBabak = `
            SELECT * FROM babak 
            WHERE id_gelombang = $1 
            ORDER BY nomor_babak ASC;`;
            const resBabak = await db.query(queryBabak, [gel.id_gelombang]);

            const babakList = [];
            for (const bb of resBabak.rows) {
                // Ambil data personel babak beserta identitas personel
                const queryPersonel = `
                SELECT 
                    pb.id_personel_babak,
                    pb.id_babak,
                    pb.id_personel_penembak,
                    pb.total_skor,
                    pb.akurasi_persen,
                    pb.created_at,
                    pp.nrp,
                    pp.nama_personel_penembak,
                    pp.satuan
                FROM 
                    personel_babak pb
                    LEFT JOIN personel_penembak pp ON pb.id_personel_penembak = pp.id_personel_penembak
                WHERE 
                    pb.id_babak = $1
                ORDER BY pb.id_personel_babak ASC;`;
                const resPersonel = await db.query(queryPersonel, [bb.id_babak]);

                babakList.push({
                    ...bb,
                    personel: resPersonel.rows
                });
            }

            gelombangList.push({
                ...gel,
                babak: babakList
            });
        }

        dataSesi.gelombang = gelombangList;
        console.log(dataSesi);

        return ({
            code: 200,
            message: dataSesi
        });
    } catch (error) {
        console.log(error);
        return ({
            code: 500,
            message: error.message
        });
    }
};

const updateStatusSesi = async (id_sesi, status) => {
    if (typeof id_sesi === 'object' && id_sesi !== null) {
        ({ id_sesi, status } = id_sesi);
    }
    try {
        const query = `
        UPDATE sesi 
        SET status = $1 
        WHERE id_sesi = $2 
        RETURNING *;`;

        const result = await db.query(query, [status, id_sesi]);

        if (result.rows.length === 0) {
            return ({
                code: 404,
                message: "Data sesi tidak ditemukan"
            });
        }

        return ({
            code: 200,
            message: result.rows[0]
        });
    } catch (error) {
        console.log(error);
        return ({
            code: 500,
            message: error.message
        });
    }
};

module.exports = {
    jenisSenjata,
    modeTembakan,
    sikapMenembak,
    tipeTarget,
    senjata,
    personelPenembak,
    personel: personelPenembak,
    tambahSesi,
    tambahGelombang,
    tambahBabak,
    tambahPersonelBabak,
    daftarSesi,
    sesi: daftarSesi,
    detailSesi,
    updateStatusSesi
}