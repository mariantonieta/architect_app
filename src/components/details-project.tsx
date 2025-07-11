import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { projectService } from "@/services/projectService";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ArrowLeft } from "lucide-react";
import { IconDotsVertical } from "@tabler/icons-react";
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogCancel,
  AlertDialogAction,
} from "@/components/ui/alert-dialog";
import type { AxiosError } from "axios";

export function ProjectDetails() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const [menuOpen, setMenuOpen] = useState(false);
  const [deleted, setDeleted] = useState(false);
  const [openDeleteModal, setOpenDeleteModal] = useState(false);

  const deleteMutation = useMutation({
    mutationFn: () => projectService.deleteProject(id!),
    onSuccess: async () => {
      setDeleted(true);
      await queryClient.cancelQueries({ queryKey: ["projects", id] });
      queryClient.removeQueries({ queryKey: ["projects", id] });
      queryClient.invalidateQueries({ queryKey: ["projects"] });
      navigate("/");
    },
    onError: () => console.error("Error deleting project"),
  });

  const {
    data: project,
    isLoading,
    isError,
  } = useQuery({
    queryKey: ["projects", id],
    queryFn: () => projectService.getProjectById(id!),
    enabled: !!id && !deleted,
    retry(_, error) {
      const axiosError = error as AxiosError;
      return !(axiosError.response?.status === 404);
    },
  });
  console.log("Project loaded:", project);
  if (isLoading) return <p>Loading project...</p>;
  if (isError || !project) return <p>Project not found.</p>;

  const toggleMenu = () => setMenuOpen((v) => !v);
  const handleEdit = () => {
    setMenuOpen(false);
    navigate(`/projects/edit/${id}`);
  };
  const handleDelete = () => deleteMutation.mutate();
  const isDeleting = deleteMutation.status === "pending";

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6 relative">
      <div className="flex items-center justify-between">
        <Button variant="ghost" onClick={() => navigate(-1)}>
          <ArrowLeft className="mr-2 h-4 w-4" /> Back
        </Button>

        <div className="relative">
          <Button
            variant="outline"
            onClick={toggleMenu}
            aria-haspopup="true"
            aria-expanded={menuOpen}
          >
            <IconDotsVertical className="h-4 w-4" />
          </Button>

          {menuOpen && (
            <div className="absolute right-0 mt-2 w-40 bg-white border rounded shadow-md z-10">
              <button
                className="block w-full text-left px-4 py-2 hover:bg-gray-100"
                onClick={handleEdit}
              >
                Editar
              </button>
              <button
                className="block w-full text-left px-4 py-2 hover:bg-red-100 text-red-600"
                disabled={isDeleting}
                onClick={() => {
                  setOpenDeleteModal(true);
                  setMenuOpen(false);
                }}
              >
                Eliminar
              </button>
            </div>
          )}
        </div>
      </div>

      <AlertDialog open={openDeleteModal} onOpenChange={setOpenDeleteModal}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action is irreversible and will permanently delete the
              project.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} disabled={isDeleting}>
              {isDeleting ? "Deleting..." : "Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
      <h1 className="text-3xl font-bold">{project.name}</h1>
      <div className="flex items-center gap-4">
        <span className="text-muted-foreground">Client:</span>
        <span>{project.client?.email || "N/A"}</span>
        <Badge className="capitalize">
          {project.status.replace(/_/g, " ")}
        </Badge>
      </div>

      <Card className="p-6 space-y-4 shadow-sm border">
        <div>
          <strong>Project type:</strong>{" "}
          <span className="capitalize">
            {project.project_type.replace(/_/g, " ")}
          </span>
        </div>
        <div>
          <strong>Location:</strong> {project.location}
        </div>
        <div>
          <strong>Start date:</strong>{" "}
          {project.create_date
            ? new Date(project.create_date).toLocaleDateString()
            : "Not available"}
        </div>
        <div>
          <strong>Last updated:</strong>{" "}
          {project.update_date
            ? new Date(project.update_date).toLocaleDateString()
            : "Not available"}
        </div>
        <div>
          <strong>Budget:</strong>{" "}
          {project.budget
            ? `${project.budget} ${project.currency?.toUpperCase()}`
            : "Not specified"}
        </div>
        <div>
          <strong>Team:</strong>{" "}
          {project.additionalUsersEmails?.length
            ? project.additionalUsersEmails.join(", ")
            : "Not assigned"}
        </div>
        <div>
          <strong>Description:</strong>{" "}
          {project.description || "No description"}
        </div>
        <div>
          <strong>Files:</strong>
          {project.files && project.files.length > 0 ? (
            <ul className="list-disc list-inside space-y-1 mt-2">
              {project.files.map((file) => (
                <li key={file.id}>
                  <a
                    href={file.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:underline"
                  >
                    {file.original_name}
                  </a>
                </li>
              ))}
            </ul>
          ) : (
            "No files uploaded"
          )}
        </div>
      </Card>
    </div>
  );
}
