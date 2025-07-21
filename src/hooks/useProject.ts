import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { projectService } from "@/services/projectService";
import type { Project, ProjectFormData } from "@/services/projectService";

export function useProject(projectId?: string) {
    const queryClient = useQueryClient();
    const {
        data: project,
        isLoading,
        isError,
        error,
    } = useQuery<Project>({
        queryKey: ["project", projectId],
        queryFn: () => projectService.getProjectById(projectId!),
        enabled: !!projectId,
    });
    const createProject = useMutation({
        mutationFn: (formData: FormData) => projectService.createProject(formData),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["projects"] });
        },
    });
    const updateProject = useMutation({
        mutationFn: ({ projectId, data }: { projectId: string; data: FormData }) =>
            projectService.updateProject(projectId, data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["project", projectId] });
            queryClient.invalidateQueries({ queryKey: ["projects"] });
        },
    });

    const deleteProject = useMutation({
        mutationFn: (projectId: string) => projectService.deleteProject(projectId),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["projects"] });
        }
    });
    return {
        project,
        isLoading,
        isError,
        error,
        createProject: createProject.mutateAsync,
        isCreating: createProject.isPending,

        updateProject: updateProject.mutateAsync,
        isUpdating: updateProject.isPending,
        deleteProject: deleteProject.mutateAsync,
        isDeleting: deleteProject.isPending,
    };
}
export function useProjects() {
    return useQuery<Project[], Error>({
        queryKey: ["projects"],
        queryFn: projectService.listProjects,
    });
}