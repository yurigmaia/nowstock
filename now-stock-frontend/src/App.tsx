import { Routes, Route } from 'react-router-dom';
import { LoginView } from './pages/LoginView';
import { CompanySignUpView } from './pages/CompanySignUpView';
import { SignUpUserView } from './pages/SignUpUserView';
import { ProtectedRoute } from './components/common/ProtectedRoute';
import { AppLayout } from './components/layout/AppLayout';
import { DashboardView } from './pages/DashboardView';
import { ProductsView } from './pages/ProductsView';
import { UsersView } from './pages/UsersView';
import { AdminView } from './pages/AdminView';
import { SuppliersView } from './pages/SuppliersView';
import { StockCurrentView } from './pages/StockCurrentView';
import { StockAdjustView } from './pages/StockAdjustView';
import { RfidConfigView } from './pages/RfidConfigView';
import { CategoriesView } from './pages/CategoriesView';
import { ReportsView } from './pages/ReportsView';
import { MovementsView } from './pages/MovementsView';
import { ProfileView } from './pages/ProfileView';

function App() {
  return (
    <Routes>
      {/* Rotas Públicas */}
      <Route path="/login" element={<LoginView />} />
      <Route path="/signup-company" element={<CompanySignUpView />} />
      <Route path="/signup-user" element={<SignUpUserView />} />

      {/* Rotas Protegidas */}
      <Route path="/" element={<ProtectedRoute><AppLayout /></ProtectedRoute>}>
        <Route index element={<DashboardView />} /> 
        <Route path="products" element={<ProductsView />} />
        <Route path="users" element={<UsersView />} />
        <Route path="admin" element={<AdminView />} />
        <Route path="suppliers" element={<SuppliersView />} />
        <Route path="stock-current" element={<StockCurrentView />} />
        <Route path="stock-adjust" element={<StockAdjustView />} />
        <Route path="rfid-config" element={<RfidConfigView />} />
        <Route path="categories" element={<CategoriesView />} />
        <Route path="reports" element={<ReportsView />} />
        <Route path="movements" element={<MovementsView />} />
        <Route path="profile" element={<ProfileView />} />
      </Route>
    </Routes>
  );
}

export default App;