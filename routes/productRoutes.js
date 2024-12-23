
const { register, login, verifyUserByOtp, forgotPassword, resetPassword } = require("../controllers/authController");
const { authMiddleware } = require("../middleware/auth");
const { db, users } = require("../config/db/db");
const { eq } = require("drizzle-orm");
const express = require("express");
const { getBanners } = require("../controllers/productController");
const router = express.Router();


router.get("/getBanners", getBanners);

module.exports = router;
