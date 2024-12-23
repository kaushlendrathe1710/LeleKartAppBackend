// backend/src/controllers/auth.js
const { db } = require("../config/db/db");
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
const getCategories = async (req, res) => {
  try {
    const categories =  await db.query.categories.findMany({
      with: {
        subCategories: true,
      },
    });
    return res.status(200).json({ categories: categories });
  } catch (error) {
    console.error("Error fetching banners:", error);
    res.status(500).send({ error: "Internal Server Error" });
  }
};

module.exports = { getBanners, getCategories };
