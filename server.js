const express = require("express");
const { db } = require("./db/db");
const schema = require("./db/schema");
const { sql, eq } = require("drizzle-orm");
const { carts, cartProducts } = require("./db/schema");
const app = express();

// Middleware to parse JSON
app.use(express.json());
// Middleware to attach the database client to the request
app.use((req, res, next) => {
  req.db = db;
  next();
});

app.get("/getCart", async (req, res) => {
  const myMail = "manoj2022019@gmail.com";
  try {
    const cart = await db.query?.carts?.findFirst({
      where: eq(carts.userEmail, myMail),
      with: {
        cartProducts: true,
      },
    });

    console.log("Fetched Cart:", cart);
    res.status(200).json(cart);
  } catch (error) {
    console.error("Error fetching cart:", error);
    res.status(500).json({ message: "Internal Server Error", error });
  }
});

app.get("/products", async (req, res) => {
  try {
    const result = await await db.query.products?.findMany();

    console.log(result);
    res.status(200).json(result);
  } catch (error) {
    console.error("Error fetching data:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () =>
  console.log(`Server running on http://localhost:${PORT}`)
);
