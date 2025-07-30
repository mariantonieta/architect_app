import api from "./api";

export interface ProjectFormData {
    name: string;
    customerEmail?: string[];
    supplierEmail?: string[];
    architectEmail?: string[];
    project_type:
    ""
    | "single_family_home"
    | "residential_building"
    | "commercial_building"
    | "industrial"
    | "renovation"
    | "recreational"
    | "other";
    currency?: "ars" | "usd" | "eur";
    estimated_budget?: number;
    location: string;
    status?: "idea" | "budgeting" | "in_progress" | "finished";
    filesBimModels?: File[];
    filesRenders?: File[];
    filesReports?: File[];
    description?: string;
    create_date?: string;
    update_date?: string;
}

export interface ProjectFile {
    id: string;
    filename: string;
    original_name: string;
    url: string;
    file_type: "bim_model" | "renders" | "material_takeoff" | "reports" | "blueprints";

}

export interface Project {
    id: string;
    name: string;
    customerEmail?: string[];
    supplierEmail?: string[];
    architectEmail?: string[];
    project_type:
    | "single_family_home"
    | "residential_building"
    | "commercial_building"
    | "industrial"
    | "renovation"
    | "recreational"
    | "other";
    currency?: "ars" | "usd" | "eur";
    estimated_budget?: number;
    location: string;
    status?: "idea" | "budgeting" | "in_progress" | "finished";
    files?: ProjectFile[];
    description?: string;

    create_date?: string;
    update_date?: string;
}

export const projectService = {
    async getProjectById(projectId: string) {
        const response = await api.get(`/projects/${projectId}`);
        return response.data;
    },

    async createProject(formData: FormData) {
        const response = await api.post("/projects/", formData);
        return response.data;
    },

    async updateProject(projectId: string, data: FormData) {
        const response = await api.patch(`/projects/${projectId}`, data, {
            headers: {
                "Content-Type": "multipart/form-data",
            },
        });
        return response.data;
    },


    async deleteProject(projectId: string) {
        const response = await api.delete(`/projects/${projectId}`);
        return response.data;
    },

    async listProjects() {
        const response = await api.get("/projects");
        return response.data;
    },
};
