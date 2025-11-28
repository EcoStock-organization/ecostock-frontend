import { coreApi } from "@/lib/api"

export interface SalesChartData {
  month: string
  receita: number
  custo: number
  [key: string]: string | number // Necessário para Recharts
}

export interface CategoryChartData {
  name: string
  value: number
  [key: string]: string | number // Necessário para Recharts
}

export const getSalesChartData = async (): Promise<SalesChartData[]> => {
  const response = await coreApi.get("/reports/sales-chart/")
  return response.data
}

export const getCategoryChartData = async (): Promise<CategoryChartData[]> => {
  const response = await coreApi.get("/reports/category-chart/")
  return response.data
}