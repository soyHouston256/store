import { FormEvent, useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { ApiError, createProduct, getProduct, updateProduct } from '../api/client';
import {
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

type FieldErrors = Partial<Record<'name' | 'price' | 'type' | 'colors' | 'sizes' | 'logoPositions', string>>;

/** Map server zod details (dotted paths like "colors.0") onto form fields. */
function mapServerDetails(details: { field: string; message: string }[]): FieldErrors {
  const errors: FieldErrors = {};
  for (const { field, message } of details) {
    const root = field.split('.')[0] as keyof FieldErrors;
    if (['name', 'price', 'type', 'colors', 'sizes', 'logoPositions'].includes(root) && !errors[root]) {
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
    return errors;
  };

  const onTypeChange = (nextType: ProductKind) => {
    setType(nextType);
    if (nextType === 'polo') {
      setLogoPositions((current) => (current.length ? current : LOGO_POSITIONS));
    } else {
      setLogoPositions([]);
    }
  };

  const toggleLogoPosition = (position: LogoPosition) => {
    setLogoPositions((current) => (
      current.includes(position)
        ? current.filter((item) => item !== position)
        : [...current, position]
    ));
  };

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setFormError(null);
    setSaved(false);

    const errors = validate();
    setFieldErrors(errors);
    if (Object.keys(errors).length > 0) return;

    // PUT is a full replace — always send both arrays
    const body: ProductWriteDTO = {
      name: name.trim(),
      price: Number(price),
      type,
      colors,
      sizes,
      logoPositions: type === 'polo' ? logoPositions : [],
    };

    setBusy(true);
    try {
      if (isEdit) {
        const updated = await updateProduct(id, body);
        setProduct(updated);
        setSaved(true);
      } else {
        const created = await createProduct(body);
        navigate(`/products/${created.id}`, { replace: true });
      }
    } catch (err) {
      if (err instanceof ApiError && err.status === 400 && err.details?.length) {
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
          <input id="name" type="text" value={name} onChange={(e) => setName(e.target.value)} />
          {fieldErrors.name && <div className="field-error">{fieldErrors.name}</div>}
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

        <TagInput
          id="sizes"
          label="Tallas"
          values={sizes}
          onChange={setSizes}
          placeholder="S, M, L…"
          error={fieldErrors.sizes}
        />

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
