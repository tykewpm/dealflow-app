import { Link } from 'react-router-dom';
import { AuthLayout } from './AuthLayout';
import { AuthCard } from './AuthCard';
import { Button } from '../ui/button';

/**
 * Shown when `VITE_DEAL_DATA_SOURCE=mock` — sign-in routes are otherwise redirected with no explanation.
 * Helps non-technical operators understand why `/login` did not show a form.
 */
export function AuthDisabledInMockModePage() {
  return (
    <AuthLayout>
      <AuthCard
        title="Sign-in uses Convex mode"
        description="This deployment is running in demo data mode, so account pages are turned off for the main app."
      >
        <div className="mb-6 space-y-3 rounded-lg border border-border-subtle bg-bg-elevated/60 px-3 py-3 text-left text-sm text-text-secondary">
          <p>
            <strong className="text-text-primary">Share the product:</strong> send people to{' '}
            <code className="rounded bg-bg-app px-1.5 py-0.5 text-xs text-text-primary">/demo</code> — they can
            explore the workspace without signing in.
          </p>
          <p>
            <strong className="text-text-primary">Enable real accounts:</strong> set{' '}
            <code className="rounded bg-bg-app px-1.5 py-0.5 text-xs">VITE_DEAL_DATA_SOURCE=convex</code> and your{' '}
            <code className="rounded bg-bg-app px-1.5 py-0.5 text-xs">VITE_CONVEX_URL</code> in Vercel (or{' '}
            <code className="rounded bg-bg-app px-1.5 py-0.5 text-xs">.env</code>), then redeploy. After that,{' '}
            <code className="rounded bg-bg-app px-1.5 py-0.5 text-xs">/login</code> and{' '}
            <code className="rounded bg-bg-app px-1.5 py-0.5 text-xs">/signup</code> will work.
          </p>
        </div>

        <Button type="button" variant="accent" asChild className="w-full">
          <Link to="/demo">Open demo workspace</Link>
        </Button>
        <Button type="button" variant="secondary" asChild className="mt-3 w-full">
          <Link to="/">Back to home</Link>
        </Button>
      </AuthCard>
    </AuthLayout>
  );
}
