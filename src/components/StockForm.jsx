import { useState, useEffect } from 'react';
import {
  Dialog, DialogTitle, DialogContent, DialogActions,
  TextField, Button, Select, MenuItem, FormControl,
  InputLabel, Grid, Typography
} from '@mui/material';
import { productService } from '../services/productService';

export default function StockForm({ open, handleClose, onSave, itemToEdit }) {
  const [products, setProducts] = useState([]);
  const [formData, setFormData] = useState({
    produto_id: '',
    quantidade_atual: '',
    preco_venda_atual: '',
    quantidade_minima_estoque: ''
  });

  useEffect(() => {
    loadProducts();
  }, []);

  useEffect(() => {
    if (itemToEdit) {
      setFormData({
        produto_id: itemToEdit.produto.id, // Em edição, geralmente não mudamos o produto, mas ok
        quantidade_atual: itemToEdit.quantidade_atual,
        preco_venda_atual: itemToEdit.preco_venda_atual,
        quantidade_minima_estoque: itemToEdit.quantidade_minima_estoque
      });
    } else {
      setFormData({
        produto_id: '',
        quantidade_atual: '',
        preco_venda_atual: '',
        quantidade_minima_estoque: ''
      });
    }
  }, [itemToEdit, open]);

  const loadProducts = async () => {
    try {
      const data = await productService.getAll();
      // Só mostra produtos ativos
      setProducts(data.filter(p => p.esta_ativo));
    } catch (error) {
      console.error(error);
    }
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = () => {
    onSave(formData);
  };

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
      <DialogTitle>{itemToEdit ? 'Editar Item' : 'Adicionar ao Estoque'}</DialogTitle>
      <DialogContent>
        <Grid container spacing={2} sx={{ mt: 1 }}>
          <Grid item xs={12}>
            <FormControl fullWidth disabled={!!itemToEdit}>
              <InputLabel>Produto</InputLabel>
              <Select
                name="produto_id"
                value={formData.produto_id}
                label="Produto"
                onChange={handleChange}
              >
                {products.map((prod) => (
                  <MenuItem key={prod.id} value={prod.id}>
                    {prod.nome} ({prod.codigo_barras})
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={4}>
            <TextField
              name="quantidade_atual"
              label="Qtd Atual"
              type="number"
              fullWidth
              value={formData.quantidade_atual}
              onChange={handleChange}
            />
          </Grid>
          <Grid item xs={4}>
            <TextField
              name="preco_venda_atual"
              label="Preço Venda (R$)"
              type="number"
              fullWidth
              value={formData.preco_venda_atual}
              onChange={handleChange}
            />
          </Grid>
          <Grid item xs={4}>
            <TextField
              name="quantidade_minima_estoque"
              label="Qtd Mínima"
              type="number"
              fullWidth
              value={formData.quantidade_minima_estoque}
              onChange={handleChange}
            />
          </Grid>
        </Grid>
      </DialogContent>
      <DialogActions>
        <Button onClick={handleClose}>Cancelar</Button>
        <Button onClick={handleSubmit} variant="contained" color="primary">Salvar</Button>
      </DialogActions>
    </Dialog>
  );
}
