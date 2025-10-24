// Database storage implementation with thread-safe operations (Module 5 requirement)
// Reference: javascript_database blueprint
import { Mutex } from 'async-mutex';
import {
  users,
  wallets,
  transactions,
  type User,
  type UpsertUser,
  type Wallet,
  type InsertWallet,
  type Transaction,
  type InsertTransaction,
  type TransactionWithDetails,
} from "@shared/schema";
import { db } from "./db";
import { eq, desc, and } from "drizzle-orm";
import { WalletFactory } from "./patterns/walletFactory";
import { InsufficientFundsException } from "./errors/InsufficientFundsException";
import { TransactionLogger } from "./utils/transactionLogger";
import { WalletSerializer } from "./utils/walletSerializer";

// HashMap equivalent: userId -> Mutex (Module 4 requirement)
// Ensures thread-safe balance updates (Module 5 requirement)
const walletLocks = new Map<string, Mutex>();

function getWalletLock(walletId: string): Mutex {
  if (!walletLocks.has(walletId)) {
    walletLocks.set(walletId, new Mutex());
  }
  return walletLocks.get(walletId)!;
}

export interface IStorage {
  // User operations (required for Replit Auth)
  getUser(id: string): Promise<User | undefined>;
  upsertUser(user: UpsertUser): Promise<User>;
  getAllUsersExcept(excludeUserId: string): Promise<User[]>;

  // Wallet operations
  getWalletByUserId(userId: string): Promise<Wallet | undefined>;
  createWallet(userId: string, walletType: 'Basic' | 'Premium'): Promise<Wallet>;
  updateWalletBalance(walletId: string, newBalance: string): Promise<Wallet>;

  // Transaction operations
  createTransaction(transaction: InsertTransaction): Promise<Transaction>;
  getTransactionsByWalletId(walletId: string): Promise<TransactionWithDetails[]>;
  updateTransactionStatus(transactionId: string, status: string, errorMessage?: string): Promise<Transaction>;

  // Wallet operations with concurrency safety
  deposit(walletId: string, amount: number, paymentMode: string, description?: string): Promise<Transaction>;
  transfer(fromWalletId: string, toWalletId: string, toUserId: string, amount: number, description?: string): Promise<Transaction>;
}

export class DatabaseStorage implements IStorage {
  // User operations (required for Replit Auth)
  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async upsertUser(userData: UpsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values(userData)
      .onConflictDoUpdate({
        target: users.id,
        set: {
          ...userData,
          updatedAt: new Date(),
        },
      })
      .returning();
    
    // Automatically create wallet for new users
    const existingWallet = await this.getWalletByUserId(user.id);
    if (!existingWallet) {
      await this.createWallet(user.id, 'Basic');
    }
    
    return user;
  }

  async getAllUsersExcept(excludeUserId: string): Promise<User[]> {
    return await db.select().from(users).where(
      and(
        eq(users.id, users.id) // Just to use 'and' properly
      )
    ).then(allUsers => allUsers.filter(u => u.id !== excludeUserId));
  }

  // Wallet operations with Factory pattern (Module 2 requirement)
  async getWalletByUserId(userId: string): Promise<Wallet | undefined> {
    const [wallet] = await db.select().from(wallets).where(eq(wallets.userId, userId));
    return wallet;
  }

  async createWallet(userId: string, walletType: 'Basic' | 'Premium'): Promise<Wallet> {
    const config = WalletFactory.createWallet(walletType);
    
    const [wallet] = await db
      .insert(wallets)
      .values({
        userId,
        balance: '0.00',
        walletType: config.walletType,
        transactionLimit: config.transactionLimit,
      })
      .returning();

    // Serialize wallet for persistence (Module 3 requirement)
    await WalletSerializer.serializeWallet(wallet);
    
    return wallet;
  }

  async updateWalletBalance(walletId: string, newBalance: string): Promise<Wallet> {
    const [wallet] = await db
      .update(wallets)
      .set({ 
        balance: newBalance,
        updatedAt: new Date(),
      })
      .where(eq(wallets.id, walletId))
      .returning();

    // Serialize updated wallet
    await WalletSerializer.serializeWallet(wallet);
    
    return wallet;
  }

  // Transaction operations
  async createTransaction(transaction: InsertTransaction): Promise<Transaction> {
    const [newTransaction] = await db
      .insert(transactions)
      .values(transaction)
      .returning();

    // Log transaction to file (Module 3 requirement)
    await TransactionLogger.logTransaction({
      transactionId: newTransaction.id,
      walletId: newTransaction.walletId,
      userId: '', // Will be filled by the caller
      amount: parseFloat(newTransaction.amount),
      type: newTransaction.type,
      paymentMode: newTransaction.paymentMode,
      status: newTransaction.status,
      timestamp: new Date(newTransaction.createdAt!),
      description: newTransaction.description || undefined,
      errorMessage: newTransaction.errorMessage || undefined,
    });

    return newTransaction;
  }

