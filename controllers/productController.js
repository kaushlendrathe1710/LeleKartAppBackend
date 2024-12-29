// backend/src/controllers/auth.js
const { query } = require("express");
const { db } = require("../config/db/db");
const {
  products,
  carts,
  cartProducts,
  vendors,
} = require("../config/db/schema");

const { eq, sql, and, ne, isNull, } = require("drizzle-orm");
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
      const data = await db.query.categories.findMany({
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
    const { email } = req.body;
    const userCart = await db.query.carts.findFirst({
      where: eq(carts.userEmail, email),
      with: {
        cartProducts: true,
      },
    });

    if (!userCart) {
      await db.insert(carts).values({ userEmail: email });
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
const isPresentInCart = async (req, res) => {
  const { variantId, cartId } = req.query;
  try {
    if (variantId) {
      const variant = await db.query.cartProducts.findFirst({
        where: and(
          eq(cartProducts.variantId, variantId),
          eq(cartProducts.cartId, cartId)
        ),
      });
      if (variant) {
        return true;
      }
      return false;
    }
    const product = await db.query.cartProducts.findFirst({
      where: and(
        eq(cartProducts.productId, productId),
        eq(cartProducts.cartId, cartId)
      ),
    });

    if (product) {
      return true;
    }

    return false;
  } catch {}
};

//done
const getCart = async (req, res) => {
  try {
    const { email } = req.query;
    console.log(email);
    const userCart = await db.query.carts.findFirst({
      where: eq(carts.userEmail, email),
      with: {
        cartProducts: true,
      },
    });

    if (!userCart) {
      await db.insert(carts).values({ userEmail: email });
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
    res.status(500).json({ error: error.message });
  }
};

//done
const updateQuantityInCart = async (req, res) => {
  try {
    const { userEmail, productId, variantId, quantity, cartId } = req.body;
    console.log("Request Body:", req.body); // Log the incoming request

    // If a variantId is provided
    if (variantId !== null && variantId !== undefined) {
      console.log("Checking for variantId:", variantId);

      const existingCartProduct = await db.query.cartProducts.findFirst({
        where: and(
          eq(cartProducts.cartId, cartId),
          eq(cartProducts.productId, productId),
          eq(cartProducts.variantId, variantId) // Check for specific variantId
        ),
      });

      if (existingCartProduct) {
        console.log("Existing Cart Product Found:", existingCartProduct);

        if (quantity > 0) {
          const updatedProduct = await db
            .update(cartProducts)
            .set({
              quantity: quantity,
            })
            .where(eq(cartProducts.id, existingCartProduct.id));

          console.log("Updated Product:", updatedProduct);
          res.json(updatedProduct); // Return the updated product
        } else {
          const removedProduct = await db
            .delete(cartProducts)
            .where(eq(cartProducts.id, existingCartProduct.id));

          console.log("Removed Product:", removedProduct);
          res.json(removedProduct); // Return the removed product
        }
      } else {
        console.log("Product not found with specified variant");
        res.status(404).json({
          error: `Product not found in cart with specified variant. CartId: ${cartId}, ProductId: ${productId}, VariantId: ${variantId}`,
        });
      }
    } else {
      // If no variantId is provided (i.e., it's null or undefined), find the product without a variantId
      console.log("Checking for variantId null:", variantId);

      const existingCartProduct = await db.query.cartProducts.findFirst({
        where: and(
          eq(cartProducts.cartId, cartId),
          eq(cartProducts.productId, productId),
          isNull(cartProducts.variantId) // Check if variantId is null
        ),
      });

      if (existingCartProduct) {
        console.log(
          "Existing Cart Product Found (no variant):",
          existingCartProduct
        );

        if (quantity > 0) {
          const updatedProduct = await db
            .update(cartProducts)
            .set({
              quantity: quantity,
            })
            .where(eq(cartProducts.id, existingCartProduct.id));

          console.log("Updated Product (no variant):", updatedProduct);
          res.json(updatedProduct); // Return the updated product
        } else {
          const removedProduct = await db
            .delete(cartProducts)
            .where(eq(cartProducts.id, existingCartProduct.id));

          console.log("Removed Product (no variant):", removedProduct);
          res.json(removedProduct); // Return the removed product
        }
      } else {
        console.log("Product not found without variant");
        res.status(404).json({
          error: `Product not found in cart without variant. CartId: ${cartId}, ProductId: ${productId}, VariantId: null`,
        });
      }
    }
  } catch (error) {
    console.log("Error:", error.message); // Log the error message
    res.status(500).json({ error: error.message });
  }
};

//done
const addToCart = async (req, res) => {
  const { userEmail, productId, variantId, quantity, cartId } = req.body;
  try {
    // Check if the variantId exists
    if (variantId) {
      // Check if the product with the specific variant already exists in the cart
      const existingCartProduct = await db.query.cartProducts.findFirst({
        where: and(
          eq(cartProducts.cartId, cartId),
          eq(cartProducts.productId, productId),
          eq(cartProducts.variantId, variantId)
        ),
      });

      if (existingCartProduct) {
        // If the product already exists, update the quantity
        const updatedProduct = await db
          .update(cartProducts)
          .set({
            quantity: existingCartProduct.quantity + quantity,
          })
          .where(eq(cartProducts.id, existingCartProduct.id));

        // Respond with the updated product
        return res.status(200).json({
          message: "Product updated in cart",
          product: updatedProduct,
        });
      } else {
        // If the product doesn't exist, insert a new cart item
        const newCartProduct = await db.insert(cartProducts).values({
          cartId: cartId,
          productId: productId,
          variantId: variantId,
          quantity: quantity,
        });

        // Respond with the newly added product
        return res
          .status(201)
          .json({ message: "Product added to cart", product: newCartProduct });
      }
    }

    // If variantId is not provided, handle the product without variant
    const existingCartProduct = await db.query.cartProducts.findFirst({
      where: and(
        eq(cartProducts.cartId, cartId),
        eq(cartProducts.productId, productId),
        isNull(cartProducts.variantId)
      ),
    });

    if (existingCartProduct) {
      // If the product exists without a variant, update the quantity
      const updatedProduct = await db
        .update(cartProducts)
        .set({
          quantity: existingCartProduct.quantity + quantity,
        })
        .where(eq(cartProducts.id, existingCartProduct.id));

      // Respond with the updated product
      return res
        .status(200)
        .json({ message: "Product updated in cart", product: updatedProduct });
    } else {
      // If the product doesn't exist without a variant, insert a new cart item
      const newCartProduct = await db.insert(cartProducts).values({
        cartId: cartId,
        productId: productId,
        variantId: null,
        quantity: quantity,
      });

      // Respond with the newly added product
      return res
        .status(201)
        .json({ message: "Product added to cart", product: newCartProduct });
    }
  } catch (error) {
    // Log the error and respond with a 500 status and error message
    console.log(error, "error");
    return res.status(500).json({ error: error.message });
  }
};

const removeFromCart = async (req, res) => {
  try {
    if (variantId) {
      const existingCartProduct = await db.query.cartProducts.findFirst({
        where: and(
          eq(cartProducts.cartId, cartId),
          eq(cartProducts.productId, productId),
          eq(cartProducts.variantId, variantId)
        ),
      });

      if (existingCartProduct) {
        const removedProduct = await db
          .delete(cartProducts)
          .where(eq(cartProducts.id, existingCartProduct.id));
        res.json({ success: true });
        return removedProduct;
      } else {
        throw new Error("Product not found in cart");
      }
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const subTotalInCart = async (req, res) => {
  const { pId, email, coupon,vId } = req.query;
  try {
    // console.log(coupon);
    if (pId) {
      const singleProductDetails = await db.query.products.findFirst({
        where: eq(products.id, pId),
        with: {
          vendors: true,
        },
      });
      if (!singleProductDetails) {
        throw new Error("Product Not Found");
      }
      const minRequired = singleProductDetails.vendors.minOrderPrice;
      if (vId) {
        const variantPrice = await db
          .select({ price: variants.price })
          .from(variants)
          .where(eq(variants.id, vId))
          .limit(1);
        return {
          subtotal: variantPrice[0]?.price ? variantPrice[0]?.price : 0,
          minOrder: variantPrice[0]?.price
            ? variantPrice[0]?.price < minRequired
              ? variantPrice[0].price < 500
                ? 100
                : 50
              : 0
            : 0,
        };
      } else {
        const productPrice = await db
          .select({ price: products.price })
          .from(products)
          .where(eq(products.id, pId))
          .limit(1);
        return {
          subtotal: productPrice?.[0]?.price ? productPrice[0].price : 0,
          minOrder: productPrice[0]?.price
            ? productPrice[0]?.price < minRequired
              ? productPrice[0].price < 500
                ? 100
                : 50
              : 0
            : 0,
        };
      }
    }
    const userCart = await db.query.carts.findFirst({
      where: eq(carts.userEmail, email),
      with: {
        cartProducts: true,
      },
    });
    if (!userCart) {
      return { subtotal: 0, minOrder: 0 };
    }
    console.log(userCart.id, "userCart");

    const cartProductsDetails = await db.query.cartProducts.findMany({
      where: eq(cartProducts.cartId, userCart.id),
      with: {
        products: {
          with: {
            vendors: true,
          },
        },
        variants: true,
      },
    });
    const subtotal = cartProductsDetails.reduce((acc, cartProduct) => {
      const price = cartProduct.variants
        ? cartProduct.variants.price
        : cartProduct.products.price;
      return acc + price * cartProduct.quantity;
    }, 0);
    const minOrder = cartProductsDetails.reduce((acc, cartProduct) => {
      const minPrice =
        cartProduct.products.vendors.minOrderPrice >
        cartProduct.products.price * cartProduct.quantity
          ? 50
          : 0;
      return acc + minPrice;
    }, 0);

    let discountSubtotal = 0;
    if (coupon) {
      const validCoupon = await db.query.coupons.findFirst({
        where: eq(coupons.couponCode, coupon),
      });
      if (validCoupon) {
        discountSubtotal = Math.floor(
          subtotal - (subtotal * validCoupon.discount) / 100
        );
      }
    }
    const finalPrice = discountSubtotal === 0 ? subtotal : discountSubtotal;
    res.json({
      subTotal: finalPrice,
      minOrder: finalPrice < 500 ? minOrder + 50 : minOrder,
    });
    return {
      subtotal: finalPrice,
      Delivery: finalPrice < 500 ? minOrder + 50 : minOrder,
    };
  } catch (error) {
    console.log(error.message)
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
  updateQuantityInCart,
  subTotalInCart,
  getCart,
};
