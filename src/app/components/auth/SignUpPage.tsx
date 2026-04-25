import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useConvexAuth } from 'convex/react';
import { useAuthActions } from '@convex-dev/auth/react';
import { AuthAlert } from './AuthAlert';
import { AuthCard } from './AuthCard';
import { AuthFooterLink } from './AuthFooterLink';
import { AuthSubmitButton } from './AuthSubmitButton';
import { authInputClass, authLabelClass } from './authFormClasses';
import { mapAuthErrorToMessage } from './mapAuthErrorToMessage';
import { Button } from '../ui/button';

function SignUpPageDemo() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [organization, setOrganization] = useState('');

  return (
    <AuthCard
      className="min-h-[480px]"
      title="Create your workspace"
      description="Start tracking deals, deadlines, and documents in one place."
    >
      <div className="mb-6 rounded-xl border border-border-subtle bg-bg-surface/80 px-3 py-3 text-left text-xs leading-relaxed text-text-secondary dark:bg-bg-surface/50">
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
          <label htmlFor="signup-org" className={authLabelClass}>
            Organization <span className="font-normal text-text-muted">(optional)</span>
          </label>
          <input
            id="signup-org"
            name="organization"
            type="text"
            autoComplete="organization"
            value={organization}
            onChange={(e) => setOrganization(e.target.value)}
            className={authInputClass}
            placeholder="Your team or brokerage"
          />
        </div>
        <div>
          <label htmlFor="signup-email" className={authLabelClass}>
            Email
          </label>
          <input
            id="signup-email"
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
          <label htmlFor="signup-password" className={authLabelClass}>
            Password
          </label>
          <input
            id="signup-password"
            name="password"
            type="password"
            autoComplete="new-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className={authInputClass}
            placeholder="••••••••"
          />
        </div>

        <p className="text-xs leading-relaxed text-text-muted">Your workspace will be created automatically.</p>

        <Button
          type="submit"
          variant="secondary"
          disabled
          title="Account creation will use Convex Auth when configured."
          className="min-h-10 w-full"
        >
          Create workspace
        </Button>

        <Button type="button" variant="accent" asChild className="min-h-10 w-full">
          <Link to="/demo">Open demo workspace</Link>
        </Button>
      </form>

      <p className="mt-6 text-center text-sm text-text-secondary">
        Already have an account? <AuthFooterLink to="/login">Sign in</AuthFooterLink>
      </p>
    </AuthCard>
  );
}

type SignupPhase = 'form' | 'provisioning';

function SignUpPageConvex() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [phase, setPhase] = useState<SignupPhase>('form');
  const { signIn } = useAuthActions();
  const navigate = useNavigate();
  const { isLoading, isAuthenticated } = useConvexAuth();

  useEffect(() => {
    if (isLoading) return;
    if (!isAuthenticated) return;
    if (phase === 'provisioning') return;
    navigate('/', { replace: true });
  }, [isLoading, isAuthenticated, navigate, phase]);

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
      setPhase('provisioning');
      window.setTimeout(() => {
        navigate('/', { replace: true });
      }, 1400);
    } catch (err) {
      setError(mapAuthErrorToMessage(err, 'signup'));
    } finally {
      setSubmitting(false);
    }
  };

  if (phase === 'provisioning') {
    return (
      <AuthCard className="min-h-[480px]" title="Setting up your workspace…" description="Creating your dashboard and transaction pipeline.">
        <div className="flex justify-center py-10" aria-hidden>
          <div className="size-10 rounded-full border-2 border-border-subtle border-t-accent-blue animate-spin" />
        </div>
        <AuthAlert variant="info">
          <p className="text-sm text-text-secondary">You&apos;ll be redirected automatically.</p>
        </AuthAlert>
      </AuthCard>
    );
  }

  return (
    <AuthCard
      className="min-h-[480px]"
      title="Create your workspace"
      description="Start tracking deals, deadlines, and documents in one place."
    >
      {error ? (
        <AuthAlert variant="error" id="signup-auth-error">
          {error}
        </AuthAlert>
      ) : null}

      <form className="space-y-4" onSubmit={(e) => void onSubmit(e)} noValidate>
        <div>
          <label htmlFor="signup-email" className={authLabelClass}>
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
            disabled={submitting}
            className={authInputClass}
            placeholder="you@company.com"
            aria-invalid={error ? true : undefined}
            aria-describedby={error ? 'signup-auth-error' : undefined}
          />
        </div>
        <div>
          <label htmlFor="signup-password" className={authLabelClass}>
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
            disabled={submitting}
            className={authInputClass}
            placeholder="At least 8 characters"
            aria-invalid={error ? true : undefined}
            aria-describedby={error ? 'signup-auth-error' : undefined}
          />
        </div>

        <p className="text-xs leading-relaxed text-text-muted">Your workspace will be created automatically.</p>

        <AuthSubmitButton loading={submitting} loadingLabel="Creating workspace…">
          Create workspace
        </AuthSubmitButton>

        <Button type="button" variant="outline" asChild className="min-h-10 w-full">
          <Link to="/demo">Open demo workspace</Link>
        </Button>
      </form>

      <p className="mt-6 text-center text-sm text-text-secondary">
        Already have an account? <AuthFooterLink to="/login">Sign in</AuthFooterLink>
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
