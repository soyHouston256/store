import { FormEvent, useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { ApiError, createProduct, getProduct, updateProduct } from '../api/client';
import { isValidSlug, slugify } from '../api/slug';
import {
  CUT_OPTIONS,
  Cut,
  LOGO_POSITION_OPTIONS,
  LOGO_POSITIONS,
  LogoPosition,
  PRODUCT_KINDS,
  ProductDTO,
  ProductKind,
  ProductWriteDTO,
} from '../api/types';
import LogoUpload from '../components/LogoUpload';
import PublishToggle from '../components/PublishToggle';
import TagInput from '../components/TagInput';

type FieldName = 'name' | 'price' | 'type' | 'colors' | 'sizes' | 'logoPositions' | 'slug' | 'cuts' | 'soldOut';
type FieldErrors = Partial<Record<FieldName, string>>;

const FIELD_NAMES: FieldName[] = ['name', 'price', 'type', 'colors', 'sizes', 'logoPositions', 'slug', 'cuts', 'soldOut'];

const DEFAULT_CUTS: Cut[] = ['hombre'];

/** Map server zod details (dotted paths like "colors.0") onto form fields. */
function mapServerDetails(details: { field: string; message: string }[]): FieldErrors {
  const errors: FieldErrors = {};
  for (const { field, message } of details) {
    const root = field.split('.')[0] as FieldName;
    if (FIELD_NAMES.includes(root) && !errors[root]) {
      errors[root] = message;
    }
  }
  return errors;
}

export default function ProductForm() {
  const { id } = useParams<{ id: string }>();
  const isEdit = id !== undefined;
  const navigate = useNavigate();

  const [product, setProduct] = useState<ProductDTO | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);

  const [name, setName] = useState('');
  const [price, setPrice] = useState('');
  const [type, setType] = useState<ProductKind>('polo');
  const [colors, setColors] = useState<string[]>([]);
  const [sizes, setSizes] = useState<string[]>([]);
  const [logoPositions, setLogoPositions] = useState<LogoPosition[]>(LOGO_POSITIONS);
  const [slug, setSlug] = useState('');
  // While creating, the slug follows the name until the admin edits it by hand.
  const [slugTouched, setSlugTouched] = useState(false);
  const [cuts, setCuts] = useState<Cut[]>(DEFAULT_CUTS);
  const [soldOut, setSoldOut] = useState(false);

  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});
  const [formError, setFormError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (!isEdit) return;
    let alive = true;
    getProduct(id)
      .then((p) => {
        if (!alive) return;
        setProduct(p);
        setName(p.name);
        setPrice(String(p.price));
        setType(p.type);
        setColors(p.colors);
        setSizes(p.sizes);
        setLogoPositions(p.type === 'polo' ? (p.logoPositions?.length ? p.logoPositions : LOGO_POSITIONS) : []);
        setSlug(p.slug ?? '');
        setSlugTouched(true);
        setCuts(p.type === 'polo' ? (p.cuts?.length ? p.cuts : DEFAULT_CUTS) : []);
        setSoldOut(p.soldOut ?? false);
      })
      .catch((err: unknown) => {
        if (alive) setLoadError(err instanceof Error ? err.message : 'Error al cargar el producto');
      });
    return () => {
      alive = false;
    };
  }, [id, isEdit]);

  const validate = (): FieldErrors => {
    const errors: FieldErrors = {};
    if (!name.trim()) errors.name = 'El nombre es obligatorio';
    const parsedPrice = Number(price);
    if (price.trim() === '' || !Number.isFinite(parsedPrice) || parsedPrice <= 0) {
      errors.price = 'El precio debe ser mayor que 0';
    }
    if (!PRODUCT_KINDS.includes(type)) errors.type = 'Tipo inválido';
    if (type === 'polo' && logoPositions.length === 0) {
      errors.logoPositions = 'Selecciona al menos una ubicación del logo';
    }
    if (type === 'polo' && cuts.length === 0) {
      errors.cuts = 'Selecciona al menos un corte';
    }
    const trimmedSlug = slug.trim();
    if (trimmedSlug && !isValidSlug(trimmedSlug)) {
      errors.slug = 'Solo minúsculas, números y guiones simples (máx. 80)';
    }
    if (isEdit && !trimmedSlug) {
      errors.slug = 'El slug es obligatorio';
    }
    return errors;
  };

  const onNameChange = (nextName: string) => {
    setName(nextName);
    if (!isEdit && !slugTouched) setSlug(slugify(nextName));
  };

  const onSlugChange = (nextSlug: string) => {
    setSlugTouched(true);
    setSlug(nextSlug);
  };

  const generateSlugFromName = () => {
    setSlugTouched(true);
    setSlug(slugify(name));
    setFieldErrors((current) => ({ ...current, slug: undefined }));
  };

  const onTypeChange = (nextType: ProductKind) => {
    setType(nextType);
    if (nextType === 'polo') {
      setLogoPositions((current) => (current.length ? current : LOGO_POSITIONS));
      setCuts((current) => (current.length ? current : DEFAULT_CUTS));
    } else {
      setLogoPositions([]);
      setCuts([]);
    }
  };

  const toggleLogoPosition = (position: LogoPosition) => {
    setLogoPositions((current) => (
      current.includes(position)
        ? current.filter((item) => item !== position)
        : [...current, position]
    ));
  };

  const toggleCut = (cut: Cut) => {
    setCuts((current) => (current.includes(cut) ? current.filter((item) => item !== cut) : [...current, cut]));
  };

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setFormError(null);
    setSaved(false);

    const errors = validate();
    setFieldErrors(errors);
    if (Object.keys(errors).length > 0) return;

    const trimmedSlug = slug.trim();
    // PUT is a full replace — always send both arrays. `sizes` is kept for
    // polos too (legacy data) even though the field is hidden for them.
    const body: ProductWriteDTO = {
      name: name.trim(),
      price: Number(price),
      type,
      colors,
      sizes,
      logoPositions: type === 'polo' ? logoPositions : [],
      // Empty slug on create → let the API generate it from the name.
      ...(trimmedSlug ? { slug: trimmedSlug } : {}),
      ...(type === 'polo' ? { cuts } : {}),
      soldOut,
    };

    setBusy(true);
    try {
      if (isEdit) {
        const updated = await updateProduct(id, body);
        setProduct(updated);
        setSlug(updated.slug);
        setSaved(true);
      } else {
        const created = await createProduct(body);
        navigate(`/products/${created.id}`, { replace: true });
      }
    } catch (err) {
      if (err instanceof ApiError && err.status === 409) {
        setFieldErrors({ slug: err.details?.find((d) => d.field === 'slug')?.message ?? 'Este slug ya está en uso' });
        setFormError('Revisa los campos marcados');
      } else if (err instanceof ApiError && err.status === 400 && err.details?.length) {
        setFieldErrors(mapServerDetails(err.details));
        setFormError('Revisa los campos marcados');
      } else {
        setFormError(err instanceof Error ? err.message : 'Error al guardar');
      }
    } finally {
      setBusy(false);
    }
  };

  if (isEdit && loadError) {
    return (
      <>
        <div className="form-error" role="alert">
          {loadError}
        </div>
        <Link className="btn btn-ghost" to="/">
          Volver
        </Link>
      </>
    );
  }

  if (isEdit && !product) {
    return <p className="muted">Cargando…</p>;
  }

  return (
    <>
      <div className="page-head">
        <h1>{isEdit ? `Editar: ${product?.name ?? ''}` : 'Nuevo producto'}</h1>
        {isEdit && product && (
          <PublishToggle
            product={product}
            onChange={setProduct}
            onError={(message) => setFormError(message)}
          />
        )}
      </div>

      <form className="panel" onSubmit={onSubmit} noValidate>
        {formError && (
          <div className="form-error" role="alert">
            {formError}
          </div>
        )}
        {saved && <div className="form-success">Guardado.</div>}

        <div className="field">
          <label htmlFor="name">Nombre</label>
          <input id="name" type="text" value={name} onChange={(e) => onNameChange(e.target.value)} />
          {fieldErrors.name && <div className="field-error">{fieldErrors.name}</div>}
        </div>

        <div className="field">
          <label htmlFor="slug">Slug</label>
          <div className="slug-row">
            <span className="slug-prefix" aria-hidden="true">/producto/</span>
            <input
              id="slug"
              type="text"
              value={slug}
              placeholder={isEdit ? '' : 'se genera desde el nombre'}
              autoCapitalize="off"
              autoCorrect="off"
              spellCheck={false}
              onChange={(e) => onSlugChange(e.target.value)}
            />
            <button type="button" className="btn btn-ghost btn-sm" onClick={generateSlugFromName}>
              Generar desde nombre
            </button>
          </div>
          {fieldErrors.slug ? (
            <div className="field-error">{fieldErrors.slug}</div>
          ) : (
            <p className="hint">Minúsculas, números y guiones. Debe ser único.</p>
          )}
        </div>

        <div className="field">
          <label htmlFor="price">Precio</label>
          <input
            id="price"
            type="number"
            min="0"
            step="0.01"
            value={price}
            onChange={(e) => setPrice(e.target.value)}
          />
          {fieldErrors.price && <div className="field-error">{fieldErrors.price}</div>}
        </div>

        <div className="field">
          <label htmlFor="type">Tipo</label>
          <select id="type" value={type} onChange={(e) => onTypeChange(e.target.value as ProductKind)}>
            {PRODUCT_KINDS.map((kind) => (
              <option key={kind} value={kind}>
                {kind}
              </option>
            ))}
          </select>
          {fieldErrors.type && <div className="field-error">{fieldErrors.type}</div>}
        </div>

        {type === 'polo' && (
          <div className="field">
            <span className="field-label">Cortes</span>
            <div className="check-grid">
              {CUT_OPTIONS.map((option) => (
                <label
                  key={option.value}
                  className={`check-option${cuts.includes(option.value) ? ' checked' : ''}`}
                >
                  <input
                    type="checkbox"
                    checked={cuts.includes(option.value)}
                    onChange={() => toggleCut(option.value)}
                  />
                  <span>
                    <strong>{option.label}</strong>
                    <small>{option.description}</small>
                  </span>
                </label>
              ))}
            </div>
            {fieldErrors.cuts && <div className="field-error">{fieldErrors.cuts}</div>}
          </div>
        )}

        {type === 'polo' && (
          <div className="field">
            <span className="field-label">Ubicaciones del logo</span>
            <div className="check-grid">
              {LOGO_POSITION_OPTIONS.map((option) => (
                <label
                  key={option.value}
                  className={`check-option${logoPositions.includes(option.value) ? ' checked' : ''}`}
                >
                  <input
                    type="checkbox"
                    checked={logoPositions.includes(option.value)}
                    onChange={() => toggleLogoPosition(option.value)}
                  />
                  <span>
                    <strong>{option.label}</strong>
                    <small>{option.description}</small>
                  </span>
                </label>
              ))}
            </div>
            {fieldErrors.logoPositions && <div className="field-error">{fieldErrors.logoPositions}</div>}
          </div>
        )}

        <TagInput
          id="colors"
          label="Colores (hex)"
          values={colors}
          onChange={setColors}
          color
          placeholder="#ff0000"
          error={fieldErrors.colors}
        />

        {type === 'polo' ? (
          <p className="hint">Las tallas de polos vienen de la tabla por corte (hombre S–XXL, mujer XS–XL).</p>
        ) : (
          <TagInput
            id="sizes"
            label="Tallas"
            values={sizes}
            onChange={setSizes}
            placeholder="S, M, L…"
            error={fieldErrors.sizes}
          />
        )}

        <div className="field">
          <label className={`check-option${soldOut ? ' checked' : ''}`}>
            <input type="checkbox" checked={soldOut} onChange={(e) => setSoldOut(e.target.checked)} />
            <span>
              <strong>Agotado</strong>
              <small>Se muestra en la tienda como agotado y no se puede pedir.</small>
            </span>
          </label>
          {fieldErrors.soldOut && <div className="field-error">{fieldErrors.soldOut}</div>}
        </div>

        {isEdit && product && <LogoUpload product={product} onChange={setProduct} />}
        {!isEdit && (
          <p className="hint">El logo se puede subir después de crear el producto.</p>
        )}

        <div className="form-actions">
          <button className="btn" type="submit" disabled={busy}>
            {busy ? 'Guardando…' : isEdit ? 'Guardar cambios' : 'Crear producto'}
          </button>
          <Link className="btn btn-ghost" to="/">
            Volver
          </Link>
        </div>
      </form>
    </>
  );
}
