import {
  pgTable,
  text,
  varchar,
  timestamp,
  jsonb,
  index,
  serial,
  integer,
  decimal,
  boolean,
} from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Session storage table for Replit Auth
export const sessions = pgTable(
  "sessions",
  {
    sid: varchar("sid").primaryKey(),
    sess: jsonb("sess").notNull(),
    expire: timestamp("expire").notNull(),
  },
  (table) => [index("IDX_session_expire").on(table.expire)],
);

// User storage table for Replit Auth
export const users = pgTable("users", {
  id: varchar("id").primaryKey().notNull(),
  email: varchar("email").unique(),
  firstName: varchar("first_name"),
  lastName: varchar("last_name"),
  profileImageUrl: varchar("profile_image_url"),
  balance: decimal("balance", { precision: 10, scale: 2 }).default("100000.00").notNull(),
  totalInvested: decimal("total_invested", { precision: 10, scale: 2 }).default("0").notNull(),
  portfolioValue: decimal("portfolio_value", { precision: 10, scale: 2 }).default("0").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Stock table to store the 20 dummy stocks
export const stocks = pgTable("stocks", {
  id: serial("id").primaryKey(),
  name: varchar("name").notNull(),
  symbol: varchar("symbol").notNull().unique(),
  currentPrice: decimal("current_price", { precision: 10, scale: 2 }).notNull(),
  previousPrice: decimal("previous_price", { precision: 10, scale: 2 }).notNull(),
  initialPrice: decimal("initial_price", { precision: 10, scale: 2 }).notNull(),
  change: decimal("change", { precision: 10, scale: 2 }).notNull(),
  changePercent: decimal("change_percent", { precision: 10, scale: 2 }).notNull(),
  shortName: varchar("short_name", { length: 2 }).notNull(),
  color: varchar("color", { length: 10 }).notNull(), // primary, secondary, accent
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Holdings table to store user stock holdings
export const holdings = pgTable("holdings", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id").notNull().references(() => users.id, { onDelete: 'cascade' }),
  stockId: integer("stock_id").notNull().references(() => stocks.id, { onDelete: 'cascade' }),
  quantity: integer("quantity").notNull(),
  averagePrice: decimal("average_price", { precision: 10, scale: 2 }).notNull(),
  totalValue: decimal("total_value", { precision: 10, scale: 2 }).notNull(),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Transactions table to store user transactions
export const transactions = pgTable("transactions", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id").notNull().references(() => users.id, { onDelete: 'cascade' }),
  stockId: integer("stock_id").notNull().references(() => stocks.id, { onDelete: 'cascade' }),
  type: varchar("type", { length: 4 }).notNull(), // buy, sell
  quantity: integer("quantity").notNull(),
  price: decimal("price", { precision: 10, scale: 2 }).notNull(),
  total: decimal("total", { precision: 10, scale: 2 }).notNull(),
  transactionDate: timestamp("transaction_date").defaultNow(),
});

// Export types
export type UpsertUser = typeof users.$inferInsert;
export type User = typeof users.$inferSelect;

export type Stock = typeof stocks.$inferSelect;
export type InsertStock = typeof stocks.$inferInsert;
export const insertStockSchema = createInsertSchema(stocks).omit({ id: true });

export type Holding = typeof holdings.$inferSelect;
export type InsertHolding = typeof holdings.$inferInsert;
export const insertHoldingSchema = createInsertSchema(holdings).omit({ id: true });

export type Transaction = typeof transactions.$inferSelect;
export type InsertTransaction = typeof transactions.$inferInsert;
export const insertTransactionSchema = createInsertSchema(transactions).omit({ id: true });

// Create zod schemas for validation
export const buyStockSchema = z.object({
  stockId: z.number(),
  quantity: z.number().int().positive(),
});

export const sellStockSchema = z.object({
  holdingId: z.number(),
  quantity: z.number().int().positive(),
});

export const updateHoldingSchema = z.object({
  holdingId: z.number(),
  quantity: z.number().int().positive(),
});
