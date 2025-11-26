import api from './api';

export const saleService = {
  // Cria a venda inicial (Rascunho)
  create: async (branchId) => {
    const response = await api.post('/vendas/', { filial: branchId });
    return response.data;
  },
  
  // Adiciona item à venda
  addItem: async (saleId, productId, quantity) => {
    const response = await api.post(`/vendas/${saleId}/adicionar_item/`, {
      produto_id: productId,
      quantidade: quantity
    });
    return response.data;
  },
  
  // Finaliza e efetiva a baixa no estoque
  finalize: async (saleId, paymentMethod) => {
    const response = await api.post(`/vendas/${saleId}/finalizar_venda/`, {
      forma_pagamento: paymentMethod
    });
    return response.data;
  },

  // Função auxiliar para fazer tudo de uma vez (Transaction Script no Front)
  processFullSale: async (branchId, items, paymentMethod) => {
    try {
      // 1. Abre a venda
      const sale = await saleService.create(branchId);
      
      // 2. Adiciona itens um por um (Promise.all para agilidade)
      const addPromises = items.map(item => 
        saleService.addItem(sale.id, item.id, item.qty)
      );
      await Promise.all(addPromises);
      
      // 3. Finaliza
      const finalSale = await saleService.finalize(sale.id, paymentMethod);
      return finalSale;
    } catch (error) {
      console.error("Erro ao processar venda", error);
      throw error;
    }
  }
};
