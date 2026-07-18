import { expect, test, type Page } from '@playwright/test';

const asset = {
  id: 'asset-kente-1',
  title: 'Woven Kente Textile',
  displayTitle: 'Woven Kente Textile',
  type: 'PHOTO',
  format: 'JPG',
  size: '1.2 MB',
  date: '2026-07-01T00:00:00.000Z',
  owner: 'Ama Serwaa',
  creatorId: 'creator-1',
  visual: 'visual-kente',
  tags: ['Kente', 'Textile'],
  src: null,
  likes: 12,
  downloads: 30,
  premium: false,
  aiInsight: 'A colourful woven Ghanaian textile.',
  relevance: 0.98,
};

async function mockPublicApi(page: Page): Promise<void> {
  await page.route('**/api/**', async (route) => {
    const url = new URL(route.request().url());
    let body: unknown;

    if (url.pathname === '/api/assets/stats') {
      body = { total: 1, creators: 1, downloads: 30, byType: [{ type: 'PHOTO', count: 1 }] };
    } else if (url.pathname === '/api/collections/public') {
      body = { items: [] };
    } else if (url.pathname === '/api/creators') {
      body = { items: [], page: 1, pageSize: 12, total: 0, hasMore: false };
    } else if (url.pathname === '/api/assets/search') {
      body = { items: [asset], page: 1, pageSize: 24, total: 1, hasMore: false, mode: 'text' };
    } else if (url.pathname === '/api/assets') {
      body = { items: [asset], page: 1, pageSize: 12, total: 1, hasMore: false };
    } else {
      return route.continue();
    }

    await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(body) });
  });
}

test('loads the public catalogue and submits a search', async ({ page }) => {
  await mockPublicApi(page);
  await page.goto('/');

  await expect(page.getByRole('heading', { name: /All the assets your creative work needs/i })).toBeVisible();
  await expect(page.getByText('Woven Kente Textile').first()).toBeVisible();
  await expect(page.getByText('1', { exact: true }).first()).toBeVisible();

  await page.getByLabel('Search assets').fill('kente');
  await page.getByRole('button', { name: 'Search' }).click();
  await expect(page).toHaveURL(/\/search\?q=kente$/);
  await expect(page.getByRole('heading', { name: /results for.+kente/i })).toBeVisible();
});

test('applies search filters through the URL and API request', async ({ page }) => {
  await mockPublicApi(page);
  const filteredRequest = page.waitForRequest((request) => {
    const url = new URL(request.url());
    return url.pathname === '/api/assets/search' && url.searchParams.get('type') === 'PHOTO';
  });

  await page.goto('/search?q=kente');
  await page.getByLabel('Asset type').selectOption('PHOTO');
  await filteredRequest;

  await expect(page).toHaveURL(/type=PHOTO/);
  await expect(page.getByText('Woven Kente Textile').first()).toBeVisible();
});

test('redirects protected pages to sign in', async ({ page }) => {
  await page.goto('/library');

  await expect(page).toHaveURL(/\/login$/);
  await expect(page.getByRole('heading', { name: 'Your creative library, intelligently organised.' })).toBeVisible();
  await expect(page.getByRole('button', { name: 'Sign in' })).toBeVisible();
});

test('loads the account creation form', async ({ page }) => {
  await page.goto('/signup');

  await expect(page.getByRole('heading', { name: 'Build your creative library, one upload at a time.' })).toBeVisible();
  await expect(page.getByRole('button', { name: 'Create account' })).toBeVisible();
});
