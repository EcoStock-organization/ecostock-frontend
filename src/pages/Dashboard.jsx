import { useState, useEffect } from 'react';
import { 
  Container, Grid, Paper, Typography, Box, 
  Card, CardContent, Divider, Button, List, ListItem, ListItemText
} from '@mui/material';
import { 
  Inventory, Store, AttachMoney, Warning, 
  PointOfSale, Logout 
} from '@mui/icons-material';
import { reportService } from '../services/reportService';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';

export default function Dashboard() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  
  const [kpis, setKpis] = useState({
    total_produtos: 0,
    total_filiais: 0,
    valor_total_estoque: 0,
    itens_baixo_estoque: 0
  });
  const [lowStockItems, setLowStockItems] = useState([]);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const data = await reportService.getDashboard();
      setKpis(data);
      
      if (data.itens_baixo_estoque > 0) {
        const lowStock = await reportService.getLowStock();
        setLowStockItems(lowStock);
      }
    } catch (error) {
      console.error("Erro ao carregar dashboard", error);
    }
  };

  const KPICard = ({ title, value, icon, color }) => (
    <Paper sx={{ p: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center', height: '100%' }}>
      <Box>
        <Typography color="textSecondary" variant="subtitle2" gutterBottom>
          {title}
        </Typography>
        <Typography variant="h4" component="div">
          {value}
        </Typography>
      </Box>
      <Box sx={{ color: color }}>
        {icon}
      </Box>
    </Paper>
  );

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      {/* Header Simples */}
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={4}>
        <Box>
          <Typography variant="h4" fontWeight="bold" gutterBottom>
            Visão Geral
          </Typography>
          <Typography variant="subtitle1" color="textSecondary">
            Bem-vindo de volta.
          </Typography>
        </Box>
        <Box display="flex" gap={2}>
           <Button 
            variant="contained" 
            color="success" 
            startIcon={<PointOfSale />}
            onClick={() => navigate('/checkout')}
          >
            Abrir Caixa (PDV)
          </Button>
          <Button variant="outlined" color="error" startIcon={<Logout />} onClick={logout}>
            Sair
          </Button>
        </Box>
      </Box>

      {/* Menu Rápido (Já que não temos Sidebar) */}
      <Box mb={4} display="flex" gap={2} flexWrap="wrap">
        <Button variant="outlined" onClick={() => navigate('/produtos')}>Gerenciar Produtos</Button>
        <Button variant="outlined" onClick={() => navigate('/filiais')}>Gerenciar Filiais</Button>
      </Box>

      {/* KPIs */}
      <Grid container spacing={3} mb={4}>
        <Grid item xs={12} sm={6} md={3}>
          <KPICard 
            title="Total de Produtos" 
            value={kpis.total_produtos} 
            icon={<Inventory fontSize="large" />} 
            color="#1976d2"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <KPICard 
            title="Filiais Ativas" 
            value={kpis.total_filiais} 
            icon={<Store fontSize="large" />} 
            color="#2e7d32"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <KPICard 
            title="Valor em Estoque" 
            value={`R$ ${parseFloat(kpis.valor_total_estoque).toFixed(2)}`} 
            icon={<AttachMoney fontSize="large" />} 
            color="#ed6c02"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <KPICard 
            title="Alertas de Estoque" 
            value={kpis.itens_baixo_estoque} 
            icon={<Warning fontSize="large" />} 
            color="#d32f2f"
          />
        </Grid>
      </Grid>

      {/* Seção de Alertas */}
      {lowStockItems.length > 0 && (
        <Card sx={{ mb: 4, borderLeft: '4px solid #d32f2f' }}>
          <CardContent>
            <Typography variant="h6" gutterBottom display="flex" alignItems="center" gap={1}>
              <Warning color="error" /> Produtos com Estoque Crítico
            </Typography>
            <Divider sx={{ mb: 2 }} />
            <List dense>
              {lowStockItems.map((item, index) => (
                <ListItem key={index}>
                  <ListItemText 
                    primary={`${item.produto} (${item.filial})`}
                    secondary={`Atual: ${item.quantidade_atual} | Mínimo: ${item.minimo}`}
                    primaryTypographyProps={{ fontWeight: 'bold' }}
                  />
                </ListItem>
              ))}
            </List>
          </CardContent>
        </Card>
      )}
    </Container>
  );
}
