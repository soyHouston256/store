const configuredApiUrl = import.meta.env.VITE_API_URL ?? ''

function defaultApiUrl(): string {
    if (typeof window === 'undefined') return ''

    const { hostname, protocol } = window.location
    if (hostname === 'devhaus.pe' || hostname === 'www.devhaus.pe') {
        return 'https://api.devhaus.pe'
    }
    if (hostname === 'devstore.maxflow.ink') {
        return 'https://api.devstore.maxflow.ink'
    }
    if (hostname.startsWith('admin.')) {
        return `${protocol}//api.${hostname.slice('admin.'.length)}`
    }

    return ''
}

export const API_URL: string = configuredApiUrl || defaultApiUrl()

interface ApiErrorEnvelope {
    error?: {
        code?: string;
        message?: string;
        details?: unknown;
    };
}

export class ApiError extends Error {
    readonly status: number;
    readonly code: string;
    readonly details?: unknown;

    constructor(status: number, code: string, message: string, details?: unknown) {
        super(message)
        this.name = 'ApiError'
        this.status = status
        this.code = code
        this.details = details
    }
}

/** Prefix API-relative paths (e.g. "/uploads/x.png") with the API origin. */
export const assetUrl = (path?: string): string | undefined => {
    if (!path) return undefined
    return path.startsWith('/') ? `${API_URL}${path}` : path
}

export async function request<T>(path: string, init?: RequestInit): Promise<T> {
    const res = await fetch(`${API_URL}${path}`, {
        ...init,
        headers: {
            'Content-Type': 'application/json',
            ...(init?.headers ?? {}),
        },
    })

    if (!res.ok) {
        let envelope: ApiErrorEnvelope | undefined
        try {
            envelope = await res.json()
        } catch {
            // non-JSON error body — fall through to generic error
        }
        const error = envelope?.error
        throw new ApiError(
            res.status,
            error?.code ?? 'UNKNOWN',
            error?.message ?? `Request failed with status ${res.status}`,
            error?.details
        )
    }

    if (res.status === 204) return undefined as unknown as T
    return res.json() as Promise<T>
}
