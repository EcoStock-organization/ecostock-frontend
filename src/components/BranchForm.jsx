import { useState, useEffect } from 'react';
import {
  Dialog, DialogTitle, DialogContent, DialogActions,
  TextField, Button, Grid, FormControlLabel, Switch
} from '@mui/material';

export default function BranchForm({ open, handleClose, branchToEdit, onSave }) {
  const [formData, setFormData] = useState({
    nome: '',
    cep: '',
    logradouro: '',
    cidade: '',
    estado: '',
    gerente_id: '',
    esta_ativa: true
  });

  useEffect(() => {
    if (branchToEdit) {
      setFormData({
        nome: branchToEdit.nome || '',
        cep: branchToEdit.cep || '',
        logradouro: branchToEdit.logradouro || '',
        cidade: branchToEdit.cidade || '',
        estado: branchToEdit.estado || '',
        gerente_id: branchToEdit.gerente_id || '',
        esta_ativa: branchToEdit.esta_ativa ?? true
      });
    } else {
      setFormData({
        nome: '', cep: '', logradouro: '', cidade: '', estado: '',
        gerente_id: '', esta_ativa: true
      });
    }
  }, [branchToEdit, open]);

  const handleChange = (e) => {
    const { name, value, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'esta_ativa' ? checked : value
    }));
  };

  const handleSubmit = () => {
    const payload = {
      ...formData,
      gerente_id: formData.gerente_id === '' ? null : formData.gerente_id
    };
    onSave(payload);
  };

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
      <DialogTitle>{branchToEdit ? 'Editar Filial' : 'Nova Filial'}</DialogTitle>
      <DialogContent>
        <Grid container spacing={2} sx={{ mt: 1 }}>
          <Grid item xs={12}>
            <TextField name="nome" label="Nome da Filial" fullWidth value={formData.nome} onChange={handleChange} />
          </Grid>
          <Grid item xs={4}>
            <TextField name="cep" label="CEP" fullWidth value={formData.cep} onChange={handleChange} />
          </Grid>
          <Grid item xs={8}>
            <TextField name="logradouro" label="Logradouro" fullWidth value={formData.logradouro} onChange={handleChange} />
          </Grid>
          <Grid item xs={8}>
            <TextField name="cidade" label="Cidade" fullWidth value={formData.cidade} onChange={handleChange} />
          </Grid>
          <Grid item xs={4}>
            <TextField name="estado" label="UF" fullWidth value={formData.estado} onChange={handleChange} />
          </Grid>
          <Grid item xs={12}>
            <TextField 
              name="gerente_id" 
              label="ID do Gerente (Opcional)" 
              type="number" 
              fullWidth 
              value={formData.gerente_id} 
              onChange={handleChange} 
              helperText="Digite o ID do usuário gerente criado no Auth"
            />
          </Grid>
          <Grid item xs={12}>
            <FormControlLabel
              control={<Switch checked={formData.esta_ativa} onChange={handleChange} name="esta_ativa" />}
              label="Ativa"
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
