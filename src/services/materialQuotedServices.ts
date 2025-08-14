import api from "./api";
export interface MaterialListItemQuotedOut {
    id: string;
    original_item_id: string;
    material_list_id: string;
    supplier_id: string;
    name: string;
    description?: string;
    unity?: string;
    quantity: number;
    price?: number;
    comment?: string;
    status: string;
}

export interface SupplierRequestOut {
    material_list_id: string;
    project_id: string;
    project_name: string | null;
    architect_name: string | null;
}

export interface BulkMaterialListItemQuotedPatch {
    items: {
        id: string;
        price?: number;
        comment?: string;
    }[];
}

export const getSupplierRequests = async (): Promise<SupplierRequestOut[]> => {
    const { data } = await api.get<SupplierRequestOut[]>("/material-list-quoted-items");
    return data;
};

export const getQuotedItemsByMaterialList = async (
    materialListId: string
): Promise<MaterialListItemQuotedOut[]> => {
    const { data } = await api.get<MaterialListItemQuotedOut[]>(
        `/material-list-quoted-items/material-list/${materialListId}`
    );
    return data;
};

export const bulkUpdateQuotedItems = async (
    materialListId: string,
    payload: BulkMaterialListItemQuotedPatch
): Promise<{ updated: string[] }> => {
    const { data } = await api.patch<{ updated: string[] }>(
        `/material-list-quoted-items/material-list/${materialListId}`,
        payload
    );
    return data;
};
