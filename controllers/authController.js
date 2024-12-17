// backend/src/controllers/auth.js
const { db } = require("../config/db/db");
const { users, userVerifications, accounts } = require("../config/db/schema");
const { eq } = require("drizzle-orm");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { validationResult } = require("express-validator");
const crypto = require("crypto");
const { sendVerificationEmail } = require("../utils/nodemailer");

const register = async (req, res) => {
  try {
    const { email, password, role, name, phone } = req.body;

    if (!email || !password) {
      return res
        .status(400)
        .json({ message: "Email and password are required" });
    }

    const existingUser = await req.db
      .select()
      .from(users)
      .where(eq(users.email, email))
      .then((rows) => rows[0]);

    if (existingUser) {
      if (existingUser.role !== role) {
        throw new Error("User exist for different role");
      }
      if (existingUser.isApproved === "accepted") {
        throw new Error("User already exists");
      }
      //   return res.status(400).json({ message: "User already exists" });
      const hashedPassword = await bcrypt.hash(password, 10);
      const verificationCode = crypto.randomInt(100000, 999999).toString();
      const userName = `${role || "user"}${crypto.randomInt(100000, 999999)}`;

      await db
        .update(users)
        .set({ password: hashedPassword })
        .where(eq(users.email, email));

      const createdUser = await req.db
        .select()
        .from(users)
        .where(eq(users.email, email))
        .then((rows) => rows[0]);

      // Check if a record with the given email exists
      const existingVerification = await db
        .select()
        .from(userVerifications)
        .where(eq(userVerifications.email, email))
        .limit(1)
        .then((rows) => rows[0]);

      let data;

      if (existingVerification) {
        // If the record exists, update it
        data = await db
          .update(userVerifications)
          .set({ verificationCode })
          .where(eq(userVerifications.email, email));

        // Fetch the updated record
        const updatedVerification = await db
          .select()
          .from(userVerifications)
          .where(eq(userVerifications.email, email))
          .limit(1)
          .then((rows) => rows[0]);
      } else {
        // If the record does not exist, insert a new one
        data = await db
          .insert(userVerifications)
          .values({ email, verificationCode });

        // Fetch the newly inserted record
        const insertedVerification = await db
          .select()
          .from(userVerifications)
          .where(eq(userVerifications.email, email))
          .limit(1)
          .then((rows) => rows[0]);
      }

      //   console.log("Sending verification email...", updatedVerification);
      await sendVerificationEmail(email, verificationCode);

      console.log("Registration successful!");
      res.status(201).json(createdUser);
      return;
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const verificationCode = crypto.randomInt(100000, 999999).toString();
    const userName = `${role || "user"}${crypto.randomInt(100000, 999999)}`;

    console.log("Creating new user...");
    await req.db.insert(users).values({
      email,
      password: hashedPassword,
      role: role || "user",
      name: name || userName,
      phone: phone || "",
    });

    console.log("Fetching created user...");
    const createdUser = await req.db
      .select()
      .from(users)
      .where(eq(users.email, email))
      .then((rows) => rows[0]);

    console.log("Inserting verification code...");
    await req.db.insert(userVerifications).values({
      email,
      verificationCode,
    });

    console.log("Sending verification email...");
    await sendVerificationEmail(email, verificationCode);

    console.log("Registration successful!");
    res.status(201).json(createdUser);
  } catch (error) {
    console.error("User creation error:", error.message);
    res.status(500).json({ message: "Internal server error" });
  }
};

const login = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  try {
    const { email, password } = req.body;

    // Find user by email
    const user = await db.query.users.findFirst({
      where: eq(users.email, email),
    });

    if (!user) {
      return res.status(404).json({
        message: "User with this email doesn't exist, Create a new account",
      });
    }

    if (user.password) {
      // Check password if provided
      const isMatch = await bcrypt.compare(password, user.password || "");
      if (!isMatch) {
        return res.status(400).json({
          message: "Incorrect password, Please fill correct password",
        });
      }
    } else {
      // If password is null, check for social login accounts associated with user.id
      const socialAccount = await db.query.accounts.findFirst({
        where: eq(accounts.userId, user.id),
      });

      if (socialAccount) {
        return res.status(200).json({
          message: "User authenticated through social login.",
          type: socialAccount.type,
          provider: socialAccount.provider,
        });
      }

      return res
        .status(400)
        .json({ message: "No password or social account found" });
    }

    // Generate JWT token
    const token = jwt.sign({ userId: user.id }, process.env.JWT_SECRET, {
      expiresIn: "1h",
    });

    res.status(200).json({
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    console.error("Login Error:", error.message);
    res.status(500).json({ message: "An unexpected server error occurred" });
  }
};

const verifyUserByOtp = async (req, res) => {
  try {
    const { email, verificationCode } = req.body;
    // Helper function to find user verification record
    const findUserVerificationRecord = async (email) => {
      return await db
        .select()
        .from(userVerifications)
        .where(eq(userVerifications.email, email))
        .limit(1)
        .then((rows) => rows[0]);
    };

    // // Helper function to update user's approval status
    const updateUserApproval = async (email) => {
      return await db
        .update(users)
        .set({ isApproved: "accepted" })
        .where(eq(users.email, email))
        .then((rows) => rows[0]);
    };

    // // Helper function to mark user as verified in `userVerifications`
    const markUserAsVerified = async (email) => {
      return await db
        .update(userVerifications)
        .set({ isVerified: true })
        .where(eq(userVerifications.email, email));
    };

    // ✅ **Find the user's verification record**
    const userVerification = await findUserVerificationRecord(email);

    if (!userVerification) {
      return res.status(400).json({ message: "Register First" });
    }

    if (userVerification.isVerified === true) {
      return res.status(400).json({ message: "User Already Verified" });
    }

    if (userVerification.verificationCode !== verificationCode) {
      return res
        .status(400)
        .json({ message: "Wrong OTP, check your OTP or register again" });
    }

    // // ✅ **Update user's approval status**
    await updateUserApproval(email);

    // // ✅ **Mark the user as verified in `userVerifications`**
    await markUserAsVerified(email);

    return res.status(200).json({
      message: "User verified successfully",
      //   user: updatedUser,
    });
  } catch (error) {
    console.error("Error verifying user:", error.message);
    res.status(500).json({ message: "Internal server error" });
  }
};

module.exports = { register, login, verifyUserByOtp };
