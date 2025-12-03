import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { VideoBackground } from '@/components/VideoBackground';

export default function Auth() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [loading, setLoading] = useState(false);
  const { signIn, signUp, user, userRole } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (user && userRole) {
      if (userRole === 'admin') {
        navigate('/admin');
      } else if (userRole === 'client') {
        navigate('/client');
      }
    }
  }, [user, userRole, navigate]);
/*
  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    await signIn(email, password);
    setLoading(false);
  };
*/
  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const { error } = await signUp(email, password, fullName);
    setLoading(false);
    if (!error) {
      setEmail('');
      setPassword('');
      setFullName('');
    }
  };


const handleSignIn = async (e: React.FormEvent) => {
  e.preventDefault();
  setLoading(true);
  const { error } = await signIn(email, password);
  setLoading(false);

  if (error) {
    alert(`Login error: ${error.message}`);
    console.error('Login error:', error);
  } else {
    console.log('Login success – waiting for redirect...');
  }
};
  return (
    <div className="min-h-screen flex items-center justify-center p-4 relative z-20">
      <VideoBackground />
      <Card className="w-full max-w-md glass-card relative z-10 border border-border/30">
        <div className="glass-filter"></div>
        <div className="glass-overlay"></div>
        <div className="glass-distortion-overlay"></div>
        <div className="glass-specular"></div>
        <div className="glass-content relative z-10">
          <CardHeader className="text-center space-y-4">
            <div className="flex justify-center">
              <img src="/favicon.png" alt="RiskTwo" className="h-20 object-contain" />
            </div>
            <CardTitle className="text-2xl">Welcome to RiskTwo</CardTitle>
            <CardDescription>
              Portfolio risk management platform
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="signin" className="w-full">
              <TabsList className="grid w-full grid-cols-2 glass-card">
                <TabsTrigger value="signin" className="relative z-10">Sign In</TabsTrigger>
                <TabsTrigger value="signup" className="relative z-10">Sign Up</TabsTrigger>
              </TabsList>
              
              <TabsContent value="signin">
                <form onSubmit={handleSignIn} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="signin-email">Email</Label>
                    <Input
                      id="signin-email"
                      type="email"
                      placeholder="you@example.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                      className="bg-card/50 backdrop-blur-sm border-border/50"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="signin-password">Password</Label>
                    <Input
                      id="signin-password"
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                      className="bg-card/50 backdrop-blur-sm border-border/50"
                    />
                  </div>
                  <Button 
                    type="submit" 
                    className="w-full glass-button relative overflow-hidden" 
                    disabled={loading}
                  >
                    <div className="glass-filter"></div>
                    <div className="glass-overlay"></div>
                    <div className="glass-distortion-overlay"></div>
                    <div className="glass-specular"></div>
                    <span className="relative z-10">{loading ? 'Signing in...' : 'Sign In'}</span>
                  </Button>
                </form>
              </TabsContent>
              
              <TabsContent value="signup">
                <form onSubmit={handleSignUp} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="signup-name">Full Name</Label>
                    <Input
                      id="signup-name"
                      type="text"
                      placeholder="John Doe"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      className="bg-card/50 backdrop-blur-sm border-border/50"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="signup-email">Email</Label>
                    <Input
                      id="signup-email"
                      type="email"
                      placeholder="you@example.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                      className="bg-card/50 backdrop-blur-sm border-border/50"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="signup-password">Password</Label>
                    <Input
                      id="signup-password"
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                      minLength={6}
                      className="bg-card/50 backdrop-blur-sm border-border/50"
                    />
                  </div>
                  <Button 
                    type="submit" 
                    className="w-full glass-button relative overflow-hidden" 
                    disabled={loading}
                  >
                    <div className="glass-filter"></div>
                    <div className="glass-overlay"></div>
                    <div className="glass-distortion-overlay"></div>
                    <div className="glass-specular"></div>
                    <span className="relative z-10">{loading ? 'Creating account...' : 'Sign Up'}</span>
                  </Button>
                </form>
              </TabsContent>
            </Tabs>
          </CardContent>
          <CardFooter className="text-center text-sm text-muted-foreground">
            <p className="w-full">
              By continuing, you agree to our Terms of Service and Privacy Policy
            </p>
          </CardFooter>
        </div>
      </Card>
    </div>
  );
}
