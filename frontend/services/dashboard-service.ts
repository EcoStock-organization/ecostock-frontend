import { coreApi } from "@/lib/api"
import type { DashboardMetrics, Sale, InventoryItem } from "@/lib/types"

export const getDashboardMetrics = async (): Promise<DashboardMetrics> => {
  const response = await coreApi.get("/dashboard/")
  return response.data
}

export const getRecentSales = async (): Promise<Sale[]> => {
  const response = await coreApi.get("/dashboard/recent-sales/")
  return response.data
}

export const getStockAlerts = async (): Promise<InventoryItem[]> => {
  const response = await coreApi.get("/dashboard/alerts/")
  return response.data
}