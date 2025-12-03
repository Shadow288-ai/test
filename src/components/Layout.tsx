import { Link, useLocation } from 'react-router-dom';
import { BarChart3, Upload, HelpCircle, Users, LogOut } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { VideoBackground } from '@/components/VideoBackground';

export function Layout({ children }: { children: React.ReactNode }) {
  const location = useLocation();
  const { userRole, signOut, user } = useAuth();

  const clientNavigation = [
    { name: 'My Portfolio', href: '/client', icon: BarChart3 },
    { name: 'Upload Data', href: '/upload', icon: Upload },
    { name: 'Help', href: '/help', icon: HelpCircle },
  ];

  const adminNavigation = [
    { name: 'Dashboard', href: '/admin', icon: BarChart3 },
    { name: 'Clients', href: '/admin/clients', icon: Users },
    { name: 'Upload Data', href: '/upload', icon: Upload },
    { name: 'Help', href: '/help', icon: HelpCircle },
  ];

  const navigation = userRole === 'admin' ? adminNavigation : clientNavigation;

  return (
    <div className="min-h-screen bg-background relative">
      <VideoBackground />
      <nav className="relative border-b border-border/30 bg-card/30 backdrop-blur-xl backdrop-saturate-150 z-50 shadow-sm">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 items-center justify-between">
            <div className="flex items-center gap-3">
              <img src="/favicon.png" alt="RiskTwo" className="h-10 object-contain" />
            </div>
            <div className="flex items-center gap-8">
              <div className="flex gap-1">
                {navigation.map((item) => {
                  const Icon = item.icon;
                  const isActive = location.pathname === item.href;
                  return (
                    <Link
                      key={item.name}
                      to={item.href}
                      className={cn(
                        'glass-card flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all relative overflow-hidden',
                        isActive
                          ? 'bg-primary/90 text-primary-foreground'
                          : 'text-muted-foreground hover:bg-card/50 bg-card/30'
                      )}
                    >
                      <div className="glass-filter"></div>
                      <div className="glass-overlay"></div>
                      <div className="glass-distortion-overlay"></div>
                      <div className="glass-specular"></div>
                      <span className="relative z-10 flex items-center gap-2">
                        <Icon className="h-4 w-4" />
                        {item.name}
                      </span>
                    </Link>
                  );
                })}
              </div>
              <div className="flex items-center gap-3">
                <span className="text-sm text-muted-foreground">
                  {user?.email}
                </span>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={signOut}
                  className="gap-2 glass-button relative overflow-hidden"
                >
                  <div className="glass-filter"></div>
                  <div className="glass-overlay"></div>
                  <div className="glass-distortion-overlay"></div>
                  <div className="glass-specular"></div>
                  <span className="relative z-10 flex items-center gap-2">
                    <LogOut className="h-4 w-4" />
                    Sign Out
                  </span>
                </Button>
              </div>
            </div>
          </div>
        </div>
      </nav>
      <main className="container py-8 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 relative z-20">
        {children}
      </main>
    </div>
  );
}
