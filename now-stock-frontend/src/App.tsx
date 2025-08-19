import { Routes, Route } from "react-router-dom";
import { ProductsView } from "./pages/ProductsView";
import { LoginView } from "./pages/LoginView";

function App() {
  return (
    <Routes>
      <Route path="/login" element={<LoginView />} />
      <Route path="/" element={<ProductsView />} />
    </Routes>
  );
}

export default App;
