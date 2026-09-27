import { Route, Routes } from 'react-router-dom';
import RequireAuth from './auth/RequireAuth';
import Login from './pages/Login';
import ProductList from './pages/ProductList';
import ProductForm from './pages/ProductForm';
import OrderList from './pages/OrderList';
import OrderDetail from './pages/OrderDetail';
import ComplaintList from './pages/ComplaintList';
import ComplaintDetail from './pages/ComplaintDetail';

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route element={<RequireAuth />}>
        <Route path="/" element={<ProductList />} />
        <Route path="/products/new" element={<ProductForm />} />
        <Route path="/products/:id" element={<ProductForm />} />
        <Route path="/orders" element={<OrderList />} />
        <Route path="/orders/:id" element={<OrderDetail />} />
        <Route path="/complaints" element={<ComplaintList />} />
        <Route path="/complaints/:id" element={<ComplaintDetail />} />
      </Route>
    </Routes>
  );
}
