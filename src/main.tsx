import React from 'react';
import ReactDOM from 'react-dom/client';
import { ErrorBoundary } from 'react-error-boundary';
import App from './App.tsx';
import './index.css';
import NotFound from './pages/notFound/notFound.router.tsx';
import { Provider } from 'react-redux';
import { store } from './store/store.ts';
import { hydrateAuth } from './redux/authSlice'
import { Toaster } from './components/dashboard/ui/sonner';

store.dispatch(hydrateAuth())
ReactDOM.createRoot(
  document.getElementById('root')!
).render(
  <React.StrictMode>
    <ErrorBoundary FallbackComponent={NotFound}>
      <Provider store={store}>
        <App />
        <Toaster position="top-right" richColors closeButton />
      </Provider>
    </ErrorBoundary>
  </React.StrictMode>
);
