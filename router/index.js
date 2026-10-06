const express = require("express");
const router = express.Router();

router.use("/", require("./router"));

module.exports = router;