const jwt = require('jsonwebtoken');
require("dotenv").config();

const Auth = {
  verifyToken(req, res, next) {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];
    if (token == null) return res.status(401).send("A token is required for authentication");
    jwt.verify(token, process.env.SECRET, (err, user) => {
      if (err) {
        return res.status(403).send('Youre not authenticated, please login first')
        console.log('Youre not authenticated');
      }
      req.user = user
      console.log(`${req.route.path} - ${req.user.username} doing Token Verification`)
      next()
    })
  },
  verifyAdmin(req, res, next) {
    if (req.user.role_id == 1) {
      console.log(`${req.route.path} - ${req.user.username} doing Admin Verification`)
      next()
    }
    else {
      res.status(401).send("You're not authorized")
    }
  }
}

module.exports = Auth;