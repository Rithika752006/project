import { sql } from 'drizzle-orm';
import {
  index,
  jsonb,
  pgTable,
  timestamp,
  varchar,
  decimal,
  text,
  integer,
  boolean,
} from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";
import { relations } from "drizzle-orm";

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
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  email: varchar("email").unique(),
  firstName: varchar("first_name"),
  lastName: varchar("last_name"),
  profileImageUrl: varchar("profile_image_url"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Wallet types: Basic or Premium
export const wallets = pgTable("wallets", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id),
  balance: decimal("balance", { precision: 12, scale: 2 }).notNull().default('0.00'),
  walletType: varchar("wallet_type", { length: 20 }).notNull().default('Basic'), // Basic or Premium
  transactionLimit: decimal("transaction_limit", { precision: 12, scale: 2 }).notNull(),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Transaction types and payment modes
export const transactions = pgTable("transactions", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  walletId: varchar("wallet_id").notNull().references(() => wallets.id),
  amount: decimal("amount", { precision: 12, scale: 2 }).notNull(),
  type: varchar("type", { length: 20 }).notNull(), // deposit, transfer_out, transfer_in
  paymentMode: varchar("payment_mode", { length: 20 }).notNull(), // UPI, Card, WalletBalance
  status: varchar("status", { length: 20 }).notNull().default('pending'), // pending, success, failed
  description: text("description"),
  recipientWalletId: varchar("recipient_wallet_id").references(() => wallets.id),
  recipientUserId: varchar("recipient_user_id").references(() => users.id),
  errorMessage: text("error_message"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Relations
export const usersRelations = relations(users, ({ one }) => ({
  wallet: one(wallets, {
    fields: [users.id],
    references: [wallets.userId],
  }),
}));

export const walletsRelations = relations(wallets, ({ one, many }) => ({
  user: one(users, {
    fields: [wallets.userId],
    references: [users.id],
  }),
  transactions: many(transactions),
}));

export const transactionsRelations = relations(transactions, ({ one }) => ({
  wallet: one(wallets, {
    fields: [transactions.walletId],
    references: [wallets.id],
  }),
  recipientWallet: one(wallets, {
    fields: [transactions.recipientWalletId],
    references: [wallets.id],
  }),
  recipientUser: one(users, {
    fields: [transactions.recipientUserId],
    references: [users.id],
  }),
}));

// Zod schemas for validation
export const insertWalletSchema = createInsertSchema(wallets).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertTransactionSchema = createInsertSchema(transactions).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
}).extend({
  amount: z.union([z.string(), z.number()]).transform(val => typeof val === 'number' ? val.toString() : val),
});

export const depositSchema = z.object({
  amount: z.number().positive("Amount must be positive"),
  paymentMode: z.enum(['UPI', 'Card', 'WalletBalance']),
  description: z.string().optional(),
});

export const transferSchema = z.object({
  recipientUserId: z.string().min(1, "Recipient is required"),
  amount: z.number().positive("Amount must be positive"),
  paymentMode: z.enum(['WalletBalance']),
  description: z.string().optional(),
});

// TypeScript types
export type UpsertUser = typeof users.$inferInsert;
export type User = typeof users.$inferSelect;
export type Wallet = typeof wallets.$inferSelect;
export type InsertWallet = z.infer<typeof insertWalletSchema>;
export type Transaction = typeof transactions.$inferSelect;
export type InsertTransaction = z.infer<typeof insertTransactionSchema>;
export type DepositRequest = z.infer<typeof depositSchema>;
export type TransferRequest = z.infer<typeof transferSchema>;

// Transaction with related user data for display
export type TransactionWithDetails = Transaction & {
  recipientUser?: User | null;
};
