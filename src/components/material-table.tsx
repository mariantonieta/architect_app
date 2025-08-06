import * as React from "react"
import {
  DndContext,
  KeyboardSensor,
  MouseSensor,
  TouchSensor,
  closestCenter,
  useSensor,
  useSensors,
  type DragEndEvent,
  type UniqueIdentifier,
} from "@dnd-kit/core"
import { restrictToVerticalAxis } from "@dnd-kit/modifiers"
import { SortableContext, arrayMove, verticalListSortingStrategy } from "@dnd-kit/sortable"
import { Edit, Calendar, Plus, ChevronDown, ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight, MoreHorizontal, Columns, Save, Trash2 } from 'lucide-react'
import {
  type ColumnDef,
  type ColumnFiltersState,
  type SortingState,
  type VisibilityState,
  flexRender,
  getCoreRowModel,
  getFacetedRowModel,
  getFacetedUniqueValues,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
} from "@tanstack/react-table"
import { toast } from "sonner"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { type Material, } from "../types/material"
import { DragHandle } from "./drag-handle"
import { EditableCell } from "./editable-cell"
import { EditableSelect } from "./editable-select"
import { DraggableRow } from "./draggable-row"
import { AddMaterialRow } from "./add-material-row"


export const unitOptions = [
  { value: "kg", label: "kg" },
  { value: "u", label: "u" },
  { value: "m3", label: "m³" },
  { value: "m2", label: "m²" },
  { value: "m", label: "m" },
]

export const statusOptions = [
  { value: "Presupuestado", label: "Presupuestado" },
  { value: "En proceso", label: "En proceso" },
  { value: "Pendiente", label: "Pendiente" },
  { value: "Completado", label: "Completado" },
]

export const categoryOptions = [
  { value: "MAMPOSTERÍA Y TABIQUERÍA", label: "MAMPOSTERÍA Y TABIQUERÍA" },
  { value: "HORMIGÓN ARMADO", label: "HORMIGÓN ARMADO" },
  { value: "INSTALACIONES", label: "INSTALACIONES" },
  { value: "TERMINACIONES", label: "TERMINACIONES" },
]

