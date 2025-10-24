// Strategy Pattern for different payment modes (Module 2 requirement)
// Implements SOLID principles: Interface Segregation, Dependency Inversion

export interface PaymentStrategy {
  processPayment(amount: number, description?: string): Promise<PaymentResult>;
  getName(): string;
}

export interface PaymentResult {
  success: boolean;
  transactionId?: string;
  errorMessage?: string;
}

// UPI Payment Strategy
export class UPIPaymentStrategy implements PaymentStrategy {
  getName(): string {
    return 'UPI';
  }

  async processPayment(amount: number, description?: string): Promise<PaymentResult> {
    // Simulated UPI payment processing
    // In production, this would integrate with actual UPI gateway
    const success = Math.random() > 0.05; // 95% success rate
    
    if (success) {
      return {
        success: true,
        transactionId: `UPI-${Date.now()}-${Math.random().toString(36).substring(7)}`,
      };
    } else {
      return {
        success: false,
        errorMessage: 'UPI transaction failed. Please try again.',
      };
    }
  }
}

// Card Payment Strategy
export class CardPaymentStrategy implements PaymentStrategy {
  getName(): string {
    return 'Card';
  }

  async processPayment(amount: number, description?: string): Promise<PaymentResult> {
    // Simulated card payment processing
    // In production, this would integrate with payment gateway like Stripe
    const success = Math.random() > 0.03; // 97% success rate
    
    if (success) {
      return {
        success: true,
        transactionId: `CARD-${Date.now()}-${Math.random().toString(36).substring(7)}`,
      };
    } else {
      return {
        success: false,
        errorMessage: 'Card payment declined. Please check your card details.',
      };
    }
  }
}

// Wallet Balance Payment Strategy
export class WalletBalanceStrategy implements PaymentStrategy {
  getName(): string {
    return 'WalletBalance';
  }

  async processPayment(amount: number, description?: string): Promise<PaymentResult> {
    // Wallet balance is handled directly in the transfer logic
    // This strategy just validates the payment mode
    return {
      success: true,
      transactionId: `WALLET-${Date.now()}-${Math.random().toString(36).substring(7)}`,
    };
  }
}

// Payment Context to use strategies
export class PaymentContext {
  private strategy: PaymentStrategy;

  constructor(strategy: PaymentStrategy) {
    this.strategy = strategy;
  }

  setStrategy(strategy: PaymentStrategy): void {
    this.strategy = strategy;
  }

  async executePayment(amount: number, description?: string): Promise<PaymentResult> {
    return await this.strategy.processPayment(amount, description);
  }

  getPaymentMode(): string {
    return this.strategy.getName();
  }
}

// Factory to get payment strategy
export class PaymentStrategyFactory {
  static getStrategy(mode: 'UPI' | 'Card' | 'WalletBalance'): PaymentStrategy {
    switch (mode) {
      case 'UPI':
        return new UPIPaymentStrategy();
      case 'Card':
        return new CardPaymentStrategy();
      case 'WalletBalance':
        return new WalletBalanceStrategy();
      default:
        throw new Error(`Unknown payment mode: ${mode}`);
    }
  }
}
