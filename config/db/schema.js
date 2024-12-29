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

const usersRelations = relations(users, ({ many }) => ({
  addresses: many(addresses),
  accounts: many(accounts),
}));

const userVerifications = createTable("userVerification", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  email: varchar("email", { length: 255 })
    .notNull()
    .unique()
    .references(() => users.email, { onDelete: "cascade" }),
  verificationCode: varchar("verificationCode", { length: 255 }).notNull(),
  isVerified: boolean("isVerified").default(false).notNull(),
});

const vendors = createTable("vendors", {
  id: serial("id"),
  companyName: varchar("companyName", { length: 256 }).default(""),
  businessName: varchar("businessName", { length: 256 }).default(""),
  displayName: varchar("displayName", { length: 256 }).default(""),
  name: varchar("name", { length: 256 }).default(""),
  house: varchar("house", { length: 256 }).default(""),
  street: varchar("street", { length: 256 }).default(""),
  landmark: varchar("landmark", { length: 256 }).default(""),
  city: varchar("city", { length: 256 }).default(""),
  state: varchar("state", { length: 256 }).default(""),
  pincode: varchar("pincode", { length: 256 }).default(""),
  country: varchar("country", { length: 256 }).default(""),
  pan: varchar("pan", { length: 256 }).default(""),
  aadhar: varchar("aadhar", { length: 256 }).default(""),
  gst: varchar("gst", { length: 256 }).default(""),
  accountNumber: varchar("accountNumber", { length: 256 }).default(""),
  accountHolderName: varchar("accountHolderName", { length: 256 }).default(""),
  bankName: varchar("bankName", { length: 256 }).default(""),
  branchName: varchar("branchName", { length: 256 }).default(""),
  ifscCode: varchar("ifscCode", { length: 256 }).default(""),
  vendorEmail: varchar("vendorEmail", { length: 256 })
    .notNull()
    .primaryKey()
    .references(() => users.email, { onDelete: "cascade" }),
  isApproved: varchar("isApproved").notNull().default("pending"),
  phone: varchar("phone").notNull().default(""),
  warehouseId: integer("warehouseId").notNull().default(0),
  earnings: integer("earnings").notNull().default(0),
  minOrderPrice: integer("minOrderPrice").notNull().default(500),
});

const vendorsRelations = relations(vendors, ({ one, many }) => ({
  user: one(users, {
    fields: [vendors.vendorEmail],
    references: [users.email],
  }),
  products: many(products),
}));

const addresses = createTable("addresses", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 256 }).notNull(),
  number: varchar("number", { length: 10 }).notNull(),
  house: varchar("house", { length: 256 }).notNull(),
  street: varchar("street", { length: 256 }).notNull(),
  landmark: varchar("landmark", { length: 256 }).notNull(),
  city: varchar("city", { length: 256 }).notNull(),
  state: varchar("state", { length: 256 }).notNull(),
  pinCode: varchar("pinCode", { length: 256 }).notNull(),
  country: varchar("country", { length: 256 }).notNull(),
  userEmail: varchar("userEmail", { length: 256 })
    .notNull()
    .references(() => users.email, { onDelete: "cascade" }),
});

const addressesRelations = relations(addresses, ({ one }) => ({
  user: one(users, {
    fields: [addresses.userEmail],
    references: [users.email],
  }),
}));

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

const productsRelations = relations(products, ({ one, many }) => ({
  vendors: one(vendors, {
    fields: [products.vendorEmail],
    references: [vendors.vendorEmail],
  }),
  categories: one(categories, {
    fields: [products.categoryId],
    references: [categories.id],
  }),
  subCategories: one(subCategories, {
    fields: [products.subCategoryId],
    references: [subCategories.id],
  }),
  reviews: many(reviews),
  variants: many(variants),
}));

const attributes = createTable("attributes", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 256 }).notNull(),
});

const attributeValues = createTable("attributeValues", {
  id: serial("id").primaryKey(),
  attributeId: integer("attributeId")
    .notNull()
    .references(() => attributes.id, { onDelete: "cascade" }),
  value: varchar("value", { length: 256 }).notNull(),
});

