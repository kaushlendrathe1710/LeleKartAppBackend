// backend/src/routes/authRoutes.js
const { body } = require("express-validator");
const passport = require("passport");
const jwt = require("jsonwebtoken");
const { register, login, verifyUserByOtp, forgotPassword, resetPassword } = require("../controllers/authController");
const { authMiddleware } = require("../middleware/auth");
const { db, users } = require("../config/db/db");
const { eq } = require("drizzle-orm");
const express = require("express");
const router = express.Router();

// register route
router.post(
  "/register",
  [
    body("name").not().isEmpty().trim().escape(),
    body("email").isEmail().normalizeEmail(),
    body("password").isLength({ min: 6 }),
  ],
  register
);

//verify route
router.post("/verifyuser", verifyUserByOtp);

// login route
router.post(
  "/login",
  [body("email").isEmail().normalizeEmail(), body("password").exists()],
  login
);

// Google OAuth Routes
router.get(
  "/google",
  passport.authenticate("google", { scope: ["profile", "email"] })
);

router.get(
  "/google/callback",
  passport.authenticate("google", { session: false }),
  (req, res) => {
console.log('google callback')
    try {
      // Generate JWT for the authenticated user
      const token = jwt.sign({ userId: req.user.id }, process.env.JWT_SECRET, {
        expiresIn: "1h",
      });

      // Redirect to mobile app with token (or send token in response)
      res.redirect(`myapp://callback?token=${token}`);
    } catch (error) {
      res.status(500).json({ message: "Server error" });
    }
  }
);

// Protected route example
router.get("/profile", authMiddleware, async (req, res) => {
  try {
    const userId = req.user.userId;

    const user = await db.query.users.findFirst({
      where: eq(users.id, userId),
    });

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.json({
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
    });
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
});

router.post("/forgotPassword", forgotPassword)
router.post("/resetPassword", resetPassword)

module.exports = router;
