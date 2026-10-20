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
                    pp.satuan,
                    ft.id_foto_target,
                    ft.url_foto_teranotasi AS foto_target,
                    ft.url_foto_asli,
                    ft.grouping_radius_mm,
                    ft.center_offset_x_mm,
                    ft.center_offset_y_mm,
                    ft.status_analisis,
                    ft.catatan_analisis,
                    ft.kategori_kelulusan,
                    ft.total_peluru_terdeteksi,
                    COALESCE(
                        (
                            SELECT json_agg(
                                json_build_object(
                                    'id_deteksi_tembakan', ddt.id_deteksi_tembakan,
                                    'nomor_tembakan', ddt.nomor_tembakan,
                                    'koordinat_x', ddt.koordinat_x,
                                    'koordinat_y', ddt.koordinat_y,
                                    'jarak_dari_pusat_mm', ddt.jarak_dari_pusat_mm,
                                    'skor_poin', ddt.skor_poin,
                                    'ring_zona', ddt.ring_zona,
                                    'confidence_score', ddt.confidence_score
                                ) ORDER BY ddt.nomor_tembakan ASC
                            )
                            FROM detail_deteksi_tembakan ddt
                            WHERE ddt.id_foto_target = ft.id_foto_target
                        ), '[]'::json
                    ) AS detail_tembakan
                FROM 
                    personel_babak pb
                    LEFT JOIN personel_penembak pp ON pb.id_personel_penembak = pp.id_personel_penembak
                    LEFT JOIN LATERAL (
                        SELECT * FROM foto_target 
                        WHERE id_personel_babak = pb.id_personel_babak 
                        ORDER BY id_foto_target DESC LIMIT 1
                    ) ft ON true
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

