"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Edit, Trash2, Plus, Save, X } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { coreApi } from "@/lib/api"
import type { Category } from "@/lib/types"

interface CategoryManagerProps {
  isOpen: boolean
  onClose: () => void
  onUpdate: () => void
}

export function CategoryManager({ isOpen, onClose, onUpdate }: CategoryManagerProps) {
  const [categories, setCategories] = useState<Category[]>([])
  const [editingId, setEditingId] = useState<number | null>(null)
  const [editName, setEditName] = useState("")
  const [newName, setNewName] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const { toast } = useToast()

  const fetchCategories = async () => {
    try {
      const res = await coreApi.get("/produtos/categorias/")
      setCategories(res.data)
    } catch (error) {
      console.error(error)
    }
  }

  useEffect(() => {
    if (isOpen) fetchCategories()
  }, [isOpen])

  const handleAdd = async () => {
    if (!newName.trim()) return
    setIsLoading(true)
    try {
      await coreApi.post("/produtos/categorias/", { nome: newName })
      setNewName("")
      toast({ title: "Categoria criada" })
      fetchCategories()
      onUpdate()
    } catch (error) {
      toast({ title: "Erro ao criar", variant: "destructive" })
    } finally {
      setIsLoading(false)
    }
  }

  const handleUpdate = async (id: number) => {
    if (!editName.trim()) return
    setIsLoading(true)
    try {
      await coreApi.patch(`/produtos/categorias/${id}/`, { nome: editName })
      setEditingId(null)
      setEditName("")
      toast({ title: "Categoria atualizada" })
      fetchCategories()
      onUpdate()
    } catch (error) {
      toast({ title: "Erro ao atualizar", variant: "destructive" })
    } finally {
      setIsLoading(false)
    }
  }

  const handleDelete = async (id: number) => {
    if (!confirm("Excluir esta categoria? Produtos associados podem ficar sem categoria.")) return
    try {
      await coreApi.delete(`/produtos/categorias/${id}/`)
      toast({ title: "Categoria removida" })
      fetchCategories()
      onUpdate()
    } catch (error) {
        toast({ title: "Não foi possível excluir", description: "Verifique se há produtos vinculados.", variant: "destructive" })
    }
  }

  const startEdit = (cat: Category) => {
    setEditingId(cat.id)
    setEditName(cat.nome)
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Gerenciar Categorias</DialogTitle>
          <DialogDescription>Adicione, edite ou remova categorias de produtos.</DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Adicionar Nova */}
          <div className="flex gap-2 items-end">
            <div className="flex-1">
              <Label htmlFor="new-cat" className="sr-only">Nova Categoria</Label>
              <Input 
                id="new-cat" 
                placeholder="Nome da nova categoria" 
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
              />
            </div>
            <Button onClick={handleAdd} disabled={isLoading || !newName}>
              <Plus className="h-4 w-4" />
            </Button>
          </div>

          {/* Lista */}
          <div className="border rounded-md max-h-[300px] overflow-y-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nome</TableHead>
                  <TableHead className="w-[100px]">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {categories.map((cat) => (
                  <TableRow key={cat.id}>
                    <TableCell>
                      {editingId === cat.id ? (
                        <Input 
                            value={editName} 
                            onChange={(e) => setEditName(e.target.value)} 
                            className="h-8"
                        />
                      ) : (
                        cat.nome
                      )}
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-1">
                        {editingId === cat.id ? (
                          <>
                            <Button size="sm" variant="ghost" onClick={() => handleUpdate(cat.id)} disabled={isLoading}>
                                <Save className="h-4 w-4 text-green-600" />
                            </Button>
                            <Button size="sm" variant="ghost" onClick={() => setEditingId(null)}>
                                <X className="h-4 w-4" />
                            </Button>
                          </>
                        ) : (
                          <>
                            <Button size="sm" variant="ghost" onClick={() => startEdit(cat)}>
                                <Edit className="h-4 w-4" />
                            </Button>
                            <Button size="sm" variant="ghost" onClick={() => handleDelete(cat.id)}>
                                <Trash2 className="h-4 w-4 text-destructive" />
                            </Button>
                          </>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}