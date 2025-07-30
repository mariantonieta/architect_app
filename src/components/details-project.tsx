import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useProject } from "@/hooks/useProject";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  ArrowLeft,
  User,
  MapPin,
  Calendar,
  DollarSign,
  Users,
  Building2,
} from "lucide-react";
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
import { IFCViewer } from "./ifc-viewer/ifc-viewer";
import { useCreateProjectModal } from "@/hooks/useCreateOrEditProjectModal";

export function ProjectDetails() {
  const { toggleModal } = useCreateProjectModal();

  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const {
    project,
    isLoading,
    isError,
    deleteProject,
    isDeleting,
    updateProject,
  } = useProject(id);
  const [menuOpen, setMenuOpen] = useState(false);
  const [deleted, setDeleted] = useState(false);
  const [openDeleteModal, setOpenDeleteModal] = useState(false);
  const [activeTab, setActiveTab] = useState("overview");
  const [selectedFile, setSelectedFile] = useState<string | null>(null);
  const [editOpen, setEditOpen] = useState(false);

  const [editForm, setEditForm] = useState({
    name: "",
    customerEmail: "",

    budget: "",
  });

  useEffect(() => {
    if (project) {
      setEditForm({
        name: project.name || "",
        customerEmail: project.customerEmail?.[0] || "",
        budget: project.budget?.toString() || "",
      });
    }
  }, [project]);

  const handleDelete = async () => {
    await deleteProject(id!);
    setOpenDeleteModal(false);
    navigate("/projects");
  };

  useEffect(() => {
    if (project) {
      setEditForm({
        name: project.name || "",
        customerEmail: project.customerEmail?.[0] || "",

        budget: project.budget?.toString() || "",
      });
    }
  }, [project]);

  if (isLoading)
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <p className="text-lg">Loading project...</p>
      </div>
    );

  if (isError || !project)
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <p className="text-lg">Project not found.</p>
      </div>
    );
  const toggleMenu = () => setMenuOpen((v) => !v);

  const handleEdit = () => {
    setMenuOpen(false);
    setEditOpen(true);
  };
  const planFiles =
    project.files?.filter((file) =>
      file.original_name.match(/\.(pdf|jpe?g)$/i)
    ) || [];
  const bimFiles =
    project.files?.filter((file) => file.original_name.match(/\.ifc$/i)) || [];
  const formattedCreateDate = project?.create_date
    ? new Date(project.create_date).toLocaleDateString()
    : "Not available";

  const tabs = [
    { id: "overview", label: "Overview" },
    { id: "plans", label: "Plans" },
    { id: "3d-model", label: "3D Model" },
    { id: "materials", label: "Materials Computation" },
    { id: "budgets", label: "Budgets" },
    { id: "roles", label: "Roles" },
    { id: "history", label: "History" },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4">
          <div className="flex items-center justify-between">
            <Button variant="ghost" size="sm" onClick={() => navigate(-1)}>
              <ArrowLeft className="h-4 w-4 mr-1 sm:mr-2" />
              <span className="hidden sm:inline">Back</span>
            </Button>

            <div className="flex items-center gap-2">
              <Badge
                variant="secondary"
                className="bg-blue-100 text-blue-700 capitalize text-xs sm:text-sm"
              >
                {project.status.replace(/_/g, " ")}
              </Badge>
              <div className="relative">
                <Button
                  variant="outline"
                  size="sm"
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
                      onClick={() =>
                        toggleModal(
                          true,
                          {
                            id: project.id,
                            name: project.name,
                            customerEmail: project.customerEmail?.[0] || "",
                            budget: project.budget,
                            project_type: project.project_type,
                            currency: project.currency,
                            status: project.status,
                            location: project.location,
                            architectEmail: project.architectEmail,
                            supplierEmail: project.supplierEmail,
                            description: project.description,
                        
                            existingBlueprints: project.files
                              ?.filter((f) => f.file_type === "bim_model")
                              .map((f) => ({
                                id: f.id,
                                url: f.url,
                                original_name: f.original_name,
                              })),
                            existingRenders: project.files
                              ?.filter((f) => f.file_type === "renders")
                              .map((f) => ({
                                id: f.id,
                                url: f.url,
                                original_name: f.original_name,
                              })),
                            existingReports: project.files
                              ?.filter((f) => f.file_type === "reports")
                              .map((f) => ({
                                id: f.id,
                                url: f.url,
                                original_name: f.original_name,
                              })),
                          },
                          "edit"
                        )
                      }
                    >
                      Edit
                    </button>
                    <button
                      className="block w-full text-left px-4 py-2 hover:bg-red-100 text-red-600"
                      disabled={isDeleting}
                      onClick={() => {
                        setOpenDeleteModal(true);
                        setMenuOpen(false);
                      }}
                    >
                      Delete
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4 sm:py-6">
        <div className="mb-4 sm:mb-6">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">
            {project.name}
          </h1>
          <div className="text-sm sm:text-base text-gray-600">
            <p>{(project.customerEmail || []).join(", ") || "Not assigned"}</p>
          </div>
        </div>

        <Tabs
          value={activeTab}
          onValueChange={setActiveTab}
          className="mb-6 sm:mb-8"
        >
          <div className="overflow-x-auto">
            <TabsList className="inline-flex h-10 items-center justify-start rounded-md bg-gray-100 p-1 text-muted-foreground min-w-full sm:min-w-0">
              {tabs.map((tab) => (
                <TabsTrigger
                  key={tab.id}
                  value={tab.id}
                  className="inline-flex items-center justify-center whitespace-nowrap rounded-sm px-2 sm:px-3 py-1.5 text-xs sm:text-sm font-medium ring-offset-background transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 data-[state=active]:bg-white data-[state=active]:text-blue-600 data-[state=active]:shadow-sm flex-shrink-0"
                >
                  <span className="truncate">{tab.label}</span>
                </TabsTrigger>
              ))}
            </TabsList>
          </div>

          <TabsContent value="plans">
            <Card>
              <CardContent className="p-6">
                <h2 className="text-lg font-semibold mb-2">Plans</h2>
                {planFiles.length > 0 ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {planFiles.map((file) => (
                      <div key={file.id} className="border rounded p-2">
                        {file.original_name.match(/\.pdf$/i) ? (
                          <iframe
                            src={file.url}
                            className="w-full h-64"
                            title={file.original_name}
                          />
                        ) : (
                          <img
                            src={file.url}
                            alt={file.original_name}
                            className="w-full h-64 object-contain"
                          />
                        )}
                        <p className="text-xs mt-1 truncate">
                          {file.original_name}
                        </p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-gray-500">
                    No plan files uploaded.
                  </p>
                )}
              </CardContent>
            </Card>

            {selectedFile && (
              <div className="mt-6">
                <IFCViewer fileUrl={selectedFile} />
              </div>
            )}
          </TabsContent>
          <TabsContent value="overview" className="mt-6">
            <div className="space-y-8">
              <h2 className="text-lg sm:text-xl font-semibold text-gray-900 mb-4">
                Project Information
              </h2>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
                <Card>
                  <CardContent className="p-4 sm:p-6">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-gray-100 rounded-lg flex-shrink-0">
                        <User className="h-4 w-4 sm:h-5 sm:w-5 text-gray-600" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="text-xs sm:text-sm text-gray-500">
                          Client
                        </p>
                        <div className="font-medium text-sm sm:text-base text-gray-900 truncate">
                          <p>
                            {(project.customerEmail || []).join(", ") ||
                              "Not assigned"}
                          </p>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-4 sm:p-6">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-gray-100 rounded-lg flex-shrink-0">
                        <MapPin className="h-4 w-4 sm:h-5 sm:w-5 text-gray-600" />
                      </div>
                      <div>
                        <p className="text-xs sm:text-sm text-gray-500">
                          Location
                        </p>
                        <p className="font-medium text-sm sm:text-base text-gray-900">
                          {project.location}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-4 sm:p-6">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-gray-100 rounded-lg flex-shrink-0">
                        <Building2 className="h-4 w-4 sm:h-5 sm:w-5 text-gray-600" />
                      </div>
                      <div>
                        <p className="text-xs sm:text-sm text-gray-500">
                          Project Type
                        </p>
                        <p className="font-medium text-sm sm:text-base text-gray-900">
                          {project.project_type}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-4 sm:p-6">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-gray-100 rounded-lg flex-shrink-0">
                        <Calendar className="h-4 w-4 sm:h-5 sm:w-5 text-gray-600" />
                      </div>
                      <div>
                        <p className="text-xs sm:text-sm text-gray-500">
                          Start Date
                        </p>
                        <p className="font-medium text-sm sm:text-base text-gray-900">
                          {formattedCreateDate}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-4 sm:p-6">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-gray-100 rounded-lg flex-shrink-0">
                        <DollarSign className="h-4 w-4 sm:h-5 sm:w-5 text-gray-600" />
                      </div>
                      <div>
                        <p className="text-xs sm:text-sm text-gray-500">
                          Budget
                        </p>
                        <p className="font-medium text-sm sm:text-base text-gray-900">
                          ${project.budget?.toLocaleString() || "0"}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-4 sm:p-6">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-gray-100 rounded-lg flex-shrink-0">
                        <Users className="h-4 w-4 sm:h-5 sm:w-5 text-gray-600" />
                      </div>
                      <div>
                        <p className="text-xs sm:text-sm text-gray-500">
                          Team Size
                        </p>
                        <p className="font-medium text-sm sm:text-base text-gray-900">
                          {[
                            ...(project.customerEmail || []),
                            ...(project.supplierEmail || []),
                            ...(project.architectEmail || []),
                          ].join(", ") || "No emails"}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
                <Card className="sm:col-span-2 lg:col-span-3">
                  <CardContent className="p-4 sm:p-6">
                    <p className="text-xs sm:text-sm text-gray-500 mb-1">
                      Description
                    </p>
                    <p className="text-sm sm:text-base text-gray-900 whitespace-pre-line">
                      {project.description || "No description provided."}
                    </p>
                  </CardContent>
                </Card>
              </div>

              <div></div>
            </div>
          </TabsContent>

          <TabsContent value="3d-model" className="mt-6">
            {bimFiles.length > 0 ? (
              <div className="space-y-6">
                {bimFiles.map((file) => (
                  <div key={file.id}>
                    <p className="text-sm font-medium mb-2">
                      {file.original_name}
                    </p>
                    <IFCViewer fileUrl={file.url} />
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-gray-500">No 3D models available.</p>
            )}
          </TabsContent>

          <TabsContent value="materials" className="mt-6">
            <p>Materials Computation details go here.</p>
          </TabsContent>

          <TabsContent value="budgets" className="mt-6">
            <p>Budgets details go here.</p>
          </TabsContent>

          <TabsContent value="roles" className="mt-6">
            <p>Roles details go here.</p>
          </TabsContent>

          <TabsContent value="history" className="mt-6">
            <p>History details go here.</p>
          </TabsContent>
        </Tabs>
      </div>
      <AlertDialog open={openDeleteModal} onOpenChange={setOpenDeleteModal}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Project</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this project? This action cannot
              be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setOpenDeleteModal(false)}>
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={isDeleting}
              className="bg-red-600 text-white hover:bg-red-700"
            >
              {isDeleting ? "Deleting..." : "Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
