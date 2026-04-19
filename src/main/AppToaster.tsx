import { useTheme } from 'next-themes';
import { Toaster } from 'sonner';

export function AppToaster() {
  const { resolvedTheme } = useTheme();

  return (
    <Toaster
      position="bottom-center"
      richColors
      closeButton
      duration={4000}
      theme={(resolvedTheme ?? 'light') === 'dark' ? 'dark' : 'light'}
    />
  );
}
