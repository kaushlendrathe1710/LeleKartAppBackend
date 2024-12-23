
const { authMiddleware } = require("../middleware/auth");
const express = require("express");
const {
  getBanners,
  getCategories,
} = require("../controllers/productController");
const router = express.Router();

router.get("/getBanners", getBanners);
router.get("/getCategories", getCategories);

module.exports = router;
