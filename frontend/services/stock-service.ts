import { coreApi } from "@/lib/api"
import type { InventoryItem } from "@/lib/types"

export const getBranchStock = async (branchId: string): Promise<InventoryItem[]> => {
  const response = await coreApi.get(`/filiais/${branchId}/estoque/`)
  return response.data
}