import api from "./api";

export interface ProjectFormData {
    name: string;
    clientEmail?: string;
    project_type:
    | "single_family_home"
    | "residential_building"
    | "commercial_building"
    | "industrial"
    | "renovation"
    | "recreational"
    | "other";
    currency?: "ars" | "usd" | "eur";
    budget?: number;
    location?: string;
    status?: "idea" | "budgeting" | "in_progress" | "finished";
    additionalUsersEmails?: string[];
    files?: File[];
    description?: string;
    client?: {
        email: string;
    };
    create_date?: string;
    update_date?: string;
}

export interface ProjectFile {
    id: string;
    filename: string;
    original_name: string;
    url: string;
}

export interface Project {
    id: string;
    name: string;
    clientEmail?: string;
    project_type:
    | "single_family_home"
    | "residential_building"
    | "commercial_building"
    | "industrial"
    | "renovation"
    | "recreational"
    | "other";
    currency?: "ars" | "usd" | "eur";
    budget?: number;
    location?: string;
    status?: "idea" | "budgeting" | "in_progress" | "finished";
    additionalUsersEmails?: string[];
    files?: ProjectFile[];
    description?: string;
    client?: {
        email: string;
    };
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

    async updateProject(projectId: string, data: Partial<ProjectFormData>) {
        const response = await api.patch(`/projects/${projectId}`, data);
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
