import { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { Container, Box, TextField, Button, Typography, Paper, Alert } from '@mui/material';

export default function Login() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    const sucesso = await login(username, password);
    if (sucesso) {
      navigate('/dashboard');
    } else {
      setError('Credenciais inválidas.');
    }
  };

  return (
    <Container component="main" maxWidth="xs">
      <Box sx={{ marginTop: 8, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        <Paper elevation={3} sx={{ p: 4, width: '100%', textAlign: 'center' }}>
          <Typography component="h1" variant="h5" sx={{ mb: 3, fontWeight: 'bold', color: '#2E7D32' }}>
            EcoStock
          </Typography>
          {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
          <Box component="form" onSubmit={handleSubmit} noValidate>
            <TextField
              margin="normal" required fullWidth label="Usuário"
              autoFocus value={username} onChange={(e) => setUsername(e.target.value)}
            />
            <TextField
              margin="normal" required fullWidth label="Senha" type="password"
              value={password} onChange={(e) => setPassword(e.target.value)}
            />
            <Button
              type="submit" fullWidth variant="contained"
              sx={{ mt: 3, mb: 2, bgcolor: '#2E7D32', '&:hover': { bgcolor: '#1B5E20' } }}
            >
              Entrar
            </Button>
          </Box>
        </Paper>
      </Box>
    </Container>
  );
}
