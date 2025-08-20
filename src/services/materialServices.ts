import api from "./api";

export enum Currency {
    ARS = "ars",
    USD = "usd",
    EUR = "eur",
    YEN = "yen",
    PEPE = "pepe",
}
export enum MaterialListItemStatus {
    REQUESTED = "requested",
    NO_REQUESTED = "no_requested",
    QUOTED = "quoted",
}

export type MaterialListItem = {
    id: string;
    name: string;
    quantity: number;
    unity: string;
    description?: string;
    status?: MaterialListItemStatus;
    unitPrice?: number;
    comment?: string;
    supplier_id?: string;
    supplier_name?: string;
};

export type MaterialList = {
    id: string;
    name: string;
    currency: Currency;
    project_id: string;
    material_list_items: MaterialListItem[];
    supplier_emails?: string[];
};

export type CreateMaterialListInput = {
    name: string;
    currency: Currency;
    project_id: string;
    material_list_items: {
        name: string;
        description: string;
        unity: string;
        quantity: number;
    }[];
    supplier_emails: string[];
};

export type SupplierRequestOut = {
    material_list_id: string;
    project_id: string;
    project_name?: string;
    architect_name?: string;
    supplier_name?: string;
    supplier_id: string;
    create_date?: string;
};

export type SupplierQuotedItemsOut = {
    supplier_id: string;
    supplier_name: string;
    items: MaterialListItem[];
};
type SupplierGroup = {
    name: string;
    currency?: string;
    supplier_emails?: string[];
    items: MaterialListItem[];
};

export const quotedItemsService = {
    async getQuotedItemsGroupedBySupplier(materialListId: string): Promise<SupplierQuotedItemsOut[]> {
        const response = await api.get(`/material-list/${materialListId}/grouped`);
        return response.data;
    },
};

export type UpdateMaterialListInput = Partial<CreateMaterialListInput>;

export const materialListService = {
    async createMaterialList(data: CreateMaterialListInput): Promise<MaterialList> {
        const response = await api.post("/material-lists", data);
        return response.data;
    },

    async getMaterialList(id: string): Promise<MaterialList> {
        const response = await api.get(`/material-lists/${id}`);
        return response.data;
    },

    async listAllMaterialLists(): Promise<MaterialList[]> {
        const response = await api.get("/material-lists");
        return response.data;
    },

    async updateMaterialListByProject(projectId: string, data: UpdateMaterialListInput): Promise<MaterialList> {
        const response = await api.patch(`/material-lists/project/${projectId}`, data);
        return response.data;
    },
    async deleteMaterialList(id: string): Promise<void> {
        await api.delete(`/material-lists/${id}`);
    },
    async deleteMaterialListItem(itemId: string): Promise<void> {
        await api.delete(`/material-lists/items/${itemId}`);
    },
    async getMaterialListByProject(projectId: string): Promise<MaterialList> {
        const response = await api.get(`/material-lists/project/${projectId}`);
        return response.data;
    },
    async getSupplierRequests(): Promise<SupplierRequestOut[]> {
        const response = await api.get("/material-list-quoted-items/");
        return response.data;
    },
    async getQuotedItemsBySupplier(
        materialListId: string
    ): Promise<SupplierQuotedItemsOut[]> {
        const response = await api.get(
            `/material-list-quoted-items/material-list/${materialListId}/by-supplier`
        );
        return response.data;
    },


};
