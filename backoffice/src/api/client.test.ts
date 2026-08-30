import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { ApiError, listProducts, login, request } from './client';
import { redirectToLogin } from '../auth/redirect';
import { errorEnvelope, jsonResponse, makeToken } from '../test/utils';

vi.mock('../auth/redirect', () => ({ redirectToLogin: vi.fn() }));

const fetchMock = vi.fn();

describe('api client', () => {
  beforeEach(() => {
    vi.stubGlobal('fetch', fetchMock);
  });

  afterEach(() => {
    vi.unstubAllGlobals();
    vi.clearAllMocks();
    localStorage.clear();
  });

  it('injects the Bearer token and returns parsed JSON', async () => {
    const token = makeToken(3600);
    localStorage.setItem('bo_token', token);
    fetchMock.mockResolvedValue(jsonResponse(200, [{ id: 'p1' }]));

    const result = await listProducts();

    expect(result).toEqual([{ id: 'p1' }]);
    const [url, init] = fetchMock.mock.calls[0] as [string, RequestInit];
    expect(url).toBe('http://api.test/api/admin/products');
    expect((init.headers as Record<string, string>)['Authorization']).toBe(`Bearer ${token}`);
  });

  it('on 401 clears the token, redirects to /login preserving from, and throws', async () => {
    localStorage.setItem('bo_token', makeToken(3600));
    fetchMock.mockResolvedValue(jsonResponse(401, errorEnvelope('UNAUTHORIZED', 'Unauthorized')));

    await expect(request('/api/admin/products')).rejects.toMatchObject({
      status: 401,
      code: 'UNAUTHORIZED',
    });

    expect(localStorage.getItem('bo_token')).toBeNull();
    expect(redirectToLogin).toHaveBeenCalledWith('/');
  });

  it('does NOT redirect on 401 from the login endpoint itself', async () => {
    fetchMock.mockResolvedValue(
      jsonResponse(401, errorEnvelope('UNAUTHORIZED', 'Invalid credentials')),
    );

    await expect(login('admin', 'wrong')).rejects.toBeInstanceOf(ApiError);
    expect(redirectToLogin).not.toHaveBeenCalled();
  });

  it('parses the error envelope details on 400', async () => {
    localStorage.setItem('bo_token', makeToken(3600));
    fetchMock.mockResolvedValue(
      jsonResponse(
        400,
        errorEnvelope('VALIDATION', 'Invalid request', [
          { field: 'colors.0', message: 'Invalid color' },
        ]),
      ),
    );

    const err = await request('/api/admin/products', { method: 'POST', body: {} }).catch(
      (e: unknown) => e,
    );

    expect(err).toBeInstanceOf(ApiError);
    expect((err as ApiError).code).toBe('VALIDATION');
    expect((err as ApiError).details).toEqual([{ field: 'colors.0', message: 'Invalid color' }]);
  });
});
