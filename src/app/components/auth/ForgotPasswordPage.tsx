import { useState } from 'react';
import { Link } from 'react-router-dom';
import { AuthCard } from './AuthCard';
import { Button } from '../ui/button';

const inputClass =
  'mt-1 w-full rounded-lg border border-input-border bg-input-bg px-3 py-2 text-sm text-text-primary shadow-none transition-colors placeholder:text-text-muted focus:border-border-strong focus:outline-none focus:ring-2 focus:ring-accent-blue/25';

export function ForgotPasswordPage() {
  const [email, setEmail] = useState('');

  return (
    <AuthCard
      title="Reset password"
      description="We’ll email a reset link when email delivery is configured."
    >
      <div className="mb-6 rounded-lg border border-border-subtle bg-bg-app px-3 py-2.5 text-left text-xs text-text-secondary dark:bg-bg-elevated/30">
        Password reset is not connected yet — this page reserves the flow for your future auth provider.
      </div>

      <form
        className="space-y-4"
        onSubmit={(e) => {
          e.preventDefault();
        }}
        noValidate
      >
        <div>
          <label htmlFor="forgot-email" className="text-sm font-medium text-text-primary">
            Email
          </label>
          <input
            id="forgot-email"
            name="email"
            type="email"
            autoComplete="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className={inputClass}
            placeholder="you@company.com"
          />
        </div>

        <Button type="submit" variant="secondary" disabled title="Reset emails will send when auth is configured." className="w-full">
          Send reset link
        </Button>

        <Button type="button" variant="accent" asChild className="w-full">
          <Link to="/demo">Open demo workspace</Link>
        </Button>
      </form>

      <p className="mt-6 text-center text-sm text-text-secondary">
        <Link to="/login" className="font-medium text-accent-blue hover:underline">
          Back to sign in
        </Link>
      </p>
    </AuthCard>
  );
}
