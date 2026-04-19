import { useEffect, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useConvexAuth } from 'convex/react';
import { useAuthActions } from '@convex-dev/auth/react';
import { AuthCard } from './AuthCard';
import { Button } from '../ui/button';

const inputClass =
  'mt-1 w-full rounded-lg border border-input-border bg-input-bg px-3 py-2 text-sm text-text-primary shadow-none transition-colors placeholder:text-text-muted focus:border-border-strong focus:outline-none focus:ring-2 focus:ring-accent-blue/25';

function LoginPageDemo() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  return (
    <AuthCard
      title="Sign in"
      description="Use the demo workspace while auth is being integrated."
    >
      <div className="mb-6 rounded-lg border border-border-subtle bg-accent-amber-soft px-3 py-2.5 text-left text-xs text-text-primary">
        This screen is a production-ready shell only — no credentials are sent yet. Use{' '}
        <strong>Open demo workspace</strong> in the footer (or below) to use the app.
      </div>

      <form
        className="space-y-4"
        onSubmit={(e) => {
          e.preventDefault();
        }}
        noValidate
      >
        <div>
          <label htmlFor="login-email" className="text-sm font-medium text-text-primary">
            Email
          </label>
          <input
            id="login-email"
            name="email"
            type="email"
            autoComplete="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className={inputClass}
            placeholder="you@company.com"
          />
        </div>
        <div>
          <label htmlFor="login-password" className="text-sm font-medium text-text-primary">
            Password
          </label>
          <input
            id="login-password"
            name="password"
            type="password"
            autoComplete="current-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className={inputClass}
            placeholder="••••••••"
          />
        </div>

        <div className="flex items-center justify-between text-sm">
          <Link to="/forgot-password" className="font-medium text-accent-blue hover:underline">
            Forgot password?
          </Link>
        </div>

        <Button type="submit" variant="secondary" disabled title="Sign-in will connect to your auth provider when configured." className="w-full">
          Sign in
        </Button>

        <Button type="button" variant="accent" asChild className="w-full">
          <Link to="/demo">Open demo workspace</Link>
        </Button>
      </form>

      <p className="mt-6 text-center text-sm text-text-secondary">
        Don&apos;t have an account?{' '}
        <Link to="/signup" className="font-medium text-accent-blue hover:underline">
          Create one
        </Link>
      </p>
    </AuthCard>
  );
}

function LoginPageConvex() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { signIn } = useAuthActions();
  const navigate = useNavigate();
  const location = useLocation();
  const { isLoading, isAuthenticated } = useConvexAuth();

  const from = (location.state as { from?: string } | null)?.from ?? '/';

  useEffect(() => {
    if (isLoading) return;
    if (isAuthenticated) {
      navigate(from, { replace: true });
    }
  }, [isLoading, isAuthenticated, navigate, from]);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      await signIn('password', { flow: 'signIn', email: email.trim(), password });
      navigate(from, { replace: true });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not sign in.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <AuthCard
      title="Sign in"
      description="Enter the email and password for your workspace account."
    >
      {error ? (
        <div className="mb-4 rounded-lg border border-border-subtle bg-accent-red-soft px-3 py-2 text-left text-sm text-text-primary">
          {error}
        </div>
      ) : null}

      <form className="space-y-4" onSubmit={(e) => void onSubmit(e)} noValidate>
        <div>
          <label htmlFor="login-email" className="text-sm font-medium text-text-primary">
            Email
          </label>
          <input
            id="login-email"
            name="email"
            type="email"
            autoComplete="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className={inputClass}
            placeholder="you@company.com"
          />
        </div>
        <div>
          <label htmlFor="login-password" className="text-sm font-medium text-text-primary">
            Password
          </label>
          <input
            id="login-password"
            name="password"
            type="password"
            autoComplete="current-password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className={inputClass}
            placeholder="••••••••"
          />
        </div>

        <div className="flex items-center justify-between text-sm">
          <Link to="/forgot-password" className="font-medium text-accent-blue hover:underline">
            Forgot password?
          </Link>
        </div>

        <Button type="submit" variant="accent" disabled={submitting} className="w-full">
          {submitting ? 'Signing in…' : 'Sign in'}
        </Button>
      </form>

      <p className="mt-6 text-center text-sm text-text-secondary">
        Don&apos;t have an account?{' '}
        <Link to="/signup" className="font-medium text-accent-blue hover:underline">
          Create one
        </Link>
      </p>
    </AuthCard>
  );
}

export function LoginPage() {
  const convexUrl = import.meta.env.VITE_CONVEX_URL as string | undefined;
  if (convexUrl) {
    return <LoginPageConvex />;
  }
  return <LoginPageDemo />;
}
