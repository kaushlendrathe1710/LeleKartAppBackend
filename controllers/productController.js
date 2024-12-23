// backend/src/controllers/auth.js
const { db } = require("../config/db/db");
const { products } = require("../config/db/schema");

const { eq, sql } = require("drizzle-orm");
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
    const categories = await db.query.categories.findMany({
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

const getProductsWithCategory = async (req, res) => {
  try {
    const order = await db.query.adminDashboardValues.findFirst();
    if (!order) {
      throw new Error("Error Fetching Data");
    }
    const rotationOrder = order.rotationOrder;

    if (rotationOrder === "priceHighToLow") {
      const data = await ctx.db.query.categories.findMany({
        with: {
          products: {
            where: eq(products.isApproved, "accepted"),
            limit: 6,
            orderBy: [desc(products.price)],
            with: {
              variants: {
                limit: 1,
                with: {
                  variantImages: {
                    limit: 1,
                  },
                },
              },
            },
          },
        },
      });
      res.status(200).json({ data: data });
      return data;
    }
    if (rotationOrder === "priceLowToHigh") {
      const data = await db.query.categories.findMany({
        with: {
          products: {
            where: eq(products.isApproved, "accepted"),
            limit: 6,
            orderBy: [asc(products.price)],
            with: {
              variants: {
                limit: 1,
                with: {
                  variantImages: {
                    limit: 1,
                  },
                },
              },
            },
          },
        },
      });
      res.status(200).json({ data: data });
      return data;
    }

    if (rotationOrder === "alphabetical") {
      const data = await db.query.categories.findMany({
        with: {
          products: {
            where: eq(products.isApproved, "accepted"),
            limit: 6,
            orderBy: [asc(products.name)],
            with: {
              variants: {
                limit: 1,
                with: {
                  variantImages: {
                    limit: 1,
                  },
                },
              },
            },
          },
        },
      });
      res.status(200).json({ data: data });
      return data;
    }

    if (rotationOrder === "random") {
      const data = await db.query.categories.findMany({
        with: {
          products: {
            where: eq(products.isApproved, "accepted"),
            limit: 6,
            orderBy: [sql`RANDOM()`],
            with: {
              variants: {
                limit: 1,
                with: {
                  variantImages: {
                    limit: 1,
                  },
                },
              },
            },
          },
        },
      });
      res.status(200).json({ data: data });
      return data;
    }

    const data = await db.query.categories.findMany({
      with: {
        products: {
          where: eq(products.isApproved, "accepted"),
          limit: 6,
          with: {
            variants: {
              limit: 1,
              with: {
                variantImages: {
                  limit: 1,
                },
              },
            },
          },
        },
      },
    });
    res.status(200).json({ data: data });
    return data;
  } catch (error) {
    console.error("Error fetching banners:", error);
    res.status(500).send({ error: "Internal Server Error" });
  }
};

module.exports = { getBanners, getCategories, getProductsWithCategory };
