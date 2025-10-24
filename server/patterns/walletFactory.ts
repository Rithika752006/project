// Factory Pattern for creating different wallet types (Module 2 requirement)
// Implements SOLID principles: Single Responsibility, Open/Closed

export interface WalletConfig {
  walletType: 'Basic' | 'Premium';
  transactionLimit: string;
}

export class WalletFactory {
  private static walletCounter = 0;

  // Factory method to create wallets based on type
  static createWallet(type: 'Basic' | 'Premium'): WalletConfig {
    this.walletCounter++;
    
    switch (type) {
      case 'Basic':
        return {
          walletType: 'Basic',
          transactionLimit: '1000.00',
        };
      case 'Premium':
        return {
          walletType: 'Premium',
          transactionLimit: '10000.00',
        };
      default:
        throw new Error(`Unknown wallet type: ${type}`);
    }
  }

  // Reflection-like inspection (Module 2 requirement)
  static inspectWalletType(type: 'Basic' | 'Premium'): Record<string, any> {
    const config = this.createWallet(type);
    return {
      type: type,
      limit: config.transactionLimit,
      features: type === 'Premium' ? ['High transaction limit', 'Priority support'] : ['Standard transaction limit'],
      totalCreated: this.walletCounter,
    };
  }

  static getWalletCount(): number {
    return this.walletCounter;
  }
}
