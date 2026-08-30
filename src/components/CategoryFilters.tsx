import { filterProducts } from "@/store/slices/products"
import { RootState } from "@/store"
import { ProductKind } from "@/types/ProductType"
import { Dispatch, useCallback } from "react"
import { useDispatch, useSelector } from "react-redux"
import styled from "styled-components"

const FiltersWrapper = styled.div`
	display: flex;
	align-items: center;
	gap: 10px;
	flex-wrap: wrap;
	width: var(--screen-desktop);
	margin: 24px auto 0;
	@media screen and (max-width: 1024px){
		width: var(--screen-tablet);
	}
	@media screen and (max-width: 768px){
		width: var(--screen-phone);
	}
	@media screen and (max-width: 425px){
		width: calc(100% - 40px);
		margin: 20px 20px 0;
	}
`
const Chip = styled.button<{ $active: boolean }>`
	border: 1px solid ${({ $active }) => $active ? 'transparent' : 'var(--color-border-solid)'};
	background: ${({ $active }) => $active ? 'var(--gradient-brand)' : 'var(--color-neutral)'};
	color: ${({ $active }) => $active ? '#1a1a1a' : 'var(--color-text)'};
	font-weight: 600;
	font-size: 13px;
	border-radius: 999px;
	padding: 8px 18px;
	cursor: pointer;
	white-space: nowrap;
	transition: transform .12s ease, opacity .12s ease;
	opacity: ${({ $active }) => $active ? 1 : .75};
	&:hover {
		opacity: 1;
		transform: translateY(-1px);
	}
	&:focus-visible {
		outline: 2px solid var(--color-text);
		outline-offset: 2px;
	}
`

const categories: { key: ProductKind | 'all'; label: string }[] = [
	{ key: 'all', label: 'Todos' },
	{ key: 'polo', label: 'Polos' },
	{ key: 'mousepad', label: 'Mousepads' },
	{ key: 'taza', label: 'Tazas' },
]

function CategoryFilters(): JSX.Element {
	const dispatch: Dispatch<any> = useDispatch()
	const activeCategory = useSelector((state: RootState) => state.products.filters?.category) ?? 'all'

	const selectCategory = useCallback(
		(category: ProductKind | 'all') => dispatch(filterProducts({ category })),
		[dispatch]
	)

	return (
		<FiltersWrapper role="group" aria-label="Filtrar por categoría">
			{categories.map(({ key, label }) => (
				<Chip
					key={key}
					type="button"
					$active={activeCategory === key || (key === 'all' && !activeCategory)}
					aria-pressed={activeCategory === key}
					onClick={() => selectCategory(key)}
				>
					{label}
				</Chip>
			))}
		</FiltersWrapper>
	)
}

export default CategoryFilters
