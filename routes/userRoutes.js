// backend/src/routes/authRoutes.js
const { authMiddleware } = require("../middleware/auth");

const express = require("express");
const {
  FindByEmail,
  UpdateUserDetails,
  UpdateUserPassword,
  GetAddresses,
  AddAdress,
  DeleteAddress,
  GetAllYourOrders,
} = require("../controllers/userController");
const router = express.Router();

router.post("/findByEmail", FindByEmail);
router.post("/updateUserDetails", authMiddleware, UpdateUserDetails);
router.post("/updateUserPassword", authMiddleware, UpdateUserPassword); //not done yet
router.get("/getUserAddresses", authMiddleware, GetAddresses);
router.post("/addAddress", authMiddleware, AddAdress);
router.post("/deleteAddress", authMiddleware, DeleteAddress);
router.get("/getAllYourOrders", authMiddleware, GetAllYourOrders);

module.exports = router;