const variants = createTable("variants", {
  id: serial("id").primaryKey(),
  productName: varchar("productName").notNull(),
  description: varchar("description"),
  productId: integer("productId")
    .notNull()
    .references(() => products.id, { onDelete: "cascade" }),
  sku: varchar("sku", { length: 256 }).notNull(),
  price: integer("price").notNull(),
  stock: integer("stock").notNull(),
  color: varchar("color", { length: 256 }).notNull(),
  size: varchar("size", { length: 256 }).notNull(),
  sales: integer("sales").default(0).notNull(),
});

const variantImages = createTable("variantImages", {
  id: serial("id").primaryKey(),
  variantId: integer("variantId")
    .notNull()
    .references(() => variants.id, { onDelete: "cascade" }),
  imageUrl: varchar("imageUrl", { length: 1024 }).notNull(),
});

const variantAttributes = createTable("variantAttributes", {
  id: serial("id").primaryKey(),
  variantId: integer("variantId")
    .notNull()
    .references(() => variants.id, { onDelete: "cascade" }),
  attributeValueId: integer("attributeValueId")
    .notNull()
    .references(() => attributeValues.id, { onDelete: "cascade" }),
});

const variantImagesRelations = relations(variantImages, ({ one }) => ({
  variant: one(variants, {
    fields: [variantImages.variantId],
    references: [variants.id],
  }),
}));

const attributesRelations = relations(attributes, ({ many }) => ({
  attributeValues: many(attributeValues),
}));

const attributeValuesRelations = relations(attributeValues, ({ one }) => ({
  attribute: one(attributes, {
    fields: [attributeValues.attributeId],
    references: [attributes.id],
  }),
}));

const variantsRelations = relations(variants, ({ one, many }) => ({
  product: one(products, {
    fields: [variants.productId],
    references: [products.id],
  }),
  variantAttributes: many(variantAttributes),
  variantImages: many(variantImages),
}));

const variantAttributesRelations = relations(variantAttributes, ({ one }) => ({
  variant: one(variants, {
    fields: [variantAttributes.variantId],
    references: [variants.id],
  }),
  attributeValue: one(attributeValues, {
    fields: [variantAttributes.attributeValueId],
    references: [attributeValues.id],
  }),
}));

const reviews = createTable("reviews", {
  id: serial("id").primaryKey(),
  userEmail: varchar("userEmail", { length: 256 })
    .notNull()
    .references(() => users.email, { onDelete: "cascade" }),
  productId: integer("productId")
    .notNull()
    .references(() => products.id, { onDelete: "cascade" }),
  rating: integer("rating").notNull(),
  title: varchar("title", { length: 100 }).notNull(),
  description: varchar("description", { length: 500 }),
  images: varchar("images")
    .array()
    .default(sql`'{}'::text[]`),
  createdAt: timestamp("createdAt").defaultNow(),
  updatedAt: timestamp("updatedAt").defaultNow(),
});

const reviewsRelations = relations(reviews, ({ one }) => ({
  products: one(products, {
    fields: [reviews.productId],
    references: [products.id],
  }),
}));

const wishlists = createTable("wishlists", {
  id: serial("id").primaryKey(),
  userEmail: varchar("userEmail")
    .notNull()
    .references(() => users.email, { onDelete: "cascade" }),
  createdAt: timestamp("createdAt").defaultNow(),
  updatedAt: timestamp("updatedAt").defaultNow(),
});

const wishlistsRelations = relations(wishlists, ({ one, many }) => ({
  users: one(users, {
    fields: [wishlists.userEmail],
    references: [users.email],
  }),
  wishlistProducts: many(wishlistProducts),
}));

const wishlistProducts = createTable("wishlistProducts", {
  id: serial("id").primaryKey(),
  wishlistId: integer("wishlistId")
    .notNull()
    .references(() => wishlists.id, { onDelete: "cascade" }),
  productId: integer("productId")
    .notNull()
    .references(() => products.id, { onDelete: "cascade" }),
  variantId: integer("variantId").references(() => variants.id, {
    onDelete: "cascade",
  }),
  addedAt: timestamp("addedAt").defaultNow(),
});

const wishlistProductsRelations = relations(wishlistProducts, ({ one }) => ({
  wishlists: one(wishlists, {
    fields: [wishlistProducts.wishlistId],
    references: [wishlists.id],
  }),
  products: one(products, {
    fields: [wishlistProducts.productId],
    references: [products.id],
  }),
}));

const carts = createTable("carts", {
  id: serial("id").primaryKey(),
  userEmail: varchar("userEmail")
    .notNull()
    .references(() => users.email, { onDelete: "cascade" }),
  createdAt: timestamp("createdAt").defaultNow(),
  updatedAt: timestamp("updatedAt").defaultNow(),
});

