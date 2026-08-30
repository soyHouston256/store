import styled from "styled-components"
import StarRating from "@/components/StarRating"
import { testimonials } from "@/data/testimonials"

const TestimonialsSection = styled.section`
	width: var(--screen-desktop);
	margin: 60px auto 0;
	@media screen and (max-width: 1024px){
		width: var(--screen-tablet);
		margin-top: 45px;
	}
	@media screen and (max-width: 768px){
		width: var(--screen-phone);
	}
	@media screen and (max-width: 425px){
		width: calc(100% - 40px);
		margin: 40px 20px 0;
	}
`
const SectionHeader = styled.div`
	display: flex;
	align-items: flex-end;
	justify-content: space-between;
	gap: 12px;
	margin-bottom: 24px;
	h2 {
		font-size: var(--font-size-section-title);
		font-weight: 800;
		color: var(--color-text);
		margin: 0 0 4px;
	}
	p {
		margin: 0;
		font-size: var(--font-size-text-sm);
		color: var(--color-text);
		opacity: .55;
	}
	.rating_summary {
		display: flex;
		align-items: center;
		gap: 8px;
		flex-shrink: 0;
		strong {
			font-size: var(--font-size-price);
			color: var(--color-text);
		}
	}
	@media screen and (max-width: 768px){
		flex-direction: column;
		align-items: flex-start;
		gap: 10px;
	}
`
const TestimonialsGrid = styled.div`
	display: grid;
	grid-template-columns: repeat(3, 1fr);
	gap: 20px;
	@media screen and (max-width: 1024px){
		gap: 15px;
	}
	@media screen and (max-width: 768px){
		grid-template-columns: 1fr;
	}
`
const TestimonialCard = styled.article`
	display: flex;
	flex-direction: column;
	gap: 14px;
	background-color: var(--color-neutral);
	border: 1px solid var(--color-border);
	border-radius: var(--radius);
	box-shadow: var(--shadow);
	padding: 1.75rem;
	transition: transform .18s ease, box-shadow .18s ease;
	&:hover {
		transform: translateY(-3px);
		box-shadow: var(--shadow-hover);
	}
	p.comment {
		margin: 0;
		font-size: var(--font-size-text-sm);
		line-height: 1.6;
		color: var(--color-text);
		opacity: .8;
	}
	.author {
		display: flex;
		align-items: center;
		gap: 12px;
		margin-top: auto;
	}
	.avatar {
		flex-shrink: 0;
		width: 40px;
		height: 40px;
		border-radius: 50%;
		background: var(--gradient-brand);
		display: flex;
		align-items: center;
		justify-content: center;
		font-weight: 700;
		font-size: 14px;
		color: #1a1a1a;
	}
	.author_info {
		display: flex;
		flex-direction: column;
		strong {
			font-size: var(--font-size-text-sm);
			color: var(--color-text);
		}
		span {
			font-size: 12px;
			color: var(--color-text);
			opacity: .5;
		}
	}
`

const getInitials = (name: string): string =>
	name.split(' ').filter(Boolean).slice(0, 2).map((part) => part[0]).join('').toUpperCase()

const averageRating = testimonials.length
	? Math.round((testimonials.reduce((sum, t) => sum + t.rating, 0) / testimonials.length) * 10) / 10
	: 0

function Testimonials(): JSX.Element {
	return (
		<TestimonialsSection id="resenas" aria-label="Reseñas de clientes">
			<SectionHeader>
				<div>
					<h2>Lo que dicen nuestros clientes</h2>
					<p>Reseñas reales de developers que ya recibieron su pedido</p>
				</div>
				<div className="rating_summary">
					<StarRating rating={Math.round(averageRating)} />
					<strong>{averageRating.toFixed(1)} / 5</strong>
				</div>
			</SectionHeader>
			<TestimonialsGrid>
				{testimonials.map((testimonial) => (
					<TestimonialCard key={testimonial.id}>
						<StarRating rating={testimonial.rating} />
						<p className="comment">&ldquo;{testimonial.comment}&rdquo;</p>
						<div className="author">
							<span className="avatar" aria-hidden="true">{getInitials(testimonial.name)}</span>
							<span className="author_info">
								<strong>{testimonial.name}</strong>
								<span>{testimonial.role}</span>
							</span>
						</div>
					</TestimonialCard>
				))}
			</TestimonialsGrid>
		</TestimonialsSection>
	)
}

export default Testimonials