interface MaterialsTableProps {
  data?: Material[]
}
export function MaterialsTable({ data: initialData = [] }: MaterialsTableProps) {

  const [data, setData] = React.useState(() => initialData)
  const [rowSelection, setRowSelection] = React.useState({})
  const [columnVisibility, setColumnVisibility] = React.useState<VisibilityState>({})
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>([])
  const [sorting, setSorting] = React.useState<SortingState>([])
  const [pagination, setPagination] = React.useState({
    pageIndex: 0,
    pageSize: 10,
  })
  const [isAddingMaterial, setIsAddingMaterial] = React.useState(false)

  const updateMaterial = (id: number, field: keyof Material, value: string | number) => {
    setData(prev => prev.map(item => 
      item.id === id ? { ...item, [field]: value } : item
    ))
  }

  const addNewMaterial = (materialData: Omit<Material, 'id'>) => {
    const newId = Math.max(...data.map(item => item.id), 0) + 1
    const newMaterial: Material = {
      id: newId,
      ...materialData,
    }
    setData(prev => [...prev, newMaterial])
    setIsAddingMaterial(false)
  }

  const deleteMaterial = (id: number) => {
    setData(prev => prev.filter(item => item.id !== id))
    toast.success("Material eliminado")
  }

  const materialsColumns: ColumnDef<Material>[] = [
    {
      id: "drag",
      header: () => null,
      cell: ({ row }) => <DragHandle id={row.original.id} />,
    },
    {
      id: "select",
      header: ({ table }) => (
        <div className="flex items-center justify-center">
          <Checkbox 
            checked={
              table.getIsAllPageRowsSelected()
                ? true
                : table.getIsSomePageRowsSelected()
                ? "indeterminate"
                : false
            }
            onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
            aria-label="Select all"
          />
        </div>
      ),
      cell: ({ row }) => (
        <div className="flex items-center justify-center">
          <Checkbox
            checked={row.getIsSelected()}
            onCheckedChange={(value) => row.toggleSelected(!!value)}
            aria-label="Select row"
          />
        </div>
      ),
      enableSorting: false,
      enableHiding: false,
    },
    {
      accessorKey: "item",
      header: "Item",
      cell: ({ row }) => (
        <EditableCell
          value={row.original.item}
          onSave={(value) => updateMaterial(row.original.id, "item", value)}
          className="font-semibold min-w-32"
          placeholder="Nombre del material"
        />
      ),
      enableHiding: false,
    },
    {
      accessorKey: "description",
      header: "Medida / Descripción",
      cell: ({ row }) => (
        <EditableCell
          value={row.original.description}
          onSave={(value) => updateMaterial(row.original.id, "description", value)}
          type="textarea"
          placeholder="Descripción del material"
        />
      ),
    },
    {
      accessorKey: "unit",
      header: "Unidad",
      cell: ({ row }) => (
        <div className="text-center">
          <EditableSelect
            value={row.original.unit}
            onSave={(value) => updateMaterial(row.original.id, "unit", value)}
            options={unitOptions}
            className="text-sm"
          />
        </div>
      ),
    },
    {
      accessorKey: "quantity",
      header: () => <div className="w-full text-right">Cantidad</div>,
      cell: ({ row }) => (
        <EditableCell
          value={row.original.quantity}
          onSave={(value) => updateMaterial(row.original.id, "quantity", value)}
          type="number"
          className="w-20 text-right"
          placeholder="0"
        />
      ),
    },
    {
      accessorKey: "category",
      header: "Rubro / Categoría",
      cell: ({ row }) => (
        <div className="min-w-32 space-y-1">
          <EditableSelect
            value={row.original.category}
            onSave={(value) => updateMaterial(row.original.id, "category", value)}
            options={categoryOptions}
            className="text-xs font-semibold"
          />
          <EditableCell
            value={row.original.subcategory}
            onSave={(value) => updateMaterial(row.original.id, "subcategory", value)}
            className="text-xs text-muted-foreground"
            placeholder="Subcategoría"
          />
        </div>
      ),
    },
    {
      accessorKey: "metricQuantity",
      header: () => <div className="w-full text-right">Cantidad métrica</div>,
      cell: ({ row }) => (
        <EditableCell
          value={row.original.metricQuantity}
          onSave={(value) => updateMaterial(row.original.id, "metricQuantity", value)}
          type="number"
          className="w-20 text-center"
          placeholder="0"
        />
      ),
    },
    {
      accessorKey: "updatedQuantity",
      header: () => <div className="w-full text-right">Actualizada</div>,
      cell: ({ row }) => (
        <EditableCell
          value={row.original.updatedQuantity}
          onSave={(value) => updateMaterial(row.original.id, "updatedQuantity", value)}
          type="number"
          className="w-20 text-right font-semibold text-primary"
          placeholder="0"
        />
      ),
    },
    {
      accessorKey: "finalUnit",
      header: "Unidad final",
      cell: ({ row }) => (
        <div className="text-center">
          <EditableSelect
            value={row.original.finalUnit}
            onSave={(value) => updateMaterial(row.original.id, "finalUnit", value)}
            options={unitOptions}
            className="text-primary"
          />
        </div>
      ),
    },
    {
      accessorKey: "status",
      header: "Estado",
      cell: ({ row }) => (
        <EditableSelect
          value={row.original.status}
          onSave={(value) => updateMaterial(row.original.id, "status", value)}
          options={statusOptions}
          className="text-xs"
        />
      ),
    },
    {
      id: "actions",
      cell: ({ row }) => (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="data-[state=open]:bg-muted text-muted-foreground flex size-8" size="icon">
              <MoreHorizontal />
              <span className="sr-only">Open menu</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-32">
            <DropdownMenuItem onClick={() => {
              const material = row.original
              const duplicated = { ...material, id: Math.max(...data.map(item => item.id)) + 1 }
              setData(prev => [...prev, duplicated])
              toast.success("Material duplicado")
            }}>
              Duplicar
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem 
              className="text-destructive focus:text-destructive"
              onClick={() => deleteMaterial(row.original.id)}
            >
              <Trash2 className="mr-2 h-4 w-4" />
              Eliminar
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      ),
    },
  ]

  const sortableId = React.useId()
  const sensors = useSensors(useSensor(MouseSensor, {}), useSensor(TouchSensor, {}), useSensor(KeyboardSensor, {}))
  const dataIds = React.useMemo<UniqueIdentifier[]>(() => data?.map(({ id }) => id) || [], [data])

  const table = useReactTable({
    data,
    columns: materialsColumns,
    state: {
      sorting,
      columnVisibility,
      rowSelection,
      columnFilters,
      pagination,
    },
    getRowId: (row) => row.id.toString(),
    enableRowSelection: true,
    onRowSelectionChange: setRowSelection,
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    onColumnVisibilityChange: setColumnVisibility,
    onPaginationChange: setPagination,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFacetedRowModel: getFacetedRowModel(),
    getFacetedUniqueValues: getFacetedUniqueValues(),
  })

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event
    if (active && over && active.id !== over.id) {
      setData((data) => {
        const oldIndex = dataIds.indexOf(active.id)
        const newIndex = dataIds.indexOf(over.id)
        return arrayMove(data, oldIndex, newIndex)
      })
    }
  }

  return (
    <Tabs defaultValue="materials" className="w-full flex-col justify-start gap-6">
      <div className="flex items-center justify-between px-4 lg:px-6">
        <div className="flex items-center gap-3">
          <h1 className="text-2xl font-bold tracking-tight">Lista de Materiales Calculados</h1>
          <Button variant="ghost" size="icon" className="h-6 w-6">
            <Edit className="h-4 w-4" />
          </Button>
          <Avatar className="w-6 h-6">
            <AvatarFallback className="text-xs">U</AvatarFallback>
          </Avatar>
        </div>
        <div className="flex items-center gap-2">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm">
                <Columns />
                <span className="hidden lg:inline">Personalizar Columnas</span>
                <span className="lg:hidden">Columnas</span>
                <ChevronDown />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              {table
                .getAllColumns()
                .filter((column) => typeof column.accessorFn !== "undefined" && column.getCanHide())
                .map((column) => {
                  return (
                    <DropdownMenuCheckboxItem
                      key={column.id}
                      className="capitalize"
                      checked={column.getIsVisible()}
                      onCheckedChange={(value) => column.toggleVisibility(!!value)}
                    >
                      {column.id}
                    </DropdownMenuCheckboxItem>
                  )
                })}
            </DropdownMenuContent>
          </DropdownMenu>
          <Button 
            className="bg-primary hover:bg-primary/90" 
            size="sm" 
            onClick={() => setIsAddingMaterial(true)}
            disabled={isAddingMaterial}
          >
            <Plus />
            <span className="hidden lg:inline">Agregar Material</span>
          </Button>
        </div>
      </div>
      
      <div className="flex items-center gap-2 px-4 lg:px-6 text-sm text-muted-foreground">
        <Calendar className="w-4 h-4" />
        <span>Generado el 24 de julio de 2025, 02:11 p. m.</span>
        <Badge variant="secondary" className="ml-4">
          <Save className="w-3 h-3 mr-1" />
          Edición inline habilitada
        </Badge>
      </div>
      
      <TabsContent value="materials" className="relative flex flex-col gap-4 overflow-auto px-4 lg:px-6">
        <div className="overflow-hidden rounded-lg border">
          <DndContext
            collisionDetection={closestCenter}
            modifiers={[restrictToVerticalAxis]}
            onDragEnd={handleDragEnd}
            sensors={sensors}
            id={sortableId}
          >
            <Table>
              <TableHeader className="bg-muted sticky top-0 z-10">
                {table.getHeaderGroups().map((headerGroup) => (
                  <TableRow key={headerGroup.id}>
                    {headerGroup.headers.map((header) => {
                      return (
                        <TableHead key={header.id} colSpan={header.colSpan}>
                          {header.isPlaceholder
                            ? null
                            : flexRender(header.column.columnDef.header, header.getContext())}
                        </TableHead>
                      )
                    })}
                  </TableRow>
                ))}
              </TableHeader>
              <TableBody className="**:data-[slot=table-cell]:first:w-8">
                {isAddingMaterial && (
                  <AddMaterialRow
                    onAdd={addNewMaterial}
                    onCancel={() => setIsAddingMaterial(false)}
                  />
                )}
                {table.getRowModel().rows?.length ? (
                  <SortableContext items={dataIds} strategy={verticalListSortingStrategy}>
                    {table.getRowModel().rows.map((row) => (
                      <DraggableRow key={row.id} row={row} />
                    ))}
                  </SortableContext>
                ) : (
                  <TableRow>
                    <TableCell colSpan={materialsColumns.length} className="h-24 text-center">
                      No hay materiales.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </DndContext>
        </div>
        
        <div className="flex items-center justify-between px-4">
          <div className="text-muted-foreground hidden flex-1 text-sm lg:flex">
            {table.getFilteredSelectedRowModel().rows.length} de {table.getFilteredRowModel().rows.length} fila(s)
            seleccionadas.
          </div>
          <div className="flex w-full items-center gap-8 lg:w-fit">
            <div className="hidden items-center gap-2 lg:flex">
              <Label htmlFor="rows-per-page" className="text-sm font-medium">
                Filas por página
              </Label>
              <Select
                value={`${table.getState().pagination.pageSize}`}
                onValueChange={(value) => {
                  table.setPageSize(Number(value))
                }}
              >
                <SelectTrigger className="w-20" id="rows-per-page">
                  <SelectValue placeholder={table.getState().pagination.pageSize} />
                </SelectTrigger>
                <SelectContent side="top">
                  {[10, 20, 30, 40, 50].map((pageSize) => (
                    <SelectItem key={pageSize} value={`${pageSize}`}>
                      {pageSize}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex w-fit items-center justify-center text-sm font-medium">
              Página {table.getState().pagination.pageIndex + 1} de {table.getPageCount()}
            </div>
            <div className="ml-auto flex items-center gap-2 lg:ml-0">
              <Button
                variant="outline"
                className="hidden h-8 w-8 p-0 lg:flex bg-transparent"
                onClick={() => table.setPageIndex(0)}
                disabled={!table.getCanPreviousPage()}
              >
                <span className="sr-only">Ir a la primera página</span>
                <ChevronsLeft />
              </Button>
              <Button
                variant="outline"
                className="size-8 bg-transparent"
                size="icon"
                onClick={() => table.previousPage()}
                disabled={!table.getCanPreviousPage()}
              >
                <span className="sr-only">Ir a la página anterior</span>
                <ChevronLeft />
              </Button>
              <Button
                variant="outline"
                className="size-8 bg-transparent"
                size="icon"
                onClick={() => table.nextPage()}
                disabled={!table.getCanNextPage()}
              >
                <span className="sr-only">Ir a la página siguiente</span>
                <ChevronRight />
              </Button>
              <Button
                variant="outline"
                className="hidden size-8 lg:flex bg-transparent"
                size="icon"
                onClick={() => table.setPageIndex(table.getPageCount() - 1)}
                disabled={!table.getCanNextPage()}
              >
                <span className="sr-only">Ir a la última página</span>
                <ChevronsRight />
              </Button>
            </div>
          </div>
        </div>
      </TabsContent>
    </Tabs>
  )
}
