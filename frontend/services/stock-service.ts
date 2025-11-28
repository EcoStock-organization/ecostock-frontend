import { coreApi } from "@/lib/api"
import type { InventoryItem } from "@/lib/types"

export const getBranchStock = async (branchId: string): Promise<InventoryItem[]> => {
  // Busca o estoque da filial específica
  const response = await coreApi.get(`/filiais/${branchId}/estoque/`)
  return response.data
}