import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import { resolveSiteUrl } from '../../app/_utils/siteUrl.ts';

describe('resolveSiteUrl', () => {
  it('normalizes the configured public site url to an origin', () => {
    assert.equal(resolveSiteUrl({ NEXT_PUBLIC_SITE_URL: 'https://until.example/path' }), 'https://until.example');
  });

  it('adds https to a bare host', () => {
    assert.equal(resolveSiteUrl({ NEXT_PUBLIC_SITE_URL: 'until.example' }), 'https://until.example');
  });

  it('prefers the public site url over deployment variables', () => {
    assert.equal(
      resolveSiteUrl({ NEXT_PUBLIC_SITE_URL: 'https://a.example', VERCEL_URL: 'b.example' }),
      'https://a.example',
    );
  });

  it('falls back to the Vercel production url, then the deployment url', () => {
    assert.equal(
      resolveSiteUrl({ VERCEL_PROJECT_PRODUCTION_URL: 'prod.example', VERCEL_URL: 'deploy.example' }),
      'https://prod.example',
    );
    assert.equal(resolveSiteUrl({ VERCEL_URL: 'deploy.example' }), 'https://deploy.example');
  });

  it('falls back to localhost when nothing is configured or the value is invalid', () => {
    assert.equal(resolveSiteUrl({}), 'http://localhost:3000');
    assert.equal(resolveSiteUrl({ NEXT_PUBLIC_SITE_URL: 'not a url' }), 'http://localhost:3000');
  });
});
