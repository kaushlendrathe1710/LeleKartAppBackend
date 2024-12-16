const { relations, sql } = require("drizzle-orm");
const {
  bigint,
  boolean,
  index,
  integer,
  json,
  pgTableCreator,
  primaryKey,
  serial,
  text,
  timestamp,
  varchar,
} = require("drizzle-orm/pg-core");

const createTable = pgTableCreator((name) => `lelekart-t3_${name}`);

// Posts table definition
const posts = createTable(
  "post",
  {
    id: serial("id").primaryKey(),
    name: varchar("name", { length: 256 }),
    createdById: varchar("createdById", { length: 255 })
      .notNull()
      .references(() => users.id),
    createdAt: timestamp("created_at", { withTimezone: true })
      .default(sql`CURRENT_TIMESTAMP`)
      .notNull(),
    updatedAt: timestamp("updatedAt", { withTimezone: true }).defaultNow(),
    color: varchar("color", { length: 256 }).default("#000000").notNull(),
  },
  (example) => [
    index("createdById_idx").on(example.createdById),
    index("name_idx").on(example.name),
  ]
);

// Users table definition
const users = createTable("user", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  name: varchar("name", { length: 255 }).default("user").notNull(),
  email: varchar("email", { length: 255 }).notNull().unique(),
  emailVerified: timestamp("emailVerified", {
    mode: "date",
    withTimezone: true,
  }).default(sql`CURRENT_TIMESTAMP`),
  image: varchar("image", { length: 255 }),
  password: varchar("password", { length: 255 }),
  role: varchar("role").default("user").notNull(),
  phone: varchar("phone", { length: 10 }).default("").notNull(),
  gender: varchar("gender").default("Male"),
  isApproved: varchar("isApproved").default("pending").notNull(),
});
const products = createTable("products", {
  id: serial("id").primaryKey(),
  vendorEmail: varchar("vendorEmail")
    .notNull()
    .references(() => vendors.vendorEmail, { onDelete: "cascade" }),
  name: varchar("name", { length: 256 }).notNull(),
  brand: varchar("brand").notNull(),
  categoryId: integer("categoryId")
    .notNull()
    .references(() => categories.id, { onDelete: "cascade" }),
  subCategoryId: integer("subCategoryId")
    .notNull()
    .references(() => subCategories.id, { onDelete: "cascade" }),
  description: text("description").notNull(),
  sku: varchar("sku", { length: 256 }).notNull(),
  price: integer("price").notNull(),
  stock: integer("stock").notNull(),
  discountedPrice: integer("discountedPrice"),
  videoUrl: varchar("videoUrl", { length: 256 }),
  tags: text("tags")
    .array()
    .default(sql`'{}'::text[]`),
  preOrder: varchar("preOrder", { length: 256 }),
  minOrderQty: integer("minOrderQty"),
  productMeasurement: varchar("productMeasurement", { length: 256 }),
  features: text("features")
    .array()
    .default(sql`'{}'::text[]`),
  allowWholesale: boolean("allowWholesale").default(false),
  images: varchar("images")
    .array()
    .default(sql`'{}'::text[]`),
  isApproved: varchar("isApproved").default("pending").notNull(),
  color: varchar("color", { length: 256 }).notNull().default("unknown"),
  size: varchar("size", { length: 256 }).notNull().default("unknown"),
  createdAt: timestamp("createdAt").defaultNow(),
  updatedAt: timestamp("updatedAt").defaultNow(),
});
module.exports = {
  posts,
  users,
  products,
};
