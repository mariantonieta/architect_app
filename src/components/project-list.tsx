import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardFooter,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Building2, MapPin, LinkIcon, User, Eye } from "lucide-react";
import type { Project } from "@/services/projectService";
import { useNavigate } from "react-router-dom";
import { useProjects } from "@/hooks/useProject";
import { useCreateProjectModal } from "@/hooks/useCreateOrEditProjectModal";
import { useState } from "react";
import ShareProjectModal from "./share-prooject-form";

export function ProjectsList() {
  const navigate = useNavigate();
  const { toggleModal } = useCreateProjectModal();
  const [openShareModal, setOpenShareModal] = useState(false);
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);

  const { data: projects = [], isLoading, isError } = useProjects();

  if (isLoading) return <div className="p-6">Loading projects...</div>;
  if (isError)
    return <div className="p-6 text-red-500">Error loading projects</div>;
  if (projects.length === 0)
    return <div className="p-6 text-gray-600">No projects found.</div>;

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case "in_progress":
        return "bg-blue-100 text-blue-800";
      case "completed":
        return "bg-green-100 text-green-800";
      case "paused":
        return "bg-yellow-100 text-yellow-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const formatStatus = (status: string) => {
    const statusMap: { [key: string]: string } = {
      in_progress: "In Progress",
      completed: "Completed",
      paused: "Paused",
    };
    return statusMap[status.toLowerCase()] || status.replace(/_/g, " ");
  };

  const formatProjectType = (type: string) => {
    const typeMap: { [key: string]: string } = {
      residential: "Single-Family Home",
      commercial: "Commercial",
      industrial: "Industrial",
      mixed_use: "Mixed Use",
    };
    return typeMap[type.toLowerCase()] || type.replace(/_/g, " ");
  };

  const calculateProgress = (project: Project) => {
    const hash = project.id.split("").reduce((a, b) => {
      a = (a << 5) - a + b.charCodeAt(0);
      return a & a;
    }, 0);
    return Math.abs(hash) % 100;
  };

  return (
    <div className="flex h-screen bg-gray-50">
      <div className="flex-1 flex flex-col overflow-hidden">
        <header className="bg-white border-b border-gray-200 px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Projects</h1>
              <p className="text-sm text-gray-600 mt-1">List of projects</p>
            </div>
            <Button onClick={() => toggleModal(true)}>New Project</Button>
          </div>
        </header>

        <main className="flex-1 overflow-auto p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {projects.map((project) => {
              const progress = calculateProgress(project);

              return (
                <Card
                  key={project.id}
                  className="bg-white border border-gray-200 shadow-sm hover:shadow-md transition-shadow"
                >
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                      <CardTitle className="text-lg font-bold text-gray-900 leading-tight pr-2">
                        {project.name}
                      </CardTitle>
                      <Badge
                        className={`${getStatusColor(
                          project.status
                        )} text-xs font-medium px-2 py-1 rounded-md`}
                      >
                        {formatStatus(project.status)}
                      </Badge>
                    </div>
                  </CardHeader>

                  <CardContent className="space-y-4 pb-4 text-sm text-gray-700">
                    <div className="flex items-center gap-40 text-sm text-gray-600">
                      <div className="flex items-center gap-2">
                        <MapPin className="h-4 w-4 text-gray-400" />
                        <span>{project.location}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Building2 className="h-4 w-4 text-gray-400" />
                        <span>{formatProjectType(project.project_type)}</span>
                      </div>
                    </div>

                    <div>
                      <strong>Customers:</strong>{" "}
                      {(project.customerEmail?.length ?? 0) > 0
                        ? project.customerEmail.join(", ")
                        : "No customers"}
                    </div>

                    <div>
                      <strong>Suppliers:</strong>{" "}
                      {(project.supplierEmail?.length ?? 0) > 0
                        ? project.supplierEmail.join(", ")
                        : "No suppliers"}
                    </div>

                    <div>
                      <strong>Architects:</strong>{" "}
                      {(project.architectEmail?.length ?? 0) > 0
                        ? project.architectEmail.join(", ")
                        : "No architects"}
                    </div>

                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium text-gray-700">
                          Progress
                        </span>
                        <span className="text-sm font-bold text-gray-900">
                          {progress}%
                        </span>
                      </div>
                      <Progress value={progress} className="h-2" />
                    </div>

                    <div>
                      <strong>Last updated:</strong>{" "}
                      {project.update_date
                        ? new Date(project.update_date).toLocaleDateString()
                        : "Not available"}
                    </div>
                  </CardContent>

                  <CardFooter className="pt-4 border-t border-gray-100">
                    <div className="flex items-center gap-2 w-full justify-between">
                      <Button
                        onClick={() => navigate(`/projects/${project.id}`)}
                        variant="ghost"
                        className="flex items-center text-gray-600 hover:text-gray-800 hover:bg-gray-100"
                      >
                        <Eye className="h-4 w-4 mr-1" />
                        View more details
                      </Button>

                      <Button
                        variant="ghost"
                        size="icon"
                        className="text-gray-400 hover:text-gray-600 hover:bg-gray-100"
                        onClick={() => {
                          setSelectedProject(project);
                          setOpenShareModal(true);
                        }}
                      >
                        <LinkIcon className="h-4 w-4" />
                      </Button>
                    </div>
                  </CardFooter>
                </Card>
              );
            })}
          </div>
        </main>
      </div>
      <ShareProjectModal
        open={openShareModal}
        onOpenChange={setOpenShareModal}
        project={selectedProject}
      />
    </div>
  );
}
