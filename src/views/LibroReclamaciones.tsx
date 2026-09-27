import Container from '@/components/layout/Container'
import { isConfigured, site } from '@/config/site'
import {
    ClaimType,
    ComplaintCreateDTO,
    ComplaintCreatedDTO,
    DOC_TYPES,
    DOC_TYPE_LABELS,
    DocType,
    ItemKind,
    createComplaint
} from '@/data/ComplaintApi'
import { ApiError } from '@/data/http'
import { ChangeEvent, FormEvent, ReactNode, useEffect, useRef, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import styled from 'styled-components'

// Libro de Reclamaciones virtual (spec R2b.4 / design §5.5 / handoff 01 §Libro).
//
// - Validación en cliente equivalente a la del servidor (conciliación C4);
//   los errores 400 del API se mapean por `field` ('consumer.name', …).
// - Los datos de negocio (razón social, RUC, plazo de respuesta) salen SOLO de
//   site.ts y se ocultan con `isConfigured` (⚠05). Nunca se inventan.
// - Sin `alert`/`confirm`: el éxito reemplaza el formulario por la constancia
//   con el `code`; con `emailSent:false` se omite "te enviamos una copia".

const DEFAULT_TITLE = 'devhaus.pe — Polos y accesorios para developers'
const ORDER_ID_PATTERN = /^[A-Z0-9]{8}$/
const DOC_NUMBER_PATTERN = /^[A-Za-z0-9]{6,20}$/
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

interface FormValues {
    name: string
    docType: DocType
    docNumber: string
    email: string
    phone: string
    address: string
    isMinor: boolean
    guardianName: string
    kind: ItemKind
    description: string
    amount: string
    orderId: string
    type: ClaimType
    detail: string
    request: string
    acceptsTerms: boolean
}

type FieldName = keyof FormValues
type FormErrors = Partial<Record<FieldName, string>>

const EMPTY: FormValues = {
    name: '',
    docType: 'DNI',
    docNumber: '',
    email: '',
    phone: '',
    address: '',
    isMinor: false,
    guardianName: '',
    kind: 'producto',
    description: '',
    amount: '',
    orderId: '',
    type: 'reclamo',
    detail: '',
    request: '',
    acceptsTerms: false
}

/** Rutas del `details[].field` del API → campo del formulario. */
const API_FIELD_TO_FORM: Record<string, FieldName> = {
    'consumer.name': 'name',
    'consumer.docType': 'docType',
    'consumer.docNumber': 'docNumber',
    'consumer.email': 'email',
    'consumer.phone': 'phone',
    'consumer.address': 'address',
    'consumer.isMinor': 'isMinor',
    guardianName: 'guardianName',
    'item.kind': 'kind',
    'item.description': 'description',
    'item.amount': 'amount',
    orderId: 'orderId',
    'claim.type': 'type',
    'claim.detail': 'detail',
    'claim.request': 'request',
    acceptsTerms: 'acceptsTerms'
}

const FIELD_ORDER: FieldName[] = [
    'name', 'docType', 'docNumber', 'email', 'phone', 'address', 'isMinor', 'guardianName',
    'kind', 'description', 'amount', 'orderId', 'type', 'detail', 'request', 'acceptsTerms'
]

const length = (value: string, min: number, max: number, label: string): string | undefined => {
    const size = value.trim().length
    if (size === 0) return `${label} es obligatorio`
    if (size < min) return `${label} debe tener al menos ${min} caracteres`
    if (size > max) return `${label} debe tener como máximo ${max} caracteres`
    return undefined
}

/** Reglas de la conciliación C4, en el mismo orden que el servidor. */
export function validateForm(values: FormValues): FormErrors {
    const errors: FormErrors = {}
    const set = (field: FieldName, message: string | undefined) => {
        if (message) errors[field] = message
    }
    set('name', length(values.name, 2, 120, 'El nombre'))
    if (!DOC_TYPES.includes(values.docType)) set('docType', 'Elige un tipo de documento')
    if (!DOC_NUMBER_PATTERN.test(values.docNumber.trim())) {
        set('docNumber', values.docNumber.trim() ? 'Usa de 6 a 20 letras o dígitos, sin espacios ni guiones' : 'El número de documento es obligatorio')
    }
    const email = values.email.trim()
    if (!email) set('email', 'El correo es obligatorio')
    else if (!EMAIL_PATTERN.test(email) || email.length > 120) set('email', 'Ingresa un correo válido')
    set('phone', length(values.phone, 6, 20, 'El teléfono'))
    set('address', length(values.address, 5, 200, 'El domicilio'))
    if (values.isMinor) set('guardianName', length(values.guardianName, 2, 120, 'El nombre del apoderado'))
    set('description', length(values.description, 3, 200, 'La descripción'))
    if (values.amount.trim() !== '') {
        const amount = Number(values.amount.replace(',', '.'))
        if (!Number.isFinite(amount)) set('amount', 'El monto debe ser un número')
        else if (amount < 0) set('amount', 'El monto no puede ser negativo')
    }
    const orderId = values.orderId.trim().toUpperCase()
    if (orderId && !ORDER_ID_PATTERN.test(orderId)) set('orderId', 'El código de pedido tiene 8 letras o dígitos (ej. A1B2C3D4)')
    set('detail', length(values.detail, 20, 2000, 'El detalle'))
    set('request', length(values.request, 5, 1000, 'Tu pedido'))
    if (!values.acceptsTerms) set('acceptsTerms', 'Debes declarar que la información es veraz')
    return errors
}

export function toPayload(values: FormValues): ComplaintCreateDTO {
    const amount = values.amount.trim() === '' ? undefined : Number(values.amount.replace(',', '.'))
    const orderId = values.orderId.trim().toUpperCase()
    return {
        consumer: {
            name: values.name.trim(),
            docType: values.docType,
            docNumber: values.docNumber.trim(),
            email: values.email.trim(),
            phone: values.phone.trim(),
            address: values.address.trim(),
            isMinor: values.isMinor
        },
        ...(values.isMinor && values.guardianName.trim() ? { guardianName: values.guardianName.trim() } : {}),
        item: {
            kind: values.kind,
            description: values.description.trim(),
            ...(amount !== undefined ? { amount } : {})
        },
        claim: {
            type: values.type,
            detail: values.detail.trim(),
            request: values.request.trim()
        },
        ...(orderId ? { orderId } : {}),
        acceptsTerms: true
    }
}

const Page = styled(Container)`
    padding-top: 48px;
    padding-bottom: 64px;
    color: var(--dh-ink);
    .page_header {
        max-width: 760px;
        margin-bottom: 36px;
        h1 {
            margin: 0;
            font-family: var(--dh-font-display);
            font-size: var(--dh-text-h2);
            font-weight: 800;
            letter-spacing: -0.02em;
            line-height: 1.1;
        }
        .intro {
            margin: 12px 0 0;
            font-size: 16px;
            line-height: 1.55;
            color: var(--dh-muted);
        }
        .legal_entity {
            margin: 12px 0 0;
            font-family: var(--dh-font-mono);
            font-size: 13px;
            color: var(--dh-ink-2);
        }
        .response_days {
            margin: 8px 0 0;
            font-size: 14px;
            color: var(--dh-ink-2);
        }
    }
    .definitions {
        max-width: 760px;
        margin: 0 0 32px;
        padding: 16px 20px;
        border-radius: var(--dh-radius-md);
        background: var(--dh-sand);
        display: grid;
        gap: 8px;
        font-size: 14px;
        line-height: 1.5;
        color: var(--dh-ink-2);
        p { margin: 0; }
        strong { color: var(--dh-ink); }
    }
    @media screen and (max-width: 640px) {
        padding-top: 32px;
        padding-bottom: 48px;
        .page_header {
            margin-bottom: 28px;
            h1 { font-size: 32px; }
        }
    }
`

const Form = styled.form`
    max-width: 760px;
    display: flex;
    flex-direction: column;
    gap: 36px;
    fieldset {
        margin: 0;
        padding: 0;
        border: none;
        min-width: 0;
        display: grid;
        grid-template-columns: repeat(2, minmax(0, 1fr));
        gap: 18px 20px;
    }
    legend {
        float: left; /* legend fuera del flujo del grid */
        width: 100%;
        margin: 0 0 16px;
        padding: 0;
        font-family: var(--dh-font-display);
        font-size: var(--dh-text-h3);
        font-weight: 700;
        letter-spacing: -0.01em;
        + * { clear: both; }
    }
    .span_2 { grid-column: 1 / -1; }
    .field {
        display: flex;
        flex-direction: column;
        gap: 6px;
        min-width: 0;
        label, .field_label {
            font-size: 14px;
            font-weight: 600;
            color: var(--dh-ink);
        }
        .optional {
            font-weight: 400;
            color: var(--dh-muted);
        }
        input[type="text"], input[type="email"], input[type="tel"], input[type="number"], select, textarea {
            width: 100%;
            box-sizing: border-box;
            min-height: var(--dh-control-h);
            padding: 10px 14px;
            border-radius: var(--dh-radius-sm);
            border: 1px solid var(--dh-line-2);
            background: var(--dh-surface);
            color: var(--dh-ink);
            font: inherit;
            font-size: 15px;
            &:focus-visible {
                outline: 2px solid var(--dh-ink);
                outline-offset: 1px;
            }
            &[aria-invalid="true"] {
                border-color: var(--dh-accent);
            }
        }
        textarea {
            min-height: 132px;
            resize: vertical;
            line-height: 1.5;
        }
        .hint {
            font-size: 13px;
            color: var(--dh-muted);
        }
        .field_error {
            margin: 0;
            font-size: 13px;
            font-weight: 500;
            color: var(--dh-accent);
        }
    }
    .choices {
        display: flex;
        flex-wrap: wrap;
        gap: 10px;
    }
    .choice {
        position: relative;
        display: inline-flex;
        align-items: center;
        gap: 10px;
        min-height: var(--dh-control-h);
        padding: 8px 16px;
        border-radius: var(--dh-radius-pill);
        border: 1px solid var(--dh-line-2);
        background: var(--dh-surface);
        cursor: pointer;
        font-size: 15px;
        font-weight: 500;
        color: var(--dh-ink);
        input {
            position: absolute;
            opacity: 0;
            width: 1px;
            height: 1px;
            margin: 0;
        }
        &::before {
            content: '';
            width: 16px;
            height: 16px;
            border-radius: 50%;
            border: 2px solid var(--dh-line-2);
            box-sizing: border-box;
            flex: none;
        }
        &.checked {
            background: var(--dh-ink);
            color: var(--dh-on-dark);
            border-color: var(--dh-ink);
            &::before {
                border-color: var(--dh-yellow);
                background: var(--dh-yellow);
                box-shadow: inset 0 0 0 3px var(--dh-ink);
            }
        }
        &:focus-within {
            outline: 2px solid var(--dh-ink);
            outline-offset: 2px;
        }
    }
    .checkbox {
        display: flex;
        align-items: flex-start;
        gap: 12px;
        font-size: 15px;
        line-height: 1.5;
        color: var(--dh-ink-2);
        cursor: pointer;
        input {
            flex: none;
            width: 20px;
            height: 20px;
            margin: 2px 0 0;
            accent-color: var(--dh-ink);
        }
    }
    .form_error {
        margin: 0;
        padding: 14px 16px;
        border-radius: var(--dh-radius-sm);
        border: 1px solid var(--dh-accent);
        background: var(--dh-surface);
        color: var(--dh-ink);
        font-size: 15px;
        line-height: 1.5;
    }
    .actions {
        display: flex;
        flex-wrap: wrap;
        align-items: center;
        gap: 16px;
    }
    .submit {
        min-height: var(--dh-cta-h);
        padding: 0 28px;
        border: none;
        border-radius: var(--dh-radius-pill);
        background: var(--dh-ink);
        color: var(--dh-on-dark);
        font: inherit;
        font-size: 16px;
        font-weight: 600;
        cursor: pointer;
        &:hover { background: var(--dh-ink-2); }
        &:disabled { opacity: .6; cursor: progress; }
        &:focus-visible {
            outline: 2px solid var(--dh-ink);
            outline-offset: 3px;
        }
    }
    .actions .note {
        font-size: 13px;
        color: var(--dh-muted);
    }
    @media screen and (max-width: 640px) {
        gap: 32px;
        fieldset { grid-template-columns: minmax(0, 1fr); }
    }
`

const Success = styled.section`
    max-width: 760px;
    padding: 32px;
    border-radius: var(--dh-radius-lg);
    border: 1px solid var(--dh-line);
    background: var(--dh-surface);
    display: flex;
    flex-direction: column;
    gap: 16px;
    h2 {
        margin: 0;
        font-family: var(--dh-font-display);
        font-size: var(--dh-text-h3);
        font-weight: 700;
    }
    .code_row {
        display: flex;
        flex-wrap: wrap;
        align-items: center;
        gap: 12px;
    }
    .code {
        font-family: var(--dh-font-mono);
        font-size: 32px;
        font-weight: 700;
        letter-spacing: 0.02em;
        color: var(--dh-ink);
        padding: 8px 16px;
        border-radius: var(--dh-radius-sm);
        background: var(--dh-sand);
    }
    .copy {
        min-height: var(--dh-control-h);
        padding: 0 18px;
        border-radius: var(--dh-radius-pill);
        border: 1px solid var(--dh-line-2);
        background: var(--dh-surface);
        color: var(--dh-ink);
        font: inherit;
        font-size: 14px;
        font-weight: 600;
        cursor: pointer;
        &:hover { border-color: var(--dh-ink); }
        &:focus-visible {
            outline: 2px solid var(--dh-ink);
            outline-offset: 2px;
        }
    }
    p {
        margin: 0;
        font-size: 15px;
        line-height: 1.55;
        color: var(--dh-ink-2);
    }
    .back {
        align-self: flex-start;
        color: var(--dh-ink);
        text-decoration: underline;
        text-underline-offset: 3px;
        font-weight: 600;
    }
    @media screen and (max-width: 640px) {
        padding: 24px 20px;
        .code { font-size: 24px; }
    }
`

interface FieldProps {
    name: FieldName
    label: string
    error?: string
    hint?: string
    optional?: boolean
    className?: string
    children: (props: { id: string; 'aria-invalid': boolean; 'aria-describedby'?: string }) => ReactNode
}

function Field({ name, label, error, hint, optional, className, children }: FieldProps): JSX.Element {
    const id = `lr-${name}`
    const describedBy = [error ? `${id}-error` : null, hint ? `${id}-hint` : null].filter(Boolean).join(' ') || undefined
    return (
        <div className={`field${className ? ` ${className}` : ''}`}>
            <label htmlFor={id}>
                {label}
                {optional && <span className="optional"> (opcional)</span>}
            </label>
            {children({ id, 'aria-invalid': Boolean(error), 'aria-describedby': describedBy })}
            {hint && <span id={`${id}-hint`} className="hint">{hint}</span>}
            {error && <p id={`${id}-error`} className="field_error">{error}</p>}
        </div>
    )
}

interface ChoiceGroupProps<T extends string> {
    name: FieldName
    label: string
    value: T
    options: Array<{ value: T; label: string }>
    onChange: (value: T) => void
    error?: string
}

function ChoiceGroup<T extends string>({ name, label, value, options, onChange, error }: ChoiceGroupProps<T>): JSX.Element {
    const id = `lr-${name}`
    return (
        <div className="field span_2" role="radiogroup" aria-labelledby={`${id}-label`} aria-describedby={error ? `${id}-error` : undefined}>
            <span id={`${id}-label`} className="field_label">{label}</span>
            <div className="choices">
                {options.map((option) => (
                    <label key={option.value} className={`choice${value === option.value ? ' checked' : ''}`}>
                        <input
                            type="radio"
                            name={name}
                            value={option.value}
                            checked={value === option.value}
                            onChange={() => onChange(option.value)}
                        />
                        {option.label}
                    </label>
                ))}
            </div>
            {error && <p id={`${id}-error`} className="field_error">{error}</p>}
        </div>
    )
}

type SubmitState = 'idle' | 'submitting'

function LibroReclamaciones(): JSX.Element {
    const [searchParams] = useSearchParams()
    const [values, setValues] = useState<FormValues>(() => {
        const pedido = (searchParams.get('pedido') ?? '').trim().toUpperCase()
        return { ...EMPTY, orderId: ORDER_ID_PATTERN.test(pedido) ? pedido : pedido.slice(0, 8) }
    })
    const [errors, setErrors] = useState<FormErrors>({})
    const [formError, setFormError] = useState<string | null>(null)
    const [state, setState] = useState<SubmitState>('idle')
    const [result, setResult] = useState<ComplaintCreatedDTO | null>(null)
    const [copied, setCopied] = useState(false)
    const formRef = useRef<HTMLFormElement>(null)

    useEffect(() => {
        document.title = 'Libro de Reclamaciones — devhaus.pe'
        return () => {
            document.title = DEFAULT_TITLE
        }
    }, [])

    useEffect(() => {
        if (!copied) return
        const timer = window.setTimeout(() => setCopied(false), 2000)
        return () => window.clearTimeout(timer)
    }, [copied])

    const update = <K extends FieldName>(field: K, value: FormValues[K]) => {
        setValues((prev) => ({ ...prev, [field]: value }))
        setErrors((prev) => {
            if (!prev[field]) return prev
            const next = { ...prev }
            delete next[field]
            return next
        })
    }

    const onText = (field: FieldName) => (event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) =>
        update(field, event.target.value as never)

    const focusFirstError = (fieldErrors: FormErrors) => {
        const first = FIELD_ORDER.find((field) => fieldErrors[field])
        if (!first) return
        const node = formRef.current?.querySelector<HTMLElement>(`#lr-${first}, [name="${first}"]`)
        node?.focus()
    }

    const onSubmit = async (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault()
        setFormError(null)
        const clientErrors = validateForm(values)
        if (Object.keys(clientErrors).length > 0) {
            setErrors(clientErrors)
            setFormError('Revisa los campos marcados antes de enviar.')
            focusFirstError(clientErrors)
            return
        }
        setState('submitting')
        try {
            const created = await createComplaint(toPayload(values))
            setResult(created)
            window.scrollTo({ top: 0 })
        } catch (err) {
            if (err instanceof ApiError && err.status === 429) {
                setFormError('Demasiados envíos, intenta más tarde.')
            } else if (err instanceof ApiError && err.status === 400 && Array.isArray(err.details)) {
                const mapped: FormErrors = {}
                for (const detail of err.details as Array<{ field?: string; message?: string }>) {
                    const field = detail.field ? API_FIELD_TO_FORM[detail.field] : undefined
                    if (field && !mapped[field]) mapped[field] = detail.message ?? 'Valor inválido'
                }
                setErrors(mapped)
                setFormError(Object.keys(mapped).length > 0 ? 'Revisa los campos marcados antes de enviar.' : 'No pudimos registrar tu reclamación. Revisa los datos e inténtalo de nuevo.')
                focusFirstError(mapped)
            } else {
                setFormError('No pudimos enviar tu reclamación. Revisa tu conexión e inténtalo de nuevo; tus datos siguen aquí.')
            }
        } finally {
            setState('idle')
        }
    }

    const copyCode = async () => {
        if (!result) return
        try {
            await navigator.clipboard.writeText(result.code)
            setCopied(true)
        } catch {
            // Sin permiso de portapapeles: el código sigue visible y seleccionable.
            const node = document.getElementById('lr-code')
            const selection = window.getSelection()
            if (node && selection) {
                const range = document.createRange()
                range.selectNodeContents(node)
                selection.removeAllRanges()
                selection.addRange(range)
            }
        }
    }

    const { legal, complaints } = site
    const hasBusinessName = isConfigured('legal.businessName')
    const hasRuc = isConfigured('legal.ruc')
    const legalEntity = hasBusinessName
        ? `${legal.businessName}${hasRuc ? ` · RUC ${legal.ruc}` : ''}`
        : hasRuc
            ? `RUC ${legal.ruc}`
            : null
    const hasResponseDays = isConfigured('complaints.responseDays')

    return (
        <Page as="article">
            <header className="page_header">
                <h1>Libro de Reclamaciones</h1>
                <p className="intro">
                    Conforme al Código de Protección y Defensa del Consumidor (Ley N.º 29571), ponemos a tu disposición
                    nuestro Libro de Reclamaciones virtual. Completa la hoja y recibirás un código de registro.
                </p>
                {legalEntity && <p className="legal_entity">{legalEntity}</p>}
                {hasResponseDays && (
                    <p className="response_days">
                        Responderemos tu reclamo o queja en un plazo máximo de {complaints.responseDays} días.
                    </p>
                )}
            </header>

            {result ? (
                <Success aria-live="polite" aria-labelledby="lr-success-title">
                    <h2 id="lr-success-title">Tu hoja de reclamación es</h2>
                    <div className="code_row">
                        <span id="lr-code" className="code">{result.code}</span>
                        <button type="button" className="copy" onClick={copyCode} aria-live="polite">
                            {copied ? 'Copiado ✓' : 'Copiar código'}
                        </button>
                    </div>
                    <p>Registrada el {new Date(result.createdAt).toLocaleString('es-PE', { dateStyle: 'long', timeStyle: 'short' })}.</p>
                    {result.emailSent ? (
                        <p>Te enviamos una copia a <strong>{values.email.trim()}</strong>.</p>
                    ) : (
                        <p>Guarda o captura este código: es tu constancia de registro.</p>
                    )}
                    {hasResponseDays && (
                        <p>Te responderemos en un plazo máximo de {complaints.responseDays} días.</p>
                    )}
                    <Link className="back" to="/">Volver al inicio</Link>
                </Success>
            ) : (
                <>
                    <div className="definitions">
                        <p><strong>Reclamo:</strong> disconformidad relacionada con los productos o servicios adquiridos.</p>
                        <p><strong>Queja:</strong> malestar o descontento respecto a la atención al público.</p>
                    </div>

                    <Form ref={formRef} onSubmit={onSubmit} noValidate aria-describedby={formError ? 'lr-form-error' : undefined}>
                        {formError && (
                            <p id="lr-form-error" className="form_error" role="alert">{formError}</p>
                        )}

                        <fieldset>
                            <legend>1. Datos del consumidor</legend>
                            <Field name="name" label="Nombre completo" error={errors.name} className="span_2">
                                {(a11y) => <input {...a11y} type="text" name="name" autoComplete="name" value={values.name} onChange={onText('name')} maxLength={120} />}
                            </Field>
                            <Field name="docType" label="Tipo de documento" error={errors.docType}>
                                {(a11y) => (
                                    <select {...a11y} name="docType" value={values.docType} onChange={onText('docType')}>
                                        {DOC_TYPES.map((type) => (
                                            <option key={type} value={type}>{DOC_TYPE_LABELS[type]}</option>
                                        ))}
                                    </select>
                                )}
                            </Field>
                            <Field name="docNumber" label="Número de documento" error={errors.docNumber}>
                                {(a11y) => <input {...a11y} type="text" name="docNumber" inputMode="text" autoComplete="off" value={values.docNumber} onChange={onText('docNumber')} maxLength={20} />}
                            </Field>
                            <Field name="email" label="Correo electrónico" error={errors.email}>
                                {(a11y) => <input {...a11y} type="email" name="email" autoComplete="email" value={values.email} onChange={onText('email')} maxLength={120} />}
                            </Field>
                            <Field name="phone" label="Teléfono" error={errors.phone}>
                                {(a11y) => <input {...a11y} type="tel" name="phone" autoComplete="tel" value={values.phone} onChange={onText('phone')} maxLength={20} />}
                            </Field>
                            <Field name="address" label="Domicilio" error={errors.address} className="span_2">
                                {(a11y) => <input {...a11y} type="text" name="address" autoComplete="street-address" value={values.address} onChange={onText('address')} maxLength={200} />}
                            </Field>
                            <div className="field span_2">
                                <label className="checkbox">
                                    <input
                                        type="checkbox"
                                        name="isMinor"
                                        checked={values.isMinor}
                                        onChange={(event) => update('isMinor', event.target.checked)}
                                    />
                                    <span>Soy menor de edad (la hoja la presenta mi madre, padre o apoderado)</span>
                                </label>
                            </div>
                            {values.isMinor && (
                                <Field name="guardianName" label="Nombre completo del apoderado" error={errors.guardianName} className="span_2">
                                    {(a11y) => <input {...a11y} type="text" name="guardianName" value={values.guardianName} onChange={onText('guardianName')} maxLength={120} />}
                                </Field>
                            )}
                        </fieldset>

                        <fieldset>
                            <legend>2. Identificación del bien contratado</legend>
                            <ChoiceGroup
                                name="kind"
                                label="Tipo de bien"
                                value={values.kind}
                                options={[{ value: 'producto', label: 'Producto' }, { value: 'servicio', label: 'Servicio' }]}
                                onChange={(kind) => update('kind', kind)}
                                error={errors.kind}
                            />
                            <Field name="description" label="Descripción" hint="Ej. Polo Docker, corte hombre, talla M" error={errors.description} className="span_2">
                                {(a11y) => <input {...a11y} type="text" name="description" value={values.description} onChange={onText('description')} maxLength={200} />}
                            </Field>
                            <Field name="amount" label="Monto reclamado (S/)" optional error={errors.amount}>
                                {(a11y) => <input {...a11y} type="number" name="amount" inputMode="decimal" min={0} step="0.01" value={values.amount} onChange={onText('amount')} />}
                            </Field>
                            <Field name="orderId" label="Código de pedido" optional hint="8 caracteres, como en tu confirmación (ej. A1B2C3D4)" error={errors.orderId}>
                                {(a11y) => <input {...a11y} type="text" name="orderId" autoCapitalize="characters" value={values.orderId} onChange={(event) => update('orderId', event.target.value.toUpperCase())} maxLength={8} />}
                            </Field>
                        </fieldset>

                        <fieldset>
                            <legend>3. Detalle de la reclamación</legend>
                            <ChoiceGroup
                                name="type"
                                label="¿Es un reclamo o una queja?"
                                value={values.type}
                                options={[{ value: 'reclamo', label: 'Reclamo' }, { value: 'queja', label: 'Queja' }]}
                                onChange={(type) => update('type', type)}
                                error={errors.type}
                            />
                            <Field name="detail" label="Detalle" hint="Cuéntanos qué pasó (mínimo 20 caracteres)" error={errors.detail} className="span_2">
                                {(a11y) => <textarea {...a11y} name="detail" value={values.detail} onChange={onText('detail')} maxLength={2000} rows={6} />}
                            </Field>
                            <Field name="request" label="Pedido del consumidor" hint="¿Qué solución esperas? Ej. cambio, reembolso, aclaración" error={errors.request} className="span_2">
                                {(a11y) => <textarea {...a11y} name="request" value={values.request} onChange={onText('request')} maxLength={1000} rows={4} />}
                            </Field>
                        </fieldset>

                        <fieldset>
                            <legend>4. Declaración</legend>
                            <div className="field span_2">
                                <label className="checkbox">
                                    <input
                                        id="lr-acceptsTerms"
                                        type="checkbox"
                                        name="acceptsTerms"
                                        checked={values.acceptsTerms}
                                        onChange={(event) => update('acceptsTerms', event.target.checked)}
                                        aria-invalid={Boolean(errors.acceptsTerms)}
                                        aria-describedby={errors.acceptsTerms ? 'lr-acceptsTerms-error' : undefined}
                                    />
                                    <span>
                                        Declaro que la información proporcionada es veraz y autorizo el uso de mis datos
                                        únicamente para atender esta reclamación.
                                    </span>
                                </label>
                                {errors.acceptsTerms && <p id="lr-acceptsTerms-error" className="field_error">{errors.acceptsTerms}</p>}
                            </div>
                        </fieldset>

                        <div className="actions">
                            <button type="submit" className="submit" disabled={state === 'submitting'}>
                                {state === 'submitting' ? 'Enviando…' : 'Enviar hoja de reclamación'}
                            </button>
                            <span className="note">Al enviar recibirás un código de registro en pantalla.</span>
                        </div>
                    </Form>
                </>
            )}
        </Page>
    )
}

export default LibroReclamaciones
