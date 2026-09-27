import { request } from './http'

// Libro de Reclamaciones — cliente de `POST /api/complaints` (spec R2b.2,
// campos según conciliación C4). El servidor genera `code` (correlativo
// LR-YYYY-000001), `status` y `emailSent`; el cliente nunca los envía.

export type DocType = 'DNI' | 'CE' | 'PASAPORTE'
export type ItemKind = 'producto' | 'servicio'
export type ClaimType = 'reclamo' | 'queja'

export const DOC_TYPES: DocType[] = ['DNI', 'CE', 'PASAPORTE']
export const DOC_TYPE_LABELS: Record<DocType, string> = {
    DNI: 'DNI',
    CE: 'Carné de extranjería',
    PASAPORTE: 'Pasaporte'
}

export interface ComplaintCreateDTO {
    consumer: {
        name: string
        docType: DocType
        docNumber: string
        email: string
        phone: string
        address: string
        isMinor: boolean
    }
    guardianName?: string
    item: {
        kind: ItemKind
        description: string
        amount?: number
    }
    claim: {
        type: ClaimType
        detail: string
        request: string
    }
    orderId?: string
    acceptsTerms: true
}

export interface ComplaintCreatedDTO {
    id: string
    /** Correlativo `LR-2026-000001`: es la constancia que ve el consumidor. */
    code: string
    createdAt: string
    /** `false` cuando el servidor no tiene SMTP configurado o el envío falló. */
    emailSent: boolean
}

export function createComplaint(body: ComplaintCreateDTO): Promise<ComplaintCreatedDTO> {
    return request<ComplaintCreatedDTO>('/api/complaints', {
        method: 'POST',
        body: JSON.stringify(body)
    })
}
