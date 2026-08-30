import { ChangeEvent, useRef, useState } from 'react';
import { ApiError, assetUrl, uploadLogo } from '../api/client';
import type { ProductDTO } from '../api/types';

const MAX_BYTES = 200 * 1024;

interface Props {
  product: ProductDTO;
  onChange: (updated: ProductDTO) => void;
}

export default function LogoUpload({ product, onChange }: Props) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const onFile = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setError(null);

    // client-side pre-check mirrors the server's 200 KB limit
    if (file.size > MAX_BYTES) {
      setError('El archivo supera 200 KB');
      e.target.value = '';
      return;
    }

    setBusy(true);
    try {
      const updated = await uploadLogo(product.id, file);
      onChange(updated);
    } catch (err) {
      if (err instanceof ApiError && err.code === 'FILE_TOO_LARGE') {
        setError('El archivo supera 200 KB');
      } else if (err instanceof ApiError && err.code === 'UNSUPPORTED_MEDIA') {
        setError('Formato no soportado: solo SVG o PNG');
      } else {
        setError(err instanceof Error ? err.message : 'Error al subir el logo');
      }
    } finally {
      setBusy(false);
      if (inputRef.current) inputRef.current.value = '';
    }
  };

  return (
    <div className="field">
      <label htmlFor="logo">Logo (SVG o PNG, máx. 200 KB)</label>
      <div className="logo-upload">
        {product.logo ? (
          <img className="logo-preview" src={assetUrl(product.logo)} alt={`Logo de ${product.name}`} />
        ) : (
          <span className="thumb-empty">sin logo</span>
        )}
        <div>
          <input
            id="logo"
            ref={inputRef}
            type="file"
            accept=".svg,.png"
            onChange={onFile}
            disabled={busy}
          />
          {busy && <div className="hint">Subiendo…</div>}
          {error && (
            <div className="field-error" role="alert">
              {error}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
