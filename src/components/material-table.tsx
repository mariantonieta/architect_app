import { useCallback, useEffect, useId, useMemo, useState } from "react";
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
} from "@dnd-kit/core";
import { restrictToVerticalAxis } from "@dnd-kit/modifiers";
import {
  SortableContext,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import {
  Plus,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  MoreHorizontal,
  Columns,
  Trash2,
} from "lucide-react";
import { useForm, useFieldArray, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
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
} from "@tanstack/react-table";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { type Material } from "../types/material";
import { DragHandle } from "./drag-handle";
import { EditableCell } from "./editable-cell";
import { EditableSelect } from "./editable-select";
import { DraggableRow } from "./draggable-row";
import { AddMaterialRow } from "./add-material-row";
import { useTranslation } from "react-i18next";
import { useMaterialList, useMaterialListByProject } from "@/hooks/useMaterial";
import { useParams } from "react-router-dom";
import { MaterialListItemStatus, Currency } from "@/services/materialServices";
import { InviteModal } from "./invite-modal";
import { searchSuppliers } from "@/services/inviteServices";

export const unitOptions = [
  { value: "kg", label: "kg" },
  { value: "u", label: "u" },
  { value: "m3", label: "m³" },
  { value: "m2", label: "m²" },
  { value: "m", label: "m" },
];

export const budgetFormSchema = z.object({
  budgetName: z.string().min(1, "El nombre del presupuesto es requerido"),
  currency: z.enum(Object.values(Currency) as [Currency, ...Currency[]], {
    required_error: "La moneda es requerida",
  }),
  supplier_emails: z.array(z.string()).default([]),
  materials: z
    .array(
      z.object({
        id: z.number(),
        item: z.string().min(1, "El nombre del material es requerido"),
        description: z.string().default(""),
        unit: z.string().min(1, "La unidad es requerida"),
        quantity: z
          .number()
          .min(0, "La cantidad debe ser mayor a 0")
          .default(0),
        status: z
          .enum(
            Object.values(MaterialListItemStatus) as [
              MaterialListItemStatus,
              ...MaterialListItemStatus[]
            ]
          )
          .default(MaterialListItemStatus.NO_REQUESTED),
      })
    )
    .default([]),
});

export type BudgetFormData = z.infer<typeof budgetFormSchema>;

export function MaterialsTable() {
  const [inviteModalOpen, setInviteModalOpen] = useState(false);
  const [pendingRequest, setPendingRequest] = useState<{
    materials: Material[];
    all: boolean;
  } | null>(null);

  const { id: projectId } = useParams<{ id: string }>();

  const [materialListId, setMaterialListId] = useState<string | undefined>(
    undefined
  );

  const { data: materialList, isLoading } = useMaterialListByProject(projectId);
  console.log("materialList: ", materialList);
  const { createMaterialList, isCreating, updateMaterialList, isUpdating } =
    useMaterialList(materialListId);

  const { t } = useTranslation();
  const [rowSelection, setRowSelection] = useState({});
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({});
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [sorting, setSorting] = useState<SortingState>([]);
  const [pagination, setPagination] = useState({
    pageIndex: 0,
    pageSize: 10,
  });
  const [isAddingMaterial, setIsAddingMaterial] = useState(false);

  // Hook form setup
  const form = useForm<BudgetFormData>({
    resolver: zodResolver(budgetFormSchema),
    mode: "onChange",
    defaultValues: {
      budgetName: "",
      currency: undefined,
      supplier_emails: [],
      materials: [],
    },
  });

  const {
    fields: materialFields,
    append: appendMaterial,
    remove: removeMaterial,
    move: moveMaterial,
  } = useFieldArray({
    control: form.control,
    name: "materials",
  });

  const {
    watch,
    control,
    setValue,
    getValues,
    formState: { errors },
  } = form;
  const materials = watch("materials");

  // Función para validar un material individual
  const validateMaterial = useCallback((material: Material) => {
    return {
      isValid: material.item?.trim() && material.unit && material.quantity > 0,
      errors: {
        item: !material.item?.trim(),
        unit: !material.unit,
        quantity: material.quantity <= 0,
      },
    };
  }, []);

  const updateMaterial = useCallback(
    (index: number, field: keyof Material, value: string | number) => {
      setValue(`materials.${index}.${field}` as any, value);

      // Validar el material después de actualizar
      const updatedMaterials = [...materials];
      updatedMaterials[index] = { ...updatedMaterials[index], [field]: value };
      const validation = validateMaterial(updatedMaterials[index]);

      if (!validation.isValid) {
        // Mostrar advertencias específicas sin bloquear la edición
        if (field === "item" && validation.errors.item) {
          setTimeout(
            () => toast.warning("El nombre del material es requerido"),
            100
          );
        } else if (field === "quantity" && validation.errors.quantity) {
          setTimeout(
            () => toast.warning("La cantidad debe ser mayor a 0"),
            100
          );
        }
      }
    },
    [materials, setValue, validateMaterial]
  );

  const addNewMaterial = useCallback(
    (materialData: Omit<Material, "id">) => {
      const newId = Math.max(...materials.map((item) => item.id), 0) + 1;
      const newMaterial: Material = {
        id: newId,
        ...materialData,
      };
      appendMaterial(newMaterial);
      setIsAddingMaterial(false);
    },
    [materials, appendMaterial]
  );

  const deleteMaterial = useCallback(
    (index: number) => {
      removeMaterial(index);
      toast.success("Material eliminado");
    },
    [removeMaterial]
  );
  const handleSupplierSearch = async (
    query: string,
    role: "customer" | "supplier" | "architect"
  ) => {
    if (role !== "supplier") return [];
    const suppliers = await searchSuppliers(query);
    return suppliers.map((s) => s.email);
  };

  const onSubmit = async (data: BudgetFormData) => {
    const { budgetName, currency, materials, supplier_emails } = data;

    const payload = {
      name: budgetName,
      currency: currency,
      project_id: projectId,
      material_list_items: pendingRequest.materials.map((m) => ({
        name: m.item,
        description: m.description,
        unity: m.unit,
        quantity: m.quantity,
        status: m.status,
      })),
      supplier_emails: supplier_emails || [],
    };

    try {
      if (materialList) {
        await updateMaterialList({ projectId, data: payload });
        toast.success("Lista de materiales actualizada correctamente");
      } else {
        const created = await createMaterialList({
          ...payload,
          material_list_items: materials.map((m) => ({
            name: m.item,
            description: m.description,
            unity: m.unit,
            quantity: m.quantity,
            status: MaterialListItemStatus.REQUESTED,
          })),
        });
        toast.success("Lista de materiales creada correctamente");
        setMaterialListId(created.id);
        console.log("Lista creada:", created);
      }
    } catch (error) {
      toast.error("Error al crear o actualizar la lista");
      console.error(error);
    }
  };

  useEffect(() => {
    if (materialList) {
      console.log(
        "Materiales cargados del proyecto:",
        materialList.material_list_items
      );

      form.reset({
        budgetName: materialList.name,
        currency: materialList.currency,
        supplier_emails: materialList.supplier_emails ?? [],
        materials: materialList.material_list_items.map((item, index) => ({
          id: index + 1,
          item: item.name,
          description: item.description,
          unit: item.unity,
          quantity: item.quantity,
          status: item.status || MaterialListItemStatus.REQUESTED,
        })),
      });
    }
  }, [materialList, form]);

  const materialsColumns: ColumnDef<Material>[] = [
    {
      id: "drag",
      header: () => null,
      cell: ({ row }) => (
        <div className="flex items-center justify-center h-8">
          <DragHandle id={row.original.id} />
        </div>
      ),
      size: 40,
      enableResizing: false,
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
            onCheckedChange={(value) =>
              table.toggleAllPageRowsSelected(!!value)
            }
            aria-label="Select all"
          />
        </div>
      ),
      cell: ({ row }) => (
        <div className="flex items-center justify-center h-8">
          <Checkbox
            checked={row.getIsSelected()}
            onCheckedChange={(value) => row.toggleSelected(!!value)}
            aria-label="Select row"
          />
        </div>
      ),
      size: 50,
      enableSorting: false,
      enableHiding: false,
      enableResizing: false,
    },
    {
      accessorKey: "item",
      header: "Item",
      cell: ({ row }) => {
        const index = materials.findIndex((m) => m.id === row.original.id);
        return (
          <EditableCell
            value={row.original.item}
            onSave={(value) => updateMaterial(index, "item", value)}
            className="font-semibold w-full"
            placeholder="Nombre del material*"
            required={true}
          />
        );
      },
      size: 200,
      enableHiding: false,
    },
    {
      accessorKey: "description",
      header: "Medida / Descripción",
      cell: ({ row }) => {
        const index = materials.findIndex((m) => m.id === row.original.id);
        return (
          <div className="w-full h-8 flex items-center">
            <EditableCell
              value={row.original.description}
              onSave={(value) => updateMaterial(index, "description", value)}
              type="textarea"
              className="w-full"
              placeholder="Descripción del material"
            />
          </div>
        );
      },
      size: 250,
    },
    {
      accessorKey: "unit",
      header: "Unidad",
      cell: ({ row }) => {
        const index = materials.findIndex((m) => m.id === row.original.id);
        return (
          <div className="flex items-center justify-center h-8">
            <EditableSelect
              value={row.original.unit}
              onSave={(value) => updateMaterial(index, "unit", value)}
              options={unitOptions}
              className="text-sm"
            />
          </div>
        );
      },
      size: 100,
    },
    {
      accessorKey: "quantity",
      header: () => <div className="w-full text-right">Cantidad</div>,
      cell: ({ row }) => {
        const index = materials.findIndex((m) => m.id === row.original.id);
        return (
          <div className="w-full h-8 flex justify-end items-center">
            <EditableCell
              value={row.original.quantity}
              onSave={(value) => updateMaterial(index, "quantity", value)}
              type="number"
              className="text-right w-full"
              placeholder="0*"
              required={true}
              minValue={0}
            />
          </div>
        );
      },
      size: 120,
    },
    {
      accessorKey: "status",
      header: () => <div className="w-full text-center">Estado</div>,
      cell: ({ row }) => {
        return (
          <div className="w-full h-8 flex justify-end items-center">
            <span className="rounded-full px-2 py-1 bg-muted text-xs font-medium text-muted-foreground">
              {row.original.status}
            </span>
          </div>
        );
      },
      size: 120,
    },
    {
      id: "actions",
      header: () => null,
      cell: ({ row }) => (
        <div className="flex justify-center items-center h-8">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                className="data-[state=open]:bg-muted text-muted-foreground flex size-8"
                size="icon"
              >
                <MoreHorizontal />
                <span className="sr-only">Open menu</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-32">
              <DropdownMenuItem
                onClick={() => {
                  const material = row.original;
                  const duplicated = {
                    ...material,
                    id: Math.max(...materials.map((item) => item.id)) + 1,
                  };
                  appendMaterial(duplicated);
                  toast.success("Material duplicado");
                }}
              >
                Duplicar
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                className="text-destructive focus:text-destructive"
                onClick={() => {
                  const index = materials.findIndex(
                    (m) => m.id === row.original.id
                  );
                  deleteMaterial(index);
                }}
              >
                <Trash2 className="mr-2 h-4 w-4" />
                Eliminar
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      ),
      size: 64,
      enableSorting: false,
      enableHiding: false,
    },
  ];

  const sortableId = useId();
  const sensors = useSensors(
    useSensor(MouseSensor, {
      activationConstraint: {
        distance: 10,
      },
    }),
    useSensor(TouchSensor, {
      activationConstraint: {
        delay: 250,
        tolerance: 5,
      },
    }),
    useSensor(KeyboardSensor, {})
  );
  const dataIds = useMemo<UniqueIdentifier[]>(
    () => materials?.map(({ id }) => id) || [],
    [materials]
  );

  const table = useReactTable({
    data: materials,
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
    enableColumnResizing: false,
    columnResizeMode: "onChange",
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
  });

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    if (active && over && active.id !== over.id) {
      const oldIndex = dataIds.indexOf(active.id);
      const newIndex = dataIds.indexOf(over.id);
      moveMaterial(oldIndex, newIndex);
    }
  }

  // Función para eliminar materiales seleccionados
  const deleteSelectedMaterials = useCallback(() => {
    const selectedRows = table.getFilteredSelectedRowModel().rows;
    const selectedIds = selectedRows.map((row) => row.original.id);

    // Eliminar en orden inverso para no afectar los índices
    const indicesToDelete = selectedIds
      .map((id) => materials.findIndex((m) => m.id === id))
      .sort((a, b) => b - a);

    indicesToDelete.forEach((index) => {
      if (index !== -1) {
        removeMaterial(index);
      }
    });

    // Limpiar selección
    setRowSelection({});
    toast.success(`${selectedRows.length} materiales eliminados`);
  }, [table, materials, removeMaterial]);

  // Función para validar todo el formulario antes del envío
  const validateAndSubmitWithSelection = useCallback(
    async (useSelectedOnly = false) => {
      // Trigger validation para campos principales
      const isValidMain = await form.trigger(["budgetName", "currency"]);

      if (!isValidMain) {
        if (errors.budgetName)
          toast.error("El nombre del presupuesto es requerido");
        if (errors.currency) toast.error("La moneda es requerida");
        return false;
      }

      const formData = form.getValues();
      let materialsToValidate = formData.materials;

      // Si se requiere usar solo seleccionados, filtrar
      if (useSelectedOnly) {
        const selectedRows = table.getFilteredSelectedRowModel().rows;
        if (selectedRows.length === 0) {
          toast.error(
            "Debe seleccionar al menos un material para solicitar presupuesto"
          );
          return false;
        }
        const selectedIds = selectedRows.map((row) => row.original.id);
        materialsToValidate = formData.materials.filter((m) =>
          selectedIds.includes(m.id)
        );
      }

      // Validar que hay materiales
      if (!materialsToValidate || materialsToValidate.length === 0) {
        toast.error(
          useSelectedOnly
            ? "Debe seleccionar al menos un material para solicitar presupuesto"
            : "Debe agregar al menos un material al presupuesto"
        );
        return false;
      }

      // Validar que todos los materiales están completos
      const invalidMaterials = materialsToValidate.filter(
        (material) => !validateMaterial(material).isValid
      );

      if (invalidMaterials.length > 0) {
        toast.error(
          "Todos los materiales deben tener nombre, unidad y cantidad mayor a 0"
        );
        return false;
      }

      return { isValid: true, materials: materialsToValidate };
    },
    [form, errors, validateMaterial, table]
  );

  return (
    <form onSubmit={form.handleSubmit(onSubmit)}>
      <div className="w-full flex-col justify-start gap-6">
        <div className="flex items-center justify-between px-4 lg:px-6">
          <div className="flex items-center gap-3">
            <Controller
              control={control}
              name="budgetName"
              render={({ field }) => (
                <EditableCell
                  value={field.value}
                  onSave={(value) => field.onChange(value)}
                  className="text-2xl font-bold tracking-tight"
                  placeholder="Nombre del presupuesto*"
                  required={true}
                />
              )}
            />
          </div>
          <div className="flex items-center gap-2">
            <div className="flex items-center">
              <Controller
                control={control}
                name="currency"
                render={({ field }) => {
                  return (
                    <Select
                      value={field.value}
                      onValueChange={(value) => {
                        // Solo permitir valores válidos
                        if (["ars", "usd", "eur"].includes(value)) {
                          field.onChange(value);
                        }
                      }}
                    >
                      <SelectTrigger
                        id="currency"
                        className={`w-full ${
                          errors.currency ? "border-2 border-red-500" : ""
                        }`}
                        size="default"
                      >
                        <SelectValue placeholder="Seleccionar moneda*" />
                      </SelectTrigger>
                      <SelectContent>
                        {Object.entries(Currency).map(([key, value]) => (
                          <SelectItem key={key} value={value}>
                            {key}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  );
                }}
              />
            </div>
            <Button
              type="button"
              className="bg-primary hover:bg-primary/90"
              size="sm"
              onClick={async () => {
                const result = await validateAndSubmitWithSelection(true);
                if (result && typeof result === "object" && result.isValid) {
                  //</div> await onSubmit({
                  // ...form.getValues(),
                  //materials: result.materials,
                  setPendingRequest({
                    materials: result.materials,
                    all: false,
                  });
                  setInviteModalOpen(true);
                }
              }}
              disabled={
                isAddingMaterial ||
                table.getFilteredSelectedRowModel().rows.length === 0
              }
            >
              <Plus />
              <span className="hidden lg:inline">
                Solicitar Presupuesto Seleccionados (
                {table.getFilteredSelectedRowModel().rows.length})
              </span>
              <span className="lg:hidden">
                Solicitar ({table.getFilteredSelectedRowModel().rows.length})
              </span>
            </Button>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={async () => {
                const result = await validateAndSubmitWithSelection(false);
                if (result && typeof result === "object" && result.isValid) {
                  setPendingRequest({ materials: result.materials, all: true });
                  setInviteModalOpen(true);
                  //</div>await onSubmit({
                  //...form.getValues(),
                  //materials: result.materials,
                }
              }}
              disabled={isAddingMaterial || isCreating || isUpdating}
            >
              <Plus />
              <span className="hidden lg:inline">Solicitar Todos</span>
            </Button>
          </div>
        </div>

        <div className="flex items-center justify-between px-4 py-4 lg:px-6">
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
                .filter(
                  (column) =>
                    typeof column.accessorFn !== "undefined" &&
                    column.getCanHide()
                )
                .map((column) => {
                  return (
                    <DropdownMenuCheckboxItem
                      key={column.id}
                      className="capitalize"
                      checked={column.getIsVisible()}
                      onCheckedChange={(value) =>
                        column.toggleVisibility(!!value)
                      }
                    >
                      {column.id}
                    </DropdownMenuCheckboxItem>
                  );
                })}
            </DropdownMenuContent>
          </DropdownMenu>
          <div className="flex items-center gap-2">
            {table.getFilteredSelectedRowModel().rows.length > 0 && (
              <Button
                variant="destructive"
                size="sm"
                onClick={deleteSelectedMaterials}
              >
                <Trash2 className="h-4 w-4 mr-2" />
                <span className="hidden lg:inline">
                  Eliminar {table.getFilteredSelectedRowModel().rows.length}{" "}
                  seleccionados
                </span>
                <span className="lg:hidden">
                  Eliminar ({table.getFilteredSelectedRowModel().rows.length})
                </span>
              </Button>
            )}
            {materials.some(
              (material) => !validateMaterial(material).isValid
            ) && (
              <span className="text-sm text-yellow-600 bg-yellow-100 px-2 py-1 rounded-md">
                ⚠️ Hay materiales incompletos
              </span>
            )}
            <Button
              type="button"
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

        <div className="relative flex flex-col gap-4 overflow-auto px-4 lg:px-6">
          <div className="overflow-hidden rounded-lg border">
            <DndContext
              collisionDetection={closestCenter}
              modifiers={[restrictToVerticalAxis]}
              onDragEnd={handleDragEnd}
              sensors={sensors}
              id={sortableId}
            >
              <Table className="w-full table-fixed">
                <colgroup>
                  <col className="w-10" />
                  <col className="w-12" />
                  <col className="w-[200px]" />
                  <col className="w-[250px]" />
                  <col className="w-[100px]" />
                  <col className="w-[120px]" />
                  <col className="w-[120px]" />
                  <col className="w-16" />
                </colgroup>
                <TableHeader className="bg-muted sticky top-0 z-10">
                  {table.getHeaderGroups().map((headerGroup) => (
                    <TableRow key={headerGroup.id}>
                      {headerGroup.headers.map((header) => {
                        return (
                          <TableHead
                            key={header.id}
                            colSpan={header.colSpan}
                            className="px-2 py-3"
                          >
                            {header.isPlaceholder
                              ? null
                              : flexRender(
                                  header.column.columnDef.header,
                                  header.getContext()
                                )}
                          </TableHead>
                        );
                      })}
                    </TableRow>
                  ))}
                </TableHeader>
                <TableBody>
                  {isAddingMaterial && (
                    <AddMaterialRow
                      onAdd={addNewMaterial}
                      onCancel={() => setIsAddingMaterial(false)}
                    />
                  )}
                  {table.getRowModel().rows?.length ? (
                    <SortableContext
                      items={dataIds}
                      strategy={verticalListSortingStrategy}
                    >
                      {table.getRowModel().rows.map((row) => {
                        const materialValidation = validateMaterial(
                          row.original
                        );
                        return (
                          <DraggableRow
                            key={row.id}
                            row={row}
                            isValid={materialValidation.isValid}
                          />
                        );
                      })}
                    </SortableContext>
                  ) : (
                    <TableRow>
                      <TableCell
                        colSpan={materialsColumns.length}
                        className="h-24 text-center px-2 py-3"
                      >
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
              {table.getFilteredSelectedRowModel().rows.length} de{" "}
              {table.getFilteredRowModel().rows.length} fila(s) seleccionadas.
            </div>
            <div className="flex w-full items-center gap-8 lg:w-fit">
              <div className="hidden items-center gap-2 lg:flex">
                <Label htmlFor="rows-per-page" className="text-sm font-medium">
                  Filas por página
                </Label>
                <Select
                  value={`${table.getState().pagination.pageSize}`}
                  onValueChange={(value) => {
                    table.setPageSize(Number(value));
                  }}
                >
                  <SelectTrigger className="w-20" id="rows-per-page">
                    <SelectValue
                      placeholder={table.getState().pagination.pageSize}
                    />
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
                Página {table.getState().pagination.pageIndex + 1} de{" "}
                {table.getPageCount()}
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
        </div>
      </div>
      <InviteModal
        open={inviteModalOpen}
        setOpen={setInviteModalOpen}
        title="Agregar proveedores"
        placeholder="proveedor@example.com"
        buttonText="Solicitar presupuesto"
        role="supplier"
        onSearch={handleSupplierSearch}
        inviteFn={(emails, { onSuccess, onError }) => {
          if (!pendingRequest) return;
          form.setValue("supplier_emails", emails);
          const formData = form.getValues();

          onSubmit({
            ...formData,
            supplier_emails: emails,
            materials: pendingRequest.materials,
          })
            .then(() => {
              onSuccess({ msg: "Solicitud enviada" });
              setPendingRequest(null);
            })
            .catch((err) => {
              onError(err);
            });
        }}
        emailAddValidator={(email, data) => data.includes(email)}
      />
    </form>
  );
}
