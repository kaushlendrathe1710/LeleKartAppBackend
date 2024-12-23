const { drizzle } = require("drizzle-orm/postgres-js");
const postgres = require("postgres");
const dotenv = require("dotenv");

// Load environment variables
dotenv.config();

const { DATABASE_URL, NODE_ENV } = process.env;
const isProduction = NODE_ENV === "production";

// Set connection options
const connectionOptions = isProduction
  ? { ssl: { rejectUnauthorized: false } } // Enable SSL for production
  : { max: 10 }; // Use pooling in development

let connection;

try {
  connection = postgres(DATABASE_URL, connectionOptions);
} catch (error) {
  console.error("Failed to connect to the database:", error);
  process.exit(1); // Exit the process if connection fails
}

const db = drizzle(connection, { schema: require("./schema") });
module.exports.db = db;