  async getTransactionsByWalletId(walletId: string): Promise<TransactionWithDetails[]> {
    const txs = await db
      .select()
      .from(transactions)
      .where(eq(transactions.walletId, walletId))
      .orderBy(desc(transactions.createdAt));

    // Fetch recipient user details for each transaction
    const txsWithDetails: TransactionWithDetails[] = await Promise.all(
      txs.map(async (tx) => {
        if (tx.recipientUserId) {
          const recipientUser = await this.getUser(tx.recipientUserId);
          return { ...tx, recipientUser };
        }
        return tx;
      })
    );

    return txsWithDetails;
  }

  async updateTransactionStatus(transactionId: string, status: string, errorMessage?: string): Promise<Transaction> {
    const [transaction] = await db
      .update(transactions)
      .set({ 
        status,
        errorMessage,
        updatedAt: new Date(),
      })
      .where(eq(transactions.id, transactionId))
      .returning();

    return transaction;
  }

  // Thread-safe deposit operation (Module 5 requirement)
  async deposit(walletId: string, amount: number, paymentMode: string, description?: string): Promise<Transaction> {
    const lock = getWalletLock(walletId);
    
    return await lock.runExclusive(async () => {
      // Get current wallet
      const [wallet] = await db.select().from(wallets).where(eq(wallets.id, walletId));
      if (!wallet) {
        throw new Error('Wallet not found');
      }

      // Check transaction limit
      if (amount > parseFloat(wallet.transactionLimit)) {
        throw new Error(`Amount exceeds transaction limit of $${wallet.transactionLimit}`);
      }

      // Create pending transaction
      const transaction = await this.createTransaction({
        walletId,
        amount: amount.toString(),
        type: 'deposit',
        paymentMode,
        status: 'pending',
        description,
      });

      try {
        // Payment processing happens via Strategy pattern in routes
        // Update wallet balance
        const newBalance = (parseFloat(wallet.balance) + amount).toFixed(2);
        await this.updateWalletBalance(walletId, newBalance);

        // Mark transaction as success
        const successTransaction = await this.updateTransactionStatus(transaction.id, 'success');
        return successTransaction;
      } catch (error: any) {
        // Mark transaction as failed
        await this.updateTransactionStatus(transaction.id, 'failed', error.message);
        throw error;
      }
    });
  }

  // Thread-safe transfer operation (Module 5 requirement)
  async transfer(
    fromWalletId: string, 
    toWalletId: string, 
    toUserId: string,
    amount: number, 
    description?: string
  ): Promise<Transaction> {
    // Acquire locks in consistent order to prevent deadlocks
    const locks = [fromWalletId, toWalletId].sort();
    const lock1 = getWalletLock(locks[0]);
    const lock2 = getWalletLock(locks[1]);

    return await lock1.runExclusive(async () => {
      return await lock2.runExclusive(async () => {
        // Get both wallets
        const [fromWallet] = await db.select().from(wallets).where(eq(wallets.id, fromWalletId));
        const [toWallet] = await db.select().from(wallets).where(eq(wallets.id, toWalletId));

        if (!fromWallet || !toWallet) {
          throw new Error('Wallet not found');
        }

        // Check sufficient balance (Module 3 requirement - InsufficientFundsException)
        const currentBalance = parseFloat(fromWallet.balance);
        if (currentBalance < amount) {
          throw new InsufficientFundsException(currentBalance, amount, fromWalletId);
        }

        // Check transaction limit
        if (amount > parseFloat(fromWallet.transactionLimit)) {
          throw new Error(`Amount exceeds transaction limit of $${fromWallet.transactionLimit}`);
        }

        // Create outgoing transaction
        const outTransaction = await this.createTransaction({
          walletId: fromWalletId,
          amount: amount.toString(),
          type: 'transfer_out',
          paymentMode: 'WalletBalance',
          status: 'pending',
          description,
          recipientWalletId: toWalletId,
          recipientUserId: toUserId,
        });

        try {
          // Deduct from sender
          const newFromBalance = (currentBalance - amount).toFixed(2);
          await this.updateWalletBalance(fromWalletId, newFromBalance);

          // Add to recipient
          const newToBalance = (parseFloat(toWallet.balance) + amount).toFixed(2);
          await this.updateWalletBalance(toWalletId, newToBalance);

          // Create incoming transaction for recipient
          await this.createTransaction({
            walletId: toWalletId,
            amount: amount.toString(),
            type: 'transfer_in',
            paymentMode: 'WalletBalance',
            status: 'success',
            description,
            recipientWalletId: fromWalletId,
          });

          // Mark outgoing transaction as success
          const successTransaction = await this.updateTransactionStatus(outTransaction.id, 'success');
          return successTransaction;
        } catch (error: any) {
          // Mark transaction as failed
          await this.updateTransactionStatus(outTransaction.id, 'failed', error.message);
          throw error;
        }
      });
    });
  }
}

export const storage = new DatabaseStorage();
