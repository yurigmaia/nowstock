// src/App.tsx
import { Routes, Route } from 'react-router-dom';
import { ProductsView } from './pages/ProductsView';
import { LoginView } from './pages/LoginView';
import { SignUpView } from './pages/SignUpView';

function App() {
  return (
    <Routes>
      <Route path="/login" element={<LoginView />} />
      <Route path="/signup" element={<SignUpView />} />
      <Route path="/" element={<ProductsView />} />
    </Routes>
  );
}

export default App;