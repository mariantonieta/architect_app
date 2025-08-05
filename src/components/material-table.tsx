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
import { SortableContext, arrayMove, useSortable, verticalListSortingStrategy } from "@dnd-kit/sortable"
import { CSS } from "@dnd-kit/utilities"
import {
  Edit,
  GripVertical,
  Calendar,
  Plus,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  MoreHorizontal,
  Columns,
  TrendingUp,
} from "lucide-react"
import {
  type ColumnDef,
  type ColumnFiltersState,
  type Row,
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
import { Area, AreaChart, CartesianGrid, XAxis } from "recharts"
import { toast } from "sonner"
import { z } from "zod"
import { useIsMobile } from "@/hooks/use-mobile"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { type ChartConfig, ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"
import { Checkbox } from "@/components/ui/checkbox"
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/ui/drawer"
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Separator } from "@/components/ui/separator"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"

export const materialsSchema = z.object({
  id: z.number(),
  item: z.string(),
  description: z.string(),
  unit: z.string(),
  quantity: z.number(),
  category: z.string(),
  subcategory: z.string(),
  metricQuantity: z.number(),
  updatedQuantity: z.number(),
  finalUnit: z.string(),
  status: z.string(),
})

export type Material = z.infer<typeof materialsSchema>

export const sampleMaterialsData: Material[] = [
  {
    id: 1,
    item: "Cemento",
    description: "Cemento Portland normal bolsa 50kg",
    unit: "kg",
    quantity: 180,
    category: "MAMPOSTERÍA Y TABIQUERÍA",
    subcategory: "Muros portantes",
    metricQuantity: 20,
    updatedQuantity: 24.5,
    finalUnit: "m2",
    status: "Presupuestado",
  },
  {
    id: 2,
    item: "Ladrillo común",
    description: "Ladrillo común de mampostería",
    unit: "u",
    quantity: 1000,
    category: "MAMPOSTERÍA Y TABIQUERÍA",
    subcategory: "Muros portantes",
    metricQuantity: 20,
    updatedQuantity: 20,
    finalUnit: "m2",
    status: "Presupuestado",
  },
  {
    id: 3,
    item: "Hierro ADN420",
    description: "Hierro para estructura",
    unit: "kg",
    quantity: 640,
    category: "MAMPOSTERÍA Y TABIQUERÍA",
    subcategory: "Muros portantes",
    metricQuantity: 20,
    updatedQuantity: 20,
    finalUnit: "m2",
    status: "Presupuestado",
  },
  {
    id: 4,
    item: "Arena fina",
    description: "Arena fina para mortero",
    unit: "m3",
    quantity: 5,
    category: "MAMPOSTERÍA Y TABIQUERÍA",
    subcategory: "Muros portantes",
    metricQuantity: 20,
    updatedQuantity: 18.5,
    finalUnit: "m2",
    status: "En proceso",
  },
  {
    id: 5,
    item: "Piedra partida",
    description: "Piedra partida 6-20mm",
    unit: "m3",
    quantity: 8,
    category: "HORMIGÓN ARMADO",
    subcategory: "Fundaciones",
    metricQuantity: 15,
    updatedQuantity: 15,
    finalUnit: "m3",
    status: "Pendiente",
  },
]

// Create a separate component for the drag handle
function DragHandle({ id }: { id: number }) {
  const { attributes, listeners } = useSortable({
    id,
  })

  return (
    <Button
      {...attributes}
      {...listeners}
      variant="ghost"
      size="icon"
      className="text-muted-foreground size-7 hover:bg-transparent"
    >
      <GripVertical className="text-muted-foreground size-3" />
      <span className="sr-only">Drag to reorder</span>
    </Button>
  )
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
    cell: ({ row }) => {
      return <MaterialCellViewer item={row.original} />
    },
    enableHiding: false,
  },
  {
    accessorKey: "description",
    header: "Medida / Descripción",
    cell: ({ row }) => (
      <div className="max-w-60 truncate text-muted-foreground text-xs italic">{row.original.description}</div>
    ),
  },
  {
    accessorKey: "unit",
    header: "Unidad",
    cell: ({ row }) => <div className="text-center text-sm">{row.original.unit}</div>,
  },
  {
    accessorKey: "quantity",
    header: () => <div className="w-full text-right">Cantidad</div>,
    cell: ({ row }) => (
      <form
        onSubmit={(e) => {
          e.preventDefault()
          toast.promise(new Promise((resolve) => setTimeout(resolve, 1000)), {
            loading: `Guardando ${row.original.item}`,
            success: "Guardado",
            error: "Error",
          })
        }}
      >
        <Label htmlFor={`${row.original.id}-quantity`} className="sr-only">
          Cantidad
        </Label>
        <Input
          className="hover:bg-input/30 focus-visible:bg-background dark:hover:bg-input/30 dark:focus-visible:bg-input/30 h-8 w-20 border-transparent bg-transparent text-right shadow-none focus-visible:border dark:bg-transparent"
          defaultValue={row.original.quantity}
          id={`${row.original.id}-quantity`}
        />
      </form>
    ),
  },
  {
    accessorKey: "category",
    header: "Rubro / Categoría",
    cell: ({ row }) => (
      <div className="min-w-32 space-y-0.5 text-xs">
        <p className="font-semibold">{row.original.category}</p>
        <p className="text-muted-foreground">{row.original.subcategory}</p>
      </div>
    ),
  },
  {
    accessorKey: "metricQuantity",
    header: () => <div className="w-full text-right">Cantidad métrica</div>,
    cell: ({ row }) => <div className="text-center">{row.original.metricQuantity}</div>,
  },
  {
    accessorKey: "updatedQuantity",
    header: () => <div className="w-full text-right">Actualizada</div>,
    cell: ({ row }) => (
      <form
        onSubmit={(e) => {
          e.preventDefault()
          toast.promise(new Promise((resolve) => setTimeout(resolve, 1000)), {
            loading: `Guardando ${row.original.item}`,
            success: "Guardado",
            error: "Error",
          })
        }}
      >
        <Label htmlFor={`${row.original.id}-updated`} className="sr-only">
          Cantidad actualizada
        </Label>
        <Input
          className="hover:bg-input/30 focus-visible:bg-background dark:hover:bg-input/30 dark:focus-visible:bg-input/30 h-8 w-20 border-transparent bg-transparent text-right shadow-none focus-visible:border dark:bg-transparent font-semibold text-primary"
          defaultValue={row.original.updatedQuantity}
          id={`${row.original.id}-updated`}
        />
      </form>
    ),
  },
  {
    accessorKey: "finalUnit",
    header: "Unidad final",
    cell: ({ row }) => <div className="text-center text-primary">{row.original.finalUnit}</div>,
  },
  {
    accessorKey: "status",
    header: "Estado",
    cell: ({ row }) => (
      <Badge variant="outline" className="text-xs rounded-md px-2 py-0.5">
        {row.original.status}
      </Badge>
    ),
  },
  {
    id: "actions",
    cell: () => (
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" className="data-[state=open]:bg-muted text-muted-foreground flex size-8" size="icon">
            <MoreHorizontal />
            <span className="sr-only">Open menu</span>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-32">
          <DropdownMenuItem>Editar</DropdownMenuItem>
          <DropdownMenuItem>Duplicar</DropdownMenuItem>
          <DropdownMenuItem>Favorito</DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem variant="destructive">Eliminar</DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    ),
  },
]

