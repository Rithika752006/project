// Transaction logging to files (Module 3 requirement)
// Implements File I/O for audit trails

import { promises as fs } from 'fs';
import { join } from 'path';

const LOG_DIR = join(process.cwd(), 'transaction_logs');

export class TransactionLogger {
  private static async ensureLogDirectory(): Promise<void> {
    try {
      await fs.access(LOG_DIR);
    } catch {
      await fs.mkdir(LOG_DIR, { recursive: true });
    }
  }

  static async logTransaction(data: {
    transactionId: string;
    walletId: string;
    userId: string;
    amount: number;
    type: string;
    paymentMode: string;
    status: string;
    timestamp: Date;
    description?: string;
    errorMessage?: string;
  }): Promise<void> {
    try {
      await this.ensureLogDirectory();
      
      const date = new Date().toISOString().split('T')[0];
      const logFile = join(LOG_DIR, `transactions_${date}.log`);
      
      const logEntry = {
        ...data,
        timestamp: data.timestamp.toISOString(),
      };
      
      const logLine = JSON.stringify(logEntry) + '\n';
      await fs.appendFile(logFile, logLine, 'utf-8');
    } catch (error) {
      console.error('Failed to log transaction:', error);
      // Don't throw - logging failures shouldn't break the transaction
    }
  }

  static async getTransactionLogs(date?: string): Promise<any[]> {
    try {
      await this.ensureLogDirectory();
      
      const targetDate = date || new Date().toISOString().split('T')[0];
      const logFile = join(LOG_DIR, `transactions_${targetDate}.log`);
      
      try {
        const content = await fs.readFile(logFile, 'utf-8');
        const lines = content.trim().split('\n').filter(line => line);
        return lines.map(line => JSON.parse(line));
      } catch {
        // File doesn't exist or is empty
        return [];
      }
    } catch (error) {
      console.error('Failed to read transaction logs:', error);
      return [];
    }
  }
}
