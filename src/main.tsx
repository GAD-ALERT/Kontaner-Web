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
