import * as React from "react"
import {
  Card,
  CardHeader,
  CardTitle,
  CardFooter,
} from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { projectService } from "@/services/projectService"
import { Building2, MapPin, Link as LinkIcon } from "lucide-react"

import type { Project } from "@/services/projectService"
import { useQuery } from "@tanstack/react-query"
import { useNavigate } from "react-router-dom"


export function Projects() {
  const navigate = useNavigate()
const { data: projects = [], isLoading, isError } = useQuery<Project[], Error>({
  queryKey: ["projects"],
  queryFn: projectService.listProjects,
})


  if (isLoading) return <p className="px-4 text-muted-foreground">Loading Projects...</p>
  if (isError) return <p className="px-4 text-red-600">Failed to load projects.</p>
  if (projects.length === 0) return <p className="px-4 text-muted-foreground">No projects found.</p>

  return (
    <div className="grid grid-cols-1 gap-6 px-4 md:grid-cols-2 xl:grid-cols-3">
      {projects.map((project) => (
        <Card key={project.id} className="flex flex-col justify-between shadow-md border border-muted">
          <CardHeader className="pb-2">
            <CardTitle className="text-xl font-extrabold text-primary">{project.name}</CardTitle>

            <div className="flex items-center justify-between text-sm text-muted-foreground mt-2">
              <div className="flex items-center gap-2">
                <MapPin className="h-4 w-4 text-muted-foreground" />
                <span>{project.location}</span>
              </div>

              <div className="flex items-center gap-2">
                <Building2 className="h-4 w-4" />
                <span className="capitalize">{project.project_type.replace(/_/g, " ")}</span>
              </div>
            </div>
          </CardHeader>

          <CardFooter className="flex flex-col gap-3 px-6 pb-6 pt-4">
            <div className="flex items-center gap-2 text-sm">
              <strong>Estado:</strong>
              <Badge variant="default" className="capitalize">
                {project.status.replace(/_/g, " ")}
              </Badge>
            </div>

            <div className="flex items-center gap-2 w-full">
              <Button
                  onClick={() => navigate(`/projects/${project.id}`)}
                className="flex-1 bg-blue-600 hover:bg-blue-700 text-white"
              >
                Ver detalles
              </Button>

              <Button
                variant="ghost"
                size="icon"
                className="text-blue-600 hover:text-blue-800"
              >
                <LinkIcon className="h-4 w-4" />
              </Button>
            </div>
          </CardFooter>
        </Card>
      ))}
    </div>
  )
}
