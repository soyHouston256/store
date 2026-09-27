import { Navigate, useLocation, useParams } from 'react-router-dom'
import useProduct from '@/hooks/useProduct'

// `/product/:id` (ruta del modal hasta la fase 4) → `/producto/:slug` (spec R5.1 /
// design §8.1): resuelve el producto por id y redirige con `replace`
// conservando la query; producto inexistente → `/`. Mientras carga no renderiza
// nada (la ficha llega enseguida con la redirección).
function LegacyProductRedirect(): JSX.Element | null {
    const { id } = useParams()
    const { search } = useLocation()
    const { product, loading } = useProduct(id)

    if (loading) return null
    if (!product) return <Navigate replace to="/" />
    return <Navigate replace to={`/producto/${encodeURIComponent(product.slug ?? product.id ?? id ?? '')}${search}`} />
}

export default LegacyProductRedirect
