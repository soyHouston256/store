import styled from 'styled-components'
import type { Cut } from '@/types/ProductType'
import { CUTS, CUT_LABELS, CUT_SHORT_LABELS } from '@/data/cuts'
import { SILUETA } from '@/data/siluetas'

// Segmented Hombre / Mujer (spec 04 "UI — Catálogo", R4.6): pastilla --dh-sand-2
// con 2 botones de 40 alto (radio 20), silueta 18 px + texto; activo = fondo
// tinta / texto crema. `role="group" aria-label="Corte"`, cada botón `aria-pressed`.
// No despacha a Redux: `onChange` escribe la URL (`?corte=`).
const Segmented = styled.div`
	display: inline-flex;
	align-items: center;
	gap: 2px;
	padding: 2px;
	height: 44px;
	box-sizing: border-box;
	border-radius: 22px;
	background: var(--dh-sand-2);
	flex-shrink: 0;
`
const Option = styled.button<{ $active: boolean }>`
	display: inline-flex;
	align-items: center;
	gap: 8px;
	height: 40px;
	padding: 0 16px 0 12px;
	border-radius: 20px;
	border: none;
	background: ${({ $active }) => $active ? 'var(--dh-ink)' : 'transparent'};
	color: ${({ $active }) => $active ? 'var(--color-text-invert)' : 'var(--dh-ink)'};
	font-family: inherit;
	font-weight: 600;
	font-size: 14px;
	line-height: 1;
	cursor: pointer;
	white-space: nowrap;
	transition: background .15s ease, color .15s ease;
	svg {
		width: 18px;
		height: 18px;
		flex-shrink: 0;
	}
	&:hover {
		color: ${({ $active }) => $active ? 'var(--color-text-invert)' : 'var(--dh-accent)'};
	}
	&:focus-visible {
		outline: 2px solid var(--dh-ink);
		outline-offset: 2px;
	}
`

export function CutSilhouette({ cut, size = 18 }: { cut: Cut; size?: number }): JSX.Element {
	return (
		<svg viewBox="0 0 200 200" width={size} height={size} aria-hidden="true" focusable="false">
			<path d={SILUETA[cut].frente} fill="none" stroke="currentColor" strokeWidth={10} strokeLinejoin="round" />
		</svg>
	)
}

interface CutSegmentedProps {
	value: Cut
	onChange: (cut: Cut) => void
}

function CutSegmented({ value, onChange }: CutSegmentedProps): JSX.Element {
	return (
		<Segmented role="group" aria-label="Corte">
			{CUTS.map((cut) => (
				<Option
					key={cut}
					type="button"
					$active={value === cut}
					aria-pressed={value === cut}
					title={CUT_LABELS[cut]}
					onClick={() => onChange(cut)}
				>
					<CutSilhouette cut={cut} />
					{CUT_SHORT_LABELS[cut]}
				</Option>
			))}
		</Segmented>
	)
}

export default CutSegmented