const cartsRelations = relations(carts, ({ one, many }) => ({
  users: one(users, { fields: [carts.userEmail], references: [users.email] }),
  cartProducts: many(cartProducts),
}));

const cartProducts = createTable("cartProducts", {
  id: serial("id").primaryKey(),
  cartId: integer("cartId")
    .notNull()
    .references(() => carts.id, { onDelete: "cascade" }),
  productId: integer("productId")
    .notNull()
    .references(() => products.id, { onDelete: "cascade" }),
  variantId: integer("variantId").references(() => variants.id, {
    onDelete: "cascade",
  }),
  quantity: integer("quantity").notNull(),
  addedAt: timestamp("addedAt").defaultNow(),
});

const cartProductsRelations = relations(cartProducts, ({ one }) => ({
  carts: one(carts, { fields: [cartProducts.cartId], references: [carts.id] }),
  products: one(products, {
    fields: [cartProducts.productId],
    references: [products.id],
  }),
  variants: one(variants, {
    fields: [cartProducts.variantId],
    references: [variants.id],
  }),
}));

const categories = createTable("categories", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 256 }).notNull().unique(),
  image: varchar("image", { length: 256 }).notNull().default(""),
});

const subCategories = createTable("subCategories", {
  id: serial("id").primaryKey(),
  categoryId: integer("categoryId")
    .notNull()
    .references(() => categories.id, { onDelete: "cascade" }),
  name: varchar("name", { length: 256 }).notNull(),
  image: varchar("image", { length: 256 }).notNull().default(""),
});

const categoriesRelations = relations(categories, ({ many }) => ({
  subCategories: many(subCategories),
  products: many(products),
}));

const subCategoriesRelations = relations(subCategories, ({ one, many }) => ({
  category: one(categories, {
    fields: [subCategories.categoryId],
    references: [categories.id],
  }),
  products: many(products),
}));

const orders = createTable("orders", {
  id: text("id").primaryKey(),
  pickupScheduledDate: varchar("pickupScheduledDate", { length: 255 }),
  pickupBookedDate: varchar("pickupBookedDate", { length: 255 }),
  responseOrderId: integer("responseOrderId").notNull(),
  shipmentId: integer("shipmentId").notNull(),
  awbCode: varchar("awbCode", { length: 255 }),
  labelUrl: varchar("labelUrl", { length: 255 }),
  manifestUrl: varchar("manifestUrl", { length: 255 }),
  userEmail: varchar("userEmail", { length: 255 })
    .notNull()
    .references(() => users.email, { onDelete: "cascade" }),
  shippingAddressId: integer("shippingAddressId")
    .notNull()
    .references(() => addresses.id, { onDelete: "cascade" }),
  totalAmount: integer("totalAmount").notNull(),
  paymentMethod: varchar("paymentMethod", { length: 255 }).default("COD"),
  paymentStatus: varchar("paymentStatus", { length: 255 }),
  createdPaymentOrderId: varchar("createdPaymentOrderId", { length: 255 }),
  razorPay: varchar("razorpay"),
  trackingId: varchar("trackingId", { length: 255 }),
  orderStatus: varchar("orderStatus", { length: 255 }).default("Pending"),
  createdAt: timestamp("createdAt").defaultNow(),
  updatedAt: timestamp("updatedAt").defaultNow(),
});

const orderItems = createTable("orderItems", {
  id: serial("id").primaryKey(),
  orderId: text("orderId")
    .notNull()
    .references(() => orders.id, { onDelete: "cascade" }),
  productId: integer("productId")
    .notNull()
    .references(() => products.id, { onDelete: "cascade" }),
  variantId: integer("variantId").references(() => variants.id, {
    onDelete: "cascade",
  }),
  userEmail: varchar("userEmail")
    .notNull()
    .references(() => users.email, { onDelete: "cascade" }),
  userName: varchar("userName").notNull(),
  vendorEmail: varchar("vendorEmail")
    .notNull()
    .references(() => vendors.vendorEmail, { onDelete: "cascade" }),
  quantity: integer("quantity").notNull(),
  price: integer("price").notNull(),
  createdAt: timestamp("createdAt").defaultNow(),
  updatedAt: timestamp("updatedAt").defaultNow(),
});

