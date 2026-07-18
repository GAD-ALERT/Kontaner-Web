/* eslint-disable react-refresh/only-export-components -- this module exports router configuration, not a refreshable component */
import { lazy, Suspense, type ReactNode } from 'react';
import { createBrowserRouter } from 'react-router-dom';
import App from '../App';
import { ProtectedRoute } from './ProtectedRoute';

const Discover = lazy(() => import('../pages/Discover').then((module) => ({ default: module.Discover })));
const Login = lazy(() => import('../pages/Login').then((module) => ({ default: module.Login })));
const Signup = lazy(() => import('../pages/Signup').then((module) => ({ default: module.Signup })));
const Forgot = lazy(() => import('../pages/Forgot').then((module) => ({ default: module.Forgot })));
const ResetPassword = lazy(() => import('../pages/ResetPassword').then((module) => ({ default: module.ResetPassword })));
const SearchResults = lazy(() => import('../pages/SearchResults').then((module) => ({ default: module.SearchResults })));
const AssetDetails = lazy(() => import('../pages/AssetDetails').then((module) => ({ default: module.AssetDetails })));
const MyLibrary = lazy(() => import('../pages/MyLibrary').then((module) => ({ default: module.MyLibrary })));
const Collections = lazy(() => import('../pages/Collections').then((module) => ({ default: module.Collections })));
const CollectionDetail = lazy(() => import('../pages/CollectionDetail').then((module) => ({ default: module.CollectionDetail })));
const LegalPage = lazy(() => import('../pages/LegalPage').then((module) => ({ default: module.LegalPage })));
const Upload = lazy(() => import('../pages/Upload').then((module) => ({ default: module.Upload })));
const AccountSettings = lazy(() => import('../pages/AccountSettings').then((module) => ({ default: module.AccountSettings })));
const CreatorProfile = lazy(() => import('../pages/CreatorProfile').then((module) => ({ default: module.CreatorProfile })));
const PublicCollection = lazy(() => import('../pages/PublicCollection').then((module) => ({ default: module.PublicCollection })));

const loadingFallback = <div className="page browse-empty" role="status">Loading page…</div>;
const page = (content: ReactNode) => <Suspense fallback={loadingFallback}>{content}</Suspense>;
const protectedPage = (content: ReactNode) => <ProtectedRoute>{page(content)}</ProtectedRoute>;

export const router = createBrowserRouter([
  {
    path: '/',
    element: <App />,
    children: [
      { index: true, element: page(<Discover />) },
      { path: 'search', element: page(<SearchResults />) },
      { path: 'asset/:id', element: page(<AssetDetails />) },
      { path: 'legal/:slug', element: page(<LegalPage />) },
      { path: 'creator/:id', element: page(<CreatorProfile />) },
      { path: 'public-collection/:id', element: page(<PublicCollection />) },
      { path: 'library', element: protectedPage(<MyLibrary />) },
      { path: 'collections', element: protectedPage(<Collections />) },
      { path: 'collection/:id', element: protectedPage(<CollectionDetail />) },
      { path: 'upload', element: protectedPage(<Upload />) },
      { path: 'settings', element: protectedPage(<AccountSettings />) },
    ],
  },
  { path: '/login', element: page(<Login />) },
  { path: '/signup', element: page(<Signup />) },
  { path: '/forgot', element: page(<Forgot />) },
  { path: '/reset-password', element: page(<ResetPassword />) },
]);
