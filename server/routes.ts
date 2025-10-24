// API routes with all endpoints
// Reference: javascript_log_in_with_replit blueprint
import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { setupAuth, isAuthenticated } from "./replitAuth";
import { depositSchema, transferSchema } from "@shared/schema";
import { PaymentStrategyFactory, PaymentContext } from "./patterns/paymentStrategy";
import { InsufficientFundsException } from "./errors/InsufficientFundsException";

export async function registerRoutes(app: Express): Promise<Server> {
  // Auth middleware
  await setupAuth(app);

  // Auth routes
  app.get('/api/auth/user', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);
      res.json(user);
    } catch (error) {
      console.error("Error fetching user:", error);
      res.status(500).json({ message: "Failed to fetch user" });
    }
  });

  // Get current user's wallet
  app.get('/api/wallet', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const wallet = await storage.getWalletByUserId(userId);
      
      if (!wallet) {
        return res.status(404).json({ message: "Wallet not found" });
      }

      res.json(wallet);
    } catch (error: any) {
      console.error("Error fetching wallet:", error);
      res.status(500).json({ message: error.message || "Failed to fetch wallet" });
    }
  });

  // Get all users except current user (for transfer recipient selection)
  app.get('/api/users', isAuthenticated, async (req: any, res) => {
    try {
      const currentUserId = req.user.claims.sub;
      const users = await storage.getAllUsersExcept(currentUserId);
      res.json(users);
    } catch (error: any) {
      console.error("Error fetching users:", error);
      res.status(500).json({ message: error.message || "Failed to fetch users" });
    }
  });

  // Get transactions for current user's wallet
  app.get('/api/transactions', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const wallet = await storage.getWalletByUserId(userId);
      
      if (!wallet) {
        return res.status(404).json({ message: "Wallet not found" });
      }

      const transactions = await storage.getTransactionsByWalletId(wallet.id);
      res.json(transactions);
    } catch (error: any) {
      console.error("Error fetching transactions:", error);
      res.status(500).json({ message: error.message || "Failed to fetch transactions" });
    }
  });

  // Deposit funds (with Strategy pattern - Module 2 requirement)
  app.post('/api/deposit', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      
      // Validate request body
      const validation = depositSchema.safeParse(req.body);
      if (!validation.success) {
        return res.status(400).json({ 
          message: "Invalid request data",
          errors: validation.error.errors 
        });
      }

      const { amount, paymentMode, description } = validation.data;

      // Get wallet
      const wallet = await storage.getWalletByUserId(userId);
      if (!wallet) {
        return res.status(404).json({ message: "Wallet not found" });
      }

      // Use Strategy pattern for payment processing (Module 2 requirement)
      const paymentStrategy = PaymentStrategyFactory.getStrategy(paymentMode);
      const paymentContext = new PaymentContext(paymentStrategy);
      
      // Process payment through external gateway (simulated)
      const paymentResult = await paymentContext.executePayment(amount, description);
      
      if (!paymentResult.success) {
        return res.status(400).json({ 
          message: paymentResult.errorMessage || "Payment processing failed" 
        });
      }

      // Execute deposit with thread-safe operation (Module 5 requirement)
      const transaction = await storage.deposit(
        wallet.id,
        amount,
        paymentMode,
        description
      );

      res.json({ 
        message: "Deposit successful",
        transaction,
        paymentTransactionId: paymentResult.transactionId,
      });
    } catch (error: any) {
      console.error("Error processing deposit:", error);
      res.status(500).json({ message: error.message || "Failed to process deposit" });
    }
  });

  // Transfer money (with InsufficientFundsException - Module 3 requirement)
  app.post('/api/transfer', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      
      // Validate request body
      const validation = transferSchema.safeParse(req.body);
      if (!validation.success) {
        return res.status(400).json({ 
          message: "Invalid request data",
          errors: validation.error.errors 
        });
      }

      const { recipientUserId, amount, description } = validation.data;

      // Get sender wallet
      const senderWallet = await storage.getWalletByUserId(userId);
      if (!senderWallet) {
        return res.status(404).json({ message: "Sender wallet not found" });
      }

      // Get recipient wallet
      const recipientWallet = await storage.getWalletByUserId(recipientUserId);
      if (!recipientWallet) {
        return res.status(404).json({ message: "Recipient wallet not found" });
      }

      // Prevent self-transfer
      if (senderWallet.id === recipientWallet.id) {
        return res.status(400).json({ message: "Cannot transfer to yourself" });
      }

      // Execute transfer with thread-safe operation (Module 5 requirement)
      // This will throw InsufficientFundsException if balance is insufficient
      const transaction = await storage.transfer(
        senderWallet.id,
        recipientWallet.id,
        recipientUserId,
        amount,
        description
      );

      res.json({ 
        message: "Transfer successful",
        transaction,
      });
    } catch (error: any) {
      // Handle InsufficientFundsException (Module 3 requirement)
      if (error instanceof InsufficientFundsException) {
        return res.status(400).json({ 
          message: error.message,
          availableBalance: error.availableBalance,
          requestedAmount: error.requestedAmount,
        });
      }

      console.error("Error processing transfer:", error);
      res.status(500).json({ message: error.message || "Failed to process transfer" });
    }
  });

  // Analytics endpoint - Filter failed transactions, calculate daily totals (Module 4 requirement)
  app.get('/api/analytics', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const wallet = await storage.getWalletByUserId(userId);
      
      if (!wallet) {
        return res.status(404).json({ message: "Wallet not found" });
      }

      const transactions = await storage.getTransactionsByWalletId(wallet.id);

      // Stream-like operations (Module 4 requirement)
      
      // Filter failed transactions
      const failedTransactions = transactions.filter(tx => tx.status === 'failed');
      
      // Calculate daily total transactions
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const dailyTransactions = transactions.filter(tx => {
        const txDate = new Date(tx.createdAt!);
        txDate.setHours(0, 0, 0, 0);
        return txDate.getTime() === today.getTime() && tx.status === 'success';
      });
      
      const dailyTotal = dailyTransactions.reduce((sum, tx) => {
        return sum + parseFloat(tx.amount);
      }, 0);

      // Group by payment type
      const groupedByPaymentType = transactions
        .filter(tx => tx.status === 'success')
        .reduce((acc, tx) => {
          const mode = tx.paymentMode;
          if (!acc[mode]) {
            acc[mode] = {
              count: 0,
              totalAmount: 0,
              transactions: [],
            };
          }
          acc[mode].count += 1;
          acc[mode].totalAmount += parseFloat(tx.amount);
          acc[mode].transactions.push(tx);
          return acc;
        }, {} as Record<string, { count: number; totalAmount: number; transactions: any[] }>);

      res.json({
        failedTransactions,
        dailyTotal,
        dailyTransactionCount: dailyTransactions.length,
        groupedByPaymentType,
        totalTransactions: transactions.length,
        successfulTransactions: transactions.filter(tx => tx.status === 'success').length,
      });
    } catch (error: any) {
      console.error("Error fetching analytics:", error);
      res.status(500).json({ message: error.message || "Failed to fetch analytics" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
