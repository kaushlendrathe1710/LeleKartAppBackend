const fetch = require("node-fetch");
require("dotenv").config();

// Environment variables
const SHIPROCKET_EMAIL = process.env.SHIPROCKET_EMAIL;
const SHIPROCKET_PASSWORD = process.env.SHIPROCKET_PASSWORD;

// Fetch Shiprocket token
async function fetchShiprocketToken() {
  const response = await fetch(
    "https://apiv2.shiprocket.in/v1/external/auth/login",
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email: SHIPROCKET_EMAIL,
        password: SHIPROCKET_PASSWORD,
      }),
    }
  );

  if (!response.ok) {
    throw new Error("Failed to authenticate with Shiprocket");
  }

  const data = await response.json();
  return data.token;
}

module.exports = fetchShiprocketToken;
