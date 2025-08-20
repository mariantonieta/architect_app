import { useQuery } from "@tanstack/react-query";
import { materialListService } from "@/services/materialServices";
import api from "@/services/api";

export function useSupplierRequests() {
  return useQuery({
    queryKey: ["supplierRequests"],
    queryFn: materialListService.getSupplierRequests,
  });
}

export function useQuotedItemsBySupplier(materialListId: string) {
  return useQuery({
    queryKey: ["quoted-items-by-supplier", materialListId],
    queryFn: async () => {
      if (!materialListId) return [];
      const { data } = await api.get(
        `/material-list-quoted-items/material-list/${materialListId}/by-supplier`
      );
      return data;
    },
    enabled: !!materialListId,
    refetchInterval: 1000,
  });
}