const simpanDeteksiTembakan = async (payload) => {
    try {
        let {
            id_sesi,
            id_personel_penembak,
            id_babak,
            id_personel_babak,
            total_skor = 0,
            akurasi_persen = 0,
            url_foto_asli = '',
            url_foto_teranotasi = '',
            total_peluru_terdeteksi = 0,
            grouping_radius_mm = null,
            center_offset_x_mm = null,
            center_offset_y_mm = null,
            kategori_kelulusan = 'Cukup',
            status_analisis = 'Selesai',
            catatan_analisis = '',
            shots = []
        } = payload;

        // Pastikan tabel foto_target dan detail_deteksi_tembakan telah tersedia
        await db.query(`
            CREATE TABLE IF NOT EXISTS foto_target (
                id_foto_target SERIAL PRIMARY KEY,
                id_personel_babak INT NOT NULL,
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
        `);

        await db.query(`
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
        `);

        // Cari atau validasi id_personel_babak
        if (!id_personel_babak && id_personel_penembak && id_babak) {
            const findPb = await db.query(
                `SELECT id_personel_babak FROM personel_babak 
                 WHERE id_personel_penembak = $1 AND id_babak = $2 
                 ORDER BY id_personel_babak DESC LIMIT 1`,
                [id_personel_penembak, id_babak]
            );
            if (findPb.rows.length > 0) {
                id_personel_babak = findPb.rows[0].id_personel_babak;
            }
        }

        // Validasi kuota peluru babak: jika tembakan melebihi kuota babak, ambil tembakan terbaik
        let targetQuota = null;
        if (id_babak) {
            const bRes = await db.query(`SELECT jumlah_peluru FROM babak WHERE id_babak = $1`, [id_babak]);
            if (bRes.rows.length > 0 && bRes.rows[0].jumlah_peluru) {
                targetQuota = parseInt(bRes.rows[0].jumlah_peluru);
            }
        } else if (id_personel_babak) {
            const pbRes = await db.query(
                `SELECT b.jumlah_peluru FROM personel_babak pb 
                 JOIN babak b ON pb.id_babak = b.id_babak 
                 WHERE pb.id_personel_babak = $1`,
                [id_personel_babak]
            );
            if (pbRes.rows.length > 0 && pbRes.rows[0].jumlah_peluru) {
                targetQuota = parseInt(pbRes.rows[0].jumlah_peluru);
            }
        }

        if (targetQuota && Array.isArray(shots) && shots.length > targetQuota) {
            // Urutkan berdasarkan tembakan terbaik: skor poin tertinggi, jarak terdekat ke pusat
            shots = [...shots].sort((a, b) => {
                const sA = parseFloat(a.skor_poin ?? a.poin ?? a.score ?? 0);
                const sB = parseFloat(b.skor_poin ?? b.poin ?? b.score ?? 0);
                if (sB !== sA) return sB - sA;
                const dA = parseFloat(a.jarak_dari_pusat_mm ?? a.distance_from_center_mm ?? a.distance_mm ?? 9999);
                const dB = parseFloat(b.jarak_dari_pusat_mm ?? b.distance_from_center_mm ?? b.distance_mm ?? 9999);
                return dA - dB;
            }).slice(0, targetQuota);

            total_skor = shots.reduce((acc, s) => acc + parseFloat(s.skor_poin ?? s.poin ?? s.score ?? 0), 0);
            const maxS = targetQuota * 10;
            akurasi_persen = maxS > 0 ? Number(((total_skor / maxS) * 100).toFixed(1)) : 0;
            total_peluru_terdeteksi = targetQuota;
        }

        // Jika belum ada di personel_babak, buatkan record baru
        if (!id_personel_babak && id_personel_penembak && id_babak) {
            const createPb = await db.query(
                `INSERT INTO personel_babak (id_personel_penembak, id_babak, total_skor, akurasi_persen)
                 VALUES ($1, $2, $3, $4) RETURNING id_personel_babak`,
                [id_personel_penembak, id_babak, total_skor, akurasi_persen]
            );
            id_personel_babak = createPb.rows[0].id_personel_babak;
        } else if (id_personel_babak) {
            // Update skor dan akurasi di tabel personel_babak
            await db.query(
                `UPDATE personel_babak 
                 SET total_skor = $1, akurasi_persen = $2 
                 WHERE id_personel_babak = $3`,
                [total_skor, akurasi_persen, id_personel_babak]
            );
        }

        if (!id_personel_babak) {
            return {
                code: 400,
                message: "Gagal menyimpan data: id_personel_babak atau pasangan personel & babak tidak valid"
            };
        }

        // Simpan data foto target & analisis deteksi
        const insertFotoQuery = `
            INSERT INTO foto_target (
                id_personel_babak,
                url_foto_asli,
                url_foto_teranotasi,
                total_peluru_terdeteksi,
                total_skor,
                akurasi_persen,
                grouping_radius_mm,
                center_offset_x_mm,
                center_offset_y_mm,
                kategori_kelulusan,
                status_analisis,
                catatan_analisis,
                waktu_selesai_analisis
            ) VALUES (
                $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, CURRENT_TIMESTAMP
            ) RETURNING *;
        `;
        const resFoto = await db.query(insertFotoQuery, [
            id_personel_babak,
            url_foto_asli || '',
            url_foto_teranotasi || '',
            total_peluru_terdeteksi || (Array.isArray(shots) ? shots.length : 0),
            total_skor,
            akurasi_persen,
            grouping_radius_mm,
            center_offset_x_mm,
            center_offset_y_mm,
            kategori_kelulusan || 'Cukup',
            status_analisis || 'Selesai',
            catatan_analisis || ''
        ]);

        const savedFoto = resFoto.rows[0];
        const id_foto_target = savedFoto.id_foto_target;
        const savedShots = [];

        // Simpan rincian setiap perkenaan tembakan ke detail_deteksi_tembakan
        if (Array.isArray(shots) && shots.length > 0) {
            for (let i = 0; i < shots.length; i++) {
                const s = shots[i];
                const shotNo = s.nomor_tembakan || s.nomor || (i + 1);
                const x = parseFloat(s.koordinat_x ?? s.x ?? 0);
                const y = parseFloat(s.koordinat_y ?? s.y ?? 0);
                const dist = s.jarak_dari_pusat_mm !== undefined
                    ? parseFloat(s.jarak_dari_pusat_mm)
                    : (s.distance_from_center_mm !== undefined ? parseFloat(s.distance_from_center_mm) : null);
                const poin = parseFloat(s.skor_poin ?? s.poin ?? s.score ?? 0);
                const ring = String(s.ring_zona ?? s.ring ?? '');
                const conf = parseFloat(s.confidence_score ?? s.confidence ?? 1.0);

                const insertShotQuery = `
                    INSERT INTO detail_deteksi_tembakan (
                        id_foto_target,
                        nomor_tembakan,
                        koordinat_x,
                        koordinat_y,
                        jarak_dari_pusat_mm,
                        skor_poin,
                        ring_zona,
                        confidence_score
                    ) VALUES (
                        $1, $2, $3, $4, $5, $6, $7, $8
                    ) RETURNING *;
                `;
                const resShot = await db.query(insertShotQuery, [
                    id_foto_target,
                    shotNo,
                    x,
                    y,
                    dist,
                    poin,
                    ring,
                    conf
                ]);
                savedShots.push(resShot.rows[0]);
            }
        }

        return {
            code: 200,
            message: {
                status: "success",
                message: "Data tembakan hasil deteksi berhasil disimpan ke database SITRAK",
                id_personel_babak,
                foto_target: savedFoto,
                detail_tembakan: savedShots
            }
        };
    } catch (error) {
        console.error("Gagal simpanDeteksiTembakan:", error);
        return {
            code: 500,
            message: error.message || "Gagal menyimpan data tembakan ke database"
        };
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
    updateStatusSesi,
    simpanDeteksiTembakan
}