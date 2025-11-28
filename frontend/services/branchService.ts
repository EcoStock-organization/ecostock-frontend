import { coreApi } from "@/lib/api"
import type { Branch } from "@/lib/types"

export const getBranches = async (): Promise<Branch[]> => {
  const response = await coreApi.get("/filiais/")
  return response.data
}
