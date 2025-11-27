import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function getCategoryColor(categoryName: string): string {
  const categoryMap: Record<string, string> = {
    Mercearia: "bg-category-mercearia",
    Hortifruti: "bg-category-hortifruti",
    Congelados: "bg-category-congelados",
    Bebidas: "bg-category-bebidas",
    "Higiene e Limpeza": "bg-category-higiene",
  }
  return categoryMap[categoryName] || "bg-muted"
}

export function getCategoryColorHex(categoryName: string): string {
  const categoryMap: Record<string, string> = {
    Mercearia: "#FF9F0A",
    Hortifruti: "#32D74B",
    Congelados: "#64D2FF",
    Bebidas: "#BF5AF2",
    "Higiene e Limpeza": "#FF375F",
  }
  return categoryMap[categoryName] || "#8E8E93"
}
