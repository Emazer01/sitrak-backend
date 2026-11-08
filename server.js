const express = require('express')
const app = express()
const userRouter = require('./router')
require('dotenv').config()
const db = require('./db.config/db.config.js')
const cors = require('cors')
const logger = require('./middleware/logger')
const { Services } = require('./services')

db.connect(async (err) => {
  if (err) {
    console.error(err);
    return;
  }
  console.log('Database Connected');
  try {
    await Services.initUsersTable();
    console.log('Tabel users PostgreSQL & 3 akun role siap');
  } catch (initErr) {
    console.error('Gagal menginisialisasi tabel users:', initErr);
  }
});

app.use(cors())
app.use(express.json({ limit: "10mb", extended: true }))
app.use(logger)

app.use('/', userRouter)
app.get('/', async (req, res) => {
  try {
    res.send(`Welcome Page`);
  } catch (error) {
    console.log(error);
  }
});

const PORT = process.env.PORT || 900
app.listen(PORT, () => { console.log(`Application is running on ${PORT}!! `) })
