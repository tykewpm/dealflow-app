export type AuthErrorMode = 'login' | 'signup' | 'forgot';

function collectErrorText(err: unknown): string {
  if (typeof err === 'string') {
    return err;
  }
  if (err instanceof Error) {
    const parts = [err.message];
    if (err.cause instanceof Error) {
      parts.push(err.cause.message);
    }
    const data = (err as Error & { data?: unknown }).data;
    if (data !== undefined) {
      try {
        parts.push(typeof data === 'string' ? data : JSON.stringify(data));
      } catch {
        parts.push(String(data));
      }
    }
    return parts.filter(Boolean).join(' ');
  }
  if (err && typeof err === 'object' && 'message' in err && typeof (err as { message: unknown }).message === 'string') {
    return (err as { message: string }).message;
  }
  try {
    return JSON.stringify(err);
  } catch {
    return String(err);
  }
}

/**
 * Maps Convex Auth / network errors to user-safe copy. Never pass through raw stack traces.
 */
export function mapAuthErrorToMessage(err: unknown, mode: AuthErrorMode): string {
  const raw = collectErrorText(err);
  const lower = raw.toLowerCase();

  if (mode === 'login') {
    if (
      lower.includes('invalidsecret') ||
      lower.includes('retrieveaccount') ||
      lower.includes('invalid credentials') ||
      lower.includes('invalid credential') ||
      (lower.includes('credential') && lower.includes('invalid'))
    ) {
      return 'Invalid email or password.';
    }
    if (
      lower.includes('rate limit') ||
      lower.includes('too many') ||
      lower.includes('429') ||
      lower.includes('throttl')
    ) {
      return 'Too many attempts. Please wait a moment and try again.';
    }
    if (
      lower.includes('network') ||
      lower.includes('failed to fetch') ||
      lower.includes('load failed') ||
      lower.includes('econnrefused') ||
      lower.includes('convex') && lower.includes('unavailable')
    ) {
      return "We couldn’t sign you in. Please try again.";
    }
    return "We couldn’t sign you in. Please try again.";
  }

  if (mode === 'signup') {
    if (
      lower.includes('already') ||
      lower.includes('exists') ||
      lower.includes('useralready') ||
      lower.includes('duplicate') ||
      lower.includes('unique constraint')
    ) {
      return 'An account already exists with this email. Sign in instead.';
    }
    if (
      lower.includes('invalid password') ||
      lower.includes('password') && (lower.includes('weak') || lower.includes('short') || lower.includes('too short')) ||
      lower.includes('password') && lower.includes('requirement')
    ) {
      return 'Use a stronger password.';
    }
    if (
      lower.includes('invalid email') ||
      lower.includes('email format') ||
      lower.includes('valid email')
    ) {
      return 'Enter a valid email address.';
    }
    return "We couldn’t create your account. Please try again.";
  }

  if (mode === 'forgot') {
    if (
      lower.includes('network') ||
      lower.includes('failed to fetch') ||
      lower.includes('load failed')
    ) {
      return "We couldn’t send that request. Please try again.";
    }
    return "We couldn’t send that request. Please try again.";
  }

  return "Something went wrong. Please try again.";
}
