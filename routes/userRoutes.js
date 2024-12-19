// backend/src/routes/authRoutes.js
const { authMiddleware } = require("../middleware/auth");

const express = require("express");
const {
  FindByEmail,
  UpdateUserDetails,
  UpdateUserPassword,
  GetAddresses,
  AddAdress,
} = require("../controllers/userController");
const router = express.Router();

router.get("/findByEmail", authMiddleware, FindByEmail);
router.post("/updateUserDetails", authMiddleware, UpdateUserDetails);
router.post("/updateUserPassword", authMiddleware, UpdateUserPassword); //not done yet
router.get("/getUserAddresses", authMiddleware, GetAddresses);
router.post("/addAdress", authMiddleware, AddAdress);

module.exports = router;
