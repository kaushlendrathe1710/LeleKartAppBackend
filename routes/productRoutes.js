const { authMiddleware } = require("../middleware/auth");
const express = require("express");
const {
  getBanners,
  getCategories,
  getProductsWithCategory,
  getBestSellers,
  getProduct,
} = require("../controllers/productController");
const router = express.Router();

// form home page only

router.get("/getBanners", getBanners);
router.get("/getCategories", getCategories);
router.get("/getProductsWithCategory", getProductsWithCategory);
router.get("/getBestSellers", getBestSellers);
router.get("/getProduct", getProduct);

// for home page only end

module.exports = router;
