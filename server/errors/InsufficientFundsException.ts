// Custom Exception for insufficient balance (Module 3 requirement)
// Implements proper error handling with custom error types

export class InsufficientFundsException extends Error {
  public readonly availableBalance: number;
  public readonly requestedAmount: number;
  public readonly walletId: string;

  constructor(availableBalance: number, requestedAmount: number, walletId: string) {
    const message = `Insufficient funds: Available $${availableBalance.toFixed(2)}, Required $${requestedAmount.toFixed(2)}`;
    super(message);
    
    this.name = 'InsufficientFundsException';
    this.availableBalance = availableBalance;
    this.requestedAmount = requestedAmount;
    this.walletId = walletId;

    // Maintains proper stack trace for where our error was thrown
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, InsufficientFundsException);
    }
  }

  toJSON() {
    return {
      name: this.name,
      message: this.message,
      availableBalance: this.availableBalance,
      requestedAmount: this.requestedAmount,
      walletId: this.walletId,
    };
  }
}