function DraggableRow({ row }: { row: Row<Material> }) {
  const { transform, transition, setNodeRef, isDragging } = useSortable({
    id: row.original.id,
  })

  return (
    <TableRow
      data-state={row.getIsSelected() && "selected"}
      data-dragging={isDragging}
      ref={setNodeRef}
      className="relative z-0 data-[dragging=true]:z-10 data-[dragging=true]:opacity-80"
      style={{
        transform: CSS.Transform.toString(transform),
        transition: transition,
      }}
    >
      {row.getVisibleCells().map((cell) => (
        <TableCell key={cell.id}>{flexRender(cell.column.columnDef.cell, cell.getContext())}</TableCell>
      ))}
    </TableRow>
  )
}

export function MaterialsTable({
  data: initialData = sampleMaterialsData,
}: {
  data?: Material[]
}) {
  const [data, setData] = React.useState(() => initialData)
  const [rowSelection, setRowSelection] = React.useState({})
  const [columnVisibility, setColumnVisibility] = React.useState<VisibilityState>({})
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>([])
  const [sorting, setSorting] = React.useState<SortingState>([])
  const [pagination, setPagination] = React.useState({
    pageIndex: 0,
    pageSize: 10,
  })

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

        <Label htmlFor="view-selector" className="sr-only">
          Vista
        </Label>
        <Select defaultValue="materials">
          <SelectTrigger className="flex w-fit @4xl/main:hidden"  id="view-selector">
            <SelectValue placeholder="Seleccionar vista" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="materials">Materiales</SelectItem>
            <SelectItem value="budget">Presupuesto</SelectItem>
            <SelectItem value="suppliers">Proveedores</SelectItem>
            <SelectItem value="reports">Reportes</SelectItem>
          </SelectContent>
        </Select>

        <TabsList className="**:data-[slot=badge]:bg-muted-foreground/30 hidden **:data-[slot=badge]:size-5 **:data-[slot=badge]:rounded-full **:data-[slot=badge]:px-1 @4xl/main:flex">
          <TabsTrigger value="materials">Materiales</TabsTrigger>
          <TabsTrigger value="budget">
            Presupuesto <Badge variant="secondary">5</Badge>
          </TabsTrigger>
          <TabsTrigger value="suppliers">
            Proveedores <Badge variant="secondary">3</Badge>
          </TabsTrigger>
          <TabsTrigger value="reports">Reportes</TabsTrigger>
        </TabsList>

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
          <Button className="bg-primary hover:bg-primary/90" size="sm">
            <Plus />
            <span className="hidden lg:inline">Agregar Material</span>
          </Button>
        </div>
      </div>

      <div className="flex items-center gap-2 px-4 lg:px-6 text-sm text-muted-foreground">
        <Calendar className="w-4 h-4" />
        <span>Generado el 24 de julio de 2025, 02:11 p. m.</span>
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
                <SelectTrigger  className="w-20" id="rows-per-page">
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

      <TabsContent value="budget" className="flex flex-col px-4 lg:px-6">
        <div className="aspect-video w-full flex-1 rounded-lg border border-dashed"></div>
      </TabsContent>

      <TabsContent value="suppliers" className="flex flex-col px-4 lg:px-6">
        <div className="aspect-video w-full flex-1 rounded-lg border border-dashed"></div>
      </TabsContent>

      <TabsContent value="reports" className="flex flex-col px-4 lg:px-6">
        <div className="aspect-video w-full flex-1 rounded-lg border border-dashed"></div>
      </TabsContent>
    </Tabs>
  )
}

