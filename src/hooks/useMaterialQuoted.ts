import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
    getSupplierRequests,
    getQuotedItemsByMaterialList,
    bulkUpdateQuotedItems,
    type BulkMaterialListItemQuotedPatch,
} from "@/services/materialQuotedServices";

export function useSupplierRequests() {
    return useQuery({
        queryKey: ["supplierRequests"],
        queryFn: getSupplierRequests,
    });
}

export function useQuotedItems(materialListId: string) {
    return useQuery({
        queryKey: ["quotedItems", materialListId],
        queryFn: () => getQuotedItemsByMaterialList(materialListId),
        enabled: !!materialListId,
    });
}
export function useBulkUpdateQuotedItems(materialListId: string) {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (payload: BulkMaterialListItemQuotedPatch) =>
            bulkUpdateQuotedItems(materialListId, payload),

        onSuccess: () => {
            queryClient.invalidateQueries({
                queryKey: ["quotedItems", materialListId],
            });
        },
    });
}
