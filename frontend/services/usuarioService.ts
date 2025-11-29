import { coreApi } from "@/lib/api"

type UserPayload = {
  nome_completo: string
  email: string
  cargo: string
  filial: number | null
  ativo: boolean
  password?: string
  username?: string
  cpf?: string | null
}

export const criarUsuario = async (data: UserPayload) => {
  const response = await coreApi.post("/usuarios/criar/", data)
  return response.data
}

export const atualizarUsuario = async (id: string | number, data: UserPayload) => {
  const response = await coreApi.patch(`/usuarios/${id}/`, data)
  return response.data
}
