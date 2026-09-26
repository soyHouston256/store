// Enlaces compartidos por Header, MobileMenu y Footer (design §4).
// `?cat=` lo consume `useCatalogUrlSync` a partir de la fase 3; hasta entonces
// el enlace lleva al catálogo (#catalogo) sin filtrar.

export interface NavLink {
    label: string
    to: string
}

export const NAV_LINKS: NavLink[] = [
    { label: 'Polos', to: '/?cat=polo#catalogo' },
    { label: 'Mousepads', to: '/?cat=mousepad#catalogo' },
    { label: 'Tazas', to: '/?cat=taza#catalogo' },
    { label: 'Personaliza', to: '/#personaliza' },
    { label: 'Ayuda', to: '/ayuda' }
]

export const HELP_LINKS: NavLink[] = [
    { label: 'Sigue tu pedido', to: '/pedido' },
    { label: 'Guía de tallas', to: '/guia-de-tallas' },
    { label: 'Envíos y tiempos', to: '/envios' },
    { label: 'Cambios y devoluciones', to: '/cambios' },
    { label: 'Preguntas frecuentes', to: '/ayuda' }
]
