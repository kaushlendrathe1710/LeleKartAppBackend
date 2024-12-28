// backend/src/controllers/auth.js
const { db } = require("../config/db/db");
const { products, carts } = require("../config/db/schema");

const { eq, sql, and, ne } = require("drizzle-orm");
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
const getProduct = async (req, res) => {
  const { productId } = req.query;
  console.log(productId);
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
};
const getProductsByCategory = async (req, res) => {
  /// for best product recommendation
  const { id, productId } = req.query;
  try {
    const categoryProducts = await db.query.products.findMany({
      where: and(
        and(eq(products.categoryId, id), ne(products.id, productId)),
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
};
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
const initializeCart = async (req, res) => {
  console.log(req.body);
  try {
    const {email}=req.body
    const userCart = await db.query.carts.findFirst({
      where: eq(carts.userEmail, email),
      with: {
        cartProducts: true,
      },
    });

    if (!userCart) {
      await ctx.db.insert(carts).values({ userEmail: email });
      const newCart = await db.query.carts.findFirst({
        where: eq(carts.userEmail, email),
        with: {
          cartProducts: true,
        },
      });
      return newCart;
    }

    res.json(userCart);
    return userCart;
  } catch (error) {
    console.log(error.message);
    res.status(500).json({ error: error.message });
  }
};

const addToCart = async (req, res) => {
  try {
    const { userEmail, productId, variantId, quantity, cartId } = req.body;

    let cartProduct = await CartProduct.findOne({
      cartId,
      productId,
      variantId: variantId || null,
    });

    if (cartProduct) {
      // Update quantity if product exists
      cartProduct.quantity += quantity;
      await cartProduct.save();
    } else {
      // Create new cart product if it doesn't exist
      cartProduct = await CartProduct.create({
        cartId,
        productId,
        variantId: variantId || null,
        quantity,
      });
    }

    res.json(cartProduct);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
const removeFromCart = async (req, res) => {
  try {
    const { cartId, productId, variantId } = req.body;

    await CartProduct.deleteOne({
      cartId,
      productId,
      variantId: variantId || null,
    });

    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
const updateQueantityInCart = async (req, res) => {
  try {
    const { cartId, productId, variantId, quantity } = req.body;

    if (quantity > 0) {
      const cartProduct = await CartProduct.findOneAndUpdate(
        {
          cartId,
          productId,
          variantId: variantId || null,
        },
        { quantity },
        { new: true }
      );
      res.json(cartProduct);
    } else {
      await CartProduct.deleteOne({
        cartId,
        productId,
        variantId: variantId || null,
      });
      res.json({ success: true });
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
const subTotalInCart = async (req, res) => {
  try {
    const { email, coupon } = req.query;

    const cart = await Cart.findOne({ userEmail: email }).populate({
      path: "cartProducts",
      populate: [{ path: "product", populate: "vendor" }, { path: "variant" }],
    });

    if (!cart) {
      return res.json({ subtotal: 0, minOrder: 0 });
    }

    let subtotal = cart.cartProducts.reduce((acc, cartProduct) => {
      const price = cartProduct.variant
        ? cartProduct.variant.price
        : cartProduct.product.price;
      return acc + price * cartProduct.quantity;
    }, 0);

    let minOrder = cart.cartProducts.reduce((acc, cartProduct) => {
      const minPrice =
        cartProduct.product.vendor.minOrderPrice >
        cartProduct.product.price * cartProduct.quantity
          ? 50
          : 0;
      return acc + minPrice;
    }, 0);

    if (coupon) {
      const validCoupon = await Coupon.findOne({ couponCode: coupon });
      if (validCoupon) {
        subtotal = Math.floor(
          subtotal - (subtotal * validCoupon.discount) / 100
        );
      }
    }

    res.json({
      subtotal,
      minOrder: subtotal < 500 ? minOrder + 50 : minOrder,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
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
  getProductsByCategoryOrSubCategory,
  initializeCart,
  addToCart,
  removeFromCart,
  updateQueantityInCart,
  subTotalInCart,
};
