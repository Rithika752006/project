import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { isUnauthorizedError } from "@/lib/authUtils";
import { Smartphone, CreditCard, Wallet } from "lucide-react";

const depositSchema = z.object({
  amount: z.string().refine((val) => {
    const num = parseFloat(val);
    return !isNaN(num) && num > 0;
  }, "Amount must be a positive number"),
  paymentMode: z.enum(['UPI', 'Card', 'WalletBalance']),
  description: z.string().optional(),
});

type DepositFormData = z.infer<typeof depositSchema>;

const paymentModes = [
  { value: 'UPI', label: 'UPI', icon: Smartphone, description: 'Pay using UPI apps' },
  { value: 'Card', label: 'Card', icon: CreditCard, description: 'Credit or Debit Card' },
  { value: 'WalletBalance', label: 'Wallet Balance', icon: Wallet, description: 'Use existing balance' },
] as const;

interface DepositModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function DepositModal({ open, onOpenChange }: DepositModalProps) {
  const { toast } = useToast();
  const [selectedMode, setSelectedMode] = useState<'UPI' | 'Card' | 'WalletBalance'>('UPI');

  const form = useForm<DepositFormData>({
    resolver: zodResolver(depositSchema),
    defaultValues: {
      amount: '',
      paymentMode: 'UPI',
      description: '',
    },
  });

  const depositMutation = useMutation({
    mutationFn: async (data: DepositFormData) => {
      const depositData = {
        amount: parseFloat(data.amount),
        paymentMode: data.paymentMode,
        description: data.description,
      };
      await apiRequest('POST', '/api/deposit', depositData);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/wallet'] });
      queryClient.invalidateQueries({ queryKey: ['/api/transactions'] });
      toast({
        title: "Deposit Successful",
        description: "Your funds have been added to your wallet.",
      });
      form.reset();
      onOpenChange(false);
    },
    onError: (error: Error) => {
      if (isUnauthorizedError(error)) {
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
      toast({
        title: "Deposit Failed",
        description: error.message || "Failed to process deposit. Please try again.",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: DepositFormData) => {
    depositMutation.mutate(data);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md" data-testid="modal-deposit">
        <DialogHeader>
          <DialogTitle className="text-2xl">Deposit Funds</DialogTitle>
          <DialogDescription>
            Add money to your wallet using your preferred payment method.
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            {/* Amount Input */}
            <FormField
              control={form.control}
              name="amount"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-sm font-medium">Amount</FormLabel>
                  <FormControl>
                    <div className="relative">
                      <span className="absolute left-4 top-1/2 -translate-y-1/2 text-2xl font-mono font-semibold text-muted-foreground">
                        $
                      </span>
                      <Input
                        {...field}
                        type="number"
                        step="0.01"
                        min="0.01"
                        placeholder="0.00"
                        className="pl-10 text-2xl font-mono h-14"
                        data-testid="input-deposit-amount"
                      />
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Payment Mode Selector */}
            <FormField
              control={form.control}
              name="paymentMode"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-sm font-medium">Payment Method</FormLabel>
                  <FormControl>
                    <div className="grid grid-cols-3 gap-3">
                      {paymentModes.map((mode) => {
                        const Icon = mode.icon;
                        const isSelected = selectedMode === mode.value;
                        return (
                          <button
                            key={mode.value}
                            type="button"
                            onClick={() => {
                              setSelectedMode(mode.value);
                              field.onChange(mode.value);
                            }}
                            className={`
                              p-4 rounded-lg border-2 transition-all hover-elevate
                              ${isSelected 
                                ? 'border-primary bg-primary/5' 
                                : 'border-border'
                              }
                            `}
                            data-testid={`button-payment-${mode.value.toLowerCase()}`}
                          >
                            <Icon className={`w-6 h-6 mx-auto mb-2 ${isSelected ? 'text-primary' : 'text-muted-foreground'}`} />
                            <p className={`text-xs font-medium ${isSelected ? 'text-primary' : 'text-foreground'}`}>
                              {mode.label}
                            </p>
                          </button>
                        );
                      })}
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Description */}
            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-sm font-medium">Description (Optional)</FormLabel>
                  <FormControl>
                    <Textarea
                      {...field}
                      placeholder="Add a note..."
                      className="resize-none text-base"
                      rows={3}
                      data-testid="input-deposit-description"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Submit Button */}
            <div className="flex gap-3 pt-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
                className="flex-1"
                data-testid="button-cancel-deposit"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={depositMutation.isPending}
                className="flex-1"
                data-testid="button-confirm-deposit"
              >
                {depositMutation.isPending ? (
                  <span className="flex items-center gap-2">
                    <div className="w-4 h-4 border-2 border-primary-foreground border-t-transparent rounded-full animate-spin"></div>
                    Processing...
                  </span>
                ) : (
                  'Deposit'
                )}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
