import { useEffect, useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { isUnauthorizedError } from "@/lib/authUtils";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { 
  Wallet, 
  Plus, 
  ArrowRightLeft, 
  TrendingUp, 
  CreditCard,
  LogOut,
  Check,
  X,
  Clock,
  Filter,
  Calendar
} from "lucide-react";
import type { Wallet as WalletType, Transaction, TransactionWithDetails, User } from "@shared/schema";
import { DepositModal } from "@/components/deposit-modal";
import { TransferModal } from "@/components/transfer-modal";
import { TransactionTable } from "@/components/transaction-table";
import { StatsCards } from "@/components/stats-cards";
import { AnalyticsSection } from "@/components/analytics-section";

export default function Dashboard() {
  const { toast } = useToast();
  const { user, isAuthenticated, isLoading: authLoading } = useAuth();
  const [depositOpen, setDepositOpen] = useState(false);
  const [transferOpen, setTransferOpen] = useState(false);

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      toast({
        title: "Unauthorized",
        description: "You are logged out. Logging in again...",
        variant: "destructive",
      });
      setTimeout(() => {
        window.location.href = "/api/login";
      }, 500);
      return;
    }
  }, [isAuthenticated, authLoading, toast]);

  // Fetch wallet data
  const { data: wallet, isLoading: walletLoading } = useQuery<WalletType>({
    queryKey: ["/api/wallet"],
    enabled: isAuthenticated,
  });

  // Fetch transactions
  const { data: transactions = [], isLoading: transactionsLoading } = useQuery<TransactionWithDetails[]>({
    queryKey: ["/api/transactions"],
    enabled: isAuthenticated,
  });

  const handleLogout = () => {
    window.location.href = "/api/logout";
  };

  if (authLoading || walletLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading your wallet...</p>
        </div>
      </div>
    );
  }

  if (!user || !wallet) {
    return null;
  }

  const userInitials = `${user.firstName?.[0] || ''}${user.lastName?.[0] || ''}`.toUpperCase() || user.email?.[0]?.toUpperCase() || 'U';

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b sticky top-0 bg-background z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-primary flex items-center justify-center">
              <Wallet className="w-6 h-6 text-primary-foreground" />
            </div>
            <span className="text-xl font-semibold">Digital Wallet</span>
          </div>

          <div className="flex items-center gap-3">
            <Badge 
              variant={wallet.walletType === 'Premium' ? 'default' : 'secondary'}
              className="text-xs uppercase tracking-wide"
              data-testid={`badge-wallet-${wallet.walletType.toLowerCase()}`}
            >
              {wallet.walletType}
            </Badge>
            <Avatar className="w-9 h-9">
              <AvatarImage src={user.profileImageUrl || undefined} className="object-cover" />
              <AvatarFallback className="text-sm">{userInitials}</AvatarFallback>
            </Avatar>
            <Button
              variant="ghost"
              size="icon"
              onClick={handleLogout}
              data-testid="button-logout"
              title="Log out"
            >
              <LogOut className="w-5 h-5" />
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Balance Card */}
        <Card className="mb-8">
          <CardContent className="p-6">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
              <div>
                <p className="text-sm text-muted-foreground mb-2">Available Balance</p>
                <p className="text-5xl font-bold font-mono tracking-tight mb-1" data-testid="text-balance">
                  ${parseFloat(wallet.balance).toFixed(2)}
                </p>
                <p className="text-xs text-muted-foreground">
                  Transaction Limit: ${parseFloat(wallet.transactionLimit).toFixed(2)}
                </p>
              </div>
              <div className="flex gap-3">
                <Button 
                  size="lg"
                  onClick={() => setDepositOpen(true)}
                  data-testid="button-deposit"
                  className="flex-1 sm:flex-none"
                >
                  <Plus className="w-5 h-5 mr-2" />
                  Deposit
                </Button>
                <Button 
                  size="lg"
                  variant="outline"
                  onClick={() => setTransferOpen(true)}
                  data-testid="button-transfer"
                  className="flex-1 sm:flex-none"
                >
                  <ArrowRightLeft className="w-5 h-5 mr-2" />
                  Transfer
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Quick Stats */}
        <StatsCards transactions={transactions} wallet={wallet} />

        {/* Analytics */}
        <AnalyticsSection transactions={transactions} />

        {/* Transaction History */}
        <Card>
          <CardHeader>
            <CardTitle className="text-xl">Transaction History</CardTitle>
          </CardHeader>
          <CardContent>
            <TransactionTable 
              transactions={transactions} 
              isLoading={transactionsLoading}
              currentUserId={user.id}
            />
          </CardContent>
        </Card>
      </main>

      {/* Modals */}
      <DepositModal open={depositOpen} onOpenChange={setDepositOpen} />
      <TransferModal open={transferOpen} onOpenChange={setTransferOpen} />
    </div>
  );
}
