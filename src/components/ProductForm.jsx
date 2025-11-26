import { useState, useEffect } from 'react';
import {
  Dialog, DialogTitle, DialogContent, DialogActions,
  TextField, Button, Select, MenuItem, FormControl,
  InputLabel, Grid, FormControlLabel, Switch
} from '@mui/material';
import { productService } from '../services/productService';

export default function ProductForm({ open, handleClose, productToEdit, onSave }) {
  const [formData, setFormData] = useState({
    nome: '',
    codigo_barras: '',
    descricao: '',
    tipo_produto: 'UNITARIO',
    id_categoria: '',
    esta_ativo: true
  });
  const [categorias, setCategorias] = useState([]);

  useEffect(() => {
    loadCategorias();
  }, []);

  useEffect(() => {
    if (productToEdit) {
      setFormData({
        nome: productToEdit.nome || '',
        codigo_barras: productToEdit.codigo_barras || '',
        descricao: productToEdit.descricao || '',
        tipo_produto: productToEdit.tipo_produto || 'UNITARIO',
        id_categoria: productToEdit.id_categoria || '',
        esta_ativo: productToEdit.esta_ativo ?? true
      });
    } else {
      setFormData({
        nome: '',
        codigo_barras: '',
        descricao: '',
        tipo_produto: 'UNITARIO',
        id_categoria: '',
        esta_ativo: true
      });
    }
  }, [productToEdit, open]);

  const loadCategorias = async () => {
    try {
      const data = await productService.getCategorias();
      setCategorias(data);
    } catch (error) {
      console.error(error);
    }
  };

  const handleChange = (e) => {
    const { name, value, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'esta_ativo' ? checked : value
    }));
  };

  const handleSubmit = () => {
    onSave(formData);
  };

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
      <DialogTitle>{productToEdit ? 'Editar Produto' : 'Novo Produto'}</DialogTitle>
      <DialogContent>
        <Grid container spacing={2} sx={{ mt: 1 }}>
          <Grid item xs={12}>
            <TextField
              name="nome"
              label="Nome do Produto"
              fullWidth
              value={formData.nome}
              onChange={handleChange}
            />
          </Grid>
          <Grid item xs={6}>
            <TextField
              name="codigo_barras"
              label="Código de Barras"
              fullWidth
              value={formData.codigo_barras}
              onChange={handleChange}
            />
          </Grid>
          <Grid item xs={6}>
            <FormControl fullWidth>
              <InputLabel>Tipo</InputLabel>
              <Select
                name="tipo_produto"
                value={formData.tipo_produto}
                label="Tipo"
                onChange={handleChange}
              >
                <MenuItem value="UNITARIO">Unitário</MenuItem>
                <MenuItem value="PESAVEL">Pesável</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12}>
            <FormControl fullWidth>
              <InputLabel>Categoria</InputLabel>
              <Select
                name="id_categoria"
                value={formData.id_categoria}
                label="Categoria"
                onChange={handleChange}
              >
                <MenuItem value=""><em>Nenhuma</em></MenuItem>
                {categorias.map((cat) => (
                  <MenuItem key={cat.id} value={cat.id}>
                    {cat.nome}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12}>
            <TextField
              name="descricao"
              label="Descrição"
              fullWidth
              multiline
              rows={3}
              value={formData.descricao}
              onChange={handleChange}
            />
          </Grid>
          <Grid item xs={12}>
            <FormControlLabel
              control={
                <Switch
                  checked={formData.esta_ativo}
                  onChange={handleChange}
                  name="esta_ativo"
                />
              }
              label="Ativo"
            />
          </Grid>
        </Grid>
      </DialogContent>
      <DialogActions>
        <Button onClick={handleClose}>Cancelar</Button>
        <Button onClick={handleSubmit} variant="contained" color="primary">
          Salvar
        </Button>
      </DialogActions>
    </Dialog>
  );
}
