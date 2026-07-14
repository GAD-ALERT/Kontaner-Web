import { createBrowserRouter } from 'react-router-dom';
import App from '../App';
import { Discover } from '../pages/Discover';
import { Login } from '../pages/Login';
import { Signup } from '../pages/Signup';
import { Forgot } from '../pages/Forgot';
import { ResetPassword } from '../pages/ResetPassword';
import { SearchResults } from '../pages/SearchResults';
import { AssetDetails } from '../pages/AssetDetails';
import { MyLibrary } from '../pages/MyLibrary';
import { Collections } from '../pages/Collections';
import { CollectionDetail } from '../pages/CollectionDetail';
import { LegalPage } from '../pages/LegalPage';
import { Upload } from '../pages/Upload';
import { AccountSettings } from '../pages/AccountSettings';
import { ProtectedRoute } from './ProtectedRoute';

export const router = createBrowserRouter([
  {
    path: '/',
    element: <App />,
    children: [
      { index: true, element: <Discover /> },
      { path: 'search', element: <SearchResults /> },
      { path: 'asset/:id', element: <AssetDetails /> },
      { path: 'legal/:slug', element: <LegalPage /> },
      {
        path: 'library',
        element: (
          <ProtectedRoute>
            <MyLibrary />
          </ProtectedRoute>
        ),
      },
      {
        path: 'collections',
        element: (
          <ProtectedRoute>
            <Collections />
          </ProtectedRoute>
        ),
      },
      {
        path: 'collection/:id',
        element: (
          <ProtectedRoute>
            <CollectionDetail />
          </ProtectedRoute>
        ),
      },
      {
        path: 'upload',
        element: (
          <ProtectedRoute>
            <Upload />
          </ProtectedRoute>
        ),
      },
      {
        path: 'settings',
        element: (
          <ProtectedRoute>
            <AccountSettings />
          </ProtectedRoute>
        ),
      },
    ],
  },
  { path: '/login', element: <Login /> },
  { path: '/signup', element: <Signup /> },
  { path: '/forgot', element: <Forgot /> },
  { path: '/reset-password', element: <ResetPassword /> },
]);
