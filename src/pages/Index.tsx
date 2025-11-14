import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { ArrowRight, TrendingUp, BarChart3, CheckCircle2, LayoutDashboard, Shield } from 'lucide-react';
import logoFull from '@/assets/risktwo-logo-full.png';

const Index = () => {
  const navigate = useNavigate();
  const { user, loading } = useAuth();

  if (loading) {
    return null;
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border/50 bg-card/50 backdrop-blur-sm">
        <div className="container mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <img src={logoFull} alt="RiskTwo" className="h-10" />
          </div>
          <Button onClick={() => navigate('/auth')} size="lg">
            Login
          </Button>
        </div>
      </header>

      {/* Hero Section */}
      <section className="container mx-auto px-6 py-24">
        <div className="max-w-4xl mx-auto text-center space-y-8">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-medium mb-4">
            <img src={logoFull} alt="RiskTwo" className="h-5" />
            Portfolio Risk Management
          </div>
          
          <h1 className="text-5xl md:text-6xl font-bold tracking-tight">
            Automated Client Portfolio
            <span className="block text-primary mt-2">Risk Assessment</span>
          </h1>
          
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Real-time portfolio risk scoring and insights for compliance and risk management teams. 
            Upload client portfolios and get instant, actionable risk assessments.
          </p>

          <div className="flex items-center justify-center gap-4 pt-4">
            <Button size="lg" onClick={() => navigate('/auth')} className="text-lg px-8">
              Get Started
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="container mx-auto px-6 py-24">
        <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
          <div className="p-6 rounded-lg bg-card border border-border/50 hover:border-primary/50 transition-colors">
            <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
              <TrendingUp className="h-6 w-6 text-primary" />
            </div>
            <h3 className="text-xl font-semibold mb-2">Real-Time Analysis</h3>
            <p className="text-muted-foreground">
              Live market data integration for accurate, up-to-the-minute portfolio valuations and risk metrics.
            </p>
          </div>

          <div className="p-6 rounded-lg bg-card border border-border/50 hover:border-primary/50 transition-colors">
            <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
              <BarChart3 className="h-6 w-6 text-primary" />
            </div>
            <h3 className="text-xl font-semibold mb-2">Comprehensive Scoring</h3>
            <p className="text-muted-foreground">
              Multi-factor risk scoring based on volatility, sector concentration, and geographic diversification.
            </p>
          </div>

          <div className="p-6 rounded-lg bg-card border border-border/50 hover:border-primary/50 transition-colors">
            <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
              <Shield className="h-6 w-6 text-primary" />
            </div>
            <h3 className="text-xl font-semibold mb-2">Compliance Ready</h3>
            <p className="text-muted-foreground">
              Built for financial compliance teams with audit trails and detailed risk breakdowns.
            </p>
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="container mx-auto px-6 py-24 bg-muted/30">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-12">
            Why Choose RiskTwo?
          </h2>
          
          <div className="space-y-6">
            {[
              'Upload portfolios in CSV format and get instant risk analysis',
              'Track asset allocation across stocks, ETFs, and crypto',
              'Monitor portfolio performance with detailed gain/loss metrics',
              'View sector and geographic concentration risks',
              'Access actionable risk improvement recommendations',
              'Role-based access for admins and clients'
            ].map((benefit, index) => (
              <div key={index} className="flex items-start gap-4">
                <CheckCircle2 className="h-6 w-6 text-primary flex-shrink-0 mt-1" />
                <p className="text-lg">{benefit}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="container mx-auto px-6 py-24">
        <div className="max-w-3xl mx-auto text-center space-y-6 p-12 rounded-2xl bg-gradient-to-r from-primary/10 to-primary/5 border border-primary/20">
          <h2 className="text-3xl md:text-4xl font-bold">
            Ready to Start Analyzing Portfolios?
          </h2>
          <p className="text-xl text-muted-foreground">
            Join risk management teams using RiskTwo for automated portfolio analysis
          </p>
          <Button size="lg" onClick={() => navigate('/auth')} className="text-lg px-8">
            Get Started Now
            <ArrowRight className="ml-2 h-5 w-5" />
          </Button>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border/50 bg-card/50">
        <div className="container mx-auto px-6 py-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <img src={logoFull} alt="RiskTwo" className="h-8" />
            </div>
            <p className="text-sm text-muted-foreground">
              © 2025 RiskTwo. Portfolio Risk Management Platform.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Index;
