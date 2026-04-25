import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuthActions } from '@convex-dev/auth/react';
import { AuthAlert } from './AuthAlert';
import { AuthCard } from './AuthCard';
import { AuthFooterLink } from './AuthFooterLink';
import { AuthSubmitButton } from './AuthSubmitButton';
import { authInputClass, authLabelClass } from './authFormClasses';
import { Button } from '../ui/button';

type ForgotPhase = 'form' | 'loading' | 'success';

const PRIVACY_SUCCESS_BODY =
  'If an account exists for that email, you’ll receive reset instructions.';

function ForgotPasswordOffline() {
  const [email, setEmail] = useState('');
  const [phase, setPhase] = useState<ForgotPhase>('form');

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setPhase('loading');
    await new Promise((r) => window.setTimeout(r, 450));
    setPhase('success');
  };

  if (phase === 'success') {
    return (
      <AuthCard className="min-h-[380px]" title="Check your inbox">
        <AuthAlert variant="success">{PRIVACY_SUCCESS_BODY}</AuthAlert>
        <p className="mt-6 text-center text-sm text-text-secondary">
          <AuthFooterLink to="/login">Back to sign in</AuthFooterLink>
        </p>
      </AuthCard>
    );
  }

  return (
    <AuthCard
      className="min-h-[380px]"
      title="Reset your password"
      description="Enter your email and we’ll send reset instructions."
    >
      <form className="space-y-4" onSubmit={(e) => void onSubmit(e)} noValidate>
        <div>
          <label htmlFor="forgot-email-offline" className={authLabelClass}>
            Email
          </label>
          <input
            id="forgot-email-offline"
            name="email"
            type="email"
            autoComplete="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            disabled={phase === 'loading'}
            className={authInputClass}
            placeholder="you@company.com"
          />
        </div>

        <AuthSubmitButton loading={phase === 'loading'} loadingLabel="Sending…">
          Send reset instructions
        </AuthSubmitButton>

        <Button type="button" variant="outline" asChild className="min-h-10 w-full">
          <Link to="/demo">Open demo workspace</Link>
        </Button>
      </form>

      <p className="mt-6 text-center text-sm text-text-secondary">
        <AuthFooterLink to="/login">Back to sign in</AuthFooterLink>
      </p>
    </AuthCard>
  );
}

function ForgotPasswordConvex() {
  const { signIn } = useAuthActions();
  const [email, setEmail] = useState('');
  const [phase, setPhase] = useState<ForgotPhase>('form');

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setPhase('loading');
    const trimmed = email.trim();
    try {
      await signIn('password', { flow: 'reset', email: trimmed });
    } catch {
      /* Privacy-safe UX: same outcome whether the account exists or reset is disabled. */
    }
    setPhase('success');
  };

  if (phase === 'success') {
    return (
      <AuthCard className="min-h-[380px]" title="Check your inbox">
        <AuthAlert variant="success">{PRIVACY_SUCCESS_BODY}</AuthAlert>
        <p className="mt-6 text-center text-sm text-text-secondary">
          <AuthFooterLink to="/login">Back to sign in</AuthFooterLink>
        </p>
      </AuthCard>
    );
  }

  return (
    <AuthCard
      className="min-h-[380px]"
      title="Reset your password"
      description="Enter your email and we’ll send reset instructions."
    >
      <form className="space-y-4" onSubmit={(e) => void onSubmit(e)} noValidate>
        <div>
          <label htmlFor="forgot-email" className={authLabelClass}>
            Email
          </label>
          <input
            id="forgot-email"
            name="email"
            type="email"
            autoComplete="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            disabled={phase === 'loading'}
            className={authInputClass}
            placeholder="you@company.com"
          />
        </div>

        <AuthSubmitButton loading={phase === 'loading'} loadingLabel="Sending…">
          Send reset instructions
        </AuthSubmitButton>

        <Button type="button" variant="outline" asChild className="min-h-10 w-full">
          <Link to="/demo">Open demo workspace</Link>
        </Button>
      </form>

      <p className="mt-6 text-center text-sm text-text-secondary">
        <AuthFooterLink to="/login">Back to sign in</AuthFooterLink>
      </p>
    </AuthCard>
  );
}

export function ForgotPasswordPage() {
  const convexUrl = import.meta.env.VITE_CONVEX_URL as string | undefined;
  if (convexUrl) {
    return <ForgotPasswordConvex />;
  }
  return <ForgotPasswordOffline />;
}
