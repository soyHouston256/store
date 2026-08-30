import { KeyboardEvent, useState } from 'react';

interface Props {
  id: string;
  label: string;
  values: string[];
  onChange: (values: string[]) => void;
  /** render a color swatch next to each tag and validate as hex */
  color?: boolean;
  placeholder?: string;
  error?: string;
}

const HEX_RE = /^#([0-9a-f]{3,8})$/i;

export default function TagInput({ id, label, values, onChange, color, placeholder, error }: Props) {
  const [draft, setDraft] = useState('');
  const [localError, setLocalError] = useState<string | null>(null);

  const add = () => {
    const value = draft.trim();
    if (!value) return;
    if (color && !HEX_RE.test(value)) {
      setLocalError('Debe ser un color hex, ej. #ff0000');
      return;
    }
    if (values.includes(value)) {
      setDraft('');
      return;
    }
    onChange([...values, value]);
    setDraft('');
    setLocalError(null);
  };

  const remove = (value: string) => {
    onChange(values.filter((v) => v !== value));
  };

  const onKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      add();
    }
  };

  const shownError = error ?? localError ?? undefined;

  return (
    <div className="field">
      <label htmlFor={id}>{label}</label>
      <div className="tag-input-row">
        <input
          id={id}
          type="text"
          value={draft}
          placeholder={placeholder}
          onChange={(e) => {
            setDraft(e.target.value);
            setLocalError(null);
          }}
          onKeyDown={onKeyDown}
        />
        <button type="button" className="btn btn-ghost" onClick={add}>
          Agregar
        </button>
      </div>
      {shownError && <div className="field-error">{shownError}</div>}
      {values.length > 0 && (
        <div className="tags">
          {values.map((value) => (
            <span className="tag" key={value}>
              {color && <span className="swatch" style={{ background: value }} />}
              {value}
              <button type="button" aria-label={`Quitar ${value}`} onClick={() => remove(value)}>
                ×
              </button>
            </span>
          ))}
        </div>
      )}
    </div>
  );
}
