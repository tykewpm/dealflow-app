import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { ThemeProvider } from 'next-themes';
import 'sonner/dist/styles.css';
import App from './app/App';
import { ConvexGate } from './main/ConvexGate';
import { AppToaster } from './main/AppToaster';
import './styles/index.css';

createRoot(document.getElementById('root')!).render(
  <ThemeProvider attribute="class" defaultTheme="system" enableSystem storageKey="transactq-theme">
    {/*
      Plain BrowserRouter — no `basename` unless the whole app is served from a subpath
      (e.g. https://example.com/my-app/). Vercel root deploys use `/`.
    */}
    <BrowserRouter>
      <ConvexGate>
        <App />
        <AppToaster />
      </ConvexGate>
    </BrowserRouter>
  </ThemeProvider>,
);
