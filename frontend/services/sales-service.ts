import { coreApi } from "@/lib/api"

export const createSale = async (branchId: string | number) => {
  // Cria uma nova venda vazia
  const response = await coreApi.post("/vendas/", { filial: branchId })
  return response.data
}

export const addItemToSale = async (saleId: string, productId: number, quantity: number) => {
  // Adiciona item à venda (o backend já valida o estoque)
  const response = await coreApi.post(`/vendas/${saleId}/adicionar_item/`, {
    produto_id: productId,
    quantidade: quantity
  })
  return response.data
}

export const finalizeSale = async (saleId: string, paymentMethod: string) => {
  // Finaliza a venda
  const response = await coreApi.post(`/vendas/${saleId}/finalizar_venda/`, {
    forma_pagamento: paymentMethod
  })
  return response.data
}