const cancelItems = createTable("cancelItems", {
  id: serial("id").primaryKey(),
  orderId: text("orderId")
    .notNull()
    .references(() => orders.id, { onDelete: "cascade" }),
  productId: integer("productId")
    .notNull()
    .references(() => products.id, { onDelete: "cascade" }),
  variantId: integer("variantId").references(() => variants.id, {
    onDelete: "cascade",
  }),
  userEmail: varchar("userEmail")
    .notNull()
    .references(() => users.email, { onDelete: "cascade" }),
  userName: varchar("userName").notNull(),
  vendorEmail: varchar("vendorEmail")
    .notNull()
    .references(() => vendors.vendorEmail, { onDelete: "cascade" }),
  quantity: integer("quantity").notNull(),
  price: integer("price").notNull(),
  createdAt: timestamp("createdAt").defaultNow(),
  updatedAt: timestamp("updatedAt").defaultNow(),
});

const ordersRelations = relations(orders, ({ one, many }) => ({
  user: one(users, { fields: [orders.userEmail], references: [users.email] }),
  shippingAddress: one(addresses, {
    fields: [orders.shippingAddressId],
    references: [addresses.id],
  }),
  orderItems: many(orderItems),
  cancelItems: many(cancelItems),
}));

const orderItemsRelations = relations(orderItems, ({ one }) => ({
  order: one(orders, { fields: [orderItems.orderId], references: [orders.id] }),
  product: one(products, {
    fields: [orderItems.productId],
    references: [products.id],
  }),
  user: one(users, {
    fields: [orderItems.userEmail],
    references: [users.email],
  }),
}));

const cancelItemsRelations = relations(cancelItems, ({ one }) => ({
  order: one(orders, {
    fields: [cancelItems.orderId],
    references: [orders.id],
  }),
  product: one(products, {
    fields: [cancelItems.productId],
    references: [products.id],
  }),
  user: one(users, {
    fields: [cancelItems.userEmail],
    references: [users.email],
  }),
}));

const banners = createTable("banner", {
  id: serial("id").primaryKey(),
  image: varchar("image", { length: 255 }).notNull(),
  title: varchar("title", { length: 255 }).notNull(),
  description: varchar("description", { length: 255 }).notNull(),
  productId: integer("productId")
    .notNull()
    .references(() => products.id, { onDelete: "cascade" }),
});

const subscribedUsers = createTable("subscribedUser", {
  id: serial("id").primaryKey(),
  email: varchar("email", { length: 255 }).notNull().unique(),
});

const coupons = createTable("coupon", {
  id: serial("id").primaryKey(),
  couponCode: varchar("couponCode", { length: 255 }).notNull(),
  agentId: integer("agentId")
    .notNull()
    .references(() => agents.id, { onDelete: "cascade" }),
  validFrom: timestamp("validFrom").notNull().defaultNow(),
  validTill: timestamp("validTill").notNull(),
  discount: integer("discount").notNull().default(10),
  minPurchase: integer("minPurchase").notNull().default(1000),
  rangeA: integer("rangeA").notNull(),
  rangeB: integer("rangeB").notNull(),
  discountA: integer("discountA").notNull(),
  discountB: integer("discountB").notNull(),
  discountC: integer("discountC").notNull(),
  userCount: integer("userCount").notNull().default(0),
});

const agents = createTable("agent", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  phone: varchar("phone", { length: 10 }).default("").notNull(),
  coupon: varchar("coupon", { length: 255 }).notNull(),
  agentEmail: varchar("agentEmail", { length: 256 })
    .notNull()
    .references(() => users.email, { onDelete: "cascade" }),
  isApproved: varchar("isApproved").default("pending").notNull(),
  coins: integer("coins").default(0).notNull(),
});

const agentsRelations = relations(agents, ({ one }) => ({
  user: one(users, { fields: [agents.agentEmail], references: [users.email] }),
}));

const accounts = createTable(
  "account",
  {
    userId: varchar("userId", { length: 255 })
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    type: varchar("type", { length: 255 }).notNull(), // Remove the .$type call
    provider: varchar("provider", { length: 255 }).notNull(),
    providerAccountId: varchar("providerAccountId", { length: 255 }).notNull(),
    refresh_token: text("refresh_token"),
    access_token: text("access_token"),
    expires_at: integer("expires_at"),
    token_type: varchar("token_type", { length: 255 }),
    scope: varchar("scope", { length: 255 }),
    id_token: text("id_token"),
    session_state: varchar("session_state", { length: 255 }),
  },
  (account) => [
    primaryKey({
      columns: [account.provider, account.providerAccountId],
    }),
    index("account_userId_idx").on(account.userId),
  ]
);

