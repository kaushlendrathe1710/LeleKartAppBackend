// db.js
const { drizzle } = require("drizzle-orm/postgres-js");
const postgres = require("postgres");
const dotenv = require("dotenv");

// Load environment variables
dotenv.config();

const schema = require("./schema");

// Environment variables
const { DATABASE_URL, NODE_ENV } = process.env;

// Cache the database connection in development
const globalForDb = globalThis;

if (!globalForDb.conn) {
  globalForDb.conn = postgres(DATABASE_URL);
}

const conn = globalForDb.conn;

if (NODE_ENV !== "production") {
  globalForDb.conn = conn;
}

// Export the database instance
module.exports.db = drizzle(conn, { schema });
