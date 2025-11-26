import { useState, useEffect } from 'react';
import {
  Container, Typography, Button, Table, TableBody, TableCell,
  TableContainer, TableHead, TableRow, Paper, IconButton, Box, Chip
} from '@mui/material';
import { Edit, Delete, Add, Store } from '@mui/icons-material';
import { branchService } from '../services/branchService';
import BranchForm from '../components/BranchForm';

export default function Branches() {
  const [branches, setBranches] = useState([]);
  const [openModal, setOpenModal] = useState(false);
  const [currentBranch, setCurrentBranch] = useState(null);

  useEffect(() => {
    loadBranches();
  }, []);

  const loadBranches = async () => {
    try {
      const data = await branchService.getAll();
      setBranches(data);
    } catch (error) {
      console.error(error);
    }
  };

  const handleAdd = () => {
    setCurrentBranch(null);
    setOpenModal(true);
  };

  const handleEdit = (branch) => {
    setCurrentBranch(branch);
    setOpenModal(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Tem certeza que deseja remover esta filial? Isso apagará todo o estoque e histórico de vendas dela.')) {
      try {
        await branchService.delete(id);
        loadBranches();
      } catch (error) {
        console.error(error);
        alert('Erro ao deletar filial');
      }
    }
  };

  const handleSave = async (formData) => {
    try {
      if (currentBranch) {
        await branchService.update(currentBranch.id, formData);
      } else {
        await branchService.create(formData);
      }
      setOpenModal(false);
      loadBranches();
    } catch (error) {
      console.error(error);
      alert('Erro ao salvar filial');
    }
  };

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h4" component="h1">
          Gestão de Filiais
        </Typography>
        <Button variant="contained" color="primary" startIcon={<Add />} onClick={handleAdd}>
          Nova Filial
        </Button>
      </Box>

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Nome</TableCell>
              <TableCell>Cidade/UF</TableCell>
              <TableCell>Gerente (ID)</TableCell>
              <TableCell>Status</TableCell>
              <TableCell align="right">Ações</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {branches.map((branch) => (
              <TableRow key={branch.id}>
                <TableCell>
                  <Box display="flex" alignItems="center" gap={1}>
                    <Store color="action" /> {branch.nome}
                  </Box>
                </TableCell>
                <TableCell>{branch.cidade} - {branch.estado}</TableCell>
                <TableCell>{branch.gerente_id || '-'}</TableCell>
                <TableCell>
                  <Chip
                    label={branch.esta_ativa ? 'Ativa' : 'Inativa'}
                    color={branch.esta_ativa ? 'success' : 'default'}
                    size="small"
                  />
                </TableCell>
                <TableCell align="right">
                  <IconButton color="primary" onClick={() => handleEdit(branch)}>
                    <Edit />
                  </IconButton>
                  <IconButton color="error" onClick={() => handleDelete(branch.id)}>
                    <Delete />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      <BranchForm
        open={openModal}
        handleClose={() => setOpenModal(false)}
        branchToEdit={currentBranch}
        onSave={handleSave}
      />
    </Container>
  );
}
