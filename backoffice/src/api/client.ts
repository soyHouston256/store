import { clearToken, getToken } from '../auth/token';
import { redirectToLogin } from '../auth/redirect';
import type { FieldError, OrderDTO, OrderStatus, ProductDTO, ProductWriteDTO } from './types';

const configuredApiUrl = import.meta.env.VITE_API_URL ?? '';

function defaultApiUrl(): string {
  if (typeof window === 'undefined') return '';

  const { hostname, protocol } = window.location;
  if (hostname === 'admin.devhaus.pe') return 'https://api.devhaus.pe';
  if (hostname === 'admin.devstore.maxflow.ink') return 'https://api.devstore.maxflow.ink';
  if (hostname.startsWith('admin.')) return `${protocol}//api.${hostname.slice('admin.'.length)}`;

  return '';
}

export const API_URL: string = configuredApiUrl || defaultApiUrl();

export class ApiError extends Error {
  readonly status: number;
  readonly code: string;
  readonly details?: FieldError[];

  constructor(status: number, code: string, message: string, details?: FieldError[]) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.code = code;
    this.details = details;
  }
}

interface RequestOptions {
  method?: string;
  body?: unknown;
  /** default true — inject Bearer token and hard-redirect to /login on 401 */
  auth?: boolean;
}

async function parseError(res: Response): Promise<ApiError> {
  let code = 'INTERNAL';
  let message = `Request failed (${res.status})`;
  let details: FieldError[] | undefined;
  try {
    const body = (await res.json()) as {
      error?: { code?: string; message?: string; details?: FieldError[] };
    };
    if (body?.error) {
      code = body.error.code ?? code;
      message = body.error.message ?? message;
      details = body.error.details;
    }
  } catch {
    // non-JSON error body — keep the generic message
  }
  return new ApiError(res.status, code, message, details);
}

export async function request<T>(path: string, options: RequestOptions = {}): Promise<T> {
  const { method = 'GET', body, auth = true } = options;

  const headers: Record<string, string> = {};
  const isFormData = typeof FormData !== 'undefined' && body instanceof FormData;
  if (body !== undefined && !isFormData) headers['Content-Type'] = 'application/json';
  if (auth) {
    const token = getToken();
    if (token) headers['Authorization'] = `Bearer ${token}`;
  }

  const res = await fetch(`${API_URL}${path}`, {
    method,
    headers,
    body: body === undefined ? undefined : isFormData ? body : JSON.stringify(body),
  });

  if (res.status === 401 && auth) {
    clearToken();
    redirectToLogin(window.location.pathname + window.location.search);
    throw await parseError(res);
  }
  if (!res.ok) throw await parseError(res);
  if (res.status === 204) return undefined as T;
  return (await res.json()) as T;
}

// ---- typed endpoints ----

export function login(username: string, password: string) {
  return request<{ token: string; expiresIn: string }>('/api/auth/login', {
    method: 'POST',
    body: { username, password },
    auth: false,
  });
}

export function listProducts() {
  return request<ProductDTO[]>('/api/admin/products');
}

export function getProduct(id: string) {
  return request<ProductDTO>(`/api/admin/products/${encodeURIComponent(id)}`);
}

export function createProduct(data: ProductWriteDTO) {
  return request<ProductDTO>('/api/admin/products', { method: 'POST', body: data });
}

export function updateProduct(id: string, data: ProductWriteDTO) {
  return request<ProductDTO>(`/api/admin/products/${encodeURIComponent(id)}`, {
    method: 'PUT',
    body: data,
  });
}

export function deleteProduct(id: string) {
  return request<void>(`/api/admin/products/${encodeURIComponent(id)}`, { method: 'DELETE' });
}

export function setPublished(id: string, published: boolean) {
  return request<ProductDTO>(`/api/admin/products/${encodeURIComponent(id)}/publish`, {
    method: 'PATCH',
    body: { published },
  });
}

export function uploadLogo(id: string, file: File) {
  const form = new FormData();
  form.append('logo', file); // multipart field name is exactly "logo"
  return request<ProductDTO>(`/api/admin/products/${encodeURIComponent(id)}/logo`, {
    method: 'POST',
    body: form,
  });
}

export function listOrders(status?: OrderStatus) {
  const query = status ? `?status=${encodeURIComponent(status)}` : '';
  return request<OrderDTO[]>(`/api/admin/orders${query}`);
}

export function getOrder(id: string) {
  return request<OrderDTO>(`/api/admin/orders/${encodeURIComponent(id)}`);
}

export function updateOrderStatus(id: string, status: OrderStatus) {
  return request<OrderDTO>(`/api/admin/orders/${encodeURIComponent(id)}/status`, {
    method: 'PATCH',
    body: { status },
  });
}

/** logo/image URLs from the API are relative — prefix with the API origin. */
export function assetUrl(path: string): string {
  return /^https?:\/\//.test(path) ? path : `${API_URL}${path}`;
}
