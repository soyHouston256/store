import { CATALOG_SORTS, SORT_LABELS } from '@/data/catalogFilters'
import { useCatalogParams } from '@/hooks/useCatalogUrlSync'
import { CatalogSort } from '@/type'
import styled from 'styled-components'

// "Ordenar por" (spec 02 §3 / R3.5): select 44 pill; escribe `?orden=` en la
// URL (el default `vendidos` se omite). Nunca despacha a Redux.
const Wrapper = styled.div`
    display: flex;
    align-items: center;
    gap: 12px;
    flex-shrink: 0;
    label {
        font-size: 14px;
        color: var(--dh-muted);
        white-space: nowrap;
    }
    select {
        height: 44px;
        padding: 0 36px 0 14px;
        border-radius: 22px;
        border: 1px solid var(--dh-line-2);
        background: var(--dh-surface) url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%235E5A53' stroke-width='2.5' stroke-linecap='round' stroke-linejoin='round'><path d='M6 9l6 6 6-6'/></svg>") no-repeat right 14px center;
        color: var(--dh-ink);
        font-family: inherit;
        font-size: 14px;
        appearance: none;
        -webkit-appearance: none;
        cursor: pointer;
        &:hover {
            border-color: var(--dh-ink);
        }
        &:focus-visible {
            outline: 2px solid var(--dh-ink);
            outline-offset: 2px;
        }
    }
    @media screen and (max-width: 640px) {
        label {
            display: none;
        }
    }
`

function SortSelect(): JSX.Element {
    const { filters, setParam } = useCatalogParams()
    return (
        <Wrapper>
            <label htmlFor="orden">Ordenar por</label>
            <select
                id="orden"
                value={filters.sort}
                onChange={(event) => setParam('orden', event.target.value as CatalogSort)}
            >
                {CATALOG_SORTS.map((sort) => (
                    <option key={sort} value={sort}>{SORT_LABELS[sort]}</option>
                ))}
            </select>
        </Wrapper>
    )
}

export default SortSelect