const accountsRelations = relations(accounts, ({ one }) => ({
  user: one(users, { fields: [accounts.userId], references: [users.id] }),
}));

const sessions = createTable(
  "session",
  {
    sessionToken: varchar("sessionToken", { length: 255 })
      .notNull()
      .primaryKey(),
    userId: varchar("userId", { length: 255 })
      .notNull()
      .references(() => users.id),
    expires: timestamp("expires", {
      mode: "date",
      withTimezone: true,
    }).notNull(),
  },
  () => [index("session_userId_idx").on("userId")]
);

const sessionsRelations = relations(sessions, ({ one }) => ({
  user: one(users, { fields: [sessions.userId], references: [users.id] }),
}));

const verificationTokens = createTable(
  "verificationToken",
  {
    identifier: varchar("identifier", { length: 255 }).notNull(),
    token: varchar("token", { length: 255 }).notNull(),
    expires: timestamp("expires", {
      mode: "date",
      withTimezone: true,
    }).notNull(),
  },
  () => [primaryKey({ columns: ["identifier", "token"] })]
);

const adminDashboardValues = createTable("adminDashboardValues", {
  id: serial("id").primaryKey(),
  totalEarning: integer("totalEarning").notNull().default(0),
  myEarning: integer("myEarning").notNull().default(0),
  discountCoupon: integer("discountCoupon").notNull().default(0),
  vendorCourierCostPercentage: integer("vendorCourierCostPercentage")
    .notNull()
    .default(0),
  vendorAdminCostPercentage: integer("vendorAdminCostPercentage")
    .notNull()
    .default(0),
  rotationOrder: varchar("rotationOrder", { length: 255 })
    .notNull()
    .default("normal"),
});

const userPayments = createTable("userPayments", {
  id: serial("id").primaryKey(),
  userName: varchar("userName", { length: 255 }).notNull(),
  userEmail: varchar("userEmail", { length: 255 }).notNull(),
  userPhone: varchar("userPhone", { length: 255 }).notNull(),
  TotalPaid: integer("TotalPaid").notNull(),
});

const vendorPayments = createTable("vendorPayments", {
  id: serial("id").primaryKey(),
  vendorName: varchar("vendorName", { length: 255 }).notNull(),
  vendorEmail: varchar("vendorEmail", { length: 255 }).notNull(),
  vendorPhone: varchar("vendorPhone", { length: 255 }).notNull(),
  totalProductCost: integer("totalProductCost").notNull(),
  totalCourierCost: integer("totalCourierCost").notNull(),
  totalAdminCost: integer("totalAdminCost").notNull(),
  totalFinalPrice: integer("totalFinalPrice").notNull(),
});

const agentPayments = createTable("agentPayments", {
  id: serial("id").primaryKey(),
  agentName: varchar("agentName", { length: 255 }).notNull(),
  agentEmail: varchar("agentEmail", { length: 255 }).notNull(),
  agentTotalCoins: integer("agentTotalCoins").notNull(),
  agentUsedCoins: integer("agentUsedCoins").notNull(),
  agentCoinsRemaining: integer("agentCoinsRemaining").notNull(),
});

module.exports = {
  posts,
  users,
  products,
  variantImages,
  variants,
  carts,
  cartProducts,
  cartsRelations,
  accounts,
  cartProductsRelations,
  accountsRelations,
  usersRelations,
  userVerifications,
  addresses,
  orders,
  orderItems,
  variantAttributesRelations,
  variantsRelations,
  attributeValuesRelations,
  attributesRelations,
  variantImagesRelations,
  productsRelations,
  addressesRelations,
  vendorsRelations,
  agentPayments,
  vendorPayments,
  userPayments,
  adminDashboardValues,
  verificationTokens,
  sessionsRelations,
  agentsRelations,
  coupons,
  subscribedUsers,
  banners,
  cancelItemsRelations,
  orderItemsRelations,
  ordersRelations,
  subCategoriesRelations,
  categoriesRelations,
  wishlistProductsRelations,
  wishlistsRelations,
  reviewsRelations,
  cancelItems,
  categories,
  subCategories,
  vendors,
};
