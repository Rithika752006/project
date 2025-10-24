import { useState } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { isUnauthorizedError } from "@/lib/authUtils";
import type { User } from "@shared/schema";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

const transferSchema = z.object({
  recipientUserId: z.string().min(1, "Please select a recipient"),
  amount: z.string().refine((val) => {
    const num = parseFloat(val);
    return !isNaN(num) && num > 0;
  }, "Amount must be a positive number"),
  description: z.string().optional(),
});

type TransferFormData = z.infer<typeof transferSchema>;

interface TransferModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function TransferModal({ open, onOpenChange }: TransferModalProps) {
  const { toast } = useToast();

  // Fetch available users to transfer to
  const { data: users = [] } = useQuery<User[]>({
    queryKey: ['/api/users'],
    enabled: open,
  });

  const form = useForm<TransferFormData>({
    resolver: zodResolver(transferSchema),
    defaultValues: {
      recipientUserId: '',
      amount: '',
      description: '',
    },
  });

  const transferMutation = useMutation({
    mutationFn: async (data: TransferFormData) => {
      const transferData = {
        recipientUserId: data.recipientUserId,
        amount: parseFloat(data.amount),
        paymentMode: 'WalletBalance' as const,
        description: data.description,
      };
      await apiRequest('POST', '/api/transfer', transferData);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/wallet'] });
      queryClient.invalidateQueries({ queryKey: ['/api/transactions'] });
      toast({
        title: "Transfer Successful",
        description: "Money has been sent successfully.",
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
        title: "Transfer Failed",
        description: error.message || "Failed to process transfer. Please try again.",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: TransferFormData) => {
    transferMutation.mutate(data);
  };

  const selectedUserId = form.watch('recipientUserId');
  const selectedUser = users.find(u => u.id === selectedUserId);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md" data-testid="modal-transfer">
        <DialogHeader>
          <DialogTitle className="text-2xl">Transfer Money</DialogTitle>
          <DialogDescription>
            Send money to another user from your wallet balance.
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            {/* Recipient Selector */}
            <FormField
              control={form.control}
              name="recipientUserId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-sm font-medium">Recipient</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger className="h-12" data-testid="select-recipient">
                        <SelectValue placeholder="Select a recipient" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {users.length === 0 ? (
                        <div className="p-4 text-sm text-muted-foreground text-center">
                          No other users available
                        </div>
                      ) : (
                        users.map((user) => {
                          const initials = `${user.firstName?.[0] || ''}${user.lastName?.[0] || ''}`.toUpperCase() || user.email?.[0]?.toUpperCase() || 'U';
                          return (
                            <SelectItem 
                              key={user.id} 
                              value={user.id}
                              data-testid={`option-user-${user.id}`}
                            >
                              <div className="flex items-center gap-3">
                                <Avatar className="w-8 h-8">
                                  <AvatarImage src={user.profileImageUrl || undefined} className="object-cover" />
                                  <AvatarFallback className="text-xs">{initials}</AvatarFallback>
                                </Avatar>
                                <div>
                                  <p className="font-medium">
                                    {user.firstName && user.lastName 
                                      ? `${user.firstName} ${user.lastName}` 
                                      : user.email}
                                  </p>
                                  {user.firstName && user.lastName && user.email && (
                                    <p className="text-xs text-muted-foreground">{user.email}</p>
                                  )}
                                </div>
                              </div>
                            </SelectItem>
                          );
                        })
                      )}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

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
                        data-testid="input-transfer-amount"
                      />
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
                      data-testid="input-transfer-description"
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
                data-testid="button-cancel-transfer"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={transferMutation.isPending || users.length === 0}
                className="flex-1"
                data-testid="button-confirm-transfer"
              >
                {transferMutation.isPending ? (
                  <span className="flex items-center gap-2">
                    <div className="w-4 h-4 border-2 border-primary-foreground border-t-transparent rounded-full animate-spin"></div>
                    Processing...
                  </span>
                ) : (
                  'Transfer'
                )}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
