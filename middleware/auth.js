const jwt = require('jsonwebtoken');
require("dotenv").config();

const Auth = {
  verifyToken(req, res, next) {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];
    if (!token) {
      return res.status(401).json({
        status: "error",
        message: "Token autentikasi diperlukan. Silakan login terlebih dahulu."
      });
    }
    jwt.verify(token, process.env.SECRET, (err, user) => {
      if (err) {
        return res.status(403).json({
          status: "error",
          message: "Sesi login tidak valid atau telah berakhir. Silakan login kembali."
        });
      }
      req.user = user;
      next();
    });
  },

  verifyAdmin(req, res, next) {
    if (req.user && (req.user.role === 'administrator' || req.user.role_id == 1)) {
      return next();
    }
    return res.status(403).json({
      status: "error",
      message: "Akses ditolak: Hanya Administrator yang memiliki kewenangan ini."
    });
  },

  requireRoles(...allowedRoles) {
    return (req, res, next) => {
      if (!req.user || !req.user.role) {
        return res.status(401).json({
          status: "error",
          message: "Autentikasi diperlukan."
        });
      }
      if (!allowedRoles.includes(req.user.role)) {
        return res.status(403).json({
          status: "error",
          message: `Akses ditolak: Role "${req.user.role}" tidak memiliki wewenang untuk aksi ini.`
        });
      }
      next();
    };
  }
};

module.exports = Auth;
