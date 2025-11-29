import { coreApi } from "@/lib/api"

export const createSale = async (branchId: string | number) => {
  const response = await coreApi.post("/vendas/", { filial: branchId })
  return response.data
}

export const addItemToSale = async (saleId: string, productId: number, quantity: number) => {
  const response = await coreApi.post(`/vendas/${saleId}/adicionar_item/`, {
    produto_id: productId,
    quantidade: quantity
  })
  return response.data
}

export const finalizeSale = async (saleId: string, paymentMethod: string) => {
  const response = await coreApi.post(`/vendas/${saleId}/finalizar_venda/`, {
    forma_pagamento: paymentMethod
  })
  return response.data
}

export const removeItemFromSale = async (saleId: string, itemId: number) => {
  const response = await coreApi.delete(`/vendas/${saleId}/itens/${itemId}/`)
  return response.data
}

export const updateItemQuantityInSale = async (saleId: string, itemId: number, newQuantity: number) => {
  const response = await coreApi.patch(`/vendas/${saleId}/itens/${itemId}/atualizar_quantidade/`, {
    quantidade: newQuantity
  })
  return response.data
}