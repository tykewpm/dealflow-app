import { Eye, EyeOff } from 'lucide-react';
import { useState, type InputHTMLAttributes } from 'react';
import { authLabelClass, authPasswordControlClass } from './authFormClasses';
import { cn } from '../ui/utils';

type Props = {
  label: string;
  id: string;
} & Omit<InputHTMLAttributes<HTMLInputElement>, 'type' | 'className'>;

export function AuthPasswordField({ label, id, disabled, ...inputProps }: Props) {
  const [visible, setVisible] = useState(false);

  return (
    <div>
      <label htmlFor={id} className={authLabelClass}>
        {label}
      </label>
      <div className="relative mt-1">
        <input
          id={id}
          type={visible ? 'text' : 'password'}
          disabled={disabled}
          className={cn(authPasswordControlClass)}
          {...inputProps}
        />
        <button
          type="button"
          className="absolute right-1 top-1/2 flex size-9 -translate-y-1/2 items-center justify-center rounded-lg text-text-muted transition-[color,background-color] hover:bg-bg-elevated hover:text-text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-blue/25 disabled:pointer-events-none disabled:opacity-50"
          onClick={() => setVisible((v) => !v)}
          aria-label={visible ? 'Hide password' : 'Show password'}
          aria-controls={id}
          aria-pressed={visible}
          disabled={disabled}
        >
          {visible ? <EyeOff className="size-4 shrink-0" aria-hidden /> : <Eye className="size-4 shrink-0" aria-hidden />}
        </button>
      </div>
    </div>
  );
}
