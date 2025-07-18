import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { projectService } from "@/services/projectService"
import { Building2, MapPin, LinkIcon, Users, Calendar, Eye, User } from "lucide-react"
import type { Project } from "@/services/projectService"
import { useQuery } from "@tanstack/react-query"
import { useNavigate } from "react-router-dom"

export function ProjectsList() {
  const navigate = useNavigate()

  const {
    data: projects = [],
    isLoading,
    isError,
  } = useQuery<Project[], Error>({
    queryKey: ["projects"],
    queryFn: projectService.listProjects,
  })

  if (isLoading) return <p className="px-4 text-muted-foreground">Loading projects...</p>
  if (isError) return <p className="px-4 text-red-600">Failed to load projects.</p>
  if (projects.length === 0) return <p className="px-4 text-muted-foreground">No projects found.</p>

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case "en_desarrollo":
      case "in_progress":
        return "bg-blue-100 text-blue-800"
      case "completado":
      case "completed":
        return "bg-green-100 text-green-800"
      case "pausado":
      case "paused":
        return "bg-yellow-100 text-yellow-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const formatStatus = (status: string) => {
    const statusMap: { [key: string]: string } = {
      en_desarrollo: "In Progress",
      in_progress: "In Progress",
      completado: "Completed",
      completed: "Completed",
      pausado: "Paused",
      paused: "Paused",
    }
    return statusMap[status.toLowerCase()] || status.replace(/_/g, " ")
  }

  const formatProjectType = (type: string) => {
    const typeMap: { [key: string]: string } = {
      residential: "Single-Family Home",
      commercial: "Commercial",
      industrial: "Industrial",
      mixed_use: "Mixed Use",
    }
    return typeMap[type.toLowerCase()] || type.replace(/_/g, " ")
  }

  const calculateProgress = (project: Project) => {
    const hash = project.id.split("").reduce((a, b) => {
      a = (a << 5) - a + b.charCodeAt(0)
      return a & a
    }, 0)
    return Math.abs(hash) % 100
  }

  return (
    <div className="grid grid-cols-1 gap-6 px-4 md:grid-cols-2 xl:grid-cols-3">
      {projects.map((project) => {
        const progress = calculateProgress(project)

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
                  className={`${getStatusColor(project.status)} text-xs font-medium px-2 py-1 rounded-md`}
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

              <div className="flex items-center gap-2">
                <User className="h-4 w-4 text-gray-400" />
                <span>{project.client?.email || "No client"}</span>
              </div>

           

        
              <div>
                <strong>Team:</strong>{" "}
                {project.additionalUsersEmails?.length
                  ? project.additionalUsersEmails.join(", ")
                  : "Not assigned"}
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-gray-700">Progress</span>
                  <span className="text-sm font-bold text-gray-900">{progress}%</span>
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
                >
                  <LinkIcon className="h-4 w-4" />
                </Button>
              </div>
            </CardFooter>
          </Card>
        )
      })}
    </div>
  )
}
