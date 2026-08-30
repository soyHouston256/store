// Static seed data for the landing page testimonials section.
// There is no reviews backend yet — this keeps a clean, typed shape
// (TestimonialType) so the UI can be pointed at a real API/collection
// later without touching Testimonials.tsx.

export interface TestimonialType {
    id: string;
    name: string;
    role: string;
    rating: 1 | 2 | 3 | 4 | 5;
    comment: string;
}

export const testimonials: TestimonialType[] = [
    {
        id: 't1',
        name: 'Renzo Cárdenas',
        role: 'Frontend Developer',
        rating: 5,
        comment: 'El polo de React quedó increíble, la tela es suave y el estampado no se despega ni después de varios lavados. Llegó en 2 días a Lima.'
    },
    {
        id: 't2',
        name: 'Alejandra Quispe',
        role: 'Backend Developer',
        rating: 5,
        comment: 'Personalicé un mousepad con el logo de Golang para regalarle a mi equipo. La atención por WhatsApp fue rápida y me ayudaron a elegir el tamaño.'
    },
    {
        id: 't3',
        name: 'Diego Fernández',
        role: 'DevOps Engineer',
        rating: 4,
        comment: 'Buena calidad y precio justo. Me hubiera gustado más tallas disponibles, pero el diseño de Docker quedó tal cual la imagen.'
    },
    {
        id: 't4',
        name: 'Mariana Torres',
        role: 'QA Engineer',
        rating: 5,
        comment: 'Compré 3 polos para el equipo (Java, Angular y Firebase) y todos llegaron juntos, bien empacados. Definitivamente vuelvo a comprar.'
    },
    {
        id: 't5',
        name: 'Jorge Salazar',
        role: 'Ingeniero de Software',
        rating: 5,
        comment: 'Se nota el cuidado en el detalle del estampado. Pedí personalización desde S/15 y el resultado superó lo que esperaba.'
    },
    {
        id: 't6',
        name: 'Fiorella Ramos',
        role: 'Product Designer',
        rating: 4,
        comment: 'Diseños originales y con buen gusto para regalar a developers. El envío tardó un poco más de lo esperado pero valió la pena.'
    }
]
