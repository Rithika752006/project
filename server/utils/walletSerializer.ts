// Wallet serialization for persistence (Module 3 requirement)
// Implements JSON serialization for wallet objects

import { promises as fs } from 'fs';
import { join } from 'path';
import type { Wallet } from '@shared/schema';

const SERIALIZATION_DIR = join(process.cwd(), 'wallet_data');

export class WalletSerializer {
  private static async ensureDirectory(): Promise<void> {
    try {
      await fs.access(SERIALIZATION_DIR);
    } catch {
      await fs.mkdir(SERIALIZATION_DIR, { recursive: true });
    }
  }

  static async serializeWallet(wallet: Wallet): Promise<void> {
    try {
      await this.ensureDirectory();
      
      const fileName = `wallet_${wallet.id}.json`;
      const filePath = join(SERIALIZATION_DIR, fileName);
      
      const walletData = {
        ...wallet,
        serializedAt: new Date().toISOString(),
      };
      
      await fs.writeFile(filePath, JSON.stringify(walletData, null, 2), 'utf-8');
    } catch (error) {
      console.error('Failed to serialize wallet:', error);
      throw error;
    }
  }

  static async deserializeWallet(walletId: string): Promise<Wallet | null> {
    try {
      await this.ensureDirectory();
      
      const fileName = `wallet_${walletId}.json`;
      const filePath = join(SERIALIZATION_DIR, fileName);
      
      const content = await fs.readFile(filePath, 'utf-8');
      const data = JSON.parse(content);
      
      // Remove serialization metadata
      delete data.serializedAt;
      
      return data as Wallet;
    } catch (error) {
      // File doesn't exist or other error
      return null;
    }
  }

  static async getAllSerializedWallets(): Promise<Wallet[]> {
    try {
      await this.ensureDirectory();
      
      const files = await fs.readdir(SERIALIZATION_DIR);
      const walletFiles = files.filter(f => f.startsWith('wallet_') && f.endsWith('.json'));
      
      const wallets: Wallet[] = [];
      for (const file of walletFiles) {
        const content = await fs.readFile(join(SERIALIZATION_DIR, file), 'utf-8');
        const data = JSON.parse(content);
        delete data.serializedAt;
        wallets.push(data as Wallet);
      }
      
      return wallets;
    } catch (error) {
      console.error('Failed to read serialized wallets:', error);
      return [];
    }
  }
}
