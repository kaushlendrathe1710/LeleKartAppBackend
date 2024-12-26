// backend/src/controllers/auth.js
const { db } = require("../config/db/db");
const { products } = require("../config/db/schema");

const { eq, sql ,and,ne} = require("drizzle-orm");
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
const getBestSellers = async (req, res) => {
  const queryProducts = await db.query.products.findMany({
    where: eq(products.isApproved, "accepted"),
    with: {
      variants: {
        with: {
          variantImages: {
            limit: 1,
          },
        },
        limit: 1,
      },
    },
    limit: 4,
  });
  res.json({ products: queryProducts });
};
const getProduct =async(req,res)=>{
  const { productId } = req.query;
  console.log(productId)
  try {
    const product = await db.query.products.findFirst({
      where: eq(products.id, productId),
      with: {
        categories: true,
        subCategories: true,
        variants: {
          with: {
            variantImages: true,
          },
        },
      },
    });
    if (product === undefined) {
      throw new Error("Product Not Found");
    }
    res.status(200).json({ product: product });
  } catch (error) {
    console.error("Error fetching banners:", error);
    res.status(500).send({ error: "Internal Server Error" });
  }
}
const getProductsByCategory=async(req,res)=>{ /// for best product recommendation 
   const { id,productId } = req.query;
   try {
    const categoryProducts = await db.query.products.findMany({
      where: and(
        and(
          eq(products.categoryId, id),
          ne(products.id, productId)
        ),
        eq(products.isApproved, "accepted")
      ),
      with: {
        variants: {
          with: {
            variantImages: {
              limit: 1,
            },
          },
        },
      },
      limit: 6,
    });
     res.status(200).json({ product: categoryProducts });
   } catch (error) {
     console.error("Error fetching banners:", error);
     res.status(500).send({ error: "Internal Server Error" });
   }
}
const getProductsByCategoryAll = async (req, res) => {
  const { id, page = 1, limit = 10 } = req.query;
  try {
    // Get total count first using length of array
    const allProducts = await db.query.products.findMany({
      where: and(
        eq(products.categoryId, id),
        eq(products.isApproved, "accepted")
      ),
    });

    const totalProducts = allProducts.length;

    // Calculate pagination values
    const totalPages = Math.ceil(totalProducts / limit);
    const offset = (page - 1) * limit;

    // Get paginated products
    const categoryProducts = await db.query.products.findMany({
      where: and(
        eq(products.categoryId, id),
        eq(products.isApproved, "accepted")
      ),
      with: {
        variants: {
          with: {
            variantImages: {
              limit: 1,
            },
          },
        },
      },
      limit: limit,
      offset: offset,
    });

    res.status(200).json({
      products: categoryProducts,
      pagination: {
        totalProducts,
        totalPages,
        currentPage: page,
        limit,
      },
    });
  } catch (error) {
    console.error("Error fetching products:", error);
    res.status(500).send({ error: "Internal Server Error" });
  }
};

const getProductsByCategoryOrSubCategory = async (req, res) => {
  const {
    id,
    subCategory = false,
    page = 1,
    limit = 10,
    color,
    size,
    minPrice,
    maxPrice,
    order,
  } = req.query;

  try {
    const offset = (page - 1) * limit;

    // Determine whether to query for category or subcategory
    const whereCondition =
      subCategory === "true"
        ? and(
            eq(products.subCategoryId, id),
            eq(products.isApproved, "accepted"),
            color ? eq(products.color, color) : undefined,
            size ? eq(products.size, size) : undefined,
            minPrice ? gte(products.price, minPrice) : undefined,
            maxPrice ? lte(products.price, maxPrice) : undefined
          )
        : and(
            eq(products.categoryId, id),
            eq(products.isApproved, "accepted"),
            color ? eq(products.color, color) : undefined,
            size ? eq(products.size, size) : undefined,
            minPrice ? gte(products.price, minPrice) : undefined,
            maxPrice ? lte(products.price, maxPrice) : undefined
          );

    // Fetch total products for pagination
    const allProducts = await db.query.products.findMany({
      where: whereCondition,
    });
    const totalProducts = allProducts.length;
    const totalPages = Math.ceil(totalProducts / limit);

    // Fetch paginated products
    const paginatedProducts = await db.query.products.findMany({
      where: whereCondition,
      orderBy:
        order === "1"
          ? [asc(products.price)]
          : order === "2"
          ? [desc(products.price)]
          : undefined,
      with: {
        variants: {
          with: {
            variantImages: {
              limit: 1,
            },
          },
        },
      },
      limit: parseInt(limit),
      offset: offset,
    });

    res.status(200).json({
      products: paginatedProducts,
      pagination: {
        totalProducts,
        totalPages,
        currentPage: parseInt(page),
        limit: parseInt(limit),
      },
    });
  } catch (error) {
    console.error("Error fetching products:", error);
    res.status(500).send({ error: "Internal Server Error" });
  }
};


module.exports = {
  getBanners,
  getCategories,
  getProductsWithCategory,
  getBestSellers,
  getProduct,
  getProductsByCategory,
  getProductsByCategoryAll,
getProductsByCategoryOrSubCategory

};
