import { useState, useMemo } from "react";
import { format } from "date-fns";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Check, X, Clock, ArrowUpRight, ArrowDownLeft, Plus, Smartphone, CreditCard, Wallet } from "lucide-react";
import type { TransactionWithDetails } from "@shared/schema";

interface TransactionTableProps {
  transactions: TransactionWithDetails[];
  isLoading: boolean;
  currentUserId: string;
}

export function TransactionTable({ transactions, isLoading, currentUserId }: TransactionTableProps) {
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [paymentFilter, setPaymentFilter] = useState<string>('all');

  const filteredTransactions = useMemo(() => {
    return transactions.filter(tx => {
      if (statusFilter !== 'all' && tx.status !== statusFilter) return false;
      if (typeFilter !== 'all' && tx.type !== typeFilter) return false;
      if (paymentFilter !== 'all' && tx.paymentMode !== paymentFilter) return false;
      return true;
    });
  }, [transactions, statusFilter, typeFilter, paymentFilter]);

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'success':
        return <Check className="w-4 h-4" />;
      case 'failed':
        return <X className="w-4 h-4" />;
      default:
        return <Clock className="w-4 h-4" />;
    }
  };

  const getStatusVariant = (status: string): "default" | "destructive" | "secondary" | "outline" => {
    switch (status) {
      case 'success':
        return 'default';
      case 'failed':
        return 'destructive';
      default:
        return 'secondary';
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'deposit':
        return <Plus className="w-4 h-4 text-chart-2" />;
      case 'transfer_out':
        return <ArrowUpRight className="w-4 h-4 text-destructive" />;
      case 'transfer_in':
        return <ArrowDownLeft className="w-4 h-4 text-chart-2" />;
      default:
        return null;
    }
  };

  const getPaymentIcon = (mode: string) => {
    switch (mode) {
      case 'UPI':
        return <Smartphone className="w-4 h-4" />;
      case 'Card':
        return <CreditCard className="w-4 h-4" />;
      case 'WalletBalance':
        return <Wallet className="w-4 h-4" />;
      default:
        return null;
    }
  };

  const getTransactionDescription = (tx: TransactionWithDetails) => {
    if (tx.description) return tx.description;
    
    switch (tx.type) {
      case 'deposit':
        return 'Deposit to wallet';
      case 'transfer_out':
        if (tx.recipientUser) {
          const name = tx.recipientUser.firstName && tx.recipientUser.lastName
            ? `${tx.recipientUser.firstName} ${tx.recipientUser.lastName}`
            : tx.recipientUser.email;
          return `Transfer to ${name}`;
        }
        return 'Transfer sent';
      case 'transfer_in':
        return 'Money received';
      default:
        return 'Transaction';
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3, 4, 5].map((i) => (
          <div key={i} className="flex items-center gap-4 p-4 rounded-lg bg-muted/30 animate-pulse">
            <div className="w-10 h-10 rounded-full bg-muted"></div>
            <div className="flex-1 space-y-2">
              <div className="h-4 bg-muted rounded w-1/3"></div>
              <div className="h-3 bg-muted rounded w-1/4"></div>
            </div>
            <div className="h-6 bg-muted rounded w-20"></div>
          </div>
        ))}
      </div>
    );
  }

  if (transactions.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mx-auto mb-4">
          <Wallet className="w-8 h-8 text-muted-foreground" />
        </div>
        <h3 className="text-lg font-semibold mb-2">No transactions yet</h3>
        <p className="text-muted-foreground">
          Start by making a deposit or transfer to see your transaction history here.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Filters */}
      <div className="flex flex-wrap gap-3">
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-40" data-testid="filter-status">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="success">Success</SelectItem>
            <SelectItem value="failed">Failed</SelectItem>
            <SelectItem value="pending">Pending</SelectItem>
          </SelectContent>
        </Select>

        <Select value={typeFilter} onValueChange={setTypeFilter}>
          <SelectTrigger className="w-40" data-testid="filter-type">
            <SelectValue placeholder="Type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Types</SelectItem>
            <SelectItem value="deposit">Deposits</SelectItem>
            <SelectItem value="transfer_out">Sent</SelectItem>
            <SelectItem value="transfer_in">Received</SelectItem>
          </SelectContent>
        </Select>

        <Select value={paymentFilter} onValueChange={setPaymentFilter}>
          <SelectTrigger className="w-40" data-testid="filter-payment">
            <SelectValue placeholder="Payment Mode" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Modes</SelectItem>
            <SelectItem value="UPI">UPI</SelectItem>
            <SelectItem value="Card">Card</SelectItem>
            <SelectItem value="WalletBalance">Wallet Balance</SelectItem>
          </SelectContent>
        </Select>

        {(statusFilter !== 'all' || typeFilter !== 'all' || paymentFilter !== 'all') && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              setStatusFilter('all');
              setTypeFilter('all');
              setPaymentFilter('all');
            }}
            data-testid="button-clear-filters"
          >
            Clear Filters
          </Button>
        )}
      </div>

      {/* Desktop Table */}
      <div className="hidden md:block rounded-lg border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Date & Time</TableHead>
              <TableHead>Description</TableHead>
              <TableHead>Payment Mode</TableHead>
              <TableHead className="text-right">Amount</TableHead>
              <TableHead className="text-right">Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredTransactions.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                  No transactions match the selected filters
                </TableCell>
              </TableRow>
            ) : (
              filteredTransactions.map((tx) => (
                <TableRow key={tx.id} data-testid={`row-transaction-${tx.id}`}>
                  <TableCell className="font-mono text-xs text-muted-foreground whitespace-nowrap">
                    {format(new Date(tx.createdAt!), 'MMM dd, yyyy HH:mm')}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      {getTypeIcon(tx.type)}
                      <span className="font-medium">{getTransactionDescription(tx)}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      {getPaymentIcon(tx.paymentMode)}
                      {tx.paymentMode}
                    </div>
                  </TableCell>
                  <TableCell className="text-right font-mono font-semibold">
                    <span className={tx.type === 'transfer_out' ? 'text-destructive' : 'text-chart-2'}>
                      {tx.type === 'transfer_out' ? '-' : '+'}${parseFloat(tx.amount).toFixed(2)}
                    </span>
                  </TableCell>
                  <TableCell className="text-right">
                    <Badge variant={getStatusVariant(tx.status)} className="gap-1">
                      {getStatusIcon(tx.status)}
                      {tx.status.charAt(0).toUpperCase() + tx.status.slice(1)}
                    </Badge>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Mobile Cards */}
      <div className="md:hidden space-y-3">
        {filteredTransactions.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            No transactions match the selected filters
          </div>
        ) : (
          filteredTransactions.map((tx) => (
            <div
              key={tx.id}
              className="border rounded-lg p-4 space-y-3"
              data-testid={`card-transaction-${tx.id}`}
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-start gap-3 flex-1">
                  <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center flex-shrink-0">
                    {getTypeIcon(tx.type)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium truncate">{getTransactionDescription(tx)}</p>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground mt-1">
                      {getPaymentIcon(tx.paymentMode)}
                      <span>{tx.paymentMode}</span>
                    </div>
                  </div>
                </div>
                <Badge variant={getStatusVariant(tx.status)} className="gap-1 flex-shrink-0">
                  {getStatusIcon(tx.status)}
                  {tx.status}
                </Badge>
              </div>
              <div className="flex items-center justify-between pt-2 border-t">
                <span className="text-xs font-mono text-muted-foreground">
                  {format(new Date(tx.createdAt!), 'MMM dd, HH:mm')}
                </span>
                <span className={`font-mono font-semibold text-lg ${tx.type === 'transfer_out' ? 'text-destructive' : 'text-chart-2'}`}>
                  {tx.type === 'transfer_out' ? '-' : '+'}${parseFloat(tx.amount).toFixed(2)}
                </span>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
