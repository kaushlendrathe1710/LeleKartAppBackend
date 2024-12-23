const { db } = require("./config/db/db");
const schema = require("./config/db/schema");
const { sql, eq } = require("drizzle-orm");
const express = require("express");
const dotenv = require("dotenv");
const passport = require("passport");
require("./config/passport");
const authRoutes = require("./routes/authRoutes");

const userRoutes = require("./routes/userRoutes");
dotenv.config();

const app = express();

// Middleware
app.use(express.json());
app.use(passport.initialize());

// Middleware to attach the database client to the request
app.use((req, res, next) => {
  req.db = db;
  next();
});

// app.get("/", async (req, res) => {
//   try {
//     console.log('api is running')
//     res.status(200).json("api is running");
//   } catch (error) {
//     console.error("Error fetching cart:", error);
//     res.status(500).json({ message: "Internal Server Error", error });
//   }
// });

app.use("/api/auth", authRoutes);
app.use("/api/user", userRoutes);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () =>
  console.log(`Server running on http://localhost:${PORT}`)
);
