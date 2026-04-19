import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useConvexAuth } from 'convex/react';
import { useAuthActions } from '@convex-dev/auth/react';
import { AuthCard } from './AuthCard';
import { Button } from '../ui/button';

const inputClass =
  'mt-1 w-full rounded-lg border border-input-border bg-input-bg px-3 py-2 text-sm text-text-primary shadow-none transition-colors placeholder:text-text-muted focus:border-border-strong focus:outline-none focus:ring-2 focus:ring-accent-blue/25';

function SignUpPageDemo() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [organization, setOrganization] = useState('');

  return (
    <AuthCard
      title="Create account"
      description="Form layout for future sign-up — no account is created yet."
    >
      <div className="mb-6 rounded-lg border border-border-subtle bg-accent-amber-soft px-3 py-2.5 text-left text-xs text-text-primary">
        Registration is not wired to a backend yet. Continue with the demo workspace to explore the product.
      </div>

      <form
        className="space-y-4"
        onSubmit={(e) => {
          e.preventDefault();
        }}
        noValidate
      >
        <div>
          <label htmlFor="signup-org" className="text-sm font-medium text-text-primary">
            Organization (optional)
          </label>
          <input
            id="signup-org"
            name="organization"
            type="text"
            autoComplete="organization"
            value={organization}
            onChange={(e) => setOrganization(e.target.value)}
            className={inputClass}
            placeholder="Your team or brokerage"
          />
        </div>
        <div>
          <label htmlFor="signup-email" className="text-sm font-medium text-text-primary">
            Email
          </label>
          <input
            id="signup-email"
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
          <label htmlFor="signup-password" className="text-sm font-medium text-text-primary">
            Password
          </label>
          <input
            id="signup-password"
            name="password"
            type="password"
            autoComplete="new-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className={inputClass}
            placeholder="••••••••"
          />
        </div>

        <Button type="submit" variant="secondary" disabled title="Account creation will use your auth provider when configured." className="w-full">
          Create account
        </Button>

        <Button type="button" variant="accent" asChild className="w-full">
          <Link to="/demo">Open demo workspace</Link>
        </Button>
      </form>

      <p className="mt-6 text-center text-sm text-text-secondary">
        Already have an account?{' '}
        <Link to="/login" className="font-medium text-accent-blue hover:underline">
          Sign in
        </Link>
      </p>
    </AuthCard>
  );
}

function SignUpPageConvex() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { signIn } = useAuthActions();
  const navigate = useNavigate();
  const { isLoading, isAuthenticated } = useConvexAuth();

  useEffect(() => {
    if (isLoading) return;
    if (isAuthenticated) {
      navigate('/', { replace: true });
    }
  }, [isLoading, isAuthenticated, navigate]);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      await signIn('password', {
        flow: 'signUp',
        email: email.trim(),
        password,
      });
      navigate('/', { replace: true });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not create account.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <AuthCard
      title="Create account"
      description="Create a password-backed account for this Convex deployment."
    >
      {error ? (
        <div className="mb-4 rounded-lg border border-border-subtle bg-accent-red-soft px-3 py-2 text-left text-sm text-text-primary">
          {error}
        </div>
      ) : null}

      <form className="space-y-4" onSubmit={(e) => void onSubmit(e)} noValidate>
        <div>
          <label htmlFor="signup-email" className="text-sm font-medium text-text-primary">
            Email
          </label>
          <input
            id="signup-email"
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
          <label htmlFor="signup-password" className="text-sm font-medium text-text-primary">
            Password
          </label>
          <input
            id="signup-password"
            name="password"
            type="password"
            autoComplete="new-password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className={inputClass}
            placeholder="••••••••"
          />
        </div>

        <Button type="submit" variant="accent" disabled={submitting} className="w-full">
          {submitting ? 'Creating account…' : 'Create account'}
        </Button>
      </form>

      <p className="mt-6 text-center text-sm text-text-secondary">
        Already have an account?{' '}
        <Link to="/login" className="font-medium text-accent-blue hover:underline">
          Sign in
        </Link>
      </p>
    </AuthCard>
  );
}

export function SignUpPage() {
  const convexUrl = import.meta.env.VITE_CONVEX_URL as string | undefined;
  if (convexUrl) {
    return <SignUpPageConvex />;
  }
  return <SignUpPageDemo />;
}
