import { useEffect, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useConvexAuth } from 'convex/react';
import { useAuthActions } from '@convex-dev/auth/react';
import { AuthAlert } from './AuthAlert';
import { AuthCard } from './AuthCard';
import { AuthFooterLink } from './AuthFooterLink';
import { AuthSubmitButton } from './AuthSubmitButton';
import { authInputClass, authLabelClass } from './authFormClasses';
import { mapAuthErrorToMessage } from './mapAuthErrorToMessage';
import { Button } from '../ui/button';

function LoginPageDemo() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  return (
    <AuthCard
      className="min-h-[420px]"
      title="Welcome back"
      description="Sign in to continue to your workspace."
    >
      <div className="mb-6 rounded-xl border border-border-subtle bg-bg-surface/80 px-3 py-3 text-left text-xs leading-relaxed text-text-secondary dark:bg-bg-surface/50">
        This deployment is not connected to Convex Auth yet. Use <strong>Open demo workspace</strong> below to
        explore the product.
      </div>

      <form
        className="space-y-4"
        onSubmit={(e) => {
          e.preventDefault();
        }}
        noValidate
      >
        <div>
          <label htmlFor="login-email" className={authLabelClass}>
            Email
          </label>
          <input
            id="login-email"
            name="email"
            type="email"
            autoComplete="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className={authInputClass}
            placeholder="you@company.com"
          />
        </div>
        <div>
          <label htmlFor="login-password" className={authLabelClass}>
            Password
          </label>
          <input
            id="login-password"
            name="password"
            type="password"
            autoComplete="current-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className={authInputClass}
            placeholder="••••••••"
          />
        </div>

        <div className="flex items-center justify-between text-sm">
          <AuthFooterLink to="/forgot-password">Forgot password?</AuthFooterLink>
        </div>

        <Button
          type="submit"
          variant="secondary"
          disabled
          title="Sign-in will connect when Convex Auth is configured."
          className="min-h-10 w-full"
        >
          Sign in
        </Button>

        <Button type="button" variant="accent" asChild className="min-h-10 w-full">
          <Link to="/demo">Open demo workspace</Link>
        </Button>
      </form>

      <p className="mt-6 text-center text-sm text-text-secondary">
        Don&apos;t have an account? <AuthFooterLink to="/signup">Create account</AuthFooterLink>
      </p>
    </AuthCard>
  );
}

type LoginPhase = 'form' | 'success';

function LoginPageConvex() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [phase, setPhase] = useState<LoginPhase>('form');
  const { signIn } = useAuthActions();
  const navigate = useNavigate();
  const location = useLocation();
  const { isLoading, isAuthenticated } = useConvexAuth();

  const from = (location.state as { from?: string } | null)?.from ?? '/';

  useEffect(() => {
    if (isLoading) return;
    if (!isAuthenticated) return;
    if (phase === 'success') return;
    navigate(from, { replace: true });
  }, [isLoading, isAuthenticated, navigate, from, phase]);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      await signIn('password', { flow: 'signIn', email: email.trim(), password });
      setPhase('success');
      window.setTimeout(() => {
        navigate(from, { replace: true });
      }, 1000);
    } catch (err) {
      setError(mapAuthErrorToMessage(err, 'login'));
    } finally {
      setSubmitting(false);
    }
  };

  if (phase === 'success') {
    return (
      <AuthCard className="min-h-[420px]" title="Welcome back" description="Loading your workspace…">
        <AuthAlert variant="success">
          <p className="font-medium text-text-primary">You&apos;re signed in.</p>
          <p className="mt-1 text-sm text-text-secondary">Preparing your workspace…</p>
        </AuthAlert>
        <div className="flex justify-center py-6" aria-hidden>
          <div className="size-9 rounded-full border-2 border-border-subtle border-t-accent-blue animate-spin" />
        </div>
      </AuthCard>
    );
  }

  return (
    <AuthCard className="min-h-[420px]" title="Welcome back" description="Sign in to continue to your workspace.">
      {error ? (
        <AuthAlert variant="error" id="login-auth-error">
          {error}
        </AuthAlert>
      ) : null}

      <form className="space-y-4" onSubmit={(e) => void onSubmit(e)} noValidate>
        <div>
          <label htmlFor="login-email" className={authLabelClass}>
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
            disabled={submitting}
            className={authInputClass}
            placeholder="you@company.com"
            aria-invalid={error ? true : undefined}
            aria-describedby={error ? 'login-auth-error' : undefined}
          />
        </div>
        <div>
          <label htmlFor="login-password" className={authLabelClass}>
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
            disabled={submitting}
            className={authInputClass}
            placeholder="••••••••"
            aria-invalid={error ? true : undefined}
            aria-describedby={error ? 'login-auth-error' : undefined}
          />
        </div>

        <div className="flex items-center justify-between text-sm">
          <AuthFooterLink to="/forgot-password">Forgot password?</AuthFooterLink>
        </div>

        <AuthSubmitButton loading={submitting} loadingLabel="Signing in…">
          Sign in
        </AuthSubmitButton>

        <Button type="button" variant="outline" asChild className="min-h-10 w-full">
          <Link to="/demo">Open demo workspace</Link>
        </Button>
      </form>

      <p className="mt-6 text-center text-sm text-text-secondary">
        Don&apos;t have an account? <AuthFooterLink to="/signup">Create account</AuthFooterLink>
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
