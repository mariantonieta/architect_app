import api from "./api";

export interface ProjectFormData {
    name: string;
    clientEmail: string;
    project_type:
    | "single_family_home"
    | "residential_building"
    | "commercial_building"
    | "industrial"
    | "renovation"
    | "recreational"
    | "other";
    currency: "ars" | "usd" | "eur";
    budget: number;
    location: string;
    status: "idea" | "budgeting" | "in_progress" | "finished";
}

export interface Project extends ProjectFormData {
    id: string;
}

export const projectService = {
    async getProjectById(projectId: string) {
        const response = await api.get(`/projects/${projectId}`);
        return response.data;
    },

    async createProject(data: ProjectFormData) {
        const response = await api.post("/projects", data);
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
