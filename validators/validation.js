const { param, body } = require("express-validator");
const { validator } = require("./validator");

//at least lowcase, uppercase, number
const passRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d]/;

//username required min 6
//email required isEmail
//password required min 8 match passRegex
//cust_name required isString
//cust_phone required min 12
//cust_address required isString

const register = [
    body("username").isLength({ min: 6 }).notEmpty(),
    body("password").isLength({ min: 8 }).matches(passRegex).notEmpty(), 
    validator
];

/*const login = [
    body("email").isEmail().notEmpty(), 
    body("password").isLength({ min: 8 }).notEmpty(), 
    validator
];

const updateprofile = [
    body("namaLengkap").isString().notEmpty(), 
    body("noTelepon").isNumeric().notEmpty(), 
    body("bio").isString().notEmpty(),
    body("fotoUrl").isString().notEmpty(),
    validator
];

const updateakun = [
    body("user").isLength({ min: 6 }).notEmpty(), 
    body("email").isEmail().notEmpty(), 
    validator
];

const submitberita = [
    body("judul").isString().notEmpty(),
    body("nama").isString().notEmpty(),
    body("deskripsi").isString().notEmpty(),
    body("harga").isNumeric().notEmpty(),
    validator
];

const submitpenawaran = [
    body("user").isString().notEmpty(),
    body("harga").isNumeric().notEmpty(),
    validator
];
/*
const changePw = [
    body("newpw").isLength({ min: 8 }).matches(passRegex).notEmpty(), 
    validator
];

const updateaddress = [
    body("cust_name").isString().notEmpty(), 
    body("cust_phone").isLength({ min: 12 }).notEmpty(), 
    body("cust_address").isString().notEmpty(), 
    validator
];

const addaddress = [
    body("cust_name").isString().notEmpty(), 
    body("cust_phone").isLength({ min: 12 }).notEmpty(), 
    body("cust_address").isString().notEmpty(), 
    validator
];

const addrequest = [
    body("req_unit").isNumeric().notEmpty(), 
    body("req_notes").isString(), 
    body("req_est").isString().notEmpty(),
    body("req_cust").notEmpty(),
    validator
];

const addorder = [
    body("cost").isString().notEmpty(), 
    body("qty").isString().notEmpty(), 
    body("address").isString().notEmpty(), 
    body("type").isString().notEmpty(), 
    body("notes").isString(), 
    validator];
*/
module.exports = {
  register,
  /*login,
  updateprofile,
  updateakun,
  submitberita,
  submitpenawaran
  changePw,
  updateaddress,
  addaddress,
  addorder,
  addrequest*/
};