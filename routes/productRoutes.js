const { authMiddleware } = require("../middleware/auth");
const express = require("express");
const {
  getBanners,
  getCategories,
  getProductsWithCategory,
  getBestSellers,
  getProduct,
  getProductsByCategory,
  getProductsByCategoryAll,
  getProductsByCategoryOrSubCategory,
} = require("../controllers/productController");
const router = express.Router();

// form home page only

router.get("/getBanners", getBanners);
router.get("/getCategories", getCategories);
router.get("/getProductsWithCategory", getProductsWithCategory);
router.get("/getBestSellers", getBestSellers);
router.get("/getProduct", getProduct);
router.get("/getProductsByCategory", getProductsByCategory); // for best recommendation
router.get("/getProductsByCategoryAll", getProductsByCategoryAll);
router.get(
  "/getProductsByCategoryOrSubCategory",
  getProductsByCategoryOrSubCategory
);




router.post("/checkPinCode", async (req, res) => {
  try {
    const body = req.body;

    if (!body.Input_Pincode) {
      return res.status(400).json({ error: "Pincode is required" });
    }

    console.log("Request Body:", body);

    const url = `https://api.cept.gov.in/CommonFacilityMaster/api/values/Fetch_Facility`;

    const options = {
      method: "POST",
      headers: {
        "Content-Type": "application/json", // Ensure the API expects JSON
        // Add other headers if needed (e.g., Authorization)
      },
      body: JSON.stringify(body),
    };

    const response = await fetch(url, options);

    // Log the response status and headers
    console.log("Response Status:", response.status);
    console.log("Response Headers:", response.headers);

    // If the response isn't OK, log the body to understand the error
    if (!response.ok) {
      const errorData = await response.text();
      console.log("Error Response:", errorData);
      throw new Error(`Failed to fetch data: ${response.statusText}`);
    }

    const data = await response.json();
    console.log("Response Data:", data);

    return res.json(data);
  } catch (err) {
    console.error("Error in POST function:", err);
    return res.status(500).json({ error: "Internal Server Error" });
  }
});

// for home page only end

module.exports = router;
