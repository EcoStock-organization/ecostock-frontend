import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import RotaPrivada from './routes/RotaPrivada';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Products from './pages/Products';
import Branches from './pages/Branches';
import BranchStock from './pages/BranchStock';
import Checkout from './pages/Checkout';

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/dashboard" element={
            <RotaPrivada>
              <Dashboard />
            </RotaPrivada>
          } />
          <Route path="/produtos" element={<RotaPrivada><Products /></RotaPrivada>} />
          <Route path="/filiais" element={<RotaPrivada><Branches /></RotaPrivada>} />
          <Route path="/filiais/:id/estoque" element={<RotaPrivada><BranchStock /></RotaPrivada>} />
          <Route path="/checkout" element={<RotaPrivada><Checkout /></RotaPrivada>} />
          <Route path="*" element={<Login />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
