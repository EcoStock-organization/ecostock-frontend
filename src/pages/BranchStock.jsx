import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Container, Typography, Button, Table, TableBody, TableCell,
  TableContainer, TableHead, TableRow, Paper, IconButton, Box, Chip
} from '@mui/material';
import { Edit, Delete, Add, ArrowBack } from '@mui/icons-material';
import { stockService } from '../services/stockService';
import { branchService } from '../services/branchService';
import StockForm from '../components/StockForm';

export default function BranchStock() {
  const { id } = useParams(); // Pega o ID da filial da URL
  const navigate = useNavigate();
  
  const [items, setItems] = useState([]);
  const [branchName, setBranchName] = useState('');
  const [openModal, setOpenModal] = useState(false);
  const [currentItem, setCurrentItem] = useState(null);

  useEffect(() => {
    loadData();
  }, [id]);

  const loadData = async () => {
    try {
      const branch = await branchService.getById(id);
      setBranchName(branch.nome);
      
      const stock = await stockService.getByBranch(id);
      setItems(stock);
    } catch (error) {
      console.error(error);
      alert('Erro ao carregar dados');
    }
  };

  const handleAdd = () => {
    setCurrentItem(null);
    setOpenModal(true);
  };

  const handleEdit = (item) => {
    setCurrentItem(item);
    setOpenModal(true);
  };

  const handleDelete = async (itemId) => {
    if (window.confirm('Remover este produto do estoque?')) {
      try {
        await stockService.delete(id, itemId);
        loadData();
      } catch (error) {
        console.error(error);
      }
    }
  };

  const handleSave = async (formData) => {
    try {
      if (currentItem) {
        await stockService.update(id, currentItem.id, formData);
      } else {
        await stockService.add(id, formData);
      }
      setOpenModal(false);
      loadData();
    } catch (error) {
      console.error(error);
      alert('Erro ao salvar item de estoque');
    }
  };

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Button startIcon={<ArrowBack />} onClick={() => navigate('/filiais')} sx={{ mb: 2 }}>
        Voltar para Filiais
      </Button>

      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h4" component="h1">
          Estoque: {branchName}
        </Typography>
        <Button variant="contained" color="primary" startIcon={<Add />} onClick={handleAdd}>
          Adicionar Produto
        </Button>
      </Box>

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Produto</TableCell>
              <TableCell>Código</TableCell>
              <TableCell>Qtd Atual</TableCell>
              <TableCell>Qtd Mínima</TableCell>
              <TableCell>Preço Venda</TableCell>
              <TableCell align="right">Ações</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {items.map((item) => (
              <TableRow key={item.id}>
                <TableCell>{item.produto.nome}</TableCell>
                <TableCell>{item.produto.codigo_barras}</TableCell>
                <TableCell>
                  <Chip 
                    label={item.quantidade_atual} 
                    color={item.quantidade_atual < item.quantidade_minima_estoque ? 'error' : 'success'} 
                  />
                </TableCell>
                <TableCell>{item.quantidade_minima_estoque}</TableCell>
                <TableCell>R$ {item.preco_venda_atual}</TableCell>
                <TableCell align="right">
                  <IconButton color="primary" onClick={() => handleEdit(item)}>
                    <Edit />
                  </IconButton>
                  <IconButton color="error" onClick={() => handleDelete(item.id)}>
                    <Delete />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      <StockForm
        open={openModal}
        handleClose={() => setOpenModal(false)}
        itemToEdit={currentItem}
        onSave={handleSave}
      />
    </Container>
  );
}
