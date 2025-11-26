import { useState, useEffect } from 'react';
import {
  Container, Grid, Paper, Typography, TextField, Button,
  List, ListItem, ListItemText, ListItemSecondaryAction,
  IconButton, Box, Autocomplete, Divider, Card, CardContent,
  Select, MenuItem, FormControl, InputLabel
} from '@mui/material';
import { Delete, ShoppingCart, Receipt, PointOfSale } from '@mui/icons-material';
import { productService } from '../services/productService';
import { branchService } from '../services/branchService';
import { saleService } from '../services/saleService';
import { useAuth } from '../contexts/AuthContext';

export default function Checkout() {
  const { user } = useAuth();
  
  const [products, setProducts] = useState([]);
  const [branches, setBranches] = useState([]);
  
  // Estado do Carrinho
  const [selectedBranch, setSelectedBranch] = useState('');
  const [cart, setCart] = useState([]);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [paymentMethod, setPaymentMethod] = useState('DINHEIRO');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadInitialData();
  }, []);

  const loadInitialData = async () => {
    try {
      const [prodsData, branchesData] = await Promise.all([
        productService.getAll(),
        branchService.getAll()
      ]);
      // Filtra apenas produtos ativos
      setProducts(prodsData.filter(p => p.esta_ativo));
      setBranches(branchesData);
      
      // Se tiver filiais, seleciona a primeira automaticamente (facilitador)
      if (branchesData.length > 0) setSelectedBranch(branchesData[0].id);
    } catch (error) {
      console.error(error);
    }
  };

  const addToCart = () => {
    if (!selectedProduct || quantity <= 0) return;

    const existingItem = cart.find(item => item.id === selectedProduct.id);
    if (existingItem) {
      setCart(cart.map(item => 
        item.id === selectedProduct.id 
          ? { ...item, qty: item.qty + parseFloat(quantity) }
          : item
      ));
    } else {
      setCart([...cart, { ...selectedProduct, qty: parseFloat(quantity) }]);
    }
    
    // Reset inputs
    setSelectedProduct(null);
    setQuantity(1);
  };

  const removeFromCart = (id) => {
    setCart(cart.filter(item => item.id !== id));
  };

  const handleFinalize = async () => {
    if (cart.length === 0) return alert("Carrinho vazio");
    if (!selectedBranch) return alert("Selecione uma filial");

    setLoading(true);
    try {
      await saleService.processFullSale(selectedBranch, cart, paymentMethod);
      alert("Venda realizada com sucesso!");
      setCart([]);
      setQuantity(1);
    } catch (error) {
      alert("Erro ao finalizar venda. Verifique o estoque.");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  // Cálculo simples de total (Mockado pois o preço real vem do ItemEstoque no backend)
  // Para o protótipo, assumimos um preço visual ou zero, já que o backend calcula o real.
  // Numa implementação real, teríamos que buscar o preço da filial antes.
  
  return (
    <Container maxWidth="xl" sx={{ mt: 4, mb: 4, height: '85vh' }}>
      <Grid container spacing={3} sx={{ height: '100%' }}>
        
        {/* Lado Esquerdo: Seleção e Busca */}
        <Grid item xs={12} md={7}>
          <Paper sx={{ p: 3, height: '100%', display: 'flex', flexDirection: 'column', gap: 3 }}>
            <Box display="flex" justifyContent="space-between" alignItems="center">
              <Typography variant="h5" component="h2" display="flex" alignItems="center" gap={1}>
                <PointOfSale color="primary" /> Frente de Caixa
              </Typography>
              
              <FormControl size="small" sx={{ minWidth: 200 }}>
                <InputLabel>Filial Atual</InputLabel>
                <Select
                  value={selectedBranch}
                  label="Filial Atual"
                  onChange={(e) => setSelectedBranch(e.target.value)}
                >
                  {branches.map(b => (
                    <MenuItem key={b.id} value={b.id}>{b.nome}</MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Box>

            <Divider />

            <Box sx={{ flexGrow: 1 }}>
              <Typography variant="subtitle1" gutterBottom>Adicionar Produto</Typography>
              
              <Box display="flex" gap={2} mb={2}>
                <Autocomplete
                  fullWidth
                  options={products}
                  getOptionLabel={(option) => `${option.nome} (${option.codigo_barras})`}
                  value={selectedProduct}
                  onChange={(_, newValue) => setSelectedProduct(newValue)}
                  renderInput={(params) => <TextField {...params} label="Buscar por nome ou código" autoFocus />}
                />
                <TextField
                  label="Qtd"
                  type="number"
                  sx={{ width: 100 }}
                  value={quantity}
                  onChange={(e) => setQuantity(e.target.value)}
                />
              </Box>
              
              <Button 
                variant="contained" 
                size="large" 
                fullWidth 
                onClick={addToCart}
                disabled={!selectedProduct}
              >
                Adicionar ao Carrinho (Enter)
              </Button>

              {/* Grid de Atalhos (Produtos Comuns) - Visual Only */}
              <Typography variant="subtitle2" sx={{ mt: 4, mb: 2, color: 'text.secondary' }}>
                Itens Rápidos
              </Typography>
              <Grid container spacing={2}>
                {products.slice(0, 6).map(prod => (
                  <Grid item xs={4} key={prod.id}>
                    <Button 
                      variant="outlined" 
                      fullWidth 
                      sx={{ height: 80, display: 'flex', flexDirection: 'column' }}
                      onClick={() => {
                        setCart([...cart, { ...prod, qty: 1 }]);
                      }}
                    >
                      <Typography variant="caption" noWrap>{prod.nome}</Typography>
                    </Button>
                  </Grid>
                ))}
              </Grid>
            </Box>
          </Paper>
        </Grid>

        {/* Lado Direito: Carrinho e Pagamento */}
        <Grid item xs={12} md={5}>
          <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column', bgcolor: '#f8f9fa' }}>
            <CardContent sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column' }}>
              <Typography variant="h6" gutterBottom display="flex" alignItems="center" gap={1}>
                <ShoppingCart /> Cupom Fiscal
              </Typography>
              
              <Paper sx={{ flexGrow: 1, mb: 2, overflow: 'auto', maxHeight: '50vh' }}>
                <List>
                  {cart.length === 0 && (
                    <Typography variant="body2" sx={{ p: 2, textAlign: 'center', color: 'text.secondary' }}>
                      Nenhum item adicionado
                    </Typography>
                  )}
                  {cart.map((item, index) => (
                    <div key={index}>
                      <ListItem>
                        <ListItemText 
                          primary={item.nome} 
                          secondary={`Qtd: ${item.qty}`} 
                        />
                        <ListItemSecondaryAction>
                          <IconButton edge="end" onClick={() => removeFromCart(item.id)}>
                            <Delete color="error" />
                          </IconButton>
                        </ListItemSecondaryAction>
                      </ListItem>
                      <Divider />
                    </div>
                  ))}
                </List>
              </Paper>

              <Box sx={{ mt: 'auto' }}>
                <Typography variant="subtitle2" gutterBottom>Forma de Pagamento</Typography>
                <Grid container spacing={1} sx={{ mb: 3 }}>
                  {['DINHEIRO', 'CARTAO', 'PIX'].map((method) => (
                    <Grid item xs={4} key={method}>
                      <Button
                        variant={paymentMethod === method ? "contained" : "outlined"}
                        color={paymentMethod === method ? "success" : "primary"}
                        fullWidth
                        onClick={() => setPaymentMethod(method)}
                      >
                        {method}
                      </Button>
                    </Grid>
                  ))}
                </Grid>

                <Button 
                  variant="contained" 
                  color="success" 
                  size="large" 
                  fullWidth 
                  sx={{ height: 60, fontSize: '1.2rem' }}
                  onClick={handleFinalize}
                  disabled={loading || cart.length === 0}
                  startIcon={<Receipt />}
                >
                  {loading ? 'Processando...' : 'FINALIZAR VENDA'}
                </Button>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Container>
  );
}
