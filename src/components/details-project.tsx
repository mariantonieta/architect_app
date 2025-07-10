import { useParams, useNavigate } from "react-router-dom"
import { useQuery } from "@tanstack/react-query"
import { projectService } from "@/services/projectService"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { ArrowLeft, Share2 } from "lucide-react"

export function ProjectDetails() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()

  const { data: project, isLoading, isError } = useQuery({
    queryKey: ["projects", id],
    queryFn: () => projectService.getProjectById(id!), 
   
  })
  console.log("Project data:", project)


  if (isLoading) return <p className="px-4 text-muted-foreground">Loading project...</p>
  if (isError || !project) return <p className="px-4 text-red-600">Project not found.</p>

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <Button variant="ghost" onClick={() => navigate(-1)}>
          <ArrowLeft className="mr-2 h-4 w-4" /> Back
        </Button>
        <Button variant="outline">
          <Share2 className="mr-2 h-4 w-4" /> Share
        </Button>
      </div>

      <h1 className="text-3xl font-bold">{project.name}</h1>

      <div className="flex items-center gap-4">
        <div className="text-muted-foreground">Client:</div>
          <span>{project.client?.email || "N/A"}</span>
        <Badge className="capitalize">{project.status.replace(/_/g, " ")}</Badge>
      </div>

      <Card className="p-6 space-y-4 shadow-sm border">
        <div>
          <strong>Project type:</strong>{" "}
          <span className="capitalize">{project.project_type.replace(/_/g, " ")}</span>
        </div>
        <div>
          <strong>Location:</strong> {project.location}
        </div>
        <div>
          <strong>Start date:</strong> {project.created_at ? new Date(project.created_at).toLocaleDateString() : "Not available"}
        </div>
        <div>
          <strong>Budget:</strong> {project.budget ? `${project.budget} ${project.currency?.toUpperCase()}` : "Not specified"}
        </div>
        <div>
          <strong>Team:</strong>{" "}
          {project.additionalUsersEmails && project.additionalUsersEmails.length > 0
            ? project.additionalUsersEmails.join(", ")
            : "Not assigned"}
        </div>
        <div>
          <strong>Description:</strong> {project.description || "No description"}
        </div>
      </Card>
    </div>
  )
}
