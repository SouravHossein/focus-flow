import { useState } from 'react';
import { useNavigate, Navigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { CheckSquare, Loader2 } from 'lucide-react';

type AuthMode = 'login' | 'signup' | 'forgot';

export default function AuthPage() {
  const { user, loading, signIn, signUp, resetPassword } = useAuth();
  const [mode, setMode] = useState<AuthMode>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (user) return <Navigate to="/app" replace />;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      if (mode === 'forgot') {
        const { error } = await resetPassword(email);
        if (error) throw error;
        toast({ title: 'Check your email', description: 'We sent you a password reset link.' });
        setMode('login');
      } else if (mode === 'signup') {
        const { error } = await signUp(email, password, displayName);
        if (error) throw error;
        toast({ title: 'Account created!', description: 'Check your email to confirm your account.' });
      } else {
        const { error } = await signIn(email, password);
        if (error) throw error;
        navigate('/app');
      }
    } catch (err: any) {
      toast({ title: 'Error', description: err.message, variant: 'destructive' });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="w-full max-w-sm">
        <div className="mb-8 text-center">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-primary text-primary-foreground">
            <CheckSquare className="h-6 w-6" />
          </div>
          <h1 className="text-2xl font-bold text-foreground">TaskFlow</h1>
          <p className="mt-1 text-sm text-muted-foreground">Your tasks, beautifully organized</p>
        </div>

        <Card>
          <CardHeader className="pb-4">
            <CardTitle className="text-lg">
              {mode === 'login' ? 'Welcome back' : mode === 'signup' ? 'Create account' : 'Reset password'}
            </CardTitle>
            <CardDescription>
              {mode === 'login'
                ? 'Sign in to your account'
                : mode === 'signup'
                ? 'Start organizing your tasks'
                : 'We\'ll send you a reset link'}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              {mode === 'signup' && (
                <div className="space-y-2">
                  <Label htmlFor="displayName">Name</Label>
                  <Input
                    id="displayName"
                    placeholder="Your name"
                    value={displayName}
                    onChange={(e) => setDisplayName(e.target.value)}
                  />
                </div>
              )}
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
              {mode !== 'forgot' && (
                <div className="space-y-2">
                  <Label htmlFor="password">Password</Label>
                  <Input
                    id="password"
                    type="password"
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    minLength={6}
                  />
                </div>
              )}
              <Button type="submit" className="w-full" disabled={submitting}>
                {submitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {mode === 'login' ? 'Sign in' : mode === 'signup' ? 'Create account' : 'Send reset link'}
              </Button>
            </form>

            <div className="mt-4 space-y-2 text-center text-sm">
              {mode === 'login' && (
                <>
                  <button onClick={() => setMode('forgot')} className="text-primary hover:underline">
                    Forgot password?
                  </button>
                  <p className="text-muted-foreground">
                    Don't have an account?{' '}
                    <button onClick={() => setMode('signup')} className="text-primary hover:underline">
                      Sign up
                    </button>
                  </p>
                </>
              )}
              {mode === 'signup' && (
                <p className="text-muted-foreground">
                  Already have an account?{' '}
                  <button onClick={() => setMode('login')} className="text-primary hover:underline">
                    Sign in
                  </button>
                </p>
              )}
              {mode === 'forgot' && (
                <button onClick={() => setMode('login')} className="text-primary hover:underline">
                  Back to sign in
                </button>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
