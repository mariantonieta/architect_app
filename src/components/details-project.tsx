
import { useState } from "react"
import { useParams, useNavigate } from "react-router-dom"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { projectService } from "@/services/projectService"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ArrowLeft, User, MapPin, Calendar, DollarSign, Users, Building2, Clock } from "lucide-react"
import { IconDotsVertical } from "@tabler/icons-react"
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogCancel,
  AlertDialogAction,
} from "@/components/ui/alert-dialog"
import type { AxiosError } from "axios"
import { IFCViewer } from "./ifc-viewer/ifc-viewer"

export function ProjectDetails() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const [menuOpen, setMenuOpen] = useState(false)
  const [deleted, setDeleted] = useState(false)
  const [openDeleteModal, setOpenDeleteModal] = useState(false)
  const [activeTab, setActiveTab] = useState("overview")
  const [selectedFile, setSelectedFile] = useState<string | null>(null);

  const deleteMutation = useMutation({
    mutationFn: () => projectService.deleteProject(id!),
    onSuccess: async () => {
      setDeleted(true)
      await queryClient.cancelQueries({ queryKey: ["projects", id] })
      queryClient.removeQueries({ queryKey: ["projects", id] })
      queryClient.invalidateQueries({ queryKey: ["projects"] })
      navigate("/")
    },
    onError: () => console.error("Error deleting project"),
  })

  const {
    data: project,
    isLoading,
    isError,
  } = useQuery({
    queryKey: ["projects", id],
    queryFn: () => projectService.getProjectById(id!),
    enabled: !!id && !deleted,
    retry(_, error) {
      const axiosError = error as AxiosError
      return !(axiosError.response?.status === 404)
    },
  })

  
  console.log("Project loaded:", project)

  if (isLoading)
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <p className="text-lg">Loading project...</p>
      </div>
    )

  if (isError || !project)
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <p className="text-lg">Project not found.</p>
      </div>
    )

  const toggleMenu = () => setMenuOpen((v) => !v)

  const handleEdit = () => {
    setMenuOpen(false)
    navigate(`/projects/edit/${id}`)
  }

  const handleDelete = () => {deleteMutation.mutate() 
    setOpenDeleteModal(false)}

  const isDeleting = deleteMutation.status === "pending"

  const getProgressPercentage = (status: string) => {
    const statusMap: { [key: string]: number } = {
      planning: 10,
      in_progress: 50,
      review: 80,
      completed: 100,
      on_hold: 25,
    }
    return statusMap[status] || 0
  }

  const tabs = [
    { id: "overview", label: "Overview" },
    { id: "plans", label: "Plans" },
    { id: "3d-model", label: "3D Model" },
    { id: "materials", label: "Materials Computation" },
    { id: "budgets", label: "Budgets" },
    { id: "roles", label: "Roles" },
    { id: "history", label: "History" },
  ]

  return (
    <div className="min-h-screen bg-gray-50">
    
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 sm:gap-4">
              <Button variant="ghost" size="sm" onClick={() => navigate(-1)}>
                <ArrowLeft className="h-4 w-4 mr-1 sm:mr-2" />
                <span className="hidden sm:inline">Back</span>
              </Button>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant="secondary" className="bg-blue-100 text-blue-700 capitalize text-xs sm:text-sm">
                {project.status.replace(/_/g, " ")}
              </Badge>
              <div className="relative">
                <Button variant="outline" size="sm" onClick={toggleMenu} aria-haspopup="true" aria-expanded={menuOpen}>
                  <IconDotsVertical className="h-4 w-4" />
                </Button>
                {menuOpen && (
                  <div className="absolute right-0 mt-2 w-40 bg-white border rounded shadow-md z-10">
                    <button className="block w-full text-left px-4 py-2 hover:bg-gray-100" onClick={handleEdit}>
                      Edit
                    </button>
                    <button
                      className="block w-full text-left px-4 py-2 hover:bg-red-100 text-red-600"
                      disabled={isDeleting}
                      onClick={() => {
                        setOpenDeleteModal(true)
                        setMenuOpen(false)
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
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">{project.name}</h1>
          <p className="text-sm sm:text-base text-gray-600">{project.client?.email || "No client assigned"}</p>
        </div>

     
        <Tabs value={activeTab} onValueChange={setActiveTab} className="mb-6 sm:mb-8">
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
      <h2 className="text-lg font-semibold mb-2">Files</h2>
      {project.files && project.files.length > 0 ? (
        <div className="mt-4 space-y-2">
          {project.files.map((file) => (
            <button
              key={file.id}
              onClick={() => setSelectedFile(file.url)} 
              className="block text-left w-full text-blue-600 hover:underline text-sm"
            >
              {file.original_name}
            </button>
          ))}
        </div>
      ) : (
        <p className="text-sm text-gray-500">No files uploaded.</p>
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
          
              <div>
                <h2 className="text-lg sm:text-xl font-semibold text-gray-900 mb-4">Project Information</h2>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
               
                  <Card>
                    <CardContent className="p-4 sm:p-6">
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-gray-100 rounded-lg flex-shrink-0">
                          <User className="h-4 w-4 sm:h-5 sm:w-5 text-gray-600" />
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="text-xs sm:text-sm text-gray-500">Client</p>
                          <p className="font-medium text-sm sm:text-base text-gray-900 truncate">
                            {project.client?.email || "Not assigned"}
                          </p>
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
                          <p className="text-xs sm:text-sm text-gray-500">Location</p>
                          <p className="font-medium text-sm sm:text-base text-gray-900">{project.location}</p>
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
                          <p className="text-xs sm:text-sm text-gray-500">Project Type</p>
                          <p className="font-medium text-sm sm:text-base text-gray-900 capitalize">
                            {project.project_type.replace(/_/g, " ")}
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
                          <p className="text-xs sm:text-sm text-gray-500">Start Date</p>
                          <p className="font-medium text-sm sm:text-base text-gray-900">
                            {project.create_date
                              ? new Date(project.create_date).toLocaleDateString("en-US")
                              : "Not available"}
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
                          <p className="text-xs sm:text-sm text-gray-500">Budget</p>
                          <p className="font-medium text-sm sm:text-base text-gray-900">
                            {project.budget ? `${project.currency?.toUpperCase()} ${project.budget}` : "Not specified"}
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
                        <div className="flex-1">
                          <p className="text-xs sm:text-sm text-gray-500">Team</p>
                          <p className="font-medium text-sm sm:text-base text-gray-900">
                            {project.additionalUsersEmails?.length
                              ? `${project.additionalUsersEmails.length} members`
                              : "Not assigned"}
                          </p>
                        </div>
                        <Avatar className="h-8 w-8">
                          <AvatarImage src="/placeholder.svg?height=32&width=32" />
                          <AvatarFallback>{project.client?.email?.charAt(0).toUpperCase() || "U"}</AvatarFallback>
                        </Avatar>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </div>
              <div>
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-lg sm:text-xl font-semibold text-gray-900">Project Progress</h2>
                  <span className="text-xl sm:text-2xl font-bold text-gray-900">
                    {getProgressPercentage(project.status)}%
                  </span>
                </div>
                <Progress value={getProgressPercentage(project.status)} className="h-2 sm:h-3" />
              </div>

              <div>
                <h2 className="text-lg sm:text-xl font-semibold text-gray-900 mb-4">Description</h2>
                <Card>
                  <CardContent className="p-6">
                    <p className="text-gray-700 leading-relaxed">{project.description || "No description available"}</p>
                  </CardContent>
                </Card>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
            
                <Card>
                  <CardContent className="p-6">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-gray-100 rounded-lg">
                        <Clock className="h-5 w-5 text-gray-600" />
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">Last Updated</p>
                        <p className="font-medium text-gray-900">
                          {project.update_date
                            ? new Date(project.update_date).toLocaleDateString("en-US")
                            : "Not available"}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

      
  <Card>
  <CardContent className="p-6">
    <h2 className="text-lg font-semibold mb-2">Files</h2>
    {project.files && project.files.length > 0 ? (
      <div className="mt-4 space-y-2">
        {project.files.map((file) => (
          <a
            key={file.id}
            href={file.url}
            target="_blank"
            rel="noopener noreferrer"
            className="block text-blue-600 hover:underline text-sm"
          >
            {file.original_name}
          </a>
        ))}
      </div>
    ) : (
      <p className="text-sm text-gray-500">No files uploaded.</p>
    )}
  </CardContent>
</Card>
              </div>

              {project.additionalUsersEmails && project.additionalUsersEmails.length > 0 && (
                <div>
                  <h2 className="text-lg sm:text-xl font-semibold text-gray-900 mb-4">Team Members</h2>
                  <Card>
                    <CardContent className="p-6">
                      <div className="space-y-2">
                        {project.additionalUsersEmails.map((email, index) => (
                          <div key={index} className="flex items-center gap-3">
                            <Avatar className="h-8 w-8">
                              <AvatarFallback>{email.charAt(0).toUpperCase()}</AvatarFallback>
                            </Avatar>
                            <span className="text-gray-700">{email}</span>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                </div>
              )}
            </div>
          </TabsContent>

        {tabs
  .filter(tab => tab.id !== "plans")  
  .slice(1)
  .map((tab) => (
    <TabsContent key={tab.id} value={tab.id}>
      <Card>
        <CardContent className="p-8 text-center">
          <p className="text-gray-500">Content for {tab.label}</p>
        </CardContent>
      </Card>
    </TabsContent>
))}
        </Tabs>
      </div>

      <AlertDialog open={openDeleteModal} onOpenChange={setOpenDeleteModal}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action is irreversible and will permanently delete the project.
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
    </div>
  )
}
