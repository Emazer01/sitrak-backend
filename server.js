const express = require('express')
const app = express()
const jwt = require('jsonwebtoken')
const userRouter = require('./router')
require('dotenv').config()
const db = require('./db.config/db.config.js')
const cors = require('cors')

db.connect((err) => {
  if (err) {
    console.error(err);
    return;
  }
  console.log('Database Connected');
});

app.use(cors())
app.use(express.json({ limit: "10mb", extended: true }))

app.use('/', userRouter)
app.get('/', async (req, res) => {
  try {
    res.send(`Welcome Page`);
  } catch (error) {
    console.log(error);;
  }
});

PORT = process.env.PORT || 900
app.listen(PORT, () => { console.log(`Application is running on ${PORT}!! `) })

const bcrypt = require('bcryptjs');
const bikinPw = async () => {
  const hash = await bcrypt.hash('AdminMenkor1.', 10)
  console.log(hash)
}

bikinPw()
