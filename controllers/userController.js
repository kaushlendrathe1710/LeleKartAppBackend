const { db } = require("../config/db/db");
const { users, addresses, orders } = require("../config/db/schema");
const { eq } = require("drizzle-orm");
const { validationResult } = require("express-validator");

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

exports.GetAddresses = async (req, res) => {
  const { email } = req.body;
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

exports.AddAdress = async (req, res) => {
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

// exports.GetAllYourOrders = async (req, res) => {
//   const { email } = req.body;
//   try {
//     const allOrders = db.query.orders.findMany({
//       where: eq(orders.userEmail, email),
//       with: {
//         shippingAddress: true,
//         orderItems: true,
//         cancelItems: true,
//       },
//     });
//     if (!allOrders?.length) {
//       return res.status(200).json({
//         message: "There is no orders, place your first order",
//         allOrders: [],
//       });
//     }
//     return res.status(200).json({
//       message: "All your orders",
//       allOrders: allOrders,
//     });
//   } catch (error) {
//     console.error("Error querying user:", error);
//     res.status(500).send({ error: "Internal Server Error" });
//   }
// };
exports.GetAllYourOrders = async (req, res) => {
  const { email } = req.query; // Use query parameters for GET requests
  console.log(email,'email')
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
