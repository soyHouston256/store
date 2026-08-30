import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { assetUrl, deleteProduct, listProducts } from '../api/client';
import type { ProductDTO } from '../api/types';
import PublishToggle from '../components/PublishToggle';

export default function ProductList() {
  const [products, setProducts] = useState<ProductDTO[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let alive = true;
    listProducts()
      .then((list) => {
        if (alive) setProducts(list);
      })
      .catch((err: unknown) => {
        if (alive) setError(err instanceof Error ? err.message : 'Error al cargar productos');
      });
    return () => {
      alive = false;
    };
  }, []);

  const onDelete = async (product: ProductDTO) => {
    if (!window.confirm(`¿Eliminar "${product.name}"? Esta acción no se puede deshacer.`)) return;
    setError(null);
    try {
      await deleteProduct(product.id);
      setProducts((prev) => (prev ? prev.filter((p) => p.id !== product.id) : prev));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al eliminar');
    }
  };

  const replace = (updated: ProductDTO) => {
    setProducts((prev) => (prev ? prev.map((p) => (p.id === updated.id ? updated : p)) : prev));
  };

  return (
    <>
      <div className="page-head">
        <h1>Productos</h1>
        <Link className="btn" to="/products/new">
          Nuevo producto
        </Link>
      </div>
      {error && (
        <div className="form-error" role="alert">
          {error}
        </div>
      )}
      {products === null ? (
        !error && <p className="muted">Cargando…</p>
      ) : products.length === 0 ? (
        <p className="muted">No hay productos todavía.</p>
      ) : (
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Logo</th>
                <th>Nombre</th>
                <th>Tipo</th>
                <th>Precio</th>
                <th>Likes</th>
                <th>Publicado</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {products.map((product) => (
                <tr key={product.id}>
                  <td>
                    {product.logo ? (
                      <img className="thumb" src={assetUrl(product.logo)} alt="" />
                    ) : (
                      <span className="thumb-empty">—</span>
                    )}
                  </td>
                  <td>{product.name}</td>
                  <td>{product.type}</td>
                  <td>S/ {product.price}</td>
                  <td>{product.likes}</td>
                  <td>
                    <PublishToggle product={product} onChange={replace} onError={setError} />
                  </td>
                  <td>
                    <Link className="btn btn-ghost btn-sm" to={`/products/${product.id}`}>
                      Editar
                    </Link>{' '}
                    <button
                      type="button"
                      className="btn btn-danger btn-sm"
                      onClick={() => onDelete(product)}
                    >
                      Eliminar
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </>
  );
}
