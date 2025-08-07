import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { materialListService } from "@/services/materialServices";
import type {
  MaterialList,
  CreateMaterialListInput,
  UpdateMaterialListInput,
} from "@/services/materialServices";

export function useMaterialList(materialListId?: string) {
  const queryClient = useQueryClient();

  const {
    data: materialList,
    isLoading,
    isError,
    error,
  } = useQuery<MaterialList>({
    queryKey: ["materialList", materialListId],
    queryFn: () => materialListService.getMaterialList(materialListId!),
    enabled: !!materialListId,
  });

  const createMaterialList = useMutation({
    mutationFn: (formData: CreateMaterialListInput) =>
      materialListService.createMaterialList(formData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["materialLists"] });
    },
  });
  const updateMaterialList = useMutation({
    mutationFn: ({
      projectId,
      data,
    }: {
      projectId: string;
      data: UpdateMaterialListInput;
    }) => materialListService.updateMaterialListByProject(projectId, data),
    onSuccess: (_, { projectId }) => {
      queryClient.invalidateQueries({
        queryKey: ["materialListByProject", projectId],
      });
      queryClient.invalidateQueries({ queryKey: ["materialLists"] });
    },
  });

  const deleteMaterialList = useMutation({
    mutationFn: (materialListId: string) =>
      materialListService.deleteMaterialList(materialListId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["materialLists"] });
    },
  });
  const deleteMaterialListItem = useMutation({
    mutationFn: (itemId: string) =>
      materialListService.deleteMaterialListItem(itemId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["materialLists"] });
    },
  });

  return {
    materialList,
    isLoading,
    isError,
    error,

    createMaterialList: createMaterialList.mutateAsync,
    isCreating: createMaterialList.isPending,

    updateMaterialList: updateMaterialList.mutateAsync,
    isUpdating: updateMaterialList.isPending,

    deleteMaterialList: deleteMaterialList.mutateAsync,
    isDeleting: deleteMaterialList.isPending,

    deleteMaterialListItem: deleteMaterialListItem.mutateAsync,
  };
}

export function useMaterialListByProject(projectId?: string) {
  return useQuery<MaterialList>({
    queryKey: ["materialListByProject", projectId],
    queryFn: () => materialListService.getMaterialListByProject(projectId!),
    enabled: !!projectId,
  });
}

export function useMaterialLists() {
  return useQuery<MaterialList[], Error>({
    queryKey: ["materialLists"],
    queryFn: materialListService.listAllMaterialLists,
  });
}
