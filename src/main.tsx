import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { RouterProvider } from 'react-router-dom';
import { router } from './routes/router';
import './styles.css';
import './styles-day1.css';
import './styles-day2.css';
import './styles-day3.css';
import './styles-day4.css';
import './styles-day5.css';
import './styles-day6.css';
import './styles-day8.css';
import { useAuth } from './stores/auth';
import { useFavorites } from './stores/favorites';
import { useLibrary } from './stores/library';
import { useCollections } from './stores/collections';
import { useNotifications } from './stores/notifications';
import { SESSION_EXPIRED_EVENT } from './lib/api';

const hydrateUserData = async (): Promise<void> => {
  await Promise.allSettled([
    useFavorites.getState().hydrate(),
    useLibrary.getState().hydrate(),
    useCollections.getState().hydrate(),
    useNotifications.getState().hydrate(),
  ]);
};

let activeUserId: string | null = null;
useAuth.subscribe((state) => {
  const nextId = state.user?.id ?? null;
  if (nextId === activeUserId) return;
  activeUserId = nextId;
  if (nextId) {
    void hydrateUserData();
  } else {
    useFavorites.getState().clear();
    useLibrary.getState().clear();
    useCollections.getState().clear();
    useNotifications.getState().clear();
  }
});
void useAuth.getState().restore();
window.addEventListener(SESSION_EXPIRED_EVENT, () => {
  useAuth.getState().expire();
  if (window.location.pathname !== '/login') {
    const from = `${window.location.pathname}${window.location.search}`;
    window.location.assign(`/login?from=${encodeURIComponent(from)}`);
  }
});

const rootElement: HTMLElement | null = document.getElementById('root');

if (!rootElement) {
  throw new Error(
    'Root element with id "root" was not found in the document. ' +
      'Ensure index.html contains <div id="root"></div>.',
  );
}

createRoot(rootElement).render(
  <StrictMode>
    <RouterProvider router={router} />
  </StrictMode>,
);
