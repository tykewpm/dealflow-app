import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { ThemeProvider } from 'next-themes';
import 'sonner/dist/styles.css';
import App from './app/App.tsx';
import { ConvexGate } from './main/ConvexGate.tsx';
import { AppToaster } from './main/AppToaster.tsx';
import './styles/index.css';

createRoot(document.getElementById('root')!).render(
  <ThemeProvider attribute="class" defaultTheme="system" enableSystem storageKey="transactq-theme">
    <BrowserRouter>
      <ConvexGate>
        <App />
        <AppToaster />
      </ConvexGate>
    </BrowserRouter>
  </ThemeProvider>,
);
