import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { 
  ArrowRight, 
  TrendingUp, 
  BarChart3, 
  CheckCircle2, 
  Shield, 
  Bot,
  Upload,
  Zap,
  Globe,
  PieChart,
  AlertTriangle,
  RefreshCw,
  Users,
  Lock,
  FileText,
  Target,
  Activity
} from 'lucide-react';
import { useEffect, useState } from 'react';

const Index = () => {
  const navigate = useNavigate();
  const { user, loading } = useAuth();
  const [stats, setStats] = useState({ portfolios: 1247, clients: 342, riskAssessments: 8921 });
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    setIsVisible(true);
    // Simulate dynamic stats with smooth increments
    const interval = setInterval(() => {
      setStats(prev => ({
        portfolios: prev.portfolios + Math.floor(Math.random() * 2),
        clients: prev.clients + Math.floor(Math.random() * 1),
        riskAssessments: prev.riskAssessments + Math.floor(Math.random() * 5)
      }));
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  if (loading) {
    return null;
  }

  const features = [
    {
      icon: Zap,
      title: 'Real-Time Market Data',
      description: 'Live stock prices, crypto rates, and ETF valuations updated automatically. No manual data entry required.',
      color: 'from-yellow-500/20 to-orange-500/20'
    },
    {
      icon: BarChart3,
      title: 'Advanced Risk Scoring',
      description: 'Multi-factor algorithm analyzing volatility, sector concentration, geographic diversification, and portfolio size.',
      color: 'from-blue-500/20 to-cyan-500/20'
    },
    {
      icon: Bot,
      title: 'AI Risk Advisor',
      description: 'Get personalized recommendations from our AI-powered risk advisor. Ask questions and receive actionable insights.',
      color: 'from-purple-500/20 to-pink-500/20'
    },
    {
      icon: Upload,
      title: 'CSV Portfolio Upload',
      description: 'Upload client portfolios in seconds. Automatic validation, error detection, and instant processing.',
      color: 'from-green-500/20 to-emerald-500/20'
    },
    {
      icon: PieChart,
      title: 'Asset Allocation Tracking',
      description: 'Visual breakdowns of stocks, ETFs, crypto, and bonds. Track sector and geographic distribution.',
      color: 'from-indigo-500/20 to-blue-500/20'
    },
    {
      icon: Globe,
      title: 'Geographic Analysis',
      description: 'Monitor regional exposure and concentration risks across global markets and currencies.',
      color: 'from-teal-500/20 to-cyan-500/20'
    },
    {
      icon: Shield,
      title: 'Compliance & Audit',
      description: 'Built-in audit trails, detailed risk breakdowns, and compliance-ready reporting for financial teams.',
      color: 'from-red-500/20 to-rose-500/20'
    },
    {
      icon: Users,
      title: 'Multi-User Management',
      description: 'Role-based access control. Admins manage all clients, clients view their own portfolios securely.',
      color: 'from-violet-500/20 to-purple-500/20'
    },
    {
      icon: Activity,
      title: 'Performance Metrics',
      description: 'Track gain/loss percentages, portfolio value changes, and performance trends over time.',
      color: 'from-amber-500/20 to-yellow-500/20'
    }
  ];

  const benefits = [
    'Upload portfolios in CSV format and get instant risk analysis',
    'Track asset allocation across stocks, ETFs, and crypto',
    'Monitor portfolio performance with detailed gain/loss metrics',
    'View sector and geographic concentration risks',
    'Access actionable risk improvement recommendations',
    'Role-based access for admins and clients',
    'AI-powered risk advisor for personalized insights',
    'Real-time price updates for accurate valuations',
    'Comprehensive charts and visualizations',
    'Export-ready reports for compliance teams'
  ];

  return (
    <div className="min-h-screen bg-background relative overflow-hidden">
      {/* Video Background */}
      <div className="fixed inset-0 w-full h-full z-0">
        <video
          autoPlay
          loop
          muted
          playsInline
          className="absolute inset-0 w-full h-full object-cover"
        >
          <source src="/7593088-uhd_4096_1974_30fps.mp4" type="video/mp4" />
        </video>
        {/* Fade overlay for text readability */}
        <div className="absolute inset-0 bg-background/60 backdrop-blur-[2px]"></div>
        <div className="absolute inset-0 bg-gradient-to-b from-background/70 via-background/50 to-background/80"></div>
      </div>

      {/* Animated background gradient */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none z-10">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-primary/20 rounded-full blur-3xl animate-pulse" />
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-primary/10 rounded-full blur-3xl animate-pulse delay-1000" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-primary/5 rounded-full blur-3xl" />
      </div>

      {/* Header with liquid glass */}
      <header className="relative border-b border-border/30 bg-card/30 backdrop-blur-xl backdrop-saturate-150 z-50">
        <div className="container mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <img src="/favicon.png" alt="RiskTwo" className="h-10" />
          </div>
          <Button 
            onClick={() => navigate('/auth')} 
            size="lg"
            className="glass-button relative bg-primary/90 hover:bg-primary transition-all shadow-lg hover:shadow-xl overflow-hidden"
          >
            <div className="glass-filter"></div>
            <div className="glass-overlay"></div>
            <div className="glass-distortion-overlay"></div>
            <div className="glass-specular"></div>
            <span className="relative z-10">Login</span>
          </Button>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative container mx-auto px-6 py-24 md:py-32 z-20">
        <div className={`max-w-5xl mx-auto text-center space-y-8 transition-all duration-1000 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
          <div className="flex justify-center mb-4 animate-fade-in">
            <img src="/favicon.png" alt="RiskTwo" className="h-16 md:h-20 w-auto" />
          </div>
          
          <h1 className="text-5xl md:text-7xl font-bold tracking-tight bg-gradient-to-r from-foreground via-primary to-foreground bg-clip-text text-transparent">
            Transform Portfolio Risk
            <span className="block mt-2">Into Strategic Advantage</span>
          </h1>
          
          <p className="text-xl md:text-2xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
            Real-time risk scoring, AI-powered insights, and comprehensive analytics for compliance teams. 
            <span className="block mt-2 font-medium text-foreground">Upload portfolios in seconds. Get actionable risk assessments instantly.</span>
          </p>

          <div className="flex items-center justify-center gap-4 pt-6">
            <Button 
              size="lg" 
              onClick={() => navigate('/auth')} 
              className="glass-button relative text-lg px-8 py-6 bg-primary hover:bg-primary/90 shadow-xl hover:shadow-2xl transition-all transform hover:scale-105 overflow-hidden"
            >
              <div className="glass-filter"></div>
              <div className="glass-overlay"></div>
              <div className="glass-distortion-overlay"></div>
              <div className="glass-specular"></div>
              <span className="relative z-10 flex items-center">
                Start Free Trial
                <ArrowRight className="ml-2 h-5 w-5" />
              </span>
            </Button>
            <Button 
              size="lg" 
              variant="outline"
              className="glass-button relative text-lg px-8 py-6 bg-card/50 border-border/50 hover:bg-card/80 overflow-hidden"
            >
              <div className="glass-filter"></div>
              <div className="glass-overlay"></div>
              <div className="glass-distortion-overlay"></div>
              <div className="glass-specular"></div>
              <span className="relative z-10">Watch Demo</span>
            </Button>
          </div>

          {/* Dynamic Stats */}
          <div className="grid grid-cols-3 gap-6 pt-12 max-w-2xl mx-auto">
            {[
              { label: 'Portfolios Analyzed', value: stats.portfolios, suffix: '+' },
              { label: 'Active Clients', value: stats.clients, suffix: '+' },
              { label: 'Risk Assessments', value: stats.riskAssessments, suffix: '+' }
            ].map((stat, idx) => (
              <div 
                key={idx}
                className="glass-card p-6 bg-card/40 border border-border/30 hover:border-primary/30 transition-all hover:scale-105"
              >
                <div className="glass-filter"></div>
                <div className="glass-overlay"></div>
                <div className="glass-distortion-overlay"></div>
                <div className="glass-specular"></div>
                <div className="glass-content">
                  <div className="text-3xl font-bold text-primary mb-1">
                    {stat.value.toLocaleString()}{stat.suffix}
                  </div>
                  <div className="text-sm text-muted-foreground">{stat.label}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Grid with Liquid Glass */}
      <section className="relative container mx-auto px-6 py-24 z-20">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold mb-4">
              Everything You Need for <span className="text-primary">Risk Management</span>
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Powerful features designed for financial professionals and compliance teams
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feature, index) => {
              const Icon = feature.icon;
              return (
                <div
                  key={index}
                  className={`glass-card group p-6 bg-gradient-to-br ${feature.color} border border-border/30 hover:border-primary/50 transition-all duration-300 hover:scale-105 hover:shadow-2xl cursor-pointer`}
                  style={{
                    animationDelay: `${index * 100}ms`
                  }}
                >
                  <div className="glass-filter"></div>
                  <div className="glass-overlay"></div>
                  <div className="glass-distortion-overlay"></div>
                  <div className="glass-specular"></div>
                  <div className="glass-content">
                    <div className="h-14 w-14 rounded-xl bg-primary/20 backdrop-blur-sm flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                      <Icon className="h-7 w-7 text-primary" />
                    </div>
                    <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
                    <p className="text-muted-foreground leading-relaxed">{feature.description}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="relative container mx-auto px-6 py-24 bg-muted/20 backdrop-blur-sm z-20">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold mb-4">
              How <span className="text-primary">RiskTwo</span> Works
            </h2>
            <p className="text-xl text-muted-foreground">
              Get started in three simple steps
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                step: '01',
                title: 'Upload Portfolio',
                description: 'Upload your client portfolio CSV file. Our system automatically validates and processes the data.',
                icon: Upload
              },
              {
                step: '02',
                title: 'Real-Time Analysis',
                description: 'Get instant risk scoring, market valuations, and comprehensive analytics in seconds.',
                icon: Zap
              },
              {
                step: '03',
                title: 'Actionable Insights',
                description: 'Review detailed risk breakdowns, AI recommendations, and compliance-ready reports.',
                icon: Target
              }
            ].map((step, idx) => {
              const Icon = step.icon;
              return (
                <div
                  key={idx}
                  className="glass-card relative p-8 bg-card/50 border border-border/30 hover:border-primary/50 transition-all group"
                >
                  <div className="glass-filter"></div>
                  <div className="glass-overlay"></div>
                  <div className="glass-distortion-overlay"></div>
                  <div className="glass-specular"></div>
                  <div className="glass-content">
                    <div className="absolute -top-4 -left-4 w-12 h-12 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold text-lg shadow-lg z-10">
                      {step.step}
                    </div>
                    <div className="h-16 w-16 rounded-xl bg-primary/10 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                      <Icon className="h-8 w-8 text-primary" />
                    </div>
                    <h3 className="text-2xl font-semibold mb-3">{step.title}</h3>
                    <p className="text-muted-foreground leading-relaxed">{step.description}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Benefits Section with Liquid Glass */}
      <section className="relative container mx-auto px-6 py-24 z-20">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold mb-4">
              Why Choose <span className="text-primary">RiskTwo</span>?
            </h2>
            <p className="text-xl text-muted-foreground">
              Trusted by compliance teams and risk management professionals
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 gap-4">
            {benefits.map((benefit, index) => (
              <div
                key={index}
                className="glass-card p-4 bg-card/40 border border-border/30 hover:border-primary/30 transition-all hover:scale-[1.02]"
              >
                <div className="glass-filter"></div>
                <div className="glass-overlay"></div>
                <div className="glass-distortion-overlay"></div>
                <div className="glass-specular"></div>
                <div className="glass-content flex items-start gap-4">
                  <CheckCircle2 className="h-6 w-6 text-primary flex-shrink-0 mt-1" />
                  <p className="text-lg">{benefit}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Key Differentiators */}
      <section className="relative container mx-auto px-6 py-24 bg-muted/20 backdrop-blur-sm z-20">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold mb-4">
              Built for <span className="text-primary">Financial Professionals</span>
            </h2>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              {
                icon: Lock,
                title: 'Bank-Grade Security',
                description: 'Enterprise-level encryption and secure data handling'
              },
              {
                icon: FileText,
                title: 'Compliance Ready',
                description: 'Audit trails and detailed reporting for regulatory requirements'
              },
              {
                icon: RefreshCw,
                title: 'Always Up-to-Date',
                description: 'Automatic price updates and real-time market data synchronization'
              },
              {
                icon: AlertTriangle,
                title: 'Risk Alerts',
                description: 'Proactive notifications for high-risk portfolios and concentration issues'
              }
            ].map((item, idx) => {
              const Icon = item.icon;
              return (
                <div
                  key={idx}
                  className="glass-card p-6 bg-card/50 border border-border/30 hover:border-primary/50 transition-all hover:scale-105 text-center"
                >
                  <div className="glass-filter"></div>
                  <div className="glass-overlay"></div>
                  <div className="glass-distortion-overlay"></div>
                  <div className="glass-specular"></div>
                  <div className="glass-content">
                    <div className="h-14 w-14 rounded-xl bg-primary/10 flex items-center justify-center mx-auto mb-4">
                      <Icon className="h-7 w-7 text-primary" />
                    </div>
                    <h3 className="text-lg font-semibold mb-2">{item.title}</h3>
                    <p className="text-sm text-muted-foreground">{item.description}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* CTA Section with Liquid Glass */}
      <section className="relative container mx-auto px-6 py-24 z-20">
        <div className="max-w-4xl mx-auto">
          <div className="glass-card relative p-12 md:p-16 bg-gradient-to-br from-primary/20 via-primary/10 to-primary/5 border border-primary/30 shadow-2xl overflow-hidden">
            <div className="glass-filter"></div>
            <div className="glass-overlay"></div>
            <div className="glass-distortion-overlay"></div>
            <div className="glass-specular"></div>
            {/* Animated background elements */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-primary/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
            <div className="absolute bottom-0 left-0 w-64 h-64 bg-primary/10 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2" />
            
            <div className="glass-content relative text-center space-y-6">
              <h2 className="text-3xl md:text-5xl font-bold">
                Ready to Transform Your Risk Management?
              </h2>
              <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
                Join leading financial institutions using RiskTwo for automated portfolio analysis and compliance reporting.
              </p>
              <div className="flex items-center justify-center gap-4 pt-4">
                <Button 
                  size="lg" 
                  onClick={() => navigate('/auth')} 
                  className="glass-button relative text-lg px-10 py-6 bg-primary hover:bg-primary/90 shadow-xl hover:shadow-2xl transition-all transform hover:scale-105 overflow-hidden"
                >
                  <div className="glass-filter"></div>
                  <div className="glass-overlay"></div>
                  <div className="glass-distortion-overlay"></div>
                  <div className="glass-specular"></div>
                  <span className="relative z-10 flex items-center">
                    Get Started Now
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </span>
                </Button>
              </div>
              <p className="text-sm text-muted-foreground">
                No credit card required • Free trial • Setup in minutes
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer with Liquid Glass */}
      <footer className="relative border-t border-border/30 bg-card/30 backdrop-blur-xl backdrop-saturate-150 z-20">
        <div className="container mx-auto px-6 py-12">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <img src="/favicon.png" alt="RiskTwo" className="h-8" />
            </div>
            <div className="flex items-center gap-6 text-sm text-muted-foreground">
              <span>© 2025 RiskTwo</span>
              <span>•</span>
              <span>Portfolio Risk Management Platform</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Index;