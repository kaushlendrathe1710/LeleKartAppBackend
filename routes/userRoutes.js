// backend/src/routes/authRoutes.js
const { authMiddleware } = require("../middleware/auth");

const express = require("express");
const {
  FindByEmail,
  UpdateUserDetails,
  UpdateUserPassword,
  GetAddresses,
  DeleteAddress,
  GetAllYourOrders,
  UpdateAddress,
  AddAddress,
  CreateOrder,
  ShiprocketOrder,
  GetAddressesById,
  shipRocketgetOrderDetails,
  shipRoocketCancelOrder,
  CancelOrder,
} = require("../controllers/userController");
const router = express.Router();

router.post("/findByEmail", FindByEmail);
router.post("/updateUserDetails", authMiddleware, UpdateUserDetails);
router.post("/updateUserPassword", authMiddleware, UpdateUserPassword); //not done yet
router.get("/getUserAddresses", authMiddleware, GetAddresses);
router.get("/GetAddressesById", authMiddleware, GetAddressesById);
router.post("/updateUserAddress", authMiddleware, UpdateAddress);
router.post("/addAddress", authMiddleware, AddAddress);
router.post("/deleteAddress", authMiddleware, DeleteAddress);
router.get("/getAllYourOrders", authMiddleware, GetAllYourOrders);


router.post("/createOrder", authMiddleware, CreateOrder);
router.post("/cancelOrder", authMiddleware, CancelOrder);
router.post("/ShiprocketOrder", authMiddleware, ShiprocketOrder);
router.post("/shipRoocketCancelOrder", authMiddleware, shipRoocketCancelOrder);
router.post(
  "/shipRocketgetOrderDetails",
  authMiddleware,
  shipRocketgetOrderDetails
);


module.exports = router;
