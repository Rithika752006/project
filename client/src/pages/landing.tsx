import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Wallet, ArrowRightLeft, Shield, TrendingUp, Zap, Users } from "lucide-react";

export default function Landing() {
  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-primary flex items-center justify-center">
              <Wallet className="w-6 h-6 text-primary-foreground" />
            </div>
            <span className="text-xl font-semibold">Digital Wallet</span>
          </div>
          <Button 
            onClick={() => window.location.href = '/api/login'}
            data-testid="button-login"
            size="default"
          >
            Log In
          </Button>
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-16 sm:py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto">
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight mb-6">
              Your Digital Wallet for
              <span className="text-primary"> Seamless Payments</span>
            </h1>
            <p className="text-lg sm:text-xl text-muted-foreground mb-8">
              Manage your money securely with instant transfers, multiple payment modes, 
              and complete transaction transparency. Join thousands of users who trust our platform.
            </p>
            <Button 
              size="lg"
              onClick={() => window.location.href = '/api/login'}
              data-testid="button-get-started"
              className="text-base px-8"
            >
              Get Started
            </Button>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="py-16 bg-muted/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-semibold text-center mb-12">
            Everything you need for digital payments
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <Card className="p-6">
              <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                <ArrowRightLeft className="w-6 h-6 text-primary" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Instant Transfers</h3>
              <p className="text-muted-foreground">
                Send money to other users instantly with real-time balance updates and immediate confirmation.
              </p>
            </Card>

            <Card className="p-6">
              <div className="w-12 h-12 rounded-lg bg-chart-2/10 flex items-center justify-center mb-4">
                <Shield className="w-6 h-6 text-chart-2" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Secure Transactions</h3>
              <p className="text-muted-foreground">
                Bank-grade security with encrypted data and complete audit trails for every transaction.
              </p>
            </Card>

            <Card className="p-6">
              <div className="w-12 h-12 rounded-lg bg-chart-4/10 flex items-center justify-center mb-4">
                <Zap className="w-6 h-6 text-chart-4" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Multiple Payment Modes</h3>
              <p className="text-muted-foreground">
                Choose from UPI, card payments, or wallet balance for maximum flexibility in how you pay.
              </p>
            </Card>

            <Card className="p-6">
              <div className="w-12 h-12 rounded-lg bg-chart-3/10 flex items-center justify-center mb-4">
                <TrendingUp className="w-6 h-6 text-chart-3" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Transaction Analytics</h3>
              <p className="text-muted-foreground">
                Track your spending with detailed analytics, filtering, and grouping by payment type.
              </p>
            </Card>

            <Card className="p-6">
              <div className="w-12 h-12 rounded-lg bg-chart-5/10 flex items-center justify-center mb-4">
                <Users className="w-6 h-6 text-chart-5" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Wallet Tiers</h3>
              <p className="text-muted-foreground">
                Choose between Basic and Premium wallets with different transaction limits to suit your needs.
              </p>
            </Card>

            <Card className="p-6">
              <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                <Wallet className="w-6 h-6 text-primary" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Complete History</h3>
              <p className="text-muted-foreground">
                Access your full transaction history with powerful search and filtering capabilities.
              </p>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <Card className="p-8 sm:p-12 text-center bg-primary text-primary-foreground border-primary">
            <h2 className="text-3xl sm:text-4xl font-bold mb-4">
              Ready to get started?
            </h2>
            <p className="text-lg mb-8 text-primary-foreground/90 max-w-2xl mx-auto">
              Create your digital wallet in seconds and start making secure transactions today.
            </p>
            <Button 
              size="lg"
              variant="secondary"
              onClick={() => window.location.href = '/api/login'}
              data-testid="button-cta-login"
              className="text-base px-8"
            >
              Create Your Wallet
            </Button>
          </Card>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center text-sm text-muted-foreground">
          <p>&copy; 2025 Digital Wallet. Secure payments made simple.</p>
        </div>
      </footer>
    </div>
  );
}
