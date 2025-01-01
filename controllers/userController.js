const { db } = require("../config/db/db");
const { users, addresses, orders } = require("../config/db/schema");
const { eq } = require("drizzle-orm");
const { validationResult } = require("express-validator");
const fetchShiprocketToken = require("../utils/fetchShiprocketToken");

exports.FindByEmail = async (req, res) => {
  const { email } = req.body;
  if (!email) {
    return res.status(400).send({ error: "Email is required" });
  }
  try {
    const user = await db.query.users.findFirst({
      where: eq(users.email, email),
    });
    return res.status(200).json({ user: user });
  } catch (error) {
    console.error("Error querying user:", error);
    res.status(500).send({ error: "Internal Server Error" });
  }
};

exports.UpdateUserDetails = async (req, res) => {
  const { name, phone, email, gender } = req.body;
  if (!email) {
    return res.status(400).send({ error: "Email is required" });
  }
  try {
    await req.db
      .update(users)
      .set({ name, phone, gender })
      .where(eq(users.email, email));
    const user = await db.query.users.findFirst({
      where: eq(users.email, email),
    });
    return res.status(200).json({ user: user });
  } catch (error) {
    console.error("Error querying user:", error);
    res.status(500).send({ error: "Internal Server Error" });
  }
};

exports.UpdateUserPassword = async (req, res) => {
  const { email, password, newPassword } = req.body;
  if (!email) {
    return res.status(400).send({ error: "Email is required" });
  }
  try {
    const user = await db.query.users.findFirst({
      where: eq(users.email, email),
    });
    if (!user) {
      return res.status(404).json({
        message: "User with this email doesn't exist, Create a new account",
      });
    }

    if (user.password) {
      const isMatch = await bcrypt.compare(password, user.password || "");
      if (!isMatch) {
        return res.status(400).json({
          message: "Incorrect password, Please fill correct password",
        });
      }
    }

    return res.status(200).json({ updatedUser: user });
  } catch (error) {
    console.error("Error querying user:", error);
    res.status(500).send({ error: "Internal Server Error" });
  }
}; // not done yet

