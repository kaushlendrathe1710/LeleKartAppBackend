// backend/src/controllers/auth.js
const { db } = require("../config/db/db");
const {
  users,
  userVerifications,
  accounts,
  banners,
  products,
} = require("../config/db/schema");
const { eq } = require("drizzle-orm");
 const getBanners = async (req, res) => {
  try {
    const banners = await db.query.banners.findMany();
    return res.status(200).json({ banners: banners });
  } catch (error) {
    console.error("Error fetching banners:", error);
    res.status(500).send({ error: "Internal Server Error" });
  }
};

module.exports={getBanners}