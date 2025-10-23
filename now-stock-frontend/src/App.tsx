import { Routes, Route } from 'react-router-dom';
import { LoginView } from './pages/LoginView';
import { CompanySignUpView } from './pages/CompanySignUpView';
import { ProtectedRoute } from './components/common/ProtectedRoute';
import { AppLayout } from './components/layout/AppLayout';
import { DashboardView } from './pages/DashboardView';
import { ProductsView } from './pages/ProductsView';

function App() {
  return (
    <Routes>
      {/* Rotas Públicas */}
      <Route path="/login" element={<LoginView />} />
      <Route path="/signup-company" element={<CompanySignUpView />} />

      {/* Rotas Protegidas que usam o Layout Principal */}
      <Route
        path="/"
        element={
          <ProtectedRoute>
            <AppLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<DashboardView />} /> 
        <Route path="products" element={<ProductsView />} />
      </Route>
    </Routes>
  );
}

export default App;