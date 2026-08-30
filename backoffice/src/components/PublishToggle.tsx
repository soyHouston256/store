import { useState } from 'react';
import { setPublished } from '../api/client';
import type { ProductDTO } from '../api/types';

interface Props {
  product: ProductDTO;
  onChange: (updated: ProductDTO) => void;
  onError?: (message: string) => void;
}

export default function PublishToggle({ product, onChange, onError }: Props) {
  const [busy, setBusy] = useState(false);

  const toggle = async () => {
    setBusy(true);
    try {
      const updated = await setPublished(product.id, !product.published);
      onChange(updated);
    } catch (err) {
      onError?.(err instanceof Error ? err.message : 'Error al cambiar publicación');
    } finally {
      setBusy(false);
    }
  };

  return (
    <label className="toggle" title={product.published ? 'Publicado' : 'No publicado'}>
      <input
        type="checkbox"
        role="switch"
        checked={product.published}
        disabled={busy}
        onChange={toggle}
        aria-label={`Publicado: ${product.name}`}
      />
      <span className="track" />
    </label>
  );
}