exports.GetAllYourOrders = async (req, res) => {
  const { email } = req.query; // Use query parameters for GET requests
  console.log(email, "email");
  try {
    const allOrders = await db.query.orders.findMany({
      where: eq(orders.userEmail, email),
      with: {
        shippingAddress: true,
        orderItems: true,
        cancelItems: true,
      },
    });

    if (!allOrders?.length) {
      return res.status(200).json({
        message: "There are no orders. Place your first order.",
        allOrders: [],
      });
    }

    return res.status(200).json({
      message: "All your orders",
      allOrders: allOrders,
    });
  } catch (error) {
    console.error("Error querying user:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

exports.GetAddresses = async (req, res) => {
  // console.log('hit this api')
  const { email } = req.query;
  // console.log(email)
  try {
    const userAddresses = await db.query.addresses?.findMany({
      where: eq(addresses.userEmail, email),
    });
    if (!userAddresses?.length) {
      return res.status(200).json({ addresses: [] });
    }
    return res.status(200).json({ addresses: userAddresses });
  } catch (error) {
    console.error("Error querying user:", error);
    res.status(500).send({ error: "Internal Server Error" });
  }
};
exports.GetAddressesById = async (req, res) => {
  const { id } = req.query;
  console.log(id,'id')
  try {
    if (!id) {
      return;
    }

    const userAddress = await db.query.addresses.findFirst({
      where: eq(addresses.id, id),
    });

    if (!userAddress) {
      return "";
    }
    console.log(userAddress);
    return res.status(200).json({ address: userAddress });

    // return userAddress;
  } catch (error) {
    console.error("Error querying user:", error);
    res.status(500).send({ error: "Internal Server Error" });
  }
};

exports.AddAddress = async (req, res) => {
  const {
    name,
    city,
    house,
    state,
    street,
    pinCode,
    landmark,
    country,
    email,
    number,
  } = req.body;
  try {
    await db.insert(addresses).values({
      name,
      city,
      house,
      state,
      street,
      pinCode,
      landmark,
      country,
      userEmail: email,
      number,
    });
    const userAddresses = await db.query.addresses?.findMany({
      where: eq(addresses.userEmail, email),
    });
    if (!userAddresses?.length) {
      return res
        .status(200)
        .json({ message: "Successfully address added", addresses: [] });
    }
    return res.status(200).json({
      message: "Successfully address added",
      addresses: userAddresses,
    });
  } catch (error) {
    console.error("Error querying user:", error);
    res.status(500).send({ error: "Internal Server Error" });
  }
};

exports.DeleteAddress = async (req, res) => {
  const { id, email } = req.body;
  console.log(email, id, "email");
  try {
    await db.delete(addresses).where(eq(addresses.id, id));
    const userAddresses = await db.query.addresses?.findMany({
      where: eq(addresses.userEmail, email),
    });
    if (!userAddresses?.length) {
      return res
        .status(200)
        .json({ message: "Successfully deleted this address", addresses: [] });
    }
    return res.status(200).json({
      message: "Successfully deleted this address",
      addresses: userAddresses,
    });
  } catch (error) {
    console.error("Error querying user:", error);
    res.status(500).send({ error: "Internal Server Error" });
  }
};

exports.UpdateAddress = async (req, res) => {
  const { email, id, ...updatedFields } = req.body; // Use query parameters for GET requests
  console.log(email, "email");
  try {
    await req.db
      .update(addresses)
      .set(updatedFields)
      .where(eq(addresses.id, id));

    const userAddresses = await db.query.addresses?.findMany({
      where: eq(addresses.userEmail, email),
    });
    if (!userAddresses?.length) {
      return res.status(200).json({ addresses: [] });
    }
    return res.status(200).json({
      addresses: userAddresses,
      message: "Address updated successfully",
    });
  } catch (error) {
    console.error("Error querying user:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

exports.ShiprocketOrder = async (req, res) => {
  try {
    const body = req.body; // The Shiprocket order payload
    console.log(body);

    // Fetch a fresh token using the utility function
    const token = await fetchShiprocketToken();
    console.log(token, "token");
    const options = {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    };

    const response = await fetch(
      "https://apiv2.shiprocket.in/v1/external/shipments/create/forward-shipment",
      options
    );

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(
        `Failed to push order: ${response.statusText} - ${errorText}`
      );
    }

    const data = await response.json();

    if (data.status_code) {
      console.error("Validation error:", data);
      return res.status(data.status_code).json(data);
    } else if (data.status === 1) {
      console.log("Success response:", data);
      return res.json(data);
    } else {
      console.error("Error response:", data);
      return res.status(400).json(data);
    }
  } catch (err) {
    console.error("Error in POST function:", err);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

exports.CreateOrder = async (req, res) => {
  try {
    const {
      userEmail,
      shippingAddressId,
      paymentMethod,
      totalAmount,
      products: CartProducts,
      razorPay,
      createdPaymentOrderId,
      awbCode,
      labelUrl,
      manifestUrl,
      pickupBookedDate,
      pickupScheduledDate,
      responseOrderId,
      shipmentId,
    } = req.bdoy;

    const user = await db.query.users.findFirst({
      where: eq(users.email, userEmail),
    });
    if (!user) {
      throw new Error("User not found");
    }

    const address = await db.query.addresses.findFirst({
      where: eq(addresses.id, shippingAddressId),
    });
    if (!address) {
      throw new Error("Shipping address not found");
    }

    const newOrder = await db
      .insert(orders)
      .values({
        id: input.id,
        userEmail,
        shippingAddressId,
        totalAmount,
        paymentMethod,
        razorPay: razorPay ?? null,
        createdPaymentOrderId: createdPaymentOrderId ?? null,
        orderStatus: "Pending",
        responseOrderId,
        shipmentId,
        awbCode,
        labelUrl,
        manifestUrl,
        pickupBookedDate,
        pickupScheduledDate,
      })
      .returning();
    console.log(newOrder);

    if (!newOrder[0]) {
      throw new Error("Order Creatiion Failed");
    }

    const newOrderId = newOrder[0].id;

    await Promise.all(
      CartProducts.map(async (product) => {
        const { productId, variantId, quantity } = product;

        const productData = await db.query.products.findFirst({
          where: eq(products.id, productId),
        });
        if (!productData) {
          throw new Error(`Product with id ${productId} not found`);
        }
        let price = productData.price;
        let updatedStock = productData.stock - quantity;

        if (variantId) {
          const variantData = await db.query.variants.findFirst({
            where: eq(variants.id, variantId),
          });
          if (!variantData) {
            throw new Error(`Variant with id ${variantId} not found`);
          }
          price = variantData.price;
          updatedStock = variantData.stock - quantity;
        }

        await db.insert(orderItems).values({
          orderId: newOrderId,
          productId,
          variantId: variantId ?? null,
          quantity,
          price,
          vendorEmail: productData.vendorEmail,
          userEmail,
          userName: user.name,
        });

        const vendor = await db.query.vendors.findFirst({
          where: eq(vendors.vendorEmail, productData.vendorEmail),
        });
        if (!vendor) {
          throw new Error(`vendor not found`);
        }

        const vendorEarnings = vendor.earnings;

        await db
          .update(vendors)
          .set({ earnings: quantity * price + vendorEarnings })
          .where(eq(vendors.vendorEmail, productData.vendorEmail));
        const vendorPaymentDetail = await db.query.vendorPayments.findFirst({
          where: eq(vendorPayments.vendorEmail, productData.vendorEmail),
        });
        const dashboardDetails =
          await db.query.adminDashboardValues.findFirst();
        if (!dashboardDetails) {
          throw new Error("Dashboard Detials Not Found");
        }
        const { vendorAdminCostPercentage, vendorCourierCostPercentage } =
          dashboardDetails;
        if (!vendorPaymentDetail) {
          await db
            .insert(vendorPayments)
            .values({
              totalAdminCost:
                price * quantity * vendorAdminCostPercentage * 0.01,
              totalCourierCost:
                price * quantity * vendorCourierCostPercentage * 0.01,
              totalFinalPrice:
                price * quantity -
                price * quantity * vendorAdminCostPercentage * 0.01 -
                price * quantity * vendorCourierCostPercentage * 0.01,
              totalProductCost: price * quantity,
              vendorEmail: vendor.vendorEmail,
              vendorName: vendor.name ?? "",
              vendorPhone: vendor.phone,
            })
            .returning();
        } else {
          await db
            .update(vendorPayments)
            .set({
              totalAdminCost:
                vendorPaymentDetail.totalAdminCost +
                price * quantity * vendorAdminCostPercentage * 0.01,
              totalCourierCost:
                vendorPaymentDetail.totalCourierCost +
                price * quantity * vendorCourierCostPercentage * 0.01,
              totalProductCost:
                vendorPaymentDetail.totalProductCost + price * quantity,
              totalFinalPrice:
                vendorPaymentDetail.totalFinalPrice +
                price * quantity -
                price * quantity * vendorAdminCostPercentage * 0.01 -
                price * quantity * vendorCourierCostPercentage * 0.01,
            })
            .where(eq(vendorPayments.vendorEmail, productData.vendorEmail));
        }

        if (variantId) {
          await db
            .update(variants)
            .set({ stock: updatedStock })
            .where(eq(variants.id, variantId));
        } else {
          await db
            .update(products)
            .set({ stock: updatedStock })
            .where(eq(products.id, productId));
        }
      })
    );

    const userCart = await db.query.carts.findFirst({
      where: eq(carts.userEmail, user.email),
    });
    if (userCart) {
      await db.delete(cartProducts).where(eq(cartProducts.cartId, userCart.id));
    }

    const userPaymentDetails = await db.query.userPayments.findFirst({
      where: eq(userPayments.userEmail, input.userEmail),
    });

    const userDetails = await db.query.users.findFirst({
      where: eq(users.email, input.userEmail),
    });

    if (!userDetails) {
      throw new Error("User Details Not Found");
    }

    if (!userPaymentDetails) {
      await db.insert(userPayments).values({
        userEmail: input.userEmail,
        userName: userDetails.name,
        userPhone: userDetails.phone,
        TotalPaid: input.totalAmount,
      });
    } else {
      const userPreviousPaidValue = userPaymentDetails.TotalPaid;
      await db
        .update(userPayments)
        .set({ TotalPaid: userPreviousPaidValue + input.totalAmount })
        .where(eq(userPayments.userEmail, input.userEmail));
    }

    return newOrder;
  } catch (err) {
    console.log(err.message);
  }
};

exports.CancelOrder = async (req, res) => {
  try {
  } catch (err) {
    console.log(err.message);
  }
};
