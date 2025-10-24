import { useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { format, startOfDay, isToday } from "date-fns";
import { Calendar, DollarSign, Smartphone, CreditCard, Wallet } from "lucide-react";
import type { Transaction } from "@shared/schema";

interface AnalyticsSectionProps {
  transactions: Transaction[];
}

export function AnalyticsSection({ transactions }: AnalyticsSectionProps) {
  const analytics = useMemo(() => {
    // Filter today's transactions
    const todayTransactions = transactions.filter(tx => 
      tx.createdAt && isToday(new Date(tx.createdAt))
    );

    // Calculate daily total
    const dailyTotal = todayTransactions
      .filter(tx => tx.status === 'success')
      .reduce((sum, tx) => sum + parseFloat(tx.amount), 0);

    // Group by payment type
    const paymentTypeBreakdown = transactions
      .filter(tx => tx.status === 'success')
      .reduce((acc, tx) => {
        const mode = tx.paymentMode;
        if (!acc[mode]) {
          acc[mode] = { count: 0, total: 0 };
        }
        acc[mode].count += 1;
        acc[mode].total += parseFloat(tx.amount);
        return acc;
      }, {} as Record<string, { count: number; total: number }>);

    // Calculate percentages
    const totalAmount = Object.values(paymentTypeBreakdown).reduce((sum, data) => sum + data.total, 0);
    const paymentTypeStats = Object.entries(paymentTypeBreakdown).map(([mode, data]) => ({
      mode,
      count: data.count,
      total: data.total,
      percentage: totalAmount > 0 ? (data.total / totalAmount) * 100 : 0,
    }));

    return {
      dailyTotal,
      todayCount: todayTransactions.filter(tx => tx.status === 'success').length,
      paymentTypeStats,
    };
  }, [transactions]);

  const getPaymentIcon = (mode: string) => {
    switch (mode) {
      case 'UPI':
        return <Smartphone className="w-4 h-4" />;
      case 'Card':
        return <CreditCard className="w-4 h-4" />;
      case 'WalletBalance':
        return <Wallet className="w-4 h-4" />;
      default:
        return <DollarSign className="w-4 h-4" />;
    }
  };

  const getPaymentColor = (mode: string) => {
    switch (mode) {
      case 'UPI':
        return 'text-chart-1';
      case 'Card':
        return 'text-chart-4';
      case 'WalletBalance':
        return 'text-chart-3';
      default:
        return 'text-primary';
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
      {/* Daily Total */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <Calendar className="w-5 h-5 text-muted-foreground" />
            Today's Activity
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <p className="text-sm text-muted-foreground mb-1">Total Amount</p>
              <p className="text-4xl font-bold font-mono" data-testid="stat-daily-total">
                ${analytics.dailyTotal.toFixed(2)}
              </p>
            </div>
            <div className="pt-4 border-t">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Transactions</span>
                <Badge variant="secondary" data-testid="stat-daily-count">
                  {analytics.todayCount}
                </Badge>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Payment Type Breakdown */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <DollarSign className="w-5 h-5 text-muted-foreground" />
            Payment Method Breakdown
          </CardTitle>
        </CardHeader>
        <CardContent>
          {analytics.paymentTypeStats.length === 0 ? (
            <div className="text-center py-6 text-sm text-muted-foreground">
              No successful transactions yet
            </div>
          ) : (
            <div className="space-y-4">
              {analytics.paymentTypeStats.map((stat) => (
                <div key={stat.mode} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className={getPaymentColor(stat.mode)}>
                        {getPaymentIcon(stat.mode)}
                      </span>
                      <span className="font-medium">{stat.mode}</span>
                    </div>
                    <div className="text-right">
                      <p className="font-mono font-semibold">
                        ${stat.total.toFixed(2)}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {stat.percentage.toFixed(1)}%
                      </p>
                    </div>
                  </div>
                  <div className="relative h-2 bg-muted rounded-full overflow-hidden">
                    <div
                      className={`absolute inset-y-0 left-0 ${
                        stat.mode === 'UPI' ? 'bg-chart-1' :
                        stat.mode === 'Card' ? 'bg-chart-4' :
                        'bg-chart-3'
                      } rounded-full transition-all`}
                      style={{ width: `${stat.percentage}%` }}
                    />
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {stat.count} transaction{stat.count !== 1 ? 's' : ''}
                  </p>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
