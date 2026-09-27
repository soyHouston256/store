import { RootState } from "@/store"
import { CATEGORY_OPTIONS, colorOptions, sizeOptions, stackOptions } from "@/data/catalogFilters"
import { storeCut } from "@/data/cuts"
import { useCatalogParams } from "@/hooks/useCatalogUrlSync"
import FilterDropdown from "@/components/FilterDropdown"
import CutSegmented from "@/components/CutSegmented"
import type { Cut } from "@/types/ProductType"
import { useMemo } from "react"
import { useSelector } from "react-redux"
import styled from "styled-components"
import Container from "@/components/layout/Container"

// Fila de filtros del catálogo (spec 02 §3 / R3.5): chips Todos/Polos/
// Mousepads/Tazas · separador · segmented Hombre/Mujer (solo con Todos o Polos,
// spec R4.6) · desplegables Stack/Color/Talla (Talla lista `sizesFor(cut)` y
// solo aparece cuando hay polos en juego). Todos escriben la URL con `setParam`
// (nunca `dispatch`). En ≤640 la fila hace scroll horizontal.
const FiltersWrapper = styled(Container)`
	display: flex;
	align-items: center;
	gap: 10px;
	flex-wrap: wrap;
	margin-top: 20px;
	.separator {
		width: 1px;
		height: 28px;
		background: var(--dh-line-2);
		margin: 0 6px;
		flex-shrink: 0;
	}
	@media screen and (max-width: 640px){
		flex-wrap: nowrap;
		overflow-x: auto;
		-webkit-overflow-scrolling: touch;
		scrollbar-width: none;
		padding-bottom: 4px;
		&::-webkit-scrollbar {
			display: none;
		}
	}
`
const Chip = styled.button<{ $active: boolean }>`
	height: 44px;
	padding: 0 20px;
	border-radius: 22px;
	border: 1px solid ${({ $active }) => $active ? 'var(--dh-ink)' : 'var(--dh-line-2)'};
	background: ${({ $active }) => $active ? 'var(--dh-ink)' : 'var(--dh-surface)'};
	color: ${({ $active }) => $active ? 'var(--color-text-invert)' : 'var(--dh-ink)'};
	font-family: inherit;
	font-weight: 600;
	font-size: 14px;
	cursor: pointer;
	white-space: nowrap;
	flex-shrink: 0;
	transition: border-color .15s ease, background .15s ease;
	&:hover {
		border-color: var(--dh-ink);
	}
	&:focus-visible {
		outline: 2px solid var(--dh-ink);
		outline-offset: 2px;
	}
`

function CategoryFilters(): JSX.Element {
	const { filters, setParam } = useCatalogParams()
	const products = useSelector((state: RootState) => state.products.products)
	const activeCategory = filters.category ?? 'all'
	const showsPolos = activeCategory === 'all' || activeCategory === 'polo'

	const stacks = useMemo(() => stackOptions(products), [products])
	const colors = useMemo(() => colorOptions(products), [products])
	const sizes = useMemo(() => sizeOptions(filters.cut), [filters.cut])

	const changeCut = (cut: Cut) => {
		storeCut(cut)
		setParam('corte', cut)
	}

	return (
		<FiltersWrapper role="group" aria-label="Filtrar el catálogo">
			{CATEGORY_OPTIONS.map(({ key, label }) => (
				<Chip
					key={key}
					type="button"
					$active={activeCategory === key}
					aria-pressed={activeCategory === key}
					onClick={() => setParam('cat', key === 'all' ? null : key)}
				>
					{label}
				</Chip>
			))}
			<span className="separator" aria-hidden="true" />
			{showsPolos && <CutSegmented value={filters.cut} onChange={changeCut} />}
			<FilterDropdown label="Stack" value={filters.stack} options={stacks} onChange={(value) => setParam('stack', value)} />
			<FilterDropdown label="Color" value={filters.color} options={colors} onChange={(value) => setParam('color', value)} />
			{showsPolos && <FilterDropdown label="Talla" value={filters.size} options={sizes} onChange={(value) => setParam('talla', value)} allLabel="Todas" />}
		</FiltersWrapper>
	)
}

export default CategoryFilters
