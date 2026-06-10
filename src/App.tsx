import { useEffect, useMemo, useState, type JSX } from 'react';
import { Layout } from './components/Layout';
import { Login } from './pages/Login';
import { Discover } from './pages/Discover';
import { MyLibrary } from './pages/MyLibrary';
import { SearchResults } from './pages/SearchResults';
import { Upload } from './pages/Upload';
import { AssetDetails } from './pages/AssetDetails';
import { Collections } from './pages/Collections';
import { AccountSettings } from './pages/AccountSettings';
import type { NavigateFn, Route } from './types';

const DEFAULT_ROUTE: Route = '/discover';

interface ParsedRoute {
  path: string;
  params: URLSearchParams;
}

function readRoute(): string {
  const hash = window.location.hash.replace(/^#/, '');
  return hash || DEFAULT_ROUTE;
}

function splitRoute(route: string): ParsedRoute {
  const [path, query = ''] = route.split('?');
  return { path, params: new URLSearchParams(query) };
}

export default function App(): JSX.Element {
  const [route, setRoute] = useState<string>(readRoute);

  useEffect(() => {
    const onHashChange = (): void => setRoute(readRoute());
    window.addEventListener('hashchange', onHashChange);
    return () => window.removeEventListener('hashchange', onHashChange);
  }, []);

  const { path, params } = useMemo<ParsedRoute>(() => splitRoute(route), [route]);

  const navigate: NavigateFn = (nextRoute) => {
    window.location.hash = nextRoute;
    setRoute(nextRoute);
  };

  if (path === '/login') {
    return <Login navigate={navigate} />;
  }

  const page = ((): JSX.Element => {
    switch (path) {
      case '/library':
        return <MyLibrary navigate={navigate} />;
      case '/search':
        return (
          <SearchResults
            query={params.get('query') ?? 'market woman'}
            navigate={navigate}
          />
        );
      case '/upload':
        return <Upload />;
      case '/collections':
        return <Collections />;
      case '/asset':
        return <AssetDetails navigate={navigate} />;
      case '/settings':
        return <AccountSettings />;
      case '/discover':
      default:
        return <Discover navigate={navigate} />;
    }
  })();

  return (
    <Layout activeRoute={path} navigate={navigate}>
      {page}
    </Layout>
  );
}