const chartData = [
  { month: "Enero", usage: 186, cost: 80 },
  { month: "Febrero", usage: 305, cost: 200 },
  { month: "Marzo", usage: 237, cost: 120 },
  { month: "Abril", usage: 73, cost: 190 },
  { month: "Mayo", usage: 209, cost: 130 },
  { month: "Junio", usage: 214, cost: 140 },
]

const chartConfig = {
  usage: {
    label: "Uso",
    color: "var(--primary)",
  },
  cost: {
    label: "Costo",
    color: "var(--primary)",
  },
} satisfies ChartConfig

function MaterialCellViewer({ item }: { item: Material }) {
  const isMobile = useIsMobile()

  return (
    <Drawer direction={isMobile ? "bottom" : "right"}>
      <DrawerTrigger asChild>
        <Button variant="link" className="text-foreground w-fit px-0 text-left font-semibold">
          {item.item}
        </Button>
      </DrawerTrigger>
      <DrawerContent>
        <DrawerHeader className="gap-1">
          <DrawerTitle>{item.item}</DrawerTitle>
          <DrawerDescription>Detalles del material y estadísticas de uso</DrawerDescription>
        </DrawerHeader>
        <div className="flex flex-col gap-4 overflow-y-auto px-4 text-sm">
          {!isMobile && (
            <>
              <ChartContainer config={chartConfig}>
                <AreaChart
                  accessibilityLayer
                  data={chartData}
                  margin={{
                    left: 0,
                    right: 10,
                  }}
                >
                  <CartesianGrid vertical={false} />
                  <XAxis
                    dataKey="month"
                    tickLine={false}
                    axisLine={false}
                    tickMargin={8}
                    tickFormatter={(value) => value.slice(0, 3)}
                    hide
                  />
                  <ChartTooltip cursor={false} content={<ChartTooltipContent indicator="dot" />} />
                  <Area
                    dataKey="cost"
                    type="natural"
                    fill="var(--color-cost)"
                    fillOpacity={0.6}
                    stroke="var(--color-cost)"
                    stackId="a"
                  />
                  <Area
                    dataKey="usage"
                    type="natural"
                    fill="var(--color-usage)"
                    fillOpacity={0.4}
                    stroke="var(--color-usage)"
                    stackId="a"
                  />
                </AreaChart>
              </ChartContainer>
              <Separator />
              <div className="grid gap-2">
                <div className="flex gap-2 leading-none font-medium">
                  Incremento del 5.2% este mes <TrendingUp className="size-4" />
                </div>
                <div className="text-muted-foreground">
                  Mostrando uso total del material en los últimos 6 meses. Datos basados en proyectos anteriores y
                  estimaciones actuales.
                </div>
              </div>
              <Separator />
            </>
          )}
          <form className="flex flex-col gap-4">
            <div className="flex flex-col gap-3">
              <Label htmlFor="item">Material</Label>
              <Input id="item" defaultValue={item.item} />
            </div>
            <div className="flex flex-col gap-3">
              <Label htmlFor="description">Descripción</Label>
              <Input id="description" defaultValue={item.description} />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="flex flex-col gap-3">
                <Label htmlFor="unit">Unidad</Label>
                <Select defaultValue={item.unit}>
                  <SelectTrigger id="unit" className="w-full">
                    <SelectValue placeholder="Seleccionar unidad" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="kg">kg</SelectItem>
                    <SelectItem value="u">u</SelectItem>
                    <SelectItem value="m3">m3</SelectItem>
                    <SelectItem value="m2">m2</SelectItem>
                    <SelectItem value="m">m</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex flex-col gap-3">
                <Label htmlFor="status">Estado</Label>
                <Select defaultValue={item.status}>
                  <SelectTrigger id="status" className="w-full">
                    <SelectValue placeholder="Seleccionar estado" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Presupuestado">Presupuestado</SelectItem>
                    <SelectItem value="En proceso">En proceso</SelectItem>
                    <SelectItem value="Pendiente">Pendiente</SelectItem>
                    <SelectItem value="Completado">Completado</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="flex flex-col gap-3">
                <Label htmlFor="quantity">Cantidad</Label>
                <Input id="quantity" defaultValue={item.quantity} type="number" />
              </div>
              <div className="flex flex-col gap-3">
                <Label htmlFor="updatedQuantity">Cantidad Actualizada</Label>
                <Input id="updatedQuantity" defaultValue={item.updatedQuantity} type="number" />
              </div>
            </div>
            <div className="flex flex-col gap-3">
              <Label htmlFor="category">Categoría</Label>
              <Select defaultValue={item.category}>
                <SelectTrigger id="category" className="w-full">
                  <SelectValue placeholder="Seleccionar categoría" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="MAMPOSTERÍA Y TABIQUERÍA">MAMPOSTERÍA Y TABIQUERÍA</SelectItem>
                  <SelectItem value="HORMIGÓN ARMADO">HORMIGÓN ARMADO</SelectItem>
                  <SelectItem value="INSTALACIONES">INSTALACIONES</SelectItem>
                  <SelectItem value="TERMINACIONES">TERMINACIONES</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </form>
        </div>
        <DrawerFooter>
          <Button>Guardar cambios</Button>
          <DrawerClose asChild>
            <Button variant="outline">Cerrar</Button>
          </DrawerClose>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  )
}

export default function Component() {
  return (
    <div className="w-full max-w-7xl mx-auto p-6">
      <MaterialsTable />
    </div>
  )
}
