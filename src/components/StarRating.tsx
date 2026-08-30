import styled from "styled-components"

const StarsWrapper = styled.span`
	display: inline-flex;
	align-items: center;
	gap: 2px;
	svg {
		width: 16px;
		height: 16px;
	}
	.filled {
		fill: var(--color-star);
	}
	.empty {
		fill: none;
		stroke: var(--color-star);
		stroke-width: 12px;
		opacity: .5;
	}
`

const Star = ({ filled }: { filled: boolean }) => (
	<svg preserveAspectRatio="xMidYMid meet" viewBox="0 0 256 256" aria-hidden="true" className={filled ? 'filled' : 'empty'}>
		<path d="M239.2 97.3a16.4 16.4 0 0 0-13.9-11.1l-63.3-5.5l-24.9-58.7a16.3 16.3 0 0 0-30.2 0L82 80.7l-63.3 5.5a16.3 16.3 0 0 0-9.3 28.6l48 42.1l-14.3 62a16.3 16.3 0 0 0 24.3 17.7L128 203.6l55.6 33a16.3 16.3 0 0 0 24.3-17.7l-14.3-62l48-42.1a16.3 16.3 0 0 0 3.6-17.5Z"></path>
	</svg>
)

function StarRating({ rating, max = 5 }: { rating: number; max?: number }): JSX.Element {
	return (
		<StarsWrapper role="img" aria-label={`Calificación: ${rating} de ${max} estrellas`}>
			{Array.from({ length: max }, (_, index) => (
				<Star key={index} filled={index < rating} />
			))}
		</StarsWrapper>
	)
}

export default StarRating
