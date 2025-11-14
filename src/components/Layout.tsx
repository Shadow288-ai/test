import { Link, useLocation } from 'react-router-dom';
import { BarChart3, Upload, HelpCircle, Users, LogOut } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import logo from '@/assets/risktwo-logo.png';

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
    <div className="min-h-screen bg-background">
      <nav className="border-b bg-card shadow-sm">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 items-center justify-between">
            <div className="flex items-center gap-3">
              <img src={logo} alt="RiskTwo" className="h-10 object-contain" />
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
                        'flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors',
                        isActive
                          ? 'bg-primary text-primary-foreground'
                          : 'text-muted-foreground hover:bg-secondary hover:text-foreground'
                      )}
                    >
                      <Icon className="h-4 w-4" />
                      {item.name}
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
                  className="gap-2"
                >
                  <LogOut className="h-4 w-4" />
                  Sign Out
                </Button>
              </div>
            </div>
          </div>
        </div>
      </nav>
      <main className="container py-8 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {children}
      </main>
    </div>
  );
}
