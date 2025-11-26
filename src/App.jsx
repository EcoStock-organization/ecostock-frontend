import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import RotaPrivada from './routes/RotaPrivada';
import Login from './pages/Login';

const Dashboard = () => <h1>Bem-vindo ao Dashboard (Logado!)</h1>;

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
          <Route path="*" element={<Login />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
