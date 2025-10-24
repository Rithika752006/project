import { useMemo } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { TrendingUp, CheckCircle2, CreditCard } from "lucide-react";
import type { Transaction, Wallet } from "@shared/schema";

interface StatsCardsProps {
  transactions: Transaction[];
  wallet: Wallet;
}

export function StatsCards({ transactions, wallet }: StatsCardsProps) {
  const stats = useMemo(() => {
    const totalTransactions = transactions.length;
    const successfulTransactions = transactions.filter(tx => tx.status === 'success').length;
    const paymentModes = new Set(transactions.map(tx => tx.paymentMode)).size;

    return {
      totalTransactions,
      successfulTransactions,
      paymentModes,
    };
  }, [transactions]);

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
      {/* Total Transactions */}
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center">
              <TrendingUp className="w-6 h-6 text-primary" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground mb-1">Total Transactions</p>
              <p className="text-3xl font-bold" data-testid="stat-total-transactions">
                {stats.totalTransactions}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Successful Transfers */}
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-lg bg-chart-2/10 flex items-center justify-center">
              <CheckCircle2 className="w-6 h-6 text-chart-2" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground mb-1">Successful</p>
              <p className="text-3xl font-bold" data-testid="stat-successful-transactions">
                {stats.successfulTransactions}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Payment Methods */}
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-lg bg-chart-4/10 flex items-center justify-center">
              <CreditCard className="w-6 h-6 text-chart-4" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground mb-1">Payment Methods</p>
              <p className="text-3xl font-bold" data-testid="stat-payment-methods">
                {stats.paymentModes}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
