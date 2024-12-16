const express = require("express");
const { db } = require("./db/db");
const schema = require("./db/schema");
const { sql } = require("drizzle-orm");

const app = express();

// Middleware to parse JSON
app.use(express.json());

app.get("/", async (req, res) => {
  try {
    const emailToFind = "manoj2022019@gmail.com";
    const result = await db.query.users.findFirst({
      where: sql`${sql`users.email`} = ${emailToFind}`,
    });

    console.log(result);
    res.status(200).json(result);
  } catch (error) {
    console.error("Error fetching data:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});
app.get("/products", async (req, res) => {
  try {
    const emailToFind = "manoj2022019@gmail.com";
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
