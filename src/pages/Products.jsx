import { useState, useEffect } from 'react';
import {
  Container, Typography, Button, Table, TableBody, TableCell,
  TableContainer, TableHead, TableRow, Paper, IconButton, Box, Chip
} from '@mui/material';
import { Edit, Delete, Add } from '@mui/icons-material';
import { productService } from '../services/productService';
import ProductForm from '../components/ProductForm';

export default function Products() {
  const [products, setProducts] = useState([]);
  const [openModal, setOpenModal] = useState(false);
  const [currentProduct, setCurrentProduct] = useState(null);

  useEffect(() => {
    loadProducts();
  }, []);

  const loadProducts = async () => {
    try {
      const data = await productService.getAll();
      setProducts(data);
    } catch (error) {
      console.error(error);
    }
  };

  const handleAdd = () => {
    setCurrentProduct(null);
    setOpenModal(true);
  };

  const handleEdit = (product) => {
    setCurrentProduct(product);
    setOpenModal(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Tem certeza que deseja excluir este produto?')) {
      try {
        await productService.delete(id);
        loadProducts();
      } catch (error) {
        console.error(error);
      }
    }
  };

  const handleSave = async (formData) => {
    try {
      if (currentProduct) {
        await productService.update(currentProduct.id, formData);
      } else {
        await productService.create(formData);
      }
      setOpenModal(false);
      loadProducts();
    } catch (error) {
      console.error(error);
      alert('Erro ao salvar produto');
    }
  };

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h4" component="h1">
          Catálogo de Produtos
        </Typography>
        <Button
          variant="contained"
          color="primary"
          startIcon={<Add />}
          onClick={handleAdd}
        >
          Novo Produto
        </Button>
      </Box>

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Código</TableCell>
              <TableCell>Nome</TableCell>
              <TableCell>Categoria</TableCell>
              <TableCell>Tipo</TableCell>
              <TableCell>Status</TableCell>
              <TableCell align="right">Ações</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {products.map((product) => (
              <TableRow key={product.id}>
                <TableCell>{product.codigo_barras}</TableCell>
                <TableCell>{product.nome}</TableCell>
                <TableCell>{product.categoria_nome || '-'}</TableCell>
                <TableCell>{product.tipo_produto}</TableCell>
                <TableCell>
                  <Chip
                    label={product.esta_ativo ? 'Ativo' : 'Inativo'}
                    color={product.esta_ativo ? 'success' : 'default'}
                    size="small"
                  />
                </TableCell>
                <TableCell align="right">
                  <IconButton color="primary" onClick={() => handleEdit(product)}>
                    <Edit />
                  </IconButton>
                  <IconButton color="error" onClick={() => handleDelete(product.id)}>
                    <Delete />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      <ProductForm
        open={openModal}
        handleClose={() => setOpenModal(false)}
        productToEdit={currentProduct}
        onSave={handleSave}
      />
    </Container>
  );
}
