import useOnClickOutside from '@/hooks/useOnClickOutside'
import { FilterOption } from '@/data/catalogFilters'
import { useEffect, useId, useRef, useState } from 'react'
import styled from 'styled-components'

// Desplegable de filtro (spec R3.5, canvas Home.dc.html: pill 44 "Stack ▾").
// Selección única; "Todos" limpia. No despacha a Redux: `onChange` escribe la URL.
const Wrapper = styled.div`
    position: relative;
    flex-shrink: 0;
`
const Trigger = styled.button<{ $active: boolean }>`
    height: 44px;
    padding: 0 18px;
    border-radius: 22px;
    border: 1px solid ${({ $active }) => $active ? 'var(--dh-ink)' : 'var(--dh-line-2)'};
    background: ${({ $active }) => $active ? 'var(--dh-ink)' : 'var(--dh-surface)'};
    color: ${({ $active }) => $active ? 'var(--color-text-invert)' : 'var(--dh-ink)'};
    font-family: inherit;
    font-size: 14px;
    font-weight: 500;
    display: inline-flex;
    align-items: center;
    gap: 8px;
    white-space: nowrap;
    cursor: pointer;
    transition: border-color .15s ease;
    .swatch {
        width: 12px;
        height: 12px;
        border-radius: 6px;
        border: 1px solid rgba(0, 0, 0, .15);
    }
    .caret {
        font-size: 11px;
        opacity: .8;
    }
    &:hover {
        border-color: var(--dh-ink);
    }
    &:focus-visible {
        outline: 2px solid var(--dh-ink);
        outline-offset: 2px;
    }
`
const Menu = styled.ul`
    position: absolute;
    top: calc(100% + 8px);
    left: 0;
    z-index: 15;
    min-width: 180px;
    max-height: 320px;
    overflow-y: auto;
    margin: 0;
    padding: 6px;
    list-style: none;
    background: var(--dh-surface);
    border: 1px solid var(--dh-line);
    border-radius: var(--dh-radius-md);
    box-shadow: 0 16px 36px rgba(0, 0, 0, .12);
    li button {
        width: 100%;
        min-height: 40px;
        padding: 0 12px;
        border: none;
        border-radius: 10px;
        background: transparent;
        color: var(--dh-ink);
        font-family: inherit;
        font-size: 14px;
        text-align: left;
        display: flex;
        align-items: center;
        gap: 10px;
        cursor: pointer;
        &:hover {
            background: var(--dh-sand);
        }
        &[aria-selected="true"] {
            font-weight: 600;
            background: var(--dh-sand-2);
        }
        .swatch {
            width: 14px;
            height: 14px;
            border-radius: 7px;
            border: 1px solid rgba(0, 0, 0, .15);
            flex-shrink: 0;
        }
    }
`

interface FilterDropdownProps {
    label: string
    value?: string
    options: FilterOption[]
    onChange: (value: string | null) => void
    allLabel?: string
}

function FilterDropdown({ label, value, options, onChange, allLabel = 'Todos' }: FilterDropdownProps): JSX.Element {
    const [open, setOpen] = useState(false)
    const ref = useRef<HTMLDivElement>(null)
    const menuId = useId()
    useOnClickOutside(ref, () => setOpen(false))

    useEffect(() => {
        if (!open) return
        const onKey = (event: KeyboardEvent) => {
            if (event.key === 'Escape') setOpen(false)
        }
        window.addEventListener('keydown', onKey)
        return () => window.removeEventListener('keydown', onKey)
    }, [open])

    const selected = value ? options.find((option) => option.value === value) : undefined
    const disabled = options.length === 0
    const pick = (next: string | null) => {
        setOpen(false)
        onChange(next)
    }

    return (
        <Wrapper ref={ref}>
            <Trigger
                type="button"
                $active={Boolean(selected)}
                aria-haspopup="listbox"
                aria-expanded={open}
                aria-controls={menuId}
                disabled={disabled}
                title={disabled ? `Sin opciones de ${label.toLowerCase()}` : undefined}
                onClick={() => setOpen((current) => !current)}
            >
                {selected?.swatch && <span className="swatch" style={{ background: selected.swatch }} aria-hidden="true" />}
                <span>{selected ? `${label}: ${selected.label}` : label}</span>
                <span className="caret" aria-hidden="true">▾</span>
            </Trigger>
            {open && (
                <Menu id={menuId} role="listbox" aria-label={label}>
                    <li role="none">
                        <button type="button" role="option" aria-selected={!selected} onClick={() => pick(null)}>{allLabel}</button>
                    </li>
                    {options.map((option) => (
                        <li role="none" key={option.value}>
                            <button
                                type="button"
                                role="option"
                                aria-selected={option.value === value}
                                onClick={() => pick(option.value)}
                            >
                                {option.swatch && <span className="swatch" style={{ background: option.swatch }} aria-hidden="true" />}
                                {option.label}
                            </button>
                        </li>
                    ))}
                </Menu>
            )}
        </Wrapper>
    )
}

export default FilterDropdown
